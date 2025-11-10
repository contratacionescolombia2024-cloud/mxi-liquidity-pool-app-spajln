
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import * as Clipboard from 'expo-clipboard';

export default function ReferralsScreen() {
  const router = useRouter();
  const { user, withdrawCommission } = useAuth();
  const [withdrawing, setWithdrawing] = useState(false);

  if (!user) return null;

  const canWithdraw =
    user.activeReferrals >= 5 &&
    user.commissions.available > 0 &&
    (!user.lastWithdrawalDate ||
      new Date().getTime() - new Date(user.lastWithdrawalDate).getTime() >=
        10 * 24 * 60 * 60 * 1000);

  const daysUntilWithdrawal = user.lastWithdrawalDate
    ? Math.max(
        0,
        10 -
          Math.floor(
            (new Date().getTime() - new Date(user.lastWithdrawalDate).getTime()) /
              (24 * 60 * 60 * 1000)
          )
      )
    : 0;

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(user.referralCode);
    Alert.alert('Copied!', 'Referral code copied to clipboard');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join the Maxcoin Liquidity Pool using my referral code: ${user.referralCode}\n\nEarn MXI tokens and participate in the future of crypto!`,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const handleWithdraw = async () => {
    if (!canWithdraw) {
      let message = '';
      if (user.activeReferrals < 5) {
        message = `You need at least 5 active referrals to withdraw. Current: ${user.activeReferrals}`;
      } else if (daysUntilWithdrawal > 0) {
        message = `You can withdraw in ${daysUntilWithdrawal} days`;
      } else if (user.commissions.available === 0) {
        message = 'No commissions available to withdraw';
      }
      Alert.alert('Cannot Withdraw', message);
      return;
    }

    Alert.alert(
      'Confirm Withdrawal',
      `Withdraw $${user.commissions.available.toFixed(2)} USDT to your Binance wallet?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setWithdrawing(true);
            const success = await withdrawCommission();
            setWithdrawing(false);
            if (success) {
              Alert.alert('Success', 'Withdrawal processed successfully!');
            } else {
              Alert.alert('Error', 'Failed to process withdrawal');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Referral System</Text>
        </View>

        {/* Referral Code Card */}
        <View style={[commonStyles.card, styles.codeCard]}>
          <Text style={styles.codeLabel}>Your Referral Code</Text>
          <View style={styles.codeContainer}>
            <Text style={styles.codeText}>{user.referralCode}</Text>
            <View style={styles.codeActions}>
              <TouchableOpacity style={styles.codeButton} onPress={handleCopyCode}>
                <IconSymbol name="doc.on.doc" size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.codeButton} onPress={handleShare}>
                <IconSymbol name="square.and.arrow.up" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Commission Overview */}
        <View style={[commonStyles.card, styles.commissionCard]}>
          <Text style={styles.sectionTitle}>Commission Overview</Text>
          <View style={styles.commissionGrid}>
            <View style={styles.commissionItem}>
              <Text style={styles.commissionValue}>
                ${user.commissions.total.toFixed(2)}
              </Text>
              <Text style={styles.commissionLabel}>Total Earned</Text>
            </View>
            <View style={styles.commissionItem}>
              <Text style={[styles.commissionValue, styles.availableValue]}>
                ${user.commissions.available.toFixed(2)}
              </Text>
              <Text style={styles.commissionLabel}>Available</Text>
            </View>
            <View style={styles.commissionItem}>
              <Text style={styles.commissionValue}>
                ${user.commissions.withdrawn.toFixed(2)}
              </Text>
              <Text style={styles.commissionLabel}>Withdrawn</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              buttonStyles.primary,
              styles.withdrawButton,
              !canWithdraw && styles.disabledButton,
            ]}
            onPress={handleWithdraw}
            disabled={!canWithdraw || withdrawing}
          >
            <Text style={styles.buttonText}>
              {withdrawing ? 'Processing...' : 'Withdraw Commission'}
            </Text>
          </TouchableOpacity>

          {!canWithdraw && (
            <View style={styles.withdrawInfo}>
              <IconSymbol name="info.circle" size={16} color={colors.textSecondary} />
              <Text style={styles.withdrawInfoText}>
                {user.activeReferrals < 5
                  ? `Need ${5 - user.activeReferrals} more active referrals`
                  : daysUntilWithdrawal > 0
                  ? `Available in ${daysUntilWithdrawal} days`
                  : 'No commissions available'}
              </Text>
            </View>
          )}
        </View>

        {/* Referral Levels */}
        <View style={[commonStyles.card, styles.levelsCard]}>
          <Text style={styles.sectionTitle}>Referral Levels</Text>
          
          <View style={styles.levelItem}>
            <View style={styles.levelHeader}>
              <View style={[styles.levelBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.levelBadgeText}>1</Text>
              </View>
              <View style={styles.levelInfo}>
                <Text style={styles.levelTitle}>Level 1 - Direct Referrals</Text>
                <Text style={styles.levelCommission}>3% Commission</Text>
              </View>
            </View>
            <Text style={styles.levelCount}>{user.referrals.level1} referrals</Text>
          </View>

          <View style={styles.levelItem}>
            <View style={styles.levelHeader}>
              <View style={[styles.levelBadge, { backgroundColor: colors.secondary }]}>
                <Text style={styles.levelBadgeText}>2</Text>
              </View>
              <View style={styles.levelInfo}>
                <Text style={styles.levelTitle}>Level 2 - Indirect Referrals</Text>
                <Text style={styles.levelCommission}>2% Commission</Text>
              </View>
            </View>
            <Text style={styles.levelCount}>{user.referrals.level2} referrals</Text>
          </View>

          <View style={styles.levelItem}>
            <View style={styles.levelHeader}>
              <View style={[styles.levelBadge, { backgroundColor: colors.accent }]}>
                <Text style={styles.levelBadgeText}>3</Text>
              </View>
              <View style={styles.levelInfo}>
                <Text style={styles.levelTitle}>Level 3 - Extended Network</Text>
                <Text style={styles.levelCommission}>1% Commission</Text>
              </View>
            </View>
            <Text style={styles.levelCount}>{user.referrals.level3} referrals</Text>
          </View>
        </View>

        {/* Active Referrals */}
        <View style={[commonStyles.card, styles.activeCard]}>
          <View style={styles.activeHeader}>
            <IconSymbol name="checkmark.circle.fill" size={24} color={colors.secondary} />
            <Text style={styles.activeTitle}>Active Referrals</Text>
          </View>
          <Text style={styles.activeCount}>{user.activeReferrals}</Text>
          <Text style={styles.activeDescription}>
            Referrals who have made their first contribution
          </Text>
          {user.activeReferrals < 5 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(user.activeReferrals / 5) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {5 - user.activeReferrals} more needed to unlock withdrawals
              </Text>
            </View>
          )}
        </View>

        {/* How It Works */}
        <View style={[commonStyles.card, styles.howItWorksCard]}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <View style={styles.howItWorksItem}>
            <IconSymbol name="1.circle.fill" size={24} color={colors.primary} />
            <Text style={styles.howItWorksText}>
              Share your referral code with friends and family
            </Text>
          </View>
          <View style={styles.howItWorksItem}>
            <IconSymbol name="2.circle.fill" size={24} color={colors.primary} />
            <Text style={styles.howItWorksText}>
              Earn commissions when they contribute to the pool
            </Text>
          </View>
          <View style={styles.howItWorksItem}>
            <IconSymbol name="3.circle.fill" size={24} color={colors.primary} />
            <Text style={styles.howItWorksText}>
              Withdraw after 10 days with 5+ active referrals
            </Text>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  codeCard: {
    marginBottom: 16,
    backgroundColor: colors.primary,
  },
  codeLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 2,
  },
  codeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  codeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commissionCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  commissionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  commissionItem: {
    flex: 1,
    alignItems: 'center',
  },
  commissionValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  availableValue: {
    color: colors.secondary,
  },
  commissionLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  withdrawButton: {
    marginBottom: 12,
  },
  disabledButton: {
    backgroundColor: colors.border,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  withdrawInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  withdrawInfoText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  levelsCard: {
    marginBottom: 16,
  },
  levelItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  levelBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  levelBadgeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  levelCommission: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  levelCount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  activeCard: {
    marginBottom: 16,
    alignItems: 'center',
  },
  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  activeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  activeCount: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.secondary,
    marginBottom: 4,
  },
  activeDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  progressContainer: {
    width: '100%',
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
  howItWorksCard: {
    marginBottom: 16,
  },
  howItWorksItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  howItWorksText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});
