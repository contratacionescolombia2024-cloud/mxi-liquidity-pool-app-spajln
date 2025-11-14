
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Binance API configuration
const BINANCE_API_URL = 'https://api.binance.com';
const BINANCE_API_KEY = Deno.env.get('BINANCE_API_KEY') || '';
const BINANCE_API_SECRET = Deno.env.get('BINANCE_API_SECRET') || '';
const BINANCE_WALLET_ADDRESS = Deno.env.get('BINANCE_WALLET_ADDRESS') || '';

// Helper function to create HMAC SHA256 signature for Binance API
async function createSignature(queryString: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(BINANCE_API_SECRET);
  const messageData = encoder.encode(queryString);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Verify transaction on Binance blockchain
async function verifyBinanceTransaction(txId: string, expectedAmount: number, walletAddress: string): Promise<{
  verified: boolean;
  amount?: number;
  status?: string;
  error?: string;
}> {
  try {
    // If no API credentials, use manual verification mode
    if (!BINANCE_API_KEY || !BINANCE_API_SECRET) {
      console.log('Binance API credentials not configured, using manual verification mode');
      return {
        verified: false,
        error: 'Manual verification required - Binance API not configured',
      };
    }

    // Build query parameters
    const timestamp = Date.now();
    const queryString = `timestamp=${timestamp}`;
    const signature = await createSignature(queryString);

    // Call Binance API to get deposit history
    const response = await fetch(
      `${BINANCE_API_URL}/sapi/v1/capital/deposit/hisrec?${queryString}&signature=${signature}`,
      {
        method: 'GET',
        headers: {
          'X-MBX-APIKEY': BINANCE_API_KEY,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Binance API error:', errorData);
      return {
        verified: false,
        error: `Binance API error: ${errorData.msg || 'Unknown error'}`,
      };
    }

    const deposits = await response.json();

    // Find matching transaction
    const matchingDeposit = deposits.find((deposit: any) => 
      deposit.txId === txId && 
      deposit.address === walletAddress &&
      deposit.coin === 'USDT' &&
      deposit.status === 1 // 1 = success
    );

    if (matchingDeposit) {
      const amount = parseFloat(matchingDeposit.amount);
      
      // Verify amount matches (allow 1% tolerance for fees)
      const tolerance = expectedAmount * 0.01;
      const amountMatches = Math.abs(amount - expectedAmount) <= tolerance;

      if (amountMatches) {
        return {
          verified: true,
          amount: amount,
          status: 'confirmed',
        };
      } else {
        return {
          verified: false,
          error: `Amount mismatch: expected ${expectedAmount} USDT, received ${amount} USDT`,
        };
      }
    }

    return {
      verified: false,
      error: 'Transaction not found or not yet confirmed on Binance',
    };
  } catch (error) {
    console.error('Error verifying Binance transaction:', error);
    return {
      verified: false,
      error: `Verification error: ${error.message}`,
    };
  }
}

// Process referral commissions
async function processReferralCommissions(
  supabaseClient: any,
  userId: string,
  usdtAmount: number
) {
  try {
    // Get user's referrer
    const { data: user } = await supabaseClient
      .from('users')
      .select('referred_by')
      .eq('id', userId)
      .single();

    if (!user?.referred_by) {
      console.log('User has no referrer, skipping commission processing');
      return;
    }

    // Commission rates by level - UPDATED: Level 1 is now 5%
    const commissionRates = [0.05, 0.02, 0.01]; // 5%, 2%, 1%
    let currentReferrerId = user.referred_by;

    for (let level = 0; level < 3 && currentReferrerId; level++) {
      const commissionAmount = usdtAmount * commissionRates[level];

      // Create commission record
      await supabaseClient.from('commissions').insert({
        user_id: currentReferrerId,
        from_user_id: userId,
        level: level + 1,
        amount: commissionAmount,
        percentage: commissionRates[level] * 100,
        status: 'pending',
      });

      // Update referrer's commission totals
      const { data: referrer } = await supabaseClient
        .from('users')
        .select('id, referred_by')
        .eq('id', currentReferrerId)
        .single();

      if (referrer) {
        currentReferrerId = referrer.referred_by;
      } else {
        break;
      }
    }

    console.log('Referral commissions processed successfully');
  } catch (error) {
    console.error('Error processing referral commissions:', error);
    // Don't throw - commissions can be processed later if needed
  }
}

// Calculate yield rate based on investment amount - UPDATED: Starts at 20 USDT
function calculateYieldRate(investment: number): number {
  if (investment >= 20 && investment < 500) return 0.000347222;
  if (investment >= 500 && investment < 1000) return 0.000694444;
  if (investment >= 1000 && investment < 5000) return 0.001388889;
  if (investment >= 5000 && investment < 10000) return 0.002777778;
  if (investment >= 10000 && investment < 50000) return 0.005555556;
  if (investment >= 50000 && investment < 100000) return 0.011111111;
  if (investment >= 100000) return 0.022222222;
  return 0;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { paymentId, action, transactionId } = await req.json();

    if (!paymentId) {
      return new Response(
        JSON.stringify({ error: 'Payment ID is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get payment from database
    const { data: payment, error: paymentError } = await supabaseClient
      .from('binance_payments')
      .select('*')
      .eq('payment_id', paymentId)
      .single();

    if (paymentError || !payment) {
      return new Response(
        JSON.stringify({ error: 'Payment not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if payment is already confirmed
    if (payment.status === 'confirmed') {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Payment already confirmed',
          payment,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if payment has expired
    const expiresAt = new Date(payment.expires_at);
    if (expiresAt < new Date() && payment.status !== 'confirmed') {
      await supabaseClient
        .from('binance_payments')
        .update({
          status: 'expired',
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.id);

      return new Response(
        JSON.stringify({ error: 'Payment has expired' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Handle automatic verification with transaction ID
    if (action === 'verify' && transactionId) {
      console.log(`Verifying payment ${paymentId} with transaction ID ${transactionId}`);

      // Update payment with transaction ID
      await supabaseClient
        .from('binance_payments')
        .update({
          binance_transaction_id: transactionId,
          status: 'confirming',
          verification_attempts: (payment.verification_attempts || 0) + 1,
          last_verification_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.id);

      // Verify transaction on Binance
      const verificationResult = await verifyBinanceTransaction(
        transactionId,
        parseFloat(payment.usdt_amount),
        payment.payment_address || BINANCE_WALLET_ADDRESS
      );

      if (verificationResult.verified) {
        // Payment verified successfully - process it automatically
        console.log('Payment verified successfully, processing...');

        // Update payment status to confirmed
        await supabaseClient
          .from('binance_payments')
          .update({
            status: 'confirmed',
            confirmed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', payment.id);

        // Get user data
        const { data: user, error: userError } = await supabaseClient
          .from('users')
          .select('mxi_balance, usdt_contributed, mxi_purchased_directly, yield_rate_per_minute')
          .eq('id', payment.user_id)
          .single();

        if (userError) {
          throw userError;
        }

        // Calculate new balances
        const newMxiBalance = parseFloat(user.mxi_balance || '0') + parseFloat(payment.mxi_amount);
        const newUsdtContributed = parseFloat(user.usdt_contributed || '0') + parseFloat(payment.usdt_amount);
        const newMxiPurchased = parseFloat(user.mxi_purchased_directly || '0') + parseFloat(payment.mxi_amount);
        
        // Calculate yield rate
        const yieldRate = calculateYieldRate(newUsdtContributed);

        // Update user balances and status
        await supabaseClient
          .from('users')
          .update({
            mxi_balance: newMxiBalance,
            usdt_contributed: newUsdtContributed,
            mxi_purchased_directly: newMxiPurchased,
            is_active_contributor: true,
            yield_rate_per_minute: yieldRate,
            last_yield_update: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', payment.user_id);

        // Process referral commissions
        await processReferralCommissions(
          supabaseClient,
          payment.user_id,
          parseFloat(payment.usdt_amount)
        );

        // Update global metrics
        const { data: metrics } = await supabaseClient
          .from('metrics')
          .select('*')
          .single();

        if (metrics) {
          const newTotalTokensSold = parseFloat(metrics.total_tokens_sold || '0') + parseFloat(payment.mxi_amount);
          const newTotalUsdt = parseFloat(metrics.total_usdt_contributed || '0') + parseFloat(payment.usdt_amount);
          const newTotalMxi = parseFloat(metrics.total_mxi_distributed || '0') + parseFloat(payment.mxi_amount);

          await supabaseClient
            .from('metrics')
            .update({
              total_tokens_sold: newTotalTokensSold,
              total_usdt_contributed: newTotalUsdt,
              total_mxi_distributed: newTotalMxi,
              updated_at: new Date().toISOString(),
            })
            .eq('id', metrics.id);
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Payment verified and confirmed automatically!',
            status: 'confirmed',
            newBalance: newMxiBalance,
            yieldRate: yieldRate,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      } else {
        // Verification failed - keep in confirming status for manual review
        console.log('Automatic verification failed:', verificationResult.error);

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Payment submitted for manual verification. An administrator will review it shortly.',
            status: 'confirming',
            verificationError: verificationResult.error,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Handle manual admin confirmation
    if (action === 'confirm') {
      console.log(`Admin confirming payment ${paymentId}`);

      // Update payment status
      await supabaseClient
        .from('binance_payments')
        .update({
          status: 'confirmed',
          confirmed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.id);

      // Get user data
      const { data: user, error: userError } = await supabaseClient
        .from('users')
        .select('mxi_balance, usdt_contributed, mxi_purchased_directly')
        .eq('id', payment.user_id)
        .single();

      if (userError) {
        throw userError;
      }

      // Calculate new balances
      const newMxiBalance = parseFloat(user.mxi_balance || '0') + parseFloat(payment.mxi_amount);
      const newUsdtContributed = parseFloat(user.usdt_contributed || '0') + parseFloat(payment.usdt_amount);
      const newMxiPurchased = parseFloat(user.mxi_purchased_directly || '0') + parseFloat(payment.mxi_amount);
      
      // Calculate yield rate
      const yieldRate = calculateYieldRate(newUsdtContributed);

      // Update user balances
      await supabaseClient
        .from('users')
        .update({
          mxi_balance: newMxiBalance,
          usdt_contributed: newUsdtContributed,
          mxi_purchased_directly: newMxiPurchased,
          is_active_contributor: true,
          yield_rate_per_minute: yieldRate,
          last_yield_update: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.user_id);

      // Process referral commissions
      await processReferralCommissions(
        supabaseClient,
        payment.user_id,
        parseFloat(payment.usdt_amount)
      );

      // Update metrics
      const { data: metrics } = await supabaseClient
        .from('metrics')
        .select('*')
        .single();

      if (metrics) {
        const newTotalTokensSold = parseFloat(metrics.total_tokens_sold || '0') + parseFloat(payment.mxi_amount);
        const newTotalUsdt = parseFloat(metrics.total_usdt_contributed || '0') + parseFloat(payment.usdt_amount);
        const newTotalMxi = parseFloat(metrics.total_mxi_distributed || '0') + parseFloat(payment.mxi_amount);

        await supabaseClient
          .from('metrics')
          .update({
            total_tokens_sold: newTotalTokensSold,
            total_usdt_contributed: newTotalUsdt,
            total_mxi_distributed: newTotalMxi,
            updated_at: new Date().toISOString(),
          })
          .eq('id', metrics.id);
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Payment confirmed successfully',
          newBalance: newMxiBalance,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Handle admin rejection
    if (action === 'reject') {
      console.log(`Admin rejecting payment ${paymentId}`);

      await supabaseClient
        .from('binance_payments')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.id);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Payment rejected',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
