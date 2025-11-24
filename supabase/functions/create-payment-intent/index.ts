
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

  console.log('=== CREATE PAYMENT INTENT - DRASTIC FIX VERSION ===');
  console.log('Timestamp:', new Date().toISOString());

  try {
    // STEP 1: Verify API Key exists
    const nowpaymentsApiKey = Deno.env.get('NOWPAYMENTS_API_KEY');
    
    if (!nowpaymentsApiKey) {
      console.error('CRITICAL: NOWPAYMENTS_API_KEY not found in environment');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Configuración del servidor incompleta. Contacta al administrador.',
          technical_details: 'NOWPAYMENTS_API_KEY not configured'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('✓ API Key found, length:', nowpaymentsApiKey.length);

    // STEP 2: Get Supabase client and authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No Authorization header');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'No autorizado. Por favor inicia sesión.' 
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
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Sesión expirada. Por favor inicia sesión nuevamente.' 
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('✓ User authenticated:', user.id);

    // STEP 3: Parse and validate request body
    let requestBody;
    try {
      const bodyText = await req.text();
      console.log('Raw request body:', bodyText);
      requestBody = JSON.parse(bodyText);
    } catch (e) {
      console.error('Failed to parse request body:', e);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Solicitud inválida - formato JSON incorrecto' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Parsed request:', JSON.stringify(requestBody, null, 2));

    const { order_id, price_amount, price_currency, pay_currency } = requestBody;

    // Validate required parameters
    if (!order_id) {
      console.error('Missing order_id');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Falta parámetro requerido: order_id' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!price_amount || isNaN(parseFloat(price_amount))) {
      console.error('Invalid price_amount:', price_amount);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Monto inválido' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!price_currency) {
      console.error('Missing price_currency');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Falta parámetro requerido: price_currency' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('✓ Request validated:', { order_id, price_amount, price_currency, pay_currency });

    // STEP 4: Determine action based on pay_currency presence
    if (!pay_currency) {
      // ACTION A: Fetch available currencies
      console.log('=== ACTION A: Fetching available currencies ===');

      let currenciesResponse;
      try {
        console.log('Calling NOWPayments API: GET /v1/currencies');
        currenciesResponse = await fetch('https://api.nowpayments.io/v1/currencies', {
          method: 'GET',
          headers: {
            'x-api-key': nowpaymentsApiKey,
            'Content-Type': 'application/json',
          },
        });
        console.log('NOWPayments response status:', currenciesResponse.status);
      } catch (fetchError: any) {
        console.error('Network error calling NOWPayments:', fetchError);
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Error de conexión con el servicio de pagos. Verifica tu conexión a internet.',
            technical_details: fetchError.message,
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const responseText = await currenciesResponse.text();
      console.log('NOWPayments response body (first 1000 chars):', responseText.substring(0, 1000));

      if (!currenciesResponse.ok) {
        console.error('NOWPayments API error:', currenciesResponse.status, responseText);
        
        let errorMessage = 'Error al obtener criptomonedas disponibles';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // Response is not JSON
        }

        return new Response(
          JSON.stringify({
            success: false,
            error: errorMessage,
            technical_details: {
              status: currenciesResponse.status,
              statusText: currenciesResponse.statusText,
              body: responseText.substring(0, 500),
            },
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Parse successful response
      let currenciesData;
      try {
        currenciesData = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse currencies response:', e);
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Respuesta inválida del servicio de pagos',
            technical_details: 'Invalid JSON response',
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Validate currencies data structure
      if (!currenciesData.currencies || !Array.isArray(currenciesData.currencies)) {
        console.error('Invalid currencies data structure:', currenciesData);
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Estructura de datos inválida del servicio de pagos',
            technical_details: 'Missing or invalid currencies array',
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      if (currenciesData.currencies.length === 0) {
        console.error('No currencies available');
        return new Response(
          JSON.stringify({
            success: false,
            error: 'No hay criptomonedas disponibles en este momento. Por favor intenta más tarde.',
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      console.log('✓ Successfully fetched', currenciesData.currencies.length, 'currencies');

      // Return success with currencies
      return new Response(
        JSON.stringify({
          success: true,
          intent: {
            id: order_id,
            order_id: order_id,
            price_amount: parseFloat(price_amount),
            price_currency: price_currency.toLowerCase(),
            pay_currencies: currenciesData.currencies,
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

    // ACTION B: Generate invoice with selected currency
    console.log('=== ACTION B: Generating invoice with currency:', pay_currency, '===');

    // Get phase data
    const { data: metrics, error: metricsError } = await supabaseClient
      .from('metrics')
      .select('current_phase, current_price_usdt')
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

    const currentPhase = metrics.current_phase;
    const pricePerMxi = parseFloat(metrics.current_price_usdt.toString());
    const totalUsdt = parseFloat(price_amount);
    const mxiAmount = totalUsdt / pricePerMxi;

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

    console.log('✓ Transaction history created:', transaction.id);

    // Prepare invoice payload
    const webhookUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/nowpayments-webhook`;
    
    const invoicePayload = {
      price_amount: totalUsdt,
      price_currency: price_currency.toLowerCase(),
      pay_currency: pay_currency.toLowerCase(),
      ipn_callback_url: webhookUrl,
      order_id: order_id,
      order_description: `Compra de ${mxiAmount.toFixed(2)} MXI - Fase ${currentPhase}`,
    };

    console.log('Invoice payload:', JSON.stringify(invoicePayload, null, 2));

    // Call NOWPayments API to create invoice
    let invoiceResponse;
    try {
      console.log('Calling NOWPayments API: POST /v1/invoice');
      invoiceResponse = await fetch('https://api.nowpayments.io/v1/invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': nowpaymentsApiKey,
        },
        body: JSON.stringify(invoicePayload),
      });
      console.log('NOWPayments invoice response status:', invoiceResponse.status);
    } catch (fetchError: any) {
      console.error('Network error calling NOWPayments:', fetchError);
      
      // Update transaction as failed
      await supabaseClient
        .from('transaction_history')
        .update({
          status: 'failed',
          error_message: 'Error de conexión con el servicio de pagos',
          error_details: { message: fetchError.message },
          updated_at: new Date().toISOString(),
        })
        .eq('id', transaction.id);

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Error de conexión con el servicio de pagos. Verifica tu conexión a internet.',
          technical_details: fetchError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const invoiceResponseText = await invoiceResponse.text();
    console.log('NOWPayments invoice response body:', invoiceResponseText);

    if (!invoiceResponse.ok) {
      console.error('NOWPayments invoice API error:', invoiceResponse.status, invoiceResponseText);
      
      let errorMessage = 'No se pudo generar el pago';
      try {
        const errorData = JSON.parse(invoiceResponseText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // Response is not JSON
      }

      // Update transaction as failed
      await supabaseClient
        .from('transaction_history')
        .update({
          status: 'failed',
          error_message: errorMessage,
          error_details: {
            status: invoiceResponse.status,
            body: invoiceResponseText.substring(0, 500),
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', transaction.id);

      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
          technical_details: {
            status: invoiceResponse.status,
            statusText: invoiceResponse.statusText,
            body: invoiceResponseText.substring(0, 500),
          },
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse successful invoice response
    let invoiceData;
    try {
      invoiceData = JSON.parse(invoiceResponseText);
    } catch (e) {
      console.error('Failed to parse invoice response:', e);
      
      // Update transaction as failed
      await supabaseClient
        .from('transaction_history')
        .update({
          status: 'failed',
          error_message: 'Respuesta inválida del servicio de pagos',
          error_details: { raw: invoiceResponseText.substring(0, 500) },
          updated_at: new Date().toISOString(),
        })
        .eq('id', transaction.id);

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Respuesta inválida del servicio de pagos',
          technical_details: 'Invalid JSON response',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('✓ Invoice data parsed:', JSON.stringify(invoiceData, null, 2));

    // Extract invoice URL
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
        .eq('id', transaction.id);

      return new Response(
        JSON.stringify({
          success: false,
          error: 'No se pudo obtener la URL de pago',
          technical_details: 'Missing invoice_url in response',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('✓ Invoice URL received:', invoiceUrl);

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
      console.log('✓ Order stored successfully:', order.id);
    }

    console.log('=== SUCCESS: Invoice created ===');

    // Return success response
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
    console.error('=== UNEXPECTED ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error interno del servidor',
        technical_details: {
          type: error.constructor.name,
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
