
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';

type WithdrawalType = 'wallet' | 'unify';

export default function WithdrawalScreen() {
  const router = useRouter();
  const { 
    user, 
    withdrawMXI, 
    checkMXIWithdrawalEligibility, 
    getPoolStatus, 
    getAvailableMXI,
    unifyCommissionToMXI,
    getPhaseInfo,
  } = useAuth();
  
  const [walletAddress, setWalletAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [unifyAmount, setUnifyAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [unifying, setUnifying] = useState(false);
  const [canWithdrawMXI, setCanWithdrawMXI] = useState(false);
  const [poolStatus, setPoolStatus] = useState<any>(null);
  const [checkingEligibility, setCheckingEligibility] = useState(true);
  const [availableMXI, setAvailableMXI] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(0.30);
  const [selectedType, setSelectedType] = useState<WithdrawalType>('wallet');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setCheckingEligibility(true);
    const eligible = await checkMXIWithdrawalEligibility();
    const status = await getPoolStatus();
    const available = await getAvailableMXI();
    const phaseInfo = await getPhaseInfo();
    
    setCanWithdrawMXI(eligible);
    setPoolStatus(status);
    setAvailableMXI(available);
    if (phaseInfo) {
      setCurrentPrice(phaseInfo.currentPriceUsdt);
    }
    setCheckingEligibility(false);
  };

  const handleWithdrawToWallet = async () => {
    if (!user) return;

    const amount = parseFloat(withdrawAmount);

    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (amount > availableMXI) {
      Alert.alert('Error', `You can only withdraw up to ${availableMXI.toFixed(2)} MXI at this time`);
      return;
    }

    if (!walletAddress || walletAddress.length < 10) {
      Alert.alert('Error', 'Please enter a valid MXI wallet address');
      return;
    }

    Alert.alert(
      'Confirm MXI Withdrawal',
      `You are about to withdraw ${amount.toFixed(2)} MXI to:\n\n${walletAddress}\n\nThis action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setLoading(true);
            const result = await withdrawMXI(amount, walletAddress);
            setLoading(false);

            if (result.success) {
              Alert.alert(
                'Success',
                'MXI withdrawal request submitted! Your tokens will be processed within 24-48 hours.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      setWalletAddress('');
                      setWithdrawAmount('');
                    },
                  },
                ]
              );
            } else {
              Alert.alert('Error', result.error || 'Failed to process withdrawal');
            }
          },
        },
      ]
    );
  };

  const handleUnifyBalance = async () => {
    if (!user) return;

    const amount = parseFloat(unifyAmount);

    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (amount > user.commissions.available) {
      Alert.alert('Error', `You only have ${user.commissions.available.toFixed(2)} USDT available`);
      return;
    }

    const mxiAmount = amount / currentPrice;

    Alert.alert(
      '💎 Unify Balance to MXI',
      `Convert ${amount.toFixed(2)} USDT to ${mxiAmount.toFixed(4)} MXI?\n\nCurrent price: ${currentPrice.toFixed(2)} USDT per MXI\n\nThis will add the MXI to your general balance.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unify',
          onPress: async () => {
            setUnifying(true);
            const result = await unifyCommissionToMXI(amount);
            setUnifying(false);

            if (result.success) {
              Alert.alert(
                '✅ Balance Unified',
                `Successfully converted ${amount.toFixed(2)} USDT to ${result.mxiAmount?.toFixed(4)} MXI.\n\nYour MXI balance has been updated.`,
                [{ text: 'Excellent', onPress: () => setUnifyAmount('') }]
              );
            } else {
              Alert.alert('Error', result.error || 'Failed to unify balance');
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

  // Calculate requirements for wallet withdrawal
  const walletRequirements = [
    {
      id: 'active_referrals',
      label: '5 Active Referrals',
      met: user.activeReferrals >= 5,
      progress: `${user.activeReferrals}/5`,
    },
    {
      id: 'kyc_verification',
      label: 'KYC Verification',
      met: user.kycStatus === 'approved',
      progress: user.kycStatus === 'approved' ? 'Approved' : user.kycStatus === 'pending' ? 'Pending' : 'Not Submitted',
    },
    {
      id: 'pool_launched',
      label: 'Pool Launched',
      met: poolStatus?.is_mxi_launched || false,
      progress: poolStatus?.is_mxi_launched ? 'Launched' : `${poolStatus?.days_until_launch || 0} days`,
    },
    {
      id: 'available_balance',
      label: 'Available MXI Balance',
      met: availableMXI > 0,
      progress: `${availableMXI.toFixed(2)} MXI`,
    },
    {
      id: 'membership_duration',
      label: '10 Days Membership',
      met: user.canWithdraw,
      progress: user.canWithdraw ? 'Completed' : 'In Progress',
    },
  ];

  const unifyRequirements = [
    {
      id: 'commission_balance',
      label: 'Commission Balance Available',
      met: user.commissions.available > 0,
      progress: `${user.commissions.available.toFixed(2)} USDT`,
    },
  ];

  const walletRequirementsMet = walletRequirements.filter(r => r.met).length;
  const unifyRequirementsMet = unifyRequirements.filter(r => r.met).length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol ios_icon_name="chevron.left" android_material_icon_name="chevron_left" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Withdrawal</Text>
          <Text style={styles.subtitle}>Manage your balance withdrawals</Text>
        </View>

        {/* Balance Overview */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceTitle}>💰 Balance Overview</Text>
          <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>Total Balance</Text>
              <Text style={styles.balanceValue}>{user.mxiBalance.toFixed(2)} MXI</Text>
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>Available for Withdrawal</Text>
              <Text style={[styles.balanceValue, styles.balanceValueHighlight]}>
                {availableMXI.toFixed(2)} MXI
              </Text>
            </View>
          </View>
          <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>Commission Balance</Text>
              <Text style={styles.balanceValue}>{user.commissions.available.toFixed(2)} USDT</Text>
            </View>
          </View>
        </View>

        {/* Withdrawal Type Selector */}
        <View style={styles.typeSelectorCard}>
          <Text style={styles.typeSelectorTitle}>Select Withdrawal Type</Text>
          <View style={styles.typeSelectorButtons}>
            <TouchableOpacity
              style={[
                styles.typeSelectorButton,
                selectedType === 'wallet' && styles.typeSelectorButtonActive,
              ]}
              onPress={() => setSelectedType('wallet')}
            >
              <IconSymbol 
                ios_icon_name="arrow.down.circle.fill" 
                android_material_icon_name="arrow_circle_down" 
                size={24} 
                color={selectedType === 'wallet' ? '#fff' : colors.primary} 
              />
              <Text style={[
                styles.typeSelectorButtonText,
                selectedType === 'wallet' && styles.typeSelectorButtonTextActive,
              ]}>
                Withdraw to Wallet
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeSelectorButton,
                selectedType === 'unify' && styles.typeSelectorButtonActive,
              ]}
              onPress={() => setSelectedType('unify')}
            >
              <IconSymbol 
                ios_icon_name="arrow.triangle.2.circlepath" 
                android_material_icon_name="sync" 
                size={24} 
                color={selectedType === 'unify' ? '#fff' : colors.accent} 
              />
              <Text style={[
                styles.typeSelectorButtonText,
                selectedType === 'unify' && styles.typeSelectorButtonTextActive,
              ]}>
                Unify Balance
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Requirements Checklist */}
        <View style={styles.requirementsCard}>
          <View style={styles.requirementsHeader}>
            <IconSymbol 
              ios_icon_name="checklist" 
              android_material_icon_name="checklist" 
              size={24} 
              color={colors.primary} 
            />
            <Text style={styles.requirementsTitle}>
              {selectedType === 'wallet' ? 'Wallet Withdrawal Requirements' : 'Unify Balance Requirements'}
            </Text>
          </View>
          
          <View style={styles.requirementsProgress}>
            <View style={styles.requirementsProgressBar}>
              <View 
                style={[
                  styles.requirementsProgressFill,
                  {
                    width: selectedType === 'wallet' 
                      ? `${(walletRequirementsMet / walletRequirements.length) * 100}%`
                      : `${(unifyRequirementsMet / unifyRequirements.length) * 100}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.requirementsProgressText}>
              {selectedType === 'wallet' 
                ? `${walletRequirementsMet}/${walletRequirements.length} Requirements Met`
                : `${unifyRequirementsMet}/${unifyRequirements.length} Requirements Met`}
            </Text>
          </View>

          <View style={styles.requirementsList}>
            {(selectedType === 'wallet' ? walletRequirements : unifyRequirements).map((req, index) => (
              <React.Fragment key={req.id}>
                <View style={styles.requirementItem}>
                  <View style={styles.requirementIconContainer}>
                    <IconSymbol
                      ios_icon_name={req.met ? 'checkmark.circle.fill' : 'circle'}
                      android_material_icon_name={req.met ? 'check_circle' : 'radio_button_unchecked'}
                      size={24}
                      color={req.met ? colors.success : colors.textSecondary}
                    />
                  </View>
                  <View style={styles.requirementContent}>
                    <Text style={[styles.requirementLabel, req.met && styles.requirementLabelMet]}>
                      {req.label}
                    </Text>
                    <Text style={styles.requirementProgress}>{req.progress}</Text>
                  </View>
                </View>
                {index < (selectedType === 'wallet' ? walletRequirements : unifyRequirements).length - 1 && (
                  <View style={styles.requirementDivider} />
                )}
              </React.Fragment>
            ))}
          </View>

          {selectedType === 'wallet' && user.kycStatus !== 'approved' && (
            <TouchableOpacity
              style={styles.kycButton}
              onPress={() => router.push('/(tabs)/(home)/kyc-verification')}
            >
              <IconSymbol ios_icon_name="person.badge.shield.checkmark" android_material_icon_name="verified_user" size={20} color="#fff" />
              <Text style={styles.kycButtonText}>
                {user.kycStatus === 'not_submitted' ? 'Start KYC Verification' :
                 user.kycStatus === 'pending' ? 'View KYC Status' :
                 'Resubmit KYC'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Withdrawal Form */}
        {selectedType === 'wallet' && canWithdrawMXI && availableMXI > 0 && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>💵 Withdraw to Wallet</Text>
            
            <View style={styles.inputContainer}>
              <Text style={commonStyles.label}>Amount (MXI)</Text>
              <TextInput
                style={commonStyles.input}
                placeholder={`Max: ${availableMXI.toFixed(2)}`}
                placeholderTextColor={colors.textSecondary}
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
                keyboardType="decimal-pad"
              />
              <TouchableOpacity
                style={styles.maxButton}
                onPress={() => setWithdrawAmount(availableMXI.toString())}
              >
                <Text style={styles.maxButtonText}>MAX</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={commonStyles.label}>MXI Wallet Address</Text>
              <TextInput
                style={[commonStyles.input, styles.addressInput]}
                placeholder="Enter your MXI wallet address"
                placeholderTextColor={colors.textSecondary}
                value={walletAddress}
                onChangeText={setWalletAddress}
                autoCapitalize="none"
                multiline
              />
            </View>

            <TouchableOpacity
              style={[buttonStyles.primary, styles.submitButton]}
              onPress={handleWithdrawToWallet}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <React.Fragment>
                  <IconSymbol ios_icon_name="arrow.down.circle.fill" android_material_icon_name="arrow_circle_down" size={20} color="#fff" />
                  <Text style={styles.submitButtonText}>Withdraw to Wallet</Text>
                </React.Fragment>
              )}
            </TouchableOpacity>
          </View>
        )}

        {selectedType === 'unify' && user.commissions.available > 0 && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>💎 Unify Balance to MXI</Text>
            
            <View style={styles.inputContainer}>
              <Text style={commonStyles.label}>Amount (USDT)</Text>
              <TextInput
                style={commonStyles.input}
                placeholder={`Max: ${user.commissions.available.toFixed(2)}`}
                placeholderTextColor={colors.textSecondary}
                value={unifyAmount}
                onChangeText={setUnifyAmount}
                keyboardType="decimal-pad"
              />
              <TouchableOpacity
                style={styles.maxButton}
                onPress={() => setUnifyAmount(user.commissions.available.toString())}
              >
                <Text style={styles.maxButtonText}>MAX</Text>
              </TouchableOpacity>
            </View>

            {unifyAmount && parseFloat(unifyAmount) > 0 && (
              <View style={styles.conversionInfo}>
                <Text style={styles.conversionLabel}>You will receive:</Text>
                <Text style={styles.conversionValue}>
                  ≈ {(parseFloat(unifyAmount) / currentPrice).toFixed(4)} MXI
                </Text>
                <Text style={styles.conversionRate}>
                  Current rate: 1 MXI = {currentPrice.toFixed(2)} USDT
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[buttonStyles.secondary, styles.submitButton]}
              onPress={handleUnifyBalance}
              disabled={unifying}
            >
              {unifying ? (
                <ActivityIndicator color={colors.accent} />
              ) : (
                <React.Fragment>
                  <IconSymbol ios_icon_name="arrow.triangle.2.circlepath" android_material_icon_name="sync" size={20} color={colors.accent} />
                  <Text style={[styles.submitButtonText, { color: colors.accent }]}>Unify to MXI Balance</Text>
                </React.Fragment>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <IconSymbol ios_icon_name="info.circle.fill" android_material_icon_name="info" size={20} color={colors.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Important Information:</Text>
            <Text style={styles.infoText}>
              {selectedType === 'wallet' ? (
                <>
                  • Wallet withdrawals require 5 active referrals{'\n'}
                  • KYC verification is mandatory{'\n'}
                  • Only available MXI can be withdrawn{'\n'}
                  • Remaining balance releases every 7 days{'\n'}
                  • Processing time: 24-48 hours{'\n'}
                  • Verify wallet address carefully{'\n'}
                  • Transactions cannot be reversed
                </>
              ) : (
                <>
                  • No requirements for unifying balance{'\n'}
                  • Converts USDT commissions to MXI{'\n'}
                  • Uses current market price{'\n'}
                  • Instant conversion{'\n'}
                  • MXI added to general balance{'\n'}
                  • ⚠️ Unified MXI does NOT count for vesting percentage
                </>
              )}
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
    paddingBottom: 120,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    marginBottom: 16,
    alignSelf: 'flex-start',
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
  balanceCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  balanceTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  balanceRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  balanceItem: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  balanceValueHighlight: {
    color: colors.success,
  },
  balanceDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  typeSelectorCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeSelectorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  typeSelectorButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  typeSelectorButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.background,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  typeSelectorButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeSelectorButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  typeSelectorButtonTextActive: {
    color: '#fff',
  },
  requirementsCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  requirementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  requirementsProgress: {
    marginBottom: 16,
  },
  requirementsProgressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  requirementsProgressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 4,
  },
  requirementsProgressText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  requirementsList: {
    gap: 0,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  requirementIconContainer: {
    width: 32,
    alignItems: 'center',
  },
  requirementContent: {
    flex: 1,
  },
  requirementLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  requirementLabelMet: {
    color: colors.success,
  },
  requirementProgress: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  requirementDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 44,
  },
  kycButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  kycButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  addressInput: {
    minHeight: 60,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  maxButton: {
    position: 'absolute',
    right: 12,
    top: 38,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  maxButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  conversionInfo: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  conversionLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  conversionValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 4,
  },
  conversionRate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
