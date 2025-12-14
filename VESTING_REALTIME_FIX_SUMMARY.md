
# Vesting Real-Time Calculation Fix - Summary

## Issue Reported
The user reported that vesting yields on the main page display were not updating correctly in real-time. The yields should increase at the established 3% monthly rate every second from the moment of purchase or when the administrator adds balance with commission.

## Root Causes Identified

### 1. Incorrect Trigger Logic
The `reset_vesting_on_balance_change()` trigger was:
- Including `mxi_from_unified_commissions` in vesting calculations (WRONG - only `mxi_purchased_directly` should generate vesting)
- Transferring accumulated yield to `mxi_vesting_locked` and resetting `accumulated_yield` to 0 on every purchase (WRONG - vesting should continue accumulating)

### 2. Real-Time Update Dependencies
The `useVestingData` hook's real-time update effect had a dependency on `baseValuesRef.current?.mxiPurchased`, which could cause the effect to not re-run properly when needed.

## Fixes Implemented

### 1. Fixed Database Trigger (`reset_vesting_on_balance_change`)
**File**: Database migration `fix_vesting_calculation_on_purchase`

**Changes**:
- ✅ Now ONLY uses `mxi_purchased_directly` for vesting calculations
- ✅ Commissions (`mxi_from_unified_commissions`) do NOT generate vesting
- ✅ Vesting continues accumulating when new purchases are made (does not reset to 0)
- ✅ Updates `last_yield_update` to current time when purchase is made
- ✅ All values are guaranteed to be non-negative using `GREATEST(0, ...)`

**Before**:
```sql
-- WRONG: Included commissions in vesting
v_old_balance := COALESCE(OLD.mxi_purchased_directly, 0) + COALESCE(OLD.mxi_from_unified_commissions, 0);
v_new_balance := COALESCE(NEW.mxi_purchased_directly, 0) + COALESCE(NEW.mxi_from_unified_commissions, 0);

-- WRONG: Reset accumulated yield to 0
NEW.mxi_vesting_locked := COALESCE(NEW.mxi_vesting_locked, 0) + v_capped_yield;
NEW.accumulated_yield := 0;
```

**After**:
```sql
-- CORRECT: Only use purchased MXI
v_old_purchased := COALESCE(OLD.mxi_purchased_directly, 0);
v_new_purchased := COALESCE(NEW.mxi_purchased_directly, 0);

-- CORRECT: Continue accumulating vesting
NEW.accumulated_yield := GREATEST(0, v_capped_yield);
NEW.last_yield_update := NOW();
```

### 2. Improved Real-Time Updates (`useVestingData` hook)
**File**: `hooks/useVestingData.ts`

**Changes**:
- ✅ Simplified dependency array to only depend on `user` (not on `baseValuesRef.current`)
- ✅ Added `isMountedRef` to prevent state updates on unmounted components
- ✅ Added check to skip real-time updates if no MXI purchased
- ✅ Improved logging for debugging

**Key improvement**:
```typescript
// Before: Dependency on baseValuesRef.current?.mxiPurchased could cause issues
useEffect(() => {
  // ...
}, [user, baseValuesRef.current?.mxiPurchased]);

// After: Only depend on user, check mxiPurchased inside effect
useEffect(() => {
  if (!user || !baseValuesRef.current) return;
  
  const baseValues = baseValuesRef.current;
  if (!baseValues.mxiPurchased || baseValues.mxiPurchased <= 0) {
    console.log('⏸️ No MXI purchased, skipping real-time updates');
    return;
  }
  
  // ... rest of effect
}, [user]); // Only depend on user
```

### 3. Enhanced Calculation Logging (`safeNumericParse.ts`)
**File**: `utils/safeNumericParse.ts`

**Changes**:
- ✅ Added detailed logging to `calculateVestingYield` function
- ✅ Logs calculation details for debugging:
  - MXI purchased
  - Accumulated yield
  - Seconds elapsed
  - Session yield
  - Current yield
  - Yield per second
  - Progress percentage

**Example log output**:
```
🔢 Vesting calculation: {
  mxiPurchased: '1166.67',
  accumulatedYield: '1.59015296',
  secondsElapsed: '3600',
  sessionYield: '0.00135000',
  currentYield: '1.59150296',
  yieldPerSecond: '0.0000003750',
  progressPercentage: '4.55%'
}
```

