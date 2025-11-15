
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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';

interface OKXPayment {
  paymentId: string;
  usdtAmount: number;
  mxiAmount: number;
  paymentAddress: string;
  status: string;
  expiresAt: string;
  qrCodeUri?: string;
}

const OKX_WALLET_ADDRESS = 'TYour-OKX-Wallet-Address-Here';

export default function ContributeScreen() {
  const { user, addContribution } = useAuth();
  const router = useRouter();
  const [usdtAmount, setUsdtAmount] = useState('');
  const [mxiAmount, setMxiAmount] = useState('0');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [qrCodeUri, setQrCodeUri] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<OKXPayment | null>(null);
  const [phaseInfo, setPhaseInfo] = useState<any>(null);

  useEffect(() => {
    loadPhaseInfo();
    checkExistingPayment();
    requestPermissions();
  }, []);

  useEffect(() => {
    if (phaseInfo && usdtAmount) {
      calculateMxi(usdtAmount);
    }
  }, [phaseInfo, usdtAmount]);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      console.log('Media library permission not granted');
    }
  };

  const loadPhaseInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('metrics')
        .select('*')
        .single();

      if (error) {
        console.error('Error loading phase info:', error);
        return;
      }

      setPhaseInfo(data);
    } catch (error) {
      console.error('Exception loading phase info:', error);
    }
  };

  const checkExistingPayment = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('okx_payments')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['pending', 'confirming'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error checking existing payment:', error);
        return;
      }

      if (data) {
        setCurrentPayment({
          paymentId: data.payment_id,
          usdtAmount: parseFloat(data.usdt_amount),
          mxiAmount: parseFloat(data.mxi_amount),
          paymentAddress: OKX_WALLET_ADDRESS,
          status: data.status,
          expiresAt: data.expires_at,
          qrCodeUri: data.qr_code_url,
        });
        setShowPaymentModal(true);
      }
    } catch (error) {
      console.error('Exception checking existing payment:', error);
    }
  };

  const calculateMxi = (usdt: string) => {
    const amount = parseFloat(usdt);
    if (isNaN(amount) || !phaseInfo) {
      setMxiAmount('0');
      return;
    }

    const currentPrice = parseFloat(phaseInfo.current_price_usdt);
    const mxi = amount / currentPrice;
    setMxiAmount(mxi.toFixed(2));
  };

  const calculateYieldRate = (investment: number): number => {
    if (investment < 50) return 0;
    if (investment <= 500) return investment * 0.0001;
    if (investment <= 5000) return investment * 0.00015;
    if (investment <= 50000) return investment * 0.0002;
    return investment * 0.00025;
  };

  const pickQRCode = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setQrCodeUri(uri);
        await uploadQRCode(uri);
      }
    } catch (error) {
      console.error('Error picking QR code:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadQRCode = async (uri: string) => {
    if (!currentPayment) return;

    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const fileExt = uri.split('.').pop() || 'jpg';
      const fileName = `${currentPayment.paymentId}.${fileExt}`;
      const filePath = `payment-qr-codes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(filePath, arrayBuffer, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        Alert.alert('Error', 'Failed to upload QR code');
        return;
      }

      const { data: urlData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('okx_payments')
        .update({ qr_code_url: urlData.publicUrl })
        .eq('payment_id', currentPayment.paymentId);

      if (updateError) {
        console.error('Update error:', updateError);
      }

      Alert.alert('Success', 'QR code uploaded successfully');
    } catch (error) {
      console.error('Exception uploading QR code:', error);
      Alert.alert('Error', 'Failed to upload QR code');
    }
  };

  const handleCreatePayment = async () => {
    if (!user) return;

    const amount = parseFloat(usdtAmount);
    if (isNaN(amount) || amount < 50 || amount > 100000) {
      Alert.alert('Invalid Amount', 'Please enter an amount between $50 and $100,000');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('okx_payments')
        .insert({
          user_id: user.id,
          payment_id: `OKX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          usdt_amount: amount,
          mxi_amount: parseFloat(mxiAmount),
          status: 'pending',
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating payment:', error);
        Alert.alert('Error', 'Failed to create payment');
        return;
      }

      setCurrentPayment({
        paymentId: data.payment_id,
        usdtAmount: parseFloat(data.usdt_amount),
        mxiAmount: parseFloat(data.mxi_amount),
        paymentAddress: OKX_WALLET_ADDRESS,
        status: data.status,
        expiresAt: data.expires_at,
      });

      setShowPaymentModal(true);
    } catch (error) {
      console.error('Exception creating payment:', error);
      Alert.alert('Error', 'Failed to create payment');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!currentPayment) return;

    setVerifying(true);

    try {
      const { data, error } = await supabase.functions.invoke('okx-payment-verification', {
        body: { paymentId: currentPayment.paymentId },
      });

      if (error) {
        console.error('Verification error:', error);
        Alert.alert(
          'Verification Pending',
          'Automatic verification is in progress. You will be notified once your payment is confirmed. This may take a few minutes.'
        );
        return;
      }

      if (data.verified) {
        Alert.alert('Success', 'Payment verified! Your MXI has been credited to your account.');
        setShowPaymentModal(false);
        setCurrentPayment(null);
        router.back();
      } else {
        Alert.alert(
          'Verification Pending',
          'Your payment is being verified. Please wait a few minutes and try again.'
        );
      }
    } catch (error) {
      console.error('Exception verifying payment:', error);
      Alert.alert('Error', 'Failed to verify payment');
    } finally {
      setVerifying(false);
    }
  };

  const handleCopyAddress = async () => {
    await Clipboard.setStringAsync(OKX_WALLET_ADDRESS);
    Alert.alert('Copied', 'Wallet address copied to clipboard');
  };

  const handleReinvest = async () => {
    if (!user) return;

    const availableYield = user.accumulatedYield;
    if (availableYield <= 0) {
      Alert.alert('No Yield Available', 'You don&apos;t have any accumulated yield to reinvest.');
      return;
    }

    Alert.alert(
      'Reinvest Yield',
      `Reinvest ${availableYield.toFixed(6)} MXI back into your vesting balance?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reinvest',
          onPress: async () => {
            setLoading(true);
            const result = await addContribution(availableYield * 0.012, 'reinvestment');
            setLoading(false);

            if (result.success) {
              Alert.alert('Success', 'Yield reinvested successfully!');
            } else {
              Alert.alert('Error', result.error || 'Failed to reinvest yield');
            }
          },
        },
      ]
    );
  };

  const getPhaseDescription = () => {
    if (!phaseInfo) return '';
    const phase = phaseInfo.current_phase;
    switch (phase) {
      case 1:
        return 'Early Bird Phase - Best Price!';
      case 2:
        return 'Growth Phase - Limited Time';
      case 3:
        return 'Final Phase - Last Chance';
      default:
        return 'Pre-Sale Phase';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol ios_icon_name="chevron.left" android_material_icon_name="arrow_back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contribute</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Phase Info */}
        {phaseInfo && (
          <View style={[commonStyles.card, styles.phaseCard]}>
            <View style={styles.phaseHeader}>
              <View>
                <Text style={styles.phaseTitle}>Phase {phaseInfo.current_phase}</Text>
                <Text style={styles.phaseSubtitle}>{getPhaseDescription()}</Text>
              </View>
              <View style={styles.phasePriceContainer}>
                <Text style={styles.phasePrice}>${phaseInfo.current_price_usdt}</Text>
                <Text style={styles.phasePriceLabel}>per MXI</Text>
              </View>
            </View>
          </View>
        )}

        {/* Contribution Form */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Enter Amount</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>USDT Amount</Text>
            <TextInput
              style={styles.input}
              value={usdtAmount}
              onChangeText={setUsdtAmount}
              keyboardType="decimal-pad"
              placeholder="Min: $50, Max: $100,000"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.conversionContainer}>
            <IconSymbol 
              ios_icon_name="arrow.down" 
              android_material_icon_name="arrow_downward" 
              size={24} 
              color={colors.primary} 
            />
          </View>

          <View style={styles.resultContainer}>
            <Text style={styles.resultLabel}>You will receive</Text>
            <Text style={styles.resultAmount}>{mxiAmount} MXI</Text>
          </View>

          <TouchableOpacity
            style={[buttonStyles.primary, styles.contributeButton]}
            onPress={handleCreatePayment}
            disabled={loading || !usdtAmount || parseFloat(usdtAmount) < 50}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={buttonStyles.primaryText}>Continue to Payment</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Reinvest Yield */}
        {user && user.accumulatedYield > 0 && (
          <View style={commonStyles.card}>
            <Text style={styles.sectionTitle}>Reinvest Yield</Text>
            <Text style={styles.reinvestText}>
              You have {user.accumulatedYield.toFixed(6)} MXI in accumulated yield.
            </Text>
            <TouchableOpacity
              style={[buttonStyles.outline, styles.reinvestButton]}
              onPress={handleReinvest}
              disabled={loading}
            >
              <Text style={buttonStyles.outlineText}>Reinvest Yield</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Info Card */}
        <View style={[commonStyles.card, styles.infoCard]}>
          <View style={styles.infoHeader}>
            <IconSymbol 
              ios_icon_name="info.circle.fill" 
              android_material_icon_name="info" 
              size={24} 
              color={colors.primary} 
            />
            <Text style={styles.infoTitle}>Important Information</Text>
          </View>
          <View style={styles.infoList}>
            <Text style={styles.infoItem}>• Minimum contribution: $50 USDT</Text>
            <Text style={styles.infoItem}>• Maximum contribution: $100,000 USDT</Text>
            <Text style={styles.infoItem}>• Payment via OKX Wallet only</Text>
            <Text style={styles.infoItem}>• MXI tokens are vested and generate yield</Text>
            <Text style={styles.infoItem}>• Payments expire after 24 hours</Text>
          </View>
        </View>
      </ScrollView>

      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Complete Payment</Text>
            
            {currentPayment && (
              <React.Fragment>
                <View style={styles.paymentInfo}>
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Amount:</Text>
                    <Text style={styles.paymentValue}>${currentPayment.usdtAmount} USDT</Text>
                  </View>
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>You will receive:</Text>
                    <Text style={styles.paymentValue}>{currentPayment.mxiAmount} MXI</Text>
                  </View>
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Status:</Text>
                    <Text style={[styles.paymentValue, { color: colors.warning }]}>
                      {currentPayment.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.addressContainer}>
                  <Text style={styles.addressLabel}>Send USDT (TRC20) to:</Text>
                  <View style={styles.addressBox}>
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

                <View style={styles.qrSection}>
                  <Text style={styles.qrLabel}>Upload Payment QR Code (Optional)</Text>
                  {qrCodeUri || currentPayment.qrCodeUri ? (
                    <Image
                      source={{ uri: qrCodeUri || currentPayment.qrCodeUri }}
                      style={styles.qrImage}
                    />
                  ) : null}
                  <TouchableOpacity
                    style={[buttonStyles.outline, styles.qrButton]}
                    onPress={pickQRCode}
                  >
                    <IconSymbol 
                      ios_icon_name="photo" 
                      android_material_icon_name="photo_library" 
                      size={20} 
                      color={colors.primary} 
                    />
                    <Text style={buttonStyles.outlineText}>
                      {qrCodeUri || currentPayment.qrCodeUri ? 'Change QR Code' : 'Upload QR Code'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[buttonStyles.outline, styles.modalButton]}
                    onPress={() => setShowPaymentModal(false)}
                  >
                    <Text style={buttonStyles.outlineText}>Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[buttonStyles.primary, styles.modalButton]}
                    onPress={handleVerifyPayment}
                    disabled={verifying}
                  >
                    {verifying ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={buttonStyles.primaryText}>Verify Payment</Text>
                    )}
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalNote}>
                  After sending the payment, click &quot;Verify Payment&quot; to confirm your transaction.
                </Text>
              </React.Fragment>
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
  phaseCard: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  phaseTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  phaseSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  phasePriceContainer: {
    alignItems: 'flex-end',
  },
  phasePrice: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
  },
  phasePriceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
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
    padding: 16,
    fontSize: 18,
    color: colors.text,
  },
  conversionContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  resultContainer: {
    backgroundColor: colors.primary + '10',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  resultLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  resultAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
  },
  contributeButton: {
    marginTop: 8,
  },
  reinvestText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  reinvestButton: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 500,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  paymentInfo: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  paymentLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  addressContainer: {
    marginBottom: 20,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  addressText: {
    flex: 1,
    fontSize: 12,
    color: colors.text,
    fontFamily: 'monospace',
  },
  qrSection: {
    marginBottom: 20,
  },
  qrLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  qrImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  qrButton: {
    marginTop: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  modalButton: {
    flex: 1,
  },
  modalNote: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
