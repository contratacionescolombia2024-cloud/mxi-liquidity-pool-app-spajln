
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';

interface AppMetrics {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  totalMxiDistributed: number;
  totalUsdtContributed: number;
  totalReferrals: number;
  totalCommissions: number;
  totalCommissionAmount: number;
  averageMxiPerUser: number;
  averageUsdtPerUser: number;
  currentPhase: number;
  currentPrice: number;
  phase1Sold: number;
  phase2Sold: number;
  phase3Sold: number;
  totalTokensSold: number;
}

export function AdminMetricsDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<AppMetrics | null>(null);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);

      // Get user statistics
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, mxi_balance, usdt_contributed, is_active_contributor, is_blocked');

      if (usersError) throw usersError;

      const totalUsers = usersData?.length || 0;
      const activeUsers = usersData?.filter(u => u.is_active_contributor && !u.is_blocked).length || 0;
      const blockedUsers = usersData?.filter(u => u.is_blocked).length || 0;

      const totalMxiDistributed = usersData?.reduce((sum, u) => sum + parseFloat(u.mxi_balance.toString()), 0) || 0;
      const totalUsdtContributed = usersData?.reduce((sum, u) => sum + parseFloat(u.usdt_contributed.toString()), 0) || 0;

      const averageMxiPerUser = totalUsers > 0 ? totalMxiDistributed / totalUsers : 0;
      const averageUsdtPerUser = totalUsers > 0 ? totalUsdtContributed / totalUsers : 0;

      // Get referral statistics
      const { data: referralsData, error: referralsError } = await supabase
        .from('referrals')
        .select('id');

      const totalReferrals = referralsData?.length || 0;

      // Get commission statistics
      const { data: commissionsData, error: commissionsError } = await supabase
        .from('commissions')
        .select('id, amount');

      const totalCommissions = commissionsData?.length || 0;
      const totalCommissionAmount = commissionsData?.reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0) || 0;

      // Get metrics data
      const { data: metricsData, error: metricsError } = await supabase
        .from('metrics')
        .select('*')
        .single();

      if (metricsError) throw metricsError;

      setMetrics({
        totalUsers,
        activeUsers,
        blockedUsers,
        totalMxiDistributed,
        totalUsdtContributed,
        totalReferrals,
        totalCommissions,
        totalCommissionAmount,
        averageMxiPerUser,
        averageUsdtPerUser,
        currentPhase: metricsData?.current_phase || 1,
        currentPrice: parseFloat(metricsData?.current_price_usdt?.toString() || '0.30'),
        phase1Sold: parseFloat(metricsData?.phase_1_tokens_sold?.toString() || '0'),
        phase2Sold: parseFloat(metricsData?.phase_2_tokens_sold?.toString() || '0'),
        phase3Sold: parseFloat(metricsData?.phase_3_tokens_sold?.toString() || '0'),
        totalTokensSold: parseFloat(metricsData?.total_tokens_sold?.toString() || '0'),
      });

    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMetrics();
  };

  if (loading && !metrics) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando métricas...</Text>
      </View>
    );
  }

  if (!metrics) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No se pudieron cargar las métricas</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      <Text style={styles.title}>📊 Métricas de la Aplicación</Text>

      {/* User Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👥 Usuarios</Text>
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, { backgroundColor: colors.primary + '15' }]}>
            <IconSymbol ios_icon_name="person.3.fill" android_material_icon_name="groups" size={32} color={colors.primary} />
            <Text style={styles.metricValue}>{metrics.totalUsers}</Text>
            <Text style={styles.metricLabel}>Total Usuarios</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: colors.success + '15' }]}>
            <IconSymbol ios_icon_name="checkmark.circle.fill" android_material_icon_name="check_circle" size={32} color={colors.success} />
            <Text style={styles.metricValue}>{metrics.activeUsers}</Text>
            <Text style={styles.metricLabel}>Usuarios Activos</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: colors.error + '15' }]}>
            <IconSymbol ios_icon_name="xmark.circle.fill" android_material_icon_name="block" size={32} color={colors.error} />
            <Text style={styles.metricValue}>{metrics.blockedUsers}</Text>
            <Text style={styles.metricLabel}>Usuarios Bloqueados</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: colors.warning + '15' }]}>
            <IconSymbol ios_icon_name="percent" android_material_icon_name="percent" size={32} color={colors.warning} />
            <Text style={styles.metricValue}>
              {metrics.totalUsers > 0 ? ((metrics.activeUsers / metrics.totalUsers) * 100).toFixed(1) : 0}%
            </Text>
            <Text style={styles.metricLabel}>Tasa de Activación</Text>
          </View>
        </View>
      </View>

      {/* Financial Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💰 Finanzas</Text>
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, { backgroundColor: colors.accent + '15' }]}>
            <IconSymbol ios_icon_name="bitcoinsign.circle.fill" android_material_icon_name="currency_bitcoin" size={32} color={colors.accent} />
            <Text style={styles.metricValue}>{metrics.totalMxiDistributed.toFixed(2)}</Text>
            <Text style={styles.metricLabel}>MXI Distribuido</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: colors.success + '15' }]}>
            <IconSymbol ios_icon_name="dollarsign.circle.fill" android_material_icon_name="attach_money" size={32} color={colors.success} />
            <Text style={styles.metricValue}>${metrics.totalUsdtContributed.toFixed(2)}</Text>
            <Text style={styles.metricLabel}>USDT Contribuido</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: colors.primary + '15' }]}>
            <IconSymbol ios_icon_name="chart.bar.fill" android_material_icon_name="bar_chart" size={32} color={colors.primary} />
            <Text style={styles.metricValue}>{metrics.averageMxiPerUser.toFixed(2)}</Text>
            <Text style={styles.metricLabel}>MXI Promedio/Usuario</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: colors.warning + '15' }]}>
            <IconSymbol ios_icon_name="chart.line.uptrend.xyaxis" android_material_icon_name="trending_up" size={32} color={colors.warning} />
            <Text style={styles.metricValue}>${metrics.averageUsdtPerUser.toFixed(2)}</Text>
            <Text style={styles.metricLabel}>USDT Promedio/Usuario</Text>
          </View>
        </View>
      </View>

      {/* Referral Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔗 Referidos y Comisiones</Text>
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, { backgroundColor: colors.primary + '15' }]}>
            <IconSymbol ios_icon_name="link.circle.fill" android_material_icon_name="link" size={32} color={colors.primary} />
            <Text style={styles.metricValue}>{metrics.totalReferrals}</Text>
            <Text style={styles.metricLabel}>Total Referidos</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: colors.success + '15' }]}>
            <IconSymbol ios_icon_name="dollarsign.circle.fill" android_material_icon_name="attach_money" size={32} color={colors.success} />
            <Text style={styles.metricValue}>{metrics.totalCommissions}</Text>
            <Text style={styles.metricLabel}>Total Comisiones</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: colors.warning + '15' }]}>
            <IconSymbol ios_icon_name="banknote.fill" android_material_icon_name="payments" size={32} color={colors.warning} />
            <Text style={styles.metricValue}>${metrics.totalCommissionAmount.toFixed(2)}</Text>
            <Text style={styles.metricLabel}>Monto Comisiones</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: colors.accent + '15' }]}>
            <IconSymbol ios_icon_name="chart.pie.fill" android_material_icon_name="pie_chart" size={32} color={colors.accent} />
            <Text style={styles.metricValue}>
              {metrics.totalUsers > 0 ? (metrics.totalReferrals / metrics.totalUsers).toFixed(2) : 0}
            </Text>
            <Text style={styles.metricLabel}>Referidos/Usuario</Text>
          </View>
        </View>
      </View>

      {/* Presale Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚀 Preventa</Text>
        
        <View style={styles.phaseCard}>
          <View style={styles.phaseHeader}>
            <Text style={styles.phaseTitle}>Fase Actual: {metrics.currentPhase}</Text>
            <Text style={styles.phasePrice}>${metrics.currentPrice.toFixed(2)} USDT</Text>
          </View>
          
          <View style={styles.phaseProgress}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${(metrics.totalTokensSold / 25000000) * 100}%`,
                    backgroundColor: colors.primary 
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {metrics.totalTokensSold.toLocaleString()} / 25,000,000 MXI
            </Text>
          </View>
        </View>

        <View style={styles.phasesGrid}>
          <View style={[styles.phaseSmallCard, { backgroundColor: colors.success + '15' }]}>
            <Text style={styles.phaseSmallTitle}>Fase 1</Text>
            <Text style={styles.phaseSmallValue}>{metrics.phase1Sold.toLocaleString()}</Text>
            <Text style={styles.phaseSmallLabel}>$0.30 USDT</Text>
          </View>

          <View style={[styles.phaseSmallCard, { backgroundColor: colors.warning + '15' }]}>
            <Text style={styles.phaseSmallTitle}>Fase 2</Text>
            <Text style={styles.phaseSmallValue}>{metrics.phase2Sold.toLocaleString()}</Text>
            <Text style={styles.phaseSmallLabel}>$0.60 USDT</Text>
          </View>

          <View style={[styles.phaseSmallCard, { backgroundColor: colors.error + '15' }]}>
            <Text style={styles.phaseSmallTitle}>Fase 3</Text>
            <Text style={styles.phaseSmallValue}>{metrics.phase3Sold.toLocaleString()}</Text>
            <Text style={styles.phaseSmallLabel}>$0.90 USDT</Text>
          </View>
        </View>
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>📈 Resumen General</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Valor Total Recaudado:</Text>
          <Text style={styles.summaryValue}>${metrics.totalUsdtContributed.toFixed(2)} USDT</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tokens Vendidos:</Text>
          <Text style={styles.summaryValue}>{metrics.totalTokensSold.toLocaleString()} MXI</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Progreso Preventa:</Text>
          <Text style={styles.summaryValue}>
            {((metrics.totalTokensSold / 25000000) * 100).toFixed(2)}%
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Comisiones Pagadas:</Text>
          <Text style={styles.summaryValue}>${metrics.totalCommissionAmount.toFixed(2)} USDT</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    minHeight: 120,
    justifyContent: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  phaseCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  phaseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  phasePrice: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  phaseProgress: {
    gap: 8,
  },
  progressBar: {
    height: 12,
    backgroundColor: colors.background,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  phasesGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  phaseSmallCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  phaseSmallTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  phaseSmallValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  phaseSmallLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
});
