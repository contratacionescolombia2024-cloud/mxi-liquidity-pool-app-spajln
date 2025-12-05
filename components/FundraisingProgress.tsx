
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
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

// DRASTIC FIX: Ultra-robust price amount parser
const parsePriceAmount = (priceAmount: any): number => {
  console.log('🔍 [parsePriceAmount] Input:', { value: priceAmount, type: typeof priceAmount });
  
  // Handle null/undefined
  if (priceAmount === null || priceAmount === undefined) {
    console.log('⚠️ [parsePriceAmount] Null/undefined input, returning 0');
    return 0;
  }
  
  // If already a number, return it
  if (typeof priceAmount === 'number') {
    console.log('✅ [parsePriceAmount] Already a number:', priceAmount);
    return isNaN(priceAmount) ? 0 : priceAmount;
  }
  
  // Convert to string and clean it
  let priceStr = String(priceAmount).trim();
  console.log('🧹 [parsePriceAmount] Cleaned string:', priceStr);
  
  // Remove any non-numeric characters except decimal point and minus sign
  priceStr = priceStr.replace(/[^\d.-]/g, '');
  console.log('🔢 [parsePriceAmount] After removing non-numeric:', priceStr);
  
  // Parse as float
  const parsed = parseFloat(priceStr);
  console.log('📊 [parsePriceAmount] Parsed result:', parsed);
  
  // Return 0 if NaN, otherwise return the parsed value
  const result = isNaN(parsed) ? 0 : parsed;
  console.log('✅ [parsePriceAmount] Final result:', result);
  
  return result;
};

