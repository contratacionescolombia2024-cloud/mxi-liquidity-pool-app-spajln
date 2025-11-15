
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { colors, commonStyles } from '@/styles/commonStyles';

interface ChallengeHistory {
  id: string;
  challenge_type: string;
  challenge_id: string;
  result: 'win' | 'loss' | 'tie' | 'forfeit';
  amount_won: number;
  amount_lost: number;
  score: number;
  rank: number | null;
  total_participants: number | null;
  created_at: string;
  expires_at: string;
}

export default function ChallengeHistoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [history, setHistory] = useState<ChallengeHistory[]>([]);
  const [filter, setFilter] = useState<'all' | 'win' | 'loss'>('all');

  useEffect(() => {
    loadHistory();
  }, [filter]);

  const loadHistory = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('challenge_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('result', filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setHistory(data || []);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'tap_duo':
        return { ios: 'hand.tap.fill', android: 'touch_app' };
      case 'airball_duo':
        return { ios: 'mic.fill', android: 'mic' };
      case 'airball':
        return { ios: 'mic.fill', android: 'mic' };
      case 'clickers':
        return { ios: 'hand.tap.fill', android: 'ads_click' };
      case 'lottery':
        return { ios: 'ticket.fill', android: 'confirmation_number' };
      default:
        return { ios: 'gamecontroller.fill', android: 'sports_esports' };
    }
  };

  const getChallengeLabel = (type: string) => {
    switch (type) {
      case 'tap_duo': return 'Tap Duo';
      case 'airball_duo': return 'Airball Duo';
      case 'airball': return 'Airball';
      case 'clickers': return 'Clickers';
      case 'lottery': return 'Lottery';
      default: return type;
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'win': return colors.success;
      case 'loss': return colors.error;
      case 'tie': return colors.warning;
      case 'forfeit': return colors.textSecondary;
      default: return colors.text;
    }
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'win':
        return { ios: 'trophy.fill', android: 'emoji_events' };
      case 'loss':
        return { ios: 'xmark.circle.fill', android: 'cancel' };
      case 'tie':
        return { ios: 'equal.circle.fill', android: 'drag_handle' };
      case 'forfeit':
        return { ios: 'flag.fill', android: 'flag' };
      default:
        return { ios: 'circle.fill', android: 'circle' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDaysUntilExpiry = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol ios_icon_name="chevron.left" android_material_icon_name="arrow_back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Challenge History</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'win' && styles.filterButtonActive]}
          onPress={() => setFilter('win')}
        >
          <Text style={[styles.filterButtonText, filter === 'win' && styles.filterButtonTextActive]}>
            Wins
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'loss' && styles.filterButtonActive]}
          onPress={() => setFilter('loss')}
        >
          <Text style={[styles.filterButtonText, filter === 'loss' && styles.filterButtonTextActive]}>
            Losses
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {history.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol ios_icon_name="tray.fill" android_material_icon_name="inbox" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No History Yet</Text>
            <Text style={styles.emptyText}>
              Your challenge history will appear here once you participate in games
            </Text>
          </View>
        ) : (
          history.map((record) => {
            const challengeIcon = getChallengeIcon(record.challenge_type);
            const resultIcon = getResultIcon(record.result);
            const daysUntilExpiry = getDaysUntilExpiry(record.expires_at);

            return (
              <View key={record.id} style={[commonStyles.card, styles.historyCard]}>
                <View style={styles.historyHeader}>
                  <View style={styles.challengeInfo}>
                    <IconSymbol
                      ios_icon_name={challengeIcon.ios}
                      android_material_icon_name={challengeIcon.android}
                      size={24}
                      color={colors.primary}
                    />
                    <View>
                      <Text style={styles.challengeType}>{getChallengeLabel(record.challenge_type)}</Text>
                      <Text style={styles.challengeDate}>{formatDate(record.created_at)}</Text>
                    </View>
                  </View>
                  <View style={[styles.resultBadge, { backgroundColor: getResultColor(record.result) + '20' }]}>
                    <IconSymbol
                      ios_icon_name={resultIcon.ios}
                      android_material_icon_name={resultIcon.android}
                      size={16}
                      color={getResultColor(record.result)}
                    />
                    <Text style={[styles.resultText, { color: getResultColor(record.result) }]}>
                      {record.result.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.historyDetails}>
                  {record.score !== null && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Score:</Text>
                      <Text style={styles.detailValue}>{record.score}</Text>
                    </View>
                  )}
                  {record.rank !== null && record.total_participants !== null && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Rank:</Text>
                      <Text style={styles.detailValue}>
                        {record.rank} of {record.total_participants}
                      </Text>
                    </View>
                  )}
                  {record.amount_won > 0 && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Won:</Text>
                      <Text style={[styles.detailValue, { color: colors.success }]}>
                        +{record.amount_won.toFixed(2)} MXI
                      </Text>
                    </View>
                  )}
                  {record.amount_lost > 0 && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Lost:</Text>
                      <Text style={[styles.detailValue, { color: colors.error }]}>
                        -{record.amount_lost.toFixed(2)} MXI
                      </Text>
                    </View>
                  )}
                  {daysUntilExpiry > 0 && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Expires in:</Text>
                      <Text style={styles.detailValue}>{daysUntilExpiry} days</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 0,
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  historyCard: {
    marginBottom: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  challengeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  challengeType: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  challengeDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  resultText: {
    fontSize: 12,
    fontWeight: '700',
  },
  historyDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
});
