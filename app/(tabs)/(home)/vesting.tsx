
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useVestingData } from '@/hooks/useVestingData';
import { formatVestingValue } from '@/utils/safeNumericParse';

export default function VestingScreen() {
  const router = useRouter();
  const { user, getPoolStatus } = useAuth();
  const { t } = useLanguage();
  const { vestingData, loading } = useVestingData();
  const [poolStatus, setPoolStatus] = useState<any>(null);

  useEffect(() => {
    loadPoolStatus();
  }, []);

  const loadPoolStatus = async () => {
    try {
      const status = await getPoolStatus();
      setPoolStatus(status);
    } catch (error) {
      console.error('Error loading pool status:', error);
      Alert.alert(t('error'), t('couldNotLoadVestingInfo'));
    }
  };

  if (loading || !vestingData) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('loadingVestingDataText')}</Text>
        </View>
      </SafeAreaView>
    );
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

  const isLaunched = poolStatus?.is_mxi_launched || false;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="chevron_left"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vesting y Rendimiento</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Real-time Counter Display - PROMINENT */}
        <View style={styles.counterSection}>
          <View style={styles.counterCard}>
            <Text style={styles.counterLabel}>Rendimiento Acumulado Total</Text>
            <Text style={styles.counterValue}>
              {formatVestingValue(currentYield, 8)}
            </Text>
            <Text style={styles.counterUnit}>MXI</Text>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Generando {formatVestingValue(yieldPerSecond, 8)} MXI por segundo</Text>
            </View>
          </View>
        </View>

        {/* MXI in Vesting Display */}
        <View style={styles.vestingBalanceSection}>
          <View style={styles.vestingBalanceCard}>
            <Text style={styles.vestingBalanceLabel}>MXI Comprado (Base de Vesting)</Text>
            <Text style={styles.vestingBalanceValue}>
              {formatVestingValue(mxiPurchased, 2)}
            </Text>
            <Text style={styles.vestingBalanceUnit}>MXI</Text>
            <Text style={styles.vestingBalanceNote}>
              ✅ Solo el MXI comprado genera vesting
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
              <Text style={styles.breakdownLabel}>Total Acumulado</Text>
              <Text style={styles.breakdownValue}>{formatVestingValue(currentYield, 8)} MXI</Text>
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

        {!isLaunched && (
          <View style={[styles.transparentCard, styles.warningCard]}>
            <View style={styles.warningHeader}>
              <IconSymbol
                ios_icon_name="exclamationmark.triangle.fill"
                android_material_icon_name="warning"
                size={32}
                color={colors.warning}
              />
              <Text style={styles.warningTitle}>{t('balanceBlockedTitle')}</Text>
            </View>
            <Text style={styles.warningText}>
              El saldo de vesting no se puede retirar hasta que se lance la moneda oficialmente.
            </Text>
            {daysUntilLaunch > 0 && (
              <View style={styles.countdownBox}>
                <Text style={styles.countdownLabel}>{t('timeUntilLaunchText')}</Text>
                <Text style={styles.countdownValue}>{daysUntilLaunch} {t('daysRemainingText')}</Text>
              </View>
            )}
          </View>
        )}

        <View style={[styles.transparentCard, styles.infoCard]}>
          <View style={styles.infoHeader}>
            <IconSymbol
              ios_icon_name="info.circle.fill"
              android_material_icon_name="info"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.infoTitle}>{t('vestingInformationText')}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Rendimiento Mensual</Text>
            <Text style={styles.infoValue}>3%</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Base de Cálculo</Text>
            <Text style={styles.infoValue}>Solo MXI Comprado</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Actualización</Text>
            <Text style={styles.infoValue}>Cada Segundo</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fase Actual</Text>
            <Text style={styles.infoValue}>Fase {currentPhase}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Precio MXI</Text>
            <Text style={styles.infoValue}>${currentPriceUsdt.toFixed(2)} USDT</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('withdrawalStatusText')}</Text>
            <Text style={[styles.infoValue, { color: isLaunched ? colors.success : colors.error }]}>
              {isLaunched ? t('enabledText') : t('blockedUntilLaunchShortText')}
            </Text>
          </View>
        </View>

        <View style={[styles.transparentCard, styles.descriptionCard]}>
          <Text style={styles.descriptionTitle}>{t('whatIsVestingText')}</Text>
          <Text style={styles.descriptionText}>
            El vesting es un sistema de rendimiento que genera un 3% mensual sobre tu MXI comprado directamente o asignado por el administrador con comisión.
          </Text>
          <Text style={styles.descriptionText}>
            El rendimiento se calcula automáticamente cada segundo y se acumula en tu cuenta. Puedes ver el progreso en tiempo real.
          </Text>
          <Text style={styles.descriptionText}>
            Los valores en USDT son aproximados y se basan en el precio actual de la Fase {currentPhase} (${currentPriceUsdt.toFixed(2)} USDT por MXI). El precio puede cambiar según la fase de la preventa.
          </Text>
          <Text style={[styles.descriptionText, styles.importantNote]}>
            ⚠️ Importante: Para retirar el vesting debes tener al menos 7 referidos activos (con compras). Solo el MXI comprado directamente o añadido por el administrador con comisión genera vesting del 3% mensual. Las comisiones y premios de torneos NO generan vesting.
          </Text>
        </View>

        <View style={[styles.transparentCard, styles.requirementsCard]}>
          <Text style={styles.requirementsTitle}>📋 Requisitos para Retirar</Text>
          
          <View style={styles.requirementItem}>
            <IconSymbol
              ios_icon_name={user?.activeReferrals >= 7 ? "checkmark.circle.fill" : "xmark.circle.fill"}
              android_material_icon_name={user?.activeReferrals >= 7 ? "check_circle" : "cancel"}
              size={20}
              color={user?.activeReferrals >= 7 ? colors.success : colors.error}
            />
            <Text style={styles.requirementText}>
              7 Referidos Activos para retiros de vesting ({user?.activeReferrals || 0}/7)
            </Text>
          </View>

          <View style={styles.requirementItem}>
            <IconSymbol
              ios_icon_name={user?.kycStatus === 'approved' ? "checkmark.circle.fill" : "xmark.circle.fill"}
              android_material_icon_name={user?.kycStatus === 'approved' ? "check_circle" : "cancel"}
              size={20}
              color={user?.kycStatus === 'approved' ? colors.success : colors.error}
            />
            <Text style={styles.requirementText}>
              KYC Aprobado
            </Text>
          </View>

          <View style={styles.requirementItem}>
            <IconSymbol
              ios_icon_name={isLaunched ? "checkmark.circle.fill" : "xmark.circle.fill"}
              android_material_icon_name={isLaunched ? "check_circle" : "cancel"}
              size={20}
              color={isLaunched ? colors.success : colors.error}
            />
            <Text style={styles.requirementText}>
              Lanzamiento de MXI
            </Text>
          </View>
        </View>

        {isLaunched && user?.activeReferrals >= 7 && user?.kycStatus === 'approved' && (
          <TouchableOpacity
            style={[styles.transparentCard, styles.actionCard]}
            onPress={() => router.push('/(tabs)/(home)/withdraw-mxi')}
          >
            <View style={styles.actionContent}>
              <IconSymbol
                ios_icon_name="arrow.down.circle.fill"
                android_material_icon_name="arrow_circle_down"
                size={32}
                color={colors.success}
              />
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>{t('withdrawMXIText')}</Text>
                <Text style={styles.actionSubtitle}>
                  {t('withdrawVestingBalanceText')}
                </Text>
              </View>
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="chevron_right"
                size={24}
                color={colors.textSecondary}
              />
            </View>
          </TouchableOpacity>
        )}

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoBoxText}>
            {!hasBalance
              ? 'Compra MXI para comenzar a generar rendimientos del 3% mensual.'
              : 'El vesting se genera automáticamente desde tu MXI comprado. Los valores en USDT son aproximados según el precio de la Fase ' + currentPhase + '. Puedes reclamarlo una vez que cumplas los requisitos de retiro.'}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
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
  transparentCard: {
    backgroundColor: 'rgba(26, 31, 58, 0.3)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  warningCard: {
    backgroundColor: 'rgba(255, 193, 7, 0.08)',
    borderColor: 'rgba(255, 193, 7, 0.3)',
    borderWidth: 1,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.warning,
  },
  warningText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 16,
  },
  countdownBox: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  countdownLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  countdownValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.warning,
  },
  infoCard: {
    gap: 16,
    backgroundColor: 'rgba(26, 31, 58, 0.35)',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  descriptionCard: {
    gap: 12,
    backgroundColor: 'rgba(26, 31, 58, 0.3)',
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  importantNote: {
    color: colors.warning,
    fontWeight: '600',
    marginTop: 8,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  requirementsCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  requirementText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  actionCard: {
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
    borderColor: 'rgba(76, 175, 80, 0.3)',
    borderWidth: 1,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
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
  infoBoxText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
