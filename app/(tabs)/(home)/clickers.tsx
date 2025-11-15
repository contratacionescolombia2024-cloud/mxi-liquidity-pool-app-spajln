
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';

interface ClickerCompetition {
  id: string;
  competition_number: number;
  entry_fee: number;
  max_participants: number;
  participants_count: number;
  total_pool: number;
  prize_amount: number;
  status: 'open' | 'locked' | 'completed';
  winner_user_id: string | null;
  completed_at: string | null;
  created_at: string;
}

interface Participant {
  id: string;
  user_id: string;
  clicks: number;
  has_played: boolean;
  played_at: string | null;
  joined_at: string;
  user_name?: string;
}

export default function ClickersScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [currentCompetition, setCurrentCompetition] = useState<ClickerCompetition | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [userParticipant, setUserParticipant] = useState<Participant | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadCompetitionData();
    setupRealtimeSubscription();
  }, []);

  useEffect(() => {
    if (currentCompetition && currentCompetition.status === 'open') {
      loadParticipants();
    }
  }, [currentCompetition]);

  const setupRealtimeSubscription = async () => {
    const channel = supabase.channel('clicker:updates', {
      config: { private: false }
    });

    channel
      .on('broadcast', { event: 'INSERT' }, () => {
        console.log('Clicker competition created');
        loadCompetitionData();
      })
      .on('broadcast', { event: 'UPDATE' }, () => {
        console.log('Clicker competition updated');
        loadCompetitionData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const loadCompetitionData = async () => {
    try {
      setLoading(true);

      const { data: compData, error: compError } = await supabase
        .from('clicker_competitions')
        .select('*')
        .in('status', ['open', 'locked'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (compError && compError.code !== 'PGRST116') {
        console.error('Error loading competition:', compError);
      }

      if (compData) {
        setCurrentCompetition(compData);

        if (user) {
          const { data: partData, error: partError } = await supabase
            .from('clicker_participants')
            .select('*')
            .eq('competition_id', compData.id)
            .eq('user_id', user.id)
            .maybeSingle();

          if (partError && partError.code !== 'PGRST116') {
            console.error('Error loading participant:', partError);
          }

          setUserParticipant(partData);
        }
      } else {
        const { data: newCompId, error: createError } = await supabase
          .rpc('get_current_clicker_competition');

        if (createError) {
          console.error('Error creating competition:', createError);
        } else if (newCompId) {
          loadCompetitionData();
          return;
        }
      }
    } catch (error) {
      console.error('Exception loading competition data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadParticipants = async () => {
    if (!currentCompetition) return;

    try {
      const { data, error } = await supabase
        .from('clicker_participants')
        .select(`
          *,
          users!inner(name)
        `)
        .eq('competition_id', currentCompetition.id)
        .order('clicks', { ascending: false });

      if (error) {
        console.error('Error loading participants:', error);
        return;
      }

      const participantsWithNames = data.map((p: any) => ({
        ...p,
        user_name: p.users?.name || 'Unknown',
      }));

      setParticipants(participantsWithNames);
    } catch (error) {
      console.error('Exception loading participants:', error);
    }
  };

  const handleJoinCompetition = async () => {
    if (!user || !currentCompetition) return;

    if (user.mxiBalance < currentCompetition.entry_fee) {
      Alert.alert(
        'Insufficient Balance',
        `You need ${currentCompetition.entry_fee} MXI to join. Your current balance is ${user.mxiBalance.toFixed(2)} MXI.`
      );
      return;
    }

    Alert.alert(
      'Join Competition',
      `Join this clicker competition for ${currentCompetition.entry_fee} MXI?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Join',
          onPress: async () => {
            try {
              setJoining(true);

              const { data, error } = await supabase.rpc('join_clicker_competition', {
                p_user_id: user.id,
              });

              if (error) {
                console.error('Join error:', error);
                Alert.alert('Error', error.message || 'Failed to join competition');
                return;
              }

              if (!data.success) {
                Alert.alert('Error', data.error || 'Failed to join competition');
                return;
              }

              Alert.alert('Success!', 'You have joined the competition! You can now play.');
              await loadCompetitionData();
            } catch (error: any) {
              console.error('Join exception:', error);
              Alert.alert('Error', error.message || 'Failed to join competition');
            } finally {
              setJoining(false);
            }
          },
        },
      ]
    );
  };

  const startGame = () => {
    setIsPlaying(true);
    setClicks(0);
    setTimeLeft(15);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endGame = async () => {
    setIsPlaying(false);

    if (!user || !currentCompetition || !userParticipant) return;

    try {
      const { data, error } = await supabase.rpc('submit_clicker_score', {
        p_participant_id: userParticipant.id,
        p_clicks: clicks,
      });

      if (error) {
        console.error('Submit score error:', error);
        Alert.alert('Error', 'Failed to submit score');
        return;
      }

      if (!data.success) {
        Alert.alert('Error', data.error || 'Failed to submit score');
        return;
      }

      Alert.alert('Score Submitted!', `You clicked ${clicks} times!`);
      await loadCompetitionData();
      await loadParticipants();
    } catch (error: any) {
      console.error('Submit score exception:', error);
      Alert.alert('Error', error.message || 'Failed to submit score');
    }
  };

  const handleClick = () => {
    if (!isPlaying) return;

    setClicks((prev) => prev + 1);

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getProgressPercentage = () => {
    if (!currentCompetition) return 0;
    return (currentCompetition.participants_count / currentCompetition.max_participants) * 100;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol ios_icon_name="chevron.left" android_material_icon_name="arrow_back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Clickers</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading competition...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentCompetition) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol ios_icon_name="chevron.left" android_material_icon_name="arrow_back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Clickers</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No active competition</Text>
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
        <Text style={styles.headerTitle}>Clickers</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Competition Card */}
        <View style={[commonStyles.card, styles.competitionCard]}>
          <View style={styles.competitionHeader}>
            <View style={styles.competitionIconContainer}>
              <Text style={styles.competitionIconEmoji}>👆</Text>
            </View>
            <View style={styles.competitionHeaderText}>
              <Text style={styles.competitionTitle}>Competition #{currentCompetition.competition_number}</Text>
              <Text style={styles.competitionStatus}>
                {currentCompetition.status === 'open' ? '🟢 Open' : '🔒 Locked'}
              </Text>
            </View>
          </View>

          <View style={styles.prizeContainer}>
            <Text style={styles.prizeLabel}>Prize Pool (90%)</Text>
            <Text style={styles.prizeAmount}>{currentCompetition.prize_amount.toFixed(2)} MXI</Text>
            <Text style={styles.totalPool}>Total Pool: {currentCompetition.total_pool.toFixed(2)} MXI</Text>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Participants</Text>
              <Text style={styles.progressValue}>
                {currentCompetition.participants_count} / {currentCompetition.max_participants}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${getProgressPercentage()}%` }]} />
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Entry Fee</Text>
              <Text style={styles.statValue}>{currentCompetition.entry_fee} MXI</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Your Balance</Text>
              <Text style={styles.statValue}>{user?.mxiBalance.toFixed(2)} MXI</Text>
            </View>
          </View>
        </View>

        {/* Game Section */}
        {userParticipant ? (
          userParticipant.has_played ? (
            <View style={commonStyles.card}>
              <Text style={styles.sectionTitle}>Your Score</Text>
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreValue}>{userParticipant.clicks}</Text>
                <Text style={styles.scoreLabel}>clicks</Text>
              </View>
              <Text style={styles.waitingText}>
                Waiting for all participants to complete...
              </Text>
            </View>
          ) : (
            <View style={commonStyles.card}>
              <Text style={styles.sectionTitle}>Click Challenge</Text>
              {isPlaying ? (
                <React.Fragment>
                  <View style={styles.timerContainer}>
                    <Text style={styles.timerText}>{timeLeft}s</Text>
                  </View>
                  <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                    <TouchableOpacity
                      style={styles.clickButton}
                      onPress={handleClick}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.clickButtonText}>TAP!</Text>
                    </TouchableOpacity>
                  </Animated.View>
                  <View style={styles.clicksContainer}>
                    <Text style={styles.clicksValue}>{clicks}</Text>
                    <Text style={styles.clicksLabel}>clicks</Text>
                  </View>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <Text style={styles.instructionText}>
                    Click the button as many times as you can in 15 seconds!
                  </Text>
                  <TouchableOpacity
                    style={[buttonStyles.primary, styles.startButton]}
                    onPress={startGame}
                  >
                    <Text style={buttonStyles.primaryText}>Start Challenge</Text>
                  </TouchableOpacity>
                </React.Fragment>
              )}
            </View>
          )
        ) : (
          currentCompetition.status === 'open' && (
            <View style={commonStyles.card}>
              <Text style={styles.sectionTitle}>Join Competition</Text>
              <Text style={styles.joinText}>
                Join this competition for {currentCompetition.entry_fee} MXI and compete for the prize!
              </Text>
              <TouchableOpacity
                style={[buttonStyles.primary, styles.joinButton]}
                onPress={handleJoinCompetition}
                disabled={joining}
              >
                {joining ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={buttonStyles.primaryText}>Join Now</Text>
                )}
              </TouchableOpacity>
            </View>
          )
        )}

        {/* Leaderboard */}
        {participants.length > 0 && (
          <View style={commonStyles.card}>
            <Text style={styles.sectionTitle}>Leaderboard</Text>
            <View style={styles.leaderboardList}>
              {participants.map((participant, index) => (
                <View key={participant.id} style={styles.leaderboardItem}>
                  <View style={styles.leaderboardRank}>
                    <Text style={styles.leaderboardRankText}>#{index + 1}</Text>
                  </View>
                  <View style={styles.leaderboardInfo}>
                    <Text style={styles.leaderboardName}>
                      {participant.user_name}
                      {participant.user_id === user?.id && ' (You)'}
                    </Text>
                    <Text style={styles.leaderboardClicks}>
                      {participant.has_played ? `${participant.clicks} clicks` : 'Not played'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* How It Works */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>1.</Text>
              <Text style={styles.infoText}>Entry fee is 10 MXI per competition</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>2.</Text>
              <Text style={styles.infoText}>Competition starts when 50 players join</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>3.</Text>
              <Text style={styles.infoText}>Click as many times as you can in 15 seconds</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>4.</Text>
              <Text style={styles.infoText}>Highest score wins 90% of the prize pool</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>5.</Text>
              <Text style={styles.infoText}>New competition starts automatically</Text>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
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
  competitionCard: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  competitionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  competitionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  competitionIconEmoji: {
    fontSize: 32,
  },
  competitionHeaderText: {
    flex: 1,
  },
  competitionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  competitionStatus: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  prizeContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  prizeLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  prizeAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  totalPool: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  progressSection: {
    marginBottom: 20,
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
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  scoreContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.primary,
  },
  scoreLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
  },
  waitingText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.primary,
  },
  clickButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)',
  },
  clickButtonText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
  },
  clicksContainer: {
    alignItems: 'center',
  },
  clicksValue: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.text,
  },
  clicksLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  instructionText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  startButton: {
    marginTop: 8,
  },
  joinText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  joinButton: {
    marginTop: 8,
  },
  leaderboardList: {
    gap: 12,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  leaderboardRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  leaderboardRankText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  leaderboardClicks: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
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
    width: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});
