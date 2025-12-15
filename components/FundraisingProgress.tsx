
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';

const MAX_FUNDRAISING_GOAL = 17500000; // 17,500,000 USDT (Total de las 3 fases de preventa)

// Helper function to format large numbers with abbreviations
const formatLargeNumber = (num: number, decimals: number = 2): string => {
  if (num >= 1000000) {
    const millions = num / 1000000;
    // Use 1 decimal place for millions to show 17.5M instead of 18M
    return `${millions.toFixed(decimals === 0 ? 1 : decimals)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(decimals)}K`;
  }
  return num.toFixed(decimals);
};

// Helper function to format numbers with commas for display
const formatNumberWithCommas = (num: number, decimals: number = 0): string => {
  return num.toLocaleString('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

interface MXIDistribution {
  total_mxi_purchased: number;
  total_mxi_commissions: number;
  total_mxi_challenges: number;
  total_mxi_vesting: number;
  total_mxi_all_sources: number;
  users_with_purchased: number;
  users_with_commissions: number;
  users_with_challenges: number;
  users_with_vesting: number;
}

export function FundraisingProgress() {
  const { t } = useLanguage();
  const [totalRaised, setTotalRaised] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [refreshCount, setRefreshCount] = useState(0);
  const [showMXIBreakdown, setShowMXIBreakdown] = useState(true); // Changed to true by default
  const [presaleStartDate, setPresaleStartDate] = useState<Date | null>(null);
  const [presaleEndDate, setPresaleEndDate] = useState<Date | null>(null);
  const [mxiDistribution, setMxiDistribution] = useState<MXIDistribution>({
    total_mxi_purchased: 0,
    total_mxi_commissions: 0,
    total_mxi_challenges: 0,
    total_mxi_vesting: 0,
    total_mxi_all_sources: 0,
    users_with_purchased: 0,
    users_with_commissions: 0,
    users_with_challenges: 0,
    users_with_vesting: 0,
  });
  const [debugInfo, setDebugInfo] = useState<{
    userTotal: number;
    adminTotal: number;
    userCount: number;
    adminCount: number;
    finishedTotal: number;
    confirmedTotal: number;
    totalCount: number;
  }>({ 
    userTotal: 0, 
    adminTotal: 0, 
    userCount: 0, 
    adminCount: 0,
    finishedTotal: 0,
    confirmedTotal: 0,
    totalCount: 0,
  });

  useEffect(() => {
    console.log('🚀 [FundraisingProgress] Component mounted, loading data...');
    loadFundraisingData();
    
    // Set up real-time subscription for payments table
    const paymentsChannel = supabase
      .channel('fundraising-payments-updates-v6')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
        },
        (payload) => {
          console.log('💰 [FundraisingProgress] Payment update detected:', payload);
          loadFundraisingData();
        }
      )
      .subscribe();

    // Set up real-time subscription for users table (MXI changes)
    const usersChannel = supabase
      .channel('fundraising-users-updates-v6')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
        },
        (payload) => {
          console.log('👤 [FundraisingProgress] User MXI update detected:', payload);
          loadMXIDistribution();
        }
      )
      .subscribe();

    // Refresh every 10 seconds as backup
    const interval = setInterval(() => {
      console.log('⏰ [FundraisingProgress] Auto-refresh triggered');
      loadFundraisingData();
    }, 10000);
    
    return () => {
      console.log('🛑 [FundraisingProgress] Component unmounting, cleaning up...');
      paymentsChannel.unsubscribe();
      usersChannel.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const loadMXIDistribution = async () => {
    try {
      console.log('📊 [FundraisingProgress] Loading MXI distribution...');
      
      // Direct SQL query
      const { data: mxiData, error: mxiError } = await supabase
        .from('users')
        .select('mxi_purchased_directly, mxi_from_unified_commissions, mxi_from_challenges, mxi_vesting_locked');

      if (mxiError) {
        console.error('❌ [FundraisingProgress] Error loading MXI data:', mxiError);
        return;
      }

      if (!mxiData || mxiData.length === 0) {
        console.warn('⚠️ [FundraisingProgress] No MXI data found');
        return;
      }

      // Calculate totals
      const totals = mxiData.reduce((acc, user) => {
        acc.total_mxi_purchased += parseFloat(String(user.mxi_purchased_directly || 0));
        acc.total_mxi_commissions += parseFloat(String(user.mxi_from_unified_commissions || 0));
        acc.total_mxi_challenges += parseFloat(String(user.mxi_from_challenges || 0));
        acc.total_mxi_vesting += parseFloat(String(user.mxi_vesting_locked || 0));
        
        if (user.mxi_purchased_directly > 0) acc.users_with_purchased++;
        if (user.mxi_from_unified_commissions > 0) acc.users_with_commissions++;
        if (user.mxi_from_challenges > 0) acc.users_with_challenges++;
        if (user.mxi_vesting_locked > 0) acc.users_with_vesting++;
        
        return acc;
      }, {
        total_mxi_purchased: 0,
        total_mxi_commissions: 0,
        total_mxi_challenges: 0,
        total_mxi_vesting: 0,
        users_with_purchased: 0,
        users_with_commissions: 0,
        users_with_challenges: 0,
        users_with_vesting: 0,
      });

      totals.total_mxi_all_sources = 
        totals.total_mxi_purchased + 
        totals.total_mxi_commissions + 
        totals.total_mxi_challenges + 
        totals.total_mxi_vesting;

      console.log('✅ [FundraisingProgress] MXI distribution loaded:', totals);
      console.log('📊 [FundraisingProgress] MXI Breakdown:');
      console.log(`   • ${t('directPurchases')}: ${totals.total_mxi_purchased.toFixed(2)} MXI (${totals.users_with_purchased} ${t('users').toLowerCase()})`);
      console.log(`   • ${t('commissions')}: ${totals.total_mxi_commissions.toFixed(2)} MXI (${totals.users_with_commissions} ${t('users').toLowerCase()})`);
      console.log(`   • ${t('challenges')}: ${totals.total_mxi_challenges.toFixed(2)} MXI (${totals.users_with_challenges} ${t('users').toLowerCase()})`);
      console.log(`   • Vesting: ${totals.total_mxi_vesting.toFixed(2)} MXI (${totals.users_with_vesting} ${t('users').toLowerCase()})`);
      console.log(`   • TOTAL: ${totals.total_mxi_all_sources.toFixed(2)} MXI`);
      
      setMxiDistribution(totals as MXIDistribution);
      
    } catch (error) {
      console.error('❌ [FundraisingProgress] Error in loadMXIDistribution:', error);
    }
  };

  const loadFundraisingData = async () => {
    try {
      console.log('');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('🔄 [FundraisingProgress] LOADING FUNDRAISING DATA - START');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('');
      
      // Load presale dates from metrics table
      const { data: metricsData, error: metricsError } = await supabase
        .from('metrics')
        .select('presale_start_date, pool_close_date')
        .single();

      if (!metricsError && metricsData) {
        if (metricsData.presale_start_date) {
          setPresaleStartDate(new Date(metricsData.presale_start_date));
          console.log('📅 [FundraisingProgress] Presale start date:', metricsData.presale_start_date);
        }
        if (metricsData.pool_close_date) {
          setPresaleEndDate(new Date(metricsData.pool_close_date));
          console.log('📅 [FundraisingProgress] Presale end date:', metricsData.pool_close_date);
        }
      }
      
      // Load USDT fundraising data
      const { data: breakdownData, error: breakdownError } = await supabase
        .rpc('get_fundraising_breakdown');
      
      if (breakdownError) {
        console.error('❌ [FundraisingProgress] Error calling get_fundraising_breakdown:', breakdownError);
        setLoading(false);
        return;
      }

      if (!breakdownData || breakdownData.length === 0) {
        console.warn('⚠️ [FundraisingProgress] No breakdown data returned');
        setLoading(false);
        return;
      }

      const breakdown = breakdownData[0];
      console.log('📊 [FundraisingProgress] Breakdown data received:', JSON.stringify(breakdown, null, 2));
      
      // Parse all values as numbers
      const totalRaisedValue = parseFloat(String(breakdown.total_raised || '0'));
      const userTotalValue = parseFloat(String(breakdown.user_total || '0'));
      const adminTotalValue = parseFloat(String(breakdown.admin_total || '0'));
      const finishedTotalValue = parseFloat(String(breakdown.finished_total || '0'));
      const confirmedTotalValue = parseFloat(String(breakdown.confirmed_total || '0'));
      const userCountValue = parseInt(String(breakdown.user_count || '0'), 10);
      const adminCountValue = parseInt(String(breakdown.admin_count || '0'), 10);
      const totalCountValue = parseInt(String(breakdown.total_count || '0'), 10);
      
      console.log('');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('💰 FUNDRAISING BREAKDOWN SUMMARY:');
      console.log('═══════════════════════════════════════════════════════════');
      console.log(`  🎯 TOTAL RAISED: ${totalRaisedValue.toFixed(2)} USDT`);
      console.log(`  👥 User Purchases: ${userTotalValue.toFixed(2)} USDT (${userCountValue} payments)`);
      console.log(`  🔧 Admin Additions: ${adminTotalValue.toFixed(2)} USDT (${adminCountValue} additions)`);
      console.log(`  ✅ Finished Payments: ${finishedTotalValue.toFixed(2)} USDT`);
      console.log(`  ✓ Confirmed Payments: ${confirmedTotalValue.toFixed(2)} USDT`);
      console.log(`  📊 Total Transactions: ${totalCountValue}`);
      console.log(`  📈 Progress: ${((totalRaisedValue / MAX_FUNDRAISING_GOAL) * 100).toFixed(4)}%`);
      console.log(`  🔍 Verification: userTotal + adminTotal = ${(userTotalValue + adminTotalValue).toFixed(2)} USDT`);
      console.log(`  🔍 Verification: finishedTotal + confirmedTotal = ${(finishedTotalValue + confirmedTotalValue).toFixed(2)} USDT`);
      console.log(`  💎 Admin additions are calculated from MXI balance * current phase price`);
      console.log(`  ⏰ Timestamp: ${new Date().toISOString()}`);
      console.log('═══════════════════════════════════════════════════════════');
      console.log('');
      
      // Update state with parsed values
      console.log('🔄 [FundraisingProgress] Updating state...');
      setTotalRaised(totalRaisedValue);
      setDebugInfo({
        userTotal: userTotalValue,
        adminTotal: adminTotalValue,
        userCount: userCountValue,
        adminCount: adminCountValue,
        finishedTotal: finishedTotalValue,
        confirmedTotal: confirmedTotalValue,
        totalCount: totalCountValue,
      });
      setLastUpdate(new Date());
      setRefreshCount(prev => prev + 1);
      
      // Load MXI distribution
      await loadMXIDistribution();
      
      console.log('✅ [FundraisingProgress] State updated successfully');
      console.log(`   Total Raised: ${totalRaisedValue}`);
      console.log(`   Refresh Count: ${refreshCount + 1}`);
      
    } catch (error) {
      console.error('❌ [FundraisingProgress] Error in loadFundraisingData:', error);
      console.error('❌ [FundraisingProgress] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    } finally {
      setLoading(false);
      console.log('🏁 [FundraisingProgress] Loading complete');
    }
  };

  const handleManualRefresh = async () => {
    console.log('🔄 [FundraisingProgress] Manual refresh triggered by user');
    setLoading(true);
    await loadFundraisingData();
    
    Alert.alert(
      t('updated'),
      `${t('totalRaised')}: $${totalRaised.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT\n\n` +
      `${t('mxiBreakdown')}:\n` +
      `• ${t('purchases')}: ${mxiDistribution.total_mxi_purchased.toLocaleString('es-ES', { minimumFractionDigits: 2 })} MXI\n` +
      `• ${t('commissions')}: ${mxiDistribution.total_mxi_commissions.toLocaleString('es-ES', { minimumFractionDigits: 2 })} MXI\n` +
      `• ${t('challenges')}: ${mxiDistribution.total_mxi_challenges.toLocaleString('es-ES', { minimumFractionDigits: 2 })} MXI\n` +
      `• Vesting: ${mxiDistribution.total_mxi_vesting.toLocaleString('es-ES', { minimumFractionDigits: 2 })} MXI\n` +
      `• Total MXI: ${mxiDistribution.total_mxi_all_sources.toLocaleString('es-ES', { minimumFractionDigits: 2 })} MXI`,
      [{ text: 'OK' }]
    );
  };

  const progressPercentage = (totalRaised / MAX_FUNDRAISING_GOAL) * 100;
  const remaining = MAX_FUNDRAISING_GOAL - totalRaised;

  console.log('🎨 [FundraisingProgress] Rendering with:', {
    totalRaised,
    progressPercentage: progressPercentage.toFixed(2),
    remaining,
    loading,
    refreshCount,
    showMXIBreakdown,
    mxiDistribution,
  });

  if (loading && refreshCount === 0) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{t('loadingFundraisingData')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        {/* Header with Manual Refresh Button */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <IconSymbol 
              ios_icon_name="chart.bar.fill" 
              android_material_icon_name="bar_chart" 
              size={28} 
              color="#00ff88" 
            />
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>{t('totalFundraisingProject')}</Text>
              <Text style={styles.subtitle}>{t('presaleProgress')}</Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={handleManualRefresh}
            style={styles.refreshButton}
            disabled={loading}
          >
            <IconSymbol 
              ios_icon_name="arrow.clockwise" 
              android_material_icon_name="refresh" 
              size={24} 
              color={loading ? colors.textSecondary : '#00ff88'} 
            />
          </TouchableOpacity>
        </View>

        {/* Presale Dates Display */}
        {(presaleStartDate || presaleEndDate) && (
          <View style={styles.datesContainer}>
            {presaleStartDate && (
              <View style={styles.dateItem}>
                <IconSymbol 
                  ios_icon_name="calendar.badge.clock" 
                  android_material_icon_name="event_available" 
                  size={20} 
                  color="#00ff88" 
                />
                <View style={styles.dateTextContainer}>
                  <Text style={styles.dateLabel}>{t('presaleStartDate')}</Text>
                  <Text style={styles.dateValue}>
                    {presaleStartDate.toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              </View>
            )}
            {presaleEndDate && (
              <View style={styles.dateItem}>
                <IconSymbol 
                  ios_icon_name="calendar.badge.exclamationmark" 
                  android_material_icon_name="event_busy" 
                  size={20} 
                  color="#ffdd00" 
                />
                <View style={styles.dateTextContainer}>
                  <Text style={styles.dateLabel}>{t('presaleEndDate')}</Text>
                  <Text style={styles.dateValue}>
                    {presaleEndDate.toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Main Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('totalRaised')}</Text>
            <Text style={styles.statValue}>
              ${formatLargeNumber(totalRaised, 2)}
            </Text>
            <Text style={styles.statUnit}>USDT</Text>
            <Text style={styles.statFullValue}>
              ${formatNumberWithCommas(totalRaised, 2)}
            </Text>
            <Text style={styles.statDebug}>
              Raw: {totalRaised.toFixed(2)}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('meta')}</Text>
            <Text style={styles.statValue}>
              ${formatLargeNumber(MAX_FUNDRAISING_GOAL, 1)}
            </Text>
            <Text style={styles.statUnit}>USDT</Text>
            <Text style={styles.statFullValue}>
              ${formatNumberWithCommas(MAX_FUNDRAISING_GOAL, 0)}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('remaining')}</Text>
            <Text style={styles.statValue}>
              ${formatLargeNumber(remaining, 2)}
            </Text>
            <Text style={styles.statUnit}>USDT</Text>
            <Text style={styles.statFullValue}>
              ${formatNumberWithCommas(remaining, 2)}
            </Text>
          </View>
        </View>

        {/* Fundraising Breakdown - UNIFIED */}
        {(debugInfo.userTotal > 0 || debugInfo.adminTotal > 0) && (
          <View style={styles.breakdownSection}>
            <Text style={styles.breakdownTitle}>📊 {t('fundraisingBreakdown')}</Text>
            
            <View style={styles.breakdownCard}>
              <View style={styles.breakdownRow}>
                <View style={styles.breakdownIcon}>
                  <IconSymbol 
                    ios_icon_name="cart.fill" 
                    android_material_icon_name="shopping_cart" 
                    size={20} 
                    color="#00ff88" 
                  />
                </View>
                <View style={styles.breakdownContent}>
                  <Text style={styles.breakdownLabel}>{t('purchasedMXI')}</Text>
                  <Text style={styles.breakdownDescription}>
                    {t('totalMXISold')}
                  </Text>
                </View>
                <View style={styles.breakdownValue}>
                  <Text style={styles.breakdownAmount}>
                    ${formatNumberWithCommas(totalRaised, 2)}
                  </Text>
                  <Text style={styles.breakdownCount}>
                    {debugInfo.totalCount} {debugInfo.totalCount !== 1 ? t('transactions') : t('transaction')}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.breakdownTotal}>
              <Text style={styles.breakdownTotalLabel}>{t('totalRaised')}</Text>
              <Text style={styles.breakdownTotalAmount}>
                ${formatNumberWithCommas(totalRaised, 2)} USDT
              </Text>
            </View>
          </View>
        )}

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>{t('generalProgressLabel')}</Text>
            <Text style={styles.progressPercentage}>
              {progressPercentage.toFixed(2)}%
            </Text>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${Math.min(progressPercentage, 100)}%` }
              ]}
            >
              {progressPercentage > 5 && (
                <Text style={styles.progressBarText}>
                  {progressPercentage.toFixed(1)}%
                </Text>
              )}
            </View>
          </View>

          <View style={styles.progressFooter}>
            <Text style={styles.progressFooterText}>
              {formatLargeNumber(totalRaised, 1)} USDT
            </Text>
            <Text style={styles.progressFooterText}>
              {formatLargeNumber(MAX_FUNDRAISING_GOAL, 1)} USDT
            </Text>
          </View>
        </View>

        {/* MXI Distribution Breakdown - NOW VISIBLE BY DEFAULT */}
        <TouchableOpacity 
          style={styles.mxiBreakdownToggle}
          onPress={() => setShowMXIBreakdown(!showMXIBreakdown)}
        >
          <View style={styles.mxiBreakdownHeader}>
            <IconSymbol 
              ios_icon_name="chart.pie.fill" 
              android_material_icon_name="pie_chart" 
              size={24} 
              color="#00ff88" 
            />
            <View style={styles.mxiBreakdownHeaderText}>
              <Text style={styles.mxiBreakdownTitle}>{t('mxiDistributionBreakdown')}</Text>
              <Text style={styles.mxiBreakdownSubtitle}>
                {t('total')}: {formatNumberWithCommas(mxiDistribution.total_mxi_all_sources, 2)} MXI
              </Text>
            </View>
            <IconSymbol 
              ios_icon_name={showMXIBreakdown ? "chevron.up" : "chevron.down"}
              android_material_icon_name={showMXIBreakdown ? "expand_less" : "expand_more"}
              size={24} 
              color="#00ff88" 
            />
          </View>
        </TouchableOpacity>

        {showMXIBreakdown && (
          <View style={styles.mxiBreakdownContent}>
            {/* MXI from Direct Purchases */}
            <View style={styles.mxiBreakdownCard}>
              <View style={styles.mxiBreakdownCardHeader}>
                <IconSymbol 
                  ios_icon_name="cart.fill" 
                  android_material_icon_name="shopping_cart" 
                  size={20} 
                  color="#00ff88" 
                />
                <Text style={styles.mxiBreakdownCardTitle}>{t('directPurchases')}</Text>
              </View>
              <Text style={styles.mxiBreakdownCardValue}>
                {formatNumberWithCommas(mxiDistribution.total_mxi_purchased, 2)} MXI
              </Text>
              <Text style={styles.mxiBreakdownCardDescription}>
                {t('mxiAcquiredViaUSDT')}
              </Text>
              <View style={styles.mxiBreakdownCardStats}>
                <Text style={styles.mxiBreakdownCardStat}>
                  📊 {mxiDistribution.total_mxi_all_sources > 0 ? ((mxiDistribution.total_mxi_purchased / mxiDistribution.total_mxi_all_sources) * 100).toFixed(1) : '0.0'}% {t('ofTotal')}
                </Text>
              </View>
            </View>

            {/* MXI from Commissions */}
            <View style={styles.mxiBreakdownCard}>
              <View style={styles.mxiBreakdownCardHeader}>
                <IconSymbol 
                  ios_icon_name="person.3.fill" 
                  android_material_icon_name="group" 
                  size={20} 
                  color="#ffdd00" 
                />
                <Text style={styles.mxiBreakdownCardTitle}>{t('referralCommissions')}</Text>
              </View>
              <Text style={styles.mxiBreakdownCardValue}>
                {formatNumberWithCommas(mxiDistribution.total_mxi_commissions, 2)} MXI
              </Text>
              <Text style={styles.mxiBreakdownCardDescription}>
                {t('mxiGeneratedByReferrals')}
              </Text>
              <View style={styles.mxiBreakdownCardStats}>
                <Text style={styles.mxiBreakdownCardStat}>
                  📊 {mxiDistribution.total_mxi_all_sources > 0 ? ((mxiDistribution.total_mxi_commissions / mxiDistribution.total_mxi_all_sources) * 100).toFixed(1) : '0.0'}% {t('ofTotal')}
                </Text>
              </View>
            </View>

            {/* MXI from Challenges */}
            <View style={styles.mxiBreakdownCard}>
              <View style={styles.mxiBreakdownCardHeader}>
                <IconSymbol 
                  ios_icon_name="trophy.fill" 
                  android_material_icon_name="emoji_events" 
                  size={20} 
                  color="#ff6b6b" 
                />
                <Text style={styles.mxiBreakdownCardTitle}>{t('challengesAndTournaments')}</Text>
              </View>
              <Text style={styles.mxiBreakdownCardValue}>
                {formatNumberWithCommas(mxiDistribution.total_mxi_challenges, 2)} MXI
              </Text>
              <Text style={styles.mxiBreakdownCardDescription}>
                {t('mxiWonInTournamentsDesc')}
              </Text>
              <View style={styles.mxiBreakdownCardStats}>
                <Text style={styles.mxiBreakdownCardStat}>
                  📊 {mxiDistribution.total_mxi_all_sources > 0 ? ((mxiDistribution.total_mxi_challenges / mxiDistribution.total_mxi_all_sources) * 100).toFixed(1) : '0.0'}% {t('ofTotal')}
                </Text>
              </View>
            </View>

            {/* MXI from Vesting */}
            <View style={styles.mxiBreakdownCard}>
              <View style={styles.mxiBreakdownCardHeader}>
                <IconSymbol 
                  ios_icon_name="clock.fill" 
                  android_material_icon_name="schedule" 
                  size={20} 
                  color="#9b59b6" 
                />
                <Text style={styles.mxiBreakdownCardTitle}>{t('vestingLocked')}</Text>
              </View>
              <Text style={styles.mxiBreakdownCardValue}>
                {formatNumberWithCommas(mxiDistribution.total_mxi_vesting, 2)} MXI
              </Text>
              <Text style={styles.mxiBreakdownCardDescription}>
                {t('mxiGeneratedByVestingSystem')}
              </Text>
              <View style={styles.mxiBreakdownCardStats}>
                <Text style={styles.mxiBreakdownCardStat}>
                  📊 {mxiDistribution.total_mxi_all_sources > 0 ? ((mxiDistribution.total_mxi_vesting / mxiDistribution.total_mxi_all_sources) * 100).toFixed(1) : '0.0'}% {t('ofTotal')}
                </Text>
              </View>
            </View>

            {/* Explanation Box - SIMPLIFIED */}
            <View style={styles.mxiExplanationBox}>
              <IconSymbol 
                ios_icon_name="info.circle.fill" 
                android_material_icon_name="info" 
                size={20} 
                color="#00ff88" 
              />
              <View style={styles.mxiExplanationText}>
                <Text style={styles.mxiExplanationDescription}>
                  {t('commissionsAndPrizesGenerated')}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Info Box */}
        <View style={styles.infoBox}>
          <IconSymbol 
            ios_icon_name="info.circle.fill" 
            android_material_icon_name="info" 
            size={20} 
            color="#00ff88" 
          />
          <Text style={styles.infoText}>
            {t('thisMetricShowsProgress')}
          </Text>
        </View>

        {/* Last Update */}
        <View style={styles.lastUpdateContainer}>
          <Text style={styles.lastUpdateText}>
            {t('lastUpdate', { time: lastUpdate.toLocaleTimeString('es-ES'), count: refreshCount })}
          </Text>
        </View>

        {/* Milestones - Updated for 3 phases */}
        <View style={styles.milestonesSection}>
          <Text style={styles.milestonesTitle}>{t('fundraisingMilestones')}</Text>
          
          <View style={styles.milestonesList}>
            {[
              { amount: 3333333, label: t('phase1Milestone'), reached: totalRaised >= 3333333 },
              { amount: 9166666, label: t('phase2Milestone'), reached: totalRaised >= 9166666 },
              { amount: 17500000, label: t('phase3Milestone'), reached: totalRaised >= 17500000 },
            ].map((milestone, index) => (
              <View key={index} style={styles.milestoneItem}>
                <View style={[
                  styles.milestoneIcon,
                  { backgroundColor: milestone.reached ? '#00ff8820' : 'rgba(255, 255, 255, 0.05)' }
                ]}>
                  <IconSymbol 
                    ios_icon_name={milestone.reached ? 'checkmark.circle.fill' : 'circle'}
                    android_material_icon_name={milestone.reached ? 'check_circle' : 'radio_button_unchecked'}
                    size={20} 
                    color={milestone.reached ? '#00ff88' : colors.textSecondary} 
                  />
                </View>
                <Text style={[
                  styles.milestoneLabel,
                  { color: milestone.reached ? '#00ff88' : colors.textSecondary }
                ]}>
                  {milestone.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    backgroundColor: 'rgba(0, 20, 20, 0.95)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    marginHorizontal: 8,
    borderWidth: 2,
    borderColor: 'rgba(0, 255, 136, 0.3)',
    shadowColor: '#00ff88',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingText: {
    color: colors.text,
    marginTop: 12,
    textAlign: 'center',
    fontSize: 14,
  },
  header: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00ff88',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 255, 136, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 12,
    color: '#ffdd00',
    fontWeight: '600',
  },
  refreshButton: {
    padding: 8,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.3)',
  },
  datesContainer: {
    backgroundColor: 'rgba(0, 255, 136, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.2)',
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateTextContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4,
    fontWeight: '600',
  },
  dateValue: {
    fontSize: 14,
    color: '#00ff88',
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.2)',
    alignItems: 'center',
    minHeight: 130,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginBottom: 6,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#00ff88',
    marginBottom: 2,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  statUnit: {
    fontSize: 10,
    color: '#ffdd00',
    fontWeight: '600',
    marginBottom: 4,
  },
  statFullValue: {
    fontSize: 8,
    color: colors.textSecondary,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  statDebug: {
    fontSize: 7,
    color: 'rgba(255, 255, 255, 0.3)',
    fontFamily: 'monospace',
    textAlign: 'center',
    marginTop: 4,
  },
  progressSection: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: '900',
    color: '#00ff88',
    fontFamily: 'monospace',
  },
  progressBarContainer: {
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.3)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00ff88',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  progressBarText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressFooterText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  mxiBreakdownToggle: {
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(0, 255, 136, 0.3)',
  },
  mxiBreakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mxiBreakdownHeaderText: {
    flex: 1,
  },
  mxiBreakdownTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00ff88',
    marginBottom: 4,
  },
  mxiBreakdownSubtitle: {
    fontSize: 12,
    color: '#ffdd00',
    fontWeight: '600',
  },
  mxiBreakdownContent: {
    gap: 12,
    marginBottom: 16,
  },
  mxiBreakdownCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.2)',
  },
  mxiBreakdownCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  mxiBreakdownCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  mxiBreakdownCardValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#00ff88',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  mxiBreakdownCardDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  mxiBreakdownCardStats: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  mxiBreakdownCardStat: {
    fontSize: 11,
    color: '#ffdd00',
    fontWeight: '600',
  },
  mxiExplanationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0, 255, 136, 0.15)',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.3)',
  },
  mxiExplanationText: {
    flex: 1,
  },
  mxiExplanationDescription: {
    fontSize: 11,
    color: colors.text,
    lineHeight: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.3)',
  },
  infoText: {
    flex: 1,
    fontSize: 11,
    color: '#00ff88',
    lineHeight: 16,
    fontWeight: '600',
  },
  lastUpdateContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  lastUpdateText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  milestonesSection: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.2)',
  },
  milestonesTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00ff88',
    marginBottom: 12,
    textAlign: 'center',
  },
  milestonesList: {
    gap: 10,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  milestoneIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.3)',
  },
  milestoneLabel: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  breakdownSection: {
    backgroundColor: 'rgba(0, 20, 20, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(0, 255, 136, 0.3)',
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00ff88',
    marginBottom: 16,
    textAlign: 'center',
  },
  breakdownCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  breakdownIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  breakdownContent: {
    flex: 1,
  },
  breakdownLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  breakdownDescription: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 14,
  },
  breakdownValue: {
    alignItems: 'flex-end',
  },
  breakdownAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00ff88',
    marginBottom: 2,
  },
  breakdownCount: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  breakdownTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginTop: 4,
    borderTopWidth: 2,
    borderTopColor: 'rgba(0, 255, 136, 0.3)',
  },
  breakdownTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  breakdownTotalAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: '#00ff88',
    fontFamily: 'monospace',
  },
});
