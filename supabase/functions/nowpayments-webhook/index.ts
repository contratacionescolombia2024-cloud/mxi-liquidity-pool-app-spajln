
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-nowpayments-sig',
};

// Function to verify HMAC signature
async function verifySignature(payload: string, signature: string, secret: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    console.log('Computed signature:', hashHex);
    console.log('Received signature:', signature);
    console.log('Signatures match:', hashHex === signature);

    return hashHex === signature;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

// Normalize payment status
function normalizeStatus(status: string): string {
  const statusLower = status.toLowerCase();
  
  if (statusLower === 'finished' || statusLower === 'confirmed') {
    return 'paid';
  } else if (statusLower === 'waiting' || statusLower === 'pending' || statusLower === 'confirming') {
    return 'processing';
  } else if (statusLower === 'failed') {
    return 'failed';
  } else if (statusLower === 'refunded') {
    return 'refunded';
  } else if (statusLower === 'expired') {
    return 'expired';
  }
  
  return statusLower;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID().substring(0, 8);

  try {
    console.log(`\n========== [${requestId}] NOWPayments Webhook Received ==========`);
    console.log(`Time: ${new Date().toISOString()}`);
    console.log('Method:', req.method);
    console.log('Headers:', Object.fromEntries(req.headers.entries()));

    // Create Supabase client with service role for webhook processing
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get raw body for signature verification
    const rawBody = await req.text();
    console.log(`[${requestId}] Raw body length:`, rawBody.length);
    console.log(`[${requestId}] Raw body:`, rawBody);

    // Parse webhook payload
    let payload: any;
    try {
      payload = JSON.parse(rawBody);
      console.log(`[${requestId}] Parsed payload:`, JSON.stringify(payload, null, 2));
    } catch (e) {
      console.error(`[${requestId}] Failed to parse webhook payload:`, e);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // SECURITY: Get webhook secret from environment variable
    const webhookSecret = Deno.env.get('NOWPAYMENTS_IPN_SECRET');
    const receivedSignature = req.headers.get('x-nowpayments-sig');

    console.log(`[${requestId}] Webhook secret configured:`, !!webhookSecret);
    console.log(`[${requestId}] Webhook secret length:`, webhookSecret?.length || 0);
    console.log(`[${requestId}] Received signature:`, receivedSignature);

    // Verify signature if both secret and signature are present
    if (webhookSecret && receivedSignature) {
      const isValid = await verifySignature(rawBody, receivedSignature, webhookSecret);
      console.log(`[${requestId}] Signature verification result:`, isValid);

      if (!isValid) {
        console.error(`[${requestId}] ❌ Invalid webhook signature - possible security breach attempt`);
        
        // Log the failed attempt
        await supabaseClient.from('nowpayments_webhook_logs').insert({
          payment_id: payload.payment_id || null,
          order_id: payload.order_id || null,
          payload: payload,
          status: 'signature_failed',
          processed: false,
          error: 'Invalid signature',
        });

        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      console.log(`[${requestId}] ✅ Webhook signature verified successfully`);
    } else if (!webhookSecret) {
      console.warn(`[${requestId}] ⚠️ NOWPAYMENTS_IPN_SECRET not configured - webhook signature verification disabled`);
      console.warn(`[${requestId}] This is a security risk in production. Please configure the webhook secret.`);
    } else if (!receivedSignature) {
      console.warn(`[${requestId}] ⚠️ No signature provided in webhook request`);
    }

    // Log webhook for debugging
    const { error: logError } = await supabaseClient.from('nowpayments_webhook_logs').insert({
      payment_id: payload.payment_id || null,
      order_id: payload.order_id || null,
      payload: payload,
      status: payload.payment_status || payload.status || 'unknown',
      processed: false,
    });

    if (logError) {
      console.error(`[${requestId}] Error logging webhook:`, logError);
    }

    // Extract payment details - SUPPORT NEW FORMAT
    const paymentId = payload.payment_id;
    const orderId = payload.order_id;
    const paymentStatus = payload.payment_status || payload.status;
    const actuallyPaid = parseFloat(payload.actually_paid || payload.outcome_amount || '0');
    const payCurrency = payload.pay_currency || payload.currency || '';
    const outcomeAmount = parseFloat(payload.outcome_amount || payload.actually_paid || '0');

    console.log(`[${requestId}] Payment details:`, {
      paymentId,
      orderId,
      paymentStatus,
      actuallyPaid,
      payCurrency,
      outcomeAmount,
    });

    // Normalize status
    const normalizedStatus = normalizeStatus(paymentStatus);
    console.log(`[${requestId}] Normalized status:`, normalizedStatus);

    // Find the payment - try by payment_id first, then by order_id
    let payment: any = null;
    let paymentError: any = null;

    if (paymentId) {
      const result = await supabaseClient
        .from('payments')
        .select('*')
        .eq('payment_id', paymentId)
        .maybeSingle();
      
      payment = result.data;
      paymentError = result.error;
    }

    // If not found by payment_id, try by order_id
    if (!payment && orderId) {
      const result = await supabaseClient
        .from('payments')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle();
      
      payment = result.data;
      paymentError = result.error;
    }

    if (paymentError || !payment) {
      console.error(`[${requestId}] Payment not found:`, { paymentId, orderId }, paymentError);
      
      await supabaseClient.from('nowpayments_webhook_logs').update({
        error: 'Payment not found',
        processed: true,
      }).eq('payment_id', paymentId);

      return new Response(
        JSON.stringify({
          error: 'Payment not found',
          payment_id: paymentId,
          order_id: orderId,
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`[${requestId}] Payment found:`, payment.id);

    // Update payment record
    await supabaseClient
      .from('payments')
      .update({
        status: normalizedStatus,
        payment_status: paymentStatus,
        actually_paid: actuallyPaid,
        pay_amount: outcomeAmount,
        payment_id: paymentId || payment.payment_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id);

    console.log(`[${requestId}] Payment updated with status:`, normalizedStatus);

    // Also update nowpayments_orders for backward compatibility
    if (orderId) {
      await supabaseClient
        .from('nowpayments_orders')
        .update({
          status: paymentStatus,
          payment_status: paymentStatus,
          actually_paid: actuallyPaid,
          outcome_amount: outcomeAmount,
          updated_at: new Date().toISOString(),
        })
        .eq('order_id', orderId);
    }

    // Update transaction history
    if (orderId) {
      await supabaseClient
        .from('transaction_history')
        .update({
          status: paymentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('order_id', orderId);
    }

    console.log(`[${requestId}] All records updated`);

    // Process payment if paid (finished or confirmed)
    if (normalizedStatus === 'paid') {
      console.log(`[${requestId}] Processing paid payment:`, orderId || paymentId);

      // Check if already processed to avoid double-processing
      if (payment.status === 'paid') {
        console.log(`[${requestId}] Payment already processed, skipping`);
        
        await supabaseClient.from('nowpayments_webhook_logs').update({
          processed: true,
        }).eq('payment_id', paymentId);

        return new Response(
          JSON.stringify({
            ok: true,
            order_id: orderId,
            payment_id: paymentId,
            status: normalizedStatus,
            message: 'Payment already processed',
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const mxiAmount = parseFloat(payment.mxi_amount.toString());
      const usdtAmount = parseFloat(payment.price_amount.toString());
      const userId = payment.user_id;
      const phase = payment.phase;
      const pricePerMxi = parseFloat(payment.price_per_mxi.toString());

      // Get user data
      const { data: user, error: userError } = await supabaseClient
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        console.error(`[${requestId}] User not found:`, userId, userError);
        throw new Error('User not found');
      }

      console.log(`[${requestId}] User found:`, user.id);

      // Update user balances
      const newMxiBalance = parseFloat(user.mxi_balance.toString()) + mxiAmount;
      const newMxiPurchased = parseFloat(user.mxi_purchased_directly?.toString() || '0') + mxiAmount;
      const newUsdtContributed = parseFloat(user.usdt_contributed.toString()) + usdtAmount;

      // Calculate yield rate (0.005% per hour = 0.00005 per hour)
      const yieldRatePerHour = mxiAmount * 0.00005;
      const yieldRatePerMinute = yieldRatePerHour / 60;
      const newYieldRate = parseFloat(user.yield_rate_per_minute?.toString() || '0') + yieldRatePerMinute;

      console.log(`[${requestId}] Updating user balances:`, {
        newMxiBalance,
        newMxiPurchased,
        newUsdtContributed,
        newYieldRate,
      });

      await supabaseClient
        .from('users')
        .update({
          mxi_balance: newMxiBalance,
          mxi_purchased_directly: newMxiPurchased,
          usdt_contributed: newUsdtContributed,
          is_active_contributor: true,
          yield_rate_per_minute: newYieldRate,
          last_yield_update: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      console.log(`[${requestId}] User balances updated`);

      // Create contribution record
      await supabaseClient.from('contributions').insert({
        user_id: userId,
        usdt_amount: usdtAmount,
        mxi_amount: mxiAmount,
        transaction_type: 'initial',
        status: 'completed',
      });

      console.log(`[${requestId}] Contribution record created`);

      // Update metrics
      const { data: metrics } = await supabaseClient.from('metrics').select('*').single();

      if (metrics) {
        const phaseField = `phase_${phase}_tokens_sold`;
        const currentPhaseSold = parseFloat(metrics[phaseField]?.toString() || '0');
        const newPhaseSold = currentPhaseSold + mxiAmount;
        const newTotalSold = parseFloat(metrics.total_tokens_sold.toString()) + mxiAmount;
        const newTotalUsdt = parseFloat(metrics.total_usdt_contributed.toString()) + usdtAmount;

        await supabaseClient
          .from('metrics')
          .update({
            [phaseField]: newPhaseSold,
            total_tokens_sold: newTotalSold,
            total_usdt_contributed: newTotalUsdt,
            updated_at: new Date().toISOString(),
          })
          .eq('id', metrics.id);

        console.log(`[${requestId}] Metrics updated`);
      }

      // Process referral commissions (5%, 2%, 1%)
      if (user.referred_by) {
        console.log(`[${requestId}] Processing referral commissions for user:`, user.id);

        const commissionRates = [0.05, 0.02, 0.01]; // 5%, 2%, 1%
        let currentReferrer = user.referred_by;

        for (let level = 1; level <= 3 && currentReferrer; level++) {
          const { data: referrer } = await supabaseClient
            .from('users')
            .select('id, referred_by, mxi_balance, mxi_from_unified_commissions, yield_rate_per_minute')
            .eq('id', currentReferrer)
            .single();

          if (referrer) {
            const commissionAmount = mxiAmount * commissionRates[level - 1];

            // Update referrer balance
            const newReferrerBalance = parseFloat(referrer.mxi_balance.toString()) + commissionAmount;
            const newCommissionBalance = parseFloat(referrer.mxi_from_unified_commissions?.toString() || '0') + commissionAmount;

            // Add to yield rate (commissions also generate yield)
            const commissionYieldPerHour = commissionAmount * 0.00005;
            const commissionYieldPerMinute = commissionYieldPerHour / 60;
            const newReferrerYieldRate = parseFloat(referrer.yield_rate_per_minute?.toString() || '0') + commissionYieldPerMinute;

            await supabaseClient
              .from('users')
              .update({
                mxi_balance: newReferrerBalance,
                mxi_from_unified_commissions: newCommissionBalance,
                yield_rate_per_minute: newReferrerYieldRate,
                last_yield_update: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq('id', referrer.id);

            // Create commission record
            await supabaseClient.from('commissions').insert({
              user_id: referrer.id,
              from_user_id: userId,
              level: level,
              amount: commissionAmount,
              percentage: commissionRates[level - 1] * 100,
              status: 'available',
            });

            console.log(`[${requestId}] Level ${level} commission processed for referrer:`, referrer.id);

            // Move to next level
            currentReferrer = referrer.referred_by;
          } else {
            console.log(`[${requestId}] No referrer found at level ${level}`);
            break;
          }
        }
      }

      // Mark payment as paid
      await supabaseClient
        .from('payments')
        .update({
          status: 'paid',
          confirmed_at: new Date().toISOString(),
        })
        .eq('id', payment.id);

      // Mark order as confirmed
      if (orderId) {
        await supabaseClient
          .from('nowpayments_orders')
          .update({
            status: 'confirmed',
            confirmed_at: new Date().toISOString(),
          })
          .eq('order_id', orderId);
      }

      // Update transaction history as finished
      if (orderId) {
        await supabaseClient
          .from('transaction_history')
          .update({
            status: 'finished',
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('order_id', orderId);
      }

      console.log(`[${requestId}] ✅ Payment processed successfully:`, orderId || paymentId);
    } else if (normalizedStatus === 'failed' || normalizedStatus === 'expired') {
      console.log(`[${requestId}] Payment failed/expired:`, orderId || paymentId);

      // Update transaction history as failed/expired
      if (orderId) {
        await supabaseClient
          .from('transaction_history')
          .update({
            status: normalizedStatus,
            error_message: `Pago ${normalizedStatus === 'failed' ? 'fallido' : 'expirado'}`,
            updated_at: new Date().toISOString(),
          })
          .eq('order_id', orderId);
      }
    }

    // Mark webhook as processed
    await supabaseClient
      .from('nowpayments_webhook_logs')
      .update({
        processed: true,
      })
      .eq('payment_id', paymentId);

    return new Response(
      JSON.stringify({
        ok: true,
        order_id: orderId,
        payment_id: paymentId,
        status: normalizedStatus,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error(`[${requestId}] ❌ Error in nowpayments-webhook:`, error);
    console.error(`[${requestId}] Error stack:`, error.stack);

    return new Response(
      JSON.stringify({
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
