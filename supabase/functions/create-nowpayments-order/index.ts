
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

  let transactionId: string | null = null;
  let userId: string | null = null;

  try {
    console.log('=== Starting create-nowpayments-order ===');
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);

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
        JSON.stringify({ error: 'No autorizado. Por favor inicia sesión nuevamente.' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    userId = user.id;
    console.log('User authenticated:', user.id);

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request body:', requestBody);
    } catch (e) {
      console.error('Failed to parse request body:', e);
      return new Response(
        JSON.stringify({ error: 'Solicitud inválida' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { mxi_amount } = requestBody;
    console.log('MXI amount requested:', mxi_amount);

    // Validate amount
    if (!mxi_amount || mxi_amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Debes ingresar un monto válido.' }),
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
        JSON.stringify({ error: 'Error al obtener datos de fase actual' }),
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
          error: 'El monto mínimo de compra es $20 USDT',
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
          error: `Solo quedan ${remainingInPhase.toFixed(2)} MXI en la Fase ${currentPhase}`,
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

    // Create transaction history entry FIRST
    const { data: transaction, error: transactionError } = await supabaseClient
      .from('transaction_history')
      .insert({
        user_id: user.id,
        transaction_type: 'nowpayments_order',
        order_id: orderId,
        mxi_amount: mxi_amount,
        usdt_amount: totalUsdt,
        status: 'pending',
        metadata: {
          phase: currentPhase,
          price_per_mxi: pricePerMxi,
        },
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Error creating transaction history:', transactionError);
      return new Response(
        JSON.stringify({ error: 'Error al crear registro de transacción' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    transactionId = transaction.id;
    console.log('Transaction history created:', transactionId);

    // NOWPayments API credentials
    const nowpaymentsApiKey = '9SC5SM9-7SR45HD-JKXSWGY-489J5YA';
    const nowpaymentsPublicKey = '8f1694be-d30a-47d5-bc90-c3eb24d43a7a';

    // Create invoice payload exactly as specified
    const invoicePayload = {
      price_amount: totalUsdt,
      price_currency: 'usd',
      pay_currency: 'usdt',
      order_description: 'MXI Strategic Presale Payment',
      public_key: nowpaymentsPublicKey,
      success_url: 'https://tusitio.com/success',
      cancel_url: 'https://tusitio.com/cancel',
    };

    console.log('NOWPayments invoice request payload:', JSON.stringify(invoicePayload, null, 2));

    // Call NOWPayments API
    let nowpaymentsResponse;
    try {
      nowpaymentsResponse = await fetch('https://api.nowpayments.io/v1/invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': nowpaymentsApiKey,
        },
        body: JSON.stringify(invoicePayload),
      });
    } catch (fetchError: any) {
      console.error('Fetch error:', fetchError);
      
      // Update transaction as failed
      await supabaseClient
        .from('transaction_history')
        .update({
          status: 'failed',
          error_message: 'Error al conectar con el servicio de pagos',
          error_details: { message: fetchError.message },
          updated_at: new Date().toISOString(),
        })
        .eq('id', transactionId);

      return new Response(
        JSON.stringify({
          error: 'No se pudo generar el pago. Intenta nuevamente.',
          details: fetchError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('NOWPayments response status:', nowpaymentsResponse.status);
    console.log('NOWPayments response headers:', Object.fromEntries(nowpaymentsResponse.headers.entries()));

    const responseText = await nowpaymentsResponse.text();
    console.log('NOWPayments raw response:', responseText);

    if (!nowpaymentsResponse.ok) {
      console.error('NOWPayments API error - Status:', nowpaymentsResponse.status);
      console.error('NOWPayments API error - Body:', responseText);
      
      let errorMessage = 'No se pudo generar el pago. Intenta nuevamente.';
      let errorDetails: any = { raw: responseText, status: nowpaymentsResponse.status };
      
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorData.error || errorMessage;
        errorDetails = errorData;
      } catch (e) {
        console.error('Could not parse error response as JSON');
      }

      // Update transaction as failed
      await supabaseClient
        .from('transaction_history')
        .update({
          status: 'failed',
          error_message: errorMessage,
          error_details: errorDetails,
          updated_at: new Date().toISOString(),
        })
        .eq('id', transactionId);

      return new Response(
        JSON.stringify({
          error: errorMessage,
          details: errorDetails,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse successful response
    let invoiceData;
    try {
      invoiceData = JSON.parse(responseText);
      console.log('NOWPayments invoice response data:', JSON.stringify(invoiceData, null, 2));
    } catch (e) {
      console.error('Failed to parse NOWPayments response:', e);
      
      // Update transaction as failed
      await supabaseClient
        .from('transaction_history')
        .update({
          status: 'failed',
          error_message: 'Respuesta inválida del servicio de pagos',
          error_details: { raw: responseText },
          updated_at: new Date().toISOString(),
        })
        .eq('id', transactionId);

      return new Response(
        JSON.stringify({
          error: 'No se pudo generar el pago. Intenta nuevamente.',
          details: 'Invalid response format',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Extract invoice URL from response
    const invoiceUrl = invoiceData.invoice_url;
    
    if (!invoiceUrl) {
      console.error('No invoice URL in response:', invoiceData);
      
      // Update transaction as failed
      await supabaseClient
        .from('transaction_history')
        .update({
          status: 'failed',
          error_message: 'No se pudo obtener la URL de pago',
          error_details: invoiceData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', transactionId);

      return new Response(
        JSON.stringify({
          error: 'No se pudo generar el pago. Intenta nuevamente.',
          invoice_data: invoiceData,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Invoice URL received:', invoiceUrl);

    // Update transaction history with invoice details
    await supabaseClient
      .from('transaction_history')
      .update({
        payment_id: invoiceData.id || null,
        payment_url: invoiceUrl,
        status: 'waiting',
        metadata: {
          phase: currentPhase,
          price_per_mxi: pricePerMxi,
          invoice_id: invoiceData.id,
          order_id: invoiceData.order_id,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', transactionId);

    // Store order in nowpayments_orders table
    const { data: order, error: orderError } = await supabaseClient
      .from('nowpayments_orders')
      .insert({
        user_id: user.id,
        order_id: orderId,
        payment_id: invoiceData.id || null,
        payment_url: invoiceUrl,
        mxi_amount: mxi_amount,
        usdt_amount: totalUsdt,
        price_per_mxi: pricePerMxi,
        phase: currentPhase,
        status: 'waiting',
        pay_address: null,
        pay_amount: totalUsdt,
        pay_currency: 'usdt',
        expires_at: new Date(Date.now() + 3600000).toISOString(),
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error storing order:', orderError);
      // Don't fail the request if we can't store the order
      // The invoice was created successfully and transaction history is updated
      console.warn('Invoice created in NOWPayments but failed to store in nowpayments_orders table');
    } else {
      console.log('Order stored successfully:', order.id);
    }

    // Return invoice details to client
    return new Response(
      JSON.stringify({
        success: true,
        order_id: orderId,
        invoice_id: invoiceData.id,
        invoice_url: invoiceUrl,
        mxi_amount: mxi_amount,
        usdt_amount: totalUsdt,
        price_per_mxi: pricePerMxi,
        phase: currentPhase,
        expires_at: order?.expires_at || new Date(Date.now() + 3600000).toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in create-nowpayments-order:', error);
    console.error('Error stack:', error.stack);
    
    // Update transaction as failed if we have the ID
    if (transactionId && userId) {
      try {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );
        
        await supabaseClient
          .from('transaction_history')
          .update({
            status: 'failed',
            error_message: 'Error interno del servidor',
            error_details: {
              type: error.constructor.name,
              message: error.message,
              stack: error.stack,
            },
            updated_at: new Date().toISOString(),
          })
          .eq('id', transactionId);
      } catch (updateError) {
        console.error('Failed to update transaction history:', updateError);
      }
    }

    return new Response(
      JSON.stringify({
        error: 'No se pudo generar el pago. Intenta nuevamente.',
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
