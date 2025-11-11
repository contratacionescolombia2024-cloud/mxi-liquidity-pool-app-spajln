
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
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
  const { user, logout } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', user.id)
        .single();

      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error checking admin status:', error);
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

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <IconSymbol name="person.circle.fill" size={80} color={colors.primary} />
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          {user.kycStatus === 'approved' && (
            <View style={styles.verifiedBadge}>
              <IconSymbol name="checkmark.seal.fill" size={16} color={colors.success} />
              <Text style={styles.verifiedText}>KYC Verified</Text>
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
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          {isAdmin && (
            <TouchableOpacity
              style={[commonStyles.card, styles.menuItem, styles.adminMenuItem]}
              onPress={() => router.push('/(tabs)/(admin)')}
            >
              <View style={styles.menuItemContent}>
                <IconSymbol name="shield.lefthalf.filled" size={24} color={colors.error} />
                <Text style={[styles.menuItemText, styles.adminMenuText]}>Admin Dashboard</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.error} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[commonStyles.card, styles.menuItem]}
            onPress={() => router.push('/(tabs)/(home)/support')}
          >
            <View style={styles.menuItemContent}>
              <IconSymbol name="questionmark.circle.fill" size={24} color={colors.primary} />
              <Text style={styles.menuItemText}>Support & Help</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[commonStyles.card, styles.menuItem]}
            onPress={() => router.push('/(tabs)/(home)/kyc-verification')}
          >
            <View style={styles.menuItemContent}>
              <IconSymbol name="person.badge.shield.checkmark" size={24} color={colors.warning} />
              <Text style={styles.menuItemText}>KYC Verification</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[commonStyles.card, styles.menuItem]}
            onPress={() => router.push('/(tabs)/(home)/withdrawals')}
          >
            <View style={styles.menuItemContent}>
              <IconSymbol name="arrow.down.circle" size={24} color={colors.success} />
              <Text style={styles.menuItemText}>Withdrawal History</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[commonStyles.card, styles.menuItem]}
            onPress={() => router.push('/(tabs)/(home)/binance-payments')}
          >
            <View style={styles.menuItemContent}>
              <IconSymbol name="creditcard" size={24} color={colors.primary} />
              <Text style={styles.menuItemText}>Payment History</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[commonStyles.card, styles.logoutButton]}
          onPress={handleLogout}
        >
          <IconSymbol name="rectangle.portrait.and.arrow.right" size={24} color={colors.error} />
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
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
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
    borderWidth: 2,
    borderColor: colors.error,
    backgroundColor: colors.error + '10',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  adminMenuText: {
    color: colors.error,
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
