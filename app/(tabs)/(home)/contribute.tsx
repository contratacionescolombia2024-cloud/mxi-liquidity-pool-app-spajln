
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
import { IconSymbol } from '@/components/IconSymbol';
import React, { useState, useEffect } from 'react';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';

interface OKXPayment {
  paymentId: string;
  usdtAmount: number;
  mxiAmount: number;
  paymentAddress: string;
  status: string;
  expiresAt: string;
  qrCodeUri?: string;
}

interface PhaseInfo {
  totalTokensSold: number;
  currentPhase: number;
  currentPriceUsdt: number;
  phase1TokensSold: number;
  phase2TokensSold: number;
  phase3TokensSold: number;
  phase1Remaining: number;
  phase2Remaining: number;
  tokensUntilNextPhase: number;
}

const OKX_WALLET_ADDRESS = 'TYDzsYUEpvnYmQk4zGP9sWWcTEd2MiAtW6';

export default function ContributeScreen() {
  const router = useRouter();
  const { user, addContribution, getPhaseInfo } = useAuth();
  const [usdtAmount, setUsdtAmount] = useState('');
  const [mxiAmount, setMxiAmount] = useState('0');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<OKXPayment | null>(null);
  const [qrCodeUri, setQrCodeUri] = useState<string | null>(null);
  const [phaseInfo, setPhaseInfo] = useState<PhaseInfo | null>(null);
  const [yieldRate, setYieldRate] = useState(0);

  useEffect(() => {
    requestPermissions();
    loadPhaseInfo();
    checkExistingPayment();
  }, []);

  useEffect(() => {
    if (phaseInfo && usdtAmount) {
      calculateMxi(usdtAmount);
    }
  }, [phaseInfo, usdtAmount]);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('⚠️ Permission Required', '📸 We need camera roll permissions to upload QR codes');
    }
  };

  const loadPhaseInfo = async () => {
    const info = await getPhaseInfo();
    if (info) {
      setPhaseInfo(info);
      console.log('📊 Phase info loaded:', info);
    }
  };

  const checkExistingPayment = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('okx_payments')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('❌ Error checking existing payment:', error);
      return;
    }

    if (data) {
      const expiresAt = new Date(data.expires_at);
      if (expiresAt > new Date()) {
        setCurrentPayment({
          paymentId: data.payment_id,
          usdtAmount: parseFloat(data.usdt_amount.toString()),
          mxiAmount: parseFloat(data.mxi_amount.toString()),
          paymentAddress: data.payment_address || OKX_WALLET_ADDRESS,
          status: data.status,
          expiresAt: data.expires_at,
          qrCodeUri: data.qr_code_url,
        });
        setShowPaymentModal(true);
        console.log('💰 Existing payment found:', data.payment_id);
      }
    }
  };

  const calculateMxi = (usdt: string) => {
    const amount = parseFloat(usdt);
    if (isNaN(amount) || amount <= 0 || !phaseInfo) {
      setMxiAmount('0');
      setYieldRate(0);
      return;
    }

    const mxi = amount / phaseInfo.currentPriceUsdt;
    setMxiAmount(mxi.toFixed(4));
    
    const rate = calculateYieldRate(amount);
    setYieldRate(rate);
  };

  const calculateYieldRate = (investment: number): number => {
    if (investment < 50) return 0;
    if (investment >= 50 && investment < 500) return 0.0001;
    if (investment >= 500 && investment < 1000) return 0.00015;
    if (investment >= 1000 && investment < 5000) return 0.0002;
    if (investment >= 5000 && investment < 10000) return 0.00025;
    if (investment >= 10000) return 0.0003;
    return 0;
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
      console.error('❌ Error picking QR code:', error);
      Alert.alert('❌ Error', 'Failed to pick image');
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
      const filePath = `qr-codes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(filePath, arrayBuffer, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
        Alert.alert('❌ Error', 'Failed to upload QR code');
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
        console.error('❌ Update error:', updateError);
      } else {
        console.log('✅ QR code uploaded successfully');
        Alert.alert('✅ Success', '📸 QR code uploaded successfully');
      }
    } catch (error) {
      console.error('❌ Upload exception:', error);
      Alert.alert('❌ Error', 'Failed to upload QR code');
    }
  };

  const handleCreatePayment = async () => {
    if (!user || !phaseInfo) return;

    const amount = parseFloat(usdtAmount);

    if (isNaN(amount) || amount < 50) {
      Alert.alert('❌ Invalid Amount', '💵 Minimum contribution is 50 USDT');
      return;
    }

    if (amount > 100000) {
      Alert.alert('❌ Invalid Amount', '💵 Maximum contribution is 100,000 USDT');
      return;
    }

    setLoading(true);

    try {
      const mxi = amount / phaseInfo.currentPriceUsdt;
      const paymentId = `MXI-${Date.now()}-${user.id.substring(0, 8)}`;
      // Changed from 30 minutes to 8 hours (8 * 60 * 60 * 1000 milliseconds)
      const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();

      const { error } = await supabase.from('okx_payments').insert({
        user_id: user.id,
        payment_id: paymentId,
        usdt_amount: amount,
        mxi_amount: mxi,
        payment_address: OKX_WALLET_ADDRESS,
        status: 'pending',
        expires_at: expiresAt,
      });

      if (error) {
        console.error('❌ Payment creation error:', error);
        Alert.alert('❌ Error', 'Failed to create payment request');
        setLoading(false);
        return;
      }

      setCurrentPayment({
        paymentId,
        usdtAmount: amount,
        mxiAmount: mxi,
        paymentAddress: OKX_WALLET_ADDRESS,
        status: 'pending',
        expiresAt,
      });

      setShowPaymentModal(true);
      setLoading(false);
      console.log('✅ Payment created:', paymentId);
    } catch (error) {
      console.error('❌ Payment creation exception:', error);
      Alert.alert('❌ Error', 'Failed to create payment');
      setLoading(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!currentPayment) return;

    setVerifying(true);

    try {
      const { data, error } = await supabase.functions.invoke('verify-okx-payment', {
        body: { paymentId: currentPayment.paymentId },
      });

      if (error) {
        console.error('❌ Verification error:', error);
        Alert.alert('❌ Error', 'Failed to verify payment. Please try again.');
        setVerifying(false);
        return;
      }

      if (data.success) {
        Alert.alert(
          '✅ Payment Verified',
          '💰 Your payment has been verified! MXI tokens will be credited to your account shortly.',
          [
            {
              text: 'OK',
              onPress: () => {
                setShowPaymentModal(false);
                setCurrentPayment(null);
                setUsdtAmount('');
                setMxiAmount('0');
                router.back();
              },
            },
          ]
        );
      } else {
        Alert.alert(
          '⏳ Payment Pending',
          data.message || '⏱️ Payment not yet confirmed. Please wait a few minutes and try again.',
          [{ text: 'OK' }]
        );
      }

      setVerifying(false);
    } catch (error) {
      console.error('❌ Verification exception:', error);
      Alert.alert('❌ Error', 'Failed to verify payment');
      setVerifying(false);
    }
  };

  const handleCopyAddress = async () => {
    await Clipboard.setStringAsync(OKX_WALLET_ADDRESS);
    Alert.alert('✅ Copied', '📋 Wallet address copied to clipboard');
  };

  const handleReinvest = () => {
    if (!user) return;

    Alert.alert(
      '🔄 Reinvest Commissions',
      `💰 Reinvest ${user.commissions.available.toFixed(2)} USDT in commissions?\n\n💎 This will convert your commissions to MXI at the current rate.`,
      [
        { text: '❌ Cancel', style: 'cancel' },
        {
          text: '✅ Reinvest',
          onPress: async () => {
            setLoading(true);
            const result = await addContribution(user.commissions.available, 'reinvestment');
            setLoading(false);

            if (result.success) {
              Alert.alert('✅ Success', '💎 Commissions reinvested successfully!');
            } else {
              Alert.alert('❌ Error', result.error || 'Failed to reinvest');
            }
          },
        },
      ]
    );
  };

  const getPhaseDescription = () => {
    if (!phaseInfo) return '';
    
    const phaseEmojis = ['🥇', '🥈', '🥉'];
    const phaseEmoji = phaseEmojis[phaseInfo.currentPhase - 1] || '💎';
    
    return `${phaseEmoji} Phase ${phaseInfo.currentPhase} - ${phaseInfo.currentPriceUsdt.toFixed(2)} USDT per MXI`;
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol ios_icon_name="chevron.left" android_material_icon_name="chevron_left" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>💰 Contribute</Text>
          <Text style={styles.subtitle}>Add USDT to get MXI tokens</Text>
        </View>

        {phaseInfo && (
          <View style={[commonStyles.card, styles.phaseCard]}>
            <Text style={styles.phaseTitle}>📊 Current Phase</Text>
            <Text style={styles.phaseDescription}>{getPhaseDescription()}</Text>
            <View style={styles.phaseProgress}>
              <View style={styles.phaseProgressBar}>
                <View
                  style={[
                    styles.phaseProgressFill,
                    {
                      width: `${Math.min(
                        (phaseInfo.tokensUntilNextPhase /
                          (phaseInfo.currentPhase === 1
                            ? 8333333
                            : phaseInfo.currentPhase === 2
                            ? 8333333
                            : 8333333)) *
                          100,
                        100
                      )}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.phaseProgressText}>
                ⏳ {phaseInfo.tokensUntilNextPhase.toLocaleString()} MXI until next phase
              </Text>
            </View>
          </View>
        )}

        <View style={[commonStyles.card, styles.formCard]}>
          <Text style={styles.formTitle}>💵 Contribution Amount</Text>

          <View style={styles.inputContainer}>
            <Text style={commonStyles.label}>💰 USDT Amount</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="Enter amount (min: 50 USDT)"
              placeholderTextColor={colors.textSecondary}
              value={usdtAmount}
              onChangeText={setUsdtAmount}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.conversionCard}>
            <View style={styles.conversionRow}>
              <Text style={styles.conversionLabel}>💎 You will receive:</Text>
              <Text style={styles.conversionValue}>{mxiAmount} MXI</Text>
            </View>
            {yieldRate > 0 && (
              <View style={styles.conversionRow}>
                <Text style={styles.conversionLabel}>⏱️ Yield rate:</Text>
                <Text style={styles.conversionValue}>{yieldRate.toFixed(6)} MXI/min</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[buttonStyles.primary, styles.contributeButton]}
            onPress={handleCreatePayment}
            disabled={loading || !usdtAmount || parseFloat(usdtAmount) < 50}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <React.Fragment>
                <IconSymbol ios_icon_name="plus.circle.fill" android_material_icon_name="add_circle" size={20} color="#fff" />
                <Text style={styles.buttonText}>💰 Create Payment</Text>
              </React.Fragment>
            )}
          </TouchableOpacity>
        </View>

        {user.commissions.available > 0 && (
          <TouchableOpacity
            style={[commonStyles.card, styles.reinvestCard]}
            onPress={handleReinvest}
          >
            <View style={styles.reinvestContent}>
              <IconSymbol ios_icon_name="arrow.triangle.2.circlepath" android_material_icon_name="sync" size={32} color={colors.accent} />
              <View style={styles.reinvestText}>
                <Text style={styles.reinvestTitle}>🔄 Reinvest Commissions</Text>
                <Text style={styles.reinvestSubtitle}>
                  💰 ${user.commissions.available.toFixed(2)} available
                </Text>
              </View>
              <IconSymbol ios_icon_name="chevron.right" android_material_icon_name="chevron_right" size={24} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
        )}

        <View style={[commonStyles.card, styles.infoCard]}>
          <IconSymbol ios_icon_name="info.circle.fill" android_material_icon_name="info" size={20} color={colors.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>ℹ️ Important Information:</Text>
            <Text style={styles.infoText}>
              • 💵 Minimum contribution: 50 USDT{'\n'}
              • 💰 Maximum contribution: 100,000 USDT{'\n'}
              • 💎 MXI price varies by phase{'\n'}
              • ⏱️ Higher contributions earn more yield{'\n'}
              • 🔒 Payments expire after 8 hours{'\n'}
              • ✅ Verification may take a few minutes
            </Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showPaymentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>💰 Payment Instructions</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <IconSymbol ios_icon_name="xmark.circle.fill" android_material_icon_name="cancel" size={28} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {currentPayment && (
                <React.Fragment>
                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentLabel}>💵 Amount:</Text>
                    <Text style={styles.paymentValue}>{currentPayment.usdtAmount} USDT</Text>
                  </View>

                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentLabel}>💎 You will receive:</Text>
                    <Text style={styles.paymentValue}>{currentPayment.mxiAmount.toFixed(4)} MXI</Text>
                  </View>

                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentLabel}>🆔 Payment ID:</Text>
                    <Text style={styles.paymentValue}>{currentPayment.paymentId}</Text>
                  </View>

                  <View style={styles.addressCard}>
                    <Text style={styles.addressLabel}>🏦 Send USDT (TRC20) to:</Text>
                    <View style={styles.addressContainer}>
                      <Text style={styles.addressText}>{currentPayment.paymentAddress}</Text>
                      <TouchableOpacity onPress={handleCopyAddress}>
                        <IconSymbol ios_icon_name="doc.on.doc.fill" android_material_icon_name="content_copy" size={20} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.qrSection}>
                    <Text style={styles.qrLabel}>📸 Upload Payment QR Code (Optional)</Text>
                    {qrCodeUri || currentPayment.qrCodeUri ? (
                      <Image
                        source={{ uri: qrCodeUri || currentPayment.qrCodeUri }}
                        style={styles.qrImage}
                      />
                    ) : (
                      <TouchableOpacity style={styles.qrPlaceholder} onPress={pickQRCode}>
                        <IconSymbol ios_icon_name="camera.fill" android_material_icon_name="add_a_photo" size={40} color={colors.textSecondary} />
                        <Text style={styles.qrPlaceholderText}>📷 Tap to upload</Text>
                      </TouchableOpacity>
                    )}
                    {(qrCodeUri || currentPayment.qrCodeUri) && (
                      <TouchableOpacity style={styles.changeQrButton} onPress={pickQRCode}>
                        <Text style={styles.changeQrText}>🔄 Change QR Code</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <TouchableOpacity
                    style={[buttonStyles.primary, styles.verifyButton]}
                    onPress={handleVerifyPayment}
                    disabled={verifying}
                  >
                    {verifying ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <React.Fragment>
                        <IconSymbol ios_icon_name="checkmark.circle.fill" android_material_icon_name="check_circle" size={20} color="#fff" />
                        <Text style={styles.buttonText}>✅ Verify Payment</Text>
                      </React.Fragment>
                    )}
                  </TouchableOpacity>

                  <View style={styles.warningCard}>
                    <IconSymbol ios_icon_name="exclamationmark.triangle.fill" android_material_icon_name="warning" size={20} color={colors.warning} />
                    <Text style={styles.warningText}>
                      ⚠️ Only send USDT (TRC20) to this address. Sending other tokens may result in permanent loss.
                    </Text>
                  </View>
                </React.Fragment>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 100,
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
  phaseCard: {
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  phaseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  phaseDescription: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 12,
  },
  phaseProgress: {
    gap: 8,
  },
  phaseProgressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  phaseProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  phaseProgressText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  formCard: {
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  conversionCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  conversionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversionLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  conversionValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
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
  reinvestCard: {
    marginBottom: 16,
    backgroundColor: colors.highlight,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  reinvestContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  reinvestText: {
    flex: 1,
  },
  reinvestTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  reinvestSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  modalScroll: {
    padding: 24,
  },
  paymentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  paymentLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  paymentValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  addressCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
  },
  addressText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    fontFamily: 'monospace',
  },
  qrSection: {
    marginBottom: 16,
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
    borderRadius: 12,
    backgroundColor: colors.card,
  },
  qrPlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  qrPlaceholderText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  changeQrButton: {
    marginTop: 12,
    alignItems: 'center',
  },
  changeQrText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
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
    gap: 12,
    backgroundColor: colors.warning + '20',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    lineHeight: 20,
  },
});
