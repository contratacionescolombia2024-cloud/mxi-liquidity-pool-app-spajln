
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
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import * as WebBrowser from 'expo-web-browser';

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
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
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
  inputLabel: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#0A0A0A',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 12,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  calculationLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  calculationValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  payButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  payButtonDisabled: {
    backgroundColor: '#333333',
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  payButtonTextDisabled: {
    color: '#666666',
  },
  warningCard: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
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
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
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
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  phaseInfoCard: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  phaseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  phaseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  phaseLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  phaseValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  phaseDivider: {
    height: 1,
    backgroundColor: colors.primary + '30',
    marginVertical: 8,
  },
});

export default function ContratacionesScreen() {
  const router = useRouter();
  const { user, getPhaseInfo } = useAuth();
  const [currentPrice, setCurrentPrice] = useState(0.40);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [amount, setAmount] = useState('');
  const [mxiAmount, setMxiAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [phaseInfo, setPhaseInfo] = useState<any>(null);

  useEffect(() => {
    loadPhaseInfo();
    loadRecentPayments();

    // Subscribe to payment updates
    const channel = supabase
      .channel('payment-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          console.log('Payment update received:', payload);
          loadRecentPayments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [user]);

  useEffect(() => {
    if (amount) {
      const numAmount = parseFloat(amount);
      if (!isNaN(numAmount)) {
        setMxiAmount(numAmount / currentPrice);
      } else {
        setMxiAmount(0);
      }
    } else {
      setMxiAmount(0);
    }
  }, [amount, currentPrice]);

  const loadPhaseInfo = async () => {
    try {
      const info = await getPhaseInfo();
      if (info) {
        setCurrentPrice(info.currentPriceUsdt);
        setCurrentPhase(info.currentPhase);
        setPhaseInfo(info);
        console.log('Phase info loaded:', info);
      }
    } catch (error) {
      console.error('Error loading phase info:', error);
    }
  };

  const loadRecentPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentPayments(data || []);
    } catch (error) {
      console.error('Error loading payments:', error);
    }
  };

  const handleCreatePayment = async () => {
    if (!amount || parseFloat(amount) < 3) {
      Alert.alert('Error', 'El monto mínimo es 3 USDT');
      return;
    }

    if (parseFloat(amount) > 500000) {
      Alert.alert('Error', 'El monto máximo es 500,000 USDT');
      return;
    }

    setLoading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        Alert.alert('Error', 'Debes iniciar sesión para continuar');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/create-payment-intent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionData.session.access_token}`,
          },
          body: JSON.stringify({
            amount_fiat: parseFloat(amount),
            fiat_currency: 'usd',
            crypto_currency: 'usdteth',
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al crear el pago');
      }

      console.log('Payment created:', result.payment);

      // Open payment URL
      if (result.payment.invoice_url) {
        const supported = await Linking.canOpenURL(result.payment.invoice_url);
        
        if (supported) {
          await WebBrowser.openBrowserAsync(result.payment.invoice_url);
        } else {
          Alert.alert('Error', 'No se pudo abrir el navegador');
        }

        // Start polling for status updates
        startPolling(result.payment.order_id);

        Alert.alert(
          'Pago Creado',
          'Se ha abierto la página de pago. Completa el pago y regresa a la app para ver el estado.',
          [{ text: 'OK' }]
        );

        setAmount('');
        loadRecentPayments();
      }
    } catch (error: any) {
      console.error('Error creating payment:', error);
      Alert.alert('Error', error.message || 'No se pudo crear el pago');
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (orderId: string) => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    const interval = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .eq('order_id', orderId)
          .single();

        if (error) throw error;

        if (data && (data.status === 'finished' || data.status === 'failed' || data.status === 'expired')) {
          clearInterval(interval);
          setPollingInterval(null);
          loadRecentPayments();

          if (data.status === 'finished') {
            Alert.alert(
              '¡Pago Completado!',
              `Has recibido ${parseFloat(data.mxi_amount).toFixed(2)} MXI tokens`,
              [{ text: 'OK' }]
            );
          }
        }
      } catch (error) {
        console.error('Error polling payment status:', error);
      }
    }, 5000); // Poll every 5 seconds

    setPollingInterval(interval);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'finished':
      case 'confirmed':
        return '#4CAF50';
      case 'waiting':
      case 'pending':
        return colors.primary;
      case 'confirming':
        return '#2196F3';
      case 'failed':
      case 'expired':
      case 'cancelled':
        return '#F44336';
      default:
        return '#666666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'finished':
        return 'Completado';
      case 'confirmed':
        return 'Confirmado';
      case 'waiting':
        return 'Esperando';
      case 'pending':
        return 'Pendiente';
      case 'confirming':
        return 'Confirmando';
      case 'failed':
        return 'Fallido';
      case 'expired':
        return 'Expirado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getPhasePriceLabel = (phase: number) => {
    switch (phase) {
      case 1:
        return '0.40 USDT';
      case 2:
        return '0.70 USDT';
      case 3:
        return '1.00 USDT';
      default:
        return '0.40 USDT';
    }
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
        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>⚠️ Importante</Text>
          <Text style={styles.warningText}>
            • Los pagos se procesan con USDT en la red Ethereum (ERC20){'\n'}
            • Asegúrate de usar la red correcta al pagar{'\n'}
            • El pago expira en 1 hora{'\n'}
            • Los tokens se acreditan automáticamente al confirmar
          </Text>
        </View>

        <View style={styles.phaseInfoCard}>
          <Text style={styles.phaseTitle}>🚀 Fase Actual de Preventa</Text>
          <View style={styles.phaseRow}>
            <Text style={styles.phaseLabel}>Fase Activa:</Text>
            <Text style={styles.phaseValue}>Fase {currentPhase} de 3</Text>
          </View>
          <View style={styles.phaseRow}>
            <Text style={styles.phaseLabel}>Precio Actual:</Text>
            <Text style={styles.phaseValue}>{currentPrice.toFixed(2)} USDT por MXI</Text>
          </View>
          <View style={styles.phaseDivider} />
          <View style={styles.phaseRow}>
            <Text style={styles.phaseLabel}>Fase 1:</Text>
            <Text style={styles.phaseValue}>0.40 USDT</Text>
          </View>
          <View style={styles.phaseRow}>
            <Text style={styles.phaseLabel}>Fase 2:</Text>
            <Text style={styles.phaseValue}>0.70 USDT</Text>
          </View>
          <View style={styles.phaseRow}>
            <Text style={styles.phaseLabel}>Fase 3:</Text>
            <Text style={styles.phaseValue}>1.00 USDT</Text>
          </View>
          {phaseInfo && (
            <React.Fragment>
              <View style={styles.phaseDivider} />
              <View style={styles.phaseRow}>
                <Text style={styles.phaseLabel}>Tokens Vendidos:</Text>
                <Text style={styles.phaseValue}>
                  {phaseInfo.totalTokensSold.toLocaleString()} MXI
                </Text>
              </View>
              {currentPhase < 3 && (
                <View style={styles.phaseRow}>
                  <Text style={styles.phaseLabel}>Hasta Siguiente Fase:</Text>
                  <Text style={styles.phaseValue}>
                    {phaseInfo.tokensUntilNextPhase.toLocaleString()} MXI
                  </Text>
                </View>
              )}
            </React.Fragment>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Realizar Pago</Text>
          
          <Text style={styles.inputLabel}>Monto en USDT (mín: 3, máx: 500,000)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa el monto"
            placeholderTextColor="#666666"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            editable={!loading}
          />

          {mxiAmount > 0 && (
            <View style={styles.calculationRow}>
              <Text style={styles.calculationLabel}>Recibirás:</Text>
              <Text style={styles.calculationValue}>{mxiAmount.toFixed(2)} MXI</Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.payButton,
              (loading || !amount || parseFloat(amount) < 3) && styles.payButtonDisabled,
            ]}
            onPress={handleCreatePayment}
            disabled={loading || !amount || parseFloat(amount) < 3}
          >
            {loading ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text
                style={[
                  styles.payButtonText,
                  (loading || !amount || parseFloat(amount) < 3) && styles.payButtonTextDisabled,
                ]}
              >
                Pagar con USDT (ETH)
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {recentPayments.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Pagos Recientes</Text>
            {recentPayments.map((payment, index) => (
              <View key={index} style={styles.statusCard}>
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Monto:</Text>
                  <Text style={styles.statusValue}>
                    {parseFloat(payment.price_amount).toFixed(2)} USDT
                  </Text>
                </View>
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>MXI:</Text>
                  <Text style={styles.statusValue}>
                    {parseFloat(payment.mxi_amount).toFixed(2)} MXI
                  </Text>
                </View>
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Precio:</Text>
                  <Text style={styles.statusValue}>
                    {parseFloat(payment.price_per_mxi).toFixed(2)} USDT/MXI
                  </Text>
                </View>
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Fase:</Text>
                  <Text style={styles.statusValue}>
                    Fase {payment.phase}
                  </Text>
                </View>
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Estado:</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(payment.status) },
                    ]}
                  >
                    <Text style={[styles.statusBadgeText, { color: '#FFFFFF' }]}>
                      {getStatusText(payment.status)}
                    </Text>
                  </View>
                </View>
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Fecha:</Text>
                  <Text style={styles.statusValue}>
                    {new Date(payment.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Beneficios del Pool</Text>
          <Text style={styles.infoText}>
            • Recibe MXI tokens por tu participación
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
            • Acceso anticipado al lanzamiento oficial
          </Text>
          <Text style={styles.infoText}>
            • Precio preferencial en preventa (aumenta por fase)
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
