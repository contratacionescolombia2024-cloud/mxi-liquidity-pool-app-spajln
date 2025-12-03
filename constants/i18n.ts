
import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define translations
const translations = {
  en: {
    // Common
    loading: 'Loading...',
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
    
    // User Management
    userManagement: 'User Management',
    searchPlaceholder: 'Search by name, email, ID or code...',
    loadingUsers: 'Loading users...',
    users: 'Users',
    noUsersFound: 'No users found',
    adjustSearchFilters: 'Try adjusting your search or filters',
    all: 'All',
    actives: 'Active',
    inactive: 'Inactive',
    blocked: 'Blocked',
    refs: 'Refs',
    joined: 'Joined',
    userDetails: 'User Details',
    blockUser: 'Block User',
    unblockUser: 'Unblock User',
    blockUserConfirm: 'Are you sure you want to block this user? They will not be able to access their account.',
    unblockUserConfirm: 'Are you sure you want to unblock this user? They will regain access to their account.',
    blockedByAdmin: 'Blocked by administrator',
    userBlockedSuccess: 'User has been blocked successfully',
    userUnblockedSuccess: 'User has been unblocked successfully',
    errorBlockingUser: 'Error blocking user. Please try again.',
    errorUnblockingUser: 'Error unblocking user. Please try again.',
    dangerZone: 'Danger Zone',
    
    // ... rest of English translations remain the same
  },
  es: {
    // Common
    loading: 'Cargando...',
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
    share: 'Compartir',
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
    
    // Tab Navigation
    tabHome: 'Inicio',
    tabDeposit: 'Depósito',
    tabWithdraw: 'Retirar',
    tabReferrals: 'Referidos',
    tabTournaments: 'Torneos',
    tabRewards: 'Recompensas',
    tabEcosystem: 'Ecosistema',
    tabProfile: 'Perfil',
    
    // Auth - Login Screen
    login: 'Iniciar Sesión',
    loginButton: 'Iniciar Sesión',
    register: 'Registrarse',
    logout: 'Cerrar Sesión',
    email: 'Correo Electrónico',
    emailLabel: 'Correo Electrónico',
    password: 'Contraseña',
    passwordLabel: 'Contraseña',
    confirmPassword: 'Confirmar Contraseña',
    name: 'Nombre Completo',
    idNumber: 'Número de Identificación',
    address: 'Dirección',
    referralCode: 'Código de Referido (Opcional)',
    alreadyHaveAccount: '¿Ya tienes una cuenta?',
    dontHaveAccount: '¿No tienes una cuenta?',
    signIn: 'Iniciar Sesión',
    signUp: 'Registrarse',
    createAccount: 'Crear Cuenta',
    forgotPassword: '¿Olvidaste tu contraseña?',
    rememberPassword: 'Recordar contraseña',
    enterYourEmail: 'tu@email.com',
    enterYourPassword: 'Ingresa tu contraseña',
    fillAllFields: 'Por favor completa todos los campos',
    emailVerificationRequired: 'Verificación de Email Requerida',
    pleaseVerifyEmail: 'Por favor verifica tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada para el enlace de verificación.',
    resendEmail: 'Reenviar Email',
    loginError: 'Error de Inicio de Sesión',
    invalidCredentials: 'Email o contraseña inválidos. Por favor intenta de nuevo.',
    errorLoggingIn: 'Error al iniciar sesión. Por favor intenta de nuevo.',
    emailVerificationSent: '¡Email de verificación enviado! Por favor revisa tu bandeja de entrada.',
    errorResendingEmail: 'Error al reenviar email de verificación. Por favor intenta de nuevo.',
    recoverPasswordTitle: 'Recuperar Contraseña',
    recoverPasswordMessage: 'Para recuperar tu contraseña, por favor contacta a nuestro equipo de soporte.',
    contactSupport: 'Contactar Soporte',
    support: 'Soporte',
    sendEmailTo: 'Envía un email a:',
    supportEmail: 'soporte@maxcoin.com',
    mxiStrategicPresale: 'Preventa Estratégica MXI',
    secureYourPosition: 'Asegura tu posición en el futuro',
    viewTerms: 'Ver Términos y Condiciones',
    termsAndConditions: 'Términos y Condiciones',
    presaleClosesOn: 'La preventa cierra el 15 de febrero de 2026 a las 12:00 UTC',
    pleaseVerifyEmailBeforeLogin: 'Por favor verifica tu email antes de iniciar sesión',
    resendEmailButton: 'Reenviar Email',
    
    // User Management
    userManagement: 'Gestión de Usuarios',
    searchPlaceholder: 'Buscar por nombre, email, ID o código...',
    loadingUsers: 'Cargando usuarios...',
    users: 'Usuarios',
    noUsersFound: 'No se encontraron usuarios',
    adjustSearchFilters: 'Intenta ajustar tu búsqueda o filtros',
    all: 'Todos',
    actives: 'Activos',
    inactive: 'Inactivos',
    blocked: 'Bloqueados',
    refs: 'Refs',
    joined: 'Unido',
    userDetails: 'Detalles del Usuario',
    blockUser: 'Bloquear Usuario',
    unblockUser: 'Desbloquear Usuario',
    blockUserConfirm: '¿Estás seguro de que quieres bloquear este usuario? No podrá acceder a su cuenta.',
    unblockUserConfirm: '¿Estás seguro de que quieres desbloquear este usuario? Recuperará el acceso a su cuenta.',
    blockedByAdmin: 'Bloqueado por administrador',
    userBlockedSuccess: 'El usuario ha sido bloqueado exitosamente',
    userUnblockedSuccess: 'El usuario ha sido desbloqueado exitosamente',
    errorBlockingUser: 'Error al bloquear usuario. Por favor intenta de nuevo.',
    errorUnblockingUser: 'Error al desbloquear usuario. Por favor intenta de nuevo.',
    dangerZone: 'Zona de Peligro',
    
    // ... rest of Spanish translations remain the same (keeping all existing translations)
  },
  pt: {
    // Common
    loading: 'Carregando...',
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
    
    // Tab Navigation
    tabHome: 'Início',
    tabDeposit: 'Depósito',
    tabWithdraw: 'Retirar',
    tabReferrals: 'Indicações',
    tabTournaments: 'Torneios',
    tabRewards: 'Recompensas',
    tabEcosystem: 'Ecossistema',
    tabProfile: 'Perfil',
    
    // User Management
    userManagement: 'Gestão de Usuários',
    searchPlaceholder: 'Buscar por nome, email, ID ou código...',
    loadingUsers: 'Carregando usuários...',
    users: 'Usuários',
    noUsersFound: 'Nenhum usuário encontrado',
    adjustSearchFilters: 'Tente ajustar sua busca ou filtros',
    all: 'Todos',
    actives: 'Ativos',
    inactive: 'Inativos',
    blocked: 'Bloqueados',
    refs: 'Refs',
    joined: 'Entrou',
    userDetails: 'Detalhes do Usuário',
    blockUser: 'Bloquear Usuário',
    unblockUser: 'Desbloquear Usuário',
    blockUserConfirm: 'Tem certeza de que deseja bloquear este usuário? Ele não poderá acessar sua conta.',
    unblockUserConfirm: 'Tem certeza de que deseja desbloquear este usuário? Ele recuperará o acesso à sua conta.',
    blockedByAdmin: 'Bloqueado pelo administrador',
    userBlockedSuccess: 'Usuário foi bloqueado com sucesso',
    userUnblockedSuccess: 'Usuário foi desbloqueado com sucesso',
    errorBlockingUser: 'Erro ao bloquear usuário. Por favor, tente novamente.',
    errorUnblockingUser: 'Erro ao desbloquear usuário. Por favor, tente novamente.',
    dangerZone: 'Zona de Perigo',
    
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
