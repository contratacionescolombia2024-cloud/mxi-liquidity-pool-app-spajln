
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface EcosystemStats {
  totalSupply: number;
  circulatingSupply: number;
  poolSize: number;
  holders: number;
  marketCap: number;
}

export default function EcosystemScreen() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<EcosystemStats | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'tokenomics' | 'roadmap' | 'partners'>('overview');

  useEffect(() => {
    loadEcosystemData();
  }, []);

  const loadEcosystemData = async () => {
    try {
      setLoading(true);

      // Get global metrics
      const { data: metricsData, error: metricsError } = await supabase
        .from('global_metrics')
        .select('*')
        .single();

      if (metricsError) {
        console.error('Error loading metrics:', metricsError);
      }

      // Calculate ecosystem stats
      const totalSupply = 1000000000; // 1 billion MXI total supply
      const circulatingSupply = metricsData?.total_mxi_distributed || 0;
      const poolSize = metricsData?.total_pool_value || 0;
      const holders = metricsData?.total_users || 56527;

      setStats({
        totalSupply,
        circulatingSupply,
        poolSize,
        holders,
        marketCap: circulatingSupply * 0.7, // Assuming average price of 0.7 USDT
      });
    } catch (error) {
      console.error('Error loading ecosystem data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(2) + 'K';
    }
    return num.toFixed(2);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando ecosistema...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌐 Ecosistema MXI</Text>
        <Text style={styles.headerSubtitle}>Descubre el futuro de Maxcoin</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'overview' && styles.tabActive]}
          onPress={() => setSelectedTab('overview')}
        >
          <Text style={[styles.tabText, selectedTab === 'overview' && styles.tabTextActive]}>
            Resumen
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'tokenomics' && styles.tabActive]}
          onPress={() => setSelectedTab('tokenomics')}
        >
          <Text style={[styles.tabText, selectedTab === 'tokenomics' && styles.tabTextActive]}>
            Tokenomics
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'roadmap' && styles.tabActive]}
          onPress={() => setSelectedTab('roadmap')}
        >
          <Text style={[styles.tabText, selectedTab === 'roadmap' && styles.tabTextActive]}>
            Roadmap
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'partners' && styles.tabActive]}
          onPress={() => setSelectedTab('partners')}
        >
          <Text style={[styles.tabText, selectedTab === 'partners' && styles.tabTextActive]}>
            Partners
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {selectedTab === 'overview' && (
          <View>
            {/* Key Metrics */}
            <View style={styles.metricsGrid}>
              <View style={[commonStyles.card, styles.metricCard]}>
                <IconSymbol 
                  ios_icon_name="chart.pie.fill" 
                  android_material_icon_name="pie_chart" 
                  size={32} 
                  color={colors.primary} 
                />
                <Text style={styles.metricValue}>{formatNumber(stats?.totalSupply || 0)}</Text>
                <Text style={styles.metricLabel}>Suministro Total</Text>
              </View>

              <View style={[commonStyles.card, styles.metricCard]}>
                <IconSymbol 
                  ios_icon_name="arrow.triangle.2.circlepath" 
                  android_material_icon_name="sync" 
                  size={32} 
                  color={colors.success} 
                />
                <Text style={styles.metricValue}>{formatNumber(stats?.circulatingSupply || 0)}</Text>
                <Text style={styles.metricLabel}>En Circulación</Text>
              </View>

              <View style={[commonStyles.card, styles.metricCard]}>
                <IconSymbol 
                  ios_icon_name="drop.fill" 
                  android_material_icon_name="water_drop" 
                  size={32} 
                  color={colors.accent} 
                />
                <Text style={styles.metricValue}>{formatCurrency(stats?.poolSize || 0)}</Text>
                <Text style={styles.metricLabel}>Pool de Liquidez</Text>
              </View>

              <View style={[commonStyles.card, styles.metricCard]}>
                <IconSymbol 
                  ios_icon_name="person.3.fill" 
                  android_material_icon_name="group" 
                  size={32} 
                  color={colors.warning} 
                />
                <Text style={styles.metricValue}>{formatNumber(stats?.holders || 0)}</Text>
                <Text style={styles.metricLabel}>Holders</Text>
              </View>
            </View>

            {/* Vision Card */}
            <View style={[commonStyles.card, styles.visionCard]}>
              <LinearGradient
                colors={[colors.primary + '30', colors.accent + '30']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.visionGradient}
              >
                <IconSymbol 
                  ios_icon_name="sparkles" 
                  android_material_icon_name="auto_awesome" 
                  size={48} 
                  color={colors.primary} 
                />
                <Text style={styles.visionTitle}>Nuestra Visión</Text>
                <Text style={styles.visionText}>
                  Maxcoin (MXI) está revolucionando el mundo de las criptomonedas con un ecosistema 
                  robusto y sostenible. Nuestro pool de liquidez garantiza estabilidad y crecimiento 
                  continuo para todos los participantes.
                </Text>
              </LinearGradient>
            </View>

            {/* Key Features */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Características Clave</Text>
              
              <View style={styles.featureCard}>
                <View style={[styles.featureIcon, { backgroundColor: colors.primary + '20' }]}>
                  <IconSymbol 
                    ios_icon_name="shield.fill" 
                    android_material_icon_name="shield" 
                    size={28} 
                    color={colors.primary} 
                  />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Seguridad Garantizada</Text>
                  <Text style={styles.featureDescription}>
                    Smart contracts auditados y sistema de seguridad multicapa
                  </Text>
                </View>
              </View>

              <View style={styles.featureCard}>
                <View style={[styles.featureIcon, { backgroundColor: colors.success + '20' }]}>
                  <IconSymbol 
                    ios_icon_name="chart.line.uptrend.xyaxis" 
                    android_material_icon_name="trending_up" 
                    size={28} 
                    color={colors.success} 
                  />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Rendimiento Pasivo</Text>
                  <Text style={styles.featureDescription}>
                    Genera ingresos automáticos con nuestro sistema de vesting
                  </Text>
                </View>
              </View>

              <View style={styles.featureCard}>
                <View style={[styles.featureIcon, { backgroundColor: colors.accent + '20' }]}>
                  <IconSymbol 
                    ios_icon_name="person.2.fill" 
                    android_material_icon_name="people" 
                    size={28} 
                    color={colors.accent} 
                  />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Comunidad Global</Text>
                  <Text style={styles.featureDescription}>
                    Únete a miles de inversores en todo el mundo
                  </Text>
                </View>
              </View>

              <View style={styles.featureCard}>
                <View style={[styles.featureIcon, { backgroundColor: colors.warning + '20' }]}>
                  <IconSymbol 
                    ios_icon_name="bolt.fill" 
                    android_material_icon_name="flash_on" 
                    size={28} 
                    color={colors.warning} 
                  />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Transacciones Rápidas</Text>
                  <Text style={styles.featureDescription}>
                    Procesamiento instantáneo en la red Binance Smart Chain
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {selectedTab === 'tokenomics' && (
          <View>
            {/* Distribution Chart */}
            <View style={[commonStyles.card, styles.distributionCard]}>
              <Text style={styles.cardTitle}>Distribución de Tokens</Text>
              
              <View style={styles.distributionItem}>
                <View style={styles.distributionBar}>
                  <View style={[styles.distributionFill, { width: '40%', backgroundColor: colors.primary }]} />
                </View>
                <View style={styles.distributionInfo}>
                  <Text style={styles.distributionLabel}>Pool de Liquidez</Text>
                  <Text style={styles.distributionValue}>40% - 400M MXI</Text>
                </View>
              </View>

              <View style={styles.distributionItem}>
                <View style={styles.distributionBar}>
                  <View style={[styles.distributionFill, { width: '25%', backgroundColor: colors.success }]} />
                </View>
                <View style={styles.distributionInfo}>
                  <Text style={styles.distributionLabel}>Preventa Pública</Text>
                  <Text style={styles.distributionValue}>25% - 250M MXI</Text>
                </View>
              </View>

              <View style={styles.distributionItem}>
                <View style={styles.distributionBar}>
                  <View style={[styles.distributionFill, { width: '15%', backgroundColor: colors.accent }]} />
                </View>
                <View style={styles.distributionInfo}>
                  <Text style={styles.distributionLabel}>Equipo & Desarrollo</Text>
                  <Text style={styles.distributionValue}>15% - 150M MXI</Text>
                </View>
              </View>

              <View style={styles.distributionItem}>
                <View style={styles.distributionBar}>
                  <View style={[styles.distributionFill, { width: '10%', backgroundColor: colors.warning }]} />
                </View>
                <View style={styles.distributionInfo}>
                  <Text style={styles.distributionLabel}>Marketing</Text>
                  <Text style={styles.distributionValue}>10% - 100M MXI</Text>
                </View>
              </View>

              <View style={styles.distributionItem}>
                <View style={styles.distributionBar}>
                  <View style={[styles.distributionFill, { width: '10%', backgroundColor: colors.secondary }]} />
                </View>
                <View style={styles.distributionInfo}>
                  <Text style={styles.distributionLabel}>Reserva</Text>
                  <Text style={styles.distributionValue}>10% - 100M MXI</Text>
                </View>
              </View>
            </View>

            {/* Pricing Phases */}
            <View style={[commonStyles.card, styles.phasesCard]}>
              <Text style={styles.cardTitle}>Fases de Preventa</Text>
              
              <View style={styles.phaseItem}>
                <View style={[styles.phaseNumber, { backgroundColor: colors.primary }]}>
                  <Text style={styles.phaseNumberText}>1</Text>
                </View>
                <View style={styles.phaseContent}>
                  <Text style={styles.phaseTitle}>Fase 1 - Early Bird</Text>
                  <Text style={styles.phasePrice}>0.40 USDT por MXI</Text>
                  <Text style={styles.phaseDescription}>Precio especial para primeros inversores</Text>
                </View>
              </View>

              <View style={styles.phaseItem}>
                <View style={[styles.phaseNumber, { backgroundColor: colors.success }]}>
                  <Text style={styles.phaseNumberText}>2</Text>
                </View>
                <View style={styles.phaseContent}>
                  <Text style={styles.phaseTitle}>Fase 2 - Growth</Text>
                  <Text style={styles.phasePrice}>0.70 USDT por MXI</Text>
                  <Text style={styles.phaseDescription}>Precio intermedio con bonos</Text>
                </View>
              </View>

              <View style={styles.phaseItem}>
                <View style={[styles.phaseNumber, { backgroundColor: colors.accent }]}>
                  <Text style={styles.phaseNumberText}>3</Text>
                </View>
                <View style={styles.phaseContent}>
                  <Text style={styles.phaseTitle}>Fase 3 - Final</Text>
                  <Text style={styles.phasePrice}>1.00 USDT por MXI</Text>
                  <Text style={styles.phaseDescription}>Precio de lanzamiento oficial</Text>
                </View>
              </View>
            </View>

            {/* Utility */}
            <View style={[commonStyles.card, styles.utilityCard]}>
              <Text style={styles.cardTitle}>Utilidad del Token</Text>
              <View style={styles.utilityList}>
                <View style={styles.utilityItem}>
                  <IconSymbol 
                    ios_icon_name="checkmark.circle.fill" 
                    android_material_icon_name="check_circle" 
                    size={20} 
                    color={colors.success} 
                  />
                  <Text style={styles.utilityText}>Participación en pool de liquidez</Text>
                </View>
                <View style={styles.utilityItem}>
                  <IconSymbol 
                    ios_icon_name="checkmark.circle.fill" 
                    android_material_icon_name="check_circle" 
                    size={20} 
                    color={colors.success} 
                  />
                  <Text style={styles.utilityText}>Generación de rendimiento pasivo</Text>
                </View>
                <View style={styles.utilityItem}>
                  <IconSymbol 
                    ios_icon_name="checkmark.circle.fill" 
                    android_material_icon_name="check_circle" 
                    size={20} 
                    color={colors.success} 
                  />
                  <Text style={styles.utilityText}>Acceso a sorteos y recompensas</Text>
                </View>
                <View style={styles.utilityItem}>
                  <IconSymbol 
                    ios_icon_name="checkmark.circle.fill" 
                    android_material_icon_name="check_circle" 
                    size={20} 
                    color={colors.success} 
                  />
                  <Text style={styles.utilityText}>Comisiones por referidos</Text>
                </View>
                <View style={styles.utilityItem}>
                  <IconSymbol 
                    ios_icon_name="checkmark.circle.fill" 
                    android_material_icon_name="check_circle" 
                    size={20} 
                    color={colors.success} 
                  />
                  <Text style={styles.utilityText}>Gobernanza y votación</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {selectedTab === 'roadmap' && (
          <View>
            <View style={[commonStyles.card, styles.roadmapCard]}>
              <Text style={styles.cardTitle}>Hoja de Ruta 2025-2026</Text>

              {/* Q1 2025 */}
              <View style={styles.roadmapPhase}>
                <View style={[styles.roadmapBadge, { backgroundColor: colors.success }]}>
                  <Text style={styles.roadmapBadgeText}>COMPLETADO</Text>
                </View>
                <Text style={styles.roadmapQuarter}>Q1 2025</Text>
                <View style={styles.roadmapItems}>
                  <View style={styles.roadmapItem}>
                    <IconSymbol 
                      ios_icon_name="checkmark.circle.fill" 
                      android_material_icon_name="check_circle" 
                      size={20} 
                      color={colors.success} 
                    />
                    <Text style={styles.roadmapItemText}>Lanzamiento de la plataforma</Text>
                  </View>
                  <View style={styles.roadmapItem}>
                    <IconSymbol 
                      ios_icon_name="checkmark.circle.fill" 
                      android_material_icon_name="check_circle" 
                      size={20} 
                      color={colors.success} 
                    />
                    <Text style={styles.roadmapItemText}>Inicio de preventa Fase 1</Text>
                  </View>
                  <View style={styles.roadmapItem}>
                    <IconSymbol 
                      ios_icon_name="checkmark.circle.fill" 
                      android_material_icon_name="check_circle" 
                      size={20} 
                      color={colors.success} 
                    />
                    <Text style={styles.roadmapItemText}>Sistema de referidos activo</Text>
                  </View>
                </View>
              </View>

              {/* Q2 2025 */}
              <View style={styles.roadmapPhase}>
                <View style={[styles.roadmapBadge, { backgroundColor: colors.warning }]}>
                  <Text style={styles.roadmapBadgeText}>EN PROGRESO</Text>
                </View>
                <Text style={styles.roadmapQuarter}>Q2 2025</Text>
                <View style={styles.roadmapItems}>
                  <View style={styles.roadmapItem}>
                    <IconSymbol 
                      ios_icon_name="circle.fill" 
                      android_material_icon_name="circle" 
                      size={20} 
                      color={colors.warning} 
                    />
                    <Text style={styles.roadmapItemText}>Fase 2 de preventa</Text>
                  </View>
                  <View style={styles.roadmapItem}>
                    <IconSymbol 
                      ios_icon_name="circle.fill" 
                      android_material_icon_name="circle" 
                      size={20} 
                      color={colors.warning} 
                    />
                    <Text style={styles.roadmapItemText}>Lanzamiento de lotería</Text>
                  </View>
                  <View style={styles.roadmapItem}>
                    <IconSymbol 
                      ios_icon_name="circle.fill" 
                      android_material_icon_name="circle" 
                      size={20} 
                      color={colors.warning} 
                    />
                    <Text style={styles.roadmapItemText}>Sistema de vesting mejorado</Text>
                  </View>
                </View>
              </View>

              {/* Q3 2025 */}
              <View style={styles.roadmapPhase}>
                <View style={[styles.roadmapBadge, { backgroundColor: colors.textSecondary }]}>
                  <Text style={styles.roadmapBadgeText}>PRÓXIMO</Text>
                </View>
                <Text style={styles.roadmapQuarter}>Q3 2025</Text>
                <View style={styles.roadmapItems}>
                  <View style={styles.roadmapItem}>
                    <IconSymbol 
                      ios_icon_name="circle" 
                      android_material_icon_name="circle" 
                      size={20} 
                      color={colors.textSecondary} 
                    />
                    <Text style={styles.roadmapItemText}>Fase 3 de preventa</Text>
                  </View>
                  <View style={styles.roadmapItem}>
                    <IconSymbol 
                      ios_icon_name="circle" 
                      android_material_icon_name="circle" 
                      size={20} 
                      color={colors.textSecondary} 
                    />
                    <Text style={styles.roadmapItemText}>Auditoría de smart contracts</Text>
                  </View>
                  <View style={styles.roadmapItem}>
                    <IconSymbol 
                      ios_icon_name="circle" 
                      android_material_icon_name="circle" 
                      size={20} 
                      color={colors.textSecondary} 
                    />
                    <Text style={styles.roadmapItemText}>Partnerships estratégicos</Text>
                  </View>
                </View>
              </View>

              {/* Q4 2025 */}
              <View style={styles.roadmapPhase}>
                <View style={[styles.roadmapBadge, { backgroundColor: colors.textSecondary }]}>
                  <Text style={styles.roadmapBadgeText}>PRÓXIMO</Text>
                </View>
                <Text style={styles.roadmapQuarter}>Q4 2025</Text>
                <View style={styles.roadmapItems}>
                  <View style={styles.roadmapItem}>
                    <IconSymbol 
                      ios_icon_name="circle" 
                      android_material_icon_name="circle" 
                      size={20} 
                      color={colors.textSecondary} 
                    />
                    <Text style={styles.roadmapItemText}>Preparación para lanzamiento</Text>
                  </View>
                  <View style={styles.roadmapItem}>
                    <IconSymbol 
                      ios_icon_name="circle" 
                      android_material_icon_name="circle" 
                      size={20} 
                      color={colors.textSecondary} 
                    />
                    <Text style={styles.roadmapItemText}>Marketing masivo</Text>
                  </View>
                  <View style={styles.roadmapItem}>
                    <IconSymbol 
                      ios_icon_name="circle" 
                      android_material_icon_name="circle" 
                      size={20} 
                      color={colors.textSecondary} 
                    />
                    <Text style={styles.roadmapItemText}>Cierre de preventa</Text>
                  </View>
                </View>
              </View>

              {/* Q1 2026 */}
              <View style={styles.roadmapPhase}>
                <View style={[styles.roadmapBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.roadmapBadgeText}>LANZAMIENTO</Text>
                </View>
                <Text style={styles.roadmapQuarter}>15 Enero 2026 - 12:00 UTC</Text>
                <View style={styles.roadmapItems}>
                  <View style={styles.roadmapItem}>
                    <IconSymbol 
                      ios_icon_name="star.fill" 
                      android_material_icon_name="star" 
                      size={20} 
                      color={colors.primary} 
                    />
                    <Text style={styles.roadmapItemText}>Lanzamiento oficial de MXI</Text>
                  </View>
                  <View style={styles.roadmapItem}>
                    <IconSymbol 
                      ios_icon_name="star.fill" 
                      android_material_icon_name="star" 
                      size={20} 
                      color={colors.primary} 
                    />
                    <Text style={styles.roadmapItemText}>Listado en exchanges</Text>
                  </View>
                  <View style={styles.roadmapItem}>
                    <IconSymbol 
                      ios_icon_name="star.fill" 
                      android_material_icon_name="star" 
                      size={20} 
                      color={colors.primary} 
                    />
                    <Text style={styles.roadmapItemText}>Pool de liquidez activo</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Launch Countdown */}
            <View style={[commonStyles.card, styles.countdownCard]}>
              <LinearGradient
                colors={[colors.primary + '30', colors.accent + '30']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.countdownGradient}
              >
                <IconSymbol 
                  ios_icon_name="rocket.fill" 
                  android_material_icon_name="rocket_launch" 
                  size={48} 
                  color={colors.primary} 
                />
                <Text style={styles.countdownTitle}>Lanzamiento Oficial</Text>
                <Text style={styles.countdownDate}>15 de Enero 2026</Text>
                <Text style={styles.countdownTime}>12:00 UTC Central</Text>
                <Text style={styles.countdownDescription}>
                  ¡No te pierdas el evento más esperado del año en el mundo crypto!
                </Text>
              </LinearGradient>
            </View>
          </View>
        )}

        {selectedTab === 'partners' && (
          <View>
            {/* Strategic Partners */}
            <View style={[commonStyles.card, styles.partnersCard]}>
              <Text style={styles.cardTitle}>Socios Estratégicos</Text>
              
              <View style={styles.partnerItem}>
                <View style={[styles.partnerIcon, { backgroundColor: colors.warning + '20' }]}>
                  <IconSymbol 
                    ios_icon_name="building.2.fill" 
                    android_material_icon_name="business" 
                    size={32} 
                    color={colors.warning} 
                  />
                </View>
                <View style={styles.partnerContent}>
                  <Text style={styles.partnerName}>Binance Smart Chain</Text>
                  <Text style={styles.partnerDescription}>
                    Plataforma blockchain principal para MXI
                  </Text>
                </View>
              </View>

              <View style={styles.partnerItem}>
                <View style={[styles.partnerIcon, { backgroundColor: colors.success + '20' }]}>
                  <IconSymbol 
                    ios_icon_name="shield.checkered" 
                    android_material_icon_name="verified_user" 
                    size={32} 
                    color={colors.success} 
                  />
                </View>
                <View style={styles.partnerContent}>
                  <Text style={styles.partnerName}>CertiK Audit</Text>
                  <Text style={styles.partnerDescription}>
                    Auditoría de seguridad de smart contracts
                  </Text>
                </View>
              </View>

              <View style={styles.partnerItem}>
                <View style={[styles.partnerIcon, { backgroundColor: colors.accent + '20' }]}>
                  <IconSymbol 
                    ios_icon_name="chart.bar.fill" 
                    android_material_icon_name="bar_chart" 
                    size={32} 
                    color={colors.accent} 
                  />
                </View>
                <View style={styles.partnerContent}>
                  <Text style={styles.partnerName}>CoinMarketCap</Text>
                  <Text style={styles.partnerDescription}>
                    Listado y tracking de precio en tiempo real
                  </Text>
                </View>
              </View>

              <View style={styles.partnerItem}>
                <View style={[styles.partnerIcon, { backgroundColor: colors.primary + '20' }]}>
                  <IconSymbol 
                    ios_icon_name="globe" 
                    android_material_icon_name="public" 
                    size={32} 
                    color={colors.primary} 
                  />
                </View>
                <View style={styles.partnerContent}>
                  <Text style={styles.partnerName}>CoinGecko</Text>
                  <Text style={styles.partnerDescription}>
                    Análisis de mercado y datos de trading
                  </Text>
                </View>
              </View>
            </View>

            {/* Technology Stack */}
            <View style={[commonStyles.card, styles.techCard]}>
              <Text style={styles.cardTitle}>Stack Tecnológico</Text>
              
              <View style={styles.techGrid}>
                <View style={styles.techItem}>
                  <IconSymbol 
                    ios_icon_name="link" 
                    android_material_icon_name="link" 
                    size={24} 
                    color={colors.primary} 
                  />
                  <Text style={styles.techName}>Blockchain</Text>
                  <Text style={styles.techValue}>BSC</Text>
                </View>

                <View style={styles.techItem}>
                  <IconSymbol 
                    ios_icon_name="doc.text.fill" 
                    android_material_icon_name="description" 
                    size={24} 
                    color={colors.success} 
                  />
                  <Text style={styles.techName}>Smart Contract</Text>
                  <Text style={styles.techValue}>Solidity</Text>
                </View>

                <View style={styles.techItem}>
                  <IconSymbol 
                    ios_icon_name="wallet.pass.fill" 
                    android_material_icon_name="account_balance_wallet" 
                    size={24} 
                    color={colors.accent} 
                  />
                  <Text style={styles.techName}>Wallet</Text>
                  <Text style={styles.techValue}>MetaMask</Text>
                </View>

                <View style={styles.techItem}>
                  <IconSymbol 
                    ios_icon_name="arrow.left.arrow.right" 
                    android_material_icon_name="swap_horiz" 
                    size={24} 
                    color={colors.warning} 
                  />
                  <Text style={styles.techName}>DEX</Text>
                  <Text style={styles.techValue}>PancakeSwap</Text>
                </View>
              </View>
            </View>

            {/* Community */}
            <View style={[commonStyles.card, styles.communityCard]}>
              <Text style={styles.cardTitle}>Únete a la Comunidad</Text>
              
              <TouchableOpacity style={styles.socialButton}>
                <IconSymbol 
                  ios_icon_name="paperplane.fill" 
                  android_material_icon_name="send" 
                  size={24} 
                  color="#0088cc" 
                />
                <Text style={styles.socialButtonText}>Telegram</Text>
                <IconSymbol 
                  ios_icon_name="chevron.right" 
                  android_material_icon_name="chevron_right" 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.socialButton}>
                <IconSymbol 
                  ios_icon_name="bird.fill" 
                  android_material_icon_name="flutter_dash" 
                  size={24} 
                  color="#1DA1F2" 
                />
                <Text style={styles.socialButtonText}>Twitter</Text>
                <IconSymbol 
                  ios_icon_name="chevron.right" 
                  android_material_icon_name="chevron_right" 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.socialButton}>
                <IconSymbol 
                  ios_icon_name="message.fill" 
                  android_material_icon_name="forum" 
                  size={24} 
                  color="#7289DA" 
                />
                <Text style={styles.socialButtonText}>Discord</Text>
                <IconSymbol 
                  ios_icon_name="chevron.right" 
                  android_material_icon_name="chevron_right" 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.socialButton}>
                <IconSymbol 
                  ios_icon_name="play.rectangle.fill" 
                  android_material_icon_name="play_circle" 
                  size={24} 
                  color="#FF0000" 
                />
                <Text style={styles.socialButtonText}>YouTube</Text>
                <IconSymbol 
                  ios_icon_name="chevron.right" 
                  android_material_icon_name="chevron_right" 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
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
    fontSize: 14,
    color: colors.textSecondary,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: '#000',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    width: (width - 52) / 2,
    alignItems: 'center',
    paddingVertical: 20,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  visionCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 24,
  },
  visionGradient: {
    padding: 24,
    alignItems: 'center',
  },
  visionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 12,
  },
  visionText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
  },
  distributionCard: {
    marginBottom: 24,
  },
  distributionItem: {
    marginBottom: 20,
  },
  distributionBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  distributionFill: {
    height: '100%',
    borderRadius: 4,
  },
  distributionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distributionLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  distributionValue: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  phasesCard: {
    marginBottom: 24,
  },
  phaseItem: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  phaseNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseNumberText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  phaseContent: {
    flex: 1,
  },
  phaseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  phasePrice: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  phaseDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  utilityCard: {
    marginBottom: 24,
  },
  utilityList: {
    gap: 12,
  },
  utilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  utilityText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  roadmapCard: {
    marginBottom: 24,
  },
  roadmapPhase: {
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  roadmapBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
  },
  roadmapBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  roadmapQuarter: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  roadmapItems: {
    gap: 8,
  },
  roadmapItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  roadmapItemText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
  },
  countdownCard: {
    padding: 0,
    overflow: 'hidden',
  },
  countdownGradient: {
    padding: 32,
    alignItems: 'center',
  },
  countdownTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  countdownDate: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  countdownTime: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  countdownDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  partnersCard: {
    marginBottom: 24,
  },
  partnerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  partnerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  partnerContent: {
    flex: 1,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  partnerDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  techCard: {
    marginBottom: 24,
  },
  techGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  techItem: {
    width: (width - 64) / 2,
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  techName: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    marginBottom: 4,
  },
  techValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  communityCard: {
    marginBottom: 24,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  socialButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
