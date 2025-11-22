
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
  const [availableMXI, setAvailableMXI] = useState(0);

  useEffect(() => {
    loadGames();
    loadAvailableMXI();
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

  const loadAvailableMXI = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('mxi_from_unified_commissions, mxi_from_challenges')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      // Only MXI from referral commissions and game winnings can be used
      const totalAvailable = (data.mxi_from_unified_commissions || 0) + 
                             (data.mxi_from_challenges || 0);
      setAvailableMXI(totalAvailable);
    } catch (error) {
      console.error('Error loading available MXI:', error);
    }
  };

  const handleGameSelect = (game: TournamentGame) => {
    console.log('Game selected:', game.name, game.game_type);
    
    if (availableMXI < game.entry_fee) {
      Alert.alert(
        'Saldo Insuficiente',
        `Necesitas al menos ${game.entry_fee} MXI para participar.\n\nTu saldo disponible: ${availableMXI.toFixed(2)} MXI\n\nSolo puedes usar MXI ganado por:\n• Comisiones de referidos unificadas\n• Premios de retos anteriores`,
        [{ text: 'Entendido' }]
      );
      return;
    }

    Alert.alert(
      game.name,
      `¿Deseas participar en este reto?\n\n💰 Costo de entrada: ${game.entry_fee} MXI\n👥 Jugadores: ${game.min_players}-${game.max_players}\n🏆 Premio: 100% del total recaudado\n\nEste es un juego de habilidad, no una apuesta. El ganador se lleva todo el pool por su participación.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Participar', 
          onPress: () => joinGame(game),
          style: 'default'
        }
      ]
    );
  };

  const joinGame = async (game: TournamentGame) => {
    try {
      console.log('Joining game:', game.name);
      setLoading(true);

      // Check for available sessions or create new one
      const { data: availableSessions, error: sessionError } = await supabase
        .from('game_sessions')
        .select(`
          *,
          game_participants (
            id
          )
        `)
        .eq('game_id', game.id)
        .eq('status', 'waiting')
        .order('created_at', { ascending: true });

      if (sessionError) {
        console.error('Session error:', sessionError);
        throw sessionError;
      }

      console.log('Available sessions:', availableSessions);

      let sessionId: string;

      if (availableSessions && availableSessions.length > 0) {
        const session = availableSessions[0];
        const participantCount = session.game_participants?.length || 0;

        console.log('Found session with', participantCount, 'participants');

        if (participantCount < game.max_players) {
          sessionId = session.id;
          console.log('Joining existing session:', sessionId);
        } else {
          // Create new session
          sessionId = await createNewSession(game);
          console.log('Created new session (existing full):', sessionId);
        }
      } else {
        // Create new session
        sessionId = await createNewSession(game);
        console.log('Created new session (none available):', sessionId);
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
    
    console.log('Creating session with code:', sessionCode);
    
    const { data, error } = await supabase
      .from('game_sessions')
      .insert({
        game_id: game.id,
        session_code: sessionCode,
        num_players: game.min_players,
        status: 'waiting',
        total_pool: 0,
        prize_amount: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Create session error:', error);
      throw error;
    }
    
    console.log('Session created:', data);
    return data.id;
  };

  const joinSession = async (sessionId: string, game: TournamentGame) => {
    console.log('Joining session:', sessionId);
    
    // Get current participant count
    const { data: participants, error: countError } = await supabase
      .from('game_participants')
      .select('player_number')
      .eq('session_id', sessionId)
      .order('player_number', { ascending: false })
      .limit(1);

    if (countError) {
      console.error('Count error:', countError);
      throw countError;
    }

    const nextPlayerNumber = participants && participants.length > 0 
      ? participants[0].player_number + 1 
      : 1;

    console.log('Next player number:', nextPlayerNumber);

    // Deduct entry fee from user balance (only from allowed sources)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('mxi_from_unified_commissions, mxi_from_challenges')
      .eq('id', user?.id)
      .single();

    if (userError) {
      console.error('User data error:', userError);
      throw userError;
    }

    let remaining = game.entry_fee;
    let newCommissions = userData.mxi_from_unified_commissions || 0;
    let newChallenges = userData.mxi_from_challenges || 0;

    console.log('Current balances - Commissions:', newCommissions, 'Challenges:', newChallenges);

    // Deduct from commissions first
    if (newCommissions >= remaining) {
      newCommissions -= remaining;
      remaining = 0;
    } else {
      remaining -= newCommissions;
      newCommissions = 0;
    }

    // Then from challenges
    if (remaining > 0) {
      newChallenges -= remaining;
    }

    console.log('New balances - Commissions:', newCommissions, 'Challenges:', newChallenges);

    const { error: updateError } = await supabase
      .from('users')
      .update({
        mxi_from_unified_commissions: newCommissions,
        mxi_from_challenges: newChallenges
      })
      .eq('id', user?.id);

    if (updateError) {
      console.error('Update balance error:', updateError);
      throw updateError;
    }

    console.log('Balance updated successfully');

    // Add participant
    const { error: participantError } = await supabase
      .from('game_participants')
      .insert({
        session_id: sessionId,
        user_id: user?.id,
        player_number: nextPlayerNumber,
        entry_paid: true
      });

    if (participantError) {
      console.error('Participant error:', participantError);
      throw participantError;
    }

    console.log('Participant added successfully');

    // Update session pool (100% goes to winner now)
    const { data: sessionData, error: sessionError } = await supabase
      .from('game_sessions')
      .select('total_pool')
      .eq('id', sessionId)
      .single();

    if (sessionError) {
      console.error('Session data error:', sessionError);
      throw sessionError;
    }

    const newPool = (sessionData.total_pool || 0) + game.entry_fee;
    const prizeAmount = newPool; // 100% goes to winner

    console.log('Updating pool - New total:', newPool, 'Prize:', prizeAmount);

    const { error: poolUpdateError } = await supabase
      .from('game_sessions')
      .update({
        total_pool: newPool,
        prize_amount: prizeAmount
      })
      .eq('id', sessionId);

    if (poolUpdateError) {
      console.error('Pool update error:', poolUpdateError);
      throw poolUpdateError;
    }

    console.log('Pool updated successfully');

    // Navigate to game lobby
    console.log('Navigating to lobby with sessionId:', sessionId, 'gameType:', game.game_type);
    router.push({
      pathname: '/game-lobby',
      params: { 
        sessionId: sessionId, 
        gameType: game.game_type 
      }
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
          <Text style={styles.balanceText}>{availableMXI.toFixed(2)} MXI</Text>
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
            <Text style={styles.infoItem}>• Cada ticket cuesta 3 MXI</Text>
            <Text style={styles.infoItem}>• Participa con 3 a 5 jugadores al azar</Text>
            <Text style={styles.infoItem}>• El ganador recibe el 100% del pool</Text>
            <Text style={styles.infoItem}>• Premios por participación, no por apuesta</Text>
            <Text style={styles.infoItem}>• Todos los juegos son de habilidad pura</Text>
            <Text style={styles.infoItem}>• Solo puedes usar MXI de comisiones o retos</Text>
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
            Solo puedes pagar con MXI ganado por comisiones de referidos o retos anteriores
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Juegos Disponibles</Text>

        {games.map((game) => {
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
                      ios_icon_name="ticket.fill" 
                      android_material_icon_name="confirmation_number" 
                      size={16} 
                      color={colors.success} 
                    />
                    <Text style={styles.gameDetailTextHighlight}>
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
          <Text style={styles.prizeTitle}>Premios por Participación</Text>
          <Text style={styles.prizeText}>
            El ganador se lleva el 100% del total recaudado. No hay comisiones ni descuentos. ¡Demuestra tu habilidad y gana!
          </Text>
          <View style={styles.prizeExample}>
            <Text style={styles.prizeExampleTitle}>Ejemplo:</Text>
            <Text style={styles.prizeExampleText}>
              5 jugadores × 3 MXI = 15 MXI total
            </Text>
            <Text style={styles.prizeExampleText}>
              🏆 Ganador recibe: 15 MXI completos
            </Text>
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
    marginBottom: 16,
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
    lineHeight: 18,
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
  gameDetailTextHighlight: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '700',
  },
  prizeCard: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: colors.success + '10',
    borderWidth: 1,
    borderColor: colors.success + '30',
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
    marginBottom: 16,
  },
  prizeExample: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    width: '90%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  prizeExampleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  prizeExampleText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
