
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
  console.log(`[${requestId}] URL:`, req.url);

  try {
    // STEP 1: Verify API Key exists
    const nowpaymentsApiKey = Deno.env.get('NOWPAYMENTS_API_KEY');
    console.log(`[${requestId}] API Key check:`, nowpaymentsApiKey ? 'EXISTS' : 'MISSING');
    
    if (!nowpaymentsApiKey) {
      console.error(`[${requestId}] CRITICAL: NOWPAYMENTS_API_KEY not found`);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Configuración del servidor incompleta - API Key no encontrada',
          debug: 'NOWPAYMENTS_API_KEY environment variable is not set',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    console.log(`[${requestId}] ✓ API Key found (length: ${nowpaymentsApiKey.length})`);

    // STEP 2: Authenticate user
    const authHeader = req.headers.get('Authorization');
    console.log(`[${requestId}] Auth header:`, authHeader ? 'EXISTS' : 'MISSING');
    
    if (!authHeader) {
      console.error(`[${requestId}] No Authorization header`);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No autorizado - falta token de autenticación',
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    console.log(`[${requestId}] Supabase URL:`, supabaseUrl ? 'EXISTS' : 'MISSING');
    console.log(`[${requestId}] Supabase Anon Key:`, supabaseAnonKey ? 'EXISTS' : 'MISSING');

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error(`[${requestId}] Missing Supabase credentials`);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Configuración del servidor incompleta - credenciales de Supabase',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      console.error(`[${requestId}] Auth error:`, authError?.message || 'No user');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Sesión expirada o inválida',
          debug: authError?.message,
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
    const contentType = req.headers.get('Content-Type') || '';
    console.log(`[${requestId}] Content-Type:`, contentType);

    try {
      const bodyText = await req.text();
      console.log(`[${requestId}] Raw body:`, bodyText);
      
      if (!bodyText || bodyText.trim() === '') {
        throw new Error('Empty request body');
      }
      
      requestBody = JSON.parse(bodyText);
      console.log(`[${requestId}] Parsed request:`, JSON.stringify(requestBody));
    } catch (e) {
      console.error(`[${requestId}] Failed to parse body:`, e.message);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Solicitud inválida - no se pudo leer el cuerpo de la petición',
          debug: e.message,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { order_id, price_amount, price_currency, pay_currency } = requestBody;

    console.log(`[${requestId}] Parameters:`, {
      order_id,
      price_amount,
      price_currency,
      pay_currency: pay_currency || 'NOT PROVIDED',
    });

    // Validate required parameters
    if (!order_id || !price_amount || !price_currency) {
      console.error(`[${requestId}] Missing required parameters`);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Faltan parámetros requeridos (order_id, price_amount, price_currency)',
          received: { order_id, price_amount, price_currency },
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
          received: price_amount,
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
    console.log(`[${requestId}] Fetching metrics from database...`);
    const { data: metrics, error: metricsError } = await supabaseClient
      .from('metrics')
      .select('current_phase, current_price_usdt')
      .single();

    if (metricsError) {
      console.error(`[${requestId}] Error fetching metrics:`, metricsError.message);
      console.error(`[${requestId}] Metrics error details:`, JSON.stringify(metricsError));
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Error al obtener datos de fase',
          debug: metricsError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!metrics) {
      console.error(`[${requestId}] No metrics found in database`);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No se encontraron datos de fase en la base de datos',
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
    console.log(`[${requestId}] Creating transaction history entry...`);
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
      console.error(`[${requestId}] Error creating transaction:`, transactionError.message);
      console.error(`[${requestId}] Transaction error details:`, JSON.stringify(transactionError));
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Error al crear registro de transacción',
          debug: transactionError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`[${requestId}] ✓ Transaction created:`, transaction.id);

    // Prepare invoice payload
    const webhookUrl = `${supabaseUrl}/functions/v1/nowpayments-webhook`;
    const invoicePayload = {
      price_amount: amount,
      price_currency: 'usd',
      pay_currency: pay_currency.toLowerCase(),
      ipn_callback_url: webhookUrl,
      order_id: order_id,
      order_description: `Compra de ${mxiAmount.toFixed(2)} MXI - Fase ${currentPhase}`,
    };

    console.log(`[${requestId}] Invoice payload:`, JSON.stringify(invoicePayload));
    console.log(`[${requestId}] Webhook URL:`, webhookUrl);

    // Call NOWPayments API
    let invoiceResponse;
    try {
      console.log(`[${requestId}] Calling NOWPayments API: POST /v1/invoice`);
      console.log(`[${requestId}] Using API Key: ${nowpaymentsApiKey.substring(0, 10)}...`);
      
      invoiceResponse = await fetch('https://api.nowpayments.io/v1/invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': nowpaymentsApiKey,
        },
        body: JSON.stringify(invoicePayload),
      });

      console.log(`[${requestId}] NOWPayments response status:`, invoiceResponse.status);
      console.log(`[${requestId}] NOWPayments response headers:`, JSON.stringify(Object.fromEntries(invoiceResponse.headers.entries())));
    } catch (fetchError) {
      console.error(`[${requestId}] Network error calling NOWPayments:`, fetchError.message);
      console.error(`[${requestId}] Fetch error stack:`, fetchError.stack);

      // Update transaction as failed
      await supabaseClient
        .from('transaction_history')
        .update({
          status: 'failed',
          error_message: `Error de conexión: ${fetchError.message}`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', transaction.id);

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Error de conexión con el servicio de pagos',
          debug: fetchError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const invoiceResponseText = await invoiceResponse.text();
    console.log(`[${requestId}] NOWPayments response body:`, invoiceResponseText);

    if (!invoiceResponse.ok) {
      console.error(`[${requestId}] NOWPayments API error:`, invoiceResponse.status);

      let errorMessage = 'No se pudo generar el pago';
      let errorDetails = invoiceResponseText;
      
      try {
        const errorData = JSON.parse(invoiceResponseText);
        errorMessage = errorData.message || errorData.error || errorMessage;
        errorDetails = JSON.stringify(errorData);
      } catch (e) {
        console.log(`[${requestId}] Could not parse error response as JSON`);
      }

      // Update transaction as failed
      await supabaseClient
        .from('transaction_history')
        .update({
          status: 'failed',
          error_message: `${errorMessage} (${invoiceResponse.status})`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', transaction.id);

      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
          debug: errorDetails,
          status: invoiceResponse.status,
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
      console.log(`[${requestId}] ✓ Invoice data parsed successfully`);
    } catch (e) {
      console.error(`[${requestId}] Failed to parse invoice response:`, e.message);

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
          debug: e.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`[${requestId}] Invoice data keys:`, Object.keys(invoiceData).join(', '));

    // Extract invoice URL
    const invoiceUrl = invoiceData.invoice_url;
    if (!invoiceUrl) {
      console.error(`[${requestId}] No invoice URL in response`);
      console.error(`[${requestId}] Available fields:`, Object.keys(invoiceData).join(', '));

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
          debug: `Available fields: ${Object.keys(invoiceData).join(', ')}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`[${requestId}] ✓ Invoice URL:`, invoiceUrl);

    // Update transaction history
    console.log(`[${requestId}] Updating transaction history...`);
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
    console.log(`[${requestId}] Storing order in nowpayments_orders...`);
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
      console.error(`[${requestId}] Error storing order:`, orderError.message);
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
    console.error(`[${requestId}] Error name:`, error.name);
    console.error(`[${requestId}] Error message:`, error.message);
    console.error(`[${requestId}] Error stack:`, error.stack);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error interno del servidor',
        debug: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
