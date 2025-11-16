
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  subject: string;
  message: string;
  category: string;
  status: string;
  priority: string;
  created_at: string;
  reply_count: number;
}

export default function SupportScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [subject, setSubject] = useState('');
  const [messageText, setMessageText] = useState('');
  const [category, setCategory] = useState('general');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          message_replies(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped = data?.map((m: any) => ({
        ...m,
        reply_count: m.message_replies?.[0]?.count || 0,
      })) || [];

      setMessages(mapped);
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    if (!subject.trim() || !messageText.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from('messages')
        .insert({
          user_id: user.id,
          subject: subject.trim(),
          message: messageText.trim(),
          category,
          status: 'open',
          priority: 'normal',
        });

      if (error) throw error;

      Alert.alert('Success', 'Your message has been sent. Our support team will respond soon.');
      setSubject('');
      setMessageText('');
      setCategory('general');
      setShowNewMessage(false);
      loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'kyc': return { ios: 'person.badge.shield.checkmark', android: 'verified_user' };
      case 'withdrawal': return { ios: 'arrow.down.circle', android: 'arrow_circle_down' };
      case 'transaction': return { ios: 'dollarsign.circle', android: 'monetization_on' };
      case 'technical': return { ios: 'wrench.and.screwdriver', android: 'build' };
      default: return { ios: 'envelope', android: 'mail' };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return colors.warning;
      case 'in_progress': return colors.primary;
      case 'resolved': return colors.success;
      default: return colors.textSecondary;
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol ios_icon_name="chevron.left" android_material_icon_name="arrow_back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>Support & Help</Text>
          <Text style={styles.subtitle}>Get assistance from our team</Text>
        </View>
      </View>

      {showNewMessage ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[commonStyles.card, styles.formCard]}>
            <Text style={styles.formTitle}>New Support Request</Text>

            <View style={styles.inputContainer}>
              <Text style={commonStyles.label}>Category</Text>
              <View style={styles.categoryGrid}>
                {[
                  { value: 'general', label: 'General', icon: 'envelope' },
                  { value: 'kyc', label: 'KYC', icon: 'person.badge.shield.checkmark' },
                  { value: 'withdrawal', label: 'Withdrawal', icon: 'arrow.down.circle' },
                  { value: 'transaction', label: 'Transaction', icon: 'dollarsign.circle' },
                  { value: 'technical', label: 'Technical', icon: 'wrench.and.screwdriver' },
                  { value: 'other', label: 'Other', icon: 'questionmark.circle' },
                ].map((cat) => (
                  <TouchableOpacity
                    key={cat.value}
                    style={[
                      styles.categoryButton,
                      category === cat.value && styles.categoryButtonActive,
                    ]}
                    onPress={() => setCategory(cat.value)}
                  >
                    <IconSymbol
                      ios_icon_name={cat.icon as any}
                      android_material_icon_name={
                        cat.value === 'general' ? 'mail' :
                        cat.value === 'kyc' ? 'verified_user' :
                        cat.value === 'withdrawal' ? 'arrow_circle_down' :
                        cat.value === 'transaction' ? 'monetization_on' :
                        cat.value === 'technical' ? 'build' :
                        'help_outline'
                      }
                      size={20}
                      color={category === cat.value ? '#fff' : colors.text}
                    />
                    <Text
                      style={[
                        styles.categoryText,
                        category === cat.value && styles.categoryTextActive,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={commonStyles.label}>Subject</Text>
              <TextInput
                style={commonStyles.input}
                placeholder="Brief description of your issue"
                placeholderTextColor={colors.textSecondary}
                value={subject}
                onChangeText={setSubject}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={commonStyles.label}>Message</Text>
              <TextInput
                style={[commonStyles.input, styles.messageInput]}
                placeholder="Describe your issue in detail..."
                placeholderTextColor={colors.textSecondary}
                value={messageText}
                onChangeText={setMessageText}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[buttonStyles.primary, styles.cancelButton]}
                onPress={() => setShowNewMessage(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[buttonStyles.primary, styles.submitButton]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <React.Fragment>
                    <IconSymbol ios_icon_name="paperplane.fill" android_material_icon_name="send" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Send Message</Text>
                  </React.Fragment>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      ) : (
        <>
          <TouchableOpacity
            style={[commonStyles.card, styles.newMessageButton]}
            onPress={() => setShowNewMessage(true)}
          >
            <IconSymbol ios_icon_name="plus.circle.fill" android_material_icon_name="add_circle" size={24} color={colors.primary} />
            <Text style={styles.newMessageText}>New Support Request</Text>
          </TouchableOpacity>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconSymbol ios_icon_name="envelope.open" android_material_icon_name="drafts" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>
                Create a support request to get help from our team
              </Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.scrollContent}>
              {messages.map((msg) => (
                <TouchableOpacity
                  key={msg.id}
                  style={[commonStyles.card, styles.messageCard]}
                  onPress={() => {
                    // Navigate to message detail (to be implemented)
                    Alert.alert('Message Detail', 'Message detail view coming soon');
                  }}
                >
                  <View style={styles.messageHeader}>
                    <IconSymbol
                      ios_icon_name={getCategoryIcon(msg.category).ios}
                      android_material_icon_name={getCategoryIcon(msg.category).android}
                      size={24}
                      color={getStatusColor(msg.status)}
                    />
                    <View style={styles.messageInfo}>
                      <Text style={styles.messageSubject}>{msg.subject}</Text>
                      <Text style={styles.messageCategory}>{msg.category.toUpperCase()}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: getStatusColor(msg.status) },
                      ]}
                    />
                  </View>
                  <Text style={styles.messagePreview} numberOfLines={2}>
                    {msg.message}
                  </Text>
                  <View style={styles.messageFooter}>
                    <Text style={styles.messageDate}>
                      {new Date(msg.created_at).toLocaleDateString()}
                    </Text>
                    {msg.reply_count > 0 && (
                      <View style={styles.replyBadge}>
                        <IconSymbol ios_icon_name="bubble.left.fill" android_material_icon_name="chat_bubble" size={12} color={colors.primary} />
                        <Text style={styles.replyCount}>{msg.reply_count} replies</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  newMessageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 16,
  },
  newMessageText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  formCard: {
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  categoryTextActive: {
    color: '#fff',
  },
  messageInput: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.textSecondary,
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  messageCard: {
    marginBottom: 16,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  messageInfo: {
    flex: 1,
  },
  messageSubject: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  messageCategory: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  messagePreview: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  replyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  replyCount: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
});
