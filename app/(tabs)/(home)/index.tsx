
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { UniversalMXICounter } from '@/components/UniversalMXICounter';
import { YieldDisplay } from '@/components/YieldDisplay';
import { LaunchCountdown } from '@/components/LaunchCountdown';
import { TotalMXIBalanceChart } from '@/components/TotalMXIBalanceChart';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';

const HEADER_MAX_HEIGHT = 120;
const HEADER_MIN_HEIGHT = 0;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000000',
    zIndex: 1000,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    flexShrink: 0,
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: 'cover',
  },
  headerTextContainer: {
    flex: 1,
    minWidth: 0,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    flexWrap: 'wrap',
  },
  userName: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scrollContent: {
    paddingTop: HEADER_MAX_HEIGHT,
  },
  content: {
    flex: 1,
    paddingHorizontal: 8,
  },
  phasesCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  currentPhaseInfo: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  currentPhaseLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  currentPhasePrice: {
    fontSize: 32,
    fontWeight: '900',
    color: '#6366F1',
  },
  phasesList: {
    gap: 10,
    marginBottom: 16,
  },
  phaseItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  phaseLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  phasePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6366F1',
  },
  phaseProgressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  phaseProgressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
  },
  phaseStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  phaseValue: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  overallProgress: {
    marginBottom: 16,
  },
  overallProgressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressBarContainer: {
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBarText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  progressSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  poolCloseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(99, 102, 241, 0.2)',
  },
  poolCloseText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
  commissionsCard: {
    backgroundColor: 'rgba(168, 85, 247, 0.08)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  commissionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  commissionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  commissionsGrid: {
    gap: 12,
  },
  commissionItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.2)',
  },
  commissionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commissionContent: {
    flex: 1,
  },
  commissionLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  commissionValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  commissionValue: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.text,
  },
  commissionUnit: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  commissionBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 8,
  },
  commissionBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  quickActionsCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickActionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
});

