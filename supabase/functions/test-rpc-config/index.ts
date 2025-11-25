
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
    console.log('[TEST-RPC-CONFIG] Starting configuration test...');
    
    const ethRpcUrl = Deno.env.get('ETH_RPC_URL');
    const bnbRpcUrl = Deno.env.get('BNB_RPC_URL');
    const polygonRpcUrl = Deno.env.get('POLYGON_RPC_URL');

    console.log('[TEST-RPC-CONFIG] ETH_RPC_URL:', ethRpcUrl ? 'SET' : 'NOT SET');
    console.log('[TEST-RPC-CONFIG] BNB_RPC_URL:', bnbRpcUrl ? 'SET' : 'NOT SET');
    console.log('[TEST-RPC-CONFIG] POLYGON_RPC_URL:', polygonRpcUrl ? 'SET' : 'NOT SET');

    const config = {
      ETH_RPC_URL: {
        configured: !!ethRpcUrl,
        value: ethRpcUrl ? `${ethRpcUrl.substring(0, Math.min(30, ethRpcUrl.length))}...` : 'NOT SET',
        status: ethRpcUrl ? '✅ Configured' : '❌ Missing'
      },
      BNB_RPC_URL: {
        configured: !!bnbRpcUrl,
        value: bnbRpcUrl ? `${bnbRpcUrl.substring(0, Math.min(30, bnbRpcUrl.length))}...` : 'NOT SET',
        status: bnbRpcUrl ? '✅ Configured' : '❌ Missing'
      },
      POLYGON_RPC_URL: {
        configured: !!polygonRpcUrl,
        value: polygonRpcUrl ? `${polygonRpcUrl.substring(0, Math.min(30, polygonRpcUrl.length))}...` : 'NOT SET',
        status: polygonRpcUrl ? '✅ Configured' : '❌ Missing'
      }
    };

    const allConfigured = ethRpcUrl && bnbRpcUrl && polygonRpcUrl;

    const response = {
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
          {
            name: 'ETH_RPC_URL',
            example: 'https://eth.llamarpc.com or https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY',
            required: true,
            configured: !!ethRpcUrl
          },
          {
            name: 'BNB_RPC_URL',
            example: 'https://bsc-dataseed.binance.org/',
            required: true,
            configured: !!bnbRpcUrl
          },
          {
            name: 'POLYGON_RPC_URL',
            example: 'https://polygon-rpc.com/',
            required: true,
            configured: !!polygonRpcUrl
          }
        ],
        recommendedProviders: {
          ethereum: [
            'Infura (https://infura.io) - Free tier available',
            'Alchemy (https://alchemy.com) - Free tier available',
            'LlamaRPC (https://eth.llamarpc.com) - Public, no signup'
          ],
          bnb: [
            'Binance Public RPC (https://bsc-dataseed.binance.org/) - Free'
          ],
          polygon: [
            'Polygon Public RPC (https://polygon-rpc.com/) - Free',
            'Alchemy (https://alchemy.com) - Free tier available'
          ]
        }
      }
    };

    console.log('[TEST-RPC-CONFIG] Response:', JSON.stringify(response, null, 2));

    return new Response(
      JSON.stringify(response, null, 2),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error('[TEST-RPC-CONFIG] Error:', error);
    console.error('[TEST-RPC-CONFIG] Error message:', error.message);
    console.error('[TEST-RPC-CONFIG] Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'internal_error',
        message: error.message || 'Unknown error occurred',
        details: {
          errorType: error.name,
          errorMessage: error.message,
          timestamp: new Date().toISOString()
        }
      }, null, 2),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
