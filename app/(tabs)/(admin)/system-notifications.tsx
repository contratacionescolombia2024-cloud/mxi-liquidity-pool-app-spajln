
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';

interface SystemNotification {
  id: string;
  user_id: string;
  notification_type: string;
  title: string;
  message: string;
  metadata: any;
  is_read: boolean;
  created_at: string;
  user_email: string;
  user_name: string;
}

export default function SystemNotificationsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'payment' | 'balance' | 'commission'>('all');

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);

      // Only fetch from system_notifications table (automated system messages)
      // User support messages are in messages table
      let query = supabase
        .from('system_notifications')
        .select(`
          *,
          users!inner(email, name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (filter === 'payment') {
        query = query.eq('notification_type', 'payment_verified');
      } else if (filter === 'balance') {
        query = query.eq('notification_type', 'balance_added');
      } else if (filter === 'commission') {
        query = query.eq('notification_type', 'commission_earned');
      }

      const { data, error } = await query;

      if (error) throw error;

      const mapped = data?.map((n: any) => ({
        ...n,
        user_email: n.users.email,
        user_name: n.users.name,
      })) || [];

      setNotifications(mapped);
    } catch (error) {
      console.error('Error loading system notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment_verified': return 'checkmark.circle.fill';
      case 'balance_added': return 'plus.circle.fill';
      case 'commission_earned': return 'dollarsign.circle.fill';
      case 'withdrawal_approved': return 'arrow.down.circle.fill';
      case 'kyc_status_change': return 'person.badge.shield.checkmark.fill';
      case 'vesting_milestone': return 'chart.line.uptrend.xyaxis';
      case 'referral_bonus': return 'person.3.fill';
      case 'system_announcement': return 'megaphone.fill';
      default: return 'bell.fill';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'payment_verified': return colors.success;
      case 'balance_added': return colors.primary;
      case 'commission_earned': return '#FFD700';
      case 'withdrawal_approved': return colors.success;
      case 'kyc_status_change': return colors.primary;
      case 'vesting_milestone': return '#9C27B0';
      case 'referral_bonus': return '#FF9800';
      case 'system_announcement': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'payment_verified': return 'Pago Verificado';
      case 'balance_added': return 'Saldo Añadido';
      case 'commission_earned': return 'Comisión Ganada';
      case 'withdrawal_approved': return 'Retiro Aprobado';
      case 'kyc_status_change': return 'Estado KYC';
      case 'vesting_milestone': return 'Hito Vesting';
      case 'referral_bonus': return 'Bono Referido';
      case 'system_announcement': return 'Anuncio Sistema';
      default: return type;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol ios_icon_name="chevron.left" android_material_icon_name="arrow_back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>System Notifications</Text>
          <Text style={styles.subtitle}>Automated system messages (payments, balances, etc.)</Text>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'payment' && styles.filterButtonActive]}
          onPress={() => setFilter('payment')}
        >
          <Text style={[styles.filterText, filter === 'payment' && styles.filterTextActive]}>
            Payments
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'balance' && styles.filterButtonActive]}
          onPress={() => setFilter('balance')}
        >
          <Text style={[styles.filterText, filter === 'balance' && styles.filterTextActive]}>
            Balance
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'commission' && styles.filterButtonActive]}
          onPress={() => setFilter('commission')}
        >
          <Text style={[styles.filterText, filter === 'commission' && styles.filterTextActive]}>
            Commissions
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol ios_icon_name="bell.slash" android_material_icon_name="notifications_off" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyText}>No system notifications</Text>
          <Text style={styles.emptySubtext}>
            User support messages are in the User Messages section
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          {notifications.map((notification) => (
            <View key={notification.id} style={[commonStyles.card, styles.notificationCard]}>
              <View style={styles.notificationHeader}>
                <View style={[styles.iconContainer, { backgroundColor: getNotificationColor(notification.notification_type) + '20' }]}>
                  <IconSymbol 
                    ios_icon_name={getNotificationIcon(notification.notification_type)} 
                    android_material_icon_name="notifications"
                    size={24} 
                    color={getNotificationColor(notification.notification_type)} 
                  />
                </View>
                <View style={styles.notificationInfo}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationUser}>
                    {notification.user_name} • {notification.user_email}
                  </Text>
                </View>
                <View style={[styles.typeBadge, { backgroundColor: getNotificationColor(notification.notification_type) + '20' }]}>
                  <Text style={[styles.typeText, { color: getNotificationColor(notification.notification_type) }]}>
                    {getNotificationTypeLabel(notification.notification_type)}
                  </Text>
                </View>
              </View>
              <Text style={styles.notificationMessage}>{notification.message}</Text>
              {notification.metadata && Object.keys(notification.metadata).length > 0 && (
                <View style={styles.metadataContainer}>
                  <Text style={styles.metadataLabel}>Details:</Text>
                  {notification.metadata.amount && (
                    <Text style={styles.metadataText}>Amount: {notification.metadata.amount}</Text>
                  )}
                  {notification.metadata.mxi_amount && (
                    <Text style={styles.metadataText}>MXI: {notification.metadata.mxi_amount}</Text>
                  )}
                  {notification.metadata.order_id && (
                    <Text style={styles.metadataText}>Order: {notification.metadata.order_id}</Text>
                  )}
                </View>
              )}
              <View style={styles.notificationFooter}>
                <Text style={styles.notificationDate}>
                  {new Date(notification.created_at).toLocaleString()}
                </Text>
                {!notification.is_read && (
                  <View style={styles.unreadDot} />
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  filterTextActive: {
    color: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  notificationCard: {
    marginBottom: 16,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  notificationUser: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  notificationMessage: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
    lineHeight: 20,
  },
  metadataContainer: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  metadataLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  metadataText: {
    fontSize: 12,
    color: colors.text,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationDate: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
});