export default function HomeScreen() {
  const router = useRouter();
  const { user, loading, checkWithdrawalEligibility, getPhaseInfo } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [phaseInfo, setPhaseInfo] = useState<any>({
    currentPhase: 1,
    currentPriceUsdt: 0.40,
    phase1: { sold: 0, remaining: 8333333, allocation: 8333333 },
    phase2: { sold: 0, remaining: 8333333, allocation: 8333333 },
    phase3: { sold: 0, remaining: 8333334, allocation: 8333334 },
    totalSold: 0,
    totalRemaining: 25000000,
    overallProgress: 0,
    poolCloseDate: '2026-02-15T12:00:00Z',
  });
  const [commissions, setCommissions] = useState({ available: 0, total: 0 });

  // Animated value for header
  const scrollY = useRef(new Animated.Value(0)).current;

  // Calculate header height based on scroll position
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  // Calculate header opacity based on scroll position
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      await checkWithdrawalEligibility();
      const info = await getPhaseInfo();
      if (info) {
        setPhaseInfo(info);
      }

      // Load pool participants count and phase info
      const { data: metricsData, error: metricsError } = await supabase
        .from('metrics')
        .select('*')
        .single();

      if (!metricsError && metricsData) {
        // Calculate phase info
        const phase1Allocation = 8333333;
        const phase2Allocation = 8333333;
        const phase3Allocation = 8333334;

        const phase1Sold = parseFloat(metricsData.phase_1_tokens_sold || '0');
        const phase2Sold = parseFloat(metricsData.phase_2_tokens_sold || '0');
        const phase3Sold = parseFloat(metricsData.phase_3_tokens_sold || '0');

        const phase1Remaining = phase1Allocation - phase1Sold;
        const phase2Remaining = phase2Allocation - phase2Sold;
        const phase3Remaining = phase3Allocation - phase3Sold;

        const totalSold = phase1Sold + phase2Sold + phase3Sold;
        const totalAllocation = 25000000;
        const overallProgress = (totalSold / totalAllocation) * 100;

        setPhaseInfo({
          currentPhase: metricsData.current_phase || 1,
          currentPriceUsdt: parseFloat(metricsData.current_price_usdt || '0.40'),
          phase1: { sold: phase1Sold, remaining: phase1Remaining, allocation: phase1Allocation },
          phase2: { sold: phase2Sold, remaining: phase2Remaining, allocation: phase2Allocation },
          phase3: { sold: phase3Sold, remaining: phase3Remaining, allocation: phase3Allocation },
          totalSold,
          totalRemaining: totalAllocation - totalSold,
          overallProgress,
          poolCloseDate: metricsData.pool_close_date || '2026-02-15T12:00:00Z',
        });
      }

      // Load commissions data
      const { data: commissionsData, error: commissionsError } = await supabase
        .from('commissions')
        .select('amount, status')
        .eq('user_id', user?.id);

      if (!commissionsError && commissionsData) {
        const available = commissionsData
          .filter(c => c.status === 'available')
          .reduce((sum, c) => sum + parseFloat(c.amount), 0);
        const total = commissionsData.reduce((sum, c) => sum + parseFloat(c.amount), 0);
        setCommissions({ available, total });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: colors.text }}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Animated Header with Logo and User Name */}
      <Animated.View 
        style={[
          styles.headerContainer, 
          { 
            height: headerHeight,
            opacity: headerOpacity,
          }
        ]}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/904cc327-48f3-4ea1-90a4-6fd4d39a1c11.jpeg')}
              style={styles.logo}
            />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.greeting} numberOfLines={2}>
              Hola, {user.name}
            </Text>
            <Text style={styles.userName}>Bienvenido a MXI Pool</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Launch Countdown */}
        <LaunchCountdown />

        {/* NEW: Total MXI Balance Chart with Timeframe Options */}
        <TotalMXIBalanceChart />

        {/* Enhanced Commissions and Referrals Card */}
        <View style={styles.commissionsCard}>
          <View style={styles.commissionsHeader}>
            <Text style={styles.commissionsTitle}>💼 Comisiones y Referidos</Text>
          </View>
          
          <View style={styles.commissionsGrid}>
            {/* Available Commissions */}
            <View style={styles.commissionItem}>
              <View style={styles.commissionIconContainer}>
                <Text style={{ fontSize: 24 }}>💰</Text>
              </View>
              <View style={styles.commissionContent}>
                <Text style={styles.commissionLabel}>Disponibles</Text>
                <View style={styles.commissionValueContainer}>
                  <Text style={styles.commissionValue}>
                    ${commissions.available.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.commissionBar}>
                  <View 
                    style={[
                      styles.commissionBarFill, 
                      { 
                        width: commissions.total > 0 ? `${(commissions.available / commissions.total) * 100}%` : '0%',
                        backgroundColor: '#10b981'
                      }
                    ]} 
                  />
                </View>
              </View>
            </View>

            {/* Total Commissions */}
            <View style={styles.commissionItem}>
              <View style={styles.commissionIconContainer}>
                <Text style={{ fontSize: 24 }}>📊</Text>
              </View>
              <View style={styles.commissionContent}>
                <Text style={styles.commissionLabel}>Total Comisiones</Text>
                <View style={styles.commissionValueContainer}>
                  <Text style={styles.commissionValue}>
                    ${commissions.total.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.commissionBar}>
                  <View 
                    style={[
                      styles.commissionBarFill, 
                      { 
                        width: '100%',
                        backgroundColor: '#6366F1'
                      }
                    ]} 
                  />
                </View>
              </View>
            </View>

            {/* Active Referrals */}
            <View style={styles.commissionItem}>
              <View style={styles.commissionIconContainer}>
                <Text style={{ fontSize: 24 }}>👥</Text>
              </View>
              <View style={styles.commissionContent}>
                <Text style={styles.commissionLabel}>Referidos Activos</Text>
                <View style={styles.commissionValueContainer}>
                  <Text style={styles.commissionValue}>
                    {user.activeReferrals || 0}
                  </Text>
                </View>
                <View style={styles.commissionBar}>
                  <View 
                    style={[
                      styles.commissionBarFill, 
                      { 
                        width: `${Math.min((user.activeReferrals || 0) * 20, 100)}%`,
                        backgroundColor: '#A855F7'
                      }
                    ]} 
                  />
                </View>
              </View>
            </View>

            {/* USDT Contributed */}
            <View style={styles.commissionItem}>
              <View style={styles.commissionIconContainer}>
                <Text style={{ fontSize: 24 }}>💳</Text>
              </View>
              <View style={styles.commissionContent}>
                <Text style={styles.commissionLabel}>USDT Contribuido</Text>
                <View style={styles.commissionValueContainer}>
                  <Text style={styles.commissionValue}>
                    ${(user.usdtContributed || 0).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.commissionBar}>
                  <View 
                    style={[
                      styles.commissionBarFill, 
                      { 
                        width: '100%',
                        backgroundColor: '#F59E0B'
                      }
                    ]} 
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Enhanced Phases and Progress Card */}
        {phaseInfo && phaseInfo.phase1 && phaseInfo.phase2 && phaseInfo.phase3 && (
          <View style={styles.phasesCard}>
            <Text style={styles.cardTitle}>🚀 Fases y Progreso</Text>
            
            <View style={styles.currentPhaseInfo}>
              <Text style={styles.currentPhaseLabel}>Fase Actual: {phaseInfo.currentPhase || 1}</Text>
              <Text style={styles.currentPhasePrice}>
                ${(phaseInfo.currentPriceUsdt || 0.40).toFixed(2)} USDT por MXI
              </Text>
            </View>

            <View style={styles.phasesList}>
              {/* Phase 1 */}
              <View style={styles.phaseItem}>
                <View style={styles.phaseHeader}>
                  <Text style={styles.phaseLabel}>Fase 1</Text>
                  <Text style={styles.phasePrice}>0.40 USDT</Text>
                </View>
                <View style={styles.phaseProgressBar}>
                  <View 
                    style={[
                      styles.phaseProgressFill, 
                      { 
                        width: `${((phaseInfo.phase1.sold || 0) / (phaseInfo.phase1.allocation || 1)) * 100}%`
                      }
                    ]} 
                  />
                </View>
                <View style={styles.phaseStats}>
                  <Text style={styles.phaseValue}>
                    Vendidos: {(phaseInfo.phase1.sold || 0).toLocaleString('es-ES')}
                  </Text>
                  <Text style={styles.phaseValue}>
                    Restantes: {(phaseInfo.phase1.remaining || 8333333).toLocaleString('es-ES')}
                  </Text>
                </View>
              </View>

              {/* Phase 2 */}
              <View style={styles.phaseItem}>
                <View style={styles.phaseHeader}>
                  <Text style={styles.phaseLabel}>Fase 2</Text>
                  <Text style={styles.phasePrice}>0.70 USDT</Text>
                </View>
                <View style={styles.phaseProgressBar}>
                  <View 
                    style={[
                      styles.phaseProgressFill, 
                      { 
                        width: `${((phaseInfo.phase2.sold || 0) / (phaseInfo.phase2.allocation || 1)) * 100}%`
                      }
                    ]} 
                  />
                </View>
                <View style={styles.phaseStats}>
                  <Text style={styles.phaseValue}>
                    Vendidos: {(phaseInfo.phase2.sold || 0).toLocaleString('es-ES')}
                  </Text>
                  <Text style={styles.phaseValue}>
                    Restantes: {(phaseInfo.phase2.remaining || 8333333).toLocaleString('es-ES')}
                  </Text>
                </View>
              </View>

              {/* Phase 3 */}
              <View style={styles.phaseItem}>
                <View style={styles.phaseHeader}>
                  <Text style={styles.phaseLabel}>Fase 3</Text>
                  <Text style={styles.phasePrice}>1.00 USDT</Text>
                </View>
                <View style={styles.phaseProgressBar}>
                  <View 
                    style={[
                      styles.phaseProgressFill, 
                      { 
                        width: `${((phaseInfo.phase3.sold || 0) / (phaseInfo.phase3.allocation || 1)) * 100}%`
                      }
                    ]} 
                  />
                </View>
                <View style={styles.phaseStats}>
                  <Text style={styles.phaseValue}>
                    Vendidos: {(phaseInfo.phase3.sold || 0).toLocaleString('es-ES')}
                  </Text>
                  <Text style={styles.phaseValue}>
                    Restantes: {(phaseInfo.phase3.remaining || 8333334).toLocaleString('es-ES')}
                  </Text>
                </View>
              </View>
            </View>

            {/* Overall Progress with Professional Bar Graph */}
            <View style={styles.overallProgress}>
              <Text style={styles.overallProgressLabel}>📈 Progreso General</Text>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { width: `${Math.min(phaseInfo.overallProgress || 0, 100)}%` }
                  ]}
                >
                  <Text style={styles.progressBarText}>
                    {(phaseInfo.overallProgress || 0).toFixed(1)}%
                  </Text>
                </View>
              </View>
              <View style={styles.progressStats}>
                <Text style={styles.progressText}>
                  {(phaseInfo.totalSold || 0).toLocaleString('es-ES')} MXI
                </Text>
                <Text style={styles.progressSubtext}>
                  de 25,000,000 MXI
                </Text>
              </View>
            </View>

            <View style={styles.poolCloseInfo}>
              <IconSymbol 
                ios_icon_name="clock.fill" 
                android_material_icon_name="schedule" 
                size={18} 
                color={colors.textSecondary} 
              />
              <Text style={styles.poolCloseText}>
                Cierre del Pool: {new Date(phaseInfo.poolCloseDate || '2026-02-15T12:00:00Z').toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActionsCard}>
          <Text style={styles.cardTitle}>⚡ Acciones Rápidas</Text>
          
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.push('/(tabs)/(home)/pagar-usdt')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Text style={{ fontSize: 28 }}>💳</Text>
              </View>
              <Text style={styles.quickActionLabel}>Comprar MXI</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.push('/(tabs)/(home)/retiros')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(168, 85, 247, 0.15)' }]}>
                <Text style={{ fontSize: 28 }}>💰</Text>
              </View>
              <Text style={styles.quickActionLabel}>Retiros</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.push('/(tabs)/(home)/referrals')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                <Text style={{ fontSize: 28 }}>👥</Text>
              </View>
              <Text style={styles.quickActionLabel}>Referidos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.push('/(tabs)/(home)/vesting')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <Text style={{ fontSize: 28 }}>📈</Text>
              </View>
              <Text style={styles.quickActionLabel}>Vesting</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Yield Display */}
        <YieldDisplay />

        {/* Universal MXI Counter - Shows vesting from purchased MXI only with real-time updates */}
        <UniversalMXICounter />

        {/* Footer */}
        <Footer />

        {/* Extra padding at bottom to avoid tab bar */}
        <View style={{ height: 120 }} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}
