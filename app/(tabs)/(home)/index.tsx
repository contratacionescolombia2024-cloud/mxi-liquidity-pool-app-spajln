
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter } from 'expo-router';
import VestingCounter from '@/components/VestingCounter';
import MenuButton from '@/components/MenuButton';
import { colors, commonStyles } from '@/styles/commonStyles';

interface PhaseInfo {
  totalTokensSold: number;
  currentPhase: number;
  currentPriceUsdt: number;
  phase1TokensSold: number;
  phase2TokensSold: number;
  phase3TokensSold: number;
  phase1Remaining: number;
  phase2Remaining: number;
  tokensUntilNextPhase: number;
}

export default function HomeScreen() {
  const { user, getPoolStatus, getPhaseInfo } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [poolCloseDate, setPoolCloseDate] = useState<Date | null>(null);
  const [daysUntilClose, setDaysUntilClose] = useState(0);
  const [phaseInfo, setPhaseInfo] = useState<PhaseInfo | null>(null);

  useEffect(() => {
    loadPoolStatus();
    loadPhaseInfo();
  }, []);

  useEffect(() => {
    if (poolCloseDate) {
      const interval = setInterval(() => {
        const now = new Date();
        const diff = poolCloseDate.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        setDaysUntilClose(days);
      }, 1000 * 60);

      return () => clearInterval(interval);
    }
  }, [poolCloseDate]);

  const loadPoolStatus = async () => {
    const status = await getPoolStatus();
    if (status) {
      setPoolCloseDate(new Date(status.pool_close_date));
      setDaysUntilClose(status.days_until_close);
    }
  };

  const loadPhaseInfo = async () => {
    const info = await getPhaseInfo();
    if (info) {
      setPhaseInfo(info);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPoolStatus();
    await loadPhaseInfo();
    setRefreshing(false);
  };

  const getPhaseDescription = (phase: number) => {
    switch (phase) {
      case 1:
        return '8.33M MXI at $0.40 USDT';
      case 2:
        return '8.33M MXI at $0.60 USDT';
      case 3:
        return '8.33M MXI at $0.80 USDT';
      default:
        return '';
    }
  };

  const getPhaseProgress = () => {
    if (!phaseInfo) return 0;
    
    const phaseLimit = 8333333.33;
    let currentPhaseSold = 0;
    
    if (phaseInfo.currentPhase === 1) {
      currentPhaseSold = phaseInfo.phase1TokensSold;
    } else if (phaseInfo.currentPhase === 2) {
      currentPhaseSold = phaseInfo.phase2TokensSold;
    } else if (phaseInfo.currentPhase === 3) {
      currentPhaseSold = phaseInfo.phase3TokensSold;
    }
    
    return (currentPhaseSold / phaseLimit) * 100;
  };

  if (!user) {
    return null;
  }

  // Debug logging for vesting counter visibility
  console.log('=== VESTING COUNTER DEBUG ===');
  console.log('User isActiveContributor:', user.isActiveContributor);
  console.log('User yieldRatePerMinute:', user.yieldRatePerMinute);
  console.log('User mxiPurchasedDirectly:', user.mxiPurchasedDirectly);
  console.log('User mxiFromUnifiedCommissions:', user.mxiFromUnifiedCommissions);
  console.log('Should show vesting counter:', user.isActiveContributor && user.yieldRatePerMinute > 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <MenuButton />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bienvenido de nuevo,</Text>
            <Text style={styles.userName}>{user.name}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <IconSymbol 
              ios_icon_name="person.circle.fill" 
              android_material_icon_name="account_circle" 
              size={40} 
              color={colors.primary} 
            />
          </TouchableOpacity>
        </View>

        {/* Phase Progress Card */}
        {phaseInfo && (
          <View style={[commonStyles.card, styles.phaseCard]}>
            <View style={styles.phaseHeader}>
              <View style={styles.phaseHeaderLeft}>
                <View style={styles.phaseIconContainer}>
                  <Text style={styles.phaseIconEmoji}>📊</Text>
                </View>
                <View>
                  <Text style={styles.phaseTitle}>Fase {phaseInfo.currentPhase} Activa</Text>
                  <Text style={styles.phaseSubtitle}>{getPhaseDescription(phaseInfo.currentPhase)}</Text>
                </View>
              </View>
              <View style={styles.phaseBadge}>
                <Text style={styles.phaseBadgeText}>${phaseInfo.currentPriceUsdt.toFixed(2)}</Text>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${Math.min(getPhaseProgress(), 100)}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {phaseInfo.tokensUntilNextPhase.toLocaleString()} MXI hasta la próxima fase
              </Text>
            </View>

            <View style={styles.phaseStats}>
              <View style={styles.phaseStat}>
                <Text style={styles.phaseStatLabel}>Total Vendido</Text>
                <Text style={styles.phaseStatValue}>
                  {(phaseInfo.totalTokensSold / 1000000).toFixed(2)}M
                </Text>
              </View>
              <View style={styles.phaseStatDivider} />
              <View style={styles.phaseStat}>
                <Text style={styles.phaseStatLabel}>Pre-Venta Total</Text>
                <Text style={styles.phaseStatValue}>25M MXI</Text>
              </View>
              <View style={styles.phaseStatDivider} />
              <View style={styles.phaseStat}>
                <Text style={styles.phaseStatLabel}>Progreso</Text>
                <Text style={styles.phaseStatValue}>
                  {((phaseInfo.totalTokensSold / 25000000) * 100).toFixed(1)}%
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Balance Card */}
        <View style={[commonStyles.card, styles.balanceCard]}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Balance MXI</Text>
            <View style={styles.balanceIconContainer}>
              <Text style={styles.balanceIconEmoji}>💎</Text>
            </View>
          </View>
          <Text style={styles.balanceAmount}>{user.mxiBalance.toFixed(2)}</Text>
          <View style={styles.balanceFooter}>
            <View style={styles.balanceDetail}>
              <Text style={styles.balanceDetailLabel}>Contribuido</Text>
              <Text style={styles.balanceDetailValue}>${user.usdtContributed.toFixed(2)}</Text>
            </View>
            <View style={styles.balanceDetail}>
              <Text style={styles.balanceDetailLabel}>Valor Actual</Text>
              <Text style={styles.balanceDetailValue}>
                ${(user.mxiBalance * (phaseInfo?.currentPriceUsdt || 0.4)).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Vesting Counter - Always show if user is active contributor */}
        {user.isActiveContributor && (
          <View style={styles.vestingSection}>
            <VestingCounter />
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[commonStyles.card, styles.actionCard]}
              onPress={() => router.push('/(tabs)/(home)/contribute')}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.primary + '20' }]}>
                <Text style={styles.actionIconEmoji}>💰</Text>
              </View>
              <Text style={styles.actionTitle}>Comprar MXI</Text>
              <Text style={styles.actionSubtitle}>
                Min: $20{'\n'}Max: $40,000
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[commonStyles.card, styles.actionCard]}
              onPress={() => router.push('/(tabs)/(home)/referrals')}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.success + '20' }]}>
                <Text style={styles.actionIconEmoji}>👥</Text>
              </View>
              <Text style={styles.actionTitle}>Referidos</Text>
              <Text style={styles.actionSubtitle}>
                {user.activeReferrals} activos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[commonStyles.card, styles.actionCard]}
              onPress={() => router.push('/(tabs)/(home)/vesting')}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.accent + '20' }]}>
                <Text style={styles.actionIconEmoji}>⛏️</Text>
              </View>
              <Text style={styles.actionTitle}>Vesting</Text>
              <Text style={styles.actionSubtitle}>
                {user.isActiveContributor ? 'Ver detalles' : 'No activo'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[commonStyles.card, styles.actionCard]}
              onPress={() => router.push('/(tabs)/(home)/withdrawal')}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.warning + '20' }]}>
                <Text style={styles.actionIconEmoji}>💸</Text>
              </View>
              <Text style={styles.actionTitle}>Retirar</Text>
              <Text style={styles.actionSubtitle}>
                ${user.commissions.available.toFixed(2)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[commonStyles.card, styles.actionCard]}
              onPress={() => router.push('/(tabs)/(home)/kyc-verification')}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.accent + '20' }]}>
                <Text style={styles.actionIconEmoji}>🔐</Text>
              </View>
              <Text style={styles.actionTitle}>KYC</Text>
              <Text style={styles.actionSubtitle}>
                {user.kycStatus === 'approved' ? 'Verificado ✓' : 'Verificar ahora'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pool Status */}
        <View style={[commonStyles.card, styles.poolCard]}>
          <View style={styles.poolHeader}>
            <View style={styles.poolIconContainer}>
              <Text style={styles.poolIconEmoji}>⏰</Text>
            </View>
            <Text style={styles.poolTitle}>Preventa Cierra En</Text>
          </View>
          <Text style={styles.poolDays}>{daysUntilClose} días</Text>
          <Text style={styles.poolDate}>
            {poolCloseDate?.toLocaleDateString('es-ES', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </View>

        {/* Phase Breakdown */}
        {phaseInfo && (
          <View style={commonStyles.card}>
            <Text style={styles.sectionTitle}>Desglose de Fases</Text>
            
            <View style={styles.phaseBreakdown}>
              <View style={[styles.phaseItem, phaseInfo.currentPhase === 1 && styles.phaseItemActive]}>
                <View style={styles.phaseItemHeader}>
                  <Text style={styles.phaseItemTitle}>Fase 1</Text>
                  {phaseInfo.currentPhase === 1 && (
                    <View style={styles.activeIndicator}>
                      <Text style={styles.activeIndicatorText}>ACTIVA</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.phaseItemPrice}>$0.40 USDT por MXI</Text>
                <Text style={styles.phaseItemSold}>
                  {(phaseInfo.phase1TokensSold / 1000000).toFixed(2)}M / 8.33M vendidos
                </Text>
                <View style={styles.phaseProgressBar}>
                  <View 
                    style={[
                      styles.phaseProgressFill, 
                      { width: `${(phaseInfo.phase1TokensSold / 8333333.33) * 100}%` }
                    ]} 
                  />
                </View>
              </View>

              <View style={[styles.phaseItem, phaseInfo.currentPhase === 2 && styles.phaseItemActive]}>
                <View style={styles.phaseItemHeader}>
                  <Text style={styles.phaseItemTitle}>Fase 2</Text>
                  {phaseInfo.currentPhase === 2 && (
                    <View style={styles.activeIndicator}>
                      <Text style={styles.activeIndicatorText}>ACTIVA</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.phaseItemPrice}>$0.60 USDT por MXI</Text>
                <Text style={styles.phaseItemSold}>
                  {(phaseInfo.phase2TokensSold / 1000000).toFixed(2)}M / 8.33M vendidos
                </Text>
                <View style={styles.phaseProgressBar}>
                  <View 
                    style={[
                      styles.phaseProgressFill, 
                      { width: `${(phaseInfo.phase2TokensSold / 8333333.33) * 100}%` }
                    ]} 
                  />
                </View>
              </View>

              <View style={[styles.phaseItem, phaseInfo.currentPhase === 3 && styles.phaseItemActive]}>
                <View style={styles.phaseItemHeader}>
                  <Text style={styles.phaseItemTitle}>Fase 3</Text>
                  {phaseInfo.currentPhase === 3 && (
                    <View style={styles.activeIndicator}>
                      <Text style={styles.activeIndicatorText}>ACTIVA</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.phaseItemPrice}>$0.80 USDT por MXI</Text>
                <Text style={styles.phaseItemSold}>
                  {(phaseInfo.phase3TokensSold / 1000000).toFixed(2)}M / 8.33M vendidos
                </Text>
                <View style={styles.phaseProgressBar}>
                  <View 
                    style={[
                      styles.phaseProgressFill, 
                      { width: `${(phaseInfo.phase3TokensSold / 8333333.33) * 100}%` }
                    ]} 
                  />
                </View>
              </View>
            </View>
          </View>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  profileButton: {
    padding: 4,
  },
  phaseCard: {
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  phaseHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  phaseIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.accent}30`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseIconEmoji: {
    fontSize: 24,
  },
  phaseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  phaseSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  phaseBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  phaseBadgeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  phaseStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  phaseStat: {
    alignItems: 'center',
  },
  phaseStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  phaseStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  phaseStatDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  balanceCard: {
    marginBottom: 16,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  balanceIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceIconEmoji: {
    fontSize: 20,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  balanceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  balanceDetail: {
    flex: 1,
  },
  balanceDetailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  balanceDetailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  vestingSection: {
    marginBottom: 16,
  },
  actionsContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: '47%',
    alignItems: 'center',
    padding: 16,
  },
  actionIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionIconEmoji: {
    fontSize: 36,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  poolCard: {
    alignItems: 'center',
    marginBottom: 16,
  },
  poolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  poolIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  poolIconEmoji: {
    fontSize: 20,
  },
  poolTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  poolDays: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  poolDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  phaseBreakdown: {
    gap: 12,
  },
  phaseItem: {
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  phaseItemActive: {
    borderColor: colors.accent,
    borderWidth: 2,
    backgroundColor: colors.accent + '10',
  },
  phaseItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  phaseItemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  activeIndicator: {
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeIndicatorText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  phaseItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  phaseItemSold: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  phaseProgressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  phaseProgressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
});
