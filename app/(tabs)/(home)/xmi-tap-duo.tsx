
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
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';
import * as Notifications from 'expo-notifications';

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
  challenger_clicks: number;
  opponent_clicks: number;
  challenger_finished_at: string | null;
  opponent_finished_at: string | null;
  winner_user_id: string | null;
  completed_at: string | null;
  created_at: string;
  expires_at: string | null;
  challenger_name?: string;
  opponent_name?: string;
  challenger_referral_code?: string;
  opponent_referral_code?: string;
  cancellation_reason?: string | null;
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

export default function XMITapDuoScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [wagerAmount, setWagerAmount] = useState('10');
  const [referralCode, setReferralCode] = useState('');
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [challengeType, setChallengeType] = useState<'friend' | 'random'>('random');
  const [activeBattle, setActiveBattle] = useState<Battle | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [participationTimeLeft, setParticipationTimeLeft] = useState(600); // 10 minutes in seconds
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [waitingBattles, setWaitingBattles] = useState<Battle[]>([]);
  const [availableBalances, setAvailableBalances] = useState<AvailableBalances>({
    mxiPurchasedDirectly: 0,
    mxiFromUnifiedCommissions: 0,
    mxiFromChallenges: 0,
    total: 0,
  });
  const [showPaymentSourceModal, setShowPaymentSourceModal] = useState(false);
  const [pendingWager, setPendingWager] = useState(0);
  const [pendingBattle, setPendingBattle] = useState<Battle | null>(null);
  const [isCreatingChallenge, setIsCreatingChallenge] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const participationTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    requestNotificationPermissions();
    loadActiveBattle();
    loadWaitingBattles();
    loadNotifications();
    loadAvailableBalances();
    setupRealtimeSubscription();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (participationTimerRef.current) {
        clearInterval(participationTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Start participation timer when battle is matched and user hasn't finished
    if (activeBattle && activeBattle.status === 'matched') {
      const isChallenger = activeBattle.challenger_id === user?.id;
      const hasFinished = isChallenger
        ? activeBattle.challenger_finished_at
        : activeBattle.opponent_finished_at;

      if (!hasFinished && !isPlaying) {
        startParticipationTimer();
      }
    }

    return () => {
      if (participationTimerRef.current) {
        clearInterval(participationTimerRef.current);
      }
    };
  }, [activeBattle, isPlaying]);

  const startParticipationTimer = () => {
    if (participationTimerRef.current) {
      clearInterval(participationTimerRef.current);
    }

    // Calculate time left based on when the battle was matched
    const matchedTime = new Date(activeBattle?.created_at || Date.now()).getTime();
    const now = Date.now();
    const elapsed = Math.floor((now - matchedTime) / 1000);
    const remaining = Math.max(0, 600 - elapsed); // 10 minutes = 600 seconds

    setParticipationTimeLeft(remaining);

    participationTimerRef.current = setInterval(() => {
      setParticipationTimeLeft((prev) => {
        if (prev <= 1) {
          if (participationTimerRef.current) {
            clearInterval(participationTimerRef.current);
          }
          // Auto-submit score of 0
          if (!isPlaying) {
            endGame();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatParticipationTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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

  const requestNotificationPermissions = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      Alert.alert('Permission Required', 'Please enable notifications to receive battle challenges.');
    }
  };

  const setupRealtimeSubscription = () => {
    const battleChannel = supabase
      .channel('tap_duo_battles_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tap_duo_battles',
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
      .channel('tap_duo_notifications_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tap_duo_notifications',
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
        .from('tap_duo_battles')
        .select(`
          *,
          challenger:users!tap_duo_battles_challenger_id_fkey(name, referral_code),
          opponent:users!tap_duo_battles_opponent_id_fkey(name, referral_code)
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
          challenger_referral_code: data.challenger?.referral_code,
          opponent_referral_code: data.opponent?.referral_code,
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
        .from('tap_duo_battles')
        .select(`
          *,
          challenger:users!tap_duo_battles_challenger_id_fkey(name, referral_code)
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
        .from('tap_duo_notifications')
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

  const handleCancelChallenge = async () => {
    if (!activeBattle || !user) return;

    console.log('🚫 Cancel challenge requested. Status:', activeBattle.status);

    const isChallenger = activeBattle.challenger_id === user.id;

    // Only allow cancellation if waiting or if 10 minutes passed
    if (activeBattle.status === 'waiting') {
      Alert.alert(
        'Cancel Challenge?',
        'Are you sure you want to cancel this challenge? Your wager will be refunded.',
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes, Cancel',
            style: 'destructive',
            onPress: async () => {
              try {
                setLoading(true);
                console.log('Cancelling waiting challenge...');
                
                const { data, error } = await supabase.rpc('cancel_tap_duo_battle', {
                  p_battle_id: activeBattle.id,
                  p_user_id: user.id,
                  p_reason: 'User cancelled while waiting for opponent',
                });

                if (error) {
                  console.error('Cancel error:', error);
                  throw error;
                }

                console.log('Cancel result:', data);

                if (data.success) {
                  Alert.alert('✅ Challenge Cancelled', `Your wager of ${activeBattle.wager_amount} MXI has been refunded.`);
                  loadActiveBattle();
                  loadAvailableBalances();
                } else {
                  Alert.alert('❌ Error', data.error || 'Failed to cancel challenge');
                }
              } catch (error: any) {
                console.error('Error cancelling challenge:', error);
                Alert.alert('❌ Error', error.message || 'Failed to cancel challenge');
              } finally {
                setLoading(false);
              }
            },
          },
        ]
      );
    } else if (activeBattle.status === 'matched' || activeBattle.status === 'in_progress') {
      const matchedAt = new Date(activeBattle.created_at).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - matchedAt) / 1000);

      console.log('Matched/In-progress battle. Elapsed:', elapsed, 'seconds');

      if (elapsed < 600) {
        Alert.alert(
          '⏰ Cannot Cancel Yet',
          `You can cancel this challenge after 10 minutes if your opponent doesn't participate.\n\nTime remaining: ${formatParticipationTime(600 - elapsed)}`
        );
        return;
      }

      Alert.alert(
        'Cancel Challenge?',
        'Your opponent has not participated within 10 minutes. Do you want to cancel and claim the pot?',
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes, Cancel',
            style: 'destructive',
            onPress: async () => {
              try {
                setLoading(true);
                console.log('Cancelling due to opponent timeout...');
                
                const { data, error } = await supabase.rpc('cancel_tap_duo_battle', {
                  p_battle_id: activeBattle.id,
                  p_user_id: user.id,
                  p_reason: 'Opponent did not participate within 10 minutes',
                });

                if (error) {
                  console.error('Cancel error:', error);
                  throw error;
                }

                console.log('Cancel result:', data);

                if (data.success) {
                  if (data.winner_id) {
                    Alert.alert('🏆 You Win!', `Your opponent didn't participate. You won ${data.prize} MXI!`);
                  } else if (data.pot_to_admin) {
                    Alert.alert('⚠️ Challenge Cancelled', 'Neither player participated. The pot goes to admin.');
                  }
                  loadActiveBattle();
                  loadAvailableBalances();
                } else {
                  Alert.alert('❌ Error', data.error || 'Failed to cancel challenge');
                }
              } catch (error: any) {
                console.error('Error cancelling challenge:', error);
                Alert.alert('❌ Error', error.message || 'Failed to cancel challenge');
              } finally {
                setLoading(false);
              }
            },
          },
        ]
      );
    }
  };

  const handleCreateChallenge = async () => {
    if (!user) return;

    const wager = parseFloat(wagerAmount);
    if (isNaN(wager) || wager < 1 || wager > 2000) {
      Alert.alert('❌ Invalid Amount', 'Please enter a wager between 1 and 2000 MXI.');
      return;
    }

    if (availableBalances.total < wager) {
      Alert.alert(
        '💰 Insufficient Balance', 
        `You need ${wager} MXI from USDT purchases, referral commissions, or challenge winnings.\n\nAvailable: ${availableBalances.total.toFixed(2)} MXI\n\n⚠️ Vesting rewards cannot be used for challenges until launch date.`
      );
      return;
    }

    if (challengeType === 'friend' && !referralCode.trim()) {
      Alert.alert('⚠️ Referral Code Required', 'Please enter your friend\'s referral code.');
      return;
    }

    // Store wager and show payment source modal
    setPendingWager(wager);
    setIsCreatingChallenge(true);
    setShowChallengeModal(false);
    setShowPaymentSourceModal(true);
  };

  const proceedWithCreateChallenge = async (source: 'purchased' | 'commissions' | 'challenges') => {
    if (!user) return;

    setShowPaymentSourceModal(false);

    // Validate source balance
    const sourceBalance = 
      source === 'purchased' ? availableBalances.mxiPurchasedDirectly :
      source === 'commissions' ? availableBalances.mxiFromUnifiedCommissions :
      availableBalances.mxiFromChallenges;

    if (sourceBalance < pendingWager) {
      Alert.alert(
        'Insufficient Balance',
        `You need ${pendingWager} MXI from ${
          source === 'purchased' ? 'direct purchases' :
          source === 'commissions' ? 'unified commissions' :
          'challenge winnings'
        }. Available: ${sourceBalance.toFixed(2)} MXI`
      );
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
          Alert.alert('❌ User Not Found', 'No user found with that referral code.');
          setLoading(false);
          return;
        }

        if (opponentData.id === user.id) {
          Alert.alert('⚠️ Invalid Challenge', 'You cannot challenge yourself.');
          setLoading(false);
          return;
        }

        opponentId = opponentData.id;
      }

      // Deduct wager using restricted balance function
      const { data: deductResult, error: deductError } = await supabase
        .rpc('deduct_challenge_balance', {
          p_user_id: user.id,
          p_amount: pendingWager,
          p_source: source,
        });

      if (deductError || !deductResult) {
        Alert.alert('❌ Error', 'Failed to deduct balance. Please try again.');
        setLoading(false);
        return;
      }

      const totalPot = opponentId ? pendingWager * 2 : pendingWager;
      const prizeAmount = totalPot * 0.90;
      const adminFee = totalPot * 0.10;

      const { data: battleData, error: battleError } = await supabase
        .from('tap_duo_battles')
        .insert({
          challenger_id: user.id,
          opponent_id: opponentId,
          wager_amount: pendingWager,
          total_pot: totalPot,
          prize_amount: prizeAmount,
          admin_fee: adminFee,
          challenge_type: challengeType,
          status: opponentId ? 'matched' : 'waiting',
          expires_at: null,
        })
        .select()
        .single();

      if (battleError) {
        throw battleError;
      }

      if (opponentId) {
        await supabase.rpc('deduct_challenge_balance', {
          p_user_id: opponentId,
          p_amount: pendingWager,
          p_source: source,
        });

        await supabase.from('tap_duo_notifications').insert({
          user_id: opponentId,
          battle_id: battleData.id,
          notification_type: 'challenge_received',
          title: '⚔️ Battle Challenge!',
          message: `${user.name} has challenged you to a ${pendingWager} MXI battle!`,
        });
      }

      Alert.alert(
        '✅ Challenge Created!',
        challengeType === 'friend'
          ? '🎯 Your friend has been notified!'
          : '⏳ Waiting for an opponent to accept...'
      );

      setReferralCode('');
      loadActiveBattle();
      loadAvailableBalances();
    } catch (error) {
      console.error('Error creating challenge:', error);
      Alert.alert('❌ Error', 'Failed to create challenge. Please try again.');
    } finally {
      setLoading(false);
      setIsCreatingChallenge(false);
    }
  };

  const handleAcceptChallenge = async (battle: Battle) => {
    if (!user) return;

    if (availableBalances.total < battle.wager_amount) {
      Alert.alert(
        '💰 Insufficient Balance', 
        `You need ${battle.wager_amount} MXI from USDT purchases, referral commissions, or challenge winnings.\n\nAvailable: ${availableBalances.total.toFixed(2)} MXI`
      );
      return;
    }

    // Store battle wager and show payment source modal
    setPendingWager(battle.wager_amount);
    setPendingBattle(battle);
    setIsCreatingChallenge(false);
    setShowPaymentSourceModal(true);
  };

  const proceedWithAcceptChallenge = async (source: 'purchased' | 'commissions' | 'challenges') => {
    if (!user || !pendingBattle) return;

    setShowPaymentSourceModal(false);

    // Validate source balance
    const sourceBalance = 
      source === 'purchased' ? availableBalances.mxiPurchasedDirectly :
      source === 'commissions' ? availableBalances.mxiFromUnifiedCommissions :
      availableBalances.mxiFromChallenges;

    if (sourceBalance < pendingBattle.wager_amount) {
      Alert.alert(
        'Insufficient Balance',
        `You need ${pendingBattle.wager_amount} MXI from ${
          source === 'purchased' ? 'direct purchases' :
          source === 'commissions' ? 'unified commissions' :
          'challenge winnings'
        }. Available: ${sourceBalance.toFixed(2)} MXI`
      );
      return;
    }

    setLoading(true);

    try {
      const { data: deductResult, error: deductError } = await supabase
        .rpc('deduct_challenge_balance', {
          p_user_id: user.id,
          p_amount: pendingBattle.wager_amount,
          p_source: source,
        });

      if (deductError || !deductResult) {
        Alert.alert('❌ Error', 'Failed to deduct balance. Please try again.');
        setLoading(false);
        return;
      }

      const totalPot = pendingBattle.wager_amount * 2;
      const prizeAmount = totalPot * 0.90;
      const adminFee = totalPot * 0.10;

      const { error: battleError } = await supabase
        .from('tap_duo_battles')
        .update({
          opponent_id: user.id,
          total_pot: totalPot,
          prize_amount: prizeAmount,
          admin_fee: adminFee,
          status: 'matched',
        })
        .eq('id', pendingBattle.id);

      if (battleError) {
        throw battleError;
      }

      await supabase.from('tap_duo_notifications').insert({
        user_id: pendingBattle.challenger_id,
        battle_id: pendingBattle.id,
        notification_type: 'battle_matched',
        title: '✅ Battle Matched!',
        message: `${user.name} has accepted your challenge!`,
      });

      Alert.alert('✅ Challenge Accepted!', '🎮 Get ready to tap! You have 10 minutes to complete the challenge.');
      loadActiveBattle();
      loadWaitingBattles();
      loadAvailableBalances();
      setPendingBattle(null);
    } catch (error) {
      console.error('Error accepting challenge:', error);
      Alert.alert('❌ Error', 'Failed to accept challenge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startGame = () => {
    if (!activeBattle) return;

    setIsPlaying(true);
    setClicks(0);
    setTimeLeft(10);

    // Stop participation timer when game starts
    if (participationTimerRef.current) {
      clearInterval(participationTimerRef.current);
    }

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

    if (!activeBattle || !user) return;

    try {
      const isChallenger = activeBattle.challenger_id === user.id;
      const updateData: any = {
        status: 'in_progress',
      };

      if (isChallenger) {
        updateData.challenger_clicks = clicks;
        updateData.challenger_finished_at = new Date().toISOString();
      } else {
        updateData.opponent_clicks = clicks;
        updateData.opponent_finished_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('tap_duo_battles')
        .update(updateData)
        .eq('id', activeBattle.id);

      if (error) {
        throw error;
      }

      const opponentId = isChallenger ? activeBattle.opponent_id : activeBattle.challenger_id;
      const opponentFinished = isChallenger
        ? activeBattle.opponent_finished_at
        : activeBattle.challenger_finished_at;

      if (opponentId && !opponentFinished) {
        await supabase.from('tap_duo_notifications').insert({
          user_id: opponentId,
          battle_id: activeBattle.id,
          notification_type: 'opponent_finished',
          title: '⏱️ Opponent Finished!',
          message: `Your opponent scored ${clicks} clicks! Your turn!`,
        });
      }

      Alert.alert('⏰ Time\'s Up!', `You scored ${clicks} clicks! 👆`);
      loadActiveBattle();
    } catch (error) {
      console.error('Error ending game:', error);
      Alert.alert('❌ Error', 'Failed to save your score. Please try again.');
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
            <Text style={styles.resultEmoji}>
              {isWinner ? '🏆' : isTie ? '🤝' : '😔'}
            </Text>
            <Text style={styles.battleTitle}>
              {isWinner ? 'You Won!' : isTie ? 'It\'s a Tie!' : 'You Lost'}
            </Text>
            {activeBattle.cancellation_reason && (
              <Text style={styles.cancellationReason}>
                {activeBattle.cancellation_reason}
              </Text>
            )}
          </View>

          <View style={styles.scoreContainer}>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreName}>{activeBattle.challenger_name}</Text>
              <Text style={styles.scoreCode}>🎫 {activeBattle.challenger_referral_code}</Text>
              <Text style={styles.scoreValue}>{activeBattle.challenger_clicks}</Text>
              <Text style={styles.scoreLabel}>clicks 👆</Text>
            </View>
            <Text style={styles.vsText}>VS</Text>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreName}>{activeBattle.opponent_name}</Text>
              <Text style={styles.scoreCode}>🎫 {activeBattle.opponent_referral_code}</Text>
              <Text style={styles.scoreValue}>{activeBattle.opponent_clicks}</Text>
              <Text style={styles.scoreLabel}>clicks 👆</Text>
            </View>
          </View>

          {isWinner && (
            <View style={styles.prizeContainer}>
              <Text style={styles.prizeLabel}>💰 Prize Won (90%)</Text>
              <Text style={styles.prizeAmount}>{activeBattle.prize_amount.toFixed(2)} MXI</Text>
              <Text style={styles.prizeNote}>⚠️ Requires 5 active referrals to withdraw</Text>
            </View>
          )}

          {isTie && (
            <View style={styles.prizeContainer}>
              <Text style={styles.prizeLabel}>💵 Wager Refunded</Text>
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
            <Text style={buttonStyles.primaryText}>🎮 Start New Battle</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (activeBattle.status === 'waiting') {
      return (
        <View style={[commonStyles.card, styles.battleCard]}>
          <View style={styles.battleHeader}>
            <Text style={styles.resultEmoji}>⏳</Text>
            <Text style={styles.battleTitle}>Waiting for Opponent</Text>
          </View>
          <Text style={styles.battleSubtitle}>
            💰 Wager: {activeBattle.wager_amount} MXI
          </Text>
          <Text style={styles.infoText}>
            Waiting for an opponent to accept your challenge
          </Text>
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
          
          {isChallenger && (
            <TouchableOpacity
              style={[buttonStyles.outline, styles.cancelButton]}
              onPress={handleCancelChallenge}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Text style={buttonStyles.outlineText}>Cancel Challenge</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      );
    }

    if (hasFinished) {
      return (
        <View style={[commonStyles.card, styles.battleCard]}>
          <View style={styles.battleHeader}>
            <Text style={styles.resultEmoji}>✅</Text>
            <Text style={styles.battleTitle}>You Finished!</Text>
          </View>
          <Text style={styles.battleSubtitle}>
            Your Score: {isChallenger ? activeBattle.challenger_clicks : activeBattle.opponent_clicks} clicks 👆
          </Text>
          {!opponentFinished && (
            <React.Fragment>
              <Text style={styles.waitingText}>⏳ Waiting for opponent to finish...</Text>
              <Text style={styles.timerWarning}>
                ⚠️ Opponent has {formatParticipationTime(participationTimeLeft)} to complete
              </Text>
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
              
              {participationTimeLeft <= 0 && (
                <TouchableOpacity
                  style={[buttonStyles.outline, { marginTop: 20 }]}
                  onPress={handleCancelChallenge}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                    <Text style={buttonStyles.outlineText}>Claim Win (Opponent Timeout)</Text>
                  )}
                </TouchableOpacity>
              )}
            </React.Fragment>
          )}
        </View>
      );
    }

    if (isPlaying) {
      return (
        <View style={[commonStyles.card, styles.battleCard]}>
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>⏱️ {timeLeft}</Text>
            <Text style={styles.timerLabel}>seconds left</Text>
          </View>

          <View style={styles.clicksContainer}>
            <Text style={styles.clicksText}>{clicks}</Text>
            <Text style={styles.clicksLabel}>clicks 👆</Text>
          </View>

          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              style={styles.tapButton}
              onPress={handleClick}
              activeOpacity={0.8}
            >
              <Text style={styles.tapButtonEmoji}>👆</Text>
              <Text style={styles.tapButtonText}>TAP!</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      );
    }

    return (
      <View style={[commonStyles.card, styles.battleCard]}>
        <View style={styles.battleHeader}>
          <Text style={styles.resultEmoji}>⚡</Text>
          <Text style={styles.battleTitle}>Battle Ready!</Text>
        </View>
        <Text style={styles.battleSubtitle}>
          💰 Wager: {activeBattle.wager_amount} MXI
        </Text>
        <Text style={styles.battleSubtitle}>
          🏆 Prize (90%): {activeBattle.prize_amount.toFixed(2)} MXI
        </Text>
        
        {participationTimeLeft > 0 && (
          <View style={styles.participationTimer}>
            <Text style={styles.participationTimerLabel}>⏰ Time to Start:</Text>
            <Text style={styles.participationTimerValue}>
              {formatParticipationTime(participationTimeLeft)}
            </Text>
            <Text style={styles.participationTimerWarning}>
              ⚠️ Start within 10 minutes or score will be 0
            </Text>
          </View>
        )}
        
        <Text style={styles.battleInfo}>
          👆 Tap as fast as you can for 10 seconds!
        </Text>
        <TouchableOpacity
          style={[buttonStyles.primary, styles.startButton]}
          onPress={startGame}
        >
          <Text style={buttonStyles.primaryText}>🎮 Start Tapping!</Text>
        </TouchableOpacity>
        
        {participationTimeLeft <= 0 && (
          <TouchableOpacity
            style={[buttonStyles.outline, { marginTop: 12 }]}
            onPress={handleCancelChallenge}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={buttonStyles.outlineText}>Cancel (Timeout)</Text>
            )}
          </TouchableOpacity>
        )}
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
        <Text style={styles.headerTitle}>⚔️ XMI Tap Duo</Text>
        <View style={styles.headerRight}>
          {notifications.length > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>{notifications.length}</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Balance Card */}
        <View style={[commonStyles.card, styles.balanceCard]}>
          <Text style={styles.balanceLabel}>💰 Available for Challenges</Text>
          <Text style={styles.balanceAmount}>{availableBalances.total.toFixed(2)} MXI</Text>
          <Text style={styles.balanceNote}>
            ℹ️ From USDT purchases, referral commissions & challenge winnings
          </Text>
        </View>

        {/* Active Challenges Notification */}
        {waitingBattles.length > 0 && !activeBattle && (
          <View style={[commonStyles.card, styles.activeNotification]}>
            <Text style={styles.notificationEmoji}>🔔</Text>
            <Text style={styles.notificationTitle}>
              {waitingBattles.length} Active Challenge{waitingBattles.length > 1 ? 's' : ''} Available!
            </Text>
            <Text style={styles.notificationText}>
              Scroll down to accept and compete 👇
            </Text>
          </View>
        )}

        {activeBattle ? (
          renderActiveBattle()
        ) : (
          <React.Fragment>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎯 Create Challenge</Text>
              <TouchableOpacity
                style={[buttonStyles.primary, styles.challengeButton]}
                onPress={() => {
                  setChallengeType('friend');
                  setShowChallengeModal(true);
                }}
              >
                <Text style={styles.buttonEmoji}>👥</Text>
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
                <Text style={styles.buttonEmoji}>🎲</Text>
                <Text style={[buttonStyles.secondaryText, { marginLeft: 8 }]}>
                  Random Opponent
                </Text>
              </TouchableOpacity>
            </View>

            {waitingBattles.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>⚔️ Available Battles</Text>
                {waitingBattles.map((battle, index) => (
                  <View key={index} style={[commonStyles.card, styles.waitingBattleCard]}>
                    <View style={styles.waitingBattleInfo}>
                      <Text style={styles.waitingBattleName}>
                        👤 {battle.challenger_name}
                      </Text>
                      <Text style={styles.waitingBattleCode}>
                        🎫 {battle.challenger?.referral_code}
                      </Text>
                      <Text style={styles.waitingBattleWager}>
                        💰 Wager: {battle.wager_amount} MXI
                      </Text>
                      <Text style={styles.waitingBattlePrize}>
                        🏆 Prize (90%): {(battle.wager_amount * 2 * 0.90).toFixed(2)} MXI
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[buttonStyles.primary, styles.acceptButton]}
                      onPress={() => handleAcceptChallenge(battle)}
                      disabled={loading}
                    >
                      <Text style={buttonStyles.primaryText}>✅ Accept</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </React.Fragment>
        )}

        <View style={[commonStyles.card, styles.infoCard]}>
          <Text style={styles.infoTitle}>ℹ️ How to Play</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>1️⃣</Text>
            <Text style={styles.infoText}>Choose your wager (1-2000 MXI)</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>2️⃣</Text>
            <Text style={styles.infoText}>Select payment source: purchased MXI, commissions, or challenge winnings</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>3️⃣</Text>
            <Text style={styles.infoText}>Challenge a friend or find a random opponent</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>4️⃣</Text>
            <Text style={styles.infoText}>You have 10 minutes to start the challenge after matching</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>5️⃣</Text>
            <Text style={styles.infoText}>Tap as fast as you can for 10 seconds 👆</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>6️⃣</Text>
            <Text style={styles.infoText}>Winner takes 90% of the pot! 🏆</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>⚠️</Text>
            <Text style={styles.infoText}>If you don&apos;t start within 10 minutes, your score will be 0 and you&apos;ll forfeit</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>🚫</Text>
            <Text style={styles.infoText}>You can cancel waiting challenges anytime, or claim win after 10 minutes if opponent doesn&apos;t participate</Text>
          </View>
        </View>
      </ScrollView>

      {/* Challenge Creation Modal */}
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
                {challengeType === 'friend' ? '👥 Challenge a Friend' : '🎲 Random Battle'}
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
              <Text style={styles.inputLabel}>💰 Wager Amount (MXI)</Text>
              <TextInput
                style={styles.input}
                value={wagerAmount}
                onChangeText={setWagerAmount}
                keyboardType="numeric"
                placeholder="Enter amount (1-2000)"
                placeholderTextColor={colors.textSecondary}
              />
              <Text style={styles.balanceInfo}>
                Available: {availableBalances.total.toFixed(2)} MXI
              </Text>

              {challengeType === 'friend' && (
                <React.Fragment>
                  <Text style={styles.inputLabel}>🎫 Friend&apos;s Referral Code</Text>
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
                <Text style={styles.prizePreviewLabel}>🏆 Potential Prize (90%)</Text>
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
                  <Text style={buttonStyles.primaryText}>🎮 Create Challenge</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
                Choose which balance to use for the {pendingWager} MXI wager:
              </Text>

              <TouchableOpacity
                style={[
                  styles.sourceOption,
                  availableBalances.mxiPurchasedDirectly < pendingWager && styles.sourceOptionDisabled,
                ]}
                onPress={() => isCreatingChallenge ? proceedWithCreateChallenge('purchased') : proceedWithAcceptChallenge('purchased')}
                disabled={availableBalances.mxiPurchasedDirectly < pendingWager}
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
                  availableBalances.mxiFromUnifiedCommissions < pendingWager && styles.sourceOptionDisabled,
                ]}
                onPress={() => isCreatingChallenge ? proceedWithCreateChallenge('commissions') : proceedWithAcceptChallenge('commissions')}
                disabled={availableBalances.mxiFromUnifiedCommissions < pendingWager}
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
                  availableBalances.mxiFromChallenges < pendingWager && styles.sourceOptionDisabled,
                ]}
                onPress={() => isCreatingChallenge ? proceedWithCreateChallenge('challenges') : proceedWithAcceptChallenge('challenges')}
                disabled={availableBalances.mxiFromChallenges < pendingWager}
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
  balanceNote: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  balanceInfo: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  activeNotification: {
    backgroundColor: colors.primary + '20',
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: 20,
    alignItems: 'center',
  },
  notificationEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  notificationText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
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
  buttonEmoji: {
    fontSize: 20,
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
  resultEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  battleTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  cancellationReason: {
    fontSize: 12,
    color: colors.warning,
    marginTop: 8,
    textAlign: 'center',
  },
  battleSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  battleInfo: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
  startButton: {
    width: '100%',
  },
  cancelButton: {
    width: '100%',
    marginTop: 16,
  },
  participationTimer: {
    backgroundColor: colors.warning + '20',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    alignItems: 'center',
    width: '100%',
  },
  participationTimerLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  participationTimerValue: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.warning,
    marginBottom: 8,
  },
  participationTimerWarning: {
    fontSize: 12,
    color: colors.warning,
    textAlign: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 64,
    fontWeight: '700',
    color: colors.primary,
  },
  timerLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  timerWarning: {
    fontSize: 12,
    color: colors.warning,
    marginTop: 8,
    textAlign: 'center',
  },
  clicksContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  clicksText: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.text,
  },
  clicksLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  tapButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tapButtonEmoji: {
    fontSize: 64,
  },
  tapButtonText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
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
    marginBottom: 4,
  },
  scoreCode: {
    fontSize: 12,
    color: colors.primary,
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
  prizeNote: {
    fontSize: 12,
    color: colors.warning,
    marginTop: 8,
    textAlign: 'center',
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
  waitingBattleCode: {
    fontSize: 12,
    color: colors.primary,
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
    alignItems: 'flex-start',
  },
  infoBullet: {
    fontSize: 16,
    marginRight: 12,
    width: 24,
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
    marginBottom: 8,
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
