
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';

interface VestingMetric {
  metric_name: string;
  metric_value: number;
  metric_unit: string;
  metric_description: string;
}

interface VestingUserDetail {
  user_id: string;
  user_name: string;
  user_email: string;
  mxi_in_vesting: number;
  accumulated_yield: number;
  current_session_yield: number;
  total_yield: number;
  yield_rate_per_minute: number;
  yield_rate_per_hour: number;
  yield_rate_per_day: number;
  last_yield_update: string;
  active_referrals: number;
  can_unify: boolean;
}

interface VestingAnalyticsProps {
  isAdmin?: boolean;
}

export default function VestingAnalytics({ isAdmin = false }: VestingAnalyticsProps) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<VestingMetric[]>([]);
  const [userDetails, setUserDetails] = useState<VestingUserDetail[]>([]);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadVestingData();

    // Set up real-time updates every second for live counter
    const interval = setInterval(() => {
      loadVestingData(true); // Silent refresh
    }, 1000);

    // Set up real-time subscription for database changes
    const subscription = supabase
      .channel('vesting_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        loadVestingData(true);
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, []);

  const loadVestingData = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      // Load vesting performance summary
      const { data: metricsData, error: metricsError } = await supabase
        .rpc('get_vesting_performance_summary');

      if (metricsError) {
        console.error('Error loading vesting metrics:', metricsError);
      } else {
        setMetrics(metricsData || []);
      }

      // Load user details if admin
      if (isAdmin) {
        const { data: usersData, error: usersError } = await supabase
          .rpc('get_vesting_user_details');

        if (usersError) {
          console.error('Error loading vesting user details:', usersError);
        } else {
          setUserDetails(usersData || []);
        }
      }
    } catch (error) {
      console.error('Error loading vesting data:', error);
    } finally {
      if (!silent) {
        setLoading(false);
      }
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadVestingData();
  };

  const toggleUserExpanded = (userId: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const formatNumber = (num: number, decimals = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const getMetricIcon = (metricName: string) => {
    switch (metricName) {
      case 'total_users':
        return { ios: 'person.3.fill', android: 'people', color: colors.primary };
      case 'total_vesting_locked':
        return { ios: 'lock.fill', android: 'lock', color: colors.warning };
      case 'total_accumulated_yield':
        return { ios: 'chart.bar.fill', android: 'bar_chart', color: colors.success };
      case 'current_session_yield':
        return { ios: 'clock.fill', android: 'schedule', color: colors.accent };
      case 'total_yield_all_time':
        return { ios: 'star.fill', android: 'star', color: colors.primary };
      case 'yield_per_minute':
        return { ios: 'timer', android: 'timer', color: colors.success };
      case 'yield_per_hour':
        return { ios: 'hourglass', android: 'hourglass_empty', color: colors.warning };
      case 'yield_per_day':
        return { ios: 'calendar', android: 'calendar_today', color: colors.primary };
      case 'avg_yield_rate':
        return { ios: 'chart.line.uptrend.xyaxis', android: 'trending_up', color: colors.accent };
      case 'total_mxi_generating':
        return { ios: 'bolt.fill', android: 'flash_on', color: colors.success };
      default:
        return { ios: 'info.circle.fill', android: 'info', color: colors.textSecondary };
    }
  };

  const getMetricDisplayName = (metricName: string) => {
    const names: { [key: string]: string } = {
      total_users: 'Usuarios Activos',
      total_vesting_locked: 'MXI Bloqueado',
      total_accumulated_yield: 'Rendimiento Acumulado',
      current_session_yield: 'Sesión Actual',
      total_yield_all_time: 'Rendimiento Total',
      yield_per_minute: 'Por Minuto',
      yield_per_hour: 'Por Hora',
      yield_per_day: 'Por Día',
      avg_yield_rate: 'Promedio/Usuario',
      total_mxi_generating: 'MXI Generando',
    };
    return names[metricName] || metricName;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando análisis de vesting...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Text style={styles.headerEmoji}>⛏️</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Análisis de Vesting en Tiempo Real</Text>
          <Text style={styles.subtitle}>Actualizado cada segundo</Text>
        </View>
      </View>

      {/* Key Metrics Grid */}
      <View style={styles.metricsGrid}>
        {metrics.map((metric, index) => {
          const icon = getMetricIcon(metric.metric_name);
          const isHighlighted = ['total_yield_all_time', 'current_session_yield', 'yield_per_day'].includes(
            metric.metric_name
          );

          return (
            <View
              key={index}
              style={[
                styles.metricCard,
                isHighlighted && styles.metricCardHighlighted,
              ]}
            >
              <View style={[styles.metricIconContainer, { backgroundColor: icon.color + '20' }]}>
                <IconSymbol
                  ios_icon_name={icon.ios}
                  android_material_icon_name={icon.android}
                  size={24}
                  color={icon.color}
                />
              </View>
              <Text style={styles.metricLabel}>{getMetricDisplayName(metric.metric_name)}</Text>
              <Text style={[styles.metricValue, { color: icon.color }]}>
                {formatNumber(metric.metric_value, metric.metric_name === 'total_users' ? 0 : 8)}
              </Text>
              <Text style={styles.metricUnit}>{metric.metric_unit}</Text>
              {isHighlighted && (
                <View style={[styles.highlightBadge, { backgroundColor: icon.color }]}>
                  <Text style={styles.highlightBadgeText}>⚡ LIVE</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Real-time Performance Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <IconSymbol
            ios_icon_name="chart.xyaxis.line"
            android_material_icon_name="show_chart"
            size={28}
            color={colors.accent}
          />
          <Text style={styles.summaryTitle}>Resumen de Rendimiento</Text>
        </View>

        <View style={styles.summaryContent}>
          {metrics
            .filter((m) =>
              ['total_yield_all_time', 'yield_per_minute', 'yield_per_hour', 'yield_per_day'].includes(
                m.metric_name
              )
            )
            .map((metric, index) => (
              <View key={index} style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{metric.metric_description}</Text>
                <Text style={styles.summaryValue}>
                  {formatNumber(metric.metric_value, 8)} {metric.metric_unit}
                </Text>
              </View>
            ))}
        </View>
      </View>

      {/* User Details Section (Admin Only) */}
      {isAdmin && userDetails.length > 0 && (
        <View style={styles.userDetailsSection}>
          <TouchableOpacity
            style={styles.userDetailsHeader}
            onPress={() => setShowUserDetails(!showUserDetails)}
          >
            <View style={styles.userDetailsHeaderLeft}>
              <IconSymbol
                ios_icon_name="person.3.fill"
                android_material_icon_name="people"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.userDetailsTitle}>
                Detalles por Usuario ({userDetails.length})
              </Text>
            </View>
            <IconSymbol
              ios_icon_name={showUserDetails ? 'chevron.up' : 'chevron.down'}
              android_material_icon_name={showUserDetails ? 'expand_less' : 'expand_more'}
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          {showUserDetails && (
            <View style={styles.userDetailsList}>
              {userDetails.map((user, index) => {
                const isExpanded = expandedUsers.has(user.user_id);
                return (
                  <View key={index} style={styles.userCard}>
                    <TouchableOpacity
                      style={styles.userCardHeader}
                      onPress={() => toggleUserExpanded(user.user_id)}
                    >
                      <View style={styles.userCardHeaderLeft}>
                        <View
                          style={[
                            styles.userStatusDot,
                            { backgroundColor: user.can_unify ? colors.success : colors.warning },
                          ]}
                        />
                        <View style={styles.userCardHeaderText}>
                          <Text style={styles.userName}>{user.user_name}</Text>
                          <Text style={styles.userEmail}>{user.user_email}</Text>
                        </View>
                      </View>
                      <View style={styles.userCardHeaderRight}>
                        <Text style={styles.userYieldValue}>
                          {formatNumber(user.total_yield, 8)}
                        </Text>
                        <Text style={styles.userYieldLabel}>MXI Total</Text>
                      </View>
                    </TouchableOpacity>

                    {isExpanded && (
                      <View style={styles.userCardDetails}>
                        <View style={styles.userDetailRow}>
                          <Text style={styles.userDetailLabel}>💎 MXI en Vesting</Text>
                          <Text style={styles.userDetailValue}>
                            {formatNumber(user.mxi_in_vesting, 2)} MXI
                          </Text>
                        </View>

                        <View style={styles.userDetailRow}>
                          <Text style={styles.userDetailLabel}>📊 Acumulado Previo</Text>
                          <Text style={styles.userDetailValue}>
                            {formatNumber(user.accumulated_yield, 8)} MXI
                          </Text>
                        </View>

                        <View style={styles.userDetailRow}>
                          <Text style={styles.userDetailLabel}>🔥 Sesión Actual</Text>
                          <Text style={[styles.userDetailValue, { color: colors.accent }]}>
                            {formatNumber(user.current_session_yield, 8)} MXI
                          </Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.userDetailRow}>
                          <Text style={styles.userDetailLabel}>⚡ Por Minuto</Text>
                          <Text style={styles.userDetailValue}>
                            {formatNumber(user.yield_rate_per_minute, 8)} MXI
                          </Text>
                        </View>

                        <View style={styles.userDetailRow}>
                          <Text style={styles.userDetailLabel}>⏰ Por Hora</Text>
                          <Text style={styles.userDetailValue}>
                            {formatNumber(user.yield_rate_per_hour, 6)} MXI
                          </Text>
                        </View>

                        <View style={styles.userDetailRow}>
                          <Text style={styles.userDetailLabel}>📈 Por Día</Text>
                          <Text style={styles.userDetailValue}>
                            {formatNumber(user.yield_rate_per_day, 4)} MXI
                          </Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.userDetailRow}>
                          <Text style={styles.userDetailLabel}>👥 Referidos Activos</Text>
                          <Text style={styles.userDetailValue}>{user.active_referrals}</Text>
                        </View>

                        <View style={styles.userDetailRow}>
                          <Text style={styles.userDetailLabel}>🔓 Puede Unificar</Text>
                          <Text
                            style={[
                              styles.userDetailValue,
                              { color: user.can_unify ? colors.success : colors.error },
                            ]}
                          >
                            {user.can_unify ? 'Sí' : 'No'}
                          </Text>
                        </View>

                        <View style={styles.userDetailRow}>
                          <Text style={styles.userDetailLabel}>🕐 Última Actualización</Text>
                          <Text style={styles.userDetailValue}>
                            {new Date(user.last_yield_update).toLocaleString('es-ES')}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* Info Box */}
      <View style={styles.infoBox}>
        <IconSymbol
          ios_icon_name="info.circle.fill"
          android_material_icon_name="info"
          size={20}
          color={colors.accent}
        />
        <Text style={styles.infoText}>
          Los datos se actualizan automáticamente cada segundo para mostrar el rendimiento de vesting en
          tiempo real de todos los usuarios activos. El sistema calcula el rendimiento basado en el 0.005%
          por hora del MXI en vesting de cada usuario.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 16,
  },
  headerIcon: {
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
  headerEmoji: {
    fontSize: 32,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: colors.accent,
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricCardHighlighted: {
    borderWidth: 2,
    borderColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  metricIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  metricUnit: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  highlightBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  highlightBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  summaryContent: {
    gap: 12,
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
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'monospace',
  },
  userDetailsSection: {
    marginBottom: 16,
  },
  userDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  userDetailsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userDetailsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  userDetailsList: {
    gap: 12,
  },
  userCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  userCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  userCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  userStatusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  userCardHeaderText: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  userCardHeaderRight: {
    alignItems: 'flex-end',
  },
  userYieldValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    fontFamily: 'monospace',
  },
  userYieldLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  userCardDetails: {
    padding: 16,
    paddingTop: 0,
    gap: 8,
  },
  userDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  userDetailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
  userDetailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'monospace',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.highlight,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
