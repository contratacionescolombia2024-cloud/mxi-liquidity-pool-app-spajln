
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [mxiPrice, setMxiPrice] = useState(10.0); // Simulated price in USDT
  const [totalPoolMembers, setTotalPoolMembers] = useState(56527);

  // Target date: January 15, 2026, 12:00 UTC - UPDATED TO 2026
  const targetDate = new Date('2026-01-15T12:00:00Z');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Pool Closed');
        clearInterval(interval);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Simulate real-time pool member updates
    const interval = setInterval(() => {
      setTotalPoolMembers((prev) => {
        if (prev < 250000) {
          return prev + Math.floor(Math.random() * 3);
        }
        return prev;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setMxiPrice(10.0 + Math.random() * 0.5);
      setRefreshing(false);
    }, 1000);
  };

  if (!user) {
    return null;
  }

  const totalValue = user.mxiBalance * mxiPrice;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user.name}</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <IconSymbol name="person.circle.fill" size={40} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Active Contributor Badge - NEW */}
        {user.isActiveContributor && (
          <View style={[commonStyles.card, styles.activeContributorCard]}>
            <View style={styles.activeContributorContent}>
              <View style={styles.activeContributorIcon}>
                <IconSymbol name="checkmark.seal.fill" size={32} color="#fff" />
              </View>
              <View style={styles.activeContributorText}>
                <Text style={styles.activeContributorTitle}>Colaborador Activo</Text>
                <Text style={styles.activeContributorSubtitle}>
                  You are an active contributor to the MXI liquidity pool
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Countdown Card */}
        <View style={[commonStyles.card, styles.countdownCard]}>
          <View style={styles.countdownHeader}>
            <IconSymbol name="clock.fill" size={24} color={colors.accent} />
            <Text style={styles.countdownTitle}>Pool Closes In</Text>
          </View>
          <Text style={styles.countdownTime}>{timeRemaining}</Text>
          <Text style={styles.countdownDate}>January 15, 2026 - 12:00 UTC</Text>
        </View>

        {/* MXI Balance Card */}
        <View style={[commonStyles.card, styles.balanceCard]}>
          <Text style={styles.balanceLabel}>Your MXI Balance</Text>
          <View style={styles.balanceRow}>
            <IconSymbol name="bitcoinsign.circle.fill" size={32} color={colors.primary} />
            <Text style={styles.balanceAmount}>{user.mxiBalance.toFixed(2)}</Text>
            <Text style={styles.balanceCurrency}>MXI</Text>
          </View>
          <View style={styles.balanceDetails}>
            <View style={styles.balanceDetailItem}>
              <Text style={styles.balanceDetailLabel}>Current Price</Text>
              <Text style={styles.balanceDetailValue}>${mxiPrice.toFixed(2)} USDT</Text>
            </View>
            <View style={styles.balanceDetailItem}>
              <Text style={styles.balanceDetailLabel}>Total Value</Text>
              <Text style={styles.balanceDetailValue}>${totalValue.toFixed(2)}</Text>
            </View>
          </View>
          <View style={styles.contributionInfo}>
            <Text style={styles.contributionLabel}>Total Contributed</Text>
            <Text style={styles.contributionAmount}>${user.usdtContributed.toFixed(2)} USDT</Text>
          </View>
        </View>

        {/* Pool Statistics */}
        <View style={[commonStyles.card, styles.statsCard]}>
          <Text style={styles.statsTitle}>Pool Statistics</Text>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <IconSymbol name="person.3.fill" size={24} color={colors.secondary} />
              <Text style={styles.statValue}>{totalPoolMembers.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Members</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <IconSymbol name="target" size={24} color={colors.accent} />
              <Text style={styles.statValue}>250,000</Text>
              <Text style={styles.statLabel}>Target</Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(totalPoolMembers / 250000) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {((totalPoolMembers / 250000) * 100).toFixed(2)}% Complete
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryAction]}
            onPress={() => router.push('/(tabs)/(home)/contribute')}
          >
            <IconSymbol name="plus.circle.fill" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Add Funds</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryAction]}
            onPress={() => router.push('/(tabs)/(home)/referrals')}
          >
            <IconSymbol name="person.2.fill" size={24} color={colors.primary} />
            <Text style={styles.actionButtonTextSecondary}>Referrals</Text>
          </TouchableOpacity>
        </View>

        {/* Info Banner */}
        <View style={[commonStyles.card, styles.infoBanner]}>
          <IconSymbol name="info.circle.fill" size={20} color={colors.primary} />
          <Text style={styles.infoBannerText}>
            Earn up to 6% commission through our 3-level referral system!
          </Text>
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
  scrollContent: {
    padding: 20,
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
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  settingsButton: {
    padding: 4,
  },
  activeContributorCard: {
    backgroundColor: colors.success,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#10b981',
  },
  activeContributorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  activeContributorIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeContributorText: {
    flex: 1,
  },
  activeContributorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  activeContributorSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  countdownCard: {
    backgroundColor: colors.primary,
    marginBottom: 16,
  },
  countdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  countdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  countdownTime: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  countdownDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  balanceCard: {
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 12,
  },
  balanceCurrency: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 8,
  },
  balanceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: 12,
  },
  balanceDetailItem: {
    flex: 1,
  },
  balanceDetailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  balanceDetailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  contributionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  contributionLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  contributionAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
  },
  statsCard: {
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
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
    backgroundColor: colors.secondary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryAction: {
    backgroundColor: colors.primary,
  },
  secondaryAction: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  actionButtonTextSecondary: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.highlight,
    gap: 12,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});
