
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
import type { RealtimeChannel } from '@supabase/supabase-js';

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
  realtimeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 12,
  },
  realtimeIndicatorText: {
    fontSize: 12,
    color: '#00FF00',
    marginLeft: 6,
  },
  realtimeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FF00',
  },
});

interface Currency {
  code: string;
  name: string;
}

interface PaymentStatus {
  id: string;
  order_id: string;
  status: string;
  payment_status: string;
  price_amount: number;
  pay_currency: string;
  actually_paid: number;
  invoice_url: string;
  created_at: string;
  updated_at: string;
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
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel | null>(null);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);

  useEffect(() => {
    loadPhaseInfo();
    
    return () => {
      // Cleanup Realtime subscription on unmount
      if (realtimeChannel) {
        console.log('Cleaning up Realtime channel');
        realtimeChannel.unsubscribe();
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

  const subscribeToPaymentUpdates = async (orderId: string) => {
    console.log('\n========== SUBSCRIBING TO REALTIME ==========');
    console.log('Order ID:', orderId);

    try {
      // Unsubscribe from previous channel if exists
      if (realtimeChannel) {
        console.log('Unsubscribing from previous channel');
        await realtimeChannel.unsubscribe();
      }

      // Get current session token
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession?.access_token) {
        console.error('No session token available');
        return;
      }

      console.log('Setting Realtime auth token');
      await supabase.realtime.setAuth(currentSession.access_token);

      // Create private channel for this payment
      const channelName = `payment:${orderId}`;
      console.log('Creating channel:', channelName);

      const channel = supabase.channel(channelName, {
        config: {
          private: true,
          broadcast: { ack: true },
        },
      });

      // Subscribe to database changes
      channel
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'payments',
            filter: `order_id=eq.${orderId}`,
          },
          (payload) => {
            console.log('\n========== REALTIME UPDATE RECEIVED ==========');
            console.log('Event:', payload.eventType);
            console.log('Payload:', JSON.stringify(payload, null, 2));

            if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
              const record = payload.new as PaymentStatus;
              console.log('Payment status updated:', record.status);
              
              setPaymentStatus(record);

              // Handle payment completion
              if (record.status === 'paid') {
                console.log('Payment confirmed!');
                Alert.alert(
                  '¡Pago Confirmado!',
                  `Tu pago ha sido confirmado exitosamente. Los MXI se han acreditado a tu cuenta.`,
                  [
                    {
                      text: 'Ver Balance',
                      onPress: () => router.push('/(tabs)/(home)'),
                    },
                  ]
                );
                
                // Unsubscribe after successful payment
                if (realtimeChannel) {
                  realtimeChannel.unsubscribe();
                  setRealtimeChannel(null);
                  setIsRealtimeConnected(false);
                }
              } else if (record.status === 'failed' || record.status === 'expired') {
                console.log('Payment failed/expired');
                Alert.alert(
                  'Pago No Completado',
                  `El pago ha ${record.status === 'failed' ? 'fallado' : 'expirado'}. Por favor intenta nuevamente.`,
                  [{ text: 'OK' }]
                );
                
                // Unsubscribe after failed payment
                if (realtimeChannel) {
                  realtimeChannel.unsubscribe();
                  setRealtimeChannel(null);
                  setIsRealtimeConnected(false);
                }
              }
            }
          }
        )
        .subscribe((status) => {
          console.log('Realtime subscription status:', status);
          
          if (status === 'SUBSCRIBED') {
            console.log('✅ Successfully subscribed to payment updates');
            setIsRealtimeConnected(true);
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ Realtime channel error');
            setIsRealtimeConnected(false);
          } else if (status === 'TIMED_OUT') {
            console.error('❌ Realtime subscription timed out');
            setIsRealtimeConnected(false);
          } else if (status === 'CLOSED') {
            console.log('Realtime channel closed');
            setIsRealtimeConnected(false);
          }
        });

      setRealtimeChannel(channel);
      console.log('Realtime channel setup complete');
    } catch (error) {
      console.error('Error setting up Realtime subscription:', error);
      setIsRealtimeConnected(false);
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

      console.log('\n========== LOADING CURRENCIES ==========');
      console.log('Order ID:', orderId);
      console.log('Amount:', usdtAmount);

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
        setCurrentOrderId(orderId);
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

    if (!currentOrderId) {
      Alert.alert('Error', 'No se pudo generar el ID de orden');
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
      console.log('\n========== CREATING PAYMENT ==========');
      console.log('Order ID:', currentOrderId);
      console.log('Amount:', usdtAmount);
      console.log('Currency:', selectedCurrency);

      const response = await fetch(
        `https://aeyfnjuatbtcauiumbhn.supabase.co/functions/v1/create-payment-intent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            order_id: currentOrderId,
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

      if (data.intent?.invoice_url) {
        const invoiceUrl = data.intent.invoice_url;
        
        console.log('Opening invoice URL:', invoiceUrl);

        // Subscribe to Realtime updates BEFORE opening the payment page
        await subscribeToPaymentUpdates(currentOrderId);

        // Open payment URL in browser
        await WebBrowser.openBrowserAsync(invoiceUrl);

        Alert.alert(
          'Pago Iniciado',
          'Se ha abierto la página de pago. Completa el pago y el estado se actualizará automáticamente en tiempo real.',
          [{ text: 'OK' }]
        );

        // Set initial payment status
        setPaymentStatus({
          id: data.intent.id,
          order_id: currentOrderId,
          status: data.intent.status || 'waiting',
          payment_status: data.intent.payment_status || 'waiting',
          price_amount: usdtAmount,
          pay_currency: selectedCurrency,
          actually_paid: 0,
          invoice_url: invoiceUrl,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return colors.success;
      case 'failed':
      case 'expired':
        return colors.error;
      case 'waiting':
      case 'pending':
      case 'processing':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: 'Pendiente',
      waiting: 'Esperando pago',
      processing: 'Procesando pago',
      paid: 'Pago confirmado',
      failed: 'Fallido',
      expired: 'Expirado',
      refunded: 'Reembolsado',
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
        {isRealtimeConnected && (
          <View style={styles.realtimeIndicator}>
            <View style={styles.realtimeDot} />
            <Text style={styles.realtimeIndicatorText}>
              Actualizaciones en tiempo real activas
            </Text>
          </View>
        )}

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
              Monto: {parseFloat(paymentStatus.price_amount.toString()).toFixed(2)} USDT
            </Text>
            {paymentStatus.pay_currency && (
              <Text style={styles.statusText}>
                Moneda: {paymentStatus.pay_currency.toUpperCase()}
              </Text>
            )}
            {paymentStatus.actually_paid > 0 && (
              <Text style={styles.statusText}>
                Pagado: {parseFloat(paymentStatus.actually_paid.toString()).toFixed(8)} {paymentStatus.pay_currency.toUpperCase()}
              </Text>
            )}
            <Text style={[styles.statusText, { fontSize: 12, marginTop: 8 }]}>
              Última actualización: {new Date(paymentStatus.updated_at).toLocaleString('es-ES')}
            </Text>
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
            4. El estado se actualiza automáticamente en tiempo real
          </Text>
          <Text style={styles.infoText}>
            5. Los MXI se acreditan automáticamente a tu cuenta
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
          <Text style={styles.infoText}>
            • Actualizaciones de estado en tiempo real
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
                {currencies.map((currency, index) => (
                  <TouchableOpacity
                    key={index}
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
