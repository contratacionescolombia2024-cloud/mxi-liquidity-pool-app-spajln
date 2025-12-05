
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
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

export function FundraisingProgress() {
  const { t } = useLanguage();
  const [totalRaised, setTotalRaised] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [debugInfo, setDebugInfo] = useState<{
    userTotal: number;
    adminTotal: number;
    userCount: number;
    adminCount: number;
  }>({ userTotal: 0, adminTotal: 0, userCount: 0, adminCount: 0 });

  useEffect(() => {
    loadFundraisingData();
    
    // Set up real-time subscription for payments table
    const paymentsChannel = supabase
      .channel('fundraising-payments-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
        },
        (payload) => {
          console.log('💰 Payment update detected:', payload);
          loadFundraisingData();
        }
      )
      .subscribe();

    // Refresh every 30 seconds as backup
    const interval = setInterval(loadFundraisingData, 30000);
    
    return () => {
      paymentsChannel.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const loadFundraisingData = async () => {
    try {
      console.log('🔄 Loading fundraising data...');
      
      // Get total USDT from all confirmed/finished payments
      // This includes:
      // 1. User MXI purchases (status = 'finished' or 'confirmed')
      // 2. Admin-added balances (order_id starts with 'ADMIN-')
      const { data: paymentsData, error } = await supabase
        .from('payments')
        .select('price_amount, status, order_id')
        .in('status', ['finished', 'confirmed']);

      if (error) {
        console.error('❌ Error loading fundraising data:', error);
        return;
      }

      if (paymentsData) {
        // Calculate total from all confirmed payments
        // Make sure to convert price_amount to number properly
        const total = paymentsData.reduce((sum, payment) => {
          const amount = parseFloat(String(payment.price_amount || '0'));
          console.log(`  💵 Payment ${payment.order_id}: ${amount} USDT (status: ${payment.status})`);
          return sum + amount;
        }, 0);
        
        // Count different types of payments
        const adminPayments = paymentsData.filter(p => p.order_id?.startsWith('ADMIN-'));
        const userPayments = paymentsData.filter(p => !p.order_id?.startsWith('ADMIN-'));
        
        const adminTotal = adminPayments.reduce((sum, p) => sum + parseFloat(String(p.price_amount || '0')), 0);
        const userTotal = userPayments.reduce((sum, p) => sum + parseFloat(String(p.price_amount || '0')), 0);
        
        console.log('💰 Fundraising Data Summary:');
        console.log('  📊 Total Raised:', total, 'USDT');
        console.log('  👥 User Purchases:', userTotal, 'USDT', `(${userPayments.length} payments)`);
        console.log('  🔧 Admin Additions:', adminTotal, 'USDT', `(${adminPayments.length} payments)`);
        console.log('  📈 Progress:', ((total / MAX_FUNDRAISING_GOAL) * 100).toFixed(4), '%');
        
        setTotalRaised(total);
        setDebugInfo({
          userTotal,
          adminTotal,
          userCount: userPayments.length,
          adminCount: adminPayments.length,
        });
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('❌ Error in loadFundraisingData:', error);
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = (totalRaised / MAX_FUNDRAISING_GOAL) * 100;
  const remaining = MAX_FUNDRAISING_GOAL - totalRaised;

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
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
        <View style={styles.breakdownRow}>
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
          Última actualización: {lastUpdate.toLocaleTimeString('es-ES')}
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
  header: {
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    minHeight: 110,
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
    marginBottom: 20,
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
