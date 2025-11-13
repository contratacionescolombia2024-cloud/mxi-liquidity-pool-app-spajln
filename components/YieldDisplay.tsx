
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';

export default function YieldDisplay() {
  const { user, getCurrentYield, claimYield } = useAuth();
  const [currentYield, setCurrentYield] = useState(0);
  const [claiming, setClaiming] = useState(false);

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

  const handleClaimYield = async () => {
    if (currentYield < 0.000001) {
      Alert.alert('No Yield', 'You need to accumulate more yield before claiming.');
      return;
    }

    // Check eligibility before claiming
    if (!user.canWithdraw) {
      Alert.alert(
        'Requirements Not Met',
        `To claim your mined MXI, you need:\n\n- 5 active referrals (you have ${user.activeReferrals})\n- 10 days membership\n- KYC verification approved\n\nOnce you meet these requirements, you can claim your accumulated yield.`,
        [{ text: 'OK' }]
      );
      return;
    }

    if (user.kycStatus !== 'approved') {
      Alert.alert(
        'KYC Required',
        'You need to complete KYC verification before claiming your mined MXI. Please go to the KYC section to verify your identity.',
        [{ text: 'OK' }]
      );
      return;
    }

    setClaiming(true);
    const result = await claimYield();
    setClaiming(false);

    if (result.success) {
      Alert.alert(
        'Yield Claimed!',
        `You have successfully claimed ${result.yieldEarned?.toFixed(8)} MXI and it has been added to your balance!`,
        [{ text: 'OK' }]
      );
      setCurrentYield(0);
    } else {
      Alert.alert('Claim Failed', result.error || 'Failed to claim yield');
    }
  };

  if (!user || !user.isActiveContributor || user.yieldRatePerMinute === 0) {
    return null;
  }

  const yieldPerSecond = user.yieldRatePerMinute / 60;
  const totalYield = user.accumulatedYield + currentYield;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <IconSymbol name="chart.line.uptrend.xyaxis" size={24} color={colors.success} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>MXI Mining Active</Text>
          <Text style={styles.subtitle}>Earning {yieldPerSecond.toFixed(8)} MXI/second</Text>
        </View>
      </View>

      <View style={styles.yieldSection}>
        <View style={styles.yieldRow}>
          <Text style={styles.yieldLabel}>Current Session</Text>
          <Text style={styles.yieldValue}>{currentYield.toFixed(8)} MXI</Text>
        </View>
        <View style={styles.yieldRow}>
          <Text style={styles.yieldLabel}>Total Accumulated</Text>
          <Text style={styles.yieldValueTotal}>{totalYield.toFixed(8)} MXI</Text>
        </View>
      </View>

      <View style={styles.rateSection}>
        <View style={styles.rateItem}>
          <Text style={styles.rateLabel}>Rate/Minute</Text>
          <Text style={styles.rateValue}>{user.yieldRatePerMinute.toFixed(8)}</Text>
        </View>
        <View style={styles.rateDivider} />
        <View style={styles.rateItem}>
          <Text style={styles.rateLabel}>Rate/Hour</Text>
          <Text style={styles.rateValue}>{(user.yieldRatePerMinute * 60).toFixed(8)}</Text>
        </View>
        <View style={styles.rateDivider} />
        <View style={styles.rateItem}>
          <Text style={styles.rateLabel}>Rate/Day</Text>
          <Text style={styles.rateValue}>{(user.yieldRatePerMinute * 60 * 24).toFixed(6)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.claimButton, claiming && styles.claimButtonDisabled]}
        onPress={handleClaimYield}
        disabled={claiming || currentYield < 0.000001}
      >
        <IconSymbol 
          name="arrow.down.circle.fill" 
          size={20} 
          color={claiming || currentYield < 0.000001 ? colors.textSecondary : '#fff'} 
        />
        <Text style={[styles.claimButtonText, claiming && styles.claimButtonTextDisabled]}>
          {claiming ? 'Claiming...' : 'Claim Yield'}
        </Text>
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <IconSymbol name="info.circle" size={16} color={colors.textSecondary} />
        <Text style={styles.infoText}>
          Mining rate: 0.005% per hour of your total investment. To claim your mined MXI, you need 5 active referrals, 10 days membership, and KYC approval (same as commission withdrawals).
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.success,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.success}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '600',
  },
  yieldSection: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  yieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  yieldLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  yieldValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.success,
    fontFamily: 'monospace',
  },
  yieldValueTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    fontFamily: 'monospace',
  },
  rateSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  rateItem: {
    flex: 1,
    alignItems: 'center',
  },
  rateDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 8,
  },
  rateLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  rateValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'monospace',
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  claimButtonDisabled: {
    backgroundColor: colors.border,
  },
  claimButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  claimButtonTextDisabled: {
    color: colors.textSecondary,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.highlight,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
