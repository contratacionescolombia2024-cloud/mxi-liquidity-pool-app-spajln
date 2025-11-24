
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
    console.log('=== Create Payment Intent (Step 1) ===');
    console.log('Request method:', req.method);

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
      console.log('Request body:', requestBody);
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
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Faltan parámetros requeridos' 
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
      console.error('NOWPAYMENTS_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Error de configuración del servidor' 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get available currencies from NOWPayments
    console.log('Fetching available currencies from NOWPayments...');
    
    let currenciesResponse;
    try {
      currenciesResponse = await fetch('https://api.nowpayments.io/v1/currencies', {
        method: 'GET',
        headers: {
          'x-api-key': nowpaymentsApiKey,
        },
      });
    } catch (fetchError: any) {
      console.error('Error fetching currencies:', fetchError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Error al obtener criptomonedas disponibles',
          details: fetchError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!currenciesResponse.ok) {
      const errorText = await currenciesResponse.text();
      console.error('NOWPayments currencies API error:', errorText);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Error al obtener criptomonedas disponibles',
          details: errorText,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const currenciesData = await currenciesResponse.json();
    console.log('Available currencies fetched:', currenciesData.currencies?.length || 0);

    // Return payment intent with available currencies
    return new Response(
      JSON.stringify({
        success: true,
        intent: {
          id: order_id,
          order_id: order_id,
          price_amount: price_amount,
          price_currency: price_currency,
          pay_currencies: currenciesData.currencies || [],
          user_id: user.id,
          created_at: new Date().toISOString(),
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in create-paid-intent:', error);
    console.error('Error stack:', error.stack);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error interno del servidor',
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
