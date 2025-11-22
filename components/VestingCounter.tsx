
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';

const MONTHLY_YIELD_PERCENTAGE = 0.03; // 3% monthly
const SECONDS_IN_MONTH = 2592000; // 30 days * 24 hours * 60 minutes * 60 seconds

export default function VestingCounter() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentYield, setCurrentYield] = useState(0);

  useEffect(() => {
    if (!user) {
      return;
    }

    // Calculate yield based on MXI in vesting
    const mxiInVesting = (user.mxiPurchasedDirectly || 0) + (user.mxiFromUnifiedCommissions || 0);
    
    if (mxiInVesting === 0) {
      setCurrentYield(0);
      return;
    }

    // Calculate yield per second based on 3% monthly
    const maxMonthlyYield = mxiInVesting * MONTHLY_YIELD_PERCENTAGE;
    const yieldPerSecond = maxMonthlyYield / SECONDS_IN_MONTH;

    // Calculate time elapsed since last update
    const lastUpdate = new Date(user.lastYieldUpdate);
    const now = new Date();
    const secondsElapsed = (now.getTime() - lastUpdate.getTime()) / 1000;

    // Calculate current session yield
    const sessionYield = yieldPerSecond * secondsElapsed;

    // Cap at 3% monthly maximum
    const totalYield = user.accumulatedYield + sessionYield;
    const cappedTotalYield = Math.min(totalYield, maxMonthlyYield);
    const cappedSessionYield = Math.max(0, cappedTotalYield - user.accumulatedYield);

    setCurrentYield(cappedSessionYield);

    // Update yield display every second for real-time counter
    const interval = setInterval(() => {
      const now = new Date();
      const secondsElapsed = (now.getTime() - lastUpdate.getTime()) / 1000;
      const sessionYield = yieldPerSecond * secondsElapsed;
      const totalYield = user.accumulatedYield + sessionYield;
      const cappedTotalYield = Math.min(totalYield, maxMonthlyYield);
      const cappedSessionYield = Math.max(0, cappedTotalYield - user.accumulatedYield);
      
      setCurrentYield(cappedSessionYield);
    }, 1000);

    return () => clearInterval(interval);
  }, [user]);

  const handleViewDetails = () => {
    router.push('/(tabs)/(home)/vesting');
  };

  if (!user) {
    return null;
  }

  // Calculate vesting amounts
  const mxiInVesting = (user.mxiPurchasedDirectly || 0) + (user.mxiFromUnifiedCommissions || 0);
  const maxMonthlyYield = mxiInVesting * MONTHLY_YIELD_PERCENTAGE;
  const yieldPerSecond = mxiInVesting > 0 ? maxMonthlyYield / SECONDS_IN_MONTH : 0;
  const yieldPerMinute = yieldPerSecond * 60;
  const yieldPerHour = yieldPerMinute * 60;
  const yieldPerDay = yieldPerHour * 24;
  const totalYield = user.accumulatedYield + currentYield;
  const hasBalance = mxiInVesting > 0;

  // Calculate progress towards monthly cap
  const progressPercentage = maxMonthlyYield > 0 ? (totalYield / maxMonthlyYield) * 100 : 0;
  const isNearCap = progressPercentage >= 95;

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
              {hasBalance ? `${yieldPerSecond.toFixed(8)} MXI/seg` : 'Sin balance en vesting'}
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

      {/* MXI in Vesting Display */}
      <View style={styles.vestingBalanceSection}>
        <View style={styles.vestingBalanceCard}>
          <Text style={styles.vestingBalanceLabel}>Balance en Vesting</Text>
          <Text style={styles.vestingBalanceValue}>
            {mxiInVesting.toFixed(2)}
          </Text>
          <Text style={styles.vestingBalanceUnit}>MXI</Text>
        </View>
      </View>

      {/* Real-time Counter Display */}
      <View style={styles.counterSection}>
        <View style={styles.counterCard}>
          <Text style={styles.counterLabel}>Rendimiento Acumulado</Text>
          <Text style={styles.counterValue}>
            {totalYield.toFixed(8)}
          </Text>
          <Text style={styles.counterUnit}>MXI</Text>
          <Text style={styles.counterSubtext}>
            Actualizado en tiempo real
          </Text>
        </View>
      </View>

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
            <Text style={styles.progressText}>{totalYield.toFixed(4)} MXI</Text>
            <Text style={styles.progressText}>{maxMonthlyYield.toFixed(4)} MXI</Text>
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
            <Text style={styles.breakdownValue}>{currentYield.toFixed(8)} MXI</Text>
          </View>
          <View style={styles.breakdownDivider} />
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Acumulado Previo</Text>
            <Text style={styles.breakdownValue}>{user.accumulatedYield.toFixed(8)} MXI</Text>
          </View>
        </View>
      )}

      {/* Rate Information */}
      {hasBalance && (
        <View style={styles.rateSection}>
          <View style={styles.rateItem}>
            <Text style={styles.rateLabel}>Por Segundo</Text>
            <Text style={styles.rateValue}>{yieldPerSecond.toFixed(8)}</Text>
          </View>
          <View style={styles.rateDivider} />
          <View style={styles.rateItem}>
            <Text style={styles.rateLabel}>Por Minuto</Text>
            <Text style={styles.rateValue}>{yieldPerMinute.toFixed(8)}</Text>
          </View>
          <View style={styles.rateDivider} />
          <View style={styles.rateItem}>
            <Text style={styles.rateLabel}>Por Hora</Text>
            <Text style={styles.rateValue}>{yieldPerHour.toFixed(6)}</Text>
          </View>
        </View>
      )}

      {/* Daily Rate */}
      {hasBalance && (
        <View style={styles.dailyRate}>
          <Text style={styles.dailyRateLabel}>Rendimiento Diario</Text>
          <Text style={styles.dailyRateValue}>
            {yieldPerDay.toFixed(4)} MXI
          </Text>
        </View>
      )}

      {/* Info Box - Updated message */}
      <View style={styles.infoBox}>
        <Text style={styles.infoIcon}>ℹ️</Text>
        <Text style={styles.infoText}>
          {!hasBalance
            ? 'Compra MXI para comenzar a generar rendimientos del 3% mensual.'
            : 'El saldo de vesting genera un rendimiento del 3% mensual. Este saldo no se puede retirar hasta que se lance la moneda oficialmente. Una vez lanzada, podrás retirar tu saldo de vesting cumpliendo los requisitos de retiro.'}
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
  },
  counterSection: {
    marginBottom: 16,
  },
  counterCard: {
    backgroundColor: `${colors.accent}20`,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.accent,
  },
  counterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  counterValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.accent,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  counterUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  counterSubtext: {
    fontSize: 11,
    color: colors.textSecondary,
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
  rateSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rateItem: {
    flex: 1,
    alignItems: 'center',
  },
  rateDivider: {
    width: 1,
    backgroundColor: colors.border,
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
    backgroundColor: `${colors.primary}20`,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
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
