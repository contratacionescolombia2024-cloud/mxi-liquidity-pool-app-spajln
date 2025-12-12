
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current hour timestamp
    const currentHour = new Date();
    currentHour.setMinutes(0, 0, 0);

    // Get all users with vesting balance
    // ✅ FIXED: Only select users with mxi_purchased_directly > 0
    // Commissions and tournament winnings do NOT generate vesting
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, mxi_purchased_directly, accumulated_yield, last_yield_update')
      .gt('mxi_purchased_directly', 0);

    if (usersError) {
      throw usersError;
    }

    console.log(`Processing ${users?.length || 0} users with vesting balance (purchased MXI only)`);

    // ✅ FIXED: 3% monthly yield (0.03)
    const MONTHLY_YIELD_PERCENTAGE = 0.03;
    const SECONDS_IN_MONTH = 2592000; // 30 days

    for (const user of users || []) {
      // ✅ FIXED: Only use mxi_purchased_directly for vesting calculation
      // Commissions (mxi_from_unified_commissions) and tournaments (mxi_from_challenges) do NOT generate vesting
      const mxiInVesting = Math.max(0, parseFloat(user.mxi_purchased_directly) || 0);
      
      if (mxiInVesting === 0) continue;

      // Calculate current yield
      const maxMonthlyYield = mxiInVesting * MONTHLY_YIELD_PERCENTAGE;
      const yieldPerSecond = maxMonthlyYield / SECONDS_IN_MONTH;
      
      const now = new Date();
      const lastUpdate = new Date(user.last_yield_update);
      const secondsElapsed = Math.max(0, (now.getTime() - lastUpdate.getTime()) / 1000);
      
      const sessionYield = Math.max(0, yieldPerSecond * secondsElapsed);
      
      // ✅ CRITICAL FIX: Ensure accumulated_yield is never negative
      const previousYield = Math.max(0, parseFloat(user.accumulated_yield) || 0);
      const currentYield = Math.min(
        Math.max(0, previousYield + sessionYield),
        maxMonthlyYield
      );

      // Get last close value for this user
      const { data: lastCandle } = await supabase
        .from('vesting_hourly_data')
        .select('close_value')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      const lastClose = Math.max(0, lastCandle ? parseFloat(lastCandle.close_value) : 0);

      // ✅ CRITICAL FIX: Ensure all vesting values are non-negative
      const openValue = Math.max(0, lastClose);
      const closeValue = Math.max(0, currentYield);
      const highValue = Math.max(openValue, closeValue);
      const lowValue = Math.min(openValue, closeValue);
      const volume = Math.max(0, closeValue - openValue);

      // Insert or update hourly data
      const { error: insertError } = await supabase
        .from('vesting_hourly_data')
        .upsert({
          user_id: user.id,
          timestamp: currentHour.toISOString(),
          open_value: openValue,
          high_value: highValue,
          low_value: lowValue,
          close_value: closeValue,
          volume: volume,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,timestamp',
        });

      if (insertError) {
        console.error(`Error updating vesting data for user ${user.id}:`, insertError);
      } else {
        console.log(`✅ Updated vesting data for user ${user.id}: ${closeValue.toFixed(8)} MXI (based on ${mxiInVesting.toFixed(2)} MXI purchased, 3% monthly yield)`);
      }

      // ✅ CRITICAL FIX: Update user's accumulated_yield to ensure it's never negative
      const { error: updateUserError } = await supabase
        .from('users')
        .update({
          accumulated_yield: Math.max(0, currentYield),
          last_yield_update: now.toISOString(),
        })
        .eq('id', user.id);

      if (updateUserError) {
        console.error(`Error updating user ${user.id} accumulated_yield:`, updateUserError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `✅ Updated vesting data for ${users?.length || 0} users (only purchased MXI generates 3% monthly vesting, all values non-negative)`,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in update-vesting-hourly:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.toString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
