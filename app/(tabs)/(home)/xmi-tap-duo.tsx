
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
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [waitingBattles, setWaitingBattles] = useState<Battle[]>([]);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    requestNotificationPermissions();
    loadActiveBattle();
    loadWaitingBattles();
    loadNotifications();
    setupRealtimeSubscription();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

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
    // Subscribe to battle updates
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

    // Subscribe to notifications
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
          
          // Show local notification
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
          challenger:users!tap_duo_battles_challenger_id_fkey(name),
          opponent:users!tap_duo_battles_opponent_id_fkey(name)
        `)
        .or(`challenger_id.eq.${user.id},opponent_id.eq.${user.id}`)
        .in('status', ['waiting', 'matched', 'in_progress'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

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
        .from('tap_duo_battles')
        .select(`
          *,
          challenger:users!tap_duo_battles_challenger_id_fkey(name)
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

    setLoading(true);

    try {
      let opponentId = null;

      // If challenging a friend, find them by referral code
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

      // Create battle
      const { data: battleData, error: battleError } = await supabase
        .from('tap_duo_battles')
        .insert({
          challenger_id: user.id,
          opponent_id: opponentId,
          wager_amount: wager,
          challenge_type: challengeType,
          status: opponentId ? 'matched' : 'waiting',
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        })
        .select()
        .single();

      if (battleError) {
        throw battleError;
      }

      // If challenging a friend, create notification
      if (opponentId) {
        await supabase.from('tap_duo_notifications').insert({
          user_id: opponentId,
          battle_id: battleData.id,
          notification_type: 'challenge_received',
          title: 'Battle Challenge!',
          message: `${user.name} has challenged you to a ${wager} MXI battle!`,
        });

        // Deduct opponent's wager
        await supabase.rpc('deduct_user_balance', {
          p_user_id: opponentId,
          p_amount: wager,
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

      // Update battle with opponent
      const { error: battleError } = await supabase
        .from('tap_duo_battles')
        .update({
          opponent_id: user.id,
          status: 'matched',
        })
        .eq('id', battle.id);

      if (battleError) {
        throw battleError;
      }

      // Notify challenger
      await supabase.from('tap_duo_notifications').insert({
        user_id: battle.challenger_id,
        battle_id: battle.id,
        notification_type: 'battle_matched',
        title: 'Battle Matched!',
        message: `${user.name} has accepted your challenge!`,
      });

      Alert.alert('Challenge Accepted!', 'Get ready to tap!');
      loadActiveBattle();
      loadWaitingBattles();
    } catch (error) {
      console.error('Error accepting challenge:', error);
      Alert.alert('Error', 'Failed to accept challenge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startGame = () => {
    if (!activeBattle) return;

    setIsPlaying(true);
    setClicks(0);
    setTimeLeft(10);

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

      // Notify opponent if they haven't finished yet
      const opponentId = isChallenger ? activeBattle.opponent_id : activeBattle.challenger_id;
      const opponentFinished = isChallenger
        ? activeBattle.opponent_finished_at
        : activeBattle.challenger_finished_at;

      if (opponentId && !opponentFinished) {
        await supabase.from('tap_duo_notifications').insert({
          user_id: opponentId,
          battle_id: activeBattle.id,
          notification_type: 'opponent_finished',
          title: 'Opponent Finished!',
          message: `Your opponent scored ${clicks} clicks! Your turn!`,
        });
      }

      Alert.alert('Time\'s Up!', `You scored ${clicks} clicks!`);
      loadActiveBattle();
    } catch (error) {
      console.error('Error ending game:', error);
      Alert.alert('Error', 'Failed to save your score. Please try again.');
    }
  };

  const handleClick = () => {
    if (!isPlaying) return;

    setClicks((prev) => prev + 1);

    // Animate button
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
              <Text style={styles.scoreValue}>{activeBattle.challenger_clicks}</Text>
              <Text style={styles.scoreLabel}>clicks</Text>
            </View>
            <Text style={styles.vsText}>VS</Text>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreName}>{activeBattle.opponent_name}</Text>
              <Text style={styles.scoreValue}>{activeBattle.opponent_clicks}</Text>
              <Text style={styles.scoreLabel}>clicks</Text>
            </View>
          </View>

          {isWinner && (
            <View style={styles.prizeContainer}>
              <Text style={styles.prizeLabel}>Prize Won</Text>
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
          <Text style={styles.battleSubtitle}>Your Score: {isChallenger ? activeBattle.challenger_clicks : activeBattle.opponent_clicks} clicks</Text>
          {!opponentFinished && (
            <>
              <Text style={styles.waitingText}>Waiting for opponent to finish...</Text>
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
            </>
          )}
        </View>
      );
    }

    if (isPlaying) {
      return (
        <View style={[commonStyles.card, styles.battleCard]}>
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{timeLeft}</Text>
            <Text style={styles.timerLabel}>seconds left</Text>
          </View>

          <View style={styles.clicksContainer}>
            <Text style={styles.clicksText}>{clicks}</Text>
            <Text style={styles.clicksLabel}>clicks</Text>
          </View>

          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              style={styles.tapButton}
              onPress={handleClick}
              activeOpacity={0.8}
            >
              <IconSymbol
                ios_icon_name="hand.tap.fill"
                android_material_icon_name="touch_app"
                size={64}
                color="#FFFFFF"
              />
              <Text style={styles.tapButtonText}>TAP!</Text>
            </TouchableOpacity>
          </Animated.View>
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
          Prize: {activeBattle.prize_amount.toFixed(2)} MXI
        </Text>
        <Text style={styles.battleInfo}>
          Tap as fast as you can for 10 seconds!
        </Text>
        <TouchableOpacity
          style={[buttonStyles.primary, styles.startButton]}
          onPress={startGame}
        >
          <Text style={buttonStyles.primaryText}>Start Tapping!</Text>
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
        <Text style={styles.headerTitle}>XMI Tap Duo</Text>
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
          <Text style={styles.balanceLabel}>Your MXI Balance</Text>
          <Text style={styles.balanceAmount}>{user?.mxiBalance.toFixed(2) || '0.00'} MXI</Text>
        </View>

        {/* Active Battle */}
        {activeBattle ? (
          renderActiveBattle()
        ) : (
          <>
            {/* Create Challenge Buttons */}
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

            {/* Waiting Battles */}
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
                        Prize: {(battle.wager_amount * 2 * 0.95).toFixed(2)} MXI
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
          </>
        )}

        {/* How to Play */}
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
            <Text style={styles.infoText}>Tap as fast as you can for 10 seconds</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>4.</Text>
            <Text style={styles.infoText}>Winner takes 95% of the pot!</Text>
          </View>
        </View>
      </ScrollView>

      {/* Challenge Modal */}
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
                <>
                  <Text style={styles.inputLabel}>Friend's Referral Code</Text>
                  <TextInput
                    style={styles.input}
                    value={referralCode}
                    onChangeText={setReferralCode}
                    placeholder="Enter or paste referral code"
                    placeholderTextColor={colors.textSecondary}
                    autoCapitalize="none"
                  />
                </>
              )}

              <View style={styles.prizePreview}>
                <Text style={styles.prizePreviewLabel}>Potential Prize</Text>
                <Text style={styles.prizePreviewAmount}>
                  {(parseFloat(wagerAmount || '0') * 2 * 0.95).toFixed(2)} MXI
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
  modalButton: {
    width: '100%',
  },
});
