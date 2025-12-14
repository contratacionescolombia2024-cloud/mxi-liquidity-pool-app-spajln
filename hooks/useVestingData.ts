
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
 * FIXED: Real-time updates now work correctly by recalculating from base values
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
  } | null>(null);

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

      // Parse values safely - GUARANTEED NON-NEGATIVE
      const mxiPurchased = Math.max(0, safeParseNumeric(userData.mxi_purchased_directly, 0));
      const mxiCommissions = Math.max(0, safeParseNumeric(userData.mxi_from_unified_commissions, 0));
      const mxiTournaments = Math.max(0, safeParseNumeric(userData.mxi_from_challenges, 0));
      const accumulatedYield = Math.max(0, safeParseNumeric(userData.accumulated_yield, 0));
      const lastUpdate = new Date(userData.last_yield_update || new Date());

      console.log('✅ Loaded base values:', {
        mxiPurchased,
        mxiCommissions,
        mxiTournaments,
        accumulatedYield,
        lastUpdate: lastUpdate.toISOString(),
      });

      // Store base values in ref for real-time updates
      baseValuesRef.current = {
        mxiPurchased,
        mxiCommissions,
        mxiTournaments,
        accumulatedYield,
        lastUpdate,
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
        progressPercentage: Math.max(0, yieldCalc.progressPercentage),
        isNearCap: yieldCalc.progressPercentage >= 95,
        hasBalance: mxiPurchased > 0,
        lastUpdate,
      };

      console.log('✅ Vesting data calculated:', {
        currentYield: newVestingData.currentYield.toFixed(8),
        sessionYield: newVestingData.sessionYield.toFixed(8),
        yieldPerSecond: newVestingData.yieldPerSecond.toFixed(8),
      });

      setVestingData(newVestingData);
    } catch (err) {
      console.error('❌ Error loading vesting data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Real-time update effect - FIXED: Now recalculates from base values
  useEffect(() => {
    if (!user || !baseValuesRef.current || !baseValuesRef.current.mxiPurchased) {
      return;
    }

    console.log('⏱️ Starting real-time vesting updates');

    const interval = setInterval(() => {
      const baseValues = baseValuesRef.current;
      if (!baseValues) return;

      // Recalculate yield based on current time and base values
      const yieldCalc = calculateVestingYield(
        baseValues.mxiPurchased,
        baseValues.accumulatedYield,
        baseValues.lastUpdate,
        MONTHLY_YIELD_PERCENTAGE
      );

      // Calculate additional rates
      const yieldPerMinute = Math.max(0, yieldCalc.yieldPerSecond * 60);
      const yieldPerHour = Math.max(0, yieldPerMinute * 60);
      const yieldPerDay = Math.max(0, yieldPerHour * 24);

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
        };
      });
    }, UPDATE_INTERVAL_MS);

    return () => {
      console.log('🛑 Stopping real-time vesting updates');
      clearInterval(interval);
    };
  }, [user, baseValuesRef.current?.mxiPurchased]);

  // Persist to database periodically
  useEffect(() => {
    if (!user || !vestingData || !vestingData.hasBalance) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        // Ensure value is non-negative before persisting
        const safeCurrentYield = Math.max(0, vestingData.currentYield);
        
        console.log('💾 Persisting vesting yield:', safeCurrentYield.toFixed(8), 'MXI');
        
        // Update database with current yield
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
          
          // Update base values ref after successful persist
          if (baseValuesRef.current) {
            baseValuesRef.current.accumulatedYield = safeCurrentYield;
            baseValuesRef.current.lastUpdate = new Date();
          }
        }
      } catch (err) {
        console.error('❌ Error persisting vesting yield:', err);
      }
    }, PERSIST_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [user, vestingData?.currentYield, vestingData?.hasBalance]);

  // Load data on mount and when user changes
  useEffect(() => {
    loadVestingData();
  }, [loadVestingData]);

  // Subscribe to real-time updates from database
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
          console.log('📨 Vesting data updated from database:', payload);
          loadVestingData();
        }
      )
      .subscribe();

    return () => {
      console.log('📡 Unsubscribing from vesting updates');
      supabase.removeChannel(channel);
    };
  }, [user, loadVestingData]);

  return {
    vestingData,
    loading,
    error,
    refresh: loadVestingData,
  };
}
