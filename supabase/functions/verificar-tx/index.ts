
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { ethers } from 'npm:ethers@6.13.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// Network configurations
const NETWORKS = {
  ethereum: {
    name: 'Ethereum (ERC20)',
    rpcUrl: Deno.env.get('ETH_RPC_URL'),
    usdtContract: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6,
    chainId: 1
  },
  bnb: {
    name: 'BNB Chain (BEP20)',
    rpcUrl: Deno.env.get('BNB_RPC_URL') || 'https://bsc-dataseed1.binance.org',
    usdtContract: '0x55d398326f99059fF775485246999027B3197955',
    decimals: 18,
    chainId: 56
  },
  polygon: {
    name: 'Polygon (Matic)',
    rpcUrl: Deno.env.get('POLYGON_RPC_URL') || 'https://polygon-rpc.com',
    usdtContract: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    decimals: 6,
    chainId: 137
  }
};

// Recipient Address (same for all networks)
const RECIPIENT_ADDRESS = '0x68F0d7c607617DA0b1a0dC7b72885E11ddFec623';

// Minimum USDT amount
const MIN_USDT = 20;

// MXI conversion rate
const MXI_RATE = 2.5;

// Required confirmations
const REQUIRED_CONFIRMATIONS = 3;

// USDT Transfer event signature
const TRANSFER_EVENT_SIGNATURE = 'Transfer(address,address,uint256)';
const TRANSFER_TOPIC = ethers.id(TRANSFER_EVENT_SIGNATURE);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID().substring(0, 8);
  console.log(`\n[${requestId}] ========== VERIFICAR TX ==========`);
  console.log(`[${requestId}] Timestamp:`, new Date().toISOString());

  try {
    // Get Supabase credentials
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error(`[${requestId}] ERROR: Supabase credentials not configured`);
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'supabase_not_configured',
          message: 'Supabase credentials not configured'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'no_auth',
          message: 'No authorization header'
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: {
        headers: { Authorization: authHeader }
      }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error(`[${requestId}] ERROR: Invalid user session:`, userError);
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'invalid_session',
          message: 'Invalid user session'
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`[${requestId}] User authenticated: ${user.id}`);

    // Parse request body
    const body = await req.json();
    const { txHash, userId, network = 'ethereum' } = body;

    if (!txHash || !userId) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'missing_fields',
          message: 'txHash and userId are required'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (userId !== user.id) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'unauthorized',
          message: 'User ID mismatch'
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate network
    const networkConfig = NETWORKS[network];
    if (!networkConfig) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'invalid_network',
          message: `Red no soportada. Redes válidas: ${Object.keys(NETWORKS).join(', ')}`
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!networkConfig.rpcUrl) {
      console.error(`[${requestId}] ERROR: RPC URL not configured for ${network}`);
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'rpc_not_configured',
          message: `RPC URL no configurado para ${networkConfig.name}`
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`[${requestId}] Network: ${networkConfig.name}`);
    console.log(`[${requestId}] TxHash: ${txHash}`);

    // Check if transaction already processed (idempotency)
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('*')
      .eq('tx_hash', txHash)
      .single();

    if (existingPayment) {
      console.log(`[${requestId}] Transaction already processed`);
      return new Response(
        JSON.stringify({
          ok: false,
          estado: 'ya_procesado',
          message: 'Esta transacción ya ha sido procesada',
          usdt: parseFloat(existingPayment.usdt || 0),
          mxi: parseFloat(existingPayment.mxi || 0),
          txHash: txHash,
          network: network
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Connect to blockchain RPC
    console.log(`[${requestId}] Connecting to ${networkConfig.name} RPC...`);
    const provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);

    // Get transaction receipt
    console.log(`[${requestId}] Getting transaction receipt...`);
    const receipt = await provider.getTransactionReceipt(txHash);

    if (!receipt) {
      console.log(`[${requestId}] Transaction not found`);
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'tx_not_found',
          message: 'Transacción no encontrada en la blockchain'
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`[${requestId}] Receipt status: ${receipt.status}`);

    // Check if transaction was successful
    if (receipt.status !== 1) {
      console.log(`[${requestId}] Transaction failed`);
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'tx_failed',
          message: 'La transacción falló en la blockchain'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check confirmations
    const currentBlock = await provider.getBlockNumber();
    const confirmations = currentBlock - receipt.blockNumber;
    console.log(`[${requestId}] Confirmations: ${confirmations}`);

    if (confirmations < REQUIRED_CONFIRMATIONS) {
      console.log(`[${requestId}] Insufficient confirmations`);
      return new Response(
        JSON.stringify({
          ok: false,
          estado: 'pocas_confirmaciones',
          message: `La transacción tiene ${confirmations} confirmaciones. Se requieren ${REQUIRED_CONFIRMATIONS}. Por favor intenta más tarde.`,
          confirmations,
          required: REQUIRED_CONFIRMATIONS
        }),
        {
          status: 202,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Find Transfer event in logs
    console.log(`[${requestId}] Scanning logs for Transfer event...`);
    let transferLog = null;
    let usdtAmount = 0;

    for (const log of receipt.logs) {
      // Check if this is a Transfer event from USDT contract
      if (
        log.address.toLowerCase() === networkConfig.usdtContract.toLowerCase() &&
        log.topics[0] === TRANSFER_TOPIC
      ) {
        // Decode the Transfer event
        const from = ethers.getAddress('0x' + log.topics[1].slice(26));
        const to = ethers.getAddress('0x' + log.topics[2].slice(26));
        const value = BigInt(log.data);

        console.log(`[${requestId}] Transfer found: from=${from}, to=${to}, value=${value}`);

        // Check if transfer is to our recipient address
        if (to.toLowerCase() === RECIPIENT_ADDRESS.toLowerCase()) {
          transferLog = { from, to, value };
          
          // Convert based on network decimals
          usdtAmount = Number(value) / Math.pow(10, networkConfig.decimals);
          console.log(`[${requestId}] USDT amount: ${usdtAmount}`);
          break;
        }
      }
    }

    if (!transferLog) {
      console.log(`[${requestId}] No valid Transfer event found`);
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'no_transfer_found',
          message: 'No se encontró una transferencia USDT válida a la dirección receptora'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check minimum amount
    if (usdtAmount < MIN_USDT) {
      console.log(`[${requestId}] Amount insufficient: ${usdtAmount} < ${MIN_USDT}`);
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'monto_insuficiente',
          message: `El monto mínimo es ${MIN_USDT} USDT. Recibido: ${usdtAmount} USDT`,
          usdt: usdtAmount,
          minimum: MIN_USDT
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Calculate MXI
    const mxiAmount = usdtAmount * MXI_RATE;
    console.log(`[${requestId}] MXI to credit: ${mxiAmount}`);

    // Determine pay_currency based on network
    const payCurrency = network === 'ethereum' ? 'usdterc20' : 
                       network === 'bnb' ? 'usdtbep20' : 
                       'usdtmatic';

    // Insert payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        tx_hash: txHash,
        user_id: userId,
        usdt: usdtAmount,
        mxi: mxiAmount,
        estado: 'confirmado',
        status: 'confirmed',
        price_amount: usdtAmount,
        mxi_amount: mxiAmount,
        pay_currency: payCurrency,
        order_id: `TX-${network.toUpperCase()}-${txHash.substring(0, 12)}`
      })
      .select()
      .single();

    if (paymentError) {
      console.error(`[${requestId}] ERROR: Failed to insert payment:`, paymentError);
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'database_error',
          message: 'Error al guardar el pago en la base de datos',
          details: paymentError.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`[${requestId}] Payment record created: ${payment.id}`);

    // Update user balance
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('saldo_mxi')
      .eq('id', userId)
      .single();

    if (userDataError) {
      console.error(`[${requestId}] ERROR: Failed to get user data:`, userDataError);
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'user_not_found',
          message: 'Usuario no encontrado'
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const currentSaldo = parseFloat(userData.saldo_mxi || 0);
    const newSaldo = currentSaldo + mxiAmount;

    const { error: updateError } = await supabase
      .from('users')
      .update({
        saldo_mxi: newSaldo,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error(`[${requestId}] ERROR: Failed to update user balance:`, updateError);
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'update_failed',
          message: 'Error al actualizar el saldo del usuario',
          details: updateError.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`[${requestId}] User balance updated: ${currentSaldo} -> ${newSaldo}`);
    console.log(`[${requestId}] ========== SUCCESS ==========\n`);

    return new Response(
      JSON.stringify({
        ok: true,
        usdt: usdtAmount,
        mxi: mxiAmount,
        txHash: txHash,
        network: networkConfig.name,
        message: `Pago confirmado en ${networkConfig.name}. Se acreditaron ${mxiAmount.toFixed(2)} MXI a tu cuenta.`
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error(`[${requestId}] ========== ERROR ==========`);
    console.error(`[${requestId}] Error:`, error);
    console.error(`[${requestId}] Stack:`, error.stack);

    return new Response(
      JSON.stringify({
        ok: false,
        error: 'internal_error',
        message: error.message || 'Error interno del servidor'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
