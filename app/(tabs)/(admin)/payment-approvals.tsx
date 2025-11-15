
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface OKXPayment {
  id: string;
  user_id: string;
  payment_id: string;
  usdt_amount: number;
  mxi_amount: number;
  status: string;
  created_at: string;
  expires_at: string;
  confirmed_at: string | null;
  user_email: string;
  user_name: string;
  verification_attempts: number;
  okx_transaction_id: string | null;
}

interface ApiError {
  error: string;
  code?: string;
  message?: string;
  requestId?: string;
}

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// Helper function to sleep
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to check if error is retryable
const isRetryableError = (error: any): boolean => {
  if (!error) return false;
  
  // Network errors
  if (error.message?.includes('network') || error.message?.includes('fetch')) {
    return true;
  }
  
  // Timeout errors
  if (error.message?.includes('timeout')) {
    return true;
  }
  
  // Server errors (5xx)
  if (error.code === 'DATABASE_ERROR' || error.code === 'NETWORK_ERROR') {
    return true;
  }
  
  return false;
};

export default function PaymentApprovalsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payments, setPayments] = useState<OKXPayment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<OKXPayment | null>(null);
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState<'awaiting' | 'pending' | 'all'>('awaiting');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    loadPayments();
  }, [filter]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      console.log('=== LOADING PAYMENTS ===');
      console.log('Filter:', filter);

      let query = supabase
        .from('okx_payments')
        .select(`
          *,
          users!inner(email, name)
        `)
        .order('created_at', { ascending: false });

      if (filter === 'awaiting') {
        // Show both pending and confirming statuses for admin approval
        query = query.in('status', ['pending', 'confirming']);
      } else if (filter === 'pending') {
        query = query.eq('status', 'pending');
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading payments:', error);
        throw error;
      }

      const mapped = data?.map((p: any) => ({
        ...p,
        user_email: p.users.email,
        user_name: p.users.name,
      })) || [];

      setPayments(mapped);
      console.log(`Loaded ${mapped.length} payments with filter: ${filter}`);
    } catch (error) {
      console.error('Error loading payments:', error);
      Alert.alert('Error', 'Failed to load payments. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPayments();
  };

  // Robust API call with retry logic
  const callPaymentAPI = async (
    paymentId: string,
    action: 'confirm' | 'reject',
    retries = MAX_RETRIES
  ): Promise<any> => {
    let lastError: any = null;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        console.log(`[Attempt ${attempt + 1}/${retries}] Calling payment API - Action: ${action}, Payment: ${paymentId}`);

        // Get current session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw new Error(`Session error: ${sessionError.message}`);
        }

        if (!sessionData?.session) {
          console.error('No session found');
          throw new Error('No active session. Please log in again.');
        }

        const session = sessionData.session;
        console.log('Session obtained successfully');

        // Construct Edge Function URL
        const supabaseUrl = 'https://aeyfnjuatbtcauiumbhn.supabase.co';
        const functionName = 'okx-payment-verification';
        const functionUrl = `${supabaseUrl}/functions/v1/${functionName}`;

        // Prepare request payload
        const requestPayload = {
          paymentId: paymentId,
          action: action,
        };

        console.log('Calling Edge Function:', functionUrl);
        console.log('Payload:', requestPayload);

        // Make the API call with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        let response: Response;
        try {
          response = await fetch(functionUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
              'apikey': session.access_token,
            },
            body: JSON.stringify(requestPayload),
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timeoutId);
        }

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        // Read response body
        const responseText = await response.text();
        console.log('Response text:', responseText);

        // Parse JSON response
        let result: any;
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}`);
        }

        // Check for errors
        if (!response.ok) {
          const apiError: ApiError = result;
          const errorMessage = apiError.message || apiError.error || `HTTP ${response.status}`;
          
          console.error('API error:', apiError);
          
          // Check if error is retryable
          if (isRetryableError(apiError) && attempt < retries - 1) {
            const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt); // Exponential backoff
            console.log(`Retryable error detected. Waiting ${delay}ms before retry...`);
            await sleep(delay);
            lastError = new Error(errorMessage);
            continue; // Retry
          }
          
          throw new Error(errorMessage);
        }

        if (result.error) {
          console.error('Result contains error:', result.error);
          
          // Check if error is retryable
          if (isRetryableError(result) && attempt < retries - 1) {
            const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
            console.log(`Retryable error detected. Waiting ${delay}ms before retry...`);
            await sleep(delay);
            lastError = new Error(result.error);
            continue; // Retry
          }
          
          throw new Error(result.error);
        }

        // Success!
        console.log('API call successful:', result);
        setRetryCount(0); // Reset retry count on success
        return result;

      } catch (error: any) {
        console.error(`Attempt ${attempt + 1} failed:`, error);
        lastError = error;

        // Check if we should retry
        if (isRetryableError(error) && attempt < retries - 1) {
          const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
          console.log(`Retrying in ${delay}ms...`);
          setRetryCount(attempt + 1);
          await sleep(delay);
          continue; // Retry
        }

        // No more retries, throw the error
        break;
      }
    }

    // All retries exhausted
    setRetryCount(0);
    throw lastError || new Error('Unknown error occurred');
  };

  const handleApprovePayment = useCallback(async (payment: OKXPayment) => {
    Alert.alert(
      'Approve Payment',
      `Confirm payment of ${payment.usdt_amount} USDT for ${payment.mxi_amount} MXI?\n\n` +
      `User: ${payment.user_name}\n` +
      `Email: ${payment.user_email}\n` +
      `Transaction ID: ${payment.okx_transaction_id || 'Not provided'}\n\n` +
      `This will credit ${payment.mxi_amount} MXI to the user's balance.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              setProcessing(true);
              console.log('=== APPROVE PAYMENT START ===');
              console.log('Payment ID:', payment.payment_id);
              console.log('User ID:', payment.user_id);
              console.log('USDT Amount:', payment.usdt_amount);
              console.log('MXI Amount:', payment.mxi_amount);

              // Call API with retry logic
              const result = await callPaymentAPI(payment.payment_id, 'confirm');

              console.log('=== APPROVE PAYMENT SUCCESS ===');
              console.log('Result:', result);
              
              Alert.alert(
                'Success',
                `Payment approved successfully!\n\n` +
                `User's new balance: ${result.newBalance?.toFixed(2) || 'N/A'} MXI\n` +
                `Yield rate: ${result.yieldRate?.toFixed(6) || 'N/A'} MXI/min\n\n` +
                `The user's account has been credited with ${payment.mxi_amount} MXI.`
              );
              
              setSelectedPayment(null);
              await loadPayments();
            } catch (error: any) {
              console.error('=== APPROVE PAYMENT ERROR ===');
              console.error('Error type:', error.constructor.name);
              console.error('Error message:', error.message);
              console.error('Error stack:', error.stack);
              
              let errorMessage = error.message || 'Unknown error occurred';
              
              // Add helpful context based on error type
              if (error.message?.includes('session')) {
                errorMessage += '\n\nPlease log out and log back in.';
              } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
                errorMessage += '\n\nPlease check your internet connection and try again.';
              } else if (error.message?.includes('timeout')) {
                errorMessage += '\n\nThe request timed out. Please try again.';
              }
              
              Alert.alert(
                'Error',
                `Failed to approve payment:\n\n${errorMessage}\n\n` +
                (retryCount > 0 ? `Retried ${retryCount} time(s).\n\n` : '') +
                `Please check the console logs for more details.`
              );
            } finally {
              setProcessing(false);
              setRetryCount(0);
            }
          },
        },
      ]
    );
  }, [retryCount]);

  const handleRejectPayment = useCallback(async (payment: OKXPayment) => {
    Alert.alert(
      'Reject Payment',
      `Are you sure you want to reject this payment?\n\n` +
      `User: ${payment.user_name}\n` +
      `Amount: ${payment.usdt_amount} USDT → ${payment.mxi_amount} MXI\n\n` +
      `This will mark the payment as failed and the user will NOT receive any MXI.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessing(true);
              console.log('=== REJECT PAYMENT START ===');
              console.log('Payment ID:', payment.payment_id);

              // Call API with retry logic
              const result = await callPaymentAPI(payment.payment_id, 'reject');

              console.log('=== REJECT PAYMENT SUCCESS ===');
              console.log('Result:', result);
              
              Alert.alert('Success', 'Payment rejected successfully. The user will not receive any MXI.');
              setSelectedPayment(null);
              await loadPayments();
            } catch (error: any) {
              console.error('=== REJECT PAYMENT ERROR ===');
              console.error('Error type:', error.constructor.name);
              console.error('Error message:', error.message);
              console.error('Error stack:', error.stack);
              
              let errorMessage = error.message || 'Unknown error occurred';
              
              if (error.message?.includes('session')) {
                errorMessage += '\n\nPlease log out and log back in.';
              } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
                errorMessage += '\n\nPlease check your internet connection and try again.';
              } else if (error.message?.includes('timeout')) {
                errorMessage += '\n\nThe request timed out. Please try again.';
              }
              
              Alert.alert(
                'Error',
                `Failed to reject payment:\n\n${errorMessage}\n\n` +
                (retryCount > 0 ? `Retried ${retryCount} time(s).\n\n` : '') +
                `Please check the console logs for more details.`
              );
            } finally {
              setProcessing(false);
              setRetryCount(0);
            }
          },
        },
      ]
    );
  }, [retryCount]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return colors.success;
      case 'confirming': return colors.warning;
      case 'pending': return colors.primary;
      case 'failed': return colors.error;
      case 'expired': return colors.textSecondary;
      default: return colors.textSecondary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
        <View style={styles.headerText}>
          <Text style={styles.title}>Payment Approvals</Text>
          <Text style={styles.subtitle}>
            {payments.length} payment(s)
            {retryCount > 0 && ` • Retrying (${retryCount}/${MAX_RETRIES})`}
          </Text>
        </View>
        <TouchableOpacity onPress={onRefresh} disabled={refreshing}>
          <IconSymbol 
            ios_icon_name="arrow.clockwise" 
            android_material_icon_name="refresh" 
            size={24} 
            color={colors.primary} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'awaiting' && styles.filterButtonActive]}
          onPress={() => setFilter('awaiting')}
        >
          <Text style={[styles.filterText, filter === 'awaiting' && styles.filterTextActive]}>
            Awaiting Approval
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'pending' && styles.filterButtonActive]}
          onPress={() => setFilter('pending')}
        >
          <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>
            Pending Only
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading payments...</Text>
        </View>
      ) : payments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol 
            ios_icon_name="checkmark.seal" 
            android_material_icon_name="verified" 
            size={64} 
            color={colors.textSecondary} 
          />
          <Text style={styles.emptyText}>No payments to review</Text>
          <Text style={styles.emptySubtext}>
            {filter === 'awaiting' 
              ? 'All payments have been processed or are awaiting user submission'
              : 'No payments match the selected filter'}
          </Text>
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {payments.map((payment) => (
            <TouchableOpacity
              key={payment.id}
              style={[commonStyles.card, styles.paymentCard]}
              onPress={() => setSelectedPayment(payment)}
            >
              <View style={styles.paymentHeader}>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentName}>{payment.user_name}</Text>
                  <Text style={styles.paymentEmail}>{payment.user_email}</Text>
                  <Text style={styles.paymentId}>ID: {payment.payment_id}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(payment.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(payment.status) }]}>
                    {payment.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.paymentDetails}>
                <View style={styles.amountRow}>
                  <IconSymbol 
                    ios_icon_name="dollarsign.circle" 
                    android_material_icon_name="attach_money" 
                    size={24} 
                    color={colors.success} 
                  />
                  <Text style={styles.amount}>{payment.usdt_amount} USDT</Text>
                  <IconSymbol 
                    ios_icon_name="arrow.right" 
                    android_material_icon_name="arrow_forward" 
                    size={20} 
                    color={colors.textSecondary} 
                  />
                  <IconSymbol 
                    ios_icon_name="bitcoinsign.circle" 
                    android_material_icon_name="currency_bitcoin" 
                    size={24} 
                    color={colors.primary} 
                  />
                  <Text style={styles.amount}>{payment.mxi_amount} MXI</Text>
                </View>
              </View>

              {payment.okx_transaction_id && (
                <View style={styles.txidContainer}>
                  <Text style={styles.txidLabel}>Transaction ID:</Text>
                  <Text style={styles.txidValue} numberOfLines={1}>
                    {payment.okx_transaction_id}
                  </Text>
                </View>
              )}

              <View style={styles.paymentFooter}>
                <Text style={styles.paymentDate}>
                  Created: {formatDate(payment.created_at)}
                </Text>
                {payment.verification_attempts > 0 && (
                  <Text style={styles.verificationAttempts}>
                    Attempts: {payment.verification_attempts}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <Modal
        visible={selectedPayment !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => !processing && setSelectedPayment(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Payment Details</Text>
                <TouchableOpacity 
                  onPress={() => !processing && setSelectedPayment(null)}
                  disabled={processing}
                >
                  <IconSymbol 
                    ios_icon_name="xmark.circle.fill" 
                    android_material_icon_name="cancel" 
                    size={28} 
                    color={processing ? colors.textSecondary : colors.text} 
                  />
                </TouchableOpacity>
              </View>

              {selectedPayment && (
                <>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>User</Text>
                    <Text style={styles.detailValue}>{selectedPayment.user_name}</Text>
                    <Text style={styles.detailSubvalue}>{selectedPayment.user_email}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Payment ID</Text>
                    <Text style={styles.detailValue}>{selectedPayment.payment_id}</Text>
                  </View>

                  {selectedPayment.okx_transaction_id && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>OKX Transaction ID</Text>
                      <Text style={[styles.detailValue, { fontFamily: 'monospace', fontSize: 14 }]}>
                        {selectedPayment.okx_transaction_id}
                      </Text>
                    </View>
                  )}

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Amount</Text>
                    <Text style={styles.detailValue}>
                      {selectedPayment.usdt_amount} USDT → {selectedPayment.mxi_amount} MXI
                    </Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Status</Text>
                    <Text style={[styles.detailValue, { color: getStatusColor(selectedPayment.status) }]}>
                      {selectedPayment.status.toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Created At</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(selectedPayment.created_at)}
                    </Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Expires At</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(selectedPayment.expires_at)}
                    </Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Verification Attempts</Text>
                    <Text style={styles.detailValue}>{selectedPayment.verification_attempts || 0}</Text>
                    {selectedPayment.verification_attempts > 0 && (
                      <Text style={styles.detailSubvalue}>
                        Automatic verification was attempted but failed. Manual approval required.
                      </Text>
                    )}
                  </View>

                  {(selectedPayment.status === 'confirming' || selectedPayment.status === 'pending') && (
                    <>
                      <View style={styles.infoBox}>
                        <IconSymbol 
                          ios_icon_name="info.circle.fill" 
                          android_material_icon_name="info" 
                          size={24} 
                          color={colors.primary} 
                        />
                        <Text style={styles.infoText}>
                          This payment requires manual approval. Please verify the transaction details before approving.
                          {retryCount > 0 && `\n\nRetrying... (${retryCount}/${MAX_RETRIES})`}
                        </Text>
                      </View>

                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={[buttonStyles.primary, styles.approveButton, processing && styles.buttonDisabled]}
                          onPress={() => handleApprovePayment(selectedPayment)}
                          disabled={processing}
                        >
                          {processing ? (
                            <ActivityIndicator color="#fff" />
                          ) : (
                            <>
                              <IconSymbol 
                                ios_icon_name="checkmark.circle.fill" 
                                android_material_icon_name="check_circle" 
                                size={20} 
                                color="#fff" 
                              />
                              <Text style={styles.buttonText}>Approve Payment</Text>
                            </>
                          )}
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[buttonStyles.primary, styles.rejectButton, processing && styles.buttonDisabled]}
                          onPress={() => handleRejectPayment(selectedPayment)}
                          disabled={processing}
                        >
                          {processing ? (
                            <ActivityIndicator color="#fff" />
                          ) : (
                            <>
                              <IconSymbol 
                                ios_icon_name="xmark.circle.fill" 
                                android_material_icon_name="cancel" 
                                size={20} 
                                color="#fff" 
                              />
                              <Text style={styles.buttonText}>Reject Payment</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </>
              )}
            </ScrollView>
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
    padding: 24,
    paddingBottom: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  filterTextActive: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  paymentCard: {
    marginBottom: 16,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  paymentEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  paymentId: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  paymentDetails: {
    marginBottom: 12,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  txidContainer: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  txidLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  txidValue: {
    fontSize: 12,
    color: colors.text,
    fontFamily: 'monospace',
  },
  paymentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  paymentDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  verificationAttempts: {
    fontSize: 12,
    color: colors.warning,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 16,
    color: colors.text,
  },
  detailSubvalue: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.primary + '10',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.success,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.error,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
