
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Modal,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';
import { showAlert } from '@/utils/confirmDialog';
import { 
  showRegistrationSuccess, 
  showRegistrationError 
} from '@/utils/registrationNotifications';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    idNumber: '',
    address: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const handleRegister = async () => {
    const { name, idNumber, address, email, password, confirmPassword, referralCode } = formData;

    console.log('=== REGISTRATION ATTEMPT START ===');
    console.log('Platform:', Platform.OS);
    console.log('Timestamp:', new Date().toISOString());

    // Validation
    if (!name || !idNumber || !address || !email || !password || !confirmPassword) {
      showAlert(t('error'), t('fillAllFields'), undefined, 'error');
      return;
    }

    if (!acceptedTerms) {
      showAlert(
        t('termsAndConditionsRequired'),
        t('youMustAcceptTerms'),
        undefined,
        'warning'
      );
      return;
    }

    if (password !== confirmPassword) {
      showAlert(t('error'), t('passwordsDontMatch'), undefined, 'error');
      return;
    }

    if (password.length < 6) {
      showAlert(t('error'), t('passwordTooShort'), undefined, 'error');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showAlert(t('error'), t('invalidEmail'), undefined, 'error');
      return;
    }

    // Validate name (at least 2 words)
    const nameParts = name.trim().split(' ').filter(part => part.length > 0);
    if (nameParts.length < 2) {
      showAlert(
        t('error'),
        'Por favor ingresa tu nombre completo (nombre y apellido)',
        undefined,
        'error'
      );
      return;
    }

    // Validate ID number (at least 5 characters)
    if (idNumber.trim().length < 5) {
      showAlert(
        t('error'),
        'El número de identificación debe tener al menos 5 caracteres',
        undefined,
        'error'
      );
      return;
    }

    // Validate address (at least 10 characters)
    if (address.trim().length < 10) {
      showAlert(
        t('error'),
        'Por favor ingresa una dirección completa (mínimo 10 caracteres)',
        undefined,
        'error'
      );
      return;
    }

    setLoading(true);
    
    try {
      console.log('Calling register function...');
      const result = await register({
        name: name.trim(),
        idNumber: idNumber.trim(),
        address: address.trim(),
        email: email.trim().toLowerCase(),
        password,
        referralCode: referralCode ? referralCode.trim().toUpperCase() : undefined,
      });

      console.log('Registration result:', result);

      if (result.success && result.userId) {
        console.log('Registration successful, saving terms acceptance...');
        // Save terms acceptance timestamp
        try {
          const { error: termsError } = await supabase
            .from('users')
            .update({ terms_accepted_at: new Date().toISOString() })
            .eq('id', result.userId);

          if (termsError) {
            console.error('Error saving terms acceptance:', termsError);
          } else {
            console.log('Terms acceptance saved successfully');
          }
        } catch (termsErr) {
          console.error('Exception saving terms:', termsErr);
        }
      }

      setLoading(false);

      if (result.success) {
        console.log('Showing success message and navigating to login');
        showRegistrationSuccess(email.trim().toLowerCase(), () => {
          console.log('User acknowledged success, navigating to login');
          router.replace('/(auth)/login');
        });
      } else {
        console.log('Registration failed:', result.error);
        showRegistrationError(result.error || t('failedToCreateAccount'), email.trim().toLowerCase());
      }
    } catch (error: any) {
      setLoading(false);
      console.error('=== REGISTRATION EXCEPTION ===');
      console.error('Registration exception:', error);
      console.error('Error stack:', error.stack);
      console.error('Timestamp:', new Date().toISOString());
      
      showAlert(
        t('error'),
        'Ocurrió un error inesperado durante el registro. Por favor intenta de nuevo o contacta a soporte si el problema persiste.\n\nError: ' + (error.message || 'Desconocido'),
        undefined,
        'error'
      );
    }
    
    console.log('=== REGISTRATION ATTEMPT END ===');
    console.log('Timestamp:', new Date().toISOString());
  };

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonEmoji}>⬅️</Text>
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/04a4d9ac-4539-41d2-bafd-67dd75925bde.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>{t('joinMXIStrategicPresale')}</Text>
          <Text style={styles.subtitle}>{t('secureYourPosition')}</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={commonStyles.label}>{t('fullName')} *</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="Ej: Juan Pérez"
              placeholderTextColor={colors.textSecondary}
              value={formData.name}
              onChangeText={(value) => updateField('name', value)}
              autoCapitalize="words"
              editable={!loading}
            />
            <Text style={styles.helperText}>Ingresa tu nombre completo (nombre y apellido)</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={commonStyles.label}>{t('idNumber')} *</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="Ej: 123456789"
              placeholderTextColor={colors.textSecondary}
              value={formData.idNumber}
              onChangeText={(value) => updateField('idNumber', value)}
              keyboardType="default"
              editable={!loading}
            />
            <Text style={styles.helperText}>Número de cédula, DNI o pasaporte</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={commonStyles.label}>{t('address')} *</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="Ej: Calle 123 #45-67, Ciudad"
              placeholderTextColor={colors.textSecondary}
              value={formData.address}
              onChangeText={(value) => updateField('address', value)}
              autoCapitalize="words"
              editable={!loading}
            />
            <Text style={styles.helperText}>Dirección completa de residencia</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={commonStyles.label}>{t('email')} *</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="tu@email.com"
              placeholderTextColor={colors.textSecondary}
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!loading}
            />
            <Text style={styles.helperText}>Usarás este correo para iniciar sesión</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={commonStyles.label}>{t('password')} *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[commonStyles.input, styles.passwordInput]}
                placeholder={t('minimumSixCharacters')}
                placeholderTextColor={colors.textSecondary}
                value={formData.password}
                onChangeText={(value) => updateField('password', value)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                <IconSymbol
                  ios_icon_name={showPassword ? 'eye.slash.fill' : 'eye.fill'}
                  android_material_icon_name={showPassword ? 'visibility_off' : 'visibility'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={commonStyles.label}>{t('confirmPassword')} *</Text>
            <TextInput
              style={commonStyles.input}
              placeholder={t('reEnterPassword')}
              placeholderTextColor={colors.textSecondary}
              value={formData.confirmPassword}
              onChangeText={(value) => updateField('confirmPassword', value)}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={commonStyles.label}>{t('referralCode')}</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="Ej: MXI123456 (opcional)"
              placeholderTextColor={colors.textSecondary}
              value={formData.referralCode}
              onChangeText={(value) => updateField('referralCode', value)}
              autoCapitalize="characters"
              editable={!loading}
            />
            <Text style={styles.helperText}>Si tienes un código de referido, ingrésalo aquí</Text>
          </View>

          <View style={styles.infoBox}>
            <IconSymbol 
              ios_icon_name="info.circle.fill" 
              android_material_icon_name="info" 
              size={20} 
              color={colors.primary} 
            />
            <Text style={styles.infoText}>
              {t('onlyOneAccountPerPerson')}
            </Text>
          </View>

          {/* Terms and Conditions Acceptance */}
          <View style={styles.termsContainer}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setAcceptedTerms(!acceptedTerms)}
              disabled={loading}
            >
              <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
                {acceptedTerms && (
                  <Text style={styles.checkboxEmoji}>✓</Text>
                )}
              </View>
              <View style={styles.termsTextContainer}>
                <Text style={styles.termsText}>
                  {t('iHaveReadAndAccept')}{' '}
                  <Text
                    style={styles.termsLink}
                    onPress={() => setShowTermsModal(true)}
                  >
                    {t('termsAndConditions')}
                  </Text>
                  {' '}{t('and')}{' '}
                  <Text
                    style={styles.termsLink}
                    onPress={() => setShowPrivacyModal(true)}
                  >
                    {t('privacyPolicy')}
                  </Text>
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[buttonStyles.primary, styles.registerButton, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{t('createAccount')}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.loginLinkText}>
              {t('alreadyHaveAccountLogin')} <Text style={styles.loginLinkBold}>{t('login')}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Terms and Conditions Modal */}
      <Modal
        visible={showTermsModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowTermsModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>📜 {t('termsAndConditions')}</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowTermsModal(false)}
            >
              <Text style={styles.modalCloseEmoji}>✖️</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalScrollContent}>
            <Text style={styles.termsContent}>
              {t('termsContent')}
            </Text>
          </ScrollView>
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[buttonStyles.primary, styles.acceptButton]}
              onPress={() => {
                setAcceptedTerms(true);
                setShowTermsModal(false);
              }}
            >
              <Text style={buttonStyles.primaryText}>✓ {t('acceptTermsButton')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[buttonStyles.secondary, styles.closeButton]}
              onPress={() => setShowTermsModal(false)}
            >
              <Text style={buttonStyles.secondaryText}>{t('close')}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal
        visible={showPrivacyModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🔒 {t('privacyPolicy')}</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowPrivacyModal(false)}
            >
              <Text style={styles.modalCloseEmoji}>✖️</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalScrollContent}>
            <Text style={styles.termsContent}>
              {t('privacyPolicyContent')}
            </Text>
          </ScrollView>
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[buttonStyles.primary, styles.acceptButton]}
              onPress={() => {
                setAcceptedTerms(true);
                setShowPrivacyModal(false);
              }}
            >
              <Text style={buttonStyles.primaryText}>✓ {t('acceptTermsButton')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[buttonStyles.secondary, styles.closeButton]}
              onPress={() => setShowPrivacyModal(false)}
            >
              <Text style={buttonStyles.secondaryText}>{t('close')}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  backButton: {
    marginBottom: 16,
    alignSelf: 'flex-start',
    padding: 8,
  },
  backButtonEmoji: {
    fontSize: 24,
  },
  logoContainer: {
    marginBottom: 16,
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    marginLeft: 4,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 12,
    padding: 4,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  termsContainer: {
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxEmoji: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '700',
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  registerButton: {
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  loginLinkBold: {
    color: colors.primary,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalCloseEmoji: {
    fontSize: 24,
  },
  modalContent: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  termsContent: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 22,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  acceptButton: {
    marginBottom: 0,
  },
  closeButton: {
    marginBottom: 0,
  },
});
