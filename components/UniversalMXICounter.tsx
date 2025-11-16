
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';

interface MXIDistribution {
  totalDelivered: number;
  vestingProduced: number;
  fromCommissions: number;
  fromChallenges: number;
  totalPresaleAllocation: number;
  phase1Allocation: number;
  phase2Allocation: number;
  phase3Allocation: number;
  phase1Sold: number;
  phase2Sold: number;
  phase3Sold: number;
  phase1Remaining: number;
  phase2Remaining: number;
  phase3Remaining: number;
  totalRemaining: number;
  // Real-time vesting data
  totalVestingUsers: number;
  currentSessionYield: number;
  totalYieldAllTime: number;
  yieldPerMinute: number;
  yieldPerHour: number;
  yieldPerDay: number;
}

interface UniversalMXICounterProps {
  isAdmin?: boolean;
}

export default function UniversalMXICounter({ isAdmin = false }: UniversalMXICounterProps) {
  const [loading, setLoading] = useState(true);
  const [distribution, setDistribution] = useState<MXIDistribution | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadDistribution();
    
    // Set up real-time updates every second for vesting counter
    const interval = setInterval(() => {
      loadDistribution(true); // Silent refresh
    }, 1000);

    // Set up real-time subscription for database changes
    const subscription = supabase
      .channel('mxi_distribution_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        loadDistribution(true);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'metrics' }, () => {
        loadDistribution(true);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'presale_allocation' }, () => {
        loadDistribution(true);
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, []);

  const loadDistribution = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      // Get user MXI distribution
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('mxi_purchased_directly, mxi_from_unified_commissions, mxi_from_challenges, mxi_vesting_locked, mxi_balance');

      if (userError) throw userError;

      // Get metrics data
      const { data: metricsData, error: metricsError } = await supabase
        .from('metrics')
        .select('*')
        .single();

      if (metricsError) throw metricsError;

      // Get presale allocation
      const { data: allocationData, error: allocationError } = await supabase
        .from('presale_allocation')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (allocationError && allocationError.code !== 'PGRST116') {
        console.error('Error loading allocation:', allocationError);
      }

      // Get real-time vesting analytics
      const { data: vestingData, error: vestingError } = await supabase
        .from('vesting_analytics')
        .select('*')
        .single();

      if (vestingError && vestingError.code !== 'PGRST116') {
        console.error('Error loading vesting analytics:', vestingError);
      }

      // Calculate totals
      const totalPurchased = userData?.reduce((sum, u) => sum + parseFloat(u.mxi_purchased_directly || '0'), 0) || 0;
      const totalFromCommissions = userData?.reduce((sum, u) => sum + parseFloat(u.mxi_from_unified_commissions || '0'), 0) || 0;
      const totalFromChallenges = userData?.reduce((sum, u) => sum + parseFloat(u.mxi_from_challenges || '0'), 0) || 0;
      const totalVesting = userData?.reduce((sum, u) => sum + parseFloat(u.mxi_vesting_locked || '0'), 0) || 0;
      const totalDelivered = userData?.reduce((sum, u) => sum + parseFloat(u.mxi_balance || '0'), 0) || 0;

      // Get phase data
      const phase1Sold = parseFloat(metricsData?.phase_1_tokens_sold || '0');
      const phase2Sold = parseFloat(metricsData?.phase_2_tokens_sold || '0');
      const phase3Sold = parseFloat(metricsData?.phase_3_tokens_sold || '0');

      // Get allocation data
      const totalPresaleAllocation = parseFloat(allocationData?.total_presale_allocation || '25000000');
      const phase1Allocation = parseFloat(allocationData?.phase_1_allocation || '8333333');
      const phase2Allocation = parseFloat(allocationData?.phase_2_allocation || '8333333');
      const phase3Allocation = parseFloat(allocationData?.phase_3_allocation || '8333334');

      // Calculate remaining
      const phase1Remaining = Math.max(0, phase1Allocation - phase1Sold);
      const phase2Remaining = Math.max(0, phase2Allocation - phase2Sold);
      const phase3Remaining = Math.max(0, phase3Allocation - phase3Sold);
      const totalRemaining = phase1Remaining + phase2Remaining + phase3Remaining;

      // Get vesting data
      const totalVestingUsers = parseInt(vestingData?.total_vesting_users || '0');
      const currentSessionYield = parseFloat(vestingData?.current_session_yield || '0');
      const totalYieldAllTime = parseFloat(vestingData?.total_yield_all_time || '0');
      const yieldPerMinute = parseFloat(vestingData?.total_yield_rate_per_minute || '0');
      const yieldPerHour = parseFloat(vestingData?.total_yield_rate_per_hour || '0');
      const yieldPerDay = parseFloat(vestingData?.total_yield_rate_per_day || '0');

      setDistribution({
        totalDelivered,
        vestingProduced: totalVesting,
        fromCommissions: totalFromCommissions,
        fromChallenges: totalFromChallenges,
        totalPresaleAllocation,
        phase1Allocation,
        phase2Allocation,
        phase3Allocation,
        phase1Sold,
        phase2Sold,
        phase3Sold,
        phase1Remaining,
        phase2Remaining,
        phase3Remaining,
        totalRemaining,
        totalVestingUsers,
        currentSessionYield,
        totalYieldAllTime,
        yieldPerMinute,
        yieldPerHour,
        yieldPerDay,
      });
    } catch (error) {
      console.error('Error loading MXI distribution:', error);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const handleEditAllocation = () => {
    if (!distribution) return;
    setEditValue(distribution.totalPresaleAllocation.toString());
    setEditModalVisible(true);
  };

  const handleSaveAllocation = async () => {
    if (!editValue) {
      Alert.alert('Error', 'Por favor ingrese un valor válido');
      return;
    }

    const newTotal = parseFloat(editValue);
    if (isNaN(newTotal) || newTotal <= 0) {
      Alert.alert('Error', 'Por favor ingrese un número válido mayor a 0');
      return;
    }

    try {
      setSaving(true);

      // Calculate new phase allocations (equal distribution)
      const phase1 = Math.floor(newTotal / 3);
      const phase2 = Math.floor(newTotal / 3);
      const phase3 = newTotal - phase1 - phase2; // Remainder goes to phase 3

      // Get admin user ID
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      // Update or insert allocation
      const { error } = await supabase
        .from('presale_allocation')
        .upsert({
          total_presale_allocation: newTotal,
          phase_1_allocation: phase1,
          phase_2_allocation: phase2,
          phase_3_allocation: phase3,
          updated_by: adminData?.id,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      Alert.alert('Éxito', 'Asignación de preventa actualizada correctamente');
      setEditModalVisible(false);
      loadDistribution();
    } catch (error) {
      console.error('Error saving allocation:', error);
      Alert.alert('Error', 'No se pudo actualizar la asignación');
    } finally {
      setSaving(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const getPercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return ((value / total) * 100).toFixed(2);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando distribución MXI...</Text>
      </View>
    );
  }

  if (!distribution) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Contador Universal MXI</Text>
          <Text style={styles.subtitle}>Distribución en tiempo real</Text>
        </View>
        {isAdmin && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditAllocation}
          >
            <IconSymbol
              ios_icon_name="pencil.circle.fill"
              android_material_icon_name="edit"
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Total Presale Allocation */}
      <View style={[styles.card, styles.mainCard]}>
        <View style={styles.cardHeader}>
          <IconSymbol
            ios_icon_name="chart.pie.fill"
            android_material_icon_name="pie_chart"
            size={32}
            color={colors.primary}
          />
          <View style={styles.cardHeaderText}>
            <Text style={styles.cardLabel}>Total Asignado para Preventa</Text>
            <Text style={styles.cardValue}>{formatNumber(distribution.totalPresaleAllocation)} MXI</Text>
          </View>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${getPercentage(
                  distribution.phase1Sold + distribution.phase2Sold + distribution.phase3Sold,
                  distribution.totalPresaleAllocation
                )}%`,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {getPercentage(
            distribution.phase1Sold + distribution.phase2Sold + distribution.phase3Sold,
            distribution.totalPresaleAllocation
          )}% vendido
        </Text>
      </View>

      {/* Phase Distribution */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Distribución por Fase</Text>
        
        {/* Phase 1 */}
        <View style={styles.card}>
          <View style={styles.phaseHeader}>
            <View style={[styles.phaseBadge, { backgroundColor: colors.success + '20' }]}>
              <Text style={[styles.phaseNumber, { color: colors.success }]}>Fase 1</Text>
            </View>
            <Text style={styles.phasePrice}>$0.40 USDT</Text>
          </View>
          <View style={styles.phaseStats}>
            <View style={styles.phaseStat}>
              <Text style={styles.phaseStatLabel}>Asignado</Text>
              <Text style={styles.phaseStatValue}>{formatNumber(distribution.phase1Allocation)}</Text>
            </View>
            <View style={styles.phaseStat}>
              <Text style={styles.phaseStatLabel}>Vendido</Text>
              <Text style={[styles.phaseStatValue, { color: colors.success }]}>
                {formatNumber(distribution.phase1Sold)}
              </Text>
            </View>
            <View style={styles.phaseStat}>
              <Text style={styles.phaseStatLabel}>Restante</Text>
              <Text style={[styles.phaseStatValue, { color: colors.warning }]}>
                {formatNumber(distribution.phase1Remaining)}
              </Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${getPercentage(distribution.phase1Sold, distribution.phase1Allocation)}%`, backgroundColor: colors.success },
              ]}
            />
          </View>
        </View>

        {/* Phase 2 */}
        <View style={styles.card}>
          <View style={styles.phaseHeader}>
            <View style={[styles.phaseBadge, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.phaseNumber, { color: colors.primary }]}>Fase 2</Text>
            </View>
            <Text style={styles.phasePrice}>$0.60 USDT</Text>
          </View>
          <View style={styles.phaseStats}>
            <View style={styles.phaseStat}>
              <Text style={styles.phaseStatLabel}>Asignado</Text>
              <Text style={styles.phaseStatValue}>{formatNumber(distribution.phase2Allocation)}</Text>
            </View>
            <View style={styles.phaseStat}>
              <Text style={styles.phaseStatLabel}>Vendido</Text>
              <Text style={[styles.phaseStatValue, { color: colors.success }]}>
                {formatNumber(distribution.phase2Sold)}
              </Text>
            </View>
            <View style={styles.phaseStat}>
              <Text style={styles.phaseStatLabel}>Restante</Text>
              <Text style={[styles.phaseStatValue, { color: colors.warning }]}>
                {formatNumber(distribution.phase2Remaining)}
              </Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${getPercentage(distribution.phase2Sold, distribution.phase2Allocation)}%` },
              ]}
            />
          </View>
        </View>

        {/* Phase 3 */}
        <View style={styles.card}>
          <View style={styles.phaseHeader}>
            <View style={[styles.phaseBadge, { backgroundColor: colors.warning + '20' }]}>
              <Text style={[styles.phaseNumber, { color: colors.warning }]}>Fase 3</Text>
            </View>
            <Text style={styles.phasePrice}>$0.80 USDT</Text>
          </View>
          <View style={styles.phaseStats}>
            <View style={styles.phaseStat}>
              <Text style={styles.phaseStatLabel}>Asignado</Text>
              <Text style={styles.phaseStatValue}>{formatNumber(distribution.phase3Allocation)}</Text>
            </View>
            <View style={styles.phaseStat}>
              <Text style={styles.phaseStatLabel}>Vendido</Text>
              <Text style={[styles.phaseStatValue, { color: colors.success }]}>
                {formatNumber(distribution.phase3Sold)}
              </Text>
            </View>
            <View style={styles.phaseStat}>
              <Text style={styles.phaseStatLabel}>Restante</Text>
              <Text style={[styles.phaseStatValue, { color: colors.warning }]}>
                {formatNumber(distribution.phase3Remaining)}
              </Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${getPercentage(distribution.phase3Sold, distribution.phase3Allocation)}%`, backgroundColor: colors.warning },
              ]}
            />
          </View>
        </View>
      </View>

      {/* MXI Distribution by Source */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Distribución MXI por Fuente</Text>

        <View style={styles.distributionGrid}>
          {/* Total Delivered */}
          <View style={[styles.card, styles.distributionCard]}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check_circle"
                size={28}
                color={colors.primary}
              />
            </View>
            <Text style={styles.distributionLabel}>MXI Entregados</Text>
            <Text style={[styles.distributionValue, { color: colors.primary }]}>
              {formatNumber(distribution.totalDelivered)}
            </Text>
          </View>

          {/* Vesting Produced - Real-time */}
          <View style={[styles.card, styles.distributionCard, styles.liveCard]}>
            <View style={[styles.iconContainer, { backgroundColor: colors.success + '20' }]}>
              <IconSymbol
                ios_icon_name="clock.fill"
                android_material_icon_name="schedule"
                size={28}
                color={colors.success}
              />
            </View>
            <Text style={styles.distributionLabel}>Producidos en Vesting</Text>
            <Text style={[styles.distributionValue, { color: colors.success }]}>
              {formatNumber(distribution.totalYieldAllTime)}
            </Text>
            <View style={styles.liveBadge}>
              <Text style={styles.liveBadgeText}>⚡ LIVE</Text>
            </View>
            <Text style={styles.distributionSubtext}>
              {distribution.totalVestingUsers} usuarios activos
            </Text>
          </View>

          {/* From Commissions */}
          <View style={[styles.card, styles.distributionCard]}>
            <View style={[styles.iconContainer, { backgroundColor: colors.warning + '20' }]}>
              <IconSymbol
                ios_icon_name="person.3.fill"
                android_material_icon_name="people"
                size={28}
                color={colors.warning}
              />
            </View>
            <Text style={styles.distributionLabel}>Por Comisiones</Text>
            <Text style={[styles.distributionValue, { color: colors.warning }]}>
              {formatNumber(distribution.fromCommissions)}
            </Text>
          </View>

          {/* From Challenges */}
          <View style={[styles.card, styles.distributionCard]}>
            <View style={[styles.iconContainer, { backgroundColor: colors.error + '20' }]}>
              <IconSymbol
                ios_icon_name="trophy.fill"
                android_material_icon_name="emoji_events"
                size={28}
                color={colors.error}
              />
            </View>
            <Text style={styles.distributionLabel}>Por Retos</Text>
            <Text style={[styles.distributionValue, { color: colors.error }]}>
              {formatNumber(distribution.fromChallenges)}
            </Text>
          </View>
        </View>
      </View>

      {/* Real-time Vesting Performance */}
      {distribution.totalVestingUsers > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⛏️ Rendimiento de Vesting en Tiempo Real</Text>
          
          <View style={[styles.card, styles.vestingCard]}>
            <View style={styles.vestingHeader}>
              <IconSymbol
                ios_icon_name="chart.line.uptrend.xyaxis"
                android_material_icon_name="trending_up"
                size={24}
                color={colors.accent}
              />
              <Text style={styles.vestingHeaderText}>Tasas de Producción</Text>
            </View>

            <View style={styles.vestingRates}>
              <View style={styles.vestingRateItem}>
                <Text style={styles.vestingRateLabel}>Por Minuto</Text>
                <Text style={styles.vestingRateValue}>
                  {formatNumber(distribution.yieldPerMinute)} MXI
                </Text>
              </View>
              <View style={styles.vestingRateDivider} />
              <View style={styles.vestingRateItem}>
                <Text style={styles.vestingRateLabel}>Por Hora</Text>
                <Text style={styles.vestingRateValue}>
                  {formatNumber(distribution.yieldPerHour)} MXI
                </Text>
              </View>
              <View style={styles.vestingRateDivider} />
              <View style={styles.vestingRateItem}>
                <Text style={styles.vestingRateLabel}>Por Día</Text>
                <Text style={styles.vestingRateValue}>
                  {formatNumber(distribution.yieldPerDay)} MXI
                </Text>
              </View>
            </View>

            <View style={styles.vestingSession}>
              <Text style={styles.vestingSessionLabel}>🔥 Sesión Actual</Text>
              <Text style={styles.vestingSessionValue}>
                {formatNumber(distribution.currentSessionYield)} MXI
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Asignación de Preventa</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <IconSymbol
                  ios_icon_name="xmark.circle.fill"
                  android_material_icon_name="cancel"
                  size={28}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Total MXI para Preventa</Text>
              <Text style={styles.modalHint}>
                Actual: {formatNumber(distribution.totalPresaleAllocation)} MXI
              </Text>

              <TextInput
                style={styles.input}
                value={editValue}
                onChangeText={setEditValue}
                keyboardType="decimal-pad"
                placeholder="Ingrese nuevo total"
                placeholderTextColor={colors.textSecondary}
              />

              <View style={styles.warningBox}>
                <IconSymbol
                  ios_icon_name="exclamationmark.triangle.fill"
                  android_material_icon_name="warning"
                  size={20}
                  color={colors.warning}
                />
                <Text style={styles.warningText}>
                  Esto redistribuirá automáticamente los tokens entre las 3 fases de manera equitativa.
                </Text>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => setEditModalVisible(false)}
                disabled={saving}
              >
                <Text style={styles.buttonSecondaryText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary]}
                onPress={handleSaveAllocation}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonPrimaryText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.card,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  mainCard: {
    borderWidth: 2,
    borderColor: colors.primary + '40',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
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
    backgroundColor: colors.primary,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  phaseBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  phaseNumber: {
    fontSize: 14,
    fontWeight: '700',
  },
  phasePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  phaseStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  phaseStat: {
    flex: 1,
    alignItems: 'center',
  },
  phaseStatLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  phaseStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  distributionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  distributionCard: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    position: 'relative',
  },
  liveCard: {
    borderWidth: 2,
    borderColor: colors.success,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  distributionLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  distributionValue: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  distributionSubtext: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  liveBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  liveBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
  },
  vestingCard: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
  vestingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  vestingHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  vestingRates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  vestingRateItem: {
    flex: 1,
    alignItems: 'center',
  },
  vestingRateDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 8,
  },
  vestingRateLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4,
    fontWeight: '600',
  },
  vestingRateValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'monospace',
  },
  vestingSession: {
    backgroundColor: `${colors.accent}20`,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  vestingSessionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  vestingSessionValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accent,
    fontFamily: 'monospace',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  modalBody: {
    padding: 20,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  modalHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  warningBox: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: colors.warning + '20',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondaryText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
