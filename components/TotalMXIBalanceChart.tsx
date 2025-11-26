
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Svg, Rect, Line, Text as SvgText, G, Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const CHART_WIDTH = Dimensions.get('window').width - 80;
const CHART_HEIGHT = 320;
const PADDING = { top: 20, right: 10, bottom: 50, left: 60 };

type TimeRange = '5min' | '15min' | '1h' | '24h' | '7d';

interface BalanceDataPoint {
  timestamp: Date;
  mxiPurchased: number;
  mxiCommissions: number;
  mxiTournaments: number;
  mxiVesting: number;
  totalBalance: number;
}

export function TotalMXIBalanceChart() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [balanceData, setBalanceData] = useState<BalanceDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentVesting, setCurrentVesting] = useState(0);

  // Real-time vesting counter (only from purchased MXI)
  useEffect(() => {
    if (!user) return;

    const MONTHLY_YIELD_PERCENTAGE = 0.03;
    const SECONDS_IN_MONTH = 2592000;
    
    // ONLY purchased MXI generates vesting (commissions do NOT count)
    const mxiPurchased = user.mxiPurchasedDirectly || 0;
    
    if (mxiPurchased === 0) {
      setCurrentVesting(0);
      return;
    }

    const maxMonthlyYield = mxiPurchased * MONTHLY_YIELD_PERCENTAGE;
    const yieldPerSecond = maxMonthlyYield / SECONDS_IN_MONTH;

    const interval = setInterval(() => {
      const now = Date.now();
      const lastUpdate = new Date(user.lastYieldUpdate);
      const secondsElapsed = (now - lastUpdate.getTime()) / 1000;
      const sessionYield = yieldPerSecond * secondsElapsed;
      const totalYield = user.accumulatedYield + sessionYield;
      const cappedTotalYield = Math.min(totalYield, maxMonthlyYield);
      setCurrentVesting(cappedTotalYield);
    }, 1000);

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (user) {
      loadBalanceData();
      // Refresh data periodically based on timeframe
      const refreshInterval = getRefreshInterval();
      const interval = setInterval(loadBalanceData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [user, timeRange]);

  const getRefreshInterval = () => {
    switch (timeRange) {
      case '5min':
      case '15min':
        return 5000; // 5 seconds
      case '1h':
        return 10000; // 10 seconds
      case '24h':
        return 60000; // 1 minute
      case '7d':
        return 300000; // 5 minutes
      default:
        return 60000;
    }
  };

  const getTimeRangeMs = () => {
    const now = Date.now();
    switch (timeRange) {
      case '5min':
        return 5 * 60 * 1000;
      case '15min':
        return 15 * 60 * 1000;
      case '1h':
        return 60 * 60 * 1000;
      case '24h':
        return 24 * 60 * 60 * 1000;
      case '7d':
        return 7 * 24 * 60 * 60 * 1000;
      default:
        return 24 * 60 * 60 * 1000;
    }
  };

  const loadBalanceData = async () => {
    try {
      setLoading(true);

      const now = new Date();
      const startTime = new Date(now.getTime() - getTimeRangeMs());

      // Fetch balance history from database
      const { data: historyData, error } = await supabase
        .from('mxi_balance_history')
        .select('*')
        .eq('user_id', user?.id)
        .gte('timestamp', startTime.toISOString())
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Error loading balance history:', error);
        generateSyntheticData();
        return;
      }

      if (!historyData || historyData.length === 0) {
        generateSyntheticData();
        return;
      }

      // Transform data
      const transformedData: BalanceDataPoint[] = historyData.map(item => ({
        timestamp: new Date(item.timestamp),
        mxiPurchased: parseFloat(item.mxi_purchased || '0'),
        mxiCommissions: parseFloat(item.mxi_commissions || '0'),
        mxiTournaments: parseFloat(item.mxi_challenges || '0'),
        mxiVesting: parseFloat(item.mxi_vesting || '0'),
        totalBalance: parseFloat(item.total_balance || '0'),
      }));

      setBalanceData(transformedData);
    } catch (error) {
      console.error('Error in loadBalanceData:', error);
      generateSyntheticData();
    } finally {
      setLoading(false);
    }
  };

  const generateSyntheticData = () => {
    if (!user) return;

    const now = new Date();
    const rangeMs = getTimeRangeMs();
    const dataPoints = getDataPointCount();
    const intervalMs = rangeMs / dataPoints;

    const mxiPurchased = user.mxiPurchasedDirectly || 0;
    const mxiCommissions = user.mxiFromUnifiedCommissions || 0;
    const mxiTournaments = user.mxiFromChallenges || 0;
    const mxiVesting = user.mxiVestingLocked || 0;

    const MONTHLY_YIELD_PERCENTAGE = 0.03;
    const SECONDS_IN_MONTH = 2592000;
    // ONLY purchased MXI generates vesting
    const maxMonthlyYield = mxiPurchased * MONTHLY_YIELD_PERCENTAGE;
    const yieldPerSecond = mxiPurchased > 0 ? maxMonthlyYield / SECONDS_IN_MONTH : 0;
    const yieldPerInterval = yieldPerSecond * (intervalMs / 1000);

    const synthetic: BalanceDataPoint[] = [];
    let cumulativeVesting = Math.max(0, currentVesting - (yieldPerInterval * dataPoints));

    for (let i = dataPoints; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - (i * intervalMs));
      const vestingAtPoint = cumulativeVesting;
      
      synthetic.push({
        timestamp,
        mxiPurchased,
        mxiCommissions,
        mxiTournaments,
        mxiVesting: vestingAtPoint,
        totalBalance: mxiPurchased + mxiCommissions + mxiTournaments + vestingAtPoint,
      });

      cumulativeVesting += yieldPerInterval;
    }

    setBalanceData(synthetic);
  };

  const getDataPointCount = () => {
    switch (timeRange) {
      case '5min':
        return 30; // 10 second intervals
      case '15min':
        return 45; // 20 second intervals
      case '1h':
        return 60; // 1 minute intervals
      case '24h':
        return 96; // 15 minute intervals
      case '7d':
        return 168; // 1 hour intervals
      default:
        return 96;
    }
  };

  const renderFuturisticChart = () => {
    if (balanceData.length === 0) {
      return (
        <View style={styles.emptyChart}>
          <Text style={styles.emptyText}>Generando datos del gráfico...</Text>
        </View>
      );
    }

    // Calculate total MXI from all sources
    const currentTotal = balanceData.length > 0 
      ? balanceData[balanceData.length - 1].totalBalance 
      : 0;

    // Y-axis scale: 2x the total MXI for balanced view
    const maxY = currentTotal * 2;
    const minY = 0; // Always start from 0

    const chartWidth = CHART_WIDTH - PADDING.left - PADDING.right;
    const chartHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
    const barWidth = Math.max(2, (chartWidth / balanceData.length) - 2);
    const barSpacing = chartWidth / balanceData.length;

    // Y-axis scale - always starts from 0
    const yScale = (value: number) => {
      if (maxY === 0) return PADDING.top + chartHeight;
      return PADDING.top + chartHeight - ((value - minY) / (maxY - minY)) * chartHeight;
    };

    // X-axis scale
    const xScale = (index: number) => {
      return PADDING.left + (index * barSpacing) + (barSpacing / 2);
    };

    // Create smooth line path that starts from (0,0) and connects all points
    const createSmoothPath = () => {
      if (balanceData.length === 0) return '';
      
      let path = '';
      
      // Start from origin (0,0) - bottom left corner of chart
      const originX = PADDING.left;
      const originY = yScale(0);
      path += `M ${originX} ${originY}`;
      
      // Connect to all data points with smooth curves
      balanceData.forEach((point, index) => {
        const x = xScale(index);
        const y = yScale(point.totalBalance);
        
        if (index === 0) {
          // First point: smooth curve from origin to first data point
          const cpX = (originX + x) / 2;
          path += ` Q ${cpX} ${originY}, ${x} ${y}`;
        } else {
          // Subsequent points: use smooth curve between points
          const prevX = xScale(index - 1);
          const prevY = yScale(balanceData[index - 1].totalBalance);
          const cpX = (prevX + x) / 2;
          path += ` Q ${cpX} ${prevY}, ${x} ${y}`;
        }
      });
      
      return path;
    };

    // Create area fill path
    const createAreaPath = () => {
      if (balanceData.length === 0) return '';
      
      let path = createSmoothPath();
      
      // Close the path to create filled area
      const lastX = xScale(balanceData.length - 1);
      const baseY = yScale(0);
      path += ` L ${lastX} ${baseY}`;
      path += ` L ${PADDING.left} ${baseY}`;
      path += ' Z';
      
      return path;
    };

    return (
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        <Defs>
          {/* Green gradient for main line */}
          <LinearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#00ff88" stopOpacity="1" />
            <Stop offset="100%" stopColor="#00cc66" stopOpacity="1" />
          </LinearGradient>
          
          {/* Yellow gradient for glow */}
          <LinearGradient id="yellowGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#ffdd00" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#ffaa00" stopOpacity="0.6" />
          </LinearGradient>

          {/* Area fill gradient */}
          <LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#00ff88" stopOpacity="0.3" />
            <Stop offset="50%" stopColor="#00cc66" stopOpacity="0.15" />
            <Stop offset="100%" stopColor="#008844" stopOpacity="0.05" />
          </LinearGradient>
        </Defs>

        {/* Grid lines with futuristic glow */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = PADDING.top + chartHeight * ratio;
          const value = maxY - ((maxY - minY) * ratio);
          return (
            <G key={`grid-${i}`}>
              <Line
                x1={PADDING.left}
                y1={y}
                x2={CHART_WIDTH - PADDING.right}
                y2={y}
                stroke="rgba(0, 255, 136, 0.15)"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
              <SvgText
                x={PADDING.left - 8}
                y={y + 4}
                fill="#00ff88"
                fontSize="10"
                textAnchor="end"
                fontWeight="600"
              >
                {value.toFixed(2)}
              </SvgText>
            </G>
          );
        })}

        {/* Area fill under the line */}
        <Path
          d={createAreaPath()}
          fill="url(#areaGradient)"
          opacity={0.4}
        />

        {/* Main trend line with glow effect - starts from (0,0) and connects all points */}
        <Path
          d={createSmoothPath()}
          stroke="#ffdd00"
          strokeWidth="4"
          fill="none"
          opacity={0.3}
        />
        <Path
          d={createSmoothPath()}
          stroke="url(#greenGradient)"
          strokeWidth="3"
          fill="none"
          opacity={1}
        />

        {/* Origin point at (0,0) */}
        <G>
          <Circle
            cx={PADDING.left}
            cy={yScale(0)}
            r="6"
            fill="#ffdd00"
            opacity={0.3}
          />
          <Circle
            cx={PADDING.left}
            cy={yScale(0)}
            r="3"
            fill="#00ff88"
            opacity={1}
          />
        </G>

        {/* Data points with glow - show every few points for clarity */}
        {balanceData.filter((_, i) => i % Math.ceil(balanceData.length / 20) === 0).map((point, i) => {
          const index = balanceData.indexOf(point);
          const x = xScale(index);
          const y = yScale(point.totalBalance);
          
          return (
            <G key={`point-${i}`}>
              {/* Outer glow */}
              <Circle
                cx={x}
                cy={y}
                r="6"
                fill="#ffdd00"
                opacity={0.3}
              />
              {/* Inner point */}
              <Circle
                cx={x}
                cy={y}
                r="3"
                fill="#00ff88"
                opacity={1}
              />
            </G>
          );
        })}

        {/* X-axis labels */}
        {balanceData.filter((_, i) => i % Math.ceil(balanceData.length / 6) === 0).map((point, i) => {
          const index = balanceData.indexOf(point);
          const x = xScale(index);
          const label = formatTimeLabel(point.timestamp);
          
          return (
            <SvgText
              key={`x-label-${i}`}
              x={x}
              y={CHART_HEIGHT - PADDING.bottom + 20}
              fill="#00ff88"
              fontSize="9"
              textAnchor="middle"
              fontWeight="600"
            >
              {label}
            </SvgText>
          );
        })}

        {/* Y-axis label */}
        <SvgText
          x={15}
          y={CHART_HEIGHT / 2}
          fill="#00ff88"
          fontSize="11"
          textAnchor="middle"
          fontWeight="700"
          transform={`rotate(-90, 15, ${CHART_HEIGHT / 2})`}
        >
          MXI Total
        </SvgText>
      </Svg>
    );
  };

  const formatTimeLabel = (date: Date) => {
    switch (timeRange) {
      case '5min':
      case '15min':
      case '1h':
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      case '24h':
        return `${date.getHours()}:00`;
      case '7d':
        return `${date.getDate()}/${date.getMonth() + 1}`;
      default:
        return '';
    }
  };

  const getChangeData = () => {
    if (balanceData.length < 2) return { change: 0, percentage: 0 };
    const first = balanceData[0].totalBalance;
    const last = balanceData[balanceData.length - 1].totalBalance;
    const change = last - first;
    const percentage = first > 0 ? (change / first) * 100 : 0;
    return { change, percentage };
  };

  const { change, percentage } = getChangeData();
  const isPositive = change >= 0;

  // Calculate the TOTAL MXI balance from ALL sources (purchased + commissions + tournaments + vesting)
  const currentTotal = balanceData.length > 0 
    ? balanceData[balanceData.length - 1].totalBalance 
    : (user?.mxiPurchasedDirectly || 0) + (user?.mxiFromUnifiedCommissions || 0) + (user?.mxiFromChallenges || 0) + currentVesting;

  const currentBreakdown = balanceData.length > 0
    ? balanceData[balanceData.length - 1]
    : {
        mxiPurchased: user?.mxiPurchasedDirectly || 0,
        mxiCommissions: user?.mxiFromUnifiedCommissions || 0,
        mxiTournaments: user?.mxiFromChallenges || 0,
        mxiVesting: currentVesting,
        totalBalance: (user?.mxiPurchasedDirectly || 0) + (user?.mxiFromUnifiedCommissions || 0) + (user?.mxiFromChallenges || 0) + currentVesting,
      };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>📊 Balance General de MXI</Text>
          <Text style={styles.subtitle}>Todas las fuentes incluidas</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.currentValue}>
            {currentTotal.toLocaleString('es-ES', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
          <Text style={styles.currentUnit}>MXI</Text>
          <View style={[styles.changeBadge, { backgroundColor: isPositive ? '#00ff8820' : '#ff004420' }]}>
            <IconSymbol
              ios_icon_name={isPositive ? 'arrow.up' : 'arrow.down'}
              android_material_icon_name={isPositive ? 'arrow_upward' : 'arrow_downward'}
              size={12}
              color={isPositive ? '#00ff88' : '#ff0044'}
            />
            <Text style={[styles.changeText, { color: isPositive ? '#00ff88' : '#ff0044' }]}>
              {isPositive ? '+' : ''}{change.toFixed(2)} ({percentage >= 0 ? '+' : ''}{percentage.toFixed(2)}%)
            </Text>
          </View>
        </View>
      </View>

      {/* Info Box */}
      <View style={styles.infoBox}>
        <IconSymbol 
          ios_icon_name="info.circle.fill" 
          android_material_icon_name="info" 
          size={20} 
          color="#00ff88" 
        />
        <Text style={styles.infoText}>
          Este gráfico muestra tu balance TOTAL de MXI incluyendo: compras directas, comisiones, torneos y vesting. 
          El vesting se genera ÚNICAMENTE de los MXI comprados directamente.
        </Text>
      </View>

      {/* Time Range Selector */}
      <View style={styles.timeRangeSelector}>
        {(['5min', '15min', '1h', '24h', '7d'] as TimeRange[]).map((range) => (
          <TouchableOpacity
            key={range}
            style={[
              styles.timeRangeButton,
              timeRange === range && styles.timeRangeButtonActive,
            ]}
            onPress={() => setTimeRange(range)}
          >
            <Text
              style={[
                styles.timeRangeText,
                timeRange === range && styles.timeRangeTextActive,
              ]}
            >
              {range}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chart */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartScroll}>
        <View style={styles.chartContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00ff88" />
              <Text style={styles.loadingText}>Cargando gráfico...</Text>
            </View>
          ) : (
            renderFuturisticChart()
          )}
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#00ff88' }]} />
          <Text style={styles.legendText}>Comprados</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#A855F7' }]} />
          <Text style={styles.legendText}>Comisiones</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#ffdd00' }]} />
          <Text style={styles.legendText}>Torneos</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#6366F1' }]} />
          <Text style={styles.legendText}>Vesting</Text>
        </View>
      </View>

      {/* Detailed Breakdown */}
      <View style={styles.breakdownSection}>
        <Text style={styles.breakdownTitle}>📊 Desglose Completo de MXI</Text>
        
        <View style={styles.breakdownGrid}>
          {/* MXI Comprados */}
          <View style={styles.breakdownCard}>
            <View style={styles.breakdownHeader}>
              <View style={[styles.breakdownIcon, { backgroundColor: '#00ff8820' }]}>
                <Text style={{ fontSize: 20 }}>🛒</Text>
              </View>
              <Text style={styles.breakdownLabel}>MXI Comprados</Text>
            </View>
            <Text style={styles.breakdownValue}>
              {currentBreakdown.mxiPurchased.toLocaleString('es-ES', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
            <View style={styles.breakdownBar}>
              <View 
                style={[
                  styles.breakdownBarFill, 
                  { 
                    width: `${currentTotal > 0 ? (currentBreakdown.mxiPurchased / currentTotal) * 100 : 0}%`,
                    backgroundColor: '#00ff88'
                  }
                ]} 
              />
            </View>
            <Text style={styles.breakdownPercentage}>
              {currentTotal > 0 ? ((currentBreakdown.mxiPurchased / currentTotal) * 100).toFixed(1) : '0.0'}%
            </Text>
          </View>

          {/* MXI Comisiones */}
          <View style={styles.breakdownCard}>
            <View style={styles.breakdownHeader}>
              <View style={[styles.breakdownIcon, { backgroundColor: '#A855F720' }]}>
                <Text style={{ fontSize: 20 }}>💵</Text>
              </View>
              <Text style={styles.breakdownLabel}>MXI Comisiones</Text>
            </View>
            <Text style={styles.breakdownValue}>
              {currentBreakdown.mxiCommissions.toLocaleString('es-ES', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
            <View style={styles.breakdownBar}>
              <View 
                style={[
                  styles.breakdownBarFill, 
                  { 
                    width: `${currentTotal > 0 ? (currentBreakdown.mxiCommissions / currentTotal) * 100 : 0}%`,
                    backgroundColor: '#A855F7'
                  }
                ]} 
              />
            </View>
            <Text style={styles.breakdownPercentage}>
              {currentTotal > 0 ? ((currentBreakdown.mxiCommissions / currentTotal) * 100).toFixed(1) : '0.0'}%
            </Text>
          </View>

          {/* MXI Torneos */}
          <View style={styles.breakdownCard}>
            <View style={styles.breakdownHeader}>
              <View style={[styles.breakdownIcon, { backgroundColor: '#ffdd0020' }]}>
                <Text style={{ fontSize: 20 }}>🏆</Text>
              </View>
              <Text style={styles.breakdownLabel}>MXI Torneos</Text>
            </View>
            <Text style={styles.breakdownValue}>
              {currentBreakdown.mxiTournaments.toLocaleString('es-ES', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
            <View style={styles.breakdownBar}>
              <View 
                style={[
                  styles.breakdownBarFill, 
                  { 
                    width: `${currentTotal > 0 ? (currentBreakdown.mxiTournaments / currentTotal) * 100 : 0}%`,
                    backgroundColor: '#ffdd00'
                  }
                ]} 
              />
            </View>
            <Text style={styles.breakdownPercentage}>
              {currentTotal > 0 ? ((currentBreakdown.mxiTournaments / currentTotal) * 100).toFixed(1) : '0.0'}%
            </Text>
          </View>

          {/* MXI Vesting - Real-time updates */}
          <View style={styles.breakdownCard}>
            <View style={styles.breakdownHeader}>
              <View style={[styles.breakdownIcon, { backgroundColor: '#6366F120' }]}>
                <Text style={{ fontSize: 20 }}>🔒</Text>
              </View>
              <Text style={styles.breakdownLabel}>Vesting (Tiempo Real)</Text>
            </View>
            <Text style={styles.breakdownValue}>
              {currentBreakdown.mxiVesting.toLocaleString('es-ES', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 6,
              })}
            </Text>
            <View style={styles.breakdownBar}>
              <View 
                style={[
                  styles.breakdownBarFill, 
                  { 
                    width: `${currentTotal > 0 ? (currentBreakdown.mxiVesting / currentTotal) * 100 : 0}%`,
                    backgroundColor: '#6366F1'
                  }
                ]} 
              />
            </View>
            <Text style={styles.breakdownPercentage}>
              {currentTotal > 0 ? ((currentBreakdown.mxiVesting / currentTotal) * 100).toFixed(1) : '0.0'}%
            </Text>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Actualizando cada segundo</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 20, 20, 0.95)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(0, 255, 136, 0.3)',
    shadowColor: '#00ff88',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#00ff88',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 255, 136, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 12,
    color: '#ffdd00',
    fontWeight: '600',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  currentValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#00ff88',
    fontFamily: 'monospace',
    textShadowColor: 'rgba(0, 255, 136, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  currentUnit: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffdd00',
    marginBottom: 6,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.3)',
  },
  changeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.3)',
  },
  infoText: {
    flex: 1,
    fontSize: 11,
    color: '#00ff88',
    lineHeight: 16,
    fontWeight: '600',
  },
  timeRangeSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.2)',
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  timeRangeButtonActive: {
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
    borderWidth: 1,
    borderColor: '#00ff88',
  },
  timeRangeText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(0, 255, 136, 0.5)',
  },
  timeRangeTextActive: {
    color: '#00ff88',
    fontWeight: '700',
  },
  chartScroll: {
    marginBottom: 16,
  },
  chartContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.2)',
  },
  emptyChart: {
    width: CHART_WIDTH,
    height: CHART_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#00ff88',
  },
  loadingContainer: {
    width: CHART_WIDTH,
    height: CHART_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#00ff88',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.2)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 11,
    color: '#00ff88',
    fontWeight: '600',
  },
  breakdownSection: {
    marginBottom: 16,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00ff88',
    marginBottom: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 255, 136, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  breakdownGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  breakdownCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.2)',
  },
  breakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  breakdownIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breakdownLabel: {
    fontSize: 11,
    color: '#ffdd00',
    fontWeight: '600',
    flex: 1,
  },
  breakdownValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#00ff88',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  breakdownBar: {
    height: 6,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  breakdownBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  breakdownPercentage: {
    fontSize: 10,
    color: '#ffdd00',
    textAlign: 'right',
    fontWeight: '700',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.3)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00ff88',
    shadowColor: '#00ff88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  liveText: {
    fontSize: 9,
    color: '#00ff88',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
