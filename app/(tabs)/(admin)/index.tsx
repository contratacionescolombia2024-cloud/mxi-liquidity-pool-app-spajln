
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { VersionDisplay } from '@/components/VersionDisplay';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalMXI: number;
  totalUSDT: number;
  pendingWithdrawals: number;
  pendingKYC: number;
  pendingMessages: number;
  pendingVerifications: number;
  pendingAmbassadorWithdrawals: number;
}

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalMXI: 0,
    totalUSDT: 0,
    pendingWithdrawals: 0,
    pendingKYC: 0,
    pendingMessages: 0,
    pendingVerifications: 0,
    pendingAmbassadorWithdrawals: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);

      const [
        usersResult,
        withdrawalsResult,
        kycResult,
        messagesResult,
        verificationsResult,
        ambassadorWithdrawalsResult,
      ] = await Promise.all([
        supabase.from('users').select('mxi_balance, usdt_contributed, is_active_contributor'),
        supabase.from('withdrawals').select('id').eq('status', 'pending'),
        supabase.from('kyc_verifications').select('id').eq('status', 'pending'),
        supabase.from('messages').select('id').eq('status', 'open'),
        supabase.from('manual_verification_requests').select('id').eq('status', 'pending'),
        supabase.from('ambassador_bonus_withdrawals').select('id').eq('status', 'pending'),
      ]);

      const users = usersResult.data || [];
      const totalMXI = users.reduce((sum, u) => sum + parseFloat(u.mxi_balance?.toString() || '0'), 0);
      const totalUSDT = users.reduce((sum, u) => sum + parseFloat(u.usdt_contributed?.toString() || '0'), 0);
      const activeUsers = users.filter(u => u.is_active_contributor).length;

      setStats({
        totalUsers: users.length,
        activeUsers,
        totalMXI,
        totalUSDT,
        pendingWithdrawals: withdrawalsResult.data?.length || 0,
        pendingKYC: kycResult.data?.length || 0,
        pendingMessages: messagesResult.data?.length || 0,
        pendingVerifications: verificationsResult.data?.length || 0,
        pendingAmbassadorWithdrawals: ambassadorWithdrawalsResult.data?.length || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  const adminMenuItems = [
    {
      title: 'Gestión de Usuarios',
      description: 'Ver y gestionar usuarios',
      icon: { ios: 'person.3.fill', android: 'group' },
      route: '/(tabs)/(admin)/user-management',
      color: colors.primary,
    },
    {
      title: 'Eliminar Cuentas',
      description: 'Eliminar cuentas de usuario',
      icon: { ios: 'trash.fill', android: 'delete_forever' },
      route: '/(tabs)/(admin)/user-deletion',
      color: colors.error,
      badge: null,
    },
    {
      title: 'Aprobación de Retiros',
      description: 'Aprobar retiros pendientes',
      icon: { ios: 'dollarsign.circle.fill', android: 'payments' },
      route: '/(tabs)/(admin)/withdrawal-approvals',
      color: colors.success,
      badge: stats.pendingWithdrawals,
    },
    {
      title: 'Verificación Manual',
      description: 'Verificar pagos manualmente',
      icon: { ios: 'checkmark.shield.fill', android: 'verified' },
      route: '/(tabs)/(admin)/manual-verification-requests',
      color: colors.warning,
      badge: stats.pendingVerifications,
    },
    {
      title: 'Retiros Embajadores',
      description: 'Aprobar retiros de embajadores',
      icon: { ios: 'star.circle.fill', android: 'star' },
      route: '/(tabs)/(admin)/ambassador-withdrawals',
      color: colors.primary,
      badge: stats.pendingAmbassadorWithdrawals,
    },
    {
      title: 'Mensajes de Soporte',
      description: 'Gestionar mensajes de usuarios',
      icon: { ios: 'envelope.fill', android: 'mail' },
      route: '/(tabs)/(admin)/messages',
      color: colors.primary,
      badge: stats.pendingMessages,
    },
    {
      title: 'Crédito Manual',
      description: 'Acreditar pagos manualmente',
      icon: { ios: 'plus.circle.fill', android: 'add_circle' },
      route: '/(tabs)/(admin)/manual-payment-credit',
      color: colors.success,
    },
    {
      title: 'Analíticas de Vesting',
      description: 'Ver analíticas de vesting',
      icon: { ios: 'chart.line.uptrend.xyaxis', android: 'analytics' },
      route: '/(tabs)/(admin)/vesting-analytics',
      color: colors.primary,
    },
    {
      title: 'Configuración',
      description: 'Configurar parámetros del sistema',
      icon: { ios: 'gearshape.fill', android: 'settings' },
      route: '/(tabs)/(admin)/settings',
      color: colors.textSecondary,
    },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Panel de Administración</Text>
            <Text style={styles.subtitle}>Bienvenido, {user?.name}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <IconSymbol ios_icon_name="rectangle.portrait.and.arrow.right" android_material_icon_name="logout" size={24} color={colors.error} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <IconSymbol ios_icon_name="person.3.fill" android_material_icon_name="group" size={32} color={colors.primary} />
            <Text style={styles.statValue}>{stats.totalUsers}</Text>
            <Text style={styles.statLabel}>Total Usuarios</Text>
          </View>

          <View style={styles.statCard}>
            <IconSymbol ios_icon_name="person.fill.checkmark" android_material_icon_name="person_check" size={32} color={colors.success} />
            <Text style={styles.statValue}>{stats.activeUsers}</Text>
            <Text style={styles.statLabel}>Usuarios Activos</Text>
          </View>

          <View style={styles.statCard}>
            <IconSymbol ios_icon_name="bitcoinsign.circle.fill" android_material_icon_name="currency_bitcoin" size={32} color={colors.primary} />
            <Text style={styles.statValue}>{stats.totalMXI.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Total MXI</Text>
          </View>

          <View style={styles.statCard}>
            <IconSymbol ios_icon_name="dollarsign.circle.fill" android_material_icon_name="attach_money" size={32} color={colors.success} />
            <Text style={styles.statValue}>${stats.totalUSDT.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Total USDT</Text>
          </View>
        </View>

        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          {adminMenuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[commonStyles.card, styles.menuItem]}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                <IconSymbol ios_icon_name={item.icon.ios} android_material_icon_name={item.icon.android} size={24} color={item.color} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
              {item.badge !== null && item.badge !== undefined && item.badge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
              <IconSymbol ios_icon_name="chevron.right" android_material_icon_name="chevron_right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        <VersionDisplay />
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
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  logoutButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  menuContainer: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  badge: {
    backgroundColor: colors.error,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
});
