
# Ambassador Bonus Withdrawal Fix - Complete Summary

## Problem Identified

When users requested an ambassador bonus withdrawal, the withdrawal request was successfully created in the database but **did not appear in the admin panel** for approval.

## Root Cause

The issue was caused by **missing RLS (Row Level Security) policies** on the `ambassador_bonus_withdrawals` table. The existing policies only allowed:

1. Users to view their own withdrawals
2. Users to insert their own withdrawals

**There were NO policies allowing admins to view or update withdrawal requests**, which prevented the admin panel from accessing the data.

## Solution Implemented

### 1. Added Admin RLS Policies

Created two new RLS policies for the `ambassador_bonus_withdrawals` table:

```sql
-- Allow admins to view all ambassador bonus withdrawals
CREATE POLICY "Admins can view all ambassador bonus withdrawals"
ON ambassador_bonus_withdrawals
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
  )
);

-- Allow admins to update ambassador bonus withdrawals
CREATE POLICY "Admins can update ambassador bonus withdrawals"
ON ambassador_bonus_withdrawals
FOR UPDATE
TO public
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
  )
);
```

### 2. Added Real-time Notification Trigger

Created a database trigger to notify admins immediately when a new withdrawal request is created:

```sql
-- Function to broadcast new withdrawal requests
CREATE OR REPLACE FUNCTION broadcast_new_ambassador_withdrawal()
RETURNS TRIGGER AS $$
DECLARE
  v_user_name TEXT;
  v_user_email TEXT;
BEGIN
  -- Get user info
  SELECT name, email INTO v_user_name, v_user_email
  FROM users
  WHERE id = NEW.user_id;

  -- Broadcast to admin channel
  PERFORM pg_notify(
    'admin_updates',
    json_build_object(
      'type', 'new_ambassador_withdrawal',
      'withdrawal_id', NEW.id,
      'user_id', NEW.user_id,
      'user_name', v_user_name,
      'user_email', v_user_email,
      'bonus_amount', NEW.bonus_amount,
      'level_achieved', NEW.level_achieved,
      'created_at', NEW.created_at
    )::text
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on INSERT
CREATE TRIGGER new_ambassador_withdrawal_trigger
AFTER INSERT ON ambassador_bonus_withdrawals
FOR EACH ROW
EXECUTE FUNCTION broadcast_new_ambassador_withdrawal();
```

## Current RLS Policies on ambassador_bonus_withdrawals

After the fix, the table now has the following policies:

1. **"Users can view their own withdrawals"** (SELECT) - Users can see their own withdrawal history
2. **"Users can insert their own withdrawals"** (INSERT) - Users can create withdrawal requests
3. **"Admins can view all ambassador bonus withdrawals"** (SELECT) - Admins can see all withdrawal requests ✅ NEW
4. **"Admins can update ambassador bonus withdrawals"** (UPDATE) - Admins can approve/reject withdrawals ✅ NEW

## Verification

### Existing Withdrawal Request

There is currently 1 pending withdrawal request in the database:

- **User**: Camilo Andress Lopez (inversionesingo@gmail.com)
- **Level Achieved**: 3 (Oro)
- **Bonus Amount**: 140 USDT
- **USDT Address**: TUL3LanjVj5kTQZKEbAEmoGt6hNudqZuFr
- **Status**: pending
- **Created**: 2025-12-04 21:36:13 UTC

This withdrawal should now be visible in the admin panel at:
`app/(tabs)/(admin)/ambassador-withdrawals.tsx`

## How It Works Now

### User Flow:
1. User navigates to "Embajadores MXI" screen
2. User clicks "Solicitar Retiro de Bono"
3. User enters their USDT TRC20 address
4. User confirms the withdrawal
5. RPC function `request_ambassador_bonus_withdrawal` creates a record in `ambassador_bonus_withdrawals`
6. Database trigger fires and broadcasts notification to admin channel
7. User sees confirmation message

### Admin Flow:
1. Admin navigates to "Retiros de Embajadores" screen
2. Admin sees all pending withdrawal requests (thanks to new RLS policy)
3. Admin can click "Revisar" to review a request
4. Admin can approve or reject the withdrawal
5. On approval:
   - Withdrawal status is updated to 'completed'
   - Ambassador level bonuses are marked as withdrawn
   - User receives real-time notification
6. On rejection:
   - Withdrawal status is updated to 'rejected'
   - Admin notes are saved
   - User receives real-time notification

## Files Involved

### Frontend:
- `app/(tabs)/(home)/embajadores-mxi.tsx` - User interface for ambassador program
- `app/(tabs)/(admin)/ambassador-withdrawals.tsx` - Admin panel for managing withdrawals
- `contexts/RealtimeContext.tsx` - Real-time updates context

### Database:
- `ambassador_bonus_withdrawals` table - Stores withdrawal requests
- `ambassador_levels` table - Tracks user progress and withdrawn bonuses
- RPC function: `request_ambassador_bonus_withdrawal` - Creates withdrawal requests
- RPC function: `update_ambassador_level` - Updates ambassador level data
- RPC function: `calculate_withdrawable_bonus` - Calculates available bonuses

## Testing Checklist

- [x] Verify RLS policies are in place
- [x] Verify trigger is created
- [x] Verify existing withdrawal request is in database
- [ ] Test admin can view withdrawal requests in admin panel
- [ ] Test admin can approve withdrawal requests
- [ ] Test admin can reject withdrawal requests
- [ ] Test user receives real-time notification on approval/rejection
- [ ] Test new withdrawal requests appear immediately in admin panel

## Next Steps

1. **Test the admin panel** - Log in as an admin and verify the pending withdrawal is visible
2. **Test approval flow** - Approve the pending withdrawal and verify:
   - Status changes to 'completed'
   - Ambassador level bonuses are marked as withdrawn
   - User receives notification
3. **Test new withdrawal** - Create a new withdrawal request and verify it appears immediately in admin panel

## Important Notes

- All withdrawal requests require:
  - KYC approved
  - At least 1 personal purchase
  - Available bonuses to withdraw
- Withdrawals are processed manually by admins within 24-48 hours
- Only USDT TRC20 addresses are accepted
- Bonuses are cumulative and based on Level 1 referral purchases

## Migration Applied

Migration name: `add_admin_policy_ambassador_withdrawals`
Migration name: `add_ambassador_withdrawal_insert_trigger`

Both migrations have been successfully applied to the database.
