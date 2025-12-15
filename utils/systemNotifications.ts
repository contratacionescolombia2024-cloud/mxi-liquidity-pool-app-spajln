
import { supabase } from '@/lib/supabase';

interface SystemNotificationData {
  userId: string;
  type: 'payment_verified' | 'balance_added' | 'commission_earned' | 'withdrawal_approved' | 'kyc_status_change' | 'vesting_milestone' | 'referral_bonus' | 'system_announcement';
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

/**
 * Send a system notification to a user
 * These are automated notifications separate from user support messages
 */
export async function sendSystemNotification(data: SystemNotificationData): Promise<boolean> {
  try {
    console.log('[SystemNotifications] Sending notification:', {
      type: data.type,
      userId: data.userId,
      title: data.title,
    });

    const { error } = await supabase
      .from('system_notifications')
      .insert({
        user_id: data.userId,
        notification_type: data.type,
        title: data.title,
        message: data.message,
        metadata: data.metadata || {},
        is_read: false,
      });

    if (error) {
      console.error('[SystemNotifications] Error sending notification:', error);
      return false;
    }

    console.log('[SystemNotifications] Notification sent successfully');
    return true;
  } catch (error) {
    console.error('[SystemNotifications] Exception sending notification:', error);
    return false;
  }
}

/**
 * Send payment verified notification
 */
export async function notifyPaymentVerified(
  userId: string,
  orderId: string,
  usdtAmount: number,
  mxiAmount: number
): Promise<boolean> {
  return sendSystemNotification({
    userId,
    type: 'payment_verified',
    title: '✅ Payment Verified',
    message: `Your payment of ${usdtAmount} USDT has been verified. You received ${mxiAmount.toFixed(2)} MXI.`,
    metadata: {
      order_id: orderId,
      usdt_amount: usdtAmount,
      mxi_amount: mxiAmount,
    },
  });
}

/**
 * Send balance added notification
 */
export async function notifyBalanceAdded(
  userId: string,
  mxiAmount: number,
  source: string
): Promise<boolean> {
  return sendSystemNotification({
    userId,
    type: 'balance_added',
    title: '💰 Balance Added',
    message: `${mxiAmount.toFixed(2)} MXI has been added to your account from ${source}.`,
    metadata: {
      mxi_amount: mxiAmount,
      source,
    },
  });
}

/**
 * Send commission earned notification
 */
export async function notifyCommissionEarned(
  userId: string,
  amount: number,
  level: number,
  fromUserName: string
): Promise<boolean> {
  return sendSystemNotification({
    userId,
    type: 'commission_earned',
    title: '💵 Commission Earned',
    message: `You earned ${amount.toFixed(2)} MXI commission from ${fromUserName} (Level ${level}).`,
    metadata: {
      amount,
      level,
      from_user: fromUserName,
    },
  });
}

/**
 * Send withdrawal approved notification
 */
export async function notifyWithdrawalApproved(
  userId: string,
  amount: number,
  currency: string
): Promise<boolean> {
  return sendSystemNotification({
    userId,
    type: 'withdrawal_approved',
    title: '✅ Withdrawal Approved',
    message: `Your withdrawal of ${amount} ${currency} has been approved and is being processed.`,
    metadata: {
      amount,
      currency,
    },
  });
}

/**
 * Send KYC status change notification
 */
export async function notifyKYCStatusChange(
  userId: string,
  status: 'approved' | 'rejected' | 'pending',
  reason?: string
): Promise<boolean> {
  const statusEmoji = status === 'approved' ? '✅' : status === 'rejected' ? '❌' : '⏳';
  const statusText = status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Pending';
  
  return sendSystemNotification({
    userId,
    type: 'kyc_status_change',
    title: `${statusEmoji} KYC ${statusText}`,
    message: reason 
      ? `Your KYC verification status: ${statusText}. ${reason}`
      : `Your KYC verification status has been updated to: ${statusText}`,
    metadata: {
      status,
      reason,
    },
  });
}

/**
 * Send vesting milestone notification
 */
export async function notifyVestingMilestone(
  userId: string,
  totalVested: number
): Promise<boolean> {
  return sendSystemNotification({
    userId,
    type: 'vesting_milestone',
    title: '🔒 Vesting Milestone',
    message: `You've accumulated ${totalVested.toFixed(2)} MXI through vesting!`,
    metadata: {
      total_vested: totalVested,
    },
  });
}

/**
 * Send referral bonus notification
 */
export async function notifyReferralBonus(
  userId: string,
  bonusAmount: number,
  level: number
): Promise<boolean> {
  return sendSystemNotification({
    userId,
    type: 'referral_bonus',
    title: '🎁 Referral Bonus',
    message: `You've earned a ${bonusAmount} USDT bonus for reaching Ambassador Level ${level}!`,
    metadata: {
      bonus_amount: bonusAmount,
      level,
    },
  });
}

/**
 * Send system announcement
 */
export async function sendSystemAnnouncement(
  userId: string,
  title: string,
  message: string,
  metadata?: Record<string, any>
): Promise<boolean> {
  return sendSystemNotification({
    userId,
    type: 'system_announcement',
    title,
    message,
    metadata,
  });
}
