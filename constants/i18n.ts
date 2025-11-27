
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
    total: 'Total',
    
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
    withdrawToBalance: 'Withdraw to Balance',
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
    
    // Vesting
    vesting: 'Vesting',
    vestingAndYield: 'Vesting & Yield',
    yieldGeneration: 'Yield Generation',
    
    // Support
    support: 'Support',
    getHelp: 'Get Help',
    
    // Challenges
    challengeHistory: 'Challenge History',
    viewGameRecords: 'View game records',
    
    // Terms
    termsAndConditions: 'Terms and Conditions',
    viewTerms: 'View Terms and Conditions',
    acceptTerms: 'I have read and accept the',
    
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
    
    // Requirements
    requirements: 'Requirements',
    activeReferralsRequired: 'active referrals required',
    kycApproved: 'KYC Approved',
    
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
    total: 'Total',
    
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
    withdrawToBalance: 'Retirar a Balance',
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
    
    // Vesting
    vesting: 'Vesting',
    vestingAndYield: 'Vesting y Rendimiento',
    yieldGeneration: 'Generación de Rendimiento',
    
    // Support
    support: 'Soporte',
    getHelp: 'Obtener Ayuda',
    
    // Challenges
    challengeHistory: 'Historial de Retos',
    viewGameRecords: 'Ver registros de juegos',
    
    // Terms
    termsAndConditions: 'Términos y Condiciones',
    viewTerms: 'Ver Términos y Condiciones',
    acceptTerms: 'He leído y acepto los',
    
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
    
    // Requirements
    requirements: 'Requisitos',
    activeReferralsRequired: 'referidos activos requeridos',
    kycApproved: 'KYC Aprobado',
    
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
    total: 'Total',
    
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
    withdrawToBalance: 'Retirar para Saldo',
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
    
    // Vesting
    vesting: 'Vesting',
    vestingAndYield: 'Vesting e Rendimento',
    yieldGeneration: 'Geração de Rendimento',
    
    // Support
    support: 'Suporte',
    getHelp: 'Obter Ajuda',
    
    // Challenges
    challengeHistory: 'Histórico de Desafios',
    viewGameRecords: 'Ver registros de jogos',
    
    // Terms
    termsAndConditions: 'Termos e Condições',
    viewTerms: 'Ver Termos e Condições',
    acceptTerms: 'Li e aceito os',
    
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
    
    // Requirements
    requirements: 'Requisitos',
    activeReferralsRequired: 'referências ativas necessárias',
    kycApproved: 'KYC Aprovado',
    
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
