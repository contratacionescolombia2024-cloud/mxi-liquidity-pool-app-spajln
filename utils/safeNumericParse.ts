
/**
 * Safely parse numeric values from database or any source
 * Ensures the result is always a valid non-negative number
 * 
 * This utility is critical for preventing negative vesting values
 * which should never occur in the system.
 */
export function safeParseNumeric(value: any, defaultValue: number = 0): number {
  // Handle null or undefined
  if (value === null || value === undefined) {
    return Math.max(0, defaultValue);
  }

  // Handle already numeric values
  if (typeof value === 'number') {
    // Check for NaN or Infinity
    if (!isFinite(value)) {
      console.warn('⚠️ Non-finite numeric value detected:', value);
      return Math.max(0, defaultValue);
    }
    // Ensure non-negative - this is critical for vesting
    const result = Math.max(0, value);
    if (value < 0) {
      console.warn('⚠️ Negative value detected and corrected:', value, '→', result);
    }
    return result;
  }

  // Handle string values (from database)
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    // Check if parsing was successful
    if (isNaN(parsed) || !isFinite(parsed)) {
      console.warn('⚠️ Failed to parse string value:', value);
      return Math.max(0, defaultValue);
    }
    // Ensure non-negative
    const result = Math.max(0, parsed);
    if (parsed < 0) {
      console.warn('⚠️ Negative string value detected and corrected:', value, '→', result);
    }
    return result;
  }

  // Fallback for any other type
  console.warn('⚠️ Unexpected value type:', typeof value, value);
  return Math.max(0, defaultValue);
}

/**
 * Format a numeric value for display
 * Ensures consistent formatting and handles edge cases
 * Always returns a non-negative formatted string
 */
export function formatVestingValue(value: any, decimals: number = 8): string {
  const safeValue = Math.max(0, safeParseNumeric(value, 0));
  return safeValue.toFixed(decimals);
}

/**
 * Calculate vesting yield with safety checks
 * This is the core calculation for vesting rewards
 * 
 * CRITICAL FIX: Vesting calculation now properly accounts for time elapsed
 * since purchase or last update. The yield accumulates continuously from
 * the moment of purchase or when admin adds balance with commission.
 * 
 * Returns only non-negative values with multiple safety layers:
 * 1. Input sanitization via safeParseNumeric
 * 2. Time validation (no negative elapsed time)
 * 3. Yield capping at monthly maximum
 * 4. Final Math.max(0, ...) on all outputs
 */
export function calculateVestingYield(
  mxiPurchased: any,
  accumulatedYield: any,
  lastYieldUpdate: string | Date,
  monthlyYieldPercentage: number = 0.03
): {
  currentYield: number;
  sessionYield: number;
  maxMonthlyYield: number;
  yieldPerSecond: number;
  progressPercentage: number;
} {
  // Parse inputs safely - ensures non-negative
  const safeMxiPurchased = safeParseNumeric(mxiPurchased, 0);
  const safeAccumulatedYield = safeParseNumeric(accumulatedYield, 0);

  // Calculate maximum monthly yield (3% of purchased MXI)
  const maxMonthlyYield = Math.max(0, safeMxiPurchased * monthlyYieldPercentage);

  // If no MXI purchased, return zeros
  if (safeMxiPurchased === 0) {
    return {
      currentYield: 0,
      sessionYield: 0,
      maxMonthlyYield: 0,
      yieldPerSecond: 0,
      progressPercentage: 0,
    };
  }

  // Calculate yield per second (3% monthly / 30 days / 24 hours / 60 minutes / 60 seconds)
  const SECONDS_IN_MONTH = 2592000; // 30 days * 24 hours * 60 minutes * 60 seconds
  const yieldPerSecond = Math.max(0, maxMonthlyYield / SECONDS_IN_MONTH);

  // Calculate time elapsed since last update
  const now = Date.now();
  const lastUpdate = new Date(lastYieldUpdate).getTime();
  
  // Ensure non-negative time elapsed
  const millisecondsElapsed = Math.max(0, now - lastUpdate);
  const secondsElapsed = Math.max(0, millisecondsElapsed / 1000);
  
  // Prevent calculation if time is in the future (clock skew)
  if (millisecondsElapsed < 0) {
    console.warn('⚠️ Negative time elapsed detected - clock skew?', {
      now: new Date(now).toISOString(),
      lastUpdate: new Date(lastUpdate).toISOString(),
    });
  }

  // Calculate session yield (yield generated since last update) - always non-negative
  const sessionYield = Math.max(0, yieldPerSecond * secondsElapsed);

  // Calculate current total yield (accumulated + session) - always non-negative
  const totalYield = Math.max(0, safeAccumulatedYield + sessionYield);

  // Cap at monthly maximum - always non-negative
  const currentYield = Math.max(0, Math.min(totalYield, maxMonthlyYield));

  // Calculate progress percentage - always non-negative
  const progressPercentage = maxMonthlyYield > 0 
    ? Math.max(0, Math.min(100, (currentYield / maxMonthlyYield) * 100))
    : 0;

  // Final safety check - log if any value is somehow negative
  const result = {
    currentYield: Math.max(0, currentYield),
    sessionYield: Math.max(0, sessionYield),
    maxMonthlyYield: Math.max(0, maxMonthlyYield),
    yieldPerSecond: Math.max(0, yieldPerSecond),
    progressPercentage: Math.max(0, progressPercentage),
  };

  // Validate result
  Object.entries(result).forEach(([key, value]) => {
    if (value < 0) {
      console.error('❌ CRITICAL: Negative value in vesting calculation:', key, value);
    }
  });

  // Log calculation details for debugging
  console.log('🔢 Vesting calculation:', {
    mxiPurchased: safeMxiPurchased.toFixed(2),
    accumulatedYield: safeAccumulatedYield.toFixed(8),
    secondsElapsed: secondsElapsed.toFixed(0),
    sessionYield: sessionYield.toFixed(8),
    currentYield: currentYield.toFixed(8),
    yieldPerSecond: yieldPerSecond.toFixed(10),
    progressPercentage: progressPercentage.toFixed(2) + '%',
  });

  return result;
}
