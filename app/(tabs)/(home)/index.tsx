
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';
import YieldDisplay from '@/components/YieldDisplay';
import VestingCounter from '@/components/VestingCounter';

interface PhaseData {
  totalTokensSold: number;
  currentPhase: number;
  currentPriceUsdt: number;
  phase1TokensSold: number;
  phase2TokensSold: number;
  phase3TokensSold: number;
}

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const { user, getCurrentYield, claimYield, checkAdminStatus } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [currentYield, setCurrentYield] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [poolMembers, setPoolMembers] = useState(56527);
  const [phaseData, setPhaseData] = useState<PhaseData | null>(null);
  const [countdown, setCountdown] = useState<CountdownTime>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [launchDate] = useState(new Date('2026-02-15T12:00:00Z'));

  useEffect(() => {
    loadData();
    checkAdmin();
    
    const interval = setInterval(() => {
      if (user) {
        setCurrentYield(getCurrentYield());
      }
      updateCountdown();
    }, 1000);

    return () => clearInterval(interval);
  }, [user]);

  const updateCountdown = () => {
    const now = new Date();
    const difference = launchDate.getTime() - now.getTime();

    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    } else {
      setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    }
  };

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
      setPoolMembers(metricsData.total_members);
      setPhaseData({
        totalTokensSold: parseFloat(metricsData.total_tokens_sold || '0'),
        currentPhase: metricsData.current_phase || 1,
        currentPriceUsdt: parseFloat(metricsData.current_price_usdt || '0'),
        phase1TokensSold: parseFloat(metricsData.phase_1_tokens_sold || '0'),
        phase2TokensSold: parseFloat(metricsData.phase_2_tokens_sold || '0'),
        phase3TokensSold: parseFloat(metricsData.phase_3_tokens_sold || '0'),
      });
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

  const getPhaseProgress = (phase: number): number => {
    if (!phaseData) return 0;
    
    const phaseLimit = 5000000; // 5M tokens per phase
    let tokensSold = 0;
    
    if (phase === 1) tokensSold = phaseData.phase1TokensSold;
    else if (phase === 2) tokensSold = phaseData.phase2TokensSold;
    else if (phase === 3) tokensSold = phaseData.phase3TokensSold;
    
    return Math.min((tokensSold / phaseLimit) * 100, 100);
  };

  const getPhasePrice = (phase: number): string => {
    if (phase === 1) return '$0.30';
    if (phase === 2) return '$0.40';
    if (phase === 3) return '$0.50';
    return '$0.30';
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`;
    }
    return num.toFixed(0);
  };

  // Calculate MXI exchange value at Phase 1 price (0.4 USDT)
  const getMxiExchangeValue = (mxiAmount: number): number => {
    const mxiPhase1Price = 0.4; // Phase 1 sale price
    return mxiAmount * mxiPhase1Price;
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

  // Calculate MXI breakdown - these fields come from the users table
  const mxiPurchased = user.mxiPurchasedDirectly || 0;
  const mxiFromCommissions = user.mxiFromUnifiedCommissions || 0;
  const mxiFromChallenges = (user as any).mxi_from_challenges || 0;
  const mxiVestingLocked = (user as any).mxi_vesting_locked || 0;

  // Total MXI balance is the sum of purchased, commissions, and challenges
  // This is what the user requested: sumatoria de mxi comprados, ganados por referidos y mxi ganados por retos
  const totalMxiBalance = mxiPurchased + mxiFromCommissions + mxiFromChallenges;

  console.log('MXI Balance Breakdown:', {
    total: totalMxiBalance,
    purchased: mxiPurchased,
    commissions: mxiFromCommissions,
    challenges: mxiFromChallenges,
    vesting: mxiVestingLocked,
    userBalance: user.mxiBalance
  });

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
            <Text style={styles.greeting}>Welcome back,</Text>
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
        <View style={[commonStyles.card, styles.countdownCard]}>
          <View style={styles.countdownHeader}>
            <IconSymbol ios_icon_name="clock.fill" android_material_icon_name="schedule" size={28} color={colors.primary} />
            <Text style={styles.countdownTitle}>🚀 Lanzamiento MXI</Text>
          </View>
          <Text style={styles.countdownSubtitle}>15 de Febrero 2026 - 12:00 UTC</Text>
          <View style={styles.countdownDisplay}>
            <View style={styles.countdownItem}>
              <Text style={styles.countdownValue}>{countdown.days}</Text>
              <Text style={styles.countdownLabel}>Días</Text>
            </View>
            <Text style={styles.countdownSeparator}>:</Text>
            <View style={styles.countdownItem}>
              <Text style={styles.countdownValue}>{countdown.hours.toString().padStart(2, '0')}</Text>
              <Text style={styles.countdownLabel}>Horas</Text>
            </View>
            <Text style={styles.countdownSeparator}>:</Text>
            <View style={styles.countdownItem}>
              <Text style={styles.countdownValue}>{countdown.minutes.toString().padStart(2, '0')}</Text>
              <Text style={styles.countdownLabel}>Min</Text>
            </View>
            <Text style={styles.countdownSeparator}>:</Text>
            <View style={styles.countdownItem}>
              <Text style={styles.countdownValue}>{countdown.seconds.toString().padStart(2, '0')}</Text>
              <Text style={styles.countdownLabel}>Seg</Text>
            </View>
          </View>
        </View>

        {/* MXI Balance with Breakdown */}
        <View style={[commonStyles.card, styles.balanceCard]}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>MXI Balance Total</Text>
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

            {mxiVestingLocked > 0 && (
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
            )}
          </View>

          <View style={styles.balanceDivider} />
          
          <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemLabel}>MXI Total</Text>
              <Text style={styles.balanceItemValue}>{totalMxiBalance.toFixed(2)} MXI</Text>
              <Text style={styles.balanceItemSubtext}>≈ ${getMxiExchangeValue(totalMxiBalance).toFixed(2)} USDT</Text>
              <Text style={styles.balanceItemNote}>(Fase 1: $0.40/MXI)</Text>
            </View>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemLabel}>Referidos Activos</Text>
              <Text style={styles.balanceItemValue}>{user.activeReferrals}</Text>
            </View>
          </View>
        </View>

        {/* MXI Sales Status */}
        {phaseData && (
          <View style={[commonStyles.card, styles.salesCard]}>
            <View style={styles.salesHeader}>
              <IconSymbol ios_icon_name="chart.bar.fill" android_material_icon_name="bar_chart" size={28} color={colors.success} />
              <Text style={styles.salesTitle}>📊 Estado de Ventas</Text>
            </View>
            
            <View style={styles.salesStats}>
              <View style={styles.salesStatItem}>
                <Text style={styles.salesStatLabel}>Total MXI Vendidos</Text>
                <Text style={styles.salesStatValue}>{formatNumber(phaseData.totalTokensSold)}</Text>
                <Text style={styles.salesStatSubtext}>de 15M tokens</Text>
              </View>
              <View style={styles.salesDivider} />
              <View style={styles.salesStatItem}>
                <Text style={styles.salesStatLabel}>Fase Actual</Text>
                <Text style={styles.salesStatValue}>Fase {phaseData.currentPhase}</Text>
                <Text style={styles.salesStatSubtext}>{getPhasePrice(phaseData.currentPhase)} por MXI</Text>
              </View>
            </View>

            <View style={styles.totalProgressContainer}>
              <View style={styles.totalProgressHeader}>
                <Text style={styles.totalProgressLabel}>Progreso Total</Text>
                <Text style={styles.totalProgressPercent}>
                  {((phaseData.totalTokensSold / 15000000) * 100).toFixed(2)}%
                </Text>
              </View>
              <View style={styles.totalProgressBar}>
                <View 
                  style={[
                    styles.totalProgressFill, 
                    { width: `${Math.min((phaseData.totalTokensSold / 15000000) * 100, 100)}%` }
                  ]} 
                />
              </View>
            </View>
          </View>
        )}

        {/* Phase Listing */}
        {phaseData && (
          <View style={[commonStyles.card, styles.phasesCard]}>
            <View style={styles.phasesHeader}>
              <IconSymbol ios_icon_name="list.bullet" android_material_icon_name="format_list_bulleted" size={24} color={colors.accent} />
              <Text style={styles.phasesTitle}>📈 Fases de Venta</Text>
            </View>

            {/* Phase 1 */}
            <View style={[styles.phaseItem, phaseData.currentPhase === 1 && styles.phaseItemActive]}>
              <View style={styles.phaseHeader}>
                <View style={styles.phaseInfo}>
                  <Text style={styles.phaseNumber}>Fase 1</Text>
                  <Text style={styles.phasePrice}>$0.30 por MXI</Text>
                </View>
                {phaseData.currentPhase === 1 && (
                  <View style={styles.currentPhaseBadge}>
                    <Text style={styles.currentPhaseBadgeText}>ACTUAL</Text>
                  </View>
                )}
                {phaseData.currentPhase > 1 && (
                  <IconSymbol ios_icon_name="checkmark.circle.fill" android_material_icon_name="check_circle" size={24} color={colors.success} />
                )}
              </View>
              <View style={styles.phaseProgressContainer}>
                <View style={styles.phaseProgressBar}>
                  <View 
                    style={[
                      styles.phaseProgressFill, 
                      { width: `${getPhaseProgress(1)}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.phaseProgressText}>
                  {formatNumber(phaseData.phase1TokensSold)} / 5M
                </Text>
              </View>
            </View>

            {/* Phase 2 */}
            <View style={[styles.phaseItem, phaseData.currentPhase === 2 && styles.phaseItemActive]}>
              <View style={styles.phaseHeader}>
                <View style={styles.phaseInfo}>
                  <Text style={styles.phaseNumber}>Fase 2</Text>
                  <Text style={styles.phasePrice}>$0.40 por MXI</Text>
                </View>
                {phaseData.currentPhase === 2 && (
                  <View style={styles.currentPhaseBadge}>
                    <Text style={styles.currentPhaseBadgeText}>ACTUAL</Text>
                  </View>
                )}
                {phaseData.currentPhase > 2 && (
                  <IconSymbol ios_icon_name="checkmark.circle.fill" android_material_icon_name="check_circle" size={24} color={colors.success} />
                )}
                {phaseData.currentPhase < 2 && (
                  <IconSymbol ios_icon_name="lock.fill" android_material_icon_name="lock" size={24} color={colors.textSecondary} />
                )}
              </View>
              <View style={styles.phaseProgressContainer}>
                <View style={styles.phaseProgressBar}>
                  <View 
                    style={[
                      styles.phaseProgressFill, 
                      { width: `${getPhaseProgress(2)}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.phaseProgressText}>
                  {formatNumber(phaseData.phase2TokensSold)} / 5M
                </Text>
              </View>
            </View>

            {/* Phase 3 */}
            <View style={[styles.phaseItem, phaseData.currentPhase === 3 && styles.phaseItemActive]}>
              <View style={styles.phaseHeader}>
                <View style={styles.phaseInfo}>
                  <Text style={styles.phaseNumber}>Fase 3</Text>
                  <Text style={styles.phasePrice}>$0.50 por MXI</Text>
                </View>
                {phaseData.currentPhase === 3 && (
                  <View style={styles.currentPhaseBadge}>
                    <Text style={styles.currentPhaseBadgeText}>ACTUAL</Text>
                  </View>
                )}
                {phaseData.currentPhase > 3 && (
                  <IconSymbol ios_icon_name="checkmark.circle.fill" android_material_icon_name="check_circle" size={24} color={colors.success} />
                )}
                {phaseData.currentPhase < 3 && (
                  <IconSymbol ios_icon_name="lock.fill" android_material_icon_name="lock" size={24} color={colors.textSecondary} />
                )}
              </View>
              <View style={styles.phaseProgressContainer}>
                <View style={styles.phaseProgressBar}>
                  <View 
                    style={[
                      styles.phaseProgressFill, 
                      { width: `${getPhaseProgress(3)}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.phaseProgressText}>
                  {formatNumber(phaseData.phase3TokensSold)} / 5M
                </Text>
              </View>
            </View>
          </View>
        )}

        {user.yieldRatePerMinute > 0 && (
          <YieldDisplay
            currentYield={currentYield}
            yieldRatePerMinute={user.yieldRatePerMinute}
            onClaim={handleClaimYield}
          />
        )}

        <VestingCounter />

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/(home)/contribute')}
            >
              <View style={styles.actionIconContainer}>
                <IconSymbol ios_icon_name="plus.circle.fill" android_material_icon_name="add_circle" size={32} color={colors.primary} />
              </View>
              <Text style={styles.actionTitle}>Contribute</Text>
              <Text style={styles.actionSubtitle}>Add USDT</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/(home)/withdrawal')}
            >
              <View style={styles.actionIconContainer}>
                <IconSymbol ios_icon_name="arrow.down.circle.fill" android_material_icon_name="arrow_circle_down" size={32} color={colors.success} />
              </View>
              <Text style={styles.actionTitle}>Withdraw</Text>
              <Text style={styles.actionSubtitle}>Get funds</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/(home)/referrals')}
            >
              <View style={styles.actionIconContainer}>
                <IconSymbol ios_icon_name="person.3.fill" android_material_icon_name="group" size={32} color={colors.accent} />
              </View>
              <Text style={styles.actionTitle}>Referrals</Text>
              <Text style={styles.actionSubtitle}>Invite friends</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/(home)/kyc-verification')}
            >
              <View style={styles.actionIconContainer}>
                <IconSymbol ios_icon_name="checkmark.shield.fill" android_material_icon_name="verified_user" size={32} color={colors.warning} />
              </View>
              <Text style={styles.actionTitle}>KYC</Text>
              <Text style={styles.actionSubtitle}>Verify identity</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.gamesSection}>
          <Text style={styles.sectionTitle}>Challenge Games</Text>
          <View style={styles.gamesGrid}>
            <TouchableOpacity
              style={styles.gameCard}
              onPress={() => router.push('/(tabs)/(home)/xmi-tap-duo')}
            >
              <View style={styles.gameIconContainer}>
                <IconSymbol ios_icon_name="hand.tap.fill" android_material_icon_name="touch_app" size={40} color={colors.primary} />
              </View>
              <Text style={styles.gameTitle}>Tap Duo</Text>
              <Text style={styles.gameSubtitle}>1v1 Tapping</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gameCard}
              onPress={() => router.push('/(tabs)/(home)/mxi-airball-duo')}
            >
              <View style={styles.gameIconContainer}>
                <IconSymbol ios_icon_name="mic.fill" android_material_icon_name="mic" size={40} color={colors.accent} />
              </View>
              <Text style={styles.gameTitle}>Airball Duo</Text>
              <Text style={styles.gameSubtitle}>1v1 Balance</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gameCard}
              onPress={() => router.push('/(tabs)/(home)/mxi-airball')}
            >
              <View style={styles.gameIconContainer}>
                <IconSymbol ios_icon_name="mic.fill" android_material_icon_name="mic" size={40} color={colors.success} />
              </View>
              <Text style={styles.gameTitle}>Airball</Text>
              <Text style={styles.gameSubtitle}>Multi-player</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gameCard}
              onPress={() => router.push('/(tabs)/(home)/clickers')}
            >
              <View style={styles.gameIconContainer}>
                <IconSymbol ios_icon_name="hand.tap.fill" android_material_icon_name="ads_click" size={40} color={colors.warning} />
              </View>
              <Text style={styles.gameTitle}>Clickers</Text>
              <Text style={styles.gameSubtitle}>Speed clicking</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gameCard}
              onPress={() => router.push('/(tabs)/(home)/lottery')}
            >
              <View style={styles.gameIconContainer}>
                <IconSymbol ios_icon_name="ticket.fill" android_material_icon_name="confirmation_number" size={40} color="#FFD700" />
              </View>
              <Text style={styles.gameTitle}>Lottery</Text>
              <Text style={styles.gameSubtitle}>Win big!</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gameCard}
              onPress={() => router.push('/(tabs)/(home)/challenge-history')}
            >
              <View style={styles.gameIconContainer}>
                <IconSymbol ios_icon_name="clock.fill" android_material_icon_name="history" size={40} color={colors.textSecondary} />
              </View>
              <Text style={styles.gameTitle}>History</Text>
              <Text style={styles.gameSubtitle}>View records</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[commonStyles.card, styles.statsCard]}>
          <Text style={styles.statsTitle}>Pool Statistics</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <IconSymbol ios_icon_name="person.3.fill" android_material_icon_name="group" size={24} color={colors.primary} />
              <Text style={styles.statValue}>{poolMembers.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Members</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <IconSymbol ios_icon_name="person.2.fill" android_material_icon_name="people" size={24} color={colors.success} />
              <Text style={styles.statValue}>{user.activeReferrals}</Text>
              <Text style={styles.statLabel}>Active Referrals</Text>
            </View>
          </View>
        </View>

        {isAdmin && (
          <TouchableOpacity
            style={[commonStyles.card, styles.adminCard]}
            onPress={() => router.push('/(tabs)/(admin)')}
          >
            <View style={styles.adminContent}>
              <IconSymbol ios_icon_name="shield.fill" android_material_icon_name="admin_panel_settings" size={32} color={colors.primary} />
              <View style={styles.adminText}>
                <Text style={styles.adminTitle}>Admin Panel</Text>
                <Text style={styles.adminSubtitle}>Manage system settings</Text>
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
  countdownCard: {
    marginBottom: 16,
    backgroundColor: `${colors.primary}15`,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  countdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  countdownTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  countdownSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  countdownDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  countdownItem: {
    alignItems: 'center',
    minWidth: 60,
  },
  countdownValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    fontFamily: 'monospace',
  },
  countdownLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  countdownSeparator: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 20,
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
  balanceRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 16,
  },
  balanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  balanceItemLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  balanceItemValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  balanceItemSubtext: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '600',
    marginTop: 2,
  },
  balanceItemNote: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
    fontStyle: 'italic',
  },
  salesCard: {
    marginBottom: 16,
    backgroundColor: `${colors.success}15`,
    borderWidth: 2,
    borderColor: colors.success,
  },
  salesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  salesTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  salesStats: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  salesStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  salesStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  salesStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  salesStatSubtext: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  salesDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  totalProgressContainer: {
    marginTop: 8,
  },
  totalProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalProgressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  totalProgressPercent: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.success,
  },
  totalProgressBar: {
    height: 12,
    backgroundColor: colors.background,
    borderRadius: 6,
    overflow: 'hidden',
  },
  totalProgressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 6,
  },
  phasesCard: {
    marginBottom: 16,
    backgroundColor: `${colors.accent}15`,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  phasesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  phasesTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  phaseItem: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  phaseItemActive: {
    backgroundColor: `${colors.accent}20`,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  phaseInfo: {
    flex: 1,
  },
  phaseNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  phasePrice: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  currentPhaseBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentPhaseBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  phaseProgressContainer: {
    gap: 8,
  },
  phaseProgressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  phaseProgressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
  phaseProgressText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  quickActions: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionIconContainer: {
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  gamesSection: {
    marginBottom: 24,
  },
  gamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gameCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  gameIconContainer: {
    marginBottom: 12,
  },
  gameTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  gameSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
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
