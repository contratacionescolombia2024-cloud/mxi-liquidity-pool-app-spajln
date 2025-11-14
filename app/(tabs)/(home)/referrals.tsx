
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Share,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';

export default function ReferralsScreen() {
  const router = useRouter();
  const { user, withdrawCommission, unifyCommissionToMXI, checkWithdrawalEligibility, getPhaseInfo, claimYield, getCurrentYield } = useAuth();
  const [walletAddress, setWalletAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [unifyAmount, setUnifyAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [unifying, setUnifying] = useState(false);
  const [unifyingVesting, setUnifyingVesting] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(0.30);
  const [currentYield, setCurrentYield] = useState(0);

  useEffect(() => {
    if (user) {
      checkEligibility();
      loadCurrentPrice();
    }
  }, [user]);

  useEffect(() => {
    if (!user || user.yieldRatePerMinute === 0) {
      setCurrentYield(0);
      return;
    }

    // Update yield display every second
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

  const checkEligibility = async () => {
    setCheckingEligibility(true);
    await checkWithdrawalEligibility();
    setCheckingEligibility(false);
  };

  const handleCopyCode = async () => {
    if (user?.referralCode) {
      await Clipboard.setStringAsync(user.referralCode);
      Alert.alert('Success', 'Referral code copied to clipboard!');
    }
  };

  const handleShare = async () => {
    if (!user?.referralCode) return;

    try {
      await Share.share({
        message: `Join the MXI Strategic Pre-Sale and earn MXI tokens! Use my referral code: ${user.referralCode}`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleWithdraw = async () => {
    if (!user) return;

    if (user.kycStatus !== 'approved') {
      Alert.alert(
        'KYC Verification Required',
        'You must complete KYC verification before withdrawing commissions. Would you like to start the KYC process now?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Start KYC', onPress: () => router.push('/(tabs)/(home)/kyc-verification') },
        ]
      );
      return;
    }

    if (!user.canWithdraw) {
      Alert.alert(
        'Withdrawal Not Available',
        `To withdraw commissions, you need:\n\n- At least 5 active referrals (you have ${user.activeReferrals})\n- 10 days since joining\n- KYC verification approved\n\nKeep inviting friends to unlock withdrawals!`
      );
      return;
    }

    const amount = parseFloat(withdrawAmount);

    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (amount > user.commissions.available) {
      Alert.alert('Error', `You only have ${user.commissions.available.toFixed(2)} USDT available`);
      return;
    }

    if (!walletAddress || walletAddress.length < 10) {
      Alert.alert('Error', 'Please enter a valid USDT wallet address');
      return;
    }

    Alert.alert(
      'Confirm Withdrawal',
      `You are about to withdraw ${amount.toFixed(2)} USDT to:\n\n${walletAddress}\n\nThis action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setLoading(true);
            const result = await withdrawCommission(amount, walletAddress);
            setLoading(false);

            if (result.success) {
              Alert.alert(
                'Success',
                'Withdrawal request submitted! Your USDT will be processed within 24-48 hours.',
                [{ text: 'OK', onPress: () => {
                  setWalletAddress('');
                  setWithdrawAmount('');
                }}]
              );
            } else {
              Alert.alert('Error', result.error || 'Failed to process withdrawal');
            }
          },
        },
      ]
    );
  };

  const handleUnifyToMXI = async () => {
    if (!user) return;

    const amount = parseFloat(unifyAmount);

    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (amount > user.commissions.available) {
      Alert.alert('Error', `You only have ${user.commissions.available.toFixed(2)} USDT available`);
      return;
    }

    const mxiAmount = amount / currentPrice;

    Alert.alert(
      '💎 Unificar Comisiones a MXI',
      `¿Deseas convertir ${amount.toFixed(2)} USDT de tus comisiones a ${mxiAmount.toFixed(4)} MXI?\n\n` +
      `Precio actual: ${currentPrice.toFixed(2)} USDT por MXI\n\n` +
      `⚠️ IMPORTANTE: El MXI unificado desde comisiones NO aumentará tu porcentaje de vesting. ` +
      `Solo el MXI comprado directamente y las comisiones de referidos cuentan para el vesting.\n\n` +
      `El MXI unificado se agregará a tu balance principal y estará disponible según las reglas de retiro.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Unificar',
          onPress: async () => {
            setUnifying(true);
            const result = await unifyCommissionToMXI(amount);
            setUnifying(false);

            if (result.success) {
              Alert.alert(
                '✅ Comisiones Unificadas',
                `Has convertido exitosamente ${amount.toFixed(2)} USDT a ${result.mxiAmount?.toFixed(4)} MXI.\n\n` +
                `Tu balance de MXI ha sido actualizado.\n\n` +
                `Recuerda: Este MXI no cuenta para el porcentaje de vesting.`,
                [{ text: 'Excelente', onPress: () => {
                  setUnifyAmount('');
                }}]
              );
            } else {
              Alert.alert('Error', result.error || 'Failed to unify commission');
            }
          },
        },
      ]
    );
  };

  const handleUnifyVestingBalance = async () => {
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
            setUnifyingVesting(true);
            const result = await claimYield();
            setUnifyingVesting(false);

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

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const daysUntilWithdrawal = user.canWithdraw ? 0 : Math.max(0, 10 - Math.floor((Date.now() - new Date(user.joinedDate).getTime()) / (1000 * 60 * 60 * 24)));
  const totalYield = user.accumulatedYield + currentYield;
  const canUnifyVesting = user.activeReferrals >= 10;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol ios_icon_name="chevron.left" android_material_icon_name="chevron_left" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Referrals</Text>
          <Text style={styles.subtitle}>Earn commissions by inviting friends</Text>
        </View>

        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>Your Referral Code</Text>
          <View style={styles.codeContainer}>
            <Text style={styles.code}>{user.referralCode}</Text>
            <View style={styles.codeActions}>
              <TouchableOpacity style={styles.iconButton} onPress={handleCopyCode}>
                <IconSymbol ios_icon_name="doc.on.doc" android_material_icon_name="content_copy" size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
                <IconSymbol ios_icon_name="square.and.arrow.up" android_material_icon_name="share" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <IconSymbol ios_icon_name="person.3.fill" android_material_icon_name="groups" size={24} color={colors.primary} />
            <Text style={styles.statValue}>{user.referrals.level1}</Text>
            <Text style={styles.statLabel}>Level 1 (5%)</Text>
          </View>
          <View style={styles.statCard}>
            <IconSymbol ios_icon_name="person.2.fill" android_material_icon_name="group" size={24} color={colors.secondary} />
            <Text style={styles.statValue}>{user.referrals.level2}</Text>
            <Text style={styles.statLabel}>Level 2 (2%)</Text>
          </View>
          <View style={styles.statCard}>
            <IconSymbol ios_icon_name="person.fill" android_material_icon_name="person" size={24} color={colors.accent} />
            <Text style={styles.statValue}>{user.referrals.level3}</Text>
            <Text style={styles.statLabel}>Level 3 (1%)</Text>
          </View>
        </View>

        <View style={styles.commissionsCard}>
          <Text style={styles.sectionTitle}>Commission Summary</Text>
          <View style={styles.commissionRow}>
            <Text style={styles.commissionLabel}>Total Earned:</Text>
            <Text style={styles.commissionValue}>{user.commissions.total.toFixed(2)} USDT</Text>
          </View>
          <View style={styles.commissionRow}>
            <Text style={styles.commissionLabel}>Available:</Text>
            <Text style={[styles.commissionValue, styles.availableValue]}>
              {user.commissions.available.toFixed(2)} USDT
            </Text>
          </View>
          <View style={styles.commissionRow}>
            <Text style={styles.commissionLabel}>Withdrawn:</Text>
            <Text style={styles.commissionValue}>{user.commissions.withdrawn.toFixed(2)} USDT</Text>
          </View>
        </View>

        {/* Vesting Balance Unification Section */}
        {user.isActiveContributor && user.yieldRatePerMinute > 0 && (
          <View style={styles.vestingUnificationCard}>
            <View style={styles.vestingHeader}>
              <View style={styles.vestingIconContainer}>
                <Text style={styles.vestingIconEmoji}>⛏️</Text>
              </View>
              <View style={styles.vestingHeaderText}>
                <Text style={styles.vestingTitle}>💎 Unificar Saldo de Vesting</Text>
                <Text style={styles.vestingSubtitle}>
                  Rendimiento acumulado: {totalYield.toFixed(8)} MXI
                </Text>
              </View>
            </View>

            <View style={styles.vestingInfoBox}>
              <Text style={styles.vestingInfoText}>
                Tu vesting ha generado {totalYield.toFixed(8)} MXI en rendimientos.
                {canUnifyVesting 
                  ? ' ¡Puedes unificar este saldo a tu balance principal ahora!'
                  : ` Necesitas ${10 - user.activeReferrals} referidos activos más para unificar.`}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.vestingUnifyButton,
                !canUnifyVesting && styles.vestingUnifyButtonDisabled,
                unifyingVesting && styles.vestingUnifyButtonProcessing,
              ]}
              onPress={handleUnifyVestingBalance}
              disabled={!canUnifyVesting || unifyingVesting || totalYield < 0.000001}
            >
              {unifyingVesting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <React.Fragment>
                  <IconSymbol
                    ios_icon_name={canUnifyVesting ? 'checkmark.circle.fill' : 'lock.fill'}
                    android_material_icon_name={canUnifyVesting ? 'check_circle' : 'lock'}
                    size={20}
                    color={canUnifyVesting ? '#fff' : colors.textSecondary}
                  />
                  <Text style={[styles.vestingUnifyButtonText, !canUnifyVesting && styles.vestingUnifyButtonTextDisabled]}>
                    {canUnifyVesting
                      ? '💎 Unificar Saldo de Vesting'
                      : `🔒 Requiere 10 Referidos (${user.activeReferrals}/10)`}
                  </Text>
                </React.Fragment>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.eligibilityCard}>
          <View style={styles.eligibilityHeader}>
            <IconSymbol
              ios_icon_name={user.canWithdraw ? 'checkmark.circle.fill' : 'clock.fill'}
              android_material_icon_name={user.canWithdraw ? 'check_circle' : 'schedule'}
              size={24}
              color={user.canWithdraw ? colors.success : colors.warning}
            />
            <Text style={styles.eligibilityTitle}>
              {user.canWithdraw ? 'Withdrawal Available' : 'Withdrawal Requirements'}
            </Text>
          </View>
          
          {!user.canWithdraw && (
            <View style={styles.requirementsList}>
              <View style={styles.requirementItem}>
                <IconSymbol
                  ios_icon_name={user.activeReferrals >= 5 ? 'checkmark.circle.fill' : 'circle'}
                  android_material_icon_name={user.activeReferrals >= 5 ? 'check_circle' : 'radio_button_unchecked'}
                  size={20}
                  color={user.activeReferrals >= 5 ? colors.success : colors.textSecondary}
                />
                <Text style={styles.requirementText}>
                  {user.activeReferrals}/5 active referrals
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <IconSymbol
                  ios_icon_name={daysUntilWithdrawal === 0 ? 'checkmark.circle.fill' : 'circle'}
                  android_material_icon_name={daysUntilWithdrawal === 0 ? 'check_circle' : 'radio_button_unchecked'}
                  size={20}
                  color={daysUntilWithdrawal === 0 ? colors.success : colors.textSecondary}
                />
                <Text style={styles.requirementText}>
                  {daysUntilWithdrawal === 0 ? '10 days completed' : `${daysUntilWithdrawal} days remaining`}
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <IconSymbol
                  ios_icon_name={user.kycStatus === 'approved' ? 'checkmark.circle.fill' : 'circle'}
                  android_material_icon_name={user.kycStatus === 'approved' ? 'check_circle' : 'radio_button_unchecked'}
                  size={20}
                  color={user.kycStatus === 'approved' ? colors.success : colors.textSecondary}
                />
                <Text style={styles.requirementText}>
                  KYC verification {user.kycStatus === 'approved' ? 'approved' : 'required'}
                </Text>
              </View>
            </View>
          )}

          {user.commissions.available > 0 && (
            <View style={styles.withdrawOptionsContainer}>
              {/* Unify to MXI Section */}
              <View style={styles.withdrawOption}>
                <View style={styles.optionHeader}>
                  <IconSymbol ios_icon_name="arrow.triangle.2.circlepath" android_material_icon_name="sync" size={20} color={colors.accent} />
                  <Text style={styles.optionTitle}>💎 Unificar a MXI</Text>
                </View>
                <Text style={styles.optionDescription}>
                  Convierte tus comisiones USDT a MXI al precio actual de mercado.
                  {'\n'}⚠️ No aumenta el % de vesting.
                </Text>
                
                <View style={styles.inputContainer}>
                  <Text style={commonStyles.label}>Cantidad a Unificar (USDT)</Text>
                  <TextInput
                    style={commonStyles.input}
                    placeholder={`Max: ${user.commissions.available.toFixed(2)}`}
                    placeholderTextColor={colors.textSecondary}
                    value={unifyAmount}
                    onChangeText={setUnifyAmount}
                    keyboardType="decimal-pad"
                  />
                  {unifyAmount && parseFloat(unifyAmount) > 0 && (
                    <Text style={styles.conversionText}>
                      ≈ {(parseFloat(unifyAmount) / currentPrice).toFixed(4)} MXI
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  style={[buttonStyles.secondary, styles.actionButton]}
                  onPress={handleUnifyToMXI}
                  disabled={unifying || !unifyAmount || parseFloat(unifyAmount) <= 0}
                >
                  {unifying ? (
                    <ActivityIndicator color={colors.accent} />
                  ) : (
                    <React.Fragment>
                      <IconSymbol ios_icon_name="arrow.triangle.2.circlepath" android_material_icon_name="sync" size={20} color={colors.accent} />
                      <Text style={[styles.buttonText, { color: colors.accent }]}>Unificar a MXI</Text>
                    </React.Fragment>
                  )}
                </TouchableOpacity>
              </View>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>O</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Withdraw USDT Section */}
              {user.canWithdraw && (
                <View style={styles.withdrawOption}>
                  <View style={styles.optionHeader}>
                    <IconSymbol ios_icon_name="arrow.down.circle.fill" android_material_icon_name="arrow_circle_down" size={20} color={colors.primary} />
                    <Text style={styles.optionTitle}>💵 Retirar USDT</Text>
                  </View>
                  <Text style={styles.optionDescription}>
                    Retira tus comisiones directamente a tu billetera USDT.
                    {'\n'}Requiere KYC aprobado.
                  </Text>

                  <View style={styles.inputContainer}>
                    <Text style={commonStyles.label}>Cantidad a Retirar (USDT)</Text>
                    <TextInput
                      style={commonStyles.input}
                      placeholder={`Max: ${user.commissions.available.toFixed(2)}`}
                      placeholderTextColor={colors.textSecondary}
                      value={withdrawAmount}
                      onChangeText={setWithdrawAmount}
                      keyboardType="decimal-pad"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={commonStyles.label}>USDT Wallet Address</Text>
                    <TextInput
                      style={commonStyles.input}
                      placeholder="Enter your USDT wallet address"
                      placeholderTextColor={colors.textSecondary}
                      value={walletAddress}
                      onChangeText={setWalletAddress}
                      autoCapitalize="none"
                    />
                  </View>

                  <TouchableOpacity
                    style={[buttonStyles.primary, styles.actionButton]}
                    onPress={handleWithdraw}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <React.Fragment>
                        <IconSymbol ios_icon_name="arrow.down.circle.fill" android_material_icon_name="arrow_circle_down" size={20} color="#fff" />
                        <Text style={styles.buttonText}>Retirar USDT</Text>
                      </React.Fragment>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.infoCard}>
          <IconSymbol ios_icon_name="info.circle" android_material_icon_name="info" size={20} color={colors.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Cómo funciona:</Text>
            <Text style={styles.infoText}>
              - Gana 5% de comisión de referidos Nivel 1{'\n'}
              - Gana 2% de comisión de referidos Nivel 2{'\n'}
              - Gana 1% de comisión de referidos Nivel 3{'\n'}
              - Las comisiones se generan en todas las compras{'\n'}
              - Retiro USDT: 5+ referidos activos + 10 días + KYC{'\n'}
              - Unificar a MXI: Sin requisitos, disponible siempre{'\n'}
              - ⚠️ MXI unificado NO cuenta para % de vesting{'\n'}
              - Solo MXI comprado directamente cuenta para vesting{'\n'}
              - Unificar Vesting: 10+ referidos activos requeridos
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
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  codeCard: {
    backgroundColor: colors.cardBackground,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  codeLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  code: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 2,
  },
  codeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  commissionsCard: {
    backgroundColor: colors.cardBackground,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  commissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  commissionLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  commissionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  availableValue: {
    color: colors.success,
    fontSize: 16,
  },
  vestingUnificationCard: {
    backgroundColor: colors.cardBackground,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  vestingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  vestingIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.accent}30`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  vestingIconEmoji: {
    fontSize: 28,
  },
  vestingHeaderText: {
    flex: 1,
  },
  vestingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  vestingSubtitle: {
    fontSize: 13,
    color: colors.accent,
    fontWeight: '600',
  },
  vestingInfoBox: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  vestingInfoText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  vestingUnifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  vestingUnifyButtonDisabled: {
    backgroundColor: colors.border,
    shadowOpacity: 0,
  },
  vestingUnifyButtonProcessing: {
    backgroundColor: colors.textSecondary,
    shadowOpacity: 0,
  },
  vestingUnifyButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  vestingUnifyButtonTextDisabled: {
    color: colors.textSecondary,
  },
  eligibilityCard: {
    backgroundColor: colors.cardBackground,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  eligibilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  eligibilityTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  requirementsList: {
    gap: 12,
    marginBottom: 16,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  requirementText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  withdrawOptionsContainer: {
    marginTop: 16,
  },
  withdrawOption: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  optionDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  inputContainer: {
    marginBottom: 16,
  },
  conversionText: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '600',
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
