
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
  rejection_reason?: string;
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
  const [viewingImage, setViewingImage] = useState<string | null>(null);

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
      'Aprobar KYC',
      '¿Estás seguro de que quieres aprobar esta verificación KYC?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aprobar',
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

              Alert.alert('Éxito', 'Verificación KYC aprobada exitosamente');
              setSelectedKYC(null);
              setAdminNotes('');
              loadVerifications();
            } catch (error) {
              console.error('Error approving KYC:', error);
              Alert.alert('Error', 'Error al aprobar verificación KYC');
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
      Alert.alert('Error', 'Por favor proporciona una razón para el rechazo');
      return;
    }

    Alert.alert(
      'Rechazar KYC',
      '¿Estás seguro de que quieres rechazar esta verificación KYC? El usuario podrá volver a enviar sus documentos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar',
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

              // Update user KYC status to rejected so they can resubmit
              const { error: userError } = await supabase
                .from('users')
                .update({
                  kyc_status: 'rejected',
                })
                .eq('id', userId);

              if (userError) throw userError;

              Alert.alert(
                'Verificación Rechazada', 
                'La verificación KYC ha sido rechazada. El usuario recibirá una notificación con la razón del rechazo y podrá volver a enviar sus documentos.'
              );
              setSelectedKYC(null);
              setAdminNotes('');
              loadVerifications();
            } catch (error) {
              console.error('Error rejecting KYC:', error);
              Alert.alert('Error', 'Error al rechazar verificación KYC');
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
          <IconSymbol ios_icon_name="chevron.left" android_material_icon_name="arrow_back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>Aprobaciones KYC</Text>
          <Text style={styles.subtitle}>{verifications.length} verificación(es)</Text>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'pending' && styles.filterButtonActive]}
          onPress={() => setFilter('pending')}
        >
          <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>
            Pendientes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            Todas
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : verifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol ios_icon_name="checkmark.seal" android_material_icon_name="verified" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyText}>No hay verificaciones KYC para revisar</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {verifications.map((kyc) => (
            <TouchableOpacity
              key={kyc.id}
              style={[commonStyles.card, styles.kycCard]}
              onPress={() => {
                setSelectedKYC(kyc);
                setAdminNotes(kyc.rejection_reason || '');
              }}
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
                Enviado: {new Date(kyc.submitted_at).toLocaleString()}
              </Text>
              <View style={styles.kycActions}>
                <IconSymbol ios_icon_name="chevron.right" android_material_icon_name="chevron_right" size={20} color={colors.primary} />
                <Text style={styles.reviewText}>Toca para revisar</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Review Modal */}
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
                <Text style={styles.modalTitle}>Revisión de Verificación KYC</Text>
                <TouchableOpacity onPress={() => setSelectedKYC(null)}>
                  <IconSymbol ios_icon_name="xmark.circle.fill" android_material_icon_name="cancel" size={28} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {selectedKYC && (
                <>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Nombre Completo</Text>
                    <Text style={styles.detailValue}>{selectedKYC.full_name}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Email</Text>
                    <Text style={styles.detailValue}>{selectedKYC.user_email}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Tipo de Documento</Text>
                    <Text style={styles.detailValue}>
                      {selectedKYC.document_type === 'national_id' ? 'Cédula' :
                       selectedKYC.document_type === 'passport' ? 'Pasaporte' : 'Licencia de Conducir'}
                    </Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Número de Documento</Text>
                    <Text style={styles.detailValue}>{selectedKYC.document_number}</Text>
                  </View>

                  {selectedKYC.document_front_url && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Documento Frontal</Text>
                      <TouchableOpacity 
                        style={styles.imagePreview}
                        onPress={() => setViewingImage(selectedKYC.document_front_url)}
                      >
                        <Image 
                          source={{ uri: selectedKYC.document_front_url }} 
                          style={styles.documentImage}
                        />
                        <View style={styles.imageOverlay}>
                          <IconSymbol ios_icon_name="eye.fill" android_material_icon_name="visibility" size={24} color="#fff" />
                          <Text style={styles.imageOverlayText}>Toca para ampliar</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}

                  {selectedKYC.document_back_url && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Documento Trasero</Text>
                      <TouchableOpacity 
                        style={styles.imagePreview}
                        onPress={() => setViewingImage(selectedKYC.document_back_url)}
                      >
                        <Image 
                          source={{ uri: selectedKYC.document_back_url }} 
                          style={styles.documentImage}
                        />
                        <View style={styles.imageOverlay}>
                          <IconSymbol ios_icon_name="eye.fill" android_material_icon_name="visibility" size={24} color="#fff" />
                          <Text style={styles.imageOverlayText}>Toca para ampliar</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>
                      {selectedKYC.status === 'rejected' ? 'Razón de Rechazo' : 'Notas del Administrador'}
                    </Text>
                    <TextInput
                      style={styles.notesInput}
                      placeholder={selectedKYC.status === 'rejected' 
                        ? "Explica por qué se rechazó y qué debe corregir el usuario..." 
                        : "Agrega notas o razón de rechazo..."}
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
                            <IconSymbol ios_icon_name="checkmark.circle.fill" android_material_icon_name="check_circle" size={20} color="#fff" />
                            <Text style={styles.buttonText}>Aprobar</Text>
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
                            <IconSymbol ios_icon_name="xmark.circle.fill" android_material_icon_name="cancel" size={20} color="#fff" />
                            <Text style={styles.buttonText}>Rechazar</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}

                  {selectedKYC.status === 'rejected' && (
                    <View style={styles.rejectedInfo}>
                      <IconSymbol ios_icon_name="info.circle" android_material_icon_name="info" size={20} color={colors.warning} />
                      <Text style={styles.rejectedInfoText}>
                        Esta verificación fue rechazada. El usuario puede volver a enviar sus documentos corregidos.
                      </Text>
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Image Viewer Modal */}
      <Modal
        visible={viewingImage !== null}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setViewingImage(null)}
      >
        <View style={styles.imageViewerOverlay}>
          <TouchableOpacity 
            style={styles.imageViewerClose}
            onPress={() => setViewingImage(null)}
          >
            <IconSymbol ios_icon_name="xmark.circle.fill" android_material_icon_name="cancel" size={36} color="#fff" />
          </TouchableOpacity>
          {viewingImage && (
            <Image 
              source={{ uri: viewingImage }} 
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
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
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  documentImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  imageOverlayText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
  rejectedInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    backgroundColor: colors.warning + '20',
    borderRadius: 12,
    marginTop: 16,
  },
  rejectedInfoText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  imageViewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerClose: {
    position: 'absolute',
    top: 50,
    right: 24,
    zIndex: 10,
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
});
