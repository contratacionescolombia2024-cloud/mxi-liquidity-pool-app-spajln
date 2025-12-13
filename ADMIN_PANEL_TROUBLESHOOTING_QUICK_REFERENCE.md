
# 🔧 ADMIN PANEL TROUBLESHOOTING - QUICK REFERENCE

**Quick fixes for common admin panel issues**

---

## ❌ ISSUE: "0.00 USDT" Displayed in Manual Verification

### ✅ SOLUTION: RLS Policy Fix (APPLIED)

**Status:** ✅ **FIXED** - Migration applied on 2025-01-13

The issue was RLS policies blocking admin access to payment data.

### Verify the Fix:

1. **Check if you're an admin:**
   ```sql
   SELECT * FROM admin_users WHERE user_id = auth.uid();
   ```
   Should return your admin record.

2. **Check RLS policies:**
   ```sql
   SELECT policyname FROM pg_policies 
   WHERE tablename = 'payments' 
   AND policyname LIKE '%Admin%';
   ```
   Should show:
   - ✅ "Admins can view all payments"
   - ✅ "Admins can update all payments"

3. **Test payment access:**
   ```sql
   SELECT id, order_id, price_amount, mxi_amount 
   FROM payments 
   LIMIT 5;
   ```
   Should return payment data (not empty).

### If Still Not Working:

1. **Clear browser cache** and hard refresh (Ctrl+Shift+R)
2. **Log out and log back in** to refresh session
3. **Check browser console** for errors
4. **Verify you're logged in as admin** (not regular user)

---

## ❌ ISSUE: Cannot See Any Verification Requests

### Possible Causes:

1. **No pending requests:**
   - Check "Todas" tab to see all requests
   - Users may not have submitted any requests

2. **RLS policy blocking:**
   ```sql
   SELECT * FROM pg_policies 
   WHERE tablename = 'manual_verification_requests';
   ```
   Should show "Admins can view all verification requests"

3. **Not logged in as admin:**
   ```sql
   SELECT * FROM admin_users WHERE user_id = auth.uid();
   ```
   Should return a row.

---

## ❌ ISSUE: Amounts Show as "NaN" or "undefined"

### ✅ SOLUTION: Data Type Handling

The admin panel uses `safeParseNumeric()` to handle PostgreSQL numeric types (returned as strings).

**Check:**
1. Payment data exists in database
2. RLS policies allow admin access
3. Browser console for parsing errors

**Fix:**
- Already implemented in `manual-verification-requests.tsx`
- Uses pre-parsed values: `price_amount_parsed`, `mxi_amount_parsed`

---

## ❌ ISSUE: "Payment not found" Error

### Possible Causes:

1. **Payment record doesn't exist:**
   ```sql
   SELECT * FROM payments WHERE order_id = 'MXI-...';
   ```

2. **Manual verification request has wrong payment_id:**
   ```sql
   SELECT mvr.*, p.order_id 
   FROM manual_verification_requests mvr
   LEFT JOIN payments p ON mvr.payment_id = p.id
   WHERE mvr.id = 'request-id';
   ```

3. **RLS blocking payment access** (should be fixed now)

---

## ❌ ISSUE: Approval Doesn't Credit User

### Check Edge Function Logs:

```bash
# In Supabase Dashboard > Edge Functions > manual-verify-payment > Logs
```

Look for:
- ✅ "Payment verified and credited successfully"
- ❌ Error messages

### Common Issues:

1. **Payment already credited:**
   - Check payment status: should be "pending" or "waiting"
   - If "finished" or "confirmed", already credited

2. **Invalid approved amount:**
   - Must be > 0
   - Must be a valid number

3. **User not found:**
   - Check user exists in database
   - Check user_id matches payment.user_id

---

## 🔍 DEBUGGING CHECKLIST

### 1. Verify Admin Access:
```sql
-- Am I an admin?
SELECT * FROM admin_users WHERE user_id = auth.uid();

-- Can I see payments?
SELECT COUNT(*) FROM payments;

-- Can I see users?
SELECT COUNT(*) FROM users;

-- Can I see verification requests?
SELECT COUNT(*) FROM manual_verification_requests;
```

### 2. Check Data Integrity:
```sql
-- Verification requests with payment data
SELECT 
  mvr.id,
  mvr.order_id,
  mvr.status,
  p.price_amount,
  p.mxi_amount,
  p.status as payment_status
FROM manual_verification_requests mvr
LEFT JOIN payments p ON mvr.payment_id = p.id
WHERE mvr.status = 'pending'
ORDER BY mvr.created_at DESC
LIMIT 10;
```

### 3. Check RLS Policies:
```sql
-- All policies for critical tables
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('payments', 'users', 'manual_verification_requests')
ORDER BY tablename, policyname;
```

---

## 🚨 EMERGENCY FIXES

### Reset Admin Session:
1. Log out completely
2. Clear browser cache
3. Close all browser tabs
4. Log back in

### Verify Database Connection:
```sql
SELECT NOW(); -- Should return current timestamp
```

### Check Supabase Status:
- Visit: https://status.supabase.com/
- Check for ongoing incidents

---

## 📞 ESCALATION PATH

If issue persists after trying all fixes:

1. **Check browser console** for JavaScript errors
2. **Check Supabase logs** for database errors
3. **Check Edge Function logs** for API errors
4. **Document the issue:**
   - What you tried
   - Error messages
   - Screenshots
   - Database query results

---

## 🎯 QUICK TESTS

### Test 1: Can I see payment amounts?
```typescript
// In browser console (while on admin panel)
const { data } = await supabase.from('payments').select('*').limit(1);
console.log('Payment data:', data);
// Should show payment with price_amount and mxi_amount
```

### Test 2: Is parsing working?
```typescript
// In browser console
const testValue = "30.00";
const parsed = parseFloat(testValue);
console.log('Parsed:', parsed, 'Type:', typeof parsed);
// Should show: Parsed: 30 Type: number
```

### Test 3: Am I admin?
```typescript
// In browser console
const { data } = await supabase.from('admin_users').select('*').eq('user_id', (await supabase.auth.getUser()).data.user.id);
console.log('Admin status:', data);
// Should show your admin record
```

---

## ✅ SUCCESS INDICATORS

You know it's working when:

- ✅ Amounts display correctly (not 0.00)
- ✅ User names and emails show
- ✅ MXI amounts calculate correctly
- ✅ Approval/rejection works
- ✅ No console errors
- ✅ Real-time updates work

---

**Last Updated:** January 13, 2025  
**Status:** All known issues resolved  
**Next Review:** As needed
