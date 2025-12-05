
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, Platform, ScrollView } from 'react-native';
import { Svg, Rect, Line, Text as SvgText, G, Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const CHART_HEIGHT = 250; // Reduced from 320
const PADDING = { top: 20, right: 10, bottom: 50, left: 50 }; // Reduced bottom padding
const MIN_CHART_WIDTH = Dimensions.get('window').width - 80;

interface BalanceDataPoint {
  timestamp: Date;
  mxiPurchased: number;
  mxiCommissions: number;
  mxiTournaments: number;
  mxiVesting: number;
  totalBalance: number;
  transactionType?: string;
  transactionAmount?: number;
}

export function TotalMXIBalanceChart() {
  const { user } = useAuth();
  const { t } = useLanguage();
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
      // Refresh data every 30 seconds to catch new transactions
      const interval = setInterval(loadBalanceData, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadBalanceData = async () => {
    try {
      setLoading(true);

      // Fetch balance history from database - limit to last 30 days for better visualization
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: historyData, error } = await supabase
        .from('mxi_balance_history')
        .select('*')
        .eq('user_id', user?.id)
        .gte('timestamp', thirtyDaysAgo.toISOString())
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Error loading balance history:', error);
        generateInitialDataPoint();
        return;
      }

      if (!historyData || historyData.length === 0) {
        generateInitialDataPoint();
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
        transactionType: item.transaction_type,
        transactionAmount: parseFloat(item.transaction_amount || '0'),
      }));

      setBalanceData(transformedData);
    } catch (error) {
      console.error('Error in loadBalanceData:', error);
      generateInitialDataPoint();
    } finally {
      setLoading(false);
    }
  };

  const generateInitialDataPoint = () => {
    if (!user) return;

    const now = new Date();
    const mxiPurchased = user.mxiPurchasedDirectly || 0;
    const mxiCommissions = user.mxiFromUnifiedCommissions || 0;
    const mxiTournaments = user.mxiFromChallenges || 0;
    const mxiVesting = currentVesting || 0;

    const initialPoint: BalanceDataPoint = {
      timestamp: now,
      mxiPurchased,
      mxiCommissions,
      mxiTournaments,
      mxiVesting,
      totalBalance: mxiPurchased + mxiCommissions + mxiTournaments + mxiVesting,
    };

    setBalanceData([initialPoint]);
  };

  const renderDynamicChart = () => {
    if (balanceData.length === 0) {
      return (
        <View style={styles.emptyChart}>
          <Text style={styles.emptyText}>{t('noBalanceHistory')}</Text>
        </View>
      );
    }

    // Calculate total MXI from all sources
    const currentTotal = balanceData.length > 0 
      ? balanceData[balanceData.length - 1].totalBalance 
      : 0;

    // Find min and max values for better scaling
    const allBalances = balanceData.map(d => d.totalBalance);
    const minBalance = Math.min(...allBalances);
    const maxBalance = Math.max(...allBalances);
    
    // Add 10% padding to min/max for better visualization
    const range = maxBalance - minBalance;
    const padding = range * 0.1;
    const minY = Math.max(0, minBalance - padding);
    const maxY = maxBalance + padding;

    const chartWidth = MIN_CHART_WIDTH - PADDING.left - PADDING.right;
    const chartHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;

    // Y-axis scale - dynamic based on actual data
    const yScale = (value: number) => {
      if (maxY === minY) return PADDING.top + chartHeight / 2;
      return PADDING.top + chartHeight - ((value - minY) / (maxY - minY)) * chartHeight;
    };

    // X-axis scale - evenly distribute points across chart width
    const xScale = (index: number) => {
      if (balanceData.length === 1) {
        return PADDING.left + chartWidth / 2;
      }
      return PADDING.left + (index / (balanceData.length - 1)) * chartWidth;
    };

    // Create smooth line path that connects all balance change points
    const createSmoothPath = () => {
      if (balanceData.length === 0) return '';
      
      let path = '';
      
      balanceData.forEach((point, index) => {
        const x = xScale(index);
        const y = yScale(point.totalBalance);
        
        if (index === 0) {
          // Start from first point
          path += `M ${x} ${y}`;
        } else {
          // Smooth curve to next point
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
      const firstX = xScale(0);
      const baseY = yScale(minY);
      path += ` L ${lastX} ${baseY}`;
      path += ` L ${firstX} ${baseY}`;
      path += ' Z';
      
      return path;
    };

    // Format timestamp for display - show only date
    const formatTimestamp = (date: Date) => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      return `${day}/${month}`;
    };

    // Show only first, middle, and last labels to avoid crowding
    const getVisibleLabels = () => {
      if (balanceData.length <= 3) return balanceData.map((_, i) => i);
      return [0, Math.floor(balanceData.length / 2), balanceData.length - 1];
    };

    const visibleLabels = getVisibleLabels();

    return (
      <View>
        <Svg width={MIN_CHART_WIDTH} height={CHART_HEIGHT}>
          <Defs>
            {/* Green gradient for main line */}
            <LinearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#00ff88" stopOpacity="1" />
              <Stop offset="100%" stopColor="#00cc66" stopOpacity="1" />
            </LinearGradient>
            
            {/* Area fill gradient */}
            <LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#00ff88" stopOpacity="0.3" />
              <Stop offset="50%" stopColor="#00cc66" stopOpacity="0.15" />
              <Stop offset="100%" stopColor="#008844" stopOpacity="0.05" />
            </LinearGradient>
          </Defs>

          {/* Grid lines - Y axis (only 3 lines) */}
          {[0, 0.5, 1].map((ratio, i) => {
            const y = PADDING.top + chartHeight * ratio;
            const value = maxY - ((maxY - minY) * ratio);
            return (
              <G key={`grid-y-${i}`}>
                <Line
                  x1={PADDING.left}
                  y1={y}
                  x2={MIN_CHART_WIDTH - PADDING.right}
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
                  {value.toFixed(0)}
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

          {/* Main trend line */}
          <Path
            d={createSmoothPath()}
            stroke="url(#greenGradient)"
            strokeWidth="3"
            fill="none"
            opacity={1}
          />

          {/* Data points - show only first and last */}
          {[0, balanceData.length - 1].map((index) => {
            if (index >= balanceData.length) return null;
            const x = xScale(index);
            const y = yScale(balanceData[index].totalBalance);
            
            return (
              <G key={`point-${index}`}>
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

          {/* X-axis labels - only show selected labels */}
          {visibleLabels.map((index) => {
            const x = xScale(index);
            const formattedTime = formatTimestamp(balanceData[index].timestamp);
            
            return (
              <G key={`x-label-${index}`}>
                <SvgText
                  x={x}
                  y={CHART_HEIGHT - PADDING.bottom + 15}
                  fill="#00ff88"
                  fontSize="10"
                  textAnchor="middle"
                  fontWeight="600"
                >
                  {formattedTime}
                </SvgText>
              </G>
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
            MXI
          </SvgText>
        </Svg>
      </View>
    );
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

  // Calculate the TOTAL MXI balance from ALL sources
  const currentTotal = (user?.mxiPurchasedDirectly || 0) + 
                       (user?.mxiFromUnifiedCommissions || 0) + 
                       (user?.mxiFromChallenges || 0) + 
                       currentVesting;

  const currentBreakdown = {
    mxiPurchased: user?.mxiPurchasedDirectly || 0,
    mxiCommissions: user?.mxiFromUnifiedCommissions || 0,
    mxiTournaments: user?.mxiFromChallenges || 0,
    mxiVesting: currentVesting,
    totalBalance: currentTotal,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>{t('totalMXIBalance')}</Text>
          <Text style={styles.subtitle}>{t('allSourcesIncluded')}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.currentValue}>
            {currentTotal.toLocaleString('es-ES', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
          <Text style={styles.currentUnit}>MXI</Text>
          {balanceData.length >= 2 && (
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
          )}
        </View>
      </View>

      {/* Chart */}
      <View style={styles.chartContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00ff88" />
            <Text style={styles.loadingText}>{t('loadingChart')}</Text>
          </View>
        ) : (
          renderDynamicChart()
        )}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#00ff88' }]} />
          <Text style={styles.legendText}>{t('purchased')}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#A855F7' }]} />
          <Text style={styles.legendText}>{t('commissions')}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#ffdd00' }]} />
          <Text style={styles.legendText}>{t('tournaments')}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#6366F1' }]} />
          <Text style={styles.legendText}>{t('vesting')}</Text>
        </View>
      </View>

      {/* Detailed Breakdown */}
      <View style={styles.breakdownSection}>
        <Text style={styles.breakdownTitle}>{t('completeBreakdown')}</Text>
        
        <View style={styles.breakdownGrid}>
          {/* MXI Comprados */}
          <View style={styles.breakdownCard}>
            <View style={styles.breakdownHeader}>
              <View style={[styles.breakdownIcon, { backgroundColor: '#00ff8820' }]}>
                <Text style={{ fontSize: 20 }}>🛒</Text>
              </View>
              <Text style={styles.breakdownLabel}>{t('mxiPurchased')}</Text>
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
              <Text style={styles.breakdownLabel}>{t('mxiCommissions')}</Text>
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
              <Text style={styles.breakdownLabel}>{t('mxiTournaments')}</Text>
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
              <Text style={styles.breakdownLabel}>{t('vestingRealTimeLabel')}</Text>
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
              <Text style={styles.liveText}>{t('updatingEverySecond')}</Text>
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
  chartContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.2)',
    marginBottom: 16,
  },
  emptyChart: {
    width: MIN_CHART_WIDTH,
    height: CHART_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#00ff88',
  },
  loadingContainer: {
    width: MIN_CHART_WIDTH,
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
