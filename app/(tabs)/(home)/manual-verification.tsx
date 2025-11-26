
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import * as Clipboard2 from 'expo-clipboard';

const NETWORKS = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    label: 'ERC20',
    color: '#627EEA',
    icon: 'Ξ',
  },
  {
    id: 'bnb',
    name: 'BNB Chain',
    label: 'BEP20',
    color: '#F3BA2F',
    icon: 'B',
  },
  {
    id: 'polygon',
    name: 'Polygon',
    label: 'Matic',
    color: '#8247E5',
    icon: 'P',
  }
];

export default function ManualVerificationScreen() {
  const router = useRouter();
  const { user, session } = useAuth();
  
  // Payment history state
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [verificationRequests, setVerificationRequests] = useState<Map<string, any>>(new Map());
  
  // USDT verification state
  const [selectedNetwork, setSelectedNetwork] = useState('ethereum');
  const [txHash, setTxHash] = useState('');
  const [requestingManualVerification, setRequestingManualVerification] = useState(false);
  
  // Modal state
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedVerificationRequest, setSelectedVerificationRequest] = useState<any>(null);
  const [userResponse, setUserResponse] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'nowpayments' | 'usdt'>('nowpayments');

  useEffect(() => {
    if (user) {
      console.log('🔵 [ManualVerification] User logged in:', user.id);
      loadPayments();
      loadVerificationRequests();

      // Subscribe to payment updates
      const paymentsChannel = supabase
        .channel('manual-verification-payments')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'payments',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            console.log('🔵 [ManualVerification] Payment update received, reloading...');
            loadPayments();
          }
        )
        .subscribe();

      // Subscribe to verification request updates
      const verificationsChannel = supabase
        .channel('manual-verification-requests')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'manual_verification_requests',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            console.log('🔵 [ManualVerification] Verification request update received, reloading...');
            loadVerificationRequests();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(paymentsChannel);
        supabase.removeChannel(verificationsChannel);
      };
    }
  }, [user]);

  const loadPayments = async () => {
    if (!user) {
      console.log('⚠️ [ManualVerification] No user found, skipping payment load');
      return;
    }
    
    try {
      console.log('🔵 [ManualVerification] Loading payments for user:', user.id);
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .neq('status', 'cancelled')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [ManualVerification] Error loading payments:', error);
        throw error;
      }
      
      console.log('✅ [ManualVerification] Loaded payments:', data?.length || 0);
      setPayments(data || []);
    } catch (error) {
      console.error('❌ [ManualVerification] Error loading payments:', error);
      Alert.alert('Error', 'No se pudieron cargar los pagos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadVerificationRequests = async () => {
    if (!user) {
      console.log('⚠️ [ManualVerification] No user found, skipping verification requests load');
      return;
    }
    
    try {
      console.log('🔵 [ManualVerification] Loading verification requests for user:', user.id);
      const { data, error } = await supabase
        .from('manual_verification_requests')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ [ManualVerification] Error loading verification requests:', error);
        throw error;
      }

      console.log('✅ [ManualVerification] Loaded verification requests:', data?.length || 0);
      const requestsMap = new Map();
      (data || []).forEach((request: any) => {
        requestsMap.set(request.payment_id, request);
      });
      setVerificationRequests(requestsMap);
    } catch (error) {
      console.error('❌ [ManualVerification] Error loading verification requests:', error);
    }
  };

  const onRefresh = () => {
    console.log('🔵 [ManualVerification] Refreshing data...');
    setRefreshing(true);
    loadPayments();
    loadVerificationRequests();
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await Clipboard2.setStringAsync(text);
      Alert.alert('✅ Copiado', `${label} copiado al portapapeles`);
    } catch (error) {
      console.error('❌ [ManualVerification] Error copying:', error);
    }
  };

  const handleRequestNowPaymentsVerification = (payment: any) => {
    console.log('🟢🟢🟢 [ManualVerification] BUTTON PRESSED - handleRequestNowPaymentsVerification');
    console.log('🟢 [ManualVerification] Payment:', JSON.stringify(payment, null, 2));
    console.log('🟢 [ManualVerification] User:', user?.id);
    console.log('🟢 [ManualVerification] Session:', !!session);
    
    requestNowPaymentsVerification(payment);
  };

  const requestNowPaymentsVerification = async (payment: any) => {
    console.log('🟢 [ManualVerification] === REQUESTING NOWPAYMENTS VERIFICATION ===');
    console.log('🟢 [ManualVerification] Payment ID:', payment.id);
    console.log('🟢 [ManualVerification] Order ID:', payment.order_id);
    console.log('🟢 [ManualVerification] User ID:', user?.id);
    console.log('🟢 [ManualVerification] Session exists:', !!session);

    if (!user) {
      console.error('❌ [ManualVerification] No user found!');
      Alert.alert('Error', 'Usuario no autenticado');
      return;
    }

    if (!session) {
      console.error('❌ [ManualVerification] No session found!');
      Alert.alert('Error', 'Sesión no válida. Por favor, inicia sesión nuevamente.');
      return;
    }

    // Check if verification request already exists
    const existingRequest = verificationRequests.get(payment.id);
    if (existingRequest) {
      console.log('⚠️ [ManualVerification] Verification request already exists:', existingRequest);
      Alert.alert(
        'Solicitud Existente',
        `Ya existe una solicitud de verificación para este pago.\n\nEstado: ${existingRequest.status}\n\nPor favor, espera a que el administrador la revise.`
      );
      return;
    }

    Alert.alert(
      '📋 Solicitar Verificación Manual',
      `¿Deseas solicitar la verificación manual de este pago de NowPayments?\n\n` +
      `Monto: ${parseFloat(payment.price_amount).toFixed(2)} USDT\n` +
      `MXI: ${parseFloat(payment.mxi_amount).toFixed(2)} MXI\n` +
      `Orden: ${payment.order_id}\n\n` +
      `Un administrador revisará tu pago y lo aprobará manualmente. Este proceso puede tomar hasta 2 horas.`,
      [
        { 
          text: 'Cancelar', 
          style: 'cancel',
          onPress: () => console.log('🟡 [ManualVerification] User cancelled verification request')
        },
        {
          text: 'Solicitar',
          onPress: async () => {
            console.log('🟢 [ManualVerification] User confirmed, creating verification request...');
            try {
              const requestData = {
                payment_id: payment.id,
                user_id: user.id,
                order_id: payment.order_id,
                status: 'pending',
              };

              console.log('🟢 [ManualVerification] Inserting verification request:', JSON.stringify(requestData, null, 2));

              const { data, error } = await supabase
                .from('manual_verification_requests')
                .insert(requestData)
                .select()
                .single();

              if (error) {
                console.error('❌ [ManualVerification] Supabase error:', JSON.stringify(error, null, 2));
                throw error;
              }

              console.log('✅ [ManualVerification] Verification request created successfully:', JSON.stringify(data, null, 2));

              Alert.alert(
                '✅ Solicitud Enviada',
                `Tu solicitud de verificación manual ha sido enviada exitosamente.\n\n` +
                `Un administrador revisará tu pago en las próximas 2 horas.\n\n` +
                `Recibirás una notificación cuando tu pago sea verificado.`,
                [{ 
                  text: 'OK', 
                  onPress: () => {
                    console.log('🟢 [ManualVerification] Reloading verification requests...');
                    loadVerificationRequests();
                  }
                }]
              );
            } catch (error: any) {
              console.error('❌ [ManualVerification] === ERROR REQUESTING VERIFICATION ===');
              console.error('❌ [ManualVerification] Error object:', JSON.stringify(error, null, 2));
              console.error('❌ [ManualVerification] Error message:', error.message);
              console.error('❌ [ManualVerification] Error details:', error.details);
              console.error('❌ [ManualVerification] Error hint:', error.hint);
              console.error('❌ [ManualVerification] Error code:', error.code);
              
              Alert.alert(
                'Error', 
                `No se pudo enviar la solicitud de verificación.\n\n` +
                `Detalles: ${error.message || 'Error desconocido'}\n` +
                `Código: ${error.code || 'N/A'}\n\n` +
                `Por favor, intenta nuevamente o contacta al soporte.`
              );
            }
          },
        },
      ]
    );
  };

  const handleRequestUSDTVerification = () => {
    console.log('🟢🟢🟢 [ManualVerification] BUTTON PRESSED - handleRequestUSDTVerification');
    console.log('🟢 [ManualVerification] TX Hash:', txHash);
    console.log('🟢 [ManualVerification] Selected Network:', selectedNetwork);
    console.log('🟢 [ManualVerification] User:', user?.id);
    console.log('🟢 [ManualVerification] Session:', !!session);
    
    requestUSDTVerification();
  };

  const requestUSDTVerification = async () => {
    console.log('🟢 [ManualVerification] === REQUESTING USDT VERIFICATION ===');
    console.log('🟢 [ManualVerification] TX Hash:', txHash);
    console.log('🟢 [ManualVerification] Selected Network:', selectedNetwork);
    console.log('🟢 [ManualVerification] User ID:', user?.id);
    console.log('🟢 [ManualVerification] Session exists:', !!session);

    if (!user) {
      console.error('❌ [ManualVerification] No user found!');
      Alert.alert('Error', 'Usuario no autenticado');
      return;
    }

    if (!session) {
      console.error('❌ [ManualVerification] No session found!');
      Alert.alert('Error', 'Sesión no válida. Por favor, inicia sesión nuevamente.');
      return;
    }

    if (!txHash.trim()) {
      console.log('⚠️ [ManualVerification] Empty TX hash');
      Alert.alert('Error', 'Por favor ingresa el hash de la transacción');
      return;
    }

    if (!txHash.startsWith('0x') || txHash.length !== 66) {
      console.log('⚠️ [ManualVerification] Invalid TX hash format');
      Alert.alert(
        'Hash Inválido',
        'El hash de transacción debe comenzar con 0x y tener 66 caracteres\n\nHash actual: ' + txHash.length + ' caracteres'
      );
      return;
    }

    const selectedNetworkData = NETWORKS.find(n => n.id === selectedNetwork);
    console.log('🟢 [ManualVerification] Selected network data:', selectedNetworkData);

    Alert.alert(
      '📋 Solicitar Verificación Manual USDT',
      `¿Deseas enviar una solicitud de verificación manual al administrador?\n\n` +
      `Red: ${selectedNetworkData?.name} (${selectedNetworkData?.label})\n` +
      `Hash: ${txHash.substring(0, 10)}...${txHash.substring(txHash.length - 8)}\n\n` +
      `Un administrador revisará tu transacción y la aprobará manualmente. Este proceso puede tomar hasta 2 horas.`,
      [
        { 
          text: 'Cancelar', 
          style: 'cancel',
          onPress: () => console.log('🟡 [ManualVerification] User cancelled USDT verification request')
        },
        {
          text: 'Enviar Solicitud',
          onPress: async () => {
            console.log('🟢 [ManualVerification] User confirmed, processing USDT verification...');
            setRequestingManualVerification(true);

            try {
              // Check for duplicate hash
              console.log('🟢 [ManualVerification] Checking for duplicate hash...');
              const { data: existingPayments, error: duplicateError } = await supabase
                .from('payments')
                .select('id, order_id, user_id, estado, mxi')
                .eq('tx_hash', txHash.trim())
                .limit(1);

              if (duplicateError) {
                console.error('❌ [ManualVerification] Duplicate check error:', duplicateError);
                throw new Error('Error al verificar duplicados en la base de datos');
              }

              if (existingPayments && existingPayments.length > 0) {
                const existingPayment = existingPayments[0];
                console.log('⚠️ [ManualVerification] Duplicate hash found:', existingPayment);
                Alert.alert(
                  '⚠️ Hash Duplicado',
                  `Este hash de transacción ya ha sido registrado anteriormente.\n\n` +
                  `Orden: ${existingPayment.order_id}\n` +
                  `Estado: ${existingPayment.estado}\n\n` +
                  `No puedes usar el mismo hash de transacción dos veces.`
                );
                setRequestingManualVerification(false);
                return;
              }

              console.log('✅ [ManualVerification] No duplicate found, creating payment record...');

              // Create payment record
              const orderId = `MXI-MANUAL-${Date.now()}`;
              console.log('🟢 [ManualVerification] Generated order ID:', orderId);

              const paymentData = {
                user_id: user.id,
                order_id: orderId,
                tx_hash: txHash.trim(),
                price_amount: 0,
                price_currency: 'usd',
                pay_currency: selectedNetworkData?.label.toLowerCase() || 'eth',
                mxi_amount: 0,
                price_per_mxi: 0.40,
                phase: 1,
                status: 'pending',
                estado: 'pending',
              };

              console.log('🟢 [ManualVerification] Inserting payment:', JSON.stringify(paymentData, null, 2));

              const { data: insertedPayment, error: paymentError } = await supabase
                .from('payments')
                .insert(paymentData)
                .select()
                .single();

              if (paymentError) {
                console.error('❌ [ManualVerification] Payment insert error:', JSON.stringify(paymentError, null, 2));
                throw paymentError;
              }

              console.log('✅ [ManualVerification] Payment created successfully:', JSON.stringify(insertedPayment, null, 2));

              // Create manual verification request
              const verificationData = {
                payment_id: insertedPayment.id,
                user_id: user.id,
                order_id: orderId,
                status: 'pending',
              };

              console.log('🟢 [ManualVerification] Inserting verification request:', JSON.stringify(verificationData, null, 2));

              const { error: verificationError } = await supabase
                .from('manual_verification_requests')
                .insert(verificationData);

              if (verificationError) {
                console.error('❌ [ManualVerification] Verification request insert error:', JSON.stringify(verificationError, null, 2));
                throw verificationError;
              }

              console.log('✅ [ManualVerification] Verification request created successfully');

              Alert.alert(
                '✅ Solicitud Enviada',
                `Tu solicitud de verificación manual ha sido enviada exitosamente.\n\n` +
                `Orden: ${orderId}\n` +
                `Red: ${selectedNetworkData?.name}\n` +
                `Hash: ${txHash.substring(0, 10)}...${txHash.substring(txHash.length - 8)}\n\n` +
                `Un administrador revisará tu transacción en las próximas 2 horas.\n\n` +
                `Puedes ver el estado de tu solicitud en la sección de historial.`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      console.log('🟢 [ManualVerification] Clearing form and reloading data...');
                      setTxHash('');
                      loadPayments();
                      loadVerificationRequests();
                    },
                  },
                ]
              );
            } catch (error: any) {
              console.error('❌ [ManualVerification] === ERROR REQUESTING USDT VERIFICATION ===');
              console.error('❌ [ManualVerification] Error object:', JSON.stringify(error, null, 2));
              console.error('❌ [ManualVerification] Error message:', error.message);
              console.error('❌ [ManualVerification] Error details:', error.details);
              console.error('❌ [ManualVerification] Error hint:', error.hint);
              console.error('❌ [ManualVerification] Error code:', error.code);
              
              Alert.alert(
                'Error', 
                `No se pudo enviar la solicitud de verificación.\n\n` +
                `Detalles: ${error.message || 'Error desconocido'}\n` +
                `Código: ${error.code || 'N/A'}\n\n` +
                `Por favor, intenta nuevamente o contacta al soporte.`
              );
            } finally {
              console.log('🟢 [ManualVerification] Resetting requesting state');
              setRequestingManualVerification(false);
            }
          },
        },
      ]
    );
  };

  const openResponseModal = (verificationRequest: any) => {
    console.log('🟢 [ManualVerification] Opening response modal for request:', verificationRequest.id);
    setSelectedVerificationRequest(verificationRequest);
    setUserResponse('');
    setShowResponseModal(true);
  };

  const submitResponse = async () => {
    console.log('🟢 [ManualVerification] === SUBMITTING USER RESPONSE ===');
    console.log('🟢 [ManualVerification] Response:', userResponse);
    console.log('🟢 [ManualVerification] Request ID:', selectedVerificationRequest?.id);
    console.log('🟢 [ManualVerification] User ID:', user?.id);
    console.log('🟢 [ManualVerification] Session exists:', !!session);

    if (!userResponse.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu respuesta');
      return;
    }

    if (!user) {
      console.error('❌ [ManualVerification] No user found!');
      Alert.alert('Error', 'Usuario no autenticado');
      return;
    }

    if (!session) {
      console.error('❌ [ManualVerification] No session found!');
      Alert.alert('Error', 'Sesión no válida. Por favor, inicia sesión nuevamente.');
      return;
    }

    setSubmittingResponse(true);

    try {
      const updateData = {
        user_response: userResponse.trim(),
        user_response_at: new Date().toISOString(),
        status: 'pending',
        updated_at: new Date().toISOString(),
      };

      console.log('🟢 [ManualVerification] Updating verification request:', JSON.stringify(updateData, null, 2));

      const { error } = await supabase
        .from('manual_verification_requests')
        .update(updateData)
        .eq('id', selectedVerificationRequest.id);

      if (error) {
        console.error('❌ [ManualVerification] Update error:', JSON.stringify(error, null, 2));
        throw error;
      }

      console.log('✅ [ManualVerification] Response submitted successfully');

      setShowResponseModal(false);
      setUserResponse('');
      setSelectedVerificationRequest(null);

      Alert.alert(
        '✅ Respuesta Enviada',
        'Tu respuesta ha sido enviada al administrador. Recibirás una notificación cuando tu solicitud sea revisada.',
        [{ 
          text: 'OK', 
          onPress: () => {
            console.log('🟢 [ManualVerification] Reloading verification requests...');
            loadVerificationRequests();
          }
        }]
      );
    } catch (error: any) {
      console.error('❌ [ManualVerification] === ERROR SUBMITTING RESPONSE ===');
      console.error('❌ [ManualVerification] Error object:', JSON.stringify(error, null, 2));
      console.error('❌ [ManualVerification] Error message:', error.message);
      console.error('❌ [ManualVerification] Error code:', error.code);
      
      Alert.alert('Error', error.message || 'Error al enviar la respuesta');
    } finally {
      console.log('🟢 [ManualVerification] Resetting submitting state');
      setSubmittingResponse(false);
    }
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
        return 'Esperando Pago';
      case 'pending':
        return 'Pendiente';
      case 'confirming':
        return 'Confirmando';
      case 'failed':
        return 'Fallido';
      case 'expired':
        return 'Expirado';
      default:
        return status;
    }
  };

  const nowPaymentsPayments = payments.filter(p => p.payment_id);
  const usdtPayments = payments.filter(p => p.tx_hash && !p.payment_id);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="arrow_back"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Verificación Manual</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow_back"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verificación Manual</Text>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'nowpayments' && styles.tabActive]}
          onPress={() => {
            console.log('🟢 [ManualVerification] Switching to NowPayments tab');
            setActiveTab('nowpayments');
          }}
        >
          <IconSymbol
            ios_icon_name="creditcard.fill"
            android_material_icon_name="payment"
            size={20}
            color={activeTab === 'nowpayments' ? '#000000' : colors.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'nowpayments' && styles.tabTextActive]}>
            NowPayments
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'usdt' && styles.tabActive]}
          onPress={() => {
            console.log('🟢 [ManualVerification] Switching to USDT tab');
            setActiveTab('usdt');
          }}
        >
          <IconSymbol
            ios_icon_name="dollarsign.circle.fill"
            android_material_icon_name="attach_money"
            size={20}
            color={activeTab === 'usdt' ? '#000000' : colors.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'usdt' && styles.tabTextActive]}>
            USDT Directo
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* NowPayments Tab */}
        {activeTab === 'nowpayments' && (
          <React.Fragment>
            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <IconSymbol
                  ios_icon_name="info.circle.fill"
                  android_material_icon_name="info"
                  size={32}
                  color={colors.primary}
                />
                <Text style={styles.infoTitle}>Verificación de Pagos NowPayments</Text>
              </View>
              <Text style={styles.infoText}>
                Aquí puedes ver el historial de tus pagos realizados a través de NowPayments y solicitar verificación manual si un pago no se acreditó automáticamente.
              </Text>
            </View>

            {nowPaymentsPayments.length === 0 ? (
              <View style={styles.emptyContainer}>
                <IconSymbol
                  ios_icon_name="doc.text"
                  android_material_icon_name="description"
                  size={64}
                  color={colors.textSecondary}
                />
                <Text style={styles.emptyText}>
                  No tienes pagos de NowPayments registrados.
                </Text>
              </View>
            ) : (
              nowPaymentsPayments.map((payment, index) => {
                const verificationRequest = verificationRequests.get(payment.id);
                const isPending = ['waiting', 'pending', 'confirming'].includes(payment.status);

                return (
                  <View key={index} style={styles.paymentCard}>
                    <View style={styles.paymentHeader}>
                      <Text style={styles.paymentAmount}>
                        {parseFloat(payment.price_amount).toFixed(2)} USDT
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(payment.status) }]}>
                        <Text style={styles.statusText}>{getStatusText(payment.status)}</Text>
                      </View>
                    </View>

                    <View style={styles.paymentRow}>
                      <Text style={styles.paymentLabel}>MXI:</Text>
                      <Text style={styles.paymentValue}>{parseFloat(payment.mxi_amount).toFixed(2)}</Text>
                    </View>

                    <View style={styles.paymentRow}>
                      <Text style={styles.paymentLabel}>Moneda:</Text>
                      <Text style={styles.paymentValue}>{payment.pay_currency.toUpperCase()}</Text>
                    </View>

                    <View style={styles.orderIdContainer}>
                      <View style={styles.orderIdHeader}>
                        <Text style={styles.orderIdLabel}>Orden:</Text>
                        <TouchableOpacity onPress={() => copyToClipboard(payment.order_id, 'Orden')}>
                          <IconSymbol
                            ios_icon_name="doc.on.doc.fill"
                            android_material_icon_name="content_copy"
                            size={16}
                            color={colors.primary}
                          />
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.orderIdText}>{payment.order_id}</Text>
                    </View>

                    {payment.payment_id && (
                      <View style={styles.orderIdContainer}>
                        <View style={styles.orderIdHeader}>
                          <Text style={styles.orderIdLabel}>Payment ID:</Text>
                          <TouchableOpacity onPress={() => copyToClipboard(payment.payment_id, 'Payment ID')}>
                            <IconSymbol
                              ios_icon_name="doc.on.doc.fill"
                              android_material_icon_name="content_copy"
                              size={16}
                              color={colors.primary}
                            />
                          </TouchableOpacity>
                        </View>
                        <Text style={styles.orderIdText}>{payment.payment_id}</Text>
                      </View>
                    )}

                    <View style={styles.divider} />

                    <View style={styles.paymentRow}>
                      <Text style={styles.paymentLabel}>Fecha:</Text>
                      <Text style={styles.paymentValue}>
                        {new Date(payment.created_at).toLocaleString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>

                    {/* Verification Request Status */}
                    {verificationRequest && verificationRequest.status === 'pending' && (
                      <View style={styles.pendingVerificationBadge}>
                        <IconSymbol
                          ios_icon_name="clock.fill"
                          android_material_icon_name="schedule"
                          size={20}
                          color="#FFFFFF"
                        />
                        <Text style={styles.pendingVerificationText}>
                          ⏳ Verificación manual solicitada. Un administrador revisará tu pago pronto.
                        </Text>
                      </View>
                    )}

                    {verificationRequest && verificationRequest.status === 'reviewing' && (
                      <View style={styles.reviewingBadge}>
                        <IconSymbol
                          ios_icon_name="eye.fill"
                          android_material_icon_name="visibility"
                          size={20}
                          color="#FFFFFF"
                        />
                        <Text style={styles.reviewingText}>
                          👀 Un administrador está revisando tu pago ahora.
                        </Text>
                      </View>
                    )}

                    {verificationRequest && verificationRequest.status === 'more_info_requested' && (
                      <View style={styles.moreInfoRequestedBadge}>
                        <Text style={styles.moreInfoRequestedTitle}>
                          📋 El administrador solicita más información
                        </Text>
                        {verificationRequest.admin_request_info && (
                          <View style={styles.adminRequestBox}>
                            <Text style={styles.adminRequestLabel}>Información solicitada:</Text>
                            <Text style={styles.adminRequestText}>{verificationRequest.admin_request_info}</Text>
                          </View>
                        )}
                        {verificationRequest.user_response ? (
                          <View style={styles.infoBox}>
                            <IconSymbol
                              ios_icon_name="checkmark.circle.fill"
                              android_material_icon_name="check_circle"
                              size={20}
                              color="#2196F3"
                            />
                            <Text style={styles.infoText}>
                              ✅ Respuesta enviada. El administrador la revisará pronto.
                            </Text>
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={styles.respondButton}
                            onPress={() => openResponseModal(verificationRequest)}
                          >
                            <IconSymbol
                              ios_icon_name="text.bubble.fill"
                              android_material_icon_name="chat"
                              size={20}
                              color="#9C27B0"
                            />
                            <Text style={styles.respondButtonText}>Responder</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}

                    {verificationRequest && verificationRequest.status === 'approved' && (
                      <View style={styles.approvedBadge}>
                        <IconSymbol
                          ios_icon_name="checkmark.circle.fill"
                          android_material_icon_name="check_circle"
                          size={20}
                          color="#FFFFFF"
                        />
                        <Text style={styles.approvedText}>✅ Verificación manual aprobada</Text>
                      </View>
                    )}

                    {verificationRequest && verificationRequest.status === 'rejected' && (
                      <View style={styles.rejectedBadge}>
                        <IconSymbol
                          ios_icon_name="xmark.circle.fill"
                          android_material_icon_name="cancel"
                          size={20}
                          color="#FFFFFF"
                        />
                        <Text style={styles.rejectedText}>
                          ❌ Rechazado: {verificationRequest.admin_notes || 'Sin motivo'}
                        </Text>
                      </View>
                    )}

                    {/* Request Manual Verification Button */}
                    {isPending && !verificationRequest && (
                      <TouchableOpacity
                        style={styles.requestVerificationButton}
                        onPress={() => handleRequestNowPaymentsVerification(payment)}
                        activeOpacity={0.7}
                      >
                        <IconSymbol
                          ios_icon_name="person.fill.checkmark"
                          android_material_icon_name="admin_panel_settings"
                          size={20}
                          color="#FFFFFF"
                        />
                        <Text style={styles.requestVerificationButtonText}>
                          Solicitar Verificación Manual
                        </Text>
                      </TouchableOpacity>
                    )}

                    {/* Success Badge */}
                    {(payment.status === 'finished' || payment.status === 'confirmed') && (
                      <View style={styles.successBadge}>
                        <IconSymbol
                          ios_icon_name="checkmark.circle.fill"
                          android_material_icon_name="check_circle"
                          size={20}
                          color="#FFFFFF"
                        />
                        <Text style={styles.successText}>✅ Pago acreditado exitosamente</Text>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </React.Fragment>
        )}

        {/* USDT Tab */}
        {activeTab === 'usdt' && (
          <React.Fragment>
            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <IconSymbol
                  ios_icon_name="info.circle.fill"
                  android_material_icon_name="info"
                  size={32}
                  color={colors.primary}
                />
                <Text style={styles.infoTitle}>Verificación de Pagos USDT</Text>
              </View>
              <Text style={styles.infoText}>
                Solicita la verificación manual de tus pagos USDT directos ingresando el hash de la transacción. Un administrador revisará tu pago y lo acreditará manualmente.
              </Text>
            </View>

            {/* Network Selector */}
            <View style={styles.networkCard}>
              <Text style={styles.networkTitle}>Selecciona la Red de Pago</Text>
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
                    onPress={() => {
                      console.log('🟢 [ManualVerification] Network selected:', network.id);
                      setSelectedNetwork(network.id);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.networkIcon, { backgroundColor: network.color }]}>
                      <Text style={styles.networkIconText}>{network.icon}</Text>
                    </View>
                    <View style={styles.networkInfo}>
                      <Text style={styles.networkName}>{network.name}</Text>
                      <Text style={styles.networkLabel}>{network.label}</Text>
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

            {/* Transaction Hash Input */}
            <View style={styles.inputCard}>
              <Text style={styles.inputLabel}>Hash de Transacción (txHash)</Text>
              <TextInput
                style={styles.input}
                placeholder="0x..."
                placeholderTextColor="#666666"
                value={txHash}
                onChangeText={(text) => {
                  console.log('🟢 [ManualVerification] TX Hash changed, length:', text.length);
                  setTxHash(text);
                }}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!requestingManualVerification}
                multiline
                numberOfLines={3}
              />
              <Text style={styles.inputHint}>
                Pega el hash de tu transacción de {NETWORKS.find(n => n.id === selectedNetwork)?.name} aquí
              </Text>
              {txHash.length > 0 && (
                <Text style={[styles.inputHint, { marginTop: 4, color: txHash.length === 66 ? '#4CAF50' : colors.warning }]}>
                  {txHash.length === 66 ? '✓ Longitud correcta' : `⚠️ ${txHash.length}/66 caracteres`}
                </Text>
              )}
            </View>

            {/* Request Verification Button */}
            <TouchableOpacity
              style={[
                styles.requestUSDTVerificationButton,
                (requestingManualVerification || !txHash.trim()) && styles.requestUSDTVerificationButtonDisabled
              ]}
              onPress={handleRequestUSDTVerification}
              disabled={requestingManualVerification || !txHash.trim()}
              activeOpacity={0.7}
            >
              {requestingManualVerification ? (
                <React.Fragment>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.requestUSDTVerificationButtonText}>Enviando Solicitud...</Text>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <IconSymbol
                    ios_icon_name="person.fill.checkmark"
                    android_material_icon_name="admin_panel_settings"
                    size={24}
                    color="#FFFFFF"
                  />
                  <Text style={styles.requestUSDTVerificationButtonText}>
                    Solicitar Verificación Manual
                  </Text>
                </React.Fragment>
              )}
            </TouchableOpacity>

            {/* USDT Payment History */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Historial de Pagos USDT</Text>
            </View>

            {usdtPayments.length === 0 ? (
              <View style={styles.emptyContainer}>
                <IconSymbol
                  ios_icon_name="doc.text"
                  android_material_icon_name="description"
                  size={64}
                  color={colors.textSecondary}
                />
                <Text style={styles.emptyText}>
                  No tienes pagos USDT registrados.
                </Text>
              </View>
            ) : (
              usdtPayments.map((payment, index) => {
                const verificationRequest = verificationRequests.get(payment.id);

                return (
                  <View key={index} style={styles.paymentCard}>
                    <View style={styles.paymentHeader}>
                      <Text style={styles.paymentAmount}>
                        {payment.usdt ? parseFloat(payment.usdt).toFixed(2) : '0.00'} USDT
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(payment.estado || payment.status) }]}>
                        <Text style={styles.statusText}>{getStatusText(payment.estado || payment.status)}</Text>
                      </View>
                    </View>

                    <View style={styles.paymentRow}>
                      <Text style={styles.paymentLabel}>MXI:</Text>
                      <Text style={styles.paymentValue}>
                        {payment.mxi ? parseFloat(payment.mxi).toFixed(2) : '0.00'}
                      </Text>
                    </View>

                    <View style={styles.paymentRow}>
                      <Text style={styles.paymentLabel}>Red:</Text>
                      <Text style={styles.paymentValue}>{payment.pay_currency.toUpperCase()}</Text>
                    </View>

                    {payment.tx_hash && (
                      <View style={styles.orderIdContainer}>
                        <View style={styles.orderIdHeader}>
                          <Text style={styles.orderIdLabel}>Transaction Hash:</Text>
                          <TouchableOpacity onPress={() => copyToClipboard(payment.tx_hash, 'Hash')}>
                            <IconSymbol
                              ios_icon_name="doc.on.doc.fill"
                              android_material_icon_name="content_copy"
                              size={16}
                              color={colors.primary}
                            />
                          </TouchableOpacity>
                        </View>
                        <Text style={styles.orderIdText}>{payment.tx_hash}</Text>
                      </View>
                    )}

                    <View style={styles.divider} />

                    <View style={styles.paymentRow}>
                      <Text style={styles.paymentLabel}>Fecha:</Text>
                      <Text style={styles.paymentValue}>
                        {new Date(payment.created_at).toLocaleString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>

                    {/* Verification Request Status */}
                    {verificationRequest && verificationRequest.status === 'pending' && (
                      <View style={styles.pendingVerificationBadge}>
                        <IconSymbol
                          ios_icon_name="clock.fill"
                          android_material_icon_name="schedule"
                          size={20}
                          color="#FFFFFF"
                        />
                        <Text style={styles.pendingVerificationText}>
                          ⏳ Verificación manual solicitada. Un administrador revisará tu pago pronto.
                        </Text>
                      </View>
                    )}

                    {verificationRequest && verificationRequest.status === 'reviewing' && (
                      <View style={styles.reviewingBadge}>
                        <IconSymbol
                          ios_icon_name="eye.fill"
                          android_material_icon_name="visibility"
                          size={20}
                          color="#FFFFFF"
                        />
                        <Text style={styles.reviewingText}>
                          👀 Un administrador está revisando tu pago ahora.
                        </Text>
                      </View>
                    )}

                    {verificationRequest && verificationRequest.status === 'more_info_requested' && (
                      <View style={styles.moreInfoRequestedBadge}>
                        <Text style={styles.moreInfoRequestedTitle}>
                          📋 El administrador solicita más información
                        </Text>
                        {verificationRequest.admin_request_info && (
                          <View style={styles.adminRequestBox}>
                            <Text style={styles.adminRequestLabel}>Información solicitada:</Text>
                            <Text style={styles.adminRequestText}>{verificationRequest.admin_request_info}</Text>
                          </View>
                        )}
                        {verificationRequest.user_response ? (
                          <View style={styles.infoBox}>
                            <IconSymbol
                              ios_icon_name="checkmark.circle.fill"
                              android_material_icon_name="check_circle"
                              size={20}
                              color="#2196F3"
                            />
                            <Text style={styles.infoText}>
                              ✅ Respuesta enviada. El administrador la revisará pronto.
                            </Text>
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={styles.respondButton}
                            onPress={() => openResponseModal(verificationRequest)}
                          >
                            <IconSymbol
                              ios_icon_name="text.bubble.fill"
                              android_material_icon_name="chat"
                              size={20}
                              color="#9C27B0"
                            />
                            <Text style={styles.respondButtonText}>Responder</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}

                    {verificationRequest && verificationRequest.status === 'approved' && (
                      <View style={styles.approvedBadge}>
                        <IconSymbol
                          ios_icon_name="checkmark.circle.fill"
                          android_material_icon_name="check_circle"
                          size={20}
                          color="#FFFFFF"
                        />
                        <Text style={styles.approvedText}>✅ Verificación manual aprobada</Text>
                      </View>
                    )}

                    {verificationRequest && verificationRequest.status === 'rejected' && (
                      <View style={styles.rejectedBadge}>
                        <IconSymbol
                          ios_icon_name="xmark.circle.fill"
                          android_material_icon_name="cancel"
                          size={20}
                          color="#FFFFFF"
                        />
                        <Text style={styles.rejectedText}>
                          ❌ Rechazado: {verificationRequest.admin_notes || 'Sin motivo'}
                        </Text>
                      </View>
                    )}

                    {/* Success Badge */}
                    {(payment.estado === 'confirmado' || payment.status === 'confirmed') && (
                      <View style={styles.successBadge}>
                        <IconSymbol
                          ios_icon_name="checkmark.circle.fill"
                          android_material_icon_name="check_circle"
                          size={20}
                          color="#FFFFFF"
                        />
                        <Text style={styles.successText}>✅ Pago acreditado exitosamente</Text>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </React.Fragment>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Response Modal */}
      <Modal
        visible={showResponseModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          console.log('🟡 [ManualVerification] Modal closed');
          setShowResponseModal(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Responder al Administrador</Text>
            {selectedVerificationRequest?.admin_request_info && (
              <View style={styles.adminRequestBox}>
                <Text style={styles.adminRequestLabel}>Información solicitada:</Text>
                <Text style={styles.adminRequestText}>
                  {selectedVerificationRequest.admin_request_info}
                </Text>
              </View>
            )}
            <Text style={[styles.paymentLabel, { marginTop: 16, marginBottom: 12 }]}>
              Tu respuesta:
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Escribe tu respuesta aquí..."
              placeholderTextColor={colors.textSecondary}
              value={userResponse}
              onChangeText={setUserResponse}
              multiline
              numberOfLines={4}
              editable={!submittingResponse}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  console.log('🟡 [ManualVerification] Cancel button pressed');
                  setShowResponseModal(false);
                  setUserResponse('');
                  setSelectedVerificationRequest(null);
                }}
                disabled={submittingResponse}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextCancel]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSubmit]}
                onPress={() => {
                  console.log('🟢 [ManualVerification] Submit button pressed');
                  submitResponse();
                }}
                disabled={submittingResponse}
              >
                {submittingResponse ? (
                  <ActivityIndicator size="small" color="#000000" />
                ) : (
                  <Text style={[styles.modalButtonText, styles.modalButtonTextSubmit]}>
                    Enviar
                  </Text>
                )}
              </TouchableOpacity>
            </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.cardBackground,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: '#000000',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    backgroundColor: colors.primary + '15',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  infoTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
  paymentCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  paymentAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
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
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  orderIdContainer: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  orderIdHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderIdLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  orderIdText: {
    fontSize: 12,
    color: colors.text,
    fontFamily: 'monospace',
  },
  requestVerificationButton: {
    backgroundColor: '#FF9800',
    borderRadius: 8,
    padding: 14,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#FFB74D',
  },
  requestVerificationButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pendingVerificationBadge: {
    backgroundColor: '#FF9800',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pendingVerificationText: {
    fontSize: 13,
    color: '#FFFFFF',
    flex: 1,
  },
  reviewingBadge: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewingText: {
    fontSize: 13,
    color: '#FFFFFF',
    flex: 1,
  },
  approvedBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  approvedText: {
    fontSize: 13,
    color: '#FFFFFF',
    flex: 1,
  },
  rejectedBadge: {
    backgroundColor: '#F44336',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rejectedText: {
    fontSize: 13,
    color: '#FFFFFF',
    flex: 1,
  },
  moreInfoRequestedBadge: {
    backgroundColor: '#9C27B0',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 2,
    borderColor: '#BA68C8',
  },
  moreInfoRequestedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  adminRequestBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  adminRequestLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  adminRequestText: {
    fontSize: 13,
    color: '#FFFFFF',
    lineHeight: 18,
  },
  respondButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  respondButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9C27B0',
  },
  successBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  successText: {
    fontSize: 13,
    color: '#FFFFFF',
    flex: 1,
  },
  infoBox: {
    backgroundColor: '#2196F3' + '20',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },
  networkCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  networkTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
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
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 12,
    color: colors.text,
    fontFamily: 'monospace',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
  },
  requestUSDTVerificationButton: {
    backgroundColor: '#FF9800',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
    minHeight: 56,
    borderWidth: 2,
    borderColor: '#FFB74D',
  },
  requestUSDTVerificationButtonDisabled: {
    opacity: 0.5,
  },
  requestUSDTVerificationButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: colors.border,
  },
  modalButtonSubmit: {
    backgroundColor: colors.primary,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextCancel: {
    color: colors.text,
  },
  modalButtonTextSubmit: {
    color: '#000000',
  },
});
