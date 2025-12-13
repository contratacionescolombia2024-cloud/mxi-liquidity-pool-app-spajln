
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { calculateVestingYield, safeParseNumeric } from '@/utils/safeNumericParse';

export interface VestingData {
  // Current real-time values
  currentYield: number;
  sessionYield: number;
  accumulatedYield: number;
  
  // Base values
  mxiPurchased: number;
  mxiCommissions: number;
  mxiTournaments: number;
  
  // Yield rates
  maxMonthlyYield: number;
  yieldPerSecond: number;
  yieldPerMinute: number;
  yieldPerHour: number;
  yieldPerDay: number;
  
  // Progress
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
 */
export function useVestingData() {
  const { user } = useAuth();
  const [vestingData, setVestingData] = useState<VestingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data from database
  const loadVestingData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('mxi_purchased_directly, mxi_from_unified_commissions, mxi_from_challenges, accumulated_yield, last_yield_update')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      // Parse values safely
      const mxiPurchased = safeParseNumeric(userData.mxi_purchased_directly, 0);
      const mxiCommissions = safeParseNumeric(userData.mxi_from_unified_commissions, 0);
      const mxiTournaments = safeParseNumeric(userData.mxi_from_challenges, 0);
      const accumulatedYield = safeParseNumeric(userData.accumulated_yield, 0);
      const lastUpdate = new Date(userData.last_yield_update || new Date());

      // Calculate current yield
      const yieldCalc = calculateVestingYield(
        mxiPurchased,
        accumulatedYield,
        lastUpdate,
        MONTHLY_YIELD_PERCENTAGE
      );

      // Calculate additional rates
      const yieldPerMinute = yieldCalc.yieldPerSecond * 60;
      const yieldPerHour = yieldPerMinute * 60;
      const yieldPerDay = yieldPerHour * 24;

      setVestingData({
        currentYield: yieldCalc.currentYield,
        sessionYield: yieldCalc.sessionYield,
        accumulatedYield,
        mxiPurchased,
        mxiCommissions,
        mxiTournaments,
        maxMonthlyYield: yieldCalc.maxMonthlyYield,
        yieldPerSecond: yieldCalc.yieldPerSecond,
        yieldPerMinute,
        yieldPerHour,
        yieldPerDay,
        progressPercentage: yieldCalc.progressPercentage,
        isNearCap: yieldCalc.progressPercentage >= 95,
        hasBalance: mxiPurchased > 0,
        lastUpdate,
      });
    } catch (err) {
      console.error('Error loading vesting data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Real-time update effect
  useEffect(() => {
    if (!user || !vestingData || !vestingData.hasBalance) {
      return;
    }

    const interval = setInterval(() => {
      // Recalculate yield based on current time
      const yieldCalc = calculateVestingYield(
        vestingData.mxiPurchased,
        vestingData.accumulatedYield,
        vestingData.lastUpdate,
        MONTHLY_YIELD_PERCENTAGE
      );

      setVestingData(prev => prev ? {
        ...prev,
        currentYield: yieldCalc.currentYield,
        sessionYield: yieldCalc.sessionYield,
        progressPercentage: yieldCalc.progressPercentage,
        isNearCap: yieldCalc.progressPercentage >= 95,
      } : null);
    }, UPDATE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [user, vestingData?.hasBalance, vestingData?.mxiPurchased, vestingData?.accumulatedYield, vestingData?.lastUpdate]);

  // Persist to database periodically
  useEffect(() => {
    if (!user || !vestingData || !vestingData.hasBalance) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        // Update database with current yield
        await supabase
          .from('users')
          .update({
            accumulated_yield: vestingData.currentYield,
            last_yield_update: new Date().toISOString(),
          })
          .eq('id', user.id);

        console.log('✅ Vesting yield persisted:', vestingData.currentYield.toFixed(8), 'MXI');
      } catch (err) {
        console.error('Error persisting vesting yield:', err);
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
          console.log('Vesting data updated from database:', payload);
          loadVestingData();
        }
      )
      .subscribe();

    return () => {
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
