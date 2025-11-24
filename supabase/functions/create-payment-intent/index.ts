
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
      throw new Error('NOWPayments API key not configured');
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error(`[${requestId}] ERROR: Supabase credentials not configured`);
      throw new Error('Supabase credentials not configured');
    }

    console.log(`[${requestId}] ✅ Environment variables validated`);

    // Step 2: Get user session
    console.log(`[${requestId}] Step 2: Validating user session...`);
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error(`[${requestId}] ERROR: No authorization header`);
      throw new Error('No authorization header');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error(`[${requestId}] ERROR: Invalid user session:`, userError);
      throw new Error('Invalid user session');
    }

    console.log(`[${requestId}] ✅ User authenticated: ${user.id}`);

    // Step 3: Parse request body
    console.log(`[${requestId}] Step 3: Parsing request body...`);
    const body: PaymentRequest = await req.json();
    console.log(`[${requestId}] Request body:`, JSON.stringify(body, null, 2));

    const { order_id, price_amount, price_currency, pay_currency } = body;

    if (!order_id || !price_amount || !price_currency || !pay_currency) {
      console.error(`[${requestId}] ERROR: Missing required fields`);
      throw new Error('Missing required fields: order_id, price_amount, price_currency, pay_currency');
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
      throw new Error('Failed to get phase information');
    }

    const currentPhase = metrics.current_phase;
    const pricePerMxi = metrics.current_price_usdt;
    const mxiAmount = price_amount / pricePerMxi;

    console.log(`[${requestId}] Phase: ${currentPhase}, Price: ${pricePerMxi} USDT, MXI: ${mxiAmount}`);

    // Step 5: Create NOWPayments invoice
    console.log(`[${requestId}] Step 5: Creating NOWPayments invoice...`);
    const nowPaymentsPayload = {
      price_amount: price_amount,
      price_currency: price_currency,
      pay_currency: pay_currency,
      order_id: order_id,
      order_description: `Purchase ${mxiAmount.toFixed(2)} MXI tokens`,
      ipn_callback_url: `${SUPABASE_URL}/functions/v1/nowpayments-webhook`,
      success_url: 'https://natively.dev',
      cancel_url: 'https://natively.dev',
    };

    console.log(`[${requestId}] NOWPayments payload:`, JSON.stringify(nowPaymentsPayload, null, 2));

    const nowPaymentsResponse = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': NOWPAYMENTS_API_KEY,
      },
      body: JSON.stringify(nowPaymentsPayload),
    });

    console.log(`[${requestId}] NOWPayments response status: ${nowPaymentsResponse.status}`);

    const nowPaymentsText = await nowPaymentsResponse.text();
    console.log(`[${requestId}] NOWPayments response:`, nowPaymentsText);

    if (!nowPaymentsResponse.ok) {
      console.error(`[${requestId}] ERROR: NOWPayments API error`);
      throw new Error(`NOWPayments API error: ${nowPaymentsText}`);
    }

    let nowPaymentsData;
    try {
      nowPaymentsData = JSON.parse(nowPaymentsText);
    } catch (e) {
      console.error(`[${requestId}] ERROR: Invalid JSON from NOWPayments`);
      throw new Error('Invalid response from NOWPayments');
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
      pay_currency: pay_currency,
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
      throw new Error(`Failed to store payment: ${paymentError.message}`);
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
        pay_currency: pay_currency,
        price_amount: price_amount,
        price_currency: price_currency,
        mxi_amount: mxiAmount,
        payment_status: nowPaymentsData.payment_status || 'waiting',
        expires_at: nowPaymentsData.expiration_estimate_date,
      },
    };

    console.log(`[${requestId}] ========== SUCCESS ==========\n`);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error(`[${requestId}] ========== ERROR ==========`);
    console.error(`[${requestId}] Error:`, error);
    console.error(`[${requestId}] Stack:`, error.stack);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
        requestId: requestId,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
