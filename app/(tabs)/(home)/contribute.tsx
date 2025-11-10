
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';

export default function ContributeScreen() {
  const router = useRouter();
  const { user, addContribution } = useAuth();
  const [amount, setAmount] = useState('');
  const [binanceWallet, setBinanceWallet] = useState('');

  const minContribution = 50;
  const maxContribution = 100000;
  const mxiPerUsdt = 0.2; // 5 MXI for 50 USDT = 0.1 MXI per USDT

  const calculateMxi = () => {
    const usdtAmount = parseFloat(amount) || 0;
    return (usdtAmount * mxiPerUsdt).toFixed(2);
  };

  const handleContribute = async () => {
    const usdtAmount = parseFloat(amount);

    if (!binanceWallet) {
      Alert.alert('Error', 'Please enter your Binance wallet address');
      return;
    }

    if (!amount || isNaN(usdtAmount)) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (usdtAmount < minContribution) {
      Alert.alert('Error', `Minimum contribution is ${minContribution} USDT`);
      return;
    }

    if (usdtAmount > maxContribution) {
      Alert.alert('Error', `Maximum contribution is ${maxContribution} USDT`);
      return;
    }

    const totalContribution = (user?.usdtContributed || 0) + usdtAmount;
    if (totalContribution > maxContribution) {
      Alert.alert(
        'Error',
        `Your total contribution would exceed the maximum of ${maxContribution} USDT`
      );
      return;
    }

    Alert.alert(
      'Confirm Contribution',
      `You will receive ${calculateMxi()} MXI for ${usdtAmount} USDT.\n\nPlease send ${usdtAmount} USDT to the pool address from your Binance wallet:\n\n${binanceWallet}\n\nAfter sending, your MXI will be credited within 24 hours.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            await addContribution(usdtAmount);
            Alert.alert('Success', 'Contribution recorded! Your MXI will be credited soon.', [
              { text: 'OK', onPress: () => router.back() },
            ]);
          },
        },
      ]
    );
  };

  const quickAmounts = [50, 100, 500, 1000, 5000];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Add Funds</Text>
        </View>

        {/* Info Card */}
        <View style={[commonStyles.card, styles.infoCard]}>
          <IconSymbol name="info.circle.fill" size={24} color={colors.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Contribution Limits</Text>
            <Text style={styles.infoText}>
              - Minimum: {minContribution} USDT{'\n'}
              - Maximum: {maxContribution.toLocaleString()} USDT per user{'\n'}
              - Rate: 5 MXI per 50 USDT
            </Text>
          </View>
        </View>

        {/* Binance Wallet Input */}
        <View style={styles.section}>
          <Text style={commonStyles.label}>Binance Wallet Address *</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="Enter your Binance wallet address"
            placeholderTextColor={colors.textSecondary}
            value={binanceWallet}
            onChangeText={setBinanceWallet}
            autoCapitalize="none"
          />
          <Text style={styles.helperText}>
            This is where you&apos;ll send USDT from
          </Text>
        </View>

        {/* Amount Input */}
        <View style={styles.section}>
          <Text style={commonStyles.label}>Amount (USDT) *</Text>
          <View style={styles.amountInputContainer}>
            <TextInput
              style={[commonStyles.input, styles.amountInput]}
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
            <Text style={styles.currencyLabel}>USDT</Text>
          </View>

          {/* Quick Amount Buttons */}
          <View style={styles.quickAmounts}>
            {quickAmounts.map((quickAmount) => (
              <TouchableOpacity
                key={quickAmount}
                style={styles.quickAmountButton}
                onPress={() => setAmount(quickAmount.toString())}
              >
                <Text style={styles.quickAmountText}>${quickAmount}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* MXI Preview */}
        {amount && parseFloat(amount) >= minContribution && (
          <View style={[commonStyles.card, styles.previewCard]}>
            <Text style={styles.previewLabel}>You will receive</Text>
            <View style={styles.previewAmount}>
              <IconSymbol name="bitcoinsign.circle.fill" size={32} color={colors.primary} />
              <Text style={styles.previewValue}>{calculateMxi()}</Text>
              <Text style={styles.previewCurrency}>MXI</Text>
            </View>
            <View style={styles.previewDetails}>
              <View style={styles.previewRow}>
                <Text style={styles.previewDetailLabel}>Current Balance</Text>
                <Text style={styles.previewDetailValue}>
                  {user?.mxiBalance.toFixed(2)} MXI
                </Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewDetailLabel}>New Balance</Text>
                <Text style={[styles.previewDetailValue, styles.highlightValue]}>
                  {((user?.mxiBalance || 0) + parseFloat(calculateMxi())).toFixed(2)} MXI
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Instructions */}
        <View style={[commonStyles.card, styles.instructionsCard]}>
          <Text style={styles.instructionsTitle}>How to Contribute</Text>
          <View style={styles.instructionStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>
              Enter your Binance wallet address and contribution amount
            </Text>
          </View>
          <View style={styles.instructionStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>
              Send USDT from your Binance wallet to the pool address
            </Text>
          </View>
          <View style={styles.instructionStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>
              Your MXI tokens will be credited within 24 hours
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[buttonStyles.primary, styles.contributeButton]}
          onPress={handleContribute}
        >
          <Text style={styles.buttonText}>Confirm Contribution</Text>
        </TouchableOpacity>
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
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.highlight,
    marginBottom: 24,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: -8,
    marginBottom: 8,
  },
  amountInputContainer: {
    position: 'relative',
  },
  amountInput: {
    paddingRight: 70,
    fontSize: 24,
    fontWeight: '600',
  },
  currencyLabel: {
    position: 'absolute',
    right: 16,
    top: 12,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  quickAmountButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  previewCard: {
    marginBottom: 24,
    backgroundColor: colors.card,
  },
  previewLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  previewAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewValue: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 12,
  },
  previewCurrency: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 8,
  },
  previewDetails: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  previewDetailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  previewDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  highlightValue: {
    color: colors.secondary,
  },
  instructionsCard: {
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  instructionStep: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    paddingTop: 4,
  },
  contributeButton: {
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
