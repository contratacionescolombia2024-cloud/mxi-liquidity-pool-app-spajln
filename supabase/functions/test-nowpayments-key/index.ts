
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID().substring(0, 8);
  console.log(`\n========== [${requestId}] TEST NOWPAYMENTS KEY ==========`);
  console.log(`Time: ${new Date().toISOString()}`);

  try {
    const nowpaymentsApiKey = Deno.env.get('NOWPAYMENTS_API_KEY');
    
    console.log(`[${requestId}] API Key check:`, {
      hasKey: !!nowpaymentsApiKey,
      keyLength: nowpaymentsApiKey?.length || 0,
      keyPrefix: nowpaymentsApiKey?.substring(0, 7) || 'N/A',
    });

    if (!nowpaymentsApiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'NOWPAYMENTS_API_KEY not configured',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Test 1: Get API status
    console.log(`[${requestId}] Testing API status endpoint...`);
    const statusResponse = await fetch('https://api.nowpayments.io/v1/status', {
      method: 'GET',
      headers: {
        'x-api-key': nowpaymentsApiKey,
      },
    });

    console.log(`[${requestId}] Status response: ${statusResponse.status}`);
    const statusText = await statusResponse.text();
    console.log(`[${requestId}] Status body:`, statusText);

    let statusData;
    try {
      statusData = JSON.parse(statusText);
    } catch (e) {
      console.error(`[${requestId}] Failed to parse status response`);
      statusData = { raw: statusText };
    }

    // Test 2: Get available currencies
    console.log(`[${requestId}] Testing currencies endpoint...`);
    const currenciesResponse = await fetch('https://api.nowpayments.io/v1/currencies', {
      method: 'GET',
      headers: {
        'x-api-key': nowpaymentsApiKey,
      },
    });

    console.log(`[${requestId}] Currencies response: ${currenciesResponse.status}`);
    const currenciesText = await currenciesResponse.text();
    console.log(`[${requestId}] Currencies body:`, currenciesText.substring(0, 200));

    let currenciesData;
    try {
      currenciesData = JSON.parse(currenciesText);
    } catch (e) {
      console.error(`[${requestId}] Failed to parse currencies response`);
      currenciesData = { raw: currenciesText.substring(0, 200) };
    }

    // Test 3: Get minimum payment amount
    console.log(`[${requestId}] Testing minimum amount endpoint...`);
    const minAmountResponse = await fetch('https://api.nowpayments.io/v1/min-amount?currency_from=usd&currency_to=usdttrc20', {
      method: 'GET',
      headers: {
        'x-api-key': nowpaymentsApiKey,
      },
    });

    console.log(`[${requestId}] Min amount response: ${minAmountResponse.status}`);
    const minAmountText = await minAmountResponse.text();
    console.log(`[${requestId}] Min amount body:`, minAmountText);

    let minAmountData;
    try {
      minAmountData = JSON.parse(minAmountText);
    } catch (e) {
      console.error(`[${requestId}] Failed to parse min amount response`);
      minAmountData = { raw: minAmountText };
    }

    const result = {
      success: true,
      apiKey: {
        configured: true,
        length: nowpaymentsApiKey.length,
        prefix: nowpaymentsApiKey.substring(0, 7),
      },
      tests: {
        status: {
          httpStatus: statusResponse.status,
          ok: statusResponse.ok,
          data: statusData,
        },
        currencies: {
          httpStatus: currenciesResponse.status,
          ok: currenciesResponse.ok,
          data: currenciesData,
        },
        minAmount: {
          httpStatus: minAmountResponse.status,
          ok: minAmountResponse.ok,
          data: minAmountData,
        },
      },
      conclusion: statusResponse.ok && currenciesResponse.ok && minAmountResponse.ok
        ? 'API key is valid and working'
        : 'API key may be invalid or has issues',
    };

    console.log(`[${requestId}] Test complete:`, result.conclusion);

    return new Response(
      JSON.stringify(result, null, 2),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error(`[${requestId}] ❌ ERROR:`, error.message);
    console.error(`[${requestId}] Stack:`, error.stack);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
        requestId,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
