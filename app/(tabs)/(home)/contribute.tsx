
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';
import * as Clipboard from 'expo-clipboard';

interface BinancePayment {
  paymentId: string;
  usdtAmount: number;
  mxiAmount: number;
  paymentAddress: string;
  status: string;
  expiresAt: string;
}

export default function ContributeScreen() {
  const router = useRouter();
  const { user, addContribution } = useAuth();
  const [usdtAmount, setUsdtAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<BinancePayment | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    if (!currentPayment) return;

    const interval = setInterval(() => {
      const now = new Date();
      const expires = new Date(currentPayment.expiresAt);
      const diff = expires.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Expired');
        clearInterval(interval);
        return;
      }

      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentPayment]);

  const calculateMxi = () => {
    const amount = parseFloat(usdtAmount);
    if (isNaN(amount)) return 0;
    return amount / 10; // 1 MXI = 10 USDT
  };

  const calculateYieldRate = (investment: number) => {
    const baseInvestment = 50;
    const baseYieldRate = 0.00002;
    return baseYieldRate * (investment / baseInvestment);
  };

  const handleCreatePayment = async () => {
    const amount = parseFloat(usdtAmount);

    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (amount < 50) {
      Alert.alert('Error', 'Minimum contribution is 50 USDT');
      return;
    }

    if (amount > 100000) {
      Alert.alert('Error', 'Maximum contribution is 100,000 USDT');
      return;
    }

    let txType: 'initial' | 'increase' | 'reinvestment' = 'initial';
    if (user && user.usdtContributed > 0) {
      txType = 'increase';
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        Alert.alert('Error', 'Please log in to continue');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `https://aeyfnjuatbtcauiumbhn.supabase.co/functions/v1/create-binance-payment`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            usdtAmount: amount,
            transactionType: txType,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create payment');
      }

      setCurrentPayment(result.payment);
      setShowPaymentModal(true);
      setLoading(false);
    } catch (error: any) {
      console.error('Error creating payment:', error);
      Alert.alert('Error', error.message || 'Failed to create payment');
      setLoading(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!currentPayment || !transactionId.trim()) {
      Alert.alert('Error', 'Please enter your Binance transaction ID');
      return;
    }

    setVerifying(true);

    try {
      // First, update the payment with the transaction ID
      const { error: updateError } = await supabase
        .from('binance_payments')
        .update({ 
          binance_transaction_id: transactionId.trim(),
          status: 'confirming'
        })
        .eq('payment_id', currentPayment.paymentId);

      if (updateError) {
        throw new Error('Failed to update payment');
      }

      // Now verify the payment
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        Alert.alert('Error', 'Please log in to continue');
        setVerifying(false);
        return;
      }

      const response = await fetch(
        `https://aeyfnjuatbtcauiumbhn.supabase.co/functions/v1/verify-binance-payment`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentId: currentPayment.paymentId,
            userId: user?.id,
          }),
        }
      );

      const result = await response.json();

      if (result.success && result.status === 'confirmed') {
        Alert.alert(
          'Payment Confirmed! 🎉',
          `Your payment has been verified!\n\nYou received ${result.mxiAmount} MXI tokens.\n\nYour new balance: ${result.newBalance.toFixed(2)} MXI\n\nYou are now an Active Contributor!`,
          [
            {
              text: 'OK',
              onPress: () => {
                setShowPaymentModal(false);
                setCurrentPayment(null);
                setTransactionId('');
                setUsdtAmount('');
                router.back();
              },
            },
          ]
        );
      } else {
        Alert.alert(
          'Verification Pending',
          result.message || 'Payment is being verified. This may take a few minutes. Please check back shortly.',
          [
            { text: 'Try Again', onPress: () => setVerifying(false) },
            { text: 'Cancel', onPress: () => {
              setShowPaymentModal(false);
              setCurrentPayment(null);
              setTransactionId('');
              setVerifying(false);
            }},
          ]
        );
      }

      setVerifying(false);
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      Alert.alert('Error', error.message || 'Failed to verify payment');
      setVerifying(false);
    }
  };

  const handleCopyAddress = async () => {
    if (currentPayment) {
      await Clipboard.setStringAsync(currentPayment.paymentAddress);
      Alert.alert('Copied!', 'Payment address copied to clipboard');
    }
  };

  const handleReinvest = async () => {
    if (!user) return;

    const availableCommission = user.commissions.available;

    if (availableCommission < 50) {
      Alert.alert('Error', 'You need at least 50 USDT in available commissions to reinvest');
      return;
    }

    Alert.alert(
      'Confirm Reinvestment',
      `You are about to reinvest ${availableCommission.toFixed(2)} USDT from your available commissions.\n\nYou will receive ${(availableCommission / 10).toFixed(1)} MXI tokens immediately and generate new referral commissions.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setLoading(true);
            const result = await addContribution(availableCommission, 'reinvestment');
            setLoading(false);

            if (result.success) {
              Alert.alert(
                'Success',
                `Reinvestment successful!\n\nYou received ${(availableCommission / 10).toFixed(1)} MXI tokens.\n\nYour balance has been updated!`,
                [{ text: 'OK', onPress: () => router.back() }]
              );
            } else {
              Alert.alert('Error', result.error || 'Failed to process reinvestment');
            }
          },
        },
      ]
    );
  };

  const mxiAmount = calculateMxi();

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
          <Text style={styles.title}>Contribute to Pool</Text>
          <Text style={styles.subtitle}>Pay with Binance USDT</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <IconSymbol name="info.circle" size={20} color={colors.primary} />
            <Text style={styles.infoText}>
              Payments are processed through Binance. Your MXI balance will be updated automatically after payment verification. The process typically takes 2-5 minutes.
            </Text>
          </View>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={commonStyles.label}>USDT Amount</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={commonStyles.input}
                placeholder="Enter amount (50 - 100,000)"
                placeholderTextColor={colors.textSecondary}
                value={usdtAmount}
                onChangeText={setUsdtAmount}
                keyboardType="decimal-pad"
              />
              <Text style={styles.currency}>USDT</Text>
            </View>
            <Text style={styles.helperText}>
              Minimum: 50 USDT • Maximum: 100,000 USDT
            </Text>
          </View>

          <View style={styles.conversionCard}>
            <View style={styles.conversionRow}>
              <Text style={styles.conversionLabel}>You will receive:</Text>
              <View style={styles.conversionValue}>
                <Text style={styles.conversionAmount}>{mxiAmount.toFixed(1)}</Text>
                <Text style={styles.conversionCurrency}>MXI</Text>
              </View>
            </View>
            <Text style={styles.conversionRate}>1 MXI = 10 USDT</Text>
            <View style={styles.instantUpdateBadge}>
              <IconSymbol name="bolt.fill" size={16} color={colors.success} />
              <Text style={styles.instantUpdateText}>Auto-verified via Binance</Text>
            </View>
          </View>

          {parseFloat(usdtAmount || '0') >= 50 && (
            <View style={styles.yieldCard}>
              <View style={styles.yieldHeader}>
                <IconSymbol name="chart.line.uptrend.xyaxis" size={20} color={colors.success} />
                <Text style={styles.yieldTitle}>Mining Yield Rate</Text>
              </View>
              <View style={styles.yieldInfo}>
                <View style={styles.yieldRow}>
                  <Text style={styles.yieldLabel}>Per Minute:</Text>
                  <Text style={styles.yieldValue}>
                    {calculateYieldRate(parseFloat(usdtAmount || '0')).toFixed(8)} MXI
                  </Text>
                </View>
                <View style={styles.yieldRow}>
                  <Text style={styles.yieldLabel}>Per Hour:</Text>
                  <Text style={styles.yieldValue}>
                    {(calculateYieldRate(parseFloat(usdtAmount || '0')) * 60).toFixed(8)} MXI
                  </Text>
                </View>
                <View style={styles.yieldRow}>
                  <Text style={styles.yieldLabel}>Per Day:</Text>
                  <Text style={styles.yieldValue}>
                    {(calculateYieldRate(parseFloat(usdtAmount || '0')) * 60 * 24).toFixed(6)} MXI
                  </Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.commissionCard}>
            <Text style={styles.commissionTitle}>Referral Commissions Generated:</Text>
            <View style={styles.commissionRow}>
              <Text style={styles.commissionLevel}>Level 1 (3%):</Text>
              <Text style={styles.commissionAmount}>
                {(parseFloat(usdtAmount || '0') * 0.03).toFixed(2)} USDT
              </Text>
            </View>
            <View style={styles.commissionRow}>
              <Text style={styles.commissionLevel}>Level 2 (2%):</Text>
              <Text style={styles.commissionAmount}>
                {(parseFloat(usdtAmount || '0') * 0.02).toFixed(2)} USDT
              </Text>
            </View>
            <View style={styles.commissionRow}>
              <Text style={styles.commissionLevel}>Level 3 (1%):</Text>
              <Text style={styles.commissionAmount}>
                {(parseFloat(usdtAmount || '0') * 0.01).toFixed(2)} USDT
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[buttonStyles.primary, styles.contributeButton]}
            onPress={handleCreatePayment}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <IconSymbol name="creditcard.fill" size={20} color="#fff" />
                <Text style={styles.buttonText}>Pay with Binance</Text>
              </>
            )}
          </TouchableOpacity>

          {user && user.commissions.available >= 50 && (
            <View style={styles.reinvestSection}>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.reinvestCard}>
                <View style={styles.reinvestHeader}>
                  <IconSymbol name="arrow.clockwise.circle.fill" size={24} color={colors.success} />
                  <Text style={styles.reinvestTitle}>Reinvest Commissions</Text>
                </View>
                <Text style={styles.reinvestDescription}>
                  You have {user.commissions.available.toFixed(2)} USDT available to reinvest
                </Text>
                <TouchableOpacity
                  style={[buttonStyles.outline, styles.reinvestButton]}
                  onPress={handleReinvest}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                    <Text style={styles.reinvestButtonText}>
                      Reinvest {user.commissions.available.toFixed(2)} USDT
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={styles.noteCard}>
          <IconSymbol name="exclamationmark.circle" size={20} color={colors.warning} />
          <Text style={styles.noteText}>
            Note: All contributions are final and cannot be refunded. MXI tokens will be available for withdrawal after the official launch on February 15, 2026 at 12:00 UTC.
          </Text>
        </View>
      </ScrollView>

      {/* Binance Payment Modal */}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          if (!verifying) {
            setShowPaymentModal(false);
            setCurrentPayment(null);
            setTransactionId('');
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Complete Payment</Text>
              <TouchableOpacity
                onPress={() => {
                  if (!verifying) {
                    setShowPaymentModal(false);
                    setCurrentPayment(null);
                    setTransactionId('');
                  }
                }}
                disabled={verifying}
              >
                <IconSymbol name="xmark.circle.fill" size={28} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {currentPayment && (
                <>
                  <View style={styles.paymentInfoCard}>
                    <View style={styles.paymentInfoRow}>
                      <Text style={styles.paymentInfoLabel}>Amount:</Text>
                      <Text style={styles.paymentInfoValue}>
                        {currentPayment.usdtAmount} USDT
                      </Text>
                    </View>
                    <View style={styles.paymentInfoRow}>
                      <Text style={styles.paymentInfoLabel}>You&apos;ll receive:</Text>
                      <Text style={styles.paymentInfoValue}>
                        {currentPayment.mxiAmount} MXI
                      </Text>
                    </View>
                    <View style={styles.paymentInfoRow}>
                      <Text style={styles.paymentInfoLabel}>Expires in:</Text>
                      <Text style={[styles.paymentInfoValue, styles.timerText]}>
                        {timeRemaining}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.instructionsCard}>
                    <Text style={styles.instructionsTitle}>Payment Instructions:</Text>
                    <View style={styles.instructionStep}>
                      <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>1</Text>
                      </View>
                      <Text style={styles.stepText}>
                        Open your Binance app and go to Wallet → Spot
                      </Text>
                    </View>
                    <View style={styles.instructionStep}>
                      <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>2</Text>
                      </View>
                      <Text style={styles.stepText}>
                        Select USDT and tap &quot;Withdraw&quot;
                      </Text>
                    </View>
                    <View style={styles.instructionStep}>
                      <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>3</Text>
                      </View>
                      <Text style={styles.stepText}>
                        Send {currentPayment.usdtAmount} USDT to the address below
                      </Text>
                    </View>
                  </View>

                  <View style={styles.addressCard}>
                    <Text style={styles.addressLabel}>Payment Address:</Text>
                    <View style={styles.addressBox}>
                      <Text style={styles.addressText} numberOfLines={2}>
                        {currentPayment.paymentAddress}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.copyButton}
                      onPress={handleCopyAddress}
                    >
                      <IconSymbol name="doc.on.doc.fill" size={18} color={colors.primary} />
                      <Text style={styles.copyButtonText}>Copy Address</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.transactionIdCard}>
                    <Text style={styles.transactionIdLabel}>
                      After sending, enter your Binance Transaction ID:
                    </Text>
                    <TextInput
                      style={styles.transactionIdInput}
                      placeholder="Enter transaction ID (TxID)"
                      placeholderTextColor={colors.textSecondary}
                      value={transactionId}
                      onChangeText={setTransactionId}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <Text style={styles.transactionIdHelp}>
                      You can find this in your Binance transaction history
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[buttonStyles.primary, styles.verifyButton]}
                    onPress={handleVerifyPayment}
                    disabled={verifying || !transactionId.trim()}
                  >
                    {verifying ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <IconSymbol name="checkmark.circle.fill" size={20} color="#fff" />
                        <Text style={styles.buttonText}>Verify Payment</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <View style={styles.warningCard}>
                    <IconSymbol name="exclamationmark.triangle.fill" size={18} color={colors.warning} />
                    <Text style={styles.warningText}>
                      Make sure to send the exact amount to the correct address. 
                      Payments expire in 30 minutes.
                    </Text>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  infoCard: {
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    position: 'relative',
  },
  currency: {
    position: 'absolute',
    right: 16,
    top: 12,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  conversionCard: {
    backgroundColor: colors.cardBackground,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  conversionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  conversionLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  conversionValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  conversionAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  conversionCurrency: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  conversionRate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  instantUpdateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  instantUpdateText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
  commissionCard: {
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  commissionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  commissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  commissionLevel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  commissionAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
  },
  contributeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  reinvestSection: {
    marginTop: 24,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    color: colors.textSecondary,
    fontSize: 14,
  },
  reinvestCard: {
    backgroundColor: colors.cardBackground,
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.success,
  },
  reinvestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  reinvestTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  reinvestDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  reinvestButton: {
    marginTop: 8,
  },
  reinvestButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  yieldCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.success,
  },
  yieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  yieldTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  yieldInfo: {
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
  },
  yieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  yieldLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  yieldValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
    fontFamily: 'monospace',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  modalScroll: {
    padding: 20,
  },
  paymentInfoCard: {
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  paymentInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  paymentInfoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  paymentInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  timerText: {
    color: colors.accent,
    fontFamily: 'monospace',
  },
  instructionsCard: {
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  addressCard: {
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  addressBox: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addressText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: colors.text,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  transactionIdCard: {
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  transactionIdLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  transactionIdInput: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  transactionIdHelp: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
