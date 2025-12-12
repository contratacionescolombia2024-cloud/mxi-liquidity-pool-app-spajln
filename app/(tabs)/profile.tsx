
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { IconSymbol } from '@/components/IconSymbol';
import { showConfirm } from '@/utils/confirmDialog';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, checkAdminStatus } = useAuth();
  const { t } = useLanguage();
  const [loggingOut, setLoggingOut] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

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

  const handleLogout = () => {
    console.log('Logout button pressed, showing confirmation dialog');
    showConfirm({
      title: t('logout'),
      message: t('areYouSureLogout'),
      confirmText: t('logout'),
      cancelText: t('cancel'),
      type: 'warning',
      icon: {
        ios: 'rectangle.portrait.and.arrow.right',
        android: 'logout',
      },
      onConfirm: async () => {
        console.log('Logout confirmed');
        setLoggingOut(true);
        try {
          await logout();
          console.log('Logout successful');
        } catch (error) {
          console.error('Error during logout:', error);
        } finally {
          setLoggingOut(false);
        }
      },
      onCancel: () => {
        console.log('Logout cancelled');
      },
    });
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

  const getKYCStatusText = () => {
    switch (user.kycStatus) {
      case 'approved': return t('approved');
      case 'pending': return t('pending');
      case 'rejected': return t('rejected');
      default: return t('notSubmitted');
    }
  };

  const menuItems = [
    {
      id: 'edit-profile',
      title: t('editProfile'),
      subtitle: t('updateYourInfo'),
      icon: 'person.fill',
      androidIcon: 'person',
      route: '/(tabs)/(home)/edit-profile',
    },
    {
      id: 'kyc',
      title: t('kycVerification'),
      subtitle: getKYCStatusText(),
      icon: 'checkmark.shield.fill',
      androidIcon: 'verified_user',
      route: '/(tabs)/(home)/kyc-verification',
    },
    {
      id: 'vesting',
      title: t('vestingAndYield'),
      subtitle: t('viewYieldGeneration'),
      icon: 'chart.line.uptrend.xyaxis',
      androidIcon: 'trending_up',
      route: '/(tabs)/(home)/vesting',
    },
    {
      id: 'withdrawals',
      title: t('withdrawalHistory'),
      subtitle: t('viewPreviousWithdrawals'),
      icon: 'arrow.down.circle.fill',
      androidIcon: 'arrow_circle_down',
      route: '/(tabs)/(home)/withdrawals',
    },
    {
      id: 'challenge-history',
      title: t('challengeHistory'),
      subtitle: t('viewGameRecords'),
      icon: 'clock.fill',
      androidIcon: 'history',
      route: '/(tabs)/(home)/challenge-history',
    },
    {
      id: 'support',
      title: t('support'),
      subtitle: t('getHelp'),
      icon: 'questionmark.circle.fill',
      androidIcon: 'help',
      route: '/(tabs)/(home)/support',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>{t('profile')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <IconSymbol ios_icon_name="person.circle.fill" android_material_icon_name="account_circle" size={80} color={colors.primary} />
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.referralCodeContainer}>
            <Text style={styles.referralCodeLabel}>{t('referralCode')}:</Text>
            <Text style={styles.referralCode}>{user.referralCode}</Text>
          </View>
        </View>

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
                <Text style={styles.adminTitle}>{t('adminPanel')}</Text>
                <Text style={styles.adminSubtitle}>{t('manageUsers')}</Text>
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
              <Text style={styles.logoutButtonText}>{t('logout')}</Text>
            </React.Fragment>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {t('memberSince')} {new Date(user.joinedDate).toLocaleDateString()}
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
