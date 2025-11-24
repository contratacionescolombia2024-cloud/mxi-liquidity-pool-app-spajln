
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
    console.log('=== Check NOWPayments Status ===');

    // Get order_id from query params
    const url = new URL(req.url);
    const orderId = url.searchParams.get('order_id');

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: 'order_id parameter is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Checking status for order:', orderId);

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get order from database
    const { data: order, error: orderError } = await supabaseClient
      .from('nowpayments_orders')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Order not found:', orderId);
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Order found:', order);

    // If already confirmed, return success
    if (order.status === 'confirmed' || order.status === 'finished') {
      return new Response(
        JSON.stringify({
          success: true,
          status: order.status,
          message: 'Payment already confirmed',
          order: order,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get NowPayments API key
    const nowpaymentsApiKey = Deno.env.get('NOWPAYMENTS_API_KEY');
    
    if (!nowpaymentsApiKey) {
      console.error('NOWPAYMENTS_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check payment status with NowPayments API
    console.log('Checking payment status with NowPayments API...');
    console.log('Payment ID:', order.payment_id);

    const nowpaymentsResponse = await fetch(
      `https://api.nowpayments.io/v1/payment/${order.payment_id}`,
      {
        method: 'GET',
        headers: {
          'x-api-key': nowpaymentsApiKey,
        },
      }
    );

    if (!nowpaymentsResponse.ok) {
      const errorText = await nowpaymentsResponse.text();
      console.error('NowPayments API error:', errorText);
      return new Response(
        JSON.stringify({
          error: 'Failed to check payment status',
          details: errorText,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const paymentData = await nowpaymentsResponse.json();
    console.log('Payment data from NowPayments:', paymentData);

    const paymentStatus = paymentData.payment_status;
    const actuallyPaid = parseFloat(paymentData.actually_paid || paymentData.outcome_amount || '0');
    const payCurrency = paymentData.pay_currency || '';

    // Update order with latest status
    await supabaseClient
      .from('nowpayments_orders')
      .update({
        status: paymentStatus,
        payment_status: paymentStatus,
        actually_paid: actuallyPaid,
        outcome_amount: actuallyPaid,
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', orderId);

    // If payment is finished or confirmed, process it
    if (paymentStatus === 'finished' || paymentStatus === 'confirmed') {
      console.log('Payment is finished/confirmed, processing...');

      // Verify payment currency
      const normalizedCurrency = payCurrency.toLowerCase().replace(/[^a-z]/g, '');
      const isValidCurrency = normalizedCurrency.includes('usdteth') || 
                             normalizedCurrency.includes('usdterc') ||
                             (normalizedCurrency.includes('usdt') && !normalizedCurrency.includes('trc'));
      
      if (!isValidCurrency) {
        console.error('Invalid payment currency:', payCurrency);
        return new Response(
          JSON.stringify({
            error: 'Invalid payment currency',
            expected: 'USDT ETH (ERC20)',
            received: payCurrency,
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Verify amount
      const expectedAmount = parseFloat(order.usdt_amount.toString());
      const variance = Math.abs(actuallyPaid - expectedAmount) / expectedAmount;

      if (variance > 0.05) {
        console.error('Payment amount mismatch');
        return new Response(
          JSON.stringify({
            error: 'Payment amount mismatch',
            expected: expectedAmount,
            actual: actuallyPaid,
            variance: variance * 100 + '%',
          }),
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
        console.error('User not found:', order.user_id);
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

      // Calculate yield rate
      const yieldRatePerHour = mxiAmount * 0.00005;
      const yieldRatePerMinute = yieldRatePerHour / 60;
      const newYieldRate = parseFloat(user.yield_rate_per_minute?.toString() || '0') + yieldRatePerMinute;

      console.log('Updating user balances...');

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

      // Process referral commissions
      if (user.referred_by) {
        console.log('Processing referral commissions...');
        const commissionRates = [0.05, 0.02, 0.01];
        let currentReferrer = user.referred_by;

        for (let level = 1; level <= 3 && currentReferrer; level++) {
          const { data: referrer } = await supabaseClient
            .from('users')
            .select('id, referred_by, mxi_balance, mxi_from_unified_commissions, yield_rate_per_minute')
            .eq('id', currentReferrer)
            .single();

          if (referrer) {
            const commissionAmount = mxiAmount * commissionRates[level - 1];

            const newReferrerBalance = parseFloat(referrer.mxi_balance.toString()) + commissionAmount;
            const newCommissionBalance =
              parseFloat(referrer.mxi_from_unified_commissions?.toString() || '0') + commissionAmount;

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

            await supabaseClient.from('commissions').insert({
              user_id: referrer.id,
              from_user_id: order.user_id,
              level: level,
              amount: commissionAmount,
              percentage: commissionRates[level - 1] * 100,
              status: 'available',
            });

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

      // Update transaction history
      await supabaseClient
        .from('transaction_history')
        .update({
          status: 'finished',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('order_id', orderId);

      console.log('✅ Payment processed successfully');

      return new Response(
        JSON.stringify({
          success: true,
          status: 'confirmed',
          message: 'Payment confirmed and processed',
          mxi_credited: mxiAmount,
          usdt_amount: usdtAmount,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Payment not yet finished
    return new Response(
      JSON.stringify({
        success: true,
        status: paymentStatus,
        message: 'Payment status updated',
        order: order,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in check-nowpayments-status:', error);
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
