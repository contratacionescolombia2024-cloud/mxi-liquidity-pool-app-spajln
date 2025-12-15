
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  RefreshControl,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

interface LotteryRound {
  id: string;
  round_number: number;
  ticket_price: number;
  max_tickets: number;
  tickets_sold: number;
  total_pool: number;
  prize_amount: number;
  status: 'open' | 'locked' | 'drawn' | 'completed';
  winner_user_id: string | null;
  drawn_at: string | null;
  created_at: string;
}

interface BonusSettings {
  id: string;
  max_participants: number;
  ticket_price: number;
  is_active: boolean;
  updated_at: string;
}

interface Participant {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  ticket_number: number;
  quantity: number;
  total_cost: number;
  purchased_at: string;
}

export default function ParticipationBonusManagementScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentRound, setCurrentRound] = useState<LotteryRound | null>(null);
  const [bonusSettings, setBonusSettings] = useState<BonusSettings | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [maxParticipants, setMaxParticipants] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadCurrentRound(),
        loadBonusSettings(),
        loadParticipants(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert(t('error'), t('failedToLoadSettings'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadCurrentRound = async () => {
    try {
      const { data, error } = await supabase
        .from('lottery_rounds')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading current round:', error);
        throw error;
      }

      setCurrentRound(data);
    } catch (error) {
      console.error('Error loading current round:', error);
    }
  };

  const loadBonusSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('participation_bonus_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading bonus settings:', error);
        throw error;
      }

      if (data) {
        setBonusSettings(data);
        setMaxParticipants(data.max_participants.toString());
        setTicketPrice(data.ticket_price.toString());
      }
    } catch (error) {
      console.error('Error loading bonus settings:', error);
    }
  };

  const loadParticipants = async () => {
    if (!currentRound) return;

    try {
      const { data, error } = await supabase
        .from('lottery_tickets')
        .select(`
          id,
          ticket_number,
          quantity,
          total_cost,
          purchased_at,
          user_id,
          users!inner (
            name,
            email
          )
        `)
        .eq('round_id', currentRound.id)
        .order('ticket_number', { ascending: true });

      if (error) {
        console.error('Error loading participants:', error);
        throw error;
      }

      const formattedParticipants: Participant[] = (data || []).map((ticket: any) => ({
        id: ticket.id,
        user_id: ticket.user_id,
        user_name: ticket.users?.name || 'Unknown',
        user_email: ticket.users?.email || 'Unknown',
        ticket_number: ticket.ticket_number,
        quantity: ticket.quantity,
        total_cost: ticket.total_cost,
        purchased_at: ticket.purchased_at,
      }));

      setParticipants(formattedParticipants);
    } catch (error) {
      console.error('Error loading participants:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleUpdateSettings = async () => {
    const maxPart = parseInt(maxParticipants);
    const price = parseFloat(ticketPrice);

    if (isNaN(maxPart) || maxPart < 1) {
      Alert.alert(t('error'), t('enterMaxParticipants'));
      return;
    }

    if (isNaN(price) || price <= 0) {
      Alert.alert(t('error'), t('enterTicketPrice'));
      return;
    }

    try {
      setSaving(true);

      const { data, error } = await supabase.rpc('update_bonus_settings', {
        p_max_participants: maxPart,
        p_ticket_price: price,
      });

      if (error) {
        console.error('Error updating settings:', error);
        throw error;
      }

      if (!data.success) {
        Alert.alert(t('error'), data.error || t('updateSettingsError'));
        return;
      }

      Alert.alert(t('success'), t('settingsUpdatedSuccessfully'));
      setShowSettingsModal(false);
      await loadData();
    } catch (error) {
      console.error('Error updating settings:', error);
      Alert.alert(t('error'), t('updateSettingsError'));
    } finally {
      setSaving(false);
    }
  };

  const handleResetBonus = async () => {
    const confirmText = t('locale') === 'es' ? 'RESETEAR BONO' : 
                       t('locale') === 'pt' ? 'RESETAR BÔNUS' : 
                       'RESET BONUS';

    if (resetConfirmText !== confirmText) {
      Alert.alert(t('error'), t('mustTypeResetBonus'));
      return;
    }

    try {
      setSaving(true);

      const { data, error } = await supabase.rpc('reset_participation_bonus');

      if (error) {
        console.error('Error resetting bonus:', error);
        throw error;
      }

      if (!data.success) {
        Alert.alert(t('error'), data.error || t('resetBonusError'));
        return;
      }

      Alert.alert(t('success'), t('bonusResetSuccessfully'));
      setShowResetModal(false);
      setResetConfirmText('');
      await loadData();
    } catch (error) {
      console.error('Error resetting bonus:', error);
      Alert.alert(t('error'), t('resetBonusError'));
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadParticipants = async () => {
    if (participants.length === 0) {
      Alert.alert(t('error'), t('noParticipantsYet'));
      return;
    }

    try {
      setDownloading(true);

      // Create CSV content
      const csvHeader = 'Ticket Number,User Name,User Email,Quantity,Total Cost (MXI),Purchase Date\n';
      const csvRows = participants.map(p => 
        `${p.ticket_number},"${p.user_name}","${p.user_email}",${p.quantity},${p.total_cost},"${new Date(p.purchased_at).toLocaleString()}"`
      ).join('\n');
      const csvContent = csvHeader + csvRows;

      if (Platform.OS === 'web') {
        // Web download
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `participation_bonus_round_${currentRound?.round_number}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        Alert.alert(t('downloadComplete'), t('participantsDownloaded'));
      } else {
        // Mobile download
        const fileName = `participation_bonus_round_${currentRound?.round_number}_${new Date().toISOString().split('T')[0]}.csv`;
        const fileUri = FileSystem.documentDirectory + fileName;

        await FileSystem.writeAsStringAsync(fileUri, csvContent, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'text/csv',
            dialogTitle: t('participantsList'),
          });
          Alert.alert(t('downloadComplete'), t('participantsDownloaded'));
        } else {
          Alert.alert(t('success'), `${t('participantsDownloaded')}\n\n${fileUri}`);
        }
      }
    } catch (error) {
      console.error('Error downloading participants:', error);
      Alert.alert(t('error'), t('downloadError'));
    } finally {
      setDownloading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return colors.success;
      case 'locked':
        return colors.warning;
      case 'drawn':
        return colors.primary;
      case 'completed':
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return t('open');
      case 'locked':
        return t('locked');
      case 'drawn':
        return t('drawn');
      case 'completed':
        return t('completed');
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol ios_icon_name="chevron.left" android_material_icon_name="arrow_back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{t('participationBonusManagement')}</Text>
          <Text style={styles.subtitle}>{t('manageBonusSettings')}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Current Round Stats */}
        {currentRound && (
          <View style={[commonStyles.card, styles.statsCard]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <IconSymbol 
                  ios_icon_name="chart.bar.fill" 
                  android_material_icon_name="bar_chart" 
                  size={24} 
                  color={colors.primary} 
                />
                <Text style={styles.cardTitle}>{t('currentBonusStats')}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(currentRound.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(currentRound.status) }]}>
                  {getStatusText(currentRound.status)}
                </Text>
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>{t('roundNumber')}</Text>
                <Text style={styles.statValue}>#{currentRound.round_number}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>{t('ticketPriceText')}</Text>
                <Text style={styles.statValue}>{currentRound.ticket_price} MXI</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>{t('ticketsSoldText')}</Text>
                <Text style={styles.statValue}>
                  {currentRound.tickets_sold} / {currentRound.max_tickets}
                </Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>{t('participantsCount')}</Text>
                <Text style={styles.statValue}>{participants.length}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>{t('totalPoolText')}</Text>
                <Text style={styles.statValue}>{currentRound.total_pool.toFixed(2)} MXI</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>{t('prizePoolText')}</Text>
                <Text style={styles.statValue}>{currentRound.prize_amount.toFixed(2)} MXI</Text>
              </View>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>{t('progress')}</Text>
                <Text style={styles.progressValue}>
                  {((currentRound.tickets_sold / currentRound.max_tickets) * 100).toFixed(1)}%
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${(currentRound.tickets_sold / currentRound.max_tickets) * 100}%` }
                  ]} 
                />
              </View>
            </View>
          </View>
        )}

        {/* Management Actions */}
        <View style={[commonStyles.card, styles.actionsCard]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <IconSymbol 
                ios_icon_name="slider.horizontal.3" 
                android_material_icon_name="tune" 
                size={24} 
                color={colors.primary} 
              />
              <Text style={styles.cardTitle}>{t('bonusManagementActions')}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[buttonStyles.primary, styles.actionButton]}
            onPress={() => setShowSettingsModal(true)}
          >
            <IconSymbol 
              ios_icon_name="gearshape.fill" 
              android_material_icon_name="settings" 
              size={20} 
              color="#000" 
            />
            <Text style={buttonStyles.primaryText}>{t('updateLimitsButton')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[buttonStyles.secondary, styles.actionButton]}
            onPress={handleDownloadParticipants}
            disabled={downloading || participants.length === 0}
          >
            {downloading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <React.Fragment>
                <IconSymbol 
                  ios_icon_name="arrow.down.doc.fill" 
                  android_material_icon_name="download" 
                  size={20} 
                  color={colors.primary} 
                />
                <Text style={buttonStyles.secondaryText}>{t('downloadDataButton')}</Text>
              </React.Fragment>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[buttonStyles.danger, styles.actionButton]}
            onPress={() => setShowResetModal(true)}
          >
            <IconSymbol 
              ios_icon_name="arrow.counterclockwise.circle.fill" 
              android_material_icon_name="refresh" 
              size={20} 
              color="#fff" 
            />
            <Text style={[buttonStyles.primaryText, { color: '#fff' }]}>{t('resetBonusButton')}</Text>
          </TouchableOpacity>
        </View>

        {/* Participants List */}
        {participants.length > 0 && (
          <View style={[commonStyles.card, styles.participantsCard]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <IconSymbol 
                  ios_icon_name="person.3.fill" 
                  android_material_icon_name="groups" 
                  size={24} 
                  color={colors.primary} 
                />
                <Text style={styles.cardTitle}>{t('participantsList')}</Text>
              </View>
              <Text style={styles.participantCount}>{participants.length}</Text>
            </View>

            <View style={styles.participantsList}>
              {participants.slice(0, 10).map((participant, index) => (
                <View key={participant.id} style={styles.participantItem}>
                  <View style={styles.participantNumber}>
                    <Text style={styles.participantNumberText}>#{participant.ticket_number}</Text>
                  </View>
                  <View style={styles.participantInfo}>
                    <Text style={styles.participantName}>{participant.user_name}</Text>
                    <Text style={styles.participantEmail}>{participant.user_email}</Text>
                    <Text style={styles.participantDetails}>
                      {participant.quantity} {t('ticketsText')} • {participant.total_cost.toFixed(2)} MXI
                    </Text>
                  </View>
                </View>
              ))}
              {participants.length > 10 && (
                <Text style={styles.moreParticipants}>
                  +{participants.length - 10} {t('more')}...
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Bonus Settings Info */}
        {bonusSettings && (
          <View style={[commonStyles.card, styles.settingsInfoCard]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <IconSymbol 
                  ios_icon_name="info.circle.fill" 
                  android_material_icon_name="info" 
                  size={24} 
                  color={colors.primary} 
                />
                <Text style={styles.cardTitle}>{t('bonusSettings')}</Text>
              </View>
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>{t('maxParticipantsLabel')}</Text>
              <Text style={styles.settingValue}>{bonusSettings.max_participants}</Text>
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>{t('ticketPriceLabel')}</Text>
              <Text style={styles.settingValue}>{bonusSettings.ticket_price} MXI</Text>
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>{t('updatedAt')}</Text>
              <Text style={styles.settingValue}>
                {new Date(bonusSettings.updated_at).toLocaleString()}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Update Settings Modal */}
      <Modal
        visible={showSettingsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('updateBonusSettings')}</Text>
              <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
                <IconSymbol 
                  ios_icon_name="xmark.circle.fill" 
                  android_material_icon_name="cancel" 
                  size={28} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t('maxParticipantsLabel')}</Text>
                <TextInput
                  style={styles.input}
                  value={maxParticipants}
                  onChangeText={setMaxParticipants}
                  keyboardType="number-pad"
                  placeholder={t('enterMaxParticipants')}
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t('ticketPriceLabel')}</Text>
                <TextInput
                  style={styles.input}
                  value={ticketPrice}
                  onChangeText={setTicketPrice}
                  keyboardType="decimal-pad"
                  placeholder={t('enterTicketPrice')}
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.warningBox}>
                <IconSymbol 
                  ios_icon_name="exclamationmark.triangle.fill" 
                  android_material_icon_name="warning" 
                  size={20} 
                  color={colors.warning} 
                />
                <Text style={styles.warningText}>
                  {t('changesWillAffectCurrentRoundText')}
                </Text>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[buttonStyles.outline, styles.modalButton]}
                onPress={() => setShowSettingsModal(false)}
                disabled={saving}
              >
                <Text style={buttonStyles.outlineText}>{t('cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[buttonStyles.primary, styles.modalButton]}
                onPress={handleUpdateSettings}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={buttonStyles.primaryText}>{t('updateSettings')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reset Bonus Modal */}
      <Modal
        visible={showResetModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowResetModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('resetBonusConfirmTitle')}</Text>
              <TouchableOpacity onPress={() => setShowResetModal(false)}>
                <IconSymbol 
                  ios_icon_name="xmark.circle.fill" 
                  android_material_icon_name="cancel" 
                  size={28} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.dangerBox}>
                <IconSymbol 
                  ios_icon_name="exclamationmark.triangle.fill" 
                  android_material_icon_name="warning" 
                  size={24} 
                  color={colors.danger} 
                />
                <Text style={styles.dangerText}>
                  {t('resetBonusConfirmMessage')}
                </Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t('typeResetBonusToConfirm')}</Text>
                <TextInput
                  style={styles.input}
                  value={resetConfirmText}
                  onChangeText={setResetConfirmText}
                  placeholder={t('locale') === 'es' ? 'RESETEAR BONO' : t('locale') === 'pt' ? 'RESETAR BÔNUS' : 'RESET BONUS'}
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[buttonStyles.outline, styles.modalButton]}
                onPress={() => {
                  setShowResetModal(false);
                  setResetConfirmText('');
                }}
                disabled={saving}
              >
                <Text style={buttonStyles.outlineText}>{t('cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[buttonStyles.danger, styles.modalButton]}
                onPress={handleResetBonus}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={[buttonStyles.primaryText, { color: '#fff' }]}>{t('confirmReset')}</Text>
                )}
              </TouchableOpacity>
            </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerContent: {
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
    flexGrow: 1,
    padding: 16,
    paddingBottom: 100,
  },
  statsCard: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  progressSection: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  actionsCard: {
    marginBottom: 16,
  },
  actionButton: {
    marginBottom: 12,
  },
  participantsCard: {
    marginBottom: 16,
  },
  participantCount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  participantsList: {
    gap: 12,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  participantNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  participantNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  participantEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  participantDetails: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  moreParticipants: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 12,
  },
  settingsInfoCard: {
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  modalBody: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
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
  warningBox: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: colors.warning + '20',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  dangerBox: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: colors.danger + '20',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
    marginBottom: 20,
  },
  dangerText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
  },
  modalButton: {
    flex: 1,
  },
});
