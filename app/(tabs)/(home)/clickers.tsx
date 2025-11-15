
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';

interface ClickerCompetition {
  id: string;
  competition_number: number;
  entry_fee: number;
  max_participants: number;
  participants_count: number;
  total_pool: number;
  prize_amount: number;
  status: 'open' | 'locked' | 'completed';
  winner_user_id: string | null;
  completed_at: string | null;
  created_at: string;
  is_tiebreaker: boolean;
  parent_competition_id: string | null;
  tiebreaker_deadline: string | null;
  tiebreaker_status: 'waiting' | 'in_progress' | 'completed' | 'expired' | null;
}

interface Participant {
  id: string;
  user_id: string;
  clicks: number;
  has_played: boolean;
  played_at: string | null;
  joined_at: string;
  user_name?: string;
  is_tiebreaker_participant: boolean;
}

export default function ClickersScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [currentCompetition, setCurrentCompetition] = useState<ClickerCompetition | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [userParticipant, setUserParticipant] = useState<Participant | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [tiebreakerTimeLeft, setTiebreakerTimeLeft] = useState<number | null>(null);
  const [showStartPrompt, setShowStartPrompt] = useState(false);
  const [showPaymentSourceModal, setShowPaymentSourceModal] = useState(false);
  const [availableBalances, setAvailableBalances] = useState({ purchased: 0, commissions: 0 });
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const tiebreakerTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadCompetitionData();
    loadAvailableBalances();
    setupRealtimeSubscription();

    return () => {
      if (tiebreakerTimerRef.current) clearInterval(tiebreakerTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (currentCompetition && currentCompetition.status === 'open') {
      loadParticipants();

      if (currentCompetition.is_tiebreaker && currentCompetition.tiebreaker_deadline) {
        startTiebreakerCountdown();
      }
    }
  }, [currentCompetition]);

  const loadAvailableBalances = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('mxi_purchased_directly, mxi_from_unified_commissions')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error loading balances:', error);
        return;
      }
      
      setAvailableBalances({
        purchased: parseFloat(data.mxi_purchased_directly?.toString() || '0'),
        commissions: parseFloat(data.mxi_from_unified_commissions?.toString() || '0'),
      });
    } catch (error) {
      console.error('Exception loading balances:', error);
    }
  };

  const startTiebreakerCountdown = () => {
    if (!currentCompetition?.tiebreaker_deadline) return;

    const updateCountdown = () => {
      const deadline = new Date(currentCompetition.tiebreaker_deadline!);
      const now = new Date();
      const diffMs = deadline.getTime() - now.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);

      if (diffSeconds <= 0) {
        setTiebreakerTimeLeft(0);
        if (tiebreakerTimerRef.current) {
          clearInterval(tiebreakerTimerRef.current);
        }
        loadCompetitionData();
      } else {
        setTiebreakerTimeLeft(diffSeconds);
      }
    };

    updateCountdown();
    tiebreakerTimerRef.current = setInterval(updateCountdown, 1000);
  };

  const formatTiebreakerTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const setupRealtimeSubscription = async () => {
    const channel = supabase.channel('clicker:updates', {
      config: { private: false }
    });

    channel
      .on('broadcast', { event: 'INSERT' }, () => {
        console.log('Clicker competition created');
        loadCompetitionData();
      })
      .on('broadcast', { event: 'UPDATE' }, () => {
        console.log('Clicker competition updated');
        loadCompetitionData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const loadCompetitionData = async () => {
    try {
      setLoading(true);

      const { data: compData, error: compError } = await supabase
        .from('clicker_competitions')
        .select('*')
        .in('status', ['open', 'locked'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (compError && compError.code !== 'PGRST116') {
        console.error('Error loading competition:', compError);
      }

      if (compData) {
        setCurrentCompetition(compData);

        if (user) {
          const { data: partData, error: partError } = await supabase
            .from('clicker_participants')
            .select('*')
            .eq('competition_id', compData.id)
            .eq('user_id', user.id)
            .maybeSingle();

          if (partError && partError.code !== 'PGRST116') {
            console.error('Error loading participant:', partError);
          }

          setUserParticipant(partData);
        }
      } else {
        const { data: newCompId, error: createError } = await supabase
          .rpc('get_current_clicker_competition');

        if (createError) {
          console.error('Error creating competition:', createError);
        } else if (newCompId) {
          loadCompetitionData();
          return;
        }
      }
    } catch (error) {
      console.error('Exception loading competition data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadParticipants = async () => {
    if (!currentCompetition) return;

    try {
      const { data, error } = await supabase
        .from('clicker_participants')
        .select(`
          *,
          users!inner(name)
        `)
        .eq('competition_id', currentCompetition.id)
        .order('clicks', { ascending: false });

      if (error) {
        console.error('Error loading participants:', error);
        return;
      }

      const participantsWithNames = data.map((p: any) => ({
        ...p,
        user_name: p.users?.name || 'Unknown',
      }));

      setParticipants(participantsWithNames);
    } catch (error) {
      console.error('Exception loading participants:', error);
    }
  };

  const handleJoinCompetition = async () => {
    if (!user || !currentCompetition) return;

    // Tiebreakers have no entry fee
    if (currentCompetition.is_tiebreaker) {
      proceedWithJoin();
      return;
    }

    // Check available balance
    const totalAvailable = availableBalances.purchased + availableBalances.commissions;
    if (totalAvailable < currentCompetition.entry_fee) {
      Alert.alert(
        '💰 Saldo Insuficiente',
        `Necesitas ${currentCompetition.entry_fee} MXI para unirte.\n\n` +
        `💎 MXI Comprados: ${availableBalances.purchased.toFixed(2)}\n` +
        `👥 MXI por Referidos: ${availableBalances.commissions.toFixed(2)}\n` +
        `📊 Total Disponible: ${totalAvailable.toFixed(2)} MXI\n\n` +
        `⚠️ Solo puedes usar MXI comprados con USDT o de comisiones unificadas para retos.`
      );
      return;
    }

    // Show payment source selection modal
    setShowPaymentSourceModal(true);
  };

  const proceedWithJoin = async () => {
    if (!user || !currentCompetition) return;

    setShowPaymentSourceModal(false);
    
    try {
      setJoining(true);

      const { data, error } = await supabase.rpc('join_clicker_competition', {
        p_user_id: user.id,
      });

      if (error) {
        console.error('Join error:', error);
        Alert.alert('❌ Error', error.message || 'No se pudo unir a la competencia');
        return;
      }

      if (!data.success) {
        Alert.alert('❌ Error', data.error || 'No se pudo unir a la competencia');
        return;
      }

      await loadCompetitionData();
      await loadAvailableBalances();
      setShowStartPrompt(true);
      
      Alert.alert(
        '✅ ¡Éxito!', 
        '¡Te has unido a la competencia! ¿Listo para jugar?',
        [
          { 
            text: 'Todavía no', 
            style: 'cancel',
            onPress: () => setShowStartPrompt(true)
          },
          {
            text: '¡Empezar Ahora!',
            onPress: () => {
              setShowStartPrompt(false);
              startGame();
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Join exception:', error);
      Alert.alert('❌ Error', error.message || 'No se pudo unir a la competencia');
    } finally {
      setJoining(false);
    }
  };

  const startGame = () => {
    setShowStartPrompt(false);
    setIsPlaying(true);
    setClicks(0);
    setTimeLeft(15);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endGame = async () => {
    setIsPlaying(false);

    if (!user || !currentCompetition || !userParticipant) return;

    try {
      const { data, error } = await supabase.rpc('submit_clicker_score', {
        p_participant_id: userParticipant.id,
        p_clicks: clicks,
      });

      if (error) {
        console.error('Submit score error:', error);
        Alert.alert('❌ Error', 'No se pudo enviar la puntuación');
        return;
      }

      if (!data.success) {
        Alert.alert('❌ Error', data.error || 'No se pudo enviar la puntuación');
        return;
      }

      if (data.tie) {
        Alert.alert(
          '🤝 ¡Empate!',
          `¡Empataste con ${data.tied_count - 1} jugador(es) más! Se ha creado una ronda de desempate. Tienes 10 minutos para completarla.`
        );
      } else if (data.winner_id === user?.id) {
        Alert.alert('🏆 ¡Ganaste!', `¡Felicidades! Ganaste ${data.prize_amount.toFixed(2)} MXI!`);
      } else {
        Alert.alert('✅ Puntuación Enviada', `¡Hiciste ${clicks} clics!`);
      }

      await loadCompetitionData();
      await loadParticipants();
    } catch (error: any) {
      console.error('Submit score exception:', error);
      Alert.alert('❌ Error', error.message || 'No se pudo enviar la puntuación');
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

  const getProgressPercentage = () => {
    if (!currentCompetition) return 0;
    return (currentCompetition.participants_count / currentCompetition.max_participants) * 100;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol ios_icon_name="chevron.left" android_material_icon_name="arrow_back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Clickers</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando competencia...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentCompetition) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol ios_icon_name="chevron.left" android_material_icon_name="arrow_back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Clickers</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay competencia activa</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalAvailable = availableBalances.purchased + availableBalances.commissions;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol ios_icon_name="chevron.left" android_material_icon_name="arrow_back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Clickers</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/(home)/challenge-history')}>
          <IconSymbol
            ios_icon_name="clock.arrow.circlepath"
            android_material_icon_name="history"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Available Balance Card */}
        <View style={[commonStyles.card, styles.balanceCard]}>
          <Text style={styles.balanceTitle}>💰 Saldo Disponible para Retos</Text>
          <Text style={styles.balanceAmount}>{totalAvailable.toFixed(2)} MXI</Text>
          <View style={styles.balanceBreakdown}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>💎 MXI Comprados</Text>
              <Text style={styles.balanceValue}>{availableBalances.purchased.toFixed(2)}</Text>
            </View>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>👥 MXI por Referidos</Text>
              <Text style={styles.balanceValue}>{availableBalances.commissions.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Tiebreaker Warning */}
        {currentCompetition.is_tiebreaker && tiebreakerTimeLeft !== null && tiebreakerTimeLeft > 0 && (
          <View style={[commonStyles.card, styles.tiebreakerWarning]}>
            <View style={styles.warningHeader}>
              <Text style={styles.warningEmoji}>⚠️</Text>
              <Text style={styles.warningTitle}>RONDA DE DESEMPATE</Text>
            </View>
            <Text style={styles.warningText}>
              Esta es una ronda de desempate. Debes completarla dentro de:
            </Text>
            <Text style={styles.tiebreakerTimer}>{formatTiebreakerTime(tiebreakerTimeLeft)}</Text>
            <Text style={styles.warningSubtext}>
              Si no juegas dentro de este tiempo, tu puntuación será 0 y perderás.
            </Text>
          </View>
        )}

        {/* Competition Card */}
        <View style={[commonStyles.card, styles.competitionCard]}>
          <View style={styles.competitionHeader}>
            <View style={styles.competitionIconContainer}>
              <Text style={styles.competitionIconEmoji}>
                {currentCompetition.is_tiebreaker ? '⚔️' : '👆'}
              </Text>
            </View>
            <View style={styles.competitionHeaderText}>
              <Text style={styles.competitionTitle}>
                {currentCompetition.is_tiebreaker ? 'Desempate' : `Competencia #${currentCompetition.competition_number}`}
              </Text>
              <Text style={styles.competitionStatus}>
                {currentCompetition.status === 'open' ? '🟢 Abierta' : '🔒 Cerrada'}
              </Text>
            </View>
          </View>

          <View style={styles.prizeContainer}>
            <Text style={styles.prizeLabel}>Premio (90%)</Text>
            <Text style={styles.prizeAmount}>{currentCompetition.prize_amount.toFixed(2)} MXI</Text>
            <Text style={styles.totalPool}>Pozo Total: {currentCompetition.total_pool.toFixed(2)} MXI</Text>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Participantes</Text>
              <Text style={styles.progressValue}>
                {currentCompetition.participants_count} / {currentCompetition.max_participants}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${getProgressPercentage()}%` }]} />
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Entrada</Text>
              <Text style={styles.statValue}>
                {currentCompetition.is_tiebreaker ? 'GRATIS' : `${currentCompetition.entry_fee} MXI`}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Tu Saldo</Text>
              <Text style={styles.statValue}>{totalAvailable.toFixed(2)} MXI</Text>
            </View>
          </View>
        </View>

        {/* Game Section */}
        {userParticipant ? (
          userParticipant.has_played ? (
            <View style={commonStyles.card}>
              <Text style={styles.sectionTitle}>Tu Puntuación</Text>
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreValue}>{userParticipant.clicks}</Text>
                <Text style={styles.scoreLabel}>clics</Text>
              </View>
              <Text style={styles.waitingText}>
                Esperando a que todos los participantes completen...
              </Text>
            </View>
          ) : (
            <View style={commonStyles.card}>
              <Text style={styles.sectionTitle}>Desafío de Clics</Text>
              {isPlaying ? (
                <React.Fragment>
                  <View style={styles.timerContainer}>
                    <Text style={styles.timerText}>{timeLeft}s</Text>
                  </View>
                  <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                    <TouchableOpacity
                      style={styles.clickButton}
                      onPress={handleClick}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.clickButtonText}>¡TOCA!</Text>
                    </TouchableOpacity>
                  </Animated.View>
                  <View style={styles.clicksContainer}>
                    <Text style={styles.clicksValue}>{clicks}</Text>
                    <Text style={styles.clicksLabel}>clics</Text>
                  </View>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  {showStartPrompt && (
                    <View style={styles.startPromptContainer}>
                      <Text style={styles.startPromptEmoji}>🎮</Text>
                      <Text style={styles.startPromptTitle}>¡Listo para Jugar!</Text>
                      <Text style={styles.startPromptText}>
                        Te has unido exitosamente a la competencia. ¡Inicia el desafío cuando estés listo!
                      </Text>
                    </View>
                  )}
                  <Text style={styles.instructionText}>
                    ¡Haz clic en el botón tantas veces como puedas en 15 segundos!
                  </Text>
                  <TouchableOpacity
                    style={[buttonStyles.primary, styles.startButton]}
                    onPress={startGame}
                  >
                    <Text style={buttonStyles.primaryText}>Iniciar Desafío</Text>
                  </TouchableOpacity>
                </React.Fragment>
              )}
            </View>
          )
        ) : (
          currentCompetition.status === 'open' && (
            <View style={commonStyles.card}>
              <Text style={styles.sectionTitle}>
                {currentCompetition.is_tiebreaker ? 'Unirse al Desempate' : 'Unirse a la Competencia'}
              </Text>
              <Text style={styles.joinText}>
                {currentCompetition.is_tiebreaker
                  ? '¡Únete a esta ronda de desempate y compite por el premio! No se requiere entrada.'
                  : `¡Únete a esta competencia por ${currentCompetition.entry_fee} MXI y compite por el premio!`}
              </Text>
              <TouchableOpacity
                style={[buttonStyles.primary, styles.joinButton]}
                onPress={handleJoinCompetition}
                disabled={joining}
              >
                {joining ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={buttonStyles.primaryText}>Unirse Ahora</Text>
                )}
              </TouchableOpacity>
            </View>
          )
        )}

        {/* Leaderboard */}
        {participants.length > 0 && (
          <View style={commonStyles.card}>
            <Text style={styles.sectionTitle}>Tabla de Posiciones</Text>
            <View style={styles.leaderboardList}>
              {participants.map((participant, index) => (
                <View key={participant.id} style={styles.leaderboardItem}>
                  <View style={styles.leaderboardRank}>
                    <Text style={styles.leaderboardRankText}>#{index + 1}</Text>
                  </View>
                  <View style={styles.leaderboardInfo}>
                    <Text style={styles.leaderboardName}>
                      {participant.user_name}
                      {participant.user_id === user?.id && ' (Tú)'}
                    </Text>
                    <Text style={styles.leaderboardClicks}>
                      {participant.has_played ? `${participant.clicks} clics` : 'No ha jugado'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* How It Works */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Cómo Funciona</Text>
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>1.</Text>
              <Text style={styles.infoText}>La entrada es de 10 MXI por competencia</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>2.</Text>
              <Text style={styles.infoText}>Solo puedes usar MXI comprados o de comisiones unificadas</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>3.</Text>
              <Text style={styles.infoText}>Haz clic en "Unirse Ahora" para entrar a la competencia</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>4.</Text>
              <Text style={styles.infoText}>Inicia el juego cuando estés listo para jugar</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>5.</Text>
              <Text style={styles.infoText}>La tabla de posiciones se actualiza en tiempo real</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>6.</Text>
              <Text style={styles.infoText}>La puntuación más alta gana el 90% del pozo</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>7.</Text>
              <Text style={styles.infoText}>Los empates activan rondas de desempate automáticas</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>8.</Text>
              <Text style={styles.infoText}>Desempate: 10 min para jugar o la puntuación se vuelve 0</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>9.</Text>
              <Text style={styles.infoText}>Todos los resultados se almacenan por 10 días en tu historial</Text>
            </View>
          </View>
        </View>
      </ScrollView>

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
              <Text style={styles.modalTitle}>💰 Seleccionar Fuente de Pago</Text>
              <TouchableOpacity onPress={() => setShowPaymentSourceModal(false)}>
                <IconSymbol ios_icon_name="xmark.circle.fill" android_material_icon_name="cancel" size={28} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalSubtitle}>
                Entrada requerida: {currentCompetition.entry_fee} MXI
              </Text>

              <Text style={styles.modalInfo}>
                ℹ️ El pago se descontará automáticamente de tus saldos disponibles en el siguiente orden:
              </Text>

              <View style={styles.paymentSourceCard}>
                <View style={styles.paymentSourceHeader}>
                  <IconSymbol ios_icon_name="cart.fill" android_material_icon_name="shopping_cart" size={24} color={colors.primary} />
                  <Text style={styles.paymentSourceTitle}>1. MXI Comprados</Text>
                </View>
                <Text style={styles.paymentSourceAmount}>{availableBalances.purchased.toFixed(2)} MXI</Text>
                <Text style={styles.paymentSourceNote}>Primero se usará este saldo</Text>
              </View>

              <View style={styles.paymentSourceCard}>
                <View style={styles.paymentSourceHeader}>
                  <IconSymbol ios_icon_name="person.3.fill" android_material_icon_name="group" size={24} color={colors.success} />
                  <Text style={styles.paymentSourceTitle}>2. MXI por Referidos</Text>
                </View>
                <Text style={styles.paymentSourceAmount}>{availableBalances.commissions.toFixed(2)} MXI</Text>
                <Text style={styles.paymentSourceNote}>Se usará si el saldo comprado no es suficiente</Text>
              </View>

              <View style={styles.totalAvailableCard}>
                <Text style={styles.totalAvailableLabel}>Total Disponible</Text>
                <Text style={styles.totalAvailableAmount}>{totalAvailable.toFixed(2)} MXI</Text>
              </View>

              <TouchableOpacity
                style={[buttonStyles.primary, styles.confirmButton]}
                onPress={proceedWithJoin}
                disabled={joining}
              >
                {joining ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={buttonStyles.primaryText}>✅ Confirmar y Unirse</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[buttonStyles.outline, styles.cancelButton]}
                onPress={() => setShowPaymentSourceModal(false)}
              >
                <Text style={buttonStyles.outlineText}>Cancelar</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
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
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  balanceCard: {
    marginBottom: 16,
    backgroundColor: colors.highlight,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  balanceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  balanceBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  balanceItem: {
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  tiebreakerWarning: {
    backgroundColor: colors.warning + '20',
    borderWidth: 2,
    borderColor: colors.warning,
    marginBottom: 20,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  warningEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.warning,
  },
  warningText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
    lineHeight: 20,
  },
  tiebreakerTimer: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.warning,
    textAlign: 'center',
    marginVertical: 12,
  },
  warningSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  competitionCard: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  competitionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  competitionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  competitionIconEmoji: {
    fontSize: 32,
  },
  competitionHeaderText: {
    flex: 1,
  },
  competitionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  competitionStatus: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  prizeContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  prizeLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  prizeAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  totalPool: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  progressSection: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  scoreContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.primary,
  },
  scoreLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
  },
  waitingText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
  startPromptContainer: {
    alignItems: 'center',
    backgroundColor: colors.success + '20',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.success,
  },
  startPromptEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  startPromptTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.success,
    marginBottom: 8,
  },
  startPromptText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 20,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.primary,
  },
  clickButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)',
  },
  clickButtonText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#000',
  },
  clicksContainer: {
    alignItems: 'center',
  },
  clicksValue: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.text,
  },
  clicksLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  instructionText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  startButton: {
    marginTop: 8,
  },
  joinText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  joinButton: {
    marginTop: 8,
  },
  leaderboardList: {
    gap: 12,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  leaderboardRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  leaderboardRankText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  leaderboardClicks: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  infoList: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoBullet: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginRight: 12,
    width: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  modalBody: {
    padding: 24,
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInfo: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  paymentSourceCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  paymentSourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  paymentSourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  paymentSourceAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  paymentSourceNote: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  totalAvailableCard: {
    backgroundColor: colors.primary + '20',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
  totalAvailableLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  totalAvailableAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
  },
  confirmButton: {
    marginBottom: 12,
  },
  cancelButton: {
    marginBottom: 8,
  },
});
