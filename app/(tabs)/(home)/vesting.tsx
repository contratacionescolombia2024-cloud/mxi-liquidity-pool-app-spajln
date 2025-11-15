
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
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';

interface YieldProjection {
  period: string;
  mxiYield: number;
  usdtValue: number;
}

export default function VestingScreen() {
  const { user, getCurrentYield, claimYield } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentYield, setCurrentYield] = useState(0);
  const [currentPrice] = useState(0.4); // Phase 1 price
  const [projections, setProjections] = useState<YieldProjection[]>([]);

  useEffect(() => {
    // Update every second for real-time display
    const interval = setInterval(() => {
      if (user && getCurrentYield) {
        const yield_value = getCurrentYield();
        setCurrentYield(yield_value);
      }
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [user, getCurrentYield]);

  useEffect(() => {
    if (user) {
      calculateYield();
    }
  }, [user]);

  const handleUnifyBalance = async () => {
    if (!user) return;

    // Check if user has 10 active referrals
    if (user.activeReferrals < 10) {
      Alert.alert(
        'Requisitos No Cumplidos',
        `Para unificar tu saldo de vesting necesitas 10 referidos activos.\n\nActualmente tienes ${user.activeReferrals} referidos activos.\n\nNecesitas ${10 - user.activeReferrals} referidos más.`,
        [{ text: 'Entendido' }]
      );
      return;
    }

    // Check if there's yield to claim
    const totalYield = user.accumulatedYield + currentYield;
    if (totalYield < 0.000001) {
      Alert.alert(
        'Sin Saldo para Unificar',
        'Necesitas acumular más MXI en vesting antes de poder unificar tu saldo.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Confirm unification
    Alert.alert(
      '💎 Unificar Saldo de Vesting',
      `¿Deseas unificar ${totalYield.toFixed(8)} MXI de tu saldo de vesting a tu balance principal?\n\nEsto transferirá todo tu MXI minado a tu balance disponible.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Unificar',
          onPress: async () => {
            setLoading(true);
            const result = await claimYield();
            setLoading(false);

            if (result.success) {
              Alert.alert(
                '✅ Saldo Unificado',
                `Has unificado exitosamente ${result.yieldEarned?.toFixed(8)} MXI a tu balance principal.\n\n¡Tu saldo ha sido actualizado!`,
                [{ text: 'Excelente' }]
              );
              setCurrentYield(0);
            } else {
              Alert.alert('Error', result.error || 'No se pudo unificar el saldo');
            }
          },
        },
      ]
    );
  };

  const calculateYield = () => {
    if (!user) return;

    const yieldRate = user.yieldRatePerMinute;
    const minutesPerDay = 1440;
    const minutesPerWeek = minutesPerDay * 7;
    const minutesPerMonth = minutesPerDay * 30;
    const minutesPerYear = minutesPerDay * 365;

    const dailyYield = yieldRate * minutesPerDay;
    const weeklyYield = yieldRate * minutesPerWeek;
    const monthlyYield = yieldRate * minutesPerMonth;
    const yearlyYield = yieldRate * minutesPerYear;

    setProjections([
      {
        period: 'Diario',
        mxiYield: dailyYield,
        usdtValue: dailyYield * currentPrice,
      },
      {
        period: 'Semanal',
        mxiYield: weeklyYield,
        usdtValue: weeklyYield * currentPrice,
      },
      {
        period: 'Mensual',
        mxiYield: monthlyYield,
        usdtValue: monthlyYield * currentPrice,
      },
      {
        period: 'Anual',
        mxiYield: yearlyYield,
        usdtValue: yearlyYield * currentPrice,
      },
    ]);
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const mxiInVesting = (user.mxiPurchasedDirectly || 0) + (user.mxiFromUnifiedCommissions || 0);
  const yieldPerSecond = user.yieldRatePerMinute / 60;
  const totalYield = user.accumulatedYield + currentYield;
  const canUnify = user.activeReferrals >= 10;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol ios_icon_name="chevron.left" android_material_icon_name="arrow_back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vesting & Rendimiento</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Real-time Yield Card - Updates every second */}
        <View style={[commonStyles.card, styles.yieldCard]}>
          <View style={styles.yieldHeader}>
            <IconSymbol 
              ios_icon_name="chart.line.uptrend.xyaxis" 
              android_material_icon_name="trending_up" 
              size={32} 
              color={colors.primary} 
            />
            <Text style={styles.yieldTitle}>Rendimiento en Tiempo Real</Text>
          </View>
          <Text style={styles.yieldAmount}>{totalYield.toFixed(8)} MXI</Text>
          <Text style={styles.yieldSubtext}>
            ≈ ${(totalYield * currentPrice).toFixed(6)} USDT
          </Text>
          <View style={styles.realtimeBadge}>
            <View style={styles.realtimeDot} />
            <Text style={styles.realtimeText}>Actualizado cada segundo</Text>
          </View>
        </View>

        {/* Vesting Balance */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>💎 Balance en Vesting</Text>
          <View style={styles.vestingBalanceContainer}>
            <Text style={styles.vestingBalanceValue}>{mxiInVesting.toFixed(2)} MXI</Text>
            <Text style={styles.vestingBalanceSubtext}>
              Generando {yieldPerSecond.toFixed(8)} MXI por segundo
            </Text>
          </View>
          
          <View style={styles.vestingBreakdown}>
            <View style={styles.vestingBreakdownRow}>
              <Text style={styles.vestingBreakdownLabel}>🛒 MXI Comprado Directamente</Text>
              <Text style={styles.vestingBreakdownValue}>{(user.mxiPurchasedDirectly || 0).toFixed(2)}</Text>
            </View>
            <View style={styles.vestingDivider} />
            <View style={styles.vestingBreakdownRow}>
              <Text style={styles.vestingBreakdownLabel}>💰 MXI de Comisiones Unificadas</Text>
              <Text style={styles.vestingBreakdownValue}>{(user.mxiFromUnifiedCommissions || 0).toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Yield Rate Card */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>⚡ Tasa de Rendimiento</Text>
          <View style={styles.rateGrid}>
            <View style={styles.rateItem}>
              <Text style={styles.rateLabel}>Por Segundo</Text>
              <Text style={styles.rateValue}>{yieldPerSecond.toFixed(8)}</Text>
            </View>
            <View style={styles.rateItem}>
              <Text style={styles.rateLabel}>Por Minuto</Text>
              <Text style={styles.rateValue}>{user.yieldRatePerMinute.toFixed(8)}</Text>
            </View>
            <View style={styles.rateItem}>
              <Text style={styles.rateLabel}>Por Hora</Text>
              <Text style={styles.rateValue}>{(user.yieldRatePerMinute * 60).toFixed(6)}</Text>
            </View>
            <View style={styles.rateItem}>
              <Text style={styles.rateLabel}>Por Día</Text>
              <Text style={styles.rateValue}>{(user.yieldRatePerMinute * 1440).toFixed(4)}</Text>
            </View>
          </View>
          <Text style={styles.infoText}>
            Tu rendimiento se genera automáticamente basado en tu balance de vesting. La tasa es del 0.005% por hora sobre tu MXI en vesting.
          </Text>
        </View>

        {/* Projections Card */}
        <View style={commonStyles.card}>
          <View style={styles.projectionHeader}>
            <Text style={styles.sectionTitle}>📊 Proyecciones de Rendimiento</Text>
            <TouchableOpacity onPress={calculateYield}>
              <IconSymbol 
                ios_icon_name="arrow.clockwise" 
                android_material_icon_name="refresh" 
                size={20} 
                color={colors.primary} 
              />
            </TouchableOpacity>
          </View>

          {projections.length > 0 && (
            <View style={styles.projectionsList}>
              {projections.map((projection, index) => (
                <View key={index} style={styles.projectionItem}>
                  <Text style={styles.projectionPeriod}>{projection.period}</Text>
                  <View style={styles.projectionValues}>
                    <Text style={styles.projectionMxi}>
                      {projection.mxiYield.toFixed(6)} MXI
                    </Text>
                    <Text style={styles.projectionUsdt}>
                      ≈ ${projection.usdtValue.toFixed(4)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Yield Breakdown */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>📈 Desglose de Rendimiento</Text>
          <View style={styles.balancesList}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>💎 Sesión Actual</Text>
              <Text style={styles.balanceValue}>
                {currentYield.toFixed(8)} MXI
              </Text>
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>📊 Acumulado Previo</Text>
              <Text style={styles.balanceValue}>
                {user.accumulatedYield.toFixed(8)} MXI
              </Text>
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>🔥 Total Acumulado</Text>
              <Text style={[styles.balanceValue, styles.balanceValueTotal]}>
                {totalYield.toFixed(8)} MXI
              </Text>
            </View>
          </View>
        </View>

        {/* Unify Action */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>💎 Unificar Saldo</Text>
          <TouchableOpacity
            style={[
              commonStyles.button, 
              styles.actionButton,
              (!canUnify || loading) && styles.actionButtonDisabled
            ]}
            onPress={handleUnifyBalance}
            disabled={!canUnify || loading}
          >
            <IconSymbol 
              ios_icon_name={canUnify ? 'checkmark.circle.fill' : 'lock.fill'}
              android_material_icon_name={canUnify ? 'check_circle' : 'lock'}
              size={20} 
              color={canUnify && !loading ? '#fff' : colors.textSecondary}
            />
            <Text style={[
              commonStyles.buttonText,
              (!canUnify || loading) && styles.actionButtonTextDisabled
            ]}>
              {loading
                ? 'Unificando...'
                : canUnify
                ? 'Unificar Saldo a Balance Principal'
                : `Requiere 10 Referidos (${user.activeReferrals}/10)`}
            </Text>
          </TouchableOpacity>
          <Text style={styles.actionInfo}>
            {canUnify
              ? `Unifica ${totalYield.toFixed(8)} MXI a tu balance principal. Esto transferirá todo tu rendimiento acumulado.`
              : `Necesitas ${10 - user.activeReferrals} referidos activos más para poder unificar tu saldo de vesting.`}
          </Text>
        </View>

        {/* Info Card */}
        <View style={[commonStyles.card, styles.infoCard]}>
          <View style={styles.infoHeader}>
            <IconSymbol 
              ios_icon_name="info.circle.fill" 
              android_material_icon_name="info" 
              size={24} 
              color={colors.primary} 
            />
            <Text style={styles.infoTitle}>Acerca del Vesting</Text>
          </View>
          <Text style={styles.infoDescription}>
            • El vesting genera rendimientos del 0.005% por hora{'\n'}
            • Solo cuenta el MXI comprado directamente y de comisiones unificadas{'\n'}
            • El rendimiento se actualiza en tiempo real cada segundo{'\n'}
            • Necesitas 10 referidos activos para unificar el saldo{'\n'}
            • El MXI unificado se añade a tu balance principal{'\n'}
            • El vesting inicia inmediatamente al añadir saldo
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
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  yieldCard: {
    alignItems: 'center',
    paddingVertical: 24,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}15`,
  },
  yieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  yieldTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  yieldAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  yieldSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  realtimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  realtimeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  realtimeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  vestingBalanceContainer: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  vestingBalanceValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 8,
  },
  vestingBalanceSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  vestingBreakdown: {
    gap: 12,
  },
  vestingBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vestingBreakdownLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  vestingBreakdownValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  vestingDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  rateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  rateItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  rateLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
    fontWeight: '600',
  },
  rateValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'monospace',
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  projectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  projectionsList: {
    gap: 12,
  },
  projectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  projectionPeriod: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  projectionValues: {
    alignItems: 'flex-end',
  },
  projectionMxi: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  projectionUsdt: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  balancesList: {
    gap: 16,
  },
  balanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'monospace',
  },
  balanceValueTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  balanceDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  actionButton: {
    marginBottom: 12,
    flexDirection: 'row',
    gap: 8,
  },
  actionButtonDisabled: {
    backgroundColor: colors.border,
    opacity: 0.6,
  },
  actionButtonTextDisabled: {
    color: colors.textSecondary,
  },
  actionInfo: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  infoCard: {
    backgroundColor: colors.primary + '10',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  infoDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
