
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
    
    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(payload)
    );
    
    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex === signature;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('=== NOWPayments Webhook Received ===');
    console.log('Headers:', Object.fromEntries(req.headers.entries()));

    // Create Supabase client with service role for webhook processing
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get raw body for signature verification
    const rawBody = await req.text();
    console.log('Raw body:', rawBody);

    // Parse webhook payload
    let payload;
    try {
      payload = JSON.parse(rawBody);
      console.log('Parsed payload:', JSON.stringify(payload, null, 2));
    } catch (e) {
      console.error('Failed to parse webhook payload:', e);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // SECURITY FIX: Get webhook secret from environment variable
    const webhookSecret = Deno.env.get('NOWPAYMENTS_WEBHOOK_SECRET');
    const receivedSignature = req.headers.get('x-nowpayments-sig');
    
    console.log('Webhook secret configured:', !!webhookSecret);
    console.log('Received signature:', receivedSignature);

    // Verify signature if both secret and signature are present
    if (webhookSecret && receivedSignature) {
      const isValid = await verifySignature(rawBody, receivedSignature, webhookSecret);
      console.log('Signature verification result:', isValid);
      
      if (!isValid) {
        console.error('Invalid webhook signature - possible security breach attempt');
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      console.log('Webhook signature verified successfully');
    } else if (!webhookSecret) {
      console.warn('NOWPAYMENTS_WEBHOOK_SECRET not configured - webhook signature verification disabled');
      console.warn('This is a security risk in production. Please configure the webhook secret.');
    } else if (!receivedSignature) {
      console.warn('No signature provided in webhook request - this may indicate an issue with NOWPayments configuration');
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
      console.error('Error logging webhook:', logError);
    }

    const paymentId = payload.payment_id;
    const orderId = payload.order_id;
    const paymentStatus = payload.payment_status || payload.status;
    const actuallyPaid = parseFloat(payload.actually_paid || payload.outcome_amount || '0');
    const payCurrency = payload.pay_currency || payload.currency || '';
    const outcomeAmount = parseFloat(payload.outcome_amount || payload.actually_paid || '0');

    console.log('Payment details:', {
      paymentId,
      orderId,
      paymentStatus,
      actuallyPaid,
      payCurrency,
      outcomeAmount,
    });

    // Find the order in database
    const { data: order, error: orderError } = await supabaseClient
      .from('nowpayments_orders')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Order not found:', orderId, orderError);
      await supabaseClient
        .from('nowpayments_webhook_logs')
        .update({
          error: 'Order not found',
          processed: true,
        })
        .eq('payment_id', paymentId);

      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Order found:', order.id);

    // Update order status
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

    // Update transaction history
    await supabaseClient
      .from('transaction_history')
      .update({
        status: paymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', orderId);

    console.log('Order and transaction history updated with status:', paymentStatus);

    // Process payment if finished or confirmed
    if (paymentStatus === 'finished' || paymentStatus === 'confirmed') {
      console.log('Processing finished/confirmed payment:', orderId);

      // Check if already processed to avoid double-processing
      if (order.status === 'confirmed' || order.status === 'finished') {
        console.log('Payment already processed, skipping');
        return new Response(
          JSON.stringify({
            success: true,
            status: paymentStatus,
            message: 'Payment already processed',
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Verify payment currency - UPDATED TO ACCEPT USDT ETH
      const normalizedCurrency = payCurrency.toLowerCase().replace(/[^a-z]/g, '');
      
      // Accept both usdteth and usdt (generic) - reject trc20 variants
      const isValidCurrency = normalizedCurrency.includes('usdteth') || 
                             (normalizedCurrency.includes('usdt') && !normalizedCurrency.includes('trc'));
      
      if (!isValidCurrency) {
        console.error('Invalid payment currency:', payCurrency, 'normalized:', normalizedCurrency);
        
        await supabaseClient
          .from('transaction_history')
          .update({
            status: 'failed',
            error_message: 'Moneda de pago inválida - se requiere USDT ETH',
            error_details: { expected: 'USDT ETH (ERC20)', received: payCurrency },
            updated_at: new Date().toISOString(),
          })
          .eq('order_id', orderId);

        await supabaseClient
          .from('nowpayments_webhook_logs')
          .update({
            error: 'Invalid payment currency - expected USDT ETH',
            processed: true,
          })
          .eq('payment_id', paymentId);

        return new Response(
          JSON.stringify({ error: 'Invalid payment currency - expected USDT ETH' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      console.log('Payment currency validated:', payCurrency);

      // Verify amount (allow small variance for network fees - 5%)
      const expectedAmount = parseFloat(order.usdt_amount.toString());
      const variance = Math.abs(actuallyPaid - expectedAmount) / expectedAmount;

      console.log('Amount verification:', {
        expected: expectedAmount,
        actual: actuallyPaid,
        variance: variance * 100 + '%',
      });

      if (variance > 0.05) {
        console.error('Payment amount mismatch:', {
          expected: expectedAmount,
          actual: actuallyPaid,
          variance: variance * 100 + '%',
        });

        await supabaseClient
          .from('transaction_history')
          .update({
            status: 'failed',
            error_message: 'Monto de pago no coincide',
            error_details: { expected: expectedAmount, actual: actuallyPaid, variance },
            updated_at: new Date().toISOString(),
          })
          .eq('order_id', orderId);

        await supabaseClient
          .from('nowpayments_webhook_logs')
          .update({
            error: 'Payment amount mismatch',
            processed: true,
          })
          .eq('payment_id', paymentId);

        return new Response(
          JSON.stringify({ error: 'Payment amount mismatch' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Get user data
      const { data: user, error: userError } = await supabaseClient
        .from('users')
        .select('*')
        .eq('id', order.user_id)
        .single();

      if (userError || !user) {
        console.error('User not found:', order.user_id, userError);
        
        await supabaseClient
          .from('transaction_history')
          .update({
            status: 'failed',
            error_message: 'Usuario no encontrado',
            error_details: { user_id: order.user_id },
            updated_at: new Date().toISOString(),
          })
          .eq('order_id', orderId);

        await supabaseClient
          .from('nowpayments_webhook_logs')
          .update({
            error: 'User not found',
            processed: true,
          })
          .eq('payment_id', paymentId);

        return new Response(
          JSON.stringify({ error: 'User not found' }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      console.log('User found:', user.id);

      const mxiAmount = parseFloat(order.mxi_amount.toString());
      const usdtAmount = parseFloat(order.usdt_amount.toString());

      // Update user balances
      const newMxiBalance = parseFloat(user.mxi_balance.toString()) + mxiAmount;
      const newMxiPurchased = parseFloat(user.mxi_purchased_directly?.toString() || '0') + mxiAmount;
      const newUsdtContributed = parseFloat(user.usdt_contributed.toString()) + usdtAmount;

      // Calculate yield rate (0.005% per hour = 0.00005 per hour)
      const yieldRatePerHour = mxiAmount * 0.00005;
      const yieldRatePerMinute = yieldRatePerHour / 60;
      const newYieldRate = parseFloat(user.yield_rate_per_minute?.toString() || '0') + yieldRatePerMinute;

      console.log('Updating user balances:', {
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
        .eq('id', order.user_id);

      console.log('User balances updated');

      // Create contribution record
      await supabaseClient.from('contributions').insert({
        user_id: order.user_id,
        usdt_amount: usdtAmount,
        mxi_amount: mxiAmount,
        transaction_type: 'initial',
        status: 'completed',
      });

      console.log('Contribution record created');

      // Update metrics
      const { data: metrics } = await supabaseClient.from('metrics').select('*').single();

      if (metrics) {
        const phaseField = `phase_${order.phase}_tokens_sold`;
        const currentPhaseSold = parseFloat(metrics[phaseField]?.toString() || '0');
        const newPhaseSold = currentPhaseSold + mxiAmount;
        const newTotalSold = parseFloat(metrics.total_tokens_sold.toString()) + mxiAmount;
        const newTotalUsdt = parseFloat(metrics.total_usdt_contributed.toString()) + usdtAmount;

        console.log('Updating metrics:', {
          phaseField,
          currentPhaseSold,
          newPhaseSold,
          newTotalSold,
          newTotalUsdt,
        });

        await supabaseClient
          .from('metrics')
          .update({
            [phaseField]: newPhaseSold,
            total_tokens_sold: newTotalSold,
            total_usdt_contributed: newTotalUsdt,
            updated_at: new Date().toISOString(),
          })
          .eq('id', metrics.id);

        console.log('Metrics updated');
      }

      // Process referral commissions (5%, 2%, 1%)
      if (user.referred_by) {
        console.log('Processing referral commissions for user:', user.id);
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

            console.log(`Processing level ${level} commission:`, {
              referrer: referrer.id,
              commissionAmount,
              rate: commissionRates[level - 1] * 100 + '%',
            });

            // Update referrer balance
            const newReferrerBalance = parseFloat(referrer.mxi_balance.toString()) + commissionAmount;
            const newCommissionBalance =
              parseFloat(referrer.mxi_from_unified_commissions?.toString() || '0') + commissionAmount;

            // Add to yield rate (commissions also generate yield)
            const commissionYieldPerHour = commissionAmount * 0.00005;
            const commissionYieldPerMinute = commissionYieldPerHour / 60;
            const newReferrerYieldRate =
              parseFloat(referrer.yield_rate_per_minute?.toString() || '0') + commissionYieldPerMinute;

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
              from_user_id: order.user_id,
              level: level,
              amount: commissionAmount,
              percentage: commissionRates[level - 1] * 100,
              status: 'available',
            });

            console.log(`Level ${level} commission processed for referrer:`, referrer.id);

            // Move to next level
            currentReferrer = referrer.referred_by;
          } else {
            console.log(`No referrer found at level ${level}`);
            break;
          }
        }
      }

      // Mark order as confirmed
      await supabaseClient
        .from('nowpayments_orders')
        .update({
          status: 'confirmed',
          confirmed_at: new Date().toISOString(),
        })
        .eq('order_id', orderId);

      // Update transaction history as finished
      await supabaseClient
        .from('transaction_history')
        .update({
          status: 'finished',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('order_id', orderId);

      // Mark webhook as processed
      await supabaseClient
        .from('nowpayments_webhook_logs')
        .update({
          processed: true,
        })
        .eq('payment_id', paymentId);

      console.log('Payment processed successfully:', orderId);
    } else if (paymentStatus === 'failed' || paymentStatus === 'expired' || paymentStatus === 'cancelled') {
      console.log('Payment failed/expired/cancelled:', orderId);
      
      // Update transaction history as failed/expired/cancelled
      await supabaseClient
        .from('transaction_history')
        .update({
          status: paymentStatus,
          error_message: `Pago ${paymentStatus === 'failed' ? 'fallido' : paymentStatus === 'expired' ? 'expirado' : 'cancelado'}`,
          updated_at: new Date().toISOString(),
        })
        .eq('order_id', orderId);

      // Mark webhook as processed
      await supabaseClient
        .from('nowpayments_webhook_logs')
        .update({
          processed: true,
        })
        .eq('payment_id', paymentId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: paymentStatus,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in nowpayments-webhook:', error);
    console.error('Error stack:', error.stack);
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
