
import React, { useState, useEffect, useCallback, useRef } from 'react';
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

/**
 * ✅ ULTRA-ROBUST NUMERIC PARSER
 * PostgreSQL numeric type is ALWAYS returned as STRING by Supabase JavaScript client
 * This function handles ALL edge cases and ensures we ALWAYS get a valid number
 */
const parseNumericValue = (value: any, fieldName: string = 'unknown'): number => {
  console.log(`[PARSE] ${fieldName}:`, {
    value,
    type: typeof value,
    isNull: value === null,
    isUndefined: value === undefined,
  });

  // Handle null/undefined
  if (value === null || value === undefined) {
    console.log(`[PARSE] ${fieldName}: NULL/UNDEFINED → 0`);
    return 0;
  }

  // If already a valid number
  if (typeof value === 'number') {
    if (isNaN(value) || !isFinite(value)) {
      console.log(`[PARSE] ${fieldName}: Invalid number (NaN/Infinity) → 0`);
      return 0;
    }
    console.log(`[PARSE] ${fieldName}: Valid number → ${value}`);
    return value;
  }

  // Convert to string and clean (PostgreSQL numeric comes as string)
  const stringValue = String(value).trim();
  
  if (stringValue === '' || stringValue === 'null' || stringValue === 'undefined') {
    console.log(`[PARSE] ${fieldName}: Empty/null string → 0`);
    return 0;
  }

  // Try parseFloat (this handles PostgreSQL numeric strings like "30" or "30.50")
  const parsed = parseFloat(stringValue);
  if (!isNaN(parsed) && isFinite(parsed)) {
    console.log(`[PARSE] ${fieldName}: Parsed "${stringValue}" → ${parsed}`);
    return parsed;
  }

  console.log(`[PARSE] ${fieldName}: PARSING FAILED → 0`);
  return 0;
};

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
  
  const loadingRef = useRef(false);

  const loadRequests = useCallback(async (skipLoadingState = false) => {
    if (loadingRef.current) {
      console.log('[Admin] Already loading, skipping duplicate load');
      return;
    }
    
    loadingRef.current = true;
    
    try {
      if (!skipLoadingState) {
        setError(null);
      }
      console.log(`[Admin] ========================================`);
      console.log(`[Admin] === LOADING VERIFICATION REQUESTS ===`);
      console.log(`[Admin] ========================================`);
      console.log(`[Admin] Tab: ${activeTab}`);
      console.log(`[Admin] Timestamp:`, new Date().toISOString());
      
      // ✅ STEP 1: Load manual verification requests
      let query = supabase
        .from('manual_verification_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (activeTab === 'pending') {
        query = query.in('status', ['pending', 'reviewing', 'more_info_requested']);
      } else if (activeTab === 'approved') {
        query = query.eq('status', 'approved');
      } else if (activeTab === 'rejected') {
        query = query.eq('status', 'rejected');
      }

      const { data: requestsData, error: requestsError } = await query;

      if (requestsError) {
        console.error('[Admin] ❌ Error loading requests:', requestsError);
        setError(requestsError.message);
        throw requestsError;
      }

      console.log(`[Admin] ✅ Loaded ${requestsData?.length || 0} verification requests`);

      if (!requestsData || requestsData.length === 0) {
        console.log('[Admin] No requests found');
        setRequests([]);
        return;
      }

      // ✅ STEP 2: Extract payment IDs and user IDs
      const paymentIds = requestsData.map(r => r.payment_id).filter(Boolean);
      const userIds = requestsData.map(r => r.user_id).filter(Boolean);

      console.log(`[Admin] Payment IDs to fetch: ${paymentIds.length}`);
      console.log(`[Admin] User IDs to fetch: ${userIds.length}`);

      // ✅ STEP 3: Fetch all payments in one query
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .in('id', paymentIds);

      if (paymentsError) {
        console.error('[Admin] ❌ Error loading payments:', paymentsError);
      } else {
        console.log(`[Admin] ✅ Loaded ${paymentsData?.length || 0} payments`);
      }

      // ✅ STEP 4: Fetch all users in one query
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, email, name, mxi_balance')
        .in('id', userIds);

      if (usersError) {
        console.error('[Admin] ❌ Error loading users:', usersError);
      } else {
        console.log(`[Admin] ✅ Loaded ${usersData?.length || 0} users`);
      }

      // ✅ STEP 5: Create lookup maps for O(1) access
      const paymentsMap = new Map();
      (paymentsData || []).forEach(payment => {
        paymentsMap.set(payment.id, payment);
      });

      const usersMap = new Map();
      (usersData || []).forEach(user => {
        usersMap.set(user.id, user);
      });

      console.log(`[Admin] 📊 Created lookup maps: ${paymentsMap.size} payments, ${usersMap.size} users`);

      // ✅ STEP 6: Enrich requests with payment and user data + parse numeric values
      const enrichedRequests = requestsData.map((request, index) => {
        console.log(`[Admin] ========================================`);
        console.log(`[Admin] === Processing Request ${index + 1}/${requestsData.length} ===`);
        console.log(`[Admin] Request ID: ${request.id}`);

        // Get payment and user from maps
        const payment = paymentsMap.get(request.payment_id);
        const user = usersMap.get(request.user_id);

        if (!payment) {
          console.warn(`[Admin] ⚠️ Payment not found for request ${request.id}`);
        }
        if (!user) {
          console.warn(`[Admin] ⚠️ User not found for request ${request.id}`);
        }

        // ✅ CRITICAL FIX: Parse numeric values using ultra-robust parser
        const priceAmount = parseNumericValue(payment?.price_amount, `request_${index}_price_amount`);
        const mxiAmount = parseNumericValue(payment?.mxi_amount, `request_${index}_mxi_amount`);
        const userBalance = parseNumericValue(user?.mxi_balance, `request_${index}_user_balance`);
        
        console.log(`[Admin] ✅ Parsed numeric values:`, {
          priceAmount,
          mxiAmount,
          userBalance,
        });

        console.log(`[Admin] ========================================`);
        
        return {
          ...request,
          payment: payment || {},
          user: user || {},
          // ✅ CRITICAL: Store parsed values directly on the request object
          price_amount_parsed: priceAmount,
          mxi_amount_parsed: mxiAmount,
          user_balance_parsed: userBalance,
        };
      });
      
      console.log(`[Admin] ✅ Successfully enriched ${enrichedRequests.length} requests`);
      
      setRequests(enrichedRequests);
    } catch (error: any) {
      console.error('[Admin] ❌ CRITICAL ERROR loading verification requests:', error);
      if (!skipLoadingState) {
        setError(error.message || 'Error al cargar las solicitudes');
      }
    } finally {
      loadingRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  useEffect(() => {
    console.log('[Admin] Setting up verification requests screen');
    loadRequests();

    const channel = supabase
      .channel('admin-verification-requests-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'manual_verification_requests',
        },
        (payload) => {
          console.log('[Admin] Verification request update received:', payload);
          setTimeout(() => {
            console.log('[Admin] Reloading requests after real-time update...');
            loadRequests(true);
          }, 500);
        }
      )
      .subscribe((status) => {
        console.log('[Admin] Subscription status:', status);
      });

    return () => {
      console.log('[Admin] Cleaning up verification requests screen');
      supabase.removeChannel(channel);
    };
  }, [loadRequests]);

  const onRefresh = useCallback(() => {
    console.log('[Admin] Manual refresh triggered');
    setRefreshing(true);
    loadRequests();
  }, [loadRequests]);

  const openApproveModal = (request: any) => {
    console.log('[Admin] ========================================');
    console.log('[Admin] === OPENING APPROVE MODAL ===');
    console.log('[Admin] Request ID:', request.id);
    console.log('[Admin] Pre-parsed price_amount:', request.price_amount_parsed);
    
    setSelectedRequest(request);
    
    // ✅ CRITICAL FIX: Use the pre-parsed value stored on the request object
    const parsedAmount = request.price_amount_parsed || 0;
    console.log('[Admin] Using parsed amount for modal:', parsedAmount);
    
    const formattedAmount = parsedAmount.toFixed(2);
    console.log('[Admin] Setting approved amount to:', formattedAmount);
    setApprovedUsdtAmount(formattedAmount);
    
    setShowApproveModal(true);
  };

  const approveRequest = async () => {
    if (!session) {
      showAlert('Error', 'Sesión no válida', undefined, 'error');
      return;
    }

    const request = selectedRequest;
    
    if (!request || !request.payment) {
      showAlert('Error', 'Datos de pago no disponibles', undefined, 'error');
      return;
    }

    const amount = parseFloat(approvedUsdtAmount);
    if (!approvedUsdtAmount || isNaN(amount) || amount <= 0) {
      showAlert('Error', 'Por favor ingresa una cantidad válida de USDT aprobada', undefined, 'error');
      return;
    }

    setShowApproveModal(false);
    setProcessingRequests(prev => new Set(prev).add(request.id));

    try {
      console.log(`[Admin] ========================================`);
      console.log(`[Admin] === APPROVING REQUEST ${request.id} ===`);
      console.log(`[Admin] ========================================`);
      console.log(`[Admin] Approved amount: ${approvedUsdtAmount} USDT`);
      console.log(`[Admin] Order ID: ${request.payment.order_id}`);

      const requestBody: any = {
        order_id: request.payment.order_id,
        approved_usdt_amount: parseFloat(approvedUsdtAmount),
      };

      console.log('[Admin] Calling manual-verify-payment with:', requestBody);

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
        console.log('[Admin] Edge function succeeded, updating request status to approved...');
        
        const updateData = {
          status: 'approved',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: data.credited 
            ? `Pago verificado y acreditado exitosamente. Monto aprobado: ${approvedUsdtAmount} USDT`
            : data.already_credited
            ? 'Pago ya había sido acreditado anteriormente'
            : `Estado del pago: ${data.payment?.status}. Aprobado manualmente.`,
          updated_at: new Date().toISOString(),
        };
        
        console.log('[Admin] Updating manual_verification_requests with:', updateData);
        
        const { error: updateError } = await supabase
          .from('manual_verification_requests')
          .update(updateData)
          .eq('id', request.id);

        if (updateError) {
          console.error('[Admin] Error updating request status:', updateError);
        } else {
          console.log('[Admin] ✅ Request status updated to approved successfully');
        }

        if (data.credited) {
          showAlert(
            '✅ Pago Aprobado y Acreditado',
            `El pago ha sido verificado y acreditado exitosamente.\n\n` +
            `${data.payment.mxi_amount} MXI han sido agregados a la cuenta del usuario.\n` +
            `\nMonto USDT aprobado: ${approvedUsdtAmount}\n` +
            `Nuevo saldo del usuario: ${data.payment.new_balance} MXI`,
            () => {
              console.log('[Admin] Reloading requests after approval...');
              loadRequests();
            },
            'success'
          );
        } else if (data.already_credited) {
          showAlert(
            'ℹ️ Ya Acreditado',
            'Este pago ya había sido acreditado anteriormente. La solicitud ha sido marcada como aprobada.',
            () => {
              console.log('[Admin] Reloading requests after marking as approved...');
              loadRequests();
            },
            'info'
          );
        } else {
          showAlert(
            '✅ Solicitud Aprobada',
            `La solicitud ha sido aprobada.\n\n` +
            `Estado del pago: ${data.payment?.status}\n` +
            `Monto aprobado: ${approvedUsdtAmount} USDT`,
            () => {
              console.log('[Admin] Reloading requests after approval...');
              loadRequests();
            },
            'success'
          );
        }
      } else {
        console.error('[Admin] Edge function failed:', data.error);
        
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
      console.error('[Admin] ========================================');
      console.error('[Admin] === ERROR APPROVING REQUEST ===');
      console.error('[Admin] ========================================');
      console.error('[Admin] Error:', error);
      
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
      console.log(`[Admin] ========================================`);
      console.log(`[Admin] === REJECTING REQUEST ${selectedRequest.id} ===`);
      console.log(`[Admin] ========================================`);
      console.log(`[Admin] Rejection reason:`, rejectReason);

      const updateData = {
        status: 'rejected',
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
        admin_notes: rejectReason.trim(),
        updated_at: new Date().toISOString(),
      };
      
      console.log('[Admin] Updating manual_verification_requests with:', updateData);

      const { error: updateError } = await supabase
        .from('manual_verification_requests')
        .update(updateData)
        .eq('id', selectedRequest.id);

      if (updateError) {
        console.error('[Admin] Error rejecting request:', updateError);
        throw updateError;
      }

      console.log('[Admin] ✅ Request rejected successfully');

      showAlert(
        '✅ Solicitud Rechazada',
        'La solicitud ha sido rechazada exitosamente. El usuario recibirá una notificación con el motivo.',
        () => {
          console.log('[Admin] Reloading requests after rejection...');
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
      console.log(`[Admin] ========================================`);
      console.log(`[Admin] === REQUESTING MORE INFO ${selectedRequest.id} ===`);
      console.log(`[Admin] ========================================`);
      console.log(`[Admin] Info request:`, moreInfoText);

      const updateData = {
        status: 'more_info_requested',
        admin_request_info: moreInfoText.trim(),
        admin_request_info_at: new Date().toISOString(),
        reviewed_by: user?.id,
        updated_at: new Date().toISOString(),
      };
      
      console.log('[Admin] Updating manual_verification_requests with:', updateData);

      const { error: updateError } = await supabase
        .from('manual_verification_requests')
        .update(updateData)
        .eq('id', selectedRequest.id);

      if (updateError) {
        console.error('[Admin] Error requesting more info:', updateError);
        throw updateError;
      }

      console.log('[Admin] ✅ More info requested successfully');

      showAlert(
        '✅ Información Solicitada',
        'Se ha solicitado más información al usuario. El usuario recibirá una notificación.',
        () => {
          console.log('[Admin] Reloading requests after info request...');
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
        return 'Aprobado ✅';
      case 'pending':
        return 'Pendiente 🔄';
      case 'reviewing':
        return 'Revisando 👀';
      case 'rejected':
        return 'Rechazado ❌';
      case 'more_info_requested':
        return 'Info Solicitada 📋';
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
          onPress={() => {
            console.log('[Admin] Switching to pending tab');
            setActiveTab('pending');
            setLoading(true);
          }}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
            Pendientes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'approved' && styles.tabActive]}
          onPress={() => {
            console.log('[Admin] Switching to approved tab');
            setActiveTab('approved');
            setLoading(true);
          }}
        >
          <Text style={[styles.tabText, activeTab === 'approved' && styles.tabTextActive]}>
            Aprobadas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'rejected' && styles.tabActive]}
          onPress={() => {
            console.log('[Admin] Switching to rejected tab');
            setActiveTab('rejected');
            setLoading(true);
          }}
        >
          <Text style={[styles.tabText, activeTab === 'rejected' && styles.tabTextActive]}>
            Rechazadas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.tabActive]}
          onPress={() => {
            console.log('[Admin] Switching to all tab');
            setActiveTab('all');
            setLoading(true);
          }}
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
            const isDirectUSDT = request.payment?.tx_hash && !request.payment?.payment_id;

            // ✅ CRITICAL FIX: Use the pre-parsed values stored on the request object
            const priceAmount = request.price_amount_parsed || 0;
            const mxiAmount = request.mxi_amount_parsed || 0;
            const userBalance = request.user_balance_parsed || 0;

            return (
              <View key={index} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <Text style={styles.requestAmount}>
                    {priceAmount.toFixed(2)} USDT
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

                <View style={[styles.paymentTypeBadge, { backgroundColor: isDirectUSDT ? '#FF9800' : '#2196F3' }]}>
                  <Text style={styles.paymentTypeText}>
                    {isDirectUSDT ? '💰 USDT Directo' : '🔄 NowPayments'}
                  </Text>
                </View>

                <View style={styles.requestRow}>
                  <Text style={styles.requestLabel}>Usuario:</Text>
                  <Text style={styles.requestValue}>{request.user?.email || 'N/A'}</Text>
                </View>

                <View style={styles.requestRow}>
                  <Text style={styles.requestLabel}>Nombre:</Text>
                  <Text style={styles.requestValue}>{request.user?.name || 'N/A'}</Text>
                </View>

                <View style={styles.requestRow}>
                  <Text style={styles.requestLabel}>MXI a Acreditar:</Text>
                  <Text style={styles.requestValue}>
                    {mxiAmount.toFixed(2)} MXI
                  </Text>
                </View>

                <View style={styles.requestRow}>
                  <Text style={styles.requestLabel}>Saldo Actual:</Text>
                  <Text style={styles.requestValue}>
                    {userBalance.toFixed(2)} MXI
                  </Text>
                </View>

                <View style={styles.requestRow}>
                  <Text style={styles.requestLabel}>Fase:</Text>
                  <Text style={styles.requestValue}>Fase {request.payment?.phase || 1}</Text>
                </View>

                <View style={styles.requestRow}>
                  <Text style={styles.requestLabel}>Moneda:</Text>
                  <Text style={styles.requestValue}>
                    {(request.payment?.pay_currency || 'usdt').toUpperCase()}
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
                  <Text style={styles.orderIdText}>{request.payment?.order_id || request.order_id || 'N/A'}</Text>
                </View>

                {request.payment?.payment_id && (
                  <View style={styles.orderIdContainer}>
                    <Text style={styles.orderIdLabel}>Payment ID:</Text>
                    <Text style={styles.orderIdText}>{request.payment.payment_id}</Text>
                  </View>
                )}

                {request.payment?.tx_hash && (
                  <View style={styles.orderIdContainer}>
                    <Text style={styles.orderIdLabel}>Transaction Hash:</Text>
                    <Text style={styles.orderIdText}>{request.payment.tx_hash}</Text>
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
                {selectedRequest && selectedRequest.payment?.tx_hash && !selectedRequest.payment?.payment_id
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
