
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Share,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';

export default function ReferralsScreen() {
  const router = useRouter();
  const { user, withdrawCommission, checkWithdrawalEligibility } = useAuth();
  const [walletAddress, setWalletAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  useEffect(() => {
    if (user) {
      checkEligibility();
    }
  }, [user]);

  const checkEligibility = async () => {
    setCheckingEligibility(true);
    await checkWithdrawalEligibility();
    setCheckingEligibility(false);
  };

  const handleCopyCode = async () => {
    if (user?.referralCode) {
      await Clipboard.setStringAsync(user.referralCode);
      Alert.alert('Success', 'Referral code copied to clipboard!');
    }
  };

  const handleShare = async () => {
    if (!user?.referralCode) return;

    try {
      await Share.share({
        message: `Join the Maxcoin Liquidity Pool and earn MXI tokens! Use my referral code: ${user.referralCode}`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleWithdraw = async () => {
    if (!user) return;

    if (!user.canWithdraw) {
      Alert.alert(
        'Withdrawal Not Available',
        `To withdraw commissions, you need:\n\n- At least 5 active referrals (you have ${user.activeReferrals})\n- 10 days since joining\n\nKeep inviting friends to unlock withdrawals!`
      );
      return;
    }

    const amount = parseFloat(withdrawAmount);

    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (amount > user.commissions.available) {
      Alert.alert('Error', `You only have ${user.commissions.available.toFixed(2)} USDT available`);
      return;
    }

    if (!walletAddress || walletAddress.length < 10) {
      Alert.alert('Error', 'Please enter a valid USDT wallet address');
      return;
    }

    Alert.alert(
      'Confirm Withdrawal',
      `You are about to withdraw ${amount.toFixed(2)} USDT to:\n\n${walletAddress}\n\nThis action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setLoading(true);
            const result = await withdrawCommission(amount, walletAddress);
            setLoading(false);

            if (result.success) {
              Alert.alert(
                'Success',
                'Withdrawal request submitted! Your USDT will be processed within 24-48 hours.',
                [{ text: 'OK', onPress: () => {
                  setWalletAddress('');
                  setWithdrawAmount('');
                }}]
              );
            } else {
              Alert.alert('Error', result.error || 'Failed to process withdrawal');
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
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const daysUntilWithdrawal = user.canWithdraw ? 0 : Math.max(0, 10 - Math.floor((Date.now() - new Date(user.joinedDate).getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Referrals</Text>
          <Text style={styles.subtitle}>Earn commissions by inviting friends</Text>
        </View>

        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>Your Referral Code</Text>
          <View style={styles.codeContainer}>
            <Text style={styles.code}>{user.referralCode}</Text>
            <View style={styles.codeActions}>
              <TouchableOpacity style={styles.iconButton} onPress={handleCopyCode}>
                <IconSymbol name="doc.on.doc" size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
                <IconSymbol name="square.and.arrow.up" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <IconSymbol name="person.3.fill" size={24} color={colors.primary} />
            <Text style={styles.statValue}>{user.referrals.level1}</Text>
            <Text style={styles.statLabel}>Level 1 (3%)</Text>
          </View>
          <View style={styles.statCard}>
            <IconSymbol name="person.2.fill" size={24} color={colors.secondary} />
            <Text style={styles.statValue}>{user.referrals.level2}</Text>
            <Text style={styles.statLabel}>Level 2 (2%)</Text>
          </View>
          <View style={styles.statCard}>
            <IconSymbol name="person.fill" size={24} color={colors.accent} />
            <Text style={styles.statValue}>{user.referrals.level3}</Text>
            <Text style={styles.statLabel}>Level 3 (1%)</Text>
          </View>
        </View>

        <View style={styles.commissionsCard}>
          <Text style={styles.sectionTitle}>Commission Summary</Text>
          <View style={styles.commissionRow}>
            <Text style={styles.commissionLabel}>Total Earned:</Text>
            <Text style={styles.commissionValue}>{user.commissions.total.toFixed(2)} USDT</Text>
          </View>
          <View style={styles.commissionRow}>
            <Text style={styles.commissionLabel}>Available:</Text>
            <Text style={[styles.commissionValue, styles.availableValue]}>
              {user.commissions.available.toFixed(2)} USDT
            </Text>
          </View>
          <View style={styles.commissionRow}>
            <Text style={styles.commissionLabel}>Withdrawn:</Text>
            <Text style={styles.commissionValue}>{user.commissions.withdrawn.toFixed(2)} USDT</Text>
          </View>
        </View>

        <View style={styles.eligibilityCard}>
          <View style={styles.eligibilityHeader}>
            <IconSymbol
              name={user.canWithdraw ? 'checkmark.circle.fill' : 'clock.fill'}
              size={24}
              color={user.canWithdraw ? colors.success : colors.warning}
            />
            <Text style={styles.eligibilityTitle}>
              {user.canWithdraw ? 'Withdrawal Available' : 'Withdrawal Requirements'}
            </Text>
          </View>
          
          {!user.canWithdraw && (
            <View style={styles.requirementsList}>
              <View style={styles.requirementItem}>
                <IconSymbol
                  name={user.activeReferrals >= 5 ? 'checkmark.circle.fill' : 'circle'}
                  size={20}
                  color={user.activeReferrals >= 5 ? colors.success : colors.textSecondary}
                />
                <Text style={styles.requirementText}>
                  {user.activeReferrals}/5 active referrals
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <IconSymbol
                  name={daysUntilWithdrawal === 0 ? 'checkmark.circle.fill' : 'circle'}
                  size={20}
                  color={daysUntilWithdrawal === 0 ? colors.success : colors.textSecondary}
                />
                <Text style={styles.requirementText}>
                  {daysUntilWithdrawal === 0 ? '10 days completed' : `${daysUntilWithdrawal} days remaining`}
                </Text>
              </View>
            </View>
          )}

          {user.canWithdraw && user.commissions.available > 0 && (
            <View style={styles.withdrawForm}>
              <View style={styles.inputContainer}>
                <Text style={commonStyles.label}>Withdrawal Amount (USDT)</Text>
                <TextInput
                  style={commonStyles.input}
                  placeholder={`Max: ${user.commissions.available.toFixed(2)}`}
                  placeholderTextColor={colors.textSecondary}
                  value={withdrawAmount}
                  onChangeText={setWithdrawAmount}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={commonStyles.label}>USDT Wallet Address</Text>
                <TextInput
                  style={commonStyles.input}
                  placeholder="Enter your USDT wallet address"
                  placeholderTextColor={colors.textSecondary}
                  value={walletAddress}
                  onChangeText={setWalletAddress}
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                style={[buttonStyles.primary, styles.withdrawButton]}
                onPress={handleWithdraw}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <IconSymbol name="arrow.down.circle.fill" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Withdraw USDT</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.infoCard}>
          <IconSymbol name="info.circle" size={20} color={colors.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>How it works:</Text>
            <Text style={styles.infoText}>
              - Earn 3% commission from Level 1 referrals{'\n'}
              - Earn 2% commission from Level 2 referrals{'\n'}
              - Earn 1% commission from Level 3 referrals{'\n'}
              - Commissions are generated on all contributions{'\n'}
              - USDT commission withdrawals: 5+ active referrals + 10 days{'\n'}
              - MXI withdrawals: 10+ active referrals + pool launch date
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  codeCard: {
    backgroundColor: colors.cardBackground,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  codeLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  code: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 2,
  },
  codeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
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
    textAlign: 'center',
  },
  commissionsCard: {
    backgroundColor: colors.cardBackground,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  commissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  commissionLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  commissionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  availableValue: {
    color: colors.success,
    fontSize: 16,
  },
  eligibilityCard: {
    backgroundColor: colors.cardBackground,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  eligibilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  eligibilityTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  requirementsList: {
    gap: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  requirementText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  withdrawForm: {
    marginTop: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
