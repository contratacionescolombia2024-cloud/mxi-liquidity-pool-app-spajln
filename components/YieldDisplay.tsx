
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'expo-router';
import { useVestingData } from '@/hooks/useVestingData';
import { formatVestingValue } from '@/utils/safeNumericParse';

export function YieldDisplay() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const { vestingData, loading } = useVestingData();

  // Don't show if no user or loading
  if (!user || loading || !vestingData) {
    return null;
  }

  const {
    currentYield,
    sessionYield,
    mxiPurchased,
    yieldPerSecond,
    yieldPerMinute,
    yieldPerHour,
    yieldPerDay,
    hasBalance,
  } = vestingData;

  // Don't show if no balance
  if (!hasBalance) {
    return null;
  }

  // Ensure all values are non-negative
  const safeCurrentYield = Math.max(0, currentYield);
  const safeSessionYield = Math.max(0, sessionYield);
  const safeYieldPerSecond = Math.max(0, yieldPerSecond);
  const safeYieldPerMinute = Math.max(0, yieldPerMinute);
  const safeYieldPerHour = Math.max(0, yieldPerHour);
  const safeYieldPerDay = Math.max(0, yieldPerDay);

  // Check if button should be enabled - SAME AS WITHDRAWAL CONDITIONS
  const canClaim = user.canWithdraw && user.kycStatus === 'approved';

  const handleViewDetails = () => {
    router.push('/(tabs)/(home)/vesting');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconEmoji}>⛏️</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>{t('vestingMXI')}</Text>
          <Text style={styles.subtitle}>
            {t('generatingPerSecond', { rate: formatVestingValue(safeYieldPerSecond, 8) })}
          </Text>
        </View>
      </View>

      <View style={styles.sourceInfo}>
        <View style={styles.sourceRow}>
          <Text style={styles.sourceLabel}>{t('mxiPurchasedVestingBase')}</Text>
          <Text style={styles.sourceValue}>{formatVestingValue(mxiPurchased, 2)} MXI</Text>
        </View>
        <Text style={styles.sourceNote}>
          {t('onlyPurchasedMXIGeneratesVesting')}
        </Text>
      </View>

      <View style={styles.yieldSection}>
        <View style={styles.yieldRow}>
          <Text style={styles.yieldLabel}>{t('currentSession')}</Text>
          <Text style={styles.yieldValue}>{formatVestingValue(safeSessionYield, 8)} MXI</Text>
        </View>
        <View style={styles.yieldRow}>
          <Text style={styles.yieldLabel}>{t('totalAccumulated')}</Text>
          <Text style={styles.yieldValueTotal}>{formatVestingValue(safeCurrentYield, 8)} MXI</Text>
        </View>
      </View>

      <View style={styles.rateSection}>
        <View style={styles.rateItem}>
          <Text style={styles.rateLabel}>{t('perSecond')}</Text>
          <Text style={styles.rateValue}>{formatVestingValue(safeYieldPerSecond, 8)}</Text>
        </View>
        <View style={styles.rateDivider} />
        <View style={styles.rateItem}>
          <Text style={styles.rateLabel}>{t('perMinute')}</Text>
          <Text style={styles.rateValue}>{formatVestingValue(safeYieldPerMinute, 5)}</Text>
        </View>
        <View style={styles.rateDivider} />
        <View style={styles.rateItem}>
          <Text style={styles.rateLabel}>{t('perHour')}</Text>
          <Text style={styles.rateValue}>{formatVestingValue(safeYieldPerHour, 6)}</Text>
        </View>
      </View>

      <View style={styles.dailyRate}>
        <Text style={styles.dailyRateLabel}>{t('dailyYield')}</Text>
        <Text style={styles.dailyRateValue}>
          {formatVestingValue(safeYieldPerDay, 4)} MXI
        </Text>
      </View>

      <TouchableOpacity
        style={styles.viewDetailsButton}
        onPress={handleViewDetails}
      >
        <IconSymbol 
          ios_icon_name="chart.line.uptrend.xyaxis" 
          android_material_icon_name="trending_up"
          size={20} 
          color="#fff" 
        />
        <Text style={styles.viewDetailsButtonText}>
          {t('vestingAndYield')}
        </Text>
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Text style={styles.infoIcon}>ℹ️</Text>
        <Text style={styles.infoText}>
          {t('yieldInfo')}
        </Text>
      </View>

      {!canClaim && (
        <View style={styles.requirementsBox}>
          <Text style={styles.requirementsTitle}>📋 {t('requirementsToWithdraw')}</Text>
          <View style={styles.requirementItem}>
            <IconSymbol 
              ios_icon_name={user.activeReferrals >= 7 ? "checkmark.circle.fill" : "xmark.circle.fill"}
              android_material_icon_name={user.activeReferrals >= 7 ? "check_circle" : "cancel"}
              size={20} 
              color={user.activeReferrals >= 7 ? colors.success : colors.error} 
            />
            <Text style={styles.requirementText}>
              {t('activeReferralsVesting7', { count: user.activeReferrals || 0 })}
            </Text>
          </View>
          <View style={styles.requirementItem}>
            <IconSymbol 
              ios_icon_name={user.kycStatus === 'approved' ? "checkmark.circle.fill" : "xmark.circle.fill"}
              android_material_icon_name={user.kycStatus === 'approved' ? "check_circle" : "cancel"}
              size={20} 
              color={user.kycStatus === 'approved' ? colors.success : colors.error} 
            />
            <Text style={styles.requirementText}>
              {t('kycApproved')}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${colors.success}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  iconEmoji: {
    fontSize: 32,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '600',
  },
  sourceInfo: {
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  sourceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sourceLabel: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
  },
  sourceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    fontFamily: 'monospace',
  },
  sourceNote: {
    fontSize: 11,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  yieldSection: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  yieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  yieldLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  yieldValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.success,
    fontFamily: 'monospace',
  },
  yieldValueTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    fontFamily: 'monospace',
  },
  rateSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  rateItem: {
    flex: 1,
    alignItems: 'center',
  },
  rateDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 8,
  },
  rateLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4,
    fontWeight: '600',
  },
  rateValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'monospace',
  },
  dailyRate: {
    backgroundColor: `${colors.primary}15`,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  dailyRateLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  dailyRateValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    fontFamily: 'monospace',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  viewDetailsButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.highlight,
    padding: 12,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 12,
  },
  infoIcon: {
    fontSize: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  requirementsBox: {
    backgroundColor: 'rgba(255, 193, 7, 0.08)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  requirementText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
  },
});
