
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
    
    // Withdrawal translations - TRC20 (Tron)
    networkTRC20: 'Withdrawals will be processed in USDT via TRC20 network (Tron)',
    walletAddressTRC20: 'USDT Wallet Address (TRC20)',
    enterTRC20WalletAddress: 'Enter your USDT TRC20 wallet address (Tron)',
    trc20AddressValidation: 'TRC20 address must start with T and be 34 characters long',
    
    // Legacy ETH keys (for backward compatibility)
    withdrawalsInUSDTETH: 'Withdrawals in USDT (TRC20 Network - Tron)',
    walletAddressETH: 'USDT Wallet Address (TRC20)',
    enterYourETHWalletAddress: 'Enter your USDT TRC20 wallet address (Tron)',
    
    // ... rest of English translations remain the same
    locale: 'en',
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
    share: 'Compartilhar',
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
    
    // Withdrawal translations - TRC20 (Tron)
    networkTRC20: 'Los retiros se procesarán en USDT por la red TRC20 (Tron)',
    walletAddressTRC20: 'Dirección de Billetera USDT (TRC20)',
    enterTRC20WalletAddress: 'Ingresa tu dirección de billetera USDT TRC20 (Tron)',
    trc20AddressValidation: 'La dirección TRC20 debe comenzar con T y tener 34 caracteres',
    
    // Legacy ETH keys (for backward compatibility) - NOW POINTING TO TRC20
    withdrawalsInUSDTETH: 'Retiros en USDT (Red TRC20 - Tron)',
    walletAddressETH: 'Dirección de Billetera USDT (TRC20)',
    enterYourETHWalletAddress: 'Ingresa tu dirección de billetera USDT TRC20 (Tron)',
    
    // ... rest of Spanish translations remain the same
    locale: 'es',
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
    
    // Withdrawal translations - TRC20 (Tron)
    networkTRC20: 'As retiradas serão processadas em USDT pela rede TRC20 (Tron)',
    walletAddressTRC20: 'Endereço da Carteira USDT (TRC20)',
    enterTRC20WalletAddress: 'Digite seu endereço de carteira USDT TRC20 (Tron)',
    trc20AddressValidation: 'O endereço TRC20 deve começar com T e ter 34 caracteres',
    
    // Legacy ETH keys (for backward compatibility) - NOW POINTING TO TRC20
    withdrawalsInUSDTETH: 'Retiradas em USDT (Rede TRC20 - Tron)',
    walletAddressETH: 'Endereço da Carteira USDT (TRC20)',
    enterYourETHWalletAddress: 'Digite seu endereço de carteira USDT TRC20 (Tron)',
    
    // ... rest of Portuguese translations remain the same
    locale: 'pt',
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

// Translation helper function
export const t = (key: string, options?: any) => {
  return i18n.t(key, options);
};

export { i18n };
