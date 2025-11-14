
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';

export default function VestingCounter() {
  const { user, getCurrentYield, claimYield } = useAuth();
  const [currentYield, setCurrentYield] = useState(0);
  const [unifying, setUnifying] = useState(false);

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

  const handleUnifyBalance = async () => {
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
            setUnifying(true);
            const result = await claimYield();
            setUnifying(false);

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

  if (!user || !user.isActiveContributor || user.yieldRatePerMinute === 0) {
    return null;
  }

  const yieldPerSecond = user.yieldRatePerMinute / 60;
  const totalYield = user.accumulatedYield + currentYield;
  const canUnify = user.activeReferrals >= 10;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconEmoji}>⛏️</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>💰 Contador de Vesting</Text>
          <Text style={styles.subtitle}>
            ⚡ {yieldPerSecond.toFixed(8)} MXI por segundo
          </Text>
        </View>
      </View>

      {/* Real-time Counter Display */}
      <View style={styles.counterSection}>
        <View style={styles.counterCard}>
          <Text style={styles.counterLabel}>🔥 Vesting Actual</Text>
          <Text style={styles.counterValue}>{totalYield.toFixed(8)}</Text>
          <Text style={styles.counterUnit}>MXI</Text>
        </View>
      </View>

      {/* Yield Breakdown */}
      <View style={styles.breakdownSection}>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>💎 Sesión Actual</Text>
          <Text style={styles.breakdownValue}>{currentYield.toFixed(8)} MXI</Text>
        </View>
        <View style={styles.breakdownDivider} />
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>📊 Acumulado Previo</Text>
          <Text style={styles.breakdownValue}>{user.accumulatedYield.toFixed(8)} MXI</Text>
        </View>
      </View>

      {/* Rate Information */}
      <View style={styles.rateSection}>
        <View style={styles.rateItem}>
          <Text style={styles.rateLabel}>Por Segundo</Text>
          <Text style={styles.rateValue}>{yieldPerSecond.toFixed(8)}</Text>
        </View>
        <View style={styles.rateDivider} />
        <View style={styles.rateItem}>
          <Text style={styles.rateLabel}>Por Minuto</Text>
          <Text style={styles.rateValue}>{user.yieldRatePerMinute.toFixed(8)}</Text>
        </View>
        <View style={styles.rateDivider} />
        <View style={styles.rateItem}>
          <Text style={styles.rateLabel}>Por Hora</Text>
          <Text style={styles.rateValue}>{(user.yieldRatePerMinute * 60).toFixed(6)}</Text>
        </View>
      </View>

      {/* Daily Rate */}
      <View style={styles.dailyRate}>
        <Text style={styles.dailyRateLabel}>📈 Rendimiento Diario</Text>
        <Text style={styles.dailyRateValue}>
          {(user.yieldRatePerMinute * 60 * 24).toFixed(4)} MXI
        </Text>
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
        <IconSymbol
          name={canUnify ? 'checkmark.circle.fill' : 'lock.fill'}
          size={20}
          color={canUnify && !unifying ? '#fff' : colors.textSecondary}
        />
        <Text style={[styles.unifyButtonText, !canUnify && styles.unifyButtonTextDisabled]}>
          {unifying
            ? 'Unificando...'
            : canUnify
            ? '💎 Unificar Saldo'
            : `🔒 Requiere 10 Referidos (${user.activeReferrals}/10)`}
        </Text>
      </TouchableOpacity>

      {/* Info Box */}
      <View style={styles.infoBox}>
        <Text style={styles.infoIcon}>ℹ️</Text>
        <Text style={styles.infoText}>
          {canUnify
            ? '¡Felicidades! Has alcanzado 10 referidos activos. Puedes unificar tu saldo de vesting a tu balance principal en cualquier momento.'
            : `Necesitas ${10 - user.activeReferrals} referidos activos más para poder unificar tu saldo de vesting. El vesting genera 0.005% por hora de tu inversión total.`}
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
    borderColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
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
  iconEmoji: {
    fontSize: 32,
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
    color: colors.accent,
    fontWeight: '600',
  },
  counterSection: {
    marginBottom: 16,
  },
  counterCard: {
    backgroundColor: `${colors.accent}20`,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.accent,
  },
  counterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  counterValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.accent,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  counterUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  breakdownSection: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  breakdownLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'monospace',
  },
  rateSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
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
    fontWeight: '600',
  },
  rateValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'monospace',
  },
  dailyRate: {
    backgroundColor: `${colors.primary}20`,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  dailyRateLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  dailyRateValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    fontFamily: 'monospace',
  },
  unifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
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
    backgroundColor: colors.highlight,
    padding: 12,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoIcon: {
    fontSize: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
