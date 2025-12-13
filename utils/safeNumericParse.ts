
/**
 * Safely parse numeric values from database or any source
 * Ensures the result is always a valid non-negative number
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
      return Math.max(0, defaultValue);
    }
    // Ensure non-negative
    return Math.max(0, value);
  }

  // Handle string values (from database)
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    // Check if parsing was successful
    if (isNaN(parsed) || !isFinite(parsed)) {
      return Math.max(0, defaultValue);
    }
    // Ensure non-negative
    return Math.max(0, parsed);
  }

  // Fallback for any other type
  return Math.max(0, defaultValue);
}

/**
 * Format a numeric value for display
 * Ensures consistent formatting and handles edge cases
 */
export function formatVestingValue(value: any, decimals: number = 8): string {
  const safeValue = safeParseNumeric(value, 0);
  return safeValue.toFixed(decimals);
}

/**
 * Calculate vesting yield with safety checks
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
  // Parse inputs safely
  const safeMxiPurchased = safeParseNumeric(mxiPurchased, 0);
  const safeAccumulatedYield = safeParseNumeric(accumulatedYield, 0);

  // Calculate maximum monthly yield
  const maxMonthlyYield = safeMxiPurchased * monthlyYieldPercentage;

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

  // Calculate yield per second
  const SECONDS_IN_MONTH = 2592000; // 30 days
  const yieldPerSecond = maxMonthlyYield / SECONDS_IN_MONTH;

  // Calculate time elapsed since last update
  const now = Date.now();
  const lastUpdate = new Date(lastYieldUpdate).getTime();
  const secondsElapsed = Math.max(0, (now - lastUpdate) / 1000);

  // Calculate session yield
  const sessionYield = Math.max(0, yieldPerSecond * secondsElapsed);

  // Calculate current total yield
  const totalYield = Math.max(0, safeAccumulatedYield + sessionYield);

  // Cap at monthly maximum
  const currentYield = Math.min(totalYield, maxMonthlyYield);

  // Calculate progress percentage
  const progressPercentage = maxMonthlyYield > 0 
    ? Math.min(100, (currentYield / maxMonthlyYield) * 100)
    : 0;

  return {
    currentYield: Math.max(0, currentYield),
    sessionYield: Math.max(0, sessionYield),
    maxMonthlyYield: Math.max(0, maxMonthlyYield),
    yieldPerSecond: Math.max(0, yieldPerSecond),
    progressPercentage: Math.max(0, progressPercentage),
  };
}
