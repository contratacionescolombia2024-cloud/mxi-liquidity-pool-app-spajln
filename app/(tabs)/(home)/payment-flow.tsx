
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

interface PhaseData {
  currentPhase: number;
  currentPriceUsdt: number;
  phase1TokensSold: number;
  phase2TokensSold: number;
  phase3TokensSold: number;
  phase1Allocation: number;
  phase2Allocation: number;
  phase3Allocation: number;
}

export default function PaymentFlowScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const [mxiAmount, setMxiAmount] = useState('');
  const [usdtAmount, setUsdtAmount] = useState('0.00');
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(true);
  const [phaseData, setPhaseData] = useState<PhaseData | null>(null);
  const [orderId, setOrderId] = useState<string>('');
  const [paymentUrl, setPaymentUrl] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<string>('');

  useEffect(() => {
    loadPhaseData();
    
    // Check if we have params from the previous screen
    if (params.mxiAmount && params.usdtAmount) {
      setMxiAmount(params.mxiAmount as string);
      setUsdtAmount(params.usdtAmount as string);
    }
  }, []);

  useEffect(() => {
    if (mxiAmount && phaseData && !params.mxiAmount) {
      const amount = parseFloat(mxiAmount);
      if (!isNaN(amount) && amount > 0) {
        const total = amount * phaseData.currentPriceUsdt;
        setUsdtAmount(total.toFixed(2));
      } else {
        setUsdtAmount('0.00');
      }
    } else if (!params.mxiAmount) {
      setUsdtAmount('0.00');
    }
  }, [mxiAmount, phaseData]);

  useEffect(() => {
    if (orderId) {
      subscribeToPaymentUpdates();
    }
  }, [orderId]);

  const loadPhaseData = async () => {
    try {
      const { data: metrics, error } = await supabase
        .from('metrics')
        .select('*')
        .single();

      if (error) throw error;

      const { data: allocation } = await supabase
        .from('presale_allocation')
        .select('*')
        .single();

      setPhaseData({
        currentPhase: metrics.current_phase,
        currentPriceUsdt: parseFloat(metrics.current_price_usdt.toString()),
        phase1TokensSold: parseFloat(metrics.phase_1_tokens_sold?.toString() || '0'),
        phase2TokensSold: parseFloat(metrics.phase_2_tokens_sold?.toString() || '0'),
        phase3TokensSold: parseFloat(metrics.phase_3_tokens_sold?.toString() || '0'),
        phase1Allocation: parseFloat(allocation?.phase_1_allocation?.toString() || '8333333'),
        phase2Allocation: parseFloat(allocation?.phase_2_allocation?.toString() || '8333333'),
        phase3Allocation: parseFloat(allocation?.phase_3_allocation?.toString() || '8333334'),
      });
    } catch (error) {
      console.error('Error loading phase data:', error);
      Alert.alert('Error', 'No se pudo cargar la información de la fase');
    } finally {
      setLoadingPhase(false);
    }
  };

  const handleCreatePayment = async () => {
    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesión para comprar MXI');
      return;
    }

    const amount = parseFloat(mxiAmount);
    const total = parseFloat(usdtAmount);

    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Debes ingresar un monto válido.');
      return;
    }

    if (total < 20) {
      Alert.alert('Monto Mínimo', 'El monto mínimo de compra es $20 USDT');
      return;
    }

    setLoading(true);

    try {
      console.log('Creating payment order...');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        Alert.alert('Error', 'Sesión expirada. Por favor inicia sesión nuevamente');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${supabase.supabaseUrl}/functions/v1/create-nowpayments-order`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mxi_amount: amount,
          }),
        }
      );

      const result = await response.json();
      console.log('Payment order created:', result);

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al crear la orden de pago');
      }

      const invoiceUrl = result.invoice_url;
      console.log('Invoice URL from response:', invoiceUrl);

      if (!invoiceUrl) {
        throw new Error('No se recibió la URL de pago del servidor');
      }

      setOrderId(result.order_id);
      setPaymentUrl(invoiceUrl);
      setPaymentStatus('waiting');

      // Open payment URL
      console.log('Opening payment URL:', invoiceUrl);
      const opened = await openPaymentUrl(invoiceUrl);
      
      if (!opened) {
        Alert.alert(
          'Error al Abrir Pago',
          'No se pudo abrir la página de pago automáticamente. Puedes copiar el enlace manualmente.',
          [
            {
              text: 'Copiar URL',
              onPress: () => {
                Alert.alert('URL de Pago', invoiceUrl);
              }
            },
            {
              text: 'Reintentar',
              onPress: () => openPaymentUrl(invoiceUrl)
            },
            { text: 'Cancelar' }
          ]
        );
      } else {
        console.log('Payment URL opened successfully');
      }
    } catch (error: any) {
      console.error('Error creating payment:', error);
      Alert.alert('Error', error.message || 'No se pudo crear la orden de pago');
    } finally {
      setLoading(false);
    }
  };

  const openPaymentUrl = async (url: string) => {
    console.log('Attempting to open payment URL:', url);
    
    if (!url) {
      console.error('No URL provided to openPaymentUrl');
      return false;
    }

    try {
      // Try WebBrowser first
      console.log('Opening with WebBrowser...');
      const result = await WebBrowser.openBrowserAsync(url, {
        dismissButtonStyle: 'close',
        readerMode: false,
        enableBarCollapsing: false,
      });
      
      console.log('WebBrowser result:', result);
      return true;
    } catch (webBrowserError) {
      console.error('WebBrowser failed:', webBrowserError);
      
      try {
        // Fallback to Linking
        console.log('Falling back to Linking...');
        const canOpen = await Linking.canOpenURL(url);
        console.log('Can open URL with Linking:', canOpen);
        
        if (canOpen) {
          await Linking.openURL(url);
          return true;
        } else {
          console.error('Cannot open URL with Linking');
          return false;
        }
      } catch (linkingError) {
        console.error('Linking failed:', linkingError);
        return false;
      }
    }
  };

  const subscribeToPaymentUpdates = () => {
    console.log('Subscribing to payment updates for order:', orderId);

    const channel = supabase
      .channel(`payment-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transaction_history',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          console.log('Payment update received:', payload);
          
          if (payload.new) {
            const newStatus = (payload.new as any).status;
            setPaymentStatus(newStatus);

            if (newStatus === 'confirmed' || newStatus === 'finished') {
              Alert.alert(
                '✅ Pago Confirmado',
                `Tu pago ha sido confirmado exitosamente.\n\nTu saldo de MXI ha sido actualizado.`,
                [
                  {
                    text: 'Ver Balance',
                    onPress: () => router.push('/(tabs)/(home)'),
                  },
                ]
              );
              channel.unsubscribe();
            } else if (newStatus === 'failed' || newStatus === 'expired') {
              Alert.alert(
                '❌ Pago Fallido',
                `Tu pago no pudo ser procesado.\n\nEstado: ${newStatus}`,
                [
                  {
                    text: 'Reintentar',
                    onPress: () => {
                      setMxiAmount('');
                      setUsdtAmount('0.00');
                      setOrderId('');
                      setPaymentUrl('');
                      setPaymentStatus('');
                    },
                  },
                ]
              );
              channel.unsubscribe();
            }
          }
        }
      )
      .subscribe();
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'Pendiente',
      'waiting': 'Esperando Pago',
      'confirming': 'Confirmando',
      'confirmed': 'Confirmado',
      'finished': 'Completado',
      'failed': 'Fallido',
      'expired': 'Expirado',
    };
    return statusMap[status] || status;
  };

  if (loadingPhase) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!phaseData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <IconSymbol
            ios_icon_name="exclamationmark.triangle"
            android_material_icon_name="error"
            size={64}
            color={colors.error}
          />
          <Text style={styles.errorText}>Error al cargar datos</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadPhaseData}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="chevron_left"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Comprar MXI</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!orderId ? (
          <React.Fragment>
            <View style={[commonStyles.card, styles.phaseCard]}>
              <View style={styles.phaseHeader}>
                <View style={styles.phaseBadge}>
                  <Text style={styles.phaseBadgeText}>Fase {phaseData.currentPhase}</Text>
                </View>
                <Text style={styles.phasePrice}>${phaseData.currentPriceUsdt} USDT</Text>
              </View>
              <Text style={styles.phasePriceLabel}>Precio por MXI</Text>
            </View>

            <View style={[commonStyles.card, styles.formCard]}>
              <Text style={styles.formTitle}>💎 Cantidad de MXI</Text>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={mxiAmount}
                  onChangeText={setMxiAmount}
                  placeholder="Ingresa cantidad de MXI"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
                <Text style={styles.inputUnit}>MXI</Text>
              </View>

              <View style={styles.quickAmounts}>
                {[50, 100, 250, 500, 1000].map((amount, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.quickAmountButton}
                    onPress={() => setMxiAmount(amount.toString())}
                  >
                    <Text style={styles.quickAmountText}>{amount}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.divider} />

              <View style={styles.totalSection}>
                <Text style={styles.totalLabel}>Total a Pagar</Text>
                <View style={styles.totalAmount}>
                  <Text style={styles.totalValue}>${usdtAmount}</Text>
                  <Text style={styles.totalCurrency}>USDT</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.continueButton, loading && styles.continueButtonDisabled]}
                onPress={handleCreatePayment}
                disabled={loading || !mxiAmount || parseFloat(usdtAmount) < 20}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <React.Fragment>
                    <Text style={styles.continueButtonText}>Crear Orden de Pago</Text>
                    <IconSymbol
                      ios_icon_name="arrow.right"
                      android_material_icon_name="arrow_forward"
                      size={20}
                      color="#fff"
                    />
                  </React.Fragment>
                )}
              </TouchableOpacity>

              <Text style={styles.minPurchaseNote}>
                * Monto mínimo: $20 USDT
              </Text>
            </View>

            <View style={[commonStyles.card, styles.infoCard]}>
              <Text style={styles.infoText}>
                💡 Se abrirá la página de pago de NOWPayments donde podrás completar tu transacción con USDT (Ethereum ERC20).
              </Text>
            </View>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <View style={[commonStyles.card, styles.waitingCard]}>
              <View style={styles.waitingHeader}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.waitingTitle}>Esperando Pago</Text>
                <Text style={styles.waitingSubtitle}>
                  Estado: {getStatusText(paymentStatus)}
                </Text>
              </View>

              <View style={styles.paymentDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Orden ID:</Text>
                  <Text style={styles.detailValue}>{orderId}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Monto MXI:</Text>
                  <Text style={styles.detailValue}>{mxiAmount} MXI</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Total:</Text>
                  <Text style={styles.detailValue}>${usdtAmount} USD</Text>
                </View>
              </View>

              {paymentUrl && (
                <TouchableOpacity
                  style={styles.reopenButton}
                  onPress={async () => {
                    const opened = await openPaymentUrl(paymentUrl);
                    if (!opened) {
                      Alert.alert(
                        'Error',
                        'No se pudo abrir la página de pago. Por favor intenta nuevamente.',
                        [
                          {
                            text: 'Copiar URL',
                            onPress: () => {
                              Alert.alert('URL de Pago', paymentUrl);
                            }
                          },
                          { text: 'OK' }
                        ]
                      );
                    }
                  }}
                >
                  <IconSymbol
                    ios_icon_name="arrow.up.right.square"
                    android_material_icon_name="open_in_new"
                    size={20}
                    color="#fff"
                  />
                  <Text style={styles.reopenButtonText}>Abrir Página de Pago</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={[commonStyles.card, styles.infoCard]}>
              <Text style={styles.infoText}>
                ⏳ Tu pago está siendo procesado. Esta pantalla se actualizará automáticamente cuando se confirme el pago.
              </Text>
              <Text style={[styles.infoText, { marginTop: 12 }]}>
                💡 Puedes cerrar esta pantalla y volver más tarde. El estado se actualizará en tu historial de transacciones.
              </Text>
            </View>
          </React.Fragment>
        )}
      </ScrollView>
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
    marginRight: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  phaseCard: {
    marginBottom: 16,
    backgroundColor: `${colors.primary}15`,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  phaseBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  phaseBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  phasePrice: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
  },
  phasePriceLabel: {
    fontSize: 14,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    paddingVertical: 16,
  },
  inputUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 8,
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  quickAmountButton: {
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  totalSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  totalAmount: {
    alignItems: 'center',
  },
  totalValue: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 4,
  },
  totalCurrency: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  minPurchaseNote: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  waitingCard: {
    marginBottom: 16,
    alignItems: 'center',
  },
  waitingHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  waitingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  waitingSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  paymentDetails: {
    width: '100%',
    gap: 12,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  reopenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    width: '100%',
  },
  reopenButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  infoCard: {
    backgroundColor: `${colors.primary}10`,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
