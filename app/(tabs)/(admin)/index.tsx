
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { supabase } from '@/lib/supabase';
import { UniversalMXICounter } from '@/components/UniversalMXICounter';
import { i18n } from '@/constants/i18n';

interface AdminStats {
  pendingKYC: number;
  approvedKYC: number;
  rejectedKYC: number;
  pendingWithdrawals: number;
  approvedWithdrawals: number;
  completedWithdrawals: number;
  openMessages: number;
  totalUsers: number;
  activeContributors: number;
  totalMXI: number;
  totalUSDT: number;
  totalCommissions: number;
  totalYieldGenerated: number;
  pendingVerifications: number;
}

interface PhaseMetrics {
  totalTokensSold: number;
  currentPhase: number;
  currentPriceUsdt: number;
  phase1TokensSold: number;
  phase2TokensSold: number;
  phase3TokensSold: number;
  totalMembers: number;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  headerContainer: {
    marginBottom: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  header: {
    marginBottom: 0,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statCardWide: {
    width: '100%',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  quickActionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionButtonWide: {
    width: '100%',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  actionBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.error,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  actionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  phaseSection: {
    marginBottom: 24,
  },
  phaseCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  phaseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  phaseBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  phaseBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
  },
  phaseStats: {
    gap: 12,
  },
  phaseStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  phaseStatLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  phaseStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterSection: {
    marginBottom: 24,
  },
  dangerZone: {
    marginBottom: 24,
    backgroundColor: colors.error + '10',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.error + '40',
  },
  dangerZoneTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.error,
    marginBottom: 8,
    textAlign: 'center',
  },
  dangerZoneSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 18,
  },
  resetButton: {
    backgroundColor: colors.error,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: colors.error,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.error,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 15,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  warningList: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  warningBullet: {
    fontSize: 16,
    color: colors.error,
    marginTop: 2,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  preservedItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  preservedBullet: {
    fontSize: 16,
    color: colors.success,
    marginTop: 2,
  },
  preservedText: {
    flex: 1,
    fontSize: 13,
    color: colors.success,
    lineHeight: 18,
    fontWeight: '600',
  },
  confirmationSection: {
    marginBottom: 20,
  },
  confirmationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  confirmationInput: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '700',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  confirmButton: {
    backgroundColor: colors.error,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButtonText: {
    color: colors.text,
  },
  confirmButtonText: {
    color: '#fff',
  },
  disabledButton: {
    opacity: 0.5,
  },
  updateModalContent: {
    borderColor: colors.primary,
  },
  updateModalIcon: {
    backgroundColor: colors.primary + '20',
  },
  updateModalTitle: {
    color: colors.primary,
  },
  updateConfirmButton: {
    backgroundColor: colors.primary,
  },
  messageInput: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  messagePreview: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  messagePreviewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  messagePreviewText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  messageInfo: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
});

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [phaseMetrics, setPhaseMetrics] = useState<PhaseMetrics | null>(null);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [resetting, setResetting] = useState(false);
  const [sendingUpdate, setSendingUpdate] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  useEffect(() => {
    if (user) {
      checkAdminAccess();
    }
  }, [user]);

  const checkAdminAccess = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error || !data) {
        Alert.alert(i18n.t('accessDenied'), i18n.t('noAdminPermissions'));
        router.replace('/(tabs)/(home)');
        return;
      }

      setIsAdmin(true);
      await loadStats();
    } catch (error) {
      console.error('Error checking admin access:', error);
      router.replace('/(tabs)/(home)');
    }
  };

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);

      // Load KYC stats
      const { data: kycData } = await supabase
        .from('kyc_verifications')
        .select('status');

      // Load withdrawal stats
      const { data: withdrawalData } = await supabase
        .from('withdrawals')
        .select('status');

      // Load message stats
      const { data: messageData } = await supabase
        .from('messages')
        .select('status');

      // Load user stats
      const { data: userData } = await supabase
        .from('users')
        .select('mxi_purchased_directly, mxi_from_unified_commissions, mxi_from_challenges, mxi_vesting_locked, usdt_contributed, is_active_contributor, accumulated_yield');

      // Load commission stats
      const { data: commissionData } = await supabase
        .from('commissions')
        .select('amount');

      // Load phase metrics
      const { data: metricsData } = await supabase
        .from('metrics')
        .select('*')
        .single();

      // Load manual verification requests
      const { data: verificationData } = await supabase
        .from('manual_verification_requests')
        .select('status');

      // Calculate stats
      const pendingKYC = kycData?.filter((k) => k.status === 'pending').length || 0;
      const approvedKYC = kycData?.filter((k) => k.status === 'approved').length || 0;
      const rejectedKYC = kycData?.filter((k) => k.status === 'rejected').length || 0;

      const pendingWithdrawals = withdrawalData?.filter((w) => w.status === 'pending').length || 0;
      const approvedWithdrawals = withdrawalData?.filter((w) => w.status === 'processing').length || 0;
      const completedWithdrawals = withdrawalData?.filter((w) => w.status === 'completed').length || 0;

      const openMessages = messageData?.filter((m) => m.status === 'open').length || 0;

      const pendingVerifications = verificationData?.filter((v) => v.status === 'pending' || v.status === 'reviewing').length || 0;

      const totalUsers = userData?.length || 0;
      const activeContributors = userData?.filter((u) => u.is_active_contributor).length || 0;
      const totalMXI = userData?.reduce((sum, u) => 
        sum + 
        parseFloat(u.mxi_purchased_directly || '0') + 
        parseFloat(u.mxi_from_unified_commissions || '0') + 
        parseFloat(u.mxi_from_challenges || '0') + 
        parseFloat(u.mxi_vesting_locked || '0'), 0) || 0;
      const totalUSDT = userData?.reduce((sum, u) => sum + parseFloat(u.usdt_contributed || '0'), 0) || 0;
      const totalYieldGenerated = userData?.reduce((sum, u) => sum + parseFloat(u.accumulated_yield || '0'), 0) || 0;

      const totalCommissions = commissionData?.reduce((sum, c) => sum + parseFloat(c.amount || '0'), 0) || 0;

      setStats({
        pendingKYC,
        approvedKYC,
        rejectedKYC,
        pendingWithdrawals,
        approvedWithdrawals,
        completedWithdrawals,
        openMessages,
        totalUsers,
        activeContributors,
        totalMXI,
        totalUSDT,
        totalCommissions,
        totalYieldGenerated,
        pendingVerifications,
      });

      if (metricsData) {
        setPhaseMetrics({
          totalTokensSold: parseFloat(metricsData.total_tokens_sold || '0'),
          currentPhase: metricsData.current_phase || 1,
          currentPriceUsdt: parseFloat(metricsData.current_price_usdt || '0'),
          phase1TokensSold: parseFloat(metricsData.phase_1_tokens_sold || '0'),
          phase2TokensSold: parseFloat(metricsData.phase_2_tokens_sold || '0'),
          phase3TokensSold: parseFloat(metricsData.phase_3_tokens_sold || '0'),
          totalMembers: metricsData.total_members || 0,
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  const handleSendUpdateNotification = async () => {
    if (!updateMessage.trim()) {
      Alert.alert(i18n.t('error'), i18n.t('pleaseEnterUpdateMessage'));
      return;
    }

    try {
      setSendingUpdate(true);

      // Get all users
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id');

      if (usersError) throw usersError;

      if (!users || users.length === 0) {
        Alert.alert(i18n.t('error'), i18n.t('noUsersToNotify'));
        return;
      }

      // Create system notifications for all users
      const notifications = users.map(user => ({
        user_id: user.id,
        notification_type: 'system_announcement',
        title: i18n.t('appUpdateAvailable'),
        message: updateMessage.trim(),
        metadata: {
          type: 'app_update',
          sent_at: new Date().toISOString(),
          sent_by: user?.id,
        },
        is_read: false,
      }));

      // Insert notifications in batches of 100
      const batchSize = 100;
      for (let i = 0; i < notifications.length; i += batchSize) {
        const batch = notifications.slice(i, i + batchSize);
        const { error: insertError } = await supabase
          .from('system_notifications')
          .insert(batch);

        if (insertError) {
          console.error('Error inserting batch:', insertError);
          throw insertError;
        }
      }

      Alert.alert(
        i18n.t('success'),
        i18n.t('updateNotificationSentToAllUsers', { count: users.length }),
        [
          {
            text: 'OK',
            onPress: () => {
              setUpdateModalVisible(false);
              setUpdateMessage('');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error sending update notification:', error);
      Alert.alert(i18n.t('error'), error.message || i18n.t('errorSendingUpdateNotification'));
    } finally {
      setSendingUpdate(false);
    }
  };

  const handleResetAllUsers = async () => {
    if (confirmationText !== 'RESETEAR') {
      Alert.alert(i18n.t('error'), i18n.t('mustTypeReset'));
      return;
    }

    try {
      setResetting(true);

      const { data, error } = await supabase.rpc('admin_reset_all_users', {
        p_admin_id: user?.id,
      });

      if (error) throw error;

      if (data?.success) {
        Alert.alert(
          i18n.t('systemReset'),
          data.message + '\n\n' + i18n.t('systemResetSuccess'),
          [
            {
              text: 'OK',
              onPress: async () => {
                setResetModalVisible(false);
                setConfirmationText('');
                
                if (user?.id) {
                  const { data: freshUserData } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                  
                  console.log('Fresh user data after reset:', freshUserData);
                }
                
                await loadStats();
                
                Alert.alert(
                  i18n.t('updateComplete'),
                  i18n.t('allDataUpdated'),
                  [{ text: 'OK' }]
                );
              },
            },
          ]
        );
      } else {
        Alert.alert(i18n.t('error'), data?.error || i18n.t('resetError'));
      }
    } catch (error: any) {
      console.error('Error resetting users:', error);
      Alert.alert(i18n.t('error'), error.message || i18n.t('resetError'));
    } finally {
      setResetting(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const getPhaseProgress = () => {
    if (!phaseMetrics) return 0;
    const total = 25000000;
    return ((phaseMetrics.totalTokensSold / total) * 100).toFixed(2);
  };

  if (loading && !stats) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.push('/(tabs)/(home)')}
          >
            <IconSymbol 
              ios_icon_name="chevron.left" 
              android_material_icon_name="arrow_back" 
              size={20} 
              color={colors.primary} 
            />
            <Text style={styles.backButtonText}>{i18n.t('backToHome')}</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.welcomeText}>{i18n.t('adminDashboard')}</Text>
            <Text style={styles.subtitleText}>{i18n.t('welcome')}, {user?.name}</Text>
          </View>
        </View>

        <View style={styles.counterSection}>
          <UniversalMXICounter isAdmin={true} />
        </View>

        {/* Update Notification Button */}
        <View style={styles.dangerZone}>
          <Text style={[styles.dangerZoneTitle, { color: colors.primary }]}>
            📢 {i18n.t('sendUpdateNotification')}
          </Text>
          <Text style={styles.dangerZoneSubtitle}>
            {i18n.t('sendUpdateNotificationDescription')}
          </Text>
          <TouchableOpacity
            style={[styles.resetButton, { backgroundColor: colors.primary }]}
            onPress={() => setUpdateModalVisible(true)}
          >
            <IconSymbol 
              ios_icon_name="megaphone.fill" 
              android_material_icon_name="campaign" 
              size={24} 
              color="#000" 
            />
            <Text style={[styles.resetButtonText, { color: '#000' }]}>
              {i18n.t('sendUpdateNotificationButton')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dangerZone}>
          <Text style={styles.dangerZoneTitle}>⚠️ {i18n.t('dangerZone')}</Text>
          <Text style={styles.dangerZoneSubtitle}>
            {i18n.t('dangerZoneSubtitle')}
          </Text>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => setResetModalVisible(true)}
          >
            <IconSymbol 
              ios_icon_name="arrow.counterclockwise.circle.fill" 
              android_material_icon_name="refresh" 
              size={24} 
              color="#fff" 
            />
            <Text style={styles.resetButtonText}>{i18n.t('resetAll')}</Text>
          </TouchableOpacity>
        </View>

        {phaseMetrics && (
          <View style={styles.phaseSection}>
            <Text style={styles.sectionTitle}>{i18n.t('presaleMetrics')}</Text>
            <View style={styles.phaseCard}>
              <View style={styles.phaseHeader}>
                <Text style={styles.phaseTitle}>{i18n.t('phase')} {phaseMetrics.currentPhase}</Text>
                <View style={styles.phaseBadge}>
                  <Text style={styles.phaseBadgeText}>${phaseMetrics.currentPriceUsdt} USDT</Text>
                </View>
              </View>
              <View style={styles.phaseStats}>
                <View style={styles.phaseStatRow}>
                  <Text style={styles.phaseStatLabel}>{i18n.t('totalSold')}</Text>
                  <Text style={styles.phaseStatValue}>{formatNumber(phaseMetrics.totalTokensSold)} MXI</Text>
                </View>
                <View style={styles.phaseStatRow}>
                  <Text style={styles.phaseStatLabel}>{i18n.t('totalMembers')}</Text>
                  <Text style={styles.phaseStatValue}>{formatNumber(phaseMetrics.totalMembers)}</Text>
                </View>
                <View style={styles.phaseStatRow}>
                  <Text style={styles.phaseStatLabel}>{i18n.t('progress')}</Text>
                  <Text style={styles.phaseStatValue}>{getPhaseProgress()}%</Text>
                </View>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${getPhaseProgress()}%` }]} />
              </View>
            </View>
          </View>
        )}

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <IconSymbol ios_icon_name="person.3.fill" android_material_icon_name="people" size={20} color={colors.primary} />
              <Text style={styles.statLabel}>{i18n.t('users')}</Text>
            </View>
            <Text style={styles.statValue}>{stats?.totalUsers || 0}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <IconSymbol ios_icon_name="checkmark.circle.fill" android_material_icon_name="check_circle" size={20} color={colors.success} />
              <Text style={styles.statLabel}>{i18n.t('active')}</Text>
            </View>
            <Text style={styles.statValue}>{stats?.activeContributors || 0}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <IconSymbol ios_icon_name="dollarsign.circle.fill" android_material_icon_name="attach_money" size={20} color={colors.warning} />
              <Text style={styles.statLabel}>{i18n.t('totalUSDT')}</Text>
            </View>
            <Text style={styles.statValue}>{formatNumber(stats?.totalUSDT || 0)}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <IconSymbol ios_icon_name="star.fill" android_material_icon_name="star" size={20} color={colors.accent} />
              <Text style={styles.statLabel}>{i18n.t('totalMXI')}</Text>
            </View>
            <Text style={styles.statValue}>{formatNumber(stats?.totalMXI || 0)}</Text>
          </View>
        </View>

        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>{i18n.t('quickActions')}</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/(admin)/manual-verification-requests')}
            >
              {stats && stats.pendingVerifications > 0 && (
                <View style={styles.actionBadge}>
                  <Text style={styles.actionBadgeText}>{stats.pendingVerifications}</Text>
                </View>
              )}
              <View style={[styles.actionIcon, { backgroundColor: '#FF9800' + '20' }]}>
                <IconSymbol ios_icon_name="person.fill.checkmark" android_material_icon_name="admin_panel_settings" size={24} color="#FF9800" />
              </View>
              <Text style={styles.actionLabel}>{i18n.t('manualVerifications')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/(admin)/user-management-advanced')}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.primary + '20' }]}>
                <IconSymbol ios_icon_name="person.crop.circle.badge.checkmark" android_material_icon_name="manage_accounts" size={24} color={colors.primary} />
              </View>
              <Text style={styles.actionLabel}>{i18n.t('advancedManagement')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/(admin)/manual-payment-credit')}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.warning + '20' }]}>
                <IconSymbol ios_icon_name="creditcard.fill" android_material_icon_name="payment" size={24} color={colors.warning} />
              </View>
              <Text style={styles.actionLabel}>{i18n.t('creditManualPayment')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/(admin)/kyc-approvals')}
            >
              {stats && stats.pendingKYC > 0 && (
                <View style={styles.actionBadge}>
                  <Text style={styles.actionBadgeText}>{stats.pendingKYC}</Text>
                </View>
              )}
              <View style={[styles.actionIcon, { backgroundColor: colors.primary + '20' }]}>
                <IconSymbol ios_icon_name="person.badge.shield.checkmark.fill" android_material_icon_name="verified_user" size={24} color={colors.primary} />
              </View>
              <Text style={styles.actionLabel}>{i18n.t('approveKYC')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/(admin)/withdrawal-approvals')}
            >
              {stats && stats.pendingWithdrawals > 0 && (
                <View style={styles.actionBadge}>
                  <Text style={styles.actionBadgeText}>{stats.pendingWithdrawals}</Text>
                </View>
              )}
              <View style={[styles.actionIcon, { backgroundColor: colors.warning + '20' }]}>
                <IconSymbol ios_icon_name="arrow.up.circle.fill" android_material_icon_name="upload" size={24} color={colors.warning} />
              </View>
              <Text style={styles.actionLabel}>{i18n.t('withdrawals')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/(admin)/messages')}
            >
              {stats && stats.openMessages > 0 && (
                <View style={styles.actionBadge}>
                  <Text style={styles.actionBadgeText}>{stats.openMessages}</Text>
                </View>
              )}
              <View style={[styles.actionIcon, { backgroundColor: colors.accent + '20' }]}>
                <IconSymbol ios_icon_name="envelope.fill" android_material_icon_name="mail" size={24} color={colors.accent} />
              </View>
              <Text style={styles.actionLabel}>{i18n.t('supportMessages')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/(admin)/system-notifications')}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.primary + '20' }]}>
                <IconSymbol ios_icon_name="bell.badge.fill" android_material_icon_name="notifications_active" size={24} color={colors.primary} />
              </View>
              <Text style={styles.actionLabel}>{i18n.t('systemNotifications')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/(admin)/user-management')}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.primary + '20' }]}>
                <IconSymbol ios_icon_name="person.crop.circle" android_material_icon_name="person" size={24} color={colors.primary} />
              </View>
              <Text style={styles.actionLabel}>{i18n.t('basicUsers')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/(admin)/user-deletion')}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.error + '20' }]}>
                <IconSymbol ios_icon_name="trash.fill" android_material_icon_name="delete_forever" size={24} color={colors.error} />
              </View>
              <Text style={styles.actionLabel}>{i18n.t('deleteAccounts')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/(admin)/vesting-analytics')}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.success + '20' }]}>
                <IconSymbol ios_icon_name="chart.xyaxis.line" android_material_icon_name="show_chart" size={24} color={colors.success} />
              </View>
              <Text style={styles.actionLabel}>{i18n.t('vestingAnalytics')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/(admin)/settings')}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.textSecondary + '20' }]}>
                <IconSymbol ios_icon_name="gearshape.fill" android_material_icon_name="settings" size={24} color={colors.textSecondary} />
              </View>
              <Text style={styles.actionLabel}>{i18n.t('settings')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/(admin)/ambassador-withdrawals')}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.primary + '20' }]}>
                <IconSymbol ios_icon_name="trophy.fill" android_material_icon_name="emoji_events" size={24} color={colors.primary} />
              </View>
              <Text style={styles.actionLabel}>{i18n.t('ambassadorBonuses')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/(admin)/participation-bonus')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#9C27B0' + '20' }]}>
                <IconSymbol ios_icon_name="ticket.fill" android_material_icon_name="confirmation_number" size={24} color="#9C27B0" />
              </View>
              <Text style={styles.actionLabel}>{i18n.t('participationBonus')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Reset Modal */}
      <Modal
        visible={resetModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setResetModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIcon}>
                <IconSymbol 
                  ios_icon_name="exclamationmark.triangle.fill" 
                  android_material_icon_name="warning" 
                  size={48} 
                  color={colors.error} 
                />
              </View>
              <Text style={styles.modalTitle}>{i18n.t('resetSystemTitle')}</Text>
            </View>

            <Text style={styles.modalMessage}>
              {i18n.t('resetSystemMessage')}
            </Text>

            <View style={styles.warningList}>
              <View style={styles.warningItem}>
                <Text style={styles.warningBullet}>•</Text>
                <Text style={styles.warningText}>{i18n.t('allBalancesReset')}</Text>
              </View>
              <View style={styles.warningItem}>
                <Text style={styles.warningBullet}>•</Text>
                <Text style={styles.warningText}>{i18n.t('allCommissionsDeleted')}</Text>
              </View>
              <View style={styles.warningItem}>
                <Text style={styles.warningBullet}>•</Text>
                <Text style={styles.warningText}>{i18n.t('allContributionsDeleted')}</Text>
              </View>
              <View style={styles.warningItem}>
                <Text style={styles.warningBullet}>•</Text>
                <Text style={styles.warningText}>{i18n.t('allWithdrawalsDeleted')}</Text>
              </View>
              <View style={styles.warningItem}>
                <Text style={styles.warningBullet}>•</Text>
                <Text style={styles.warningText}>{i18n.t('allPaymentsDeleted')}</Text>
              </View>
              <View style={styles.warningItem}>
                <Text style={styles.warningBullet}>•</Text>
                <Text style={styles.warningText}>{i18n.t('presaleMetricsReset')}</Text>
              </View>
              <View style={styles.warningItem}>
                <Text style={styles.warningBullet}>•</Text>
                <Text style={styles.warningText}>{i18n.t('allVestingDeleted')}</Text>
              </View>
              <View style={styles.warningItem}>
                <Text style={styles.warningBullet}>•</Text>
                <Text style={styles.warningText}>{i18n.t('adminBalanceReset')}</Text>
              </View>
              
              <View style={styles.preservedItem}>
                <Text style={styles.preservedBullet}>✓</Text>
                <Text style={styles.preservedText}>{i18n.t('referralRelationsPreserved')}</Text>
              </View>
            </View>

            <View style={styles.confirmationSection}>
              <Text style={styles.confirmationLabel}>
                {i18n.t('typeResetToConfirm')}
              </Text>
              <TextInput
                style={styles.confirmationInput}
                value={confirmationText}
                onChangeText={setConfirmationText}
                placeholder="RESETEAR"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="characters"
                editable={!resetting}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setResetModalVisible(false);
                  setConfirmationText('');
                }}
                disabled={resetting}
              >
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>
                  {i18n.t('cancel')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.confirmButton,
                  (confirmationText !== 'RESETEAR' || resetting) && styles.disabledButton,
                ]}
                onPress={handleResetAllUsers}
                disabled={confirmationText !== 'RESETEAR' || resetting}
              >
                {resetting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={[styles.modalButtonText, styles.confirmButtonText]}>
                    {i18n.t('confirmReset')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Update Notification Modal */}
      <Modal
        visible={updateModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setUpdateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.updateModalContent]}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalIcon, styles.updateModalIcon]}>
                <IconSymbol 
                  ios_icon_name="megaphone.fill" 
                  android_material_icon_name="campaign" 
                  size={48} 
                  color={colors.primary} 
                />
              </View>
              <Text style={[styles.modalTitle, styles.updateModalTitle]}>
                {i18n.t('sendUpdateNotification')}
              </Text>
            </View>

            <Text style={styles.messageInfo}>
              {i18n.t('updateNotificationWillBeSentToAll')}
            </Text>

            <View style={styles.confirmationSection}>
              <Text style={styles.confirmationLabel}>
                {i18n.t('updateMessageLabel')}
              </Text>
              <TextInput
                style={styles.messageInput}
                value={updateMessage}
                onChangeText={setUpdateMessage}
                placeholder={i18n.t('updateMessagePlaceholder')}
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
                editable={!sendingUpdate}
              />
            </View>

            {updateMessage.trim() && (
              <View style={styles.messagePreview}>
                <Text style={styles.messagePreviewLabel}>{i18n.t('messagePreview')}</Text>
                <Text style={styles.messagePreviewText}>{updateMessage.trim()}</Text>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setUpdateModalVisible(false);
                  setUpdateMessage('');
                }}
                disabled={sendingUpdate}
              >
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>
                  {i18n.t('cancel')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.updateConfirmButton,
                  (!updateMessage.trim() || sendingUpdate) && styles.disabledButton,
                ]}
                onPress={handleSendUpdateNotification}
                disabled={!updateMessage.trim() || sendingUpdate}
              >
                {sendingUpdate ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={[styles.modalButtonText, styles.confirmButtonText, { color: '#000' }]}>
                    {i18n.t('sendToAllUsers')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
