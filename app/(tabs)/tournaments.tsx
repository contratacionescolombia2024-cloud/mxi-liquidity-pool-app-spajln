
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useLanguage } from '@/contexts/LanguageContext';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { showConfirm, showAlert } from '@/utils/confirmDialog';

interface TournamentGame {
  id: string;
  game_type: string;
  name: string;
  description: string;
  entry_fee: number;
  min_players: number;
  max_players: number;
  winner_percentage: number;
  is_active: boolean;
}

interface WaitingSession {
  id: string;
  session_code: string;
  num_players: number;
  total_pool: number;
  prize_amount: number;
  created_at: string;
  tournament_games: {
    id: string;
    name: string;
    game_type: string;
    entry_fee: number;
  };
  participant_count: number;
  participants: Array<{
    user_id: string;
    users: {
      name: string;
    };
  }>;
}

const GAME_ICONS = {
  tank_arena: { ios: 'shield.fill', android: 'security' },
  mini_cars: { ios: 'car.fill', android: 'directions_car' },
  shooter_retro: { ios: 'scope', android: 'gps_fixed' },
  dodge_arena: { ios: 'bolt.fill', android: 'flash_on' },
  bomb_runner: { ios: 'flame.fill', android: 'whatshot' },
};

export default function TournamentsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [games, setGames] = useState<TournamentGame[]>([]);
  const [waitingSessions, setWaitingSessions] = useState<WaitingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableMXI, setAvailableMXI] = useState(0);
  const [joining, setJoining] = useState(false);
  const [showPlayerSelector, setShowPlayerSelector] = useState(false);
  const [selectedGame, setSelectedGame] = useState<TournamentGame | null>(null);
  const [selectedPlayerCount, setSelectedPlayerCount] = useState<number>(2);

  useEffect(() => {
    console.log('[Tournaments] Mounted - User:', user?.id);
    if (user) {
      loadData();
      
      // Subscribe to real-time updates for sessions
      const channel = supabase
        .channel('tournament_updates')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'game_sessions' },
          () => {
            console.log('[Tournaments] Session update detected');
            loadWaitingSessions();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'game_participants' },
          () => {
            console.log('[Tournaments] Participant update detected');
            loadWaitingSessions();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const loadData = async () => {
    try {
      // Load games
      const { data: gamesData, error: gamesError } = await supabase
        .from('tournament_games')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (gamesError) throw gamesError;
      setGames(gamesData || []);

      // Load balance
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('mxi_from_unified_commissions, mxi_from_challenges')
        .eq('id', user!.id)
        .single();

      if (userError) throw userError;
      const total = (userData.mxi_from_unified_commissions || 0) + (userData.mxi_from_challenges || 0);
      setAvailableMXI(total);

      // Load waiting sessions
      await loadWaitingSessions();
    } catch (error) {
      console.error('[Tournaments] Load error:', error);
      showAlert(t('error'), t('availableGames'), undefined, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadWaitingSessions = async () => {
    try {
      // Get all waiting sessions with participant counts
      const { data: sessions, error } = await supabase
        .from('game_sessions')
        .select(`
          id,
          session_code,
          num_players,
          total_pool,
          prize_amount,
          created_at,
          tournament_games (
            id,
            name,
            game_type,
            entry_fee
          ),
          game_participants (
            user_id,
            users (
              name
            )
          )
        `)
        .eq('status', 'waiting')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter sessions that have available spots
      const availableSessions = (sessions || [])
        .map((session: any) => ({
          ...session,
          participant_count: session.game_participants?.length || 0,
          participants: session.game_participants || [],
        }))
        .filter((session: any) => session.participant_count < session.num_players);

      console.log('[Tournaments] Loaded waiting sessions:', availableSessions.length);
      setWaitingSessions(availableSessions);
    } catch (error) {
      console.error('[Tournaments] Error loading waiting sessions:', error);
    }
  };

  const joinExistingSession = async (session: WaitingSession) => {
    if (joining) return;

    console.log('[Tournaments] Joining existing session:', session.id);

    // Check if user is already in this session
    const isAlreadyInSession = session.participants.some(p => p.user_id === user!.id);
    if (isAlreadyInSession) {
      showAlert(
        t('error'),
        'Ya estás en este torneo',
        undefined,
        'warning'
      );
      return;
    }

    // Check balance
    if (availableMXI < session.tournament_games.entry_fee) {
      showAlert(
        t('insufficientBalance'),
        t('insufficientBalanceNeed', { 
          needed: session.tournament_games.entry_fee, 
          available: availableMXI.toFixed(2) 
        }),
        undefined,
        'warning'
      );
      return;
    }

    const spotsLeft = session.num_players - session.participant_count;
    const message = `${t('joinTournament')}\n\n🎮 ${session.tournament_games.name}\n👥 ${session.participant_count}/${session.num_players} ${t('players')}\n💰 ${session.tournament_games.entry_fee} MXI\n🏆 ${t('prize')}: ${session.prize_amount.toFixed(2)} MXI\n\n${spotsLeft} ${spotsLeft === 1 ? 'cupo disponible' : 'cupos disponibles'}`;

    showConfirm({
      title: t('joinTournament'),
      message: message,
      confirmText: t('continue'),
      cancelText: t('cancel'),
      type: 'info',
      icon: {
        ios: 'gamecontroller.fill',
        android: 'sports_esports',
      },
      onConfirm: () => executeJoinExisting(session),
      onCancel: () => {
        console.log('Join cancelled');
      },
    });
  };

  const executeJoinExisting = async (session: WaitingSession) => {
    setJoining(true);
    
    try {
      console.log('[Tournaments] EXECUTE JOIN EXISTING SESSION:', session.id);
      
      // 1. Get player number
      const { data: participants } = await supabase
        .from('game_participants')
        .select('player_number')
        .eq('session_id', session.id)
        .order('player_number', { ascending: false })
        .limit(1);

      const playerNumber = participants && participants.length > 0 
        ? participants[0].player_number + 1 
        : 1;

      console.log('[Tournaments] Player number:', playerNumber);

      // 2. Deduct balance
      const { data: userData } = await supabase
        .from('users')
        .select('mxi_from_unified_commissions, mxi_from_challenges')
        .eq('id', user!.id)
        .single();

      let remaining = session.tournament_games.entry_fee;
      let newCommissions = userData!.mxi_from_unified_commissions || 0;
      let newChallenges = userData!.mxi_from_challenges || 0;

      if (newCommissions >= remaining) {
        newCommissions -= remaining;
        remaining = 0;
      } else {
        remaining -= newCommissions;
        newCommissions = 0;
      }

      if (remaining > 0) {
        newChallenges -= remaining;
      }

      if (newChallenges < 0) {
        throw new Error(t('insufficientBalance'));
      }

      const { error: balanceError } = await supabase
        .from('users')
        .update({
          mxi_from_unified_commissions: newCommissions,
          mxi_from_challenges: newChallenges
        })
        .eq('id', user!.id);

      if (balanceError) throw balanceError;
      console.log('[Tournaments] Balance updated');

      // 3. Add participant
      const { error: participantError } = await supabase
        .from('game_participants')
        .insert({
          session_id: session.id,
          user_id: user!.id,
          player_number: playerNumber,
          entry_paid: true
        });

      if (participantError) {
        // Rollback balance
        await supabase
          .from('users')
          .update({
            mxi_from_unified_commissions: userData!.mxi_from_unified_commissions,
            mxi_from_challenges: userData!.mxi_from_challenges
          })
          .eq('id', user!.id);
        throw participantError;
      }

      console.log('[Tournaments] Participant added');

      // 4. Update pool
      const newPool = session.total_pool + session.tournament_games.entry_fee;
      const prizeAmount = newPool * 0.9;

      await supabase
        .from('game_sessions')
        .update({
          total_pool: newPool,
          prize_amount: prizeAmount
        })
        .eq('id', session.id);

      console.log('[Tournaments] Pool updated');

      // 5. Navigate to lobby
      console.log('[Tournaments] NAVIGATING TO LOBBY');
      router.push({
        pathname: '/game-lobby',
        params: { 
          sessionId: session.id, 
          gameType: session.tournament_games.game_type 
        }
      });

    } catch (error: any) {
      console.error('[Tournaments] JOIN ERROR:', error);
      showAlert(t('error'), error.message || t('joiningGame'), undefined, 'error');
    } finally {
      setJoining(false);
    }
  };

  const createNewTournament = async (game: TournamentGame) => {
    if (joining) return;
    
    console.log('[Tournaments] CREATE NEW TOURNAMENT:', game.name, game.id);
    
    // Check balance
    if (availableMXI < game.entry_fee) {
      showAlert(
        t('insufficientBalance'),
        t('insufficientBalanceNeed', { needed: game.entry_fee, available: availableMXI.toFixed(2) }),
        undefined,
        'warning'
      );
      return;
    }

    // Show player count selector
    setSelectedGame(game);
    setSelectedPlayerCount(2);
    setShowPlayerSelector(true);
  };

  const confirmCreate = (game: TournamentGame, playerCount: number) => {
    const message = t('createTournamentOf', { count: playerCount }) + ` ${t('participateFor', { fee: game.entry_fee })}?\n\n🏆 ${t('prize')}: 90% del pool\n👥 ${playerCount} ${t('players')}`;

    showConfirm({
      title: game.name,
      message: message,
      confirmText: t('continue'),
      cancelText: t('cancel'),
      type: 'info',
      icon: {
        ios: 'gamecontroller.fill',
        android: 'sports_esports',
      },
      onConfirm: () => executeCreate(game, playerCount),
      onCancel: () => {
        console.log('Create cancelled');
      },
    });
  };

  const executeCreate = async (game: TournamentGame, playerCount: number) => {
    setJoining(true);
    setShowPlayerSelector(false);
    
    try {
      console.log('[Tournaments] EXECUTE CREATE NEW SESSION with', playerCount, 'players');
      
      // 1. Create new session
      const { data: newSession, error: createError } = await supabase
        .from('game_sessions')
        .insert({
          game_id: game.id,
          session_code: `${game.game_type.toUpperCase()}-${Date.now().toString(36)}`,
          num_players: playerCount,
          status: 'waiting',
          total_pool: 0,
          prize_amount: 0
        })
        .select()
        .single();

      if (createError) throw createError;
      const sessionId = newSession.id;
      console.log('[Tournaments] Created session:', sessionId, 'with', newSession.num_players, 'players');

      // 2. Deduct balance
      const { data: userData } = await supabase
        .from('users')
        .select('mxi_from_unified_commissions, mxi_from_challenges')
        .eq('id', user!.id)
        .single();

      let remaining = game.entry_fee;
      let newCommissions = userData!.mxi_from_unified_commissions || 0;
      let newChallenges = userData!.mxi_from_challenges || 0;

      if (newCommissions >= remaining) {
        newCommissions -= remaining;
        remaining = 0;
      } else {
        remaining -= newCommissions;
        newCommissions = 0;
      }

      if (remaining > 0) {
        newChallenges -= remaining;
      }

      if (newChallenges < 0) {
        throw new Error(t('insufficientBalance'));
      }

      const { error: balanceError } = await supabase
        .from('users')
        .update({
          mxi_from_unified_commissions: newCommissions,
          mxi_from_challenges: newChallenges
        })
        .eq('id', user!.id);

      if (balanceError) throw balanceError;
      console.log('[Tournaments] Balance updated');

      // 3. Add participant
      const { error: participantError } = await supabase
        .from('game_participants')
        .insert({
          session_id: sessionId,
          user_id: user!.id,
          player_number: 1,
          entry_paid: true
        });

      if (participantError) {
        // Rollback balance
        await supabase
          .from('users')
          .update({
            mxi_from_unified_commissions: userData!.mxi_from_unified_commissions,
            mxi_from_challenges: userData!.mxi_from_challenges
          })
          .eq('id', user!.id);
        throw participantError;
      }

      console.log('[Tournaments] Participant added');

      // 4. Update pool
      const newPool = game.entry_fee;
      const prizeAmount = newPool * 0.9;

      await supabase
        .from('game_sessions')
        .update({
          total_pool: newPool,
          prize_amount: prizeAmount
        })
        .eq('id', sessionId);

      console.log('[Tournaments] Pool updated');

      // 5. Navigate
      console.log('[Tournaments] NAVIGATING TO LOBBY');
      router.push({
        pathname: '/game-lobby',
        params: { 
          sessionId: sessionId, 
          gameType: game.game_type 
        }
      });

    } catch (error: any) {
      console.error('[Tournaments] CREATE ERROR:', error);
      showAlert(t('error'), error.message || t('joiningGame'), undefined, 'error');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏆 {t('tournamentsTitle')}</Text>
        <View style={styles.balanceContainer}>
          <IconSymbol 
            ios_icon_name="dollarsign.circle.fill" 
            android_material_icon_name="account_balance_wallet" 
            size={20} 
            color={colors.primary} 
          />
          <Text style={styles.balanceText}>{availableMXI.toFixed(2)} MXI</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[commonStyles.card, styles.infoCard]}>
          <View style={styles.infoHeader}>
            <IconSymbol 
              ios_icon_name="chart.pie.fill" 
              android_material_icon_name="pie_chart" 
              size={28} 
              color={colors.primary} 
            />
            <Text style={styles.infoTitle}>{t('distributionOfRewards')}</Text>
          </View>
          <View style={styles.distributionBars}>
            <View style={styles.barRow}>
              <View style={[styles.bar, { width: '90%', backgroundColor: colors.success }]} />
              <Text style={styles.barLabel}>90% - {t('winner')}</Text>
            </View>
            <View style={styles.barRow}>
              <View style={[styles.bar, { width: '10%', backgroundColor: colors.primary }]} />
              <Text style={styles.barLabel}>10% - {t('prizeFund')}</Text>
            </View>
          </View>
        </View>

        <View style={[commonStyles.card, styles.warningCard]}>
          <IconSymbol 
            ios_icon_name="exclamationmark.triangle.fill" 
            android_material_icon_name="warning" 
            size={20} 
            color={colors.warning} 
          />
          <Text style={styles.warningText}>
            {t('onlyUseCommissionsOrChallenges')}
          </Text>
        </View>

        {/* Waiting Sessions Section */}
        {waitingSessions.length > 0 && (
          <React.Fragment>
            <View style={styles.sectionHeader}>
              <IconSymbol 
                ios_icon_name="clock.fill" 
                android_material_icon_name="schedule" 
                size={24} 
                color={colors.primary} 
              />
              <Text style={styles.sectionTitle}>{t('availableTournaments')}</Text>
            </View>

            {waitingSessions.map((session) => {
              const icon = GAME_ICONS[session.tournament_games.game_type as keyof typeof GAME_ICONS];
              const spotsLeft = session.num_players - session.participant_count;
              
              return (
                <TouchableOpacity
                  key={session.id}
                  style={[commonStyles.card, styles.sessionCard]}
                  onPress={() => joinExistingSession(session)}
                  disabled={joining}
                  activeOpacity={0.7}
                >
                  <View style={styles.sessionHeader}>
                    <View style={styles.gameIcon}>
                      <IconSymbol 
                        ios_icon_name={icon.ios} 
                        android_material_icon_name={icon.android} 
                        size={28} 
                        color={colors.primary} 
                      />
                    </View>
                    <View style={styles.sessionInfo}>
                      <Text style={styles.sessionName}>{session.tournament_games.name}</Text>
                      <Text style={styles.sessionCode}>{session.session_code}</Text>
                    </View>
                    <View style={styles.sessionBadge}>
                      <IconSymbol 
                        ios_icon_name="person.3.fill" 
                        android_material_icon_name="groups" 
                        size={16} 
                        color={colors.background} 
                      />
                      <Text style={styles.sessionBadgeText}>
                        {session.participant_count}/{session.num_players}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.sessionDetails}>
                    <View style={styles.sessionStat}>
                      <Text style={styles.sessionStatLabel}>{t('waitingForPlayers')}</Text>
                      <Text style={styles.sessionStatValue}>
                        {t('spotsAvailable', { spots: spotsLeft })}
                      </Text>
                    </View>
                    <View style={styles.sessionStat}>
                      <Text style={styles.sessionStatLabel}>{t('prize')}</Text>
                      <Text style={[styles.sessionStatValue, { color: colors.success }]}>
                        {session.prize_amount.toFixed(2)} MXI
                      </Text>
                    </View>
                    <View style={styles.sessionStat}>
                      <Text style={styles.sessionStatLabel}>Entrada</Text>
                      <Text style={[styles.sessionStatValue, { color: colors.primary }]}>
                        {session.tournament_games.entry_fee} MXI
                      </Text>
                    </View>
                  </View>

                  <View style={styles.joinButton}>
                    <Text style={styles.joinButtonText}>{t('joinTournament')}</Text>
                    <IconSymbol 
                      ios_icon_name="arrow.right.circle.fill" 
                      android_material_icon_name="arrow_circle_right" 
                      size={20} 
                      color={colors.background} 
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </React.Fragment>
        )}

        {/* Create New Tournament Section */}
        <View style={styles.sectionHeader}>
          <IconSymbol 
            ios_icon_name="plus.circle.fill" 
            android_material_icon_name="add_circle" 
            size={24} 
            color={colors.primary} 
          />
          <Text style={styles.sectionTitle}>{t('createNewTournament')}</Text>
        </View>

        {games.map((game) => {
          const icon = GAME_ICONS[game.game_type as keyof typeof GAME_ICONS];
          
          return (
            <TouchableOpacity
              key={game.id}
              style={[commonStyles.card, styles.gameCard]}
              onPress={() => createNewTournament(game)}
              disabled={joining}
              activeOpacity={0.7}
            >
              <View style={styles.gameIcon}>
                <IconSymbol 
                  ios_icon_name={icon.ios} 
                  android_material_icon_name={icon.android} 
                  size={32} 
                  color={colors.primary} 
                />
              </View>
              <View style={styles.gameInfo}>
                <Text style={styles.gameName}>{game.name}</Text>
                <Text style={styles.gameDescription}>{game.description}</Text>
                <View style={styles.gameStats}>
                  <Text style={styles.gameStat}>
                    👥 {game.min_players}-{game.max_players}
                  </Text>
                  <Text style={[styles.gameStat, styles.gamePrice]}>
                    💰 {game.entry_fee} MXI
                  </Text>
                </View>
              </View>
              <IconSymbol 
                ios_icon_name="chevron.right" 
                android_material_icon_name="chevron_right" 
                size={24} 
                color={colors.textSecondary} 
              />
            </TouchableOpacity>
          );
        })}

        {joining && (
          <View style={styles.joiningOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.joiningText}>{t('joiningGame')}</Text>
          </View>
        )}
      </ScrollView>

      {/* Player Count Selector Modal */}
      <Modal
        visible={showPlayerSelector}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPlayerSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('selectPlayers')}</Text>
              <TouchableOpacity 
                onPress={() => setShowPlayerSelector(false)}
                style={styles.modalCloseButton}
              >
                <IconSymbol 
                  ios_icon_name="xmark.circle.fill" 
                  android_material_icon_name="cancel" 
                  size={28} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              {t('asFirstPlayerChoosePlayers')}
            </Text>

            <ScrollView 
              style={styles.playerOptionsScrollView}
              contentContainerStyle={styles.playerOptions}
              showsVerticalScrollIndicator={false}
            >
              {[2, 3, 4, 5].map((count) => (
                <TouchableOpacity
                  key={count}
                  style={[
                    styles.playerOption,
                    selectedPlayerCount === count && styles.playerOptionSelected
                  ]}
                  onPress={() => setSelectedPlayerCount(count)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.playerOptionIcon,
                    selectedPlayerCount === count && styles.playerOptionIconSelected
                  ]}>
                    <IconSymbol 
                      ios_icon_name="person.3.fill" 
                      android_material_icon_name="groups" 
                      size={32} 
                      color={selectedPlayerCount === count ? colors.background : colors.primary} 
                    />
                  </View>
                  <Text style={[
                    styles.playerOptionText,
                    selectedPlayerCount === count && styles.playerOptionTextSelected
                  ]}>
                    {count} {t('players')}
                  </Text>
                  <Text style={[
                    styles.playerOptionSubtext,
                    selectedPlayerCount === count && styles.playerOptionSubtextSelected
                  ]}>
                    {t('prize')}: {selectedGame ? (selectedGame.entry_fee * count * 0.9).toFixed(2) : 0} MXI
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[buttonStyles.primary, styles.confirmButton]}
              onPress={() => {
                if (selectedGame) {
                  confirmCreate(selectedGame, selectedPlayerCount);
                }
              }}
            >
              <Text style={buttonStyles.primaryText}>
                {t('createTournamentOf', { count: selectedPlayerCount })}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[buttonStyles.secondary, styles.cancelButton]}
              onPress={() => setShowPlayerSelector(false)}
            >
              <Text style={buttonStyles.secondaryText}>{t('cancel')}</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  balanceText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
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
  infoCard: {
    marginBottom: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  distributionBars: {
    gap: 12,
  },
  barRow: {
    gap: 8,
  },
  bar: {
    height: 8,
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.warning + '10',
    borderWidth: 1,
    borderColor: colors.warning + '30',
    marginBottom: 24,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: colors.warning,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  sessionCard: {
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.primary + '40',
    backgroundColor: colors.primary + '05',
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  sessionCode: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sessionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  sessionBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.background,
  },
  sessionDetails: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  sessionStat: {
    flex: 1,
  },
  sessionStatLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  sessionStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.background,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gameIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameInfo: {
    flex: 1,
    gap: 4,
  },
  gameName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  gameDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  gameStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  gameStat: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  gamePrice: {
    color: colors.success,
    fontWeight: '700',
  },
  joiningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background + 'CC',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  joiningText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
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
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  playerOptionsScrollView: {
    maxHeight: 300,
    marginBottom: 24,
  },
  playerOptions: {
    gap: 12,
  },
  playerOption: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  playerOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  playerOptionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  playerOptionIconSelected: {
    backgroundColor: colors.background + '30',
  },
  playerOptionText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  playerOptionTextSelected: {
    color: colors.background,
  },
  playerOptionSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  playerOptionSubtextSelected: {
    color: colors.background + 'CC',
  },
  confirmButton: {
    marginBottom: 12,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
});