## How It Works Now

### Purchase Flow
1. User makes a purchase or admin adds balance with commission
2. `mxi_purchased_directly` is updated in the database
3. `reset_vesting_on_balance_change` trigger fires:
   - Calculates yield accumulated since last update
   - Adds session yield to accumulated yield
   - Updates `last_yield_update` to NOW
   - Does NOT reset accumulated yield to 0
4. Real-time subscription in `useVestingData` detects the change
5. Hook reloads data from database
6. Real-time updates continue every second from the new baseline

### Real-Time Update Flow
1. Every second, `useVestingData` hook recalculates yield:
   - Gets current time
   - Calculates seconds elapsed since `last_yield_update`
   - Calculates session yield: `yieldPerSecond * secondsElapsed`
   - Calculates current yield: `accumulatedYield + sessionYield`
   - Caps at 3% monthly maximum
2. Updates UI with new values
3. Every 10 seconds, persists current yield to database

### Vesting Calculation Formula
```
Monthly Yield = mxi_purchased_directly * 0.03 (3%)
Yield Per Second = Monthly Yield / 2,592,000 (30 days in seconds)
Session Yield = Yield Per Second * Seconds Elapsed
Current Yield = Accumulated Yield + Session Yield (capped at Monthly Yield)
```

## Testing Recommendations

### 1. Test Purchase Flow
1. Make a purchase
2. Verify vesting starts accumulating immediately
3. Verify yield increases every second
4. Make another purchase
5. Verify vesting continues accumulating (doesn't reset)

### 2. Test Admin Balance Addition
1. Admin adds balance with commission
2. Verify vesting starts/continues accumulating
3. Verify yield increases every second

### 3. Test Real-Time Updates
1. Open app and watch vesting display
2. Verify numbers update every second
3. Verify "Actualizando cada segundo" indicator is visible
4. Leave app open for 1 minute
5. Verify accumulated yield matches expected value

### 4. Test Database Persistence
1. Watch vesting accumulate for 10+ seconds
2. Close and reopen app
3. Verify accumulated yield persists
4. Verify vesting continues from where it left off

## Expected Behavior

### For User with 1000 MXI Purchased
- Maximum monthly yield: 30 MXI (3% of 1000)
- Yield per second: 0.00001157407 MXI
- Yield per minute: 0.00069444 MXI
- Yield per hour: 0.04166667 MXI
- Yield per day: 1.00000000 MXI

### Display Updates
- Main page vesting counter updates every second
- "Rendimiento Acumulado Total" shows current yield
- "Balance en Vesting" shows MXI purchased (source of vesting)
- Progress bar shows percentage toward 3% monthly cap
- All values are always non-negative

## Files Modified
1. Database migration: `fix_vesting_calculation_on_purchase`
2. `hooks/useVestingData.ts`
3. `utils/safeNumericParse.ts`

## Database Schema
- `users.mxi_purchased_directly`: Source of vesting (ONLY this generates 3% monthly yield)
- `users.mxi_from_unified_commissions`: Does NOT generate vesting
- `users.mxi_from_challenges`: Does NOT generate vesting
- `users.accumulated_yield`: Current accumulated vesting yield
- `users.last_yield_update`: Timestamp of last yield calculation
- `users.mxi_vesting_locked`: Locked vesting balance (not used in current flow)

## Key Points
✅ Only `mxi_purchased_directly` generates 3% monthly vesting
✅ Vesting accumulates continuously from purchase time
✅ Vesting does NOT reset when new purchases are made
✅ Real-time updates every second
✅ Database persistence every 10 seconds
✅ All values guaranteed non-negative
✅ Capped at 3% monthly maximum

## Monitoring
Check console logs for:
- `⏱️ Starting real-time vesting updates (every second)`
- `🔢 Vesting calculation:` (detailed calculation logs)
- `💾 Persisting vesting yield:` (every 10 seconds)
- `✅ Vesting yield persisted successfully`
- `Vesting updated on purchase:` (trigger logs)

## Date
Fixed: December 14, 2025
