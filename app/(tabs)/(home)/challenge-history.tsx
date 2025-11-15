
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';

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
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [history, setHistory] = useState<ChallengeHistory[]>([]);
  const [filter, setFilter] = useState<'all' | 'win' | 'loss' | 'tie'>('all');
  const [stats, setStats] = useState({
    totalWins: 0,
    totalLosses: 0,
    totalTies: 0,
    totalWinnings: 0,
    totalLosses: 0,
  });

  useEffect(() => {
    loadHistory();
  }, [filter]);

  const loadHistory = async () => {
    if (!user) return;

    try {
      setLoading(true);

      let query = supabase
        .from('challenge_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('result', filter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading history:', error);
        return;
      }

      setHistory(data || []);

      // Calculate stats
      const wins = data?.filter(h => h.result === 'win').length || 0;
      const losses = data?.filter(h => h.result === 'loss').length || 0;
      const ties = data?.filter(h => h.result === 'tie').length || 0;
      const totalWinnings = data?.reduce((sum, h) => sum + (h.amount_won || 0), 0) || 0;
      const totalLossesAmount = data?.reduce((sum, h) => sum + (h.amount_lost || 0), 0) || 0;

      setStats({
        totalWins: wins,
        totalLosses: losses,
        totalTies: ties,
        totalWinnings,
        totalLosses: totalLossesAmount,
      });
    } catch (error) {
      console.error('Exception loading history:', error);
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
      case 'airball':
        return '🎈';
      case 'airball_duo':
        return '🎈⚔️';
      case 'clicker':
        return '👆';
      case 'tap_duo':
        return '⚔️';
      case 'lottery':
        return '🎰';
      default:
        return '🎮';
    }
  };

  const getChallengeLabel = (type: string) => {
    switch (type) {
      case 'airball':
        return 'MXI AirBall';
      case 'airball_duo':
        return 'AirBall Duo';
      case 'clicker':
        return 'Clickers';
      case 'tap_duo':
        return 'XMI Tap Duo';
      case 'lottery':
        return 'Bonus MXI';
      default:
        return 'Challenge';
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'win':
        return colors.success;
      case 'loss':
        return colors.error;
      case 'tie':
        return colors.warning;
      case 'forfeit':
        return colors.textSecondary;
      default:
        return colors.text;
    }
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'win':
        return '🏆';
      case 'loss':
        return '❌';
      case 'tie':
        return '🤝';
      case 'forfeit':
        return '⏰';
      default:
        return '•';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getDaysUntilExpiry = (expiresAt: string) => {
    const expiry = new Date(expiresAt);
    const now = new Date();
    const diffMs = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / 86400000);
    return diffDays;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol ios_icon_name="chevron.left" android_material_icon_name="arrow_back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Challenge History</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol ios_icon_name="chevron.left" android_material_icon_name="arrow_back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Challenge History</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Stats Card */}
        <View style={[commonStyles.card, styles.statsCard]}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statEmoji}>🏆</Text>
              <Text style={styles.statValue}>{stats.totalWins}</Text>
              <Text style={styles.statLabel}>Wins</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statEmoji}>❌</Text>
              <Text style={styles.statValue}>{stats.totalLosses}</Text>
              <Text style={styles.statLabel}>Losses</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statEmoji}>🤝</Text>
              <Text style={styles.statValue}>{stats.totalTies}</Text>
              <Text style={styles.statLabel}>Ties</Text>
            </View>
          </View>
          <View style={styles.balanceStats}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>Total Winnings</Text>
              <Text style={[styles.balanceValue, { color: colors.success }]}>
                +{stats.totalWinnings.toFixed(2)} MXI
              </Text>
            </View>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>Total Losses</Text>
              <Text style={[styles.balanceValue, { color: colors.error }]}>
                -{stats.totalLosses.toFixed(2)} MXI
              </Text>
            </View>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>Net Result</Text>
              <Text
                style={[
                  styles.balanceValue,
                  {
                    color:
                      stats.totalWinnings - stats.totalLosses > 0
                        ? colors.success
                        : colors.error,
                  },
                ]}
              >
                {stats.totalWinnings - stats.totalLosses > 0 ? '+' : ''}
                {(stats.totalWinnings - stats.totalLosses).toFixed(2)} MXI
              </Text>
            </View>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'win' && styles.filterTabActive]}
            onPress={() => setFilter('win')}
          >
            <Text style={[styles.filterText, filter === 'win' && styles.filterTextActive]}>
              Wins
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'loss' && styles.filterTabActive]}
            onPress={() => setFilter('loss')}
          >
            <Text style={[styles.filterText, filter === 'loss' && styles.filterTextActive]}>
              Losses
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'tie' && styles.filterTabActive]}
            onPress={() => setFilter('tie')}
          >
            <Text style={[styles.filterText, filter === 'tie' && styles.filterTextActive]}>
              Ties
            </Text>
          </TouchableOpacity>
        </View>

        {/* History List */}
        {history.length === 0 ? (
          <View style={commonStyles.card}>
            <Text style={styles.emptyText}>No challenge history yet</Text>
            <Text style={styles.emptySubtext}>
              Participate in challenges to see your history here
            </Text>
          </View>
        ) : (
          <View style={styles.historyList}>
            {history.map((item) => (
              <View key={item.id} style={[commonStyles.card, styles.historyCard]}>
                <View style={styles.historyHeader}>
                  <View style={styles.historyIconContainer}>
                    <Text style={styles.historyIcon}>{getChallengeIcon(item.challenge_type)}</Text>
                  </View>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyTitle}>{getChallengeLabel(item.challenge_type)}</Text>
                    <Text style={styles.historyDate}>{formatDate(item.created_at)}</Text>
                  </View>
                  <View style={styles.historyResult}>
                    <Text style={styles.resultEmoji}>{getResultIcon(item.result)}</Text>
                    <Text style={[styles.resultText, { color: getResultColor(item.result) }]}>
                      {item.result.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.historyDetails}>
                  {item.rank && item.total_participants && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Rank:</Text>
                      <Text style={styles.detailValue}>
                        #{item.rank} of {item.total_participants}
                      </Text>
                    </View>
                  )}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Score:</Text>
                    <Text style={styles.detailValue}>{item.score.toFixed(2)}</Text>
                  </View>
                  {item.amount_won > 0 && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Won:</Text>
                      <Text style={[styles.detailValue, { color: colors.success }]}>
                        +{item.amount_won.toFixed(2)} MXI
                      </Text>
                    </View>
                  )}
                  {item.amount_lost > 0 && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Lost:</Text>
                      <Text style={[styles.detailValue, { color: colors.error }]}>
                        -{item.amount_lost.toFixed(2)} MXI
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.expiryInfo}>
                  <IconSymbol
                    ios_icon_name="clock"
                    android_material_icon_name="schedule"
                    size={12}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.expiryText}>
                    Expires in {getDaysUntilExpiry(item.expires_at)} days
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Info Card */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>About History</Text>
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>•</Text>
              <Text style={styles.infoText}>
                All challenge results are stored for 10 days
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>•</Text>
              <Text style={styles.infoText}>
                Records are kept longer in case of disputes
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>•</Text>
              <Text style={styles.infoText}>
                Your complete transaction history is tracked
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>•</Text>
              <Text style={styles.infoText}>
                Tiebreaker results are also recorded
              </Text>
            </View>
          </View>
        </View>
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
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
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  statsCard: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statBox: {
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  balanceStats: {
    gap: 12,
  },
  balanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 4,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  historyList: {
    gap: 12,
  },
  historyCard: {
    padding: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyIcon: {
    fontSize: 24,
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  historyResult: {
    alignItems: 'center',
  },
  resultEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  resultText: {
    fontSize: 12,
    fontWeight: '700',
  },
  historyDetails: {
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: 12,
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
  expiryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  expiryText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  infoList: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoBullet: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginRight: 12,
    width: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});
