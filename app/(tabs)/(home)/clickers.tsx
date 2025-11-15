
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
  Modal,
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
  is_tiebreaker: boolean;
  parent_competition_id: string | null;
  tiebreaker_deadline: string | null;
  tiebreaker_status: 'waiting' | 'in_progress' | 'completed' | 'expired' | null;
}

interface Participant {
  id: string;
  user_id: string;
  clicks: number;
  has_played: boolean;
  played_at: string | null;
  joined_at: string;
  user_name?: string;
  is_tiebreaker_participant: boolean;
}

interface AvailableBalances {
  mxiPurchasedDirectly: number;
  mxiFromUnifiedCommissions: number;
  mxiFromChallenges: number;
  total: number;
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
  const [tiebreakerTimeLeft, setTiebreakerTimeLeft] = useState<number | null>(null);
  const [showStartPrompt, setShowStartPrompt] = useState(false);
  const [showPaymentSourceModal, setShowPaymentSourceModal] = useState(false);
  const [availableBalances, setAvailableBalances] = useState<AvailableBalances>({
    mxiPurchasedDirectly: 0,
    mxiFromUnifiedCommissions: 0,
    mxiFromChallenges: 0,
    total: 0,
  });
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const tiebreakerTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadCompetitionData();
    loadAvailableBalances();
    setupRealtimeSubscription();

    return () => {
      if (tiebreakerTimerRef.current) clearInterval(tiebreakerTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (currentCompetition && currentCompetition.status === 'open') {
      loadParticipants();

      if (currentCompetition.is_tiebreaker && currentCompetition.tiebreaker_deadline) {
        startTiebreakerCountdown();
      }
    }
  }, [currentCompetition]);

