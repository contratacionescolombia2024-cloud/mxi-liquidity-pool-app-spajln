
import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import Footer from '@/components/Footer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import { showAlert, showConfirm } from '@/utils/confirmDialog';
import { supabase } from '@/lib/supabase';

const REMEMBER_EMAIL_KEY = '@mxi_remember_email';
const REMEMBER_PASSWORD_KEY = '@mxi_remember_password';

export default function LoginScreen() {
  const router = useRouter();
  const { login, resendVerificationEmail, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [unverifiedUserId, setUnverifiedUserId] = useState<string | null>(null);
  const [rememberPassword, setRememberPassword] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [sendingReset, setSendingReset] = useState(false);

  // Load saved credentials on mount
  useEffect(() => {
    loadSavedCredentials();
  }, []);

  const loadSavedCredentials = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem(REMEMBER_EMAIL_KEY);
      const savedPassword = await AsyncStorage.getItem(REMEMBER_PASSWORD_KEY);
      
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberPassword(true);
      }
      
      if (savedPassword) {
        setPassword(savedPassword);
      }
    } catch (error) {
      console.log('Error loading saved credentials:', error);
    }
  };

  const saveCredentials = async () => {
    try {
      if (rememberPassword) {
        await AsyncStorage.setItem(REMEMBER_EMAIL_KEY, email);
        await AsyncStorage.setItem(REMEMBER_PASSWORD_KEY, password);
      } else {
        await AsyncStorage.removeItem(REMEMBER_EMAIL_KEY);
        await AsyncStorage.removeItem(REMEMBER_PASSWORD_KEY);
      }
    } catch (error) {
      console.log('Error saving credentials:', error);
    }
  };

  const handleLogin = async () => {
    console.log('=== LOGIN ATTEMPT START ===');
    console.log('Email:', email);
    
    if (!email || !password) {
      showAlert(t('error'), t('fillAllFields'), undefined, 'error');
      return;
    }

    setLoading(true);
    console.log('Calling login function...');
    const result = await login(email, password);
    console.log('Login result:', result);
    setLoading(false);

    if (result.success) {
      console.log('Login successful, saving credentials and navigating to home');
      await saveCredentials();
      router.replace('/(tabs)/(home)/');
    } else {
      console.log('Login failed with error:', result.error);
      
      // Check if error is related to email verification
      const errorMessage = result.error?.toLowerCase() || '';
      if (errorMessage.includes('verif') || errorMessage.includes('email')) {
        setNeedsVerification(true);
        if (result.userId) {
          setUnverifiedUserId(result.userId);
        }
        showConfirm({
          title: t('emailVerificationRequired'),
          message: t('pleaseVerifyEmail'),
          confirmText: t('resendEmail'),
          cancelText: t('cancel'),
          type: 'warning',
          onConfirm: handleResendVerification,
          onCancel: () => {},
        });
      } else if (errorMessage.includes('invalid') || errorMessage.includes('credentials')) {
        showAlert(
          t('loginError'),
          t('invalidCredentials'),
          undefined,
          'error'
        );
      } else {
        showAlert(t('error'), result.error || t('errorLoggingIn'), undefined, 'error');
      }
    }
    
    console.log('=== LOGIN ATTEMPT END ===');
  };

  const handleResendVerification = async () => {
    console.log('Resending verification email...');
    setLoading(true);
    const result = await resendVerificationEmail();
    setLoading(false);

    if (result.success) {
      showAlert(t('success'), t('emailVerificationSent'), undefined, 'success');
    } else {
      showAlert(t('error'), result.error || t('errorResendingEmail'), undefined, 'error');
    }
  };

  const handleForgotPassword = () => {
    setResetEmail(email);
    setShowPasswordResetModal(true);
  };

  const handleSendPasswordReset = async () => {
    if (!resetEmail) {
      showAlert(t('error'), t('pleaseEnterTransactionHash'), undefined, 'error');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) {
      showAlert(t('error'), t('invalidEmail'), undefined, 'error');
      return;
    }

    setSendingReset(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: 'https://natively.dev/email-confirmed',
      });

      setSendingReset(false);

      if (error) {
        console.error('Password reset error:', error);
        showAlert(
          t('error'),
          error.message || 'Error al enviar el correo de recuperación',
          undefined,
          'error'
        );
      } else {
        setShowPasswordResetModal(false);
        showAlert(
          t('success'),
          'Se ha enviado un correo electrónico con instrucciones para restablecer tu contraseña. Por favor revisa tu bandeja de entrada.',
          undefined,
          'success'
        );
      }
    } catch (error: any) {
      setSendingReset(false);
      console.error('Password reset exception:', error);
      showAlert(
        t('error'),
        error.message || 'Error al enviar el correo de recuperación',
        undefined,
        'error'
      );
    }
  };

  // Show loading overlay if auth is initializing
  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Language Selector - Fixed position at top right */}
      <View style={styles.languageSelectorContainer}>
        <LanguageSelector />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/04a4d9ac-4539-41d2-bafd-67dd75925bde.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>{t('mxiStrategicPresale')}</Text>
          <Text style={styles.subtitle}>{t('secureYourPosition')}</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={commonStyles.label}>{t('emailLabel')}</Text>
            <TextInput
              style={commonStyles.input}
              placeholder={t('enterYourEmail')}
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={commonStyles.label}>{t('passwordLabel')}</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[commonStyles.input, styles.passwordInput]}
                placeholder={t('enterYourPassword')}
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
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
                  android_material_icon_name={showPassword ? 'visibility-off' : 'visibility'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Remember Password Checkbox */}
          <View style={styles.rememberContainer}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setRememberPassword(!rememberPassword)}
              disabled={loading}
            >
              <View style={[styles.checkbox, rememberPassword && styles.checkboxChecked]}>
                {rememberPassword && (
                  <IconSymbol
                    ios_icon_name="checkmark"
                    android_material_icon_name="check"
                    size={16}
                    color="#fff"
                  />
                )}
              </View>
              <Text style={styles.rememberText}>{t('rememberPassword')}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleForgotPassword} disabled={loading}>
              <Text style={styles.forgotPasswordText}>{t('forgotPassword')}</Text>
            </TouchableOpacity>
          </View>

          {needsVerification && (
            <View style={styles.verificationBox}>
              <IconSymbol 
                ios_icon_name="exclamationmark.triangle.fill" 
                android_material_icon_name="warning"
                size={20} 
                color={colors.warning} 
              />
              <Text style={styles.verificationText}>
                {t('pleaseVerifyEmailBeforeLogin')}
              </Text>
              <TouchableOpacity onPress={handleResendVerification} disabled={loading}>
                <Text style={styles.resendLink}>{t('resendEmailButton')}</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={[buttonStyles.primary, styles.loginButton, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={buttonStyles.primaryText}>{t('loginButton')}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('or')}</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={[buttonStyles.outline, styles.registerButton]}
            onPress={() => router.push('/(auth)/register')}
            disabled={loading}
          >
            <Text style={buttonStyles.outlineText}>{t('createAccount')}</Text>
          </TouchableOpacity>

          {/* Links to view terms and privacy policy */}
          <View style={styles.legalLinksContainer}>
            <TouchableOpacity
              style={styles.termsLinkContainer}
              onPress={() => setShowTermsModal(true)}
            >
              <Text style={styles.termsLinkText}>{t('viewTerms')}</Text>
            </TouchableOpacity>
            <Text style={styles.legalSeparator}>|</Text>
            <TouchableOpacity
              style={styles.termsLinkContainer}
              onPress={() => setShowPrivacyModal(true)}
            >
              <Text style={styles.termsLinkText}>{t('viewPrivacyPolicy')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {t('presaleClosesOn')}
          </Text>
        </View>

        {/* Footer */}
        <Footer />
      </ScrollView>

      {/* Password Reset Modal */}
      <Modal
        visible={showPasswordResetModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowPasswordResetModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🔑 {t('recoverPasswordTitle')}</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowPasswordResetModal(false)}
            >
              <IconSymbol
                ios_icon_name="xmark.circle.fill"
                android_material_icon_name="close"
                size={28}
                color={colors.text}
              />
            </TouchableOpacity>
          </View>
          <ScrollView 
            style={styles.modalContent} 
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.resetDescription}>
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
            </Text>

            <View style={styles.resetInputContainer}>
              <Text style={commonStyles.label}>{t('emailLabel')}</Text>
              <TextInput
                style={commonStyles.input}
                placeholder={t('enterYourEmail')}
                placeholderTextColor={colors.textSecondary}
                value={resetEmail}
                onChangeText={setResetEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!sendingReset}
              />
            </View>

            <View style={styles.resetInfoBox}>
              <IconSymbol 
                ios_icon_name="info.circle.fill" 
                android_material_icon_name="info" 
                size={20} 
                color={colors.primary} 
              />
              <Text style={styles.resetInfoText}>
                Recibirás un correo electrónico con un enlace para crear una nueva contraseña. El enlace expirará en 24 horas.
              </Text>
            </View>
          </ScrollView>
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[buttonStyles.primary, styles.sendResetButton, sendingReset && styles.buttonDisabled]}
              onPress={handleSendPasswordReset}
              disabled={sendingReset}
            >
              {sendingReset ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={buttonStyles.primaryText}>Enviar Enlace de Recuperación</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[buttonStyles.secondary, styles.closeButton]}
              onPress={() => setShowPasswordResetModal(false)}
              disabled={sendingReset}
            >
              <Text style={buttonStyles.secondaryText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

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
              <IconSymbol
                ios_icon_name="xmark.circle.fill"
                android_material_icon_name="close"
                size={28}
                color={colors.text}
              />
            </TouchableOpacity>
          </View>
          <ScrollView 
            style={styles.modalContent} 
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.termsContent}>
              {t('termsContent')}
            </Text>
          </ScrollView>
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[buttonStyles.primary, styles.closeButton]}
              onPress={() => setShowTermsModal(false)}
            >
              <Text style={buttonStyles.primaryText}>{t('close')}</Text>
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
              <IconSymbol
                ios_icon_name="xmark.circle.fill"
                android_material_icon_name="close"
                size={28}
                color={colors.text}
              />
            </TouchableOpacity>
          </View>
          <ScrollView 
            style={styles.modalContent} 
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.termsContent}>
              {t('privacyPolicyContent')}
            </Text>
          </ScrollView>
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[buttonStyles.primary, styles.closeButton]}
              onPress={() => setShowPrivacyModal(false)}
            >
              <Text style={buttonStyles.primaryText}>{t('close')}</Text>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
  },
  languageSelectorContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1000,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 20,
    width: 120,
    height: 120,
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
  rememberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  rememberText: {
    fontSize: 14,
    color: colors.text,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  verificationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  verificationText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
  },
  resendLink: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  loginButton: {
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    color: colors.textSecondary,
    fontSize: 14,
  },
  registerButton: {
    marginBottom: 16,
  },
  legalLinksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 12,
  },
  termsLinkContainer: {
    alignItems: 'center',
  },
  termsLinkText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  legalSeparator: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  footer: {
    marginTop: 32,
    marginBottom: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
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
  },
  closeButton: {
    marginBottom: 0,
  },
  resetDescription: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 24,
  },
  resetInputContainer: {
    marginBottom: 20,
  },
  resetInfoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.cardBackground,
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  resetInfoText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  sendResetButton: {
    marginBottom: 12,
  },
});
