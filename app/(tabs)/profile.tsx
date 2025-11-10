
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

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  if (!user) return null;

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const joinDate = new Date(user.joinedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <IconSymbol name="person.circle.fill" size={80} color={colors.primary} />
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        {/* Account Info */}
        <View style={[commonStyles.card, styles.section]}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID Number</Text>
            <Text style={styles.infoValue}>{user.idNumber}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={styles.infoValue}>{user.address}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Member Since</Text>
            <Text style={styles.infoValue}>{joinDate}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Referral Code</Text>
            <Text style={[styles.infoValue, styles.referralCode]}>
              {user.referralCode}
            </Text>
          </View>
        </View>

        {/* Portfolio Summary */}
        <View style={[commonStyles.card, styles.section]}>
          <Text style={styles.sectionTitle}>Portfolio Summary</Text>
          
          <View style={styles.portfolioGrid}>
            <View style={styles.portfolioItem}>
              <IconSymbol name="bitcoinsign.circle.fill" size={32} color={colors.primary} />
              <Text style={styles.portfolioValue}>{user.mxiBalance.toFixed(2)}</Text>
              <Text style={styles.portfolioLabel}>MXI Balance</Text>
            </View>

            <View style={styles.portfolioItem}>
              <IconSymbol name="dollarsign.circle.fill" size={32} color={colors.secondary} />
              <Text style={styles.portfolioValue}>
                ${user.usdtContributed.toFixed(2)}
              </Text>
              <Text style={styles.portfolioLabel}>Total Invested</Text>
            </View>
          </View>
        </View>

        {/* Referral Stats */}
        <View style={[commonStyles.card, styles.section]}>
          <Text style={styles.sectionTitle}>Referral Statistics</Text>
          
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.activeReferrals}</Text>
              <Text style={styles.statLabel}>Active Referrals</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {user.referrals.level1 + user.referrals.level2 + user.referrals.level3}
              </Text>
              <Text style={styles.statLabel}>Total Referrals</Text>
            </View>
          </View>

          <View style={styles.commissionRow}>
            <Text style={styles.commissionLabel}>Total Commissions</Text>
            <Text style={styles.commissionValue}>
              ${user.commissions.total.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/(home)/referrals')}
          >
            <IconSymbol name="person.2.fill" size={20} color={colors.primary} />
            <Text style={styles.actionButtonText}>Manage Referrals</Text>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/(home)/contribute')}
          >
            <IconSymbol name="plus.circle.fill" size={20} color={colors.primary} />
            <Text style={styles.actionButtonText}>Add Funds</Text>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
            <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color={colors.error} />
            <Text style={[styles.actionButtonText, styles.logoutText]}>Logout</Text>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Maxcoin Liquidity Pool v1.0</Text>
          <Text style={styles.appInfoText}>© 2025 Maxcoin. All rights reserved.</Text>
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
  scrollContent: {
    padding: 20,
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
    fontSize: 16,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  referralCode: {
    color: colors.primary,
    fontWeight: '700',
  },
  portfolioGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  portfolioItem: {
    flex: 1,
    alignItems: 'center',
  },
  portfolioValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  portfolioLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  commissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  commissionLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  commissionValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.secondary,
  },
  actionsSection: {
    marginBottom: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
    elevation: 2,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 12,
  },
  logoutText: {
    color: colors.error,
  },
  appInfo: {
    alignItems: 'center',
    paddingTop: 16,
  },
  appInfoText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
});