  const loadAvailableBalances = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('mxi_purchased_directly, mxi_from_unified_commissions, mxi_from_challenges')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error loading balances:', error);
        return;
      }
      
      const purchased = data?.mxi_purchased_directly || 0;
      const commissions = data?.mxi_from_unified_commissions || 0;
      const challenges = data?.mxi_from_challenges || 0;

      setAvailableBalances({
        mxiPurchasedDirectly: purchased,
        mxiFromUnifiedCommissions: commissions,
        mxiFromChallenges: challenges,
        total: purchased + commissions + challenges,
      });
    } catch (error) {
      console.error('Exception loading balances:', error);
    }
  };

  const startTiebreakerCountdown = () => {
    if (!currentCompetition?.tiebreaker_deadline) return;

    const updateCountdown = () => {
      const deadline = new Date(currentCompetition.tiebreaker_deadline!);
      const now = new Date();
      const diffMs = deadline.getTime() - now.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);

      if (diffSeconds <= 0) {
        setTiebreakerTimeLeft(0);
        if (tiebreakerTimerRef.current) {
          clearInterval(tiebreakerTimerRef.current);
        }
        loadCompetitionData();
      } else {
        setTiebreakerTimeLeft(diffSeconds);
      }
    };

    updateCountdown();
    tiebreakerTimerRef.current = setInterval(updateCountdown, 1000);
  };

  const formatTiebreakerTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
        loadParticipants();
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
        .order('clicks', { ascending: false })
        .order('played_at', { ascending: true });

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

    // Tiebreakers have no entry fee
    if (currentCompetition.is_tiebreaker) {
      proceedWithJoin('purchased');
      return;
    }

    // Check available balance
    if (availableBalances.total < currentCompetition.entry_fee) {
      Alert.alert(
        'Insufficient Balance',
        `You need ${currentCompetition.entry_fee} MXI to join.\n\nYour available balance for challenges is ${availableBalances.total.toFixed(2)} MXI.\n\nAvailable MXI includes:\n- MXI purchased directly\n- MXI from unified commissions\n- MXI from challenge winnings`
      );
      return;
    }

    // Show payment source selection modal
    setShowPaymentSourceModal(true);
  };

  const proceedWithJoin = async (source: 'purchased' | 'commissions' | 'challenges') => {
    if (!user || !currentCompetition) return;

    // Validate source has enough balance (skip for tiebreakers)
    if (!currentCompetition.is_tiebreaker) {
      let sourceBalance = 0;
      let sourceName = '';

      switch (source) {
        case 'purchased':
          sourceBalance = availableBalances.mxiPurchasedDirectly;
          sourceName = 'MXI Purchased';
          break;
        case 'commissions':
          sourceBalance = availableBalances.mxiFromUnifiedCommissions;
          sourceName = 'MXI from Commissions';
          break;
        case 'challenges':
          sourceBalance = availableBalances.mxiFromChallenges;
          sourceName = 'MXI from Challenges';
          break;
      }

      if (sourceBalance < currentCompetition.entry_fee) {
        Alert.alert(
          'Insufficient Balance',
          `Your ${sourceName} balance (${sourceBalance.toFixed(2)} MXI) is not enough to cover the entry fee (${currentCompetition.entry_fee.toFixed(2)} MXI).`
        );
        return;
      }
    }

    setShowPaymentSourceModal(false);
    
    try {
      setJoining(true);

      // Deduct entry fee (skip for tiebreakers)
      if (!currentCompetition.is_tiebreaker) {
        const { error: deductError } = await supabase.rpc('deduct_challenge_balance', {
          p_user_id: user.id,
          p_amount: currentCompetition.entry_fee,
        });

        if (deductError) {
          console.error('Deduct error:', deductError);
          Alert.alert('Error', 'Failed to deduct balance');
          return;
        }
      }

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

      await loadCompetitionData();
      await loadAvailableBalances();
      setShowStartPrompt(true);
      
      Alert.alert(
        'Success!', 
        'You have joined the competition! Ready to play?',
        [
          { 
            text: 'Not Yet', 
            style: 'cancel',
            onPress: () => setShowStartPrompt(true)
          },
          {
            text: 'Start Now!',
            onPress: () => {
              setShowStartPrompt(false);
              startGame();
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Join exception:', error);
      Alert.alert('Error', error.message || 'Failed to join competition');
    } finally {
      setJoining(false);
    }
  };

  const startGame = () => {
    setShowStartPrompt(false);
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

      if (data.tie) {
        Alert.alert(
          'Tie!',
          `You tied with ${data.tied_count - 1} other player(s)! A tiebreaker round has been created. You have 10 minutes to complete it.`
        );
      } else if (data.winner_id === user?.id) {
        Alert.alert('You Won!', `Congratulations! You won ${data.prize_amount.toFixed(2)} MXI!`);
      } else {
        Alert.alert('Score Submitted', `You scored ${clicks} clicks!`);
      }

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
        <TouchableOpacity onPress={() => router.push('/(tabs)/(home)/challenge-history')}>
          <IconSymbol
            ios_icon_name="clock.arrow.circlepath"
            android_material_icon_name="history"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Available Balance Card */}
        <View style={[commonStyles.card, styles.balanceCard]}>
          <Text style={styles.balanceTitle}>Available Balance for Challenges</Text>
          <Text style={styles.balanceAmount}>{availableBalances.total.toFixed(2)} MXI</Text>
          <View style={styles.balanceBreakdown}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>MXI Purchased</Text>
              <Text style={styles.balanceValue}>{availableBalances.mxiPurchasedDirectly.toFixed(2)}</Text>
            </View>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>MXI from Commissions</Text>
              <Text style={styles.balanceValue}>{availableBalances.mxiFromUnifiedCommissions.toFixed(2)}</Text>
            </View>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>MXI from Challenges</Text>
              <Text style={styles.balanceValue}>{availableBalances.mxiFromChallenges.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Tiebreaker Warning */}
        {currentCompetition.is_tiebreaker && tiebreakerTimeLeft !== null && tiebreakerTimeLeft > 0 && (
          <View style={[commonStyles.card, styles.tiebreakerWarning]}>
            <View style={styles.warningHeader}>
              <Text style={styles.warningEmoji}>⚠️</Text>
              <Text style={styles.warningTitle}>TIEBREAKER ROUND</Text>
            </View>
            <Text style={styles.warningText}>
              This is a tiebreaker round. You must complete it within:
            </Text>
            <Text style={styles.tiebreakerTimer}>{formatTiebreakerTime(tiebreakerTimeLeft)}</Text>
            <Text style={styles.warningSubtext}>
              If you don&apos;t play within this time, your score will be set to 0 and you&apos;ll forfeit.
            </Text>
          </View>
        )}

        {/* Competition Card */}
        <View style={[commonStyles.card, styles.competitionCard]}>
          <View style={styles.competitionHeader}>
            <View style={styles.competitionIconContainer}>
              <Text style={styles.competitionIconEmoji}>
                {currentCompetition.is_tiebreaker ? '⚔️' : '👆'}
              </Text>
            </View>
            <View style={styles.competitionHeaderText}>
              <Text style={styles.competitionTitle}>
                {currentCompetition.is_tiebreaker ? 'Tiebreaker' : `Competition #${currentCompetition.competition_number}`}
              </Text>
              <Text style={styles.competitionStatus}>
                {currentCompetition.status === 'open' ? '🟢 Open' : '🔒 Locked'}
              </Text>
            </View>
          </View>

          <View style={styles.prizeContainer}>
            <Text style={styles.prizeLabel}>Prize (90%)</Text>
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
              <Text style={styles.statValue}>
                {currentCompetition.is_tiebreaker ? 'FREE' : `${currentCompetition.entry_fee} MXI`}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Available MXI</Text>
              <Text style={styles.statValue}>{availableBalances.total.toFixed(2)}</Text>
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
                  {showStartPrompt && (
                    <View style={styles.startPromptContainer}>
                      <Text style={styles.startPromptEmoji}>🎮</Text>
                      <Text style={styles.startPromptTitle}>Ready to Play!</Text>
                      <Text style={styles.startPromptText}>
                        You&apos;ve successfully joined the competition. Start the challenge when you&apos;re ready!
                      </Text>
                    </View>
                  )}
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
              <Text style={styles.sectionTitle}>
                {currentCompetition.is_tiebreaker ? 'Join Tiebreaker' : 'Join Competition'}
              </Text>
              <Text style={styles.joinText}>
                {currentCompetition.is_tiebreaker
                  ? 'Join this tiebreaker round and compete for the prize! No entry fee required.'
                  : `Join this competition for ${currentCompetition.entry_fee} MXI and compete for the prize!`}
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
            <Text style={styles.leaderboardSubtitle}>
              Scores are ranked from highest to lowest. The player with the most clicks wins!
            </Text>
            <View style={styles.leaderboardList}>
              {participants.map((participant, index) => {
                const isCurrentUser = participant.user_id === user?.id;
                const isWinner = index === 0 && participant.has_played && participants.filter(p => p.has_played).length === currentCompetition.participants_count;
                
                return (
                  <View 
                    key={participant.id} 
                    style={[
                      styles.leaderboardItem,
                      isCurrentUser && styles.leaderboardItemHighlight,
                      isWinner && styles.leaderboardItemWinner
                    ]}
                  >
                    <View style={[
                      styles.leaderboardRank,
                      isWinner && styles.leaderboardRankWinner
                    ]}>
                      {isWinner ? (
                        <Text style={styles.leaderboardRankEmoji}>🏆</Text>
                      ) : (
                        <Text style={[
                          styles.leaderboardRankText,
                          isWinner && styles.leaderboardRankTextWinner
                        ]}>
                          #{index + 1}
                        </Text>
                      )}
                    </View>
                    <View style={styles.leaderboardInfo}>
                      <Text style={[
                        styles.leaderboardName,
                        isCurrentUser && styles.leaderboardNameHighlight
                      ]}>
                        {participant.user_name}
                        {isCurrentUser && ' (You)'}
                      </Text>
                      <Text style={[
                        styles.leaderboardClicks,
                        isWinner && styles.leaderboardClicksWinner
                      ]}>
                        {participant.has_played ? `${participant.clicks} clicks` : 'Not played yet'}
                      </Text>
                    </View>
                    {participant.has_played && (
                      <View style={styles.leaderboardBadge}>
                        <IconSymbol
                          ios_icon_name="checkmark.circle.fill"
                          android_material_icon_name="check_circle"
                          size={20}
                          color={colors.success}
                        />
                      </View>
                    )}
                  </View>
                );
              })}
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
              <Text style={styles.infoText}>Choose which MXI balance to use for payment</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>3.</Text>
              <Text style={styles.infoText}>Click &quot;Join Now&quot; to enter the competition</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>4.</Text>
              <Text style={styles.infoText}>Start the game when you&apos;re ready to play</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>5.</Text>
              <Text style={styles.infoText}>Tap the button as fast as you can for 15 seconds</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>6.</Text>
              <Text style={styles.infoText}>Your score is automatically submitted when time runs out</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>7.</Text>
              <Text style={styles.infoText}>Leaderboard updates in real-time showing all scores</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>8.</Text>
              <Text style={styles.infoText}>Highest score wins 90% of the pool</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>9.</Text>
              <Text style={styles.infoText}>Ties trigger automatic tiebreaker rounds</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>10.</Text>
              <Text style={styles.infoText}>Tiebreaker: 10 min to play or score becomes 0</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>11.</Text>
              <Text style={styles.infoText}>All results stored for 10 days in your history</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Payment Source Selection Modal */}
      <Modal
        visible={showPaymentSourceModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaymentSourceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Payment Source</Text>
            <Text style={styles.modalSubtitle}>
              Choose which MXI balance to use for this competition
            </Text>

            <View style={styles.paymentSourcesList}>
              {/* MXI Purchased */}
              <TouchableOpacity
                style={[
                  styles.paymentSourceItem,
                  availableBalances.mxiPurchasedDirectly < currentCompetition.entry_fee && styles.paymentSourceItemDisabled
                ]}
                onPress={() => proceedWithJoin('purchased')}
                disabled={availableBalances.mxiPurchasedDirectly < currentCompetition.entry_fee || joining}
              >
                <View style={styles.paymentSourceHeader}>
                  <IconSymbol 
                    ios_icon_name="dollarsign.circle.fill" 
                    android_material_icon_name="monetization_on" 
                    size={24} 
                    color={colors.primary} 
                  />
                  <View style={styles.paymentSourceInfo}>
                    <Text style={styles.paymentSourceTitle}>MXI Purchased</Text>
                    <Text style={styles.paymentSourceBalance}>
                      {availableBalances.mxiPurchasedDirectly.toFixed(2)} MXI
                    </Text>
                  </View>
                  <IconSymbol 
                    ios_icon_name="chevron.right" 
                    android_material_icon_name="chevron_right" 
                    size={20} 
                    color={colors.textSecondary} 
                  />
                </View>
              </TouchableOpacity>

              {/* MXI from Commissions */}
              <TouchableOpacity
                style={[
                  styles.paymentSourceItem,
                  availableBalances.mxiFromUnifiedCommissions < currentCompetition.entry_fee && styles.paymentSourceItemDisabled
                ]}
                onPress={() => proceedWithJoin('commissions')}
                disabled={availableBalances.mxiFromUnifiedCommissions < currentCompetition.entry_fee || joining}
              >
                <View style={styles.paymentSourceHeader}>
                  <IconSymbol 
                    ios_icon_name="arrow.triangle.merge" 
                    android_material_icon_name="merge_type" 
                    size={24} 
                    color={colors.success} 
                  />
                  <View style={styles.paymentSourceInfo}>
                    <Text style={styles.paymentSourceTitle}>MXI from Commissions</Text>
                    <Text style={styles.paymentSourceBalance}>
                      {availableBalances.mxiFromUnifiedCommissions.toFixed(2)} MXI
                    </Text>
                  </View>
                  <IconSymbol 
                    ios_icon_name="chevron.right" 
                    android_material_icon_name="chevron_right" 
                    size={20} 
                    color={colors.textSecondary} 
                  />
                </View>
              </TouchableOpacity>

              {/* MXI from Challenges */}
              <TouchableOpacity
                style={[
                  styles.paymentSourceItem,
                  availableBalances.mxiFromChallenges < currentCompetition.entry_fee && styles.paymentSourceItemDisabled
                ]}
                onPress={() => proceedWithJoin('challenges')}
                disabled={availableBalances.mxiFromChallenges < currentCompetition.entry_fee || joining}
              >
                <View style={styles.paymentSourceHeader}>
                  <IconSymbol 
                    ios_icon_name="trophy.fill" 
                    android_material_icon_name="emoji_events" 
                    size={24} 
                    color={colors.warning} 
                  />
                  <View style={styles.paymentSourceInfo}>
                    <Text style={styles.paymentSourceTitle}>MXI from Challenges</Text>
                    <Text style={styles.paymentSourceBalance}>
                      {availableBalances.mxiFromChallenges.toFixed(2)} MXI
                    </Text>
                  </View>
                  <IconSymbol 
                    ios_icon_name="chevron.right" 
                    android_material_icon_name="chevron_right" 
                    size={20} 
                    color={colors.textSecondary} 
                  />
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[buttonStyles.outline, { marginTop: 16 }]}
              onPress={() => setShowPaymentSourceModal(false)}
            >
              <Text style={buttonStyles.outlineText}>Cancel</Text>
            </TouchableOpacity>
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
  balanceCard: {
    marginBottom: 16,
    backgroundColor: colors.highlight,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  balanceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  balanceBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  balanceItem: {
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  tiebreakerWarning: {
    backgroundColor: colors.warning + '20',
    borderWidth: 2,
    borderColor: colors.warning,
    marginBottom: 20,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  warningEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.warning,
  },
  warningText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
    lineHeight: 20,
  },
  tiebreakerTimer: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.warning,
    textAlign: 'center',
    marginVertical: 12,
  },
  warningSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
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
  leaderboardSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
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
  startPromptContainer: {
    alignItems: 'center',
    backgroundColor: colors.success + '20',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.success,
  },
  startPromptEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  startPromptTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.success,
    marginBottom: 8,
  },
  startPromptText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 20,
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
    color: '#000',
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
  leaderboardItemHighlight: {
    backgroundColor: colors.primary + '10',
    borderColor: colors.primary,
    borderWidth: 2,
  },
  leaderboardItemWinner: {
    backgroundColor: colors.warning + '10',
    borderColor: colors.warning,
    borderWidth: 2,
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
  leaderboardRankWinner: {
    backgroundColor: colors.warning + '20',
  },
  leaderboardRankText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  leaderboardRankTextWinner: {
    color: colors.warning,
  },
  leaderboardRankEmoji: {
    fontSize: 24,
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  leaderboardNameHighlight: {
    color: colors.primary,
    fontWeight: '700',
  },
  leaderboardClicks: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  leaderboardClicksWinner: {
    color: colors.warning,
    fontWeight: '600',
  },
  leaderboardBadge: {
    marginLeft: 8,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  paymentSourcesList: {
    gap: 12,
    marginBottom: 16,
  },
  paymentSourceItem: {
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  paymentSourceItemDisabled: {
    opacity: 0.5,
  },
  paymentSourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  paymentSourceInfo: {
    flex: 1,
  },
  paymentSourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  paymentSourceBalance: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
