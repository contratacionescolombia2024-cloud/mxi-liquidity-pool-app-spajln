
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
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface KYCVerification {
  id: string;
  user_id: string;
  status: string;
  full_name: string;
  document_type: string;
  document_number: string;
  document_front_url: string | null;
  document_back_url: string | null;
  selfie_url: string | null;
  submitted_at: string;
  user_email: string;
  user_name: string;
}

export default function KYCApprovalsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [verifications, setVerifications] = useState<KYCVerification[]>([]);
  const [selectedKYC, setSelectedKYC] = useState<KYCVerification | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');

  useEffect(() => {
    loadVerifications();
  }, [filter]);

  const loadVerifications = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('kyc_verifications')
        .select(`
          *,
          users!inner(email, name)
        `)
        .order('submitted_at', { ascending: false });

      if (filter === 'pending') {
        query = query.eq('status', 'pending');
      }

      const { data, error } = await query;

      if (error) throw error;

      const mapped = data?.map((v: any) => ({
        ...v,
        user_email: v.users.email,
        user_name: v.users.name,
      })) || [];

      setVerifications(mapped);
    } catch (error) {
      console.error('Error loading verifications:', error);
      Alert.alert('Error', 'Failed to load KYC verifications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (kycId: string, userId: string) => {
    Alert.alert(
      'Approve KYC',
      'Are you sure you want to approve this KYC verification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              setProcessing(true);

              // Get admin user ID
              const { data: adminData } = await supabase
                .from('admin_users')
                .select('id')
                .eq('user_id', user?.id)
                .single();

              // Update KYC verification
              const { error: kycError } = await supabase
                .from('kyc_verifications')
                .update({
                  status: 'approved',
                  reviewed_at: new Date().toISOString(),
                  reviewed_by: adminData?.id,
                  admin_notes: adminNotes || null,
                })
                .eq('id', kycId);

              if (kycError) throw kycError;

              // Update user KYC status
              const { error: userError } = await supabase
                .from('users')
                .update({
                  kyc_status: 'approved',
                  kyc_verified_at: new Date().toISOString(),
                })
                .eq('id', userId);

              if (userError) throw userError;

              Alert.alert('Success', 'KYC verification approved successfully');
              setSelectedKYC(null);
              setAdminNotes('');
              loadVerifications();
            } catch (error) {
              console.error('Error approving KYC:', error);
              Alert.alert('Error', 'Failed to approve KYC verification');
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  const handleReject = async (kycId: string, userId: string) => {
    if (!adminNotes.trim()) {
      Alert.alert('Error', 'Please provide a reason for rejection');
      return;
    }

    Alert.alert(
      'Reject KYC',
      'Are you sure you want to reject this KYC verification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessing(true);

              // Get admin user ID
              const { data: adminData } = await supabase
                .from('admin_users')
                .select('id')
                .eq('user_id', user?.id)
                .single();

              // Update KYC verification
              const { error: kycError } = await supabase
                .from('kyc_verifications')
                .update({
                  status: 'rejected',
                  reviewed_at: new Date().toISOString(),
                  reviewed_by: adminData?.id,
                  rejection_reason: adminNotes,
                  admin_notes: adminNotes,
                })
                .eq('id', kycId);

              if (kycError) throw kycError;

              // Update user KYC status
              const { error: userError } = await supabase
                .from('users')
                .update({
                  kyc_status: 'rejected',
                })
                .eq('id', userId);

              if (userError) throw userError;

              Alert.alert('Success', 'KYC verification rejected');
              setSelectedKYC(null);
              setAdminNotes('');
              loadVerifications();
            } catch (error) {
              console.error('Error rejecting KYC:', error);
              Alert.alert('Error', 'Failed to reject KYC verification');
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>KYC Approvals</Text>
          <Text style={styles.subtitle}>{verifications.length} verification(s)</Text>
        </View>
      </View>

      <View style={styles.filterContainer}>
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
      ) : verifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol name="checkmark.seal" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyText}>No KYC verifications to review</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {verifications.map((kyc) => (
            <TouchableOpacity
              key={kyc.id}
              style={[commonStyles.card, styles.kycCard]}
              onPress={() => setSelectedKYC(kyc)}
            >
              <View style={styles.kycHeader}>
                <View style={styles.kycInfo}>
                  <Text style={styles.kycName}>{kyc.full_name}</Text>
                  <Text style={styles.kycEmail}>{kyc.user_email}</Text>
                  <Text style={styles.kycDocument}>
                    {kyc.document_type.toUpperCase()}: {kyc.document_number}
                  </Text>
                </View>
                <View style={[styles.statusBadge, styles[`status${kyc.status}`]]}>
                  <Text style={styles.statusText}>{kyc.status.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.kycDate}>
                Submitted: {new Date(kyc.submitted_at).toLocaleString()}
              </Text>
              <View style={styles.kycActions}>
                <IconSymbol name="chevron.right" size={20} color={colors.primary} />
                <Text style={styles.reviewText}>Tap to review</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <Modal
        visible={selectedKYC !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedKYC(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>KYC Verification Review</Text>
                <TouchableOpacity onPress={() => setSelectedKYC(null)}>
                  <IconSymbol name="xmark.circle.fill" size={28} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {selectedKYC && (
                <>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Full Name</Text>
                    <Text style={styles.detailValue}>{selectedKYC.full_name}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Email</Text>
                    <Text style={styles.detailValue}>{selectedKYC.user_email}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Document Type</Text>
                    <Text style={styles.detailValue}>{selectedKYC.document_type.toUpperCase()}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Document Number</Text>
                    <Text style={styles.detailValue}>{selectedKYC.document_number}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Admin Notes</Text>
                    <TextInput
                      style={styles.notesInput}
                      placeholder="Add notes or rejection reason..."
                      placeholderTextColor={colors.textSecondary}
                      value={adminNotes}
                      onChangeText={setAdminNotes}
                      multiline
                      numberOfLines={4}
                    />
                  </View>

                  {selectedKYC.status === 'pending' && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={[buttonStyles.primary, styles.approveButton]}
                        onPress={() => handleApprove(selectedKYC.id, selectedKYC.user_id)}
                        disabled={processing}
                      >
                        {processing ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <>
                            <IconSymbol name="checkmark.circle.fill" size={20} color="#fff" />
                            <Text style={styles.buttonText}>Approve</Text>
                          </>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[buttonStyles.primary, styles.rejectButton]}
                        onPress={() => handleReject(selectedKYC.id, selectedKYC.user_id)}
                        disabled={processing}
                      >
                        {processing ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <>
                            <IconSymbol name="xmark.circle.fill" size={20} color="#fff" />
                            <Text style={styles.buttonText}>Reject</Text>
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
  kycCard: {
    marginBottom: 16,
  },
  kycHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  kycInfo: {
    flex: 1,
  },
  kycName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  kycEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  kycDocument: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statuspending: {
    backgroundColor: colors.warning + '20',
  },
  statusapproved: {
    backgroundColor: colors.success + '20',
  },
  statusrejected: {
    backgroundColor: colors.error + '20',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text,
  },
  kycDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  kycActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
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
  notesInput: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
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
