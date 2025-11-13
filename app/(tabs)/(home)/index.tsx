
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
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import YieldDisplay from '@/components/YieldDisplay';

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
  const router = useRouter();
  const { user, getPoolStatus, getPhaseInfo } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [poolCloseDate, setPoolCloseDate] = useState<Date | null>(null);
  const [poolCloseDateString, setPoolCloseDateString] = useState('');
  const [phaseInfo, setPhaseInfo] = useState<PhaseInfo | null>(null);

  useEffect(() => {
    loadPoolStatus();
    loadPhaseInfo();
  }, []);

  const loadPoolStatus = async () => {
    const status = await getPoolStatus();
    if (status) {
      const closeDate = new Date(status.pool_close_date);
      setPoolCloseDate(closeDate);
      setPoolCloseDateString(closeDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
        timeZoneName: 'short',
      }));
    }
  };

  const loadPhaseInfo = async () => {
    const info = await getPhaseInfo();
    if (info) {
      setPhaseInfo(info);
    }
  };

  useEffect(() => {
    if (!poolCloseDate) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = poolCloseDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Pool Closed - Extending...');
        // Reload pool status to get new extended date
        loadPoolStatus();
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [poolCloseDate]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPoolStatus();
    await loadPhaseInfo();
    setRefreshing(false);
  };

  if (!user) {
    return null;
  }

  const totalValue = phaseInfo ? user.mxiBalance * phaseInfo.currentPriceUsdt : 0;

  const getPhaseDescription = (phase: number) => {
    switch (phase) {
      case 1:
        return '10M MXI at 0.30 USDT';
      case 2:
        return '10M MXI at 0.60 USDT';
      case 3:
        return '10M MXI at 0.90 USDT';
      default:
        return '';
    }
  };

  const getPhaseProgress = () => {
    if (!phaseInfo) return 0;
    
    const PHASE_LIMIT = 10000000; // 10M tokens per phase
    
    if (phaseInfo.currentPhase === 1) {
      return (phaseInfo.phase1TokensSold / PHASE_LIMIT) * 100;
    } else if (phaseInfo.currentPhase === 2) {
      return (phaseInfo.phase2TokensSold / PHASE_LIMIT) * 100;
    } else if (phaseInfo.currentPhase === 3) {
      return (phaseInfo.phase3TokensSold / PHASE_LIMIT) * 100;
    }
    return 100;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={require('@/assets/images/04a4d9ac-4539-41d2-bafd-67dd75925bde.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.appName}>MXI Strategic PreSale</Text>
              <Text style={styles.userName}>{user.name}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <IconSymbol name="person.circle.fill" size={40} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Active Contributor Badge */}
        {user.isActiveContributor && (
          <View style={[commonStyles.card, styles.activeContributorCard]}>
            <View style={styles.activeContributorContent}>
              <View style={styles.activeContributorIcon}>
                <IconSymbol name="checkmark.circle.fill" size={32} color="#fff" />
              </View>
              <View style={styles.activeContributorText}>
                <Text style={styles.activeContributorTitle}>Active Contributor</Text>
                <Text style={styles.activeContributorSubtitle}>
                  You are an active contributor to the MXI Strategic PreSale
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Token Sales Phase Card */}
        {phaseInfo && (
          <View style={[commonStyles.card, styles.phaseCard]}>
            <View style={styles.phaseHeader}>
              <View style={styles.phaseHeaderLeft}>
                <IconSymbol name="chart.line.uptrend.xyaxis" size={24} color={colors.accent} />
                <Text style={styles.phaseTitle}>Phase {phaseInfo.currentPhase}</Text>
              </View>
              <View style={styles.phaseBadge}>
                <Text style={styles.phaseBadgeText}>${phaseInfo.currentPriceUsdt.toFixed(2)} USDT</Text>
              </View>
            </View>
            
            <Text style={styles.phaseDescription}>{getPhaseDescription(phaseInfo.currentPhase)}</Text>
            
            <View style={styles.tokensSoldContainer}>
              <Text style={styles.tokensSoldLabel}>Total Tokens Sold</Text>
              <Text style={styles.tokensSoldValue}>
                {phaseInfo.totalTokensSold.toLocaleString('en-US', { maximumFractionDigits: 0 })} MXI
              </Text>
              <Text style={styles.tokensSoldSubtext}>
                of 30,000,000 MXI Pre-Sale
              </Text>
            </View>

            {phaseInfo.currentPhase <= 3 && (
              <>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarBackground}>
                    <View 
                      style={[
                        styles.progressBarFill, 
                        { width: `${getPhaseProgress()}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {getPhaseProgress().toFixed(1)}% Complete
                  </Text>
                </View>

                <View style={styles.phaseStatsRow}>
                  <View style={styles.phaseStat}>
                    <Text style={styles.phaseStatLabel}>Sold in Phase</Text>
                    <Text style={styles.phaseStatValue}>
                      {(phaseInfo.currentPhase === 1 
                        ? phaseInfo.phase1TokensSold 
                        : phaseInfo.currentPhase === 2
                        ? phaseInfo.phase2TokensSold
                        : phaseInfo.phase3TokensSold
                      ).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </Text>
                  </View>
                  <View style={styles.phaseStat}>
                    <Text style={styles.phaseStatLabel}>Remaining</Text>
                    <Text style={styles.phaseStatValue}>
                      {phaseInfo.tokensUntilNextPhase.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </Text>
                  </View>
                </View>
              </>
            )}

            {/* Phase Timeline */}
            <View style={styles.phaseTimeline}>
              <View style={styles.timelineItem}>
                <View style={[
                  styles.timelineDot, 
                  phaseInfo.currentPhase >= 1 && styles.timelineDotActive
                ]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelinePhase}>Phase 1</Text>
                  <Text style={styles.timelinePrice}>$0.30</Text>
                  <Text style={styles.timelineAmount}>10M</Text>
                </View>
              </View>
              <View style={[
                styles.timelineLine,
                phaseInfo.currentPhase >= 2 && styles.timelineLineActive
              ]} />
              <View style={styles.timelineItem}>
                <View style={[
                  styles.timelineDot,
                  phaseInfo.currentPhase >= 2 && styles.timelineDotActive
                ]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelinePhase}>Phase 2</Text>
                  <Text style={styles.timelinePrice}>$0.60</Text>
                  <Text style={styles.timelineAmount}>10M</Text>
                </View>
              </View>
              <View style={[
                styles.timelineLine,
                phaseInfo.currentPhase >= 3 && styles.timelineLineActive
              ]} />
              <View style={styles.timelineItem}>
                <View style={[
                  styles.timelineDot,
                  phaseInfo.currentPhase >= 3 && styles.timelineDotActive
                ]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelinePhase}>Phase 3</Text>
                  <Text style={styles.timelinePrice}>$0.90</Text>
                  <Text style={styles.timelineAmount}>10M</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Yield Display - Real-time mining */}
        <YieldDisplay />

        {/* Countdown Card */}
        <View style={[commonStyles.card, styles.countdownCard]}>
          <View style={styles.countdownHeader}>
            <IconSymbol name="clock.fill" size={24} color={colors.accent} />
            <Text style={styles.countdownTitle}>Pre-Sale Closes In</Text>
          </View>
          <Text style={styles.countdownTime}>{timeRemaining}</Text>
          <Text style={styles.countdownDate}>{poolCloseDateString || 'Loading...'}</Text>
          <Text style={styles.countdownNote}>
            Pre-Sale extends by 30 days after closing
          </Text>
        </View>

        {/* MXI Balance Card */}
        <View style={[commonStyles.card, styles.balanceCard]}>
          <Text style={styles.balanceLabel}>Your MXI Balance</Text>
          <View style={styles.balanceRow}>
            <IconSymbol name="dollarsign.circle.fill" size={32} color={colors.primary} />
            <Text style={styles.balanceAmount}>{user.mxiBalance.toFixed(2)}</Text>
            <Text style={styles.balanceCurrency}>MXI</Text>
          </View>
          <View style={styles.balanceDetails}>
            <View style={styles.balanceDetailItem}>
              <Text style={styles.balanceDetailLabel}>Current Price</Text>
              <Text style={styles.balanceDetailValue}>
                ${phaseInfo?.currentPriceUsdt.toFixed(2) || '0.00'} USDT
              </Text>
            </View>
            <View style={styles.balanceDetailItem}>
              <Text style={styles.balanceDetailLabel}>Total Value</Text>
              <Text style={styles.balanceDetailValue}>${totalValue.toFixed(2)}</Text>
            </View>
          </View>
          <View style={styles.contributionInfo}>
            <Text style={styles.contributionLabel}>Total Contributed</Text>
            <Text style={styles.contributionAmount}>${user.usdtContributed.toFixed(2)} USDT</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryAction]}
            onPress={() => router.push('/(tabs)/(home)/contribute')}
          >
            <IconSymbol name="plus" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Buy MXI</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryAction]}
            onPress={() => router.push('/(tabs)/(home)/referrals')}
          >
            <IconSymbol name="person.2.fill" size={24} color={colors.primary} />
            <Text style={styles.actionButtonTextSecondary}>Referrals</Text>
          </TouchableOpacity>
        </View>

        {/* MXI Withdrawal Button */}
        <TouchableOpacity
          style={[styles.actionButton, styles.mxiWithdrawAction]}
          onPress={() => router.push('/(tabs)/(home)/withdraw-mxi')}
        >
          <IconSymbol name="dollarsign.circle.fill" size={24} color={colors.accent} />
          <Text style={styles.actionButtonTextMXI}>Withdraw MXI</Text>
          <View style={styles.withdrawBadge}>
            <Text style={styles.withdrawBadgeText}>
              {user.activeReferrals}/5
            </Text>
          </View>
        </TouchableOpacity>

        {/* Binance Payments Button */}
        <TouchableOpacity
          style={[styles.actionButton, styles.binancePaymentsAction]}
          onPress={() => router.push('/(tabs)/(home)/binance-payments')}
        >
          <IconSymbol name="creditcard.fill" size={24} color={colors.secondary} />
          <Text style={styles.actionButtonTextBinance}>View Binance Payments</Text>
        </TouchableOpacity>

        {/* Contrataciones Button */}
        <TouchableOpacity
          style={[styles.actionButton, styles.contratacionesAction]}
          onPress={() => router.push('/(tabs)/(home)/contrataciones')}
        >
          <IconSymbol name="briefcase.fill" size={24} color={colors.primary} />
          <Text style={styles.actionButtonTextContrataciones}>Contrataciones</Text>
        </TouchableOpacity>

        {/* Info Banner */}
        <View style={[commonStyles.card, styles.infoBanner]}>
          <IconSymbol name="info.circle.fill" size={20} color={colors.primary} />
          <Text style={styles.infoBannerText}>
            Earn up to 6% commission through our 3-level referral system!
          </Text>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerLogo: {
    width: 50,
    height: 50,
  },
  appName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 2,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  settingsButton: {
    padding: 4,
  },
  activeContributorCard: {
    backgroundColor: colors.success,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#10b981',
  },
  activeContributorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  activeContributorIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeContributorText: {
    flex: 1,
  },
  activeContributorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  activeContributorSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  phaseCard: {
    backgroundColor: colors.card,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  phaseHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  phaseTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  phaseBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  phaseBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  phaseDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  tokensSoldContainer: {
    marginBottom: 16,
  },
  tokensSoldLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  tokensSoldValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  tokensSoldSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  phaseStatsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  phaseStat: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
  },
  phaseStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  phaseStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  phaseTimeline: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  timelineItem: {
    alignItems: 'center',
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.border,
    marginBottom: 8,
  },
  timelineDotActive: {
    backgroundColor: colors.accent,
  },
  timelineContent: {
    alignItems: 'center',
  },
  timelinePhase: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  timelinePrice: {
    fontSize: 10,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  timelineAmount: {
    fontSize: 9,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  timelineLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
    marginBottom: 40,
  },
  timelineLineActive: {
    backgroundColor: colors.accent,
  },
  countdownCard: {
    backgroundColor: colors.primary,
    marginBottom: 16,
  },
  countdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  countdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  countdownTime: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  countdownDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  countdownNote: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
  },
  balanceCard: {
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 12,
  },
  balanceCurrency: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 8,
  },
  balanceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: 12,
  },
  balanceDetailItem: {
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
  contributionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  contributionLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  contributionAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryAction: {
    backgroundColor: colors.primary,
  },
  secondaryAction: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  actionButtonTextSecondary: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  mxiWithdrawAction: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.accent,
    marginBottom: 16,
    position: 'relative',
  },
  actionButtonTextMXI: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
  },
  withdrawBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 40,
    alignItems: 'center',
  },
  withdrawBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  binancePaymentsAction: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.secondary,
    marginBottom: 16,
  },
  actionButtonTextBinance: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
  },
  contratacionesAction: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: 16,
  },
  actionButtonTextContrataciones: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.highlight,
    gap: 12,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});
