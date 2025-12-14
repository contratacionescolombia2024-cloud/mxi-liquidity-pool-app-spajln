
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter } from 'expo-router';
import { useVestingData } from '@/hooks/useVestingData';
import { formatVestingValue } from '@/utils/safeNumericParse';

export function VestingCounter() {
  const router = useRouter();
  const { vestingData, loading } = useVestingData();

  const handleViewDetails = () => {
    router.push('/(tabs)/(home)/vesting');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Cargando datos de vesting...</Text>
      </View>
    );
  }

  if (!vestingData) {
    return null;
  }

  const {
    currentYield,
    sessionYield,
    accumulatedYield,
    mxiPurchased,
    mxiCommissions,
    mxiTournaments,
    yieldPerSecond,
    yieldPerHour,
    yieldPer7Days,
    yieldPerMonth,
    yieldUntilLaunch,
    yieldPerHourUsdt,
    yieldPer7DaysUsdt,
    yieldPerMonthUsdt,
    yieldUntilLaunchUsdt,
    currentPhase,
    currentPriceUsdt,
    daysUntilLaunch,
    maxMonthlyYield,
    progressPercentage,
    isNearCap,
    hasBalance,
  } = vestingData;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconEmoji}>⛏️</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>Vesting Activo</Text>
            <Text style={styles.subtitle}>
              {hasBalance ? `${formatVestingValue(yieldPerSecond, 8)} MXI/seg` : 'Sin balance en vesting'}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleViewDetails} style={styles.detailsButton}>
          <IconSymbol 
            ios_icon_name="info.circle.fill" 
            android_material_icon_name="info" 
            size={24} 
            color={colors.accent} 
          />
        </TouchableOpacity>
      </View>

      {/* Real-time Counter Display - PROMINENT - Always positive */}
      <View style={styles.counterSection}>
        <View style={styles.counterCard}>
          <Text style={styles.counterLabel}>Rendimiento Acumulado Total</Text>
          <Text style={styles.counterValue}>
            {formatVestingValue(currentYield, 8)}
          </Text>
          <Text style={styles.counterUnit}>MXI</Text>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Actualizando cada segundo</Text>
          </View>
        </View>
      </View>

      {/* MXI in Vesting Display */}
      <View style={styles.vestingBalanceSection}>
        <View style={styles.vestingBalanceCard}>
          <Text style={styles.vestingBalanceLabel}>Balance en Vesting</Text>
          <Text style={styles.vestingBalanceValue}>
            {formatVestingValue(mxiPurchased, 2)}
          </Text>
          <Text style={styles.vestingBalanceUnit}>MXI</Text>
          <Text style={styles.vestingBalanceNote}>
            ✅ Solo MXI comprados generan vesting
          </Text>
        </View>
      </View>

      {/* Separate Balances Display - NOT generating vesting */}
      {(mxiCommissions > 0 || mxiTournaments > 0) && (
        <View style={styles.separateBalancesSection}>
          <Text style={styles.separateBalancesTitle}>Saldos Separados (No generan vesting)</Text>
          
          {mxiCommissions > 0 && (
            <View style={styles.separateBalanceCard}>
              <View style={styles.separateBalanceHeader}>
                <IconSymbol 
                  ios_icon_name="person.2.fill" 
                  android_material_icon_name="people" 
                  size={20} 
                  color={colors.success} 
                />
                <Text style={styles.separateBalanceLabel}>Comisiones</Text>
              </View>
              <Text style={styles.separateBalanceValue}>
                {formatVestingValue(mxiCommissions, 2)} MXI
              </Text>
              <Text style={styles.separateBalanceNote}>
                ❌ No genera rendimiento de vesting
              </Text>
            </View>
          )}

          {mxiTournaments > 0 && (
            <View style={styles.separateBalanceCard}>
              <View style={styles.separateBalanceHeader}>
                <IconSymbol 
                  ios_icon_name="trophy.fill" 
                  android_material_icon_name="emoji_events" 
                  size={20} 
                  color={colors.warning} 
                />
                <Text style={styles.separateBalanceLabel}>Torneos</Text>
              </View>
              <Text style={styles.separateBalanceValue}>
                {formatVestingValue(mxiTournaments, 2)} MXI
              </Text>
              <Text style={styles.separateBalanceNote}>
                ❌ No genera rendimiento de vesting
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Progress Bar for Monthly Cap */}
      {hasBalance && (
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progreso Mensual (3% máx.)</Text>
            <Text style={styles.progressPercentage}>{progressPercentage.toFixed(2)}%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${Math.min(progressPercentage, 100)}%` }]} />
          </View>
          <View style={styles.progressFooter}>
            <Text style={styles.progressText}>{formatVestingValue(currentYield, 4)} MXI</Text>
            <Text style={styles.progressText}>{formatVestingValue(maxMonthlyYield, 4)} MXI</Text>
          </View>
          {isNearCap && (
            <View style={styles.capWarning}>
              <IconSymbol 
                ios_icon_name="exclamationmark.triangle.fill" 
                android_material_icon_name="warning" 
                size={16} 
                color={colors.warning} 
              />
              <Text style={styles.capWarningText}>
                Cerca del límite mensual del 3%
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Yield Breakdown */}
      {hasBalance && (
        <View style={styles.yieldBreakdownSection}>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Sesión Actual</Text>
            <Text style={styles.breakdownValue}>{formatVestingValue(sessionYield, 8)} MXI</Text>
          </View>
          <View style={styles.breakdownDivider} />
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Acumulado Previo</Text>
            <Text style={styles.breakdownValue}>{formatVestingValue(accumulatedYield, 8)} MXI</Text>
          </View>
        </View>
      )}

      {/* NEW: Rendimiento en MXI y USDT */}
      {hasBalance && (
        <View style={styles.performanceSection}>
          <Text style={styles.performanceSectionTitle}>📊 Rendimiento Proyectado</Text>
          <Text style={styles.phaseInfo}>
            Fase {currentPhase} • 1 MXI = ${currentPriceUsdt.toFixed(2)} USDT
          </Text>

          {/* Por Hora */}
          <View style={styles.performanceCard}>
            <View style={styles.performanceHeader}>
              <IconSymbol 
                ios_icon_name="clock.fill" 
                android_material_icon_name="schedule" 
                size={20} 
                color={colors.primary} 
              />
              <Text style={styles.performanceLabel}>Por Hora</Text>
            </View>
            <View style={styles.performanceValues}>
              <View style={styles.performanceValueRow}>
                <Text style={styles.performanceValue}>{formatVestingValue(yieldPerHour, 6)} MXI</Text>
                <Text style={styles.performanceValueUsdt}>≈ ${yieldPerHourUsdt.toFixed(4)} USDT</Text>
              </View>
            </View>
          </View>

          {/* Por 7 Días */}
          <View style={styles.performanceCard}>
            <View style={styles.performanceHeader}>
              <IconSymbol 
                ios_icon_name="calendar.badge.clock" 
                android_material_icon_name="event" 
                size={20} 
                color={colors.success} 
              />
              <Text style={styles.performanceLabel}>Por 7 Días</Text>
            </View>
            <View style={styles.performanceValues}>
              <View style={styles.performanceValueRow}>
                <Text style={styles.performanceValue}>{formatVestingValue(yieldPer7Days, 4)} MXI</Text>
                <Text style={styles.performanceValueUsdt}>≈ ${yieldPer7DaysUsdt.toFixed(2)} USDT</Text>
              </View>
            </View>
          </View>

          {/* Por 1 Mes */}
          <View style={styles.performanceCard}>
            <View style={styles.performanceHeader}>
              <IconSymbol 
                ios_icon_name="calendar" 
                android_material_icon_name="calendar_month" 
                size={20} 
                color={colors.accent} 
              />
              <Text style={styles.performanceLabel}>Por 1 Mes (30 días)</Text>
            </View>
            <View style={styles.performanceValues}>
              <View style={styles.performanceValueRow}>
                <Text style={styles.performanceValue}>{formatVestingValue(yieldPerMonth, 4)} MXI</Text>
                <Text style={styles.performanceValueUsdt}>≈ ${yieldPerMonthUsdt.toFixed(2)} USDT</Text>
              </View>
            </View>
          </View>

          {/* Hasta Lanzamiento */}
          <View style={[styles.performanceCard, styles.performanceCardHighlight]}>
            <View style={styles.performanceHeader}>
              <IconSymbol 
                ios_icon_name="rocket.fill" 
                android_material_icon_name="rocket_launch" 
                size={20} 
                color={colors.warning} 
              />
              <Text style={styles.performanceLabel}>Hasta Lanzamiento</Text>
            </View>
            <Text style={styles.daysUntilLaunch}>{daysUntilLaunch} días restantes</Text>
            <View style={styles.performanceValues}>
              <View style={styles.performanceValueRow}>
                <Text style={styles.performanceValue}>{formatVestingValue(yieldUntilLaunch, 2)} MXI</Text>
                <Text style={styles.performanceValueUsdt}>≈ ${yieldUntilLaunchUsdt.toFixed(2)} USDT</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Monthly Maximum Display */}
      {hasBalance && (
        <View style={styles.monthlyMaxSection}>
          <View style={styles.monthlyMaxCard}>
            <Text style={styles.monthlyMaxLabel}>Máximo Mensual (3%)</Text>
            <Text style={styles.monthlyMaxValue}>
              {formatVestingValue(maxMonthlyYield, 4)} MXI
            </Text>
            <Text style={styles.monthlyMaxNote}>
              Basado en {formatVestingValue(mxiPurchased, 2)} MXI comprados
            </Text>
          </View>
        </View>
      )}

      {/* Info Box - Updated message */}
      <View style={styles.infoBox}>
        <Text style={styles.infoIcon}>ℹ️</Text>
        <Text style={styles.infoText}>
          {!hasBalance
            ? 'Compra MXI para comenzar a generar rendimientos del 3% mensual.'
            : 'El vesting genera un rendimiento del 3% mensual SOLO sobre tus MXI comprados. Los valores en USDT son aproximados y se basan en el precio actual de la Fase ' + currentPhase + '. El contador se actualiza cada segundo. Este saldo no se puede retirar hasta que se lance la moneda oficialmente.'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${colors.accent}30`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  iconEmoji: {
    fontSize: 32,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '600',
  },
  detailsButton: {
    padding: 8,
  },
  counterSection: {
    marginBottom: 16,
  },
  counterCard: {
    backgroundColor: `${colors.accent}20`,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  counterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  counterValue: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.accent,
    fontFamily: 'monospace',
    marginBottom: 6,
    textShadowColor: `${colors.accent}40`,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  counterUnit: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
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
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  liveText: {
    fontSize: 11,
    color: colors.success,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  vestingBalanceSection: {
    marginBottom: 16,
  },
  vestingBalanceCard: {
    backgroundColor: `${colors.primary}20`,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  vestingBalanceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  vestingBalanceValue: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primary,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  vestingBalanceUnit: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  vestingBalanceNote: {
    fontSize: 11,
    color: colors.success,
    fontWeight: '600',
    textAlign: 'center',
  },
  separateBalancesSection: {
    marginBottom: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  separateBalancesTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  separateBalanceCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  separateBalanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  separateBalanceLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  separateBalanceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  separateBalanceNote: {
    fontSize: 10,
    color: colors.error,
    fontStyle: 'italic',
  },
  progressSection: {
    marginBottom: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  progressPercentage: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accent,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  capWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    padding: 8,
    backgroundColor: `${colors.warning}20`,
    borderRadius: 8,
  },
  capWarningText: {
    fontSize: 11,
    color: colors.warning,
    fontWeight: '600',
  },
  yieldBreakdownSection: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  breakdownLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
    flex: 1,
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'monospace',
  },
  performanceSection: {
    backgroundColor: `${colors.primary}10`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: `${colors.primary}30`,
  },
  performanceSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  phaseInfo: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  performanceCard: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  performanceCardHighlight: {
    backgroundColor: `${colors.warning}15`,
    borderColor: colors.warning,
    borderWidth: 2,
  },
  performanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  performanceLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  daysUntilLaunch: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  performanceValues: {
    gap: 4,
  },
  performanceValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'monospace',
  },
  performanceValueUsdt: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
    fontFamily: 'monospace',
  },
  monthlyMaxSection: {
    marginBottom: 16,
  },
  monthlyMaxCard: {
    backgroundColor: `${colors.success}20`,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.success,
  },
  monthlyMaxLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  monthlyMaxValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.success,
    fontFamily: 'monospace',
    marginBottom: 6,
  },
  monthlyMaxNote: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.highlight,
    padding: 12,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
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
});
