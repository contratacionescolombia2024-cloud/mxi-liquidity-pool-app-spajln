
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { showConfirm, showAlert } from '@/utils/confirmDialog';

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
  moreInfoButton: {
    flex: 1,
    backgroundColor: '#FF9800',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 500,
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
  userResponseBox: {
    backgroundColor: '#2196F3' + '20',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  userResponseLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2196F3',
    marginBottom: 4,
  },
  userResponseText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  adminRequestBox: {
    backgroundColor: '#FF9800' + '20',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  adminRequestLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF9800',
    marginBottom: 4,
  },
  adminRequestText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  paymentTypeBadge: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  paymentTypeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  amountInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  amountInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  warningBox: {
    backgroundColor: '#FF9800' + '20',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  warningText: {
    fontSize: 13,
    color: '#FF9800',
    lineHeight: 18,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default function ManualVerificationRequestsScreen() {
  const router = useRouter();
  const { user, session } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'approved' | 'rejected'>('pending');
  const [showMoreInfoModal, setShowMoreInfoModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [moreInfoText, setMoreInfoText] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approvedUsdtAmount, setApprovedUsdtAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Use useCallback to prevent infinite loops
  const loadRequests = useCallback(async () => {
    try {
      setError(null);
      console.log(`[Admin] Loading verification requests for tab: ${activeTab}`);
      
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
            tx_hash,
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

      // Filter based on active tab
      if (activeTab === 'pending') {
        query = query.in('status', ['pending', 'reviewing', 'more_info_requested']);
      } else if (activeTab === 'approved') {
        query = query.eq('status', 'approved');
      } else if (activeTab === 'rejected') {
        query = query.eq('status', 'rejected');
      }
      // 'all' tab doesn't need additional filtering

      const { data, error: queryError } = await query;

      if (queryError) {
        console.error('[Admin] Error loading verification requests:', queryError);
        setError(queryError.message);
        throw queryError;
      }
      
      console.log(`[Admin] Loaded ${data?.length || 0} verification requests`);
      setRequests(data || []);
    } catch (error: any) {
      console.error('[Admin] Error loading verification requests:', error);
      setError(error.message || 'Error al cargar las solicitudes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]); // Only depend on activeTab

  useEffect(() => {
    console.log('[Admin] Setting up verification requests screen');
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
          console.log('[Admin] Verification request update:', payload);
          // Reload requests when there's a change
          loadRequests();
        }
      )
      .subscribe();

    return () => {
      console.log('[Admin] Cleaning up verification requests screen');
      supabase.removeChannel(channel);
    };
  }, [loadRequests]); // Only depend on loadRequests

  const onRefresh = useCallback(() => {
    console.log('[Admin] Manual refresh triggered');
    setRefreshing(true);
    loadRequests();
  }, [loadRequests]);

  const openApproveModal = (request: any) => {
    setSelectedRequest(request);
    
    // Pre-fill with the payment amount - with null checks
    const priceAmount = request?.payments?.price_amount;
    if (priceAmount !== null && priceAmount !== undefined) {
      setApprovedUsdtAmount(parseFloat(priceAmount).toFixed(2));
    } else {
      setApprovedUsdtAmount('0.00');
    }
    
    setShowApproveModal(true);
  };

  const approveRequest = async () => {
    if (!session) {
      showAlert('Error', 'Sesión no válida', undefined, 'error');
      return;
    }

    const request = selectedRequest;
    
    // Additional null checks
    if (!request || !request.payments) {
      showAlert('Error', 'Datos de pago no disponibles', undefined, 'error');
      return;
    }

    const isDirectUSDT = request.payments.tx_hash && !request.payments.payment_id;
    const isNowPayments = !!request.payments.payment_id;

    // Validate approved amount
    const amount = parseFloat(approvedUsdtAmount);
    if (!approvedUsdtAmount || isNaN(amount) || amount <= 0) {
      showAlert('Error', 'Por favor ingresa una cantidad válida de USDT aprobada', undefined, 'error');
      return;
    }

    setShowApproveModal(false);
    setProcessingRequests(prev => new Set(prev).add(request.id));

    try {
      console.log(`[Admin] Approving request ${request.id} with amount ${approvedUsdtAmount}`);

      // Prepare request body
      const requestBody: any = {
        order_id: request.payments.order_id,
        approved_usdt_amount: parseFloat(approvedUsdtAmount),
      };

      console.log('[Admin] Calling manual-verify-payment with:', requestBody);

      // Call the manual verification edge function
      const response = await fetch(
        'https://aeyfnjuatbtcauiumbhn.supabase.co/functions/v1/manual-verify-payment',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();
      console.log('[Admin] Verification response:', data);

      if (data.success) {
        if (data.credited) {
          // Update request status to approved - THIS IS THE KEY FIX
          const { error: updateError } = await supabase
            .from('manual_verification_requests')
            .update({
              status: 'approved',
              reviewed_by: user?.id,
              reviewed_at: new Date().toISOString(),
              admin_notes: `Pago verificado y acreditado exitosamente. Monto aprobado: ${approvedUsdtAmount} USDT`,
              updated_at: new Date().toISOString(),
            })
            .eq('id', request.id);

          if (updateError) {
            console.error('[Admin] Error updating request status:', updateError);
          } else {
            console.log('[Admin] ✅ Request status updated to approved');
          }

          showAlert(
            '✅ Pago Aprobado',
            `El pago ha sido verificado y acreditado exitosamente.\n\n` +
            `${data.payment.mxi_amount} MXI han sido agregados a la cuenta del usuario.\n` +
            `\nMonto USDT aprobado: ${approvedUsdtAmount}`,
            () => {
              // Force reload after approval
              loadRequests();
            },
            'success'
          );
        } else if (data.already_credited) {
          // Update request status to approved
          const { error: updateError } = await supabase
            .from('manual_verification_requests')
            .update({
              status: 'approved',
              reviewed_by: user?.id,
              reviewed_at: new Date().toISOString(),
              admin_notes: 'Pago ya había sido acreditado anteriormente',
              updated_at: new Date().toISOString(),
            })
            .eq('id', request.id);

          if (updateError) {
            console.error('[Admin] Error updating request status:', updateError);
          } else {
            console.log('[Admin] ✅ Request status updated to approved (already credited)');
          }

          showAlert(
            'ℹ️ Ya Acreditado',
            'Este pago ya había sido acreditado anteriormente.',
            () => {
              // Force reload
              loadRequests();
            },
            'info'
          );
        } else {
          // Payment not confirmed yet, update status back to pending
          await supabase
            .from('manual_verification_requests')
            .update({
              status: 'pending',
              admin_notes: `Estado del pago: ${data.payment.status}. Aún no confirmado.`,
              updated_at: new Date().toISOString(),
            })
            .eq('id', request.id);

          showAlert(
            'ℹ️ Pago No Confirmado',
            `El pago aún no ha sido confirmado.\n\n` +
            `Estado actual: ${data.payment.status}\n\n` +
            `Por favor, espera a que el pago sea confirmado antes de aprobarlo.`,
            () => {
              loadRequests();
            },
            'info'
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

        showAlert(
          'Error',
          data.error || 'Error al verificar el pago',
          () => {
            loadRequests();
          },
          'error'
        );
      }
    } catch (error: any) {
      console.error('[Admin] Error approving request:', error);
      
      // Update status back to pending with error
      await supabase
        .from('manual_verification_requests')
        .update({
          status: 'pending',
          admin_notes: `Error: ${error.message}`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', request.id);

      showAlert(
        'Error',
        error.message || 'Error al aprobar la solicitud',
        () => {
          loadRequests();
        },
        'error'
      );
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(request.id);
        return newSet;
      });
      setSelectedRequest(null);
      setApprovedUsdtAmount('');
    }
  };

  const openRejectModal = (request: any) => {
    setSelectedRequest(request);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const rejectRequest = async () => {
    if (!rejectReason.trim()) {
      showAlert('Error', 'Por favor ingresa un motivo de rechazo', undefined, 'error');
      return;
    }

    setShowRejectModal(false);
    setProcessingRequests(prev => new Set(prev).add(selectedRequest.id));

    try {
      console.log(`[Admin] Rejecting request ${selectedRequest.id}`);

      const { error: updateError } = await supabase
        .from('manual_verification_requests')
        .update({
          status: 'rejected',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: rejectReason.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedRequest.id);

      if (updateError) {
        throw updateError;
      }

      console.log('[Admin] ✅ Request rejected successfully');

      showAlert(
        '✅ Solicitud Rechazada',
        'La solicitud ha sido rechazada exitosamente. El usuario recibirá una notificación con el motivo.',
        () => {
          loadRequests();
        },
        'success'
      );
    } catch (error: any) {
      console.error('[Admin] Error rejecting request:', error);
      showAlert(
        'Error',
        error.message || 'Error al rechazar la solicitud',
        undefined,
        'error'
      );
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedRequest.id);
        return newSet;
      });
      setSelectedRequest(null);
      setRejectReason('');
    }
  };

  const openMoreInfoModal = (request: any) => {
    setSelectedRequest(request);
    setMoreInfoText('');
    setShowMoreInfoModal(true);
  };

  const requestMoreInfo = async () => {
    if (!moreInfoText.trim()) {
      showAlert('Error', 'Por favor ingresa la información que necesitas', undefined, 'error');
      return;
    }

    setShowMoreInfoModal(false);
    setProcessingRequests(prev => new Set(prev).add(selectedRequest.id));

    try {
      console.log(`[Admin] Requesting more info for request ${selectedRequest.id}`);

      const { error: updateError } = await supabase
        .from('manual_verification_requests')
        .update({
          status: 'more_info_requested',
          admin_request_info: moreInfoText.trim(),
          admin_request_info_at: new Date().toISOString(),
          reviewed_by: user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedRequest.id);

      if (updateError) {
        throw updateError;
      }

      console.log('[Admin] ✅ More info requested successfully');

      showAlert(
        '✅ Información Solicitada',
        'Se ha solicitado más información al usuario. El usuario recibirá una notificación.',
        () => {
          loadRequests();
        },
        'success'
      );
    } catch (error: any) {
      console.error('[Admin] Error requesting more info:', error);
      showAlert(
        'Error',
        error.message || 'Error al solicitar más información',
        undefined,
        'error'
      );
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedRequest.id);
        return newSet;
      });
      setSelectedRequest(null);
      setMoreInfoText('');
    }
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
      case 'more_info_requested':
        return '#9C27B0';
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
      case 'more_info_requested':
        return 'Info Solicitada';
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

  if (error) {
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
        <View style={styles.errorContainer}>
          <IconSymbol
            ios_icon_name="exclamationmark.triangle"
            android_material_icon_name="error"
            size={64}
            color={colors.error}
          />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={[styles.approveButton, { marginTop: 20 }]}
            onPress={() => {
              setLoading(true);
              loadRequests();
            }}
          >
            <Text style={styles.buttonText}>Reintentar</Text>
          </TouchableOpacity>
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
          style={[styles.tab, activeTab === 'approved' && styles.tabActive]}
          onPress={() => setActiveTab('approved')}
        >
          <Text style={[styles.tabText, activeTab === 'approved' && styles.tabTextActive]}>
            Aprobadas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'rejected' && styles.tabActive]}
          onPress={() => setActiveTab('rejected')}
        >
          <Text style={[styles.tabText, activeTab === 'rejected' && styles.tabTextActive]}>
            Rechazadas
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
              : activeTab === 'approved'
              ? 'No hay solicitudes aprobadas.'
              : activeTab === 'rejected'
              ? 'No hay solicitudes rechazadas.'
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
            const isPending = ['pending', 'reviewing', 'more_info_requested'].includes(request.status);
            const isDirectUSDT = request.payments?.tx_hash && !request.payments?.payment_id;
            const isNowPayments = !!request.payments?.payment_id;

            return (
              <View key={index} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <Text style={styles.requestAmount}>
                    {parseFloat(request.payments?.price_amount || 0).toFixed(2)} USDT
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

                {/* Payment Type Badge */}
                <View style={[styles.paymentTypeBadge, { backgroundColor: isDirectUSDT ? '#FF9800' : '#2196F3' }]}>
                  <Text style={styles.paymentTypeText}>
                    {isDirectUSDT ? '💰 USDT Directo' : '🔄 NowPayments'}
                  </Text>
                </View>

                <View style={styles.requestRow}>
                  <Text style={styles.requestLabel}>Usuario:</Text>
                  <Text style={styles.requestValue}>{request.users?.email || 'N/A'}</Text>
                </View>

                <View style={styles.requestRow}>
                  <Text style={styles.requestLabel}>Nombre:</Text>
                  <Text style={styles.requestValue}>{request.users?.name || 'N/A'}</Text>
                </View>

                <View style={styles.requestRow}>
                  <Text style={styles.requestLabel}>MXI a Acreditar:</Text>
                  <Text style={styles.requestValue}>
                    {parseFloat(request.payments?.mxi_amount || 0).toFixed(2)} MXI
                  </Text>
                </View>

                <View style={styles.requestRow}>
                  <Text style={styles.requestLabel}>Balance Actual:</Text>
                  <Text style={styles.requestValue}>
                    {parseFloat(request.users?.mxi_balance || 0).toFixed(2)} MXI
                  </Text>
                </View>

                <View style={styles.requestRow}>
                  <Text style={styles.requestLabel}>Fase:</Text>
                  <Text style={styles.requestValue}>Fase {request.payments?.phase || 1}</Text>
                </View>

                <View style={styles.requestRow}>
                  <Text style={styles.requestLabel}>Moneda:</Text>
                  <Text style={styles.requestValue}>
                    {(request.payments?.pay_currency || 'usdt').toUpperCase()}
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
                  <Text style={styles.orderIdText}>{request.payments?.order_id || 'N/A'}</Text>
                </View>

                {request.payments?.payment_id && (
                  <View style={styles.orderIdContainer}>
                    <Text style={styles.orderIdLabel}>Payment ID:</Text>
                    <Text style={styles.orderIdText}>{request.payments.payment_id}</Text>
                  </View>
                )}

                {request.payments?.tx_hash && (
                  <View style={styles.orderIdContainer}>
                    <Text style={styles.orderIdLabel}>Transaction Hash:</Text>
                    <Text style={styles.orderIdText}>{request.payments.tx_hash}</Text>
                  </View>
                )}

                {request.admin_request_info && (
                  <View style={styles.adminRequestBox}>
                    <Text style={styles.adminRequestLabel}>
                      📋 Información Solicitada al Usuario:
                    </Text>
                    <Text style={styles.adminRequestText}>{request.admin_request_info}</Text>
                    {request.admin_request_info_at && (
                      <Text style={[styles.adminRequestText, { fontSize: 11, marginTop: 4, fontStyle: 'italic' }]}>
                        Solicitado: {new Date(request.admin_request_info_at).toLocaleString()}
                      </Text>
                    )}
                  </View>
                )}

                {request.user_response && (
                  <View style={styles.userResponseBox}>
                    <Text style={styles.userResponseLabel}>
                      💬 Respuesta del Usuario:
                    </Text>
                    <Text style={styles.userResponseText}>{request.user_response}</Text>
                    {request.user_response_at && (
                      <Text style={[styles.userResponseText, { fontSize: 11, marginTop: 4, fontStyle: 'italic' }]}>
                        Respondido: {new Date(request.user_response_at).toLocaleString()}
                      </Text>
                    )}
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
                      onPress={() => openApproveModal(request)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <React.Fragment>
                          <IconSymbol
                            ios_icon_name="checkmark.circle.fill"
                            android_material_icon_name="check_circle"
                            size={20}
                            color="#FFFFFF"
                          />
                          <Text style={styles.buttonText}>Aprobar</Text>
                        </React.Fragment>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.moreInfoButton, isProcessing && styles.buttonDisabled]}
                      onPress={() => openMoreInfoModal(request)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <React.Fragment>
                          <IconSymbol
                            ios_icon_name="questionmark.circle.fill"
                            android_material_icon_name="help"
                            size={20}
                            color="#FFFFFF"
                          />
                          <Text style={styles.buttonText}>Más Info</Text>
                        </React.Fragment>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.rejectButton, isProcessing && styles.buttonDisabled]}
                      onPress={() => openRejectModal(request)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <React.Fragment>
                          <IconSymbol
                            ios_icon_name="xmark.circle.fill"
                            android_material_icon_name="cancel"
                            size={20}
                            color="#FFFFFF"
                          />
                          <Text style={styles.buttonText}>Rechazar</Text>
                        </React.Fragment>
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

      {/* Approve Modal */}
      <Modal
        visible={showApproveModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowApproveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Aprobar Verificación</Text>
            
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                {selectedRequest && selectedRequest.payments?.tx_hash && !selectedRequest.payments?.payment_id
                  ? '⚠️ Este es un pago USDT directo. Verifica la transacción en la blockchain y ajusta el monto si es necesario.'
                  : '⚠️ Este es un pago de NowPayments. Puedes aprobar manualmente sin verificar con la API de NowPayments. Ajusta el monto si es necesario.'}
              </Text>
            </View>
            
            <Text style={styles.amountInputLabel}>Cantidad USDT Aprobada:</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="Ej: 50.00"
              placeholderTextColor={colors.textSecondary}
              value={approvedUsdtAmount}
              onChangeText={setApprovedUsdtAmount}
              keyboardType="decimal-pad"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowApproveModal(false);
                  setApprovedUsdtAmount('');
                  setSelectedRequest(null);
                }}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextCancel]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSubmit]}
                onPress={approveRequest}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextSubmit]}>
                  Aprobar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* More Info Modal */}
      <Modal
        visible={showMoreInfoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMoreInfoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Solicitar Más Información</Text>
            <Text style={[styles.requestLabel, { marginBottom: 12 }]}>
              ¿Qué información necesitas del usuario?
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ej: Por favor proporciona el comprobante de pago o más detalles sobre la transacción..."
              placeholderTextColor={colors.textSecondary}
              value={moreInfoText}
              onChangeText={setMoreInfoText}
              multiline
              numberOfLines={4}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowMoreInfoModal(false);
                  setMoreInfoText('');
                  setSelectedRequest(null);
                }}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextCancel]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSubmit]}
                onPress={requestMoreInfo}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextSubmit]}>
                  Enviar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reject Modal */}
      <Modal
        visible={showRejectModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRejectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rechazar Solicitud</Text>
            <Text style={[styles.requestLabel, { marginBottom: 12 }]}>
              ¿Por qué estás rechazando esta solicitud?
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ej: La transacción no se encontró en la blockchain, el monto es insuficiente, etc..."
              placeholderTextColor={colors.textSecondary}
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={4}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedRequest(null);
                }}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextCancel]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSubmit]}
                onPress={rejectRequest}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextSubmit]}>
                  Rechazar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
