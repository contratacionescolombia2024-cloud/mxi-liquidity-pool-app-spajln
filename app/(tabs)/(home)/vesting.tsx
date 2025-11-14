
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
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import i18n from '@/constants/i18n';

interface YieldProjection {
  period: string;
  mxiYield: number;
}

export default function VestingScreen() {
  const router = useRouter();
  const { user, getCurrentYield, claimYield, getPhaseInfo } = useAuth();
  const [currentYield, setCurrentYield] = useState(0);
  const [unifying, setUnifying] = useState(false);
  const [calculatorAmount, setCalculatorAmount] = useState('');
  const [currentPrice, setCurrentPrice] = useState(0.30);
  const [showCalculator, setShowCalculator] = useState(false);
  const [projections, setProjections] = useState<YieldProjection[]>([]);
  const [showProjections, setShowProjections] = useState(false);

  useEffect(() => {
    loadCurrentPrice();
  }, []);

  useEffect(() => {
    if (!user || user.yieldRatePerMinute === 0) {
      setCurrentYield(0);
      return;
    }

    // Update yield display every second for real-time counter
    const interval = setInterval(() => {
      const yield_amount = getCurrentYield();
      setCurrentYield(yield_amount);
    }, 1000);

    return () => clearInterval(interval);
  }, [user, getCurrentYield]);

  const loadCurrentPrice = async () => {
    const phaseInfo = await getPhaseInfo();
    if (phaseInfo) {
      setCurrentPrice(phaseInfo.currentPriceUsdt);
    }
  };

  const handleUnifyBalance = async () => {
    if (!user) return;

    // Check if user has 10 active referrals
    if (user.activeReferrals < 10) {
      Alert.alert(
        i18n.t('vesting.requirementsNotMet'),
        i18n.t('vesting.requirementsMessage', {
          current: user.activeReferrals,
          needed: 10 - user.activeReferrals,
        }),
        [{ text: i18n.t('vesting.understood') }]
      );
      return;
    }

    // Check if there's yield to claim
    const totalYield = user.accumulatedYield + currentYield;
    if (totalYield < 0.000001) {
      Alert.alert(
        i18n.t('vesting.noBalanceToUnify'),
        i18n.t('vesting.noBalanceMessage'),
        [{ text: i18n.t('vesting.ok') }]
      );
      return;
    }

    // Confirm unification
    Alert.alert(
      i18n.t('vesting.unifyConfirmTitle'),
      i18n.t('vesting.unifyConfirmMessage', { amount: totalYield.toFixed(8) }),
      [
        { text: i18n.t('vesting.cancel'), style: 'cancel' },
        {
          text: i18n.t('vesting.unify'),
          onPress: async () => {
            setUnifying(true);
            const result = await claimYield();
            setUnifying(false);

            if (result.success) {
              Alert.alert(
                i18n.t('vesting.balanceUnified'),
                i18n.t('vesting.balanceUnifiedMessage', {
                  amount: result.yieldEarned?.toFixed(8),
                }),
                [{ text: i18n.t('vesting.excellent') }]
              );
              setCurrentYield(0);
            } else {
              Alert.alert(
                i18n.t('vesting.error'),
                result.error || i18n.t('vesting.couldNotUnify')
              );
            }
          },
        },
      ]
    );
  };

  const calculateYield = () => {
    const amount = parseFloat(calculatorAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert(
        i18n.t('vesting.invalidAmount'),
        i18n.t('vesting.enterValidAmount')
      );
      return;
    }

    // Calculate MXI tokens from USDT
    const mxiTokens = amount / currentPrice;

    // Calculate yield rate (0.005% per hour)
    const hourlyRate = 0.005 / 100;

    const yield24h = mxiTokens * hourlyRate * 24;
    const yield7d = mxiTokens * hourlyRate * 24 * 7;
    const yield15d = mxiTokens * hourlyRate * 24 * 15;
    const yield30d = mxiTokens * hourlyRate * 24 * 30;

    setProjections([
      { period: i18n.t('vesting.per24Hours'), mxiYield: yield24h },
      { period: i18n.t('vesting.per7Days'), mxiYield: yield7d },
      { period: i18n.t('vesting.per15Days'), mxiYield: yield15d },
      { period: i18n.t('vesting.per30Days'), mxiYield: yield30d },
    ]);
    setShowProjections(true);
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const yieldPerSecond = user.yieldRatePerMinute / 60;
  const totalYield = user.accumulatedYield + currentYield;
  const canUnify = user.activeReferrals >= 10;

  // Calculate vesting amounts
  const mxiInVesting = (user.mxiPurchasedDirectly || 0) + (user.mxiFromUnifiedCommissions || 0);
  const vestingPercentage = user.mxiBalance > 0 ? (mxiInVesting / user.mxiBalance) * 100 : 0;

  // Calculate utility percentage (0.005% per hour)
  const utilityPercentage = 0.005;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="chevron_left"
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
          <Text style={styles.title}>{i18n.t('vesting.title')}</Text>
          <Text style={styles.subtitle}>{i18n.t('vesting.subtitle')}</Text>
        </View>

        {/* Main Vesting Balance Card */}
        <View style={styles.mainCard}>
          <View style={styles.mainCardHeader}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconEmoji}>⛏️</Text>
            </View>
            <View style={styles.mainCardHeaderText}>
              <Text style={styles.mainCardTitle}>{i18n.t('vesting.totalInVesting')}</Text>
              <Text style={styles.mainCardSubtitle}>
                {i18n.t('vesting.generatingPerHour', { rate: utilityPercentage })}
              </Text>
            </View>
          </View>
          <Text style={styles.mainCardValue}>{mxiInVesting.toFixed(8)}</Text>
          <Text style={styles.mainCardUnit}>{i18n.t('vesting.mxiUnit')}</Text>
          <View style={styles.percentageContainer}>
            <Text style={styles.percentageText}>
              {i18n.t('vesting.ofTotalBalance', { percentage: vestingPercentage.toFixed(2) })}
            </Text>
          </View>
        </View>

        {/* Utility Percentage Card */}
        <View style={styles.utilityCard}>
          <View style={styles.utilityHeader}>
            <IconSymbol
              ios_icon_name="percent"
              android_material_icon_name="percent"
              size={24}
              color={colors.accent}
            />
            <Text style={styles.utilityTitle}>{i18n.t('vesting.utilityPercentage')}</Text>
          </View>
          <View style={styles.utilityContent}>
            <View style={styles.utilityRow}>
              <Text style={styles.utilityLabel}>{i18n.t('vesting.perHour')}</Text>
              <Text style={styles.utilityValue}>{utilityPercentage}%</Text>
            </View>
            <View style={styles.utilityDivider} />
            <View style={styles.utilityRow}>
              <Text style={styles.utilityLabel}>{i18n.t('vesting.perDay')}</Text>
              <Text style={styles.utilityValue}>{(utilityPercentage * 24).toFixed(3)}%</Text>
            </View>
            <View style={styles.utilityDivider} />
            <View style={styles.utilityRow}>
              <Text style={styles.utilityLabel}>{i18n.t('vesting.perMonth')}</Text>
              <Text style={styles.utilityValue}>
                {(utilityPercentage * 24 * 30).toFixed(2)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Vesting Calculator */}
        <View style={styles.calculatorCard}>
          <TouchableOpacity
            style={styles.calculatorHeader}
            onPress={() => setShowCalculator(!showCalculator)}
          >
            <View style={styles.calculatorHeaderLeft}>
              <IconSymbol
                ios_icon_name="function"
                android_material_icon_name="calculate"
                size={24}
                color={colors.success}
              />
              <Text style={styles.calculatorTitle}>{i18n.t('vesting.calculator')}</Text>
            </View>
            <IconSymbol
              ios_icon_name={showCalculator ? 'chevron.up' : 'chevron.down'}
              android_material_icon_name={showCalculator ? 'expand_less' : 'expand_more'}
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>

          {showCalculator && (
            <React.Fragment>
              <Text style={styles.calculatorDescription}>
                {i18n.t('vesting.calculatorDescription')}
              </Text>

              <View style={styles.calculatorInputContainer}>
                <Text style={styles.calculatorInputLabel}>
                  {i18n.t('vesting.depositAmount')}
                </Text>
                <TextInput
                  style={styles.calculatorInput}
                  placeholder={i18n.t('vesting.enterAmount')}
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="decimal-pad"
                  value={calculatorAmount}
                  onChangeText={setCalculatorAmount}
                />
              </View>

              <TouchableOpacity style={styles.calculateButton} onPress={calculateYield}>
                <IconSymbol
                  ios_icon_name="chart.bar.fill"
                  android_material_icon_name="bar_chart"
                  size={20}
                  color="#fff"
                />
                <Text style={styles.calculateButtonText}>{i18n.t('vesting.calculate')}</Text>
              </TouchableOpacity>

              {showProjections && projections.length > 0 && (
                <View style={styles.projectionsContainer}>
                  <Text style={styles.projectionsTitle}>{i18n.t('vesting.projectedYield')}</Text>
                  <View style={styles.projectionsInfo}>
                    <Text style={styles.projectionsInfoText}>
                      {i18n.t('vesting.depositAmount')}: {calculatorAmount} USDT
                    </Text>
                    <Text style={styles.projectionsInfoText}>
                      MXI: {(parseFloat(calculatorAmount) / currentPrice).toFixed(2)}
                    </Text>
                  </View>
                  {projections.map((projection, index) => (
                    <View key={index} style={styles.projectionRow}>
                      <View style={styles.projectionLabelContainer}>
                        <IconSymbol
                          ios_icon_name="clock.fill"
                          android_material_icon_name="schedule"
                          size={18}
                          color={colors.success}
                        />
                        <Text style={styles.projectionLabel}>{projection.period}:</Text>
                      </View>
                      <Text style={styles.projectionValue}>
                        {projection.mxiYield.toFixed(8)} MXI
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.calculatorInfo}>
                <IconSymbol
                  ios_icon_name="info.circle"
                  android_material_icon_name="info"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text style={styles.calculatorInfoText}>
                  Current MXI Price: ${currentPrice.toFixed(2)} USDT
                </Text>
              </View>
            </React.Fragment>
          )}
        </View>

        {/* MXI Used Breakdown */}
        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>{i18n.t('vesting.mxiUsedBreakdown')}</Text>
          <Text style={styles.breakdownDescription}>
            {i18n.t('vesting.breakdownDescription')}
          </Text>

          <View style={styles.breakdownSection}>
            <View style={styles.breakdownRow}>
              <View style={styles.breakdownLabelContainer}>
                <IconSymbol
                  ios_icon_name="cart.fill"
                  android_material_icon_name="shopping_cart"
                  size={20}
                  color={colors.primary}
                />
                <Text style={styles.breakdownLabel}>
                  {i18n.t('vesting.purchasedDirectly')}
                </Text>
              </View>
              <Text style={styles.breakdownValue}>
                {(user.mxiPurchasedDirectly || 0).toFixed(8)}
              </Text>
            </View>

            <View style={styles.breakdownDivider} />

            <View style={styles.breakdownRow}>
              <View style={styles.breakdownLabelContainer}>
                <IconSymbol
                  ios_icon_name="person.3.fill"
                  android_material_icon_name="groups"
                  size={20}
                  color={colors.secondary}
                />
                <Text style={styles.breakdownLabel}>{i18n.t('vesting.fromReferrals')}</Text>
              </View>
              <Text style={styles.breakdownValue}>
                {(user.mxiFromUnifiedCommissions || 0).toFixed(8)}
              </Text>
            </View>

            <View style={styles.breakdownDivider} />

            <View style={styles.breakdownRow}>
              <View style={styles.breakdownLabelContainer}>
                <IconSymbol
                  ios_icon_name="sum"
                  android_material_icon_name="functions"
                  size={20}
                  color={colors.accent}
                />
                <Text style={[styles.breakdownLabel, styles.breakdownLabelTotal]}>
                  {i18n.t('vesting.totalInVestingLabel')}
                </Text>
              </View>
              <Text style={[styles.breakdownValue, styles.breakdownValueTotal]}>
                {mxiInVesting.toFixed(8)}
              </Text>
            </View>
          </View>
        </View>

        {/* Accumulated Yield Card */}
        <View style={styles.yieldCard}>
          <View style={styles.yieldHeader}>
            <IconSymbol
              ios_icon_name="chart.line.uptrend.xyaxis"
              android_material_icon_name="trending_up"
              size={24}
              color={colors.success}
            />
            <Text style={styles.yieldTitle}>{i18n.t('vesting.accumulatedYield')}</Text>
          </View>
          <Text style={styles.yieldValue}>{totalYield.toFixed(8)}</Text>
          <Text style={styles.yieldUnit}>{i18n.t('vesting.mxiUnit')}</Text>

          <View style={styles.yieldBreakdown}>
            <View style={styles.yieldBreakdownRow}>
              <Text style={styles.yieldBreakdownLabel}>{i18n.t('vesting.currentSession')}</Text>
              <Text style={styles.yieldBreakdownValue}>{currentYield.toFixed(8)} MXI</Text>
            </View>
            <View style={styles.yieldBreakdownRow}>
              <Text style={styles.yieldBreakdownLabel}>
                {i18n.t('vesting.previouslyAccumulated')}
              </Text>
              <Text style={styles.yieldBreakdownValue}>
                {user.accumulatedYield.toFixed(8)} MXI
              </Text>
            </View>
          </View>
        </View>

        {/* Generation Rates */}
        <View style={styles.ratesCard}>
          <Text style={styles.ratesTitle}>{i18n.t('vesting.generationRates')}</Text>
          <View style={styles.ratesGrid}>
            <View style={styles.rateItem}>
              <Text style={styles.rateLabel}>{i18n.t('vesting.perSecond')}</Text>
              <Text style={styles.rateValue}>{yieldPerSecond.toFixed(8)}</Text>
              <Text style={styles.rateUnit}>{i18n.t('vesting.mxiUnit')}</Text>
            </View>
            <View style={styles.rateItem}>
              <Text style={styles.rateLabel}>{i18n.t('vesting.perMinute')}</Text>
              <Text style={styles.rateValue}>{user.yieldRatePerMinute.toFixed(8)}</Text>
              <Text style={styles.rateUnit}>{i18n.t('vesting.mxiUnit')}</Text>
            </View>
            <View style={styles.rateItem}>
              <Text style={styles.rateLabel}>{i18n.t('vesting.perHour')}</Text>
              <Text style={styles.rateValue}>{(user.yieldRatePerMinute * 60).toFixed(6)}</Text>
              <Text style={styles.rateUnit}>{i18n.t('vesting.mxiUnit')}</Text>
            </View>
            <View style={styles.rateItem}>
              <Text style={styles.rateLabel}>{i18n.t('vesting.perDay')}</Text>
              <Text style={styles.rateValue}>
                {(user.yieldRatePerMinute * 60 * 24).toFixed(4)}
              </Text>
              <Text style={styles.rateUnit}>{i18n.t('vesting.mxiUnit')}</Text>
            </View>
          </View>
        </View>

        {/* Unify Balance Button */}
        <TouchableOpacity
          style={[
            styles.unifyButton,
            !canUnify && styles.unifyButtonDisabled,
            unifying && styles.unifyButtonProcessing,
          ]}
          onPress={handleUnifyBalance}
          disabled={!canUnify || unifying || totalYield < 0.000001}
        >
          {unifying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <React.Fragment>
              <IconSymbol
                ios_icon_name={canUnify ? 'checkmark.circle.fill' : 'lock.fill'}
                android_material_icon_name={canUnify ? 'check_circle' : 'lock'}
                size={20}
                color={canUnify ? '#fff' : colors.textSecondary}
              />
              <Text
                style={[styles.unifyButtonText, !canUnify && styles.unifyButtonTextDisabled]}
              >
                {canUnify
                  ? i18n.t('vesting.unifyBalance')
                  : i18n.t('vesting.unifyBalanceLocked', { current: user.activeReferrals })}
              </Text>
            </React.Fragment>
          )}
        </TouchableOpacity>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <IconSymbol
            ios_icon_name="info.circle.fill"
            android_material_icon_name="info"
            size={20}
            color={colors.primary}
          />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>{i18n.t('vesting.infoTitle')}</Text>
            <Text style={styles.infoText}>
              {i18n.t('vesting.infoText', { rate: utilityPercentage })}
            </Text>
          </View>
        </View>

        {/* Balance Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{i18n.t('vesting.balanceSummary')}</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{i18n.t('vesting.totalMxiBalance')}</Text>
            <Text style={styles.summaryValue}>{user.mxiBalance.toFixed(2)} MXI</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{i18n.t('vesting.mxiInVesting')}</Text>
            <Text style={[styles.summaryValue, styles.summaryValueHighlight]}>
              {mxiInVesting.toFixed(2)} MXI ({vestingPercentage.toFixed(1)}%)
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{i18n.t('vesting.accumulatedYieldLabel')}</Text>
            <Text style={[styles.summaryValue, styles.summaryValueSuccess]}>
              {totalYield.toFixed(8)} MXI
            </Text>
          </View>
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
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  mainCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  mainCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${colors.primary}30`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  iconEmoji: {
    fontSize: 32,
  },
  mainCardHeaderText: {
    flex: 1,
  },
  mainCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  mainCardSubtitle: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  mainCardValue: {
    fontSize: 42,
    fontWeight: '700',
    color: colors.primary,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  mainCardUnit: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  percentageContainer: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  utilityCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  utilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  utilityTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  utilityContent: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
  },
  utilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  utilityLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  utilityValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accent,
    fontFamily: 'monospace',
  },
  utilityDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  calculatorCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.success,
  },
  calculatorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calculatorHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  calculatorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  calculatorDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 12,
    marginBottom: 16,
    lineHeight: 18,
  },
  calculatorInputContainer: {
    marginBottom: 16,
  },
  calculatorInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  calculatorInput: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  calculateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  projectionsContainer: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.success,
  },
  projectionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  projectionsInfo: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  projectionsInfoText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  projectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  projectionLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  projectionLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  projectionValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.success,
    fontFamily: 'monospace',
  },
  calculatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  calculatorInfoText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  breakdownCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  breakdownDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 16,
  },
  breakdownSection: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  breakdownLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  breakdownLabelTotal: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'monospace',
  },
  breakdownValueTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  yieldCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.success,
  },
  yieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  yieldTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  yieldValue: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.success,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  yieldUnit: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  yieldBreakdown: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  yieldBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  yieldBreakdownLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  yieldBreakdownValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'monospace',
  },
  ratesCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ratesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  ratesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
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
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  rateUnit: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  unifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  unifyButtonDisabled: {
    backgroundColor: colors.border,
    shadowOpacity: 0,
  },
  unifyButtonProcessing: {
    backgroundColor: colors.textSecondary,
    shadowOpacity: 0,
  },
  unifyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  unifyButtonTextDisabled: {
    color: colors.textSecondary,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  summaryValueHighlight: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  summaryValueSuccess: {
    color: colors.success,
    fontSize: 15,
    fontWeight: '700',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
});
