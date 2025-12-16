
/**
 * Notification Deduplication System
 * 
 * This utility prevents duplicate notifications from being sent
 * by tracking recently sent notifications and blocking duplicates
 * within a configurable time window.
 */

interface NotificationKey {
  type: string;
  userId: string;
  metadata?: string;
}

interface NotificationRecord {
  key: string;
  timestamp: number;
}

class NotificationDeduplicationService {
  private recentNotifications: Map<string, number> = new Map();
  private readonly DEDUP_WINDOW_MS = 5000; // 5 seconds window for deduplication
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Clean up old entries every 10 seconds
    this.startCleanup();
  }

  /**
   * Generate a unique key for a notification
   */
  private generateKey(notificationKey: NotificationKey): string {
    const metadataStr = notificationKey.metadata || '';
    return `${notificationKey.type}:${notificationKey.userId}:${metadataStr}`;
  }

  /**
   * Check if a notification should be sent (not a duplicate)
   * Returns true if notification should be sent, false if it's a duplicate
   */
  shouldSendNotification(notificationKey: NotificationKey): boolean {
    const key = this.generateKey(notificationKey);
    const now = Date.now();
    const lastSent = this.recentNotifications.get(key);

    // If notification was sent recently, it's a duplicate
    if (lastSent && (now - lastSent) < this.DEDUP_WINDOW_MS) {
      console.log(`[NotificationDedup] Blocking duplicate notification: ${key}`);
      console.log(`[NotificationDedup] Last sent: ${now - lastSent}ms ago`);
      return false;
    }

    // Record this notification
    this.recentNotifications.set(key, now);
    console.log(`[NotificationDedup] Allowing notification: ${key}`);
    return true;
  }

  /**
   * Manually mark a notification as sent (for external tracking)
   */
  markAsSent(notificationKey: NotificationKey): void {
    const key = this.generateKey(notificationKey);
    this.recentNotifications.set(key, Date.now());
  }

  /**
   * Clear all tracked notifications (useful for testing)
   */
  clear(): void {
    this.recentNotifications.clear();
  }

  /**
   * Start periodic cleanup of old entries
   */
  private startCleanup(): void {
    if (this.cleanupInterval) {
      return;
    }

    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      const keysToDelete: string[] = [];

      // Find expired entries
      this.recentNotifications.forEach((timestamp, key) => {
        if (now - timestamp > this.DEDUP_WINDOW_MS * 2) {
          keysToDelete.push(key);
        }
      });

      // Delete expired entries
      keysToDelete.forEach(key => {
        this.recentNotifications.delete(key);
      });

      if (keysToDelete.length > 0) {
        console.log(`[NotificationDedup] Cleaned up ${keysToDelete.length} expired entries`);
      }
    }, 10000); // Run every 10 seconds
  }

  /**
   * Stop cleanup interval (for cleanup)
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Export singleton instance
export const notificationDedup = new NotificationDeduplicationService();

// Export types for use in other files
export type { NotificationKey };
