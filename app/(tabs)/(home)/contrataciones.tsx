
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
  Modal,
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
  errorModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorModalContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: '#F44336',
  },
  errorModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F44336',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorModalSection: {
    marginBottom: 16,
  },
  errorModalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  errorModalText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 20,
    fontFamily: 'monospace',
  },
  errorModalDivider: {
    height: 1,
    backgroundColor: '#333333',
    marginVertical: 12,
  },
  errorModalButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  errorModalButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  errorModalCopyButton: {
    backgroundColor: '#333333',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  errorModalCopyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  debugCard: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F44336',
    marginBottom: 12,
  },
  debugText: {
    fontSize: 12,
    color: colors.text,
    lineHeight: 18,
    fontFamily: 'monospace',
  },
  debugButton: {
    backgroundColor: '#F44336',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  debugButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

interface ErrorDetails {
  timestamp: string;
  errorMessage: string;
  statusCode?: number;
  requestUrl?: string;
  requestBody?: any;
  responseBody?: any;
  authToken?: string;
  userId?: string;
  stackTrace?: string;
}

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
  const [errorDetails, setErrorDetails] = useState<ErrorDetails | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setDebugLogs(prev => [...prev, logMessage].slice(-20)); // Keep last 20 logs
  };

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
          addDebugLog('Payment update received via Realtime');
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
      addDebugLog('Loading phase info...');
      const info = await getPhaseInfo();
      if (info) {
        setCurrentPrice(info.currentPriceUsdt);
        setCurrentPhase(info.currentPhase);
        setPhaseInfo(info);
        addDebugLog(`Phase info loaded: Phase ${info.currentPhase}, Price ${info.currentPriceUsdt} USDT`);
      }
    } catch (error) {
      console.error('Error loading phase info:', error);
      addDebugLog(`Error loading phase info: ${error}`);
    }
  };

  const loadRecentPayments = async () => {
    try {
      addDebugLog('Loading recent payments...');
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentPayments(data || []);
      addDebugLog(`Loaded ${data?.length || 0} recent payments`);
    } catch (error) {
      console.error('Error loading payments:', error);
      addDebugLog(`Error loading payments: ${error}`);
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
    setErrorDetails(null);
    addDebugLog('=== INICIANDO PROCESO DE PAGO ===');
    addDebugLog(`Monto: ${amount} USDT`);

    try {
      // Step 1: Get session
      addDebugLog('Step 1: Obteniendo sesión de usuario...');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        addDebugLog(`Error obteniendo sesión: ${sessionError.message}`);
        throw new Error(`Error de sesión: ${sessionError.message}`);
      }

      if (!sessionData.session) {
        addDebugLog('No hay sesión activa');
        Alert.alert('Error', 'Debes iniciar sesión para continuar');
        setLoading(false);
        return;
      }

      addDebugLog(`Sesión obtenida. User ID: ${sessionData.session.user.id}`);
      addDebugLog(`Token presente: ${sessionData.session.access_token ? 'Sí' : 'No'}`);

      // Step 2: Generate unique order ID
      const orderId = `${user?.id}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      addDebugLog(`Order ID generado: ${orderId}`);

      // Step 3: Prepare request
      const requestUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/create-payment-intent`;
      const requestBody = {
        order_id: orderId,
        price_amount: parseFloat(amount),
        price_currency: 'usd',
        pay_currency: 'usdteth',
      };

      addDebugLog('Step 2: Preparando solicitud...');
      addDebugLog(`URL: ${requestUrl}`);
      addDebugLog(`Body: ${JSON.stringify(requestBody)}`);

      // Step 4: Make request
      addDebugLog('Step 3: Enviando solicitud a Edge Function...');
      const startTime = Date.now();

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const endTime = Date.now();
      addDebugLog(`Respuesta recibida en ${endTime - startTime}ms`);
      addDebugLog(`Status Code: ${response.status} ${response.statusText}`);

      // Step 5: Parse response
      addDebugLog('Step 4: Parseando respuesta...');
      let result;
      try {
        const responseText = await response.text();
        addDebugLog(`Response Text (primeros 500 chars): ${responseText.substring(0, 500)}`);
        result = JSON.parse(responseText);
        addDebugLog(`Response JSON: ${JSON.stringify(result, null, 2)}`);
      } catch (parseError: any) {
        addDebugLog(`Error parseando JSON: ${parseError.message}`);
        throw new Error('Error al procesar la respuesta del servidor');
      }

      // Step 6: Check for errors
      if (!response.ok || !result.success) {
        addDebugLog('Step 5: Error en la respuesta');
        
        const errorDetail: ErrorDetails = {
          timestamp: new Date().toISOString(),
          errorMessage: result.error || result.message || 'Error desconocido',
          statusCode: response.status,
          requestUrl,
          requestBody,
          responseBody: result,
          authToken: sessionData.session.access_token.substring(0, 20) + '...',
          userId: sessionData.session.user.id,
        };

        setErrorDetails(errorDetail);
        setShowErrorModal(true);
        
        throw new Error(result.error || result.message || 'Error al crear el pago');
      }

      addDebugLog('Step 6: Pago creado exitosamente');
      addDebugLog(`Order ID: ${result.intent?.order_id}`);
      addDebugLog(`Invoice URL: ${result.intent?.invoice_url}`);

      // Step 7: Open payment URL
      if (result.intent?.invoice_url) {
        addDebugLog('Step 7: Abriendo URL de pago...');
        
        try {
          const supported = await Linking.canOpenURL(result.intent.invoice_url);
          addDebugLog(`URL soportada: ${supported}`);
          
          if (supported) {
            const browserResult = await WebBrowser.openBrowserAsync(result.intent.invoice_url, {
              dismissButtonStyle: 'close',
              presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
            });
            addDebugLog(`Browser result: ${browserResult.type}`);
          } else {
            addDebugLog('URL no soportada, intentando con Linking.openURL');
            await Linking.openURL(result.intent.invoice_url);
          }
        } catch (browserError: any) {
          addDebugLog(`Error abriendo navegador: ${browserError.message}`);
          Alert.alert(
            'Error al abrir navegador',
            `No se pudo abrir el navegador automáticamente. URL: ${result.intent.invoice_url}`,
            [
              { text: 'Copiar URL', onPress: () => {
                console.log('URL to copy:', result.intent.invoice_url);
              }},
              { text: 'OK' }
            ]
          );
        }

        // Start polling for status updates
        startPolling(result.intent.order_id);

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
      addDebugLog(`ERROR FINAL: ${error.message}`);
      
      if (!errorDetails) {
        const errorDetail: ErrorDetails = {
          timestamp: new Date().toISOString(),
          errorMessage: error.message || 'Error desconocido',
          stackTrace: error.stack,
        };
        setErrorDetails(errorDetail);
        setShowErrorModal(true);
      }
      
      Alert.alert('Error', error.message || 'No se pudo crear el pago');
    } finally {
      setLoading(false);
      addDebugLog('=== PROCESO DE PAGO FINALIZADO ===');
    }
  };

  const startPolling = (orderId: string) => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    addDebugLog(`Iniciando polling para order_id: ${orderId}`);

    const interval = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .eq('order_id', orderId)
          .single();

        if (error) throw error;

        if (data && (data.status === 'finished' || data.status === 'confirmed' || data.status === 'failed' || data.status === 'expired')) {
          addDebugLog(`Pago finalizado con estado: ${data.status}`);
          clearInterval(interval);
          setPollingInterval(null);
          loadRecentPayments();

          if (data.status === 'finished' || data.status === 'confirmed') {
            Alert.alert(
              '¡Pago Completado!',
              `Has recibido ${parseFloat(data.mxi_amount).toFixed(2)} MXI tokens`,
              [{ text: 'OK' }]
            );
          } else if (data.status === 'failed') {
            Alert.alert(
              'Pago Fallido',
              'El pago no se pudo completar. Por favor, intenta nuevamente.',
              [{ text: 'OK' }]
            );
          } else if (data.status === 'expired') {
            Alert.alert(
              'Pago Expirado',
              'El tiempo para completar el pago ha expirado. Por favor, crea un nuevo pago.',
              [{ text: 'OK' }]
            );
          }
        }
      } catch (error) {
        console.error('Error polling payment status:', error);
        addDebugLog(`Error en polling: ${error}`);
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

  const copyErrorDetails = () => {
    if (errorDetails) {
      const errorText = JSON.stringify(errorDetails, null, 2);
      console.log('Error details to copy:', errorText);
      Alert.alert('Detalles Copiados', 'Los detalles del error han sido copiados al log de la consola');
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
        {debugLogs.length > 0 && (
          <View style={styles.debugCard}>
            <Text style={styles.debugTitle}>🔍 Debug Log (Últimos eventos)</Text>
            {debugLogs.slice(-5).map((log, index) => (
              <Text key={index} style={styles.debugText}>{log}</Text>
            ))}
            <TouchableOpacity
              style={styles.debugButton}
              onPress={() => {
                console.log('=== FULL DEBUG LOG ===');
                debugLogs.forEach(log => console.log(log));
                Alert.alert('Debug Log', 'El log completo ha sido impreso en la consola');
              }}
            >
              <Text style={styles.debugButtonText}>Ver Log Completo en Consola</Text>
            </TouchableOpacity>
          </View>
        )}

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

      {/* Error Modal */}
      <Modal
        visible={showErrorModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.errorModal}>
          <ScrollView style={{ width: '100%', maxWidth: 400 }}>
            <View style={styles.errorModalContent}>
              <Text style={styles.errorModalTitle}>⚠️ Error de Pago</Text>

              {errorDetails && (
                <React.Fragment>
                  <View style={styles.errorModalSection}>
                    <Text style={styles.errorModalLabel}>Mensaje de Error:</Text>
                    <Text style={styles.errorModalText}>{errorDetails.errorMessage}</Text>
                  </View>

                  {errorDetails.statusCode && (
                    <View style={styles.errorModalSection}>
                      <Text style={styles.errorModalLabel}>Código de Estado HTTP:</Text>
                      <Text style={styles.errorModalText}>{errorDetails.statusCode}</Text>
                    </View>
                  )}

                  {errorDetails.requestUrl && (
                    <View style={styles.errorModalSection}>
                      <Text style={styles.errorModalLabel}>URL de Solicitud:</Text>
                      <Text style={styles.errorModalText}>{errorDetails.requestUrl}</Text>
                    </View>
                  )}

                  {errorDetails.requestBody && (
                    <View style={styles.errorModalSection}>
                      <Text style={styles.errorModalLabel}>Cuerpo de Solicitud:</Text>
                      <Text style={styles.errorModalText}>
                        {JSON.stringify(errorDetails.requestBody, null, 2)}
                      </Text>
                    </View>
                  )}

                  {errorDetails.responseBody && (
                    <View style={styles.errorModalSection}>
                      <Text style={styles.errorModalLabel}>Respuesta del Servidor:</Text>
                      <Text style={styles.errorModalText}>
                        {JSON.stringify(errorDetails.responseBody, null, 2)}
                      </Text>
                    </View>
                  )}

                  {errorDetails.userId && (
                    <View style={styles.errorModalSection}>
                      <Text style={styles.errorModalLabel}>User ID:</Text>
                      <Text style={styles.errorModalText}>{errorDetails.userId}</Text>
                    </View>
                  )}

                  {errorDetails.authToken && (
                    <View style={styles.errorModalSection}>
                      <Text style={styles.errorModalLabel}>Token (primeros 20 caracteres):</Text>
                      <Text style={styles.errorModalText}>{errorDetails.authToken}</Text>
                    </View>
                  )}

                  <View style={styles.errorModalSection}>
                    <Text style={styles.errorModalLabel}>Timestamp:</Text>
                    <Text style={styles.errorModalText}>{errorDetails.timestamp}</Text>
                  </View>

                  {errorDetails.stackTrace && (
                    <View style={styles.errorModalSection}>
                      <Text style={styles.errorModalLabel}>Stack Trace:</Text>
                      <Text style={styles.errorModalText}>{errorDetails.stackTrace}</Text>
                    </View>
                  )}

                  <View style={styles.errorModalDivider} />

                  <TouchableOpacity
                    style={styles.errorModalCopyButton}
                    onPress={copyErrorDetails}
                  >
                    <Text style={styles.errorModalCopyButtonText}>
                      Copiar Detalles a Consola
                    </Text>
                  </TouchableOpacity>
                </React.Fragment>
              )}

              <TouchableOpacity
                style={styles.errorModalButton}
                onPress={() => setShowErrorModal(false)}
              >
                <Text style={styles.errorModalButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
