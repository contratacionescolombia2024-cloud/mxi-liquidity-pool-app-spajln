
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as djwt from 'https://deno.land/x/djwt@v3.0.2/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-nowpayments-sig',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID().substring(0, 8);
  console.log(`\n[${requestId}] ========== NOWPAYMENTS WEBHOOK ==========`);
  console.log(`[${requestId}] Timestamp:`, new Date().toISOString());

  try {
    // Step 1: Validate environment
    console.log(`[${requestId}] Step 1: Validating environment...`);
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const NOWPAYMENTS_IPN_SECRET = Deno.env.get('NOWPAYMENTS_IPN_SECRET');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error(`[${requestId}] ERROR: Supabase credentials not configured`);
      throw new Error('Supabase credentials not configured');
    }

    if (!NOWPAYMENTS_IPN_SECRET) {
      console.error(`[${requestId}] ERROR: NOWPAYMENTS_IPN_SECRET not configured`);
      return new Response('Unauthorized', { 
        status: 401,
        headers: corsHeaders 
      });
    }

    console.log(`[${requestId}] ✅ Environment validated`);
    console.log(`[${requestId}] IPN Secret configured: ${NOWPAYMENTS_IPN_SECRET.substring(0, 10)}...`);

    // Step 2: Verify JWT signature BEFORE processing body
    console.log(`[${requestId}] Step 2: Verifying JWT signature...`);
    const signature = req.headers.get('x-nowpayments-sig');
    
    if (!signature) {
      console.error(`[${requestId}] ERROR: Missing x-nowpayments-sig header`);
      return new Response('Unauthorized', { 
        status: 401,
        headers: corsHeaders 
      });
    }

    console.log(`[${requestId}] Signature header found: ${signature.substring(0, 20)}...`);

    // Verify JWT with HS256 algorithm
    try {
      const encoder = new TextEncoder();
      const keyData = encoder.encode(NOWPAYMENTS_IPN_SECRET);
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
      );

      // Verify the JWT using djwt - NOWPayments does NOT send exp field
      await djwt.verify(signature, cryptoKey, {
        algorithms: ['HS256'],
        ignoreExpiration: true,
      });

      console.log(`[${requestId}] ✅ JWT signature verified successfully`);
    } catch (jwtError) {
      console.error(`[${requestId}] ERROR: JWT verification failed:`, jwtError);
      console.error(`[${requestId}] JWT Error details:`, jwtError.message);
      return new Response('Unauthorized', { 
        status: 401,
        headers: corsHeaders 
      });
    }

    // Step 3: Parse webhook payload (AFTER verification)
    console.log(`[${requestId}] Step 3: Parsing webhook payload...`);
    const payload = await req.json();
    console.log(`[${requestId}] Webhook payload:`, JSON.stringify(payload, null, 2));

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Step 4: Log webhook
    console.log(`[${requestId}] Step 4: Logging webhook...`);
    await supabase.from('payment_webhook_logs').insert({
      payment_id: payload.payment_id?.toString() || null,
      order_id: payload.order_id || null,
      payload: payload,
      status: payload.payment_status || 'unknown',
      processed: false,
    });

    console.log(`[${requestId}] ✅ Webhook logged`);

    // Step 5: Find payment record
    console.log(`[${requestId}] Step 5: Finding payment record...`);
    const orderId = payload.order_id;
    
    if (!orderId) {
      console.error(`[${requestId}] ERROR: No order_id in payload`);
      throw new Error('No order_id in webhook payload');
    }

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (paymentError || !payment) {
      console.error(`[${requestId}] ERROR: Payment not found:`, paymentError);
      throw new Error(`Payment not found for order_id: ${orderId}`);
    }

    console.log(`[${requestId}] ✅ Payment found: ${payment.id}`);
    console.log(`[${requestId}] Payment details: User ${payment.user_id}, Amount ${payment.mxi_amount} MXI`);

    // Step 6: Update payment status
    console.log(`[${requestId}] Step 6: Updating payment status...`);
    const paymentStatus = payload.payment_status || 'unknown';
    console.log(`[${requestId}] Payment status: ${paymentStatus}`);

    const updateData: any = {
      payment_status: paymentStatus,
      status: paymentStatus,
      updated_at: new Date().toISOString(),
    };

    if (payload.actually_paid) {
      updateData.actually_paid = parseFloat(payload.actually_paid);
    }

    if (payload.outcome_amount) {
      updateData.outcome_amount = parseFloat(payload.outcome_amount);
    }

    if (payload.network_fee) {
      updateData.network_fee = parseFloat(payload.network_fee);
    }

    const { error: updateError } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', payment.id);

    if (updateError) {
      console.error(`[${requestId}] ERROR: Failed to update payment:`, updateError);
      throw new Error(`Failed to update payment: ${updateError.message}`);
    }

    console.log(`[${requestId}] ✅ Payment updated`);

    // Step 7: Credit user if payment is successful
    if (paymentStatus === 'finished' || paymentStatus === 'confirmed') {
      console.log(`[${requestId}] Step 7: Crediting user...`);

      // Check if already credited
      if (payment.status === 'finished' || payment.status === 'confirmed') {
        console.log(`[${requestId}] ⚠️ Payment already credited, skipping`);
      } else {
        // Get user
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', payment.user_id)
          .single();

        if (userError || !user) {
          console.error(`[${requestId}] ERROR: User not found:`, userError);
          throw new Error('User not found');
        }

        console.log(`[${requestId}] User: ${user.id}, Current balance: ${user.mxi_balance}`);

        // Update user balance
        const newMxiBalance = parseFloat(user.mxi_balance) + parseFloat(payment.mxi_amount);
        const newUsdtContributed = parseFloat(user.usdt_contributed) + parseFloat(payment.price_amount);

        const { error: userUpdateError } = await supabase
          .from('users')
          .update({
            mxi_balance: newMxiBalance,
            usdt_contributed: newUsdtContributed,
            mxi_purchased_directly: parseFloat(user.mxi_purchased_directly || 0) + parseFloat(payment.mxi_amount),
            is_active_contributor: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', payment.user_id);

        if (userUpdateError) {
          console.error(`[${requestId}] ERROR: Failed to update user:`, userUpdateError);
          throw new Error(`Failed to update user: ${userUpdateError.message}`);
        }

        console.log(`[${requestId}] ✅ User credited: ${newMxiBalance} MXI`);

        // Update metrics
        const { data: metrics, error: metricsError } = await supabase
          .from('metrics')
          .select('*')
          .single();

        if (!metricsError && metrics) {
          const newTotalUsdt = parseFloat(metrics.total_usdt_contributed) + parseFloat(payment.price_amount);
          const newTotalMxi = parseFloat(metrics.total_mxi_distributed) + parseFloat(payment.mxi_amount);
          const newTokensSold = parseFloat(metrics.total_tokens_sold) + parseFloat(payment.mxi_amount);

          await supabase
            .from('metrics')
            .update({
              total_usdt_contributed: newTotalUsdt,
              total_mxi_distributed: newTotalMxi,
              total_tokens_sold: newTokensSold,
              updated_at: new Date().toISOString(),
            })
            .eq('id', metrics.id);

          console.log(`[${requestId}] ✅ Metrics updated`);
        }

        // Mark payment as confirmed
        await supabase
          .from('payments')
          .update({
            status: 'confirmed',
            confirmed_at: new Date().toISOString(),
          })
          .eq('id', payment.id);

        console.log(`[${requestId}] ✅ Payment marked as confirmed`);
      }
    }

    // Step 8: Mark webhook as processed
    console.log(`[${requestId}] Step 8: Marking webhook as processed...`);
    await supabase
      .from('payment_webhook_logs')
      .update({ processed: true })
      .eq('order_id', orderId)
      .eq('processed', false);

    console.log(`[${requestId}] ========== SUCCESS ==========\n`);

    return new Response(
      JSON.stringify({ success: true, requestId }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

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
