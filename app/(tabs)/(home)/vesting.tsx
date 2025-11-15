
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
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
  const { user, getCurrentYield } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentYield, setCurrentYield] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [projections, setProjections] = useState<YieldProjection[]>([]);

  useEffect(() => {
    if (user && getCurrentYield) {
      const yield_value = getCurrentYield();
      setCurrentYield(yield_value);
    }
  }, [user, getCurrentYield]);

  useEffect(() => {
    loadCurrentPrice();
  }, []);

  const loadCurrentPrice = async () => {
    setCurrentPrice(0.012);
  };

  const handleUnifyBalance = () => {
    router.push('/(tabs)/(home)/referrals');
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
        period: 'Daily',
        mxiYield: dailyYield,
        usdtValue: dailyYield * currentPrice,
      },
      {
        period: 'Weekly',
        mxiYield: weeklyYield,
        usdtValue: weeklyYield * currentPrice,
      },
      {
        period: 'Monthly',
        mxiYield: monthlyYield,
        usdtValue: monthlyYield * currentPrice,
      },
      {
        period: 'Yearly',
        mxiYield: yearlyYield,
        usdtValue: yearlyYield * currentPrice,
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol ios_icon_name="chevron.left" android_material_icon_name="arrow_back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vesting & Yield</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Current Yield Card */}
        <View style={[commonStyles.card, styles.yieldCard]}>
          <View style={styles.yieldHeader}>
            <IconSymbol 
              ios_icon_name="chart.line.uptrend.xyaxis" 
              android_material_icon_name="trending_up" 
              size={32} 
              color={colors.primary} 
            />
            <Text style={styles.yieldTitle}>Current Yield</Text>
          </View>
          <Text style={styles.yieldAmount}>{currentYield.toFixed(6)} MXI</Text>
          <Text style={styles.yieldSubtext}>
            ≈ ${(currentYield * currentPrice).toFixed(4)} USDT
          </Text>
        </View>

        {/* Yield Rate Card */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Your Yield Rate</Text>
          <View style={styles.rateContainer}>
            <View style={styles.rateItem}>
              <Text style={styles.rateValue}>
                {user?.yieldRatePerMinute.toFixed(6) || '0.000000'}
              </Text>
              <Text style={styles.rateLabel}>MXI per minute</Text>
            </View>
          </View>
          <Text style={styles.infoText}>
            Your yield is generated based on your USDT contribution. The more you contribute, the higher your yield rate.
          </Text>
        </View>

        {/* Projections Card */}
        <View style={commonStyles.card}>
          <View style={styles.projectionHeader}>
            <Text style={styles.sectionTitle}>Yield Projections</Text>
            <TouchableOpacity onPress={calculateYield}>
              <IconSymbol 
                ios_icon_name="arrow.clockwise" 
                android_material_icon_name="refresh" 
                size={20} 
                color={colors.primary} 
              />
            </TouchableOpacity>
          </View>

          {projections.length > 0 ? (
            <View style={styles.projectionsList}>
              {projections.map((projection, index) => (
                <View key={index} style={styles.projectionItem}>
                  <Text style={styles.projectionPeriod}>{projection.period}</Text>
                  <View style={styles.projectionValues}>
                    <Text style={styles.projectionMxi}>
                      {projection.mxiYield.toFixed(4)} MXI
                    </Text>
                    <Text style={styles.projectionUsdt}>
                      ≈ ${projection.usdtValue.toFixed(2)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <TouchableOpacity
              style={[commonStyles.button, styles.calculateButton]}
              onPress={calculateYield}
            >
              <Text style={commonStyles.buttonText}>Calculate Projections</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Balance Info Card */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Your Balances</Text>
          <View style={styles.balancesList}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>Total MXI Balance</Text>
              <Text style={styles.balanceValue}>
                {user?.mxiBalance.toFixed(2) || '0.00'} MXI
              </Text>
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>Accumulated Yield</Text>
              <Text style={styles.balanceValue}>
                {user?.accumulatedYield.toFixed(6) || '0.000000'} MXI
              </Text>
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>USDT Contributed</Text>
              <Text style={styles.balanceValue}>
                ${user?.usdtContributed.toFixed(2) || '0.00'}
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <TouchableOpacity
            style={[commonStyles.button, styles.actionButton]}
            onPress={handleUnifyBalance}
          >
            <IconSymbol 
              ios_icon_name="arrow.triangle.merge" 
              android_material_icon_name="merge_type" 
              size={20} 
              color="#fff" 
            />
            <Text style={commonStyles.buttonText}>Unify Commission to MXI</Text>
          </TouchableOpacity>
          <Text style={styles.actionInfo}>
            Convert your available commissions to MXI and add them to your vesting balance.
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
            <Text style={styles.infoTitle}>About Vesting</Text>
          </View>
          <Text style={styles.infoDescription}>
            Your MXI tokens are vested and generate yield over time. The yield rate is calculated based on your total USDT contribution. Yield is accumulated every minute and can be claimed at any time.
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
  },
  yieldSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  rateContainer: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  rateItem: {
    alignItems: 'center',
  },
  rateValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  rateLabel: {
    fontSize: 14,
    color: colors.textSecondary,
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
  calculateButton: {
    marginTop: 8,
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
  },
  balanceDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  actionButton: {
    marginBottom: 12,
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
    lineHeight: 20,
  },
});
