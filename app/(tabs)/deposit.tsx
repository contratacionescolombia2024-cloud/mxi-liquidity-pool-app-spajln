
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
import * as Clipboard2 from 'expo-clipboard';
import type { RealtimeChannel } from '@supabase/supabase-js';

const MIN_USDT = 3;
const MAX_USDT = 500000;
const MIN_USDT_DIRECT = 20;
const MXI_RATE = 2.5;
const RECIPIENT_ADDRESS = '0x68F0d7c607617DA0b1a0dC7b72885E11ddFec623';

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

interface DebugLog {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

const NETWORKS = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    label: 'ERC20',
    color: '#627EEA',
    icon: 'Ξ',
    description: 'Red Ethereum - Validación independiente'
  },
  {
    id: 'bnb',
    name: 'BNB Chain',
    label: 'BEP20',
    color: '#F3BA2F',
    icon: 'B',
    description: 'Red BNB Chain - Validación independiente'
  },
  {
    id: 'polygon',
    name: 'Polygon',
    label: 'Matic',
    color: '#8247E5',
    icon: 'P',
    description: 'Red Polygon - Validación independiente'
  }
];

export default function DepositScreen() {
  const router = useRouter();
  const { user, session, getPhaseInfo } = useAuth();
  
  // NOWPayments state
  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCurrencies, setLoadingCurrencies] = useState(false);
  const [mxiAmount, setMxiAmount] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(0.40);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [phaseInfo, setPhaseInfo] = useState<any>(null);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel | null>(null);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);
  const [showDebugLogs, setShowDebugLogs] = useState(false);

  // Direct USDT payment state
  const [showDirectPayment, setShowDirectPayment] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState('ethereum');
  const [txHash, setTxHash] = useState('');
  const [loadingTx, setLoadingTx] = useState(false);
  const [directUsdtAmount, setDirectUsdtAmount] = useState('');
  const [directMxiAmount, setDirectMxiAmount] = useState(0);

  useEffect(() => {
    loadPhaseInfo();
    loadRecentPayments();
    
    return () => {
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

  useEffect(() => {
    if (directUsdtAmount && !isNaN(parseFloat(directUsdtAmount))) {
      const usdtAmount = parseFloat(directUsdtAmount);
      const mxi = usdtAmount * MXI_RATE;
      setDirectMxiAmount(mxi);
    } else {
      setDirectMxiAmount(0);
    }
  }, [directUsdtAmount]);

  const addDebugLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const timestamp = new Date().toISOString();
    const log: DebugLog = { timestamp, message, type };
    setDebugLogs(prev => [...prev, log]);
    console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
  };

  const loadPhaseInfo = async () => {
    try {
      addDebugLog('Loading phase info...', 'info');
      const info = await getPhaseInfo();
      if (info) {
        setCurrentPrice(info.currentPriceUsdt);
        setCurrentPhase(info.currentPhase);
        setPhaseInfo(info);
        addDebugLog(`Phase ${info.currentPhase} loaded: Price = ${info.currentPriceUsdt} USDT`, 'success');
      }
    } catch (error: any) {
      console.error('Error loading phase info:', error);
      addDebugLog(`Error loading phase info: ${error.message}`, 'error');
    }
  };

  const loadRecentPayments = async () => {
    try {
      addDebugLog('Loading recent payments...', 'info');
      
      if (!user?.id) {
        return;
      }

      const { data: payments, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error loading payments:', error);
        return;
      }

      if (payments && payments.length > 0) {
        const latestPayment = payments[0];
        
        if (latestPayment.status === 'waiting' || latestPayment.status === 'pending' || latestPayment.status === 'confirming') {
          setPaymentStatus({
            id: latestPayment.id,
            order_id: latestPayment.order_id,
            status: latestPayment.status,
            payment_status: latestPayment.payment_status || latestPayment.status,
            price_amount: latestPayment.price_amount,
            pay_currency: latestPayment.pay_currency,
            actually_paid: latestPayment.actually_paid || 0,
            invoice_url: latestPayment.invoice_url,
            created_at: latestPayment.created_at,
            updated_at: latestPayment.updated_at,
          });
          
          await subscribeToPaymentUpdates(latestPayment.order_id);
          
          addDebugLog(`Found pending payment: ${latestPayment.order_id}`, 'info');
        }
      }
    } catch (error: any) {
      console.error('Error loading recent payments:', error);
      addDebugLog(`Error loading recent payments: ${error.message}`, 'error');
    }
  };

  const subscribeToPaymentUpdates = async (orderId: string) => {
    console.log('\n========== SUBSCRIBING TO REALTIME ==========');
    console.log('Order ID:', orderId);
    addDebugLog(`Subscribing to payment updates for order: ${orderId}`, 'info');

    try {
      if (realtimeChannel) {
        console.log('Unsubscribing from previous channel');
        await realtimeChannel.unsubscribe();
      }

      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession?.access_token) {
        console.error('No session token available');
        addDebugLog('ERROR: No session token available', 'error');
        return;
      }

      console.log('Setting Realtime auth token');
      await supabase.realtime.setAuth(currentSession.access_token);

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
            addDebugLog(`Realtime update: ${payload.eventType}`, 'info');

            if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
              const record = payload.new as any;
              console.log('Payment status updated:', record.status);
              addDebugLog(`Payment status: ${record.status}`, 'info');
              
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

              if (record.status === 'paid' || record.status === 'confirmed' || record.status === 'finished') {
                console.log('Payment confirmed!');
                addDebugLog('✅ Payment confirmed!', 'success');
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
                
                if (realtimeChannel) {
                  realtimeChannel.unsubscribe();
                  setRealtimeChannel(null);
                  setIsRealtimeConnected(false);
                }
              } else if (record.status === 'failed' || record.status === 'expired') {
                console.log('Payment failed/expired');
                addDebugLog(`❌ Payment ${record.status}`, 'error');
                Alert.alert(
                  'Pago No Completado',
                  `El pago ha ${record.status === 'failed' ? 'fallado' : 'expirado'}. Por favor intenta nuevamente.`,
                  [{ text: 'OK' }]
                );
                
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
          addDebugLog(`Realtime status: ${status}`, status === 'SUBSCRIBED' ? 'success' : 'warning');
          
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
    } catch (error: any) {
      console.error('Error setting up Realtime subscription:', error);
      addDebugLog(`Error setting up Realtime: ${error.message}`, 'error');
      setIsRealtimeConnected(false);
    }
  };

  const loadCurrencies = async () => {
    console.log('\n========== LOAD CURRENCIES ==========');
    addDebugLog('Loading currencies...', 'info');
    
    if (!session?.access_token) {
      Alert.alert('Error', 'Por favor inicia sesión para continuar');
      addDebugLog('ERROR: No session token', 'error');
      return;
    }

    const usdtAmount = parseFloat(amount);
    if (isNaN(usdtAmount) || usdtAmount < MIN_USDT || usdtAmount > MAX_USDT) {
      Alert.alert(
        'Monto inválido',
        `El monto debe estar entre ${MIN_USDT} y ${MAX_USDT} USDT`
      );
      addDebugLog(`ERROR: Invalid amount ${amount}`, 'error');
      return;
    }

    setLoadingCurrencies(true);

    try {
      const orderId = `MXI-${Date.now()}-${user?.id.substring(0, 8)}`;
      
      console.log('Order ID:', orderId);
      console.log('Amount:', usdtAmount);
      addDebugLog(`Order ID: ${orderId}`, 'info');
      addDebugLog(`Amount: ${usdtAmount} USDT`, 'info');

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
      addDebugLog(`${availableCurrencies.length} currencies available`, 'success');
      setCurrencies(availableCurrencies);
      setCurrentOrderId(orderId);
      setShowCurrencyModal(true);
    } catch (error: any) {
      console.error('Error loading currencies:', error);
      addDebugLog(`ERROR: ${error.message}`, 'error');
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
    addDebugLog(`Opening payment URL...`, 'info');

    try {
      console.log('Attempting to open with WebBrowser...');
      const result = await WebBrowser.openBrowserAsync(url, {
        dismissButtonStyle: 'close',
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        controlsColor: colors.primary,
        toolbarColor: '#000000',
      });
      
      console.log('WebBrowser result:', result);
      addDebugLog(`WebBrowser result: ${result.type}`, 'info');

      if (result.type === 'opened') {
        console.log('✅ Browser opened successfully');
        addDebugLog('✅ Browser opened', 'success');
        return true;
      } else if (result.type === 'cancel') {
        console.log('⚠️ User cancelled browser');
        addDebugLog('⚠️ User cancelled', 'warning');
        return false;
      }
    } catch (browserError: any) {
      console.error('❌ WebBrowser error:', browserError);
      addDebugLog(`WebBrowser error: ${browserError.message}`, 'error');
      
      try {
        console.log('Attempting fallback with Linking...');
        const canOpen = await Linking.canOpenURL(url);
        
        if (canOpen) {
          await Linking.openURL(url);
          console.log('✅ Opened with Linking');
          addDebugLog('✅ Opened with Linking', 'success');
          return true;
        } else {
          console.error('❌ Cannot open URL with Linking');
          addDebugLog('❌ Cannot open URL', 'error');
          throw new Error('No se puede abrir el navegador');
        }
      } catch (linkingError: any) {
        console.error('❌ Linking error:', linkingError);
        addDebugLog(`Linking error: ${linkingError.message}`, 'error');
        throw linkingError;
      }
    }

    return false;
  };

  const handlePayment = async () => {
    console.log('\n========== INICIANDO PROCESO DE PAGO ==========');
    addDebugLog('=== INICIANDO PROCESO DE PAGO ===', 'info');
    addDebugLog(`Monto: ${amount} USDT`, 'info');
    
    console.log('Selected currency:', selectedCurrency);
    addDebugLog(`Step 1: Obteniendo sesión de usuario...`, 'info');

    if (!selectedCurrency) {
      Alert.alert('Error', 'Por favor selecciona una criptomoneda');
      addDebugLog('ERROR: No currency selected', 'error');
      return;
    }

    if (!session?.access_token) {
      Alert.alert('Error', 'Por favor inicia sesión para continuar');
      addDebugLog('ERROR: No session token', 'error');
      return;
    }

    addDebugLog('✅ Sesión obtenida', 'success');

    if (!currentOrderId) {
      Alert.alert('Error', 'No se pudo generar el ID de orden');
      addDebugLog('ERROR: No order ID', 'error');
      return;
    }

    const usdtAmount = parseFloat(amount);

    if (isNaN(usdtAmount) || usdtAmount < MIN_USDT || usdtAmount > MAX_USDT) {
      Alert.alert(
        'Monto inválido',
        `El monto debe estar entre ${MIN_USDT} y ${MAX_USDT} USDT`
      );
      addDebugLog(`ERROR: Invalid amount ${amount}`, 'error');
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
      addDebugLog('Step 2: Creando intención de pago...', 'info');
      addDebugLog(`Moneda seleccionada: ${selectedCurrency}`, 'info');

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
      addDebugLog(`Step 3: Respuesta recibida (Status: ${response.status})`, response.ok ? 'success' : 'error');

      const responseText = await response.text();
      console.log('Payment response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        addDebugLog(`ERROR: Invalid JSON response`, 'error');
        addDebugLog(`Response: ${responseText.substring(0, 200)}`, 'error');
        throw new Error(`El servidor devolvió una respuesta inválida. Por favor intenta nuevamente o contacta al soporte.`);
      }

      console.log('Parsed response:', JSON.stringify(data, null, 2));

      if (!response.ok || !data.success) {
        addDebugLog(`ERROR: ${data.error || 'Unknown error'}`, 'error');
        if (data.requestId) {
          addDebugLog(`Request ID: ${data.requestId}`, 'error');
        }
        
        let errorMessage = data.error || 'Error al crear el pago';
        if (data.details) {
          console.error('Error details:', data.details);
          addDebugLog(`Details: ${JSON.stringify(data.details)}`, 'error');
          
          if (data.details.message) {
            errorMessage += `\n\nDetalles: ${data.details.message}`;
          }
        }
        
        throw new Error(errorMessage);
      }

      if (!data.intent?.invoice_url) {
        console.error('No invoice_url in response:', data);
        addDebugLog('ERROR: No invoice URL in response', 'error');
        throw new Error('No se pudo obtener la URL de pago. Por favor intenta nuevamente.');
      }

      const invoiceUrl = data.intent.invoice_url;
      
      console.log('✅ Invoice URL received:', invoiceUrl);
      addDebugLog('✅ Invoice creado exitosamente', 'success');
      addDebugLog(`Payment ID: ${data.intent.payment_id}`, 'info');

      setShowCurrencyModal(false);

      addDebugLog('Step 4: Configurando actualizaciones en tiempo real...', 'info');
      await subscribeToPaymentUpdates(currentOrderId);

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

      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('🌐 Attempting to open payment URL...');
      addDebugLog('Step 5: Abriendo página de pago...', 'info');
      
      const opened = await openPaymentUrl(invoiceUrl);

      if (opened) {
        Alert.alert(
          'Pago Iniciado',
          'Se ha abierto la página de pago de NOWPayments. Completa el pago y el estado se actualizará automáticamente en tiempo real.',
          [{ text: 'OK' }]
        );
        addDebugLog('✅ Página de pago abierta exitosamente', 'success');
      } else {
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
        addDebugLog('⚠️ No se pudo abrir automáticamente', 'warning');
      }

    } catch (error: any) {
      console.error('❌ Payment error:', error);
      addDebugLog(`❌ ERROR: ${error.message}`, 'error');
      
      Alert.alert(
        'Error al Procesar Pago',
        error.message || 'Ocurrió un error al procesar el pago. Por favor intenta nuevamente.',
        [
          {
            text: 'Ver Detalles',
            onPress: () => setShowDebugLogs(true),
          },
          {
            text: 'OK',
            style: 'cancel',
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = async () => {
    try {
      await Clipboard2.setStringAsync(RECIPIENT_ADDRESS);
      Alert.alert('✅ Copiado', 'Dirección copiada al portapapeles');
    } catch (error) {
      console.error('Error copying:', error);
    }
  };

  const handleVerifyPayment = async () => {
    if (!txHash.trim()) {
      Alert.alert('Error', 'Por favor ingresa el hash de la transacción');
      return;
    }

    if (!txHash.startsWith('0x') || txHash.length !== 66) {
      Alert.alert(
        'Hash Inválido',
        'El hash de transacción debe comenzar con 0x y tener 66 caracteres'
      );
      return;
    }

    const selectedNetworkData = NETWORKS.find(n => n.id === selectedNetwork);

    Alert.alert(
      '⚠️ Confirmar Red',
      `¿Estás seguro de que la transacción fue realizada en ${selectedNetworkData?.name} (${selectedNetworkData?.label})?\n\nLa validación se hará SOLO en esta red.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Sí, verificar',
          onPress: () => performVerification()
        }
      ]
    );
  };

  const performVerification = async () => {
    setLoadingTx(true);

    try {
      const response = await fetch(
        'https://aeyfnjuatbtcauiumbhn.supabase.co/functions/v1/verificar-tx',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            txHash: txHash.trim(),
            userId: user?.id,
            network: selectedNetwork,
          }),
        }
      );

      const data = await response.json();

      if (data.ok) {
        Alert.alert(
          '✅ Pago Confirmado',
          `Se acreditaron ${data.mxi.toFixed(2)} MXI a tu cuenta.\n\nRed: ${data.network}\nUSDT pagados: ${data.usdt.toFixed(2)}`,
          [
            {
              text: 'Ver Saldo',
              onPress: () => router.push('/(tabs)/(home)/saldo-mxi'),
            },
            {
              text: 'OK',
              onPress: () => {
                setTxHash('');
                setShowDirectPayment(false);
              },
            },
          ]
        );
      } else {
        let errorMessage = '';
        
        switch (data.error) {
          case 'tx_not_found':
            errorMessage = `Transacción no encontrada en ${NETWORKS.find(n => n.id === selectedNetwork)?.name}.\n\nVerifica que:\n• El hash sea correcto\n• La transacción esté en la red ${NETWORKS.find(n => n.id === selectedNetwork)?.name}\n• La transacción tenga al menos 1 confirmación`;
            break;
          case 'pocas_confirmaciones':
            errorMessage = data.message || 'La transacción necesita más confirmaciones. Por favor intenta más tarde.';
            break;
          case 'monto_insuficiente':
            errorMessage = `El monto mínimo es ${MIN_USDT_DIRECT} USDT. ${data.message || ''}`;
            break;
          case 'ya_procesado':
            errorMessage = 'Esta transacción ya ha sido procesada anteriormente.';
            break;
          case 'no_transfer_found':
            errorMessage = `No se encontró una transferencia USDT válida a la dirección receptora en ${NETWORKS.find(n => n.id === selectedNetwork)?.name}.`;
            break;
          case 'tx_failed':
            errorMessage = 'La transacción falló en la blockchain.';
            break;
          case 'invalid_network':
            errorMessage = data.message || 'Red no válida seleccionada.';
            break;
          case 'rpc_not_configured':
            errorMessage = `⚠️ Error de Configuración del Servidor\n\n${data.message}\n\nContacta al administrador para configurar el RPC de esta red.`;
            break;
          case 'wrong_network':
            errorMessage = data.message || 'El RPC está conectado a la red incorrecta.';
            break;
          default:
            errorMessage = data.message || 'Error al verificar el pago. Por favor intenta nuevamente.';
        }

        Alert.alert('Error', errorMessage);
      }
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      Alert.alert(
        'Error de Conexión',
        'No se pudo conectar con el servidor. Por favor verifica tu conexión e intenta nuevamente.'
      );
    } finally {
      setLoadingTx(false);
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

  const isValidDirectAmount = () => {
    const usdtAmount = parseFloat(directUsdtAmount);
    return !isNaN(usdtAmount) && usdtAmount >= MIN_USDT_DIRECT;
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'success':
        return '#00FF00';
      case 'error':
        return '#FF0000';
      case 'warning':
        return '#FFA500';
      default:
        return '#00BFFF';
    }
  };

  const selectedNetworkData = NETWORKS.find(n => n.id === selectedNetwork);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Depositar</Text>
        <TouchableOpacity
          style={styles.debugButton}
          onPress={() => setShowDebugLogs(!showDebugLogs)}
        >
          <IconSymbol
            ios_icon_name="info.circle"
            android_material_icon_name="info"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
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

        <View style={styles.phaseCard}>
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

        {/* Payment Method Selector */}
        <View style={styles.methodSelector}>
          <TouchableOpacity
            style={[
              styles.methodButton,
              !showDirectPayment && styles.methodButtonActive
            ]}
            onPress={() => setShowDirectPayment(false)}
          >
            <IconSymbol
              ios_icon_name="creditcard.fill"
              android_material_icon_name="payment"
              size={24}
              color={!showDirectPayment ? '#000000' : colors.text}
            />
            <Text style={[
              styles.methodButtonText,
              !showDirectPayment && styles.methodButtonTextActive
            ]}>
              Pago con Cripto
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.methodButton,
              showDirectPayment && styles.methodButtonActive
            ]}
            onPress={() => setShowDirectPayment(true)}
          >
            <IconSymbol
              ios_icon_name="arrow.right.arrow.left.circle.fill"
              android_material_icon_name="swap_horiz"
              size={24}
              color={showDirectPayment ? '#000000' : colors.text}
            />
            <Text style={[
              styles.methodButtonText,
              showDirectPayment && styles.methodButtonTextActive
            ]}>
              Pago Directo USDT
            </Text>
          </TouchableOpacity>
        </View>

        {!showDirectPayment ? (
          <React.Fragment>
            {/* NOWPayments Section */}
            <View style={commonStyles.card}>
              <Text style={styles.sectionTitle}>Comprar MXI con Cripto</Text>
              
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
          </React.Fragment>
        ) : (
          <React.Fragment>
            {/* Direct USDT Payment Section */}
            <View style={[styles.networkCard, { borderColor: selectedNetworkData?.color }]}>
              <Text style={styles.networkTitle}>Selecciona la Red de Pago</Text>
              <Text style={styles.networkSubtitle}>
                Cada red valida sus transacciones de forma independiente
              </Text>
              <View style={styles.networkButtons}>
                {NETWORKS.map((network, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.networkButton,
                      selectedNetwork === network.id && {
                        backgroundColor: network.color + '30',
                        borderColor: network.color,
                        borderWidth: 2,
                      }
                    ]}
                    onPress={() => setSelectedNetwork(network.id)}
                  >
                    <View style={[styles.networkIcon, { backgroundColor: network.color }]}>
                      <Text style={styles.networkIconText}>{network.icon}</Text>
                    </View>
                    <View style={styles.networkInfo}>
                      <Text style={styles.networkName}>{network.name}</Text>
                      <Text style={styles.networkLabel}>{network.label}</Text>
                      <Text style={styles.networkDescription}>{network.description}</Text>
                    </View>
                    {selectedNetwork === network.id && (
                      <IconSymbol
                        ios_icon_name="checkmark.circle.fill"
                        android_material_icon_name="check_circle"
                        size={24}
                        color={network.color}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[styles.validationCard, { backgroundColor: selectedNetworkData?.color + '15', borderColor: selectedNetworkData?.color }]}>
              <View style={styles.validationHeader}>
                <IconSymbol
                  ios_icon_name="shield.checkmark.fill"
                  android_material_icon_name="verified_user"
                  size={32}
                  color={selectedNetworkData?.color}
                />
                <View style={styles.validationInfo}>
                  <Text style={[styles.validationTitle, { color: selectedNetworkData?.color }]}>
                    Validación en {selectedNetworkData?.name}
                  </Text>
                  <Text style={styles.validationText}>
                    Los pagos en {selectedNetworkData?.name} solo se validan en la red {selectedNetworkData?.name}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <IconSymbol
                  ios_icon_name="info.circle.fill"
                  android_material_icon_name="info"
                  size={32}
                  color={colors.primary}
                />
                <Text style={styles.infoTitle}>Instrucciones de Pago</Text>
              </View>
              
              <View style={styles.stepsList}>
                <View style={styles.stepItem}>
                  <Text style={styles.stepNumber}>1</Text>
                  <Text style={styles.stepText}>
                    Selecciona la red que vas a usar ({selectedNetworkData?.label})
                  </Text>
                </View>
                <View style={styles.stepItem}>
                  <Text style={styles.stepNumber}>2</Text>
                  <Text style={styles.stepText}>
                    Envía USDT desde cualquier wallet a la dirección receptora
                  </Text>
                </View>
                <View style={styles.stepItem}>
                  <Text style={styles.stepNumber}>3</Text>
                  <Text style={styles.stepText}>
                    Monto mínimo: {MIN_USDT_DIRECT} USDT
                  </Text>
                </View>
                <View style={styles.stepItem}>
                  <Text style={styles.stepNumber}>4</Text>
                  <Text style={styles.stepText}>
                    Copia el hash de la transacción (txHash)
                  </Text>
                </View>
                <View style={styles.stepItem}>
                  <Text style={styles.stepNumber}>5</Text>
                  <Text style={styles.stepText}>
                    Pega el txHash aquí y verifica el pago
                  </Text>
                </View>
                <View style={styles.stepItem}>
                  <Text style={styles.stepNumber}>6</Text>
                  <Text style={styles.stepText}>
                    Recibirás MXI = USDT × {MXI_RATE}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.addressCard}>
              <Text style={styles.addressLabel}>
                Dirección Receptora ({selectedNetworkData?.label})
              </Text>
              <View style={styles.addressContainer}>
                <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">
                  {RECIPIENT_ADDRESS}
                </Text>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={copyAddress}
                >
                  <IconSymbol
                    ios_icon_name="doc.on.doc.fill"
                    android_material_icon_name="content_copy"
                    size={20}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </View>
              <View style={[styles.addressWarningBox, { backgroundColor: selectedNetworkData?.color + '20' }]}>
                <IconSymbol
                  ios_icon_name="exclamationmark.triangle.fill"
                  android_material_icon_name="warning"
                  size={20}
                  color={selectedNetworkData?.color}
                />
                <Text style={[styles.addressWarning, { color: selectedNetworkData?.color }]}>
                  ⚠️ Solo envía USDT en la red {selectedNetworkData?.name} ({selectedNetworkData?.label})
                </Text>
              </View>
            </View>

            {/* MXI Calculator */}
            <View style={styles.calculatorCard}>
              <Text style={styles.calculatorTitle}>💰 Calculadora de MXI</Text>
              <Text style={styles.calculatorSubtitle}>
                Calcula cuánto MXI recibirás por tu inversión en USDT
              </Text>
              
              <View style={styles.calculatorInputSection}>
                <Text style={styles.label}>Ingresa monto en USDT</Text>
                <TextInput
                  style={styles.calculatorInput}
                  placeholder="Ej: 100"
                  placeholderTextColor="#666666"
                  keyboardType="numeric"
                  value={directUsdtAmount}
                  onChangeText={setDirectUsdtAmount}
                />
                {directMxiAmount > 0 && (
                  <View style={styles.calculatorResult}>
                    <Text style={styles.calculatorResultLabel}>Recibirás:</Text>
                    <Text style={styles.calculatorResultValue}>
                      {directMxiAmount.toFixed(2)} MXI
                    </Text>
                    <Text style={styles.calculatorResultSubtext}>
                      (Tasa: 1 USDT = {MXI_RATE} MXI)
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.calculatorDivider} />

              <Text style={styles.calculatorExamplesTitle}>Ejemplos rápidos:</Text>
              <View style={styles.calculatorRow}>
                <Text style={styles.calculatorLabel}>{MIN_USDT_DIRECT} USDT</Text>
                <Text style={styles.calculatorArrow}>→</Text>
                <Text style={styles.calculatorValue}>{(MIN_USDT_DIRECT * MXI_RATE).toFixed(2)} MXI</Text>
              </View>
              <View style={styles.calculatorRow}>
                <Text style={styles.calculatorLabel}>50 USDT</Text>
                <Text style={styles.calculatorArrow}>→</Text>
                <Text style={styles.calculatorValue}>{(50 * MXI_RATE).toFixed(2)} MXI</Text>
              </View>
              <View style={styles.calculatorRow}>
                <Text style={styles.calculatorLabel}>100 USDT</Text>
                <Text style={styles.calculatorArrow}>→</Text>
                <Text style={styles.calculatorValue}>{(100 * MXI_RATE).toFixed(2)} MXI</Text>
              </View>
              <View style={styles.calculatorRow}>
                <Text style={styles.calculatorLabel}>500 USDT</Text>
                <Text style={styles.calculatorArrow}>→</Text>
                <Text style={styles.calculatorValue}>{(500 * MXI_RATE).toFixed(2)} MXI</Text>
              </View>
              <View style={styles.calculatorRow}>
                <Text style={styles.calculatorLabel}>1,000 USDT</Text>
                <Text style={styles.calculatorArrow}>→</Text>
                <Text style={styles.calculatorValue}>{(1000 * MXI_RATE).toFixed(2)} MXI</Text>
              </View>
            </View>

            <View style={styles.inputCard}>
              <Text style={styles.inputLabel}>Hash de Transacción (txHash)</Text>
              <TextInput
                style={styles.input}
                placeholder="0x..."
                placeholderTextColor="#666666"
                value={txHash}
                onChangeText={setTxHash}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loadingTx}
                multiline
                numberOfLines={3}
              />
              <Text style={styles.inputHint}>
                Pega el hash de tu transacción de {selectedNetworkData?.name} aquí
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.verifyButton,
                { backgroundColor: selectedNetworkData?.color || colors.primary },
                loadingTx && styles.verifyButtonDisabled
              ]}
              onPress={handleVerifyPayment}
              disabled={loadingTx || !txHash.trim()}
            >
              {loadingTx ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <React.Fragment>
                  <IconSymbol
                    ios_icon_name="checkmark.circle.fill"
                    android_material_icon_name="check_circle"
                    size={24}
                    color="#FFFFFF"
                  />
                  <Text style={styles.verifyButtonText}>
                    Verificar en {selectedNetworkData?.name}
                  </Text>
                </React.Fragment>
              )}
            </TouchableOpacity>

            <View style={styles.warningCard}>
              <IconSymbol
                ios_icon_name="exclamationmark.triangle.fill"
                android_material_icon_name="warning"
                size={24}
                color={colors.warning}
              />
              <View style={styles.warningContent}>
                <Text style={styles.warningTitle}>⚠️ Importante - Validación Multi-Red</Text>
                <Text style={styles.warningText}>
                  • Cada red valida sus transacciones de forma independiente
                </Text>
                <Text style={styles.warningText}>
                  • Los pagos en Ethereum solo se validan en la red Ethereum
                </Text>
                <Text style={styles.warningText}>
                  • Los pagos en BNB Chain solo se validan en la red BNB Chain
                </Text>
                <Text style={styles.warningText}>
                  • Los pagos en Polygon solo se validan en la red Polygon
                </Text>
                <Text style={styles.warningText}>
                  • Asegúrate de seleccionar la red correcta antes de verificar
                </Text>
                <Text style={styles.warningText}>
                  • La transacción debe tener al menos 3 confirmaciones
                </Text>
              </View>
            </View>
          </React.Fragment>
        )}

        {showDebugLogs && debugLogs.length > 0 && (
          <View style={[commonStyles.card, styles.debugCard]}>
            <View style={styles.debugHeader}>
              <Text style={styles.debugTitle}>Debug Log</Text>
              <TouchableOpacity
                style={styles.clearDebugButton}
                onPress={() => setDebugLogs([])}
              >
                <Text style={styles.clearDebugText}>Limpiar</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.debugScroll} nestedScrollEnabled>
              {debugLogs.slice(-30).map((log, index) => (
                <View key={index} style={styles.debugLogItem}>
                  <Text style={[styles.debugText, { color: getLogColor(log.type) }]}>
                    {getLogIcon(log.type)} [{new Date(log.timestamp).toLocaleTimeString()}] {log.message}
                  </Text>
                </View>
              ))}
            </ScrollView>
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
              <Text style={styles.infoText}>Elige tu método de pago preferido</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>2.</Text>
              <Text style={styles.infoText}>Pago con Cripto: Usa NOWPayments para pagar con múltiples criptomonedas</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>3.</Text>
              <Text style={styles.infoText}>Pago Directo USDT: Envía USDT directamente en Ethereum, BNB Chain o Polygon</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  debugButton: {
    padding: 8,
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
  phaseCard: {
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
  methodSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  methodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  methodButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  methodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  methodButtonTextActive: {
    color: '#000000',
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
  networkCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
  },
  networkTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  networkSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  networkButtons: {
    gap: 12,
  },
  networkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  networkIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  networkIconText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  networkInfo: {
    flex: 1,
    marginLeft: 12,
  },
  networkName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  networkLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  networkDescription: {
    fontSize: 10,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  validationCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
  },
  validationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  validationInfo: {
    flex: 1,
  },
  validationTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  validationText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  infoCard: {
    backgroundColor: colors.primary + '15',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  stepsList: {
    gap: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 28,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  addressCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
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
    marginBottom: 12,
  },
  addressText: {
    flex: 1,
    fontSize: 12,
    color: colors.text,
    fontFamily: 'monospace',
  },
  copyButton: {
    marginLeft: 8,
    padding: 4,
  },
  addressWarningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
  },
  addressWarning: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  calculatorCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  calculatorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  calculatorSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  calculatorInputSection: {
    backgroundColor: colors.primary + '15',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  calculatorInput: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  calculatorResult: {
    marginTop: 16,
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.primary + '20',
    borderRadius: 8,
  },
  calculatorResultLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  calculatorResultValue: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.primary,
    marginBottom: 4,
  },
  calculatorResultSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  calculatorDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  calculatorExamplesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  calculatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '30',
  },
  calculatorLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  calculatorArrow: {
    fontSize: 14,
    color: colors.primary,
    marginHorizontal: 12,
  },
  calculatorValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    flex: 1,
    textAlign: 'right',
  },
  inputCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  inputHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
  },
  verifyButton: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  verifyButtonDisabled: {
    opacity: 0.5,
  },
  verifyButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  warningCard: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.warning,
    marginBottom: 16,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.warning,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
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
  debugCard: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
  debugHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00FF00',
  },
  debugScroll: {
    maxHeight: 300,
  },
  debugLogItem: {
    marginBottom: 4,
  },
  debugText: {
    fontSize: 11,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  clearDebugButton: {
    padding: 4,
    paddingHorizontal: 8,
    backgroundColor: '#333',
    borderRadius: 4,
  },
  clearDebugText: {
    fontSize: 12,
    color: '#00FF00',
  },
});
