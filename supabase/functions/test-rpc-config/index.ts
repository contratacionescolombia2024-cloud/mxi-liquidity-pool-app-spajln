
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
    console.log('[TEST-RPC-CONFIG] Deno.env available:', typeof Deno.env);
    console.log('[TEST-RPC-CONFIG] Deno.env.get available:', typeof Deno.env?.get);
    
    // Safely get environment variables with error handling
    let ethRpcUrl: string | undefined;
    let bnbRpcUrl: string | undefined;
    let polygonRpcUrl: string | undefined;
    let alchemyApiKey: string | undefined;
    
    try {
      ethRpcUrl = Deno.env?.get('ETH_RPC_URL');
      console.log('[TEST-RPC-CONFIG] ETH_RPC_URL:', ethRpcUrl ? 'SET' : 'NOT SET');
    } catch (e) {
      console.error('[TEST-RPC-CONFIG] Error getting ETH_RPC_URL:', e);
    }
    
    try {
      bnbRpcUrl = Deno.env?.get('BNB_RPC_URL');
      console.log('[TEST-RPC-CONFIG] BNB_RPC_URL:', bnbRpcUrl ? 'SET' : 'NOT SET');
    } catch (e) {
      console.error('[TEST-RPC-CONFIG] Error getting BNB_RPC_URL:', e);
    }
    
    try {
      polygonRpcUrl = Deno.env?.get('POLYGON_RPC_URL');
      console.log('[TEST-RPC-CONFIG] POLYGON_RPC_URL:', polygonRpcUrl ? 'SET' : 'NOT SET');
    } catch (e) {
      console.error('[TEST-RPC-CONFIG] Error getting POLYGON_RPC_URL:', e);
    }

    try {
      alchemyApiKey = Deno.env?.get('ALCHEMY_API_KEY');
      console.log('[TEST-RPC-CONFIG] ALCHEMY_API_KEY:', alchemyApiKey ? 'SET' : 'NOT SET');
    } catch (e) {
      console.error('[TEST-RPC-CONFIG] Error getting ALCHEMY_API_KEY:', e);
    }

    // Check if Ethereum can use Alchemy
    const ethConfigured = !!ethRpcUrl || !!alchemyApiKey;
    const polygonConfigured = !!polygonRpcUrl || !!alchemyApiKey;
    const bnbConfigured = !!bnbRpcUrl; // BNB doesn't support Alchemy

    const config = {
      ALCHEMY_API_KEY: {
        configured: !!alchemyApiKey,
        value: alchemyApiKey ? `${alchemyApiKey.substring(0, 8)}...` : 'NOT SET',
        status: alchemyApiKey ? '✅ Configured' : '⚠️ Not Set',
        note: 'Can be used for Ethereum and Polygon networks'
      },
      ETH_RPC_URL: {
        configured: !!ethRpcUrl,
        value: ethRpcUrl ? `${ethRpcUrl.substring(0, Math.min(30, ethRpcUrl.length))}...` : 'NOT SET',
        status: ethConfigured ? '✅ Configured' : '❌ Missing',
        fallback: alchemyApiKey ? 'Will use ALCHEMY_API_KEY' : 'No fallback available'
      },
      BNB_RPC_URL: {
        configured: !!bnbRpcUrl,
        value: bnbRpcUrl ? `${bnbRpcUrl.substring(0, Math.min(30, bnbRpcUrl.length))}...` : 'NOT SET',
        status: bnbConfigured ? '✅ Configured' : '❌ Missing',
        fallback: 'No Alchemy support for BNB Chain'
      },
      POLYGON_RPC_URL: {
        configured: !!polygonRpcUrl,
        value: polygonRpcUrl ? `${polygonRpcUrl.substring(0, Math.min(30, polygonRpcUrl.length))}...` : 'NOT SET',
        status: polygonConfigured ? '✅ Configured' : '❌ Missing',
        fallback: alchemyApiKey ? 'Will use ALCHEMY_API_KEY' : 'No fallback available'
      }
    };

    const allConfigured = ethConfigured && bnbConfigured && polygonConfigured;

    const response = {
      ok: allConfigured,
      message: allConfigured 
        ? 'All networks are properly configured' 
        : 'Some networks are missing configuration. Please add the required secrets.',
      config,
      networkStatus: {
        ethereum: {
          ready: ethConfigured,
          method: ethRpcUrl ? 'Direct RPC URL' : alchemyApiKey ? 'Alchemy API' : 'Not configured'
        },
        bnb: {
          ready: bnbConfigured,
          method: bnbRpcUrl ? 'Direct RPC URL' : 'Not configured'
        },
        polygon: {
          ready: polygonConfigured,
          method: polygonRpcUrl ? 'Direct RPC URL' : alchemyApiKey ? 'Alchemy API' : 'Not configured'
        }
      },
      instructions: {
        quickStart: {
          title: '🚀 Quick Start with Alchemy (Recommended)',
          steps: [
            '1. Go to Supabase Dashboard → Your Project → Settings → Edge Functions',
            '2. Click on "Manage secrets"',
            '3. Add secret: ALCHEMY_API_KEY',
            '4. Value: Your Alchemy API key (e.g., -lEOTdd5GorChO7dTiJD9)',
            '5. This will enable Ethereum and Polygon networks automatically',
            '6. For BNB Chain, add BNB_RPC_URL: https://bsc-dataseed.binance.org/'
          ]
        },
        alternativeMethod: {
          title: '⚙️ Alternative: Configure Individual RPC URLs',
          secrets: [
            {
              name: 'ETH_RPC_URL',
              example: 'https://eth.llamarpc.com or https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY',
              required: !ethConfigured,
              configured: !!ethRpcUrl
            },
            {
              name: 'BNB_RPC_URL',
              example: 'https://bsc-dataseed.binance.org/',
              required: !bnbConfigured,
              configured: !!bnbRpcUrl
            },
            {
              name: 'POLYGON_RPC_URL',
              example: 'https://polygon-rpc.com/',
              required: !polygonConfigured,
              configured: !!polygonRpcUrl
            }
          ]
        },
        recommendedProviders: {
          alchemy: {
            description: 'Best for Ethereum and Polygon',
            url: 'https://alchemy.com',
            freeTeir: 'Yes - 300M compute units/month',
            setup: 'Get API key and set as ALCHEMY_API_KEY'
          },
          binance: {
            description: 'Official BNB Chain RPC',
            url: 'https://bsc-dataseed.binance.org/',
            freeTeir: 'Yes - Public endpoint',
            setup: 'Set as BNB_RPC_URL'
          },
          llamaRPC: {
            description: 'Public Ethereum RPC',
            url: 'https://eth.llamarpc.com',
            freeTeir: 'Yes - No signup required',
            setup: 'Set as ETH_RPC_URL'
          }
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
    console.error('[TEST-RPC-CONFIG] Error name:', error.name);
    
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'internal_error',
        message: error.message || 'Unknown error occurred',
        details: {
          errorType: error.name,
          errorMessage: error.message,
          errorStack: error.stack,
          timestamp: new Date().toISOString(),
          help: 'This error suggests that environment variables are not properly configured. Please go to Supabase Dashboard → Settings → Edge Functions → Manage secrets and add ALCHEMY_API_KEY or individual RPC URLs (ETH_RPC_URL, BNB_RPC_URL, POLYGON_RPC_URL).'
        }
      }, null, 2),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
