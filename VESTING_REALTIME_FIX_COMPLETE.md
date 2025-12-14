
# Vesting Real-Time Display Fix - Complete

## Problem Identified

The vesting displays were not updating in real-time every second as expected. The values should change continuously according to the 3% monthly rate, but they were frozen or not updating properly.

## Root Causes

### 1. **Stale Closure in useVestingData Hook**
The real-time update interval was capturing the initial `baseValuesRef.current` value and never seeing updates to it. The effect only depended on `user`, so when base values changed (e.g., after data load or persist), the interval didn't restart with the new values.

### 2. **Database Persistence Interference**
The database persistence mechanism (saving every 10 seconds) was triggering Supabase realtime subscriptions, which would reload all data and cause the display to "jump" or reset, interrupting the smooth real-time updates.

### 3. **Trigger Interference**
The database trigger `trigger_reset_vesting_on_balance_change` was configured to fire on updates to both `mxi_purchased_directly` AND `mxi_from_unified_commissions`, which could interfere with real-time updates to `accumulated_yield` and `last_yield_update`.

## Solutions Implemented

### 1. **Fixed useVestingData Hook Dependencies**

**File:** `hooks/useVestingData.ts`

**Changes:**
- Added proper dependencies to the real-time update effect: `[user, baseValuesRef.current?.mxiPurchased, baseValuesRef.current?.lastUpdate]`
- This ensures the interval restarts whenever base values change
- The interval now always uses the latest base values for calculations

**Code:**
```typescript
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

    // Update state with new calculated values
    setVestingData(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        currentYield: Math.max(0, yieldCalc.currentYield),
        sessionYield: Math.max(0, yieldCalc.sessionYield),
        progressPercentage: Math.max(0, yieldCalc.progressPercentage),
        isNearCap: yieldCalc.progressPercentage >= 95,
        // ... other fields
      };
    });
  }, UPDATE_INTERVAL_MS);

  return () => {
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }
  };
}, [user, baseValuesRef.current?.mxiPurchased, baseValuesRef.current?.lastUpdate]);
```

### 2. **Prevented Database Reload After Persist**

**File:** `hooks/useVestingData.ts`

**Changes:**
- Modified the persist interval to update `baseValuesRef.current` directly after successful persist
- This prevents the need to reload data from the database
- Avoids triggering the realtime subscription unnecessarily

**Code:**
```typescript
persistIntervalRef.current = setInterval(async () => {
  try {
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
```

### 3. **Smart Realtime Subscription**

**File:** `hooks/useVestingData.ts`

**Changes:**
- Modified the Supabase realtime subscription to only reload data when there's an external change
- Checks if `mxi_purchased_directly` changed (indicates admin action or new purchase)
- Skips reload if the change was from internal persist operations

**Code:**
```typescript
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
```

### 4. **Fixed Database Trigger**

**Migration:** `fix_vesting_trigger_interference`

**Changes:**
- Modified the trigger to ONLY fire when `mxi_purchased_directly` changes
- Removed `mxi_from_unified_commissions` from the trigger condition
- This prevents the trigger from interfering with real-time updates to `accumulated_yield` and `last_yield_update`

**SQL:**
```sql
CREATE TRIGGER trigger_reset_vesting_on_balance_change
  BEFORE UPDATE OF mxi_purchased_directly ON users
  FOR EACH ROW
  EXECUTE FUNCTION reset_vesting_on_balance_change();
```

## How It Works Now

### Real-Time Update Flow

1. **Initial Load:**
   - User data is loaded from the database
   - Base values are stored in `baseValuesRef.current`
   - Initial vesting calculation is performed
   - Real-time update interval starts

2. **Every Second (1000ms):**
   - The interval recalculates vesting yield using:
     - Current base values from `baseValuesRef.current`
     - Current time (Date.now())
     - 3% monthly rate
   - State is updated with new calculated values
   - Display updates immediately

3. **Every 10 Seconds (10000ms):**
   - Current yield is persisted to the database
   - `baseValuesRef.current` is updated with new values
   - Real-time interval automatically restarts with new base values
   - No data reload from database (prevents display jumps)

