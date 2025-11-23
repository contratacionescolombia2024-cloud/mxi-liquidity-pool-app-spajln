
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
  RefreshControl,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import * as WebBrowser from 'expo-web-browser';

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

interface PendingOrder {
  id: string;
  order_id: string;
  payment_id: string;
  payment_url: string;
  mxi_amount: number;
  usdt_amount: number;
  status: string;
  created_at: string;
  expires_at: string;
}

export default function PurchaseMXIScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [mxiAmount, setMxiAmount] = useState('');
  const [usdtAmount, setUsdtAmount] = useState('0.00');
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [phaseData, setPhaseData] = useState<PhaseData | null>(null);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);

  useEffect(() => {
    loadPhaseData();
    loadPendingOrders();
  }, []);

  useEffect(() => {
    if (mxiAmount && phaseData) {
      const amount = parseFloat(mxiAmount);
      if (!isNaN(amount) && amount > 0) {
        const total = amount * phaseData.currentPriceUsdt;
        setUsdtAmount(total.toFixed(2));
      } else {
        setUsdtAmount('0.00');
      }
    } else {
      setUsdtAmount('0.00');
    }
  }, [mxiAmount, phaseData]);

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
      setRefreshing(false);
    }
  };

  const loadPendingOrders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('nowpayments_orders')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['pending', 'waiting', 'confirming'])
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      setPendingOrders(data || []);
    } catch (error) {
      console.error('Error loading pending orders:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadPhaseData(), loadPendingOrders()]);
  };

  const openPaymentUrl = async (url: string) => {
    console.log('Attempting to open payment URL:', url);
    
    try {
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

  const handleCreateOrder = async () => {
    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesión para comprar MXI');
      return;
    }

    const amount = parseFloat(mxiAmount);
    const total = parseFloat(usdtAmount);

    // Validation: Check if amount is valid
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Debes ingresar un monto válido.');
      return;
    }

    // Validation: Check minimum amount
    if (total < 20) {
      Alert.alert('Monto Mínimo', 'El monto mínimo de compra es $20 USDT');
      return;
    }

    // Validation: Check maximum amount
    if (total > 500000) {
      Alert.alert('Monto Máximo', 'El monto máximo de compra es $500,000 USDT por transacción');
      return;
    }

    setLoading(true);

    try {
      console.log('=== Creating order for', amount, 'MXI ===');
      console.log('Total USDT:', total);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        Alert.alert('Error', 'Sesión expirada. Por favor inicia sesión nuevamente');
        setLoading(false);
        return;
      }

      console.log('Session valid, calling edge function...');
      
      const { data, error } = await supabase.functions.invoke('create-nowpayments-order', {
        body: { mxi_amount: amount },
      });

      console.log('Edge function response:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        
        // Provide more specific error messages
        let errorMessage = 'No se pudo generar el pago. Intenta nuevamente.';
        
        if (error.message) {
          if (error.message.includes('No autorizado')) {
            errorMessage = 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.';
          } else if (error.message.includes('monto mínimo')) {
            errorMessage = error.message;
          } else if (error.message.includes('Solo quedan')) {
            errorMessage = error.message;
          } else if (error.message.includes('servicio de pagos')) {
            errorMessage = 'Error al conectar con el servicio de pagos. Por favor intenta nuevamente en unos momentos.';
          } else {
            errorMessage = error.message;
          }
        }
        
        throw new Error(errorMessage);
      }

      if (!data || !data.invoice_url) {
        console.error('No invoice URL in response:', data);
        
        // Check if there's an error in the data
        if (data && data.error) {
          throw new Error(data.error);
        }
        
        throw new Error('No se pudo generar el pago. Intenta nuevamente.');
      }

      console.log('Invoice URL received:', data.invoice_url);

      // Open the payment URL
      const opened = await openPaymentUrl(data.invoice_url);
      
      if (opened) {
        Alert.alert(
          '✅ Orden Creada',
          `Se ha creado tu orden de ${amount} MXI por $${total} USDT.\n\nSe ha abierto la página de pago de NOWPayments. Por favor completa el pago en la ventana del navegador.\n\n💡 Consejo: Puedes encontrar esta orden en "Órdenes Pendientes" si necesitas volver a abrir el enlace de pago.`,
          [
            { 
              text: 'Ver Historial', 
              onPress: () => router.push('/(tabs)/(home)/transaction-history'),
            },
            { 
              text: 'OK', 
              onPress: () => {
                setMxiAmount('');
                setUsdtAmount('0.00');
                loadPendingOrders();
              }
            }
          ]
        );
      } else {
        Alert.alert(
          '⚠️ Orden Creada',
          `Tu orden ha sido creada pero no se pudo abrir el navegador automáticamente.\n\nPuedes encontrar tu orden en "Órdenes Pendientes" abajo o en el "Historial de Transacciones" para completar el pago.`,
          [
            { 
              text: 'Ver Historial', 
              onPress: () => router.push('/(tabs)/(home)/transaction-history'),
            },
            { 
              text: 'OK', 
              onPress: () => {
                setMxiAmount('');
                setUsdtAmount('0.00');
                loadPendingOrders();
              }
            }
          ]
        );
      }
      
      await loadPendingOrders();
      
    } catch (error: any) {
      console.error('Error creating order:', error);
      console.error('Error stack:', error.stack);
      
      Alert.alert(
        '❌ Error',
        error.message || 'No se pudo generar el pago. Intenta nuevamente.',
        [
          {
            text: 'Ver Historial',
            onPress: () => router.push('/(tabs)/(home)/transaction-history'),
          },
          { text: 'OK' },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPayment = async (order: PendingOrder) => {
    console.log('Opening payment for order:', order.order_id);
    
    const opened = await openPaymentUrl(order.payment_url);
    
    if (!opened) {
      Alert.alert(
        'Error',
        'No se pudo abrir el enlace de pago. Por favor intenta nuevamente o copia la URL manualmente.',
        [
          {
            text: 'Ver URL',
            onPress: () => {
              Alert.alert('URL de Pago', order.payment_url);
            }
          },
          { text: 'Cancelar' }
        ]
      );
    }
  };

  const handleCheckStatus = async (order: PendingOrder) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${supabase.supabaseUrl}/functions/v1/check-nowpayments-status?order_id=${order.order_id}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        if (result.status === 'confirmed' || result.status === 'finished') {
          Alert.alert(
            '✅ Pago Confirmado',
            `Tu pago de ${order.mxi_amount} MXI ha sido confirmado.\n\nTu saldo ha sido actualizado.`,
            [{ text: 'OK', onPress: () => loadPendingOrders() }]
          );
        } else {
          Alert.alert(
            'Estado del Pago',
            `Estado actual: ${result.status}\n\nEl pago aún está siendo procesado.`
          );
        }
      }
    } catch (error) {
      console.error('Error checking status:', error);
      Alert.alert('Error', 'No se pudo verificar el estado del pago');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'finished':
        return colors.success;
      case 'waiting':
      case 'confirming':
        return colors.warning;
      case 'pending':
        return colors.primary;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'waiting':
        return 'Esperando Pago';
      case 'confirming':
        return 'Confirmando';
      case 'confirmed':
        return 'Confirmado';
      case 'finished':
        return 'Completado';
      case 'failed':
        return 'Fallido';
      case 'expired':
        return 'Expirado';
      default:
        return status;
    }
  };

  if (loadingPhase) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando información...</Text>
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

  const currentPhaseAllocation = phaseData[`phase${phaseData.currentPhase}Allocation` as keyof PhaseData] as number;
  const currentPhaseSold = phaseData[`phase${phaseData.currentPhase}TokensSold` as keyof PhaseData] as number;
  const remainingInPhase = currentPhaseAllocation - currentPhaseSold;
  const phaseProgress = (currentPhaseSold / currentPhaseAllocation) * 100;

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
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => router.push('/(tabs)/(home)/transaction-history')}
        >
          <IconSymbol
            ios_icon_name="clock.fill"
            android_material_icon_name="history"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Phase Information */}
        <View style={[commonStyles.card, styles.phaseCard]}>
          <View style={styles.phaseHeader}>
            <View style={styles.phaseBadge}>
              <Text style={styles.phaseBadgeText}>Fase {phaseData.currentPhase}</Text>
            </View>
            <Text style={styles.phasePrice}>${phaseData.currentPriceUsdt} USDT</Text>
          </View>
          <Text style={styles.phasePriceLabel}>Precio por MXI</Text>

          <View style={styles.phaseProgress}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${phaseProgress}%` }]} />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabel}>
                {currentPhaseSold.toLocaleString()} MXI vendidos
              </Text>
              <Text style={styles.progressLabel}>
                {remainingInPhase.toLocaleString()} MXI restantes
              </Text>
            </View>
          </View>
        </View>

        {/* Purchase Form */}
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
            style={[styles.purchaseButton, loading && styles.purchaseButtonDisabled]}
            onPress={handleCreateOrder}
            disabled={loading || !mxiAmount || parseFloat(usdtAmount) < 20}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <React.Fragment>
                <IconSymbol
                  ios_icon_name="creditcard.fill"
                  android_material_icon_name="payment"
                  size={20}
                  color="#fff"
                />
                <Text style={styles.purchaseButtonText}>Pagar con USDT ETH (NOWPayments)</Text>
              </React.Fragment>
            )}
          </TouchableOpacity>

          <View style={styles.purchaseNotes}>
            <Text style={styles.minPurchaseNote}>
              * Monto mínimo: $20 USDT ({Math.ceil(20 / phaseData.currentPriceUsdt)} MXI)
            </Text>
            <Text style={styles.minPurchaseNote}>
              * Monto máximo: $500,000 USDT por transacción
            </Text>
          </View>
        </View>

        {/* Pending Orders */}
        {pendingOrders.length > 0 && (
          <View style={[commonStyles.card, styles.ordersCard]}>
            <View style={styles.ordersHeader}>
              <Text style={styles.ordersTitle}>📋 Órdenes Pendientes</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/(home)/transaction-history')}>
                <Text style={styles.viewAllText}>Ver todas</Text>
              </TouchableOpacity>
            </View>
            {pendingOrders.map((order, index) => (
              <View key={index} style={styles.orderItem}>
                <View style={styles.orderHeader}>
                  <View style={[styles.orderStatus, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                    <Text style={[styles.orderStatusText, { color: getStatusColor(order.status) }]}>
                      {getStatusText(order.status)}
                    </Text>
                  </View>
                  <Text style={styles.orderDate}>{formatDate(order.created_at)}</Text>
                </View>

                <View style={styles.orderDetails}>
                  <Text style={styles.orderAmount}>{order.mxi_amount} MXI</Text>
                  <Text style={styles.orderPrice}>${order.usdt_amount} USDT</Text>
                </View>

                <View style={styles.orderActions}>
                  <TouchableOpacity
                    style={styles.orderActionButton}
                    onPress={() => handleOpenPayment(order)}
                  >
                    <IconSymbol
                      ios_icon_name="arrow.up.right.square"
                      android_material_icon_name="open_in_new"
                      size={16}
                      color={colors.primary}
                    />
                    <Text style={styles.orderActionText}>Abrir Pago</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.orderActionButton}
                    onPress={() => handleCheckStatus(order)}
                  >
                    <IconSymbol
                      ios_icon_name="arrow.clockwise"
                      android_material_icon_name="refresh"
                      size={16}
                      color={colors.accent}
                    />
                    <Text style={styles.orderActionText}>Verificar</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.orderExpiry}>
                  Expira: {formatDate(order.expires_at)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Information */}
        <View style={[commonStyles.card, styles.infoCard]}>
          <View style={styles.infoHeader}>
            <IconSymbol
              ios_icon_name="info.circle.fill"
              android_material_icon_name="info"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.infoTitle}>Información Importante</Text>
          </View>

          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>•</Text>
              <Text style={styles.infoText}>
                Los pagos se procesan con NOWPayments en USDT (Ethereum ERC20)
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>•</Text>
              <Text style={styles.infoText}>
                El MXI se acredita automáticamente después de la confirmación
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>•</Text>
              <Text style={styles.infoText}>
                Las comisiones de referidos se calculan automáticamente (5%, 2%, 1%)
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>•</Text>
              <Text style={styles.infoText}>
                El MXI comprado genera rendimientos del 3% mensual (vesting)
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>•</Text>
              <Text style={styles.infoText}>
                Los pagos expiran después de 1 hora si no se completan
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>•</Text>
              <Text style={styles.infoText}>
                Puedes ver todas tus transacciones en el historial
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>•</Text>
              <Text style={styles.infoText}>
                Red de pago: Ethereum (ERC20) - Asegúrate de usar la red correcta
              </Text>
            </View>
          </View>
        </View>

        {/* Phase Breakdown */}
        <View style={[commonStyles.card, styles.phasesCard]}>
          <Text style={styles.phasesTitle}>📊 Fases de Preventa</Text>

          <View style={styles.phaseBreakdown}>
            <View style={[styles.phaseBreakdownItem, phaseData.currentPhase === 1 && styles.phaseBreakdownActive]}>
              <View style={styles.phaseBreakdownHeader}>
                <Text style={styles.phaseBreakdownTitle}>Fase 1</Text>
                {phaseData.currentPhase === 1 && (
                  <View style={styles.activePhaseIndicator}>
                    <Text style={styles.activePhaseText}>ACTIVA</Text>
                  </View>
                )}
              </View>
              <Text style={styles.phaseBreakdownPrice}>$0.40 USDT</Text>
              <Text style={styles.phaseBreakdownAllocation}>
                {phaseData.phase1TokensSold.toLocaleString()} / {phaseData.phase1Allocation.toLocaleString()} MXI
              </Text>
            </View>

            <View style={[styles.phaseBreakdownItem, phaseData.currentPhase === 2 && styles.phaseBreakdownActive]}>
              <View style={styles.phaseBreakdownHeader}>
                <Text style={styles.phaseBreakdownTitle}>Fase 2</Text>
                {phaseData.currentPhase === 2 && (
                  <View style={styles.activePhaseIndicator}>
                    <Text style={styles.activePhaseText}>ACTIVA</Text>
                  </View>
                )}
              </View>
              <Text style={styles.phaseBreakdownPrice}>$0.70 USDT</Text>
              <Text style={styles.phaseBreakdownAllocation}>
                {phaseData.phase2TokensSold.toLocaleString()} / {phaseData.phase2Allocation.toLocaleString()} MXI
              </Text>
            </View>

            <View style={[styles.phaseBreakdownItem, phaseData.currentPhase === 3 && styles.phaseBreakdownActive]}>
              <View style={styles.phaseBreakdownHeader}>
                <Text style={styles.phaseBreakdownTitle}>Fase 3</Text>
                {phaseData.currentPhase === 3 && (
                  <View style={styles.activePhaseIndicator}>
                    <Text style={styles.activePhaseText}>ACTIVA</Text>
                  </View>
                )}
              </View>
              <Text style={styles.phaseBreakdownPrice}>$1.00 USDT</Text>
              <Text style={styles.phaseBreakdownAllocation}>
                {phaseData.phase3TokensSold.toLocaleString()} / {phaseData.phase3Allocation.toLocaleString()} MXI
              </Text>
            </View>
          </View>
        </View>
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
  },
  historyButton: {
    padding: 4,
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
    marginBottom: 16,
  },
  phaseProgress: {
    marginTop: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 12,
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
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  purchaseButtonDisabled: {
    opacity: 0.5,
  },
  purchaseButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  purchaseNotes: {
    gap: 4,
  },
  minPurchaseNote: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  ordersCard: {
    marginBottom: 16,
  },
  ordersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ordersTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  orderItem: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderStatus: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  orderStatusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  orderDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
  },
  orderActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  orderActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.highlight,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  orderActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  orderExpiry: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  infoCard: {
    marginBottom: 16,
    backgroundColor: `${colors.primary}10`,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  infoList: {
    gap: 12,
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
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  phasesCard: {
    marginBottom: 16,
  },
  phasesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  phaseBreakdown: {
    gap: 12,
  },
  phaseBreakdownItem: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  phaseBreakdownActive: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  phaseBreakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  phaseBreakdownTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  activePhaseIndicator: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activePhaseText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  phaseBreakdownPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 4,
  },
  phaseBreakdownAllocation: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
