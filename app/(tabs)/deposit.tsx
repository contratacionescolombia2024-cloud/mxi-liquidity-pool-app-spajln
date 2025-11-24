
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
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import type { RealtimeChannel } from '@supabase/supabase-js';

const MIN_USDT = 3;
const MAX_USDT = 500000;

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

export default function DepositScreen() {
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

      // CRITICAL FIX: Subscribe to payments table (not nowpayments_orders)
      const channel = supabase
        .channel(`payment-updates-${orderId}`)
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
              const record = payload.new as any;
              console.log('Payment status updated:', record.status);
              
              // Update local state
              setPaymentStatus({
                id: record.id,
                order_id: record.order_id,
                status: record.status,
                payment_status: record.payment_status || record.status,
                price_amount: record.price_amount,
                pay_currency: record.pay_currency,
                actually_paid: record.actually_paid || 0,
                invoice_url: record.invoice_url,
                created_at: record.created_at,
                updated_at: record.updated_at,
              });

              // Handle payment completion
              if (record.status === 'paid' || record.status === 'confirmed' || record.status === 'finished') {
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
    console.log('\n========== LOAD CURRENCIES ==========');
    
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

    setLoadingCurrencies(true);

    try {
      const orderId = `MXI-${Date.now()}-${user?.id.substring(0, 8)}`;
      
      console.log('Order ID:', orderId);
      console.log('Amount:', usdtAmount);

      // Show available currencies directly (hardcoded list)
      const availableCurrencies = [
        { code: 'usdttrc20', name: 'USDT (TRC20)' },
        { code: 'usdterc20', name: 'USDT (ERC20)' },
        { code: 'usdtbep20', name: 'USDT (BEP20)' },
        { code: 'btc', name: 'Bitcoin' },
        { code: 'eth', name: 'Ethereum' },
        { code: 'bnb', name: 'BNB' },
        { code: 'trx', name: 'TRON' },
      ];

      console.log('Currencies loaded:', availableCurrencies.length);
      setCurrencies(availableCurrencies);
      setCurrentOrderId(orderId);
      setShowCurrencyModal(true);
    } catch (error: any) {
      console.error('Error loading currencies:', error);
      Alert.alert(
        'Error',
        error.message || 'Error al cargar criptomonedas disponibles'
      );
    } finally {
      setLoadingCurrencies(false);
    }
  };

  const openPaymentUrl = async (url: string) => {
    console.log('\n========== OPENING PAYMENT URL ==========');
    console.log('URL:', url);

    try {
      // Try WebBrowser first
      console.log('Attempting to open with WebBrowser...');
      const result = await WebBrowser.openBrowserAsync(url, {
        dismissButtonStyle: 'close',
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        controlsColor: colors.primary,
        toolbarColor: '#000000',
      });
      
      console.log('WebBrowser result:', result);

      if (result.type === 'opened') {
        console.log('✅ Browser opened successfully');
        return true;
      } else if (result.type === 'cancel') {
        console.log('⚠️ User cancelled browser');
        return false;
      }
    } catch (browserError) {
      console.error('❌ WebBrowser error:', browserError);
      
      // Fallback to Linking
      try {
        console.log('Attempting fallback with Linking...');
        const canOpen = await Linking.canOpenURL(url);
        
        if (canOpen) {
          await Linking.openURL(url);
          console.log('✅ Opened with Linking');
          return true;
        } else {
          console.error('❌ Cannot open URL with Linking');
          throw new Error('No se puede abrir el navegador');
        }
      } catch (linkingError) {
        console.error('❌ Linking error:', linkingError);
        throw linkingError;
      }
    }

    return false;
  };

  const handlePayment = async () => {
    console.log('\n========== HANDLE PAYMENT ==========');
    console.log('Selected currency:', selectedCurrency);

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
      const requestBody = {
        order_id: currentOrderId,
        price_amount: usdtAmount,
        price_currency: 'usd',
        pay_currency: selectedCurrency,
      };

      console.log('Creating payment:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(
        'https://aeyfnjuatbtcauiumbhn.supabase.co/functions/v1/create-payment-intent',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      console.log('Payment response status:', response.status);

      const responseText = await response.text();
      console.log('Payment response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Respuesta inválida: ${responseText.substring(0, 100)}`);
      }

      console.log('Parsed response:', JSON.stringify(data, null, 2));

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Error al crear el pago');
      }

      if (!data.intent?.invoice_url) {
        console.error('No invoice_url in response:', data);
        throw new Error('No se pudo obtener la URL de pago');
      }

      const invoiceUrl = data.intent.invoice_url;
      
      console.log('✅ Invoice URL received:', invoiceUrl);

      // Close the modal first
      setShowCurrencyModal(false);

      // Subscribe to Realtime updates BEFORE opening the payment page
      await subscribeToPaymentUpdates(currentOrderId);

      // Set initial payment status
      setPaymentStatus({
        id: data.intent.id || currentOrderId,
        order_id: currentOrderId,
        status: 'waiting',
        payment_status: 'waiting',
        price_amount: usdtAmount,
        pay_currency: selectedCurrency,
        actually_paid: 0,
        invoice_url: invoiceUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Wait a bit for modal to close
      await new Promise(resolve => setTimeout(resolve, 500));

      // Try to open the payment URL
      console.log('🌐 Attempting to open payment URL...');
      
      const opened = await openPaymentUrl(invoiceUrl);

      if (opened) {
        // Show success message
        Alert.alert(
          'Pago Iniciado',
          'Se ha abierto la página de pago de NOWPayments. Completa el pago y el estado se actualizará automáticamente en tiempo real.',
          [{ text: 'OK' }]
        );
      } else {
        // Show URL for manual opening
        Alert.alert(
          'Abrir Página de Pago',
          'Por favor copia esta URL y ábrela en tu navegador para completar el pago:',
          [
            {
              text: 'Copiar URL',
              onPress: () => {
                console.log('User requested to copy URL:', invoiceUrl);
                Alert.alert('URL Copiada', 'Abre esta URL en tu navegador:\n\n' + invoiceUrl);
              }
            },
            {
              text: 'Intentar de Nuevo',
              onPress: () => openPaymentUrl(invoiceUrl)
            },
            { text: 'Cancelar', style: 'cancel' }
          ]
        );
      }

    } catch (error: any) {
      console.error('❌ Payment error:', error);
      Alert.alert(
        'Error al Procesar Pago',
        error.message || 'Ocurrió un error al procesar el pago. Por favor intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'finished':
      case 'confirmed':
      case 'paid':
        return colors.success;
      case 'failed':
      case 'expired':
        return colors.error;
      case 'waiting':
      case 'pending':
      case 'processing':
      case 'confirming':
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
      confirming: 'Confirmando',
      confirmed: 'Confirmado',
      finished: 'Completado',
      paid: 'Pagado',
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
        <Text style={styles.headerTitle}>Depositar</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {isRealtimeConnected && (
          <View style={styles.realtimeIndicator}>
            <View style={styles.realtimeDot} />
            <Text style={styles.realtimeIndicatorText}>
              Actualizaciones en tiempo real activas
            </Text>
          </View>
        )}

        <View style={[commonStyles.card, styles.balanceCard]}>
          <View style={styles.balanceHeader}>
            <IconSymbol 
              ios_icon_name="dollarsign.circle.fill" 
              android_material_icon_name="account_balance_wallet" 
              size={48} 
              color={colors.primary} 
            />
            <Text style={styles.balanceLabel}>Balance Actual</Text>
          </View>
          <Text style={styles.balanceValue}>{user?.mxiBalance.toFixed(2) || '0.00'} MXI</Text>
          <Text style={styles.balanceSubtext}>${user?.usdtContributed.toFixed(2) || '0.00'} USDT Contribuido</Text>
        </View>

        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Comprar MXI</Text>
          
          <View style={styles.priceInfo}>
            <Text style={styles.infoText}>
              Precio actual: {currentPrice.toFixed(2)} USDT por MXI
            </Text>
            <Text style={styles.infoText}>
              Mínimo: {MIN_USDT} USDT | Máximo: {MAX_USDT.toLocaleString()} USDT
            </Text>
          </View>

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
            <View style={styles.mxiPreview}>
              <Text style={styles.mxiPreviewLabel}>Recibirás:</Text>
              <Text style={styles.mxiPreviewAmount}>{mxiAmount.toFixed(2)} MXI</Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.buyButton,
              (!isValidAmount() || loading || loadingCurrencies) && styles.buyButtonDisabled,
            ]}
            onPress={loadCurrencies}
            disabled={!isValidAmount() || loading || loadingCurrencies}
          >
            {loadingCurrencies ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <React.Fragment>
                <IconSymbol
                  ios_icon_name="plus.circle.fill"
                  android_material_icon_name="add_circle"
                  size={24}
                  color="#000000"
                />
                <Text style={styles.buyButtonText}>Continuar al Pago</Text>
              </React.Fragment>
            )}
          </TouchableOpacity>
        </View>

        {paymentStatus && (
          <View style={[commonStyles.card, styles.statusCard]}>
            <Text style={styles.statusTitle}>Estado del Pago</Text>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Estado:</Text>
              <Text style={[styles.statusValue, { color: getStatusColor(paymentStatus.status) }]}>
                {getStatusText(paymentStatus.status)}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Monto:</Text>
              <Text style={styles.statusValue}>
                {parseFloat(paymentStatus.price_amount.toString()).toFixed(2)} USDT
              </Text>
            </View>
            {paymentStatus.pay_currency && (
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Moneda:</Text>
                <Text style={styles.statusValue}>
                  {paymentStatus.pay_currency.toUpperCase()}
                </Text>
              </View>
            )}
            {paymentStatus.actually_paid > 0 && (
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Pagado:</Text>
                <Text style={styles.statusValue}>
                  {parseFloat(paymentStatus.actually_paid.toString()).toFixed(8)} {paymentStatus.pay_currency.toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={[styles.statusLabel, { fontSize: 12, marginTop: 8 }]}>
              Última actualización: {new Date(paymentStatus.updated_at).toLocaleString('es-ES')}
            </Text>
            
            {paymentStatus.invoice_url && (
              <TouchableOpacity
                style={[styles.buyButton, { marginTop: 12 }]}
                onPress={() => openPaymentUrl(paymentStatus.invoice_url)}
              >
                <Text style={styles.buyButtonText}>Abrir Página de Pago</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={[commonStyles.card, styles.infoCard]}>
          <View style={styles.infoHeader}>
            <IconSymbol 
              ios_icon_name="info.circle.fill" 
              android_material_icon_name="info" 
              size={24} 
              color={colors.primary} 
            />
            <Text style={styles.infoTitle}>Cómo Funciona</Text>
          </View>
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>1.</Text>
              <Text style={styles.infoText}>Ingresa el monto en USDT que deseas invertir</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>2.</Text>
              <Text style={styles.infoText}>Selecciona tu criptomoneda preferida para el pago</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>3.</Text>
              <Text style={styles.infoText}>Completa el pago en la página de NOWPayments</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>4.</Text>
              <Text style={styles.infoText}>El estado se actualiza automáticamente en tiempo real</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>5.</Text>
              <Text style={styles.infoText}>Los MXI se acreditan automáticamente a tu cuenta</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

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
                <Text style={[styles.infoText, { marginTop: 12, textAlign: 'center' }]}>
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
                (!selectedCurrency || loading) && styles.buyButtonDisabled,
              ]}
              onPress={handlePayment}
              disabled={!selectedCurrency || loading}
            >
              {loading ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <Text style={styles.modalButtonText}>Continuar al Pago</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  balanceCard: {
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  balanceHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  balanceSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  priceInfo: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  label: {
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
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginBottom: 8,
  },
  mxiPreview: {
    backgroundColor: colors.primary + '20',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  mxiPreviewLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  mxiPreviewAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  buyButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  buyButtonDisabled: {
    backgroundColor: '#555555',
    opacity: 0.5,
  },
  buyButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  statusCard: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
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
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoBullet: {
    fontSize: 14,
    color: colors.primary,
    marginRight: 8,
    marginTop: 2,
    fontWeight: '600',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  currencyButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currencyButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  currencyText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
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
    backgroundColor: colors.background,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
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
