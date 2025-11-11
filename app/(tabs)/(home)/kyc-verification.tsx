
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';

type DocumentType = 'passport' | 'national_id' | 'drivers_license';

export default function KYCVerificationScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [kycData, setKycData] = useState<any>(null);
  
  const [fullName, setFullName] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('national_id');
  const [documentNumber, setDocumentNumber] = useState('');

  useEffect(() => {
    loadKYCData();
  }, []);

  const loadKYCData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('kyc_verifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setKycData(data);
        setFullName(data.full_name || '');
        setDocumentType(data.document_type || 'national_id');
        setDocumentNumber(data.document_number || '');
      }
    } catch (error) {
      console.log('No existing KYC data found');
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!user) return;

    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    if (!documentNumber.trim()) {
      Alert.alert('Error', 'Please enter your document number');
      return;
    }

    Alert.alert(
      'Submit KYC Verification',
      'By submitting this KYC verification, you confirm that all information provided is accurate and truthful. Your submission will be reviewed within 24-48 hours.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            setSubmitting(true);
            try {
              const { error } = await supabase
                .from('kyc_verifications')
                .insert({
                  user_id: user.id,
                  full_name: fullName.trim(),
                  document_type: documentType,
                  document_number: documentNumber.trim(),
                  status: 'pending',
                  submitted_at: new Date().toISOString(),
                });

              if (error) {
                throw error;
              }

              await supabase
                .from('users')
                .update({ kyc_status: 'pending' })
                .eq('id', user.id);

              await updateUser({ kycStatus: 'pending' });

              Alert.alert(
                'KYC Submitted Successfully',
                'Your KYC verification has been submitted and is under review. You will be notified once it has been processed (typically within 24-48 hours).',
                [
                  {
                    text: 'OK',
                    onPress: () => router.back(),
                  },
                ]
              );
            } catch (error: any) {
              console.error('KYC submission error:', error);
              Alert.alert('Error', error.message || 'Failed to submit KYC verification');
            }
            setSubmitting(false);
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return colors.success;
      case 'pending':
      case 'under_review':
        return colors.warning;
      case 'rejected':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return 'checkmark.seal.fill';
      case 'pending':
      case 'under_review':
        return 'clock.fill';
      case 'rejected':
        return 'xmark.circle.fill';
      default:
        return 'doc.text.fill';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>KYC Verification</Text>
          <Text style={styles.subtitle}>Complete your identity verification</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            <View style={[commonStyles.card, styles.statusCard]}>
              <View style={styles.statusHeader}>
                <IconSymbol
                  name={getStatusIcon(user.kycStatus)}
                  size={32}
                  color={getStatusColor(user.kycStatus)}
                />
                <View style={styles.statusInfo}>
                  <Text style={styles.statusLabel}>Verification Status</Text>
                  <Text style={[styles.statusValue, { color: getStatusColor(user.kycStatus) }]}>
                    {user.kycStatus === 'not_submitted' ? 'Not Submitted' :
                     user.kycStatus === 'pending' ? 'Under Review' :
                     user.kycStatus === 'approved' ? 'Approved' : 'Rejected'}
                  </Text>
                </View>
              </View>

              {user.kycStatus === 'approved' && user.kycVerifiedAt && (
                <Text style={styles.statusDate}>
                  Verified on {new Date(user.kycVerifiedAt).toLocaleDateString()}
                </Text>
              )}

              {user.kycStatus === 'pending' && (
                <View style={styles.pendingNotice}>
                  <IconSymbol name="info.circle" size={18} color={colors.warning} />
                  <Text style={styles.pendingText}>
                    Your KYC verification is being reviewed. This typically takes 24-48 hours.
                  </Text>
                </View>
              )}

              {user.kycStatus === 'rejected' && kycData?.rejection_reason && (
                <View style={styles.rejectionNotice}>
                  <IconSymbol name="exclamationmark.triangle" size={18} color={colors.error} />
                  <Text style={styles.rejectionText}>
                    Rejection Reason: {kycData.rejection_reason}
                  </Text>
                </View>
              )}
            </View>

            {(user.kycStatus === 'not_submitted' || user.kycStatus === 'rejected') && (
              <>
                <View style={[commonStyles.card, styles.infoCard]}>
                  <IconSymbol name="info.circle.fill" size={20} color={colors.primary} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoTitle}>Why KYC is Required:</Text>
                    <Text style={styles.infoText}>
                      - KYC verification is mandatory for all withdrawals{'\n'}
                      - Helps prevent fraud and money laundering{'\n'}
                      - Ensures compliance with financial regulations{'\n'}
                      - Protects your account and funds{'\n'}
                      - One-time verification process
                    </Text>
                  </View>
                </View>

                <View style={[commonStyles.card, styles.formCard]}>
                  <Text style={styles.formTitle}>Personal Information</Text>

                  <View style={styles.inputContainer}>
                    <Text style={commonStyles.label}>Full Legal Name</Text>
                    <TextInput
                      style={commonStyles.input}
                      placeholder="Enter your full name as on ID"
                      placeholderTextColor={colors.textSecondary}
                      value={fullName}
                      onChangeText={setFullName}
                      autoCapitalize="words"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={commonStyles.label}>Document Type</Text>
                    <View style={styles.documentTypeContainer}>
                      <TouchableOpacity
                        style={[
                          styles.documentTypeButton,
                          documentType === 'national_id' && styles.documentTypeButtonActive,
                        ]}
                        onPress={() => setDocumentType('national_id')}
                      >
                        <IconSymbol
                          name="person.text.rectangle"
                          size={20}
                          color={documentType === 'national_id' ? '#fff' : colors.text}
                        />
                        <Text
                          style={[
                            styles.documentTypeText,
                            documentType === 'national_id' && styles.documentTypeTextActive,
                          ]}
                        >
                          National ID
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.documentTypeButton,
                          documentType === 'passport' && styles.documentTypeButtonActive,
                        ]}
                        onPress={() => setDocumentType('passport')}
                      >
                        <IconSymbol
                          name="book.closed"
                          size={20}
                          color={documentType === 'passport' ? '#fff' : colors.text}
                        />
                        <Text
                          style={[
                            styles.documentTypeText,
                            documentType === 'passport' && styles.documentTypeTextActive,
                          ]}
                        >
                          Passport
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.documentTypeButton,
                          documentType === 'drivers_license' && styles.documentTypeButtonActive,
                        ]}
                        onPress={() => setDocumentType('drivers_license')}
                      >
                        <IconSymbol
                          name="car"
                          size={20}
                          color={documentType === 'drivers_license' ? '#fff' : colors.text}
                        />
                        <Text
                          style={[
                            styles.documentTypeText,
                            documentType === 'drivers_license' && styles.documentTypeTextActive,
                          ]}
                        >
                          Driver&apos;s License
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={commonStyles.label}>Document Number</Text>
                    <TextInput
                      style={commonStyles.input}
                      placeholder="Enter your document number"
                      placeholderTextColor={colors.textSecondary}
                      value={documentNumber}
                      onChangeText={setDocumentNumber}
                      autoCapitalize="characters"
                    />
                  </View>

                  <TouchableOpacity
                    style={[buttonStyles.primary, styles.submitButton]}
                    onPress={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <IconSymbol name="checkmark.circle.fill" size={20} color="#fff" />
                        <Text style={styles.buttonText}>Submit KYC Verification</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>

                <View style={[commonStyles.card, styles.securityCard]}>
                  <IconSymbol name="lock.shield.fill" size={24} color={colors.success} />
                  <View style={styles.securityContent}>
                    <Text style={styles.securityTitle}>Your Data is Secure</Text>
                    <Text style={styles.securityText}>
                      All personal information is encrypted and stored securely. We comply with
                      international data protection regulations and will never share your
                      information with third parties without your consent.
                    </Text>
                  </View>
                </View>
              </>
            )}

            {user.kycStatus === 'approved' && (
              <View style={[commonStyles.card, styles.successCard]}>
                <IconSymbol name="checkmark.seal.fill" size={48} color={colors.success} />
                <Text style={styles.successTitle}>KYC Verified!</Text>
                <Text style={styles.successText}>
                  Your identity has been successfully verified. You can now withdraw your funds
                  once you meet all other requirements.
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  statusCard: {
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statusDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
  },
  pendingNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  pendingText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  rejectionNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },
  rejectionText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  formCard: {
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  documentTypeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  documentTypeButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    gap: 8,
  },
  documentTypeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  documentTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  documentTypeTextActive: {
    color: '#fff',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  securityCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
  },
  securityContent: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  securityText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  successCard: {
    alignItems: 'center',
    padding: 32,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
