
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles } from '@/styles/commonStyles';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

type TabType = 'que-es' | 'como-funciona' | 'por-que-comprar' | 'meta' | 'ecosistema' | 'sostenibilidad' | 'vesting-diario' | 'en-la-practica';

export default function EcosystemScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('que-es');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌐 Ecosistema MXI</Text>
        <Text style={styles.headerSubtitle}>Pool de Liquidez Maxcoin</Text>
      </View>

      {/* Tab Navigation - FIXED */}
      <View style={styles.tabScrollContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={styles.tabContainer}
          style={styles.tabScrollView}
        >
          <TouchableOpacity
            style={[styles.tab, activeTab === 'que-es' && styles.activeTab]}
            onPress={() => setActiveTab('que-es')}
          >
            <Text style={[styles.tabText, activeTab === 'que-es' && styles.activeTabText]}>
              ¿Qué es MXI? 💎
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'como-funciona' && styles.activeTab]}
            onPress={() => setActiveTab('como-funciona')}
          >
            <Text style={[styles.tabText, activeTab === 'como-funciona' && styles.activeTabText]}>
              ¿Cómo funciona? 🚀
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'por-que-comprar' && styles.activeTab]}
            onPress={() => setActiveTab('por-que-comprar')}
          >
            <Text style={[styles.tabText, activeTab === 'por-que-comprar' && styles.activeTabText]}>
              ¿Por qué comprar? 💰
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'meta' && styles.activeTab]}
            onPress={() => setActiveTab('meta')}
          >
            <Text style={[styles.tabText, activeTab === 'meta' && styles.activeTabText]}>
              META 🎯
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'ecosistema' && styles.activeTab]}
            onPress={() => setActiveTab('ecosistema')}
          >
            <Text style={[styles.tabText, activeTab === 'ecosistema' && styles.activeTabText]}>
              Ecosistema 🌱
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'sostenibilidad' && styles.activeTab]}
            onPress={() => setActiveTab('sostenibilidad')}
          >
            <Text style={[styles.tabText, activeTab === 'sostenibilidad' && styles.activeTabText]}>
              Sostenibilidad ♻️
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'vesting-diario' && styles.activeTab]}
            onPress={() => setActiveTab('vesting-diario')}
          >
            <Text style={[styles.tabText, activeTab === 'vesting-diario' && styles.activeTabText]}>
              Vesting Diario 💎
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'en-la-practica' && styles.activeTab]}
            onPress={() => setActiveTab('en-la-practica')}
          >
            <Text style={[styles.tabText, activeTab === 'en-la-practica' && styles.activeTabText]}>
              En la práctica 📊
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.contentScrollView} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'que-es' && <QueEsMXITab />}
        {activeTab === 'como-funciona' && <ComoFuncionaTab />}
        {activeTab === 'por-que-comprar' && <PorQueComprarTab />}
        {activeTab === 'meta' && <MetaTab />}
        {activeTab === 'ecosistema' && <EcosistemaTab />}
        {activeTab === 'sostenibilidad' && <SostenibilidadTab />}
        {activeTab === 'vesting-diario' && <VestingDiarioTab />}
        {activeTab === 'en-la-practica' && <EnLaPracticaTab />}
      </ScrollView>
    </SafeAreaView>
  );
}

