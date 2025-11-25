
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
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  requestCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  requestAmount: {
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
  requestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  requestLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  requestValue: {
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
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#F44336',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  infoBox: {
    backgroundColor: colors.primary + '20',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: colors.primary,
    lineHeight: 18,
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.card,
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
});

export default function ManualVerificationRequestsScreen() {
  const router = useRouter();
  const { user, session } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');

  useEffect(() => {
    loadRequests();

    // Subscribe to verification request updates
    const channel = supabase
      .channel('admin-verification-requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'manual_verification_requests',
        },
        (payload) => {
          console.log('Verification request update:', payload);
          loadRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTab]);

  const loadRequests = async () => {
    try {
      let query = supabase
        .from('manual_verification_requests')
        .select(`
          *,
          payments (
            id,
            order_id,
            payment_id,
            price_amount,
            mxi_amount,
            price_per_mxi,
            phase,
            pay_currency,
            status,
            created_at
          ),
          users (
            id,
            email,
            name,
            mxi_balance
          )
        `)
        .order('created_at', { ascending: false });

      if (activeTab === 'pending') {
        query = query.in('status', ['pending', 'reviewing']);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error loading verification requests:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRequests();
  };

  const approveRequest = async (request: any) => {
    if (!session) {
      Alert.alert('Error', 'Sesión no válida');
      return;
    }

    Alert.alert(
      'Aprobar Verificación',
      `¿Estás seguro de que deseas aprobar esta solicitud?\n\n` +
      `Usuario: ${request.users.email}\n` +
      `Monto: ${parseFloat(request.payments.price_amount).toFixed(2)} USDT\n` +
      `MXI: ${parseFloat(request.payments.mxi_amount).toFixed(2)} MXI\n\n` +
      `Esta acción verificará el pago con NOWPayments y lo acreditará si está confirmado.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aprobar',
          style: 'destructive',
          onPress: async () => {
            setProcessingRequests(prev => new Set(prev).add(request.id));

            try {
              // First, update the request status to reviewing
              await supabase
                .from('manual_verification_requests')
                .update({
                  status: 'reviewing',
                  updated_at: new Date().toISOString(),
                })
                .eq('id', request.id);

              // Call the manual verification edge function
              const response = await fetch(
                'https://aeyfnjuatbtcauiumbhn.supabase.co/functions/v1/manual-verify-payment',
                {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    order_id: request.payments.order_id,
                  }),
                }
              );

              const data = await response.json();
              console.log('Verification response:', data);

              if (data.success) {
                if (data.credited) {
                  // Update request status to approved
                  await supabase
                    .from('manual_verification_requests')
                    .update({
                      status: 'approved',
                      reviewed_by: user?.id,
                      reviewed_at: new Date().toISOString(),
                      admin_notes: 'Pago verificado y acreditado exitosamente',
                      updated_at: new Date().toISOString(),
                    })
                    .eq('id', request.id);

                  Alert.alert(
                    '✅ Pago Aprobado',
                    `El pago ha sido verificado y acreditado exitosamente.\n\n` +
                    `${data.payment.mxi_amount} MXI han sido agregados a la cuenta del usuario.`,
                    [
                      {
                        text: 'OK',
                        onPress: () => loadRequests(),
                      },
                    ]
                  );
                } else if (data.already_credited) {
                  // Update request status to approved
                  await supabase
                    .from('manual_verification_requests')
                    .update({
                      status: 'approved',
                      reviewed_by: user?.id,
                      reviewed_at: new Date().toISOString(),
                      admin_notes: 'Pago ya había sido acreditado anteriormente',
                      updated_at: new Date().toISOString(),
                    })
                    .eq('id', request.id);

                  Alert.alert(
                    'ℹ️ Ya Acreditado',
                    'Este pago ya había sido acreditado anteriormente.',
                    [
                      {
                        text: 'OK',
                        onPress: () => loadRequests(),
                      },
                    ]
                  );
                } else {
                  // Payment not confirmed yet, update status back to pending
                  await supabase
                    .from('manual_verification_requests')
                    .update({
                      status: 'pending',
                      admin_notes: `Estado del pago: ${data.payment.status}. Aún no confirmado por NOWPayments.`,
                      updated_at: new Date().toISOString(),
                    })
                    .eq('id', request.id);

                  Alert.alert(
                    'ℹ️ Pago No Confirmado',
                    `El pago aún no ha sido confirmado por NOWPayments.\n\n` +
                    `Estado actual: ${data.payment.status}\n\n` +
                    `Por favor, espera a que el pago sea confirmado antes de aprobarlo.`,
                    [{ text: 'OK', onPress: () => loadRequests() }]
                  );
                }
              } else {
                // Update status back to pending with error
                await supabase
                  .from('manual_verification_requests')
                  .update({
                    status: 'pending',
                    admin_notes: `Error: ${data.error}`,
                    updated_at: new Date().toISOString(),
                  })
                  .eq('id', request.id);

                Alert.alert(
                  'Error',
                  data.error || 'Error al verificar el pago',
                  [{ text: 'OK', onPress: () => loadRequests() }]
                );
              }
            } catch (error: any) {
              console.error('Error approving request:', error);
              
              // Update status back to pending with error
              await supabase
                .from('manual_verification_requests')
                .update({
                  status: 'pending',
                  admin_notes: `Error: ${error.message}`,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', request.id);

              Alert.alert(
                'Error',
                error.message || 'Error al aprobar la solicitud',
                [{ text: 'OK', onPress: () => loadRequests() }]
              );
            } finally {
              setProcessingRequests(prev => {
                const newSet = new Set(prev);
                newSet.delete(request.id);
                return newSet;
              });
            }
          },
        },
      ]
    );
  };

  const rejectRequest = async (request: any) => {
    Alert.alert(
      'Rechazar Verificación',
      `¿Estás seguro de que deseas rechazar esta solicitud?\n\n` +
      `Usuario: ${request.users.email}\n` +
      `Monto: ${parseFloat(request.payments.price_amount).toFixed(2)} USDT`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: async () => {
            setProcessingRequests(prev => new Set(prev).add(request.id));

            try {
              await supabase
                .from('manual_verification_requests')
                .update({
                  status: 'rejected',
                  reviewed_by: user?.id,
                  reviewed_at: new Date().toISOString(),
                  admin_notes: 'Solicitud rechazada por el administrador',
                  updated_at: new Date().toISOString(),
                })
                .eq('id', request.id);

              Alert.alert(
                '✅ Solicitud Rechazada',
                'La solicitud ha sido rechazada exitosamente.',
                [
                  {
                    text: 'OK',
                    onPress: () => loadRequests(),
                  },
                ]
              );
            } catch (error: any) {
              console.error('Error rejecting request:', error);
              Alert.alert(
                'Error',
                error.message || 'Error al rechazar la solicitud',
                [{ text: 'OK' }]
              );
            } finally {
              setProcessingRequests(prev => {
                const newSet = new Set(prev);
                newSet.delete(request.id);
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
      case 'approved':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'reviewing':
        return '#2196F3';
      case 'rejected':
        return '#F44336';
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprobado';
      case 'pending':
        return 'Pendiente';
      case 'reviewing':
        return 'Revisando';
      case 'rejected':
        return 'Rechazado';
      default:
        return status;
    }
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
          <Text style={styles.headerTitle}>Verificaciones Manuales</Text>
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
        <Text style={styles.headerTitle}>Verificaciones Manuales</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.tabActive]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
            Pendientes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.tabActive]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
            Todas
          </Text>
        </TouchableOpacity>
      </View>

      {requests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol
            ios_icon_name="checkmark.circle"
            android_material_icon_name="check_circle"
            size={64}
            color={colors.textSecondary}
          />
          <Text style={styles.emptyText}>
            {activeTab === 'pending'
              ? 'No hay solicitudes de verificación pendientes.'
              : 'No hay solicitudes de verificación.'}
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
          {requests.map((request, index) => {
            const isProcessing = processingRequests.has(request.id);
            const isPending = request.status === 'pending' || request.status === 'reviewing';

            return (
              <View key={index} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <Text style={styles.requestAmount}>
                    {parseFloat(request.payments.price_amount).toFixed(2)} USDT
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(request.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {getStatusText(request.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.requestRow}>
                  <Text style={styles.requestLabel}>Usuario:</Text>
                  <Text style={styles.requestValue}>{request.users.email}</Text>
                </View>

                <View style={styles.requestRow}>
                  <Text style={styles.requestLabel}>Nombre:</Text>
                  <Text style={styles.requestValue}>{request.users.name}</Text>
                </View>

                <View style={styles.requestRow}>
                  <Text style={styles.requestLabel}>MXI a Acreditar:</Text>
                  <Text style={styles.requestValue}>
                    {parseFloat(request.payments.mxi_amount).toFixed(2)} MXI
                  </Text>
                </View>

                <View style={styles.requestRow}>
                  <Text style={styles.requestLabel}>Balance Actual:</Text>
                  <Text style={styles.requestValue}>
                    {parseFloat(request.users.mxi_balance).toFixed(2)} MXI
                  </Text>
                </View>

                <View style={styles.requestRow}>
                  <Text style={styles.requestLabel}>Fase:</Text>
                  <Text style={styles.requestValue}>Fase {request.payments.phase}</Text>
                </View>

                <View style={styles.requestRow}>
                  <Text style={styles.requestLabel}>Moneda:</Text>
                  <Text style={styles.requestValue}>
                    {request.payments.pay_currency.toUpperCase()}
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.requestRow}>
                  <Text style={styles.requestLabel}>Solicitado:</Text>
                  <Text style={styles.requestValue}>
                    {new Date(request.created_at).toLocaleString()}
                  </Text>
                </View>

                {request.reviewed_at && (
                  <View style={styles.requestRow}>
                    <Text style={styles.requestLabel}>Revisado:</Text>
                    <Text style={styles.requestValue}>
                      {new Date(request.reviewed_at).toLocaleString()}
                    </Text>
                  </View>
                )}

                <View style={styles.orderIdContainer}>
                  <Text style={styles.orderIdLabel}>ID de Orden:</Text>
                  <Text style={styles.orderIdText}>{request.payments.order_id}</Text>
                </View>

                {request.payments.payment_id && (
                  <View style={styles.orderIdContainer}>
                    <Text style={styles.orderIdLabel}>Payment ID:</Text>
                    <Text style={styles.orderIdText}>{request.payments.payment_id}</Text>
                  </View>
                )}

                {request.admin_notes && (
                  <View style={styles.infoBox}>
                    <IconSymbol
                      ios_icon_name="note.text"
                      android_material_icon_name="note"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={styles.infoText}>{request.admin_notes}</Text>
                  </View>
                )}

                {isPending && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.approveButton, isProcessing && styles.buttonDisabled]}
                      onPress={() => approveRequest(request)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <IconSymbol
                            ios_icon_name="checkmark.circle.fill"
                            android_material_icon_name="check_circle"
                            size={20}
                            color="#FFFFFF"
                          />
                          <Text style={styles.buttonText}>Aprobar</Text>
                        </>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.rejectButton, isProcessing && styles.buttonDisabled]}
                      onPress={() => rejectRequest(request)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <IconSymbol
                            ios_icon_name="xmark.circle.fill"
                            android_material_icon_name="cancel"
                            size={20}
                            color="#FFFFFF"
                          />
                          <Text style={styles.buttonText}>Rechazar</Text>
                        </>
                      )}
                    </TouchableOpacity>
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
