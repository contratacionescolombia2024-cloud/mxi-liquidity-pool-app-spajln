
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
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';

type DocumentType = 'passport' | 'national_id' | 'drivers_license';

interface ImageUpload {
  uri: string;
  type: string;
  name: string;
}

export default function KYCVerificationScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [kycData, setKycData] = useState<any>(null);
  
  const [fullName, setFullName] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('national_id');
  const [documentNumber, setDocumentNumber] = useState('');
  const [documentFrontUri, setDocumentFrontUri] = useState<string | null>(null);
  const [documentBackUri, setDocumentBackUri] = useState<string | null>(null);
  const [documentFrontUrl, setDocumentFrontUrl] = useState<string | null>(null);
  const [documentBackUrl, setDocumentBackUrl] = useState<string | null>(null);

  useEffect(() => {
    loadKYCData();
    requestPermissions();
    
    // Set up real-time subscription for KYC status updates
    const channel = supabase
      .channel('kyc-status-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'kyc_verifications',
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          console.log('KYC status updated:', payload);
          loadKYCData();
          
          // Update user context
          if (payload.new.status === 'approved') {
            updateUser({ kycStatus: 'approved', kycVerifiedAt: payload.new.reviewed_at });
            Alert.alert(
              '✅ KYC Approved!',
              'Your KYC verification has been approved! You can now proceed with withdrawals once you meet all requirements.',
              [{ text: 'OK' }]
            );
          } else if (payload.new.status === 'rejected') {
            updateUser({ kycStatus: 'rejected' });
            Alert.alert(
              '❌ KYC Rejected',
              `Your KYC verification was rejected. Reason: ${payload.new.rejection_reason || 'Please check the details and resubmit.'}`,
              [{ text: 'OK' }]
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera roll permissions to upload documents.'
      );
    }
  };

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

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading KYC data:', error);
      }

      if (data) {
        setKycData(data);
        setFullName(data.full_name || '');
        setDocumentType(data.document_type || 'national_id');
        setDocumentNumber(data.document_number || '');
        setDocumentFrontUrl(data.document_front_url);
        setDocumentBackUrl(data.document_back_url);
      }
    } catch (error) {
      console.log('No existing KYC data found or error:', error);
    }
    setLoading(false);
  };

  const pickImage = async (side: 'front' | 'back') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (side === 'front') {
          setDocumentFrontUri(asset.uri);
          await uploadImage(asset.uri, 'front');
        } else {
          setDocumentBackUri(asset.uri);
          await uploadImage(asset.uri, 'back');
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const uploadImage = async (uri: string, side: 'front' | 'back') => {
    if (!user) return;

    const setUploading = side === 'front' ? setUploadingFront : setUploadingBack;
    setUploading(true);

    try {
      // Get file extension
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}/${side}_${Date.now()}.${fileExt}`;

      // Fetch the image as a blob
      const response = await fetch(uri);
      const blob = await response.blob();

      console.log(`Uploading ${side} image to storage...`);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('kyc-documents')
        .upload(fileName, blob, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (error) {
        console.error('Storage upload error:', error);
        throw error;
      }

      console.log(`${side} image uploaded successfully:`, data);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('kyc-documents')
        .getPublicUrl(fileName);

      if (side === 'front') {
        setDocumentFrontUrl(urlData.publicUrl);
      } else {
        setDocumentBackUrl(urlData.publicUrl);
      }

      Alert.alert('✅ Upload Successful', `Document ${side} uploaded successfully!`);
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert('Upload Error', error.message || 'Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'User not authenticated. Please log in again.');
      return;
    }

    // Validation
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    if (!documentNumber.trim()) {
      Alert.alert('Error', 'Please enter your document number');
      return;
    }

    if (!documentFrontUrl) {
      Alert.alert('Error', 'Please upload the front of your ID document');
      return;
    }

    if (!documentBackUrl && documentType !== 'passport') {
      Alert.alert('Error', 'Please upload the back of your ID document');
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
              console.log('Starting KYC submission...');
              console.log('User ID:', user.id);
              console.log('Full Name:', fullName.trim());
              console.log('Document Type:', documentType);
              console.log('Document Number:', documentNumber.trim());
              console.log('Document Front URL:', documentFrontUrl);
              console.log('Document Back URL:', documentBackUrl);

              // Check if user is authenticated
              const { data: { session } } = await supabase.auth.getSession();
              if (!session) {
                throw new Error('No active session. Please log in again.');
              }

              console.log('Session verified, inserting KYC data...');

              // Insert KYC verification
              const { data: insertedData, error: insertError } = await supabase
                .from('kyc_verifications')
                .insert({
                  user_id: user.id,
                  full_name: fullName.trim(),
                  document_type: documentType,
                  document_number: documentNumber.trim(),
                  document_front_url: documentFrontUrl,
                  document_back_url: documentBackUrl,
                  status: 'pending',
                  submitted_at: new Date().toISOString(),
                })
                .select()
                .single();

              if (insertError) {
                console.error('Insert error:', insertError);
                throw insertError;
              }

              console.log('KYC data inserted successfully:', insertedData);

              // Update user KYC status
              console.log('Updating user KYC status...');
              const { error: userUpdateError } = await supabase
                .from('users')
                .update({ kyc_status: 'pending' })
                .eq('id', user.id);

              if (userUpdateError) {
                console.error('User update error:', userUpdateError);
                // Don't throw here, KYC was already submitted
              }

              // Update local user context
              await updateUser({ kycStatus: 'pending' });

              console.log('KYC submission completed successfully!');

              Alert.alert(
                '✅ KYC Submitted Successfully!',
                'Your KYC verification documents have been successfully submitted to our admin team.\n\n' +
                '📋 What happens next:\n' +
                '- Your documents are now in the review queue\n' +
                '- Admin will review within 24-48 hours\n' +
                '- You will receive a notification once reviewed\n' +
                '- Check back here to see your verification status\n\n' +
                'Thank you for completing your KYC verification!',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      loadKYCData();
                      router.back();
                    },
                  },
                ]
              );
            } catch (error: any) {
              console.error('KYC submission error:', error);
              
              let errorMessage = 'Failed to submit KYC verification. ';
              
              if (error.message) {
                errorMessage += error.message;
              } else if (error.code) {
                errorMessage += `Error code: ${error.code}`;
              } else {
                errorMessage += 'Please try again or contact support if the problem persists.';
              }

              Alert.alert('❌ Submission Failed', errorMessage);
            } finally {
              setSubmitting(false);
            }
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
                    ✅ Your KYC documents have been successfully submitted!{'\n'}
                    📋 Status: Under admin review{'\n'}
                    ⏱️ Review time: Typically 24-48 hours{'\n'}
                    🔔 You will be notified when reviewed
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

                  <View style={styles.inputContainer}>
                    <Text style={commonStyles.label}>Document Front *</Text>
                    <Text style={styles.uploadHint}>
                      Upload a clear photo of the front of your ID document
                    </Text>
                    <TouchableOpacity
                      style={styles.uploadButton}
                      onPress={() => pickImage('front')}
                      disabled={uploadingFront}
                    >
                      {uploadingFront ? (
                        <ActivityIndicator color={colors.primary} />
                      ) : documentFrontUri || documentFrontUrl ? (
                        <View style={styles.uploadedContainer}>
                          <Image
                            source={{ uri: documentFrontUri || documentFrontUrl || '' }}
                            style={styles.uploadedImage}
                          />
                          <View style={styles.uploadedOverlay}>
                            <IconSymbol name="checkmark.circle.fill" size={32} color={colors.success} />
                            <Text style={styles.uploadedText}>Tap to change</Text>
                          </View>
                        </View>
                      ) : (
                        <View style={styles.uploadContent}>
                          <IconSymbol name="photo" size={32} color={colors.primary} />
                          <Text style={styles.uploadText}>Tap to upload front</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>

                  {documentType !== 'passport' && (
                    <View style={styles.inputContainer}>
                      <Text style={commonStyles.label}>Document Back *</Text>
                      <Text style={styles.uploadHint}>
                        Upload a clear photo of the back of your ID document
                      </Text>
                      <TouchableOpacity
                        style={styles.uploadButton}
                        onPress={() => pickImage('back')}
                        disabled={uploadingBack}
                      >
                        {uploadingBack ? (
                          <ActivityIndicator color={colors.primary} />
                        ) : documentBackUri || documentBackUrl ? (
                          <View style={styles.uploadedContainer}>
                            <Image
                              source={{ uri: documentBackUri || documentBackUrl || '' }}
                              style={styles.uploadedImage}
                            />
                            <View style={styles.uploadedOverlay}>
                              <IconSymbol name="checkmark.circle.fill" size={32} color={colors.success} />
                              <Text style={styles.uploadedText}>Tap to change</Text>
                            </View>
                          </View>
                        ) : (
                          <View style={styles.uploadContent}>
                            <IconSymbol name="photo" size={32} color={colors.primary} />
                            <Text style={styles.uploadText}>Tap to upload back</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[buttonStyles.primary, styles.submitButton]}
                    onPress={handleSubmit}
                    disabled={submitting || uploadingFront || uploadingBack}
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
                      All personal information and documents are encrypted and stored securely. We comply with
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
  uploadHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  uploadButton: {
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  uploadContent: {
    alignItems: 'center',
    gap: 8,
  },
  uploadText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  uploadedContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  uploadedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  uploadedText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
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
