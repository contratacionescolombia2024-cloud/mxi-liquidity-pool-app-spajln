
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
      console.error('Missing order_id parameter');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'order_id parameter is required' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Checking status for order:', orderId);

    // Create Supabase client with service role for full access
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // First, try to get from payment_intents table
    const { data: paymentIntent, error: intentError } = await supabaseClient
      .from('payment_intents')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (intentError && intentError.code !== 'PGRST116') {
      console.error('Error fetching payment intent:', intentError);
    }

    // Also try to get from nowpayments_orders table for backward compatibility
    const { data: order, error: orderError } = await supabaseClient
      .from('nowpayments_orders')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (orderError && orderError.code !== 'PGRST116') {
      console.error('Error fetching order:', orderError);
    }

    // Use whichever record we found
    const record = paymentIntent || order;

    if (!record) {
      console.error('Order not found in either table:', orderId);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Order not found',
          message: 'No se encontró la orden. Por favor verifica el ID de la orden.' 
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Record found:', record);

    // If already confirmed, return success
    if (record.status === 'confirmed' || record.status === 'finished') {
      console.log('Payment already confirmed');
      return new Response(
        JSON.stringify({
          success: true,
          status: record.status,
          message: 'Payment already confirmed',
          mxi_credited: record.mxi_amount,
          usdt_amount: record.usdt_amount || record.price_amount,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if we have a payment_id to query NowPayments
    if (!record.payment_id) {
      console.error('No payment_id found for order:', orderId);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Payment ID not found',
          message: 'El ID de pago no está disponible. Es posible que la creación del pago haya fallado.',
          status: record.status,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get NowPayments API key
    const nowpaymentsApiKey = Deno.env.get('NOWPAYMENTS_API_KEY');
    
    if (!nowpaymentsApiKey) {
      console.error('NOWPAYMENTS_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Server configuration error',
          message: 'Error de configuración del servidor. Por favor contacta al soporte.' 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check payment status with NowPayments API
    console.log('Checking payment status with NowPayments API...');
    console.log('Payment ID:', record.payment_id);

    let nowpaymentsResponse;
    try {
      nowpaymentsResponse = await fetch(
        `https://api.nowpayments.io/v1/payment/${record.payment_id}`,
        {
          method: 'GET',
          headers: {
            'x-api-key': nowpaymentsApiKey,
          },
        }
      );
    } catch (fetchError: any) {
      console.error('Network error calling NowPayments API:', fetchError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Network error',
          message: 'Error de red al conectar con NowPayments. Por favor intenta nuevamente.',
          details: fetchError.message,
          current_status: record.status,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!nowpaymentsResponse.ok) {
      const errorText = await nowpaymentsResponse.text();
      console.error('NowPayments API error:', errorText);
      console.error('Status code:', nowpaymentsResponse.status);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to check payment status with NowPayments',
          message: `Error al verificar el estado del pago (código ${nowpaymentsResponse.status}). Por favor intenta nuevamente.`,
          details: errorText,
          current_status: record.status,
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

    // Update both tables with latest status
    if (paymentIntent) {
      await supabaseClient
        .from('payment_intents')
        .update({
          status: paymentStatus,
          pay_amount: actuallyPaid,
          updated_at: new Date().toISOString(),
        })
        .eq('order_id', orderId);
    }

    if (order) {
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
    }

    // Update transaction history
    await supabaseClient
      .from('transaction_history')
      .update({
        status: paymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', orderId);

    // If payment is finished or confirmed, process it
    if (paymentStatus === 'finished' || paymentStatus === 'confirmed') {
      console.log('Payment is finished/confirmed, processing...');

      // Get user_id from the record
      const userId = record.user_id;

      // Get user data
      const { data: user, error: userError } = await supabaseClient
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        console.error('User not found:', userId);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'User not found',
            message: 'Usuario no encontrado. Por favor contacta al soporte.' 
          }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const mxiAmount = parseFloat(record.mxi_amount.toString());
      const usdtAmount = parseFloat((record.usdt_amount || record.price_amount).toString());

      // Get current phase and price from metrics
      const { data: metrics } = await supabaseClient
        .from('metrics')
        .select('*')
        .single();

      const currentPhase = record.phase || metrics?.current_phase || 1;

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
        .eq('id', userId);

      // Create contribution record
      await supabaseClient.from('contributions').insert({
        user_id: userId,
        usdt_amount: usdtAmount,
        mxi_amount: mxiAmount,
        transaction_type: 'initial',
        status: 'completed',
      });

      // Update metrics
      if (metrics) {
        const phaseField = `phase_${currentPhase}_tokens_sold`;
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
              from_user_id: userId,
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

      // Mark records as confirmed
      if (paymentIntent) {
        await supabaseClient
          .from('payment_intents')
          .update({
            status: 'confirmed',
            updated_at: new Date().toISOString(),
          })
          .eq('order_id', orderId);
      }

      if (order) {
        await supabaseClient
          .from('nowpayments_orders')
          .update({
            status: 'confirmed',
            confirmed_at: new Date().toISOString(),
          })
          .eq('order_id', orderId);
      }

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
        current_status: paymentStatus,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in check-nowpayments-status:', error);
    console.error('Error stack:', error.stack);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
        message: 'Error interno del servidor. Por favor intenta nuevamente o contacta al soporte.',
        details: error.stack,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
