
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
    or: 'or',
    
    // Auth
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
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
    
    // Login Page
    mxiStrategicPresale: 'MXI Strategic PreSale',
    secureYourPosition: 'Secure Your Position in the Future',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    loginButton: 'Login',
    recoverPassword: 'Recover Password',
    contactSupport: 'Contact Support',
    sendEmailTo: 'Send an email to:',
    pleaseVerifyEmailBeforeLogin: 'Please verify your email before logging in.',
    resendEmailButton: 'Resend Email',
    emailVerificationSent: 'Verification email sent. Please check your inbox.',
    errorResendingEmail: 'Error resending verification email',
    recoverPasswordTitle: 'Recover Password',
    recoverPasswordMessage: 'Please contact technical support to recover your password.',
    supportEmail: 'support@mxi-strategic.com',
    presaleClosesOn: 'The Pre-Sale closes on January 15, 2026 at 12:00 UTC',
    
    // Register Page
    joinMXIStrategicPresale: 'Join MXI Strategic PreSale',
    fullName: 'Full Name',
    minimumSixCharacters: 'Minimum 6 characters',
    reEnterPassword: 'Re-enter password',
    enterReferralCode: 'Enter referral code',
    onlyOneAccountPerPerson: 'Only one account per person is allowed. Your ID number will be verified.',
    iHaveReadAndAccept: 'I have read and accept the',
    termsAndConditions: 'Terms and Conditions',
    alreadyHaveAccountLogin: 'Already have an account?',
    termsAndConditionsRequired: 'Terms and Conditions Required',
    youMustAcceptTerms: 'You must accept the Terms and Conditions to create an account',
    accountCreatedSuccessfully: 'Account created successfully! Please check your email to verify your account before logging in.',
    failedToCreateAccount: 'Failed to create account. Please try again.',
    
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
    perMXI: 'per MXI',
    
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
    total: 'Total',
    totalBalanceOfMXI: 'Total Balance of MXI',
    updateYourInformation: 'Update your information',
    viewPreviousWithdrawals: 'View previous withdrawals',
    areYouSureLogout: 'Are you sure you want to log out?',
    
    // Referrals
    referrals: 'Referrals',
    myReferrals: 'My Referrals',
    referralSystem: 'Referral System',
    yourReferralCode: 'Your Referral Code',
    shareCode: 'Share Code',
    commissionBalance: 'Commission Balance (MXI)',
    totalEarned: 'Total Earned',
    available: 'Available',
    level: 'Level',
    activeReferrals: 'Active Referrals',
    howReferralsWork: 'How Referrals Work',
    allCommissionsInMXI: 'All commissions are handled internally in MXI',
    withdrawToBalanceMXI: 'Withdraw to MXI Balance',
    transferCommissionsDescription: 'Transfer your commissions to your main MXI balance to use them for purchases and other functions.',
    withdrawToBalance: 'Withdraw to Balance',
    amountToWithdraw: 'Amount to Withdraw (MXI)',
    minimum50MXI: 'Minimum 50 MXI',
    availableAmount: 'Available',
    requirements: 'Requirements',
    activeReferralsRequired: 'active referrals required',
    minimumAmount: 'Minimum',
    yourReferrals: 'Your Referrals',
    activeReferralsLevel1: 'Active Referrals (Level 1)',
    shareReferralCode: 'Share your referral code with friends',
    earn5PercentLevel1: 'Earn 5% in MXI from Level 1 referrals',
    earn2PercentLevel2: 'Earn 2% in MXI from Level 2 referrals',
    earn1PercentLevel3: 'Earn 1% in MXI from Level 3 referrals',
    allCommissionsCreditedMXI: 'All commissions are credited directly in MXI',
    need5ActiveReferrals: 'Need 5 active Level 1 referrals to withdraw',
    invalidAmount: 'Invalid Amount',
    pleaseEnterValidAmount: 'Please enter a valid amount',
    minimumWithdrawal: 'Minimum Withdrawal',
    minimumWithdrawalIs50MXI: 'The minimum withdrawal is 50 MXI',
    insufficientBalance: 'Insufficient Balance',
    youOnlyHaveAvailable: 'You only have',
    availableFromCommissions: 'available from commissions',
    requirementsNotMet: 'Requirements Not Met',
    youNeed5ActiveReferrals: 'You need 5 active referrals who have purchased the minimum MXI.',
    currentlyYouHave: 'Currently you have:',
    confirmWithdrawalToBalance: 'Confirm Withdrawal to MXI Balance',
    doYouWantToTransfer: 'Do you want to transfer',
    fromCommissionsToMainBalance: 'from commissions to your main balance?',
    thisWillAllowYouToUse: 'This will allow you to use these MXI for purchases and other functions.',
    withdrawalSuccessful: 'Withdrawal Successful',
    transferredToMainBalance: 'have been transferred to your main balance',
    
    // Payments
    payment: 'Payment',
    makePayment: 'Make Payment',
    paymentHistory: 'Payment History',
    payInUSDT: 'Pay in USDT',
    selectNetwork: 'Select Payment Network',
    recipientAddress: 'Recipient Address',
    transactionHash: 'Transaction Hash (txHash)',
    verifyPayment: 'Verify Payment',
    verifyAutomatically: 'Verify Automatically',
    requestManualVerification: 'Request Manual Verification',
    paymentInstructions: 'Payment Instructions',
    
    // Withdrawals
    withdrawal: 'Withdrawal',
    withdraw: 'Withdraw',
    withdrawalHistory: 'Withdrawal History',
    withdrawals: 'Withdrawals',
    withdrawalType: 'Withdrawal Type',
    withdrawalDetails: 'Withdrawal Details',
    amount: 'Amount',
    walletAddress: 'Wallet Address',
    requestWithdrawal: 'Request Withdrawal',
    withdrawalRequirements: 'Withdrawal Requirements',
    mxiPurchased: 'MXI Purchased',
    mxiCommissions: 'MXI Commissions',
    mxiVesting: 'MXI Vesting',
    mxiTournaments: 'MXI Tournaments',
    
    // Language
    language: 'Language',
    selectLanguage: 'Select Language',
    english: 'English',
    spanish: 'Spanish',
    portuguese: 'Portuguese',
    
    // KYC
    kycVerification: 'KYC Verification',
    kycStatus: 'KYC Status',
    approved: 'Approved',
    pending: 'Pending',
    rejected: 'Rejected',
    notSubmitted: 'Not Submitted',
    
    // Balance
    balance: 'Balance',
    totalBalance: 'Total Balance',
    mxiAvailable: 'MXI Available',
    mxiFromVesting: 'MXI from Vesting',
    mxiFromTournaments: 'MXI from Tournaments',
    
    // Vesting
    vesting: 'Vesting',
    vestingAndYield: 'Vesting & Yield',
    yieldGeneration: 'Yield Generation',
    viewYieldGeneration: 'View yield generation',
    
    // Support
    support: 'Support',
    getHelp: 'Get Help',
    
    // Challenges
    challengeHistory: 'Challenge History',
    viewGameRecords: 'View game records',
    
    // Terms
    viewTerms: 'View Terms and Conditions',
    acceptTerms: 'I have read and accept the',
    acceptTermsButton: 'Accept Terms',
    
    // Messages
    emailVerificationRequired: 'Email Verification Required',
    pleaseVerifyEmail: 'Please verify your email address before logging in. Check your inbox for the verification link.',
    resendEmail: 'Resend Email',
    accountCreatedSuccess: 'Account created successfully! Please check your email to verify your account.',
    loginSuccess: 'Login successful',
    loginError: 'Login Error',
    invalidCredentials: 'Invalid email or password. Please check your credentials and try again.',
    errorLoggingIn: 'Error logging in. Please try again.',
    
    // Errors
    fillAllFields: 'Please fill in all required fields',
    invalidEmail: 'Please enter a valid email address',
    passwordTooShort: 'Password must be at least 6 characters',
    passwordsDontMatch: 'Passwords do not match',
    
    // Info
    minimumInvestment: 'Minimum investment from 50 USDT',
    poolClosesOn: 'The Pre-Sale closes on January 15, 2026 at 12:00 UTC',
    
    // Admin
    adminPanel: 'Admin Panel',
    manageUsers: 'Manage users and system',
    
    // Stats
    memberSince: 'Member since',
    
    // Actions
    refresh: 'Refresh',
    updating: 'Updating...',
    
    // Conversion
    conversionRate: 'Conversion Rate',
    equivalent: 'Equivalent',
    
    // Time
    realTime: 'Real Time',
    processingTime: 'Processing time: 24-48 hours',
    
    // Important
    important: 'Important',
    note: 'Note',
    warning: 'Warning',
    
    // Network
    network: 'Network',
    ethereum: 'Ethereum',
    bnbChain: 'BNB Chain',
    polygon: 'Polygon',
    
    // Calculator
    calculator: 'Calculator',
    mxiCalculator: 'MXI Calculator',
    
    // Referrals additional
    referralsText: 'referrals',
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
    or: 'o',
    
    // Auth
    login: 'Iniciar Sesión',
    register: 'Registrarse',
    logout: 'Cerrar Sesión',
    email: 'Correo Electrónico',
    password: 'Contraseña',
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
    
    // Login Page
    mxiStrategicPresale: 'MXI Strategic PreSale',
    secureYourPosition: 'Asegura Tu Posición en el Futuro',
    emailLabel: 'Correo Electrónico',
    passwordLabel: 'Contraseña',
    loginButton: 'Iniciar Sesión',
    recoverPassword: 'Recuperar Contraseña',
    contactSupport: 'Contactar Soporte',
    sendEmailTo: 'Envía un correo a:',
    pleaseVerifyEmailBeforeLogin: 'Por favor verifica tu email antes de iniciar sesión.',
    resendEmailButton: 'Reenviar Email',
    emailVerificationSent: 'Email de verificación enviado. Por favor revisa tu bandeja de entrada.',
    errorResendingEmail: 'Error al reenviar el email de verificación',
    recoverPasswordTitle: 'Recuperar Contraseña',
    recoverPasswordMessage: 'Por favor contacta al soporte técnico para recuperar tu contraseña.',
    supportEmail: 'support@mxi-strategic.com',
    presaleClosesOn: 'La Pre-Venta cierra el 15 de enero de 2026 a las 12:00 UTC',
    
    // Register Page
    joinMXIStrategicPresale: 'Únete a MXI Strategic PreSale',
    fullName: 'Nombre Completo',
    minimumSixCharacters: 'Mínimo 6 caracteres',
    reEnterPassword: 'Vuelve a ingresar la contraseña',
    enterReferralCode: 'Ingresa el código de referido',
    onlyOneAccountPerPerson: 'Solo se permite una cuenta por persona. Tu número de identificación será verificado.',
    iHaveReadAndAccept: 'He leído y acepto los',
    termsAndConditions: 'Términos y Condiciones',
    alreadyHaveAccountLogin: '¿Ya tienes una cuenta?',
    termsAndConditionsRequired: 'Términos y Condiciones Requeridos',
    youMustAcceptTerms: 'Debes aceptar los Términos y Condiciones para crear una cuenta',
    accountCreatedSuccessfully: '¡Cuenta creada exitosamente! Por favor revisa tu correo para verificar tu cuenta antes de iniciar sesión.',
    failedToCreateAccount: 'Error al crear la cuenta. Por favor intenta nuevamente.',
    
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
    perMXI: 'por MXI',
    
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
    total: 'Total',
    totalBalanceOfMXI: 'Balance Total de MXI',
    updateYourInformation: 'Actualiza tu información',
    viewPreviousWithdrawals: 'Ver retiros anteriores',
    areYouSureLogout: '¿Estás seguro que deseas cerrar sesión?',
    
    // Referrals
    referrals: 'Referidos',
    myReferrals: 'Mis Referidos',
    referralSystem: 'Sistema de Referidos',
    yourReferralCode: 'Tu Código de Referido',
    shareCode: 'Compartir Código',
    commissionBalance: 'Balance de Comisiones (MXI)',
    totalEarned: 'Total Ganado',
    available: 'Disponible',
    level: 'Nivel',
    activeReferrals: 'Referidos Activos',
    howReferralsWork: 'Cómo Funcionan los Referidos',
    allCommissionsInMXI: 'Todas las comisiones se manejan internamente en MXI',
    withdrawToBalanceMXI: 'Retirar a Balance MXI',
    transferCommissionsDescription: 'Transfiere tus comisiones a tu balance principal de MXI para usarlas en compras y otras funciones.',
    withdrawToBalance: 'Retirar a Balance',
    amountToWithdraw: 'Monto a Retirar (MXI)',
    minimum50MXI: 'Mínimo 50 MXI',
    availableAmount: 'Disponible',
    requirements: 'Requisitos',
    activeReferralsRequired: 'referidos activos requeridos',
    minimumAmount: 'Mínimo',
    yourReferrals: 'Tus Referidos',
    activeReferralsLevel1: 'Referidos Activos (Nivel 1)',
    shareReferralCode: 'Comparte tu código de referido con amigos',
    earn5PercentLevel1: 'Gana 5% en MXI de referidos de Nivel 1',
    earn2PercentLevel2: 'Gana 2% en MXI de referidos de Nivel 2',
    earn1PercentLevel3: 'Gana 1% en MXI de referidos de Nivel 3',
    allCommissionsCreditedMXI: 'Todas las comisiones se acreditan directamente en MXI',
    need5ActiveReferrals: 'Necesitas 5 referidos activos de Nivel 1 para retirar',
    invalidAmount: 'Monto Inválido',
    pleaseEnterValidAmount: 'Por favor ingresa un monto válido',
    minimumWithdrawal: 'Retiro Mínimo',
    minimumWithdrawalIs50MXI: 'El retiro mínimo es de 50 MXI',
    insufficientBalance: 'Saldo Insuficiente',
    youOnlyHaveAvailable: 'Solo tienes',
    availableFromCommissions: 'disponibles de comisiones',
    requirementsNotMet: 'Requisitos No Cumplidos',
    youNeed5ActiveReferrals: 'Necesitas 5 referidos activos que hayan comprado el mínimo de MXI.',
    currentlyYouHave: 'Actualmente tienes:',
    confirmWithdrawalToBalance: 'Confirmar Retiro a Balance MXI',
    doYouWantToTransfer: '¿Deseas transferir',
    fromCommissionsToMainBalance: 'de comisiones a tu balance principal?',
    thisWillAllowYouToUse: 'Esto te permitirá usar estos MXI para compras y otras funciones.',
    withdrawalSuccessful: 'Retiro Exitoso',
    transferredToMainBalance: 'se han transferido a tu balance principal',
    
    // Payments
    payment: 'Pago',
    makePayment: 'Realizar Pago',
    paymentHistory: 'Historial de Pagos',
    payInUSDT: 'Pagar en USDT',
    selectNetwork: 'Selecciona la Red de Pago',
    recipientAddress: 'Dirección Receptora',
    transactionHash: 'Hash de Transacción (txHash)',
    verifyPayment: 'Verificar Pago',
    verifyAutomatically: 'Verificar Automáticamente',
    requestManualVerification: 'Solicitar Verificación Manual',
    paymentInstructions: 'Instrucciones de Pago',
    
    // Withdrawals
    withdrawal: 'Retiro',
    withdraw: 'Retirar',
    withdrawalHistory: 'Historial de Retiros',
    withdrawals: 'Retiros',
    withdrawalType: 'Tipo de Retiro',
    withdrawalDetails: 'Detalles del Retiro',
    amount: 'Cantidad',
    walletAddress: 'Dirección de Billetera',
    requestWithdrawal: 'Solicitar Retiro',
    withdrawalRequirements: 'Requisitos de Retiro',
    mxiPurchased: 'MXI Comprados',
    mxiCommissions: 'MXI Comisiones',
    mxiVesting: 'MXI Vesting',
    mxiTournaments: 'MXI Torneos',
    
    // Language
    language: 'Idioma',
    selectLanguage: 'Seleccionar Idioma',
    english: 'Inglés',
    spanish: 'Español',
    portuguese: 'Portugués',
    
    // KYC
    kycVerification: 'Verificación KYC',
    kycStatus: 'Estado KYC',
    approved: 'Aprobado',
    pending: 'Pendiente',
    rejected: 'Rechazado',
    notSubmitted: 'No Enviado',
    
    // Balance
    balance: 'Balance',
    totalBalance: 'Balance Total',
    mxiAvailable: 'MXI Disponibles',
    mxiFromVesting: 'MXI de Vesting',
    mxiFromTournaments: 'MXI de Torneos',
    
    // Vesting
    vesting: 'Vesting',
    vestingAndYield: 'Vesting y Rendimiento',
    yieldGeneration: 'Generación de Rendimiento',
    viewYieldGeneration: 'Ver generación de rendimiento',
    
    // Support
    support: 'Soporte',
    getHelp: 'Obtener Ayuda',
    
    // Challenges
    challengeHistory: 'Historial de Retos',
    viewGameRecords: 'Ver registros de juegos',
    
    // Terms
    viewTerms: 'Ver Términos y Condiciones',
    acceptTerms: 'He leído y acepto los',
    acceptTermsButton: 'Aceptar Términos',
    
    // Messages
    emailVerificationRequired: 'Verificación de Email Requerida',
    pleaseVerifyEmail: 'Por favor verifica tu dirección de correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada para el enlace de verificación.',
    resendEmail: 'Reenviar Email',
    accountCreatedSuccess: '¡Cuenta creada exitosamente! Por favor revisa tu correo para verificar tu cuenta.',
    loginSuccess: 'Inicio de sesión exitoso',
    loginError: 'Error de Inicio de Sesión',
    invalidCredentials: 'Correo electrónico o contraseña incorrectos. Por favor verifica tus credenciales e intenta nuevamente.',
    errorLoggingIn: 'Error al iniciar sesión. Por favor intenta nuevamente.',
    
    // Errors
    fillAllFields: 'Por favor completa todos los campos requeridos',
    invalidEmail: 'Por favor ingresa un correo electrónico válido',
    passwordTooShort: 'La contraseña debe tener al menos 6 caracteres',
    passwordsDontMatch: 'Las contraseñas no coinciden',
    
    // Info
    minimumInvestment: 'Inversión mínima desde 50 USDT',
    poolClosesOn: 'La Pre-Venta cierra el 15 de enero de 2026 a las 12:00 UTC',
    
    // Admin
    adminPanel: 'Panel de Administrador',
    manageUsers: 'Gestionar usuarios y sistema',
    
    // Stats
    memberSince: 'Miembro desde',
    
    // Actions
    refresh: 'Actualizar',
    updating: 'Actualizando...',
    
    // Conversion
    conversionRate: 'Tasa de Conversión',
    equivalent: 'Equivalente',
    
    // Time
    realTime: 'Tiempo Real',
    processingTime: 'Tiempo de procesamiento: 24-48 horas',
    
    // Important
    important: 'Importante',
    note: 'Nota',
    warning: 'Advertencia',
    
    // Network
    network: 'Red',
    ethereum: 'Ethereum',
    bnbChain: 'BNB Chain',
    polygon: 'Polygon',
    
    // Calculator
    calculator: 'Calculadora',
    mxiCalculator: 'Calculadora de MXI',
    
    // Referrals additional
    referralsText: 'referidos',
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
    done: 'Concluído',
    edit: 'Editar',
    delete: 'Excluir',
    view: 'Ver',
    share: 'Compartilhar',
    copy: 'Copiar',
    copied: 'Copiado!',
    or: 'ou',
    
    // Auth
    login: 'Entrar',
    register: 'Registrar',
    logout: 'Sair',
    email: 'E-mail',
    password: 'Senha',
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
    
    // Login Page
    mxiStrategicPresale: 'MXI Strategic PreSale',
    secureYourPosition: 'Garanta Sua Posição no Futuro',
    emailLabel: 'E-mail',
    passwordLabel: 'Senha',
    loginButton: 'Entrar',
    recoverPassword: 'Recuperar Senha',
    contactSupport: 'Contatar Suporte',
    sendEmailTo: 'Envie um e-mail para:',
    pleaseVerifyEmailBeforeLogin: 'Por favor, verifique seu e-mail antes de fazer login.',
    resendEmailButton: 'Reenviar E-mail',
    emailVerificationSent: 'E-mail de verificação enviado. Por favor, verifique sua caixa de entrada.',
    errorResendingEmail: 'Erro ao reenviar e-mail de verificação',
    recoverPasswordTitle: 'Recuperar Senha',
    recoverPasswordMessage: 'Por favor, entre em contato com o suporte técnico para recuperar sua senha.',
    supportEmail: 'support@mxi-strategic.com',
    presaleClosesOn: 'A Pré-Venda fecha em 15 de janeiro de 2026 às 12:00 UTC',
    
    // Register Page
    joinMXIStrategicPresale: 'Junte-se ao MXI Strategic PreSale',
    fullName: 'Nome Completo',
    minimumSixCharacters: 'Mínimo 6 caracteres',
    reEnterPassword: 'Digite novamente a senha',
    enterReferralCode: 'Digite o código de referência',
    onlyOneAccountPerPerson: 'Apenas uma conta por pessoa é permitida. Seu número de identificação será verificado.',
    iHaveReadAndAccept: 'Li e aceito os',
    termsAndConditions: 'Termos e Condições',
    alreadyHaveAccountLogin: 'Já tem uma conta?',
    termsAndConditionsRequired: 'Termos e Condições Necessários',
    youMustAcceptTerms: 'Você deve aceitar os Termos e Condições para criar uma conta',
    accountCreatedSuccessfully: 'Conta criada com sucesso! Por favor, verifique seu e-mail para verificar sua conta antes de fazer login.',
    failedToCreateAccount: 'Falha ao criar conta. Por favor, tente novamente.',
    
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
    perMXI: 'por MXI',
    
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
    total: 'Total',
    totalBalanceOfMXI: 'Saldo Total de MXI',
    updateYourInformation: 'Atualize suas informações',
    viewPreviousWithdrawals: 'Ver retiradas anteriores',
    areYouSureLogout: 'Tem certeza de que deseja sair?',
    
    // Referrals
    referrals: 'Referências',
    myReferrals: 'Minhas Referências',
    referralSystem: 'Sistema de Referências',
    yourReferralCode: 'Seu Código de Referência',
    shareCode: 'Compartilhar Código',
    commissionBalance: 'Saldo de Comissões (MXI)',
    totalEarned: 'Total Ganho',
    available: 'Disponível',
    level: 'Nível',
    activeReferrals: 'Referências Ativas',
    howReferralsWork: 'Como Funcionam as Referências',
    allCommissionsInMXI: 'Todas as comissões são tratadas internamente em MXI',
    withdrawToBalanceMXI: 'Retirar para Saldo MXI',
    transferCommissionsDescription: 'Transfira suas comissões para seu saldo principal de MXI para usá-las em compras e outras funções.',
    withdrawToBalance: 'Retirar para Saldo',
    amountToWithdraw: 'Quantidade a Retirar (MXI)',
    minimum50MXI: 'Mínimo 50 MXI',
    availableAmount: 'Disponível',
    requirements: 'Requisitos',
    activeReferralsRequired: 'referências ativas necessárias',
    minimumAmount: 'Mínimo',
    yourReferrals: 'Suas Referências',
    activeReferralsLevel1: 'Referências Ativas (Nível 1)',
    shareReferralCode: 'Compartilhe seu código de referência com amigos',
    earn5PercentLevel1: 'Ganhe 5% em MXI de referências de Nível 1',
    earn2PercentLevel2: 'Ganhe 2% em MXI de referências de Nível 2',
    earn1PercentLevel3: 'Ganhe 1% em MXI de referências de Nível 3',
    allCommissionsCreditedMXI: 'Todas as comissões são creditadas diretamente em MXI',
    need5ActiveReferrals: 'Precisa de 5 referências ativas de Nível 1 para retirar',
    invalidAmount: 'Quantidade Inválida',
    pleaseEnterValidAmount: 'Por favor, insira uma quantidade válida',
    minimumWithdrawal: 'Retirada Mínima',
    minimumWithdrawalIs50MXI: 'A retirada mínima é de 50 MXI',
    insufficientBalance: 'Saldo Insuficiente',
    youOnlyHaveAvailable: 'Você só tem',
    availableFromCommissions: 'disponíveis de comissões',
    requirementsNotMet: 'Requisitos Não Atendidos',
    youNeed5ActiveReferrals: 'Você precisa de 5 referências ativas que compraram o mínimo de MXI.',
    currentlyYouHave: 'Atualmente você tem:',
    confirmWithdrawalToBalance: 'Confirmar Retirada para Saldo MXI',
    doYouWantToTransfer: 'Deseja transferir',
    fromCommissionsToMainBalance: 'de comissões para seu saldo principal?',
    thisWillAllowYouToUse: 'Isso permitirá que você use esses MXI para compras e outras funções.',
    withdrawalSuccessful: 'Retirada Bem-sucedida',
    transferredToMainBalance: 'foram transferidos para seu saldo principal',
    
    // Payments
    payment: 'Pagamento',
    makePayment: 'Fazer Pagamento',
    paymentHistory: 'Histórico de Pagamentos',
    payInUSDT: 'Pagar em USDT',
    selectNetwork: 'Selecione a Rede de Pagamento',
    recipientAddress: 'Endereço do Destinatário',
    transactionHash: 'Hash da Transação (txHash)',
    verifyPayment: 'Verificar Pagamento',
    verifyAutomatically: 'Verificar Automaticamente',
    requestManualVerification: 'Solicitar Verificação Manual',
    paymentInstructions: 'Instruções de Pagamento',
    
    // Withdrawals
    withdrawal: 'Retirada',
    withdraw: 'Retirar',
    withdrawalHistory: 'Histórico de Retiradas',
    withdrawals: 'Retiradas',
    withdrawalType: 'Tipo de Retirada',
    withdrawalDetails: 'Detalhes da Retirada',
    amount: 'Quantidade',
    walletAddress: 'Endereço da Carteira',
    requestWithdrawal: 'Solicitar Retirada',
    withdrawalRequirements: 'Requisitos de Retirada',
    mxiPurchased: 'MXI Comprados',
    mxiCommissions: 'MXI Comissões',
    mxiVesting: 'MXI Vesting',
    mxiTournaments: 'MXI Torneios',
    
    // Language
    language: 'Idioma',
    selectLanguage: 'Selecionar Idioma',
    english: 'Inglês',
    spanish: 'Espanhol',
    portuguese: 'Português',
    
    // KYC
    kycVerification: 'Verificação KYC',
    kycStatus: 'Status KYC',
    approved: 'Aprovado',
    pending: 'Pendente',
    rejected: 'Rejeitado',
    notSubmitted: 'Não Enviado',
    
    // Balance
    balance: 'Saldo',
    totalBalance: 'Saldo Total',
    mxiAvailable: 'MXI Disponíveis',
    mxiFromVesting: 'MXI de Vesting',
    mxiFromTournaments: 'MXI de Torneios',
    
    // Vesting
    vesting: 'Vesting',
    vestingAndYield: 'Vesting e Rendimento',
    yieldGeneration: 'Geração de Rendimento',
    viewYieldGeneration: 'Ver geração de rendimento',
    
    // Support
    support: 'Suporte',
    getHelp: 'Obter Ajuda',
    
    // Challenges
    challengeHistory: 'Histórico de Desafios',
    viewGameRecords: 'Ver registros de jogos',
    
    // Terms
    viewTerms: 'Ver Termos e Condições',
    acceptTerms: 'Li e aceito os',
    acceptTermsButton: 'Aceitar Termos',
    
    // Messages
    emailVerificationRequired: 'Verificação de E-mail Necessária',
    pleaseVerifyEmail: 'Por favor, verifique seu endereço de e-mail antes de fazer login. Verifique sua caixa de entrada para o link de verificação.',
    resendEmail: 'Reenviar E-mail',
    accountCreatedSuccess: 'Conta criada com sucesso! Por favor, verifique seu e-mail para verificar sua conta.',
    loginSuccess: 'Login bem-sucedido',
    loginError: 'Erro de Login',
    invalidCredentials: 'E-mail ou senha inválidos. Por favor, verifique suas credenciais e tente novamente.',
    errorLoggingIn: 'Erro ao fazer login. Por favor, tente novamente.',
    
    // Errors
    fillAllFields: 'Por favor, preencha todos os campos obrigatórios',
    invalidEmail: 'Por favor, insira um endereço de e-mail válido',
    passwordTooShort: 'A senha deve ter pelo menos 6 caracteres',
    passwordsDontMatch: 'As senhas não coincidem',
    
    // Info
    minimumInvestment: 'Investimento mínimo a partir de 50 USDT',
    poolClosesOn: 'A Pré-Venda fecha em 15 de janeiro de 2026 às 12:00 UTC',
    
    // Admin
    adminPanel: 'Painel de Administrador',
    manageUsers: 'Gerenciar usuários e sistema',
    
    // Stats
    memberSince: 'Membro desde',
    
    // Actions
    refresh: 'Atualizar',
    updating: 'Atualizando...',
    
    // Conversion
    conversionRate: 'Taxa de Conversão',
    equivalent: 'Equivalente',
    
    // Time
    realTime: 'Tempo Real',
    processingTime: 'Tempo de processamento: 24-48 horas',
    
    // Important
    important: 'Importante',
    note: 'Nota',
    warning: 'Aviso',
    
    // Network
    network: 'Rede',
    ethereum: 'Ethereum',
    bnbChain: 'BNB Chain',
    polygon: 'Polygon',
    
    // Calculator
    calculator: 'Calculadora',
    mxiCalculator: 'Calculadora de MXI',
    
    // Referrals additional
    referralsText: 'referências',
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
