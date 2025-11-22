
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
import { GameErrorHandler } from '@/utils/gameErrorHandler';

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
    console.log('[Tournaments] ========================================');
    console.log('[Tournaments] Component mounted');
    console.log('[Tournaments] User ID:', user?.id);
    console.log('[Tournaments] Timestamp:', new Date().toISOString());
    console.log('[Tournaments] ========================================');
    
    if (!user) {
      console.error('[Tournaments] ERROR: No user found');
      Alert.alert('Error', 'No se pudo verificar tu sesión. Por favor inicia sesión nuevamente.');
      return;
    }

    loadGames();
    loadAvailableMXI();
  }, [user]);

  const loadGames = async () => {
    console.log('[Tournaments] Loading games...');
    
    try {
      const { data, error } = await supabase
        .from('tournament_games')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('[Tournaments] Error loading games:', error);
        GameErrorHandler.logError(error, 'loadGames', { userId: user?.id });
        throw error;
      }
      
      console.log('[Tournaments] Games loaded successfully:', data?.length || 0);
      setGames(data || []);
    } catch (error: any) {
      console.error('[Tournaments] CRITICAL ERROR loading games:', error);
      GameErrorHandler.handleError(error, 'loadGames', {
        showAlert: true,
        onRetry: loadGames,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableMXI = async () => {
    if (!user) return;

    console.log('[Tournaments] Loading available MXI...');
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('mxi_from_unified_commissions, mxi_from_challenges')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('[Tournaments] Error loading MXI:', error);
        GameErrorHandler.logError(error, 'loadAvailableMXI', { userId: user?.id });
        throw error;
      }
      
      const total = (data.mxi_from_unified_commissions || 0) + (data.mxi_from_challenges || 0);
      console.log('[Tournaments] Available MXI loaded:', total);
      setAvailableMXI(total);
    } catch (error: any) {
      console.error('[Tournaments] ERROR loading MXI:', error);
      GameErrorHandler.logError(error, 'loadAvailableMXI', { userId: user?.id });
      setAvailableMXI(0);
    }
  };

  const handleGamePress = (game: TournamentGame) => {
    console.log('[Tournaments] ========================================');
    console.log('[Tournaments] GAME BUTTON PRESSED - START');
    console.log('[Tournaments] Game:', game.name);
    console.log('[Tournaments] Game ID:', game.id);
    console.log('[Tournaments] Game Type:', game.game_type);
    console.log('[Tournaments] Entry Fee:', game.entry_fee);
    console.log('[Tournaments] Available MXI:', availableMXI);
    console.log('[Tournaments] User ID:', user?.id);
    console.log('[Tournaments] Processing Game:', processingGame);
    console.log('[Tournaments] ========================================');
    
    // Prevent double-clicks
    if (processingGame) {
      console.log('[Tournaments] Already processing a game, ignoring click');
      return;
    }

    // Validate user
    if (!user || !user.id) {
      console.error('[Tournaments] ERROR: No user or user ID');
      GameErrorHandler.handleError(
        new Error('No user session'),
        'handleGamePress - user validation',
        {
          showAlert: true,
          additionalInfo: { game: game.name },
        }
      );
      Alert.alert('Error', 'Sesión no válida. Por favor inicia sesión nuevamente.');
      return;
    }

    // Validate game
    if (!game || !game.id || !game.game_type) {
      console.error('[Tournaments] ERROR: Invalid game data:', game);
      GameErrorHandler.handleError(
        new Error('Invalid game data'),
        'handleGamePress - game validation',
        {
          showAlert: true,
          additionalInfo: { game },
        }
      );
      Alert.alert('Error', 'Juego no válido. Por favor intenta con otro juego.');
      return;
    }

    // Check balance
    if (availableMXI < game.entry_fee) {
      console.log('[Tournaments] Insufficient balance');
      Alert.alert(
        'Saldo Insuficiente',
        `Necesitas al menos ${game.entry_fee} MXI para participar.\n\nTu saldo disponible: ${availableMXI.toFixed(2)} MXI\n\nPuedes obtener MXI ganando en otros retos o por comisiones de referidos.`,
        [{ text: 'OK' }]
      );
      return;
    }

    // Show confirmation with reward distribution info
    Alert.alert(
      game.name,
      `¿Deseas participar en este reto?\n\n💰 Costo: ${game.entry_fee} MXI\n👥 Jugadores: ${game.min_players}-${game.max_players}\n🏆 Recompensas: 90% del pool para jugadores\n💎 Fondo de premios: 10% del pool\n\nEl ganador recibe el 90% del total recaudado como recompensa.`,
      [
        { 
          text: 'Cancelar', 
          style: 'cancel',
          onPress: () => {
            console.log('[Tournaments] User cancelled');
          }
        },
        { 
          text: 'Participar', 
          onPress: () => {
            console.log('[Tournaments] User confirmed, joining game');
            joinGameDirectly(game);
          }
        }
      ]
    );
  };

  const joinGameDirectly = async (game: TournamentGame) => {
    console.log('[Tournaments] ========================================');
    console.log('[Tournaments] JOIN GAME STARTED');
    console.log('[Tournaments] Game:', game.name);
    console.log('[Tournaments] Game ID:', game.id);
    console.log('[Tournaments] Game Type:', game.game_type);
    console.log('[Tournaments] Timestamp:', new Date().toISOString());
    console.log('[Tournaments] ========================================');

    setProcessingGame(game.id);
    setLoading(true);

    try {
      // Step 1: Find or create session
      console.log('[Tournaments] Step 1: Finding available session...');
      
      // First, get all waiting sessions for this game
      const { data: sessions, error: sessionError } = await supabase
        .from('game_sessions')
        .select('id')
        .eq('game_id', game.id)
        .eq('status', 'waiting')
        .order('created_at', { ascending: true });

      if (sessionError) {
        console.error('[Tournaments] Session query error:', sessionError);
        GameErrorHandler.logError(sessionError, 'joinGame - find session', {
          gameId: game.id,
          userId: user?.id,
        });
        throw new Error('Error al buscar sesiones disponibles');
      }

      console.log('[Tournaments] Found sessions:', sessions?.length || 0);

      let sessionId: string | null = null;

      // Check each session to see if it has space
      if (sessions && sessions.length > 0) {
        for (const session of sessions) {
          // Count participants in this session
          const { data: participants, error: countError } = await supabase
            .from('game_participants')
            .select('id', { count: 'exact', head: true })
            .eq('session_id', session.id);

          if (countError) {
            console.error('[Tournaments] Count error for session', session.id, ':', countError);
            continue;
          }

          const participantCount = participants?.length || 0;
          console.log('[Tournaments] Session', session.id, 'has', participantCount, 'participants');

          if (participantCount < game.max_players) {
            sessionId = session.id;
            console.log('[Tournaments] Found available session:', sessionId);
            break;
          }
        }
      }

      // If no available session found, create a new one
      if (!sessionId) {
        console.log('[Tournaments] Creating new session...');
        const sessionCode = `${game.game_type.toUpperCase()}-${Date.now().toString(36)}`;
        
        const { data: newSession, error: createError } = await supabase
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

        if (createError) {
          console.error('[Tournaments] Create session error:', createError);
          GameErrorHandler.logError(createError, 'joinGame - create session', {
            gameId: game.id,
            sessionCode,
          });
          throw new Error('Error al crear sesión');
        }

        sessionId = newSession.id;
        console.log('[Tournaments] Created new session:', sessionId);
      }

      // Step 2: Get participant count
      console.log('[Tournaments] Step 2: Getting participant count...');
      
      const { data: participants, error: countError } = await supabase
        .from('game_participants')
        .select('player_number')
        .eq('session_id', sessionId)
        .order('player_number', { ascending: false })
        .limit(1);

      if (countError) {
        console.error('[Tournaments] Count error:', countError);
        GameErrorHandler.logError(countError, 'joinGame - count participants', {
          sessionId,
        });
        throw new Error('Error al contar participantes');
      }

      const nextPlayerNumber = participants && participants.length > 0 
        ? participants[0].player_number + 1 
        : 1;

      console.log('[Tournaments] Next player number:', nextPlayerNumber);

      // Step 3: Deduct balance
      console.log('[Tournaments] Step 3: Deducting balance...');
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('mxi_from_unified_commissions, mxi_from_challenges')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('[Tournaments] User query error:', userError);
        GameErrorHandler.logError(userError, 'joinGame - get user balance', {
          userId: user.id,
        });
        throw new Error('Error al obtener saldo');
      }

      let remaining = game.entry_fee;
      let newCommissions = userData.mxi_from_unified_commissions || 0;
      let newChallenges = userData.mxi_from_challenges || 0;

      console.log('[Tournaments] Current balances - Commissions:', newCommissions, 'Challenges:', newChallenges);

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

      if (newChallenges < 0) {
        console.error('[Tournaments] Insufficient balance after calculation');
        throw new Error('Saldo insuficiente');
      }

      console.log('[Tournaments] New balances - Commissions:', newCommissions, 'Challenges:', newChallenges);

      const { error: updateError } = await supabase
        .from('users')
        .update({
          mxi_from_unified_commissions: newCommissions,
          mxi_from_challenges: newChallenges
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('[Tournaments] Balance update error:', updateError);
        GameErrorHandler.logError(updateError, 'joinGame - update balance', {
          userId: user.id,
          newCommissions,
          newChallenges,
        });
        throw new Error('Error al actualizar saldo');
      }

      console.log('[Tournaments] Balance updated successfully');

      // Step 4: Add participant
      console.log('[Tournaments] Step 4: Adding participant...');
      
      const { error: participantError } = await supabase
        .from('game_participants')
        .insert({
          session_id: sessionId,
          user_id: user.id,
          player_number: nextPlayerNumber,
          entry_paid: true
        });

      if (participantError) {
        console.error('[Tournaments] Participant insert error:', participantError);
        GameErrorHandler.logError(participantError, 'joinGame - add participant', {
          sessionId,
          userId: user.id,
          playerNumber: nextPlayerNumber,
        });
        
        // Rollback balance
        console.log('[Tournaments] Rolling back balance...');
        await supabase
          .from('users')
          .update({
            mxi_from_unified_commissions: userData.mxi_from_unified_commissions,
            mxi_from_challenges: userData.mxi_from_challenges
          })
          .eq('id', user.id);
        
        throw new Error('Error al unirse al juego');
      }

      console.log('[Tournaments] Participant added successfully');

      // Step 5: Update pool (90% goes to prize, 10% to fund)
      console.log('[Tournaments] Step 5: Updating pool...');
      
      const { data: sessionData, error: poolQueryError } = await supabase
        .from('game_sessions')
        .select('total_pool')
        .eq('id', sessionId)
        .single();

      if (poolQueryError) {
        console.error('[Tournaments] Pool query error:', poolQueryError);
        GameErrorHandler.logError(poolQueryError, 'joinGame - get pool', {
          sessionId,
        });
        throw new Error('Error al obtener pool');
      }

      const newPool = (sessionData.total_pool || 0) + game.entry_fee;
      const prizeAmount = newPool * 0.9; // 90% for players
      const fundAmount = newPool * 0.1; // 10% for prize fund

      console.log('[Tournaments] Pool calculation - Total:', newPool, 'Prize (90%):', prizeAmount, 'Fund (10%):', fundAmount);

      const { error: poolUpdateError } = await supabase
        .from('game_sessions')
        .update({
          total_pool: newPool,
          prize_amount: prizeAmount
        })
        .eq('id', sessionId);

      if (poolUpdateError) {
        console.error('[Tournaments] Pool update error:', poolUpdateError);
        GameErrorHandler.logError(poolUpdateError, 'joinGame - update pool', {
          sessionId,
          newPool,
          prizeAmount,
        });
        throw new Error('Error al actualizar pool');
      }

      console.log('[Tournaments] Pool updated successfully');

      // Step 6: Navigate to lobby
      console.log('[Tournaments] ========================================');
      console.log('[Tournaments] NAVIGATING TO LOBBY');
      console.log('[Tournaments] Session ID:', sessionId);
      console.log('[Tournaments] Game Type:', game.game_type);
      console.log('[Tournaments] Timestamp:', new Date().toISOString());
      console.log('[Tournaments] ========================================');

      // Small delay to ensure state updates
      setTimeout(() => {
        router.push({
          pathname: '/game-lobby',
          params: { 
            sessionId: sessionId, 
            gameType: game.game_type 
          }
        });
        console.log('[Tournaments] Navigation command executed');
      }, 100);

    } catch (error: any) {
      console.error('[Tournaments] ========================================');
      console.error('[Tournaments] JOIN GAME FAILED');
      console.error('[Tournaments] Error:', error);
      console.error('[Tournaments] Error message:', error.message);
      console.error('[Tournaments] Error stack:', error.stack);
      console.error('[Tournaments] Timestamp:', new Date().toISOString());
      console.error('[Tournaments] ========================================');
      
      GameErrorHandler.handleError(error, 'joinGame - complete flow', {
        showAlert: true,
        onRetry: () => joinGameDirectly(game),
        additionalInfo: {
          gameId: game.id,
          gameName: game.name,
          userId: user?.id,
        },
      });
    } finally {
      setLoading(false);
      setProcessingGame(null);
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
        <View style={[commonStyles.card, styles.distributionCard]}>
          <View style={styles.distributionHeader}>
            <IconSymbol 
              ios_icon_name="chart.pie.fill" 
              android_material_icon_name="pie_chart" 
              size={32} 
              color={colors.primary} 
            />
            <Text style={styles.distributionTitle}>Distribución de Recompensas</Text>
          </View>
          <View style={styles.distributionContent}>
            <View style={styles.distributionItem}>
              <View style={[styles.distributionBar, { width: '90%', backgroundColor: colors.success }]} />
              <Text style={styles.distributionLabel}>90% - Recompensas para Jugadores</Text>
              <Text style={styles.distributionDescription}>
                El ganador recibe el 90% del pool total como recompensa
              </Text>
            </View>
            <View style={styles.distributionItem}>
              <View style={[styles.distributionBar, { width: '10%', backgroundColor: colors.primary }]} />
              <Text style={styles.distributionLabel}>10% - Fondo de Premios</Text>
              <Text style={styles.distributionDescription}>
                Se destina al fondo de premios y recompensas especiales
              </Text>
            </View>
          </View>
        </View>

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
            <Text style={styles.infoItem}>• El ganador recibe el 90% del pool como recompensa</Text>
            <Text style={styles.infoItem}>• El 10% va al fondo de premios</Text>
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
                onPress={() => handleGamePress(game)}
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
          <Text style={styles.prizeTitle}>Sistema de Recompensas</Text>
          <Text style={styles.prizeText}>
            El ganador recibe el 90% del total recaudado como recompensa. El 10% restante se destina al fondo de premios para eventos especiales.
          </Text>
          <View style={styles.prizeExample}>
            <Text style={styles.prizeExampleTitle}>Ejemplo:</Text>
            <Text style={styles.prizeExampleText}>
              5 jugadores × 3 MXI = 15 MXI total
            </Text>
            <Text style={styles.prizeExampleText}>
              🏆 Ganador recibe: 13.5 MXI (90%)
            </Text>
            <Text style={styles.prizeExampleText}>
              💎 Fondo de premios: 1.5 MXI (10%)
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
  distributionCard: {
    backgroundColor: colors.primary + '10',
    borderWidth: 2,
    borderColor: colors.primary + '40',
    marginBottom: 16,
  },
  distributionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  distributionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  distributionContent: {
    gap: 16,
  },
  distributionItem: {
    gap: 8,
  },
  distributionBar: {
    height: 8,
    borderRadius: 4,
  },
  distributionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  distributionDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
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
