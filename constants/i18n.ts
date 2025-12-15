
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
    and: 'and',
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
    
    // Home Screen
    hello: 'Hello',
    welcomeToMXI: 'Welcome to MXI',
    phasesAndProgress: 'Phases and Progress',
    currentPhase: 'Current Phase',
    usdtPerMXI: 'USDT per MXI',
    phase: 'Phase',
    sold: 'Sold',
    remaining: 'Remaining',
    generalProgress: 'Overall Progress',
    of: 'of',
    totalMXIDelivered: 'Total MXI Delivered',
    mxiDeliveredToAllUsers: 'MXI delivered to all users (all sources)',
    poolClose: 'Pool closes on',
    perMXIText: 'per MXI',
    
    // Launch Countdown
    officialLaunch: 'Official Launch',
    maxcoinMXI: 'MAXCOIN (MXI)',
    launchDate: 'February 15, 2026 at 12:00 UTC',
    presaleStart: 'Presale Start',
    presaleEnd: 'Presale End',
    days: 'Days',
    hours: 'Hours',
    minutes: 'Minutes',
    seconds: 'Seconds',
    poolActive: 'Pool Active',
    vestingRealTime: 'Vesting in Real-Time',
    
    // Total MXI Balance Chart
    totalMXIBalance: 'Total MXI Balance',
    allSourcesIncluded: 'All sources included',
    noBalanceHistory: 'No balance history available',
    chartShowsDynamicBalance: 'This chart shows your total MXI balance over time, including all sources: purchases, commissions, tournaments, and vesting.',
    loadingChart: 'Loading chart...',
    purchased: 'Purchased',
    commissions: 'Commissions',
    tournaments: 'Tournaments',
    vesting: 'Vesting',
    completeBreakdown: 'Complete Breakdown',
    mxiPurchased: 'MXI Purchased',
    mxiCommissions: 'MXI Commissions',
    mxiTournaments: 'MXI Tournaments',
    vestingRealTimeLabel: 'Vesting (Real-Time)',
    updatingEverySecond: 'Updating every second',
    mxiTotal: 'MXI Total',
    balanceChangeTimestamps: 'Balance Change Timestamps',
    
    // Yield Display
    vestingMXI: 'Vesting MXI',
    generatingPerSecond: 'Generating {{rate}} MXI per second',
    mxiPurchasedVestingBase: 'MXI Purchased (Vesting Base)',
    onlyPurchasedMXIGeneratesVesting: 'Only purchased MXI generates vesting',
    currentSession: 'Current Session',
    totalAccumulated: 'Total Accumulated',
    perSecond: 'Per Second',
    perMinute: 'Per Minute',
    perHour: 'Per Hour',
    dailyYield: 'Daily Yield',
    claimYield: 'Claim Yield',
    claiming: 'Claiming...',
    yieldInfo: 'Vesting is generated automatically from your purchased MXI. You can claim it once you meet the withdrawal requirements.',
    noYield: 'No Yield',
    needMoreYield: 'You need to accumulate more yield before claiming.',
    requirementsNotMet: 'Requirements Not Met',
    claimRequirements: 'You need 5 active referrals to claim yield. Current: {{count}}/5',
    kycRequired: 'KYC Required',
    kycRequiredMessage: 'You need to complete KYC verification before claiming yield.',
    yieldClaimed: 'Yield Claimed',
    yieldClaimedMessage: 'Successfully claimed {{amount}} MXI!',
    claimFailed: 'Claim Failed',
    requirementsToWithdraw: 'Requirements to Withdraw',
    activeReferralsForGeneralWithdrawals: '5 Active Referrals for general withdrawals ({{count}}/5)',
    kycApproved: 'KYC Approved',
    
    // Ambassador Button
    ambassadorButtonTitle: 'MXI Ambassadors',
    ambassadorButtonSubtitle: 'Earn bonuses for your referrals',
    
    // Additional translations (rest of the file remains the same)
    // ... (keeping all other existing translations)
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
    and: 'y',
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
    
    // Home Screen
    hello: 'Hola',
    welcomeToMXI: 'Bienvenido a MXI',
    phasesAndProgress: 'Fases y Progreso',
    currentPhase: 'Fase Actual',
    usdtPerMXI: 'USDT por MXI',
    phase: 'Fase',
    sold: 'Vendido',
    remaining: 'Restante',
    generalProgress: 'Progreso General',
    of: 'de',
    totalMXIDelivered: 'Total MXI Entregado',
    mxiDeliveredToAllUsers: 'MXI entregado a todos los usuarios (todas las fuentes)',
    poolClose: 'El pool cierra el',
    perMXIText: 'por MXI',
    
    // Launch Countdown
    officialLaunch: 'Lanzamiento Oficial',
    maxcoinMXI: 'MAXCOIN (MXI)',
    launchDate: '15 de febrero de 2026 a las 12:00 UTC',
    presaleStart: 'Inicio de Preventa',
    presaleEnd: 'Finalización de Preventa',
    days: 'Días',
    hours: 'Horas',
    minutes: 'Minutos',
    seconds: 'Segundos',
    poolActive: 'Pool Activo',
    vestingRealTime: 'Vesting en Tiempo Real',
    
    // Total MXI Balance Chart
    totalMXIBalance: 'Saldo Total MXI',
    allSourcesIncluded: 'Todas las fuentes incluidas',
    noBalanceHistory: 'No hay historial de saldo disponible',
    chartShowsDynamicBalance: 'Este gráfico muestra tu saldo total de MXI a lo largo del tiempo, incluyendo todas las fuentes: compras, comisiones, torneos y vesting.',
    loadingChart: 'Cargando gráfico...',
    purchased: 'Comprado',
    commissions: 'Comisiones',
    tournaments: 'Torneos',
    vesting: 'Vesting',
    completeBreakdown: 'Desglose Completo',
    mxiPurchased: 'MXI Comprado',
    mxiCommissions: 'Comisiones MXI',
    mxiTournaments: 'Torneos MXI',
    vestingRealTimeLabel: 'Vesting (Tiempo Real)',
    updatingEverySecond: 'Actualizando cada segundo',
    mxiTotal: 'MXI Total',
    balanceChangeTimestamps: 'Marcas de Tiempo de Cambios de Saldo',
    
    // Yield Display
    vestingMXI: 'Vesting MXI',
    generatingPerSecond: 'Generando {{rate}} MXI por segundo',
    mxiPurchasedVestingBase: 'MXI Comprado (Base de Vesting)',
    onlyPurchasedMXIGeneratesVesting: 'Solo el MXI comprado genera vesting',
    currentSession: 'Sesión Actual',
    totalAccumulated: 'Total Acumulado',
    perSecond: 'Por Segundo',
    perMinute: 'Por Minuto',
    perHour: 'Por Hora',
    dailyYield: 'Rendimiento Diario',
    claimYield: 'Reclamar Rendimiento',
    claiming: 'Reclamando...',
    yieldInfo: 'El vesting se genera automáticamente desde tu MXI comprado. Puedes reclamarlo una vez que cumplas los requisitos de retiro.',
    noYield: 'Sin Rendimiento',
    needMoreYield: 'Necesitas acumular más rendimiento antes de reclamar.',
    requirementsNotMet: 'Requisitos No Cumplidos',
    claimRequirements: 'Necesitas 5 referidos activos para reclamar rendimiento. Actual: {{count}}/5',
    kycRequired: 'KYC Requerido',
    kycRequiredMessage: 'Necesitas completar la verificación KYC antes de reclamar rendimiento.',
    yieldClaimed: 'Rendimiento Reclamado',
    yieldClaimedMessage: '¡Reclamaste exitosamente {{amount}} MXI!',
    claimFailed: 'Reclamo Fallido',
    requirementsToWithdraw: 'Requisitos para Retirar',
    activeReferralsForGeneralWithdrawals: '5 Referidos Activos para retiros generales ({{count}}/5)',
    kycApproved: 'KYC Aprobado',
    
    // Ambassador Button
    ambassadorButtonTitle: 'Embajadores MXI',
    ambassadorButtonSubtitle: 'Gana bonos por tus referidos',
    
    // Additional translations (rest of the file remains the same)
    // ... (keeping all other existing translations)
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
    and: 'e',
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
    
    // Tab Navigation
    tabHome: 'Início',
    tabDeposit: 'Depósito',
    tabWithdraw: 'Retirar',
    tabReferrals: 'Referências',
    tabTournaments: 'Torneios',
    tabRewards: 'Recompensas',
    tabEcosystem: 'Ecossistema',
    tabProfile: 'Perfil',
    
    // Auth - Login Screen
    login: 'Entrar',
    loginButton: 'Entrar',
    register: 'Registrar',
    logout: 'Sair',
    email: 'Email',
    emailLabel: 'Email',
    password: 'Senha',
    passwordLabel: 'Senha',
    confirmPassword: 'Confirmar Senha',
    name: 'Nome Completo',
    idNumber: 'Número de Identificação',
    address: 'Endereço',
    referralCode: 'Código de Referência (Opcional)',
    alreadyHaveAccount: 'Já tem uma conta?',
    dontHaveAccount: 'Não tem uma conta?',
    signIn: 'Entrar',
    signUp: 'Registrar',
    createAccount: 'Criar Conta',
    forgotPassword: 'Esqueceu sua senha?',
    rememberPassword: 'Lembrar senha',
    enterYourEmail: 'seu@email.com',
    enterYourPassword: 'Digite sua senha',
    fillAllFields: 'Por favor, preencha todos os campos',
    emailVerificationRequired: 'Verificação de Email Necessária',
    pleaseVerifyEmail: 'Por favor, verifique seu email antes de fazer login. Verifique sua caixa de entrada para o link de verificação.',
    resendEmail: 'Reenviar Email',
    loginError: 'Erro de Login',
    invalidCredentials: 'Email ou senha inválidos. Por favor, tente novamente.',
    errorLoggingIn: 'Erro ao fazer login. Por favor, tente novamente.',
    emailVerificationSent: 'Email de verificação enviado! Por favor, verifique sua caixa de entrada.',
    errorResendingEmail: 'Erro ao reenviar email de verificação. Por favor, tente novamente.',
    recoverPasswordTitle: 'Recuperar Senha',
    recoverPasswordMessage: 'Para recuperar sua senha, por favor, entre em contato com nossa equipe de suporte.',
    contactSupport: 'Contatar Suporte',
    support: 'Suporte',
    sendEmailTo: 'Envie um email para:',
    supportEmail: 'suporte@maxcoin.com',
    mxiStrategicPresale: 'Pré-venda Estratégica MXI',
    secureYourPosition: 'Garanta sua posição no futuro',
    viewTerms: 'Ver Termos e Condições',
    termsAndConditions: 'Termos e Condições',
    presaleClosesOn: 'A pré-venda fecha em 15 de fevereiro de 2026 às 12:00 UTC',
    pleaseVerifyEmailBeforeLogin: 'Por favor, verifique seu email antes de fazer login',
    resendEmailButton: 'Reenviar Email',
    
    // Home Screen
    hello: 'Olá',
    welcomeToMXI: 'Bem-vindo ao MXI',
    phasesAndProgress: 'Fases e Progresso',
    currentPhase: 'Fase Atual',
    usdtPerMXI: 'USDT por MXI',
    phase: 'Fase',
    sold: 'Vendido',
    remaining: 'Restante',
    generalProgress: 'Progresso Geral',
    of: 'de',
    totalMXIDelivered: 'Total MXI Entregue',
    mxiDeliveredToAllUsers: 'MXI entregue a todos os usuários (todas as fontes)',
    poolClose: 'O pool fecha em',
    perMXIText: 'por MXI',
    
    // Launch Countdown
    officialLaunch: 'Lançamento Oficial',
    maxcoinMXI: 'MAXCOIN (MXI)',
    launchDate: '15 de fevereiro de 2026 às 12:00 UTC',
    presaleStart: 'Início da Pré-venda',
    presaleEnd: 'Finalização da Pré-venda',
    days: 'Dias',
    hours: 'Horas',
    minutes: 'Minutos',
    seconds: 'Segundos',
    poolActive: 'Pool Ativo',
    vestingRealTime: 'Vesting em Tempo Real',
    
    // Total MXI Balance Chart
    totalMXIBalance: 'Saldo Total MXI',
    allSourcesIncluded: 'Todas as fontes incluídas',
    noBalanceHistory: 'Nenhum histórico de saldo disponível',
    chartShowsDynamicBalance: 'Este gráfico mostra seu saldo total de MXI ao longo do tempo, incluindo todas as fontes: compras, comissões, torneios e vesting.',
    loadingChart: 'Carregando gráfico...',
    purchased: 'Comprado',
    commissions: 'Comissões',
    tournaments: 'Torneios',
    vesting: 'Vesting',
    completeBreakdown: 'Detalhamento Completo',
    mxiPurchased: 'MXI Comprado',
    mxiCommissions: 'Comissões MXI',
    mxiTournaments: 'Torneios MXI',
    vestingRealTimeLabel: 'Vesting (Tempo Real)',
    updatingEverySecond: 'Atualizando a cada segundo',
    mxiTotal: 'MXI Total',
    balanceChangeTimestamps: 'Carimbos de Tempo de Mudanças de Saldo',
    
    // Yield Display
    vestingMXI: 'Vesting MXI',
    generatingPerSecond: 'Gerando {{rate}} MXI por segundo',
    mxiPurchasedVestingBase: 'MXI Comprado (Base de Vesting)',
    onlyPurchasedMXIGeneratesVesting: 'Apenas o MXI comprado gera vesting',
    currentSession: 'Sessão Atual',
    totalAccumulated: 'Total Acumulado',
    perSecond: 'Por Segundo',
    perMinute: 'Por Minuto',
    perHour: 'Por Hora',
    dailyYield: 'Rendimento Diário',
    claimYield: 'Reivindicar Rendimento',
    claiming: 'Reivindicando...',
    yieldInfo: 'O vesting é gerado automaticamente do seu MXI comprado. Você pode reivindicá-lo assim que atender aos requisitos de retirada.',
    noYield: 'Sem Rendimento',
    needMoreYield: 'Você precisa acumular mais rendimento antes de reivindicar.',
    requirementsNotMet: 'Requisitos Não Atendidos',
    claimRequirements: 'Você precisa de 5 referências ativas para reivindicar rendimento. Atual: {{count}}/5',
    kycRequired: 'KYC Necessário',
    kycRequiredMessage: 'Você precisa completar a verificação KYC antes de reivindicar rendimento.',
    yieldClaimed: 'Rendimento Reivindicado',
    yieldClaimedMessage: 'Reivindicou com sucesso {{amount}} MXI!',
    claimFailed: 'Reivindicação Falhou',
    requirementsToWithdraw: 'Requisitos para Retirar',
    activeReferralsForGeneralWithdrawals: '5 Referências Ativas para retiradas gerais ({{count}}/5)',
    kycApproved: 'KYC Aprovado',
    
    // Ambassador Button
    ambassadorButtonTitle: 'Embaixadores MXI',
    ambassadorButtonSubtitle: 'Ganhe bônus por suas referências',
    
    // Additional translations (rest of the file remains the same)
    // ... (keeping all other existing translations)
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
