
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface AdminStats {
  pendingKYC: number;
  pendingWithdrawals: number;
  openMessages: number;
  totalUsers: number;
  totalMXI: number;
  totalUSDT: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    pendingKYC: 0,
    pendingWithdrawals: 0,
    openMessages: 0,
    totalUsers: 0,
    totalMXI: 0,
    totalUSDT: 0,
  });
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    if (!user) {
      Alert.alert('Error', 'Please login first');
      router.replace('/(auth)/login');
      return;
    }

    try {
      const { data: adminData, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error || !adminData) {
        Alert.alert('Access Denied', 'You do not have admin privileges');
        router.replace('/(tabs)/(home)');
        return;
      }

      setIsAdmin(true);
      loadStats();
    } catch (error) {
      console.error('Admin check error:', error);
      Alert.alert('Error', 'Failed to verify admin access');
      router.replace('/(tabs)/(home)');
    }
  };

  const loadStats = async () => {
    try {
      setLoading(true);

      // Get pending KYC count
      const { count: kycCount } = await supabase
        .from('kyc_verifications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get pending withdrawals count
      const { count: withdrawalCount } = await supabase
        .from('withdrawals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get open messages count
      const { count: messageCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('status', ['open', 'in_progress']);

      // Get total users
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Get total MXI and USDT
      const { data: totals } = await supabase
        .from('users')
        .select('mxi_balance, usdt_contributed');

      const totalMXI = totals?.reduce((sum, u) => sum + parseFloat(u.mxi_balance?.toString() || '0'), 0) || 0;
      const totalUSDT = totals?.reduce((sum, u) => sum + parseFloat(u.usdt_contributed?.toString() || '0'), 0) || 0;

      setStats({
        pendingKYC: kycCount || 0,
        pendingWithdrawals: withdrawalCount || 0,
        openMessages: messageCount || 0,
        totalUsers: userCount || 0,
        totalMXI,
        totalUSDT,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      Alert.alert('Error', 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Verifying admin access...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>MXI Strategic PreSale Management</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            <View style={styles.statsGrid}>
              <View style={[commonStyles.card, styles.statCard, styles.urgentCard]}>
                <IconSymbol name="person.badge.shield.checkmark" size={32} color={colors.warning} />
                <Text style={styles.statValue}>{stats.pendingKYC}</Text>
                <Text style={styles.statLabel}>Pending KYC</Text>
              </View>

              <View style={[commonStyles.card, styles.statCard, styles.urgentCard]}>
                <IconSymbol name="arrow.down.circle" size={32} color={colors.error} />
                <Text style={styles.statValue}>{stats.pendingWithdrawals}</Text>
                <Text style={styles.statLabel}>Pending Withdrawals</Text>
              </View>

              <View style={[commonStyles.card, styles.statCard, styles.infoCard]}>
                <IconSymbol name="envelope.badge" size={32} color={colors.primary} />
                <Text style={styles.statValue}>{stats.openMessages}</Text>
                <Text style={styles.statLabel}>Open Messages</Text>
              </View>

              <View style={[commonStyles.card, styles.statCard]}>
                <IconSymbol name="person.3" size={32} color={colors.success} />
                <Text style={styles.statValue}>{stats.totalUsers}</Text>
                <Text style={styles.statLabel}>Total Users</Text>
              </View>

              <View style={[commonStyles.card, styles.statCard]}>
                <IconSymbol name="bitcoinsign.circle" size={32} color={colors.primary} />
                <Text style={styles.statValue}>{stats.totalMXI.toFixed(0)}</Text>
                <Text style={styles.statLabel}>Total MXI</Text>
              </View>

              <View style={[commonStyles.card, styles.statCard]}>
                <IconSymbol name="dollarsign.circle" size={32} color={colors.success} />
                <Text style={styles.statValue}>${stats.totalUSDT.toFixed(0)}</Text>
                <Text style={styles.statLabel}>Total USDT</Text>
              </View>
            </View>

            <View style={styles.menuSection}>
              <Text style={styles.sectionTitle}>Management Tools</Text>

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
                onPress={() => router.push('/(tabs)/(admin)/user-management')}
              >
                <View style={styles.menuItemContent}>
                  <View style={styles.menuItemLeft}>
                    <IconSymbol name="person.2.fill" size={28} color={colors.primary} />
                    <View style={styles.menuItemText}>
                      <Text style={styles.menuItemTitle}>User Management</Text>
                      <Text style={styles.menuItemSubtitle}>View and manage user accounts</Text>
                    </View>
                  </View>
                  <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[commonStyles.card, styles.menuItem]}
                onPress={() => router.push('/(tabs)/(admin)/database-viewer')}
              >
                <View style={styles.menuItemContent}>
                  <View style={styles.menuItemLeft}>
                    <IconSymbol name="cylinder.fill" size={28} color={colors.error} />
                    <View style={styles.menuItemText}>
                      <Text style={styles.menuItemTitle}>Database Viewer</Text>
                      <Text style={styles.menuItemSubtitle}>Review database records</Text>
                    </View>
                  </View>
                  <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[commonStyles.card, styles.menuItem]}
                onPress={() => router.push('/(tabs)/(admin)/settings')}
              >
                <View style={styles.menuItemContent}>
                  <View style={styles.menuItemLeft}>
                    <IconSymbol name="gearshape.fill" size={28} color={colors.textSecondary} />
                    <View style={styles.menuItemText}>
                      <Text style={styles.menuItemTitle}>System Settings</Text>
                      <Text style={styles.menuItemSubtitle}>Configure app values and parameters</Text>
                    </View>
                  </View>
                  <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[commonStyles.card, styles.refreshCard]}
              onPress={loadStats}
            >
              <IconSymbol name="arrow.clockwise" size={20} color={colors.primary} />
              <Text style={styles.refreshText}>Refresh Dashboard</Text>
            </TouchableOpacity>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
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
  menuSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
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
  refreshCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
  },
  refreshText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
});
