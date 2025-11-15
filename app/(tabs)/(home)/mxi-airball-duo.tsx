
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
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

interface Battle {
  id: string;
  battle_number: number;
  challenger_id: string;
  opponent_id: string | null;
  wager_amount: number;
  total_pot: number;
  prize_amount: number;
  status: 'waiting' | 'matched' | 'in_progress' | 'completed' | 'cancelled';
  challenge_type: 'friend' | 'random';
  challenger_center_time: number;
  opponent_center_time: number;
  challenger_finished_at: string | null;
  opponent_finished_at: string | null;
  winner_user_id: string | null;
  completed_at: string | null;
  created_at: string;
  expires_at: string | null;
  challenger_name?: string;
  opponent_name?: string;
}

interface NotificationData {
  id: string;
  battle_id: string;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function MXIAirballDuoScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [wagerAmount, setWagerAmount] = useState('10');
  const [referralCode, setReferralCode] = useState('');
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [challengeType, setChallengeType] = useState<'friend' | 'random'>('random');
  const [activeBattle, setActiveBattle] = useState<Battle | null>(null);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [waitingBattles, setWaitingBattles] = useState<Battle[]>([]);
  const [hasPermission, setHasPermission] = useState(false);

  // Game state
  const [isPlaying, setIsPlaying] = useState(false);
  const [ballY, setBallY] = useState(GAME_HEIGHT / 2);
  const [velocity, setVelocity] = useState(0);
  const [blowStrength, setBlowStrength] = useState(0);
  const [centerTime, setCenterTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState(40);

  const ballAnim = useRef(new Animated.Value(GAME_HEIGHT / 2)).current;
  const recording = useRef<Audio.Recording | null>(null);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const meteringRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    requestPermissions();
    loadActiveBattle();
    loadWaitingBattles();
    loadNotifications();
    setupRealtimeSubscription();

    return () => {
      stopGame();
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      if (meteringRef.current) clearInterval(meteringRef.current);
    };
  }, []);

  const requestPermissions = async () => {
    try {
      const audioPermission = await Audio.requestPermissionsAsync();
      if (audioPermission.status !== 'granted') {
        Alert.alert('Permission Required', 'Microphone access is required to play this game.');
        setHasPermission(false);
        return;
      }

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
    const battleChannel = supabase
      .channel('airball_duo_battles_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'airball_duo_battles',
          filter: `challenger_id=eq.${user?.id},opponent_id=eq.${user?.id}`,
        },
        (payload) => {
          console.log('Battle update:', payload);
          loadActiveBattle();
          loadWaitingBattles();
        }
      )
      .subscribe();

    const notificationChannel = supabase
      .channel('airball_duo_notifications_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'airball_duo_notifications',
          filter: `user_id=eq.${user?.id}`,
        },
        async (payload) => {
          console.log('New notification:', payload);
          const notification = payload.new as NotificationData;

          await Notifications.scheduleNotificationAsync({
            content: {
              title: notification.title,
              body: notification.message,
              data: { battleId: notification.battle_id },
            },
            trigger: null,
          });

          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      battleChannel.unsubscribe();
      notificationChannel.unsubscribe();
    };
  };

  const loadActiveBattle = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('airball_duo_battles')
        .select(`
          *,
          challenger:users!airball_duo_battles_challenger_id_fkey(name),
          opponent:users!airball_duo_battles_opponent_id_fkey(name)
        `)
        .or(`challenger_id.eq.${user.id},opponent_id.eq.${user.id}`)
        .in('status', ['waiting', 'matched', 'in_progress'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading active battle:', error);
        return;
      }

      if (data) {
        setActiveBattle({
          ...data,
          challenger_name: data.challenger?.name,
          opponent_name: data.opponent?.name,
        });
      } else {
        setActiveBattle(null);
      }
    } catch (error) {
      console.error('Error loading active battle:', error);
    }
  };

  const loadWaitingBattles = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('airball_duo_battles')
        .select(`
          *,
          challenger:users!airball_duo_battles_challenger_id_fkey(name)
        `)
        .eq('status', 'waiting')
        .eq('challenge_type', 'random')
        .neq('challenger_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error loading waiting battles:', error);
        return;
      }

      setWaitingBattles(data || []);
    } catch (error) {
      console.error('Error loading waiting battles:', error);
    }
  };

  const loadNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('airball_duo_notifications')
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
      console.error('Error loading notifications:', error);
    }
  };

  const handleCreateChallenge = async () => {
    if (!user) return;

    const wager = parseFloat(wagerAmount);
    if (isNaN(wager) || wager < 1 || wager > 2000) {
      Alert.alert('Invalid Amount', 'Please enter a wager between 1 and 2000 MXI.');
      return;
    }

    if (user.mxiBalance < wager) {
      Alert.alert('Insufficient Balance', 'You do not have enough MXI to create this challenge.');
      return;
    }

    if (challengeType === 'friend' && !referralCode.trim()) {
      Alert.alert('Referral Code Required', 'Please enter your friend\'s referral code.');
      return;
    }

    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please grant microphone permission to play this game.');
      await requestPermissions();
      return;
    }

    setLoading(true);

    try {
      let opponentId = null;

      if (challengeType === 'friend') {
        const { data: opponentData, error: opponentError } = await supabase
          .from('users')
          .select('id')
          .eq('referral_code', referralCode.trim())
          .single();

        if (opponentError || !opponentData) {
          Alert.alert('User Not Found', 'No user found with that referral code.');
          setLoading(false);
          return;
        }

        if (opponentData.id === user.id) {
          Alert.alert('Invalid Challenge', 'You cannot challenge yourself.');
          setLoading(false);
          return;
        }

        opponentId = opponentData.id;
      }

      // Deduct wager from user's balance
      const { error: balanceError } = await supabase
        .from('users')
        .update({ mxi_balance: user.mxiBalance - wager })
        .eq('id', user.id);

      if (balanceError) {
        throw balanceError;
      }

      // Calculate pot and prize (90% to winner, 10% to admin)
      const totalPot = opponentId ? wager * 2 : wager;
      const prizeAmount = totalPot * 0.90;
      const adminFee = totalPot * 0.10;

      // Create battle
      const { data: battleData, error: battleError } = await supabase
        .from('airball_duo_battles')
        .insert({
          challenger_id: user.id,
          opponent_id: opponentId,
          wager_amount: wager,
          total_pot: totalPot,
          prize_amount: prizeAmount,
          admin_fee: adminFee,
          challenge_type: challengeType,
          status: opponentId ? 'matched' : 'waiting',
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (battleError) {
        throw battleError;
      }

      if (opponentId) {
        // Deduct opponent's wager
        const { error: opponentBalanceError } = await supabase
          .from('users')
          .update({ mxi_balance: user.mxiBalance - wager })
          .eq('id', opponentId);

        if (opponentBalanceError) {
          console.error('Error deducting opponent balance:', opponentBalanceError);
        }

        // Create notification for opponent
        await supabase.from('airball_duo_notifications').insert({
          user_id: opponentId,
          battle_id: battleData.id,
          notification_type: 'challenge_received',
          title: 'AirBall Battle Challenge!',
          message: `${user.name} has challenged you to a ${wager} MXI AirBall battle!`,
        });
      }

      Alert.alert(
        'Challenge Created!',
        challengeType === 'friend'
          ? 'Your friend has been notified!'
          : 'Waiting for an opponent to accept...'
      );

      setShowChallengeModal(false);
      setReferralCode('');
      loadActiveBattle();
    } catch (error) {
      console.error('Error creating challenge:', error);
      Alert.alert('Error', 'Failed to create challenge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptChallenge = async (battle: Battle) => {
    if (!user) return;

    if (user.mxiBalance < battle.wager_amount) {
      Alert.alert('Insufficient Balance', 'You do not have enough MXI to accept this challenge.');
      return;
    }

    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please grant microphone permission to play this game.');
      await requestPermissions();
      return;
    }

    setLoading(true);

    try {
      // Deduct wager from user's balance
      const { error: balanceError } = await supabase
        .from('users')
        .update({ mxi_balance: user.mxiBalance - battle.wager_amount })
        .eq('id', user.id);

      if (balanceError) {
        throw balanceError;
      }

      // Update battle
      const totalPot = battle.wager_amount * 2;
      const prizeAmount = totalPot * 0.90;
      const adminFee = totalPot * 0.10;

      const { error: battleError } = await supabase
        .from('airball_duo_battles')
        .update({
          opponent_id: user.id,
          total_pot: totalPot,
          prize_amount: prizeAmount,
          admin_fee: adminFee,
          status: 'matched',
        })
        .eq('id', battle.id);

      if (battleError) {
        throw battleError;
      }

      // Notify challenger
      await supabase.from('airball_duo_notifications').insert({
        user_id: battle.challenger_id,
        battle_id: battle.id,
        notification_type: 'battle_matched',
        title: 'Battle Matched!',
        message: `${user.name} has accepted your AirBall challenge!`,
      });

      Alert.alert('Challenge Accepted!', 'Get ready to blow!');
      loadActiveBattle();
      loadWaitingBattles();
    } catch (error) {
      console.error('Error accepting challenge:', error);
      Alert.alert('Error', 'Failed to accept challenge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startGame = async () => {
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please grant microphone permission to play this game.');
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recording.current = newRecording;

      meteringRef.current = setInterval(async () => {
        if (recording.current) {
          const status = await recording.current.getStatusAsync();
          if (status.isRecording && status.metering !== undefined) {
            const normalizedMetering = Math.max(0, (status.metering + 160) / 160);
            setBlowStrength(normalizedMetering * BLOW_MULTIPLIER);
          }
        }
      }, 100);

      setIsPlaying(true);
      setBallY(GAME_HEIGHT / 2);
      setVelocity(0);
      setCenterTime(0);
      setTimeLeft(40);

      gameLoopRef.current = setInterval(() => {
        setBallY((prevY) => {
          setVelocity((prevVelocity) => {
            const newVelocity = prevVelocity + GRAVITY - blowStrength;
            let newY = prevY + newVelocity;

            if (newY <= 0) {
              newY = 0;
              return 0;
            }
            if (newY >= GAME_HEIGHT - BALL_SIZE) {
              endGame(true);
              return 0;
            }

            if (newY >= CENTER_ZONE_TOP && newY <= CENTER_ZONE_TOP + CENTER_ZONE_HEIGHT - BALL_SIZE) {
              setCenterTime((prev) => prev + 0.1);
            }

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
    if (recording.current) {
      try {
        await recording.current.stopAndUnloadAsync();
        recording.current = null;
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
    }

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

    if (!activeBattle || !user) return;

    if (ballFell) {
      Alert.alert('Game Over!', 'The ball fell! Your center time: ' + centerTime.toFixed(1) + ' seconds');
    } else {
      Alert.alert('Time\'s Up!', 'Your center time: ' + centerTime.toFixed(1) + ' seconds');
    }

    try {
      const isChallenger = activeBattle.challenger_id === user.id;
      const updateData: any = {
        status: 'in_progress',
      };

      if (isChallenger) {
        updateData.challenger_center_time = centerTime;
        updateData.challenger_finished_at = new Date().toISOString();
      } else {
        updateData.opponent_center_time = centerTime;
        updateData.opponent_finished_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('airball_duo_battles')
        .update(updateData)
        .eq('id', activeBattle.id);

      if (error) {
        throw error;
      }

      // Check if both players finished
      const { data: updatedBattle } = await supabase
        .from('airball_duo_battles')
        .select('*')
        .eq('id', activeBattle.id)
        .single();

      if (updatedBattle && updatedBattle.challenger_finished_at && updatedBattle.opponent_finished_at) {
        // Both finished, complete the battle
        const { data: result, error: completeError } = await supabase
          .rpc('complete_airball_duo_battle', { p_battle_id: activeBattle.id });

        if (completeError) {
          console.error('Error completing battle:', completeError);
        }
      } else {
        // Notify opponent
        const opponentId = isChallenger ? activeBattle.opponent_id : activeBattle.challenger_id;
        if (opponentId) {
          await supabase.from('airball_duo_notifications').insert({
            user_id: opponentId,
            battle_id: activeBattle.id,
            notification_type: 'opponent_finished',
            title: 'Opponent Finished!',
            message: `Your opponent scored ${centerTime.toFixed(1)}s center time! Your turn!`,
          });
        }
      }

      loadActiveBattle();
    } catch (error) {
      console.error('Error ending game:', error);
      Alert.alert('Error', 'Failed to save your score. Please try again.');
    }
  };

  const isInCenterZone = () => {
    return ballY >= CENTER_ZONE_TOP && ballY <= CENTER_ZONE_TOP + CENTER_ZONE_HEIGHT - BALL_SIZE;
  };

  const renderActiveBattle = () => {
    if (!activeBattle || !user) return null;

    const isChallenger = activeBattle.challenger_id === user.id;
    const hasFinished = isChallenger
      ? activeBattle.challenger_finished_at
      : activeBattle.opponent_finished_at;
    const opponentFinished = isChallenger
      ? activeBattle.opponent_finished_at
      : activeBattle.challenger_finished_at;

    if (activeBattle.status === 'completed') {
      const isWinner = activeBattle.winner_user_id === user.id;
      const isTie = !activeBattle.winner_user_id;

      return (
        <View style={[commonStyles.card, styles.battleCard]}>
          <View style={styles.battleHeader}>
            <IconSymbol
              ios_icon_name={isWinner ? 'trophy.fill' : isTie ? 'equal.circle.fill' : 'xmark.circle.fill'}
              android_material_icon_name={isWinner ? 'emoji_events' : isTie ? 'compare_arrows' : 'cancel'}
              size={48}
              color={isWinner ? colors.warning : isTie ? colors.textSecondary : colors.error}
            />
            <Text style={styles.battleTitle}>
              {isWinner ? 'You Won!' : isTie ? 'It\'s a Tie!' : 'You Lost'}
            </Text>
          </View>

          <View style={styles.scoreContainer}>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreName}>{activeBattle.challenger_name}</Text>
              <Text style={styles.scoreValue}>{activeBattle.challenger_center_time.toFixed(1)}s</Text>
              <Text style={styles.scoreLabel}>center time</Text>
            </View>
            <Text style={styles.vsText}>VS</Text>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreName}>{activeBattle.opponent_name}</Text>
              <Text style={styles.scoreValue}>{activeBattle.opponent_center_time.toFixed(1)}s</Text>
              <Text style={styles.scoreLabel}>center time</Text>
            </View>
          </View>

          {isWinner && (
            <View style={styles.prizeContainer}>
              <Text style={styles.prizeLabel}>Prize Won (90%)</Text>
              <Text style={styles.prizeAmount}>{activeBattle.prize_amount.toFixed(2)} MXI</Text>
            </View>
          )}

          {isTie && (
            <View style={styles.prizeContainer}>
              <Text style={styles.prizeLabel}>Wager Refunded</Text>
              <Text style={styles.prizeAmount}>{activeBattle.wager_amount.toFixed(2)} MXI</Text>
            </View>
          )}

          <TouchableOpacity
            style={[buttonStyles.primary, styles.newBattleButton]}
            onPress={() => {
              setActiveBattle(null);
              loadWaitingBattles();
            }}
          >
            <Text style={buttonStyles.primaryText}>Start New Battle</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (activeBattle.status === 'waiting') {
      return (
        <View style={[commonStyles.card, styles.battleCard]}>
          <View style={styles.battleHeader}>
            <IconSymbol
              ios_icon_name="clock.fill"
              android_material_icon_name="schedule"
              size={48}
              color={colors.warning}
            />
            <Text style={styles.battleTitle}>Waiting for Opponent</Text>
          </View>
          <Text style={styles.battleSubtitle}>
            Wager: {activeBattle.wager_amount} MXI
          </Text>
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
        </View>
      );
    }

    if (hasFinished) {
      return (
        <View style={[commonStyles.card, styles.battleCard]}>
          <View style={styles.battleHeader}>
            <IconSymbol
              ios_icon_name="checkmark.circle.fill"
              android_material_icon_name="check_circle"
              size={48}
              color={colors.success}
            />
            <Text style={styles.battleTitle}>You Finished!</Text>
          </View>
          <Text style={styles.battleSubtitle}>
            Your Score: {(isChallenger ? activeBattle.challenger_center_time : activeBattle.opponent_center_time).toFixed(1)}s center time
          </Text>
          {!opponentFinished && (
            <React.Fragment>
              <Text style={styles.waitingText}>Waiting for opponent to finish...</Text>
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
            </React.Fragment>
          )}
        </View>
      );
    }

    if (isPlaying) {
      return (
        <View style={[commonStyles.card, styles.gameCard]}>
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{timeLeft}s</Text>
            <Text style={styles.centerTimeText}>
              Center Time: {centerTime.toFixed(1)}s
            </Text>
          </View>

          <View style={styles.gameArea}>
            <View style={[styles.centerZone, { top: CENTER_ZONE_TOP }]}>
              <Text style={styles.centerZoneText}>CENTER ZONE</Text>
            </View>

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

            <View style={styles.ground}>
              <Text style={styles.groundText}>GROUND</Text>
            </View>
          </View>

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
        </View>
      );
    }

    return (
      <View style={[commonStyles.card, styles.battleCard]}>
        <View style={styles.battleHeader}>
          <IconSymbol
            ios_icon_name="bolt.fill"
            android_material_icon_name="flash_on"
            size={48}
            color={colors.primary}
          />
          <Text style={styles.battleTitle}>Battle Ready!</Text>
        </View>
        <Text style={styles.battleSubtitle}>
          Wager: {activeBattle.wager_amount} MXI
        </Text>
        <Text style={styles.battleSubtitle}>
          Prize (90%): {activeBattle.prize_amount.toFixed(2)} MXI
        </Text>
        <Text style={styles.battleInfo}>
          Blow into your microphone to keep the ball in the center zone for 40 seconds!
        </Text>
        <TouchableOpacity
          style={[buttonStyles.primary, styles.startButton]}
          onPress={startGame}
        >
          <Text style={buttonStyles.primaryText}>Start Game!</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow_back"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MXI AirBall Duo</Text>
        <View style={styles.headerRight}>
          {notifications.length > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>{notifications.length}</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[commonStyles.card, styles.balanceCard]}>
          <Text style={styles.balanceLabel}>Your MXI Balance</Text>
          <Text style={styles.balanceAmount}>{user?.mxiBalance.toFixed(2) || '0.00'} MXI</Text>
        </View>

        {activeBattle ? (
          renderActiveBattle()
        ) : (
          <React.Fragment>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Create Challenge</Text>
              <TouchableOpacity
                style={[buttonStyles.primary, styles.challengeButton]}
                onPress={() => {
                  setChallengeType('friend');
                  setShowChallengeModal(true);
                }}
              >
                <IconSymbol
                  ios_icon_name="person.fill"
                  android_material_icon_name="person"
                  size={24}
                  color="#FFFFFF"
                />
                <Text style={[buttonStyles.primaryText, { marginLeft: 8 }]}>
                  Challenge a Friend
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[buttonStyles.secondary, styles.challengeButton]}
                onPress={() => {
                  setChallengeType('random');
                  setShowChallengeModal(true);
                }}
              >
                <IconSymbol
                  ios_icon_name="shuffle"
                  android_material_icon_name="shuffle"
                  size={24}
                  color={colors.primary}
                />
                <Text style={[buttonStyles.secondaryText, { marginLeft: 8 }]}>
                  Random Opponent
                </Text>
              </TouchableOpacity>
            </View>

            {waitingBattles.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Available Battles</Text>
                {waitingBattles.map((battle, index) => (
                  <View key={index} style={[commonStyles.card, styles.waitingBattleCard]}>
                    <View style={styles.waitingBattleInfo}>
                      <Text style={styles.waitingBattleName}>{battle.challenger_name}</Text>
                      <Text style={styles.waitingBattleWager}>
                        Wager: {battle.wager_amount} MXI
                      </Text>
                      <Text style={styles.waitingBattlePrize}>
                        Prize (90%): {(battle.wager_amount * 2 * 0.90).toFixed(2)} MXI
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[buttonStyles.primary, styles.acceptButton]}
                      onPress={() => handleAcceptChallenge(battle)}
                      disabled={loading}
                    >
                      <Text style={buttonStyles.primaryText}>Accept</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </React.Fragment>
        )}

        <View style={[commonStyles.card, styles.infoCard]}>
          <Text style={styles.infoTitle}>How to Play</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>1.</Text>
            <Text style={styles.infoText}>Choose your wager (1-2000 MXI)</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>2.</Text>
            <Text style={styles.infoText}>Challenge a friend or find a random opponent</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>3.</Text>
            <Text style={styles.infoText}>Blow into your microphone to keep the ball in the center zone</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>4.</Text>
            <Text style={styles.infoText}>Longest center time wins 90% of the pot!</Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showChallengeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowChallengeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {challengeType === 'friend' ? 'Challenge a Friend' : 'Random Battle'}
              </Text>
              <TouchableOpacity onPress={() => setShowChallengeModal(false)}>
                <IconSymbol
                  ios_icon_name="xmark.circle.fill"
                  android_material_icon_name="cancel"
                  size={28}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Wager Amount (MXI)</Text>
              <TextInput
                style={styles.input}
                value={wagerAmount}
                onChangeText={setWagerAmount}
                keyboardType="numeric"
                placeholder="Enter amount (1-2000)"
                placeholderTextColor={colors.textSecondary}
              />

              {challengeType === 'friend' && (
                <React.Fragment>
                  <Text style={styles.inputLabel}>Friend&apos;s Referral Code</Text>
                  <TextInput
                    style={styles.input}
                    value={referralCode}
                    onChangeText={setReferralCode}
                    placeholder="Enter or paste referral code"
                    placeholderTextColor={colors.textSecondary}
                    autoCapitalize="none"
                  />
                </React.Fragment>
              )}

              <View style={styles.prizePreview}>
                <Text style={styles.prizePreviewLabel}>Potential Prize (90%)</Text>
                <Text style={styles.prizePreviewAmount}>
                  {(parseFloat(wagerAmount || '0') * 2 * 0.90).toFixed(2)} MXI
                </Text>
                <Text style={styles.prizePreviewSubtext}>
                  Admin Fee (10%): {(parseFloat(wagerAmount || '0') * 2 * 0.10).toFixed(2)} MXI
                </Text>
              </View>

              <TouchableOpacity
                style={[buttonStyles.primary, styles.modalButton]}
                onPress={handleCreateChallenge}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={buttonStyles.primaryText}>Create Challenge</Text>
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
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  notificationBadge: {
    backgroundColor: colors.error,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  balanceCard: {
    marginBottom: 20,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  challengeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  battleCard: {
    marginBottom: 20,
    alignItems: 'center',
    padding: 24,
  },
  battleHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  battleTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
  },
  battleSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  battleInfo: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  startButton: {
    width: '100%',
  },
  gameCard: {
    minHeight: 400,
    marginBottom: 20,
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
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  scoreBox: {
    alignItems: 'center',
  },
  scoreName: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.text,
  },
  scoreLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  vsText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  prizeContainer: {
    alignItems: 'center',
    marginTop: 24,
    padding: 16,
    backgroundColor: colors.primary + '20',
    borderRadius: 12,
    width: '100%',
  },
  prizeLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  prizeAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
  },
  newBattleButton: {
    width: '100%',
    marginTop: 20,
  },
  waitingText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
  waitingBattleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    padding: 16,
  },
  waitingBattleInfo: {
    flex: 1,
  },
  waitingBattleName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  waitingBattleWager: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  waitingBattlePrize: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  acceptButton: {
    paddingHorizontal: 24,
  },
  infoCard: {
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoBullet: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginRight: 12,
    width: 24,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
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
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  prizePreview: {
    backgroundColor: colors.primary + '20',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  prizePreviewLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  prizePreviewAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  prizePreviewSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  modalButton: {
    width: '100%',
  },
});
