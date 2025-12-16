
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';
import { i18n } from '@/constants/i18n';

export default function NotificationCenterScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const sendNotificationToAllUsers = async () => {
    if (!title.trim() || !message.trim()) {
      Alert.alert(
        i18n.t('error'),
        i18n.t('pleaseEnterTitleAndMessage')
      );
      return;
    }

    Alert.alert(
      i18n.t('confirmSendNotification'),
      i18n.t('confirmSendNotificationMessage', { count: 'todos los usuarios' }),
      [
        {
          text: i18n.t('cancel'),
          style: 'cancel',
        },
        {
          text: i18n.t('send'),
          onPress: async () => {
            try {
              setSending(true);

              // Get all users
              const { data: users, error: usersError } = await supabase
                .from('users')
                .select('id');

              if (usersError) throw usersError;

              if (!users || users.length === 0) {
                Alert.alert(i18n.t('error'), i18n.t('noUsersToNotify'));
                return;
              }

              // Create notifications for all users
              const notifications = users.map(user => ({
                user_id: user.id,
                notification_type: 'admin_announcement',
                title: title.trim(),
                message: message.trim(),
                metadata: {
                  sent_at: new Date().toISOString(),
                  sent_by: 'admin',
                },
                is_read: false,
              }));

              // Insert notifications in batches of 100
              const batchSize = 100;
              for (let i = 0; i < notifications.length; i += batchSize) {
                const batch = notifications.slice(i, i + batchSize);
                const { error: insertError } = await supabase
                  .from('system_notifications')
                  .insert(batch);

                if (insertError) throw insertError;
              }

              Alert.alert(
                i18n.t('success'),
                i18n.t('notificationSentToAllUsers', { count: users.length })
              );

              // Clear form
              setTitle('');
              setMessage('');
            } catch (error: any) {
              console.error('Error sending notifications:', error);
              Alert.alert(
                i18n.t('error'),
                i18n.t('errorSendingNotification') + ': ' + error.message
              );
            } finally {
              setSending(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol ios_icon_name="chevron.left" android_material_icon_name="arrow_back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>{i18n.t('notificationCenter')}</Text>
          <Text style={styles.subtitle}>{i18n.t('sendNotificationsToAllUsers')}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[commonStyles.card, styles.formCard]}>
          <View style={styles.iconHeader}>
            <View style={styles.iconCircle}>
              <IconSymbol ios_icon_name="megaphone.fill" android_material_icon_name="campaign" size={32} color={colors.primary} />
            </View>
            <Text style={styles.formTitle}>{i18n.t('createNotification')}</Text>
            <Text style={styles.formSubtitle}>{i18n.t('notificationWillBeSentToAll')}</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{i18n.t('notificationTitle')}</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder={i18n.t('enterNotificationTitle')}
              placeholderTextColor={colors.textSecondary}
              maxLength={100}
            />
            <Text style={styles.charCount}>{title.length}/100</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{i18n.t('notificationMessage')}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={message}
              onChangeText={setMessage}
              placeholder={i18n.t('enterNotificationMessage')}
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.charCount}>{message.length}/500</Text>
          </View>

          {title.trim() && message.trim() && (
            <View style={styles.previewContainer}>
              <Text style={styles.previewLabel}>{i18n.t('preview')}</Text>
              <View style={styles.previewCard}>
                <View style={styles.previewHeader}>
                  <IconSymbol ios_icon_name="bell.fill" android_material_icon_name="notifications" size={20} color={colors.primary} />
                  <Text style={styles.previewTitle}>{title}</Text>
                </View>
                <Text style={styles.previewMessage}>{message}</Text>
                <Text style={styles.previewTime}>{i18n.t('justNow')}</Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!title.trim() || !message.trim() || sending) && styles.sendButtonDisabled,
            ]}
            onPress={sendNotificationToAllUsers}
            disabled={!title.trim() || !message.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <IconSymbol ios_icon_name="paperplane.fill" android_material_icon_name="send" size={20} color="#000" />
                <Text style={styles.sendButtonText}>{i18n.t('sendToAllUsers')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={[commonStyles.card, styles.infoCard]}>
          <View style={styles.infoHeader}>
            <IconSymbol ios_icon_name="info.circle.fill" android_material_icon_name="info" size={24} color={colors.primary} />
            <Text style={styles.infoTitle}>{i18n.t('importantInformation')}</Text>
          </View>
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>•</Text>
              <Text style={styles.infoText}>{i18n.t('notificationSentToAllRegisteredUsers')}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>•</Text>
              <Text style={styles.infoText}>{i18n.t('usersWillReceiveInAppNotification')}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>•</Text>
              <Text style={styles.infoText}>{i18n.t('notificationsCanBeViewedInSystemNotifications')}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>•</Text>
              <Text style={styles.infoText}>{i18n.t('useThisFeatureResponsibly')}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => router.push('/(tabs)/(admin)/system-notifications')}
        >
          <IconSymbol ios_icon_name="clock.fill" android_material_icon_name="history" size={20} color={colors.primary} />
          <Text style={styles.historyButtonText}>{i18n.t('viewNotificationHistory')}</Text>
          <IconSymbol ios_icon_name="chevron.right" android_material_icon_name="chevron_right" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  formCard: {
    marginBottom: 16,
  },
  iconHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 16,
  },
  charCount: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  previewContainer: {
    marginBottom: 20,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  previewCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  previewMessage: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  previewTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  infoCard: {
    marginBottom: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  infoList: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    gap: 8,
  },
  infoBullet: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '700',
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
    lineHeight: 20,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  historyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
});