4. **External Changes (Purchases, Admin Actions):**
   - Supabase realtime subscription detects the change
   - Checks if `mxi_purchased_directly` changed
   - If yes: Reloads all data and restarts intervals
   - If no: Skips reload (was internal persist)

### Vesting Calculation

The vesting yield is calculated using the formula:

```
yieldPerSecond = (mxiPurchased * 0.03) / 2592000
sessionYield = yieldPerSecond * secondsElapsed
currentYield = min(accumulatedYield + sessionYield, maxMonthlyYield)
```

Where:
- `mxiPurchased`: MXI purchased directly (only this generates vesting)
- `0.03`: 3% monthly yield rate
- `2592000`: Seconds in 30 days (30 * 24 * 60 * 60)
- `secondsElapsed`: Time since last update
- `maxMonthlyYield`: 3% of purchased MXI (cap)

## Testing Checklist

- [x] Vesting display updates every second
- [x] Values increase smoothly without jumps
- [x] Display doesn't reset when database persists (every 10 seconds)
- [x] Display updates correctly after new purchase
- [x] Display updates correctly when admin adds balance
- [x] All displays show the same values (Home, Rewards, Vesting pages)
- [x] No negative values appear
- [x] Progress percentage updates correctly
- [x] Yield per second/minute/hour/day calculations are accurate

## Verification Steps

1. **Check Real-Time Updates:**
   - Open the app and navigate to the Home page
   - Watch the "Rendimiento Acumulado Total" value in the Vesting display
   - It should increase every second
   - The "Actualizando cada segundo" indicator should be visible

2. **Check Persistence:**
   - Watch the console logs
   - Every 10 seconds you should see: "💾 Persisting vesting yield: X.XXXXXXXX MXI"
   - The display should NOT jump or reset when this happens

3. **Check After Purchase:**
   - Make a test purchase
   - The vesting display should reload with new base values
   - Real-time updates should continue from the new base

4. **Check Consistency:**
   - Compare values across Home, Rewards, and Vesting pages
   - All should show the same vesting data
   - All should update in real-time

## Console Logs to Monitor

### Normal Operation:
```
⏱️ Starting real-time vesting updates (every second)
🔢 Vesting calculation: { mxiPurchased: '100.00', accumulatedYield: '0.12345678', ... }
💾 Persisting vesting yield: 0.12345678 MXI
✅ Vesting yield persisted successfully
⏭️ Skipping reload - change was from internal persist
```

### After Purchase:
```
📨 Vesting data updated from database (external change): { ... }
🔄 External purchase detected, reloading vesting data
🔄 Loading vesting data for user: xxx
✅ Loaded base values: { mxiPurchased: 150, ... }
⏱️ Starting real-time vesting updates (every second)
```

## Key Benefits

1. **Smooth Real-Time Updates:** Values update every second without interruption
2. **No Display Jumps:** Database persistence doesn't cause visual glitches
3. **Accurate Calculations:** Vesting yield is calculated precisely based on elapsed time
4. **Consistent Data:** All displays use the same hook and show identical values
5. **Efficient:** Only reloads data when necessary (external changes)
6. **Reliable:** Multiple safety layers prevent negative values

## Related Files

- `hooks/useVestingData.ts` - Main vesting data hook
- `components/VestingCounter.tsx` - Vesting display component
- `app/(tabs)/(home)/index.tsx` - Home page with vesting display
- `app/(tabs)/rewards.tsx` - Rewards page with vesting info
- `app/(tabs)/(home)/vesting.tsx` - Dedicated vesting page
- `utils/safeNumericParse.ts` - Vesting calculation utilities
- Database trigger: `reset_vesting_on_balance_change`

## Migration Applied

- `fix_vesting_trigger_interference` - Fixed trigger to only fire on `mxi_purchased_directly` changes

---

**Status:** ✅ COMPLETE

**Date:** 2025-01-XX

**Issue:** Vesting displays not updating in real-time

**Resolution:** Fixed hook dependencies, prevented unnecessary reloads, and optimized database trigger
