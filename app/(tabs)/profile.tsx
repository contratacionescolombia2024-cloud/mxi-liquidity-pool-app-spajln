
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, checkAdminStatus } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [commissions, setCommissions] = useState({ available: 0, total: 0 });
  const [phaseInfo, setPhaseInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        const adminStatus = await checkAdminStatus();
        setIsAdmin(adminStatus);
      }
      setCheckingAdmin(false);
    };
    checkAdmin();
  }, [user]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load commissions data
      const { data: commissionsData, error: commissionsError } = await supabase
        .from('commissions')
        .select('amount, status')
        .eq('user_id', user?.id);

      if (!commissionsError && commissionsData) {
        const available = commissionsData
          .filter(c => c.status === 'available')
          .reduce((sum, c) => sum + parseFloat(c.amount), 0);
        const total = commissionsData.reduce((sum, c) => sum + parseFloat(c.amount), 0);
        setCommissions({ available, total });
      }

      // Load phase info
      const { data: metricsData, error: metricsError } = await supabase
        .from('metrics')
        .select('*')
        .single();

      if (!metricsError && metricsData) {
        const phase1Allocation = 8333333;
        const phase2Allocation = 8333333;
        const phase3Allocation = 8333334;

        const phase1Sold = parseFloat(metricsData.phase_1_tokens_sold || '0');
        const phase2Sold = parseFloat(metricsData.phase_2_tokens_sold || '0');
        const phase3Sold = parseFloat(metricsData.phase_3_tokens_sold || '0');

        const phase1Remaining = phase1Allocation - phase1Sold;
        const phase2Remaining = phase2Allocation - phase2Sold;
        const phase3Remaining = phase3Allocation - phase3Sold;

        const totalSold = phase1Sold + phase2Sold + phase3Sold;
        const totalAllocation = 25000000;
        const overallProgress = (totalSold / totalAllocation) * 100;

        setPhaseInfo({
          currentPhase: metricsData.current_phase,
          currentPriceUsdt: parseFloat(metricsData.current_price_usdt),
          phase1: { sold: phase1Sold, remaining: phase1Remaining, allocation: phase1Allocation },
          phase2: { sold: phase2Sold, remaining: phase2Remaining, allocation: phase2Allocation },
          phase3: { sold: phase3Sold, remaining: phase3Remaining, allocation: phase3Allocation },
          totalSold,
          totalRemaining: totalAllocation - totalSold,
          overallProgress,
          poolCloseDate: metricsData.pool_close_date,
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            await logout();
            setLoggingOut(false);
          },
        },
      ]
    );
  };

  if (!user || loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const getKYCStatusText = () => {
    switch (user.kycStatus) {
      case 'approved': return 'Aprobado';
      case 'pending': return 'Pendiente';
      case 'rejected': return 'Rechazado';
      default: return 'No Enviado';
    }
  };

  const menuItems = [
    {
      id: 'edit-profile',
      title: 'Editar Perfil',
      subtitle: 'Actualiza tu información',
      icon: 'person.fill',
      androidIcon: 'person',
      route: '/(tabs)/(home)/edit-profile',
    },
    {
      id: 'kyc',
      title: 'Verificación KYC',
      subtitle: getKYCStatusText(),
      icon: 'checkmark.shield.fill',
      androidIcon: 'verified_user',
      route: '/(tabs)/(home)/kyc-verification',
    },
    {
      id: 'vesting',
      title: 'Vesting & Rendimiento',
      subtitle: 'Ver generación de rendimiento',
      icon: 'chart.line.uptrend.xyaxis',
      androidIcon: 'trending_up',
      route: '/(tabs)/(home)/vesting',
    },
    {
      id: 'withdrawals',
      title: 'Historial de Retiros',
      subtitle: 'Ver retiros anteriores',
      icon: 'arrow.down.circle.fill',
      androidIcon: 'arrow_circle_down',
      route: '/(tabs)/(home)/withdrawals',
    },
    {
      id: 'challenge-history',
      title: 'Historial de Retos',
      subtitle: 'Ver registros de juegos',
      icon: 'clock.fill',
      androidIcon: 'history',
      route: '/(tabs)/(home)/challenge-history',
    },
    {
      id: 'support',
      title: 'Soporte',
      subtitle: 'Obtener ayuda',
      icon: 'questionmark.circle.fill',
      androidIcon: 'help',
      route: '/(tabs)/(home)/support',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Total</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <IconSymbol ios_icon_name="person.circle.fill" android_material_icon_name="account_circle" size={80} color={colors.primary} />
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.referralCodeContainer}>
            <Text style={styles.referralCodeLabel}>Código de Referido:</Text>
            <Text style={styles.referralCode}>{user.referralCode}</Text>
          </View>
        </View>

        {/* Total MXI Balance Card */}
        <View style={[commonStyles.card, styles.totalBalanceCard]}>
          <Text style={styles.cardTitle}>Balance Total de MXI</Text>
          <Text style={styles.totalBalanceValue}>
            {user.mxiBalance.toLocaleString('es-ES', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} MXI
          </Text>
          <View style={styles.balanceBreakdown}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>MXI Comprados:</Text>
              <Text style={styles.breakdownValue}>
                {(user.mxiPurchasedDirectly || 0).toFixed(2)}
              </Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>MXI de Vesting:</Text>
              <Text style={styles.breakdownValue}>
                {(user.mxiVestingLocked || 0).toFixed(2)}
              </Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>MXI de Torneos:</Text>
              <Text style={styles.breakdownValue}>
                {(user.mxiFromChallenges || 0).toFixed(2)}
              </Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>MXI de Comisiones:</Text>
              <Text style={styles.breakdownValue}>
                {(user.mxiFromUnifiedCommissions || 0).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Commissions and Referrals Card */}
        <View style={[commonStyles.card, styles.commissionsCard]}>
          <Text style={styles.cardTitle}>Comisiones y Referidos</Text>
          <View style={styles.commissionsGrid}>
            <View style={styles.commissionItem}>
              <IconSymbol 
                ios_icon_name="dollarsign.circle.fill" 
                android_material_icon_name="attach_money" 
                size={32} 
                color={colors.success} 
              />
              <Text style={styles.commissionValue}>
                ${commissions.available.toFixed(2)}
              </Text>
              <Text style={styles.commissionLabel}>Disponibles</Text>
            </View>
            <View style={styles.commissionItem}>
              <IconSymbol 
                ios_icon_name="chart.bar.fill" 
                android_material_icon_name="bar_chart" 
                size={32} 
                color={colors.primary} 
              />
              <Text style={styles.commissionValue}>
                ${commissions.total.toFixed(2)}
              </Text>
              <Text style={styles.commissionLabel}>Total Comisiones</Text>
            </View>
            <View style={styles.commissionItem}>
              <IconSymbol 
                ios_icon_name="person.3.fill" 
                android_material_icon_name="group" 
                size={32} 
                color={colors.accent} 
              />
              <Text style={styles.commissionValue}>
                {user.activeReferrals}
              </Text>
              <Text style={styles.commissionLabel}>Referidos Activos</Text>
            </View>
            <View style={styles.commissionItem}>
              <IconSymbol 
                ios_icon_name="banknote.fill" 
                android_material_icon_name="payments" 
                size={32} 
                color={colors.warning} 
              />
              <Text style={styles.commissionValue}>
                ${user.usdtContributed.toFixed(2)}
              </Text>
              <Text style={styles.commissionLabel}>USDT Contribuido</Text>
            </View>
          </View>
        </View>

        {/* Phases and Progress Card */}
        {phaseInfo && (
          <View style={[commonStyles.card, styles.phasesCard]}>
            <Text style={styles.cardTitle}>Fases y Progreso</Text>
            
            <View style={styles.currentPhaseInfo}>
              <Text style={styles.currentPhaseLabel}>Fase Actual: {phaseInfo.currentPhase}</Text>
              <Text style={styles.currentPhasePrice}>
                ${phaseInfo.currentPriceUsdt.toFixed(2)} USDT por MXI
              </Text>
            </View>

            <View style={styles.phasesList}>
              <View style={styles.phaseItem}>
                <Text style={styles.phaseLabel}>Fase 1 (0.40 USDT)</Text>
                <Text style={styles.phaseValue}>
                  Vendidos: {phaseInfo.phase1.sold.toLocaleString()} MXI
                </Text>
                <Text style={styles.phaseValue}>
                  Restantes: {phaseInfo.phase1.remaining.toLocaleString()} MXI
                </Text>
              </View>
              <View style={styles.phaseItem}>
                <Text style={styles.phaseLabel}>Fase 2 (0.70 USDT)</Text>
                <Text style={styles.phaseValue}>
                  Vendidos: {phaseInfo.phase2.sold.toLocaleString()} MXI
                </Text>
                <Text style={styles.phaseValue}>
                  Restantes: {phaseInfo.phase2.remaining.toLocaleString()} MXI
                </Text>
              </View>
              <View style={styles.phaseItem}>
                <Text style={styles.phaseLabel}>Fase 3 (1.00 USDT)</Text>
                <Text style={styles.phaseValue}>
                  Vendidos: {phaseInfo.phase3.sold.toLocaleString()} MXI
                </Text>
                <Text style={styles.phaseValue}>
                  Restantes: {phaseInfo.phase3.remaining.toLocaleString()} MXI
                </Text>
              </View>
            </View>

            <View style={styles.overallProgress}>
              <Text style={styles.overallProgressLabel}>Progreso General</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${Math.min(phaseInfo.overallProgress, 100)}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {phaseInfo.overallProgress.toFixed(2)}% - {phaseInfo.totalSold.toLocaleString()} / 25,000,000 MXI
              </Text>
              <Text style={styles.progressSubtext}>
                Saldo Restante: {phaseInfo.totalRemaining.toLocaleString()} MXI
              </Text>
            </View>

            <View style={styles.poolCloseInfo}>
              <IconSymbol 
                ios_icon_name="clock.fill" 
                android_material_icon_name="schedule" 
                size={20} 
                color={colors.textSecondary} 
              />
              <Text style={styles.poolCloseText}>
                Cierre del Pool: {new Date(phaseInfo.poolCloseDate).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>
        )}

        {/* Admin Panel Access */}
        {!checkingAdmin && isAdmin && (
          <TouchableOpacity
            style={[commonStyles.card, styles.adminCard]}
            onPress={() => router.push('/(tabs)/(admin)')}
          >
            <View style={styles.adminHeader}>
              <View style={styles.adminIconContainer}>
                <IconSymbol 
                  ios_icon_name="shield.fill" 
                  android_material_icon_name="admin_panel_settings" 
                  size={32} 
                  color={colors.error} 
                />
              </View>
              <View style={styles.adminInfo}>
                <Text style={styles.adminTitle}>Panel de Administrador</Text>
                <Text style={styles.adminSubtitle}>Gestionar usuarios y sistema</Text>
              </View>
              <IconSymbol 
                ios_icon_name="chevron.right" 
                android_material_icon_name="chevron_right" 
                size={24} 
                color={colors.error} 
              />
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <React.Fragment key={item.id}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.push(item.route as any)}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIconContainer}>
                    <IconSymbol ios_icon_name={item.icon} android_material_icon_name={item.androidIcon} size={24} color={colors.primary} />
                  </View>
                  <View style={styles.menuItemText}>
                    <Text style={styles.menuItemTitle}>{item.title}</Text>
                    <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
                <IconSymbol ios_icon_name="chevron.right" android_material_icon_name="chevron_right" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
              {index < menuItems.length - 1 && <View style={styles.menuDivider} />}
            </React.Fragment>
          ))}
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <ActivityIndicator color={colors.error} />
          ) : (
            <React.Fragment>
              <IconSymbol ios_icon_name="rectangle.portrait.and.arrow.right" android_material_icon_name="logout" size={20} color={colors.error} />
              <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
            </React.Fragment>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Miembro desde {new Date(user.joinedDate).toLocaleDateString()}
          </Text>
          <Text style={styles.footerText}>
            ID: {user.idNumber}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  referralCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  referralCodeLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  referralCode: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  totalBalanceCard: {
    marginBottom: 16,
    backgroundColor: colors.primary + '15',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  totalBalanceValue: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  balanceBreakdown: {
    gap: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '30',
  },
  breakdownLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  commissionsCard: {
    marginBottom: 16,
  },
  commissionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  commissionItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    gap: 8,
  },
  commissionValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  commissionLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  phasesCard: {
    marginBottom: 16,
  },
  currentPhaseInfo: {
    backgroundColor: colors.primary + '20',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  currentPhaseLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  currentPhasePrice: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.primary,
  },
  phasesList: {
    gap: 12,
    marginBottom: 16,
  },
  phaseItem: {
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  phaseLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  phaseValue: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  overallProgress: {
    marginBottom: 16,
  },
  overallProgressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  progressBar: {
    height: 12,
    backgroundColor: colors.border,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  progressSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  poolCloseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  poolCloseText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  adminCard: {
    marginBottom: 24,
    backgroundColor: colors.error + '15',
    borderWidth: 2,
    borderColor: colors.error,
  },
  adminHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  adminIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminInfo: {
    flex: 1,
  },
  adminTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.error,
    marginBottom: 4,
  },
  adminSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  menuSection: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 72,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.card,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.error,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
  footer: {
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
