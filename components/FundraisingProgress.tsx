
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';

const MAX_FUNDRAISING_GOAL = 21000000; // 21,000,000 USDT

// Helper function to format large numbers with abbreviations
const formatLargeNumber = (num: number, decimals: number = 2): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(decimals)}M`;
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
  const [showMXIBreakdown, setShowMXIBreakdown] = useState(false);
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
      .channel('fundraising-payments-updates-v5')
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
      .channel('fundraising-users-updates-v5')
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
      
      const { data, error } = await supabase.rpc('execute_sql', {
        query: `
          SELECT 
            COALESCE(SUM(mxi_purchased_directly), 0) as total_mxi_purchased,
            COALESCE(SUM(mxi_from_unified_commissions), 0) as total_mxi_commissions,
            COALESCE(SUM(mxi_from_challenges), 0) as total_mxi_challenges,
            COALESCE(SUM(mxi_vesting_locked), 0) as total_mxi_vesting,
            COALESCE(SUM(
              mxi_purchased_directly + 
              mxi_from_unified_commissions + 
              mxi_from_challenges + 
              mxi_vesting_locked
            ), 0) as total_mxi_all_sources,
            COUNT(CASE WHEN mxi_purchased_directly > 0 THEN 1 END) as users_with_purchased,
            COUNT(CASE WHEN mxi_from_unified_commissions > 0 THEN 1 END) as users_with_commissions,
            COUNT(CASE WHEN mxi_from_challenges > 0 THEN 1 END) as users_with_challenges,
            COUNT(CASE WHEN mxi_vesting_locked > 0 THEN 1 END) as users_with_vesting
          FROM users
        `
      });

      if (error) {
        console.error('❌ [FundraisingProgress] Error loading MXI distribution:', error);
        return;
      }

      // Direct SQL query
      const { data: mxiData, error: mxiError } = await supabase
        .from('users')
        .select('mxi_purchased_directly, mxi_from_unified_commissions, mxi_from_challenges, mxi_vesting_locked');

      if (mxiError) {
        console.error('❌ [FundraisingProgress] Error loading MXI data:', mxiError);
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
      console.log(`  🔧 Admin Additions: ${adminTotalValue.toFixed(2)} USDT (${adminCountValue} payments)`);
      console.log(`  ✅ Finished Payments: ${finishedTotalValue.toFixed(2)} USDT`);
      console.log(`  ✓ Confirmed Payments: ${confirmedTotalValue.toFixed(2)} USDT`);
      console.log(`  📊 Total Payments: ${totalCountValue}`);
      console.log(`  📈 Progress: ${((totalRaisedValue / MAX_FUNDRAISING_GOAL) * 100).toFixed(4)}%`);
      console.log(`  🔍 Verification: userTotal + adminTotal = ${(userTotalValue + adminTotalValue).toFixed(2)} USDT`);
      console.log(`  🔍 Verification: finishedTotal + confirmedTotal = ${(finishedTotalValue + confirmedTotalValue).toFixed(2)} USDT`);
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
      'Actualizado',
      `Total recaudado: $${totalRaised.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT\n\n` +
      `Desglose:\n` +
      `• Usuarios: $${debugInfo.userTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })} USDT\n` +
      `• Admin: $${debugInfo.adminTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })} USDT\n\n` +
      `Total de pagos: ${debugInfo.totalCount}`,
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
  });

  if (loading && refreshCount === 0) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando datos de recaudación...</Text>
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
              <Text style={styles.title}>Recaudación Total del Proyecto</Text>
              <Text style={styles.subtitle}>Progreso de la preventa MXI</Text>
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

        {/* Main Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Recaudado</Text>
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
            <Text style={styles.statLabel}>Meta Total</Text>
            <Text style={styles.statValue}>
              ${formatLargeNumber(MAX_FUNDRAISING_GOAL, 0)}
            </Text>
            <Text style={styles.statUnit}>USDT</Text>
            <Text style={styles.statFullValue}>
              ${formatNumberWithCommas(MAX_FUNDRAISING_GOAL, 0)}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Restante</Text>
            <Text style={styles.statValue}>
              ${formatLargeNumber(remaining, 2)}
            </Text>
            <Text style={styles.statUnit}>USDT</Text>
            <Text style={styles.statFullValue}>
              ${formatNumberWithCommas(remaining, 2)}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progreso General</Text>
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
              {formatLargeNumber(totalRaised, 0)} USDT
            </Text>
            <Text style={styles.progressFooterText}>
              {formatLargeNumber(MAX_FUNDRAISING_GOAL, 0)} USDT
            </Text>
          </View>
        </View>

        {/* USDT Breakdown Info */}
        <View style={styles.breakdownSection}>
          <Text style={styles.breakdownTitle}>Desglose de Recaudación USDT</Text>
          
          {/* Status Breakdown */}
          <View style={styles.breakdownRow}>
            <View style={styles.breakdownItem}>
              <IconSymbol 
                ios_icon_name="checkmark.circle.fill" 
                android_material_icon_name="check_circle" 
                size={16} 
                color="#00ff88" 
              />
              <Text style={styles.breakdownLabel}>Pagos Finalizados</Text>
              <Text style={styles.breakdownValue}>
                ${formatNumberWithCommas(debugInfo.finishedTotal, 2)} USDT
              </Text>
            </View>
            <View style={styles.breakdownItem}>
              <IconSymbol 
                ios_icon_name="checkmark.seal.fill" 
                android_material_icon_name="verified" 
                size={16} 
                color="#ffdd00" 
              />
              <Text style={styles.breakdownLabel}>Pagos Confirmados</Text>
              <Text style={styles.breakdownValue}>
                ${formatNumberWithCommas(debugInfo.confirmedTotal, 2)} USDT
              </Text>
            </View>
          </View>

          {/* Source Breakdown */}
          <View style={[styles.breakdownRow, { marginTop: 12 }]}>
            <View style={styles.breakdownItem}>
              <IconSymbol 
                ios_icon_name="person.fill" 
                android_material_icon_name="person" 
                size={16} 
                color="#00ff88" 
              />
              <Text style={styles.breakdownLabel}>Compras de Usuarios</Text>
              <Text style={styles.breakdownValue}>
                ${formatNumberWithCommas(debugInfo.userTotal, 2)} USDT
              </Text>
              <Text style={styles.breakdownCount}>
                ({debugInfo.userCount} pagos)
              </Text>
            </View>
            <View style={styles.breakdownItem}>
              <IconSymbol 
                ios_icon_name="gear.circle.fill" 
                android_material_icon_name="settings" 
                size={16} 
                color="#ffdd00" 
              />
              <Text style={styles.breakdownLabel}>Saldos Admin</Text>
              <Text style={styles.breakdownValue}>
                ${formatNumberWithCommas(debugInfo.adminTotal, 2)} USDT
              </Text>
              <Text style={styles.breakdownCount}>
                ({debugInfo.adminCount} pagos)
              </Text>
            </View>
          </View>
        </View>

        {/* MXI Distribution Breakdown - NEW SECTION */}
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
              <Text style={styles.mxiBreakdownTitle}>Desglose de MXI Entregado</Text>
              <Text style={styles.mxiBreakdownSubtitle}>
                Total: {formatNumberWithCommas(mxiDistribution.total_mxi_all_sources, 2)} MXI
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
                <Text style={styles.mxiBreakdownCardTitle}>MXI por Compras Directas</Text>
              </View>
              <Text style={styles.mxiBreakdownCardValue}>
                {formatNumberWithCommas(mxiDistribution.total_mxi_purchased, 2)} MXI
              </Text>
              <Text style={styles.mxiBreakdownCardDescription}>
                MXI adquirido mediante pagos en USDT. Los usuarios reciben MXI según el precio de la fase actual.
              </Text>
              <View style={styles.mxiBreakdownCardStats}>
                <Text style={styles.mxiBreakdownCardStat}>
                  👥 {mxiDistribution.users_with_purchased} usuarios
                </Text>
                <Text style={styles.mxiBreakdownCardStat}>
                  📊 {((mxiDistribution.total_mxi_purchased / mxiDistribution.total_mxi_all_sources) * 100).toFixed(1)}% del total
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
                <Text style={styles.mxiBreakdownCardTitle}>MXI por Comisiones de Referidos</Text>
              </View>
              <Text style={styles.mxiBreakdownCardValue}>
                {formatNumberWithCommas(mxiDistribution.total_mxi_commissions, 2)} MXI
              </Text>
              <Text style={styles.mxiBreakdownCardDescription}>
                MXI generado por el sistema de referidos (3% nivel 1, 2% nivel 2, 1% nivel 3). Se calcula automáticamente cuando los referidos realizan compras.
              </Text>
              <View style={styles.mxiBreakdownCardStats}>
                <Text style={styles.mxiBreakdownCardStat}>
                  👥 {mxiDistribution.users_with_commissions} usuarios
                </Text>
                <Text style={styles.mxiBreakdownCardStat}>
                  📊 {((mxiDistribution.total_mxi_commissions / mxiDistribution.total_mxi_all_sources) * 100).toFixed(1)}% del total
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
                <Text style={styles.mxiBreakdownCardTitle}>MXI por Desafíos y Torneos</Text>
              </View>
              <Text style={styles.mxiBreakdownCardValue}>
                {formatNumberWithCommas(mxiDistribution.total_mxi_challenges, 2)} MXI
              </Text>
              <Text style={styles.mxiBreakdownCardDescription}>
                MXI ganado en torneos y desafíos. Requiere 5 referidos activos para poder retirar.
              </Text>
              <View style={styles.mxiBreakdownCardStats}>
                <Text style={styles.mxiBreakdownCardStat}>
                  👥 {mxiDistribution.users_with_challenges} usuarios
                </Text>
                <Text style={styles.mxiBreakdownCardStat}>
                  📊 {((mxiDistribution.total_mxi_challenges / mxiDistribution.total_mxi_all_sources) * 100).toFixed(1)}% del total
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
                <Text style={styles.mxiBreakdownCardTitle}>MXI por Vesting (Bloqueado)</Text>
              </View>
              <Text style={styles.mxiBreakdownCardValue}>
                {formatNumberWithCommas(mxiDistribution.total_mxi_vesting, 2)} MXI
              </Text>
              <Text style={styles.mxiBreakdownCardDescription}>
                MXI generado por el sistema de vesting/yield. Bloqueado hasta la fecha de lanzamiento oficial de MXI.
              </Text>
              <View style={styles.mxiBreakdownCardStats}>
                <Text style={styles.mxiBreakdownCardStat}>
                  👥 {mxiDistribution.users_with_vesting} usuarios
                </Text>
                <Text style={styles.mxiBreakdownCardStat}>
                  📊 {((mxiDistribution.total_mxi_vesting / mxiDistribution.total_mxi_all_sources) * 100).toFixed(1)}% del total
                </Text>
              </View>
            </View>

            {/* Explanation Box */}
            <View style={styles.mxiExplanationBox}>
              <IconSymbol 
                ios_icon_name="info.circle.fill" 
                android_material_icon_name="info" 
                size={20} 
                color="#00ff88" 
              />
              <View style={styles.mxiExplanationText}>
                <Text style={styles.mxiExplanationTitle}>¿Por qué el MXI entregado es mayor que el USDT recaudado?</Text>
                <Text style={styles.mxiExplanationDescription}>
                  El MXI total incluye:
                  {'\n'}• Compras directas con USDT
                  {'\n'}• Comisiones de referidos (generadas automáticamente)
                  {'\n'}• Premios de torneos y desafíos
                  {'\n'}• Vesting/yield acumulado
                  {'\n\n'}
                  El USDT recaudado solo refleja los pagos directos de usuarios y administradores. 
                  Las comisiones, premios y vesting se generan como incentivos adicionales del ecosistema MXI.
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
            Esta métrica muestra el progreso total de la recaudación del proyecto MXI. 
            Incluye todas las compras de MXI confirmadas y los saldos añadidos por el administrador. 
            El objetivo máximo es de 21,000,000 USDT para el desarrollo completo del ecosistema.
          </Text>
        </View>

        {/* Last Update */}
        <View style={styles.lastUpdateContainer}>
          <Text style={styles.lastUpdateText}>
            Última actualización: {lastUpdate.toLocaleTimeString('es-ES')} (Refresh #{refreshCount})
          </Text>
        </View>

        {/* Milestones */}
        <View style={styles.milestonesSection}>
          <Text style={styles.milestonesTitle}>Hitos de Recaudación</Text>
          
          <View style={styles.milestonesList}>
            {[
              { amount: 5000000, label: '5M - Fase 1 Completa', reached: totalRaised >= 5000000 },
              { amount: 10000000, label: '10M - Fase 2 Completa', reached: totalRaised >= 10000000 },
              { amount: 15000000, label: '15M - Fase 3 Completa', reached: totalRaised >= 15000000 },
              { amount: 21000000, label: '21M - Meta Final', reached: totalRaised >= 21000000 },
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
  breakdownSection: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.2)',
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00ff88',
    marginBottom: 12,
    textAlign: 'center',
  },
  breakdownRow: {
    flexDirection: 'row',
    gap: 12,
  },
  breakdownItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  breakdownLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  breakdownValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00ff88',
    textAlign: 'center',
  },
  breakdownCount: {
    fontSize: 9,
    color: colors.textSecondary,
    fontStyle: 'italic',
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
    justifyContent: 'space-between',
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
  mxiExplanationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00ff88',
    marginBottom: 8,
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
});
