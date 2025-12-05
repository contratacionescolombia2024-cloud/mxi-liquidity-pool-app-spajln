
import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define translations
const translations = {
  en: {
    // Common
    loading: 'Loading...',
    loadingHistory: 'Loading history...',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    error: 'Error',
    success: 'Success',
    close: 'Close',
    ok: 'OK',
    yes: 'Yes',
    no: 'No',
    back: 'Back',
    next: 'Next',
    done: 'Done',
    edit: 'Edit',
    delete: 'Delete',
    view: 'View',
    share: 'Share',
    copy: 'Copy',
    copied: 'Copied!',
    copied2: '✅ Copied',
    or: 'or',
    total: 'Total',
    continue: 'Continue',
    send: 'Send',
    request: 'Request',
    sendRequest: 'Send Request',
    respond: 'Respond',
    pending: 'Pending',
    selectLanguage: 'Select Language',
    date: 'Date',
    currency: 'Currency',
    network: 'Network',
    order: 'Order',
    paymentID: 'Payment ID',
    transactionHash: 'Transaction Hash',
    
    // Tab Navigation
    tabHome: 'Home',
    tabDeposit: 'Deposit',
    tabWithdraw: 'Withdraw',
    tabReferrals: 'Referrals',
    tabTournaments: 'Tournaments',
    tabRewards: 'Rewards',
    tabEcosystem: 'Ecosystem',
    tabProfile: 'Profile',
    
    // Auth - Login Screen
    login: 'Login',
    loginButton: 'Login',
    register: 'Register',
    logout: 'Logout',
    email: 'Email',
    emailLabel: 'Email',
    password: 'Password',
    passwordLabel: 'Password',
    confirmPassword: 'Confirm Password',
    name: 'Full Name',
    idNumber: 'ID Number',
    address: 'Address',
    referralCode: 'Referral Code (Optional)',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    signIn: 'Sign In',
    signUp: 'Sign Up',
    createAccount: 'Create Account',
    forgotPassword: 'Forgot Password?',
    rememberPassword: 'Remember password',
    enterYourEmail: 'your@email.com',
    enterYourPassword: 'Enter your password',
    fillAllFields: 'Please fill in all fields',
    emailVerificationRequired: 'Email Verification Required',
    pleaseVerifyEmail: 'Please verify your email before logging in. Check your inbox for the verification link.',
    resendEmail: 'Resend Email',
    loginError: 'Login Error',
    invalidCredentials: 'Invalid email or password. Please try again.',
    errorLoggingIn: 'Error logging in. Please try again.',
    emailVerificationSent: 'Verification email sent! Please check your inbox.',
    errorResendingEmail: 'Error resending verification email. Please try again.',
    recoverPasswordTitle: 'Recover Password',
    recoverPasswordMessage: 'To recover your password, please contact our support team.',
    contactSupport: 'Contact Support',
    support: 'Support',
    sendEmailTo: 'Send an email to:',
    supportEmail: 'support@maxcoin.com',
    mxiStrategicPresale: 'MXI Strategic Presale',
    secureYourPosition: 'Secure your position in the future',
    viewTerms: 'View Terms and Conditions',
    termsAndConditions: 'Terms and Conditions',
    presaleClosesOn: 'Presale closes on February 15, 2026 at 12:00 UTC',
    pleaseVerifyEmailBeforeLogin: 'Please verify your email before logging in',
    resendEmailButton: 'Resend Email',
    
    // Payment verification error messages
    automaticVerificationFailed: 'Automatic Verification Failed',
    automaticVerificationFailedMessage: 'The automatic payment verification could not be completed.\n\nIf you have already made the payment through NowPayments or USDT, please request manual verification so an administrator can review your transaction.',
    requestManualVerificationNow: 'Request Manual Verification',
    continueWaiting: 'Continue Waiting',
    paymentVerificationError: 'Payment Verification Error',
    paymentVerificationErrorMessage: 'There was an error verifying your payment automatically.\n\nIf you completed the payment:\n• For NowPayments: Request manual verification\n• For USDT: Request manual verification with your transaction hash\n\nAn administrator will review your payment within 24-48 hours.',
    
    // ... rest of the translations remain the same
  },
  es: {
    // Common
    loading: 'Cargando...',
    loadingHistory: 'Cargando historial...',
    save: 'Guardar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    error: 'Error',
    success: 'Éxito',
    close: 'Cerrar',
    ok: 'OK',
    yes: 'Sí',
    no: 'No',
    back: 'Atrás',
    next: 'Siguiente',
    done: 'Hecho',
    edit: 'Editar',
    delete: 'Eliminar',
    view: 'Ver',
    share: 'Compartilhar',
    copy: 'Copiar',
    copied: '¡Copiado!',
    copied2: '✅ Copiado',
    or: 'o',
    total: 'Total',
    continue: 'Continuar',
    send: 'Enviar',
    request: 'Solicitar',
    sendRequest: 'Enviar Solicitud',
    respond: 'Responder',
    pending: 'Pendiente',
    selectLanguage: 'Seleccionar Idioma',
    date: 'Fecha',
    currency: 'Moneda',
    network: 'Red',
    order: 'Orden',
    paymentID: 'ID de Pago',
    transactionHash: 'Hash de Transacción',
    
    // Payment verification error messages
    automaticVerificationFailed: 'Verificación Automática Fallida',
    automaticVerificationFailedMessage: 'No se pudo completar la verificación automática del pago.\n\nSi ya realizaste el pago a través de NowPayments o USDT, por favor solicita la verificación manual para que un administrador revise tu transacción.',
    requestManualVerificationNow: 'Solicitar Verificación Manual',
    continueWaiting: 'Continuar Esperando',
    paymentVerificationError: 'Error de Verificación de Pago',
    paymentVerificationErrorMessage: 'Hubo un error al verificar tu pago automáticamente.\n\nSi completaste el pago:\n• Para NowPayments: Solicita verificación manual\n• Para USDT: Solicita verificación manual con tu hash de transacción\n\nUn administrador revisará tu pago en 24-48 horas.',
    
    // ... rest of Spanish translations remain the same
  },
  pt: {
    // Common
    loading: 'Carregando...',
    loadingHistory: 'Carregando histórico...',
    save: 'Salvar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    error: 'Erro',
    success: 'Sucesso',
    close: 'Fechar',
    ok: 'OK',
    yes: 'Sim',
    no: 'Não',
    back: 'Voltar',
    next: 'Próximo',
    done: 'Feito',
    edit: 'Editar',
    delete: 'Excluir',
    view: 'Ver',
    share: 'Compartilhar',
    copy: 'Copiar',
    copied: 'Copiado!',
    copied2: '✅ Copiado',
    or: 'ou',
    total: 'Total',
    continue: 'Continuar',
    send: 'Enviar',
    request: 'Solicitar',
    sendRequest: 'Enviar Solicitação',
    respond: 'Responder',
    pending: 'Pendente',
    selectLanguage: 'Selecionar Idioma',
    date: 'Data',
    currency: 'Moeda',
    network: 'Rede',
    order: 'Pedido',
    paymentID: 'ID de Pagamento',
    transactionHash: 'Hash de Transação',
    
    // Payment verification error messages
    automaticVerificationFailed: 'Verificação Automática Falhou',
    automaticVerificationFailedMessage: 'Não foi possível completar a verificação automática do pagamento.\n\nSe você já fez o pagamento através do NowPayments ou USDT, por favor solicite a verificação manual para que um administrador revise sua transação.',
    requestManualVerificationNow: 'Solicitar Verificação Manual',
    continueWaiting: 'Continuar Esperando',
    paymentVerificationError: 'Erro de Verificação de Pagamento',
    paymentVerificationErrorMessage: 'Houve um erro ao verificar seu pagamento automaticamente.\n\nSe você completou o pagamento:\n• Para NowPayments: Solicite verificação manual\n• Para USDT: Solicite verificação manual com seu hash de transação\n\nUm administrador revisará seu pagamento em 24-48 horas.',
    
    // ... rest of Portuguese translations remain the same
  },
};

// Create i18n instance
const i18n = new I18n(translations);

// Set default locale
i18n.defaultLocale = 'es';
i18n.enableFallback = true;

// Storage key for language preference
const LANGUAGE_KEY = '@mxi_language';

// Initialize language from storage or device locale
export const initializeLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    
    if (savedLanguage) {
      i18n.locale = savedLanguage;
    } else {
      // Get device locale
      const deviceLocale = Localization.getLocales()[0]?.languageCode || 'es';
      
      // Map device locale to supported languages
      if (deviceLocale.startsWith('en')) {
        i18n.locale = 'en';
      } else if (deviceLocale.startsWith('pt')) {
        i18n.locale = 'pt';
      } else {
        i18n.locale = 'es'; // Default to Spanish
      }
    }
  } catch (error) {
    console.error('Error initializing language:', error);
    i18n.locale = 'es';
  }
};

// Save language preference
export const setLanguage = async (language: 'en' | 'es' | 'pt') => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
    i18n.locale = language;
  } catch (error) {
    console.error('Error saving language:', error);
  }
};

// Get current language
export const getCurrentLanguage = (): 'en' | 'es' | 'pt' => {
  return i18n.locale as 'en' | 'es' | 'pt';
};

export { i18n };
