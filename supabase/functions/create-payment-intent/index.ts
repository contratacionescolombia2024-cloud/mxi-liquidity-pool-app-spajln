
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

  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] === CREATE PAYMENT INTENT - START ===`);
  console.log(`[${requestId}] Timestamp:`, new Date().toISOString());
  console.log(`[${requestId}] Method:`, req.method);

  try {
    // STEP 1: Verify API Key exists
    const nowpaymentsApiKey = Deno.env.get('NOWPAYMENTS_API_KEY');
    if (!nowpaymentsApiKey) {
      console.error(`[${requestId}] CRITICAL: NOWPAYMENTS_API_KEY not found`);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Configuración del servidor incompleta',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    console.log(`[${requestId}] ✓ API Key found`);

    // STEP 2: Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error(`[${requestId}] No Authorization header`);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No autorizado',
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      console.error(`[${requestId}] Auth error:`, authError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Sesión expirada',
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    console.log(`[${requestId}] ✓ User authenticated:`, user.id);

    // STEP 3: Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log(`[${requestId}] Request:`, JSON.stringify(requestBody));
    } catch (e) {
      console.error(`[${requestId}] Failed to parse body:`, e);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Solicitud inválida',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { order_id, price_amount, price_currency, pay_currency } = requestBody;

    // Validate required parameters
    if (!order_id || !price_amount || !price_currency) {
      console.error(`[${requestId}] Missing required parameters`);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Faltan parámetros requeridos',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const amount = parseFloat(price_amount);
    if (isNaN(amount) || amount < 3 || amount > 500000) {
      console.error(`[${requestId}] Invalid amount:`, price_amount);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Monto inválido (debe estar entre 3 y 500,000 USDT)',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`[${requestId}] ✓ Request validated`);

    // STEP 4: Determine action
    if (!pay_currency) {
      // ACTION A: Return available currencies
      console.log(`[${requestId}] === ACTION A: Returning available currencies ===`);

      const availableCurrencies = [
        'usdttrc20',
        'usdterc20',
        'usdtbep20',
        'btc',
        'eth',
        'bnb',
        'trx',
      ];

      console.log(`[${requestId}] ✓ Returning ${availableCurrencies.length} currencies`);

      return new Response(
        JSON.stringify({
          success: true,
          intent: {
            id: order_id,
            order_id: order_id,
            price_amount: amount,
            price_currency: price_currency.toLowerCase(),
            pay_currencies: availableCurrencies,
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

    // ACTION B: Create invoice with selected currency
    console.log(`[${requestId}] === ACTION B: Creating invoice with ${pay_currency} ===`);

    // Get phase data
    const { data: metrics, error: metricsError } = await supabaseClient
      .from('metrics')
      .select('current_phase, current_price_usdt')
      .single();

    if (metricsError || !metrics) {
      console.error(`[${requestId}] Error fetching metrics:`, metricsError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Error al obtener datos de fase',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const currentPhase = metrics.current_phase;
    const pricePerMxi = parseFloat(metrics.current_price_usdt.toString());
    const mxiAmount = amount / pricePerMxi;

    console.log(`[${requestId}] Phase data:`, {
      currentPhase,
      pricePerMxi,
      amount,
      mxiAmount,
    });

    // Create transaction history entry
    const { data: transaction, error: transactionError } = await supabaseClient
      .from('transaction_history')
      .insert({
        user_id: user.id,
        transaction_type: 'nowpayments_order',
        order_id: order_id,
        mxi_amount: mxiAmount,
        usdt_amount: amount,
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
      console.error(`[${requestId}] Error creating transaction:`, transactionError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Error al crear registro de transacción',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`[${requestId}] ✓ Transaction created:`, transaction.id);

    // Prepare invoice payload
    const webhookUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/nowpayments-webhook`;
    const invoicePayload = {
      price_amount: amount,
      price_currency: 'usd',
      pay_currency: pay_currency.toLowerCase(),
      ipn_callback_url: webhookUrl,
      order_id: order_id,
      order_description: `Compra de ${mxiAmount.toFixed(2)} MXI - Fase ${currentPhase}`,
    };

    console.log(`[${requestId}] Invoice payload:`, JSON.stringify(invoicePayload));

    // Call NOWPayments API
    let invoiceResponse;
    try {
      console.log(`[${requestId}] Calling NOWPayments API: POST /v1/invoice`);
      invoiceResponse = await fetch('https://api.nowpayments.io/v1/invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': nowpaymentsApiKey,
        },
        body: JSON.stringify(invoicePayload),
      });

      console.log(`[${requestId}] NOWPayments response status:`, invoiceResponse.status);
    } catch (fetchError) {
      console.error(`[${requestId}] Network error:`, fetchError);

      // Update transaction as failed
      await supabaseClient
        .from('transaction_history')
        .update({
          status: 'failed',
          error_message: 'Error de conexión',
          updated_at: new Date().toISOString(),
        })
        .eq('id', transaction.id);

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Error de conexión con el servicio de pagos',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const invoiceResponseText = await invoiceResponse.text();
    console.log(`[${requestId}] NOWPayments response:`, invoiceResponseText);

    if (!invoiceResponse.ok) {
      console.error(`[${requestId}] NOWPayments API error:`, invoiceResponse.status);

      let errorMessage = 'No se pudo generar el pago';
      try {
        const errorData = JSON.parse(invoiceResponseText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        console.log(`[${requestId}] Could not parse error response`);
      }

      // Update transaction as failed
      await supabaseClient
        .from('transaction_history')
        .update({
          status: 'failed',
          error_message: errorMessage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', transaction.id);

      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
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
      invoiceData = JSON.parse(invoiceResponseText);
    } catch (e) {
      console.error(`[${requestId}] Failed to parse invoice response:`, e);

      await supabaseClient
        .from('transaction_history')
        .update({
          status: 'failed',
          error_message: 'Respuesta inválida del servicio de pagos',
          updated_at: new Date().toISOString(),
        })
        .eq('id', transaction.id);

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Respuesta inválida del servicio de pagos',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`[${requestId}] ✓ Invoice data:`, JSON.stringify(invoiceData));

    // Extract invoice URL
    const invoiceUrl = invoiceData.invoice_url;
    if (!invoiceUrl) {
      console.error(`[${requestId}] No invoice URL in response`);

      await supabaseClient
        .from('transaction_history')
        .update({
          status: 'failed',
          error_message: 'No se pudo obtener la URL de pago',
          updated_at: new Date().toISOString(),
        })
        .eq('id', transaction.id);

      return new Response(
        JSON.stringify({
          success: false,
          error: 'No se pudo obtener la URL de pago',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`[${requestId}] ✓ Invoice URL:`, invoiceUrl);

    // Update transaction history
    await supabaseClient
      .from('transaction_history')
      .update({
        payment_id: invoiceData.id || null,
        payment_url: invoiceUrl,
        status: 'waiting',
        updated_at: new Date().toISOString(),
      })
      .eq('id', transaction.id);

    // Store order in nowpayments_orders table
    const { data: order, error: orderError } = await supabaseClient
      .from('nowpayments_orders')
      .insert({
        user_id: user.id,
        order_id: order_id,
        payment_id: invoiceData.id || null,
        payment_url: invoiceUrl,
        mxi_amount: mxiAmount,
        usdt_amount: amount,
        price_per_mxi: pricePerMxi,
        phase: currentPhase,
        status: 'waiting',
        pay_address: null,
        pay_amount: amount,
        pay_currency: pay_currency,
        expires_at: new Date(Date.now() + 3600000).toISOString(),
      })
      .select()
      .single();

    if (orderError) {
      console.error(`[${requestId}] Error storing order:`, orderError);
      console.warn(`[${requestId}] Invoice created but failed to store in DB`);
    } else {
      console.log(`[${requestId}] ✓ Order stored:`, order.id);
    }

    console.log(`[${requestId}] === SUCCESS ===`);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        intent: {
          id: invoiceData.id,
          order_id: order_id,
          invoice_url: invoiceUrl,
          nowpayment_invoice_url: invoiceUrl,
          mxi_amount: mxiAmount,
          usdt_amount: amount,
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
  } catch (error) {
    console.error(`[${requestId}] === UNEXPECTED ERROR ===`);
    console.error(`[${requestId}] Error:`, error.message);
    console.error(`[${requestId}] Stack:`, error.stack);

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
