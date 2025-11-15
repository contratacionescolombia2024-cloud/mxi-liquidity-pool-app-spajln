
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';
import YieldDisplay from '@/components/YieldDisplay';
import VestingCounter from '@/components/VestingCounter';

export default function HomeScreen() {
  const router = useRouter();
  const { user, getCurrentYield, claimYield, checkAdminStatus } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [currentYield, setCurrentYield] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [poolMembers, setPoolMembers] = useState(56527);

  useEffect(() => {
    loadData();
    checkAdmin();
    
    const interval = setInterval(() => {
      if (user) {
        setCurrentYield(getCurrentYield());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    setCurrentYield(getCurrentYield());
    
    const { data: metricsData } = await supabase
      .from('metrics')
      .select('total_members')
      .single();
    
    if (metricsData) {
      setPoolMembers(metricsData.total_members);
    }
  };

  const checkAdmin = async () => {
    const adminStatus = await checkAdminStatus();
    setIsAdmin(adminStatus);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleClaimYield = async () => {
    if (currentYield === 0) {
      Alert.alert('ℹ️ No Yield', '⏳ No yield available to claim yet');
      return;
    }

    Alert.alert(
      '💰 Claim Yield',
      `Claim ${currentYield.toFixed(6)} MXI yield?`,
      [
        { text: '❌ Cancel', style: 'cancel' },
        {
          text: '✅ Claim',
          onPress: async () => {
            const result = await claimYield();
            if (result.success) {
              Alert.alert('✅ Success', `💎 Claimed ${result.yieldEarned?.toFixed(6)} MXI!`);
              setCurrentYield(0);
            } else {
              Alert.alert('❌ Error', result.error || 'Failed to claim yield');
            }
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>⏳ Loading...</Text>
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
            <Text style={styles.greeting}>👋 Welcome back,</Text>
            <Text style={styles.userName}>{user.name}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <IconSymbol ios_icon_name="person.circle.fill" android_material_icon_name="account_circle" size={40} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={[commonStyles.card, styles.balanceCard]}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>💎 MXI Balance</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/(home)/vesting')}>
              <IconSymbol ios_icon_name="info.circle" android_material_icon_name="info" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceAmount}>{user.mxiBalance.toFixed(2)}</Text>
          <Text style={styles.balanceCurrency}>MXI</Text>
          
          <View style={styles.balanceDivider} />
          
          <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemLabel}>💵 USDT Contributed</Text>
              <Text style={styles.balanceItemValue}>${user.usdtContributed.toFixed(2)}</Text>
            </View>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemLabel}>💰 Commissions</Text>
              <Text style={styles.balanceItemValue}>${user.commissions.available.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {user.yieldRatePerMinute > 0 && (
          <YieldDisplay
            currentYield={currentYield}
            yieldRatePerMinute={user.yieldRatePerMinute}
            onClaim={handleClaimYield}
          />
        )}

        <VestingCounter />

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/(home)/contribute')}
            >
              <View style={styles.actionIconContainer}>
                <IconSymbol ios_icon_name="plus.circle.fill" android_material_icon_name="add_circle" size={32} color={colors.primary} />
              </View>
              <Text style={styles.actionTitle}>💰 Contribute</Text>
              <Text style={styles.actionSubtitle}>Add USDT</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/(home)/withdrawal')}
            >
              <View style={styles.actionIconContainer}>
                <IconSymbol ios_icon_name="arrow.down.circle.fill" android_material_icon_name="arrow_circle_down" size={32} color={colors.success} />
              </View>
              <Text style={styles.actionTitle}>💵 Withdraw</Text>
              <Text style={styles.actionSubtitle}>Get funds</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/(home)/referrals')}
            >
              <View style={styles.actionIconContainer}>
                <IconSymbol ios_icon_name="person.3.fill" android_material_icon_name="group" size={32} color={colors.accent} />
              </View>
              <Text style={styles.actionTitle}>👥 Referrals</Text>
              <Text style={styles.actionSubtitle}>Invite friends</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/(home)/kyc-verification')}
            >
              <View style={styles.actionIconContainer}>
                <IconSymbol ios_icon_name="checkmark.shield.fill" android_material_icon_name="verified_user" size={32} color={colors.warning} />
              </View>
              <Text style={styles.actionTitle}>🔐 KYC</Text>
              <Text style={styles.actionSubtitle}>Verify identity</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.gamesSection}>
          <Text style={styles.sectionTitle}>🎮 Challenge Games</Text>
          <View style={styles.gamesGrid}>
            <TouchableOpacity
              style={styles.gameCard}
              onPress={() => router.push('/(tabs)/(home)/xmi-tap-duo')}
            >
              <View style={styles.gameIconContainer}>
                <IconSymbol ios_icon_name="hand.tap.fill" android_material_icon_name="touch_app" size={40} color={colors.primary} />
              </View>
              <Text style={styles.gameTitle}>👆 Tap Duo</Text>
              <Text style={styles.gameSubtitle}>1v1 Tapping</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gameCard}
              onPress={() => router.push('/(tabs)/(home)/mxi-airball-duo')}
            >
              <View style={styles.gameIconContainer}>
                <IconSymbol ios_icon_name="balloon.fill" android_material_icon_name="sports_volleyball" size={40} color={colors.accent} />
              </View>
              <Text style={styles.gameTitle}>🎈 Airball Duo</Text>
              <Text style={styles.gameSubtitle}>1v1 Balance</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gameCard}
              onPress={() => router.push('/(tabs)/(home)/mxi-airball')}
            >
              <View style={styles.gameIconContainer}>
                <IconSymbol ios_icon_name="balloon.2.fill" android_material_icon_name="sports_soccer" size={40} color={colors.success} />
              </View>
              <Text style={styles.gameTitle}>🎯 Airball</Text>
              <Text style={styles.gameSubtitle}>Multi-player</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gameCard}
              onPress={() => router.push('/(tabs)/(home)/clickers')}
            >
              <View style={styles.gameIconContainer}>
                <IconSymbol ios_icon_name="hand.point.up.left.fill" android_material_icon_name="ads_click" size={40} color={colors.warning} />
              </View>
              <Text style={styles.gameTitle}>🖱️ Clickers</Text>
              <Text style={styles.gameSubtitle}>Speed clicking</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gameCard}
              onPress={() => router.push('/(tabs)/(home)/lottery')}
            >
              <View style={styles.gameIconContainer}>
                <IconSymbol ios_icon_name="ticket.fill" android_material_icon_name="confirmation_number" size={40} color="#FFD700" />
              </View>
              <Text style={styles.gameTitle}>🎫 Lottery</Text>
              <Text style={styles.gameSubtitle}>Win big!</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gameCard}
              onPress={() => router.push('/(tabs)/(home)/challenge-history')}
            >
              <View style={styles.gameIconContainer}>
                <IconSymbol ios_icon_name="clock.fill" android_material_icon_name="history" size={40} color={colors.textSecondary} />
              </View>
              <Text style={styles.gameTitle}>📜 History</Text>
              <Text style={styles.gameSubtitle}>View records</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[commonStyles.card, styles.statsCard]}>
          <Text style={styles.statsTitle}>📊 Pool Statistics</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <IconSymbol ios_icon_name="person.3.fill" android_material_icon_name="group" size={24} color={colors.primary} />
              <Text style={styles.statValue}>{poolMembers.toLocaleString()}</Text>
              <Text style={styles.statLabel}>👥 Members</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <IconSymbol ios_icon_name="person.2.fill" android_material_icon_name="people" size={24} color={colors.success} />
              <Text style={styles.statValue}>{user.activeReferrals}</Text>
              <Text style={styles.statLabel}>✅ Active Referrals</Text>
            </View>
          </View>
        </View>

        {isAdmin && (
          <TouchableOpacity
            style={[commonStyles.card, styles.adminCard]}
            onPress={() => router.push('/(tabs)/(admin)')}
          >
            <View style={styles.adminContent}>
              <IconSymbol ios_icon_name="shield.fill" android_material_icon_name="admin_panel_settings" size={32} color={colors.primary} />
              <View style={styles.adminText}>
                <Text style={styles.adminTitle}>🛡️ Admin Panel</Text>
                <Text style={styles.adminSubtitle}>Manage system settings</Text>
              </View>
              <IconSymbol ios_icon_name="chevron.right" android_material_icon_name="chevron_right" size={24} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  profileButton: {
    padding: 4,
  },
  balanceCard: {
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  balanceCurrency: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  balanceDivider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  balanceRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 16,
  },
  balanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  balanceItemLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  balanceItemValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  quickActions: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionIconContainer: {
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  gamesSection: {
    marginBottom: 24,
  },
  gamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gameCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  gameIconContainer: {
    marginBottom: 12,
  },
  gameTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  gameSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statsCard: {
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 60,
    backgroundColor: colors.border,
  },
  adminCard: {
    backgroundColor: colors.highlight,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  adminContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  adminText: {
    flex: 1,
  },
  adminTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  adminSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
