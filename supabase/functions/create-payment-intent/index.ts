
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  order_id: string;
  price_amount: number;
  price_currency: string;
  pay_currency?: string;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID().substring(0, 8);
  console.log(`\n========== [${requestId}] NEW REQUEST ==========`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log(`Method: ${req.method}`);

  try {
    // 1. CHECK ENVIRONMENT VARIABLES
    const nowpaymentsApiKey = Deno.env.get('NOWPAYMENTS_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    console.log(`[${requestId}] Env check:`, {
      hasApiKey: !!nowpaymentsApiKey,
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseAnonKey: !!supabaseAnonKey,
    });

    if (!nowpaymentsApiKey || !supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing environment variables');
    }

    // 2. AUTHENTICATE USER
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      console.error(`[${requestId}] Auth failed:`, authError?.message);
      throw new Error('Authentication failed');
    }

    console.log(`[${requestId}] User authenticated: ${user.id}`);

    // 3. PARSE REQUEST BODY
    let body: RequestBody;
    try {
      body = await req.json();
      console.log(`[${requestId}] Request body:`, JSON.stringify(body, null, 2));
    } catch (e) {
      console.error(`[${requestId}] JSON parse error:`, e);
      throw new Error('Invalid JSON in request body');
    }

    // 4. VALIDATE REQUEST
    if (!body.order_id || !body.price_amount || !body.price_currency) {
      throw new Error('Missing required fields: order_id, price_amount, price_currency');
    }

    const amount = Number(body.price_amount);
    if (isNaN(amount) || amount < 3 || amount > 500000) {
      throw new Error(`Invalid amount: ${body.price_amount}`);
    }

    console.log(`[${requestId}] Validated:`, {
      order_id: body.order_id,
      amount,
      currency: body.price_currency,
      pay_currency: body.pay_currency || 'NOT PROVIDED',
    });

    // 5. DETERMINE ACTION
    if (!body.pay_currency) {
      // RETURN AVAILABLE CURRENCIES
      console.log(`[${requestId}] Returning available currencies`);
      
      const currencies = [
        'usdttrc20',
        'usdterc20',
        'usdtbep20',
        'btc',
        'eth',
        'bnb',
        'trx',
      ];

      return new Response(
        JSON.stringify({
          success: true,
          intent: {
            id: body.order_id,
            order_id: body.order_id,
            price_amount: amount,
            price_currency: body.price_currency.toLowerCase(),
            pay_currencies: currencies,
            user_id: user.id,
            created_at: new Date().toISOString(),
          },
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 6. CREATE INVOICE
    console.log(`[${requestId}] Creating invoice with ${body.pay_currency}`);

    // Get phase info
    const { data: metrics, error: metricsError } = await supabaseClient
      .from('metrics')
      .select('current_phase, current_price_usdt')
      .single();

    if (metricsError || !metrics) {
      console.error(`[${requestId}] Metrics error:`, metricsError);
      throw new Error('Failed to fetch phase information');
    }

    const pricePerMxi = Number(metrics.current_price_usdt);
    const mxiAmount = amount / pricePerMxi;

    console.log(`[${requestId}] Phase info:`, {
      phase: metrics.current_phase,
      pricePerMxi,
      mxiAmount,
    });

    // Create transaction record
    const { data: transaction, error: txError } = await supabaseClient
      .from('transaction_history')
      .insert({
        user_id: user.id,
        transaction_type: 'nowpayments_order',
        order_id: body.order_id,
        mxi_amount: mxiAmount,
        usdt_amount: amount,
        status: 'pending',
        metadata: {
          phase: metrics.current_phase,
          price_per_mxi: pricePerMxi,
          pay_currency: body.pay_currency,
        },
      })
      .select()
      .single();

    if (txError || !transaction) {
      console.error(`[${requestId}] Transaction error:`, txError);
      throw new Error('Failed to create transaction record');
    }

    console.log(`[${requestId}] Transaction created: ${transaction.id}`);

    // Call NOWPayments API
    const webhookUrl = `${supabaseUrl}/functions/v1/nowpayments-webhook`;
    const invoicePayload = {
      price_amount: amount,
      price_currency: 'usd',
      pay_currency: body.pay_currency.toLowerCase(),
      ipn_callback_url: webhookUrl,
      order_id: body.order_id,
      order_description: `MXI Purchase - ${mxiAmount.toFixed(2)} MXI`,
    };

    console.log(`[${requestId}] Calling NOWPayments API...`);
    console.log(`[${requestId}] Payload:`, JSON.stringify(invoicePayload, null, 2));

    const nowpaymentsResponse = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': nowpaymentsApiKey,
      },
      body: JSON.stringify(invoicePayload),
    });

    console.log(`[${requestId}] NOWPayments status: ${nowpaymentsResponse.status}`);

    const responseText = await nowpaymentsResponse.text();
    console.log(`[${requestId}] NOWPayments response:`, responseText);

    if (!nowpaymentsResponse.ok) {
      // Update transaction as failed
      await supabaseClient
        .from('transaction_history')
        .update({
          status: 'failed',
          error_message: `NOWPayments error: ${nowpaymentsResponse.status}`,
        })
        .eq('id', transaction.id);

      throw new Error(`NOWPayments API error: ${nowpaymentsResponse.status} - ${responseText}`);
    }

    let invoiceData;
    try {
      invoiceData = JSON.parse(responseText);
    } catch (e) {
      console.error(`[${requestId}] Failed to parse NOWPayments response:`, e);
      throw new Error('Invalid response from NOWPayments');
    }

    if (!invoiceData.invoice_url) {
      console.error(`[${requestId}] No invoice_url in response`);
      throw new Error('No invoice URL in NOWPayments response');
    }

    console.log(`[${requestId}] Invoice URL: ${invoiceData.invoice_url}`);

    // Update transaction
    await supabaseClient
      .from('transaction_history')
      .update({
        payment_id: invoiceData.id || null,
        payment_url: invoiceData.invoice_url,
        status: 'waiting',
      })
      .eq('id', transaction.id);

    // Store in nowpayments_orders
    await supabaseClient
      .from('nowpayments_orders')
      .insert({
        user_id: user.id,
        order_id: body.order_id,
        payment_id: invoiceData.id || null,
        payment_url: invoiceData.invoice_url,
        mxi_amount: mxiAmount,
        usdt_amount: amount,
        price_per_mxi: pricePerMxi,
        phase: metrics.current_phase,
        status: 'waiting',
        pay_currency: body.pay_currency,
        pay_amount: amount,
        expires_at: new Date(Date.now() + 3600000).toISOString(),
      });

    console.log(`[${requestId}] SUCCESS - Invoice created`);

    return new Response(
      JSON.stringify({
        success: true,
        intent: {
          id: invoiceData.id,
          order_id: body.order_id,
          invoice_url: invoiceData.invoice_url,
          mxi_amount: mxiAmount,
          usdt_amount: amount,
          price_per_mxi: pricePerMxi,
          phase: metrics.current_phase,
          pay_currency: body.pay_currency,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error(`[${requestId}] ERROR:`, error.message);
    console.error(`[${requestId}] Stack:`, error.stack);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
        requestId,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
