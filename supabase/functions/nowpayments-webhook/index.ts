
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

  try {
    // Create Supabase client with service role for webhook processing
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse webhook payload
    const payload = await req.json();
    console.log('Received NOWPayments webhook:', JSON.stringify(payload));

    // Log webhook for debugging
    await supabaseClient.from('nowpayments_webhook_logs').insert({
      payment_id: payload.payment_id,
      order_id: payload.order_id,
      payload: payload,
      status: payload.payment_status,
      processed: false,
    });

    // Verify webhook signature (if configured)
    const ipnSecret = '8f1694be-d30a-47d5-bc90-c3eb24d43a7a';
    if (ipnSecret) {
      const receivedSignature = req.headers.get('x-nowpayments-sig');
      // Implement signature verification here if needed
      // For now, we'll proceed without it
    }

    const paymentId = payload.payment_id;
    const orderId = payload.order_id;
    const paymentStatus = payload.payment_status;
    const actuallyPaid = parseFloat(payload.actually_paid || '0');
    const payCurrency = payload.pay_currency;
    const outcomeAmount = parseFloat(payload.outcome_amount || '0');

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

    // Process payment if finished
    if (paymentStatus === 'finished') {
      console.log('Processing finished payment:', orderId);

      // Verify payment details
      if (payCurrency.toLowerCase() !== 'usdtbep20') {
        console.error('Invalid payment currency:', payCurrency);
        
        // Update transaction history as failed
        await supabaseClient
          .from('transaction_history')
          .update({
            status: 'failed',
            error_message: 'Moneda de pago inválida',
            error_details: { expected: 'usdtbep20', received: payCurrency },
            updated_at: new Date().toISOString(),
          })
          .eq('order_id', orderId);

        await supabaseClient
          .from('nowpayments_webhook_logs')
          .update({
            error: 'Invalid payment currency',
            processed: true,
          })
          .eq('payment_id', paymentId);

        return new Response(
          JSON.stringify({ error: 'Invalid payment currency' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Verify amount (allow small variance for network fees)
      const expectedAmount = parseFloat(order.usdt_amount.toString());
      const variance = Math.abs(actuallyPaid - expectedAmount) / expectedAmount;

      if (variance > 0.05) {
        console.error('Payment amount mismatch:', {
          expected: expectedAmount,
          actual: actuallyPaid,
        });

        // Update transaction history as failed
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
        
        // Update transaction history as failed
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

      const mxiAmount = parseFloat(order.mxi_amount.toString());
      const usdtAmount = parseFloat(order.usdt_amount.toString());

      // Update user balances
      const newMxiBalance = parseFloat(user.mxi_balance.toString()) + mxiAmount;
      const newMxiPurchased = parseFloat(user.mxi_purchased_directly?.toString() || '0') + mxiAmount;
      const newUsdtContributed = parseFloat(user.usdt_contributed.toString()) + usdtAmount;

      // Calculate yield rate (0.005% per hour)
      const yieldRatePerHour = mxiAmount * 0.00005;
      const yieldRatePerMinute = yieldRatePerHour / 60;
      const newYieldRate = parseFloat(user.yield_rate_per_minute?.toString() || '0') + yieldRatePerMinute;

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

      // Create contribution record
      await supabaseClient.from('contributions').insert({
        user_id: order.user_id,
        usdt_amount: usdtAmount,
        mxi_amount: mxiAmount,
        transaction_type: 'initial',
        status: 'completed',
      });

      // Update metrics
      const { data: metrics } = await supabaseClient.from('metrics').select('*').single();

      if (metrics) {
        const phaseField = `phase_${order.phase}_tokens_sold`;
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
      }

      // Process referral commissions (5%, 2%, 1%)
      if (user.referred_by) {
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

            // Move to next level
            currentReferrer = referrer.referred_by;
          } else {
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
      // Update transaction history as failed/expired/cancelled
      await supabaseClient
        .from('transaction_history')
        .update({
          status: paymentStatus,
          error_message: `Pago ${paymentStatus === 'failed' ? 'fallido' : paymentStatus === 'expired' ? 'expirado' : 'cancelado'}`,
          updated_at: new Date().toISOString(),
        })
        .eq('order_id', orderId);
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
