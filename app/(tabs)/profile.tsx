
import React from 'react';
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
import { useState, useEffect } from 'react';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, checkAdminStatus: checkAdmin } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [adminCheckAttempts, setAdminCheckAttempts] = useState(0);

  useEffect(() => {
    if (user) {
      performAdminCheck();
    }
  }, [user]);

  const performAdminCheck = async () => {
    if (!user) {
      console.log('No user found, skipping admin check');
      setCheckingAdmin(false);
      return;
    }

    try {
      console.log('=== ADMIN CHECK START ===');
      console.log('User ID:', user.id);
      console.log('User Email:', user.email);
      console.log('Check attempt:', adminCheckAttempts + 1);
      
      setAdminCheckAttempts(prev => prev + 1);

      // Direct database query for debugging
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('id, role, permissions')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('Direct admin query result:', adminData);
      console.log('Direct admin query error:', adminError);

      // Use the context method
      const isAdminUser = await checkAdmin();
      console.log('Context checkAdmin result:', isAdminUser);
      console.log('=== ADMIN CHECK END ===');
      
      setIsAdmin(isAdminUser);
    } catch (error) {
      console.error('Exception during admin check:', error);
      setIsAdmin(false);
    } finally {
      setCheckingAdmin(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const handleRefreshAdminStatus = () => {
    setCheckingAdmin(true);
    performAdminCheck();
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <IconSymbol 
              ios_icon_name="person.circle.fill" 
              android_material_icon_name="account_circle" 
              size={80} 
              color={colors.primary} 
            />
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          {user.kycStatus === 'approved' && (
            <View style={styles.verifiedBadge}>
              <IconSymbol 
                ios_icon_name="checkmark.seal.fill" 
                android_material_icon_name="verified" 
                size={16} 
                color={colors.success} 
              />
              <Text style={styles.verifiedText}>KYC Verified</Text>
            </View>
          )}
          {isAdmin && (
            <View style={styles.adminBadge}>
              <IconSymbol 
                ios_icon_name="shield.lefthalf.filled" 
                android_material_icon_name="shield" 
                size={16} 
                color={colors.error} 
              />
              <Text style={styles.adminBadgeText}>Administrator</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>

          <View style={[commonStyles.card, styles.infoCard]}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ID Number</Text>
              <Text style={styles.infoValue}>{user.idNumber}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Referral Code</Text>
              <Text style={styles.infoValue}>{user.referralCode}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Member Since</Text>
              <Text style={styles.infoValue}>
                {new Date(user.joinedDate).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            {checkingAdmin && (
              <TouchableOpacity onPress={handleRefreshAdminStatus}>
                <IconSymbol 
                  ios_icon_name="arrow.clockwise" 
                  android_material_icon_name="refresh" 
                  size={20} 
                  color={colors.primary} 
                />
              </TouchableOpacity>
            )}
          </View>

          {checkingAdmin ? (
            <View style={[commonStyles.card, styles.menuItem]}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.menuItemText}>Checking admin access...</Text>
            </View>
          ) : isAdmin ? (
            <TouchableOpacity
              style={[commonStyles.card, styles.menuItem, styles.adminMenuItem]}
              onPress={() => {
                console.log('Navigating to admin dashboard');
                router.push('/(tabs)/(admin)');
              }}
            >
              <View style={styles.menuItemContent}>
                <View style={styles.adminIconContainer}>
                  <IconSymbol 
                    ios_icon_name="shield.lefthalf.filled" 
                    android_material_icon_name="shield" 
                    size={28} 
                    color="#FFFFFF" 
                  />
                </View>
                <View style={styles.menuItemTextContainer}>
                  <Text style={[styles.menuItemText, styles.adminMenuText]}>Admin Dashboard</Text>
                  <Text style={styles.adminMenuSubtext}>Manage users, KYC, and withdrawals</Text>
                </View>
              </View>
              <IconSymbol 
                ios_icon_name="chevron.right" 
                android_material_icon_name="chevron_right" 
                size={24} 
                color={colors.error} 
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[commonStyles.card, styles.menuItem, styles.debugItem]}
              onPress={handleRefreshAdminStatus}
            >
              <View style={styles.menuItemContent}>
                <IconSymbol 
                  ios_icon_name="arrow.clockwise" 
                  android_material_icon_name="refresh" 
                  size={24} 
                  color={colors.textSecondary} 
                />
                <Text style={[styles.menuItemText, styles.debugText]}>
                  Refresh Admin Status (Attempts: {adminCheckAttempts})
                </Text>
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[commonStyles.card, styles.menuItem]}
            onPress={() => router.push('/(tabs)/(home)/support')}
          >
            <View style={styles.menuItemContent}>
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIconEmoji}>💬</Text>
              </View>
              <Text style={styles.menuItemText}>Support & Help</Text>
            </View>
            <IconSymbol 
              ios_icon_name="chevron.right" 
              android_material_icon_name="chevron_right" 
              size={20} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[commonStyles.card, styles.menuItem]}
            onPress={() => router.push('/(tabs)/(home)/kyc-verification')}
          >
            <View style={styles.menuItemContent}>
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIconEmoji}>🔐</Text>
              </View>
              <Text style={styles.menuItemText}>KYC Verification</Text>
            </View>
            <IconSymbol 
              ios_icon_name="chevron.right" 
              android_material_icon_name="chevron_right" 
              size={20} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[commonStyles.card, styles.menuItem]}
            onPress={() => router.push('/(tabs)/(home)/withdrawals')}
          >
            <View style={styles.menuItemContent}>
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIconEmoji}>💸</Text>
              </View>
              <Text style={styles.menuItemText}>Withdrawal History</Text>
            </View>
            <IconSymbol 
              ios_icon_name="chevron.right" 
              android_material_icon_name="chevron_right" 
              size={20} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[commonStyles.card, styles.menuItem]}
            onPress={() => router.push('/(tabs)/(home)/binance-payments')}
          >
            <View style={styles.menuItemContent}>
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIconEmoji}>💳</Text>
              </View>
              <Text style={styles.menuItemText}>Payment History</Text>
            </View>
            <IconSymbol 
              ios_icon_name="chevron.right" 
              android_material_icon_name="chevron_right" 
              size={20} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[commonStyles.card, styles.logoutButton]}
          onPress={handleLogout}
        >
          <IconSymbol 
            ios_icon_name="rectangle.portrait.and.arrow.right" 
            android_material_icon_name="logout" 
            size={24} 
            color={colors.error} 
          />
          <Text style={styles.logoutText}>Logout</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.success + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.error,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 4,
  },
  adminBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  infoCard: {
    padding: 0,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    padding: 16,
  },
  adminMenuItem: {
    borderWidth: 3,
    borderColor: colors.error,
    backgroundColor: colors.error + '15',
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 20,
    padding: 18,
  },
  debugItem: {
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  adminIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuIconEmoji: {
    fontSize: 24,
  },
  menuItemTextContainer: {
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  adminMenuText: {
    color: colors.error,
    fontSize: 18,
    fontWeight: '700',
  },
  adminMenuSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  debugText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    marginTop: 24,
    borderWidth: 2,
    borderColor: colors.error,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
});
