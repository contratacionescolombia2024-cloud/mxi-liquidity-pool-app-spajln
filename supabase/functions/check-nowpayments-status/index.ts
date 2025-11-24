
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

    // Get order from transaction_history table
    const { data: transaction, error: transactionError } = await supabaseClient
      .from('transaction_history')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (transactionError) {
      console.error('Error fetching transaction:', transactionError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Transaction not found',
          message: 'No se encontró la transacción. Por favor verifica el ID de la orden.',
          details: transactionError.message
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!transaction) {
      console.error('Transaction not found:', orderId);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Transaction not found',
          message: 'No se encontró la transacción. Por favor verifica el ID de la orden.' 
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Transaction found:', transaction);

    // If already confirmed, return success
    if (transaction.status === 'confirmed' || transaction.status === 'finished') {
      console.log('Payment already confirmed');
      return new Response(
        JSON.stringify({
          success: true,
          status: transaction.status,
          message: 'Payment already confirmed',
          mxi_credited: transaction.mxi_amount,
          usdt_amount: transaction.usdt_amount,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if we have a payment_id to query NowPayments
    if (!transaction.payment_id) {
      console.error('No payment_id found for transaction:', orderId);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Payment ID not found',
          message: 'El ID de pago no está disponible. Es posible que la creación del pago haya fallado.',
          status: transaction.status,
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
    console.log('Payment ID:', transaction.payment_id);

    let nowpaymentsResponse;
    try {
      nowpaymentsResponse = await fetch(
        `https://api.nowpayments.io/v1/payment/${transaction.payment_id}`,
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
          current_status: transaction.status,
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
          current_status: transaction.status,
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

    // Update transaction history with latest status
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

      // Get user_id from the transaction
      const userId = transaction.user_id;

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

      const mxiAmount = parseFloat(transaction.mxi_amount.toString());
      const usdtAmount = parseFloat(transaction.usdt_amount.toString());

      // Get current phase and price from metrics
      const { data: metrics } = await supabaseClient
        .from('metrics')
        .select('*')
        .single();

      const currentPhase = transaction.metadata?.phase || metrics?.current_phase || 1;

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

      // Update transaction history as finished
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
