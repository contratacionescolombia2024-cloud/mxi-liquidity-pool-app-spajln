
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
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
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
  const [userParticipation, setUserParticipation] = useState<Participant | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameStarted, setGameStarted] = useState(false);
  const channelRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadCompetitionData();
    setupRealtimeSubscription();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (currentCompetition) {
      loadParticipants();
    }
  }, [currentCompetition]);

  const setupRealtimeSubscription = async () => {
    if (channelRef.current?.state === 'subscribed') return;

    const channel = supabase.channel('clicker:updates', {
      config: { private: false }
    });
    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'INSERT' }, () => {
        console.log('Clicker competition updated');
        loadCompetitionData();
      })
      .on('broadcast', { event: 'UPDATE' }, () => {
        console.log('Clicker competition updated');
        loadCompetitionData();
      })
      .subscribe();
  };

  const loadCompetitionData = async () => {
    try {
      setLoading(true);

      // Get current competition
      const { data: competitionData, error: competitionError } = await supabase
        .from('clicker_competitions')
        .select('*')
        .in('status', ['open', 'locked'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (competitionError && competitionError.code !== 'PGRST116') {
        console.error('Error loading competition:', competitionError);
      }

      if (competitionData) {
        setCurrentCompetition(competitionData);

        // Check if user is a participant
        if (user) {
          const { data: participantData, error: participantError } = await supabase
            .from('clicker_participants')
            .select('*')
            .eq('competition_id', competitionData.id)
            .eq('user_id', user.id)
            .maybeSingle();

          if (participantError && participantError.code !== 'PGRST116') {
            console.error('Error loading participant:', participantError);
          }

          setUserParticipation(participantData);
        }
      } else {
        // No open competition, try to create one
        const { data: newCompetitionId, error: createError } = await supabase
          .rpc('get_current_clicker_competition');

        if (createError) {
          console.error('Error creating competition:', createError);
        } else if (newCompetitionId) {
          // Reload data
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
      const { data: participantsData, error: participantsError } = await supabase
        .from('clicker_participants')
        .select(`
          *,
          users!inner(name)
        `)
        .eq('competition_id', currentCompetition.id)
        .order('clicks', { ascending: false });

      if (participantsError) {
        console.error('Error loading participants:', participantsError);
        return;
      }

      const mappedParticipants = participantsData.map((p: any) => ({
        ...p,
        user_name: p.users?.name || 'Unknown',
      }));

      setParticipants(mappedParticipants);
    } catch (error) {
      console.error('Exception loading participants:', error);
    }
  };

  const handleJoinCompetition = async () => {
    if (!user || !currentCompetition) return;

    if (user.mxiBalance < currentCompetition.entry_fee) {
      Alert.alert(
        'Insufficient Balance',
        `You need ${currentCompetition.entry_fee.toFixed(2)} MXI to join. Your current balance is ${user.mxiBalance.toFixed(2)} MXI.`
      );
      return;
    }

    Alert.alert(
      'Join Competition',
      `Join this competition for ${currentCompetition.entry_fee.toFixed(2)} MXI?`,
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

              Alert.alert('Success!', 'You have joined the competition!');

              // Reload data
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
    setGameStarted(true);
    setIsPlaying(true);
    setClickCount(0);
    setTimeLeft(15);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endGame = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsPlaying(false);

    if (!user || !currentCompetition) return;

    try {
      const { data, error } = await supabase.rpc('submit_clicker_score', {
        p_user_id: user.id,
        p_competition_id: currentCompetition.id,
        p_clicks: clickCount,
      });

      if (error) {
        console.error('Submit score error:', error);
        Alert.alert('Error', error.message || 'Failed to submit score');
        return;
      }

      if (!data.success) {
        Alert.alert('Error', data.error || 'Failed to submit score');
        return;
      }

      if (data.competition_completed) {
        Alert.alert(
          'Competition Complete!',
          `Winner: ${data.winner_id === user.id ? 'You!' : 'Another player'}\nWinning Clicks: ${data.winning_clicks}\nPrize: ${data.prize_amount.toFixed(2)} MXI`,
          [{ text: 'OK', onPress: () => loadCompetitionData() }]
        );
      } else {
        Alert.alert(
          'Score Submitted!',
          `You clicked ${clickCount} times!\nWaiting for other players to finish...`,
          [{ text: 'OK', onPress: () => loadCompetitionData() }]
        );
      }
    } catch (error: any) {
      console.error('Submit score exception:', error);
      Alert.alert('Error', error.message || 'Failed to submit score');
    }
  };

  const handleClick = () => {
    if (!isPlaying) return;

    setClickCount((prev) => prev + 1);

    // Animate button
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.9,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
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
              <Text style={styles.competitionIconEmoji}>⚡</Text>
            </View>
            <View style={styles.competitionHeaderText}>
              <Text style={styles.competitionTitle}>Competition #{currentCompetition.competition_number}</Text>
              <Text style={styles.competitionStatus}>
                {currentCompetition.status === 'open' ? '🟢 Open' : currentCompetition.status === 'locked' ? '🔒 In Progress' : '✅ Completed'}
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
              <Text style={styles.statLabel}>Time Limit</Text>
              <Text style={styles.statValue}>15s</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Your Balance</Text>
              <Text style={styles.statValue}>{user?.mxiBalance.toFixed(2)} MXI</Text>
            </View>
          </View>
        </View>

        {/* Join or Play Section */}
        {!userParticipation && currentCompetition.status === 'open' && (
          <View style={commonStyles.card}>
            <Text style={styles.sectionTitle}>Join Competition</Text>
            <Text style={styles.sectionSubtitle}>
              Click as many times as you can in 15 seconds. Highest score wins!
            </Text>

            <TouchableOpacity
              style={[buttonStyles.primary, styles.joinButton]}
              onPress={handleJoinCompetition}
              disabled={joining}
            >
              {joining ? (
                <ActivityIndicator color="#000" />
              ) : (
                <React.Fragment>
                  <IconSymbol ios_icon_name="bolt.fill" android_material_icon_name="flash_on" size={20} color="#000" />
                  <Text style={buttonStyles.primaryText}>Join for {currentCompetition.entry_fee} MXI</Text>
                </React.Fragment>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Game Section */}
        {userParticipation && !userParticipation.has_played && (
          <View style={[commonStyles.card, styles.gameCard]}>
            <Text style={styles.sectionTitle}>Your Turn!</Text>
            
            {!gameStarted ? (
              <React.Fragment>
                <Text style={styles.gameInstructions}>
                  Click the button below as many times as you can in 15 seconds!
                </Text>
                <TouchableOpacity
                  style={[buttonStyles.primary, styles.startButton]}
                  onPress={startGame}
                >
                  <IconSymbol ios_icon_name="play.fill" android_material_icon_name="play_arrow" size={24} color="#000" />
                  <Text style={buttonStyles.primaryText}>Start Game</Text>
                </TouchableOpacity>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <View style={styles.gameStats}>
                  <View style={styles.gameStat}>
                    <Text style={styles.gameStatLabel}>Time Left</Text>
                    <Text style={styles.gameStatValue}>{timeLeft}s</Text>
                  </View>
                  <View style={styles.gameStat}>
                    <Text style={styles.gameStatLabel}>Clicks</Text>
                    <Text style={styles.gameStatValue}>{clickCount}</Text>
                  </View>
                </View>

                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                  <TouchableOpacity
                    style={styles.clickButton}
                    onPress={handleClick}
                    disabled={!isPlaying}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.clickButtonText}>CLICK!</Text>
                  </TouchableOpacity>
                </Animated.View>
              </React.Fragment>
            )}
          </View>
        )}

        {/* Waiting Section */}
        {userParticipation && userParticipation.has_played && (
          <View style={commonStyles.card}>
            <Text style={styles.sectionTitle}>Score Submitted!</Text>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>Your Clicks</Text>
              <Text style={styles.scoreValue}>{userParticipation.clicks}</Text>
              <Text style={styles.scoreSubtext}>
                {currentCompetition.status === 'locked' 
                  ? 'Waiting for other players to finish...' 
                  : 'Competition completed!'}
              </Text>
            </View>
          </View>
        )}

        {/* Leaderboard */}
        {participants.length > 0 && (
          <View style={commonStyles.card}>
            <Text style={styles.sectionTitle}>Leaderboard</Text>
            <View style={styles.leaderboard}>
              {participants.map((participant, index) => (
                <View 
                  key={participant.id} 
                  style={[
                    styles.leaderboardItem,
                    participant.user_id === user?.id && styles.leaderboardItemHighlight
                  ]}
                >
                  <View style={styles.leaderboardRank}>
                    <Text style={styles.leaderboardRankText}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </Text>
                  </View>
                  <View style={styles.leaderboardInfo}>
                    <Text style={styles.leaderboardName}>
                      {participant.user_name}
                      {participant.user_id === user?.id && ' (You)'}
                    </Text>
                    <Text style={styles.leaderboardStatus}>
                      {participant.has_played ? `${participant.clicks} clicks` : 'Not played yet'}
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
              <Text style={styles.infoText}>Each competition has 50 participants</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>3.</Text>
              <Text style={styles.infoText}>Click the button as many times as you can in 15 seconds</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>4.</Text>
              <Text style={styles.infoText}>Highest score wins 90% of the total pool</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>5.</Text>
              <Text style={styles.infoText}>New competition starts after current one completes</Text>
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
    borderColor: colors.accent,
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
    backgroundColor: colors.accent + '20',
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
    color: colors.accent,
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
    backgroundColor: colors.accent,
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
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  joinButton: {
    marginTop: 8,
  },
  gameCard: {
    alignItems: 'center',
  },
  gameInstructions: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  startButton: {
    minWidth: 200,
  },
  gameStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 32,
  },
  gameStat: {
    alignItems: 'center',
  },
  gameStatLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  gameStatValue: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.accent,
  },
  clickButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  clickButtonText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  scoreCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  scoreLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 8,
  },
  scoreSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  leaderboard: {
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
  leaderboardItemHighlight: {
    borderColor: colors.accent,
    borderWidth: 2,
    backgroundColor: colors.accent + '10',
  },
  leaderboardRank: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  leaderboardRankText: {
    fontSize: 18,
    fontWeight: '700',
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  leaderboardStatus: {
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
    color: colors.accent,
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