</write file>

Now let me update the user-facing manual verification page to prevent loading loops:

<write file="app/(tabs)/(home)/manual-verification.tsx">
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import * as Clipboard2 from 'expo-clipboard';
import { showConfirm, showAlert } from '@/utils/confirmDialog';

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
  const { t } = useLanguage();
  
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

  // Use useCallback to prevent infinite loops
  const loadPayments = useCallback(async () => {
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
      showAlert(t('error'), t('couldNotLoadVestingInfo'), undefined, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, t]);

  const loadVerificationRequests = useCallback(async () => {
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
  }, [user]);

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
  }, [user, loadPayments, loadVerificationRequests]);

  const onRefresh = useCallback(() => {
    console.log('🔵 [ManualVerification] Refreshing data...');
    setRefreshing(true);
    loadPayments();
    loadVerificationRequests();
  }, [loadPayments, loadVerificationRequests]);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await Clipboard2.setStringAsync(text);
      showAlert(t('copied2'), `${label} ${t('addressCopiedToClipboard')}`, undefined, 'success');
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
      showAlert(t('error'), t('authenticationErrorText'), undefined, 'error');
      return;
    }

    if (!session) {
      console.error('❌ [ManualVerification] No session found!');
      showAlert(t('error'), t('authenticationErrorText'), undefined, 'error');
      return;
    }

    // Check if verification request already exists
    const existingRequest = verificationRequests.get(payment.id);
    if (existingRequest) {
      console.log('⚠️ [ManualVerification] Verification request already exists:', existingRequest);
      showAlert(
        t('existingRequest'),
        t('existingRequestMessage', { status: existingRequest.status }),
        undefined,
        'warning'
      );
      return;
    }

    showConfirm({
      title: t('requestManualVerificationNowPayments'),
      message: t('doYouWantToRequestNowPaymentsVerification', {
        amount: parseFloat(payment.price_amount).toFixed(2),
        mxi: parseFloat(payment.mxi_amount).toFixed(2),
        order: payment.order_id
      }),
      confirmText: t('request'),
      cancelText: t('cancel'),
      onConfirm: async () => {
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

          showAlert(
            t('requestSentSuccessfullyTitle'),
            t('requestSentMessage'),
            () => {
              console.log('🟢 [ManualVerification] Reloading verification requests...');
              loadVerificationRequests();
            },
            'success'
          );
        } catch (error: any) {
          console.error('❌ [ManualVerification] === ERROR REQUESTING VERIFICATION ===');
          console.error('❌ [ManualVerification] Error object:', JSON.stringify(error, null, 2));
          console.error('❌ [ManualVerification] Error message:', error.message);
          console.error('❌ [ManualVerification] Error details:', error.details);
          console.error('❌ [ManualVerification] Error hint:', error.hint);
          console.error('❌ [ManualVerification] Error code:', error.code);
          
          showAlert(
            t('error'), 
            t('couldNotSendVerificationRequestText', { error: error.message || t('unknownError'), code: error.code || 'N/A' }),
            undefined,
            'error'
          );
        }
      },
      onCancel: () => {
        console.log('🟡 [ManualVerification] User cancelled verification request');
      },
      type: 'warning',
    });
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
      showAlert(t('error'), t('authenticationErrorText'), undefined, 'error');
      return;
    }

    if (!session) {
      console.error('❌ [ManualVerification] No session found!');
      showAlert(t('error'), t('authenticationErrorText'), undefined, 'error');
      return;
    }

    if (!txHash.trim()) {
      console.log('⚠️ [ManualVerification] Empty TX hash');
      showAlert(t('error'), t('pleaseEnterTransactionHash'), undefined, 'error');
      return;
    }

    if (!txHash.startsWith('0x') || txHash.length !== 66) {
      console.log('⚠️ [ManualVerification] Invalid TX hash format');
      showAlert(
        t('invalidHash'),
        t('hashMustStartWith0x', { count: txHash.length }),
        undefined,
        'error'
      );
      return;
    }

    const selectedNetworkData = NETWORKS.find(n => n.id === selectedNetwork);
    console.log('🟢 [ManualVerification] Selected network data:', selectedNetworkData);

    showConfirm({
      title: t('requestManualUSDTVerification'),
      message: t('doYouWantToRequestManualVerification', {
        network: selectedNetworkData?.name,
        label: selectedNetworkData?.label,
        hash: `${txHash.substring(0, 10)}...${txHash.substring(txHash.length - 8)}`
      }),
      confirmText: t('sendRequest'),
      cancelText: t('cancel'),
      onConfirm: async () => {
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
            throw new Error(t('databaseErrorText', { message: duplicateError.message }));
          }

          if (existingPayments && existingPayments.length > 0) {
            const existingPayment = existingPayments[0];
            console.log('⚠️ [ManualVerification] Duplicate hash found:', existingPayment);
            showAlert(
              t('hashDuplicateTitle'),
              t('hashAlreadyRegisteredText', { order: existingPayment.order_id, status: existingPayment.estado }),
              undefined,
              'warning'
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

          showAlert(
            t('requestSentSuccessfullyTitle'),
            t('manualVerificationRequestSentText', {
              order: orderId,
              network: selectedNetworkData?.name,
              hash: `${txHash.substring(0, 10)}...${txHash.substring(txHash.length - 8)}`
            }),
            () => {
              console.log('🟢 [ManualVerification] Clearing form and reloading data...');
              setTxHash('');
              loadPayments();
              loadVerificationRequests();
            },
            'success'
          );
        } catch (error: any) {
          console.error('❌ [ManualVerification] === ERROR REQUESTING USDT VERIFICATION ===');
          console.error('❌ [ManualVerification] Error object:', JSON.stringify(error, null, 2));
          console.error('❌ [ManualVerification] Error message:', error.message);
          console.error('❌ [ManualVerification] Error details:', error.details);
          console.error('❌ [ManualVerification] Error hint:', error.hint);
          console.error('❌ [ManualVerification] Error code:', error.code);
          
          showAlert(
            t('error'), 
            t('couldNotSendVerificationRequestText', { error: error.message || t('unknownError'), code: error.code || 'N/A' }),
            undefined,
            'error'
          );
        } finally {
          console.log('🟢 [ManualVerification] Resetting requesting state');
          setRequestingManualVerification(false);
        }
      },
      onCancel: () => {
        console.log('🟡 [ManualVerification] User cancelled USDT verification request');
      },
      type: 'warning',
    });
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
      showAlert(t('error'), t('pleaseEnterSubjectAndMessageText'), undefined, 'error');
      return;
    }

    if (!user) {
      console.error('❌ [ManualVerification] No user found!');
      showAlert(t('error'), t('authenticationErrorText'), undefined, 'error');
      return;
    }

    if (!session) {
      console.error('❌ [ManualVerification] No session found!');
      showAlert(t('error'), t('authenticationErrorText'), undefined, 'error');
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

      showAlert(
        t('responseSent'),
        t('responseSentToAdministrator'),
        () => {
          console.log('🟢 [ManualVerification] Reloading verification requests...');
          loadVerificationRequests();
        },
        'success'
      );
    } catch (error: any) {
      console.error('❌ [ManualVerification] === ERROR SUBMITTING RESPONSE ===');
      console.error('❌ [ManualVerification] Error object:', JSON.stringify(error, null, 2));
      console.error('❌ [ManualVerification] Error message:', error.message);
      console.error('❌ [ManualVerification] Error code:', error.code);
      
      showAlert(t('error'), error.message || t('errorSendingResponse'), undefined, 'error');
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
        return t('completed');
      case 'confirmed':
        return t('confirmed');
      case 'waiting':
        return t('waitingForPayment');
      case 'pending':
        return t('pending');
      case 'confirming':
        return t('confirming');
      case 'failed':
        return t('failed');
      case 'expired':
        return t('expired');
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
          <Text style={styles.headerTitle}>{t('manualVerification')}</Text>
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
        <Text style={styles.headerTitle}>{t('manualVerification')}</Text>
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
            {t('nowPayments')}
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
            {t('directUSDT')}
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
                <Text style={styles.infoTitle}>{t('verificationOfNowPayments')}</Text>
              </View>
              <Text style={styles.infoText}>
                {t('viewHistoryAndRequestManualVerification')}
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
                  {t('noNowPaymentsRegistered')}
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
                      <Text style={styles.paymentLabel}>{t('currency')}:</Text>
                      <Text style={styles.paymentValue}>{payment.pay_currency.toUpperCase()}</Text>
                    </View>

                    <View style={styles.orderIdContainer}>
                      <View style={styles.orderIdHeader}>
                        <Text style={styles.orderIdLabel}>{t('order')}:</Text>
                        <TouchableOpacity onPress={() => copyToClipboard(payment.order_id, t('order'))}>
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
                          <Text style={styles.orderIdLabel}>{t('paymentID')}:</Text>
                          <TouchableOpacity onPress={() => copyToClipboard(payment.payment_id, t('paymentID'))}>
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
                      <Text style={styles.paymentLabel}>{t('date')}:</Text>
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
                          {t('manualVerificationRequested')}
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
                          {t('administratorReviewingPayment')}
                        </Text>
                      </View>
                    )}

                    {verificationRequest && verificationRequest.status === 'more_info_requested' && (
                      <View style={styles.moreInfoRequestedBadge}>
                        <Text style={styles.moreInfoRequestedTitle}>
                          {t('administratorRequestsMoreInfo')}
                        </Text>
                        {verificationRequest.admin_request_info && (
                          <View style={styles.adminRequestBox}>
                            <Text style={styles.adminRequestLabel}>{t('informationRequested')}</Text>
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
                              {t('responseSent')}
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
                            <Text style={styles.respondButtonText}>{t('respond')}</Text>
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
                        <Text style={styles.approvedText}>{t('manualVerificationApproved')}</Text>
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
                          {t('rejectedReason', { reason: verificationRequest.admin_notes || t('noReason') })}
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
                          {t('requestManualVerificationButton')}
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
                        <Text style={styles.successText}>{t('paymentCreditedSuccessfully')}</Text>
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
                <Text style={styles.infoTitle}>{t('verificationOfUSDT')}</Text>
              </View>
              <Text style={styles.infoText}>
                {t('requestManualVerificationOfUSDT')}
              </Text>
            </View>

            {/* Network Selector */}
            <View style={styles.networkCard}>
              <Text style={styles.networkTitle}>{t('selectPaymentNetwork')}</Text>
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
              <Text style={styles.inputLabel}>{t('transactionHashTxHash')}</Text>
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
                {t('pasteYourTransactionHash', { network: NETWORKS.find(n => n.id === selectedNetwork)?.name })}
              </Text>
              {txHash.length > 0 && (
                <Text style={[styles.inputHint, { marginTop: 4, color: txHash.length === 66 ? '#4CAF50' : colors.warning }]}>
                  {txHash.length === 66 ? t('correctLength') : t('charactersCount', { count: txHash.length })}
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
                  <Text style={styles.requestUSDTVerificationButtonText}>{t('sendingRequestText')}</Text>
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
                    {t('requestManualVerificationButton')}
                  </Text>
                </React.Fragment>
              )}
            </TouchableOpacity>

            {/* USDT Payment History */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('usdtPaymentHistory')}</Text>
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
                  {t('noUSDTPaymentsRegistered')}
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
                      <Text style={styles.paymentLabel}>{t('network')}:</Text>
                      <Text style={styles.paymentValue}>{payment.pay_currency.toUpperCase()}</Text>
                    </View>

                    {payment.tx_hash && (
                      <View style={styles.orderIdContainer}>
                        <View style={styles.orderIdHeader}>
                          <Text style={styles.orderIdLabel}>{t('transactionHash')}:</Text>
                          <TouchableOpacity onPress={() => copyToClipboard(payment.tx_hash, t('transactionHash'))}>
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
                      <Text style={styles.paymentLabel}>{t('date')}:</Text>
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
                          {t('manualVerificationRequested')}
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
                          {t('administratorReviewingPayment')}
                        </Text>
                      </View>
                    )}

                    {verificationRequest && verificationRequest.status === 'more_info_requested' && (
                      <View style={styles.moreInfoRequestedBadge}>
                        <Text style={styles.moreInfoRequestedTitle}>
                          {t('administratorRequestsMoreInfo')}
                        </Text>
                        {verificationRequest.admin_request_info && (
                          <View style={styles.adminRequestBox}>
                            <Text style={styles.adminRequestLabel}>{t('informationRequested')}</Text>
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
                              {t('responseSent')}
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
                            <Text style={styles.respondButtonText}>{t('respond')}</Text>
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
                        <Text style={styles.approvedText}>{t('manualVerificationApproved')}</Text>
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
                          {t('rejectedReason', { reason: verificationRequest.admin_notes || t('noReason') })}
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
                        <Text style={styles.successText}>{t('paymentCreditedSuccessfully')}</Text>
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
            <Text style={styles.modalTitle}>{t('respondToAdministrator')}</Text>
            {selectedVerificationRequest?.admin_request_info && (
              <View style={styles.adminRequestBox}>
                <Text style={styles.adminRequestLabel}>{t('informationRequested')}</Text>
                <Text style={styles.adminRequestText}>
                  {selectedVerificationRequest.admin_request_info}
                </Text>
              </View>
            )}
            <Text style={[styles.paymentLabel, { marginTop: 16, marginBottom: 12 }]}>
              {t('yourResponse')}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder={t('writeYourResponseHere')}
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
                  {t('cancel')}
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
                    {t('send')}
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
