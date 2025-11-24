
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { UniversalMXICounter } from '@/components/UniversalMXICounter';
import { YieldDisplay } from '@/components/YieldDisplay';
import { LaunchCountdown } from '@/components/LaunchCountdown';
import { supabase } from '@/lib/supabase';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  phaseCard: {
    backgroundColor: colors.primary + '20',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  phaseTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  phasePrice: {
    fontSize: 42,
    fontWeight: '900',
    color: colors.primary,
    marginBottom: 4,
  },
  phaseSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  poolCounterCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  poolCounterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  poolCounterValue: {
    fontSize: 48,
    fontWeight: '900',
    color: colors.success,
    marginBottom: 4,
  },
  poolCounterLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  totalBalanceCard: {
    backgroundColor: colors.primary + '15',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  totalBalanceValue: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  balanceBreakdown: {
    gap: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '30',
  },
  breakdownLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  commissionsCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  commissionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  commissionItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    gap: 8,
  },
  commissionValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  commissionLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  phasesCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currentPhaseInfo: {
    backgroundColor: colors.primary + '20',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  currentPhaseLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  currentPhasePrice: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.primary,
  },
  phasesList: {
    gap: 12,
    marginBottom: 16,
  },
  phaseItem: {
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  phaseLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  phaseValue: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  overallProgress: {
    marginBottom: 16,
  },
  overallProgressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  progressBar: {
    height: 12,
    backgroundColor: colors.border,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  progressSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  poolCloseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  poolCloseText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionIcon: {
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  statsCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  kycBanner: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.warning,
    flexDirection: 'row',
    alignItems: 'center',
  },
  kycBannerText: {
    flex: 1,
    marginLeft: 12,
  },
  kycBannerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.warning,
    marginBottom: 4,
  },
  kycBannerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  usdtPaymentButton: {
    backgroundColor: colors.success,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: colors.success,
  },
  usdtPaymentButtonText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
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
  const [poolParticipants, setPoolParticipants] = useState(56527);
  const [commissions, setCommissions] = useState({ available: 0, total: 0 });
  const [saldoMxi, setSaldoMxi] = useState(0);

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

      // Load pool participants count
      const { data: metricsData, error: metricsError } = await supabase
        .from('metrics')
        .select('*')
        .single();

      if (!metricsError && metricsData) {
        setPoolParticipants(metricsData.total_members || 56527);

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

      // Load saldo_mxi
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('saldo_mxi')
        .eq('id', user?.id)
        .single();

      if (!userError && userData) {
        setSaldoMxi(parseFloat(userData.saldo_mxi || 0));
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
      <View style={styles.header}>
        <Text style={styles.greeting}>Hola, {user.name}</Text>
        <Text style={styles.subtitle}>Bienvenido al Pool de Liquidez MXI</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* KYC Banner */}
        {user.kycStatus !== 'approved' && (
          <TouchableOpacity
            style={styles.kycBanner}
            onPress={() => router.push('/(tabs)/(home)/kyc-verification')}
          >
            <IconSymbol
              ios_icon_name="exclamationmark.triangle.fill"
              android_material_icon_name="warning"
              size={24}
              color={colors.warning}
            />
            <View style={styles.kycBannerText}>
              <Text style={styles.kycBannerTitle}>Verificación KYC Requerida</Text>
              <Text style={styles.kycBannerSubtitle}>
                Completa tu verificación para poder retirar fondos
              </Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron_right"
              size={20}
              color={colors.warning}
            />
          </TouchableOpacity>
        )}

        {/* USDT Payment Button */}
        <TouchableOpacity
          style={styles.usdtPaymentButton}
          onPress={() => router.push('/(tabs)/(home)/pagar-usdt')}
        >
          <IconSymbol
            ios_icon_name="dollarsign.circle.fill"
            android_material_icon_name="attach_money"
            size={28}
            color="#FFFFFF"
          />
          <Text style={styles.usdtPaymentButtonText}>
            Pagar con USDT ERC20
          </Text>
        </TouchableOpacity>

        {/* Saldo MXI Card */}
        {saldoMxi > 0 && (
          <TouchableOpacity
            style={styles.totalBalanceCard}
            onPress={() => router.push('/(tabs)/(home)/saldo-mxi')}
          >
            <Text style={styles.cardTitle}>Saldo MXI (USDT Payments)</Text>
            <Text style={styles.totalBalanceValue}>
              {saldoMxi.toLocaleString('es-ES', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} MXI
            </Text>
            <Text style={styles.phaseSubtitle}>
              Toca para ver detalles →
            </Text>
          </TouchableOpacity>
        )}

        {/* Current Phase Price Card */}
        {phaseInfo && phaseInfo.currentPhase && phaseInfo.currentPriceUsdt !== undefined && (
          <View style={styles.phaseCard}>
            <Text style={styles.phaseTitle}>Fase {phaseInfo.currentPhase} - Precio Actual</Text>
            <Text style={styles.phasePrice}>${phaseInfo.currentPriceUsdt.toFixed(2)}</Text>
            <Text style={styles.phaseSubtitle}>USDT por MXI</Text>
          </View>
        )}

        {/* Pool Participants Counter */}
        <View style={styles.poolCounterCard}>
          <Text style={styles.poolCounterTitle}>Participantes del Pool</Text>
          <Text style={styles.poolCounterValue}>
            {poolParticipants.toLocaleString('es-ES')}
          </Text>
          <Text style={styles.poolCounterLabel}>de 250,000 personas</Text>
        </View>

        {/* Total MXI Balance Card */}
        <View style={styles.totalBalanceCard}>
          <Text style={styles.cardTitle}>Balance Total de MXI</Text>
          <Text style={styles.totalBalanceValue}>
            {(user.mxiBalance || 0).toLocaleString('es-ES', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} MXI
          </Text>
          <View style={styles.balanceBreakdown}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>MXI Comprados:</Text>
              <Text style={styles.breakdownValue}>
                {(user.mxiPurchasedDirectly || 0).toFixed(2)}
              </Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>MXI de Vesting:</Text>
              <Text style={styles.breakdownValue}>
                {(user.mxiVestingLocked || 0).toFixed(2)}
              </Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>MXI de Torneos:</Text>
              <Text style={styles.breakdownValue}>
                {(user.mxiFromChallenges || 0).toFixed(2)}
              </Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>MXI de Comisiones:</Text>
              <Text style={styles.breakdownValue}>
                {(user.mxiFromUnifiedCommissions || 0).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Commissions and Referrals Card */}
        <View style={styles.commissionsCard}>
          <Text style={styles.cardTitle}>Comisiones y Referidos</Text>
          <View style={styles.commissionsGrid}>
            <View style={styles.commissionItem}>
              <IconSymbol 
                ios_icon_name="dollarsign.circle.fill" 
                android_material_icon_name="attach_money" 
                size={32} 
                color={colors.success} 
              />
              <Text style={styles.commissionValue}>
                ${commissions.available.toFixed(2)}
              </Text>
              <Text style={styles.commissionLabel}>Disponibles</Text>
            </View>
            <View style={styles.commissionItem}>
              <IconSymbol 
                ios_icon_name="chart.bar.fill" 
                android_material_icon_name="bar_chart" 
                size={32} 
                color={colors.primary} 
              />
              <Text style={styles.commissionValue}>
                ${commissions.total.toFixed(2)}
              </Text>
              <Text style={styles.commissionLabel}>Total Comisiones</Text>
            </View>
            <View style={styles.commissionItem}>
              <IconSymbol 
                ios_icon_name="person.3.fill" 
                android_material_icon_name="group" 
                size={32} 
                color={colors.accent} 
              />
              <Text style={styles.commissionValue}>
                {user.activeReferrals || 0}
              </Text>
              <Text style={styles.commissionLabel}>Referidos Activos</Text>
            </View>
            <View style={styles.commissionItem}>
              <IconSymbol 
                ios_icon_name="banknote.fill" 
                android_material_icon_name="payments" 
                size={32} 
                color={colors.warning} 
              />
              <Text style={styles.commissionValue}>
                ${(user.usdtContributed || 0).toFixed(2)}
              </Text>
              <Text style={styles.commissionLabel}>USDT Contribuido</Text>
            </View>
          </View>
        </View>

        {/* Phases and Progress Card */}
        {phaseInfo && phaseInfo.phase1 && phaseInfo.phase2 && phaseInfo.phase3 && (
          <View style={styles.phasesCard}>
            <Text style={styles.cardTitle}>Fases y Progreso</Text>
            
            <View style={styles.currentPhaseInfo}>
              <Text style={styles.currentPhaseLabel}>Fase Actual: {phaseInfo.currentPhase || 1}</Text>
              <Text style={styles.currentPhasePrice}>
                ${(phaseInfo.currentPriceUsdt || 0.40).toFixed(2)} USDT por MXI
              </Text>
            </View>

            <View style={styles.phasesList}>
              <View style={styles.phaseItem}>
                <Text style={styles.phaseLabel}>Fase 1 (0.40 USDT)</Text>
                <Text style={styles.phaseValue}>
                  Vendidos: {(phaseInfo.phase1.sold || 0).toLocaleString('es-ES')} MXI
                </Text>
                <Text style={styles.phaseValue}>
                  Restantes: {(phaseInfo.phase1.remaining || 8333333).toLocaleString('es-ES')} MXI
                </Text>
              </View>
              <View style={styles.phaseItem}>
                <Text style={styles.phaseLabel}>Fase 2 (0.70 USDT)</Text>
                <Text style={styles.phaseValue}>
                  Vendidos: {(phaseInfo.phase2.sold || 0).toLocaleString('es-ES')} MXI
                </Text>
                <Text style={styles.phaseValue}>
                  Restantes: {(phaseInfo.phase2.remaining || 8333333).toLocaleString('es-ES')} MXI
                </Text>
              </View>
              <View style={styles.phaseItem}>
                <Text style={styles.phaseLabel}>Fase 3 (1.00 USDT)</Text>
                <Text style={styles.phaseValue}>
                  Vendidos: {(phaseInfo.phase3.sold || 0).toLocaleString('es-ES')} MXI
                </Text>
                <Text style={styles.phaseValue}>
                  Restantes: {(phaseInfo.phase3.remaining || 8333334).toLocaleString('es-ES')} MXI
                </Text>
              </View>
            </View>

            <View style={styles.overallProgress}>
              <Text style={styles.overallProgressLabel}>Progreso General</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${Math.min(phaseInfo.overallProgress || 0, 100)}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {(phaseInfo.overallProgress || 0).toFixed(2)}% - {(phaseInfo.totalSold || 0).toLocaleString('es-ES')} / 25,000,000 MXI
              </Text>
              <Text style={styles.progressSubtext}>
                Saldo Restante: {(phaseInfo.totalRemaining || 25000000).toLocaleString('es-ES')} MXI
              </Text>
            </View>

            <View style={styles.poolCloseInfo}>
              <IconSymbol 
                ios_icon_name="clock.fill" 
                android_material_icon_name="schedule" 
                size={20} 
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

        {/* Launch Countdown */}
        <LaunchCountdown />

        {/* Yield Display */}
        <YieldDisplay />

        {/* Universal MXI Counter */}
        <UniversalMXICounter />

        {/* Quick Actions */}
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/(home)/referrals')}
          >
            <IconSymbol
              ios_icon_name="person.2.fill"
              android_material_icon_name="group"
              size={32}
              color={colors.primary}
              style={styles.actionIcon}
            />
            <Text style={styles.actionLabel}>Referidos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/(home)/historial-pagos-usdt')}
          >
            <IconSymbol
              ios_icon_name="clock.fill"
              android_material_icon_name="history"
              size={32}
              color={colors.primary}
              style={styles.actionIcon}
            />
            <Text style={styles.actionLabel}>Historial USDT</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/(home)/vesting')}
          >
            <IconSymbol
              ios_icon_name="chart.line.uptrend.xyaxis"
              android_material_icon_name="trending_up"
              size={32}
              color={colors.primary}
              style={styles.actionIcon}
            />
            <Text style={styles.actionLabel}>Vesting</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/(home)/withdraw-mxi')}
          >
            <IconSymbol
              ios_icon_name="arrow.up.circle.fill"
              android_material_icon_name="upload"
              size={32}
              color={colors.primary}
              style={styles.actionIcon}
            />
            <Text style={styles.actionLabel}>Retirar</Text>
          </TouchableOpacity>
        </View>

        {/* Extra padding at bottom to avoid tab bar */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
