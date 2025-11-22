
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
import { GameErrorHandler, withErrorHandling, withRetry } from '@/utils/gameErrorHandler';

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
  const [processingGame, setProcessingGame] = useState<string | null>(null);

  useEffect(() => {
    console.log('[Tournaments] Component mounted, user:', user?.id);
    console.log('[Tournaments] Timestamp:', new Date().toISOString());
    
    if (!user) {
      console.error('[Tournaments] ERROR: No user found in context');
      GameErrorHandler.logError(
        new Error('No user in context'),
        'Tournaments - Mount',
        { timestamp: new Date().toISOString() }
      );
      Alert.alert(
        'Error de Sesión',
        'No se pudo verificar tu sesión. Por favor inicia sesión nuevamente.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      );
      return;
    }

    loadGames();
    loadAvailableMXI();
  }, [user]);

  const loadGames = async () => {
    console.log('[Tournaments] Loading games - START');
    
    try {
      const result = await withRetry(
        async () => {
          const { data, error } = await supabase
            .from('tournament_games')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: true });

          if (error) {
            console.error('[Tournaments] Supabase error loading games:', error);
            throw error;
          }
          
          return data;
        },
        'Tournaments - Load Games',
        {
          maxRetries: 3,
          initialDelay: 1000,
          onRetry: (attempt, error) => {
            console.log(`[Tournaments] Retry attempt ${attempt} for loading games:`, error);
          }
        }
      );
      
      console.log('[Tournaments] Games loaded successfully:', result?.length || 0);
      console.log('[Tournaments] Games data:', JSON.stringify(result, null, 2));
      setGames(result || []);
      
      if (!result || result.length === 0) {
        console.warn('[Tournaments] WARNING: No active games found');
        Alert.alert(
          'Sin Juegos Disponibles',
          'No hay juegos activos en este momento. Por favor intenta más tarde.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('[Tournaments] CRITICAL ERROR loading games:', error);
      GameErrorHandler.handleError(error, 'Tournaments - Load Games', {
        showAlert: true,
        onRetry: loadGames,
        additionalInfo: { userId: user?.id, timestamp: new Date().toISOString() }
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableMXI = async () => {
    if (!user) {
      console.error('[Tournaments] ERROR: Cannot load MXI - no user');
      return;
    }

    console.log('[Tournaments] Loading available MXI for user:', user.id);
    
    try {
      const result = await withRetry(
        async () => {
          const { data, error } = await supabase
            .from('users')
            .select('mxi_from_unified_commissions, mxi_from_challenges')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('[Tournaments] Supabase error loading MXI:', error);
            throw error;
          }
          
          return data;
        },
        'Tournaments - Load MXI',
        { maxRetries: 2 }
      );
      
      const totalAvailable = (result.mxi_from_unified_commissions || 0) + 
                             (result.mxi_from_challenges || 0);
      console.log('[Tournaments] Available MXI calculated:', {
        commissions: result.mxi_from_unified_commissions,
        challenges: result.mxi_from_challenges,
        total: totalAvailable
      });
      setAvailableMXI(totalAvailable);
    } catch (error) {
      console.error('[Tournaments] ERROR loading available MXI:', error);
      GameErrorHandler.handleError(error, 'Tournaments - Load MXI', {
        showAlert: false,
        additionalInfo: { userId: user.id }
      });
      // Don't block UI, just set to 0
      setAvailableMXI(0);
    }
  };

  const handleGameSelect = (game: TournamentGame) => {
    console.log('[Tournaments] ========================================');
    console.log('[Tournaments] Game button clicked!');
    console.log('[Tournaments] Game:', game.name, '(', game.game_type, ')');
    console.log('[Tournaments] Entry fee:', game.entry_fee, 'MXI');
    console.log('[Tournaments] Available balance:', availableMXI, 'MXI');
    console.log('[Tournaments] User ID:', user?.id);
    console.log('[Tournaments] Timestamp:', new Date().toISOString());
    console.log('[Tournaments] ========================================');
    
    // Validation checks
    if (!user) {
      console.error('[Tournaments] ERROR: No user context');
      Alert.alert('Error', 'Sesión no válida. Por favor inicia sesión nuevamente.');
      return;
    }

    if (!game || !game.id) {
      console.error('[Tournaments] ERROR: Invalid game object:', game);
      Alert.alert('Error', 'Juego no válido. Por favor intenta con otro juego.');
      return;
    }

    if (processingGame) {
      console.warn('[Tournaments] WARNING: Already processing game:', processingGame);
      Alert.alert('Espera', 'Ya estás procesando una solicitud. Por favor espera.');
      return;
    }
    
    if (availableMXI < game.entry_fee) {
      console.log('[Tournaments] Insufficient balance check triggered');
      console.log('[Tournaments] Required:', game.entry_fee, 'Available:', availableMXI);
      Alert.alert(
        'Saldo Insuficiente',
        `Necesitas al menos ${game.entry_fee} MXI para participar.\n\nTu saldo disponible: ${availableMXI.toFixed(2)} MXI\n\nSolo puedes usar MXI ganado por:\n• Comisiones de referidos unificadas\n• Premios de retos anteriores`,
        [{ text: 'Entendido' }]
      );
      return;
    }

    console.log('[Tournaments] All validations passed, showing confirmation dialog');
    
    Alert.alert(
      game.name,
      `¿Deseas participar en este reto?\n\n💰 Costo de entrada: ${game.entry_fee} MXI\n👥 Jugadores: ${game.min_players}-${game.max_players}\n🏆 Premio: 100% del total recaudado\n\nEste es un juego de habilidad, no una apuesta. El ganador se lleva todo el pool por su participación.`,
      [
        { 
          text: 'Cancelar', 
          style: 'cancel',
          onPress: () => {
            console.log('[Tournaments] User cancelled game selection');
          }
        },
        { 
          text: 'Participar', 
          onPress: () => {
            console.log('[Tournaments] User confirmed participation');
            joinGame(game);
          },
          style: 'default'
        }
      ]
    );
  };

  const joinGame = async (game: TournamentGame) => {
    console.log('[Tournaments] ========================================');
    console.log('[Tournaments] JOIN GAME STARTED');
    console.log('[Tournaments] Game:', game.name);
    console.log('[Tournaments] Game ID:', game.id);
    console.log('[Tournaments] Game Type:', game.game_type);
    console.log('[Tournaments] User ID:', user?.id);
    console.log('[Tournaments] Timestamp:', new Date().toISOString());
    console.log('[Tournaments] ========================================');

    try {
      setProcessingGame(game.id);
      setLoading(true);

      // Step 1: Check for available sessions
      console.log('[Tournaments] STEP 1: Checking for available sessions...');
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
        console.error('[Tournaments] ERROR in session query:', sessionError);
        throw new Error(`Error al buscar sesiones: ${sessionError.message}`);
      }

      console.log('[Tournaments] Available sessions found:', availableSessions?.length || 0);
      if (availableSessions && availableSessions.length > 0) {
        console.log('[Tournaments] Session details:', JSON.stringify(availableSessions[0], null, 2));
      }

      let sessionId: string;

      if (availableSessions && availableSessions.length > 0) {
        const session = availableSessions[0];
        const participantCount = session.game_participants?.length || 0;

        console.log('[Tournaments] Found existing session:', session.id);
        console.log('[Tournaments] Current participants:', participantCount);
        console.log('[Tournaments] Max players:', game.max_players);

        if (participantCount < game.max_players) {
          sessionId = session.id;
          console.log('[Tournaments] Joining existing session:', sessionId);
        } else {
          console.log('[Tournaments] Session full, creating new session');
          sessionId = await createNewSession(game);
        }
      } else {
        console.log('[Tournaments] No available sessions, creating new one');
        sessionId = await createNewSession(game);
      }

      console.log('[Tournaments] STEP 2: Session determined:', sessionId);

      // Step 2: Join the session
      console.log('[Tournaments] STEP 3: Joining session...');
      await joinSession(sessionId, game);

      console.log('[Tournaments] ========================================');
      console.log('[Tournaments] JOIN GAME COMPLETED SUCCESSFULLY');
      console.log('[Tournaments] Session ID:', sessionId);
      console.log('[Tournaments] ========================================');

    } catch (error: any) {
      console.error('[Tournaments] ========================================');
      console.error('[Tournaments] JOIN GAME FAILED');
      console.error('[Tournaments] Error:', error);
      console.error('[Tournaments] Error message:', error?.message);
      console.error('[Tournaments] Error stack:', error?.stack);
      console.error('[Tournaments] ========================================');
      
      GameErrorHandler.handleError(error, 'Tournaments - Join Game', {
        showAlert: true,
        onRetry: () => joinGame(game),
        additionalInfo: {
          gameId: game.id,
          gameName: game.name,
          userId: user?.id,
          availableMXI,
          timestamp: new Date().toISOString()
        }
      });
    } finally {
      setLoading(false);
      setProcessingGame(null);
    }
  };

  const createNewSession = async (game: TournamentGame): Promise<string> => {
    const sessionCode = `${game.game_type.toUpperCase()}-${Date.now().toString(36)}`;
    
    console.log('[Tournaments] Creating new session...');
    console.log('[Tournaments] Session code:', sessionCode);
    console.log('[Tournaments] Game ID:', game.id);
    console.log('[Tournaments] Min players:', game.min_players);
    
    try {
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
        console.error('[Tournaments] ERROR creating session:', error);
        throw new Error(`Error al crear sesión: ${error.message}`);
      }
      
      console.log('[Tournaments] Session created successfully:', data.id);
      console.log('[Tournaments] Session data:', JSON.stringify(data, null, 2));
      return data.id;
    } catch (error: any) {
      console.error('[Tournaments] CRITICAL ERROR creating session:', error);
      throw error;
    }
  };

  const joinSession = async (sessionId: string, game: TournamentGame) => {
    console.log('[Tournaments] ========================================');
    console.log('[Tournaments] JOIN SESSION STARTED');
    console.log('[Tournaments] Session ID:', sessionId);
    console.log('[Tournaments] Game:', game.name);
    console.log('[Tournaments] Entry fee:', game.entry_fee);
    console.log('[Tournaments] ========================================');
    
    try {
      // Step 1: Get current participant count
      console.log('[Tournaments] Getting participant count...');
      const { data: participants, error: countError } = await supabase
        .from('game_participants')
        .select('player_number')
        .eq('session_id', sessionId)
        .order('player_number', { ascending: false })
        .limit(1);

      if (countError) {
        console.error('[Tournaments] ERROR counting participants:', countError);
        throw new Error(`Error al contar participantes: ${countError.message}`);
      }

      const nextPlayerNumber = participants && participants.length > 0 
        ? participants[0].player_number + 1 
        : 1;

      console.log('[Tournaments] Next player number:', nextPlayerNumber);

      // Step 2: Deduct entry fee from user balance
      console.log('[Tournaments] Deducting entry fee from balance...');
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('mxi_from_unified_commissions, mxi_from_challenges')
        .eq('id', user?.id)
        .single();

      if (userError) {
        console.error('[Tournaments] ERROR getting user data:', userError);
        throw new Error(`Error al obtener datos del usuario: ${userError.message}`);
      }

      let remaining = game.entry_fee;
      let newCommissions = userData.mxi_from_unified_commissions || 0;
      let newChallenges = userData.mxi_from_challenges || 0;

      console.log('[Tournaments] Current balances:', {
        commissions: newCommissions,
        challenges: newChallenges,
        total: newCommissions + newChallenges
      });

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

      console.log('[Tournaments] New balances after deduction:', {
        commissions: newCommissions,
        challenges: newChallenges,
        deducted: game.entry_fee
      });

      // Validate sufficient balance
      if (newChallenges < 0) {
        console.error('[Tournaments] ERROR: Insufficient balance after calculation');
        throw new Error('Saldo insuficiente para participar');
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({
          mxi_from_unified_commissions: newCommissions,
          mxi_from_challenges: newChallenges
        })
        .eq('id', user?.id);

      if (updateError) {
        console.error('[Tournaments] ERROR updating balance:', updateError);
        throw new Error(`Error al actualizar saldo: ${updateError.message}`);
      }

      console.log('[Tournaments] Balance updated successfully');

      // Step 3: Add participant
      console.log('[Tournaments] Adding participant to session...');
      const { error: participantError } = await supabase
        .from('game_participants')
        .insert({
          session_id: sessionId,
          user_id: user?.id,
          player_number: nextPlayerNumber,
          entry_paid: true
        });

      if (participantError) {
        console.error('[Tournaments] ERROR adding participant:', participantError);
        // Try to rollback balance update
        console.log('[Tournaments] Attempting to rollback balance...');
        await supabase
          .from('users')
          .update({
            mxi_from_unified_commissions: userData.mxi_from_unified_commissions,
            mxi_from_challenges: userData.mxi_from_challenges
          })
          .eq('id', user?.id);
        
        throw new Error(`Error al unirse al juego: ${participantError.message}`);
      }

      console.log('[Tournaments] Participant added successfully');

      // Step 4: Update session pool
      console.log('[Tournaments] Updating session pool...');
      const { data: sessionData, error: sessionError } = await supabase
        .from('game_sessions')
        .select('total_pool')
        .eq('id', sessionId)
        .single();

      if (sessionError) {
        console.error('[Tournaments] ERROR getting session data:', sessionError);
        throw new Error(`Error al obtener datos de sesión: ${sessionError.message}`);
      }

      const newPool = (sessionData.total_pool || 0) + game.entry_fee;
      const prizeAmount = newPool; // 100% goes to winner

      console.log('[Tournaments] Pool update:', {
        oldPool: sessionData.total_pool,
        newPool: newPool,
        prizeAmount: prizeAmount
      });

      const { error: poolUpdateError } = await supabase
        .from('game_sessions')
        .update({
          total_pool: newPool,
          prize_amount: prizeAmount
        })
        .eq('id', sessionId);

      if (poolUpdateError) {
        console.error('[Tournaments] ERROR updating pool:', poolUpdateError);
        throw new Error(`Error al actualizar pool: ${poolUpdateError.message}`);
      }

      console.log('[Tournaments] Pool updated successfully');

      // Step 5: Navigate to game lobby
      console.log('[Tournaments] ========================================');
      console.log('[Tournaments] NAVIGATION TO LOBBY');
      console.log('[Tournaments] Session ID:', sessionId);
      console.log('[Tournaments] Game Type:', game.game_type);
      console.log('[Tournaments] Timestamp:', new Date().toISOString());
      console.log('[Tournaments] ========================================');

      try {
        router.push({
          pathname: '/game-lobby',
          params: { 
            sessionId: sessionId, 
            gameType: game.game_type 
          }
        });
        console.log('[Tournaments] Navigation command executed');
      } catch (navError) {
        console.error('[Tournaments] NAVIGATION ERROR:', navError);
        throw new Error(`Error al navegar al lobby: ${navError}`);
      }

    } catch (error: any) {
      console.error('[Tournaments] ========================================');
      console.error('[Tournaments] JOIN SESSION FAILED');
      console.error('[Tournaments] Error:', error);
      console.error('[Tournaments] ========================================');
      throw error;
    }
  };

  if (loading && games.length === 0) {
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

        {games.length === 0 ? (
          <View style={[commonStyles.card, styles.emptyCard]}>
            <IconSymbol 
              ios_icon_name="exclamationmark.circle" 
              android_material_icon_name="error_outline" 
              size={48} 
              color={colors.textSecondary} 
            />
            <Text style={styles.emptyText}>No hay juegos disponibles</Text>
            <TouchableOpacity
              style={[buttonStyles.primary, { marginTop: 16 }]}
              onPress={loadGames}
            >
              <Text style={buttonStyles.primaryText}>Recargar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          games.map((game) => {
            const icon = GAME_ICONS[game.game_type as keyof typeof GAME_ICONS];
            const isProcessing = processingGame === game.id;
            
            return (
              <TouchableOpacity
                key={game.id}
                style={[
                  commonStyles.card, 
                  styles.gameCard,
                  isProcessing && styles.gameCardProcessing
                ]}
                onPress={() => handleGameSelect(game)}
                activeOpacity={0.7}
                disabled={isProcessing || loading}
              >
                <View style={styles.gameIconContainer}>
                  {isProcessing ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <IconSymbol 
                      ios_icon_name={icon.ios} 
                      android_material_icon_name={icon.android} 
                      size={40} 
                      color={colors.primary} 
                    />
                  )}
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
          })
        )}

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
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gameCardProcessing: {
    opacity: 0.6,
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
