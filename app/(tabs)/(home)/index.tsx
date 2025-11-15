
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import ActionButton from '@/components/ActionButton';
import MenuButton from '@/components/MenuButton';
import VestingCounter from '@/components/VestingCounter';
import Footer from '@/components/Footer';

interface PhaseInfo {
  totalTokensSold: number;
  currentPhase: number;
  currentPriceUsdt: number;
  phase1TokensSold: number;
  phase2TokensSold: number;
  phase3TokensSold: number;
  phase1Remaining: number;
  phase2Remaining: number;
  tokensUntilNextPhase: number;
}

export default function HomeScreen() {
  const { user, logout, getPoolStatus, getPhaseInfo } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [poolCloseDate, setPoolCloseDate] = useState<Date | null>(null);
  const [phaseInfo, setPhaseInfo] = useState<PhaseInfo | null>(null);

  useEffect(() => {
    loadPoolStatus();
    loadPhaseInfo();
  }, []);

  useEffect(() => {
    if (poolCloseDate) {
      console.log('Pool closes on:', poolCloseDate);
    }
  }, [poolCloseDate]);

  const loadPoolStatus = async () => {
    const status = await getPoolStatus();
    if (status) {
      setPoolCloseDate(new Date(status.pool_close_date));
    }
  };

  const loadPhaseInfo = async () => {
    const info = await getPhaseInfo();
    if (info) {
      setPhaseInfo(info);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPoolStatus();
    await loadPhaseInfo();
    setRefreshing(false);
  };

  const getPhaseDescription = (phase: number) => {
    switch (phase) {
      case 1:
        return 'Early Bird Phase - Best Price!';
      case 2:
        return 'Growth Phase - Limited Time';
      case 3:
        return 'Final Phase - Last Chance';
      default:
        return 'Pre-Sale Phase';
    }
  };

  const getPhaseProgress = () => {
    if (!phaseInfo) return 0;
    const maxTokensPerPhase = 8333333;
    const currentPhaseTokens = 
      phaseInfo.currentPhase === 1 ? phaseInfo.phase1TokensSold :
      phaseInfo.currentPhase === 2 ? phaseInfo.phase2TokensSold :
      phaseInfo.phase3TokensSold;
    return (currentPhaseTokens / maxTokensPerPhase) * 100;
  };

  return (
    <SafeAreaView style={styles.container}>
      <MenuButton />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/04a4d9ac-4539-41d2-bafd-67dd75925bde.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
          </View>
        </View>

        {/* Balance Card */}
        <View style={[commonStyles.card, styles.balanceCard]}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Your MXI Balance</Text>
            <TouchableOpacity onPress={onRefresh}>
              <IconSymbol 
                ios_icon_name="arrow.clockwise" 
                android_material_icon_name="refresh" 
                size={20} 
                color={colors.primary} 
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceAmount}>
            {user?.mxiBalance.toFixed(2) || '0.00'} MXI
          </Text>
          <Text style={styles.balanceSubtext}>
            USDT Contributed: ${user?.usdtContributed.toFixed(2) || '0.00'}
          </Text>
        </View>

        {/* Phase Info Card */}
        {phaseInfo && (
          <View style={[commonStyles.card, styles.phaseCard]}>
            <View style={styles.phaseHeader}>
              <View>
                <Text style={styles.phaseTitle}>Phase {phaseInfo.currentPhase}</Text>
                <Text style={styles.phaseSubtitle}>{getPhaseDescription(phaseInfo.currentPhase)}</Text>
              </View>
              <View style={styles.phasePriceContainer}>
                <Text style={styles.phasePrice}>${phaseInfo.currentPriceUsdt}</Text>
                <Text style={styles.phasePriceLabel}>per MXI</Text>
              </View>
            </View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${getPhaseProgress()}%` }]} />
              </View>
              <Text style={styles.progressText}>{getPhaseProgress().toFixed(1)}% Complete</Text>
            </View>

            <View style={styles.phaseStats}>
              <View style={styles.phaseStat}>
                <Text style={styles.phaseStatValue}>{phaseInfo.totalTokensSold.toLocaleString()}</Text>
                <Text style={styles.phaseStatLabel}>Total Sold</Text>
              </View>
              <View style={styles.phaseStatDivider} />
              <View style={styles.phaseStat}>
                <Text style={styles.phaseStatValue}>{phaseInfo.tokensUntilNextPhase.toLocaleString()}</Text>
                <Text style={styles.phaseStatLabel}>Until Next Phase</Text>
              </View>
            </View>
          </View>
        )}

        {/* Vesting Counter */}
        {poolCloseDate && <VestingCounter targetDate={poolCloseDate} />}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.menuGrid}>
            <ActionButton
              title="Contribute"
              subtitle="Add USDT"
              icon="plus.circle.fill"
              androidIcon="add_circle"
              onPress={() => router.push('/(tabs)/(home)/contribute')}
              color={colors.primary}
            />
            <ActionButton
              title="Referrals"
              subtitle="Earn rewards"
              icon="person.2.fill"
              androidIcon="group"
              onPress={() => router.push('/(tabs)/(home)/referrals')}
              color={colors.success}
            />
            <ActionButton
              title="Vesting"
              subtitle="View yield"
              icon="chart.line.uptrend.xyaxis"
              androidIcon="trending_up"
              onPress={() => router.push('/(tabs)/(home)/vesting')}
              color={colors.warning}
            />
            <ActionButton
              title="Withdraw"
              subtitle="Cash out"
              icon="arrow.up.circle.fill"
              androidIcon="arrow-circle-up"
              onPress={() => router.push('/(tabs)/(home)/withdrawal')}
              color={colors.error}
            />
          </View>
        </View>

        {/* Additional Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>More Features</Text>
          <View style={styles.menuGrid}>
            <ActionButton
              title="Bonus MXI"
              subtitle="Win prizes"
              icon="gift.fill"
              androidIcon="card_giftcard"
              onPress={() => router.push('/(tabs)/(home)/lottery')}
              color="#FF6B6B"
            />
            <ActionButton
              title="Clickers"
              subtitle="Compete"
              icon="hand.tap.fill"
              androidIcon="touch_app"
              onPress={() => router.push('/(tabs)/(home)/clickers')}
              color="#4ECDC4"
            />
            <ActionButton
              title="KYC"
              subtitle="Verify identity"
              icon="checkmark.seal.fill"
              androidIcon="verified_user"
              onPress={() => router.push('/(tabs)/(home)/kyc-verification')}
              color="#95E1D3"
            />
            <ActionButton
              title="Support"
              subtitle="Get help"
              icon="questionmark.circle.fill"
              androidIcon="help"
              onPress={() => router.push('/(tabs)/(home)/support')}
              color="#F38181"
            />
          </View>
        </View>

        {/* Footer */}
        <Footer />
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 60,
  },
  logoContainer: {
    width: 60,
    height: 60,
    marginRight: 16,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  headerText: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  balanceCard: {
    marginBottom: 16,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  balanceSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  phaseCard: {
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  phaseTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  phaseSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  phasePriceContainer: {
    alignItems: 'flex-end',
  },
  phasePrice: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
  },
  phasePriceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  phaseStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  phaseStat: {
    alignItems: 'center',
  },
  phaseStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  phaseStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  phaseStatDivider: {
    width: 1,
    backgroundColor: colors.border,
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
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
