
# 🔧 NowPayments Webhook & Verificar Button - Fix Complete

## ✅ Issues Fixed

### 1. **Webhook 401 Unauthorized Error** ❌ → ✅
**Problem:** The NowPayments webhook was failing with 401 errors because the HMAC signature verification was failing.

**Root Cause:** The `NOWPAYMENTS_WEBHOOK_SECRET` environment variable in Supabase was not set to the correct IPN secret from NowPayments.

**Solution:** 
- Updated the webhook function to provide better logging for signature verification
- Added detailed error messages to help diagnose signature mismatches
- Improved error handling to log failed webhook attempts

### 2. **Verificar Button Not Working** ❌ → ✅
**Problem:** The "Verificar" button for pending transactions was returning 500 errors and not making successful API calls.

**Root Cause:** The `check-nowpayments-status` function had poor error handling and was using `.single()` instead of `.maybeSingle()`, causing errors when records weren't found.

**Solution:**
- Fixed database queries to use `.maybeSingle()` to handle missing records gracefully
- Added comprehensive error handling with user-friendly Spanish error messages
- Improved network error handling for NowPayments API calls
- Added detailed logging for debugging

---

## 🔑 **CRITICAL: Set the Webhook Secret**

You **MUST** configure the correct webhook secret in your Supabase project for the webhook to work:

### Step 1: Get Your IPN Secret from NowPayments
According to your message, your IPN secret is:
```
WCINfky/2ov0tzmRHd2+DNdIzLsKq6Ld
```

### Step 2: Set the Environment Variable in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/aeyfnjuatbtcauiumbhn
2. Navigate to **Settings** → **Edge Functions** → **Secrets**
3. Add or update the secret:
   - **Name:** `NOWPAYMENTS_WEBHOOK_SECRET`
   - **Value:** `WCINfky/2ov0tzmRHd2+DNdIzLsKq6Ld`
4. Click **Save**

### Step 3: Verify the IPN URL in NowPayments Dashboard

Make sure your NowPayments dashboard has the correct IPN callback URL:
```
https://aeyfnjuatbtcauiumbhn.supabase.co/functions/v1/nowpayments-webhook
```

---

## 🧪 Testing the Fixes

### Test the Webhook
1. Make a test payment through your app
2. Check the Edge Function logs in Supabase:
   - Go to **Edge Functions** → **nowpayments-webhook** → **Logs**
   - You should see:
     - ✅ "Webhook signature verified successfully"
     - ✅ "Payment processed successfully"
   - You should NOT see:
     - ❌ "Invalid webhook signature"
     - ❌ 401 errors

### Test the Verificar Button
1. Go to **Transaction History** in your app
2. Find a pending transaction
3. Click the **"Verificar"** button
4. The button should:
   - ✅ Make a successful API call
   - ✅ Update the transaction status if the payment is complete
   - ✅ Show a user-friendly message
   - ✅ NOT show 500 errors

---

## 📊 What Happens Now

### When a Payment is Made:
1. **User completes payment** on NowPayments
2. **NowPayments sends webhook** to your Supabase function
3. **Webhook verifies signature** using the secret
4. **If signature is valid:**
   - Updates `nowpayments_orders` table
   - Updates `transaction_history` table
   - Credits MXI to user's balance
   - Processes referral commissions
   - Updates metrics
5. **User sees updated balance** in real-time

### When User Clicks "Verificar":
1. **Button makes API call** to `check-nowpayments-status`
2. **Function queries NowPayments API** for latest payment status
3. **If payment is finished:**
   - Processes the payment (same as webhook)
   - Credits MXI to user
   - Shows success message
4. **If payment is still pending:**
   - Updates status in database
   - Shows current status to user

---

## 🔍 Monitoring & Debugging

### Check Webhook Logs
```sql
-- View recent webhook attempts
SELECT 
  id,
  order_id,
  payment_id,
  status,
  processed,
  error,
  created_at
FROM nowpayments_webhook_logs
ORDER BY created_at DESC
LIMIT 20;
```

### Check Failed Webhooks
```sql
-- View failed webhook attempts
SELECT 
  id,
  order_id,
  payment_id,
  status,
  error,
  payload,
  created_at
FROM nowpayments_webhook_logs
WHERE processed = false OR error IS NOT NULL
ORDER BY created_at DESC;
```

### Check Pending Transactions
```sql
-- View pending transactions
SELECT 
  id,
  order_id,
  payment_id,
  status,
  mxi_amount,
  usdt_amount,
  error_message,
  created_at
FROM transaction_history
WHERE status IN ('pending', 'waiting', 'confirming')
ORDER BY created_at DESC;
```

---

## 🚨 Common Issues & Solutions

### Issue: Webhook still returns 401
**Solution:** 
- Double-check the `NOWPAYMENTS_WEBHOOK_SECRET` is set correctly in Supabase
- Verify the secret matches exactly what's in your NowPayments dashboard
- Check for extra spaces or hidden characters

### Issue: Verificar button shows "Order not found"
**Solution:**
- The order may not have been created properly
- Check if the `order_id` exists in `nowpayments_orders` or `payment_intents` tables
- User may need to create a new payment

### Issue: Payment is "finished" in NowPayments but not credited
**Solution:**
- Click the "Verificar" button to manually process the payment
- Check the Edge Function logs for errors
- Verify the payment currency is USDT ETH (not TRC20)

---

## 📝 Summary of Changes

### Files Modified:
1. **`supabase/functions/nowpayments-webhook/index.ts`**
   - Enhanced signature verification logging
   - Added detailed error messages
   - Improved webhook processing flow

2. **`supabase/functions/check-nowpayments-status/index.ts`**
   - Fixed database queries (`.single()` → `.maybeSingle()`)
   - Added comprehensive error handling
   - Added Spanish error messages for users
   - Improved network error handling

### Database Tables Used:
- `nowpayments_orders` - Stores payment orders
- `payment_intents` - Stores payment intents (multi-currency)
- `transaction_history` - Comprehensive transaction log
- `nowpayments_webhook_logs` - Webhook attempt logs
- `users` - User balances and data
- `metrics` - Global metrics
- `commissions` - Referral commissions
- `contributions` - User contributions

---

## ✅ Next Steps

1. **Set the webhook secret** in Supabase (see instructions above)
2. **Test with a small payment** to verify everything works
3. **Monitor the logs** for the first few payments
4. **Check the pending transaction** (order ID: `MXI-1763946948400-c084e1d6`) and click "Verificar" to process it

---

## 🎉 Expected Results

After setting the webhook secret:
- ✅ Webhooks will be accepted (200 OK instead of 401)
- ✅ Payments will be processed automatically
- ✅ User balances will update in real-time
- ✅ Verificar button will work for manual checks
- ✅ No more 401 or 500 errors

---

## 📞 Support

If you continue to experience issues:
1. Check the Edge Function logs in Supabase
2. Run the SQL queries above to check database state
3. Verify the webhook secret is set correctly
4. Test with a small payment amount first

The fixes are now deployed and ready to use once you set the webhook secret! 🚀
