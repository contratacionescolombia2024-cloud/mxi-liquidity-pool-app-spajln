
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import * as Clipboard from 'expo-clipboard';

export default function ReferralsScreen() {
  const { user, getCurrentYield } = useAuth();
  const router = useRouter();
  const [currentYield, setCurrentYield] = useState(0);

  useEffect(() => {
    if (user && getCurrentYield) {
      const yield_value = getCurrentYield();
      setCurrentYield(yield_value);
    }
  }, [user, getCurrentYield]);

  const handleCopyCode = async () => {
    if (!user?.referralCode) return;
    await Clipboard.setStringAsync(user.referralCode);
    Alert.alert('Copied!', 'Referral code copied to clipboard');
  };

  const handleShare = async () => {
    if (!user?.referralCode) return;

    try {
      await Share.share({
        message: `Join MXI Pool with my referral code: ${user.referralCode}\n\nEarn MXI tokens and get rewards!`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol ios_icon_name="chevron.left" android_material_icon_name="arrow_back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Referrals</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Referral Code Card */}
        <View style={[commonStyles.card, styles.codeCard]}>
          <View style={styles.codeHeader}>
            <IconSymbol 
              ios_icon_name="person.2.fill" 
              android_material_icon_name="people" 
              size={32} 
              color={colors.primary} 
            />
            <Text style={styles.codeTitle}>Your Referral Code</Text>
          </View>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{user?.referralCode || 'N/A'}</Text>
            <TouchableOpacity onPress={handleCopyCode} style={styles.copyButton}>
              <IconSymbol 
                ios_icon_name="doc.on.doc" 
                android_material_icon_name="content_copy" 
                size={20} 
                color={colors.primary} 
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={[buttonStyles.primary, styles.shareButton]} onPress={handleShare}>
            <IconSymbol 
              ios_icon_name="square.and.arrow.up" 
              android_material_icon_name="share" 
              size={20} 
              color="#fff" 
            />
            <Text style={buttonStyles.primaryText}>Share Code</Text>
          </TouchableOpacity>
        </View>

        {/* Commission Stats - All in MXI */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Commission Balance (MXI)</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Earned</Text>
              <Text style={styles.statValue}>{user?.mxiBalance.toFixed(4) || '0.0000'} MXI</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Available</Text>
              <Text style={[styles.statValue, { color: colors.success }]}>
                {user?.mxiBalance.toFixed(4) || '0.0000'} MXI
              </Text>
            </View>
          </View>
          <Text style={styles.infoNote}>
            💡 All commissions are handled internally in MXI
          </Text>
        </View>

        {/* Referral Stats */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Your Referrals</Text>
          <View style={styles.referralsList}>
            <View style={styles.referralItem}>
              <View style={styles.referralLevel}>
                <Text style={styles.referralLevelText}>Level 1</Text>
                <Text style={styles.referralRate}>3%</Text>
              </View>
              <Text style={styles.referralCount}>{user?.referrals.level1 || 0} referrals</Text>
            </View>
            <View style={styles.referralItem}>
              <View style={styles.referralLevel}>
                <Text style={styles.referralLevelText}>Level 2</Text>
                <Text style={styles.referralRate}>2%</Text>
              </View>
              <Text style={styles.referralCount}>{user?.referrals.level2 || 0} referrals</Text>
            </View>
            <View style={styles.referralItem}>
              <View style={styles.referralLevel}>
                <Text style={styles.referralLevelText}>Level 3</Text>
                <Text style={styles.referralRate}>1%</Text>
              </View>
              <Text style={styles.referralCount}>{user?.referrals.level3 || 0} referrals</Text>
            </View>
          </View>
          <View style={styles.activeReferrals}>
            <Text style={styles.activeLabel}>Active Referrals (Level 1):</Text>
            <Text style={styles.activeValue}>{user?.activeReferrals || 0}</Text>
          </View>
        </View>

        {/* How It Works */}
        <View style={[commonStyles.card, styles.infoCard]}>
          <View style={styles.infoHeader}>
            <IconSymbol 
              ios_icon_name="info.circle.fill" 
              android_material_icon_name="info" 
              size={24} 
              color={colors.primary} 
            />
            <Text style={styles.infoTitle}>How Referrals Work</Text>
          </View>
          <View style={styles.infoList}>
            <Text style={styles.infoItem}>• Share your referral code with friends</Text>
            <Text style={styles.infoItem}>• Earn 3% in MXI from Level 1 referrals</Text>
            <Text style={styles.infoItem}>• Earn 2% in MXI from Level 2 referrals</Text>
            <Text style={styles.infoItem}>• Earn 1% in MXI from Level 3 referrals</Text>
            <Text style={styles.infoItem}>• All commissions are credited directly in MXI</Text>
            <Text style={styles.infoItem}>• Need 5 active Level 1 referrals to withdraw</Text>
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  codeCard: {
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  codeHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  codeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  codeText: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  copyButton: {
    padding: 8,
  },
  shareButton: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  infoNote: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
  referralsList: {
    gap: 12,
    marginBottom: 16,
  },
  referralItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  referralLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  referralLevelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  referralRate: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  referralCount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  activeReferrals: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.success + '20',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.success + '40',
  },
  activeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  activeValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.success,
  },
  infoCard: {
    backgroundColor: colors.primary + '10',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  infoList: {
    gap: 8,
  },
  infoItem: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
