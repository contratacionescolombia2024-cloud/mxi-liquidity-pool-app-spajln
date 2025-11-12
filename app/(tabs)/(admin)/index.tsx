
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
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

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
  const [stats, setStats] = useState<AdminStats>({
    pendingKYC: 0,
    approvedKYC: 0,
    pendingWithdrawals: 0,
    completedWithdrawals: 0,
    openMessages: 0,
    totalUsers: 0,
    activeContributors: 0,
    totalMXI: 0,
    totalUSDT: 0,
    confirmedPayments: 0,
    pendingPayments: 0,
  });
  const [phaseMetrics, setPhaseMetrics] = useState<PhaseMetrics>({
    totalTokensSold: 0,
    currentPhase: 1,
    currentPriceUsdt: 0.30,
    phase1TokensSold: 0,
    phase2TokensSold: 0,
    phase3TokensSold: 0,
    totalMembers: 0,
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) {
      console.log('No user found, redirecting to login');
      Alert.alert('Error', 'Please login first');
      router.replace('/(auth)/login');
      return;
    }

    try {
      console.log('Checking admin access for user:', user.id, user.email);
      
      const { data: adminData, error } = await supabase
        .from('admin_users')
        .select('id, role, permissions')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('Admin check result:', { adminData, error });

      if (error) {
        console.error('Admin check error:', error);
        Alert.alert('Error', 'Failed to verify admin access: ' + error.message);
        router.replace('/(tabs)/(home)');
        return;
      }

      if (!adminData) {
        console.log('No admin data found for user');
        Alert.alert('Access Denied', 'You do not have admin privileges. Please contact support if you believe this is an error.');
        router.replace('/(tabs)/(home)');
        return;
      }

      console.log('Admin access granted:', adminData);
      setIsAdmin(true);
      setCheckingAccess(false);
      loadStats();
    } catch (error) {
      console.error('Admin check exception:', error);
      Alert.alert('Error', 'Failed to verify admin access');
      router.replace('/(tabs)/(home)');
    }
  };

  const loadStats = async () => {
    try {
      setLoading(true);

      // Get comprehensive stats
      const { data: statsData, error: statsError } = await supabase.rpc('execute_sql', {
        query: `
          SELECT 
            (SELECT COUNT(*) FROM users) as total_users,
            (SELECT COUNT(*) FROM users WHERE is_active_contributor = true) as active_contributors,
            (SELECT COUNT(*) FROM kyc_verifications WHERE status = 'pending') as pending_kyc,
            (SELECT COUNT(*) FROM kyc_verifications WHERE status = 'approved') as approved_kyc,
            (SELECT COUNT(*) FROM withdrawals WHERE status = 'pending') as pending_withdrawals,
            (SELECT COUNT(*) FROM withdrawals WHERE status = 'completed') as completed_withdrawals,
            (SELECT COUNT(*) FROM messages WHERE status IN ('open', 'in_progress')) as open_messages,
            (SELECT COALESCE(SUM(mxi_balance), 0) FROM users) as total_mxi_distributed,
            (SELECT COALESCE(SUM(usdt_contributed), 0) FROM users) as total_usdt_collected,
            (SELECT COUNT(*) FROM binance_payments WHERE status = 'confirmed') as confirmed_payments,
            (SELECT COUNT(*) FROM binance_payments WHERE status = 'pending') as pending_payments
        `
      });

      // Get phase metrics
      const { data: metricsData } = await supabase
        .from('metrics')
        .select('total_tokens_sold, current_phase, current_price_usdt, phase_1_tokens_sold, phase_2_tokens_sold, phase_3_tokens_sold, total_members, total_usdt_contributed, total_mxi_distributed')
        .single();

      if (statsData && statsData.length > 0) {
        const data = statsData[0];
        setStats({
          pendingKYC: parseInt(data.pending_kyc) || 0,
          approvedKYC: parseInt(data.approved_kyc) || 0,
          pendingWithdrawals: parseInt(data.pending_withdrawals) || 0,
          completedWithdrawals: parseInt(data.completed_withdrawals) || 0,
          openMessages: parseInt(data.open_messages) || 0,
          totalUsers: parseInt(data.total_users) || 0,
          activeContributors: parseInt(data.active_contributors) || 0,
          totalMXI: parseFloat(data.total_mxi_distributed) || 0,
          totalUSDT: parseFloat(data.total_usdt_collected) || 0,
          confirmedPayments: parseInt(data.confirmed_payments) || 0,
          pendingPayments: parseInt(data.pending_payments) || 0,
        });
      }

      if (metricsData) {
        setPhaseMetrics({
          totalTokensSold: parseFloat(metricsData.total_tokens_sold?.toString() || '0'),
          currentPhase: metricsData.current_phase || 1,
          currentPriceUsdt: parseFloat(metricsData.current_price_usdt?.toString() || '0.30'),
          phase1TokensSold: parseFloat(metricsData.phase_1_tokens_sold?.toString() || '0'),
          phase2TokensSold: parseFloat(metricsData.phase_2_tokens_sold?.toString() || '0'),
          phase3TokensSold: parseFloat(metricsData.phase_3_tokens_sold?.toString() || '0'),
          totalMembers: metricsData.total_members || 0,
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      Alert.alert('Error', 'Failed to load dashboard statistics');
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
      return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toFixed(0);
  };

  const getPhaseProgress = (): number => {
    const phaseLimit = 10000000;
    if (phaseMetrics.currentPhase === 1) {
      return (phaseMetrics.phase1TokensSold / phaseLimit) * 100;
    } else if (phaseMetrics.currentPhase === 2) {
      return (phaseMetrics.phase2TokensSold / phaseLimit) * 100;
    } else if (phaseMetrics.currentPhase === 3) {
      return (phaseMetrics.phase3TokensSold / phaseLimit) * 100;
    }
    return 0;
  };

  if (checkingAccess || !isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            {checkingAccess ? 'Verifying admin access...' : 'Loading dashboard...'}
          </Text>
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
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.title}>Admin Dashboard</Text>
              <Text style={styles.subtitle}>MXI Strategic PreSale Management</Text>
            </View>
            <View style={styles.adminBadge}>
              <IconSymbol name="shield.lefthalf.filled" size={20} color="#FFFFFF" />
            </View>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Phase Information */}
            <View style={[commonStyles.card, styles.phaseCard]}>
              <View style={styles.phaseHeader}>
                <View>
                  <Text style={styles.phaseTitle}>Phase {phaseMetrics.currentPhase} Active</Text>
                  <Text style={styles.phasePrice}>${phaseMetrics.currentPriceUsdt} USDT per MXI</Text>
                </View>
                <View style={styles.phaseBadge}>
                  <Text style={styles.phaseBadgeText}>LIVE</Text>
                </View>
              </View>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${getPhaseProgress()}%` }]} />
                </View>
                <Text style={styles.progressText}>
                  {formatNumber(phaseMetrics.totalTokensSold)} / 30M MXI Sold
                </Text>
              </View>

              <View style={styles.phaseStats}>
                <View style={styles.phaseStat}>
                  <Text style={styles.phaseStatLabel}>Phase 1</Text>
                  <Text style={styles.phaseStatValue}>{formatNumber(phaseMetrics.phase1TokensSold)}</Text>
                </View>
                <View style={styles.phaseStat}>
                  <Text style={styles.phaseStatLabel}>Phase 2</Text>
                  <Text style={styles.phaseStatValue}>{formatNumber(phaseMetrics.phase2TokensSold)}</Text>
                </View>
                <View style={styles.phaseStat}>
                  <Text style={styles.phaseStatLabel}>Phase 3</Text>
                  <Text style={styles.phaseStatValue}>{formatNumber(phaseMetrics.phase3TokensSold)}</Text>
                </View>
              </View>
            </View>

            {/* Critical Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pending Actions</Text>
              <View style={styles.statsGrid}>
                <TouchableOpacity
                  style={[commonStyles.card, styles.statCard, styles.urgentCard]}
                  onPress={() => router.push('/(tabs)/(admin)/kyc-approvals')}
                >
                  <IconSymbol name="person.badge.shield.checkmark" size={32} color={colors.warning} />
                  <Text style={styles.statValue}>{stats.pendingKYC}</Text>
                  <Text style={styles.statLabel}>Pending KYC</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[commonStyles.card, styles.statCard, styles.urgentCard]}
                  onPress={() => router.push('/(tabs)/(admin)/withdrawal-approvals')}
                >
                  <IconSymbol name="arrow.down.circle" size={32} color={colors.error} />
                  <Text style={styles.statValue}>{stats.pendingWithdrawals}</Text>
                  <Text style={styles.statLabel}>Pending Withdrawals</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[commonStyles.card, styles.statCard, styles.infoCard]}
                  onPress={() => router.push('/(tabs)/(admin)/messages')}
                >
                  <IconSymbol name="envelope.badge" size={32} color={colors.primary} />
                  <Text style={styles.statValue}>{stats.openMessages}</Text>
                  <Text style={styles.statLabel}>Open Messages</Text>
                </TouchableOpacity>

                <View style={[commonStyles.card, styles.statCard, styles.infoCard]}>
                  <IconSymbol name="creditcard" size={32} color={colors.warning} />
                  <Text style={styles.statValue}>{stats.pendingPayments}</Text>
                  <Text style={styles.statLabel}>Pending Payments</Text>
                </View>
              </View>
            </View>

            {/* User Statistics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>User Statistics</Text>
              <View style={styles.statsGrid}>
                <TouchableOpacity
                  style={[commonStyles.card, styles.statCard]}
                  onPress={() => router.push('/(tabs)/(admin)/user-management')}
                >
                  <IconSymbol name="person.3" size={32} color={colors.success} />
                  <Text style={styles.statValue}>{stats.totalUsers}</Text>
                  <Text style={styles.statLabel}>Total Users</Text>
                </TouchableOpacity>

                <View style={[commonStyles.card, styles.statCard]}>
                  <IconSymbol name="person.crop.circle.badge.checkmark" size={32} color={colors.primary} />
                  <Text style={styles.statValue}>{stats.activeContributors}</Text>
                  <Text style={styles.statLabel}>Active Contributors</Text>
                </View>

                <View style={[commonStyles.card, styles.statCard]}>
                  <IconSymbol name="checkmark.shield" size={32} color={colors.success} />
                  <Text style={styles.statValue}>{stats.approvedKYC}</Text>
                  <Text style={styles.statLabel}>Approved KYC</Text>
                </View>

                <View style={[commonStyles.card, styles.statCard]}>
                  <IconSymbol name="person.2.wave.2" size={32} color={colors.primary} />
                  <Text style={styles.statValue}>{formatNumber(phaseMetrics.totalMembers)}</Text>
                  <Text style={styles.statLabel}>Pool Members</Text>
                </View>
              </View>
            </View>

            {/* Financial Overview */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Financial Overview</Text>
              <View style={styles.statsGrid}>
                <View style={[commonStyles.card, styles.statCard, styles.financialCard]}>
                  <IconSymbol name="bitcoinsign.circle" size={32} color={colors.primary} />
                  <Text style={styles.statValue}>{formatNumber(stats.totalMXI)}</Text>
                  <Text style={styles.statLabel}>Total MXI Distributed</Text>
                </View>

                <View style={[commonStyles.card, styles.statCard, styles.financialCard]}>
                  <IconSymbol name="dollarsign.circle" size={32} color={colors.success} />
                  <Text style={styles.statValue}>${formatNumber(stats.totalUSDT)}</Text>
                  <Text style={styles.statLabel}>Total USDT Collected</Text>
                </View>

                <View style={[commonStyles.card, styles.statCard]}>
                  <IconSymbol name="checkmark.circle" size={32} color={colors.success} />
                  <Text style={styles.statValue}>{stats.confirmedPayments}</Text>
                  <Text style={styles.statLabel}>Confirmed Payments</Text>
                </View>

                <View style={[commonStyles.card, styles.statCard]}>
                  <IconSymbol name="arrow.down.circle.fill" size={32} color={colors.primary} />
                  <Text style={styles.statValue}>{stats.completedWithdrawals}</Text>
                  <Text style={styles.statLabel}>Completed Withdrawals</Text>
                </View>
              </View>
            </View>

            {/* Management Tools */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Management Tools</Text>

              <TouchableOpacity
                style={[commonStyles.card, styles.menuItem]}
                onPress={() => router.push('/(tabs)/(admin)/user-management')}
              >
                <View style={styles.menuItemContent}>
                  <View style={styles.menuItemLeft}>
                    <IconSymbol name="person.2.fill" size={28} color={colors.primary} />
                    <View style={styles.menuItemText}>
                      <Text style={styles.menuItemTitle}>User Management</Text>
                      <Text style={styles.menuItemSubtitle}>View and manage all users</Text>
                    </View>
                  </View>
                  <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[commonStyles.card, styles.menuItem]}
                onPress={() => router.push('/(tabs)/(admin)/kyc-approvals')}
              >
                <View style={styles.menuItemContent}>
                  <View style={styles.menuItemLeft}>
                    <IconSymbol name="person.badge.shield.checkmark.fill" size={28} color={colors.primary} />
                    <View style={styles.menuItemText}>
                      <Text style={styles.menuItemTitle}>KYC Approvals</Text>
                      <Text style={styles.menuItemSubtitle}>Review and approve KYC verifications</Text>
                    </View>
                  </View>
                  {stats.pendingKYC > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{stats.pendingKYC}</Text>
                    </View>
                  )}
                  <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[commonStyles.card, styles.menuItem]}
                onPress={() => router.push('/(tabs)/(admin)/withdrawal-approvals')}
              >
                <View style={styles.menuItemContent}>
                  <View style={styles.menuItemLeft}>
                    <IconSymbol name="arrow.down.circle.fill" size={28} color={colors.success} />
                    <View style={styles.menuItemText}>
                      <Text style={styles.menuItemTitle}>Withdrawal Approvals</Text>
                      <Text style={styles.menuItemSubtitle}>Process withdrawal requests</Text>
                    </View>
                  </View>
                  {stats.pendingWithdrawals > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{stats.pendingWithdrawals}</Text>
                    </View>
                  )}
                  <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[commonStyles.card, styles.menuItem]}
                onPress={() => router.push('/(tabs)/(admin)/messages')}
              >
                <View style={styles.menuItemContent}>
                  <View style={styles.menuItemLeft}>
                    <IconSymbol name="envelope.fill" size={28} color={colors.warning} />
                    <View style={styles.menuItemText}>
                      <Text style={styles.menuItemTitle}>User Messages</Text>
                      <Text style={styles.menuItemSubtitle}>Support and help requests</Text>
                    </View>
                  </View>
                  {stats.openMessages > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{stats.openMessages}</Text>
                    </View>
                  )}
                  <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[commonStyles.card, styles.menuItem]}
                onPress={() => router.push('/(tabs)/(admin)/settings')}
              >
                <View style={styles.menuItemContent}>
                  <View style={styles.menuItemLeft}>
                    <IconSymbol name="gearshape.fill" size={28} color={colors.primary} />
                    <View style={styles.menuItemText}>
                      <Text style={styles.menuItemTitle}>System Settings</Text>
                      <Text style={styles.menuItemSubtitle}>Configure platform parameters</Text>
                    </View>
                  </View>
                  <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>
            </View>
          </>
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
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  adminBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  phaseCard: {
    marginBottom: 24,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  phaseTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  phasePrice: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  phaseBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  phaseBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  progressContainer: {
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
    backgroundColor: colors.primary,
  },
  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  phaseStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  phaseStat: {
    alignItems: 'center',
  },
  phaseStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  phaseStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
  },
  urgentCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  infoCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  financialCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  menuItem: {
    marginBottom: 12,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  badge: {
    backgroundColor: colors.error,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});
