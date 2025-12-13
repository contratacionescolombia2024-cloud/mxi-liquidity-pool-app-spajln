
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useLanguage } from '@/contexts/LanguageContext';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { useVestingData } from '@/hooks/useVestingData';
import { formatVestingValue } from '@/utils/safeNumericParse';

export default function RewardsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { vestingData, loading, refresh } = useVestingData();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(Math.max(0, num));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('loadingRewards')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!vestingData) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>No se pudieron cargar los datos de vesting</Text>
        </View>
      </SafeAreaView>
    );
  }

  const {
    currentYield,
    mxiPurchased,
    mxiCommissions,
    mxiTournaments,
    maxMonthlyYield,
    progressPercentage,
  } = vestingData;

  // Calculate total MXI earned from all sources
  const totalMxiEarned = mxiPurchased + mxiCommissions + mxiTournaments;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎁 {t('rewards')}</Text>
        <Text style={styles.headerSubtitle}>{t('earnMXIMultipleWays')}</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Total Rewards Summary */}
        <View style={[commonStyles.card, styles.summaryCard]}>
          <View style={styles.summaryHeader}>
            <IconSymbol 
              ios_icon_name="star.fill" 
              android_material_icon_name="star" 
              size={32} 
              color={colors.primary} 
            />
            <View style={styles.summaryTextContainer}>
              <Text style={styles.summaryLabel}>{t('totalMXIEarned')}</Text>
              <Text style={styles.summaryValue}>{formatNumber(totalMxiEarned)} MXI</Text>
            </View>
          </View>

          <View style={styles.summaryBreakdown}>
            <View style={styles.breakdownItem}>
              <IconSymbol 
                ios_icon_name="person.3.fill" 
                android_material_icon_name="people" 
                size={16} 
                color={colors.warning} 
              />
              <Text style={styles.breakdownLabel}>{t('commissions')}</Text>
              <Text style={styles.breakdownValue}>{formatNumber(mxiCommissions)}</Text>
            </View>

            <View style={styles.breakdownItem}>
              <IconSymbol 
                ios_icon_name="clock.fill" 
                android_material_icon_name="schedule" 
                size={16} 
                color={colors.success} 
              />
              <Text style={styles.breakdownLabel}>{t('vesting')}</Text>
              <Text style={styles.breakdownValue}>{formatVestingValue(currentYield, 2)}</Text>
            </View>

            <View style={styles.breakdownItem}>
              <IconSymbol 
                ios_icon_name="ticket.fill" 
                android_material_icon_name="confirmation_number" 
                size={16} 
                color={colors.accent} 
              />
              <Text style={styles.breakdownLabel}>{t('bonus')}</Text>
              <Text style={styles.breakdownValue}>{formatNumber(mxiTournaments)}</Text>
            </View>
          </View>
        </View>

        {/* Vesting Info Card - Interconnected with Home Page and Vesting Page */}
        <View style={[commonStyles.card, styles.vestingInfoCard]}>
          <View style={styles.vestingInfoHeader}>
            <IconSymbol 
              ios_icon_name="chart.line.uptrend.xyaxis" 
              android_material_icon_name="trending_up" 
              size={24} 
              color={colors.success} 
            />
            <Text style={styles.vestingInfoTitle}>Vesting en Tiempo Real</Text>
          </View>
          
          {/* Real-time vesting display */}
          <View style={styles.realTimeVestingCard}>
            <Text style={styles.realTimeVestingLabel}>Rendimiento Acumulado</Text>
            <Text style={styles.realTimeVestingValue}>
              {formatVestingValue(currentYield, 8)} MXI
            </Text>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Actualizando cada segundo</Text>
            </View>
          </View>

          <View style={styles.vestingInfoContent}>
            <View style={styles.vestingInfoRow}>
              <Text style={styles.vestingInfoLabel}>MXI Comprados (Genera Vesting)</Text>
              <Text style={styles.vestingInfoValue}>{formatNumber(mxiPurchased)} MXI</Text>
            </View>
            <View style={styles.vestingInfoRow}>
              <Text style={styles.vestingInfoLabel}>Máximo Mensual (3%)</Text>
              <Text style={styles.vestingInfoValue}>
                {formatVestingValue(maxMonthlyYield, 4)} MXI
              </Text>
            </View>
            <View style={styles.vestingInfoRow}>
              <Text style={styles.vestingInfoLabel}>Progreso</Text>
              <Text style={styles.vestingInfoValue}>
                {progressPercentage.toFixed(2)}%
              </Text>
            </View>
          </View>
          <Text style={styles.vestingInfoNote}>
            ℹ️ El vesting genera un 3% mensual SOLO sobre MXI comprados. Los datos están sincronizados con la página de vesting y el display en Home.
          </Text>
        </View>

        {/* Reward Programs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('rewardPrograms')}</Text>
          
          {/* Bonus de Participación */}
          <TouchableOpacity
            style={styles.rewardCard}
            onPress={() => router.push('/(tabs)/(home)/lottery')}
          >
            <View style={[styles.rewardIcon, { backgroundColor: colors.primary + '20' }]}>
              <IconSymbol 
                ios_icon_name="ticket.fill" 
                android_material_icon_name="confirmation_number" 
                size={32} 
                color={colors.primary} 
              />
            </View>
            <View style={styles.rewardInfo}>
              <Text style={styles.rewardTitle}>{t('participationBonus')}</Text>
              <Text style={styles.rewardDescription}>{t('participateInWeeklyDrawings')}</Text>
              <View style={styles.rewardBadge}>
                <Text style={styles.rewardBadgeText}>🔥 {t('active')}</Text>
              </View>
            </View>
            <IconSymbol 
              ios_icon_name="chevron.right" 
              android_material_icon_name="chevron_right" 
              size={24} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>

          {/* Vesting - Interconnected with Home Page */}
          <TouchableOpacity
            style={styles.rewardCard}
            onPress={() => router.push('/(tabs)/(home)/vesting')}
          >
            <View style={[styles.rewardIcon, { backgroundColor: colors.success + '20' }]}>
              <IconSymbol 
                ios_icon_name="chart.line.uptrend.xyaxis" 
                android_material_icon_name="trending_up" 
                size={32} 
                color={colors.success} 
              />
            </View>
            <View style={styles.rewardInfo}>
              <Text style={styles.rewardTitle}>{t('vestingAndYield')}</Text>
              <Text style={styles.rewardDescription}>{t('generatePassiveIncome')}</Text>
              <View style={styles.rewardBadge}>
                <Text style={styles.rewardBadgeText}>⚡ {t('live')}</Text>
              </View>
            </View>
            <IconSymbol 
              ios_icon_name="chevron.right" 
              android_material_icon_name="chevron_right" 
              size={24} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>

          {/* Referrals */}
          <TouchableOpacity
            style={styles.rewardCard}
            onPress={() => router.push('/(tabs)/referrals')}
          >
            <View style={[styles.rewardIcon, { backgroundColor: colors.warning + '20' }]}>
              <IconSymbol 
                ios_icon_name="person.2.fill" 
                android_material_icon_name="group" 
                size={32} 
                color={colors.warning} 
              />
            </View>
            <View style={styles.rewardInfo}>
              <Text style={styles.rewardTitle}>{t('referralSystem')}</Text>
              <Text style={styles.rewardDescription}>{t('earnCommissionsFrom3Levels')}</Text>
              <View style={styles.referralStats}>
                <Text style={styles.referralStatsText}>
                  {user?.active_referrals || 0} {t('actives')}
                </Text>
              </View>
            </View>
            <IconSymbol 
              ios_icon_name="chevron.right" 
              android_material_icon_name="chevron_right" 
              size={24} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>

        {/* Coming Soon */}
        <View style={[commonStyles.card, styles.comingSoonCard]}>
          <IconSymbol 
            ios_icon_name="gift.fill" 
            android_material_icon_name="card_giftcard" 
            size={48} 
            color={colors.accent} 
          />
          <Text style={styles.comingSoonTitle}>{t('moreRewardsComingSoon')}</Text>
          <Text style={styles.comingSoonText}>
            {t('workingOnNewRewards')}
          </Text>
          <View style={styles.comingSoonList}>
            <Text style={styles.comingSoonItem}>- {t('tournamentsAndCompetitions')}</Text>
            <Text style={styles.comingSoonItem}>- {t('achievementBonuses')}</Text>
            <Text style={styles.comingSoonItem}>- {t('loyaltyRewards')}</Text>
            <Text style={styles.comingSoonItem}>- {t('specialEvents')}</Text>
          </View>
        </View>

        {/* Benefits Info */}
        <View style={[commonStyles.card, styles.infoCard]}>
          <View style={styles.infoHeader}>
            <IconSymbol 
              ios_icon_name="star.fill" 
              android_material_icon_name="star" 
              size={24} 
              color={colors.primary} 
            />
            <Text style={styles.infoTitle}>{t('benefitsOfRewards')}</Text>
          </View>
          <View style={styles.infoList}>
            <View style={styles.infoListItem}>
              <Text style={styles.infoBullet}>-</Text>
              <Text style={styles.infoItem}>{t('earnAdditionalMXI')}</Text>
            </View>
            <View style={styles.infoListItem}>
              <Text style={styles.infoBullet}>-</Text>
              <Text style={styles.infoItem}>{t('participateInExclusiveDrawings')}</Text>
            </View>
            <View style={styles.infoListItem}>
              <Text style={styles.infoBullet}>-</Text>
              <Text style={styles.infoItem}>{t('generateAutomaticPassiveIncome')}</Text>
            </View>
            <View style={styles.infoListItem}>
              <Text style={styles.infoBullet}>-</Text>
              <Text style={styles.infoItem}>{t('bonusesForActiveReferrals')}</Text>
            </View>
            <View style={styles.infoListItem}>
              <Text style={styles.infoBullet}>-</Text>
              <Text style={styles.infoItem}>{t('rewardsForContinuedParticipation')}</Text>
            </View>
          </View>
        </View>

        {/* How to Maximize Rewards */}
        <View style={[commonStyles.card, styles.tipsCard]}>
          <View style={styles.tipsHeader}>
            <IconSymbol 
              ios_icon_name="lightbulb.fill" 
              android_material_icon_name="lightbulb" 
              size={24} 
              color={colors.warning} 
            />
            <Text style={styles.tipsTitle}>{t('maximizeYourRewards')}</Text>
          </View>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <View style={styles.tipNumber}>
                <Text style={styles.tipNumberText}>1</Text>
              </View>
              <Text style={styles.tipText}>Mantén al menos 7 referidos activos para desbloquear retiros de vesting</Text>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.tipNumber}>
                <Text style={styles.tipNumberText}>2</Text>
              </View>
              <Text style={styles.tipText}>{t('participateRegularlyInBonus')}</Text>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.tipNumber}>
                <Text style={styles.tipNumberText}>3</Text>
              </View>
              <Text style={styles.tipText}>Compra MXI para activar el vesting del 3% mensual</Text>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.tipNumber}>
                <Text style={styles.tipNumberText}>4</Text>
              </View>
              <Text style={styles.tipText}>{t('shareYourReferralCode')}</Text>
            </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  summaryCard: {
    backgroundColor: colors.primary + '10',
    borderWidth: 2,
    borderColor: colors.primary + '30',
    marginBottom: 24,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryTextContainer: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
  },
  summaryBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  breakdownItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  breakdownLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  vestingInfoCard: {
    backgroundColor: colors.success + '10',
    borderWidth: 2,
    borderColor: colors.success + '30',
    marginBottom: 24,
  },
  vestingInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  vestingInfoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  realTimeVestingCard: {
    backgroundColor: `${colors.accent}20`,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  realTimeVestingLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  realTimeVestingValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.accent,
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: `${colors.success}20`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.success,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  liveText: {
    fontSize: 11,
    color: colors.success,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  vestingInfoContent: {
    gap: 12,
    marginBottom: 16,
  },
  vestingInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  vestingInfoLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  vestingInfoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'monospace',
  },
  vestingInfoNote: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rewardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  rewardBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rewardBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.success,
  },
  referralStats: {
    backgroundColor: colors.warning + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  referralStatsText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.warning,
  },
  comingSoonCard: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: colors.accent + '10',
    borderWidth: 1,
    borderColor: colors.accent + '30',
    marginBottom: 24,
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  comingSoonList: {
    alignSelf: 'stretch',
    paddingHorizontal: 40,
    gap: 8,
  },
  comingSoonItem: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: colors.primary + '10',
    borderWidth: 1,
    borderColor: colors.primary + '30',
    marginBottom: 24,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  infoList: {
    gap: 12,
  },
  infoListItem: {
    flexDirection: 'row',
    gap: 8,
  },
  infoBullet: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
  },
  infoItem: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  tipsCard: {
    backgroundColor: colors.warning + '10',
    borderWidth: 1,
    borderColor: colors.warning + '30',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  tipsList: {
    gap: 16,
  },
  tipItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  tipNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.warning,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});
