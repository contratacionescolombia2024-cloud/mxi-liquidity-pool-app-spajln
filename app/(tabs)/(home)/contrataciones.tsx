
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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import * as WebBrowser from 'expo-web-browser';

const MIN_USDT = 3;
const MAX_USDT = 500000;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#444444',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  highlightText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 12,
  },
  payButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  payButtonDisabled: {
    backgroundColor: '#555555',
    opacity: 0.5,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  currencyButton: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#444444',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currencyButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  currencyText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#333333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  closeButton: {
    backgroundColor: '#2A2A2A',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  statusCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statusPending: {
    color: colors.warning,
  },
  statusConfirmed: {
    color: colors.success,
  },
  statusFailed: {
    color: colors.error,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
  warningText: {
    fontSize: 12,
    color: colors.warning,
    marginTop: 4,
  },
});

interface Currency {
  code: string;
  name: string;
}

export default function ContratacionesScreen() {
  const router = useRouter();
  const { user, session, getPhaseInfo } = useAuth();
  
  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCurrencies, setLoadingCurrencies] = useState(false);
  const [mxiAmount, setMxiAmount] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(0.30);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<any>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadPhaseInfo();
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, []);

  useEffect(() => {
    if (amount && !isNaN(parseFloat(amount))) {
      const usdtAmount = parseFloat(amount);
      const mxi = usdtAmount / currentPrice;
      setMxiAmount(mxi);
    } else {
      setMxiAmount(0);
    }
  }, [amount, currentPrice]);

  const loadPhaseInfo = async () => {
    try {
      const phaseInfo = await getPhaseInfo();
      if (phaseInfo) {
        setCurrentPrice(phaseInfo.currentPriceUsdt);
      }
    } catch (error) {
      console.error('Error loading phase info:', error);
    }
  };

  const loadCurrencies = async () => {
    if (!session?.access_token) {
      Alert.alert('Error', 'Por favor inicia sesión para continuar');
      return;
    }

    setLoadingCurrencies(true);
    try {
      const orderId = `MXI-${Date.now()}-${user?.id.substring(0, 8)}`;
      const usdtAmount = parseFloat(amount);

      const response = await fetch(
        `https://aeyfnjuatbtcauiumbhn.supabase.co/functions/v1/create-payment-intent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            order_id: orderId,
            price_amount: usdtAmount,
            price_currency: 'usd',
          }),
        }
      );

      const data = await response.json();
      console.log('Currencies response:', data);

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Error al cargar criptomonedas');
      }

      if (data.intent?.pay_currencies && Array.isArray(data.intent.pay_currencies)) {
        // Filter to show only USDT variants and popular cryptos
        const filteredCurrencies = data.intent.pay_currencies
          .filter((code: string) => {
            const lower = code.toLowerCase();
            return lower.includes('usdt') || 
                   lower === 'btc' || 
                   lower === 'eth' || 
                   lower === 'bnb' ||
                   lower === 'trx';
          })
          .map((code: string) => ({
            code: code,
            name: getCurrencyName(code),
          }));

        setCurrencies(filteredCurrencies);
        setShowCurrencyModal(true);
      } else {
        throw new Error('No se pudieron cargar las criptomonedas disponibles');
      }
    } catch (error: any) {
      console.error('Error loading currencies:', error);
      Alert.alert('Error', error.message || 'Error al cargar criptomonedas disponibles');
    } finally {
      setLoadingCurrencies(false);
    }
  };

  const getCurrencyName = (code: string): string => {
    const names: { [key: string]: string } = {
      'usdttrc20': 'USDT (TRC20)',
      'usdterc20': 'USDT (ERC20)',
      'usdtbep20': 'USDT (BEP20)',
      'btc': 'Bitcoin',
      'eth': 'Ethereum',
      'bnb': 'BNB',
      'trx': 'TRON',
    };
    return names[code.toLowerCase()] || code.toUpperCase();
  };

  const handlePayment = async () => {
    if (!selectedCurrency) {
      Alert.alert('Error', 'Por favor selecciona una criptomoneda');
      return;
    }

    if (!session?.access_token) {
      Alert.alert('Error', 'Por favor inicia sesión para continuar');
      return;
    }

    const usdtAmount = parseFloat(amount);

    if (isNaN(usdtAmount) || usdtAmount < MIN_USDT || usdtAmount > MAX_USDT) {
      Alert.alert(
        'Monto inválido',
        `El monto debe estar entre ${MIN_USDT} y ${MAX_USDT} USDT`
      );
      return;
    }

    setLoading(true);
    try {
      const orderId = `MXI-${Date.now()}-${user?.id.substring(0, 8)}`;

      console.log('Creating payment with:', {
        order_id: orderId,
        price_amount: usdtAmount,
        price_currency: 'usd',
        pay_currency: selectedCurrency,
      });

      const response = await fetch(
        `https://aeyfnjuatbtcauiumbhn.supabase.co/functions/v1/create-payment-intent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            order_id: orderId,
            price_amount: usdtAmount,
            price_currency: 'usd',
            pay_currency: selectedCurrency,
          }),
        }
      );

      const data = await response.json();
      console.log('Payment response:', data);

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Error al crear el pago');
      }

      if (data.intent?.invoice_url || data.intent?.nowpayment_invoice_url) {
        const invoiceUrl = data.intent.invoice_url || data.intent.nowpayment_invoice_url;
        
        // Open payment URL in browser
        await WebBrowser.openBrowserAsync(invoiceUrl);

        // Start polling for payment status
        startPolling(orderId);

        Alert.alert(
          'Pago Iniciado',
          'Se ha abierto la página de pago. Completa el pago y regresa a la app para ver el estado.',
          [{ text: 'OK' }]
        );
      } else {
        throw new Error('No se pudo obtener la URL de pago');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      Alert.alert('Error', error.message || 'Error al procesar el pago');
    } finally {
      setLoading(false);
      setShowCurrencyModal(false);
    }
  };

  const startPolling = (orderId: string) => {
    // Clear any existing interval
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    // Poll every 5 seconds
    const interval = setInterval(async () => {
      await checkPaymentStatus(orderId);
    }, 5000);

    setPollingInterval(interval);

    // Stop polling after 30 minutes
    setTimeout(() => {
      if (interval) {
        clearInterval(interval);
      }
    }, 30 * 60 * 1000);
  };

  const checkPaymentStatus = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('nowpayments_orders')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (error) {
        console.error('Error checking payment status:', error);
        return;
      }

      if (data) {
        setPaymentStatus(data);

        // Stop polling if payment is finished or failed
        if (
          data.status === 'finished' ||
          data.status === 'confirmed' ||
          data.status === 'failed' ||
          data.status === 'expired' ||
          data.status === 'cancelled'
        ) {
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }

          if (data.status === 'finished' || data.status === 'confirmed') {
            Alert.alert(
              '¡Pago Confirmado!',
              `Has recibido ${parseFloat(data.mxi_amount.toString()).toFixed(2)} MXI en tu cuenta.`,
              [
                {
                  text: 'Ver Balance',
                  onPress: () => router.push('/(tabs)/(home)'),
                },
              ]
            );
          } else if (data.status === 'failed' || data.status === 'expired') {
            Alert.alert(
              'Pago No Completado',
              `El pago ha ${data.status === 'failed' ? 'fallado' : 'expirado'}. Por favor intenta nuevamente.`,
              [{ text: 'OK' }]
            );
          }
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'finished':
      case 'confirmed':
        return colors.success;
      case 'failed':
      case 'expired':
      case 'cancelled':
        return colors.error;
      case 'waiting':
      case 'pending':
      case 'confirming':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      waiting: 'Esperando pago',
      pending: 'Pago pendiente',
      confirming: 'Confirmando pago',
      confirmed: 'Pago confirmado',
      finished: 'Completado',
      failed: 'Fallido',
      expired: 'Expirado',
      cancelled: 'Cancelado',
    };
    return statusMap[status] || status;
  };

  const isValidAmount = () => {
    const usdtAmount = parseFloat(amount);
    return !isNaN(usdtAmount) && usdtAmount >= MIN_USDT && usdtAmount <= MAX_USDT;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow_back"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Comprar MXI</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Información del Pago</Text>
          <Text style={styles.infoText}>
            Precio actual: {currentPrice.toFixed(2)} USDT por MXI
          </Text>
          <Text style={styles.infoText}>
            Mínimo: {MIN_USDT} USDT | Máximo: {MAX_USDT.toLocaleString()} USDT
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Monto en USDT</Text>
          <TextInput
            style={styles.input}
            placeholder={`Ingresa entre ${MIN_USDT} y ${MAX_USDT} USDT`}
            placeholderTextColor="#666666"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            editable={!loading}
          />
          {amount && !isValidAmount() && (
            <Text style={styles.errorText}>
              El monto debe estar entre {MIN_USDT} y {MAX_USDT} USDT
            </Text>
          )}

          {mxiAmount > 0 && (
            <Text style={styles.highlightText}>
              Recibirás: {mxiAmount.toFixed(2)} MXI
            </Text>
          )}

          <TouchableOpacity
            style={[
              styles.payButton,
              (!isValidAmount() || loading || loadingCurrencies) && styles.payButtonDisabled,
            ]}
            onPress={loadCurrencies}
            disabled={!isValidAmount() || loading || loadingCurrencies}
          >
            {loadingCurrencies ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={styles.payButtonText}>Continuar al Pago</Text>
            )}
          </TouchableOpacity>
        </View>

        {paymentStatus && (
          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>Estado del Pago</Text>
            <Text style={[styles.statusText, { color: getStatusColor(paymentStatus.status) }]}>
              Estado: {getStatusText(paymentStatus.status)}
            </Text>
            <Text style={styles.statusText}>
              Monto: {parseFloat(paymentStatus.usdt_amount.toString()).toFixed(2)} USDT
            </Text>
            <Text style={styles.statusText}>
              MXI: {parseFloat(paymentStatus.mxi_amount.toString()).toFixed(2)} MXI
            </Text>
            {paymentStatus.pay_currency && (
              <Text style={styles.statusText}>
                Moneda: {paymentStatus.pay_currency.toUpperCase()}
              </Text>
            )}
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Cómo Funciona</Text>
          <Text style={styles.infoText}>
            1. Ingresa el monto en USDT que deseas invertir
          </Text>
          <Text style={styles.infoText}>
            2. Selecciona tu criptomoneda preferida para el pago
          </Text>
          <Text style={styles.infoText}>
            3. Completa el pago en la página de NOWPayments
          </Text>
          <Text style={styles.infoText}>
            4. Los MXI se acreditarán automáticamente a tu cuenta
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Beneficios</Text>
          <Text style={styles.infoText}>
            • Recibe MXI tokens inmediatamente después del pago
          </Text>
          <Text style={styles.infoText}>
            • Genera rendimientos del 0.005% por hora
          </Text>
          <Text style={styles.infoText}>
            • Gana comisiones por referidos (5%, 2%, 1%)
          </Text>
          <Text style={styles.infoText}>
            • Participa en el pool de liquidez
          </Text>
        </View>

        {/* Extra padding at bottom to avoid tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Currency Selection Modal */}
      <Modal
        visible={showCurrencyModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona Criptomoneda</Text>
            
            {loadingCurrencies ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.infoText, { marginTop: 12 }]}>
                  Cargando criptomonedas disponibles...
                </Text>
              </View>
            ) : (
              <ScrollView style={{ maxHeight: 400 }}>
                {currencies.map((currency) => (
                  <TouchableOpacity
                    key={currency.code}
                    style={[
                      styles.currencyButton,
                      selectedCurrency === currency.code && styles.currencyButtonSelected,
                    ]}
                    onPress={() => setSelectedCurrency(currency.code)}
                  >
                    <Text style={styles.currencyText}>{currency.name}</Text>
                    {selectedCurrency === currency.code && (
                      <IconSymbol
                        ios_icon_name="checkmark.circle.fill"
                        android_material_icon_name="check_circle"
                        size={20}
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity
              style={[
                styles.modalButton,
                (!selectedCurrency || loading) && styles.payButtonDisabled,
              ]}
              onPress={handlePayment}
              disabled={!selectedCurrency || loading}
            >
              {loading ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <Text style={styles.modalButtonText}>Pagar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCurrencyModal(false)}
              disabled={loading}
            >
              <Text style={styles.closeButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
