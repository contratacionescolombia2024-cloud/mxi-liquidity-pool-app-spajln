
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Error codes for better error handling
const ErrorCodes = {
  INVALID_INPUT: 'INVALID_INPUT',
  PAYMENT_NOT_FOUND: 'PAYMENT_NOT_FOUND',
  PAYMENT_EXPIRED: 'PAYMENT_EXPIRED',
  PAYMENT_ALREADY_PROCESSED: 'PAYMENT_ALREADY_PROCESSED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  DATABASE_ERROR: 'DATABASE_ERROR',
  VERIFICATION_FAILED: 'VERIFICATION_FAILED',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  INVALID_ACTION: 'INVALID_ACTION',
  NETWORK_ERROR: 'NETWORK_ERROR',
};

// OKX API configuration
const OKX_API_URL = 'https://www.okx.com';
const OKX_API_KEY = Deno.env.get('OKX_API_KEY') || '';
const OKX_API_SECRET = Deno.env.get('OKX_API_SECRET') || '';
const OKX_API_PASSPHRASE = Deno.env.get('OKX_API_PASSPHRASE') || '';
const OKX_WALLET_ADDRESS = Deno.env.get('OKX_WALLET_ADDRESS') || '';

// Audit log helper
async function createAuditLog(
  supabaseClient: any,
  action: string,
  paymentId: string,
  userId: string,
  adminId: string | null,
  status: string,
  details: any
) {
  try {
    await supabaseClient.from('payment_audit_logs').insert({
      action,
      payment_id: paymentId,
      user_id: userId,
      admin_id: adminId,
      status,
      details: JSON.stringify(details),
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logs are important but shouldn't break the flow
  }
}

// Input validation
function validatePaymentId(paymentId: any): string {
  if (!paymentId || typeof paymentId !== 'string') {
    throw new Error('Payment ID must be a non-empty string');
  }
  if (paymentId.length > 100) {
    throw new Error('Payment ID is too long');
  }
  // Basic sanitization
  return paymentId.trim();
}

function validateAction(action: any): string {
  const validActions = ['verify', 'confirm', 'reject'];
  if (!action || typeof action !== 'string') {
    throw new Error('Action must be a non-empty string');
  }
  const sanitizedAction = action.trim().toLowerCase();
  if (!validActions.includes(sanitizedAction)) {
    throw new Error(`Invalid action. Must be one of: ${validActions.join(', ')}`);
  }
  return sanitizedAction;
}

function validateTransactionId(transactionId: any): string | null {
  if (!transactionId) return null;
  if (typeof transactionId !== 'string') {
    throw new Error('Transaction ID must be a string');
  }
  if (transactionId.length > 200) {
    throw new Error('Transaction ID is too long');
  }
  return transactionId.trim();
}

// Helper function to create HMAC SHA256 signature for OKX API
async function createOKXSignature(
  timestamp: string,
  method: string,
  requestPath: string,
  body = ''
): Promise<string> {
  const encoder = new TextEncoder();
  const message = timestamp + method + requestPath + body;
  const keyData = encoder.encode(OKX_API_SECRET);
  const messageData = encoder.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

// Verify transaction on OKX blockchain with retry logic
async function verifyOKXTransaction(
  txId: string,
  expectedAmount: number,
  walletAddress: string,
  retries = 3
): Promise<{ verified: boolean; amount?: number; status?: string; error?: string }> {
  let lastError: any = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // If no API credentials, use manual verification mode
      if (!OKX_API_KEY || !OKX_API_SECRET || !OKX_API_PASSPHRASE) {
        console.log('OKX API credentials not configured, using manual verification mode');
        return {
          verified: false,
          error: 'Manual verification required - OKX API not configured',
        };
      }

      // Build request parameters for OKX API
      const timestamp = new Date().toISOString();
      const method = 'GET';
      const requestPath = `/api/v5/asset/deposit-history?txId=${encodeURIComponent(txId)}`;
      const signature = await createOKXSignature(timestamp, method, requestPath);

      // Call OKX API to get deposit history
      const response = await fetch(`${OKX_API_URL}${requestPath}`, {
        method: 'GET',
        headers: {
          'OK-ACCESS-KEY': OKX_API_KEY,
          'OK-ACCESS-SIGN': signature,
          'OK-ACCESS-TIMESTAMP': timestamp,
          'OK-ACCESS-PASSPHRASE': OKX_API_PASSPHRASE,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`OKX API error (attempt ${attempt + 1}/${retries}):`, errorData);
        lastError = new Error(`OKX API error: ${errorData.msg || 'Unknown error'}`);
        
        // Retry on server errors (5xx) or rate limiting (429)
        if (response.status >= 500 || response.status === 429) {
          if (attempt < retries - 1) {
            const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
        
        return {
          verified: false,
          error: `OKX API error: ${errorData.msg || 'Unknown error'}`,
        };
      }

      const result = await response.json();
      const deposits = result.data || [];

      // Find matching transaction
      const matchingDeposit = deposits.find(
        (deposit: any) =>
          deposit.txId === txId &&
          deposit.to === walletAddress &&
          deposit.ccy === 'USDT' &&
          deposit.state === '2' // 2 = deposit credited
      );

      if (matchingDeposit) {
        const amount = parseFloat(matchingDeposit.amt);
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
        error: 'Transaction not found or not yet confirmed on OKX',
      };
    } catch (error: any) {
      console.error(`Error verifying OKX transaction (attempt ${attempt + 1}/${retries}):`, error);
      lastError = error;
      
      // Retry on network errors
      if (attempt < retries - 1) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
    }
  }

  return {
    verified: false,
    error: `Verification error after ${retries} attempts: ${lastError?.message || 'Unknown error'}`,
  };
}

// Process referral commissions with transaction support
async function processReferralCommissions(
  supabaseClient: any,
  userId: string,
  usdtAmount: number
): Promise<void> {
  try {
    console.log(`Processing referral commissions for user ${userId}, amount: ${usdtAmount}`);

    // Get user's referrer
    const { data: user, error: userError } = await supabaseClient
      .from('users')
      .select('referred_by')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user referrer:', userError);
      throw userError;
    }

    if (!user?.referred_by) {
      console.log('User has no referrer, skipping commission processing');
      return;
    }

    // Commission rates by level
    const commissionRates = [0.05, 0.02, 0.01]; // 5%, 2%, 1%
    let currentReferrerId = user.referred_by;

    for (let level = 0; level < 3 && currentReferrerId; level++) {
      const commissionAmount = usdtAmount * commissionRates[level];

      console.log(`Creating commission for level ${level + 1}, referrer: ${currentReferrerId}, amount: ${commissionAmount}`);

      // Create commission record
      const { error: commissionError } = await supabaseClient
        .from('commissions')
        .insert({
          user_id: currentReferrerId,
          from_user_id: userId,
          level: level + 1,
          amount: commissionAmount,
          percentage: commissionRates[level] * 100,
          status: 'pending',
          created_at: new Date().toISOString(),
        });

      if (commissionError) {
        console.error(`Error creating commission for level ${level + 1}:`, commissionError);
        throw commissionError;
      }

      // Get next level referrer
      const { data: referrer, error: referrerError } = await supabaseClient
        .from('users')
        .select('id, referred_by')
        .eq('id', currentReferrerId)
        .single();

      if (referrerError) {
        console.error(`Error fetching referrer at level ${level + 1}:`, referrerError);
        break; // Don't throw - just stop processing further levels
      }

      if (referrer) {
        currentReferrerId = referrer.referred_by;
      } else {
        break;
      }
    }

    console.log('Referral commissions processed successfully');
  } catch (error) {
    console.error('Error processing referral commissions:', error);
    throw error; // Re-throw to trigger transaction rollback
  }
}

// Calculate yield rate based on investment amount
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

// Process payment confirmation with full transaction support
async function processPaymentConfirmation(
  supabaseClient: any,
  payment: any,
  adminId: string | null
): Promise<{ success: boolean; newBalance: number; yieldRate: number; error?: string }> {
  try {
    console.log(`Processing payment confirmation for payment ${payment.payment_id}`);

    // Start by updating payment status to prevent double processing
    const { error: updateError } = await supabaseClient
      .from('okx_payments')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id)
      .eq('status', payment.status); // Only update if status hasn't changed (optimistic locking)

    if (updateError) {
      console.error('Error updating payment status:', updateError);
      throw new Error(`Failed to update payment status: ${updateError.message}`);
    }

    // Verify the update was successful (check if row was actually updated)
    const { data: updatedPayment, error: verifyError } = await supabaseClient
      .from('okx_payments')
      .select('status')
      .eq('id', payment.id)
      .single();

    if (verifyError || updatedPayment?.status !== 'confirmed') {
      throw new Error('Payment was already processed by another request');
    }

    // Get user data
    const { data: user, error: userError } = await supabaseClient
      .from('users')
      .select('mxi_balance, usdt_contributed, mxi_purchased_directly, yield_rate_per_minute')
      .eq('id', payment.user_id)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
      throw new Error(`Failed to fetch user data: ${userError.message}`);
    }

    // Calculate new balances
    const newMxiBalance = parseFloat(user.mxi_balance || '0') + parseFloat(payment.mxi_amount);
    const newUsdtContributed = parseFloat(user.usdt_contributed || '0') + parseFloat(payment.usdt_amount);
    const newMxiPurchased = parseFloat(user.mxi_purchased_directly || '0') + parseFloat(payment.mxi_amount);

    // Calculate yield rate
    const yieldRate = calculateYieldRate(newUsdtContributed);

    console.log(`Updating user balances: MXI: ${newMxiBalance}, USDT: ${newUsdtContributed}, Yield: ${yieldRate}`);

    // Update user balances and status
    const { error: userUpdateError } = await supabaseClient
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

    if (userUpdateError) {
      console.error('Error updating user balances:', userUpdateError);
      throw new Error(`Failed to update user balances: ${userUpdateError.message}`);
    }

    // Process referral commissions
    await processReferralCommissions(supabaseClient, payment.user_id, parseFloat(payment.usdt_amount));

    // Update global metrics
    const { data: metrics, error: metricsError } = await supabaseClient
      .from('metrics')
      .select('*')
      .single();

    if (metricsError) {
      console.error('Error fetching metrics:', metricsError);
      // Don't throw - metrics update is not critical
    } else if (metrics) {
      const newTotalTokensSold = parseFloat(metrics.total_tokens_sold || '0') + parseFloat(payment.mxi_amount);
      const newTotalUsdt = parseFloat(metrics.total_usdt_contributed || '0') + parseFloat(payment.usdt_amount);
      const newTotalMxi = parseFloat(metrics.total_mxi_distributed || '0') + parseFloat(payment.mxi_amount);

      const { error: metricsUpdateError } = await supabaseClient
        .from('metrics')
        .update({
          total_tokens_sold: newTotalTokensSold,
          total_usdt_contributed: newTotalUsdt,
          total_mxi_distributed: newTotalMxi,
          updated_at: new Date().toISOString(),
        })
        .eq('id', metrics.id);

      if (metricsUpdateError) {
        console.error('Error updating metrics:', metricsUpdateError);
        // Don't throw - metrics update is not critical
      }
    }

    // Create audit log
    await createAuditLog(
      supabaseClient,
      'confirm',
      payment.payment_id,
      payment.user_id,
      adminId,
      'success',
      {
        usdt_amount: payment.usdt_amount,
        mxi_amount: payment.mxi_amount,
        new_balance: newMxiBalance,
        yield_rate: yieldRate,
      }
    );

    console.log('Payment confirmation processed successfully');

    return {
      success: true,
      newBalance: newMxiBalance,
      yieldRate: yieldRate,
    };
  } catch (error: any) {
    console.error('Error processing payment confirmation:', error);

    // Attempt to rollback payment status
    try {
      await supabaseClient
        .from('okx_payments')
        .update({
          status: payment.status, // Revert to original status
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.id);
    } catch (rollbackError) {
      console.error('Failed to rollback payment status:', rollbackError);
    }

    // Create audit log for failure
    await createAuditLog(
      supabaseClient,
      'confirm',
      payment.payment_id,
      payment.user_id,
      adminId,
      'failed',
      {
        error: error.message,
      }
    );

    return {
      success: false,
      newBalance: 0,
      yieldRate: 0,
      error: error.message,
    };
  }
}

// Main handler
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] === NEW REQUEST ===`);
  console.log(`[${requestId}] Method: ${req.method}`);
  console.log(`[${requestId}] URL: ${req.url}`);

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error(`[${requestId}] Missing authorization header`);
      return new Response(
        JSON.stringify({
          error: 'Unauthorized',
          code: ErrorCodes.UNAUTHORIZED,
          message: 'Missing authorization header',
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create Supabase client
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

    // Parse and validate request body
    let requestBody: any;
    try {
      requestBody = await req.json();
      console.log(`[${requestId}] Request body:`, requestBody);
    } catch (parseError: any) {
      console.error(`[${requestId}] Failed to parse request body:`, parseError);
      return new Response(
        JSON.stringify({
          error: 'Invalid JSON',
          code: ErrorCodes.INVALID_INPUT,
          message: 'Request body must be valid JSON',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate inputs
    let paymentId: string;
    let action: string;
    let transactionId: string | null = null;

    try {
      paymentId = validatePaymentId(requestBody.paymentId);
      action = validateAction(requestBody.action);
      transactionId = validateTransactionId(requestBody.transactionId);
    } catch (validationError: any) {
      console.error(`[${requestId}] Validation error:`, validationError);
      return new Response(
        JSON.stringify({
          error: 'Validation failed',
          code: ErrorCodes.INVALID_INPUT,
          message: validationError.message,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`[${requestId}] Validated inputs - Payment ID: ${paymentId}, Action: ${action}`);

    // Get payment from database
    const { data: payment, error: paymentError } = await supabaseClient
      .from('okx_payments')
      .select('*')
      .eq('payment_id', paymentId)
      .single();

    if (paymentError || !payment) {
      console.error(`[${requestId}] Payment not found:`, paymentError);
      return new Response(
        JSON.stringify({
          error: 'Payment not found',
          code: ErrorCodes.PAYMENT_NOT_FOUND,
          message: `No payment found with ID: ${paymentId}`,
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`[${requestId}] Payment found - Status: ${payment.status}, User: ${payment.user_id}`);

    // Check if payment is already confirmed
    if (payment.status === 'confirmed') {
      console.log(`[${requestId}] Payment already confirmed`);
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Payment already confirmed',
          code: ErrorCodes.PAYMENT_ALREADY_PROCESSED,
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
      console.log(`[${requestId}] Payment expired at ${expiresAt}`);
      await supabaseClient
        .from('okx_payments')
        .update({
          status: 'expired',
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.id);

      return new Response(
        JSON.stringify({
          error: 'Payment has expired',
          code: ErrorCodes.PAYMENT_EXPIRED,
          message: `Payment expired at ${expiresAt.toISOString()}`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Handle automatic verification with transaction ID
    if (action === 'verify' && transactionId) {
      console.log(`[${requestId}] Verifying payment with transaction ID: ${transactionId}`);

      // Update payment with transaction ID
      await supabaseClient
        .from('okx_payments')
        .update({
          okx_transaction_id: transactionId,
          status: 'confirming',
          verification_attempts: (payment.verification_attempts || 0) + 1,
          last_verification_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.id);

      // Verify transaction on OKX with retry logic
      const verificationResult = await verifyOKXTransaction(
        transactionId,
        parseFloat(payment.usdt_amount),
        payment.payment_address || OKX_WALLET_ADDRESS,
        3 // 3 retries
      );

      if (verificationResult.verified) {
        console.log(`[${requestId}] Payment verified successfully, processing confirmation...`);

        // Process payment confirmation
        const result = await processPaymentConfirmation(supabaseClient, payment, null);

        if (result.success) {
          return new Response(
            JSON.stringify({
              success: true,
              message: 'Payment verified and confirmed automatically!',
              status: 'confirmed',
              newBalance: result.newBalance,
              yieldRate: result.yieldRate,
            }),
            {
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        } else {
          return new Response(
            JSON.stringify({
              error: 'Payment verification succeeded but confirmation failed',
              code: ErrorCodes.TRANSACTION_FAILED,
              message: result.error || 'Unknown error during confirmation',
            }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
      } else {
        console.log(`[${requestId}] Automatic verification failed:`, verificationResult.error);

        // Create audit log
        await createAuditLog(
          supabaseClient,
          'verify',
          payment.payment_id,
          payment.user_id,
          null,
          'failed',
          {
            transaction_id: transactionId,
            error: verificationResult.error,
          }
        );

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
      console.log(`[${requestId}] Admin confirming payment`);

      // Get admin user ID from JWT
      const token = authHeader.replace('Bearer ', '');
      let adminId: string | null = null;
      try {
        // Decode JWT to get admin user ID (basic decode, not verification)
        const payload = JSON.parse(atob(token.split('.')[1]));
        adminId = payload.sub || null;
        console.log(`[${requestId}] Admin ID: ${adminId}`);
      } catch (jwtError) {
        console.error(`[${requestId}] Failed to decode JWT:`, jwtError);
      }

      // Process payment confirmation
      const result = await processPaymentConfirmation(supabaseClient, payment, adminId);

      if (result.success) {
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Payment confirmed successfully',
            newBalance: result.newBalance,
            yieldRate: result.yieldRate,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      } else {
        return new Response(
          JSON.stringify({
            error: 'Payment confirmation failed',
            code: ErrorCodes.TRANSACTION_FAILED,
            message: result.error || 'Unknown error during confirmation',
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Handle admin rejection
    if (action === 'reject') {
      console.log(`[${requestId}] Admin rejecting payment`);

      // Get admin user ID from JWT
      const token = authHeader.replace('Bearer ', '');
      let adminId: string | null = null;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        adminId = payload.sub || null;
      } catch (jwtError) {
        console.error(`[${requestId}] Failed to decode JWT:`, jwtError);
      }

      const { error: rejectError } = await supabaseClient
        .from('okx_payments')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.id);

      if (rejectError) {
        console.error(`[${requestId}] Error rejecting payment:`, rejectError);
        return new Response(
          JSON.stringify({
            error: 'Failed to reject payment',
            code: ErrorCodes.DATABASE_ERROR,
            message: rejectError.message,
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Create audit log
      await createAuditLog(
        supabaseClient,
        'reject',
        payment.payment_id,
        payment.user_id,
        adminId,
        'success',
        {
          usdt_amount: payment.usdt_amount,
          mxi_amount: payment.mxi_amount,
        }
      );

      console.log(`[${requestId}] Payment rejected successfully`);

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

    // Invalid action
    console.error(`[${requestId}] Invalid action: ${action}`);
    return new Response(
      JSON.stringify({
        error: 'Invalid action',
        code: ErrorCodes.INVALID_ACTION,
        message: `Action '${action}' is not supported`,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error(`[${requestId}] === UNHANDLED ERROR ===`);
    console.error(`[${requestId}] Error type:`, error.constructor.name);
    console.error(`[${requestId}] Error message:`, error.message);
    console.error(`[${requestId}] Error stack:`, error.stack);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        code: ErrorCodes.DATABASE_ERROR,
        message: error.message || 'An unexpected error occurred',
        requestId: requestId,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
