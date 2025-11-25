
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';
import * as Clipboard from 'expo-clipboard';

interface Currency {
  code: string;
  name: string;
  network: string;
  icon: string;
  color: string;
}

const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'usdttrc20', name: 'USDT', network: 'TRC20 (Tron)', icon: '₮', color: '#26A17B' },
  { code: 'usdtmatic', name: 'USDT', network: 'Polygon', icon: '₮', color: '#8247E5' },
  { code: 'usdcsol', name: 'USDC', network: 'Solana', icon: '$', color: '#2775CA' },
  { code: 'btc', name: 'Bitcoin', network: 'BTC', icon: '₿', color: '#F7931A' },
  { code: 'eth', name: 'Ethereum', network: 'ETH', icon: 'Ξ', color: '#627EEA' },
  { code: 'usdteth', name: 'USDT', network: 'ERC20 (Ethereum)', icon: '₮', color: '#627EEA' },
  { code: 'bnbbsc', name: 'BNB', network: 'BSC', icon: 'B', color: '#F3BA2F' },
  { code: 'usdtbsc', name: 'USDT', network: 'BEP20 (BSC)', icon: '₮', color: '#F3BA2F' },
];

interface NowPaymentsModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
}

export default function NowPaymentsModal({ visible, onClose, userId }: NowPaymentsModalProps) {
  const [step, setStep] = useState<'amount' | 'currency' | 'payment'>('amount');
  const [usdtAmount, setUsdtAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState<any>(null);
  const [currentPrice, setCurrentPrice] = useState(0.4);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (visible) {
      loadCurrentPrice();
    }
  }, [visible]);

  useEffect(() => {
    if (paymentIntent?.expires_at) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const expiresAt = new Date(paymentIntent.expires_at).getTime();
        const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
        setTimeRemaining(remaining);
        
        if (remaining === 0) {
          clearInterval(interval);
          Alert.alert(
            '⏰ Pago Expirado',
            'El tiempo para completar el pago ha expirado. Por favor crea un nuevo pago.',
            [{ text: 'OK', onPress: handleClose }]
          );
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [paymentIntent]);

  const loadCurrentPrice = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'current_price_usdt')
        .single();

      if (!error && data) {
        setCurrentPrice(data.setting_value.value || 0.4);
      }
    } catch (error) {
      console.error('Error loading price:', error);
    }
  };

  const calculateMXI = (usdt: string): number => {
    const amount = parseFloat(usdt);
    if (isNaN(amount) || amount <= 0) return 0;
    return amount / currentPrice;
  };

  const handleCreatePayment = async () => {
    if (!selectedCurrency || !usdtAmount) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    const amount = parseFloat(usdtAmount);
    if (isNaN(amount) || amount < 20) {
      Alert.alert('Error', 'El monto mínimo es 20 USDT');
      return;
    }

    setLoading(true);

    try {
      const orderId = `MXI-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('No hay sesión activa');
      }

      console.log('Creating payment intent:', {
        order_id: orderId,
        price_amount: amount,
        price_currency: 'usd',
        pay_currency: selectedCurrency.code,
      });

      const response = await fetch(
        'https://aeyfnjuatbtcauiumbhn.supabase.co/functions/v1/create-payment-intent',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.session.access_token}`,
          },
          body: JSON.stringify({
            order_id: orderId,
            price_amount: amount,
            price_currency: 'usd',
            pay_currency: selectedCurrency.code,
          }),
        }
      );

      const result = await response.json();
      console.log('Payment intent response:', result);

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al crear el pago');
      }

      setPaymentIntent(result.intent);
      setStep('payment');
    } catch (error: any) {
      console.error('Error creating payment:', error);
      Alert.alert(
        'Error',
        error.message || 'No se pudo crear el pago. Por favor intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert('✅ Copiado', `${label} copiado al portapapeles`);
    } catch (error) {
      console.error('Error copying:', error);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClose = () => {
    setStep('amount');
    setUsdtAmount('');
    setSelectedCurrency(null);
    setPaymentIntent(null);
    setTimeRemaining(null);
    onClose();
  };

  const renderAmountStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>💰 Ingresa el Monto</Text>
      <Text style={styles.stepSubtitle}>
        Monto mínimo: 20 USDT
      </Text>

      <View style={styles.inputSection}>
        <Text style={styles.label}>Monto en USDT</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 100"
          placeholderTextColor="#666666"
          keyboardType="numeric"
          value={usdtAmount}
          onChangeText={setUsdtAmount}
        />
        {usdtAmount && parseFloat(usdtAmount) > 0 && (
          <View style={styles.calculationBox}>
            <Text style={styles.calculationLabel}>Recibirás:</Text>
            <Text style={styles.calculationValue}>
              {calculateMXI(usdtAmount).toFixed(2)} MXI
            </Text>
            <Text style={styles.calculationSubtext}>
              Precio: {currentPrice} USDT por MXI
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.primaryButton,
          (!usdtAmount || parseFloat(usdtAmount) < 20) && styles.buttonDisabled,
        ]}
        onPress={() => setStep('currency')}
        disabled={!usdtAmount || parseFloat(usdtAmount) < 20}
      >
        <Text style={styles.primaryButtonText}>Continuar</Text>
        <IconSymbol
          ios_icon_name="arrow.right"
          android_material_icon_name="arrow_forward"
          size={20}
          color="#FFFFFF"
        />
      </TouchableOpacity>
    </View>
  );

  const renderCurrencyStep = () => (
    <View style={styles.stepContainer}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setStep('amount')}
      >
        <IconSymbol
          ios_icon_name="arrow.left"
          android_material_icon_name="arrow_back"
          size={20}
          color={colors.text}
        />
        <Text style={styles.backButtonText}>Volver</Text>
      </TouchableOpacity>

      <Text style={styles.stepTitle}>🪙 Selecciona Criptomoneda</Text>
      <Text style={styles.stepSubtitle}>
        Elige la red y moneda con la que deseas pagar
      </Text>

      <ScrollView style={styles.currencyList} showsVerticalScrollIndicator={false}>
        {SUPPORTED_CURRENCIES.map((currency, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.currencyItem,
              selectedCurrency?.code === currency.code && {
                backgroundColor: currency.color + '20',
                borderColor: currency.color,
                borderWidth: 2,
              },
            ]}
            onPress={() => setSelectedCurrency(currency)}
          >
            <View style={[styles.currencyIcon, { backgroundColor: currency.color }]}>
              <Text style={styles.currencyIconText}>{currency.icon}</Text>
            </View>
            <View style={styles.currencyInfo}>
              <Text style={styles.currencyName}>{currency.name}</Text>
              <Text style={styles.currencyNetwork}>{currency.network}</Text>
            </View>
            {selectedCurrency?.code === currency.code && (
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check_circle"
                size={24}
                color={currency.color}
              />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.primaryButton,
          !selectedCurrency && styles.buttonDisabled,
        ]}
        onPress={handleCreatePayment}
        disabled={!selectedCurrency || loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <React.Fragment>
            <Text style={styles.primaryButtonText}>Crear Pago</Text>
            <IconSymbol
              ios_icon_name="arrow.right"
              android_material_icon_name="arrow_forward"
              size={20}
              color="#FFFFFF"
            />
          </React.Fragment>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderPaymentStep = () => {
    if (!paymentIntent) return null;

    return (
      <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.stepTitle}>💳 Completa el Pago</Text>
        
        {timeRemaining !== null && (
          <View style={[
            styles.timerBox,
            timeRemaining < 300 && { backgroundColor: '#FF6B35' + '20', borderColor: '#FF6B35' }
          ]}>
            <IconSymbol
              ios_icon_name="clock.fill"
              android_material_icon_name="schedule"
              size={24}
              color={timeRemaining < 300 ? '#FF6B35' : colors.primary}
            />
            <Text style={[
              styles.timerText,
              timeRemaining < 300 && { color: '#FF6B35' }
            ]}>
              Tiempo restante: {formatTime(timeRemaining)}
            </Text>
          </View>
        )}

        <View style={styles.paymentInfoCard}>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Monto a Pagar:</Text>
            <Text style={styles.paymentValue}>
              {paymentIntent.pay_amount} {paymentIntent.pay_currency.toUpperCase()}
            </Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Recibirás:</Text>
            <Text style={styles.paymentValue}>
              {paymentIntent.mxi_amount.toFixed(2)} MXI
            </Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Red:</Text>
            <Text style={styles.paymentValue}>
              {selectedCurrency?.network}
            </Text>
          </View>
        </View>

        {paymentIntent.pay_address && (
          <View style={styles.addressCard}>
            <Text style={styles.addressLabel}>Dirección de Pago:</Text>
            <View style={styles.addressContainer}>
              <Text style={styles.addressText} numberOfLines={2}>
                {paymentIntent.pay_address}
              </Text>
              <TouchableOpacity
                style={styles.copyIconButton}
                onPress={() => copyToClipboard(paymentIntent.pay_address, 'Dirección')}
              >
                <IconSymbol
                  ios_icon_name="doc.on.doc.fill"
                  android_material_icon_name="content_copy"
                  size={20}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>📋 Instrucciones:</Text>
          <Text style={styles.instructionText}>
            1. Envía exactamente {paymentIntent.pay_amount} {paymentIntent.pay_currency.toUpperCase()} a la dirección mostrada
          </Text>
          <Text style={styles.instructionText}>
            2. Usa la red {selectedCurrency?.network}
          </Text>
          <Text style={styles.instructionText}>
            3. Asegúrate de cubrir las comisiones de red
          </Text>
          <Text style={styles.instructionText}>
            4. El pago se confirmará automáticamente
          </Text>
          <Text style={styles.instructionText}>
            5. Recibirás una notificación cuando se acredite
          </Text>
        </View>

        {paymentIntent.invoice_url && (
          <TouchableOpacity
            style={styles.invoiceButton}
            onPress={() => {
              // Open invoice URL in browser
              Alert.alert(
                'Abrir Página de Pago',
                '¿Deseas abrir la página de pago de NOWPayments?',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  {
                    text: 'Abrir',
                    onPress: () => {
                      // In a real app, use Linking.openURL(paymentIntent.invoice_url)
                      console.log('Open URL:', paymentIntent.invoice_url);
                    },
                  },
                ]
              );
            }}
          >
            <IconSymbol
              ios_icon_name="link"
              android_material_icon_name="link"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.invoiceButtonText}>Abrir Página de Pago</Text>
          </TouchableOpacity>
        )}

        <View style={styles.warningBox}>
          <IconSymbol
            ios_icon_name="exclamationmark.triangle.fill"
            android_material_icon_name="warning"
            size={20}
            color={colors.warning}
          />
          <Text style={styles.warningText}>
            ⚠️ Envía solo {paymentIntent.pay_currency.toUpperCase()} en la red {selectedCurrency?.network}. 
            Enviar otra moneda o usar otra red resultará en pérdida de fondos.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
        >
          <Text style={styles.closeButtonText}>Cerrar</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Pago Multi-Crypto</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeIcon}>
              <IconSymbol
                ios_icon_name="xmark.circle.fill"
                android_material_icon_name="close"
                size={28}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {step === 'amount' && renderAmountStep()}
          {step === 'currency' && renderCurrencyStep()}
          {step === 'payment' && renderPaymentStep()}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
  closeIcon: {
    padding: 4,
  },
  stepContainer: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: colors.text,
    fontWeight: '600',
  },
  calculationBox: {
    marginTop: 16,
    padding: 16,
    backgroundColor: colors.primary + '15',
    borderRadius: 12,
    alignItems: 'center',
  },
  calculationLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  calculationValue: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.primary,
    marginBottom: 4,
  },
  calculationSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  currencyList: {
    maxHeight: 400,
    marginBottom: 16,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currencyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currencyIconText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  currencyInfo: {
    flex: 1,
    marginLeft: 16,
  },
  currencyName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  currencyNetwork: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  timerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: colors.primary + '20',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  paymentInfoCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
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
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
  },
  addressText: {
    flex: 1,
    fontSize: 12,
    color: colors.text,
    fontFamily: 'monospace',
  },
  copyIconButton: {
    marginLeft: 8,
    padding: 4,
  },
  instructionsCard: {
    backgroundColor: colors.primary + '15',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  invoiceButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  invoiceButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  closeButton: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
