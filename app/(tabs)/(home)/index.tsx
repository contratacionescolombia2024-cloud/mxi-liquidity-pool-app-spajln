
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { UniversalMXICounter } from '@/components/UniversalMXICounter';
import { YieldDisplay } from '@/components/YieldDisplay';
import { LaunchCountdown } from '@/components/LaunchCountdown';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionIcon: {
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  statsCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  kycBanner: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.warning,
    flexDirection: 'row',
    alignItems: 'center',
  },
  kycBannerText: {
    flex: 1,
    marginLeft: 12,
  },
  kycBannerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.warning,
    marginBottom: 4,
  },
  kycBannerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default function HomeScreen() {
  const router = useRouter();
  const { user, loading, checkWithdrawalEligibility, getPhaseInfo } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [phaseInfo, setPhaseInfo] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      await checkWithdrawalEligibility();
      const info = await getPhaseInfo();
      setPhaseInfo(info);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: colors.text }}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hola, {user.name}</Text>
        <Text style={styles.subtitle}>Bienvenido al Pool de Liquidez MXI</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* KYC Banner */}
        {user.kycStatus !== 'approved' && (
          <TouchableOpacity
            style={styles.kycBanner}
            onPress={() => router.push('/(tabs)/(home)/kyc-verification')}
          >
            <IconSymbol
              ios_icon_name="exclamationmark.triangle.fill"
              android_material_icon_name="warning"
              size={24}
              color={colors.warning}
            />
            <View style={styles.kycBannerText}>
              <Text style={styles.kycBannerTitle}>Verificación KYC Requerida</Text>
              <Text style={styles.kycBannerSubtitle}>
                Completa tu verificación para poder retirar fondos
              </Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron_right"
              size={20}
              color={colors.warning}
            />
          </TouchableOpacity>
        )}

        {/* Yield Display */}
        <YieldDisplay />

        {/* Launch Countdown */}
        <LaunchCountdown />

        {/* Universal MXI Counter */}
        <UniversalMXICounter />

        {/* Quick Actions */}
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/(home)/referrals')}
          >
            <IconSymbol
              ios_icon_name="person.2.fill"
              android_material_icon_name="group"
              size={32}
              color={colors.primary}
              style={styles.actionIcon}
            />
            <Text style={styles.actionLabel}>Referidos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/(home)/payment-history')}
          >
            <IconSymbol
              ios_icon_name="clock.fill"
              android_material_icon_name="history"
              size={32}
              color={colors.primary}
              style={styles.actionIcon}
            />
            <Text style={styles.actionLabel}>Historial</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/(home)/vesting')}
          >
            <IconSymbol
              ios_icon_name="chart.line.uptrend.xyaxis"
              android_material_icon_name="trending_up"
              size={32}
              color={colors.primary}
              style={styles.actionIcon}
            />
            <Text style={styles.actionLabel}>Vesting</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/(home)/withdraw-mxi')}
          >
            <IconSymbol
              ios_icon_name="arrow.up.circle.fill"
              android_material_icon_name="upload"
              size={32}
              color={colors.primary}
              style={styles.actionIcon}
            />
            <Text style={styles.actionLabel}>Retirar</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Estadísticas</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Balance Total MXI</Text>
            <Text style={styles.statValue}>
              {user.mxiBalance.toLocaleString('es-ES', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>USDT Contribuido</Text>
            <Text style={styles.statValue}>
              ${user.usdtContributed.toFixed(2)}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Referidos Activos</Text>
            <Text style={styles.statValue}>{user.activeReferrals}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Comisiones Disponibles</Text>
            <Text style={styles.statValue}>
              ${user.commissions.available.toFixed(2)}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>MXI Comprado</Text>
            <Text style={styles.statValue}>
              {(user.mxiPurchasedDirectly || 0).toFixed(2)}
            </Text>
          </View>
          {phaseInfo && (
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Precio Actual</Text>
              <Text style={styles.statValue}>
                ${phaseInfo.currentPriceUsdt.toFixed(2)} USDT
              </Text>
            </View>
          )}
        </View>

        {/* Extra padding at bottom to avoid tab bar */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
