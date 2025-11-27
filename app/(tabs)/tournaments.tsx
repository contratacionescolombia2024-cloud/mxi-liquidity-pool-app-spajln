
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
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
  const [loading, setLoading] = useState(true);
  const [availableMXI, setAvailableMXI] = useState(0);
  const [joining, setJoining] = useState(false);
  const [showPlayerSelector, setShowPlayerSelector] = useState(false);
  const [selectedGame, setSelectedGame] = useState<TournamentGame | null>(null);
  const [selectedPlayerCount, setSelectedPlayerCount] = useState<number>(3);

  useEffect(() => {
    console.log('[Tournaments] Mounted - User:', user?.id);
    if (user) {
      loadData();
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
    } catch (error) {
      console.error('[Tournaments] Load error:', error);
      Alert.alert(t('error'), t('availableGames'));
    } finally {
      setLoading(false);
    }
  };

  const joinGame = async (game: TournamentGame) => {
    if (joining) return;
    
    console.log('[Tournaments] JOIN GAME:', game.name, game.id);
    
    // Check balance
    if (availableMXI < game.entry_fee) {
      Alert.alert(
        t('insufficientBalance'),
        t('insufficientBalanceNeed', { needed: game.entry_fee, available: availableMXI.toFixed(2) })
      );
      return;
    }

    // Check if there are waiting sessions
    const { data: sessions } = await supabase
      .from('game_sessions')
      .select('id, num_players, (game_participants(count))')
      .eq('game_id', game.id)
      .eq('status', 'waiting')
      .order('created_at', { ascending: true });

    console.log('[Tournaments] Found sessions:', sessions?.length);

    // Check if any session has space
    let hasAvailableSession = false;
    if (sessions && sessions.length > 0) {
      for (const session of sessions) {
        const count = (session as any).game_participants?.[0]?.count || 0;
        if (count < session.num_players) {
          hasAvailableSession = true;
          break;
        }
      }
    }

    // If no available session, show player count selector
    if (!hasAvailableSession) {
      setSelectedGame(game);
      setSelectedPlayerCount(3);
      setShowPlayerSelector(true);
    } else {
      // Join existing session
      confirmJoin(game, null);
    }
  };

  const confirmJoin = (game: TournamentGame, playerCount: number | null) => {
    const message = playerCount 
      ? t('createTournamentOf', { count: playerCount }) + ` ${t('participateFor', { fee: game.entry_fee })}?\n\n🏆 ${t('prize')}: 90% del pool\n👥 ${playerCount} ${t('players')}`
      : t('participateFor', { fee: game.entry_fee }) + `?\n\n🏆 ${t('prize')}: 90% del pool\n👥 ${game.min_players}-${game.max_players} ${t('players')}`;

    Alert.alert(
      game.name,
      message,
      [
        { text: t('cancel'), style: 'cancel' },
        { 
          text: t('continue'), 
          onPress: () => executeJoin(game, playerCount)
        }
      ]
    );
  };

  const executeJoin = async (game: TournamentGame, playerCount: number | null) => {
    setJoining(true);
    setShowPlayerSelector(false);
    
    try {
      console.log('[Tournaments] EXECUTE JOIN START - Player count:', playerCount);
      
      // 1. Find or create session
      let sessionId: string | null = null;
      
      const { data: sessions } = await supabase
        .from('game_sessions')
        .select('id, num_players, (game_participants(count))')
        .eq('game_id', game.id)
        .eq('status', 'waiting')
        .order('created_at', { ascending: true });

      console.log('[Tournaments] Found sessions:', sessions?.length);

      // Find session with space
      if (sessions && sessions.length > 0) {
        for (const session of sessions) {
          const count = (session as any).game_participants?.[0]?.count || 0;
          if (count < session.num_players) {
            sessionId = session.id;
            break;
          }
        }
      }

      // Create new session if needed
      if (!sessionId) {
        console.log('[Tournaments] Creating new session with', playerCount || game.min_players, 'players');
        const { data: newSession, error: createError } = await supabase
          .from('game_sessions')
          .insert({
            game_id: game.id,
            session_code: `${game.game_type.toUpperCase()}-${Date.now().toString(36)}`,
            num_players: playerCount || game.min_players,
            status: 'waiting',
            total_pool: 0,
            prize_amount: 0
          })
          .select()
          .single();

        if (createError) throw createError;
        sessionId = newSession.id;
        console.log('[Tournaments] Created session:', sessionId, 'with', newSession.num_players, 'players');
      }

      // 2. Get player number
      const { data: participants } = await supabase
        .from('game_participants')
        .select('player_number')
        .eq('session_id', sessionId)
        .order('player_number', { ascending: false })
        .limit(1);

      const playerNumber = participants && participants.length > 0 
        ? participants[0].player_number + 1 
        : 1;

      console.log('[Tournaments] Player number:', playerNumber);

      // 3. Deduct balance
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

      // 4. Add participant
      const { error: participantError } = await supabase
        .from('game_participants')
        .insert({
          session_id: sessionId,
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

      // 5. Update pool
      const { data: sessionData } = await supabase
        .from('game_sessions')
        .select('total_pool')
        .eq('id', sessionId)
        .single();

      const newPool = (sessionData!.total_pool || 0) + game.entry_fee;
      const prizeAmount = newPool * 0.9;

      await supabase
        .from('game_sessions')
        .update({
          total_pool: newPool,
          prize_amount: prizeAmount
        })
        .eq('id', sessionId);

      console.log('[Tournaments] Pool updated');

      // 6. Navigate
      console.log('[Tournaments] NAVIGATING TO LOBBY');
      router.push({
        pathname: '/game-lobby',
        params: { 
          sessionId: sessionId, 
          gameType: game.game_type 
        }
      });

    } catch (error: any) {
      console.error('[Tournaments] JOIN ERROR:', error);
      Alert.alert(t('error'), error.message || t('joiningGame'));
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
        <Text style={styles.headerTitle}>{t('tournamentsTitle')}</Text>
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

        <Text style={styles.sectionTitle}>{t('availableGames')}</Text>

        {games.map((game) => {
          const icon = GAME_ICONS[game.game_type as keyof typeof GAME_ICONS];
          
          return (
            <TouchableOpacity
              key={game.id}
              style={[commonStyles.card, styles.gameCard]}
              onPress={() => joinGame(game)}
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

            <View style={styles.playerOptions}>
              {[3, 4, 5].map((count) => (
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
            </View>

            <TouchableOpacity
              style={[buttonStyles.primary, styles.confirmButton]}
              onPress={() => {
                if (selectedGame) {
                  confirmJoin(selectedGame, selectedPlayerCount);
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
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
  playerOptions: {
    gap: 12,
    marginBottom: 24,
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
