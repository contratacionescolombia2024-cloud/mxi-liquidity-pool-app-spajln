
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  order_id: string;
  price_amount: number;
  price_currency: string;
  pay_currency: string;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID().substring(0, 8);
  console.log(`\n[${requestId}] ========== CREATE PAYMENT INTENT ==========`);
  console.log(`[${requestId}] Timestamp:`, new Date().toISOString());

  try {
    // Step 1: Validate environment variables
    console.log(`[${requestId}] Step 1: Validating environment variables...`);
    const NOWPAYMENTS_API_KEY = Deno.env.get('NOWPAYMENTS_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!NOWPAYMENTS_API_KEY) {
      console.error(`[${requestId}] ERROR: NOWPAYMENTS_API_KEY not configured`);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'NOWPayments API key not configured',
          code: 'MISSING_API_KEY',
          requestId: requestId,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error(`[${requestId}] ERROR: Supabase credentials not configured`);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Supabase credentials not configured',
          code: 'MISSING_SUPABASE_CREDS',
          requestId: requestId,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`[${requestId}] ✅ Environment variables validated`);
    console.log(`[${requestId}] API Key present: ${NOWPAYMENTS_API_KEY.substring(0, 10)}...`);

    // Step 2: Get user session
    console.log(`[${requestId}] Step 2: Validating user session...`);
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error(`[${requestId}] ERROR: No authorization header`);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No authorization header',
          code: 'NO_AUTH_HEADER',
          requestId: requestId,
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error(`[${requestId}] ERROR: Invalid user session:`, userError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid user session',
          code: 'INVALID_SESSION',
          details: userError?.message,
          requestId: requestId,
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`[${requestId}] ✅ User authenticated: ${user.id}`);

    // Step 3: Parse request body
    console.log(`[${requestId}] Step 3: Parsing request body...`);
    let body: PaymentRequest;
    
    try {
      body = await req.json();
      console.log(`[${requestId}] Request body:`, JSON.stringify(body, null, 2));
    } catch (parseError: any) {
      console.error(`[${requestId}] ERROR: Failed to parse request body:`, parseError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid request body',
          code: 'INVALID_JSON',
          details: parseError.message,
          requestId: requestId,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { order_id, price_amount, price_currency, pay_currency } = body;

    if (!order_id || !price_amount || !price_currency || !pay_currency) {
      console.error(`[${requestId}] ERROR: Missing required fields`);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields',
          code: 'MISSING_FIELDS',
          required: ['order_id', 'price_amount', 'price_currency', 'pay_currency'],
          received: { order_id, price_amount, price_currency, pay_currency },
          requestId: requestId,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`[${requestId}] ✅ Request validated`);

    // Step 4: Get current phase info
    console.log(`[${requestId}] Step 4: Getting phase info...`);
    const { data: metrics, error: metricsError } = await supabase
      .from('metrics')
      .select('current_phase, current_price_usdt')
      .single();

    if (metricsError || !metrics) {
      console.error(`[${requestId}] ERROR: Failed to get metrics:`, metricsError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to get phase information',
          code: 'METRICS_ERROR',
          details: metricsError?.message,
          requestId: requestId,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const currentPhase = metrics.current_phase;
    const pricePerMxi = metrics.current_price_usdt;
    const mxiAmount = price_amount / pricePerMxi;

    console.log(`[${requestId}] Phase: ${currentPhase}, Price: ${pricePerMxi} USDT, MXI: ${mxiAmount}`);

    // Step 5: Create NOWPayments invoice
    console.log(`[${requestId}] Step 5: Creating NOWPayments invoice...`);
    
    // IMPORTANT: NOWPayments expects lowercase currency codes
    const normalizedPayCurrency = pay_currency.toLowerCase();
    
    const nowPaymentsPayload = {
      price_amount: price_amount,
      price_currency: price_currency.toLowerCase(),
      pay_currency: normalizedPayCurrency,
      order_id: order_id,
      order_description: `Purchase ${mxiAmount.toFixed(2)} MXI tokens`,
      ipn_callback_url: `${SUPABASE_URL}/functions/v1/nowpayments-webhook`,
      success_url: 'https://natively.dev',
      cancel_url: 'https://natively.dev',
    };

    console.log(`[${requestId}] NOWPayments payload:`, JSON.stringify(nowPaymentsPayload, null, 2));
    console.log(`[${requestId}] Using API key: ${NOWPAYMENTS_API_KEY.substring(0, 15)}...`);

    let nowPaymentsResponse;
    try {
      console.log(`[${requestId}] Calling NOWPayments API...`);
      nowPaymentsResponse = await fetch('https://api.nowpayments.io/v1/invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': NOWPAYMENTS_API_KEY,
        },
        body: JSON.stringify(nowPaymentsPayload),
      });
      console.log(`[${requestId}] NOWPayments API call completed`);
    } catch (fetchError: any) {
      console.error(`[${requestId}] ERROR: Failed to connect to NOWPayments:`, fetchError);
      console.error(`[${requestId}] Fetch error details:`, {
        name: fetchError.name,
        message: fetchError.message,
        stack: fetchError.stack,
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to connect to payment provider',
          code: 'NOWPAYMENTS_CONNECTION_ERROR',
          details: fetchError.message,
          requestId: requestId,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`[${requestId}] NOWPayments response status: ${nowPaymentsResponse.status}`);
    console.log(`[${requestId}] NOWPayments response headers:`, Object.fromEntries(nowPaymentsResponse.headers.entries()));

    let nowPaymentsText;
    try {
      nowPaymentsText = await nowPaymentsResponse.text();
      console.log(`[${requestId}] NOWPayments response body (first 500 chars):`, nowPaymentsText.substring(0, 500));
    } catch (textError: any) {
      console.error(`[${requestId}] ERROR: Failed to read response text:`, textError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to read payment provider response',
          code: 'NOWPAYMENTS_READ_ERROR',
          details: textError.message,
          requestId: requestId,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!nowPaymentsResponse.ok) {
      console.error(`[${requestId}] ERROR: NOWPayments API error - Status ${nowPaymentsResponse.status}`);
      console.error(`[${requestId}] Response body:`, nowPaymentsText);
      
      let errorDetails;
      try {
        errorDetails = JSON.parse(nowPaymentsText);
        console.error(`[${requestId}] Parsed error:`, errorDetails);
      } catch {
        errorDetails = { raw: nowPaymentsText };
      }

      // Provide user-friendly error messages
      let userMessage = 'Error al procesar el pago con NOWPayments';
      if (nowPaymentsResponse.status === 400) {
        userMessage = 'Datos de pago inválidos. Por favor verifica la información e intenta nuevamente.';
      } else if (nowPaymentsResponse.status === 401) {
        userMessage = 'Error de autenticación con el proveedor de pagos. Por favor contacta al soporte.';
      } else if (nowPaymentsResponse.status === 429) {
        userMessage = 'Demasiadas solicitudes. Por favor espera un momento e intenta nuevamente.';
      } else if (nowPaymentsResponse.status >= 500) {
        userMessage = 'El proveedor de pagos está experimentando problemas. Por favor intenta más tarde.';
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: userMessage,
          code: 'NOWPAYMENTS_API_ERROR',
          statusCode: nowPaymentsResponse.status,
          details: errorDetails,
          requestId: requestId,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let nowPaymentsData;
    try {
      nowPaymentsData = JSON.parse(nowPaymentsText);
      console.log(`[${requestId}] Parsed NOWPayments data:`, JSON.stringify(nowPaymentsData, null, 2));
    } catch (parseError: any) {
      console.error(`[${requestId}] ERROR: Invalid JSON from NOWPayments`);
      console.error(`[${requestId}] Parse error:`, parseError);
      console.error(`[${requestId}] Response text:`, nowPaymentsText);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid response from payment provider',
          code: 'NOWPAYMENTS_INVALID_JSON',
          details: parseError.message,
          raw: nowPaymentsText.substring(0, 500),
          requestId: requestId,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate that we got the required fields from NOWPayments
    if (!nowPaymentsData.id || !nowPaymentsData.invoice_url) {
      console.error(`[${requestId}] ERROR: Missing required fields in NOWPayments response`);
      console.error(`[${requestId}] Response data:`, nowPaymentsData);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Incomplete response from payment provider',
          code: 'NOWPAYMENTS_INCOMPLETE_RESPONSE',
          details: 'Missing id or invoice_url',
          received: nowPaymentsData,
          requestId: requestId,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`[${requestId}] ✅ Invoice created: ${nowPaymentsData.id}`);

    // Step 6: Store payment in database
    console.log(`[${requestId}] Step 6: Storing payment in database...`);
    const paymentRecord = {
      user_id: user.id,
      order_id: order_id,
      payment_id: nowPaymentsData.id?.toString() || null,
      invoice_url: nowPaymentsData.invoice_url || null,
      price_amount: price_amount,
      price_currency: price_currency,
      pay_amount: nowPaymentsData.pay_amount || null,
      pay_currency: normalizedPayCurrency,
      pay_address: nowPaymentsData.pay_address || null,
      mxi_amount: mxiAmount,
      price_per_mxi: pricePerMxi,
      phase: currentPhase,
      status: 'waiting',
      payment_status: nowPaymentsData.payment_status || 'waiting',
      expires_at: nowPaymentsData.expiration_estimate_date || null,
    };

    console.log(`[${requestId}] Payment record:`, JSON.stringify(paymentRecord, null, 2));

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert(paymentRecord)
      .select()
      .single();

    if (paymentError) {
      console.error(`[${requestId}] ERROR: Failed to store payment:`, paymentError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to store payment record',
          code: 'DATABASE_ERROR',
          details: paymentError.message,
          requestId: requestId,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`[${requestId}] ✅ Payment stored: ${payment.id}`);

    // Step 7: Return success response
    console.log(`[${requestId}] Step 7: Returning success response`);
    const response = {
      success: true,
      intent: {
        id: nowPaymentsData.id,
        order_id: order_id,
        invoice_url: nowPaymentsData.invoice_url,
        payment_id: nowPaymentsData.id,
        pay_address: nowPaymentsData.pay_address,
        pay_amount: nowPaymentsData.pay_amount,
        pay_currency: normalizedPayCurrency,
        price_amount: price_amount,
        price_currency: price_currency,
        mxi_amount: mxiAmount,
        payment_status: nowPaymentsData.payment_status || 'waiting',
        expires_at: nowPaymentsData.expiration_estimate_date,
      },
    };

    console.log(`[${requestId}] Response:`, JSON.stringify(response, null, 2));
    console.log(`[${requestId}] ========== SUCCESS ==========\n`);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error(`[${requestId}] ========== UNEXPECTED ERROR ==========`);
    console.error(`[${requestId}] Error:`, error);
    console.error(`[${requestId}] Error message:`, error.message);
    console.error(`[${requestId}] Error name:`, error.name);
    console.error(`[${requestId}] Stack:`, error.stack);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
        code: 'UNEXPECTED_ERROR',
        errorType: error.name,
        requestId: requestId,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
