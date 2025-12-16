
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { i18n } from '@/constants/i18n';

interface Metrics {
  total_members: number;
  total_usdt_contributed: number;
  total_mxi_distributed: number;
}

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);

      // Get total members
      const { count: membersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Get total USDT contributed
      const { data: usdtData } = await supabase
        .from('users')
        .select('usdt_contributed');

      const totalUsdt = usdtData?.reduce((sum, user) => sum + (user.usdt_contributed || 0), 0) || 0;

      // Get total MXI distributed
      const { data: mxiData } = await supabase
        .from('users')
        .select('mxi_balance');

      const totalMxi = mxiData?.reduce((sum, user) => sum + (user.mxi_balance || 0), 0) || 0;

      setMetrics({
        total_members: membersCount || 0,
        total_usdt_contributed: totalUsdt,
        total_mxi_distributed: totalMxi,
      });
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSystem = async () => {
    if (resetConfirmText !== 'RESET' && resetConfirmText !== 'RESETEAR') {
      Alert.alert(i18n.t('error'), i18n.t('mustTypeReset'));
      return;
    }

    try {
      setResetting(true);

      // Reset all user balances
      const { error: usersError } = await supabase
        .from('users')
        .update({
          mxi_balance: 0,
          usdt_contributed: 0,
          active_referrals: 0,
          can_withdraw: false,
          accumulated_yield: 0,
        })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (usersError) throw usersError;

      // Delete all commissions
      const { error: commissionsError } = await supabase
        .from('commissions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (commissionsError) throw commissionsError;

      // Delete all contributions
      const { error: contributionsError } = await supabase
        .from('contributions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (contributionsError) throw contributionsError;

      // Delete all withdrawals
      const { error: withdrawalsError } = await supabase
        .from('withdrawals')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (withdrawalsError) throw withdrawalsError;

      Alert.alert(
        i18n.t('systemReset'),
        i18n.t('systemResetSuccess'),
        [
          {
            text: i18n.t('ok'),
            onPress: () => {
              setShowResetConfirm(false);
              setResetConfirmText('');
              loadMetrics();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error resetting system:', error);
      Alert.alert(i18n.t('error'), i18n.t('resetError') + ': ' + error.message);
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{i18n.t('adminDashboard')}</Text>
          <Text style={styles.subtitle}>{i18n.t('welcome')}, {user?.email}</Text>
        </View>

        {/* Metrics */}
        <View style={styles.metricsContainer}>
          <Text style={styles.sectionTitle}>{i18n.t('presaleMetrics')}</Text>
          <View style={styles.metricsGrid}>
            <View style={[commonStyles.card, styles.metricCard]}>
              <IconSymbol ios_icon_name="person.3.fill" android_material_icon_name="group" size={32} color={colors.primary} />
              <Text style={styles.metricValue}>{metrics?.total_members || 0}</Text>
              <Text style={styles.metricLabel}>{i18n.t('totalMembers')}</Text>
            </View>
            <View style={[commonStyles.card, styles.metricCard]}>
              <IconSymbol ios_icon_name="dollarsign.circle.fill" android_material_icon_name="attach_money" size={32} color={colors.success} />
              <Text style={styles.metricValue}>${(metrics?.total_usdt_contributed || 0).toFixed(2)}</Text>
              <Text style={styles.metricLabel}>{i18n.t('totalUSDT')}</Text>
            </View>
            <View style={[commonStyles.card, styles.metricCard]}>
              <IconSymbol ios_icon_name="chart.line.uptrend.xyaxis" android_material_icon_name="trending_up" size={32} color={colors.primary} />
              <Text style={styles.metricValue}>{(metrics?.total_mxi_distributed || 0).toFixed(2)}</Text>
              <Text style={styles.metricLabel}>{i18n.t('totalMXI')}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{i18n.t('quickActions')}</Text>
          
          <TouchableOpacity
            style={[commonStyles.card, styles.actionCard]}
            onPress={() => router.push('/(tabs)/(admin)/notification-center')}
          >
            <View style={styles.actionIcon}>
              <IconSymbol ios_icon_name="megaphone.fill" android_material_icon_name="campaign" size={24} color={colors.primary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>{i18n.t('notificationCenter')}</Text>
              <Text style={styles.actionSubtitle}>{i18n.t('sendNotificationsToAllUsers')}</Text>
            </View>
            <IconSymbol ios_icon_name="chevron.right" android_material_icon_name="chevron_right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[commonStyles.card, styles.actionCard]}
            onPress={() => router.push('/(tabs)/(admin)/manual-verification-requests')}
          >
            <View style={styles.actionIcon}>
              <IconSymbol ios_icon_name="checkmark.seal.fill" android_material_icon_name="verified" size={24} color={colors.primary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>{i18n.t('manualVerifications')}</Text>
              <Text style={styles.actionSubtitle}>{i18n.t('reviewPaymentRequests')}</Text>
            </View>
            <IconSymbol ios_icon_name="chevron.right" android_material_icon_name="chevron_right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[commonStyles.card, styles.actionCard]}
            onPress={() => router.push('/(tabs)/(admin)/user-management')}
          >
            <View style={styles.actionIcon}>
              <IconSymbol ios_icon_name="person.2.fill" android_material_icon_name="people" size={24} color={colors.primary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>{i18n.t('basicUsers')}</Text>
              <Text style={styles.actionSubtitle}>{i18n.t('manageUsers')}</Text>
            </View>
            <IconSymbol ios_icon_name="chevron.right" android_material_icon_name="chevron_right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[commonStyles.card, styles.actionCard]}
            onPress={() => router.push('/(tabs)/(admin)/withdrawal-approvals')}
          >
            <View style={styles.actionIcon}>
              <IconSymbol ios_icon_name="arrow.down.circle.fill" android_material_icon_name="download" size={24} color={colors.primary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>{i18n.t('withdrawals')}</Text>
              <Text style={styles.actionSubtitle}>{i18n.t('approveWithdrawals')}</Text>
            </View>
            <IconSymbol ios_icon_name="chevron.right" android_material_icon_name="chevron_right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[commonStyles.card, styles.actionCard]}
            onPress={() => router.push('/(tabs)/(admin)/system-notifications')}
          >
            <View style={styles.actionIcon}>
              <IconSymbol ios_icon_name="bell.fill" android_material_icon_name="notifications" size={24} color={colors.primary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>{i18n.t('systemNotifications')}</Text>
              <Text style={styles.actionSubtitle}>{i18n.t('viewNotificationHistory')}</Text>
            </View>
            <IconSymbol ios_icon_name="chevron.right" android_material_icon_name="chevron_right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>{i18n.t('dangerZone')}</Text>
          <Text style={styles.dangerSubtitle}>{i18n.t('dangerZoneSubtitle')}</Text>
          
          {!showResetConfirm ? (
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={() => setShowResetConfirm(true)}
            >
              <IconSymbol ios_icon_name="exclamationmark.triangle.fill" android_material_icon_name="warning" size={20} color="#fff" />
              <Text style={styles.dangerButtonText}>{i18n.t('resetAll')}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.resetConfirmContainer}>
              <Text style={styles.resetConfirmTitle}>{i18n.t('resetSystemTitle')}</Text>
              <Text style={styles.resetConfirmMessage}>{i18n.t('resetSystemMessage')}</Text>
              <View style={styles.resetWarnings}>
                <Text style={styles.resetWarning}>• {i18n.t('resetWarning1')}</Text>
                <Text style={styles.resetWarning}>• {i18n.t('resetWarning2')}</Text>
                <Text style={styles.resetWarning}>• {i18n.t('resetWarning3')}</Text>
                <Text style={styles.resetWarning}>• {i18n.t('resetWarning4')}</Text>
                <Text style={styles.resetWarning}>• {i18n.t('resetWarning5')}</Text>
                <Text style={styles.resetWarning}>• {i18n.t('resetWarning6')}</Text>
                <Text style={styles.resetWarning}>• {i18n.t('resetWarning7')}</Text>
                <Text style={styles.resetWarning}>• {i18n.t('resetWarning8')}</Text>
              </View>
              <Text style={styles.resetPreserved}>✅ {i18n.t('resetPreserved')}</Text>
              <TextInput
                style={styles.resetInput}
                value={resetConfirmText}
                onChangeText={setResetConfirmText}
                placeholder={i18n.t('typeResetToConfirm')}
                placeholderTextColor={colors.textSecondary}
              />
              <View style={styles.resetButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowResetConfirm(false);
                    setResetConfirmText('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>{i18n.t('cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmButton, resetting && styles.confirmButtonDisabled]}
                  onPress={handleResetSystem}
                  disabled={resetting}
                >
                  {resetting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.confirmButtonText}>{i18n.t('confirmReset')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
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
    padding: 24,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
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
  metricsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: 100,
    alignItems: 'center',
    padding: 16,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  dangerZone: {
    backgroundColor: colors.error + '10',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.error,
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.error,
    marginBottom: 8,
  },
  dangerSubtitle: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 16,
  },
  dangerButton: {
    backgroundColor: colors.error,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  resetConfirmContainer: {
    gap: 12,
  },
  resetConfirmTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.error,
  },
  resetConfirmMessage: {
    fontSize: 14,
    color: colors.text,
  },
  resetWarnings: {
    gap: 4,
  },
  resetWarning: {
    fontSize: 13,
    color: colors.text,
  },
  resetPreserved: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '600',
  },
  resetInput: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resetButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: colors.error,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
