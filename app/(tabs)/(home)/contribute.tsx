
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
import * as Clipboard from 'expo-clipboard';
import { supabase } from '@/lib/supabase';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user, addContribution, getPhaseInfo } = useAuth();
  const [usdtAmount, setUsdtAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<BinancePayment | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(0.30);
  const [currentPhase, setCurrentPhase] = useState(1);

  useEffect(() => {
    loadPhaseInfo();
    checkExistingPayment();
  }, []);

  const loadPhaseInfo = async () => {
    const info = await getPhaseInfo();
    if (info) {
      setCurrentPrice(info.currentPriceUsdt);
      setCurrentPhase(info.currentPhase);
    }
  };

  const checkExistingPayment = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('binance_payments')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        const expiresAt = new Date(data.expires_at);
        if (expiresAt > new Date()) {
          setCurrentPayment({
            paymentId: data.payment_id,
            usdtAmount: parseFloat(data.usdt_amount.toString()),
            mxiAmount: parseFloat(data.mxi_amount.toString()),
            paymentAddress: data.payment_address || '',
            status: data.status,
            expiresAt: data.expires_at,
          });
          setShowPaymentModal(true);
        }
      }
    } catch (error) {
      console.error('Error checking existing payment:', error);
    }
  };

  const calculateMxi = (): number => {
    const amount = parseFloat(usdtAmount);
    if (isNaN(amount) || amount <= 0) return 0;
    return amount / currentPrice;
  };

  const calculateYieldRate = (investment: number): number => {
    if (investment < 50) return 0;
    if (investment <= 500) return 0.0001;
    if (investment <= 1000) return 0.00015;
    if (investment <= 5000) return 0.0002;
    if (investment <= 10000) return 0.00025;
    return 0.0003;
  };

  const handleCreatePayment = async () => {
    const amount = parseFloat(usdtAmount);

    if (isNaN(amount) || amount < 50) {
      Alert.alert('Invalid Amount', 'Minimum contribution is 50 USDT');
      return;
    }

    if (amount > 100000) {
      Alert.alert('Invalid Amount', 'Maximum contribution is 100,000 USDT');
      return;
    }

    setLoading(true);

    try {
      const mxiTokens = calculateMxi();

      const { data, error } = await supabase.functions.invoke('create-binance-payment', {
        body: {
          userId: user?.id,
          usdtAmount: amount,
          mxiAmount: mxiTokens,
        },
      });

      if (error) {
        console.error('Payment creation error:', error);
        Alert.alert('Error', 'Failed to create payment. Please try again.');
        return;
      }

      if (data?.payment) {
        setCurrentPayment({
          paymentId: data.payment.payment_id,
          usdtAmount: amount,
          mxiAmount: mxiTokens,
          paymentAddress: data.payment.payment_address || '',
          status: 'pending',
          expiresAt: data.payment.expires_at,
        });
        setShowPaymentModal(true);
        setUsdtAmount('');
      }
    } catch (error: any) {
      console.error('Payment creation exception:', error);
      Alert.alert('Error', error.message || 'Failed to create payment');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!currentPayment) return;

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('verify-binance-payment', {
        body: {
          paymentId: currentPayment.paymentId,
        },
      });

      if (error) {
        console.error('Verification error:', error);
        Alert.alert('Error', 'Failed to verify payment. Please try again.');
        return;
      }

      if (data?.status === 'confirmed') {
        Alert.alert(
          'Payment Confirmed!',
          `Your payment of ${currentPayment.usdtAmount} USDT has been confirmed. ${currentPayment.mxiAmount.toFixed(2)} MXI has been added to your balance.`,
          [
            {
              text: 'OK',
              onPress: () => {
                setShowPaymentModal(false);
                setCurrentPayment(null);
                router.back();
              },
            },
          ]
        );
      } else if (data?.status === 'pending' || data?.status === 'confirming') {
        Alert.alert(
          'Payment Pending',
          'Your payment is being processed. Please wait a few minutes and try again.'
        );
      } else {
        Alert.alert(
          'Payment Not Found',
          'We could not find your payment yet. Please make sure you have sent the exact amount to the provided address.'
        );
      }
    } catch (error: any) {
      console.error('Verification exception:', error);
      Alert.alert('Error', error.message || 'Failed to verify payment');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAddress = async () => {
    if (currentPayment?.paymentAddress) {
      await Clipboard.setStringAsync(currentPayment.paymentAddress);
      Alert.alert('Copied!', 'Payment address copied to clipboard');
    }
  };

  const handleReinvest = async () => {
    if (!user) return;

    const availableYield = user.accumulatedYield;

    if (availableYield < 50 / currentPrice) {
      Alert.alert(
        'Insufficient Yield',
        `You need at least ${(50 / currentPrice).toFixed(2)} MXI in accumulated yield to reinvest (minimum 50 USDT equivalent at current price).`
      );
      return;
    }

    Alert.alert(
      'Confirm Reinvestment',
      `Reinvest ${availableYield.toFixed(2)} MXI (${(availableYield * currentPrice).toFixed(2)} USDT equivalent) to increase your mining rate?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reinvest',
          onPress: async () => {
            setLoading(true);
            const usdtEquivalent = availableYield * currentPrice;
            const result = await addContribution(usdtEquivalent, 'reinvestment');

            if (result.success) {
              Alert.alert(
                'Success!',
                `Successfully reinvested ${availableYield.toFixed(2)} MXI. Your mining rate has been increased!`
              );
              router.back();
            } else {
              Alert.alert('Error', result.error || 'Failed to reinvest');
            }
            setLoading(false);
          },
        },
      ]
    );
  };

  if (!user) {
    return null;
  }

  const mxiTokens = calculateMxi();
  const yieldRate = calculateYieldRate(parseFloat(usdtAmount) || 0);
  const dailyYield = yieldRate * 60 * 24;

  const getPhaseDescription = () => {
    switch (currentPhase) {
      case 1:
        return 'Phase 1: 20M MXI at 0.30 USDT';
      case 2:
        return 'Phase 2: 20M MXI at 0.60 USDT';
      case 3:
        return 'Phase 3: Price at 0.90 USDT';
      default:
        return '';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Buy MXI Tokens</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Current Phase Info */}
        <View style={[commonStyles.card, styles.phaseInfoCard]}>
          <View style={styles.phaseInfoHeader}>
            <IconSymbol name="chart.line.uptrend.xyaxis" size={24} color={colors.accent} />
            <Text style={styles.phaseInfoTitle}>Current Phase {currentPhase}</Text>
          </View>
          <Text style={styles.phaseInfoDescription}>{getPhaseDescription()}</Text>
          <View style={styles.priceDisplay}>
            <Text style={styles.priceLabel}>Current Price</Text>
            <Text style={styles.priceValue}>${currentPrice.toFixed(2)} USDT per MXI</Text>
          </View>
        </View>

        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Contribution Amount</Text>
          <Text style={styles.sectionSubtitle}>
            Enter the amount in USDT (Min: 50, Max: 100,000)
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter USDT amount"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={usdtAmount}
              onChangeText={setUsdtAmount}
              editable={!loading}
            />
            <Text style={styles.inputCurrency}>USDT</Text>
          </View>

          {mxiTokens > 0 && (
            <View style={styles.conversionCard}>
              <View style={styles.conversionRow}>
                <Text style={styles.conversionLabel}>You will receive</Text>
                <Text style={styles.conversionValue}>{mxiTokens.toFixed(2)} MXI</Text>
              </View>
              <View style={styles.conversionRow}>
                <Text style={styles.conversionLabel}>Price per MXI</Text>
                <Text style={styles.conversionValue}>${currentPrice.toFixed(2)} USDT</Text>
              </View>
              <View style={styles.conversionRow}>
                <Text style={styles.conversionLabel}>Mining rate/minute</Text>
                <Text style={styles.conversionValue}>{yieldRate.toFixed(6)} MXI</Text>
              </View>
              <View style={styles.conversionRow}>
                <Text style={styles.conversionLabel}>Daily mining</Text>
                <Text style={styles.conversionValue}>{dailyYield.toFixed(4)} MXI</Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[buttonStyles.primary, loading && buttonStyles.disabled]}
            onPress={handleCreatePayment}
            disabled={loading || !usdtAmount}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <IconSymbol name="creditcard.fill" size={20} color="#fff" />
                <Text style={buttonStyles.primaryText}>Create Binance Payment</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Reinvest Yield Section */}
        {user.accumulatedYield > 0 && (
          <View style={commonStyles.card}>
            <Text style={styles.sectionTitle}>Reinvest Mined MXI</Text>
            <Text style={styles.sectionSubtitle}>
              Reinvest your accumulated yield to increase your mining rate
            </Text>

            <View style={styles.yieldCard}>
              <View style={styles.yieldRow}>
                <Text style={styles.yieldLabel}>Available Yield</Text>
                <Text style={styles.yieldValue}>{user.accumulatedYield.toFixed(4)} MXI</Text>
              </View>
              <View style={styles.yieldRow}>
                <Text style={styles.yieldLabel}>USDT Equivalent</Text>
                <Text style={styles.yieldValue}>
                  ${(user.accumulatedYield * currentPrice).toFixed(2)} USDT
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[buttonStyles.secondary, loading && buttonStyles.disabled]}
              onPress={handleReinvest}
              disabled={loading || user.accumulatedYield < 50 / currentPrice}
            >
              {loading ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <>
                  <IconSymbol name="arrow.clockwise" size={20} color={colors.primary} />
                  <Text style={buttonStyles.secondaryText}>Reinvest Yield</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Info Card */}
        <View style={[commonStyles.card, styles.infoCard]}>
          <IconSymbol name="info.circle.fill" size={24} color={colors.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>How it works</Text>
            <Text style={styles.infoText}>
              - Create a payment and receive a unique Binance Pay address{'\n'}
              - Send the exact USDT amount to the provided address{'\n'}
              - Verify your payment to receive MXI tokens{'\n'}
              - Start earning mining rewards immediately{'\n'}
              - Price varies by phase: Phase 1 (0.30), Phase 2 (0.60), Phase 3 (0.90)
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Complete Payment</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <IconSymbol name="xmark.circle.fill" size={28} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {currentPayment && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.paymentInfoCard}>
                  <View style={styles.paymentInfoRow}>
                    <Text style={styles.paymentInfoLabel}>Amount to Send</Text>
                    <Text style={styles.paymentInfoValue}>
                      {currentPayment.usdtAmount} USDT
                    </Text>
                  </View>
                  <View style={styles.paymentInfoRow}>
                    <Text style={styles.paymentInfoLabel}>You will receive</Text>
                    <Text style={styles.paymentInfoValue}>
                      {currentPayment.mxiAmount.toFixed(2)} MXI
                    </Text>
                  </View>
                  <View style={styles.paymentInfoRow}>
                    <Text style={styles.paymentInfoLabel}>Price</Text>
                    <Text style={styles.paymentInfoValue}>
                      ${currentPrice.toFixed(2)} USDT per MXI
                    </Text>
                  </View>
                </View>

                <View style={styles.addressCard}>
                  <Text style={styles.addressLabel}>Send USDT (BEP20) to:</Text>
                  <View style={styles.addressContainer}>
                    <Text style={styles.addressText} numberOfLines={1}>
                      {currentPayment.paymentAddress || 'Generating address...'}
                    </Text>
                    <TouchableOpacity onPress={handleCopyAddress} style={styles.copyButton}>
                      <IconSymbol name="doc.on.doc" size={20} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.warningCard}>
                  <IconSymbol name="exclamationmark.triangle.fill" size={20} color={colors.warning} />
                  <Text style={styles.warningText}>
                    Send exactly {currentPayment.usdtAmount} USDT to the address above. Sending a
                    different amount may result in payment failure.
                  </Text>
                </View>

                <TouchableOpacity
                  style={[buttonStyles.primary, loading && buttonStyles.disabled]}
                  onPress={handleVerifyPayment}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <IconSymbol name="checkmark.circle.fill" size={20} color="#fff" />
                      <Text style={buttonStyles.primaryText}>Verify Payment</Text>
                    </>
                  )}
                </TouchableOpacity>

                <Text style={styles.modalNote}>
                  After sending the payment, click "Verify Payment" to confirm your transaction.
                  This may take a few minutes to process.
                </Text>
              </ScrollView>
            )}
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
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  phaseInfoCard: {
    backgroundColor: colors.card,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  phaseInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  phaseInfoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  phaseInfoDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  priceDisplay: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
  },
  priceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.accent,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: colors.text,
    paddingVertical: 16,
  },
  inputCurrency: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 8,
  },
  conversionCard: {
    backgroundColor: colors.highlight,
    padding: 16,
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
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  yieldCard: {
    backgroundColor: colors.highlight,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  yieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  yieldLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  yieldValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  infoCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.highlight,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
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
  modalBody: {
    padding: 20,
  },
  paymentInfoCard: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  paymentInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentInfoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  paymentInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  addressCard: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  addressLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'monospace',
    color: colors.text,
  },
  copyButton: {
    padding: 8,
    marginLeft: 8,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: colors.highlight,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  modalNote: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
});
