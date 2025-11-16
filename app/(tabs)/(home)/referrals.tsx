
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import * as Clipboard from 'expo-clipboard';

export default function ReferralsScreen() {
  const { user, withdrawCommission, unifyCommissionToMXI, getCurrentYield } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [canWithdraw, setCanWithdraw] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [currentYield, setCurrentYield] = useState(0);

  useEffect(() => {
    if (user && getCurrentYield) {
      const yield_value = getCurrentYield();
      setCurrentYield(yield_value);
    }
  }, [user, getCurrentYield]);

  useEffect(() => {
    if (user) {
      checkEligibility();
      loadCurrentPrice();
    }
  }, [user]);

  const loadCurrentPrice = async () => {
    setCurrentPrice(0.012);
  };

  const checkEligibility = async () => {
    if (!user) return;

    const hasMinReferrals = user.activeReferrals >= 5;
    const daysSinceLastWithdrawal = user.lastWithdrawalDate
      ? (Date.now() - new Date(user.lastWithdrawalDate).getTime()) / (1000 * 60 * 60 * 24)
      : 999;
    const hasWaitedEnough = daysSinceLastWithdrawal >= 10;

    setCanWithdraw(hasMinReferrals && hasWaitedEnough);
  };

  const handleCopyCode = async () => {
    if (!user?.referralCode) return;
    await Clipboard.setStringAsync(user.referralCode);
    Alert.alert('Copied!', 'Referral code copied to clipboard');
  };

  const handleShare = async () => {
    if (!user?.referralCode) return;

    try {
      await Share.share({
        message: `Join MXI Pool with my referral code: ${user.referralCode}\n\nEarn MXI tokens and get rewards!`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleWithdraw = async () => {
    if (!user) return;

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (amount > user.commissions.available) {
      Alert.alert('Insufficient Balance', 'You don&apos;t have enough available commissions');
      return;
    }

    if (!canWithdraw) {
      Alert.alert(
        'Not Eligible',
        'You need at least 5 active referrals and must wait 10 days between withdrawals'
      );
      return;
    }

    if (!walletAddress) {
      Alert.alert('Missing Information', 'Please enter your wallet address');
      return;
    }

    setLoading(true);
    const result = await withdrawCommission(amount, walletAddress);
    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Withdrawal request submitted successfully!');
      setWithdrawAmount('');
      setWalletAddress('');
    } else {
      Alert.alert('Error', result.error || 'Failed to submit withdrawal request');
    }
  };

  const handleUnifyToMXI = async () => {
    if (!user) return;

    const available = user.commissions.available;
    if (available <= 0) {
      Alert.alert('No Commissions', 'You don&apos;t have any available commissions to unify');
      return;
    }

    Alert.alert(
      'Unify to MXI',
      `Convert $${available.toFixed(2)} USDT in commissions to MXI at current price ($${currentPrice}/MXI)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setLoading(true);
            const result = await unifyCommissionToMXI(available);
            setLoading(false);

            if (result.success) {
              Alert.alert(
                'Success!',
                `Converted $${available.toFixed(2)} to ${result.mxiAmount?.toFixed(2)} MXI!`
              );
            } else {
              Alert.alert('Error', result.error || 'Failed to unify commissions');
            }
          },
        },
      ]
    );
  };

  const handleUnifyVestingBalance = () => {
    router.push('/(tabs)/(home)/vesting');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol ios_icon_name="chevron.left" android_material_icon_name="arrow_back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Referrals</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Referral Code Card */}
        <View style={[commonStyles.card, styles.codeCard]}>
          <View style={styles.codeHeader}>
            <IconSymbol 
              ios_icon_name="person.2.fill" 
              android_material_icon_name="people" 
              size={32} 
              color={colors.primary} 
            />
            <Text style={styles.codeTitle}>Your Referral Code</Text>
          </View>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{user?.referralCode || 'N/A'}</Text>
            <TouchableOpacity onPress={handleCopyCode} style={styles.copyButton}>
              <IconSymbol 
                ios_icon_name="doc.on.doc" 
                android_material_icon_name="content_copy" 
                size={20} 
                color={colors.primary} 
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={[buttonStyles.primary, styles.shareButton]} onPress={handleShare}>
            <IconSymbol 
              ios_icon_name="square.and.arrow.up" 
              android_material_icon_name="share" 
              size={20} 
              color="#fff" 
            />
            <Text style={buttonStyles.primaryText}>Share Code</Text>
          </TouchableOpacity>
        </View>

        {/* Commission Stats */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Commission Balance</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Earned</Text>
              <Text style={styles.statValue}>${user?.commissions.total.toFixed(2) || '0.00'}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Available</Text>
              <Text style={[styles.statValue, { color: colors.success }]}>
                ${user?.commissions.available.toFixed(2) || '0.00'}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Withdrawn</Text>
              <Text style={styles.statValue}>${user?.commissions.withdrawn.toFixed(2) || '0.00'}</Text>
            </View>
          </View>
        </View>

        {/* Referral Stats */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Your Referrals</Text>
          <View style={styles.referralsList}>
            <View style={styles.referralItem}>
              <View style={styles.referralLevel}>
                <Text style={styles.referralLevelText}>Level 1</Text>
                <Text style={styles.referralRate}>3%</Text>
              </View>
              <Text style={styles.referralCount}>{user?.referrals.level1 || 0} referrals</Text>
            </View>
            <View style={styles.referralItem}>
              <View style={styles.referralLevel}>
                <Text style={styles.referralLevelText}>Level 2</Text>
                <Text style={styles.referralRate}>2%</Text>
              </View>
              <Text style={styles.referralCount}>{user?.referrals.level2 || 0} referrals</Text>
            </View>
            <View style={styles.referralItem}>
              <View style={styles.referralLevel}>
                <Text style={styles.referralLevelText}>Level 3</Text>
                <Text style={styles.referralRate}>1%</Text>
              </View>
              <Text style={styles.referralCount}>{user?.referrals.level3 || 0} referrals</Text>
            </View>
          </View>
          <View style={styles.activeReferrals}>
            <Text style={styles.activeLabel}>Active Referrals (Level 1):</Text>
            <Text style={styles.activeValue}>{user?.activeReferrals || 0}</Text>
          </View>
        </View>

        {/* Unify Options */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Convert Commissions</Text>
          <Text style={styles.unifyDescription}>
            Convert your available commissions to MXI tokens at the current market price.
          </Text>
          <TouchableOpacity
            style={[buttonStyles.primary, styles.unifyButton]}
            onPress={handleUnifyToMXI}
            disabled={loading || !user || user.commissions.available <= 0}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <React.Fragment>
                <IconSymbol 
                  ios_icon_name="arrow.triangle.merge" 
                  android_material_icon_name="merge_type" 
                  size={20} 
                  color="#fff" 
                />
                <Text style={buttonStyles.primaryText}>Convert to MXI</Text>
              </React.Fragment>
            )}
          </TouchableOpacity>
        </View>

        {/* Withdrawal Section */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Withdraw Commissions</Text>
          
          {!canWithdraw && (
            <View style={styles.warningBox}>
              <IconSymbol 
                ios_icon_name="exclamationmark.triangle.fill" 
                android_material_icon_name="warning" 
                size={20} 
                color={colors.warning} 
              />
              <Text style={styles.warningText}>
                You need at least 5 active referrals and must wait 10 days between withdrawals
              </Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Amount (USDT)</Text>
            <TextInput
              style={styles.input}
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
              keyboardType="decimal-pad"
              placeholder="Enter amount"
              placeholderTextColor={colors.textSecondary}
              editable={canWithdraw}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Wallet Address (TRC20)</Text>
            <TextInput
              style={styles.input}
              value={walletAddress}
              onChangeText={setWalletAddress}
              placeholder="Enter your TRC20 wallet address"
              placeholderTextColor={colors.textSecondary}
              editable={canWithdraw}
            />
          </View>

          <TouchableOpacity
            style={[buttonStyles.primary, styles.withdrawButton]}
            onPress={handleWithdraw}
            disabled={loading || !canWithdraw}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={buttonStyles.primaryText}>Request Withdrawal</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* How It Works */}
        <View style={[commonStyles.card, styles.infoCard]}>
          <View style={styles.infoHeader}>
            <IconSymbol 
              ios_icon_name="info.circle.fill" 
              android_material_icon_name="info" 
              size={24} 
              color={colors.primary} 
            />
            <Text style={styles.infoTitle}>How Referrals Work</Text>
          </View>
          <View style={styles.infoList}>
            <Text style={styles.infoItem}>• Share your referral code with friends</Text>
            <Text style={styles.infoItem}>• Earn 3% from Level 1 referrals</Text>
            <Text style={styles.infoItem}>• Earn 2% from Level 2 referrals</Text>
            <Text style={styles.infoItem}>• Earn 1% from Level 3 referrals</Text>
            <Text style={styles.infoItem}>• Commissions available after 10 days</Text>
            <Text style={styles.infoItem}>• Need 5 active Level 1 referrals to withdraw</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  codeCard: {
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  codeHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  codeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  codeText: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  copyButton: {
    padding: 8,
  },
  shareButton: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  referralsList: {
    gap: 12,
    marginBottom: 16,
  },
  referralItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  referralLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  referralLevelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  referralRate: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  referralCount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  activeReferrals: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.success + '20',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.success + '40',
  },
  activeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  activeValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.success,
  },
  unifyDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  unifyButton: {
    marginTop: 8,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.warning + '20',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.warning + '40',
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  withdrawButton: {
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: colors.primary + '10',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  infoList: {
    gap: 8,
  },
  infoItem: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
