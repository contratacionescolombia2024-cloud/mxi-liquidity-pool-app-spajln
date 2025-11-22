
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Participant {
  id: string;
  user_id: string;
  player_number: number;
  entry_paid: boolean;
  users: {
    name: string;
    email: string;
  };
}

interface GameSession {
  id: string;
  session_code: string;
  num_players: number;
  total_pool: number;
  prize_amount: number;
  status: string;
  tournament_games: {
    name: string;
    game_type: string;
    entry_fee: number;
  };
}

export default function GameLobbyScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { sessionId, gameType } = useLocalSearchParams();
  const [session, setSession] = useState<GameSession | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    console.log('Game lobby mounted with sessionId:', sessionId, 'gameType:', gameType);
    loadSessionData();
    
    // Subscribe to session updates
    const sessionChannel = supabase
      .channel(`game_session_${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_sessions',
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          console.log('Session updated:', payload);
          loadSessionData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_participants',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          console.log('Participants updated:', payload);
          loadSessionData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sessionChannel);
    };
  }, [sessionId]);

  useEffect(() => {
    if (session && participants.length >= session.num_players && session.status === 'waiting') {
      // Start countdown when enough players join
      console.log('Starting countdown - enough players joined');
      setCountdown(5);
    }
  }, [session, participants]);

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      console.log('Countdown finished, starting game');
      startGame();
    }
  }, [countdown]);

  const loadSessionData = async () => {
    try {
      console.log('Loading session data for:', sessionId);
      
      const { data: sessionData, error: sessionError } = await supabase
        .from('game_sessions')
        .select(`
          *,
          tournament_games (
            name,
            game_type,
            entry_fee
          )
        `)
        .eq('id', sessionId)
        .single();

      if (sessionError) {
        console.error('Session error:', sessionError);
        throw sessionError;
      }
      
      console.log('Session data loaded:', sessionData);
      setSession(sessionData);

      const { data: participantsData, error: participantsError } = await supabase
        .from('game_participants')
        .select(`
          *,
          users (
            name,
            email
          )
        `)
        .eq('session_id', sessionId)
        .order('player_number', { ascending: true });

      if (participantsError) {
        console.error('Participants error:', participantsError);
        throw participantsError;
      }
      
      console.log('Participants loaded:', participantsData?.length);
      setParticipants(participantsData || []);

      // Check if game is ready to start
      if (sessionData.status === 'ready') {
        console.log('Game is ready, navigating to game');
        navigateToGame();
      }
    } catch (error) {
      console.error('Error loading session data:', error);
      Alert.alert('Error', 'No se pudo cargar la información de la sesión');
    } finally {
      setLoading(false);
    }
  };

  const startGame = async () => {
    try {
      console.log('Starting game for session:', sessionId);
      
      const { error } = await supabase
        .from('game_sessions')
        .update({
          status: 'ready',
          started_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) {
        console.error('Start game error:', error);
        throw error;
      }

      console.log('Game started successfully');
      navigateToGame();
    } catch (error) {
      console.error('Error starting game:', error);
      Alert.alert('Error', 'No se pudo iniciar el juego');
    }
  };

  const navigateToGame = () => {
    const gameRoutes: { [key: string]: string } = {
      tank_arena: '/games/tank-arena',
      mini_cars: '/games/mini-cars',
      shooter_retro: '/games/shooter-retro',
      dodge_arena: '/games/dodge-arena',
      bomb_runner: '/games/bomb-runner',
    };

    const route = gameRoutes[gameType as string];
    console.log('Navigating to game route:', route, 'with sessionId:', sessionId);
    
    if (route) {
      router.replace({
        pathname: route as any,
        params: { sessionId }
      });
    } else {
      console.error('Unknown game type:', gameType);
      Alert.alert('Error', 'Tipo de juego no reconocido');
    }
  };

  const handleLeave = () => {
    Alert.alert(
      'Abandonar Juego',
      '¿Estás seguro de que quieres abandonar? Perderás tu entrada de 3 MXI.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Abandonar',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Leaving game session');
              await supabase
                .from('game_participants')
                .delete()
                .eq('session_id', sessionId)
                .eq('user_id', user?.id);

              router.back();
            } catch (error) {
              console.error('Error leaving game:', error);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando sala...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <IconSymbol 
            ios_icon_name="exclamationmark.triangle.fill" 
            android_material_icon_name="error" 
            size={64} 
            color={colors.error} 
          />
          <Text style={styles.errorText}>Sesión no encontrada</Text>
          <TouchableOpacity
            style={[buttonStyles.primary, { marginTop: 20 }]}
            onPress={() => router.back()}
          >
            <Text style={buttonStyles.primaryText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const spotsRemaining = session.num_players - participants.length;
  const isReady = participants.length >= session.num_players;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleLeave} style={styles.backButton}>
          <IconSymbol 
            ios_icon_name="chevron.left" 
            android_material_icon_name="chevron_left" 
            size={24} 
            color={colors.text} 
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sala de Espera</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={[commonStyles.card, styles.gameInfoCard]}>
          <Text style={styles.gameName}>{session.tournament_games.name}</Text>
          <Text style={styles.sessionCode}>Código: {session.session_code}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Premio Total</Text>
              <Text style={styles.statValue}>{session.prize_amount.toFixed(2)} MXI</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Pool Acumulado</Text>
              <Text style={styles.statValue}>{session.total_pool.toFixed(2)} MXI</Text>
            </View>
          </View>
          
          <View style={styles.prizeNote}>
            <IconSymbol 
              ios_icon_name="trophy.fill" 
              android_material_icon_name="emoji_events" 
              size={16} 
              color={colors.success} 
            />
            <Text style={styles.prizeNoteText}>
              El ganador recibe el 100% del pool
            </Text>
          </View>
        </View>

        {countdown !== null && countdown > 0 && (
          <View style={[commonStyles.card, styles.countdownCard]}>
            <Text style={styles.countdownText}>El juego comienza en</Text>
            <Text style={styles.countdownNumber}>{countdown}</Text>
          </View>
        )}

        <View style={[commonStyles.card, styles.playersCard]}>
          <View style={styles.playersHeader}>
            <Text style={styles.playersTitle}>Jugadores</Text>
            <Text style={styles.playersCount}>
              {participants.length}/{session.num_players}
            </Text>
          </View>

          {participants.map((participant) => (
            <View key={participant.id} style={styles.playerItem}>
              <View style={styles.playerNumber}>
                <Text style={styles.playerNumberText}>{participant.player_number}</Text>
              </View>
              <View style={styles.playerInfo}>
                <Text style={styles.playerName}>{participant.users.name}</Text>
                <Text style={styles.playerEmail}>{participant.users.email}</Text>
              </View>
              {participant.user_id === user?.id && (
                <View style={styles.youBadge}>
                  <Text style={styles.youBadgeText}>TÚ</Text>
                </View>
              )}
              <IconSymbol 
                ios_icon_name="checkmark.circle.fill" 
                android_material_icon_name="check_circle" 
                size={24} 
                color={colors.success} 
              />
            </View>
          ))}

          {Array.from({ length: spotsRemaining }).map((_, index) => (
            <View key={`empty-${index}`} style={[styles.playerItem, styles.emptySlot]}>
              <View style={[styles.playerNumber, styles.emptyPlayerNumber]}>
                <Text style={styles.playerNumberText}>
                  {participants.length + index + 1}
                </Text>
              </View>
              <View style={styles.playerInfo}>
                <Text style={styles.emptyPlayerText}>Esperando jugador...</Text>
              </View>
              <IconSymbol 
                ios_icon_name="clock.fill" 
                android_material_icon_name="schedule" 
                size={24} 
                color={colors.textSecondary} 
              />
            </View>
          ))}
        </View>

        {!isReady && (
          <View style={[commonStyles.card, styles.waitingCard]}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.waitingText}>
              Esperando {spotsRemaining} jugador{spotsRemaining !== 1 ? 'es' : ''} más...
            </Text>
          </View>
        )}

        {isReady && countdown === null && (
          <View style={[commonStyles.card, styles.readyCard]}>
            <IconSymbol 
              ios_icon_name="checkmark.circle.fill" 
              android_material_icon_name="check_circle" 
              size={48} 
              color={colors.success} 
            />
            <Text style={styles.readyText}>¡Todos listos!</Text>
          </View>
        )}
      </View>
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
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: 20,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  gameInfoCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  gameName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  sessionCode: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  prizeNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.success + '10',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  prizeNoteText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '600',
  },
  countdownCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 20,
    backgroundColor: colors.primary + '20',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  countdownText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  countdownNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.primary,
  },
  playersCard: {
    marginBottom: 20,
  },
  playersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  playersTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  playersCount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  emptySlot: {
    opacity: 0.5,
  },
  playerNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyPlayerNumber: {
    backgroundColor: colors.border,
  },
  playerNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.background,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  playerEmail: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyPlayerText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  youBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  youBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.background,
  },
  waitingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    backgroundColor: colors.card,
  },
  waitingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  readyCard: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: colors.success + '20',
    borderWidth: 1,
    borderColor: colors.success,
  },
  readyText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.success,
    marginTop: 12,
  },
});
