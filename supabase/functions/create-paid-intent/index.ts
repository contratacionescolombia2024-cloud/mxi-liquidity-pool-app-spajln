
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
    console.log('=== Create Payment Intent (Step 1 - Fetch Currencies) ===');
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);

    // Get Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'No autorizado. Por favor inicia sesión nuevamente.' 
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('User authenticated:', user.id);

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
    } catch (e) {
      console.error('Failed to parse request body:', e);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Solicitud inválida' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { order_id, price_amount, price_currency } = requestBody;

    if (!order_id || !price_amount || !price_currency) {
      console.error('Missing required parameters:', { order_id, price_amount, price_currency });
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Faltan parámetros requeridos: order_id, price_amount, price_currency' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Creating payment intent:', { order_id, price_amount, price_currency });

    // Get NowPayments API key
    const nowpaymentsApiKey = Deno.env.get('NOWPAYMENTS_API_KEY');
    
    if (!nowpaymentsApiKey) {
      console.error('NOWPAYMENTS_API_KEY not configured in environment variables');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Error de configuración del servidor. Por favor contacta al administrador.' 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('API key found, length:', nowpaymentsApiKey.length);

    // Get available currencies from NOWPayments
    console.log('Fetching available currencies from NOWPayments API...');
    console.log('API endpoint: https://api.nowpayments.io/v1/currencies');
    
    let currenciesResponse;
    try {
      currenciesResponse = await fetch('https://api.nowpayments.io/v1/currencies', {
        method: 'GET',
        headers: {
          'x-api-key': nowpaymentsApiKey,
          'Content-Type': 'application/json',
        },
      });

      console.log('NOWPayments currencies API response status:', currenciesResponse.status);
      console.log('NOWPayments currencies API response headers:', JSON.stringify(Object.fromEntries(currenciesResponse.headers.entries())));
    } catch (fetchError: any) {
      console.error('Fetch error when calling NOWPayments API:', fetchError);
      console.error('Error name:', fetchError.name);
      console.error('Error message:', fetchError.message);
      console.error('Error stack:', fetchError.stack);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Error al conectar con el servicio de pagos. Por favor intenta nuevamente.',
          details: {
            message: fetchError.message,
            type: fetchError.name,
          },
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Read response body
    const responseText = await currenciesResponse.text();
    console.log('NOWPayments raw response (first 500 chars):', responseText.substring(0, 500));

    if (!currenciesResponse.ok) {
      console.error('NOWPayments API error - Status:', currenciesResponse.status);
      console.error('NOWPayments API error - Body:', responseText);
      
      let errorMessage = 'Error al obtener criptomonedas disponibles';
      let errorDetails: any = { 
        raw: responseText, 
        status: currenciesResponse.status,
        statusText: currenciesResponse.statusText,
      };
      
      try {
        const errorData = JSON.parse(responseText);
        console.error('Parsed error data:', JSON.stringify(errorData, null, 2));
        errorMessage = errorData.message || errorData.error || errorMessage;
        errorDetails = errorData;
      } catch (e) {
        console.error('Could not parse error response as JSON:', e);
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
          details: errorDetails,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse successful response
    let currenciesData;
    try {
      currenciesData = JSON.parse(responseText);
      console.log('Successfully parsed currencies data');
      console.log('Number of currencies:', currenciesData.currencies?.length || 0);
      
      if (currenciesData.currencies && currenciesData.currencies.length > 0) {
        console.log('First 10 currencies:', currenciesData.currencies.slice(0, 10).join(', '));
      }
    } catch (e) {
      console.error('Failed to parse NOWPayments response as JSON:', e);
      console.error('Response text:', responseText);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Respuesta inválida del servicio de pagos',
          details: { 
            raw: responseText,
            parseError: e.message,
          },
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate currencies data
    if (!currenciesData.currencies || !Array.isArray(currenciesData.currencies)) {
      console.error('Invalid currencies data structure:', currenciesData);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Estructura de datos inválida del servicio de pagos',
          details: currenciesData,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (currenciesData.currencies.length === 0) {
      console.warn('No currencies available from NOWPayments');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No hay criptomonedas disponibles en este momento',
          details: { message: 'Empty currencies list from API' },
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Successfully fetched', currenciesData.currencies.length, 'currencies');

    // Return payment intent with available currencies
    const responseData = {
      success: true,
      intent: {
        id: order_id,
        order_id: order_id,
        price_amount: price_amount,
        price_currency: price_currency,
        pay_currencies: currenciesData.currencies,
        user_id: user.id,
        created_at: new Date().toISOString(),
      },
    };

    console.log('Returning success response with', currenciesData.currencies.length, 'currencies');

    return new Response(
      JSON.stringify(responseData),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('=== UNEXPECTED ERROR in create-paid-intent ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error interno del servidor',
        details: {
          type: error.constructor.name,
          message: error.message,
          stack: error.stack,
        },
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