export function FundraisingProgress() {
  const { t } = useLanguage();
  const [totalRaised, setTotalRaised] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [refreshCount, setRefreshCount] = useState(0);
  const [debugInfo, setDebugInfo] = useState<{
    userTotal: number;
    adminTotal: number;
    userCount: number;
    adminCount: number;
    finishedTotal: number;
    confirmedTotal: number;
    rawPayments: any[];
  }>({ 
    userTotal: 0, 
    adminTotal: 0, 
    userCount: 0, 
    adminCount: 0,
    finishedTotal: 0,
    confirmedTotal: 0,
    rawPayments: [],
  });

  useEffect(() => {
    console.log('🚀 [FundraisingProgress] Component mounted, loading data...');
    loadFundraisingData();
    
    // Set up real-time subscription for payments table
    const paymentsChannel = supabase
      .channel('fundraising-payments-updates-v2')
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

    // Refresh every 15 seconds as backup
    const interval = setInterval(() => {
      console.log('⏰ [FundraisingProgress] Auto-refresh triggered');
      loadFundraisingData();
    }, 15000);
    
    return () => {
      console.log('🛑 [FundraisingProgress] Component unmounting, cleaning up...');
      paymentsChannel.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const loadFundraisingData = async () => {
    try {
      console.log('');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('🔄 [FundraisingProgress] LOADING FUNDRAISING DATA - START');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('');
      
      // Get total USDT from all confirmed/finished payments
      const { data: paymentsData, error } = await supabase
        .from('payments')
        .select('price_amount, status, order_id, created_at')
        .in('status', ['finished', 'confirmed'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [FundraisingProgress] Error loading fundraising data:', error);
        setLoading(false);
        return;
      }

      if (!paymentsData || paymentsData.length === 0) {
        console.warn('⚠️ [FundraisingProgress] No payments data returned');
        setLoading(false);
        return;
      }

      console.log('📦 [FundraisingProgress] Raw payments data count:', paymentsData.length);
      console.log('📦 [FundraisingProgress] Raw payments data:', JSON.stringify(paymentsData, null, 2));
      
      // DRASTIC FIX: Calculate totals with ultra-robust parsing
      let total = 0;
      let finishedTotal = 0;
      let confirmedTotal = 0;
      let adminTotal = 0;
      let userTotal = 0;
      let adminCount = 0;
      let userCount = 0;
      
      console.log('');
      console.log('───────────────────────────────────────────────────────────');
      console.log('💵 PROCESSING INDIVIDUAL PAYMENTS:');
      console.log('───────────────────────────────────────────────────────────');
      
      paymentsData.forEach((payment, index) => {
        console.log('');
        console.log(`💳 Payment #${index + 1}/${paymentsData.length}:`);
        console.log(`   Order ID: ${payment.order_id}`);
        console.log(`   Status: ${payment.status}`);
        console.log(`   Raw Amount: ${JSON.stringify(payment.price_amount)}`);
        console.log(`   Raw Amount Type: ${typeof payment.price_amount}`);
        
        const amount = parsePriceAmount(payment.price_amount);
        console.log(`   ✅ Parsed Amount: ${amount} USDT`);
        
        const isAdmin = payment.order_id?.startsWith('ADMIN-') || false;
        console.log(`   Type: ${isAdmin ? '🔧 ADMIN' : '👥 USER'}`);
        
        // Add to total
        total += amount;
        console.log(`   Running Total: ${total} USDT`);
        
        // Add to status totals
        if (payment.status === 'finished') {
          finishedTotal += amount;
          console.log(`   Added to Finished Total: ${finishedTotal} USDT`);
        } else if (payment.status === 'confirmed') {
          confirmedTotal += amount;
          console.log(`   Added to Confirmed Total: ${confirmedTotal} USDT`);
        }
        
        // Add to type totals
        if (isAdmin) {
          adminTotal += amount;
          adminCount++;
          console.log(`   Added to Admin Total: ${adminTotal} USDT (Count: ${adminCount})`);
        } else {
          userTotal += amount;
          userCount++;
          console.log(`   Added to User Total: ${userTotal} USDT (Count: ${userCount})`);
        }
      });
      
      console.log('');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('💰 FINAL CALCULATION SUMMARY:');
      console.log('═══════════════════════════════════════════════════════════');
      console.log(`  🎯 TOTAL RAISED: ${total.toFixed(2)} USDT`);
      console.log(`  ✅ Finished Payments: ${finishedTotal.toFixed(2)} USDT`);
      console.log(`  ✓ Confirmed Payments: ${confirmedTotal.toFixed(2)} USDT`);
      console.log(`  👥 User Purchases: ${userTotal.toFixed(2)} USDT (${userCount} payments)`);
      console.log(`  🔧 Admin Additions: ${adminTotal.toFixed(2)} USDT (${adminCount} payments)`);
      console.log(`  📈 Progress: ${((total / MAX_FUNDRAISING_GOAL) * 100).toFixed(4)}%`);
      console.log(`  🔍 Verification: userTotal + adminTotal = ${(userTotal + adminTotal).toFixed(2)} USDT`);
      console.log(`  🔍 Verification: finishedTotal + confirmedTotal = ${(finishedTotal + confirmedTotal).toFixed(2)} USDT`);
      console.log(`  ⏰ Timestamp: ${new Date().toISOString()}`);
      console.log('═══════════════════════════════════════════════════════════');
      console.log('');
      
      // DRASTIC FIX: Force state update with explicit values
      console.log('🔄 [FundraisingProgress] Updating state with new values...');
      setTotalRaised(total);
      setDebugInfo({
        userTotal,
        adminTotal,
        userCount,
        adminCount,
        finishedTotal,
        confirmedTotal,
        rawPayments: paymentsData,
      });
      setLastUpdate(new Date());
      setRefreshCount(prev => prev + 1);
      
      console.log('✅ [FundraisingProgress] State updated successfully');
      console.log(`   Total Raised State: ${total}`);
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
      `Total recaudado: $${totalRaised.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`,
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

      {/* Main Stats - DRASTIC FIX: Display with explicit formatting */}
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

      {/* Breakdown Info */}
      <View style={styles.breakdownSection}>
        <Text style={styles.breakdownTitle}>Desglose de Recaudación</Text>
        
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

      {/* Debug Info - DRASTIC FIX: Show raw calculation */}
      <TouchableOpacity 
        style={styles.debugSection}
        onPress={() => {
          Alert.alert(
            'Debug Info',
            `Total Raised: ${totalRaised}\n` +
            `User Total: ${debugInfo.userTotal}\n` +
            `Admin Total: ${debugInfo.adminTotal}\n` +
            `Finished: ${debugInfo.finishedTotal}\n` +
            `Confirmed: ${debugInfo.confirmedTotal}\n` +
            `Payments Count: ${debugInfo.rawPayments.length}\n` +
            `Refresh Count: ${refreshCount}`,
            [{ text: 'OK' }]
          );
        }}
      >
        <Text style={styles.debugText}>
          🔍 Debug: Tap para ver detalles técnicos
        </Text>
      </TouchableOpacity>

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
  );
}

const styles = StyleSheet.create({
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
  debugSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  debugText: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
    fontFamily: 'monospace',
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
