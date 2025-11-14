
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
import { IconSymbol } from '@/components/IconSymbol';
import * as Clipboard from 'expo-clipboard';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface BinancePayment {
  paymentId: string;
  usdtAmount: number;
  mxiAmount: number;
  paymentAddress: string;
  status: string;
  expiresAt: string;
}

// ⚠️ IMPORTANTE: Reemplaza esta dirección con tu dirección de billetera Binance real
// Para obtener tu dirección:
// 1. Abre Binance
// 2. Ve a Wallet → Spot → USDT
// 3. Haz clic en "Deposit"
// 4. Selecciona la red (recomendado: TRC20 para comisiones bajas)
// 5. Copia la dirección que aparece
const BINANCE_WALLET_ADDRESS = 'TYourBinanceWalletAddressHere123456789';

export default function ContributeScreen() {
  const router = useRouter();
  const { user, addContribution } = useAuth();
  const [usdtAmount, setUsdtAmount] = useState('');
  const [mxiAmount, setMxiAmount] = useState('0');
  const [loading, setLoading] = useState(false);
  const [phaseInfo, setPhaseInfo] = useState<any>(null);
  const [currentPayment, setCurrentPayment] = useState<BinancePayment | null>(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    loadPhaseInfo();
    checkExistingPayment();
  }, []);

  const loadPhaseInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('metrics')
        .select('*')
        .single();

      if (error) throw error;
      setPhaseInfo(data);
    } catch (error) {
      console.error('Error loading phase info:', error);
    }
  };

  const checkExistingPayment = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('binance_payments')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['pending', 'confirming'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        const expiresAt = new Date(data.expires_at);
        if (expiresAt > new Date()) {
          setCurrentPayment({
            paymentId: data.payment_id,
            usdtAmount: parseFloat(data.usdt_amount),
            mxiAmount: parseFloat(data.mxi_amount),
            paymentAddress: data.payment_address || BINANCE_WALLET_ADDRESS,
            status: data.status,
            expiresAt: data.expires_at,
          });
          setPaymentModalVisible(true);
        }
      }
    } catch (error) {
      console.error('Error checking existing payment:', error);
    }
  };

  const calculateMxi = (usdt: string) => {
    const amount = parseFloat(usdt);
    if (isNaN(amount) || !phaseInfo) {
      setMxiAmount('0');
      return;
    }

    const currentPrice = parseFloat(phaseInfo.current_price_usdt || '0.30');
    const mxi = amount / currentPrice;
    setMxiAmount(mxi.toFixed(2));
  };

  const calculateYieldRate = (investment: number): number => {
    if (investment >= 50 && investment < 500) return 0.000347222;
    if (investment >= 500 && investment < 1000) return 0.000694444;
    if (investment >= 1000 && investment < 5000) return 0.001388889;
    if (investment >= 5000 && investment < 10000) return 0.002777778;
    if (investment >= 10000 && investment < 50000) return 0.005555556;
    if (investment >= 50000 && investment < 100000) return 0.011111111;
    if (investment >= 100000) return 0.022222222;
    return 0;
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

    try {
      setLoading(true);

      // Generate payment ID
      const paymentId = `MXI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Calculate expiration (30 minutes from now)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 30);

      // Create payment record with your Binance wallet address
      const { data, error } = await supabase
        .from('binance_payments')
        .insert({
          user_id: user?.id,
          payment_id: paymentId,
          usdt_amount: amount,
          mxi_amount: parseFloat(mxiAmount),
          payment_address: BINANCE_WALLET_ADDRESS,
          status: 'pending',
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentPayment({
        paymentId: data.payment_id,
        usdtAmount: parseFloat(data.usdt_amount),
        mxiAmount: parseFloat(data.mxi_amount),
        paymentAddress: data.payment_address,
        status: data.status,
        expiresAt: data.expires_at,
      });

      setPaymentModalVisible(true);
      setUsdtAmount('');
      setMxiAmount('0');
    } catch (error) {
      console.error('Error creating payment:', error);
      Alert.alert('Error', 'Could not create payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!currentPayment) return;

    if (!transactionId || transactionId.trim().length < 10) {
      Alert.alert(
        'Transaction ID Required',
        'Please enter the Binance transaction ID (TxID). You can find it in your Binance transaction history.'
      );
      return;
    }

    try {
      setVerifying(true);

      // Call Edge Function to verify payment automatically
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${supabase.supabaseUrl}/functions/v1/binance-payment-verification`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            paymentId: currentPayment.paymentId,
            action: 'verify',
            transactionId: transactionId,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to verify payment');
      }

      if (result.status === 'confirmed') {
        // Payment was automatically verified and confirmed!
        Alert.alert(
          '✅ Payment Confirmed!',
          `Your payment has been verified and your balance has been updated!\n\n` +
          `New MXI Balance: ${result.newBalance?.toFixed(2) || 'N/A'} MXI\n` +
          `Yield Rate: ${(result.yieldRate * 60 * 24)?.toFixed(6) || 'N/A'} MXI/day`,
          [
            {
              text: 'View Balance',
              onPress: () => {
                setPaymentModalVisible(false);
                setCurrentPayment(null);
                setTransactionId('');
                router.push('/(tabs)/(home)/');
              },
            },
          ]
        );
      } else {
        // Payment submitted for manual verification
        Alert.alert(
          'Verification Submitted',
          result.message || 'Your payment has been submitted for verification. An administrator will review it shortly.',
          [
            {
              text: 'OK',
              onPress: () => {
                setPaymentModalVisible(false);
                setCurrentPayment(null);
                setTransactionId('');
                router.push('/(tabs)/(home)/binance-payments');
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      Alert.alert('Error', error.message || 'Could not verify payment. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleCopyAddress = async () => {
    if (currentPayment) {
      await Clipboard.setStringAsync(currentPayment.paymentAddress);
      Alert.alert('Copied', 'Payment address copied to clipboard');
    }
  };

  const handleReinvest = async () => {
    if (!user) return;

    Alert.alert(
      'Reinvest Yield',
      'Convert your accumulated yield to MXI balance?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reinvest',
          onPress: async () => {
            try {
              setLoading(true);
              const result = await addContribution(0, 'reinvestment');
              
              if (result.success) {
                Alert.alert('Success', 'Yield reinvested successfully!');
              } else {
                Alert.alert('Error', result.error || 'Could not reinvest yield');
              }
            } catch (error) {
              console.error('Error reinvesting:', error);
              Alert.alert('Error', 'Could not reinvest yield');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const getPhaseDescription = () => {
    if (!phaseInfo) return '';
    
    const phase = phaseInfo.current_phase;
    const price = parseFloat(phaseInfo.current_price_usdt || '0');
    
    return `Phase ${phase}: $${price} USDT per MXI`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol 
            ios_icon_name="chevron.left" 
            android_material_icon_name="chevron_left" 
            size={24} 
            color={colors.primary} 
          />
        </TouchableOpacity>
        <Text style={styles.title}>Contribute</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {phaseInfo && (
          <View style={[commonStyles.card, styles.phaseCard]}>
            <View style={styles.phaseHeader}>
              <IconSymbol 
                ios_icon_name="chart.line.uptrend.xyaxis" 
                android_material_icon_name="trending_up" 
                size={32} 
                color={colors.primary} 
              />
              <View style={styles.phaseInfo}>
                <Text style={styles.phaseTitle}>{getPhaseDescription()}</Text>
                <Text style={styles.phaseSubtitle}>
                  {parseFloat(phaseInfo.total_tokens_sold || '0').toLocaleString()} MXI sold
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={[commonStyles.card, styles.formCard]}>
          <Text style={styles.formTitle}>Make a Contribution</Text>
          <Text style={styles.formSubtitle}>
            Minimum: 50 USDT • Maximum: 100,000 USDT
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Amount in USDT</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter amount"
                placeholderTextColor={colors.textSecondary}
                value={usdtAmount}
                onChangeText={(text) => {
                  setUsdtAmount(text);
                  calculateMxi(text);
                }}
                keyboardType="numeric"
              />
              <Text style={styles.inputCurrency}>USDT</Text>
            </View>
          </View>

          <View style={styles.conversionContainer}>
            <IconSymbol 
              ios_icon_name="arrow.down" 
              android_material_icon_name="arrow_downward" 
              size={24} 
              color={colors.textSecondary} 
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>You will receive</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.mxiAmount}>{mxiAmount}</Text>
              <Text style={styles.inputCurrency}>MXI</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[buttonStyles.primary, styles.contributeButton]}
            onPress={handleCreatePayment}
            disabled={loading || !usdtAmount || parseFloat(usdtAmount) < 50}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <IconSymbol 
                  ios_icon_name="plus.circle.fill" 
                  android_material_icon_name="add_circle" 
                  size={20} 
                  color="#fff" 
                />
                <Text style={buttonStyles.primaryText}>Create Payment</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={[commonStyles.card, styles.infoCard]}>
          <Text style={styles.infoTitle}>How it works</Text>
          <View style={styles.infoStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>Enter the amount you want to contribute</Text>
          </View>
          <View style={styles.infoStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>Create payment and copy the wallet address</Text>
          </View>
          <View style={styles.infoStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>Send USDT to the provided address from Binance (TRC20 network recommended)</Text>
          </View>
          <View style={styles.infoStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <Text style={styles.stepText}>Copy the transaction ID (TxID) from Binance</Text>
          </View>
          <View style={styles.infoStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>5</Text>
            </View>
            <Text style={styles.stepText}>Enter the TxID and click verify</Text>
          </View>
          <View style={styles.infoStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>6</Text>
            </View>
            <Text style={styles.stepText}>Your balance will be updated automatically (or after admin approval if automatic verification fails)</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[buttonStyles.secondary, styles.viewPaymentsButton]}
          onPress={() => router.push('/(tabs)/(home)/binance-payments')}
        >
          <IconSymbol 
            ios_icon_name="list.bullet" 
            android_material_icon_name="list" 
            size={20} 
            color={colors.primary} 
          />
          <Text style={buttonStyles.secondaryText}>View Payment History</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Payment Modal */}
      <Modal
        visible={paymentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Payment Instructions</Text>
              <TouchableOpacity onPress={() => setPaymentModalVisible(false)}>
                <IconSymbol 
                  ios_icon_name="xmark.circle.fill" 
                  android_material_icon_name="cancel" 
                  size={28} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>

            {currentPayment && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.paymentDetail}>
                  <Text style={styles.paymentLabel}>Payment ID</Text>
                  <Text style={styles.paymentValue}>{currentPayment.paymentId}</Text>
                </View>

                <View style={styles.paymentDetail}>
                  <Text style={styles.paymentLabel}>Amount to Send</Text>
                  <Text style={styles.paymentValue}>{currentPayment.usdtAmount} USDT</Text>
                </View>

                <View style={styles.paymentDetail}>
                  <Text style={styles.paymentLabel}>You will receive</Text>
                  <Text style={styles.paymentValue}>{currentPayment.mxiAmount} MXI</Text>
                </View>

                <View style={styles.paymentDetail}>
                  <Text style={styles.paymentLabel}>Send to this address</Text>
                  <View style={styles.addressContainer}>
                    <Text style={styles.addressText}>{currentPayment.paymentAddress}</Text>
                    <TouchableOpacity onPress={handleCopyAddress}>
                      <IconSymbol 
                        ios_icon_name="doc.on.doc" 
                        android_material_icon_name="content_copy" 
                        size={20} 
                        color={colors.primary} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.paymentDetail}>
                  <Text style={styles.paymentLabel}>Recommended Network</Text>
                  <Text style={styles.paymentValue}>TRC20 (Tron) - Low fees</Text>
                </View>

                <View style={styles.paymentDetail}>
                  <Text style={styles.paymentLabel}>Status</Text>
                  <Text style={[styles.paymentValue, { color: colors.warning }]}>
                    {currentPayment.status === 'pending' ? 'PENDING' : 'CONFIRMING'}
                  </Text>
                </View>

                <View style={styles.paymentDetail}>
                  <Text style={styles.paymentLabel}>Expires at</Text>
                  <Text style={styles.paymentValue}>
                    {new Date(currentPayment.expiresAt).toLocaleString()}
                  </Text>
                </View>

                <View style={styles.warningBox}>
                  <IconSymbol 
                    ios_icon_name="exclamationmark.triangle.fill" 
                    android_material_icon_name="warning" 
                    size={24} 
                    color={colors.warning} 
                  />
                  <Text style={styles.warningText}>
                    Please send exactly {currentPayment.usdtAmount} USDT to the address above from Binance.
                    Use TRC20 network for lower fees. After sending, copy the transaction ID (TxID) from Binance and enter it below.
                  </Text>
                </View>

                {currentPayment.status === 'pending' && (
                  <>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Binance Transaction ID (TxID)</Text>
                      <TextInput
                        style={styles.txidInput}
                        placeholder="Paste TxID here"
                        placeholderTextColor={colors.textSecondary}
                        value={transactionId}
                        onChangeText={setTransactionId}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                      <Text style={styles.inputHint}>
                        Find TxID in: Binance → Wallet → Transaction History
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[buttonStyles.primary, styles.verifyButton]}
                      onPress={handleVerifyPayment}
                      disabled={verifying || !transactionId}
                    >
                      {verifying ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <>
                          <IconSymbol 
                            ios_icon_name="checkmark.circle.fill" 
                            android_material_icon_name="check_circle" 
                            size={20} 
                            color="#fff" 
                          />
                          <Text style={buttonStyles.primaryText}>Verify Payment</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </>
                )}

                {currentPayment.status === 'confirming' && (
                  <View style={styles.confirmingBox}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.confirmingText}>
                      Verifying payment...
                    </Text>
                    <Text style={styles.confirmingSubtext}>
                      Your payment is being verified. This usually takes a few minutes. Your balance will be updated automatically once confirmed.
                    </Text>
                  </View>
                )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  phaseCard: {
    marginBottom: 20,
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  phaseInfo: {
    flex: 1,
  },
  phaseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  phaseSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  formCard: {
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
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
  },
  conversionContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  mxiAmount: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    paddingVertical: 16,
  },
  contributeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  infoCard: {
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  infoStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  viewPaymentsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  modalBody: {
    padding: 24,
  },
  paymentDetail: {
    marginBottom: 20,
  },
  paymentLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  paymentValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontFamily: 'monospace',
  },
  warningBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.warning + '20',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  txidInput: {
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
    fontFamily: 'monospace',
  },
  inputHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmingBox: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.primary + '10',
    borderRadius: 12,
  },
  confirmingText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  confirmingSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});
