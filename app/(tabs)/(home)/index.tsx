
import VestingCounter from '@/components/VestingCounter';
import LaunchCountdown from '@/components/LaunchCountdown';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { IconSymbol } from '@/components/IconSymbol';
import YieldDisplay from '@/components/YieldDisplay';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors, commonStyles } from '@/styles/commonStyles';

interface PhaseData {
  totalTokensSold: number;
  currentPhase: number;
  currentPriceUsdt: number;
  phase1TokensSold: number;
  phase2TokensSold: number;
  phase3TokensSold: number;
}

interface ReferralMetrics {
  level1Count: number;
  level2Count: number;
  level3Count: number;
  level1Earnings: number;
  level2Earnings: number;
  level3Earnings: number;
  totalEarnings: number;
  pendingCommissions: number;
  availableToWithdraw: number;
}

interface ChallengeMetrics {
  totalGamesPlayed: number;
  totalWins: number;
  totalLosses: number;
  totalEarnings: number;
  winRate: number;
  averageEarnings: number;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'commission' | 'game_win' | 'game_loss';
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  description: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const { user, getCurrentYield, claimYield, checkAdminStatus } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [currentYield, setCurrentYield] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [phaseData, setPhaseData] = useState<PhaseData | null>(null);
  const [referralMetrics, setReferralMetrics] = useState<ReferralMetrics | null>(null);
  const [challengeMetrics, setChallengeMetrics] = useState<ChallengeMetrics | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  useEffect(() => {
    loadData();
    checkAdmin();
    
    const interval = setInterval(() => {
      if (user) {
        setCurrentYield(getCurrentYield());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    console.log('Loading home screen data...');
    setCurrentYield(getCurrentYield());
    
    // Load metrics data
    const { data: metricsData, error: metricsError } = await supabase
      .from('metrics')
      .select('*')
      .single();
    
    if (metricsError) {
      console.error('Error loading metrics:', metricsError);
    } else if (metricsData) {
      console.log('Metrics loaded:', metricsData);
      setPhaseData({
        totalTokensSold: parseFloat(metricsData.total_tokens_sold || '0'),
        currentPhase: metricsData.current_phase || 1,
        currentPriceUsdt: parseFloat(metricsData.current_price_usdt || '0'),
        phase1TokensSold: parseFloat(metricsData.phase_1_tokens_sold || '0'),
        phase2TokensSold: parseFloat(metricsData.phase_2_tokens_sold || '0'),
        phase3TokensSold: parseFloat(metricsData.phase_3_tokens_sold || '0'),
      });
    }

    // Load referral metrics
    await loadReferralMetrics();

    // Load challenge metrics
    await loadChallengeMetrics();

    // Load transaction history
    await loadTransactionHistory();
  };

  const loadReferralMetrics = async () => {
    if (!user) return;

    try {
      // Get referral counts by level
      const { data: referrals, error: refError } = await supabase
        .from('referrals')
        .select('level, referred_id')
        .eq('referrer_id', user.id);

      if (refError) throw refError;

      // Count referrals by level
      const level1Count = referrals?.filter(r => r.level === 1).length || 0;
      const level2Count = referrals?.filter(r => r.level === 2).length || 0;
      const level3Count = referrals?.filter(r => r.level === 3).length || 0;

      // Get commission earnings by level
      const { data: commissions, error: commError } = await supabase
        .from('commissions')
        .select('level, amount, status')
        .eq('user_id', user.id);

      if (commError) throw commError;

      const level1Earnings = commissions?.filter(c => c.level === 1).reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0) || 0;
      const level2Earnings = commissions?.filter(c => c.level === 2).reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0) || 0;
      const level3Earnings = commissions?.filter(c => c.level === 3).reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0) || 0;
      const totalEarnings = level1Earnings + level2Earnings + level3Earnings;

      const pendingCommissions = commissions?.filter(c => c.status === 'pending').reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0) || 0;
      const availableToWithdraw = commissions?.filter(c => c.status === 'available').reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0) || 0;

      setReferralMetrics({
        level1Count,
        level2Count,
        level3Count,
        level1Earnings,
        level2Earnings,
        level3Earnings,
        totalEarnings,
        pendingCommissions,
        availableToWithdraw,
      });
    } catch (error) {
      console.error('Error loading referral metrics:', error);
    }
  };

  const loadChallengeMetrics = async () => {
    if (!user) return;

    try {
      // Get challenge history
      const { data: challenges, error: chalError } = await supabase
        .from('challenge_history')
        .select('result, amount_won, amount_lost')
        .eq('user_id', user.id);

      if (chalError) throw chalError;

      // Get game results
      const { data: gameResults, error: gameError } = await supabase
        .from('game_results')
        .select('rank, prize_won')
        .eq('user_id', user.id);

      if (gameError) throw gameError;

      const totalGamesPlayed = (challenges?.length || 0) + (gameResults?.length || 0);
      const challengeWins = challenges?.filter(c => c.result === 'win').length || 0;
      const gameWins = gameResults?.filter(g => g.rank === 1).length || 0;
      const totalWins = challengeWins + gameWins;
      const totalLosses = totalGamesPlayed - totalWins;

      const challengeEarnings = challenges?.reduce((sum, c) => sum + parseFloat(c.amount_won?.toString() || '0'), 0) || 0;
      const gameEarnings = gameResults?.reduce((sum, g) => sum + parseFloat(g.prize_won?.toString() || '0'), 0) || 0;
      const totalEarnings = challengeEarnings + gameEarnings;

      const winRate = totalGamesPlayed > 0 ? (totalWins / totalGamesPlayed) * 100 : 0;
      const averageEarnings = totalGamesPlayed > 0 ? totalEarnings / totalGamesPlayed : 0;

      setChallengeMetrics({
        totalGamesPlayed,
        totalWins,
        totalLosses,
        totalEarnings,
        winRate,
        averageEarnings,
      });
    } catch (error) {
      console.error('Error loading challenge metrics:', error);
    } finally {
      setLoadingMetrics(false);
    }
  };

  const loadTransactionHistory = async () => {
    if (!user) return;

    try {
      const transactionList: Transaction[] = [];

      // Get withdrawals
      const { data: withdrawals, error: wError } = await supabase
        .from('withdrawals')
        .select('id, amount, currency, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!wError && withdrawals) {
        withdrawals.forEach(w => {
          transactionList.push({
            id: w.id,
            type: 'withdrawal',
            amount: parseFloat(w.amount.toString()),
            currency: w.currency,
            status: w.status,
            created_at: w.created_at,
            description: `Retiro de ${w.currency}`,
          });
        });
      }

      // Get contributions (deposits)
      const { data: contributions, error: cError } = await supabase
        .from('contributions')
        .select('id, usdt_amount, mxi_amount, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!cError && contributions) {
        contributions.forEach(c => {
          transactionList.push({
            id: c.id,
            type: 'deposit',
            amount: parseFloat(c.usdt_amount.toString()),
            currency: 'USDT',
            status: c.status,
            created_at: c.created_at,
            description: `Depósito - ${parseFloat(c.mxi_amount.toString()).toFixed(2)} MXI`,
          });
        });
      }

      // Get commissions
      const { data: commissions, error: comError } = await supabase
        .from('commissions')
        .select('id, amount, level, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!comError && commissions) {
        commissions.forEach(c => {
          transactionList.push({
            id: c.id,
            type: 'commission',
            amount: parseFloat(c.amount.toString()),
            currency: 'MXI',
            status: c.status,
            created_at: c.created_at,
            description: `Comisión Nivel ${c.level}`,
          });
        });
      }

      // Get game results
      const { data: gameResults, error: gError } = await supabase
        .from('game_results')
        .select('id, prize_won, rank, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!gError && gameResults) {
        gameResults.forEach(g => {
          const prizeWon = parseFloat(g.prize_won?.toString() || '0');
          transactionList.push({
            id: g.id,
            type: prizeWon > 0 ? 'game_win' : 'game_loss',
            amount: prizeWon,
            currency: 'MXI',
            status: 'completed',
            created_at: g.created_at,
            description: g.rank === 1 ? `Victoria en Reto - Puesto ${g.rank}` : `Reto Completado - Puesto ${g.rank}`,
          });
        });
      }

      // Sort by date and take last 5
      transactionList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setTransactions(transactionList.slice(0, 5));
    } catch (error) {
      console.error('Error loading transaction history:', error);
    }
  };

  const checkAdmin = async () => {
    const adminStatus = await checkAdminStatus();
    setIsAdmin(adminStatus);
    console.log('Admin status:', adminStatus);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleClaimYield = async () => {
    if (currentYield === 0) {
      Alert.alert('No Yield', 'No yield available to claim yet');
      return;
    }

    Alert.alert(
      'Claim Yield',
      `Claim ${currentYield.toFixed(6)} MXI yield?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Claim',
          onPress: async () => {
            const result = await claimYield();
            if (result.success) {
              Alert.alert('Success', `Claimed ${result.yieldEarned?.toFixed(6)} MXI!`);
              setCurrentYield(0);
            } else {
              Alert.alert('Error', result.error || 'Failed to claim yield');
            }
          },
        },
      ]
    );
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`;
    }
    return num.toFixed(0);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return { ios: 'arrow.down.circle.fill', android: 'arrow_circle_down', color: colors.success };
      case 'withdrawal':
        return { ios: 'arrow.up.circle.fill', android: 'arrow_circle_up', color: colors.error };
      case 'commission':
        return { ios: 'person.3.fill', android: 'group', color: colors.warning };
      case 'game_win':
        return { ios: 'trophy.fill', android: 'emoji_events', color: colors.accent };
      case 'game_loss':
        return { ios: 'gamecontroller.fill', android: 'sports_esports', color: colors.textSecondary };
      default:
        return { ios: 'circle.fill', android: 'circle', color: colors.textSecondary };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'failed':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate MXI breakdown
  const mxiPurchased = user.mxiPurchasedDirectly || 0;
  const mxiFromCommissions = user.mxiFromUnifiedCommissions || 0;
  const mxiFromChallenges = (user as any).mxi_from_challenges || 0;
  const mxiVestingLocked = (user as any).mxi_vesting_locked || 0;
  const totalMxiBalance = mxiPurchased + mxiFromCommissions + mxiFromChallenges + mxiVestingLocked;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bienvenido,</Text>
            <Text style={styles.userName}>{user.name}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <IconSymbol ios_icon_name="person.circle.fill" android_material_icon_name="account_circle" size={40} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Countdown to Launch */}
        <LaunchCountdown />

        {/* MXI Balance with Breakdown */}
        <View style={[commonStyles.card, styles.balanceCard]}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Balance Total MXI</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/(home)/vesting')}>
              <IconSymbol ios_icon_name="info.circle" android_material_icon_name="info" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceAmount}>{totalMxiBalance.toFixed(2)}</Text>
          <Text style={styles.balanceCurrency}>MXI</Text>
          
          <View style={styles.balanceDivider} />
          
          {/* MXI Breakdown Table */}
          <View style={styles.breakdownContainer}>
            <Text style={styles.breakdownTitle}>Desglose de Balance</Text>
            
            <View style={styles.breakdownRow}>
              <View style={styles.breakdownItem}>
                <IconSymbol 
                  ios_icon_name="cart.fill" 
                  android_material_icon_name="shopping_cart" 
                  size={20} 
                  color={colors.primary} 
                />
                <View style={styles.breakdownText}>
                  <Text style={styles.breakdownLabel}>MXI Comprados</Text>
                  <Text style={styles.breakdownSubtext}>Disponible para retos</Text>
                </View>
              </View>
              <Text style={styles.breakdownValue}>{mxiPurchased.toFixed(2)}</Text>
            </View>

            <View style={styles.breakdownRow}>
              <View style={styles.breakdownItem}>
                <IconSymbol 
                  ios_icon_name="person.3.fill" 
                  android_material_icon_name="group" 
                  size={20} 
                  color={colors.success} 
                />
                <View style={styles.breakdownText}>
                  <Text style={styles.breakdownLabel}>MXI por Referidos</Text>
                  <Text style={styles.breakdownSubtext}>De comisiones unificadas</Text>
                </View>
              </View>
              <Text style={styles.breakdownValue}>{mxiFromCommissions.toFixed(2)}</Text>
            </View>

            <View style={styles.breakdownRow}>
              <View style={styles.breakdownItem}>
                <IconSymbol 
                  ios_icon_name="trophy.fill" 
                  android_material_icon_name="emoji_events" 
                  size={20} 
                  color={colors.warning} 
                />
                <View style={styles.breakdownText}>
                  <Text style={styles.breakdownLabel}>MXI por Retos</Text>
                  <Text style={styles.breakdownSubtext}>Ganados en competencias</Text>
                </View>
              </View>
              <Text style={styles.breakdownValue}>{mxiFromChallenges.toFixed(2)}</Text>
            </View>

            <View style={styles.breakdownRow}>
              <View style={styles.breakdownItem}>
                <IconSymbol 
                  ios_icon_name="lock.fill" 
                  android_material_icon_name="lock" 
                  size={20} 
                  color={colors.accent} 
                />
                <View style={styles.breakdownText}>
                  <Text style={styles.breakdownLabel}>MXI Vesting</Text>
                  <Text style={styles.breakdownSubtext}>Bloqueado hasta lanzamiento</Text>
                </View>
              </View>
              <Text style={styles.breakdownValue}>{mxiVestingLocked.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Vesting Counter - POSITIONED BELOW MXI BALANCE */}
        <VestingCounter />

        {/* MXI Sold Display - ONLY SHOW MXI SOLD, NOT USER COUNT */}
        {phaseData && (
          <View style={[commonStyles.card, styles.statsCard]}>
            <Text style={styles.statsTitle}>Estadísticas de Pre-Venta</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <IconSymbol ios_icon_name="chart.bar.fill" android_material_icon_name="bar_chart" size={24} color={colors.primary} />
                <Text style={styles.statValue}>{formatNumber(phaseData.totalTokensSold)}</Text>
                <Text style={styles.statLabel}>MXI Vendidos</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <IconSymbol ios_icon_name="person.2.fill" android_material_icon_name="people" size={24} color={colors.success} />
                <Text style={styles.statValue}>{user.activeReferrals}</Text>
                <Text style={styles.statLabel}>Referidos Activos</Text>
              </View>
            </View>
          </View>
        )}

        {/* Referral Metrics */}
        {loadingMetrics ? (
          <View style={[commonStyles.card, styles.loadingCard]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Cargando métricas...</Text>
          </View>
        ) : (
          <React.Fragment>
            <View style={[commonStyles.card, styles.metricsCard]}>
              <View style={styles.metricsHeader}>
                <IconSymbol 
                  ios_icon_name="person.3.fill" 
                  android_material_icon_name="group" 
                  size={28} 
                  color={colors.success} 
                />
                <Text style={styles.metricsTitle}>📊 Métricas de Referidos</Text>
              </View>

              <View style={styles.metricsGrid}>
                <View style={styles.metricItem}>
                  <View style={[styles.metricBadge, { backgroundColor: colors.success + '20' }]}>
                    <Text style={[styles.metricBadgeText, { color: colors.success }]}>Nivel 1</Text>
                  </View>
                  <Text style={styles.metricValue}>{referralMetrics?.level1Count || 0}</Text>
                  <Text style={styles.metricLabel}>Referidos</Text>
                  <Text style={styles.metricEarnings}>{(referralMetrics?.level1Earnings || 0).toFixed(2)} MXI</Text>
                  <Text style={styles.metricPercentage}>5% comisión</Text>
                </View>

                <View style={styles.metricItem}>
                  <View style={[styles.metricBadge, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.metricBadgeText, { color: colors.primary }]}>Nivel 2</Text>
                  </View>
                  <Text style={styles.metricValue}>{referralMetrics?.level2Count || 0}</Text>
                  <Text style={styles.metricLabel}>Referidos</Text>
                  <Text style={styles.metricEarnings}>{(referralMetrics?.level2Earnings || 0).toFixed(2)} MXI</Text>
                  <Text style={styles.metricPercentage}>2% comisión</Text>
                </View>

                <View style={styles.metricItem}>
                  <View style={[styles.metricBadge, { backgroundColor: colors.warning + '20' }]}>
                    <Text style={[styles.metricBadgeText, { color: colors.warning }]}>Nivel 3</Text>
                  </View>
                  <Text style={styles.metricValue}>{referralMetrics?.level3Count || 0}</Text>
                  <Text style={styles.metricLabel}>Referidos</Text>
                  <Text style={styles.metricEarnings}>{(referralMetrics?.level3Earnings || 0).toFixed(2)} MXI</Text>
                  <Text style={styles.metricPercentage}>1% comisión</Text>
                </View>
              </View>

              <View style={styles.metricsSummary}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Ganado</Text>
                  <Text style={[styles.summaryValue, { color: colors.success }]}>
                    {(referralMetrics?.totalEarnings || 0).toFixed(2)} MXI
                  </Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Pendiente</Text>
                  <Text style={[styles.summaryValue, { color: colors.warning }]}>
                    {(referralMetrics?.pendingCommissions || 0).toFixed(2)} MXI
                  </Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Disponible</Text>
                  <Text style={[styles.summaryValue, { color: colors.accent }]}>
                    {(referralMetrics?.availableToWithdraw || 0).toFixed(2)} MXI
                  </Text>
                </View>
              </View>
            </View>

            {/* Challenge Metrics */}
            <View style={[commonStyles.card, styles.metricsCard]}>
              <View style={styles.metricsHeader}>
                <IconSymbol 
                  ios_icon_name="trophy.fill" 
                  android_material_icon_name="emoji_events" 
                  size={28} 
                  color={colors.warning} 
                />
                <Text style={styles.metricsTitle}>🎮 Métricas de Retos</Text>
              </View>

              <View style={styles.challengeStats}>
                <View style={styles.challengeStatRow}>
                  <View style={styles.challengeStatItem}>
                    <IconSymbol 
                      ios_icon_name="gamecontroller.fill" 
                      android_material_icon_name="sports_esports" 
                      size={24} 
                      color={colors.primary} 
                    />
                    <View style={styles.challengeStatText}>
                      <Text style={styles.challengeStatValue}>{challengeMetrics?.totalGamesPlayed || 0}</Text>
                      <Text style={styles.challengeStatLabel}>Juegos Totales</Text>
                    </View>
                  </View>

                  <View style={styles.challengeStatItem}>
                    <IconSymbol 
                      ios_icon_name="checkmark.circle.fill" 
                      android_material_icon_name="check_circle" 
                      size={24} 
                      color={colors.success} 
                    />
                    <View style={styles.challengeStatText}>
                      <Text style={[styles.challengeStatValue, { color: colors.success }]}>
                        {challengeMetrics?.totalWins || 0}
                      </Text>
                      <Text style={styles.challengeStatLabel}>Victorias</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.challengeStatRow}>
                  <View style={styles.challengeStatItem}>
                    <IconSymbol 
                      ios_icon_name="xmark.circle.fill" 
                      android_material_icon_name="cancel" 
                      size={24} 
                      color={colors.error} 
                    />
                    <View style={styles.challengeStatText}>
                      <Text style={[styles.challengeStatValue, { color: colors.error }]}>
                        {challengeMetrics?.totalLosses || 0}
                      </Text>
                      <Text style={styles.challengeStatLabel}>Derrotas</Text>
                    </View>
                  </View>

                  <View style={styles.challengeStatItem}>
                    <IconSymbol 
                      ios_icon_name="percent" 
                      android_material_icon_name="percent" 
                      size={24} 
                      color={colors.accent} 
                    />
                    <View style={styles.challengeStatText}>
                      <Text style={[styles.challengeStatValue, { color: colors.accent }]}>
                        {(challengeMetrics?.winRate || 0).toFixed(1)}%
                      </Text>
                      <Text style={styles.challengeStatLabel}>Tasa de Victoria</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.challengeEarnings}>
                <View style={styles.earningsItem}>
                  <Text style={styles.earningsLabel}>Total Ganado</Text>
                  <Text style={[styles.earningsValue, { color: colors.success }]}>
                    {(challengeMetrics?.totalEarnings || 0).toFixed(2)} MXI
                  </Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.earningsItem}>
                  <Text style={styles.earningsLabel}>Promedio por Juego</Text>
                  <Text style={[styles.earningsValue, { color: colors.primary }]}>
                    {(challengeMetrics?.averageEarnings || 0).toFixed(2)} MXI
                  </Text>
                </View>
              </View>
            </View>

            {/* Transaction History */}
            <View style={[commonStyles.card, styles.transactionsCard]}>
              <View style={styles.transactionsHeader}>
                <IconSymbol 
                  ios_icon_name="list.bullet.rectangle" 
                  android_material_icon_name="receipt_long" 
                  size={28} 
                  color={colors.accent} 
                />
                <Text style={styles.transactionsTitle}>📜 Últimas Transacciones</Text>
              </View>

              {transactions.length === 0 ? (
                <View style={styles.emptyState}>
                  <IconSymbol 
                    ios_icon_name="tray" 
                    android_material_icon_name="inbox" 
                    size={48} 
                    color={colors.textSecondary} 
                  />
                  <Text style={styles.emptyStateText}>No hay transacciones recientes</Text>
                </View>
              ) : (
                <View style={styles.transactionsList}>
                  {transactions.map((transaction, index) => {
                    const icon = getTransactionIcon(transaction.type);
                    return (
                      <View key={index} style={styles.transactionItem}>
                        <View style={[styles.transactionIcon, { backgroundColor: icon.color + '20' }]}>
                          <IconSymbol 
                            ios_icon_name={icon.ios} 
                            android_material_icon_name={icon.android} 
                            size={24} 
                            color={icon.color} 
                          />
                        </View>
                        <View style={styles.transactionDetails}>
                          <Text style={styles.transactionDescription}>{transaction.description}</Text>
                          <View style={styles.transactionMeta}>
                            <Text style={styles.transactionDate}>{formatDate(transaction.created_at)}</Text>
                            <View style={[styles.transactionStatus, { backgroundColor: getStatusColor(transaction.status) + '20' }]}>
                              <Text style={[styles.transactionStatusText, { color: getStatusColor(transaction.status) }]}>
                                {transaction.status === 'completed' ? 'Completado' : 
                                 transaction.status === 'pending' ? 'Pendiente' : 
                                 transaction.status === 'failed' ? 'Fallido' : transaction.status}
                              </Text>
                            </View>
                          </View>
                        </View>
                        <View style={styles.transactionAmount}>
                          <Text style={[
                            styles.transactionAmountValue,
                            { color: transaction.type === 'withdrawal' || transaction.type === 'game_loss' ? colors.error : colors.success }
                          ]}>
                            {transaction.type === 'withdrawal' || transaction.type === 'game_loss' ? '-' : '+'}
                            {transaction.amount.toFixed(2)}
                          </Text>
                          <Text style={styles.transactionCurrency}>{transaction.currency}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </React.Fragment>
        )}

        {user.yieldRatePerMinute > 0 && (
          <YieldDisplay
            currentYield={currentYield}
            yieldRatePerMinute={user.yieldRatePerMinute}
            onClaim={handleClaimYield}
          />
        )}

        {isAdmin && (
          <TouchableOpacity
            style={[commonStyles.card, styles.adminCard]}
            onPress={() => router.push('/(tabs)/(admin)')}
          >
            <View style={styles.adminContent}>
              <IconSymbol ios_icon_name="shield.fill" android_material_icon_name="admin_panel_settings" size={32} color={colors.primary} />
              <View style={styles.adminText}>
                <Text style={styles.adminTitle}>Panel de Administrador</Text>
                <Text style={styles.adminSubtitle}>Gestionar configuración del sistema</Text>
              </View>
              <IconSymbol ios_icon_name="chevron.right" android_material_icon_name="chevron_right" size={24} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>
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
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  profileButton: {
    padding: 4,
  },
  balanceCard: {
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: `${colors.accent}15`,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 4,
  },
  balanceCurrency: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.accent,
  },
  balanceDivider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  breakdownContainer: {
    width: '100%',
    gap: 12,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  breakdownText: {
    flex: 1,
  },
  breakdownLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  breakdownSubtext: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  loadingCard: {
    alignItems: 'center',
    padding: 40,
    marginBottom: 16,
  },
  metricsCard: {
    marginBottom: 16,
    backgroundColor: colors.card,
  },
  metricsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  metricsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  metricItem: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  metricBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  metricEarnings: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
    marginBottom: 2,
  },
  metricPercentage: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  metricsSummary: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 12,
  },
  challengeStats: {
    gap: 12,
    marginBottom: 16,
  },
  challengeStatRow: {
    flexDirection: 'row',
    gap: 12,
  },
  challengeStatItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  challengeStatText: {
    flex: 1,
  },
  challengeStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  challengeStatLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  challengeEarnings: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
  },
  earningsItem: {
    flex: 1,
    alignItems: 'center',
  },
  earningsLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  earningsValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  transactionsCard: {
    marginBottom: 16,
  },
  transactionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  transactionsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 12,
  },
  transactionsList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  transactionDate: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  transactionStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  transactionStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAmountValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  transactionCurrency: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  statsCard: {
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 60,
    backgroundColor: colors.border,
  },
  adminCard: {
    backgroundColor: colors.highlight,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  adminContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  adminText: {
    flex: 1,
  },
  adminTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  adminSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
