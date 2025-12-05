
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';

const MAX_FUNDRAISING_GOAL = 21000000; // 21,000,000 USDT

export function FundraisingProgress() {
  const { t } = useLanguage();
  const [totalRaised, setTotalRaised] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFundraisingData();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadFundraisingData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadFundraisingData = async () => {
    try {
      // Get total USDT contributed from all users
      const { data: usersData, error } = await supabase
        .from('users')
        .select('usdt_contributed');

      if (error) {
        console.error('Error loading fundraising data:', error);
        return;
      }

      if (usersData) {
        const total = usersData.reduce((sum, user) => {
          return sum + parseFloat(user.usdt_contributed || '0');
        }, 0);
        
        setTotalRaised(total);
      }
    } catch (error) {
      console.error('Error in loadFundraisingData:', error);
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
            ${totalRaised.toLocaleString('es-ES', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
          <Text style={styles.statUnit}>USDT</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Meta Total</Text>
          <Text style={styles.statValue}>
            ${MAX_FUNDRAISING_GOAL.toLocaleString('es-ES', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </Text>
          <Text style={styles.statUnit}>USDT</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Restante</Text>
          <Text style={styles.statValue}>
            ${remaining.toLocaleString('es-ES', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
          <Text style={styles.statUnit}>USDT</Text>
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
            {totalRaised.toLocaleString('es-ES', { maximumFractionDigits: 0 })} USDT
          </Text>
          <Text style={styles.progressFooterText}>
            {MAX_FUNDRAISING_GOAL.toLocaleString('es-ES', { maximumFractionDigits: 0 })} USDT
          </Text>
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
          El objetivo máximo es de 21,000,000 USDT para el desarrollo completo del ecosistema.
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
  },
  statLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginBottom: 6,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#00ff88',
    marginBottom: 2,
    fontFamily: 'monospace',
  },
  statUnit: {
    fontSize: 10,
    color: '#ffdd00',
    fontWeight: '600',
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
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 20,
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
