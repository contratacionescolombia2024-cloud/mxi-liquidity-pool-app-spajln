
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
    
    // Auth
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    name: 'Full Name',
    idNumber: 'ID Number',
    address: 'Address',
    referralCode: 'Referral Code (Optional)',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    signIn: 'Sign In',
    signUp: 'Sign Up',
    
    // Home
    hello: 'Hello',
    welcomeToMXI: 'Welcome to MXI Pool',
    phasesAndProgress: '🚀 Phases and Progress',
    currentPhase: 'Current Phase',
    phase: 'Phase',
    sold: 'Sold',
    remaining: 'Remaining',
    generalProgress: '📈 General Progress',
    of: 'of',
    totalMXIDelivered: '💰 Total MXI Delivered',
    mxiDeliveredToAllUsers: 'MXI delivered to all users (purchases + commissions + challenges + vesting)',
    poolClose: 'Pool Close',
    
    // Ecosystem
    ecosystem: '🌐 MXI Ecosystem',
    liquidityPool: 'Maxcoin Liquidity Pool',
    whatIsMXI: 'What is MXI? 💎',
    howItWorks: 'How does it work? 🚀',
    whyBuy: 'Why buy? 💰',
    meta: 'META 🎯',
    ecosystemTab: 'Ecosystem 🌱',
    quantumSecurity: 'Quantum Security 🔐',
    sustainability: 'Sustainability ♻️',
    dailyVesting: 'Daily Vesting 💎',
    inPractice: 'In Practice 📊',
    tokenomics: 'Tokenomics 🪙',
    
    // Profile
    profile: 'Profile',
    myAccount: 'My Account',
    editProfile: 'Edit Profile',
    
    // Referrals
    referrals: 'Referrals',
    myReferrals: 'My Referrals',
    referralSystem: 'Referral System',
    
    // Payments
    payment: 'Payment',
    makePayment: 'Make Payment',
    paymentHistory: 'Payment History',
    
    // Withdrawals
    withdrawal: 'Withdrawal',
    withdraw: 'Withdraw',
    withdrawalHistory: 'Withdrawal History',
    
    // Language
    language: 'Language',
    selectLanguage: 'Select Language',
    english: 'English',
    spanish: 'Spanish',
    portuguese: 'Portuguese',
  },
  es: {
    // Common
    loading: 'Cargando...',
    save: 'Guardar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    error: 'Error',
    success: 'Éxito',
    
    // Auth
    login: 'Iniciar Sesión',
    register: 'Registrarse',
    logout: 'Cerrar Sesión',
    email: 'Correo Electrónico',
    password: 'Contraseña',
    name: 'Nombre Completo',
    idNumber: 'Número de Identificación',
    address: 'Dirección',
    referralCode: 'Código de Referido (Opcional)',
    alreadyHaveAccount: '¿Ya tienes una cuenta?',
    dontHaveAccount: '¿No tienes una cuenta?',
    signIn: 'Iniciar Sesión',
    signUp: 'Registrarse',
    
    // Home
    hello: 'Hola',
    welcomeToMXI: 'Bienvenido a MXI Pool',
    phasesAndProgress: '🚀 Fases y Progreso',
    currentPhase: 'Fase Actual',
    phase: 'Fase',
    sold: 'Vendidos',
    remaining: 'Restantes',
    generalProgress: '📈 Progreso General',
    of: 'de',
    totalMXIDelivered: '💰 Total MXI Entregados',
    mxiDeliveredToAllUsers: 'MXI entregados a todos los usuarios (compras + comisiones + desafíos + vesting)',
    poolClose: 'Cierre del Pool',
    
    // Ecosystem
    ecosystem: '🌐 Ecosistema MXI',
    liquidityPool: 'Pool de Liquidez Maxcoin',
    whatIsMXI: '¿Qué es MXI? 💎',
    howItWorks: '¿Cómo funciona? 🚀',
    whyBuy: '¿Por qué comprar? 💰',
    meta: 'META 🎯',
    ecosystemTab: 'Ecosistema 🌱',
    quantumSecurity: 'Seguridad Cuántica 🔐',
    sustainability: 'Sostenibilidad ♻️',
    dailyVesting: 'Vesting Diario 💎',
    inPractice: 'En la práctica 📊',
    tokenomics: 'Tokenómica 🪙',
    
    // Profile
    profile: 'Perfil',
    myAccount: 'Mi Cuenta',
    editProfile: 'Editar Perfil',
    
    // Referrals
    referrals: 'Referidos',
    myReferrals: 'Mis Referidos',
    referralSystem: 'Sistema de Referidos',
    
    // Payments
    payment: 'Pago',
    makePayment: 'Realizar Pago',
    paymentHistory: 'Historial de Pagos',
    
    // Withdrawals
    withdrawal: 'Retiro',
    withdraw: 'Retirar',
    withdrawalHistory: 'Historial de Retiros',
    
    // Language
    language: 'Idioma',
    selectLanguage: 'Seleccionar Idioma',
    english: 'Inglés',
    spanish: 'Español',
    portuguese: 'Portugués',
  },
  pt: {
    // Common
    loading: 'Carregando...',
    save: 'Salvar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    error: 'Erro',
    success: 'Sucesso',
    
    // Auth
    login: 'Entrar',
    register: 'Registrar',
    logout: 'Sair',
    email: 'E-mail',
    password: 'Senha',
    name: 'Nome Completo',
    idNumber: 'Número de Identificação',
    address: 'Endereço',
    referralCode: 'Código de Referência (Opcional)',
    alreadyHaveAccount: 'Já tem uma conta?',
    dontHaveAccount: 'Não tem uma conta?',
    signIn: 'Entrar',
    signUp: 'Registrar',
    
    // Home
    hello: 'Olá',
    welcomeToMXI: 'Bem-vindo ao MXI Pool',
    phasesAndProgress: '🚀 Fases e Progresso',
    currentPhase: 'Fase Atual',
    phase: 'Fase',
    sold: 'Vendidos',
    remaining: 'Restantes',
    generalProgress: '📈 Progresso Geral',
    of: 'de',
    totalMXIDelivered: '💰 Total MXI Entregues',
    mxiDeliveredToAllUsers: 'MXI entregues a todos os usuários (compras + comissões + desafios + vesting)',
    poolClose: 'Fechamento do Pool',
    
    // Ecosystem
    ecosystem: '🌐 Ecossistema MXI',
    liquidityPool: 'Pool de Liquidez Maxcoin',
    whatIsMXI: 'O que é MXI? 💎',
    howItWorks: 'Como funciona? 🚀',
    whyBuy: 'Por que comprar? 💰',
    meta: 'META 🎯',
    ecosystemTab: 'Ecossistema 🌱',
    quantumSecurity: 'Segurança Quântica 🔐',
    sustainability: 'Sustentabilidade ♻️',
    dailyVesting: 'Vesting Diário 💎',
    inPractice: 'Na prática 📊',
    tokenomics: 'Tokenômica 🪙',
    
    // Profile
    profile: 'Perfil',
    myAccount: 'Minha Conta',
    editProfile: 'Editar Perfil',
    
    // Referrals
    referrals: 'Referências',
    myReferrals: 'Minhas Referências',
    referralSystem: 'Sistema de Referências',
    
    // Payments
    payment: 'Pagamento',
    makePayment: 'Fazer Pagamento',
    paymentHistory: 'Histórico de Pagamentos',
    
    // Withdrawals
    withdrawal: 'Retirada',
    withdraw: 'Retirar',
    withdrawalHistory: 'Histórico de Retiradas',
    
    // Language
    language: 'Idioma',
    selectLanguage: 'Selecionar Idioma',
    english: 'Inglês',
    spanish: 'Espanhol',
    portuguese: 'Português',
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
