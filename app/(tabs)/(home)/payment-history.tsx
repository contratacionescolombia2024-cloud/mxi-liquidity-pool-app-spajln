
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

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
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
  paymentCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#333333',
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
    backgroundColor: '#333333',
    marginVertical: 12,
  },
  orderIdContainer: {
    backgroundColor: '#0A0A0A',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  orderIdLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  orderIdText: {
    fontSize: 12,
    color: colors.text,
    fontFamily: 'monospace',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  verifyButtonDisabled: {
    opacity: 0.5,
  },
  verifyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  verifyingText: {
    fontSize: 12,
    color: colors.primary,
    textAlign: 'center',
    marginTop: 8,
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
  requestVerificationButton: {
    backgroundColor: '#FF9800',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  requestVerificationButtonDisabled: {
    opacity: 0.5,
  },
  requestVerificationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoBox: {
    backgroundColor: '#2196F3' + '20',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#2196F3',
    lineHeight: 18,
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
});

export default function PaymentHistoryScreen() {
  const router = useRouter();
  const { user, session } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [verifyingPayments, setVerifyingPayments] = useState<Set<string>>(new Set());
  const [requestingVerification, setRequestingVerification] = useState<Set<string>>(new Set());
  const [verificationRequests, setVerificationRequests] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    loadPayments();
    loadVerificationRequests();

    // Subscribe to payment updates
    const paymentsChannel = supabase
      .channel('payment-history-updates')
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
          loadPayments();
        }
      )
      .subscribe();

    // Subscribe to verification request updates
    const verificationsChannel = supabase
      .channel('verification-requests-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'manual_verification_requests',
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          console.log('Verification request update received:', payload);
          loadVerificationRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(paymentsChannel);
      supabase.removeChannel(verificationsChannel);
    };
  }, [user]);

  const loadPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadVerificationRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('manual_verification_requests')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;

      // Create a map of payment_id to verification request
      const requestsMap = new Map();
      (data || []).forEach((request: any) => {
        requestsMap.set(request.payment_id, request);
      });
      setVerificationRequests(requestsMap);
    } catch (error) {
      console.error('Error loading verification requests:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPayments();
    loadVerificationRequests();
  };

  const verifyPayment = async (payment: any) => {
    if (!session) {
      Alert.alert('Error', 'Sesión no válida');
      return;
    }

    setVerifyingPayments(prev => new Set(prev).add(payment.id));

    try {
      console.log('🔍 Verifying payment:', payment.order_id);

      const response = await fetch(
        'https://aeyfnjuatbtcauiumbhn.supabase.co/functions/v1/manual-verify-payment',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            order_id: payment.order_id,
          }),
        }
      );

      const data = await response.json();
      console.log('✅ Verification response:', data);

      if (data.success) {
        if (data.credited) {
          Alert.alert(
            '✅ Pago Verificado',
            `Tu pago ha sido verificado y acreditado exitosamente.\n\n` +
            `${data.payment.mxi_amount} MXI han sido agregados a tu cuenta.\n\n` +
            `Nuevo balance: ${data.payment.new_balance} MXI`,
            [
              {
                text: 'OK',
                onPress: () => loadPayments(),
              },
            ]
          );
        } else if (data.already_credited) {
          Alert.alert(
            'ℹ️ Ya Acreditado',
            'Este pago ya ha sido acreditado anteriormente.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'ℹ️ Estado Actualizado',
            `Estado del pago: ${data.payment.status}\n\n` +
            `El pago aún no ha sido confirmado por NOWPayments. Por favor, espera a que se confirme.`,
            [
              {
                text: 'OK',
                onPress: () => loadPayments(),
              },
            ]
          );
        }
      } else {
        Alert.alert(
          'Error',
          data.error || 'Error al verificar el pago',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('❌ Error verifying payment:', error);
      Alert.alert(
        'Error',
        'Error de conexión al verificar el pago. Por favor, intenta nuevamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setVerifyingPayments(prev => {
        const newSet = new Set(prev);
        newSet.delete(payment.id);
        return newSet;
      });
    }
  };

  const requestManualVerification = async (payment: any) => {
    if (!user) {
      Alert.alert('Error', 'Sesión no válida');
      return;
    }

    Alert.alert(
      'Solicitar Verificación Manual',
      `¿Deseas solicitar la verificación manual de este pago?\n\n` +
      `Monto: ${parseFloat(payment.price_amount).toFixed(2)} USDT\n` +
      `MXI: ${parseFloat(payment.mxi_amount).toFixed(2)} MXI\n\n` +
      `Un administrador revisará tu pago y lo aprobará manualmente. Este proceso puede tomar hasta 2 horas.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Solicitar',
          onPress: async () => {
            setRequestingVerification(prev => new Set(prev).add(payment.id));

            try {
              const { data, error } = await supabase
                .from('manual_verification_requests')
                .insert({
                  payment_id: payment.id,
                  user_id: user.id,
                  order_id: payment.order_id,
                  status: 'pending',
                })
                .select()
                .single();

              if (error) throw error;

              Alert.alert(
                '✅ Solicitud Enviada',
                `Tu solicitud de verificación manual ha sido enviada exitosamente.\n\n` +
                `Un administrador revisará tu pago en las próximas 2 horas y lo aprobará manualmente.\n\n` +
                `Recibirás una notificación cuando tu pago sea verificado.`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      loadVerificationRequests();
                    },
                  },
                ]
              );
            } catch (error: any) {
              console.error('Error requesting verification:', error);
              Alert.alert(
                'Error',
                error.message || 'Error al solicitar la verificación manual',
                [{ text: 'OK' }]
              );
            } finally {
              setRequestingVerification(prev => {
                const newSet = new Set(prev);
                newSet.delete(payment.id);
                return newSet;
              });
            }
          },
        },
      ]
    );
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
        return 'Esperando Pago';
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

  const canVerify = (payment: any) => {
    return payment.status !== 'finished' && 
           payment.status !== 'confirmed' && 
           payment.payment_id;
  };

  const canRequestVerification = (payment: any) => {
    // Can request if payment is not finished/confirmed and no pending request exists
    const hasRequest = verificationRequests.has(payment.id);
    return payment.status !== 'finished' && 
           payment.status !== 'confirmed' && 
           !hasRequest;
  };

  if (loading) {
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
          <Text style={styles.headerTitle}>Historial de Pagos</Text>
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
        <Text style={styles.headerTitle}>Historial de Pagos</Text>
      </View>

      {payments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol
            ios_icon_name="doc.text"
            android_material_icon_name="description"
            size={64}
            color={colors.textSecondary}
          />
          <Text style={styles.emptyText}>
            No tienes pagos registrados aún.{'\n'}
            Realiza tu primera compra de MXI para comenzar.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {payments.map((payment, index) => {
            const isVerifying = verifyingPayments.has(payment.id);
            const isRequestingVerification = requestingVerification.has(payment.id);
            const showVerifyButton = canVerify(payment);
            const showRequestButton = canRequestVerification(payment);
            const verificationRequest = verificationRequests.get(payment.id);

            return (
              <View key={index} style={styles.paymentCard}>
                <View style={styles.paymentHeader}>
                  <Text style={styles.paymentAmount}>
                    {parseFloat(payment.price_amount).toFixed(2)} USDT
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(payment.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {getStatusText(payment.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>MXI Recibidos:</Text>
                  <Text style={styles.paymentValue}>
                    {parseFloat(payment.mxi_amount).toFixed(2)} MXI
                  </Text>
                </View>

                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Precio por MXI:</Text>
                  <Text style={styles.paymentValue}>
                    {parseFloat(payment.price_per_mxi).toFixed(2)} USDT
                  </Text>
                </View>

                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Fase:</Text>
                  <Text style={styles.paymentValue}>Fase {payment.phase}</Text>
                </View>

                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Moneda:</Text>
                  <Text style={styles.paymentValue}>
                    {payment.pay_currency.toUpperCase()}
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Fecha:</Text>
                  <Text style={styles.paymentValue}>
                    {new Date(payment.created_at).toLocaleString()}
                  </Text>
                </View>

                {payment.confirmed_at && (
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Confirmado:</Text>
                    <Text style={styles.paymentValue}>
                      {new Date(payment.confirmed_at).toLocaleString()}
                    </Text>
                  </View>
                )}

                {payment.expires_at && payment.status === 'waiting' && (
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Expira:</Text>
                    <Text style={styles.paymentValue}>
                      {new Date(payment.expires_at).toLocaleString()}
                    </Text>
                  </View>
                )}

                <View style={styles.orderIdContainer}>
                  <Text style={styles.orderIdLabel}>ID de Orden:</Text>
                  <Text style={styles.orderIdText}>{payment.order_id}</Text>
                </View>

                {showVerifyButton && (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.verifyButton,
                        isVerifying && styles.verifyButtonDisabled,
                      ]}
                      onPress={() => verifyPayment(payment)}
                      disabled={isVerifying}
                    >
                      {isVerifying ? (
                        <>
                          <ActivityIndicator size="small" color="#000000" />
                          <Text style={styles.verifyButtonText}>Verificando...</Text>
                        </>
                      ) : (
                        <>
                          <IconSymbol
                            ios_icon_name="checkmark.circle.fill"
                            android_material_icon_name="check_circle"
                            size={20}
                            color="#000000"
                          />
                          <Text style={styles.verifyButtonText}>Verificar Pago Automáticamente</Text>
                        </>
                      )}
                    </TouchableOpacity>
                    <Text style={styles.verifyingText}>
                      Si tu pago no se ha acreditado automáticamente, usa este botón para verificarlo.
                    </Text>
                  </>
                )}

                {showRequestButton && (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.requestVerificationButton,
                        isRequestingVerification && styles.requestVerificationButtonDisabled,
                      ]}
                      onPress={() => requestManualVerification(payment)}
                      disabled={isRequestingVerification}
                    >
                      {isRequestingVerification ? (
                        <>
                          <ActivityIndicator size="small" color="#FFFFFF" />
                          <Text style={styles.requestVerificationButtonText}>Enviando...</Text>
                        </>
                      ) : (
                        <>
                          <IconSymbol
                            ios_icon_name="person.fill.checkmark"
                            android_material_icon_name="admin_panel_settings"
                            size={20}
                            color="#FFFFFF"
                          />
                          <Text style={styles.requestVerificationButtonText}>
                            Solicitar Verificación Manual
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                    <View style={styles.infoBox}>
                      <IconSymbol
                        ios_icon_name="info.circle.fill"
                        android_material_icon_name="info"
                        size={20}
                        color="#2196F3"
                      />
                      <Text style={styles.infoText}>
                        Si la verificación automática no funciona, puedes solicitar que un administrador revise y apruebe tu pago manualmente. El proceso puede tomar hasta 2 horas.
                      </Text>
                    </View>
                  </>
                )}

                {verificationRequest && verificationRequest.status === 'pending' && (
                  <View style={styles.pendingVerificationBadge}>
                    <IconSymbol
                      ios_icon_name="clock.fill"
                      android_material_icon_name="schedule"
                      size={20}
                      color="#FFFFFF"
                    />
                    <Text style={styles.pendingVerificationText}>
                      ⏳ Verificación manual solicitada. Un administrador revisará tu pago en las próximas 2 horas.
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
                      👀 Un administrador está revisando tu pago en este momento.
                    </Text>
                  </View>
                )}

                {(payment.status === 'finished' || payment.status === 'confirmed') && (
                  <View style={styles.successBadge}>
                    <IconSymbol
                      ios_icon_name="checkmark.circle.fill"
                      android_material_icon_name="check_circle"
                      size={20}
                      color="#FFFFFF"
                    />
                    <Text style={styles.successText}>
                      ✅ Pago acreditado exitosamente
                    </Text>
                  </View>
                )}
              </View>
            );
          })}

          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
