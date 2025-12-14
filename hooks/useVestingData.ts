
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { calculateVestingYield, safeParseNumeric } from '@/utils/safeNumericParse';

export interface VestingData {
  // Current real-time values - ALWAYS NON-NEGATIVE
  currentYield: number;
  sessionYield: number;
  accumulatedYield: number;
  
  // Base values - ALWAYS NON-NEGATIVE
  mxiPurchased: number;
  mxiCommissions: number;
  mxiTournaments: number;
  
  // Yield rates - ALWAYS NON-NEGATIVE
  maxMonthlyYield: number;
  yieldPerSecond: number;
  yieldPerMinute: number;
  yieldPerHour: number;
  yieldPerDay: number;
  yieldPer7Days: number;
  yieldPerMonth: number;
  yieldUntilLaunch: number;
  
  // USDT values based on current phase
  yieldPerHourUsdt: number;
  yieldPer7DaysUsdt: number;
  yieldPerMonthUsdt: number;
  yieldUntilLaunchUsdt: number;
  
  // Current phase info
  currentPhase: number;
  currentPriceUsdt: number;
  daysUntilLaunch: number;
  
  // Progress - ALWAYS NON-NEGATIVE
  progressPercentage: number;
  isNearCap: boolean;
  
  // Status
  hasBalance: boolean;
  lastUpdate: Date;
}

const MONTHLY_YIELD_PERCENTAGE = 0.03; // 3% monthly
const UPDATE_INTERVAL_MS = 1000; // Update every second
const PERSIST_INTERVAL_MS = 10000; // Persist every 10 seconds

/**
 * Shared hook for vesting data - ensures consistency across all displays
 * Used by: Home page, Rewards page, Vesting page, VestingCounter component
 * 
 * CRITICAL: All values returned are guaranteed to be non-negative
 * FIXED: Real-time updates now work correctly by recalculating from base values every second
 * FIXED: Interval properly restarts when base values change
 * NEW: Added per 7 days, per month, until launch timeframes with USDT conversion
 */
