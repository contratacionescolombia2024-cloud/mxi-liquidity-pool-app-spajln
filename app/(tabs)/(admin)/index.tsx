
import React, { useState, useEffect } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { supabase } from '@/lib/supabase';

interface AdminStats {
  pendingKYC: number;
  approvedKYC: number;
  pendingWithdrawals: number;
  completedWithdrawals: number;
  openMessages: number;
  totalUsers: number;
  activeContributors: number;
  totalMXI: number;
  totalUSDT: number;
  confirmedPayments: number;
  pendingPayments: number;
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
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [phaseMetrics, setPhaseMetrics] = useState<PhaseMetrics | null>(null);

  useEffect(() => {
    if (user) {
      checkAdminAccess();
    }
  }, [user]);

  const checkAdminAccess = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, role')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error || !data) {
        Alert.alert('Access Denied', 'You do not have admin privileges', [
          { text: 'OK', onPress: () => router.back() },
        ]);
        return;
      }

      loadStats();
    } catch (error) {
      console.error('Admin access check error:', error);
      Alert.alert('Error', 'Failed to verify admin access');
      router.back();
    }
  };

  const loadStats = async () => {
    try {
      setLoading(true);

      const [
        kycData,
        withdrawalData,
        messageData,
        userData,
        contributorData,
        mxiData,
        usdtData,
        paymentData,
        metricsData,
      ] = await Promise.all([
        supabase.from('kyc_verifications').select('status', { count: 'exact' }),
        supabase.from('withdrawals').select('status', { count: 'exact' }),
        supabase.from('messages').select('status', { count: 'exact' }),
        supabase.from('users').select('id', { count: 'exact' }),
        supabase.from('users').select('is_active_contributor', { count: 'exact' }).eq('is_active_contributor', true),
        supabase.from('users').select('mxi_balance'),
        supabase.from('users').select('usdt_contributed'),
        supabase.from('binance_payments').select('status', { count: 'exact' }),
        supabase.from('metrics').select('*').single(),
      ]);

      const pendingKYC = kycData.data?.filter(k => k.status === 'pending').length || 0;
      const approvedKYC = kycData.data?.filter(k => k.status === 'approved').length || 0;
      const pendingWithdrawals = withdrawalData.data?.filter(w => w.status === 'pending').length || 0;
      const completedWithdrawals = withdrawalData.data?.filter(w => w.status === 'completed').length || 0;
      const openMessages = messageData.data?.filter(m => m.status === 'open').length || 0;
      const totalUsers = userData.count || 0;
      const activeContributors = contributorData.count || 0;
      const totalMXI = mxiData.data?.reduce((sum, u) => sum + parseFloat(u.mxi_balance?.toString() || '0'), 0) || 0;
      const totalUSDT = usdtData.data?.reduce((sum, u) => sum + parseFloat(u.usdt_contributed?.toString() || '0'), 0) || 0;
      const confirmedPayments = paymentData.data?.filter(p => p.status === 'confirmed').length || 0;
      const pendingPayments = paymentData.data?.filter(p => p.status === 'pending').length || 0;

      setStats({
        pendingKYC,
        approvedKYC,
        pendingWithdrawals,
        completedWithdrawals,
        openMessages,
        totalUsers,
        activeContributors,
        totalMXI,
        totalUSDT,
        confirmedPayments,
        pendingPayments,
      });

      if (metricsData.data) {
        setPhaseMetrics({
          totalTokensSold: parseFloat(metricsData.data.total_tokens_sold?.toString() || '0'),
          currentPhase: metricsData.data.current_phase || 1,
          currentPriceUsdt: parseFloat(metricsData.data.current_price_usdt?.toString() || '0'),
          phase1TokensSold: parseFloat(metricsData.data.phase_1_tokens_sold?.toString() || '0'),
          phase2TokensSold: parseFloat(metricsData.data.phase_2_tokens_sold?.toString() || '0'),
          phase3TokensSold: parseFloat(metricsData.data.phase_3_tokens_sold?.toString() || '0'),
          totalMembers: metricsData.data.total_members || 0,
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`;
    }
    return num.toFixed(2);
  };

  const getPhaseProgress = () => {
    if (!phaseMetrics) return 0;
    return (phaseMetrics.totalTokensSold / 25000000) * 100;
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Admin Dashboard</Text>
            <Text style={styles.subtitle}>System Overview & Management</Text>
          </View>
        </View>

        {/* Phase Metrics */}
        {phaseMetrics && (
          <View style={[commonStyles.card, styles.phaseCard]}>
            <View style={styles.phaseHeader}>
              <IconSymbol name="chart.bar.fill" size={28} color={colors.accent} />
              <View style={styles.phaseHeaderText}>
                <Text style={styles.phaseTitle}>Phase {phaseMetrics.currentPhase} Active</Text>
                <Text style={styles.phaseSubtitle}>
                  ${phaseMetrics.currentPriceUsdt.toFixed(2)} USDT per MXI
                </Text>
              </View>
            </View>

            <View style={styles.phaseProgress}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${Math.min(getPhaseProgress(), 100)}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {formatNumber(phaseMetrics.totalTokensSold)} / 25M MXI sold ({getPhaseProgress().toFixed(1)}%)
              </Text>
            </View>

            <View style={styles.phaseBreakdown}>
              <View style={styles.phaseItem}>
                <Text style={styles.phaseItemLabel}>Phase 1 (0.40)</Text>
                <Text style={styles.phaseItemValue}>
                  {formatNumber(phaseMetrics.phase1TokensSold)} / 8.33M
                </Text>
              </View>
              <View style={styles.phaseItem}>
                <Text style={styles.phaseItemLabel}>Phase 2 (0.60)</Text>
                <Text style={styles.phaseItemValue}>
                  {formatNumber(phaseMetrics.phase2TokensSold)} / 8.33M
                </Text>
              </View>
              <View style={styles.phaseItem}>
                <Text style={styles.phaseItemLabel}>Phase 3 (0.80)</Text>
                <Text style={styles.phaseItemValue}>
                  {formatNumber(phaseMetrics.phase3TokensSold)} / 8.33M
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <View style={[commonStyles.card, styles.metricCard]}>
            <IconSymbol name="person.2.fill" size={24} color={colors.primary} />
            <Text style={styles.metricValue}>{stats?.totalUsers || 0}</Text>
            <Text style={styles.metricLabel}>Total Users</Text>
          </View>

          <View style={[commonStyles.card, styles.metricCard]}>
            <IconSymbol name="checkmark.circle.fill" size={24} color={colors.success} />
            <Text style={styles.metricValue}>{stats?.activeContributors || 0}</Text>
            <Text style={styles.metricLabel}>Active Contributors</Text>
          </View>

          <View style={[commonStyles.card, styles.metricCard]}>
            <IconSymbol name="bitcoinsign.circle.fill" size={24} color={colors.accent} />
            <Text style={styles.metricValue}>{formatNumber(stats?.totalMXI || 0)}</Text>
            <Text style={styles.metricLabel}>Total MXI</Text>
          </View>

          <View style={[commonStyles.card, styles.metricCard]}>
            <IconSymbol name="dollarsign.circle.fill" size={24} color={colors.warning} />
            <Text style={styles.metricValue}>${formatNumber(stats?.totalUSDT || 0)}</Text>
            <Text style={styles.metricLabel}>Total USDT</Text>
          </View>
        </View>

        {/* Action Items */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Action Items</Text>
          
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => router.push('/(tabs)/(admin)/kyc-approvals')}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.actionIcon, { backgroundColor: colors.warning + '20' }]}>
                <IconSymbol name="person.badge.shield.checkmark.fill" size={24} color={colors.warning} />
              </View>
              <View>
                <Text style={styles.actionTitle}>KYC Approvals</Text>
                <Text style={styles.actionSubtitle}>Pending verification requests</Text>
              </View>
            </View>
            <View style={styles.actionRight}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{stats?.pendingKYC || 0}</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => router.push('/(tabs)/(admin)/withdrawal-approvals')}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.actionIcon, { backgroundColor: colors.primary + '20' }]}>
                <IconSymbol name="arrow.down.circle.fill" size={24} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.actionTitle}>Withdrawal Approvals</Text>
                <Text style={styles.actionSubtitle}>Pending withdrawal requests</Text>
              </View>
            </View>
            <View style={styles.actionRight}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{stats?.pendingWithdrawals || 0}</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => router.push('/(tabs)/(admin)/messages')}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.actionIcon, { backgroundColor: colors.success + '20' }]}>
                <IconSymbol name="envelope.fill" size={24} color={colors.success} />
              </View>
              <View>
                <Text style={styles.actionTitle}>Support Messages</Text>
                <Text style={styles.actionSubtitle}>Open support tickets</Text>
              </View>
            </View>
            <View style={styles.actionRight}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{stats?.openMessages || 0}</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Management Tools */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Management Tools</Text>
          
          <TouchableOpacity
            style={styles.toolItem}
            onPress={() => router.push('/(tabs)/(admin)/user-management')}
          >
            <View style={[styles.toolIcon, { backgroundColor: colors.primary + '20' }]}>
              <IconSymbol name="person.3.fill" size={28} color={colors.primary} />
            </View>
            <View style={styles.toolContent}>
              <Text style={styles.toolTitle}>User Management</Text>
              <Text style={styles.toolSubtitle}>View and manage user accounts</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolItem}
            onPress={() => router.push('/(tabs)/(admin)/settings')}
          >
            <View style={[styles.toolIcon, { backgroundColor: colors.accent + '20' }]}>
              <IconSymbol name="gearshape.fill" size={28} color={colors.accent} />
            </View>
            <View style={styles.toolContent}>
              <Text style={styles.toolTitle}>System Settings</Text>
              <Text style={styles.toolSubtitle}>Configure platform parameters</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Payment Stats */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Payment Statistics</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats?.confirmedPayments || 0}</Text>
              <Text style={styles.statLabel}>Confirmed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats?.pendingPayments || 0}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats?.approvedKYC || 0}</Text>
              <Text style={styles.statLabel}>KYC Approved</Text>
            </View>
          </View>
        </View>
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
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
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
  phaseCard: {
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  phaseHeaderText: {
    flex: 1,
  },
  phaseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  phaseSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  phaseProgress: {
    marginBottom: 16,
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
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  phaseBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  phaseItem: {
    flex: 1,
    alignItems: 'center',
  },
  phaseItemLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  phaseItemValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    minWidth: '47%',
    alignItems: 'center',
    padding: 16,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  actionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 28,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  toolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  toolIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  toolContent: {
    flex: 1,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  toolSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
});
