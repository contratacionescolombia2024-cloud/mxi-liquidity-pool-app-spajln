
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
    console.log('=== Create Payment Intent (Step 2 - Generate Invoice) ===');
    console.log('Request method:', req.method);

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
        JSON.stringify({ 
          success: false,
          error: 'No autorizado. Por favor inicia sesión nuevamente.' 
        }),
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
        JSON.stringify({ 
          success: false,
          error: 'Solicitud inválida' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { order_id, price_amount, price_currency, pay_currency } = requestBody;

    if (!order_id || !price_amount || !price_currency || !pay_currency) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Faltan parámetros requeridos' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Creating invoice:', { order_id, price_amount, price_currency, pay_currency });

    // Calculate MXI amount from order_id (extract from purchase-mxi screen params)
    // We need to get this from the URL params that were passed
    const url = new URL(req.url);
    const mxiAmountParam = url.searchParams.get('mxi_amount');
    
    // If not in URL, try to calculate from price_amount and current phase
    let mxiAmount = 0;
    let currentPhase = 1;
    let pricePerMxi = 0.40;

    if (mxiAmountParam) {
      mxiAmount = parseFloat(mxiAmountParam);
    } else {
      // Get current phase and price from metrics
      const { data: metrics, error: metricsError } = await supabaseClient
        .from('metrics')
        .select('current_phase, current_price_usdt')
        .single();

      if (metrics) {
        currentPhase = metrics.current_phase;
        pricePerMxi = parseFloat(metrics.current_price_usdt.toString());
        mxiAmount = price_amount / pricePerMxi;
      } else {
        console.error('Error fetching metrics:', metricsError);
        // Use default calculation
        mxiAmount = price_amount / 0.40;
      }
    }

    console.log('Calculated MXI amount:', mxiAmount);

    // Get current phase and price from metrics
    const { data: metrics, error: metricsError } = await supabaseClient
      .from('metrics')
      .select('current_phase, current_price_usdt, phase_1_tokens_sold, phase_2_tokens_sold, phase_3_tokens_sold')
      .single();

    if (metricsError || !metrics) {
      console.error('Error fetching metrics:', metricsError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Error al obtener datos de fase actual' 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    currentPhase = metrics.current_phase;
    pricePerMxi = parseFloat(metrics.current_price_usdt.toString());
    const totalUsdt = price_amount;

    console.log('Phase data:', { currentPhase, pricePerMxi, totalUsdt, mxiAmount });

    // Create transaction history entry
    const { data: transaction, error: transactionError } = await supabaseClient
      .from('transaction_history')
      .insert({
        user_id: user.id,
        transaction_type: 'nowpayments_order',
        order_id: order_id,
        mxi_amount: mxiAmount,
        usdt_amount: totalUsdt,
        status: 'pending',
        metadata: {
          phase: currentPhase,
          price_per_mxi: pricePerMxi,
          pay_currency: pay_currency,
        },
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Error creating transaction history:', transactionError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Error al crear registro de transacción' 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    transactionId = transaction.id;
    console.log('Transaction history created:', transactionId);

    // Get NowPayments API key
    const nowpaymentsApiKey = Deno.env.get('NOWPAYMENTS_API_KEY');
    
    if (!nowpaymentsApiKey) {
      console.error('NOWPAYMENTS_API_KEY not configured');
      
      // Update transaction as failed
      await supabaseClient
        .from('transaction_history')
        .update({
          status: 'failed',
          error_message: 'Error de configuración del servidor',
          error_details: { message: 'API key not configured' },
          updated_at: new Date().toISOString(),
        })
        .eq('id', transactionId);

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Error de configuración del servidor',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Webhook URL
    const webhookUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/nowpayments-webhook`;

    // Create invoice payload with selected currency
    const invoicePayload = {
      price_amount: totalUsdt,
      price_currency: price_currency.toLowerCase(),
      pay_currency: pay_currency.toLowerCase(),
      ipn_callback_url: webhookUrl,
      order_id: order_id,
      order_description: `Compra de ${mxiAmount.toFixed(2)} MXI - Fase ${currentPhase}`,
      success_url: 'https://natively.dev',
      cancel_url: 'https://natively.dev',
    };

    console.log('NOWPayments invoice request:', JSON.stringify(invoicePayload, null, 2));

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
          success: false,
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
          success: false,
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
      console.log('NOWPayments invoice response:', JSON.stringify(invoiceData, null, 2));
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
          success: false,
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
          success: false,
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
          order_id: invoiceData.order_id || order_id,
          pay_currency: pay_currency,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', transactionId);

    // Store order in nowpayments_orders table
    const { data: order, error: orderError } = await supabaseClient
      .from('nowpayments_orders')
      .insert({
        user_id: user.id,
        order_id: order_id,
        payment_id: invoiceData.id || null,
        payment_url: invoiceUrl,
        mxi_amount: mxiAmount,
        usdt_amount: totalUsdt,
        price_per_mxi: pricePerMxi,
        phase: currentPhase,
        status: 'waiting',
        pay_address: null,
        pay_amount: totalUsdt,
        pay_currency: pay_currency,
        expires_at: new Date(Date.now() + 3600000).toISOString(),
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error storing order:', orderError);
      console.warn('Invoice created but failed to store in nowpayments_orders table');
    } else {
      console.log('Order stored successfully:', order.id);
    }

    // Return invoice details
    return new Response(
      JSON.stringify({
        success: true,
        intent: {
          id: invoiceData.id,
          order_id: order_id,
          nowpayment_invoice_url: invoiceUrl,
          invoice_url: invoiceUrl,
          mxi_amount: mxiAmount,
          usdt_amount: totalUsdt,
          price_per_mxi: pricePerMxi,
          phase: currentPhase,
          pay_currency: pay_currency,
          expires_at: order?.expires_at || new Date(Date.now() + 3600000).toISOString(),
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in create-payment-intent:', error);
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
        success: false,
        error: 'Error interno del servidor',
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
