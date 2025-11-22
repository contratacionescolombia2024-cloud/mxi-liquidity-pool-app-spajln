
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
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
  admin_percentage: number;
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
  const [games, setGames] = useState<TournamentGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [userMXI, setUserMXI] = useState(0);

  useEffect(() => {
    loadGames();
    loadUserBalance();
  }, []);

  const loadGames = async () => {
    try {
      const { data, error } = await supabase
        .from('tournament_games')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setGames(data || []);
    } catch (error) {
      console.error('Error loading games:', error);
      Alert.alert('Error', 'No se pudieron cargar los juegos');
    } finally {
      setLoading(false);
    }
  };

  const loadUserBalance = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('mxi_balance, mxi_purchased_directly, mxi_from_unified_commissions, mxi_from_challenges')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      // Calculate total available MXI for games
      const totalMXI = (data.mxi_purchased_directly || 0) + 
                       (data.mxi_from_unified_commissions || 0) + 
                       (data.mxi_from_challenges || 0);
      setUserMXI(totalMXI);
    } catch (error) {
      console.error('Error loading user balance:', error);
    }
  };

  const handleGameSelect = (game: TournamentGame) => {
    if (userMXI < game.entry_fee) {
      Alert.alert(
        'Saldo Insuficiente',
        `Necesitas al menos ${game.entry_fee} MXI para jugar. Tu saldo disponible es ${userMXI.toFixed(2)} MXI.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      game.name,
      `¿Deseas unirte a este juego?\n\nCosto de entrada: ${game.entry_fee} MXI\nJugadores: ${game.min_players}-${game.max_players}\nPremio: ${game.winner_percentage}% del total recaudado`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Unirse', 
          onPress: () => joinGame(game),
          style: 'default'
        }
      ]
    );
  };

  const joinGame = async (game: TournamentGame) => {
    try {
      setLoading(true);

      // Check for available sessions or create new one
      const { data: availableSessions, error: sessionError } = await supabase
        .from('game_sessions')
        .select('*, game_participants(count)')
        .eq('game_id', game.id)
        .eq('status', 'waiting')
        .order('created_at', { ascending: true })
        .limit(1);

      if (sessionError) throw sessionError;

      let sessionId: string;

      if (availableSessions && availableSessions.length > 0) {
        const session = availableSessions[0];
        const participantCount = session.game_participants?.[0]?.count || 0;

        if (participantCount < game.max_players) {
          sessionId = session.id;
        } else {
          // Create new session
          sessionId = await createNewSession(game);
        }
      } else {
        // Create new session
        sessionId = await createNewSession(game);
      }

      // Join the session
      await joinSession(sessionId, game);

    } catch (error) {
      console.error('Error joining game:', error);
      Alert.alert('Error', 'No se pudo unir al juego. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const createNewSession = async (game: TournamentGame): Promise<string> => {
    const sessionCode = `${game.game_type.toUpperCase()}-${Date.now().toString(36)}`;
    
    const { data, error } = await supabase
      .from('game_sessions')
      .insert({
        game_id: game.id,
        session_code: sessionCode,
        num_players: game.min_players,
        status: 'waiting'
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  };

  const joinSession = async (sessionId: string, game: TournamentGame) => {
    // Get current participant count
    const { data: participants, error: countError } = await supabase
      .from('game_participants')
      .select('player_number')
      .eq('session_id', sessionId)
      .order('player_number', { ascending: false })
      .limit(1);

    if (countError) throw countError;

    const nextPlayerNumber = participants && participants.length > 0 
      ? participants[0].player_number + 1 
      : 1;

    // Deduct entry fee from user balance
    const { error: deductError } = await supabase.rpc('deduct_mxi_for_game', {
      p_user_id: user?.id,
      p_amount: game.entry_fee
    });

    if (deductError) {
      // If RPC doesn't exist, do manual deduction
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('mxi_purchased_directly, mxi_from_unified_commissions, mxi_from_challenges')
        .eq('id', user?.id)
        .single();

      if (userError) throw userError;

      let remaining = game.entry_fee;
      let newPurchased = userData.mxi_purchased_directly || 0;
      let newCommissions = userData.mxi_from_unified_commissions || 0;
      let newChallenges = userData.mxi_from_challenges || 0;

      // Deduct from purchased first
      if (newPurchased >= remaining) {
        newPurchased -= remaining;
        remaining = 0;
      } else {
        remaining -= newPurchased;
        newPurchased = 0;
      }

      // Then from commissions
      if (remaining > 0 && newCommissions >= remaining) {
        newCommissions -= remaining;
        remaining = 0;
      } else if (remaining > 0) {
        remaining -= newCommissions;
        newCommissions = 0;
      }

      // Finally from challenges
      if (remaining > 0) {
        newChallenges -= remaining;
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({
          mxi_purchased_directly: newPurchased,
          mxi_from_unified_commissions: newCommissions,
          mxi_from_challenges: newChallenges
        })
        .eq('id', user?.id);

      if (updateError) throw updateError;
    }

    // Add participant
    const { error: participantError } = await supabase
      .from('game_participants')
      .insert({
        session_id: sessionId,
        user_id: user?.id,
        player_number: nextPlayerNumber,
        entry_paid: true
      });

    if (participantError) throw participantError;

    // Update session pool
    const { error: poolError } = await supabase.rpc('update_game_pool', {
      p_session_id: sessionId,
      p_entry_fee: game.entry_fee,
      p_winner_percentage: game.winner_percentage,
      p_admin_percentage: game.admin_percentage
    });

    if (poolError) {
      // Manual update if RPC doesn't exist
      const { data: sessionData, error: sessionError } = await supabase
        .from('game_sessions')
        .select('total_pool')
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;

      const newPool = (sessionData.total_pool || 0) + game.entry_fee;
      const prizeAmount = newPool * (game.winner_percentage / 100);
      const adminFee = newPool * (game.admin_percentage / 100);

      const { error: updateError } = await supabase
        .from('game_sessions')
        .update({
          total_pool: newPool,
          prize_amount: prizeAmount,
          admin_fee: adminFee
        })
        .eq('id', sessionId);

      if (updateError) throw updateError;
    }

    // Navigate to game lobby
    router.push({
      pathname: '/game-lobby',
      params: { sessionId, gameType: game.game_type }
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando juegos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Torneos</Text>
        <View style={styles.balanceContainer}>
          <IconSymbol 
            ios_icon_name="dollarsign.circle.fill" 
            android_material_icon_name="account_balance_wallet" 
            size={20} 
            color={colors.primary} 
          />
          <Text style={styles.balanceText}>{userMXI.toFixed(2)} MXI</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[commonStyles.card, styles.infoCard]}>
          <View style={styles.infoHeader}>
            <IconSymbol 
              ios_icon_name="info.circle.fill" 
              android_material_icon_name="info" 
              size={24} 
              color={colors.primary} 
            />
            <Text style={styles.infoTitle}>Cómo Funciona</Text>
          </View>
          <View style={styles.infoList}>
            <Text style={styles.infoItem}>- Cada juego cuesta 3 MXI para entrar</Text>
            <Text style={styles.infoItem}>- Elige entre 3 a 5 participantes</Text>
            <Text style={styles.infoItem}>- El ganador recibe el 90% del total</Text>
            <Text style={styles.infoItem}>- El 10% es para el administrador</Text>
            <Text style={styles.infoItem}>- Todos los juegos son de habilidad</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Juegos Disponibles</Text>

        {games.map((game, index) => {
          const icon = GAME_ICONS[game.game_type as keyof typeof GAME_ICONS];
          return (
            <TouchableOpacity
              key={game.id}
              style={[commonStyles.card, styles.gameCard]}
              onPress={() => handleGameSelect(game)}
              activeOpacity={0.7}
            >
              <View style={styles.gameIconContainer}>
                <IconSymbol 
                  ios_icon_name={icon.ios} 
                  android_material_icon_name={icon.android} 
                  size={40} 
                  color={colors.primary} 
                />
              </View>
              <View style={styles.gameInfo}>
                <Text style={styles.gameName}>{game.name}</Text>
                <Text style={styles.gameDescription} numberOfLines={2}>
                  {game.description}
                </Text>
                <View style={styles.gameDetails}>
                  <View style={styles.gameDetailItem}>
                    <IconSymbol 
                      ios_icon_name="person.2.fill" 
                      android_material_icon_name="group" 
                      size={16} 
                      color={colors.textSecondary} 
                    />
                    <Text style={styles.gameDetailText}>
                      {game.min_players}-{game.max_players} jugadores
                    </Text>
                  </View>
                  <View style={styles.gameDetailItem}>
                    <IconSymbol 
                      ios_icon_name="dollarsign.circle" 
                      android_material_icon_name="attach_money" 
                      size={16} 
                      color={colors.textSecondary} 
                    />
                    <Text style={styles.gameDetailText}>
                      {game.entry_fee} MXI
                    </Text>
                  </View>
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

        <View style={[commonStyles.card, styles.prizeCard]}>
          <IconSymbol 
            ios_icon_name="trophy.fill" 
            android_material_icon_name="emoji_events" 
            size={48} 
            color={colors.primary} 
          />
          <Text style={styles.prizeTitle}>Premios en MXI</Text>
          <Text style={styles.prizeText}>
            El ganador se lleva el 90% del total recaudado. ¡Demuestra tu habilidad y gana!
          </Text>
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    backgroundColor: colors.primary + '10',
    borderWidth: 1,
    borderColor: colors.primary + '30',
    marginBottom: 24,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  infoList: {
    gap: 8,
  },
  infoItem: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
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
  gameIconContainer: {
    width: 60,
    height: 60,
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
    lineHeight: 18,
  },
  gameDetails: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  gameDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gameDetailText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  prizeCard: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: colors.primary + '10',
    borderWidth: 1,
    borderColor: colors.primary + '30',
    marginTop: 12,
  },
  prizeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  prizeText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});
