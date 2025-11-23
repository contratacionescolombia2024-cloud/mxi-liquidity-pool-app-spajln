
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('=== Starting create-nowpayments-order ===');

    // Get Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('User authenticated:', user.id);

    // Parse request body
    const { mxi_amount } = await req.json();
    console.log('MXI amount requested:', mxi_amount);

    if (!mxi_amount || mxi_amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid MXI amount' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get current phase and price from metrics
    const { data: metrics, error: metricsError } = await supabaseClient
      .from('metrics')
      .select('current_phase, current_price_usdt, phase_1_tokens_sold, phase_2_tokens_sold, phase_3_tokens_sold')
      .single();

    if (metricsError || !metrics) {
      console.error('Error fetching metrics:', metricsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch current phase data' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Metrics fetched:', metrics);

    const currentPhase = metrics.current_phase;
    const pricePerMxi = parseFloat(metrics.current_price_usdt.toString());
    const totalUsdt = mxi_amount * pricePerMxi;

    console.log('Price calculation:', { currentPhase, pricePerMxi, totalUsdt });

    // Validate minimum purchase (equivalent to $20 USDT)
    if (totalUsdt < 20) {
      return new Response(
        JSON.stringify({
          error: 'Minimum purchase is $20 USDT',
          minimum_mxi: Math.ceil(20 / pricePerMxi),
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check phase allocation limits
    const phaseAllocations: Record<number, number> = {
      1: 8333333,
      2: 8333333,
      3: 8333334,
    };

    const phaseSold: Record<number, number> = {
      1: parseFloat(metrics.phase_1_tokens_sold?.toString() || '0'),
      2: parseFloat(metrics.phase_2_tokens_sold?.toString() || '0'),
      3: parseFloat(metrics.phase_3_tokens_sold?.toString() || '0'),
    };

    const remainingInPhase = phaseAllocations[currentPhase] - phaseSold[currentPhase];

    if (mxi_amount > remainingInPhase) {
      return new Response(
        JSON.stringify({
          error: `Only ${remainingInPhase.toFixed(2)} MXI remaining in Phase ${currentPhase}`,
          remaining: remainingInPhase,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Generate unique order ID
    const orderId = `MXI-${Date.now()}-${user.id.substring(0, 8)}`;
    console.log('Generated order ID:', orderId);

    // NOWPayments API Key - FIXED: Removed leading colon/space
    const nowpaymentsApiKey = '9SC5SM9-7SR45HD-JKXSWGY-489J5YA'.trim();
    console.log('API Key length:', nowpaymentsApiKey.length);
    console.log('API Key first char code:', nowpaymentsApiKey.charCodeAt(0));

    // Create payment with NOWPayments
    const nowpaymentsPayload = {
      price_amount: totalUsdt,
      price_currency: 'usd',
      pay_currency: 'usdtbep20',
      order_id: orderId,
      order_description: `Purchase ${mxi_amount} MXI tokens`,
      ipn_callback_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/nowpayments-webhook`,
      success_url: 'https://natively.dev/(tabs)/(home)',
      cancel_url: 'https://natively.dev/(tabs)/deposit',
    };

    console.log('NOWPayments request payload:', JSON.stringify(nowpaymentsPayload, null, 2));
    console.log('Using API key:', nowpaymentsApiKey.substring(0, 3) + '...' + nowpaymentsApiKey.substring(nowpaymentsApiKey.length - 3));

    const nowpaymentsResponse = await fetch('https://api.nowpayments.io/v1/payment', {
      method: 'POST',
      headers: {
        'x-api-key': nowpaymentsApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nowpaymentsPayload),
    });

    console.log('NOWPayments response status:', nowpaymentsResponse.status);
    console.log('NOWPayments response headers:', Object.fromEntries(nowpaymentsResponse.headers.entries()));

    const responseText = await nowpaymentsResponse.text();
    console.log('NOWPayments raw response:', responseText);

    if (!nowpaymentsResponse.ok) {
      console.error('NOWPayments API error - Status:', nowpaymentsResponse.status);
      console.error('NOWPayments API error - Body:', responseText);
      
      let errorMessage = 'Failed to create payment with NOWPayments';
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        console.error('Could not parse error response as JSON');
      }

      return new Response(
        JSON.stringify({
          error: errorMessage,
          details: responseText,
          status: nowpaymentsResponse.status,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let paymentData;
    try {
      paymentData = JSON.parse(responseText);
      console.log('NOWPayments response data:', JSON.stringify(paymentData, null, 2));
    } catch (e) {
      console.error('Failed to parse NOWPayments response:', e);
      return new Response(
        JSON.stringify({
          error: 'Invalid response from NOWPayments',
          details: responseText,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Construct payment URL - NOWPayments returns invoice_url or we construct it
    const paymentUrl = paymentData.invoice_url || 
                       (paymentData.payment_id ? `https://nowpayments.io/payment/?iid=${paymentData.payment_id}` : null);

    if (!paymentUrl) {
      console.error('No payment URL available:', paymentData);
      return new Response(
        JSON.stringify({
          error: 'Payment created but no payment URL available',
          payment_data: paymentData,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Payment URL:', paymentUrl);

    // Store order in database
    const { data: order, error: orderError } = await supabaseClient
      .from('nowpayments_orders')
      .insert({
        user_id: user.id,
        order_id: orderId,
        payment_id: paymentData.payment_id,
        payment_url: paymentUrl,
        mxi_amount: mxi_amount,
        usdt_amount: totalUsdt,
        price_per_mxi: pricePerMxi,
        phase: currentPhase,
        status: paymentData.payment_status || 'pending',
        pay_address: paymentData.pay_address,
        pay_amount: paymentData.pay_amount,
        pay_currency: paymentData.pay_currency,
        expires_at: new Date(Date.now() + 3600000).toISOString(),
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error storing order:', orderError);
      return new Response(
        JSON.stringify({
          error: 'Failed to store order',
          details: orderError,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Order stored successfully:', order.id);

    // Return payment details to client
    return new Response(
      JSON.stringify({
        success: true,
        order_id: orderId,
        payment_id: paymentData.payment_id,
        payment_url: paymentUrl,
        mxi_amount: mxi_amount,
        usdt_amount: totalUsdt,
        price_per_mxi: pricePerMxi,
        phase: currentPhase,
        pay_address: paymentData.pay_address,
        pay_amount: paymentData.pay_amount,
        pay_currency: paymentData.pay_currency,
        expires_at: order.expires_at,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in create-nowpayments-order:', error);
    console.error('Error stack:', error.stack);
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        stack: error.stack,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
