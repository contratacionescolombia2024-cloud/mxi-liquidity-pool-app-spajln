
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
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    console.log(`[${requestId}] Env check:`, {
      hasApiKey: !!nowpaymentsApiKey,
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseServiceKey: !!supabaseServiceKey,
      hasSupabaseAnonKey: !!supabaseAnonKey,
      apiKeyLength: nowpaymentsApiKey?.length || 0,
    });

    if (!nowpaymentsApiKey) {
      console.error(`[${requestId}] Missing NOWPAYMENTS_API_KEY`);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'NOWPayments API key not configured',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      console.error(`[${requestId}] Missing Supabase environment variables`);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Supabase configuration missing',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 2. AUTHENTICATE USER
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error(`[${requestId}] No authorization header`);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No authorization header provided',
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Extract JWT token from Authorization header
    const token = authHeader.replace('Bearer ', '');
    
    // Create client with anon key for auth verification
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await authClient.auth.getUser(token);

    if (authError || !user) {
      console.error(`[${requestId}] Auth failed:`, authError?.message);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Authentication failed',
          details: authError?.message,
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`[${requestId}] User authenticated: ${user.id}`);

    // Create admin client for database operations (bypasses RLS)
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // 3. PARSE REQUEST BODY
    let body: RequestBody;
    try {
      body = await req.json();
      console.log(`[${requestId}] Request body:`, JSON.stringify(body, null, 2));
    } catch (e) {
      console.error(`[${requestId}] JSON parse error:`, e);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid JSON in request body',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 4. VALIDATE REQUEST
    if (!body.order_id || !body.price_amount || !body.price_currency) {
      console.error(`[${requestId}] Missing required fields`);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: order_id, price_amount, price_currency',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const amount = Number(body.price_amount);
    if (isNaN(amount) || amount < 3 || amount > 500000) {
      console.error(`[${requestId}] Invalid amount: ${body.price_amount}`);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Invalid amount: ${body.price_amount}. Must be between 3 and 500000 USDT`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
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

    // 6. GET PHASE INFO
    console.log(`[${requestId}] Fetching phase info...`);
    
    const { data: metrics, error: metricsError } = await adminClient
      .from('metrics')
      .select('current_phase, current_price_usdt')
      .single();

    if (metricsError) {
      console.error(`[${requestId}] Metrics error:`, metricsError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to fetch phase information: ${metricsError.message}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!metrics) {
      console.error(`[${requestId}] No metrics found`);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No metrics found in database',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const pricePerMxi = Number(metrics.current_price_usdt);
    const mxiAmount = amount / pricePerMxi;

    console.log(`[${requestId}] Phase info:`, {
      phase: metrics.current_phase,
      pricePerMxi,
      mxiAmount,
    });

    // 7. CREATE NOWPAYMENTS INVOICE
    console.log(`[${requestId}] Creating NOWPayments invoice...`);
    
    const webhookUrl = `${supabaseUrl}/functions/v1/nowpayments-webhook`;
    const invoicePayload = {
      price_amount: amount,
      price_currency: 'usd',
      pay_currency: body.pay_currency.toLowerCase(),
      ipn_callback_url: webhookUrl,
      order_id: body.order_id,
      order_description: `MXI Purchase - ${mxiAmount.toFixed(2)} MXI`,
    };

    console.log(`[${requestId}] NOWPayments payload:`, JSON.stringify(invoicePayload, null, 2));
    console.log(`[${requestId}] Webhook URL:`, webhookUrl);

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
    console.log(`[${requestId}] NOWPayments response:`, responseText.substring(0, 500));

    if (!nowpaymentsResponse.ok) {
      console.error(`[${requestId}] NOWPayments API error: ${nowpaymentsResponse.status}`);
      return new Response(
        JSON.stringify({
          success: false,
          error: `NOWPayments API error: ${nowpaymentsResponse.status}`,
          details: responseText.substring(0, 200),
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let invoiceData;
    try {
      invoiceData = JSON.parse(responseText);
    } catch (e) {
      console.error(`[${requestId}] Failed to parse NOWPayments response:`, e);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid response from NOWPayments',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!invoiceData.invoice_url) {
      console.error(`[${requestId}] No invoice_url in response:`, invoiceData);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No invoice URL in NOWPayments response',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`[${requestId}] Invoice URL: ${invoiceData.invoice_url}`);
    console.log(`[${requestId}] Invoice ID: ${invoiceData.id}`);

    // 8. INSERT INTO PAYMENTS TABLE
    console.log(`[${requestId}] Inserting payment record...`);
    
    const { data: payment, error: paymentError } = await adminClient
      .from('payments')
      .insert({
        order_id: body.order_id,
        user_id: user.id,
        payment_id: invoiceData.id || null,
        invoice_url: invoiceData.invoice_url,
        pay_address: invoiceData.pay_address || null,
        price_amount: amount,
        price_currency: 'usd',
        pay_amount: amount,
        pay_currency: body.pay_currency,
        actually_paid: 0,
        mxi_amount: mxiAmount,
        price_per_mxi: pricePerMxi,
        phase: metrics.current_phase,
        status: 'waiting',
        payment_status: 'waiting',
        expires_at: new Date(Date.now() + 3600000).toISOString(),
      })
      .select()
      .single();

    if (paymentError) {
      console.error(`[${requestId}] Payment insert error:`, paymentError);
      console.error(`[${requestId}] Payment error details:`, JSON.stringify(paymentError, null, 2));
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to create payment record: ${paymentError.message}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`[${requestId}] Payment record created: ${payment?.id}`);

    // 9. CREATE TRANSACTION HISTORY RECORD
    const { error: txError } = await adminClient
      .from('transaction_history')
      .insert({
        user_id: user.id,
        transaction_type: 'nowpayments_order',
        order_id: body.order_id,
        payment_id: invoiceData.id || null,
        payment_url: invoiceData.invoice_url,
        mxi_amount: mxiAmount,
        usdt_amount: amount,
        status: 'waiting',
        metadata: {
          phase: metrics.current_phase,
          price_per_mxi: pricePerMxi,
          pay_currency: body.pay_currency,
          invoice_data: invoiceData,
        },
      });

    if (txError) {
      console.error(`[${requestId}] Transaction error:`, txError);
      // Don't fail the request, just log it
    } else {
      console.log(`[${requestId}] Transaction history created`);
    }

    // 10. STORE IN NOWPAYMENTS_ORDERS (for backward compatibility)
    const { error: orderError } = await adminClient
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

    if (orderError) {
      console.error(`[${requestId}] Order error:`, orderError);
      // Don't fail the request, just log it
    } else {
      console.log(`[${requestId}] NOWPayments order created`);
    }

    console.log(`[${requestId}] ✅ SUCCESS - Invoice created`);

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
    console.error(`[${requestId}] ❌ ERROR:`, error.message);
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