export function useVestingData() {
  const { user } = useAuth();
  const [vestingData, setVestingData] = useState<VestingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Store base values in refs to avoid stale closures
  const baseValuesRef = useRef<{
    mxiPurchased: number;
    mxiCommissions: number;
    mxiTournaments: number;
    accumulatedYield: number;
    lastUpdate: Date;
    currentPhase: number;
    currentPriceUsdt: number;
    launchDate: Date;
  } | null>(null);

  // Track if component is mounted
  const isMountedRef = useRef(true);
  
  // Track the update interval ID
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const persistIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial data from database
  const loadVestingData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Loading vesting data for user:', user.id);

      // Fetch user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('mxi_purchased_directly, mxi_from_unified_commissions, mxi_from_challenges, accumulated_yield, last_yield_update')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      // Fetch metrics for phase info and launch date
      const { data: metricsData, error: metricsError } = await supabase
        .from('metrics')
        .select('current_phase, current_price_usdt, mxi_launch_date')
        .single();

      if (metricsError) throw metricsError;

      // Parse values safely - GUARANTEED NON-NEGATIVE
      const mxiPurchased = Math.max(0, safeParseNumeric(userData.mxi_purchased_directly, 0));
      const mxiCommissions = Math.max(0, safeParseNumeric(userData.mxi_from_unified_commissions, 0));
      const mxiTournaments = Math.max(0, safeParseNumeric(userData.mxi_from_challenges, 0));
      const accumulatedYield = Math.max(0, safeParseNumeric(userData.accumulated_yield, 0));
      const lastUpdate = new Date(userData.last_yield_update || new Date());

      // Parse phase info
      const currentPhase = metricsData.current_phase || 1;
      const currentPriceUsdt = Math.max(0, safeParseNumeric(metricsData.current_price_usdt, 0.40));
      const launchDate = new Date(metricsData.mxi_launch_date || '2026-02-25T12:00:00Z');

      // Calculate days until launch
      const now = new Date();
      const daysUntilLaunch = Math.max(0, Math.ceil((launchDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

      console.log('✅ Loaded base values:', {
        mxiPurchased,
        mxiCommissions,
        mxiTournaments,
        accumulatedYield,
        lastUpdate: lastUpdate.toISOString(),
        currentPhase,
        currentPriceUsdt,
        daysUntilLaunch,
      });

      // Store base values in ref for real-time updates
      baseValuesRef.current = {
        mxiPurchased,
        mxiCommissions,
        mxiTournaments,
        accumulatedYield,
        lastUpdate,
        currentPhase,
        currentPriceUsdt,
        launchDate,
      };

      // Calculate current yield - GUARANTEED NON-NEGATIVE
      const yieldCalc = calculateVestingYield(
        mxiPurchased,
        accumulatedYield,
        lastUpdate,
        MONTHLY_YIELD_PERCENTAGE
      );

      // Calculate additional rates - GUARANTEED NON-NEGATIVE
      const yieldPerMinute = Math.max(0, yieldCalc.yieldPerSecond * 60);
      const yieldPerHour = Math.max(0, yieldPerMinute * 60);
      const yieldPerDay = Math.max(0, yieldPerHour * 24);
      const yieldPer7Days = Math.max(0, yieldPerDay * 7);
      const yieldPerMonth = Math.max(0, yieldPerDay * 30); // 30 days
      
      // Calculate yield until launch
      const yieldUntilLaunch = Math.max(0, yieldPerDay * daysUntilLaunch);

      // Calculate USDT values based on current phase price
      const yieldPerHourUsdt = Math.max(0, yieldPerHour * currentPriceUsdt);
      const yieldPer7DaysUsdt = Math.max(0, yieldPer7Days * currentPriceUsdt);
      const yieldPerMonthUsdt = Math.max(0, yieldPerMonth * currentPriceUsdt);
      const yieldUntilLaunchUsdt = Math.max(0, yieldUntilLaunch * currentPriceUsdt);

      // Final validation before setting state
      const newVestingData: VestingData = {
        currentYield: Math.max(0, yieldCalc.currentYield),
        sessionYield: Math.max(0, yieldCalc.sessionYield),
        accumulatedYield: Math.max(0, accumulatedYield),
        mxiPurchased: Math.max(0, mxiPurchased),
        mxiCommissions: Math.max(0, mxiCommissions),
        mxiTournaments: Math.max(0, mxiTournaments),
        maxMonthlyYield: Math.max(0, yieldCalc.maxMonthlyYield),
        yieldPerSecond: Math.max(0, yieldCalc.yieldPerSecond),
        yieldPerMinute: Math.max(0, yieldPerMinute),
        yieldPerHour: Math.max(0, yieldPerHour),
        yieldPerDay: Math.max(0, yieldPerDay),
        yieldPer7Days: Math.max(0, yieldPer7Days),
        yieldPerMonth: Math.max(0, yieldPerMonth),
        yieldUntilLaunch: Math.max(0, yieldUntilLaunch),
        yieldPerHourUsdt: Math.max(0, yieldPerHourUsdt),
        yieldPer7DaysUsdt: Math.max(0, yieldPer7DaysUsdt),
        yieldPerMonthUsdt: Math.max(0, yieldPerMonthUsdt),
        yieldUntilLaunchUsdt: Math.max(0, yieldUntilLaunchUsdt),
        currentPhase,
        currentPriceUsdt,
        daysUntilLaunch,
        progressPercentage: Math.max(0, yieldCalc.progressPercentage),
        isNearCap: yieldCalc.progressPercentage >= 95,
        hasBalance: mxiPurchased > 0,
        lastUpdate,
      };

      console.log('✅ Vesting data calculated:', {
        currentYield: newVestingData.currentYield.toFixed(8),
        sessionYield: newVestingData.sessionYield.toFixed(8),
        yieldPerHour: newVestingData.yieldPerHour.toFixed(8),
        yieldPer7Days: newVestingData.yieldPer7Days.toFixed(8),
        yieldPerMonth: newVestingData.yieldPerMonth.toFixed(8),
        yieldUntilLaunch: newVestingData.yieldUntilLaunch.toFixed(8),
      });

      if (isMountedRef.current) {
        setVestingData(newVestingData);
      }
    } catch (err) {
      console.error('❌ Error loading vesting data:', err);
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [user]);

  // Real-time update effect - FIXED: Now properly restarts when base values change
  useEffect(() => {
    // Clear any existing interval
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }

    if (!user || !baseValuesRef.current) {
      return;
    }

    const baseValues = baseValuesRef.current;
    
    // Don't start interval if no MXI purchased
    if (!baseValues.mxiPurchased || baseValues.mxiPurchased <= 0) {
      console.log('⏸️ No MXI purchased, skipping real-time updates');
      return;
    }

    console.log('⏱️ Starting real-time vesting updates (every second)');

    // Create a new interval that recalculates every second
    updateIntervalRef.current = setInterval(() => {
      const currentBaseValues = baseValuesRef.current;
      if (!currentBaseValues || !isMountedRef.current) return;

      // Recalculate yield based on current time and base values
      const yieldCalc = calculateVestingYield(
        currentBaseValues.mxiPurchased,
        currentBaseValues.accumulatedYield,
        currentBaseValues.lastUpdate,
        MONTHLY_YIELD_PERCENTAGE
      );

      // Calculate additional rates
      const yieldPerMinute = Math.max(0, yieldCalc.yieldPerSecond * 60);
      const yieldPerHour = Math.max(0, yieldPerMinute * 60);
      const yieldPerDay = Math.max(0, yieldPerHour * 24);
      const yieldPer7Days = Math.max(0, yieldPerDay * 7);
      const yieldPerMonth = Math.max(0, yieldPerDay * 30);
      
      // Recalculate days until launch
      const now = new Date();
      const daysUntilLaunch = Math.max(0, Math.ceil((currentBaseValues.launchDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      const yieldUntilLaunch = Math.max(0, yieldPerDay * daysUntilLaunch);

      // Calculate USDT values
      const yieldPerHourUsdt = Math.max(0, yieldPerHour * currentBaseValues.currentPriceUsdt);
      const yieldPer7DaysUsdt = Math.max(0, yieldPer7Days * currentBaseValues.currentPriceUsdt);
      const yieldPerMonthUsdt = Math.max(0, yieldPerMonth * currentBaseValues.currentPriceUsdt);
      const yieldUntilLaunchUsdt = Math.max(0, yieldUntilLaunch * currentBaseValues.currentPriceUsdt);

      // Update state with new calculated values
      setVestingData(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          currentYield: Math.max(0, yieldCalc.currentYield),
          sessionYield: Math.max(0, yieldCalc.sessionYield),
          progressPercentage: Math.max(0, yieldCalc.progressPercentage),
          isNearCap: yieldCalc.progressPercentage >= 95,
          yieldPerSecond: Math.max(0, yieldCalc.yieldPerSecond),
          yieldPerMinute: Math.max(0, yieldPerMinute),
          yieldPerHour: Math.max(0, yieldPerHour),
          yieldPerDay: Math.max(0, yieldPerDay),
          yieldPer7Days: Math.max(0, yieldPer7Days),
          yieldPerMonth: Math.max(0, yieldPerMonth),
          yieldUntilLaunch: Math.max(0, yieldUntilLaunch),
          yieldPerHourUsdt: Math.max(0, yieldPerHourUsdt),
          yieldPer7DaysUsdt: Math.max(0, yieldPer7DaysUsdt),
          yieldPerMonthUsdt: Math.max(0, yieldPerMonthUsdt),
          yieldUntilLaunchUsdt: Math.max(0, yieldUntilLaunchUsdt),
          daysUntilLaunch,
        };
      });
    }, UPDATE_INTERVAL_MS);

    return () => {
      console.log('🛑 Stopping real-time vesting updates');
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
    };
  }, [user, baseValuesRef.current?.mxiPurchased, baseValuesRef.current?.lastUpdate]); // Restart when base values change

  // Persist to database periodically - FIXED: Don't reload data after persist to avoid display jumps
  useEffect(() => {
    // Clear any existing interval
    if (persistIntervalRef.current) {
      clearInterval(persistIntervalRef.current);
      persistIntervalRef.current = null;
    }

    if (!user || !vestingData || !vestingData.hasBalance) {
      return;
    }

    persistIntervalRef.current = setInterval(async () => {
      try {
        // Ensure value is non-negative before persisting
        const safeCurrentYield = Math.max(0, vestingData.currentYield);
        
        console.log('💾 Persisting vesting yield:', safeCurrentYield.toFixed(8), 'MXI');
        
        // Update database with current yield - DON'T reload data after this
        const { error: updateError } = await supabase
          .from('users')
          .update({
            accumulated_yield: safeCurrentYield,
            last_yield_update: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (updateError) {
          console.error('❌ Error persisting vesting yield:', updateError);
        } else {
          console.log('✅ Vesting yield persisted successfully');
          
          // Update base values ref after successful persist WITHOUT reloading
          if (baseValuesRef.current) {
            baseValuesRef.current.accumulatedYield = safeCurrentYield;
            baseValuesRef.current.lastUpdate = new Date();
          }
        }
      } catch (err) {
        console.error('❌ Error persisting vesting yield:', err);
      }
    }, PERSIST_INTERVAL_MS);

    return () => {
      if (persistIntervalRef.current) {
        clearInterval(persistIntervalRef.current);
        persistIntervalRef.current = null;
      }
    };
  }, [user, vestingData?.currentYield, vestingData?.hasBalance]);

  // Load data on mount and when user changes
  useEffect(() => {
    loadVestingData();
  }, [loadVestingData]);

  // Subscribe to real-time updates from database - ONLY for external changes
  useEffect(() => {
    if (!user) return;

    console.log('📡 Subscribing to vesting updates');

    const channel = supabase
      .channel('vesting-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          console.log('📨 Vesting data updated from database (external change):', payload);
          
          // Only reload if the change was external (not from our own persist)
          // Check if mxi_purchased_directly changed (indicates external change like admin action or purchase)
          const oldPurchased = baseValuesRef.current?.mxiPurchased || 0;
          const newPurchased = payload.new?.mxi_purchased_directly || 0;
          
          if (Math.abs(oldPurchased - newPurchased) > 0.0001) {
            console.log('🔄 External purchase detected, reloading vesting data');
            loadVestingData();
          } else {
            console.log('⏭️ Skipping reload - change was from internal persist');
          }
        }
      )
      .subscribe();

    return () => {
      console.log('📡 Unsubscribing from vesting updates');
      supabase.removeChannel(channel);
    };
  }, [user, loadVestingData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
      if (persistIntervalRef.current) {
        clearInterval(persistIntervalRef.current);
      }
    };
  }, []);

  return {
    vestingData,
    loading,
    error,
    refresh: loadVestingData,
  };
}
