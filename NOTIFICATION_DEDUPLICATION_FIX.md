
# Notification Deduplication Fix

## Problem
The app was sending multiple notifications for the same action (e.g., when receiving balance updates). This was causing users to receive many duplicate notifications for a single event.

## Root Cause
Multiple notification systems were triggering simultaneously without any deduplication mechanism:

1. **System Notifications** (`utils/systemNotifications.ts`) - Sending notifications to the database
2. **Local Notifications** (`utils/notificationService.ts`) - Sending push notifications
3. **Realtime Context** (`contexts/RealtimeContext.tsx`) - Broadcasting events that trigger notifications
4. **Edge Functions** - Triggering notifications when processing payments

All of these systems were operating independently, causing the same event to trigger multiple notifications.

## Solution

### 1. Notification Deduplication Service
Created a new utility `utils/notificationDeduplication.ts` that:
- Tracks recently sent notifications using a Map
- Blocks duplicate notifications within a 5-second window
- Automatically cleans up old entries every 10 seconds
- Generates unique keys based on notification type, user ID, and metadata

### 2. Updated System Notifications
Modified `utils/systemNotifications.ts` to:
- Check for duplicates before sending notifications
- Use the deduplication service to prevent multiple notifications
- Log when duplicate notifications are blocked

### 3. Updated Local Notification Service
Modified `utils/notificationService.ts` to:
- Check for duplicates before sending local notifications
- Include user ID in notification data for better tracking
- Use the deduplication service consistently

### 4. Updated Realtime Context
Modified `contexts/RealtimeContext.tsx` to:
- Use a processing flag to prevent concurrent event processing
- Check for duplicates before processing events
- Only send one notification per event type
- Properly handle event deduplication

### 5. Updated Edge Functions
Modified edge functions to:
- Send only ONE system notification per balance update
- Remove redundant notification calls
- Use proper error handling for notification failures

## How It Works

### Deduplication Key Generation
Each notification generates a unique key based on:
```typescript
{
  type: 'balance_updated',
  userId: 'user-123',
  metadata: '{"amount": 100}'
}
```

This creates a key like: `balance_updated:user-123:{"amount":100}`

### Time Window
- Notifications with the same key within 5 seconds are blocked
- After 5 seconds, the same notification can be sent again
- Old entries are cleaned up every 10 seconds

### Example Flow
1. User receives balance update
2. Edge function sends system notification → **Allowed** (first notification)
3. Realtime context broadcasts event → **Blocked** (duplicate within 5s)
4. Local notification service tries to send → **Blocked** (duplicate within 5s)
5. Result: User receives only ONE notification

## Benefits

1. **No More Duplicate Notifications**: Users receive only one notification per event
2. **Better User Experience**: Cleaner notification inbox
3. **Reduced Server Load**: Fewer database writes for notifications
4. **Consistent Behavior**: All notification systems use the same deduplication logic
5. **Automatic Cleanup**: Old entries are automatically removed

## Testing

To test the fix:

1. **Balance Update Test**:
   - Admin credits user balance
   - User should receive only ONE notification
   - Check system_notifications table for single entry

2. **Payment Verification Test**:
   - Complete a payment
   - User should receive only ONE payment confirmation
   - Check for duplicate notifications in logs

3. **Concurrent Events Test**:
   - Trigger multiple events simultaneously
   - Each event should generate only ONE notification
   - Verify deduplication logs in console

## Configuration

The deduplication window can be adjusted in `utils/notificationDeduplication.ts`:

```typescript
private readonly DEDUP_WINDOW_MS = 5000; // 5 seconds (default)
```

Increase this value if you want a longer deduplication window, or decrease it for a shorter window.

## Monitoring

Look for these log messages to monitor deduplication:

- `[NotificationDedup] Blocking duplicate notification: {key}` - Duplicate blocked
- `[NotificationDedup] Allowing notification: {key}` - Notification allowed
- `[NotificationDedup] Cleaned up {count} expired entries` - Cleanup performed
- `[SystemNotifications] Duplicate notification blocked` - System notification blocked
- `[NotificationService] Duplicate notification blocked` - Local notification blocked
- `[RealtimeContext] Duplicate {event} event blocked` - Realtime event blocked

## Files Modified

1. `utils/notificationDeduplication.ts` - **NEW** - Deduplication service
2. `utils/systemNotifications.ts` - Added deduplication checks
3. `utils/notificationService.ts` - Added deduplication checks
4. `contexts/RealtimeContext.tsx` - Added deduplication and processing flag
5. `supabase/functions/manual-verify-payment/index.ts` - Sends only one notification

## Migration Notes

- No database changes required
- No breaking changes to existing code
- Deduplication is automatic and transparent
- Existing notifications will continue to work
- No user action required

## Future Improvements

1. **Persistent Deduplication**: Store deduplication state in database for cross-device consistency
2. **User Preferences**: Allow users to configure notification frequency
3. **Notification Grouping**: Group similar notifications together
4. **Smart Deduplication**: Use AI to detect semantically similar notifications
5. **Analytics**: Track notification delivery rates and user engagement
