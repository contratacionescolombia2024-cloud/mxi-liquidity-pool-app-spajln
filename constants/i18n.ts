
import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define translations
const translations = {
  en: {
    // ... (keeping all existing translations)
    
    // Notification Center - NEW KEYS
    notificationCenter: 'Notification Center',
    sendNotificationsToAllUsers: 'Send notifications to all users',
    createNotification: 'Create Notification',
    notificationWillBeSentToAll: 'This notification will be sent to all registered users',
    notificationTitle: 'Notification Title',
    enterNotificationTitle: 'Enter notification title...',
    notificationMessage: 'Notification Message',
    enterNotificationMessage: 'Enter notification message...',
    preview: 'Preview',
    justNow: 'Just now',
    pleaseEnterTitleAndMessage: 'Please enter both title and message',
    confirmSendNotification: 'Confirm Send Notification',
    confirmSendNotificationMessage: 'Are you sure you want to send this notification to {{count}}?',
    notificationSentToAllUsers: 'Notification sent successfully to {{count}} users',
    errorSendingNotification: 'Error sending notification',
    notificationSentToAllRegisteredUsers: 'The notification will be sent to all registered users in the app',
    usersWillReceiveInAppNotification: 'Users will receive an in-app notification',
    notificationsCanBeViewedInSystemNotifications: 'Notifications can be viewed in System Notifications',
    useThisFeatureResponsibly: 'Use this feature responsibly and only for important announcements',
    viewNotificationHistory: 'View Notification History',
    systemNotifications: 'System Notifications',
    reviewPaymentRequests: 'Review payment requests',
    approveWithdrawals: 'Approve withdrawals',
    
    // ... (rest of existing translations)
  },
  es: {
    // ... (keeping all existing translations)
    
    // Notification Center - NEW KEYS
    notificationCenter: 'Centro de Notificaciones',
    sendNotificationsToAllUsers: 'Enviar notificaciones a todos los usuarios',
    createNotification: 'Crear Notificación',
    notificationWillBeSentToAll: 'Esta notificación se enviará a todos los usuarios registrados',
    notificationTitle: 'Título de la Notificación',
    enterNotificationTitle: 'Ingresa el título de la notificación...',
    notificationMessage: 'Mensaje de la Notificación',
    enterNotificationMessage: 'Ingresa el mensaje de la notificación...',
    preview: 'Vista Previa',
    justNow: 'Justo ahora',
    pleaseEnterTitleAndMessage: 'Por favor ingresa tanto el título como el mensaje',
    confirmSendNotification: 'Confirmar Envío de Notificación',
    confirmSendNotificationMessage: '¿Estás seguro de que quieres enviar esta notificación a {{count}}?',
    notificationSentToAllUsers: 'Notificación enviada exitosamente a {{count}} usuarios',
    errorSendingNotification: 'Error al enviar notificación',
    notificationSentToAllRegisteredUsers: 'La notificación se enviará a todos los usuarios registrados en la app',
    usersWillReceiveInAppNotification: 'Los usuarios recibirán una notificación en la app',
    notificationsCanBeViewedInSystemNotifications: 'Las notificaciones se pueden ver en Notificaciones del Sistema',
    useThisFeatureResponsibly: 'Usa esta función responsablemente y solo para anuncios importantes',
    viewNotificationHistory: 'Ver Historial de Notificaciones',
    systemNotifications: 'Notificaciones del Sistema',
    reviewPaymentRequests: 'Revisar solicitudes de pago',
    approveWithdrawals: 'Aprobar retiros',
    
    // ... (rest of existing translations)
  },
  pt: {
    // ... (keeping all existing translations)
    
    // Notification Center - NEW KEYS
    notificationCenter: 'Centro de Notificações',
    sendNotificationsToAllUsers: 'Enviar notificações para todos os usuários',
    createNotification: 'Criar Notificação',
    notificationWillBeSentToAll: 'Esta notificação será enviada para todos os usuários registrados',
    notificationTitle: 'Título da Notificação',
    enterNotificationTitle: 'Digite o título da notificação...',
    notificationMessage: 'Mensagem da Notificação',
    enterNotificationMessage: 'Digite a mensagem da notificação...',
    preview: 'Visualização',
    justNow: 'Agora mesmo',
    pleaseEnterTitleAndMessage: 'Por favor, digite tanto o título quanto a mensagem',
    confirmSendNotification: 'Confirmar Envio de Notificação',
    confirmSendNotificationMessage: 'Tem certeza de que deseja enviar esta notificação para {{count}}?',
    notificationSentToAllUsers: 'Notificação enviada com sucesso para {{count}} usuários',
    errorSendingNotification: 'Erro ao enviar notificação',
    notificationSentToAllRegisteredUsers: 'A notificação será enviada para todos os usuários registrados no app',
    usersWillReceiveInAppNotification: 'Os usuários receberão uma notificação no app',
    notificationsCanBeViewedInSystemNotifications: 'As notificações podem ser visualizadas em Notificações do Sistema',
    useThisFeatureResponsibly: 'Use este recurso com responsabilidade e apenas para anúncios importantes',
    viewNotificationHistory: 'Ver Histórico de Notificações',
    systemNotifications: 'Notificações do Sistema',
    reviewPaymentRequests: 'Revisar solicitações de pagamento',
    approveWithdrawals: 'Aprovar retiradas',
    
    // ... (rest of existing translations)
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
