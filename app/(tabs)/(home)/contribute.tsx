
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';

export default function ContributeScreen() {
  const router = useRouter();
  const { user, addContribution } = useAuth();
  const [usdtAmount, setUsdtAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [transactionType, setTransactionType] = useState<'initial' | 'increase' | 'reinvestment'>('initial');

  const calculateMxi = () => {
    const amount = parseFloat(usdtAmount);
    if (isNaN(amount)) return 0;
    return amount / 10; // 1 MXI = 10 USDT
  };

  const handleContribute = async () => {
    const amount = parseFloat(usdtAmount);

    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (amount < 50) {
      Alert.alert('Error', 'Minimum contribution is 50 USDT');
      return;
    }

    if (amount > 100000) {
      Alert.alert('Error', 'Maximum contribution is 100,000 USDT');
      return;
    }

    // Determine transaction type
    let txType: 'initial' | 'increase' | 'reinvestment' = 'initial';
    if (user && user.usdtContributed > 0) {
      txType = 'increase';
    }

    Alert.alert(
      'Confirm Contribution',
      `You are about to contribute ${amount} USDT and receive ${calculateMxi()} MXI tokens.\n\nThis will generate referral commissions for your upline.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setLoading(true);
            const result = await addContribution(amount, txType);
            setLoading(false);

            if (result.success) {
              Alert.alert(
                'Success',
                `Contribution successful! You received ${calculateMxi()} MXI tokens.`,
                [{ text: 'OK', onPress: () => router.back() }]
              );
              setUsdtAmount('');
            } else {
              Alert.alert('Error', result.error || 'Failed to process contribution');
            }
          },
        },
      ]
    );
  };

  const handleReinvest = async () => {
    if (!user) return;

    const availableCommission = user.commissions.available;

    if (availableCommission < 50) {
      Alert.alert('Error', 'You need at least 50 USDT in available commissions to reinvest');
      return;
    }

    Alert.alert(
      'Confirm Reinvestment',
      `You are about to reinvest ${availableCommission.toFixed(2)} USDT from your available commissions.\n\nYou will receive ${(availableCommission / 10).toFixed(1)} MXI tokens and generate new referral commissions.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setLoading(true);
            const result = await addContribution(availableCommission, 'reinvestment');
            setLoading(false);

            if (result.success) {
              Alert.alert(
                'Success',
                `Reinvestment successful! You received ${(availableCommission / 10).toFixed(1)} MXI tokens.`,
                [{ text: 'OK', onPress: () => router.back() }]
              );
            } else {
              Alert.alert('Error', result.error || 'Failed to process reinvestment');
            }
          },
        },
      ]
    );
  };

  const mxiAmount = calculateMxi();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Contribute to Pool</Text>
          <Text style={styles.subtitle}>Increase your MXI holdings</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <IconSymbol name="info.circle" size={20} color={colors.primary} />
            <Text style={styles.infoText}>
              Contributions generate referral commissions for your upline (3%, 2%, 1% for levels 1-3)
            </Text>
          </View>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={commonStyles.label}>USDT Amount</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={commonStyles.input}
                placeholder="Enter amount (50 - 100,000)"
                placeholderTextColor={colors.textSecondary}
                value={usdtAmount}
                onChangeText={setUsdtAmount}
                keyboardType="decimal-pad"
              />
              <Text style={styles.currency}>USDT</Text>
            </View>
            <Text style={styles.helperText}>
              Minimum: 50 USDT • Maximum: 100,000 USDT
            </Text>
          </View>

          <View style={styles.conversionCard}>
            <View style={styles.conversionRow}>
              <Text style={styles.conversionLabel}>You will receive:</Text>
              <View style={styles.conversionValue}>
                <Text style={styles.conversionAmount}>{mxiAmount.toFixed(1)}</Text>
                <Text style={styles.conversionCurrency}>MXI</Text>
              </View>
            </View>
            <Text style={styles.conversionRate}>1 MXI = 10 USDT</Text>
          </View>

          <View style={styles.commissionCard}>
            <Text style={styles.commissionTitle}>Referral Commissions Generated:</Text>
            <View style={styles.commissionRow}>
              <Text style={styles.commissionLevel}>Level 1 (3%):</Text>
              <Text style={styles.commissionAmount}>
                {(parseFloat(usdtAmount || '0') * 0.03).toFixed(2)} USDT
              </Text>
            </View>
            <View style={styles.commissionRow}>
              <Text style={styles.commissionLevel}>Level 2 (2%):</Text>
              <Text style={styles.commissionAmount}>
                {(parseFloat(usdtAmount || '0') * 0.02).toFixed(2)} USDT
              </Text>
            </View>
            <View style={styles.commissionRow}>
              <Text style={styles.commissionLevel}>Level 3 (1%):</Text>
              <Text style={styles.commissionAmount}>
                {(parseFloat(usdtAmount || '0') * 0.01).toFixed(2)} USDT
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[buttonStyles.primary, styles.contributeButton]}
            onPress={handleContribute}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <IconSymbol name="plus.circle.fill" size={20} color="#fff" />
                <Text style={styles.buttonText}>
                  {user && user.usdtContributed > 0 ? 'Increase Participation' : 'Make Contribution'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {user && user.commissions.available >= 50 && (
            <View style={styles.reinvestSection}>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.reinvestCard}>
                <View style={styles.reinvestHeader}>
                  <IconSymbol name="arrow.clockwise.circle.fill" size={24} color={colors.success} />
                  <Text style={styles.reinvestTitle}>Reinvest Commissions</Text>
                </View>
                <Text style={styles.reinvestDescription}>
                  You have {user.commissions.available.toFixed(2)} USDT available to reinvest
                </Text>
                <TouchableOpacity
                  style={[buttonStyles.outline, styles.reinvestButton]}
                  onPress={handleReinvest}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                    <Text style={styles.reinvestButtonText}>
                      Reinvest {user.commissions.available.toFixed(2)} USDT
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={styles.noteCard}>
          <IconSymbol name="exclamationmark.circle" size={20} color={colors.warning} />
          <Text style={styles.noteText}>
            Note: All contributions are final and cannot be refunded. MXI tokens will be available for withdrawal after the official launch on January 15, 2025.
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
  scrollContent: {
    flexGrow: 1,
    padding: 24,
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
  infoCard: {
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    position: 'relative',
  },
  currency: {
    position: 'absolute',
    right: 16,
    top: 12,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  conversionCard: {
    backgroundColor: colors.cardBackground,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  conversionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  conversionLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  conversionValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  conversionAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  conversionCurrency: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  conversionRate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  commissionCard: {
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  commissionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  commissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  commissionLevel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  commissionAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
  },
  contributeButton: {
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
  reinvestSection: {
    marginTop: 24,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    color: colors.textSecondary,
    fontSize: 14,
  },
  reinvestCard: {
    backgroundColor: colors.cardBackground,
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.success,
  },
  reinvestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  reinvestTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  reinvestDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  reinvestButton: {
    marginTop: 8,
  },
  reinvestButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
