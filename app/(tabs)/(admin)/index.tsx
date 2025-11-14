
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

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
  confirmedPayments: number;
  pendingPayments: number;
  confirmingPayments: number;
  totalCommissions: number;
  totalYieldGenerated: number;
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

export default function AdminDashboard() {
  const router = useRouter();
  const { user, checkAdminStatus } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [phaseMetrics, setPhaseMetrics] = useState<PhaseMetrics | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminAccess = async () => {
    const adminStatus = await checkAdminStatus();
    setIsAdmin(adminStatus);
    if (!adminStatus) {
      Alert.alert('Access Denied', 'You do not have admin privileges');
      router.replace('/(tabs)/(home)');
    }
  };

  useEffect(() => {
    if (user) {
      checkAdminAccess();
    }
  }, [user]);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);

      // Load KYC stats
      const { data: kycData } = await supabase
        .from('kyc_verifications')
        .select('status');

      const pendingKYC = kycData?.filter(k => k.status === 'pending').length || 0;
      const approvedKYC = kycData?.filter(k => k.status === 'approved').length || 0;
      const rejectedKYC = kycData?.filter(k => k.status === 'rejected').length || 0;

      // Load withdrawal stats
      const { data: withdrawalData } = await supabase
        .from('withdrawals')
        .select('status');

      const pendingWithdrawals = withdrawalData?.filter(w => w.status === 'pending').length || 0;
      const approvedWithdrawals = withdrawalData?.filter(w => w.status === 'processing').length || 0;
      const completedWithdrawals = withdrawalData?.filter(w => w.status === 'completed').length || 0;

      // Load payment stats - UPDATED to use okx_payments
      const { data: paymentData } = await supabase
        .from('okx_payments')
        .select('status');

      const confirmedPayments = paymentData?.filter(p => p.status === 'confirmed').length || 0;
      const pendingPayments = paymentData?.filter(p => p.status === 'pending').length || 0;
      const confirmingPayments = paymentData?.filter(p => p.status === 'confirming').length || 0;

      // Load message stats
      const { data: messageData } = await supabase
        .from('messages')
        .select('status');

      const openMessages = messageData?.filter(m => m.status === 'open' || m.status === 'in_progress').length || 0;

      // Load user stats
      const { data: userData } = await supabase
        .from('users')
        .select('mxi_balance, usdt_contributed, is_active_contributor, accumulated_yield');

      const totalUsers = userData?.length || 0;
      const activeContributors = userData?.filter(u => u.is_active_contributor).length || 0;
      const totalMXI = userData?.reduce((sum, u) => sum + parseFloat(u.mxi_balance || '0'), 0) || 0;
      const totalUSDT = userData?.reduce((sum, u) => sum + parseFloat(u.usdt_contributed || '0'), 0) || 0;
      const totalYieldGenerated = userData?.reduce((sum, u) => sum + parseFloat(u.accumulated_yield || '0'), 0) || 0;

      // Load commission stats
      const { data: commissionData } = await supabase
        .from('commissions')
        .select('amount');

      const totalCommissions = commissionData?.reduce((sum, c) => sum + parseFloat(c.amount || '0'), 0) || 0;

      // Load phase metrics
      const { data: metricsData } = await supabase
        .from('metrics')
        .select('*')
        .single();

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
        confirmedPayments,
        pendingPayments,
        confirmingPayments,
        totalCommissions,
        totalYieldGenerated,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      Alert.alert('Error', 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadStats();
    }
  }, [isAdmin, loadStats]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadStats();
  }, [loadStats]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const getPhaseProgress = () => {
    if (!phaseMetrics) return 0;
    const maxTokensPerPhase = 8333333; // 8.33M tokens per phase
    const currentPhaseTokens = 
      phaseMetrics.currentPhase === 1 ? phaseMetrics.phase1TokensSold :
      phaseMetrics.currentPhase === 2 ? phaseMetrics.phase2TokensSold :
      phaseMetrics.phase3TokensSold;
    return (currentPhaseTokens / maxTokensPerPhase) * 100;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>MXI Pool Management</Text>
        </View>
        <TouchableOpacity onPress={onRefresh} disabled={refreshing}>
          <IconSymbol 
            ios_icon_name="arrow.clockwise" 
            android_material_icon_name="refresh" 
            size={24} 
            color={colors.primary} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Phase Progress */}
        {phaseMetrics && (
          <View style={[commonStyles.card, styles.phaseCard]}>
            <Text style={styles.sectionTitle}>Current Phase</Text>
            <View style={styles.phaseInfo}>
              <Text style={styles.phaseNumber}>Phase {phaseMetrics.currentPhase}</Text>
              <Text style={styles.phasePrice}>${phaseMetrics.currentPriceUsdt} USDT per MXI</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${getPhaseProgress()}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {formatNumber(getPhaseProgress())}% Complete
            </Text>
            <View style={styles.phaseStats}>
              <View style={styles.phaseStat}>
                <Text style={styles.phaseStatLabel}>Total Sold</Text>
                <Text style={styles.phaseStatValue}>{formatNumber(phaseMetrics.totalTokensSold)} MXI</Text>
              </View>
              <View style={styles.phaseStat}>
                <Text style={styles.phaseStatLabel}>Total Members</Text>
                <Text style={styles.phaseStatValue}>{formatNumber(phaseMetrics.totalMembers)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={[commonStyles.card, styles.actionCard]}
              onPress={() => router.push('/(tabs)/(admin)/user-management')}
            >
              <IconSymbol 
                ios_icon_name="person.2.fill" 
                android_material_icon_name="people" 
                size={32} 
                color={colors.primary} 
              />
              <Text style={styles.actionTitle}>Users</Text>
              <Text style={styles.actionValue}>{stats?.totalUsers || 0}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[commonStyles.card, styles.actionCard]}
              onPress={() => router.push('/(tabs)/(admin)/kyc-approvals')}
            >
              <IconSymbol 
                ios_icon_name="checkmark.seal.fill" 
                android_material_icon_name="verified_user" 
                size={32} 
                color={colors.warning} 
              />
              <Text style={styles.actionTitle}>KYC</Text>
              <Text style={styles.actionValue}>{stats?.pendingKYC || 0}</Text>
              {stats && stats.pendingKYC > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{stats.pendingKYC}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[commonStyles.card, styles.actionCard]}
              onPress={() => router.push('/(tabs)/(admin)/payment-approvals')}
            >
              <IconSymbol 
                ios_icon_name="creditcard.fill" 
                android_material_icon_name="payment" 
                size={32} 
                color={colors.success} 
              />
              <Text style={styles.actionTitle}>Payments</Text>
              <Text style={styles.actionValue}>{stats?.confirmingPayments || 0}</Text>
              {stats && stats.confirmingPayments > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{stats.confirmingPayments}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[commonStyles.card, styles.actionCard]}
              onPress={() => router.push('/(tabs)/(admin)/withdrawal-approvals')}
            >
              <IconSymbol 
                ios_icon_name="arrow.up.circle.fill" 
                android_material_icon_name="upload" 
                size={32} 
                color={colors.error} 
              />
              <Text style={styles.actionTitle}>Withdrawals</Text>
              <Text style={styles.actionValue}>{stats?.pendingWithdrawals || 0}</Text>
              {stats && stats.pendingWithdrawals > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{stats.pendingWithdrawals}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[commonStyles.card, styles.actionCard]}
              onPress={() => router.push('/(tabs)/(admin)/messages')}
            >
              <IconSymbol 
                ios_icon_name="envelope.fill" 
                android_material_icon_name="mail" 
                size={32} 
                color={colors.primary} 
              />
              <Text style={styles.actionTitle}>Messages</Text>
              <Text style={styles.actionValue}>{stats?.openMessages || 0}</Text>
              {stats && stats.openMessages > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{stats.openMessages}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[commonStyles.card, styles.actionCard]}
              onPress={() => router.push('/(tabs)/(admin)/settings')}
            >
              <IconSymbol 
                ios_icon_name="gearshape.fill" 
                android_material_icon_name="settings" 
                size={32} 
                color={colors.textSecondary} 
              />
              <Text style={styles.actionTitle}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Statistics */}
        {stats && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Platform Statistics</Text>
            
            <View style={[commonStyles.card, styles.statCard]}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Total Users</Text>
                <Text style={styles.statValue}>{formatNumber(stats.totalUsers)}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Active Contributors</Text>
                <Text style={styles.statValue}>{formatNumber(stats.activeContributors)}</Text>
              </View>
            </View>

            <View style={[commonStyles.card, styles.statCard]}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Total MXI Distributed</Text>
                <Text style={styles.statValue}>{formatNumber(stats.totalMXI)} MXI</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Total USDT Contributed</Text>
                <Text style={styles.statValue}>${formatNumber(stats.totalUSDT)}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Total Yield Generated</Text>
                <Text style={styles.statValue}>{formatNumber(stats.totalYieldGenerated)} MXI</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Total Commissions</Text>
                <Text style={styles.statValue}>${formatNumber(stats.totalCommissions)}</Text>
              </View>
            </View>

            <View style={[commonStyles.card, styles.statCard]}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Confirmed Payments</Text>
                <Text style={[styles.statValue, { color: colors.success }]}>
                  {stats.confirmedPayments}
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Awaiting Approval</Text>
                <Text style={[styles.statValue, { color: colors.warning }]}>
                  {stats.confirmingPayments}
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Pending Payments</Text>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {stats.pendingPayments}
                </Text>
              </View>
            </View>

            <View style={[commonStyles.card, styles.statCard]}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Approved KYC</Text>
                <Text style={[styles.statValue, { color: colors.success }]}>
                  {stats.approvedKYC}
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Pending KYC</Text>
                <Text style={[styles.statValue, { color: colors.warning }]}>
                  {stats.pendingKYC}
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Rejected KYC</Text>
                <Text style={[styles.statValue, { color: colors.error }]}>
                  {stats.rejectedKYC}
                </Text>
              </View>
            </View>

            <View style={[commonStyles.card, styles.statCard]}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Completed Withdrawals</Text>
                <Text style={[styles.statValue, { color: colors.success }]}>
                  {stats.completedWithdrawals}
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Processing Withdrawals</Text>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {stats.approvedWithdrawals}
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Pending Withdrawals</Text>
                <Text style={[styles.statValue, { color: colors.warning }]}>
                  {stats.pendingWithdrawals}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  phaseCard: {
    marginBottom: 24,
  },
  phaseInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  phaseNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  phasePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  phaseStats: {
    flexDirection: 'row',
    gap: 16,
  },
  phaseStat: {
    flex: 1,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  phaseStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  phaseStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    alignItems: 'center',
    padding: 20,
    position: 'relative',
  },
  actionTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  actionValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 4,
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.error,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  statCard: {
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