// ¿Qué es MXI? Tab Content
function QueEsMXITab() {
  return (
    <View>
      {/* Main Title */}
      <View style={styles.titleSection}>
        <Text style={styles.mainTitle}>¿Qué es MXI? 🚀</Text>
      </View>

      {/* Logo Image */}
      <View style={styles.imageContainer}>
        <Image
          source={require('@/assets/images/bebe6626-b6ac-47d4-ad64-acdc0b562775.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      {/* Main Content Card */}
      <View style={[commonStyles.card, styles.contentCard]}>
        <LinearGradient
          colors={[colors.primary + '10', colors.accent + '10']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.contentGradient}
        >
          <Text style={styles.introText}>
            💎 <Text style={styles.boldText}>MAXCOIN</Text> es mucho más que una criptomoneda.
          </Text>

          <View style={styles.divider} />

          <Text style={styles.bodyText}>
            🌍 Será un <Text style={styles.highlightText}>ecosistema financiero global</Text>, creado para unir tecnología, rendimiento y comunidad en una misma red.
          </Text>

          <View style={styles.divider} />

          <Text style={styles.bodyText}>
            ⚡ Nace bajo la visión de transformar la blockchain en una <Text style={styles.highlightText}>herramienta de crecimiento real</Text>.
          </Text>

          <Text style={styles.bodyText}>
            🪙 Cada token representa un fragmento de una <Text style={styles.highlightText}>economía digital en expansión</Text>, donde tu inversión impulsa utilidad, liquidez y adopción global.
          </Text>

          <View style={styles.divider} />

          <Text style={styles.emphasisText}>
            🎯 MAXCOIN no busca especulación: <Text style={styles.boldText}>construye valor real con productos reales</Text>.
          </Text>

          <View style={styles.divider} />

          <Text style={styles.bodyText}>
            💼 Pagos, préstamos, staking, minería y recompensas por participación, todo en un <Text style={styles.highlightText}>entorno seguro y auditable</Text>.
          </Text>
        </LinearGradient>
      </View>

      {/* Features Grid */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>✨ Características Principales</Text>
        
        <View style={styles.featuresGrid}>
          <View style={[commonStyles.card, styles.featureCard]}>
            <Text style={styles.featureEmoji}>💳</Text>
            <Text style={styles.featureTitle}>Pagos</Text>
            <Text style={styles.featureDescription}>Sistema de pagos global y seguro</Text>
          </View>

          <View style={[commonStyles.card, styles.featureCard]}>
            <Text style={styles.featureEmoji}>💰</Text>
            <Text style={styles.featureTitle}>Préstamos</Text>
            <Text style={styles.featureDescription}>Acceso a crédito descentralizado</Text>
          </View>

          <View style={[commonStyles.card, styles.featureCard]}>
            <Text style={styles.featureEmoji}>🔒</Text>
            <Text style={styles.featureTitle}>Staking</Text>
            <Text style={styles.featureDescription}>Genera ingresos pasivos</Text>
          </View>

          <View style={[commonStyles.card, styles.featureCard]}>
            <Text style={styles.featureEmoji}>⛏️</Text>
            <Text style={styles.featureTitle}>Minería</Text>
            <Text style={styles.featureDescription}>Participa en la red</Text>
          </View>

          <View style={[commonStyles.card, styles.featureCard]}>
            <Text style={styles.featureEmoji}>🎁</Text>
            <Text style={styles.featureTitle}>Recompensas</Text>
            <Text style={styles.featureDescription}>Beneficios por participación</Text>
          </View>

          <View style={[commonStyles.card, styles.featureCard]}>
            <Text style={styles.featureEmoji}>🛡️</Text>
            <Text style={styles.featureTitle}>Seguridad</Text>
            <Text style={styles.featureDescription}>Entorno auditable</Text>
          </View>
        </View>
      </View>

      {/* Vision Card */}
      <View style={[commonStyles.card, styles.visionCard]}>
        <LinearGradient
          colors={[colors.primary + '20', colors.accent + '20']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.visionGradient}
        >
          <Text style={styles.visionEmoji}>🌟</Text>
          <Text style={styles.visionTitle}>Nuestra Visión</Text>
          <Text style={styles.visionText}>
            Transformar la forma en que el mundo interactúa con las finanzas digitales, 
            creando un ecosistema donde cada participante es parte del crecimiento y éxito colectivo.
          </Text>
        </LinearGradient>
      </View>

      {/* Values Section */}
      <View style={styles.valuesSection}>
        <Text style={styles.sectionTitle}>💡 Nuestros Valores</Text>
        
        <View style={[commonStyles.card, styles.valueCard]}>
          <Text style={styles.valueEmoji}>🤝</Text>
          <View style={styles.valueContent}>
            <Text style={styles.valueTitle}>Comunidad</Text>
            <Text style={styles.valueDescription}>
              Unidos construimos un futuro financiero más inclusivo
            </Text>
          </View>
        </View>

        <View style={[commonStyles.card, styles.valueCard]}>
          <Text style={styles.valueEmoji}>🔬</Text>
          <View style={styles.valueContent}>
            <Text style={styles.valueTitle}>Tecnología</Text>
            <Text style={styles.valueDescription}>
              Innovación blockchain de última generación
            </Text>
          </View>
        </View>

        <View style={[commonStyles.card, styles.valueCard]}>
          <Text style={styles.valueEmoji}>📈</Text>
          <View style={styles.valueContent}>
            <Text style={styles.valueTitle}>Rendimiento</Text>
            <Text style={styles.valueDescription}>
              Crecimiento sostenible y valor real para todos
            </Text>
          </View>
        </View>

        <View style={[commonStyles.card, styles.valueCard]}>
          <Text style={styles.valueEmoji}>🔐</Text>
          <View style={styles.valueContent}>
            <Text style={styles.valueTitle}>Transparencia</Text>
            <Text style={styles.valueDescription}>
              Operaciones auditables y verificables en todo momento
            </Text>
          </View>
        </View>
      </View>

      {/* Call to Action */}
      <View style={[commonStyles.card, styles.ctaCard]}>
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ctaGradient}
        >
          <Text style={styles.ctaEmoji}>🚀</Text>
          <Text style={styles.ctaTitle}>Únete al Futuro</Text>
          <Text style={styles.ctaText}>
            Sé parte de la revolución financiera con MAXCOIN
          </Text>
          <Text style={styles.ctaSubtext}>
            💎 Inversión mínima desde 50 USDT
          </Text>
        </LinearGradient>
      </View>
    </View>
  );
}

// ¿Cómo funciona? Tab Content
function ComoFuncionaTab() {
  return (
    <View>
      {/* Main Title */}
      <View style={styles.titleSection}>
        <Text style={styles.mainTitle}>¿Cómo funciona? 🚀</Text>
      </View>

      {/* Hero Image */}
      <View style={styles.imageContainer}>
        <Image
          source={require('@/assets/images/b206b68c-7a45-485a-bdc4-c0529a1d512b.png')}
          style={styles.heroImage}
          resizeMode="cover"
        />
      </View>

      {/* Introduction Card */}
      <View style={[commonStyles.card, styles.contentCard]}>
        <LinearGradient
          colors={[colors.primary + '10', colors.accent + '10']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.contentGradient}
        >
          <Text style={styles.introText}>
            🎯 La preventa oficial de <Text style={styles.boldText}>MAXCOIN</Text> es la puerta de entrada a su ecosistema.
          </Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.bodyText}>
            📊 Está dividido en tres fases, cada una con beneficios progresivos y exclusivos:
          </Text>
        </LinearGradient>
      </View>

      {/* Phase 1 */}
      <View style={[commonStyles.card, styles.phaseCard]}>
        <LinearGradient
          colors={['#FFD700' + '20', '#FFA500' + '20']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.phaseGradient}
        >
          <View style={styles.phaseHeader}>
            <Text style={styles.phaseNumber}>1️⃣</Text>
            <View style={styles.phaseTitleContainer}>
              <Text style={styles.phaseTitle}>Primera Fase</Text>
              <Text style={styles.phasePrice}>0.40 USDT</Text>
            </View>
          </View>
          
          <View style={styles.phaseBenefits}>
            <View style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>✅</Text>
              <Text style={styles.benefitText}>Participación en vesting anticipado</Text>
            </View>
            <View style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>✅</Text>
              <Text style={styles.benefitText}>Acceso prioritario</Text>
            </View>
            <View style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>✅</Text>
              <Text style={styles.benefitText}>Bonificación en referidos</Text>
            </View>
            <View style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>✅</Text>
              <Text style={styles.benefitText}>Minería temprana</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Phase 2 */}
      <View style={[commonStyles.card, styles.phaseCard]}>
        <LinearGradient
          colors={['#C0C0C0' + '20', '#A8A8A8' + '20']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.phaseGradient}
        >
          <View style={styles.phaseHeader}>
            <Text style={styles.phaseNumber}>2️⃣</Text>
            <View style={styles.phaseTitleContainer}>
              <Text style={styles.phaseTitle}>Segunda Fase</Text>
              <Text style={styles.phasePrice}>0.70 USDT</Text>
            </View>
          </View>
          
          <View style={styles.phaseBenefits}>
            <View style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>✅</Text>
              <Text style={styles.benefitText}>Participación en vesting anticipado</Text>
            </View>
            <View style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>✅</Text>
              <Text style={styles.benefitText}>Acceso prioritario</Text>
            </View>
            <View style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>✅</Text>
              <Text style={styles.benefitText}>Bonificación en referidos</Text>
            </View>
            <View style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>✅</Text>
              <Text style={styles.benefitText}>Minería temprana</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Phase 3 */}
      <View style={[commonStyles.card, styles.phaseCard]}>
        <LinearGradient
          colors={['#CD7F32' + '20', '#B87333' + '20']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.phaseGradient}
        >
          <View style={styles.phaseHeader}>
            <Text style={styles.phaseNumber}>3️⃣</Text>
            <View style={styles.phaseTitleContainer}>
              <Text style={styles.phaseTitle}>Tercera Fase</Text>
              <Text style={styles.phasePrice}>1.00 USDT</Text>
            </View>
          </View>
          
          <View style={styles.phaseBenefits}>
            <View style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>✅</Text>
              <Text style={styles.benefitText}>Acceso a MXI Strategic</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Referral System Card */}
      <View style={[commonStyles.card, styles.referralCard]}>
        <LinearGradient
          colors={[colors.primary + '15', colors.accent + '15']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.referralGradient}
        >
          <Text style={styles.referralEmoji}>🤝</Text>
          <Text style={styles.referralTitle}>Sistema de Referidos</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.referralText}>
            💰 Además, cada participante puede ganar comisiones con el sistema de referidos, creando una red que crece contigo.
          </Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.referralHighlight}>
            🎓 No necesitas experiencia previa - solo visión.
          </Text>
        </LinearGradient>
      </View>

      {/* Quote Card */}
      <View style={[commonStyles.card, styles.quoteCard]}>
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.quoteGradient}
        >
          <Text style={styles.quoteIcon}>💬</Text>
          <Text style={styles.quoteText}>
            &quot;Quien entendió Bitcoin en 2011, hoy entiende MAXCOIN&quot;
          </Text>
        </LinearGradient>
      </View>

      {/* Benefits Summary */}
      <View style={styles.summarySection}>
        <Text style={styles.sectionTitle}>✨ Beneficios Clave</Text>
        
        <View style={[commonStyles.card, styles.summaryCard]}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryIcon}>🎯</Text>
            <View style={styles.summaryContent}>
              <Text style={styles.summaryTitle}>Entrada Temprana</Text>
              <Text style={styles.summaryDescription}>
                Accede a precios preferenciales antes del lanzamiento oficial
              </Text>
            </View>
          </View>
        </View>

        <View style={[commonStyles.card, styles.summaryCard]}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryIcon}>💎</Text>
            <View style={styles.summaryContent}>
              <Text style={styles.summaryTitle}>Vesting Anticipado</Text>
              <Text style={styles.summaryDescription}>
                Comienza a generar rendimientos desde el primer día
              </Text>
            </View>
          </View>
        </View>

        <View style={[commonStyles.card, styles.summaryCard]}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryIcon}>🌐</Text>
            <View style={styles.summaryContent}>
              <Text style={styles.summaryTitle}>Red de Crecimiento</Text>
              <Text style={styles.summaryDescription}>
                Construye tu red y gana comisiones por cada referido
              </Text>
            </View>
          </View>
        </View>

        <View style={[commonStyles.card, styles.summaryCard]}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryIcon}>⛏️</Text>
            <View style={styles.summaryContent}>
              <Text style={styles.summaryTitle}>Minería Temprana</Text>
              <Text style={styles.summaryDescription}>
                Participa en la minería desde las primeras fases
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Final CTA */}
      <View style={[commonStyles.card, styles.finalCtaCard]}>
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.finalCtaGradient}
        >
          <Text style={styles.finalCtaEmoji}>🚀</Text>
          <Text style={styles.finalCtaTitle}>¡No te quedes fuera!</Text>
          <Text style={styles.finalCtaText}>
            Únete a la preventa de MAXCOIN y asegura tu lugar en el futuro de las finanzas digitales
          </Text>
          <View style={styles.finalCtaStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>250,000</Text>
              <Text style={styles.statLabel}>Plazas Totales</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>50 USDT</Text>
              <Text style={styles.statLabel}>Inversión Mínima</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

// ¿Por qué debería comprar MAXCOIN? Tab Content
function PorQueComprarTab() {
  return (
    <View>
      <Text style={styles.mainTitle}>¿Por qué debería comprar MAXCOIN? 💰</Text>
      <Text style={styles.bodyText}>Contenido de la pestaña Por qué comprar...</Text>
    </View>
  );
}

// META Tab Content
function MetaTab() {
  return (
    <View>
      <Text style={styles.mainTitle}>META 🎯</Text>
      <Text style={styles.bodyText}>Contenido de la pestaña META...</Text>
    </View>
  );
}

// Ecosistema Tab Content
function EcosistemaTab() {
  return (
    <View>
      <Text style={styles.mainTitle}>Ecosistema MXI 🌱</Text>
      <Text style={styles.bodyText}>Contenido de la pestaña Ecosistema...</Text>
    </View>
  );
}

// Sostenibilidad Tab Content
function SostenibilidadTab() {
  return (
    <View>
      <Text style={styles.mainTitle}>Sostenibilidad ♻️</Text>
      <Text style={styles.bodyText}>Contenido de la pestaña Sostenibilidad...</Text>
    </View>
  );
}

// VESTING DIARIO MXI Tab Content
function VestingDiarioTab() {
  return (
    <View>
      <Text style={styles.mainTitle}>Vesting Diario MXI 💎</Text>
      <Text style={styles.bodyText}>Contenido de la pestaña Vesting Diario...</Text>
    </View>
  );
}

// EN LA PRÁCTICA Tab Content
function EnLaPracticaTab() {
  return (
    <View>
      <Text style={styles.mainTitle}>En la práctica 📊</Text>
      <Text style={styles.bodyText}>Contenido de la pestaña En la práctica...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  // FIXED TAB STYLES
  tabScrollContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  tabScrollView: {
    maxHeight: 70,
  },
  tabContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    flexDirection: 'row',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 170,
    height: 48,
  },
  activeTab: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
    borderWidth: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '700',
  },
  contentScrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  titleSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  logoImage: {
    width: width - 80,
    height: (width - 80) * 0.75,
    borderRadius: 20,
  },
  heroImage: {
    width: width - 80,
    height: (width - 80) * 1.2,
    borderRadius: 20,
  },
  whyBuyImage: {
    width: width - 80,
    height: (width - 80) * 1.0,
    borderRadius: 20,
  },
  metaImage: {
    width: width - 80,
    height: (width - 80) * 0.8,
    borderRadius: 20,
  },
  ecosistemaImage: {
    width: width - 80,
    height: (width - 80) * 0.65,
    borderRadius: 20,
  },
  sostenibilidadImage: {
    width: width - 80,
    height: (width - 80) * 0.6,
    borderRadius: 20,
  },
  vestingImage: {
    width: width - 80,
    height: (width - 80) * 1.3,
    borderRadius: 20,
  },
  practicaImage: {
    width: width - 80,
    height: (width - 80) * 0.55,
    borderRadius: 20,
  },
  contentCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 24,
  },
  contentGradient: {
    padding: 24,
  },
  introText: {
    fontSize: 18,
    color: colors.text,
    lineHeight: 28,
    marginBottom: 8,
  },
  boldText: {
    fontWeight: '700',
    color: colors.primary,
  },
  highlightText: {
    fontWeight: '600',
    color: colors.primary,
  },
  bodyText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 26,
    marginBottom: 16,
  },
  emphasisText: {
    fontSize: 17,
    color: colors.text,
    lineHeight: 28,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
    opacity: 0.3,
  },
  featuresSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    width: (width - 52) / 2,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
  },
  featureEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  visionCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 24,
  },
  visionGradient: {
    padding: 32,
    alignItems: 'center',
  },
  visionEmoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  visionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  visionText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  valuesSection: {
    marginBottom: 24,
  },
  valueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
    padding: 16,
  },
  valueEmoji: {
    fontSize: 36,
  },
  valueContent: {
    flex: 1,
  },
  valueTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  valueDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  ctaCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 24,
  },
  ctaGradient: {
    padding: 32,
    alignItems: 'center',
  },
  ctaEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  ctaTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  ctaSubtext: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
    fontWeight: '600',
  },
  // Phase Cards
  phaseCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 16,
  },
  phaseGradient: {
    padding: 20,
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  phaseNumber: {
    fontSize: 40,
  },
  phaseTitleContainer: {
    flex: 1,
  },
  phaseTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  phasePrice: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  phaseBenefits: {
    gap: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitIcon: {
    fontSize: 20,
  },
  benefitText: {
    fontSize: 15,
    color: colors.text,
    flex: 1,
    lineHeight: 22,
  },
  // Referral Card
  referralCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 24,
  },
  referralGradient: {
    padding: 24,
    alignItems: 'center',
  },
  referralEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  referralTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  referralText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 8,
  },
  referralHighlight: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
    lineHeight: 26,
  },
  // Quote Card
  quoteCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 24,
  },
  quoteGradient: {
    padding: 32,
    alignItems: 'center',
  },
  quoteIcon: {
    fontSize: 40,
    marginBottom: 16,
  },
  quoteText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    lineHeight: 32,
    fontStyle: 'italic',
  },
  // Summary Section
  summarySection: {
    marginBottom: 24,
  },
  summaryCard: {
    padding: 16,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  summaryIcon: {
    fontSize: 36,
  },
  summaryContent: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  summaryDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  // Final CTA
  finalCtaCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 24,
  },
  finalCtaGradient: {
    padding: 32,
    alignItems: 'center',
  },
  finalCtaEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  finalCtaTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  finalCtaText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 26,
    fontWeight: '500',
  },
  finalCtaStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#000',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#000',
    opacity: 0.3,
  },
});
