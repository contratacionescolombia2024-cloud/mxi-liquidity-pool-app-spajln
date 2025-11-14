
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';

interface Message {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  category: string;
  status: string;
  priority: string;
  created_at: string;
  user_email: string;
  user_name: string;
  admin_response?: string;
}

export default function AdminMessagesScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [filter, setFilter] = useState<'open' | 'all'>('open');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [response, setResponse] = useState('');
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    loadMessages();
  }, [filter]);

  const loadMessages = async () => {
    if (!supabase) {
      console.warn('Supabase client not available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      let query = supabase
        .from('messages')
        .select(`
          *,
          users!inner(email, name)
        `)
        .order('created_at', { ascending: false });

      if (filter === 'open') {
        query = query.in('status', ['open', 'in_progress']);
      }

      const { data, error } = await query;

      if (error) throw error;

      const mapped = data?.map((m: any) => ({
        ...m,
        user_email: m.users.email,
        user_name: m.users.name,
      })) || [];

      setMessages(mapped);
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (messageId: string, newStatus: string) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({ status: newStatus })
        .eq('id', messageId);

      if (error) throw error;

      Alert.alert('Success', 'Message status updated');
      loadMessages();
      setSelectedMessage(null);
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleSendResponse = async () => {
    if (!supabase || !selectedMessage || !response.trim()) return;

    try {
      setResponding(true);

      const { error } = await supabase
        .from('messages')
        .update({ 
          admin_response: response,
          status: 'resolved'
        })
        .eq('id', selectedMessage.id);

      if (error) throw error;

      Alert.alert('Success', 'Response sent successfully');
      setResponse('');
      setSelectedMessage(null);
      loadMessages();
    } catch (error) {
      console.error('Error sending response:', error);
      Alert.alert('Error', 'Failed to send response');
    } finally {
      setResponding(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'kyc': return 'person.badge.shield.checkmark';
      case 'withdrawal': return 'arrow.down.circle';
      case 'transaction': return 'dollarsign.circle';
      case 'technical': return 'wrench.and.screwdriver';
      default: return 'envelope';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return colors.error;
      case 'high': return colors.warning;
      case 'normal': return colors.primary;
      default: return colors.textSecondary;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol ios_icon_name="chevron.left" android_material_icon_name="arrow_back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>User Messages</Text>
          <Text style={styles.subtitle}>{messages.length} message(s)</Text>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'open' && styles.filterButtonActive]}
          onPress={() => setFilter('open')}
        >
          <Text style={[styles.filterText, filter === 'open' && styles.filterTextActive]}>
            Open
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : messages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol ios_icon_name="envelope.open" android_material_icon_name="mail_outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyText}>No messages to display</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {messages.map((message) => (
            <TouchableOpacity
              key={message.id}
              style={[commonStyles.card, styles.messageCard]}
              onPress={() => setSelectedMessage(message)}
            >
              <View style={styles.messageHeader}>
                <IconSymbol 
                  ios_icon_name={getCategoryIcon(message.category)} 
                  android_material_icon_name="mail"
                  size={24} 
                  color={getPriorityColor(message.priority)} 
                />
                <View style={styles.messageInfo}>
                  <Text style={styles.messageSubject}>{message.subject}</Text>
                  <Text style={styles.messageUser}>{message.user_name} • {message.user_email}</Text>
                </View>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(message.priority) + '20' }]}>
                  <Text style={[styles.priorityText, { color: getPriorityColor(message.priority) }]}>
                    {message.priority.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={styles.messagePreview} numberOfLines={2}>
                {message.message}
              </Text>
              <View style={styles.messageFooter}>
                <View style={[styles.statusBadge, styles[`status${message.status.replace('_', '')}`]]}>
                  <Text style={styles.statusText}>{message.status.replace('_', ' ').toUpperCase()}</Text>
                </View>
                <Text style={styles.messageDate}>
                  {new Date(message.created_at).toLocaleString()}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <Modal
        visible={selectedMessage !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedMessage(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Message Details</Text>
              <TouchableOpacity onPress={() => setSelectedMessage(null)}>
                <IconSymbol ios_icon_name="xmark" android_material_icon_name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {selectedMessage && (
                <React.Fragment>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>From</Text>
                    <Text style={styles.detailValue}>{selectedMessage.user_name}</Text>
                    <Text style={styles.detailSubvalue}>{selectedMessage.user_email}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Subject</Text>
                    <Text style={styles.detailValue}>{selectedMessage.subject}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Category</Text>
                    <Text style={styles.detailValue}>{selectedMessage.category}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Message</Text>
                    <Text style={styles.detailMessage}>{selectedMessage.message}</Text>
                  </View>

                  {selectedMessage.admin_response && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Admin Response</Text>
                      <Text style={styles.detailMessage}>{selectedMessage.admin_response}</Text>
                    </View>
                  )}

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Send Response</Text>
                    <TextInput
                      style={styles.responseInput}
                      placeholder="Type your response here..."
                      placeholderTextColor={colors.textSecondary}
                      value={response}
                      onChangeText={setResponse}
                      multiline
                      numberOfLines={4}
                    />
                  </View>

                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[buttonStyles.primary, styles.actionButton]}
                      onPress={handleSendResponse}
                      disabled={responding || !response.trim()}
                    >
                      {responding ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={buttonStyles.primaryText}>Send Response</Text>
                      )}
                    </TouchableOpacity>

                    {selectedMessage.status !== 'resolved' && (
                      <TouchableOpacity
                        style={[buttonStyles.secondary, styles.actionButton]}
                        onPress={() => handleUpdateStatus(selectedMessage.id, 'resolved')}
                      >
                        <Text style={buttonStyles.secondaryText}>Mark as Resolved</Text>
                      </TouchableOpacity>
                    )}

                    {selectedMessage.status !== 'closed' && (
                      <TouchableOpacity
                        style={[buttonStyles.secondary, styles.actionButton]}
                        onPress={() => handleUpdateStatus(selectedMessage.id, 'closed')}
                      >
                        <Text style={buttonStyles.secondaryText}>Close Message</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </React.Fragment>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  filterTextActive: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  messageCard: {
    marginBottom: 16,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    marginBottom: 4,
  },
  messageUser: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
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
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusopen: {
    backgroundColor: colors.warning + '20',
  },
  statusinprogress: {
    backgroundColor: colors.primary + '20',
  },
  statusresolved: {
    backgroundColor: colors.success + '20',
  },
  statusclosed: {
    backgroundColor: colors.textSecondary + '20',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text,
  },
  messageDate: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  modalBody: {
    padding: 24,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  detailSubvalue: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  detailMessage: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  responseInput: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  actionButtons: {
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    width: '100%',
  },
});
