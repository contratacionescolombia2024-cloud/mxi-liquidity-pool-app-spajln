
# System Notifications and Settings Update

## Overview
This update implements a comprehensive system for separating automated system notifications from user support messages, and adds full configurability for all app metrics and percentages.

## Changes Implemented

### 1. System Notifications Table
**File:** Database Migration `create_system_notifications_table`

Created a new `system_notifications` table to store automated system messages separately from user support messages:

- **Table:** `system_notifications`
- **Purpose:** Store automated notifications (payment verified, balance added, commissions, etc.)
- **Separation:** User support messages remain in the `messages` table
- **RLS Policies:** 
  - Users can view/update their own notifications
  - System can insert notifications
  - Admins can view all notifications

**Notification Types:**
- `payment_verified` - Payment has been verified and credited
- `balance_added` - Balance manually added by admin
- `commission_earned` - Referral commission earned
- `withdrawal_approved` - Withdrawal request approved
- `kyc_status_change` - KYC verification status changed
- `vesting_milestone` - Vesting milestone reached
- `referral_bonus` - Ambassador bonus earned
- `system_announcement` - General system announcements

### 2. System Notifications Utility
**File:** `utils/systemNotifications.ts`

Created helper functions to send system notifications:

```typescript
// Send payment verified notification
await notifyPaymentVerified(userId, orderId, usdtAmount, mxiAmount);

// Send balance added notification
await notifyBalanceAdded(userId, mxiAmount, source);

// Send commission earned notification
await notifyCommissionEarned(userId, amount, level, fromUserName);

// And more...
```

### 3. Admin System Notifications Screen
**File:** `app/(tabs)/(admin)/system-notifications.tsx`

New admin screen to view all system notifications:

- Filter by type (all, payments, balance, commissions)
- View notification details and metadata
- See which users received notifications
- Track read/unread status

### 4. Comprehensive Admin Settings
**File:** Database Migration `update_admin_settings_with_real_metrics`

Added all app metrics and percentages to `admin_settings` table:

**Commission Settings:**
- `commission_level_1_percentage` - Level 1 referral commission (5%)
- `commission_level_2_percentage` - Level 2 referral commission (2%)
- `commission_level_3_percentage` - Level 3 referral commission (1%)

**Phase Prices:**
- `phase_1_price` - Phase 1 MXI price (0.30 USDT)
- `phase_2_price` - Phase 2 MXI price (0.60 USDT)
- `phase_3_price` - Phase 3 MXI price (0.90 USDT)

**Phase Allocations:**
- `phase_1_allocation` - Phase 1 token allocation (8,333,333 MXI)
- `phase_2_allocation` - Phase 2 token allocation (8,333,333 MXI)
- `phase_3_allocation` - Phase 3 token allocation (8,333,334 MXI)
- `total_presale_allocation` - Total presale allocation (25,000,000 MXI)

**Vesting Settings:**
- `vesting_monthly_percentage` - Monthly vesting rate (3%)
- `vesting_calculation_frequency` - Calculation frequency (hourly)

**Ambassador Program:**
- `ambassador_level_X_threshold` - Purchase threshold for each level
- `ambassador_level_X_bonus` - Bonus amount for each level (6 levels)

**Pool Settings:**
- `pool_member_count_start` - Starting member count (56,527)
- `pool_member_count_max` - Maximum member count (250,000)

**Tournament Settings:**
- `tournament_entry_fee` - Entry fee (3 MXI)
- `tournament_winner_percentage` - Winner's share (90%)
- `tournament_admin_percentage` - Admin's share (10%)

### 5. Enhanced Settings Screen
**File:** `app/(tabs)/(admin)/settings.tsx`

Updated admin settings screen with new sections:

- **Platform Metrics** - Core metrics (price, phase, tokens sold, members)
- **Core Settings** - MXI price, mining rate
- **Transaction Limits** - Min/max purchase amounts
- **Withdrawal Settings** - Release percentage, days, min referrals
- **Commission Percentages** - All 3 levels
- **Phase Prices** - Prices for all 3 phases
- **Phase Allocations** - Token allocations
- **Vesting Configuration** - Percentage and frequency
- **Ambassador Program** - All 6 levels with thresholds and bonuses
- **Pool Member Count** - Start and max counts
- **Tournament Configuration** - Entry fees and prize distribution

All settings are editable with confirmation dialogs.

### 6. Updated Admin Dashboard
**File:** `app/(tabs)/(admin)/index.tsx`

Added "System Notifications" button to admin dashboard quick actions.

### 7. Confirmation Dialog Improvements
**Files:** `utils/confirmDialog.ts`, `components/ConfirmDialog.tsx`

Enhanced confirmation dialogs to work properly on all platforms:
- Native: Uses `Alert.alert`
- Web: Uses custom modal component
- Proper error handling
- Support for different types (info, warning, error, success)
- Single-button and two-button modes

## Usage Examples

### Sending System Notifications

```typescript
import { notifyPaymentVerified, notifyBalanceAdded } from '@/utils/systemNotifications';

// When a payment is verified
await notifyPaymentVerified(userId, orderId, 50, 166.67);

// When admin adds balance manually
await notifyBalanceAdded(userId, 100, 'Manual Admin Credit');
```

### Updating Settings

Admins can now modify any setting through the Settings screen:
1. Navigate to Admin Panel → Settings
2. Find the setting to modify
3. Tap on the setting card
4. Enter new value
5. Confirm the change

### Viewing System Notifications

Admins can view all system notifications:
1. Navigate to Admin Panel → System Notifications
2. Filter by type (all, payments, balance, commissions)
3. View notification details

## Database Schema

### system_notifications Table

```sql
CREATE TABLE system_notifications (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  notification_type text CHECK (notification_type IN (...)),
  title text NOT NULL,
  message text NOT NULL,
  metadata jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### admin_settings Table (Updated)

All new settings follow this structure:
```json
{
  "setting_key": "commission_level_1_percentage",
  "setting_value": {"value": 5},
  "description": "Commission percentage for Level 1 referrals"
}
```

## RLS Policies

### system_notifications
- ✅ Users can view their own notifications
- ✅ Users can update their own notifications (mark as read)
- ✅ System can insert notifications
- ✅ Admins can view all notifications

### admin_settings
- ✅ Admins can view all settings
- ✅ Admins can update settings
- ✅ All updates are logged with admin_id and timestamp

## Migration Path

1. **Database migrations** are automatically applied
2. **No data loss** - existing messages remain in `messages` table
3. **New notifications** will go to `system_notifications` table
4. **Settings** are pre-populated with current values
5. **Backward compatible** - old code continues to work

## Testing Checklist

- [ ] System notifications are created correctly
- [ ] Admin can view system notifications
- [ ] Users receive notifications for payments
- [ ] Users receive notifications for balance changes
- [ ] Admin can edit all settings
- [ ] Settings changes are saved correctly
- [ ] Confirmation dialogs work on web and mobile
- [ ] RLS policies prevent unauthorized access
- [ ] No messages are sent to support inbox for automated events

## Future Enhancements

1. **User notification preferences** - Allow users to configure which notifications they want
2. **Email notifications** - Send important notifications via email
3. **Push notifications** - Integrate with Expo notifications
4. **Notification history** - Archive old notifications
5. **Bulk operations** - Send announcements to all users
6. **Notification templates** - Customizable notification templates

## Notes

- System notifications are separate from user support messages
- All app metrics are now configurable through admin settings
- Changes to settings take effect immediately
- Confirmation dialogs ensure admins don't make accidental changes
- All changes are logged for audit purposes
