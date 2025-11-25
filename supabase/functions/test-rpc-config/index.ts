
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const ethRpcUrl = Deno.env.get('ETH_RPC_URL');
    const bnbRpcUrl = Deno.env.get('BNB_RPC_URL');
    const polygonRpcUrl = Deno.env.get('POLYGON_RPC_URL');

    const config = {
      ETH_RPC_URL: {
        configured: !!ethRpcUrl,
        value: ethRpcUrl ? `${ethRpcUrl.substring(0, 30)}...` : 'NOT SET',
        status: ethRpcUrl ? '✅ Configured' : '❌ Missing'
      },
      BNB_RPC_URL: {
        configured: !!bnbRpcUrl,
        value: bnbRpcUrl ? `${bnbRpcUrl.substring(0, 30)}...` : 'NOT SET',
        status: bnbRpcUrl ? '✅ Configured' : '❌ Missing'
      },
      POLYGON_RPC_URL: {
        configured: !!polygonRpcUrl,
        value: polygonRpcUrl ? `${polygonRpcUrl.substring(0, 30)}...` : 'NOT SET',
        status: polygonRpcUrl ? '✅ Configured' : '❌ Missing'
      }
    };

    const allConfigured = ethRpcUrl && bnbRpcUrl && polygonRpcUrl;

    return new Response(
      JSON.stringify({
        ok: allConfigured,
        message: allConfigured 
          ? 'All RPC URLs are configured correctly' 
          : 'Some RPC URLs are missing. Please configure them in Supabase Edge Functions secrets.',
        config,
        instructions: {
          step1: 'Go to Supabase Dashboard → Your Project → Settings → Edge Functions',
          step2: 'Click on "Manage secrets"',
          step3: 'Add the following secrets:',
          secrets: [
            'ETH_RPC_URL (e.g., https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY)',
            'BNB_RPC_URL (e.g., https://bsc-dataseed.binance.org/)',
            'POLYGON_RPC_URL (e.g., https://polygon-rpc.com/)'
          ]
        }
      }, null, 2),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'internal_error',
        message: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
