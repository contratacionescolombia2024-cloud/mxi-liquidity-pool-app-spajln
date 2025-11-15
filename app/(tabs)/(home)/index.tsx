
import VestingCounter from '@/components/VestingCounter';
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
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import * as Clipboard from 'expo-clipboard';

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

interface OKXPayment {
  paymentId: string;
  usdtAmount: number;
  mxiAmount: number;
  paymentAddress: string;
  status: string;
  expiresAt: string;
}

const OKX_WALLET_ADDRESS = 'TYDzsYUEpvnYmQk4zGP9sWWcTEd2MiAtW6';

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
  
  // Sales panel states
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [usdtAmount, setUsdtAmount] = useState('');
  const [mxiAmount, setMxiAmount] = useState('0');
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<OKXPayment | null>(null);

  useEffect(() => {
    loadData();
    checkAdmin();
    checkExistingPayment();
    
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

  const checkExistingPayment = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('okx_payments')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error checking existing payment:', error);
      return;
    }

    if (data) {
      const expiresAt = new Date(data.expires_at);
      if (expiresAt > new Date()) {
        setCurrentPayment({
          paymentId: data.payment_id,
          usdtAmount: parseFloat(data.usdt_amount.toString()),
          mxiAmount: parseFloat(data.mxi_amount.toString()),
          paymentAddress: data.payment_address || OKX_WALLET_ADDRESS,
          status: data.status,
          expiresAt: data.expires_at,
        });
        console.log('Existing payment found:', data.payment_id);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    await checkExistingPayment();
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

  const calculateMxi = (usdt: string) => {
    const amount = parseFloat(usdt);
    if (isNaN(amount) || amount <= 0 || !phaseData) {
      setMxiAmount('0');
      return;
    }

    const mxi = amount / phaseData.currentPriceUsdt;
    setMxiAmount(mxi.toFixed(4));
  };

  const handleOpenSalesPanel = () => {
    if (currentPayment) {
      setShowPaymentModal(true);
    } else {
      setShowSalesModal(true);
    }
  };

  const handleCreatePayment = async () => {
    if (!user || !phaseData) return;

    const amount = parseFloat(usdtAmount);

    if (isNaN(amount) || amount < 50) {
      Alert.alert('Invalid Amount', 'Minimum contribution is 50 USDT');
      return;
    }

    if (amount > 100000) {
      Alert.alert('Invalid Amount', 'Maximum contribution is 100,000 USDT');
      return;
    }

    setLoading(true);

    try {
      const mxi = amount / phaseData.currentPriceUsdt;
      const paymentId = `MXI-${Date.now()}-${user.id.substring(0, 8)}`;
      const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();

      const { error } = await supabase.from('okx_payments').insert({
        user_id: user.id,
        payment_id: paymentId,
        usdt_amount: amount,
        mxi_amount: mxi,
        payment_address: OKX_WALLET_ADDRESS,
        status: 'pending',
        expires_at: expiresAt,
      });

      if (error) {
        console.error('Payment creation error:', error);
        Alert.alert('Error', 'Failed to create payment request');
        setLoading(false);
        return;
      }

      setCurrentPayment({
        paymentId,
        usdtAmount: amount,
        mxiAmount: mxi,
        paymentAddress: OKX_WALLET_ADDRESS,
        status: 'pending',
        expiresAt,
      });

      setShowSalesModal(false);
      setShowPaymentModal(true);
      setLoading(false);
      console.log('Payment created:', paymentId);
    } catch (error) {
      console.error('Payment creation exception:', error);
      Alert.alert('Error', 'Failed to create payment');
      setLoading(false);
    }
  };

  const handleCopyAddress = async () => {
    await Clipboard.setStringAsync(OKX_WALLET_ADDRESS);
    Alert.alert('Copied', 'Wallet address copied to clipboard');
  };

  const handleVerifyPayment = async () => {
    if (!currentPayment) return;

    Alert.alert(
      'Verify Payment',
      'Payment verification is handled by administrators. You will be notified once your payment is confirmed.',
      [
        {
          text: 'OK',
          onPress: () => {
            setShowPaymentModal(false);
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

  // Total MXI balance NOW INCLUDES VESTING as requested:
  // "sumatoria de mxi comprados, mxi por referidos, mxi por retos, mxi vesting"
  const totalMxiBalance = mxiPurchased + mxiFromCommissions + mxiFromChallenges + mxiVestingLocked;

  console.log('MXI Balance Breakdown:', {
    total: totalMxiBalance,
    purchased: mxiPurchased,
    commissions: mxiFromCommissions,
    challenges: mxiFromChallenges,
    vesting: mxiVestingLocked,
    userBalance: user.mxiBalance
  });

  // Calculate vesting data
  const mxiInVesting = mxiPurchased + mxiFromCommissions;
  const yieldPerSecond = user.yieldRatePerMinute / 60;
  const totalYield = user.accumulatedYield + currentYield;
  const canUnify = user.activeReferrals >= 10;

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
          
          {/* VESTING PANEL - Prominent Vesting Card */}
          <TouchableOpacity
            style={[commonStyles.card, styles.vestingPanelCard]}
            onPress={() => router.push('/(tabs)/(home)/vesting')}
          >
            <View style={styles.vestingPanelHeader}>
              <View style={styles.vestingPanelIconContainer}>
                <IconSymbol 
                  ios_icon_name="chart.line.uptrend.xyaxis" 
                  android_material_icon_name="trending_up" 
                  size={36} 
                  color="#fff" 
                />
              </View>
              <View style={styles.vestingPanelInfo}>
                <Text style={styles.vestingPanelTitle}>⚡ Vesting & Rendimiento</Text>
                <Text style={styles.vestingPanelSubtitle}>
                  {yieldPerSecond.toFixed(8)} MXI por segundo
                </Text>
              </View>
              <IconSymbol 
                ios_icon_name="chevron.right" 
                android_material_icon_name="chevron_right" 
                size={28} 
                color="#fff" 
              />
            </View>
            
            <View style={styles.vestingPanelStats}>
              <View style={styles.vestingPanelStat}>
                <Text style={styles.vestingPanelStatLabel}>Balance en Vesting</Text>
                <Text style={styles.vestingPanelStatValue}>{mxiInVesting.toFixed(2)} MXI</Text>
              </View>
              <View style={styles.vestingPanelDivider} />
              <View style={styles.vestingPanelStat}>
                <Text style={styles.vestingPanelStatLabel}>Rendimiento Acumulado</Text>
                <Text style={styles.vestingPanelStatValue}>{totalYield.toFixed(6)} MXI</Text>
              </View>
            </View>
            
            <View style={styles.vestingPanelFeatures}>
              <View style={styles.vestingPanelFeature}>
                <IconSymbol 
                  ios_icon_name="checkmark.circle.fill" 
                  android_material_icon_name="check_circle" 
                  size={18} 
                  color="#fff" 
                />
                <Text style={styles.vestingPanelFeatureText}>Rendimiento en tiempo real</Text>
              </View>
              <View style={styles.vestingPanelFeature}>
                <IconSymbol 
                  ios_icon_name="checkmark.circle.fill" 
                  android_material_icon_name="check_circle" 
                  size={18} 
                  color="#fff" 
                />
                <Text style={styles.vestingPanelFeatureText}>0.005% por hora</Text>
              </View>
              <View style={styles.vestingPanelFeature}>
                <IconSymbol 
                  ios_icon_name={canUnify ? "checkmark.circle.fill" : "lock.fill"}
                  android_material_icon_name={canUnify ? "check_circle" : "lock"}
                  size={18} 
                  color="#fff" 
                />
                <Text style={styles.vestingPanelFeatureText}>
                  {canUnify ? 'Listo para unificar' : `Requiere ${10 - user.activeReferrals} referidos más`}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/(home)/contribute')}
            >
              <View style={styles.actionIconContainer}>
                <IconSymbol ios_icon_name="plus.circle.fill" android_material_icon_name="add_circle" size={32} color={colors.primary} />
              </View>
              <Text style={styles.actionTitle}>Depositar</Text>
              <Text style={styles.actionSubtitle}>Ver historial</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/(home)/withdrawal')}
            >
              <View style={styles.actionIconContainer}>
                <IconSymbol ios_icon_name="arrow.down.circle.fill" android_material_icon_name="arrow_circle_down" size={32} color={colors.success} />
              </View>
              <Text style={styles.actionTitle}>Retirar</Text>
              <Text style={styles.actionSubtitle}>Fondos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/(home)/referrals')}
            >
              <View style={styles.actionIconContainer}>
                <IconSymbol ios_icon_name="person.3.fill" android_material_icon_name="group" size={32} color={colors.accent} />
              </View>
              <Text style={styles.actionTitle}>Referidos</Text>
              <Text style={styles.actionSubtitle}>Invitar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/(home)/kyc-verification')}
            >
              <View style={styles.actionIconContainer}>
                <IconSymbol ios_icon_name="checkmark.shield.fill" android_material_icon_name="verified_user" size={32} color={colors.warning} />
              </View>
              <Text style={styles.actionTitle}>KYC</Text>
              <Text style={styles.actionSubtitle}>Verificar</Text>
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

      {/* Sales Modal */}
      <Modal
        visible={showSalesModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSalesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>💎 Comprar MXI</Text>
              <TouchableOpacity onPress={() => setShowSalesModal(false)}>
                <IconSymbol ios_icon_name="xmark.circle.fill" android_material_icon_name="cancel" size={28} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {phaseData && (
                <React.Fragment>
                  <View style={styles.modalPhaseInfo}>
                    <Text style={styles.modalPhaseLabel}>Fase Actual</Text>
                    <Text style={styles.modalPhaseValue}>
                      Fase {phaseData.currentPhase} - ${phaseData.currentPriceUsdt.toFixed(2)} por MXI
                    </Text>
                  </View>

                  <View style={styles.modalInputContainer}>
                    <Text style={styles.modalInputLabel}>💵 Cantidad en USDT</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="Mínimo: 50 USDT"
                      placeholderTextColor={colors.textSecondary}
                      value={usdtAmount}
                      onChangeText={(text) => {
                        setUsdtAmount(text);
                        calculateMxi(text);
                      }}
                      keyboardType="decimal-pad"
                    />
                  </View>

                  <View style={styles.modalConversionCard}>
                    <View style={styles.modalConversionRow}>
                      <Text style={styles.modalConversionLabel}>💎 Recibirás:</Text>
                      <Text style={styles.modalConversionValue}>{mxiAmount} MXI</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[buttonStyles.primary, styles.modalButton]}
                    onPress={handleCreatePayment}
                    disabled={loading || !usdtAmount || parseFloat(usdtAmount) < 50}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <React.Fragment>
                        <IconSymbol ios_icon_name="cart.fill" android_material_icon_name="shopping_cart" size={20} color="#fff" />
                        <Text style={styles.buttonText}>Crear Orden de Pago</Text>
                      </React.Fragment>
                    )}
                  </TouchableOpacity>

                  <View style={styles.modalInfoCard}>
                    <IconSymbol ios_icon_name="info.circle.fill" android_material_icon_name="info" size={20} color={colors.primary} />
                    <View style={styles.modalInfoContent}>
                      <Text style={styles.modalInfoText}>
                        • Mínimo: 50 USDT{'\n'}
                        • Máximo: 100,000 USDT{'\n'}
                        • Pago expira en 8 horas{'\n'}
                        • Verificación por administrador
                      </Text>
                    </View>
                  </View>
                </React.Fragment>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Payment Instructions Modal */}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>💰 Instrucciones de Pago</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <IconSymbol ios_icon_name="xmark.circle.fill" android_material_icon_name="cancel" size={28} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {currentPayment && (
                <React.Fragment>
                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentLabel}>💵 Cantidad:</Text>
                    <Text style={styles.paymentValue}>{currentPayment.usdtAmount} USDT</Text>
                  </View>

                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentLabel}>💎 Recibirás:</Text>
                    <Text style={styles.paymentValue}>{currentPayment.mxiAmount.toFixed(4)} MXI</Text>
                  </View>

                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentLabel}>🆔 ID de Pago:</Text>
                    <Text style={styles.paymentValue}>{currentPayment.paymentId}</Text>
                  </View>

                  <View style={styles.addressCard}>
                    <Text style={styles.addressLabel}>🏦 Enviar USDT (TRC20) a:</Text>
                    <View style={styles.addressContainer}>
                      <Text style={styles.addressText}>{currentPayment.paymentAddress}</Text>
                      <TouchableOpacity onPress={handleCopyAddress}>
                        <IconSymbol ios_icon_name="doc.on.doc.fill" android_material_icon_name="content_copy" size={20} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[buttonStyles.primary, styles.modalButton]}
                    onPress={handleVerifyPayment}
                  >
                    <IconSymbol ios_icon_name="checkmark.circle.fill" android_material_icon_name="check_circle" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Entendido</Text>
                  </TouchableOpacity>

                  <View style={styles.warningCard}>
                    <IconSymbol ios_icon_name="exclamationmark.triangle.fill" android_material_icon_name="warning" size={20} color={colors.warning} />
                    <Text style={styles.warningText}>
                      ⚠️ Solo enviar USDT (TRC20) a esta dirección. El pago será verificado por un administrador.
                    </Text>
                  </View>
                </React.Fragment>
              )}
            </ScrollView>
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
  vestingPanelCard: {
    marginBottom: 16,
    backgroundColor: colors.accent,
    borderWidth: 0,
    padding: 20,
  },
  vestingPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  vestingPanelIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vestingPanelInfo: {
    flex: 1,
  },
  vestingPanelTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  vestingPanelSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  vestingPanelStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 16,
  },
  vestingPanelStat: {
    flex: 1,
  },
  vestingPanelStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  vestingPanelStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  vestingPanelDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  vestingPanelFeatures: {
    gap: 8,
  },
  vestingPanelFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vestingPanelFeatureText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
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
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  modalScroll: {
    padding: 24,
  },
  modalPhaseInfo: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  modalPhaseLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  modalPhaseValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  modalInputContainer: {
    marginBottom: 16,
  },
  modalInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalConversionCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  modalConversionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalConversionLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  modalConversionValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalInfoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  modalInfoContent: {
    flex: 1,
  },
  modalInfoText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  paymentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  paymentLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  paymentValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  addressCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
  },
  addressText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    fontFamily: 'monospace',
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: colors.warning + '20',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    lineHeight: 20,
  },
});
