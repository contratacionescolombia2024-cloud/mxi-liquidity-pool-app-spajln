
import React, { useState, useEffect } from 'react';
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

interface BinancePayment {
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
}

export default function PaymentApprovalsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payments, setPayments] = useState<BinancePayment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<BinancePayment | null>(null);
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState<'pending' | 'confirming' | 'all'>('confirming');

  useEffect(() => {
    loadPayments();
  }, [filter]);

  const loadPayments = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('binance_payments')
        .select(`
          *,
          users!inner(email, name)
        `)
        .order('created_at', { ascending: false });

      if (filter === 'pending') {
        query = query.eq('status', 'pending');
      } else if (filter === 'confirming') {
        query = query.eq('status', 'confirming');
      }

      const { data, error } = await query;

      if (error) throw error;

      const mapped = data?.map((p: any) => ({
        ...p,
        user_email: p.users.email,
        user_name: p.users.name,
      })) || [];

      setPayments(mapped);
    } catch (error) {
      console.error('Error loading payments:', error);
      Alert.alert('Error', 'Failed to load payments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPayments();
  };

  const handleApprovePayment = async (payment: BinancePayment) => {
    Alert.alert(
      'Approve Payment',
      `Confirm payment of ${payment.usdt_amount} USDT for ${payment.mxi_amount} MXI?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              setProcessing(true);

              // Call Edge Function to confirm payment
              const { data: { session } } = await supabase.auth.getSession();
              
              const response = await fetch(
                `${supabase.supabaseUrl}/functions/v1/binance-payment-verification`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`,
                  },
                  body: JSON.stringify({
                    paymentId: payment.payment_id,
                    action: 'confirm',
                  }),
                }
              );

              const result = await response.json();

              if (!response.ok) {
                throw new Error(result.error || 'Failed to approve payment');
              }

              Alert.alert('Success', 'Payment approved and user balance updated');
              setSelectedPayment(null);
              loadPayments();
            } catch (error) {
              console.error('Error approving payment:', error);
              Alert.alert('Error', error.message || 'Failed to approve payment');
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  const handleRejectPayment = async (payment: BinancePayment) => {
    Alert.alert(
      'Reject Payment',
      'Are you sure you want to reject this payment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessing(true);

              // Call Edge Function to reject payment
              const { data: { session } } = await supabase.auth.getSession();
              
              const response = await fetch(
                `${supabase.supabaseUrl}/functions/v1/binance-payment-verification`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`,
                  },
                  body: JSON.stringify({
                    paymentId: payment.payment_id,
                    action: 'reject',
                  }),
                }
              );

              const result = await response.json();

              if (!response.ok) {
                throw new Error(result.error || 'Failed to reject payment');
              }

              Alert.alert('Success', 'Payment rejected');
              setSelectedPayment(null);
              loadPayments();
            } catch (error) {
              console.error('Error rejecting payment:', error);
              Alert.alert('Error', error.message || 'Failed to reject payment');
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

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
          <Text style={styles.subtitle}>{payments.length} payment(s)</Text>
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
          style={[styles.filterButton, filter === 'confirming' && styles.filterButtonActive]}
          onPress={() => setFilter('confirming')}
        >
          <Text style={[styles.filterText, filter === 'confirming' && styles.filterTextActive]}>
            Awaiting Approval
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'pending' && styles.filterButtonActive]}
          onPress={() => setFilter('pending')}
        >
          <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>
            Pending
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
        onRequestClose={() => setSelectedPayment(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Payment Details</Text>
                <TouchableOpacity onPress={() => setSelectedPayment(null)}>
                  <IconSymbol 
                    ios_icon_name="xmark.circle.fill" 
                    android_material_icon_name="cancel" 
                    size={28} 
                    color={colors.textSecondary} 
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
                  </View>

                  {(selectedPayment.status === 'confirming' || selectedPayment.status === 'pending') && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={[buttonStyles.primary, styles.approveButton]}
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
                        style={[buttonStyles.primary, styles.rejectButton]}
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
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
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
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
