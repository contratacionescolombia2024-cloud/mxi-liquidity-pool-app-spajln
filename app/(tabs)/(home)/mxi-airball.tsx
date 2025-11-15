
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
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';
import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';

const { width, height } = Dimensions.get('window');
const BALL_SIZE = 60;
const GAME_HEIGHT = height * 0.5;
const CENTER_ZONE_HEIGHT = 150;
const CENTER_ZONE_TOP = (GAME_HEIGHT - CENTER_ZONE_HEIGHT) / 2;
const GRAVITY = 0.8;
const BLOW_MULTIPLIER = 3;
const GAME_DURATION = 40000; // 40 seconds

interface AirballCompetition {
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
  center_time: number;
  has_played: boolean;
  played_at: string | null;
  joined_at: string;
  user_name?: string;
  is_tiebreaker_participant: boolean;
}

interface NotificationData {
  id: string;
  competition_id: string;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface AvailableBalances {
  mxiPurchasedDirectly: number;
  mxiFromUnifiedCommissions: number;
  mxiFromChallenges: number;
  total: number;
}

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function MXIAirBallScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [currentCompetition, setCurrentCompetition] = useState<AirballCompetition | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [userParticipant, setUserParticipant] = useState<Participant | null>(null);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [tiebreakerTimeLeft, setTiebreakerTimeLeft] = useState<number | null>(null);
  const [showStartPrompt, setShowStartPrompt] = useState(false);
  const [availableBalances, setAvailableBalances] = useState<AvailableBalances>({
    mxiPurchasedDirectly: 0,
    mxiFromUnifiedCommissions: 0,
    mxiFromChallenges: 0,
    total: 0,
  });
  const [showPaymentSourceModal, setShowPaymentSourceModal] = useState(false);
  
