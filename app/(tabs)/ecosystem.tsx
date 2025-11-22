
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

      // Get global metrics for real-time data
      const { data: metricsData, error: metricsError } = await supabase
        .from('global_metrics')
        .select('*')
        .single();

      if (metricsError) {
        console.error('Error loading metrics:', metricsError);
      }

      // Use exact data from original project
      const totalSupply = 1000000000; // 1 billion MXI total supply
      const circulatingSupply = metricsData?.total_mxi_distributed || 0;
      const poolSize = metricsData?.total_pool_value || 0;
      const holders = metricsData?.total_users || 56527;

      setStats({
        totalSupply,
        circulatingSupply,
        poolSize,
        holders,
        marketCap: circulatingSupply * 0.7, // Based on average phase price
      });
    } catch (error) {
      console.error('Error loading ecosystem data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(2) + 'B';
    } else if (num >= 1000000) {
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
        <Text style={styles.headerSubtitle}>Pool de Liquidez Maxcoin</Text>
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
            Socios
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
                <Text style={styles.metricLabel}>Participantes</Text>
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
                  Maxcoin (MXI) revoluciona el mercado cripto con un pool de liquidez robusto 
                  que garantiza estabilidad y crecimiento sostenible. Participantes de todo el 
                  mundo se unen para construir el futuro de las finanzas descentralizadas.
                </Text>
              </LinearGradient>
            </View>

            {/* Pool Information */}
            <View style={[commonStyles.card, styles.poolInfoCard]}>
              <Text style={styles.cardTitle}>Información del Pool</Text>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Objetivo de Participantes:</Text>
                <Text style={styles.infoValue}>250,000</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Participantes Actuales:</Text>
                <Text style={[styles.infoValue, { color: colors.success }]}>
                  {formatNumber(stats?.holders || 56527)}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Inversión Mínima:</Text>
                <Text style={styles.infoValue}>50 USDT</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Inversión Máxima:</Text>
                <Text style={styles.infoValue}>100,000 USDT</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>MXI por 50 USDT:</Text>
                <Text style={styles.infoValue}>5 MXI (Fase 1)</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Fecha de Lanzamiento:</Text>
                <Text style={[styles.infoValue, { color: colors.primary }]}>
                  15 Enero 2026 - 12:00 UTC
                </Text>
              </View>
            </View>

            {/* Key Features */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Características Principales</Text>
              
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
                  <Text style={styles.featureTitle}>Pool de Liquidez Garantizado</Text>
                  <Text style={styles.featureDescription}>
                    Todos los fondos se destinan al pool para aportar valor real a MXI
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
                  <Text style={styles.featureTitle}>Sistema de Referidos</Text>
                  <Text style={styles.featureDescription}>
                    Gana comisiones: 3% nivel 1, 2% nivel 2, 1% nivel 3
                  </Text>
                </View>
              </View>

              <View style={styles.featureCard}>
                <View style={[styles.featureIcon, { backgroundColor: colors.accent + '20' }]}>
                  <IconSymbol 
                    ios_icon_name="clock.fill" 
                    android_material_icon_name="schedule" 
                    size={28} 
                    color={colors.accent} 
                  />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Retiros Programados</Text>
                  <Text style={styles.featureDescription}>
                    Retira comisiones cada 10 días con 5 referidos activos
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
                  <Text style={styles.featureTitle}>Integración Binance</Text>
                  <Text style={styles.featureDescription}>
                    Pagos seguros vinculando tu wallet de Binance
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
              <Text style={styles.cardSubtitle}>Total: 1,000,000,000 MXI</Text>
              
              <View style={styles.distributionItem}>
                <View style={styles.distributionBar}>
                  <View style={[styles.distributionFill, { width: '40%', backgroundColor: colors.primary }]} />
                </View>
                <View style={styles.distributionInfo}>
                  <Text style={styles.distributionLabel}>Pool de Liquidez</Text>
                  <Text style={styles.distributionValue}>40% - 400,000,000 MXI</Text>
                </View>
              </View>

              <View style={styles.distributionItem}>
                <View style={styles.distributionBar}>
                  <View style={[styles.distributionFill, { width: '25%', backgroundColor: colors.success }]} />
                </View>
                <View style={styles.distributionInfo}>
                  <Text style={styles.distributionLabel}>Preventa Pública</Text>
                  <Text style={styles.distributionValue}>25% - 250,000,000 MXI</Text>
                </View>
              </View>

              <View style={styles.distributionItem}>
                <View style={styles.distributionBar}>
                  <View style={[styles.distributionFill, { width: '15%', backgroundColor: colors.accent }]} />
                </View>
                <View style={styles.distributionInfo}>
                  <Text style={styles.distributionLabel}>Equipo & Desarrollo</Text>
                  <Text style={styles.distributionValue}>15% - 150,000,000 MXI</Text>
                </View>
              </View>

              <View style={styles.distributionItem}>
                <View style={styles.distributionBar}>
                  <View style={[styles.distributionFill, { width: '10%', backgroundColor: colors.warning }]} />
                </View>
                <View style={styles.distributionInfo}>
                  <Text style={styles.distributionLabel}>Marketing & Partnerships</Text>
                  <Text style={styles.distributionValue}>10% - 100,000,000 MXI</Text>
                </View>
              </View>

              <View style={styles.distributionItem}>
                <View style={styles.distributionBar}>
                  <View style={[styles.distributionFill, { width: '10%', backgroundColor: colors.secondary }]} />
                </View>
                <View style={styles.distributionInfo}>
                  <Text style={styles.distributionLabel}>Reserva Estratégica</Text>
                  <Text style={styles.distributionValue}>10% - 100,000,000 MXI</Text>
                </View>
              </View>
            </View>

            {/* Pricing Phases */}
            <View style={[commonStyles.card, styles.phasesCard]}>
              <Text style={styles.cardTitle}>Fases de Preventa</Text>
              <Text style={styles.cardSubtitle}>Precios progresivos hasta el lanzamiento</Text>
              
              <View style={styles.phaseItem}>
                <View style={[styles.phaseNumber, { backgroundColor: colors.primary }]}>
                  <Text style={styles.phaseNumberText}>1</Text>
                </View>
                <View style={styles.phaseContent}>
                  <Text style={styles.phaseTitle}>Fase 1 - Early Adopters</Text>
                  <Text style={styles.phasePrice}>0.40 USDT por MXI</Text>
                  <Text style={styles.phaseDescription}>
                    Precio especial para los primeros inversores del pool
                  </Text>
                  <Text style={styles.phaseAllocation}>Asignación: 83,333,333 MXI</Text>
                </View>
              </View>

              <View style={styles.phaseItem}>
                <View style={[styles.phaseNumber, { backgroundColor: colors.success }]}>
                  <Text style={styles.phaseNumberText}>2</Text>
                </View>
                <View style={styles.phaseContent}>
                  <Text style={styles.phaseTitle}>Fase 2 - Growth Phase</Text>
                  <Text style={styles.phasePrice}>0.70 USDT por MXI</Text>
                  <Text style={styles.phaseDescription}>
                    Precio intermedio con beneficios adicionales
                  </Text>
                  <Text style={styles.phaseAllocation}>Asignación: 83,333,333 MXI</Text>
                </View>
              </View>

              <View style={styles.phaseItem}>
                <View style={[styles.phaseNumber, { backgroundColor: colors.accent }]}>
                  <Text style={styles.phaseNumberText}>3</Text>
                </View>
                <View style={styles.phaseContent}>
                  <Text style={styles.phaseTitle}>Fase 3 - Pre-Launch</Text>
                  <Text style={styles.phasePrice}>1.00 USDT por MXI</Text>
                  <Text style={styles.phaseDescription}>
                    Precio final antes del lanzamiento oficial
                  </Text>
                  <Text style={styles.phaseAllocation}>Asignación: 83,333,334 MXI</Text>
                </View>
              </View>
            </View>

            {/* Referral System */}
            <View style={[commonStyles.card, styles.referralCard]}>
              <Text style={styles.cardTitle}>Sistema de Comisiones</Text>
              
              <View style={styles.referralLevel}>
                <View style={[styles.referralBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.referralBadgeText}>NIVEL 1</Text>
                </View>
                <Text style={styles.referralPercentage}>3%</Text>
                <Text style={styles.referralDescription}>
                  De cada compra de tus referidos directos
                </Text>
              </View>

              <View style={styles.referralLevel}>
                <View style={[styles.referralBadge, { backgroundColor: colors.success }]}>
                  <Text style={styles.referralBadgeText}>NIVEL 2</Text>
                </View>
                <Text style={styles.referralPercentage}>2%</Text>
                <Text style={styles.referralDescription}>
                  De las compras de referidos de segundo nivel
                </Text>
              </View>

              <View style={styles.referralLevel}>
                <View style={[styles.referralBadge, { backgroundColor: colors.accent }]}>
                  <Text style={styles.referralBadgeText}>NIVEL 3</Text>
                </View>
                <Text style={styles.referralPercentage}>1%</Text>
                <Text style={styles.referralDescription}>
                  De las compras de referidos de tercer nivel
                </Text>
              </View>

              <View style={styles.referralRequirements}>
                <Text style={styles.requirementsTitle}>Requisitos para Retiro:</Text>
                <View style={styles.requirementItem}>
                  <IconSymbol 
                    ios_icon_name="checkmark.circle.fill" 
                    android_material_icon_name="check_circle" 
                    size={20} 
                    color={colors.success} 
                  />
                  <Text style={styles.requirementText}>
                    Mínimo 5 referidos directos con cuentas activas
                  </Text>
                </View>
                <View style={styles.requirementItem}>
                  <IconSymbol 
                    ios_icon_name="checkmark.circle.fill" 
                    android_material_icon_name="check_circle" 
                    size={20} 
                    color={colors.success} 
                  />
                  <Text style={styles.requirementText}>
                    Ciclo de 10 días completado desde última comisión
                  </Text>
                </View>
                <View style={styles.requirementItem}>
                  <IconSymbol 
                    ios_icon_name="checkmark.circle.fill" 
                    android_material_icon_name="check_circle" 
                    size={20} 
                    color={colors.success} 
                  />
                  <Text style={styles.requirementText}>
                    Referidos deben haber realizado compra de MXI
                  </Text>
                </View>
              </View>
            </View>

            {/* Utility */}
            <View style={[commonStyles.card, styles.utilityCard]}>
              <Text style={styles.cardTitle}>Utilidad del Token MXI</Text>
              <View style={styles.utilityList}>
                <View style={styles.utilityItem}>
                  <IconSymbol 
                    ios_icon_name="checkmark.circle.fill" 
                    android_material_icon_name="check_circle" 
                    size={20} 
                    color={colors.success} 
                  />
                  <Text style={styles.utilityText}>
                    Participación directa en el pool de liquidez
                  </Text>
                </View>
                <View style={styles.utilityItem}>
                  <IconSymbol 
                    ios_icon_name="checkmark.circle.fill" 
                    android_material_icon_name="check_circle" 
                    size={20} 
                    color={colors.success} 
                  />
                  <Text style={styles.utilityText}>
                    Generación de ingresos pasivos mediante vesting
                  </Text>
                </View>
                <View style={styles.utilityItem}>
                  <IconSymbol 
                    ios_icon_name="checkmark.circle.fill" 
                    android_material_icon_name="check_circle" 
                    size={20} 
                    color={colors.success} 
                  />
                  <Text style={styles.utilityText}>
                    Acceso a sorteos y recompensas exclusivas
                  </Text>
                </View>
                <View style={styles.utilityItem}>
                  <IconSymbol 
                    ios_icon_name="checkmark.circle.fill" 
                    android_material_icon_name="check_circle" 
                    size={20} 
                    color={colors.success} 
                  />
                  <Text style={styles.utilityText}>
                    Sistema de comisiones por referidos multinivel
                  </Text>
                </View>
                <View style={styles.utilityItem}>
                  <IconSymbol 
                    ios_icon_name="checkmark.circle.fill" 
                    android_material_icon_name="check_circle" 
                    size={20} 
                    color={colors.success} 
                  />
                  <Text style={styles.utilityText}>
                    Vinculación directa con exchange Binance
                  </Text>
                </View>
                <View style={styles.utilityItem}>
                  <IconSymbol 
                    ios_icon_name="checkmark.circle.fill" 
                    android_material_icon_name="check_circle" 
                    size={20} 
                    color={colors.success} 
                  />
                  <Text style={styles.utilityText}>
                    Valor respaldado por liquidez real en el mercado
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {selectedTab === 'roadmap' && (
          <View>
            <View style={[commonStyles.card, styles.roadmapCard]}>
              <Text style={styles.cardTitle}>Hoja de Ruta 2025-2026</Text>
              <Text style={styles.cardSubtitle}>
                Camino hacia el lanzamiento oficial de Maxcoin
              </Text>

              {/* Q1 2025 */}
              <View style={styles.roadmapPhase}>
                <View style={[styles.roadmapBadge, { backgroundColor: colors.success }]}>
                  <Text style={styles.roadmapBadgeText}>✓ COMPLETADO</Text>
                </View>
                <Text style={styles.roadmapQuarter}>Q1 2025 - Enero a Marzo</Text>
                <View style={styles.roadmapItems}>
                  <View style={styles.roadmapItem}>
                    <IconSymbol 
                      ios_icon_name="checkmark.circle.fill" 
                      android_material_icon_name="check_circle" 
                      size={20} 
                      color={colors.success} 
                    />
                    <Text style={styles.roadmapItemText}>
                      Lanzamiento de la plataforma Pool de Liquidez MXI
                    </Text>
                  </View>
                  <View style={styles.roadmapItem}>
                    <IconSymbol 
                      ios_icon_name="checkmark.circle.fill" 
                      android_material_icon_name="check_circle" 
                      size={20} 
                      color={colors.success} 
                    />
                    <Text style={styles.roadmapItemText}>
                      Inicio de Fase 1 de preventa (0.40 USDT)
                    </Text>
                  </View>
                  <View style={styles.roadmapItem}>
                    <IconSymbol 
                      ios_icon_name="checkmark.circle.fill" 
                      android_material_icon_name="check_circle" 
                      size={20} 
                      color={colors.success} 
                    />
                    <Text style={styles.roadmapItemText}>
                      Activación del sistema de referidos multinivel
                    </Text>
                  </View>
                  <View style={styles.roadmapItem}>
                    <IconSymbol 
                      ios_icon_name="checkmark.circle.fill" 
                      android_material_icon_name="check_circle" 
                      size={20} 
                      color={colors.success} 
                    />
                    <Text style={styles.roadmapItemText}>
                      Integración con Binance para pagos
                    </Text>
                  </View>
                  <View style={styles.roadmapItem}>
                    <IconSymbol 
                      ios_icon_name="checkmark.circle.fill" 
                      android_material_icon_name="check_circle" 
                      size={20} 
                      color={colors.success} 
                    />
                    <Text style={styles.roadmapItemText}>
                      Contador de participantes iniciado en 56,527
                    </Text>
                  </View>
                </View>
              </View>

              {/* Q2 2025 */}
              <View style={styles.roadmapPhase}>
                <View style={[styles.roadmapBadge, { backgroundColor: colors.warning }]}>
                  <Text style={styles.roadmapBadgeText}>⚡ EN PROGRESO</Text>
                </View>
                <Text style={styles.roadmapQuarter}>Q2 2025 - Abril a Junio</Text>
                <View style={styles.roadmapItems}>
                  <View style={styles.roadmapItem}>
                    <IconSymbol 
                      ios_icon_name="circle.fill" 
                      android_material_icon_name="circle" 
                      size={20} 
                      color={colors.warning} 
                    />
                    <Text style={styles.roadmapItemText}>
                      Transición a Fase 2 de preventa (0.70 USDT)
                    </Text>
                  </View>
                  <View style={styles.roadmapItem}>
                    <IconSymbol 
                      ios_icon_name="circle.fill" 
                      android_material_icon_name="circle" 
                      size={20} 
                      color={colors.warning} 
                    />
                    <Text style={styles.roadmapItemText}>
                      Lanzamiento del sistema de lotería
                    </Text>
                  </View>
                  <View style={styles.roadmapItem}>
                    <IconSymbol 
                      ios_icon_name="circle.fill" 
                      android_material_icon_name="circle" 
                      size={20} 
                      color={colors.warning} 
                    />
                    <Text style={styles.roadmapItemText}>
                      Implementación de vesting mejorado
                    </Text>
                  </View>
                  <View style={styles.roadmapItem}>
                    <IconSymbol 
                      ios_icon_name="circle.fill" 
                      android_material_icon_name="circle" 
                      size={20} 
                      color={colors.warning} 
                    />
                    <Text style={styles.roadmapItemText}>
                      Expansión de marketing internacional
                    </Text>
                  </View>
                  <View style={styles.roadmapItem}>
                    <IconSymbol 
                      ios_icon_name="circle.fill" 
                      android_material_icon_name="circle" 
                      size={20} 
                      color={colors.warning} 
                    />
                    <Text style={styles.roadmapItemText}>
                      Objetivo: 100,000 participantes
                    </Text>
                  </View>
                </View>
              </View>

              {/* Q3 2025 */}
              <View style={styles.roadmapPhase}>
                <View style={[styles.roadmapBadge, { backgroundColor: colors.textSecondary }]}>
                  <Text style={styles.roadmapBadgeText}>◯ PRÓXIMO</Text>
                </View>
                <Text style={styles.roadmapQuarter}>Q3 2025 - Julio a Septiembre</Text>
                <View style={styles.roadmapItems}>
                  <View style={styles.roadmapItem}>
                    <IconSymbol 
                      ios_icon_name="circle" 
                      android_material_icon_name="circle" 
                      size={20} 
                      color={colors.textSecondary} 
                    />
                    <Text style={styles.roadmapItemText}>
                      Inicio de Fase 3 de preventa (1.00 USDT)
                    </Text>
                  </View>
                  <View style={styles.roadmapItem}>
                    <IconSymbol 
                      ios_icon_name="circle" 
                      android_material_icon_name="circle" 
                      size={20} 
                      color={colors.textSecondary} 
                    />
                    <Text style={styles.roadmapItemText}>
                      Auditoría completa de smart contracts
                    </Text>
                  </View>
                  <View style={styles.roadmapItem}>
                    <IconSymbol 
                      ios_icon_name="circle" 
                      android_material_icon_name="circle" 
                      size={20} 
                      color={colors.textSecondary} 
                    />
                    <Text style={styles.roadmapItemText}>
                      Partnerships estratégicos con exchanges
                    </Text>
                  </View>
                  <View style={styles.roadmapItem}>
                    <IconSymbol 
                      ios_icon_name="circle" 
                      android_material_icon_name="circle" 
                      size={20} 
                      color={colors.textSecondary} 
                    />
                    <Text style={styles.roadmapItemText}>
                      Desarrollo de aplicaciones móviles nativas
                    </Text>
                  </View>
                  <View style={styles.roadmapItem}>
                    <IconSymbol 
                      ios_icon_name="circle" 
                      android_material_icon_name="circle" 
                      size={20} 
                      color={colors.textSecondary} 
                    />
                    <Text style={styles.roadmapItemText}>
                      Objetivo: 175,000 participantes
                    </Text>
                  </View>
                </View>
              </View>

              {/* Q4 2025 */}
              <View style={styles.roadmapPhase}>
                <View style={[styles.roadmapBadge, { backgroundColor: colors.textSecondary }]}>
                  <Text style={styles.roadmapBadgeText}>◯ PRÓXIMO</Text>
                </View>
                <Text style={styles.roadmapQuarter}>Q4 2025 - Octubre a Diciembre</Text>
                <View style={styles.roadmapItems}>
                  <View style={styles.roadmapItem}>
                    <IconSymbol 
                      ios_icon_name="circle" 
                      android_material_icon_name="circle" 
                      size={20} 
                      color={colors.textSecondary} 
                    />
                    <Text style={styles.roadmapItemText}>
                      Preparación final para lanzamiento oficial
                    </Text>
                  </View>
                  <View style={styles.roadmapItem}>
                    <IconSymbol 
                      ios_icon_name="circle" 
                      android_material_icon_name="circle" 
                      size={20} 
                      color={colors.textSecondary} 
                    />
                    <Text style={styles.roadmapItemText}>
                      Campaña de marketing masivo global
                    </Text>
                  </View>
                  <View style={styles.roadmapItem}>
                    <IconSymbol 
                      ios_icon_name="circle" 
                      android_material_icon_name="circle" 
                      size={20} 
                      color={colors.textSecondary} 
                    />
                    <Text style={styles.roadmapItemText}>
                      Cierre de preventa y conteo final
                    </Text>
                  </View>
                  <View style={styles.roadmapItem}>
                    <IconSymbol 
                      ios_icon_name="circle" 
                      android_material_icon_name="circle" 
                      size={20} 
                      color={colors.textSecondary} 
                    />
                    <Text style={styles.roadmapItemText}>
                      Preparación del pool de liquidez
                    </Text>
                  </View>
                  <View style={styles.roadmapItem}>
                    <IconSymbol 
                      ios_icon_name="circle" 
                      android_material_icon_name="circle" 
                      size={20} 
                      color={colors.textSecondary} 
                    />
                    <Text style={styles.roadmapItemText}>
                      Objetivo final: 250,000 participantes
                    </Text>
                  </View>
                </View>
              </View>

              {/* Q1 2026 - LAUNCH */}
              <View style={styles.roadmapPhase}>
                <View style={[styles.roadmapBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.roadmapBadgeText}>🚀 LANZAMIENTO</Text>
                </View>
                <Text style={styles.roadmapQuarter}>15 Enero 2026 - 12:00 UTC Central</Text>
                <View style={styles.roadmapItems}>
                  <View style={styles.roadmapItem}>
                    <IconSymbol 
                      ios_icon_name="star.fill" 
                      android_material_icon_name="star" 
                      size={20} 
                      color={colors.primary} 
                    />
                    <Text style={[styles.roadmapItemText, { fontWeight: '700' }]}>
                      Lanzamiento oficial de Maxcoin (MXI)
                    </Text>
                  </View>
                  <View style={styles.roadmapItem}>
                    <IconSymbol 
                      ios_icon_name="star.fill" 
                      android_material_icon_name="star" 
                      size={20} 
                      color={colors.primary} 
                    />
                    <Text style={[styles.roadmapItemText, { fontWeight: '700' }]}>
                      Listado en exchanges principales
                    </Text>
                  </View>
                  <View style={styles.roadmapItem}>
                    <IconSymbol 
                      ios_icon_name="star.fill" 
                      android_material_icon_name="star" 
                      size={20} 
                      color={colors.primary} 
                    />
                    <Text style={[styles.roadmapItemText, { fontWeight: '700' }]}>
                      Activación del pool de liquidez completo
                    </Text>
                  </View>
                  <View style={styles.roadmapItem}>
                    <IconSymbol 
                      ios_icon_name="star.fill" 
                      android_material_icon_name="star" 
                      size={20} 
                      color={colors.primary} 
                    />
                    <Text style={[styles.roadmapItemText, { fontWeight: '700' }]}>
                      Distribución de fondos al pool
                    </Text>
                  </View>
                  <View style={styles.roadmapItem}>
                    <IconSymbol 
                      ios_icon_name="star.fill" 
                      android_material_icon_name="star" 
                      size={20} 
                      color={colors.primary} 
                    />
                    <Text style={[styles.roadmapItemText, { fontWeight: '700' }]}>
                      Cierre de inscripciones al pool
                    </Text>
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
                  size={56} 
                  color={colors.primary} 
                />
                <Text style={styles.countdownTitle}>Lanzamiento Oficial</Text>
                <Text style={styles.countdownDate}>15 de Enero 2026</Text>
                <Text style={styles.countdownTime}>12:00 UTC Central</Text>
                <View style={styles.countdownDivider} />
                <Text style={styles.countdownDescription}>
                  Después de esta fecha no se recibirán más inscripciones al pool.
                  Los fondos serán derivados al pool de liquidez y se entregará 
                  valor real a la moneda MXI.
                </Text>
                <Text style={styles.countdownWarning}>
                  ¡No te pierdas esta oportunidad única!
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
              <Text style={styles.cardSubtitle}>
                Colaboraciones que garantizan el éxito de MXI
              </Text>
              
              <View style={styles.partnerItem}>
                <View style={[styles.partnerIcon, { backgroundColor: '#F3BA2F' + '20' }]}>
                  <IconSymbol 
                    ios_icon_name="building.2.fill" 
                    android_material_icon_name="business" 
                    size={32} 
                    color="#F3BA2F" 
                  />
                </View>
                <View style={styles.partnerContent}>
                  <Text style={styles.partnerName}>Binance</Text>
                  <Text style={styles.partnerRole}>Exchange Principal</Text>
                  <Text style={styles.partnerDescription}>
                    Plataforma de pagos y futura cotización de MXI
                  </Text>
                </View>
              </View>

              <View style={styles.partnerItem}>
                <View style={[styles.partnerIcon, { backgroundColor: '#F0B90B' + '20' }]}>
                  <IconSymbol 
                    ios_icon_name="link" 
                    android_material_icon_name="link" 
                    size={32} 
                    color="#F0B90B" 
                  />
                </View>
                <View style={styles.partnerContent}>
                  <Text style={styles.partnerName}>Binance Smart Chain</Text>
                  <Text style={styles.partnerRole}>Blockchain</Text>
                  <Text style={styles.partnerDescription}>
                    Red blockchain principal para MXI con bajas comisiones
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
                  <Text style={styles.partnerName}>CertiK</Text>
                  <Text style={styles.partnerRole}>Auditoría de Seguridad</Text>
                  <Text style={styles.partnerDescription}>
                    Auditoría completa de smart contracts y seguridad
                  </Text>
                </View>
              </View>

              <View style={styles.partnerItem}>
                <View style={[styles.partnerIcon, { backgroundColor: '#1E88E5' + '20' }]}>
                  <IconSymbol 
                    ios_icon_name="chart.bar.fill" 
                    android_material_icon_name="bar_chart" 
                    size={32} 
                    color="#1E88E5" 
                  />
                </View>
                <View style={styles.partnerContent}>
                  <Text style={styles.partnerName}>CoinMarketCap</Text>
                  <Text style={styles.partnerRole}>Tracking de Precio</Text>
                  <Text style={styles.partnerDescription}>
                    Listado y seguimiento de precio en tiempo real
                  </Text>
                </View>
              </View>

              <View style={styles.partnerItem}>
                <View style={[styles.partnerIcon, { backgroundColor: '#8DC63F' + '20' }]}>
                  <IconSymbol 
                    ios_icon_name="globe" 
                    android_material_icon_name="public" 
                    size={32} 
                    color="#8DC63F" 
                  />
                </View>
                <View style={styles.partnerContent}>
                  <Text style={styles.partnerName}>CoinGecko</Text>
                  <Text style={styles.partnerRole}>Análisis de Mercado</Text>
                  <Text style={styles.partnerDescription}>
                    Datos de mercado y análisis de trading
                  </Text>
                </View>
              </View>

              <View style={styles.partnerItem}>
                <View style={[styles.partnerIcon, { backgroundColor: '#FF6B35' + '20' }]}>
                  <IconSymbol 
                    ios_icon_name="arrow.left.arrow.right" 
                    android_material_icon_name="swap_horiz" 
                    size={32} 
                    color="#FF6B35" 
                  />
                </View>
                <View style={styles.partnerContent}>
                  <Text style={styles.partnerName}>PancakeSwap</Text>
                  <Text style={styles.partnerRole}>DEX Principal</Text>
                  <Text style={styles.partnerDescription}>
                    Exchange descentralizado para trading de MXI
                  </Text>
                </View>
              </View>
            </View>

            {/* Technology Stack */}
            <View style={[commonStyles.card, styles.techCard]}>
              <Text style={styles.cardTitle}>Stack Tecnológico</Text>
              <Text style={styles.cardSubtitle}>
                Tecnologías de vanguardia para MXI
              </Text>
              
              <View style={styles.techGrid}>
                <View style={styles.techItem}>
                  <IconSymbol 
                    ios_icon_name="link" 
                    android_material_icon_name="link" 
                    size={28} 
                    color={colors.primary} 
                  />
                  <Text style={styles.techName}>Blockchain</Text>
                  <Text style={styles.techValue}>BSC</Text>
                  <Text style={styles.techDescription}>Binance Smart Chain</Text>
                </View>

                <View style={styles.techItem}>
                  <IconSymbol 
                    ios_icon_name="doc.text.fill" 
                    android_material_icon_name="description" 
                    size={28} 
                    color={colors.success} 
                  />
                  <Text style={styles.techName}>Smart Contract</Text>
                  <Text style={styles.techValue}>Solidity</Text>
                  <Text style={styles.techDescription}>Lenguaje de contratos</Text>
                </View>

                <View style={styles.techItem}>
                  <IconSymbol 
                    ios_icon_name="wallet.pass.fill" 
                    android_material_icon_name="account_balance_wallet" 
                    size={28} 
                    color={colors.accent} 
                  />
                  <Text style={styles.techName}>Wallet</Text>
                  <Text style={styles.techValue}>MetaMask</Text>
                  <Text style={styles.techDescription}>Billetera compatible</Text>
                </View>

                <View style={styles.techItem}>
                  <IconSymbol 
                    ios_icon_name="arrow.left.arrow.right" 
                    android_material_icon_name="swap_horiz" 
                    size={28} 
                    color={colors.warning} 
                  />
                  <Text style={styles.techName}>DEX</Text>
                  <Text style={styles.techValue}>PancakeSwap</Text>
                  <Text style={styles.techDescription}>Exchange descentralizado</Text>
                </View>

                <View style={styles.techItem}>
                  <IconSymbol 
                    ios_icon_name="server.rack" 
                    android_material_icon_name="dns" 
                    size={28} 
                    color={colors.primary} 
                  />
                  <Text style={styles.techName}>Backend</Text>
                  <Text style={styles.techValue}>Supabase</Text>
                  <Text style={styles.techDescription}>Base de datos</Text>
                </View>

                <View style={styles.techItem}>
                  <IconSymbol 
                    ios_icon_name="shield.fill" 
                    android_material_icon_name="shield" 
                    size={28} 
                    color={colors.success} 
                  />
                  <Text style={styles.techName}>Seguridad</Text>
                  <Text style={styles.techValue}>SSL/TLS</Text>
                  <Text style={styles.techDescription}>Encriptación total</Text>
                </View>
              </View>
            </View>

            {/* Community */}
            <View style={[commonStyles.card, styles.communityCard]}>
              <Text style={styles.cardTitle}>Únete a la Comunidad MXI</Text>
              <Text style={styles.cardSubtitle}>
                Mantente informado y conectado con miles de inversores
              </Text>
              
              <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
                <IconSymbol 
                  ios_icon_name="paperplane.fill" 
                  android_material_icon_name="send" 
                  size={24} 
                  color="#0088cc" 
                />
                <View style={styles.socialContent}>
                  <Text style={styles.socialButtonText}>Telegram</Text>
                  <Text style={styles.socialDescription}>Canal oficial de noticias</Text>
                </View>
                <IconSymbol 
                  ios_icon_name="chevron.right" 
                  android_material_icon_name="chevron_right" 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
                <IconSymbol 
                  ios_icon_name="bird.fill" 
                  android_material_icon_name="flutter_dash" 
                  size={24} 
                  color="#1DA1F2" 
                />
                <View style={styles.socialContent}>
                  <Text style={styles.socialButtonText}>Twitter / X</Text>
                  <Text style={styles.socialDescription}>Actualizaciones diarias</Text>
                </View>
                <IconSymbol 
                  ios_icon_name="chevron.right" 
                  android_material_icon_name="chevron_right" 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
                <IconSymbol 
                  ios_icon_name="message.fill" 
                  android_material_icon_name="forum" 
                  size={24} 
                  color="#7289DA" 
                />
                <View style={styles.socialContent}>
                  <Text style={styles.socialButtonText}>Discord</Text>
                  <Text style={styles.socialDescription}>Comunidad y soporte</Text>
                </View>
                <IconSymbol 
                  ios_icon_name="chevron.right" 
                  android_material_icon_name="chevron_right" 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
                <IconSymbol 
                  ios_icon_name="play.rectangle.fill" 
                  android_material_icon_name="play_circle" 
                  size={24} 
                  color="#FF0000" 
                />
                <View style={styles.socialContent}>
                  <Text style={styles.socialButtonText}>YouTube</Text>
                  <Text style={styles.socialDescription}>Tutoriales y webinars</Text>
                </View>
                <IconSymbol 
                  ios_icon_name="chevron.right" 
                  android_material_icon_name="chevron_right" 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
                <IconSymbol 
                  ios_icon_name="photo.fill" 
                  android_material_icon_name="photo" 
                  size={24} 
                  color="#E4405F" 
                />
                <View style={styles.socialContent}>
                  <Text style={styles.socialButtonText}>Instagram</Text>
                  <Text style={styles.socialDescription}>Contenido visual</Text>
                </View>
                <IconSymbol 
                  ios_icon_name="chevron.right" 
                  android_material_icon_name="chevron_right" 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>

            {/* Legal & Compliance */}
            <View style={[commonStyles.card, styles.legalCard]}>
              <Text style={styles.cardTitle}>Legal & Cumplimiento</Text>
              
              <View style={styles.legalItem}>
                <IconSymbol 
                  ios_icon_name="checkmark.seal.fill" 
                  android_material_icon_name="verified" 
                  size={24} 
                  color={colors.success} 
                />
                <View style={styles.legalContent}>
                  <Text style={styles.legalTitle}>Registro Legal</Text>
                  <Text style={styles.legalDescription}>
                    Entidad registrada y cumplimiento regulatorio
                  </Text>
                </View>
              </View>

              <View style={styles.legalItem}>
                <IconSymbol 
                  ios_icon_name="doc.text.fill" 
                  android_material_icon_name="description" 
                  size={24} 
                  color={colors.primary} 
                />
                <View style={styles.legalContent}>
                  <Text style={styles.legalTitle}>Términos y Condiciones</Text>
                  <Text style={styles.legalDescription}>
                    Documentación legal completa disponible
                  </Text>
                </View>
              </View>

              <View style={styles.legalItem}>
                <IconSymbol 
                  ios_icon_name="lock.shield.fill" 
                  android_material_icon_name="security" 
                  size={24} 
                  color={colors.accent} 
                />
                <View style={styles.legalContent}>
                  <Text style={styles.legalTitle}>Política de Privacidad</Text>
                  <Text style={styles.legalDescription}>
                    Protección de datos y privacidad garantizada
                  </Text>
                </View>
              </View>

              <View style={styles.legalItem}>
                <IconSymbol 
                  ios_icon_name="person.badge.shield.checkmark.fill" 
                  android_material_icon_name="admin_panel_settings" 
                  size={24} 
                  color={colors.warning} 
                />
                <View style={styles.legalContent}>
                  <Text style={styles.legalTitle}>KYC/AML</Text>
                  <Text style={styles.legalDescription}>
                    Verificación de identidad y prevención de lavado
                  </Text>
                </View>
              </View>
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
  poolInfoCard: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
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
    marginBottom: 4,
  },
  phaseAllocation: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  referralCard: {
    marginBottom: 24,
  },
  referralLevel: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  referralBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
  },
  referralBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  referralPercentage: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  referralDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  referralRequirements: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  requirementText: {
    flex: 1,
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
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 4,
  },
  roadmapItemText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
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
  countdownDivider: {
    width: 60,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginVertical: 16,
  },
  countdownDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
  },
  countdownWarning: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
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
    marginBottom: 2,
  },
  partnerRole: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
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
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  techValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  techDescription: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
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
  socialContent: {
    flex: 1,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  socialDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  legalCard: {
    marginBottom: 24,
  },
  legalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  legalContent: {
    flex: 1,
  },
  legalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  legalDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