  // Game state
  const [isPlaying, setIsPlaying] = useState(false);
  const [ballY, setBallY] = useState(GAME_HEIGHT / 2);
  const [velocity, setVelocity] = useState(0);
  const [blowStrength, setBlowStrength] = useState(0);
  const [centerTime, setCenterTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState(40);
  const [hasPermission, setHasPermission] = useState(false);
  
  const ballAnim = useRef(new Animated.Value(GAME_HEIGHT / 2)).current;
  const recording = useRef<Audio.Recording | null>(null);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const meteringRef = useRef<NodeJS.Timeout | null>(null);
  const tiebreakerTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    requestPermissions();
    loadCompetitionData();
    loadAvailableBalances();
    setupRealtimeSubscription();
    loadNotifications();

    return () => {
      stopGame();
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      if (meteringRef.current) clearInterval(meteringRef.current);
      if (tiebreakerTimerRef.current) clearInterval(tiebreakerTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (currentCompetition && currentCompetition.status !== 'completed') {
      loadParticipants();
      
      // Start tiebreaker countdown if applicable
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

      const purchased = parseFloat(data.mxi_purchased_directly?.toString() || '0');
      const commissions = parseFloat(data.mxi_from_unified_commissions?.toString() || '0');
      const challenges = parseFloat(data.mxi_from_challenges?.toString() || '0');

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
        // Reload to check for timeout
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

  const requestPermissions = async () => {
    try {
      // Request microphone permission
      const audioPermission = await Audio.requestPermissionsAsync();
      if (audioPermission.status !== 'granted') {
        Alert.alert('Permission Required', 'Microphone access is required to play this game.');
        setHasPermission(false);
        return;
      }

      // Request notification permission
      const notificationPermission = await Notifications.requestPermissionsAsync();
      if (notificationPermission.status !== 'granted') {
        Alert.alert('Permission Required', 'Notification access is recommended for game updates.');
      }

      setHasPermission(true);
    } catch (error) {
      console.error('Error requesting permissions:', error);
      setHasPermission(false);
    }
  };

  const setupRealtimeSubscription = () => {
    // Subscribe to competition updates
    const competitionChannel = supabase
      .channel('airball_competitions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'airball_competitions',
        },
        (payload) => {
          console.log('Competition update:', payload);
          loadCompetitionData();
        }
      )
      .subscribe();

    // Subscribe to notifications
    const notificationChannel = supabase
      .channel('airball_notifications_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'airball_notifications',
          filter: `user_id=eq.${user?.id}`,
        },
        async (payload) => {
          console.log('New notification:', payload);
          const notification = payload.new as NotificationData;
          
          // Show local notification
          await Notifications.scheduleNotificationAsync({
            content: {
              title: notification.title,
              body: notification.message,
              data: { competitionId: notification.competition_id },
            },
            trigger: null,
          });
          
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      competitionChannel.unsubscribe();
      notificationChannel.unsubscribe();
    };
  };

  const loadCompetitionData = async () => {
    try {
      setLoading(true);

      const { data: compData, error: compError } = await supabase
        .from('airball_competitions')
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
            .from('airball_participants')
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
          .rpc('get_current_airball_competition');

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
        .from('airball_participants')
        .select(`
          *,
          users!inner(name)
        `)
        .eq('competition_id', currentCompetition.id)
        .order('center_time', { ascending: false });

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

  const loadNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('airball_notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error loading notifications:', error);
        return;
      }

      setNotifications(data || []);
    } catch (error) {
      console.error('Exception loading notifications:', error);
    }
  };

  const handleJoinCompetition = async () => {
    if (!user || !currentCompetition) return;

    // Tiebreakers have no entry fee
    if (currentCompetition.is_tiebreaker) {
      proceedWithJoin('purchased');
      return;
    }

    // Check if user has sufficient balance
    if (availableBalances.total < currentCompetition.entry_fee) {
      Alert.alert(
        'Insufficient Balance',
        `You need ${currentCompetition.entry_fee} MXI to join. Your available balance is ${availableBalances.total.toFixed(2)} MXI.`
      );
      return;
    }

    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please grant microphone permission to play this game.');
      await requestPermissions();
      return;
    }

    // Show payment source selection modal
    setShowPaymentSourceModal(true);
  };

  const proceedWithJoin = async (source: 'purchased' | 'commissions' | 'challenges') => {
    if (!user || !currentCompetition) return;

    setShowPaymentSourceModal(false);

    // Validate source balance
    const sourceBalance = 
      source === 'purchased' ? availableBalances.mxiPurchasedDirectly :
      source === 'commissions' ? availableBalances.mxiFromUnifiedCommissions :
      availableBalances.mxiFromChallenges;

    if (!currentCompetition.is_tiebreaker && sourceBalance < currentCompetition.entry_fee) {
      Alert.alert(
        'Insufficient Balance',
        `You need ${currentCompetition.entry_fee} MXI from ${
          source === 'purchased' ? 'direct purchases' :
          source === 'commissions' ? 'unified commissions' :
          'challenge winnings'
        }. Available: ${sourceBalance.toFixed(2)} MXI`
      );
      return;
    }

    const message = currentCompetition.is_tiebreaker
      ? 'Join this tiebreaker round? No entry fee required.'
      : `Join this AirBall competition for ${currentCompetition.entry_fee} MXI?`;

    Alert.alert('Join Competition', message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Join',
        onPress: async () => {
          try {
            setJoining(true);

            // Deduct entry fee if not a tiebreaker
            if (!currentCompetition.is_tiebreaker) {
              const { data: deductResult, error: deductError } = await supabase
                .rpc('deduct_challenge_balance', {
                  p_user_id: user.id,
                  p_amount: currentCompetition.entry_fee,
                  p_source: source,
                });

              if (deductError || !deductResult) {
                Alert.alert('Error', 'Failed to deduct entry fee. Please try again.');
                setJoining(false);
                return;
              }
            }

            const { data, error } = await supabase.rpc('join_airball_competition', {
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

            // Successfully joined - reload data and show start prompt
            await loadCompetitionData();
            await loadAvailableBalances();
            setShowStartPrompt(true);
            
            // Show success alert with option to start immediately
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
        },
      },
    ]);
  };

  const startGame = async () => {
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please grant microphone permission to play this game.');
      return;
    }

    setShowStartPrompt(false);

    try {
      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recording.current = newRecording;

      // Start metering
      meteringRef.current = setInterval(async () => {
        if (recording.current) {
          const status = await recording.current.getStatusAsync();
          if (status.isRecording && status.metering !== undefined) {
            // Convert metering to blow strength (metering is typically -160 to 0)
            const normalizedMetering = Math.max(0, (status.metering + 160) / 160);
            setBlowStrength(normalizedMetering * BLOW_MULTIPLIER);
          }
        }
      }, 100);

      // Initialize game state
      setIsPlaying(true);
      setBallY(GAME_HEIGHT / 2);
      setVelocity(0);
      setCenterTime(0);
      setTimeLeft(40);

      // Start game loop
      gameLoopRef.current = setInterval(() => {
        setBallY((prevY) => {
          setVelocity((prevVelocity) => {
            const newVelocity = prevVelocity + GRAVITY - blowStrength;
            let newY = prevY + newVelocity;

            // Check boundaries
            if (newY <= 0) {
              newY = 0;
              return 0;
            }
            if (newY >= GAME_HEIGHT - BALL_SIZE) {
              // Ball hit the ground - game over
              endGame(true);
              return 0;
            }

            // Check if in center zone
            if (newY >= CENTER_ZONE_TOP && newY <= CENTER_ZONE_TOP + CENTER_ZONE_HEIGHT - BALL_SIZE) {
              setCenterTime((prev) => prev + 0.1);
            }

            // Animate ball position
            Animated.timing(ballAnim, {
              toValue: newY,
              duration: 100,
              useNativeDriver: true,
            }).start();

            return newVelocity;
          });

          return prevY;
        });
      }, 100);

      // Start timer
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            endGame(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error starting game:', error);
      Alert.alert('Error', 'Failed to start game. Please try again.');
    }
  };

  const stopGame = async () => {
    // Stop recording
    if (recording.current) {
      try {
        await recording.current.stopAndUnloadAsync();
        recording.current = null;
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
    }

    // Clear intervals
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (meteringRef.current) {
      clearInterval(meteringRef.current);
      meteringRef.current = null;
    }

    setIsPlaying(false);
    setBlowStrength(0);
  };

  const endGame = async (ballFell: boolean) => {
    await stopGame();

    if (!userParticipant || !currentCompetition) return;

    if (ballFell) {
      Alert.alert('Game Over!', 'The ball fell! Your center time: ' + centerTime.toFixed(1) + ' seconds');
    } else {
      Alert.alert('Time\'s Up!', 'Your center time: ' + centerTime.toFixed(1) + ' seconds');
    }

    try {
      const { data, error } = await supabase.rpc('submit_airball_score', {
        p_participant_id: userParticipant.id,
        p_center_time: centerTime,
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
      }

      await loadCompetitionData();
      await loadParticipants();
    } catch (error: any) {
      console.error('Submit score exception:', error);
      Alert.alert('Error', error.message || 'Failed to submit score');
    }
  };

  const getProgressPercentage = () => {
    if (!currentCompetition) return 0;
    return (currentCompetition.participants_count / currentCompetition.max_participants) * 100;
  };

  const isInCenterZone = () => {
    return ballY >= CENTER_ZONE_TOP && ballY <= CENTER_ZONE_TOP + CENTER_ZONE_HEIGHT - BALL_SIZE;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol ios_icon_name="chevron.left" android_material_icon_name="arrow_back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>MXI AirBall</Text>
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
          <Text style={styles.headerTitle}>MXI AirBall</Text>
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
        <Text style={styles.headerTitle}>MXI AirBall</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/(home)/challenge-history')}>
            <IconSymbol
              ios_icon_name="clock.arrow.circlepath"
              android_material_icon_name="history"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
          {notifications.length > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>{notifications.length}</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
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
                {currentCompetition.is_tiebreaker ? '⚔️' : '🎈'}
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
              <Text style={styles.statValue}>
                {currentCompetition.is_tiebreaker ? 'FREE' : `${currentCompetition.entry_fee} MXI`}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Available Balance</Text>
              <Text style={styles.statValue}>{availableBalances.total.toFixed(2)} MXI</Text>
            </View>
          </View>
        </View>

        {/* Game Section */}
        {userParticipant ? (
          userParticipant.has_played ? (
            <View style={commonStyles.card}>
              <Text style={styles.sectionTitle}>Your Score</Text>
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreValue}>{userParticipant.center_time.toFixed(1)}s</Text>
                <Text style={styles.scoreLabel}>in center zone</Text>
              </View>
              <Text style={styles.waitingText}>
                Waiting for all participants to complete...
              </Text>
            </View>
          ) : (
            <View style={[commonStyles.card, styles.gameCard]}>
              <Text style={styles.sectionTitle}>Keep the Ball in the Center!</Text>
              
              {isPlaying ? (
                <React.Fragment>
                  {/* Timer */}
                  <View style={styles.timerContainer}>
                    <Text style={styles.timerText}>{timeLeft}s</Text>
                    <Text style={styles.centerTimeText}>
                      Center Time: {centerTime.toFixed(1)}s
                    </Text>
                  </View>

                  {/* Game Area */}
                  <View style={styles.gameArea}>
                    {/* Center Zone */}
                    <View style={[styles.centerZone, { top: CENTER_ZONE_TOP }]}>
                      <Text style={styles.centerZoneText}>CENTER ZONE</Text>
                    </View>

                    {/* Ball */}
                    <Animated.View
                      style={[
                        styles.ball,
                        {
                          transform: [{ translateY: ballAnim }],
                          backgroundColor: isInCenterZone() ? colors.success : colors.primary,
                        },
                      ]}
                    >
                      <Text style={styles.ballEmoji}>⚽</Text>
                    </Animated.View>

                    {/* Ground */}
                    <View style={styles.ground}>
                      <Text style={styles.groundText}>GROUND</Text>
                    </View>
                  </View>

                  {/* Blow Indicator */}
                  <View style={styles.blowIndicator}>
                    <Text style={styles.blowLabel}>Blow Strength</Text>
                    <View style={styles.blowBar}>
                      <View
                        style={[
                          styles.blowFill,
                          { width: `${(blowStrength / BLOW_MULTIPLIER) * 100}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.blowHint}>💨 Blow into the microphone!</Text>
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
                    Blow into your microphone to keep the ball floating in the center zone. 
                    The longer you keep it centered, the higher your score!
                  </Text>
                  <View style={styles.gameRules}>
                    <View style={styles.ruleItem}>
                      <Text style={styles.ruleEmoji}>⬆️</Text>
                      <Text style={styles.ruleText}>Blow harder to lift the ball</Text>
                    </View>
                    <View style={styles.ruleItem}>
                      <Text style={styles.ruleEmoji}>⬇️</Text>
                      <Text style={styles.ruleText}>Stop blowing to let it fall</Text>
                    </View>
                    <View style={styles.ruleItem}>
                      <Text style={styles.ruleEmoji}>🎯</Text>
                      <Text style={styles.ruleText}>Keep it in the center zone</Text>
                    </View>
                    <View style={styles.ruleItem}>
                      <Text style={styles.ruleEmoji}>⏱️</Text>
                      <Text style={styles.ruleText}>40 seconds to play</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[buttonStyles.primary, styles.startButton]}
                    onPress={startGame}
                  >
                    <Text style={buttonStyles.primaryText}>Start Game</Text>
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
                    <Text style={styles.leaderboardScore}>
                      {participant.has_played ? `${participant.center_time.toFixed(1)}s in center` : 'Not played'}
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
              <Text style={styles.infoText}>Entry fee is 3 MXI per competition</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>2.</Text>
              <Text style={styles.infoText}>Click &quot;Join Now&quot; to enter the competition</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>3.</Text>
              <Text style={styles.infoText}>Choose payment source: purchased MXI, commissions, or challenge winnings</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>4.</Text>
              <Text style={styles.infoText}>Start the game when you&apos;re ready to play</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>5.</Text>
              <Text style={styles.infoText}>Leaderboard updates in real-time as users complete</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>6.</Text>
              <Text style={styles.infoText}>Player with longest center time wins 90% of pool</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>7.</Text>
              <Text style={styles.infoText}>Ties trigger automatic tiebreaker rounds</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>8.</Text>
              <Text style={styles.infoText}>Tiebreaker: 10 min to play or score becomes 0</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>9.</Text>
              <Text style={styles.infoText}>If no one plays tiebreaker in 1 hour, prize goes to admin</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>10.</Text>
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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Payment Source</Text>
              <TouchableOpacity onPress={() => setShowPaymentSourceModal(false)}>
                <IconSymbol
                  ios_icon_name="xmark.circle.fill"
                  android_material_icon_name="cancel"
                  size={28}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalSubtitle}>
                Choose which balance to use for the {currentCompetition?.entry_fee} MXI entry fee:
              </Text>

              <TouchableOpacity
                style={[
                  styles.sourceOption,
                  availableBalances.mxiPurchasedDirectly < (currentCompetition?.entry_fee || 0) && styles.sourceOptionDisabled,
                ]}
                onPress={() => proceedWithJoin('purchased')}
                disabled={availableBalances.mxiPurchasedDirectly < (currentCompetition?.entry_fee || 0)}
              >
                <View style={styles.sourceOptionHeader}>
                  <Text style={styles.sourceOptionTitle}>💰 MXI Purchased Directly</Text>
                  <Text style={styles.sourceOptionBalance}>
                    {availableBalances.mxiPurchasedDirectly.toFixed(2)} MXI
                  </Text>
                </View>
                <Text style={styles.sourceOptionDescription}>
                  From USDT purchases
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.sourceOption,
                  availableBalances.mxiFromUnifiedCommissions < (currentCompetition?.entry_fee || 0) && styles.sourceOptionDisabled,
                ]}
                onPress={() => proceedWithJoin('commissions')}
                disabled={availableBalances.mxiFromUnifiedCommissions < (currentCompetition?.entry_fee || 0)}
              >
                <View style={styles.sourceOptionHeader}>
                  <Text style={styles.sourceOptionTitle}>🎁 Unified Commissions</Text>
                  <Text style={styles.sourceOptionBalance}>
                    {availableBalances.mxiFromUnifiedCommissions.toFixed(2)} MXI
                  </Text>
                </View>
                <Text style={styles.sourceOptionDescription}>
                  From referral commissions
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.sourceOption,
                  availableBalances.mxiFromChallenges < (currentCompetition?.entry_fee || 0) && styles.sourceOptionDisabled,
                ]}
                onPress={() => proceedWithJoin('challenges')}
                disabled={availableBalances.mxiFromChallenges < (currentCompetition?.entry_fee || 0)}
              >
                <View style={styles.sourceOptionHeader}>
                  <Text style={styles.sourceOptionTitle}>🏆 Challenge Winnings</Text>
                  <Text style={styles.sourceOptionBalance}>
                    {availableBalances.mxiFromChallenges.toFixed(2)} MXI
                  </Text>
                </View>
                <Text style={styles.sourceOptionDescription}>
                  From challenge victories
                </Text>
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
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
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
  gameCard: {
    minHeight: 400,
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
    marginBottom: 16,
  },
  timerText: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primary,
  },
  centerTimeText: {
    fontSize: 16,
    color: colors.success,
    marginTop: 4,
    fontWeight: '600',
  },
  gameArea: {
    height: GAME_HEIGHT,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 16,
  },
  centerZone: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: CENTER_ZONE_HEIGHT,
    backgroundColor: colors.success + '20',
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerZoneText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.success,
  },
  ball: {
    position: 'absolute',
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_SIZE / 2,
    left: (width - 40 - BALL_SIZE) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  ballEmoji: {
    fontSize: 32,
  },
  ground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: colors.error + '40',
    borderTopWidth: 2,
    borderColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groundText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.error,
  },
  blowIndicator: {
    alignItems: 'center',
  },
  blowLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  blowBar: {
    width: '100%',
    height: 20,
    backgroundColor: colors.border,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 8,
  },
  blowFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 10,
  },
  blowHint: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  instructionText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
    textAlign: 'center',
  },
  gameRules: {
    marginBottom: 24,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  ruleEmoji: {
    fontSize: 24,
    marginRight: 12,
    width: 32,
  },
  ruleText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
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
  leaderboardScore: {
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
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  sourceOption: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  sourceOptionDisabled: {
    opacity: 0.5,
    borderColor: colors.border,
  },
  sourceOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sourceOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  sourceOptionBalance: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  sourceOptionDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
