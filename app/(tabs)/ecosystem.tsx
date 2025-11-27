
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

type TabType = 'que-es' | 'como-funciona' | 'por-que-comprar' | 'meta' | 'ecosistema' | 'seguridad-cuantica' | 'sostenibilidad' | 'vesting-diario' | 'en-la-practica' | 'tokenomica';

export default function EcosystemScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('que-es');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌐 Ecosistema MXI</Text>
        <Text style={styles.headerSubtitle}>Pool de Liquidez Maxcoin</Text>
      </View>

      {/* Tab Navigation - SCROLL BARS HIDDEN */}
      <View style={styles.tabScrollContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
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
            style={[styles.tab, activeTab === 'seguridad-cuantica' && styles.activeTab]}
            onPress={() => setActiveTab('seguridad-cuantica')}
          >
            <Text style={[styles.tabText, activeTab === 'seguridad-cuantica' && styles.activeTabText]}>
              Seguridad Cuántica 🔐
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

          <TouchableOpacity
            style={[styles.tab, activeTab === 'tokenomica' && styles.activeTab]}
            onPress={() => setActiveTab('tokenomica')}
          >
            <Text style={[styles.tabText, activeTab === 'tokenomica' && styles.activeTabText]}>
              Tokenómica 🪙
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Tab Content - SCROLL BAR HIDDEN */}
      <ScrollView 
        style={styles.contentScrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'que-es' && <QueEsMXITab />}
        {activeTab === 'como-funciona' && <ComoFuncionaTab />}
        {activeTab === 'por-que-comprar' && <PorQueComprarTab />}
        {activeTab === 'meta' && <MetaTab />}
        {activeTab === 'ecosistema' && <EcosistemaTab />}
        {activeTab === 'seguridad-cuantica' && <SeguridadCuanticaTab />}
        {activeTab === 'sostenibilidad' && <SostenibilidadTab />}
        {activeTab === 'vesting-diario' && <VestingDiarioTab />}
        {activeTab === 'en-la-practica' && <EnLaPracticaTab />}
        {activeTab === 'tokenomica' && <TokenomicaTab />}
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
              <Text style={styles.statValue}>Sin Límite</Text>
              <Text style={styles.statLabel}>Participantes</Text>
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
      {/* Main Title */}
      <View style={styles.titleSection}>
        <Text style={styles.mainTitle}>¿Por qué comprar MAXCOIN? 💰</Text>
      </View>

      {/* Hero Image - UPDATED TO NEW IMAGE */}
      <View style={styles.imageContainer}>
        <Image
          source={require('@/assets/images/825aaea2-b6ee-4867-9713-a0307c6a67c3.png')}
          style={styles.whyBuyImage}
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
            💡 <Text style={styles.boldText}>MAXCOIN</Text> no es solo una inversión, es una oportunidad de formar parte de un ecosistema financiero en crecimiento.
          </Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.bodyText}>
            🚀 Aquí te explicamos por qué deberías considerar ser parte de esta revolución:
          </Text>
        </LinearGradient>
      </View>

      {/* Reasons Grid */}
      <View style={styles.reasonsSection}>
        <Text style={styles.sectionTitle}>🎯 Razones Principales</Text>
        
        <View style={[commonStyles.card, styles.reasonCard]}>
          <LinearGradient
            colors={['#4CAF50' + '15', '#45a049' + '15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.reasonGradient}
          >
            <Text style={styles.reasonEmoji}>📈</Text>
            <Text style={styles.reasonTitle}>Potencial de Crecimiento</Text>
            <Text style={styles.reasonText}>
              Entra en las primeras fases con precios desde 0.40 USDT y aprovecha el crecimiento proyectado hasta 3-6 USDT post-lanzamiento.
            </Text>
          </LinearGradient>
        </View>

        <View style={[commonStyles.card, styles.reasonCard]}>
          <LinearGradient
            colors={['#2196F3' + '15', '#1976D2' + '15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.reasonGradient}
          >
            <Text style={styles.reasonEmoji}>💎</Text>
            <Text style={styles.reasonTitle}>Vesting Automático</Text>
            <Text style={styles.reasonText}>
              Genera aproximadamente 3% mensual en MXI adicionales solo por mantener tus tokens en el ecosistema.
            </Text>
          </LinearGradient>
        </View>

        <View style={[commonStyles.card, styles.reasonCard]}>
          <LinearGradient
            colors={['#FF9800' + '15', '#F57C00' + '15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.reasonGradient}
          >
            <Text style={styles.reasonEmoji}>🤝</Text>
            <Text style={styles.reasonTitle}>Sistema de Referidos</Text>
            <Text style={styles.reasonText}>
              Gana comisiones de 3 niveles (5%, 2%, 1%) construyendo tu red y ayudando a otros a unirse.
            </Text>
          </LinearGradient>
        </View>

        <View style={[commonStyles.card, styles.reasonCard]}>
          <LinearGradient
            colors={['#9C27B0' + '15', '#7B1FA2' + '15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.reasonGradient}
          >
            <Text style={styles.reasonEmoji}>🛡️</Text>
            <Text style={styles.reasonTitle}>Ecosistema Real</Text>
            <Text style={styles.reasonText}>
              No es especulación pura: MAXCOIN construye productos reales como pagos, préstamos, staking y minería.
            </Text>
          </LinearGradient>
        </View>

        <View style={[commonStyles.card, styles.reasonCard]}>
          <LinearGradient
            colors={['#F44336' + '15', '#D32F2F' + '15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.reasonGradient}
          >
            <Text style={styles.reasonEmoji}>⏰</Text>
            <Text style={styles.reasonTitle}>Ventana de Oportunidad</Text>
            <Text style={styles.reasonText}>
              Aprovecha los precios preferenciales de la preventa antes del lanzamiento oficial.
            </Text>
          </LinearGradient>
        </View>

        <View style={[commonStyles.card, styles.reasonCard]}>
          <LinearGradient
            colors={['#00BCD4' + '15', '#0097A7' + '15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.reasonGradient}
          >
            <Text style={styles.reasonEmoji}>💰</Text>
            <Text style={styles.reasonTitle}>Inversión Accesible</Text>
            <Text style={styles.reasonText}>
              Comienza desde solo 50 USDT y escala hasta 100,000 USDT según tu capacidad y visión.
            </Text>
          </LinearGradient>
        </View>
      </View>

      {/* Comparison Card */}
      <View style={[commonStyles.card, styles.comparisonCard]}>
        <LinearGradient
          colors={[colors.primary + '20', colors.accent + '20']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.comparisonGradient}
        >
          <Text style={styles.comparisonEmoji}>🔍</Text>
          <Text style={styles.comparisonTitle}>Comparación con Bitcoin</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.comparisonText}>
            📊 Bitcoin en 2011: $1 USD → Hoy: $40,000+ USD
          </Text>
          
          <Text style={styles.comparisonText}>
            💎 MAXCOIN en 2025: $0.40 USD → Proyección: $3-6 USD
          </Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.comparisonHighlight}>
            ⚡ La diferencia: MAXCOIN tiene un ecosistema completo desde el día uno.
          </Text>
        </LinearGradient>
      </View>

      {/* Final CTA */}
      <View style={[commonStyles.card, styles.finalCtaCard]}>
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.finalCtaGradient}
        >
          <Text style={styles.finalCtaEmoji}>🎯</Text>
          <Text style={styles.finalCtaTitle}>¿Listo para comenzar?</Text>
          <Text style={styles.finalCtaText}>
            No dejes pasar esta oportunidad única de ser parte de la próxima gran revolución financiera
          </Text>
          <View style={styles.finalCtaStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>3x - 6x</Text>
              <Text style={styles.statLabel}>Potencial ROI</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>3%</Text>
              <Text style={styles.statLabel}>Vesting Mensual</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

// META Tab Content
function MetaTab() {
  return (
    <View>
      {/* Main Title */}
      <View style={styles.titleSection}>
        <Text style={styles.mainTitle}>META 🎯</Text>
      </View>

      {/* Hero Image - UPDATED TO NEW IMAGE */}
      <View style={styles.imageContainer}>
        <Image
          source={require('@/assets/images/d3420549-e718-4e6b-b1de-587ff36abfcf.png')}
          style={styles.metaImage}
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
            🎯 La <Text style={styles.boldText}>META</Text> de MAXCOIN es clara y ambiciosa:
          </Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.bodyText}>
            🌍 Crear el ecosistema financiero descentralizado más completo y accesible del mundo.
          </Text>
        </LinearGradient>
      </View>

      {/* Goals Section */}
      <View style={styles.goalsSection}>
        <Text style={styles.sectionTitle}>🚀 Objetivos Principales</Text>
        
        <View style={[commonStyles.card, styles.goalCard]}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalEmoji}>👥</Text>
            <Text style={styles.goalTitle}>Comunidad Global</Text>
          </View>
          <Text style={styles.goalDescription}>
            Construir una comunidad global de holders comprometidos con el crecimiento del ecosistema, sin límites de participación.
          </Text>
        </View>

        <View style={[commonStyles.card, styles.goalCard]}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalEmoji}>💰</Text>
            <Text style={styles.goalTitle}>Pool de Liquidez Robusto</Text>
          </View>
          <Text style={styles.goalDescription}>
            Acumular fondos suficientes para garantizar liquidez profunda y estabilidad en el mercado.
          </Text>
        </View>

        <View style={[commonStyles.card, styles.goalCard]}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalEmoji}>🏗️</Text>
            <Text style={styles.goalTitle}>Desarrollo del Ecosistema</Text>
          </View>
          <Text style={styles.goalDescription}>
            Lanzar productos funcionales: pagos, préstamos, staking, minería y más.
          </Text>
        </View>

        <View style={[commonStyles.card, styles.goalCard]}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalEmoji}>📈</Text>
            <Text style={styles.goalTitle}>Valorización Sostenible</Text>
          </View>
          <Text style={styles.goalDescription}>
            Alcanzar una valorización de 3-6 USDT por token basada en utilidad real y adopción.
          </Text>
        </View>

        <View style={[commonStyles.card, styles.goalCard]}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalEmoji}>🌐</Text>
            <Text style={styles.goalTitle}>Adopción Global</Text>
          </View>
          <Text style={styles.goalDescription}>
            Expandir el uso de MAXCOIN a nivel mundial como medio de pago y reserva de valor.
          </Text>
        </View>
      </View>

      {/* Timeline Card */}
      <View style={[commonStyles.card, styles.timelineCard]}>
        <LinearGradient
          colors={[colors.primary + '15', colors.accent + '15']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.timelineGradient}
        >
          <Text style={styles.timelineEmoji}>📅</Text>
          <Text style={styles.timelineTitle}>Fecha de Lanzamiento</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.timelineDate}>15 de Enero, 2026</Text>
          <Text style={styles.timelineTime}>12:00 UTC</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.timelineText}>
            ⏰ Después de esta fecha, se procederá al lanzamiento oficial de la criptomoneda.
          </Text>
        </LinearGradient>
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
          <Text style={styles.visionTitle}>Visión a Largo Plazo</Text>
          <Text style={styles.visionText}>
            Convertirnos en el estándar de referencia para ecosistemas financieros descentralizados, 
            donde cada usuario no solo invierte, sino que participa activamente en la construcción 
            de un futuro financiero más justo, transparente y accesible para todos.
          </Text>
        </LinearGradient>
      </View>

      {/* Final CTA */}
      <View style={[commonStyles.card, styles.finalCtaCard]}>
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.finalCtaGradient}
        >
          <Text style={styles.finalCtaEmoji}>🎯</Text>
          <Text style={styles.finalCtaTitle}>Sé parte de la META</Text>
          <Text style={styles.finalCtaText}>
            Únete a los visionarios que están construyendo el futuro de las finanzas
          </Text>
        </LinearGradient>
      </View>
    </View>
  );
}

// Ecosistema Tab Content
function EcosistemaTab() {
  return (
    <View>
      {/* Main Title */}
      <View style={styles.titleSection}>
        <Text style={styles.mainTitle}>Ecosistema MXI 🌱</Text>
      </View>

      {/* Hero Image - UPDATED TO NEW IMAGE */}
      <View style={styles.imageContainer}>
        <Image
          source={require('@/assets/images/60c4f3c0-aa8d-4e4e-b088-b740678273cc.png')}
          style={styles.ecosistemaImage}
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
            🌱 El <Text style={styles.boldText}>Ecosistema MAXCOIN</Text> es un conjunto integrado de productos y servicios financieros.
          </Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.bodyText}>
            🔗 Cada componente está diseñado para trabajar en armonía, creando valor real para todos los participantes.
          </Text>
        </LinearGradient>
      </View>

      {/* Ecosystem Components */}
      <View style={styles.componentsSection}>
        <Text style={styles.sectionTitle}>🔧 Componentes del Ecosistema</Text>
        
        <View style={[commonStyles.card, styles.componentCard]}>
          <LinearGradient
            colors={['#4CAF50' + '15', '#45a049' + '15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.componentGradient}
          >
            <Text style={styles.componentEmoji}>💳</Text>
            <Text style={styles.componentTitle}>Sistema de Pagos</Text>
            <Text style={styles.componentDescription}>
              Realiza transacciones instantáneas y seguras en cualquier parte del mundo con comisiones mínimas.
            </Text>
          </LinearGradient>
        </View>

        <View style={[commonStyles.card, styles.componentCard]}>
          <LinearGradient
            colors={['#2196F3' + '15', '#1976D2' + '15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.componentGradient}
          >
            <Text style={styles.componentEmoji}>💰</Text>
            <Text style={styles.componentTitle}>Préstamos DeFi</Text>
            <Text style={styles.componentDescription}>
              Accede a crédito descentralizado usando tus MXI como colateral, sin intermediarios bancarios.
            </Text>
          </LinearGradient>
        </View>

        <View style={[commonStyles.card, styles.componentCard]}>
          <LinearGradient
            colors={['#FF9800' + '15', '#F57C00' + '15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.componentGradient}
          >
            <Text style={styles.componentEmoji}>🔒</Text>
            <Text style={styles.componentTitle}>Staking</Text>
            <Text style={styles.componentDescription}>
              Bloquea tus tokens y genera rendimientos pasivos mientras apoyas la seguridad de la red.
            </Text>
          </LinearGradient>
        </View>

        <View style={[commonStyles.card, styles.componentCard]}>
          <LinearGradient
            colors={['#9C27B0' + '15', '#7B1FA2' + '15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.componentGradient}
          >
            <Text style={styles.componentEmoji}>⛏️</Text>
            <Text style={styles.componentTitle}>Minería</Text>
            <Text style={styles.componentDescription}>
              Participa en la validación de transacciones y gana recompensas por asegurar la red.
            </Text>
          </LinearGradient>
        </View>

        <View style={[commonStyles.card, styles.componentCard]}>
          <LinearGradient
            colors={['#F44336' + '15', '#D32F2F' + '15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.componentGradient}
          >
            <Text style={styles.componentEmoji}>🎁</Text>
            <Text style={styles.componentTitle}>Recompensas</Text>
            <Text style={styles.componentDescription}>
              Gana bonificaciones por participación activa, referidos y contribuciones al ecosistema.
            </Text>
          </LinearGradient>
        </View>

        <View style={[commonStyles.card, styles.componentCard]}>
          <LinearGradient
            colors={['#00BCD4' + '15', '#0097A7' + '15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.componentGradient}
          >
            <Text style={styles.componentEmoji}>📊</Text>
            <Text style={styles.componentTitle}>Exchange Integrado</Text>
            <Text style={styles.componentDescription}>
              Intercambia MXI con otras criptomonedas directamente desde la plataforma.
            </Text>
          </LinearGradient>
        </View>
      </View>

      {/* Integration Card */}
      <View style={[commonStyles.card, styles.integrationCard]}>
        <LinearGradient
          colors={[colors.primary + '20', colors.accent + '20']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.integrationGradient}
        >
          <Text style={styles.integrationEmoji}>🔗</Text>
          <Text style={styles.integrationTitle}>Integración Total</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.integrationText}>
            🌐 Todos los componentes están interconectados, permitiendo que el valor fluya libremente entre servicios.
          </Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.integrationHighlight}>
            ⚡ Un ecosistema verdaderamente unificado donde cada parte potencia a las demás.
          </Text>
        </LinearGradient>
      </View>

      {/* Final CTA */}
      <View style={[commonStyles.card, styles.finalCtaCard]}>
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.finalCtaGradient}
        >
          <Text style={styles.finalCtaEmoji}>🌱</Text>
          <Text style={styles.finalCtaTitle}>Crece con el Ecosistema</Text>
          <Text style={styles.finalCtaText}>
            Cada producto que uses, cada servicio que aproveches, te hace parte integral del crecimiento de MAXCOIN
          </Text>
        </LinearGradient>
      </View>
    </View>
  );
}

// Seguridad Cuántica MXI Tab Content - NEW TAB
function SeguridadCuanticaTab() {
  return (
    <View>
      {/* Main Title */}
      <View style={styles.titleSection}>
        <Text style={styles.mainTitle}>Seguridad Cuántica MXI 🔐</Text>
      </View>

      {/* Hero Image */}
      <View style={styles.imageContainer}>
        <Image
          source={require('@/assets/images/ed6c9493-dc2d-4662-a9e7-990584c0d093.png')}
          style={styles.seguridadCuanticaImage}
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
            🔐 <Text style={styles.boldText}>MXI incorpora una arquitectura quantum-safe</Text> diseñada para proteger tus activos hoy y en el futuro.
          </Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.bodyText}>
            🛡️ Nuestro sistema combina <Text style={styles.highlightText}>firmas clásicas + algoritmos post-cuánticos</Text>, creando una capa de seguridad híbrida capaz de resistir ataques incluso de la próxima generación de computadoras cuánticas.
          </Text>
        </LinearGradient>
      </View>

      {/* Security Features Section */}
      <View style={styles.securityFeaturesSection}>
        <Text style={styles.sectionTitle}>🛡️ Características de Seguridad</Text>
        
        <View style={[commonStyles.card, styles.securityFeatureCard]}>
          <LinearGradient
            colors={['#4CAF50' + '15', '#45a049' + '15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.securityFeatureGradient}
          >
            <Text style={styles.securityFeatureEmoji}>🔒</Text>
            <Text style={styles.securityFeatureTitle}>Arquitectura Híbrida</Text>
            <Text style={styles.securityFeatureDescription}>
              Combinación de criptografía clásica probada con algoritmos post-cuánticos de última generación para máxima protección.
            </Text>
          </LinearGradient>
        </View>

        <View style={[commonStyles.card, styles.securityFeatureCard]}>
          <LinearGradient
            colors={['#2196F3' + '15', '#1976D2' + '15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.securityFeatureGradient}
          >
            <Text style={styles.securityFeatureEmoji}>⚡</Text>
            <Text style={styles.securityFeatureTitle}>Protección Preventiva</Text>
            <Text style={styles.securityFeatureDescription}>
              Prevención contra riesgos como el &quot;harvest now, decrypt later&quot; - tus transacciones están protegidas incluso contra amenazas futuras.
            </Text>
          </LinearGradient>
        </View>

        <View style={[commonStyles.card, styles.securityFeatureCard]}>
          <LinearGradient
            colors={['#FF9800' + '15', '#F57C00' + '15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.securityFeatureGradient}
          >
            <Text style={styles.securityFeatureEmoji}>🔑</Text>
            <Text style={styles.securityFeatureTitle}>Claves Protegidas</Text>
            <Text style={styles.securityFeatureDescription}>
              Las transacciones y claves permanecen protegidas a largo plazo, garantizando la seguridad de tus activos por décadas.
            </Text>
          </LinearGradient>
        </View>

        <View style={[commonStyles.card, styles.securityFeatureCard]}>
          <LinearGradient
            colors={['#9C27B0' + '15', '#7B1FA2' + '15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.securityFeatureGradient}
          >
            <Text style={styles.securityFeatureEmoji}>🔄</Text>
            <Text style={styles.securityFeatureTitle}>Actualización Continua</Text>
            <Text style={styles.securityFeatureDescription}>
              Modelo de actualización criptográfica continua, asegurando que la seguridad evolucione junto con la tecnología global.
            </Text>
          </LinearGradient>
        </View>
      </View>

      {/* Quantum Threat Explanation */}
      <View style={[commonStyles.card, styles.quantumThreatCard]}>
        <LinearGradient
          colors={[colors.primary + '20', colors.accent + '20']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.quantumThreatGradient}
        >
          <Text style={styles.quantumThreatEmoji}>⚠️</Text>
          <Text style={styles.quantumThreatTitle}>¿Por qué es importante?</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.quantumThreatText}>
            💻 Las computadoras cuánticas representan una amenaza futura para la criptografía tradicional. Muchas criptomonedas actuales podrían ser vulnerables cuando esta tecnología madure.
          </Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.quantumThreatHighlight}>
            🛡️ MXI se adelanta a esta amenaza, implementando protección cuántica desde el día uno.
          </Text>
        </LinearGradient>
      </View>

      {/* Benefits Section */}
      <View style={styles.quantumBenefitsSection}>
        <Text style={styles.sectionTitle}>✨ Beneficios para los Usuarios</Text>
        
        <View style={[commonStyles.card, styles.quantumBenefitCard]}>
          <View style={styles.quantumBenefitRow}>
            <Text style={styles.quantumBenefitIcon}>🔐</Text>
            <View style={styles.quantumBenefitContent}>
              <Text style={styles.quantumBenefitTitle}>Tranquilidad a Largo Plazo</Text>
              <Text style={styles.quantumBenefitDescription}>
                Tus activos están protegidos no solo hoy, sino también contra amenazas futuras
              </Text>
            </View>
          </View>
        </View>

        <View style={[commonStyles.card, styles.quantumBenefitCard]}>
          <View style={styles.quantumBenefitRow}>
            <Text style={styles.quantumBenefitIcon}>🚀</Text>
            <View style={styles.quantumBenefitContent}>
              <Text style={styles.quantumBenefitTitle}>Tecnología de Vanguardia</Text>
              <Text style={styles.quantumBenefitDescription}>
                Inviertes en un proyecto que utiliza la criptografía más avanzada disponible
              </Text>
            </View>
          </View>
        </View>

        <View style={[commonStyles.card, styles.quantumBenefitCard]}>
          <View style={styles.quantumBenefitRow}>
            <Text style={styles.quantumBenefitIcon}>🌐</Text>
            <View style={styles.quantumBenefitContent}>
              <Text style={styles.quantumBenefitTitle}>Preparado para el Futuro</Text>
              <Text style={styles.quantumBenefitDescription}>
                MXI evoluciona constantemente para mantenerse a la vanguardia de la seguridad
              </Text>
            </View>
          </View>
        </View>

        <View style={[commonStyles.card, styles.quantumBenefitCard]}>
          <View style={styles.quantumBenefitRow}>
            <Text style={styles.quantumBenefitIcon}>💎</Text>
            <View style={styles.quantumBenefitContent}>
              <Text style={styles.quantumBenefitTitle}>Valor Protegido</Text>
              <Text style={styles.quantumBenefitDescription}>
                La seguridad robusta aumenta la confianza y el valor del ecosistema
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Ecosystem Statement */}
      <View style={[commonStyles.card, styles.ecosystemStatementCard]}>
        <LinearGradient
          colors={[colors.primary + '25', colors.accent + '25']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ecosystemStatementGradient}
        >
          <Text style={styles.ecosystemStatementEmoji}>🌟</Text>
          <Text style={styles.ecosystemStatementTitle}>MXI: Más que un Token</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.ecosystemStatementText}>
            🚀 <Text style={styles.boldText}>MXI no solo es un token: es un ecosistema preparado para el futuro.</Text>
          </Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.ecosystemStatementHighlight}>
            🔐 Con seguridad cuántica integrada, protegemos tu inversión hoy, mañana y en las décadas venideras.
          </Text>
        </LinearGradient>
      </View>

      {/* Final CTA */}
      <View style={[commonStyles.card, styles.finalCtaCard]}>
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.finalCtaGradient}
        >
          <Text style={styles.finalCtaEmoji}>🔐</Text>
          <Text style={styles.finalCtaTitle}>Invierte con Seguridad Total</Text>
          <Text style={styles.finalCtaText}>
            Únete a un ecosistema que protege tus activos con la tecnología de seguridad más avanzada del mercado
          </Text>
          <View style={styles.finalCtaStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>Quantum-Safe</Text>
              <Text style={styles.statLabel}>Arquitectura</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>Futuro</Text>
              <Text style={styles.statLabel}>Protegido</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

// Sostenibilidad Tab Content
function SostenibilidadTab() {
  return (
    <View>
      {/* Main Title */}
      <View style={styles.titleSection}>
        <Text style={styles.mainTitle}>Sostenibilidad ♻️</Text>
      </View>

      {/* Hero Image - UPDATED TO FIRST IMAGE */}
      <View style={styles.imageContainer}>
        <Image
          source={require('@/assets/images/16a2654a-fef2-465c-bba6-b5c42fc91e63.png')}
          style={styles.sostenibilidadImage}
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
            ♻️ La <Text style={styles.boldText}>sostenibilidad</Text> es el pilar fundamental de MAXCOIN.
          </Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.bodyText}>
            🌍 No buscamos crecimiento explosivo a corto plazo, sino un desarrollo sólido y duradero.
          </Text>
        </LinearGradient>
      </View>

      {/* Sustainability Pillars */}
      <View style={styles.pillarsSection}>
        <Text style={styles.sectionTitle}>🏛️ Pilares de Sostenibilidad</Text>
        
        <View style={[commonStyles.card, styles.pillarCard]}>
          <LinearGradient
            colors={['#4CAF50' + '15', '#45a049' + '15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.pillarGradient}
          >
            <Text style={styles.pillarEmoji}>💰</Text>
            <Text style={styles.pillarTitle}>Pool de Liquidez Profundo</Text>
            <Text style={styles.pillarDescription}>
              Los fondos recaudados en la preventa se destinan directamente a crear liquidez robusta, 
              evitando volatilidad extrema y garantizando estabilidad en el mercado.
            </Text>
          </LinearGradient>
        </View>

        <View style={[commonStyles.card, styles.pillarCard]}>
          <LinearGradient
            colors={['#2196F3' + '15', '#1976D2' + '15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.pillarGradient}
          >
            <Text style={styles.pillarEmoji}>📊</Text>
            <Text style={styles.pillarTitle}>Vesting Programado</Text>
            <Text style={styles.pillarDescription}>
              El sistema de vesting distribuye tokens gradualmente, evitando dumps masivos y 
              manteniendo el precio estable mientras recompensa a los holders a largo plazo.
            </Text>
          </LinearGradient>
        </View>

        <View style={[commonStyles.card, styles.pillarCard]}>
          <LinearGradient
            colors={['#FF9800' + '15', '#F57C00' + '15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.pillarGradient}
          >
            <Text style={styles.pillarEmoji}>🏗️</Text>
            <Text style={styles.pillarTitle}>Utilidad Real</Text>
            <Text style={styles.pillarDescription}>
              Cada producto del ecosistema genera demanda orgánica de MXI, creando presión de 
              compra natural basada en uso real, no especulación.
            </Text>
          </LinearGradient>
        </View>

        <View style={[commonStyles.card, styles.pillarCard]}>
          <LinearGradient
            colors={['#9C27B0' + '15', '#7B1FA2' + '15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.pillarGradient}
          >
            <Text style={styles.pillarEmoji}>🤝</Text>
            <Text style={styles.pillarTitle}>Comunidad Comprometida</Text>
            <Text style={styles.pillarDescription}>
              El sistema de referidos y recompensas incentiva la construcción de una comunidad 
              activa y comprometida con el éxito a largo plazo del proyecto.
            </Text>
          </LinearGradient>
        </View>

        <View style={[commonStyles.card, styles.pillarCard]}>
          <LinearGradient
            colors={['#F44336' + '15', '#D32F2F' + '15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.pillarGradient}
          >
            <Text style={styles.pillarEmoji}>🔐</Text>
            <Text style={styles.pillarTitle}>Transparencia Total</Text>
            <Text style={styles.pillarDescription}>
              Todas las operaciones son auditables en blockchain. Los fondos del pool son 
              verificables públicamente, generando confianza y credibilidad.
            </Text>
          </LinearGradient>
        </View>

        <View style={[commonStyles.card, styles.pillarCard]}>
          <LinearGradient
            colors={['#00BCD4' + '15', '#0097A7' + '15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.pillarGradient}
          >
            <Text style={styles.pillarEmoji}>⚡</Text>
            <Text style={styles.pillarTitle}>Tecnología Eficiente</Text>
            <Text style={styles.pillarDescription}>
              Utilizamos blockchain de última generación con bajo consumo energético, 
              minimizando el impacto ambiental mientras maximizamos la eficiencia.
            </Text>
          </LinearGradient>
        </View>
      </View>

      {/* Long Term Vision Card */}
      <View style={[commonStyles.card, styles.longTermCard]}>
        <LinearGradient
          colors={[colors.primary + '20', colors.accent + '20']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.longTermGradient}
        >
          <Text style={styles.longTermEmoji}>🌟</Text>
          <Text style={styles.longTermTitle}>Visión a Largo Plazo</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.longTermText}>
            📈 MAXCOIN está diseñado para durar décadas, no meses. Cada decisión se toma pensando 
            en la sostenibilidad y el crecimiento orgánico.
          </Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.longTermHighlight}>
            🎯 No somos un proyecto de moda pasajera, somos el futuro de las finanzas descentralizadas.
          </Text>
        </LinearGradient>
      </View>

      {/* Final CTA */}
      <View style={[commonStyles.card, styles.finalCtaCard]}>
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.finalCtaGradient}
        >
          <Text style={styles.finalCtaEmoji}>♻️</Text>
          <Text style={styles.finalCtaTitle}>Invierte en el Futuro Sostenible</Text>
          <Text style={styles.finalCtaText}>
            Únete a un proyecto construido para perdurar, crecer y generar valor real a largo plazo
          </Text>
        </LinearGradient>
      </View>
    </View>
  );
}

// VESTING DIARIO MXI Tab Content
function VestingDiarioTab() {
  return (
    <View>
      {/* Main Title */}
      <View style={styles.titleSection}>
        <Text style={styles.mainTitle}>Vesting Diario MXI 💎</Text>
      </View>

      {/* Hero Image - UPDATED TO SECOND IMAGE */}
      <View style={styles.imageContainer}>
        <Image
          source={require('@/assets/images/657e167a-42d3-407c-840d-5cdea04dc9b1.png')}
          style={styles.vestingImage}
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
            💎 El <Text style={styles.boldText}>vesting diario de MXI</Text> es un mecanismo programado que incrementa automáticamente el saldo total de MXI que posee cada usuario dentro del ecosistema.
          </Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.bodyText}>
            🎯 Su objetivo es incentivar la retención del token y generar un crecimiento progresivo sin afectar la liquidez del proyecto.
          </Text>
        </LinearGradient>
      </View>

      {/* How It Works Section */}
      <View style={styles.howItWorksSection}>
        <Text style={styles.sectionTitle}>⚙️ ¿Cómo funciona el vesting?</Text>
        
        <View style={[commonStyles.card, styles.howItWorksCard]}>
          <LinearGradient
            colors={['#4CAF50' + '15', '#45a049' + '15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.howItWorksGradient}
          >
            <Text style={styles.howItWorksText}>
              📊 MXI aplica un rendimiento diario aproximado de <Text style={styles.boldText}>0.12%</Text>, 
              equivalente a un <Text style={styles.boldText}>3% mensual</Text> sobre el saldo que el usuario 
              mantiene en su wallet dentro del ecosistema.
            </Text>
            
            <View style={styles.divider} />
            
            <Text style={styles.howItWorksText}>
              ⚡ Este rendimiento se calcula de forma automática y se acredita diariamente en MXI adicionales.
            </Text>
            
            <View style={styles.divider} />
            
            <Text style={styles.howItWorksHighlight}>
              🔒 El vesting no entrega USDT ni divisas externas; únicamente distribuye MXI programado.
            </Text>
            
            <View style={styles.divider} />
            
            <Text style={styles.howItWorksText}>
              ✅ Esto garantiza que el mecanismo sea sostenible, no genere presión de liquidez y pueda 
              operar a largo plazo sin afectar la estabilidad económica del proyecto.
            </Text>
          </LinearGradient>
        </View>
      </View>

      {/* Formula Section */}
      <View style={styles.formulaSection}>
        <Text style={styles.sectionTitle}>📐 Fórmula utilizada</Text>
        
        <View style={[commonStyles.card, styles.formulaCard]}>
          <LinearGradient
            colors={['#2196F3' + '15', '#1976D2' + '15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.formulaGradient}
          >
            <Text style={styles.formulaTitle}>📊 Rendimiento diario estimado:</Text>
            <Text style={styles.formulaText}>Saldo MXI × 0.0012 (0.12% diario)</Text>
            
            <View style={styles.divider} />
            
            <Text style={styles.formulaTitle}>📈 Rendimiento mensual estimado:</Text>
            <Text style={styles.formulaText}>Saldo MXI × 0.03 (3% mensual)</Text>
          </LinearGradient>
        </View>
      </View>

      {/* Example Section */}
      <View style={styles.exampleSection}>
        <Text style={styles.sectionTitle}>💡 Ejemplo práctico</Text>
        
        <View style={[commonStyles.card, styles.exampleCard]}>
          <LinearGradient
            colors={['#FF9800' + '15', '#F57C00' + '15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.exampleGradient}
          >
            <Text style={styles.exampleText}>
              🎯 Si un usuario adquiere <Text style={styles.boldText}>500 MXI</Text> en preventa, 
              el sistema aplicará un crecimiento automático de 3% mensual:
            </Text>
            
            <View style={styles.divider} />
            
            <View style={styles.calculationBox}>
              <Text style={styles.calculationText}>500 MXI × 0.03 = <Text style={styles.boldText}>15 MXI mensuales</Text></Text>
            </View>
            
            <View style={styles.divider} />
            
            <Text style={styles.exampleSubtitle}>📅 En 6 meses:</Text>
            <View style={styles.calculationBox}>
              <Text style={styles.calculationText}>500 MXI × 0.18 = <Text style={styles.boldText}>90 MXI adicionales</Text></Text>
            </View>
            
            <View style={styles.divider} />
            
            <Text style={styles.exampleSubtitle}>💰 Saldo total después de 6 meses:</Text>
            <View style={styles.calculationBox}>
              <Text style={styles.calculationResult}>590 MXI</Text>
            </View>
            
            <View style={styles.divider} />
            
            <Text style={styles.exampleHighlight}>
              ✨ Este incremento se obtiene únicamente por mantener los MXI dentro del ecosistema, 
              sin bloquearlos y sin necesidad de realizar acciones adicionales.
            </Text>
          </LinearGradient>
        </View>
      </View>

      {/* Benefit Section */}
      <View style={styles.benefitSection}>
        <Text style={styles.sectionTitle}>🚀 Beneficio adicional con valorización</Text>
        
        <View style={[commonStyles.card, styles.benefitCard]}>
          <LinearGradient
            colors={['#9C27B0' + '15', '#7B1FA2' + '15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.benefitGradient}
          >
            <Text style={styles.benefitText}>
              📈 El vesting genera crecimiento en cantidad de MXI. Si el precio aumenta después del 
              lanzamiento, el rendimiento acumulado potencia el valor final.
            </Text>
            
            <View style={styles.divider} />
            
            <Text style={styles.benefitSubtitle}>💎 Ejemplo con valorización proyectada:</Text>
            <Text style={styles.benefitInfo}>Precio estimado del token post lanzamiento: 3 a 6 USDT</Text>
            
            <View style={styles.divider} />
            
            <Text style={styles.benefitSubtitle}>💰 Saldo con vesting (590 MXI):</Text>
            
            <View style={styles.scenarioBox}>
              <Text style={styles.scenarioLabel}>📊 A 3 USDT:</Text>
              <Text style={styles.scenarioValue}>1,770 USDT</Text>
            </View>
            
            <View style={styles.scenarioBox}>
              <Text style={styles.scenarioLabel}>🚀 A 6 USDT:</Text>
              <Text style={styles.scenarioValue}>3,540 USDT</Text>
            </View>
          </LinearGradient>
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
          <Text style={styles.finalCtaEmoji}>💎</Text>
          <Text style={styles.finalCtaTitle}>Comienza a generar hoy</Text>
          <Text style={styles.finalCtaText}>
            Cada día que mantienes MXI, estás acumulando más tokens automáticamente
          </Text>
          <View style={styles.finalCtaStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0.12%</Text>
              <Text style={styles.statLabel}>Diario</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>3%</Text>
              <Text style={styles.statLabel}>Mensual</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

// EN LA PRÁCTICA Tab Content
function EnLaPracticaTab() {
  return (
    <View>
      {/* Main Title */}
      <View style={styles.titleSection}>
        <Text style={styles.mainTitle}>En la práctica 📊</Text>
      </View>

      {/* Hero Image */}
      <View style={styles.imageContainer}>
        <Image
          source={require('@/assets/images/c0b6d193-7704-4dcb-b5a7-7a88bf79c307.png')}
          style={styles.practicaImage}
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
            📊 <Text style={styles.boldText}>MXI ofrece tres vías simultáneas de crecimiento</Text> incluso antes del lanzamiento oficial:
          </Text>
          
          <View style={styles.divider} />
          
          <View style={styles.waysList}>
            <Text style={styles.waysItem}>1️⃣ Valorización temprana del token (Preventa → Mercado)</Text>
            <Text style={styles.waysItem}>2️⃣ Comisiones por referidos (Sistema multinivel corto y sostenible)</Text>
            <Text style={styles.waysItem}>3️⃣ Vesting diario (aprox. 3% mensual)</Text>
          </View>
          
          <View style={styles.divider} />
          
          <Text style={styles.bodyText}>
            💡 Esto combina ganancias activas y pasivas, sin necesidad de grandes inversiones.
          </Text>
        </LinearGradient>
      </View>

      {/* Way 1: Valorization */}
      <View style={styles.waySection}>
        <Text style={styles.sectionTitle}>1️⃣ Ganar por valorización temprana</Text>
        
        <View style={[commonStyles.card, styles.wayCard]}>
          <LinearGradient
            colors={['#4CAF50' + '15', '#45a049' + '15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.wayGradient}
          >
            <Text style={styles.waySubtitle}>💰 Precios aprobados:</Text>
            
            <View style={styles.priceList}>
              <Text style={styles.priceItem}>• Fase 1: <Text style={styles.boldText}>0.40 USDT</Text></Text>
              <Text style={styles.priceItem}>• Fase 2: <Text style={styles.boldText}>0.70 USDT</Text></Text>
              <Text style={styles.priceItem}>• Fase 3: <Text style={styles.boldText}>1.00 USDT</Text></Text>
            </View>
            
            <View style={styles.divider} />
            
            <Text style={styles.wayText}>
              📈 Si una persona compra MXI en preventa y luego el token alcanza:
            </Text>
            
            <View style={styles.scenarioList}>
              <Text style={styles.scenarioItem}>• <Text style={styles.boldText}>3 USDT</Text> (moderado)</Text>
              <Text style={styles.scenarioItem}>• <Text style={styles.boldText}>6 USDT</Text> (optimista)</Text>
            </View>
            
            <View style={styles.divider} />
            
            <Text style={styles.wayHighlight}>
              🚀 Su inversión puede multiplicarse entre 3x y 6x, sin contar vesting ni referidos.
            </Text>
          </LinearGradient>
        </View>

        {/* Example */}
        <View style={[commonStyles.card, styles.exampleCard]}>
          <LinearGradient
            colors={['#2196F3' + '15', '#1976D2' + '15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.exampleGradient}
          >
            <Text style={styles.exampleTitle}>💡 Ejemplo práctico</Text>
            
            <View style={styles.divider} />
            
            <Text style={styles.exampleText}>
              💵 Compra: <Text style={styles.boldText}>200 USDT</Text> en fase 1 (0.40 USDT)
            </Text>
            <Text style={styles.exampleText}>
              💎 MXI recibidos: <Text style={styles.boldText}>200 / 0.40 = 500 MXI</Text>
            </Text>
            
            <View style={styles.divider} />
            
            <Text style={styles.exampleSubtitle}>📊 Si luego MXI llega a 3 USDT:</Text>
            <View style={styles.calculationBox}>
              <Text style={styles.calculationResult}>500 × 3 = 1,500 USDT</Text>
            </View>
            
            <Text style={styles.exampleSubtitle}>🚀 Si llega a 6 USDT:</Text>
            <View style={styles.calculationBox}>
              <Text style={styles.calculationResult}>500 × 6 = 3,000 USDT</Text>
            </View>
            
            <View style={styles.divider} />
            
            <Text style={styles.exampleHighlight}>
              💰 Ganancia solo por valorización: <Text style={styles.boldText}>1,300 – 2,800 USDT</Text>
            </Text>
          </LinearGradient>
        </View>
      </View>

      {/* Way 2: Referrals */}
      <View style={styles.waySection}>
        <Text style={styles.sectionTitle}>2️⃣ Ganar por referidos</Text>
        
        <View style={[commonStyles.card, styles.wayCard]}>
          <LinearGradient
            colors={['#FF9800' + '15', '#F57C00' + '15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.wayGradient}
          >
            <Text style={styles.waySubtitle}>🤝 Niveles de comisiones:</Text>
            
            <View style={styles.commissionList}>
              <Text style={styles.commissionItem}>• Nivel 1: <Text style={styles.boldText}>5%</Text></Text>
              <Text style={styles.commissionItem}>• Nivel 2: <Text style={styles.boldText}>2%</Text></Text>
              <Text style={styles.commissionItem}>• Nivel 3: <Text style={styles.boldText}>1%</Text></Text>
            </View>
          </LinearGradient>
        </View>

        {/* Referral Example */}
        <View style={[commonStyles.card, styles.exampleCard]}>
          <LinearGradient
            colors={['#9C27B0' + '15', '#7B1FA2' + '15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.exampleGradient}
          >
            <Text style={styles.exampleTitle}>💡 Ejemplo realista de ingresos por referidos</Text>
            
            <View style={styles.divider} />
            
            <Text style={styles.exampleText}>
              📋 Supongamos que:
            </Text>
            <Text style={styles.exampleText}>
              • Invitas a 10 personas que invierten 50 USDT cada una
            </Text>
            <Text style={styles.exampleText}>
              • Y esas 10 personas invitan a otras 10 cada una
            </Text>
            
            <View style={styles.divider} />
            
            <Text style={styles.levelTitle}>🥇 Nivel 1</Text>
            <Text style={styles.levelCalc}>10 × 50 USDT = 500 USDT</Text>
            <Text style={styles.levelResult}>500 × 5% = <Text style={styles.boldText}>25 USDT</Text></Text>
            
            <View style={styles.divider} />
            
            <Text style={styles.levelTitle}>🥈 Nivel 2</Text>
            <Text style={styles.levelCalc}>(10 × 10) = 100 personas × 30 USDT promedio = 3,000 USDT</Text>
            <Text style={styles.levelResult}>3,000 × 2% = <Text style={styles.boldText}>60 USDT</Text></Text>
            
            <View style={styles.divider} />
            
            <Text style={styles.levelTitle}>🥉 Nivel 3</Text>
            <Text style={styles.levelCalc}>100 × 5 personas c/u = 500 × 20 USDT = 10,000 USDT</Text>
            <Text style={styles.levelResult}>10,000 × 1% = <Text style={styles.boldText}>100 USDT</Text></Text>
            
            <View style={styles.divider} />
            
            <View style={styles.totalBox}>
              <Text style={styles.totalLabel}>💰 Total ganado solo en comisiones:</Text>
              <Text style={styles.totalValue}>25 + 60 + 100 = 185 USDT</Text>
            </View>
            
            <View style={styles.divider} />
            
            <Text style={styles.exampleHighlight}>
              ✨ Sin inversión adicional y antes del lanzamiento.
            </Text>
          </LinearGradient>
        </View>
      </View>

      {/* Way 3: Vesting */}
      <View style={styles.waySection}>
        <Text style={styles.sectionTitle}>3️⃣ Ganar por Vesting Diario</Text>
        
        <View style={[commonStyles.card, styles.wayCard]}>
          <LinearGradient
            colors={['#00BCD4' + '15', '#0097A7' + '15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.wayGradient}
          >
            <Text style={styles.wayText}>
              💎 Cada día recibes <Text style={styles.boldText}>0.12%</Text> de tus MXI, 
              que equivale a un <Text style={styles.boldText}>3% mensual</Text> acumulado.
            </Text>
            
            <View style={styles.divider} />
            
            <Text style={styles.waySubtitle}>📊 Ejemplo práctico con 500 MXI:</Text>
            <Text style={styles.wayCalc}>500 × 0.03 = <Text style={styles.boldText}>15 MXI al mes</Text></Text>
            <Text style={styles.wayCalc}>En 6 meses → 500 × 0.18 = <Text style={styles.boldText}>90 MXI extra</Text></Text>
            
            <View style={styles.divider} />
            
            <Text style={styles.waySubtitle}>💰 Si el precio llega a:</Text>
            
            <View style={styles.vestingScenarioBox}>
              <Text style={styles.vestingScenario}>• 3 USDT → 90 × 3 = <Text style={styles.boldText}>270 USDT</Text></Text>
              <Text style={styles.vestingScenario}>• 6 USDT → 90 × 6 = <Text style={styles.boldText}>540 USDT</Text></Text>
            </View>
          </LinearGradient>
        </View>
      </View>

      {/* Complete Example */}
      <View style={styles.completeExampleSection}>
        <Text style={styles.sectionTitle}>🎯 Ejemplo completo</Text>
        
        <View style={[commonStyles.card, styles.completeExampleCard]}>
          <LinearGradient
            colors={[colors.primary + '20', colors.accent + '20']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.completeExampleGradient}
          >
            <Text style={styles.completeExampleTitle}>📋 Supongamos un usuario que:</Text>
            
            <View style={styles.assumptionsList}>
              <Text style={styles.assumptionItem}>• Invierte 200 USDT en Fase 1 (0.40)</Text>
              <Text style={styles.assumptionItem}>• Gana 185 USDT en referidos</Text>
              <Text style={styles.assumptionItem}>• Genera 90 MXI en vesting en 6 meses</Text>
              <Text style={styles.assumptionItem}>• MXI llega a 3–6 USDT</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.finalCalculation}>
              <Text style={styles.finalCalcLabel}>💎 MXI comprados:</Text>
              <Text style={styles.finalCalcValue}>200 / 0.40 = 500 MXI</Text>
              
              <Text style={styles.finalCalcLabel}>✨ MXI totales con vesting:</Text>
              <Text style={styles.finalCalcValue}>500 + 90 = 590 MXI</Text>
              
              <View style={styles.divider} />
              
              <Text style={styles.finalCalcLabel}>💰 Valor futuro:</Text>
              
              <View style={styles.scenarioResultBox}>
                <Text style={styles.scenarioResultLabel}>📊 Escenario 3 USDT:</Text>
                <Text style={styles.scenarioResultValue}>590 × 3 = 1,770 USDT</Text>
              </View>
              
              <View style={styles.scenarioResultBox}>
                <Text style={styles.scenarioResultLabel}>🚀 Escenario 6 USDT:</Text>
                <Text style={styles.scenarioResultValue}>590 × 6 = 3,540 USDT</Text>
              </View>
              
              <View style={styles.divider} />
              
              <Text style={styles.finalCalcLabel}>🤝 Sumamos comisiones:</Text>
              
              <View style={styles.totalResultBox}>
                <Text style={styles.totalResultItem}>1,770 + 185 = <Text style={styles.boldText}>1,955 USDT</Text></Text>
                <Text style={styles.totalResultItem}>3,540 + 185 = <Text style={styles.boldText}>3,725 USDT</Text></Text>
              </View>
            </View>
          </LinearGradient>
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
          <Text style={styles.finalCtaEmoji}>🎯</Text>
          <Text style={styles.finalCtaTitle}>¡Comienza tu camino al éxito!</Text>
          <Text style={styles.finalCtaText}>
            Con solo 200 USDT puedes generar entre 1,955 y 3,725 USDT combinando las tres vías de crecimiento
          </Text>
          <View style={styles.finalCtaStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>3 Vías</Text>
              <Text style={styles.statLabel}>De Crecimiento</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>10x+</Text>
              <Text style={styles.statLabel}>Potencial ROI</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

// TOKENÓMICA Tab Content
function TokenomicaTab() {
  return (
    <View>
      {/* Main Title */}
      <View style={styles.titleSection}>
        <Text style={styles.mainTitle}>Tokenómica 🪙</Text>
      </View>

      {/* Hero Image */}
      <View style={styles.imageContainer}>
        <Image
          source={require('@/assets/images/76715c1f-8b5b-4e0a-8692-d6d7963a0d99.png')}
          style={styles.tokenomicaImage}
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
            🪙 <Text style={styles.boldText}>MXI adopta un diseño económico</Text> pensado para su estabilidad, transparencia y crecimiento a largo plazo.
          </Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.bodyText}>
            💎 Durante la etapa de preventa y expansión inicial, MXI funcionará con una <Text style={styles.highlightText}>oferta fija de 50.000.000 tokens</Text>, un modelo utilizado por los proyectos más sólidos del mercado para asegurar claridad y evitar riesgos asociados a inflaciones futuras.
          </Text>
        </LinearGradient>
      </View>

      {/* Hybrid Model Section */}
      <View style={styles.hybridModelSection}>
        <Text style={styles.sectionTitle}>🔄 Modelo Híbrido</Text>
        
        <View style={[commonStyles.card, styles.hybridCard]}>
          <LinearGradient
            colors={['#4CAF50' + '15', '#45a049' + '15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hybridGradient}
          >
            <Text style={styles.hybridText}>
              🌐 Una vez la red alcance madurez y se implemente la blockchain propia de MXI, el ecosistema evolucionará hacia un <Text style={styles.boldText}>modelo híbrido</Text>, en el que MXI mantendrá su oferta limitada y conservará su función de valor, gobernanza y acceso.
            </Text>
            
            <View style={styles.divider} />
            
            <Text style={styles.hybridText}>
              ⚙️ Paralelamente, la nueva blockchain utilizará un <Text style={styles.highlightText}>token técnico interno</Text>, diseñado exclusivamente para funciones operativas como tarifas y validación.
            </Text>
          </LinearGradient>
        </View>
      </View>

      {/* Benefits Section */}
      <View style={styles.benefitsTokenSection}>
        <Text style={styles.sectionTitle}>✨ Ventajas del Modelo</Text>
        
        <View style={[commonStyles.card, styles.benefitTokenCard]}>
          <View style={styles.benefitTokenRow}>
            <Text style={styles.benefitTokenIcon}>🔒</Text>
            <View style={styles.benefitTokenContent}>
              <Text style={styles.benefitTokenTitle}>Escasez Protegida</Text>
              <Text style={styles.benefitTokenDescription}>
                MXI mantiene su oferta limitada, preservando su valor a largo plazo
              </Text>
            </View>
          </View>
        </View>

        <View style={[commonStyles.card, styles.benefitTokenCard]}>
          <View style={styles.benefitTokenRow}>
            <Text style={styles.benefitTokenIcon}>📈</Text>
            <View style={styles.benefitTokenContent}>
              <Text style={styles.benefitTokenTitle}>Red Escalable</Text>
              <Text style={styles.benefitTokenDescription}>
                La infraestructura crece sin comprometer el equilibrio económico
              </Text>
            </View>
          </View>
        </View>

        <View style={[commonStyles.card, styles.benefitTokenCard]}>
          <View style={styles.benefitTokenRow}>
            <Text style={styles.benefitTokenIcon}>🎯</Text>
            <View style={styles.benefitTokenContent}>
              <Text style={styles.benefitTokenTitle}>Visión Estructurada</Text>
              <Text style={styles.benefitTokenDescription}>
                Crecimiento orgánico sin sacrificar estabilidad
              </Text>
            </View>
          </View>
        </View>

        <View style={[commonStyles.card, styles.benefitTokenCard]}>
          <View style={styles.benefitTokenRow}>
            <Text style={styles.benefitTokenIcon}>🧮</Text>
            <View style={styles.benefitTokenContent}>
              <Text style={styles.benefitTokenTitle}>Coherencia Matemática</Text>
              <Text style={styles.benefitTokenDescription}>
                Modelo sostenible basado en principios económicos sólidos
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Comparison Table Section */}
      <View style={styles.comparisonTableSection}>
        <Text style={styles.sectionTitle}>📊 Comparación con Otros Modelos Económicos</Text>
        
        {/* Bitcoin */}
        <View style={[commonStyles.card, styles.comparisonProjectCard]}>
          <LinearGradient
            colors={['#F7931A' + '15', '#F7931A' + '10']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.comparisonProjectGradient}
          >
            <Text style={styles.comparisonProjectName}>₿ Bitcoin</Text>
            
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>💰 Economía:</Text>
              <Text style={styles.comparisonValue}>Oferta fija</Text>
            </View>
            
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>📊 Emisión:</Text>
              <Text style={styles.comparisonValue}>21M BTC</Text>
            </View>
            
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>✅ Ventajas:</Text>
              <Text style={styles.comparisonValue}>Máxima escasez</Text>
            </View>
            
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>⚠️ Limitaciones:</Text>
              <Text style={styles.comparisonValue}>Poco flexible, no escalable para operaciones</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Ethereum */}
        <View style={[commonStyles.card, styles.comparisonProjectCard]}>
          <LinearGradient
            colors={['#627EEA' + '15', '#627EEA' + '10']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.comparisonProjectGradient}
          >
            <Text style={styles.comparisonProjectName}>Ξ Ethereum</Text>
            
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>💰 Economía:</Text>
              <Text style={styles.comparisonValue}>Emisión algorítmica + quema</Text>
            </View>
            
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>📊 Emisión:</Text>
              <Text style={styles.comparisonValue}>Variable</Text>
            </View>
            
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>✅ Ventajas:</Text>
              <Text style={styles.comparisonValue}>Autoajuste, flexibilidad</Text>
            </View>
            
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>⚠️ Limitaciones:</Text>
              <Text style={styles.comparisonValue}>Inflación controlada pero existente</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Cardano */}
        <View style={[commonStyles.card, styles.comparisonProjectCard]}>
          <LinearGradient
            colors={['#0033AD' + '15', '#0033AD' + '10']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.comparisonProjectGradient}
          >
            <Text style={styles.comparisonProjectName}>₳ Cardano</Text>
            
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>💰 Economía:</Text>
              <Text style={styles.comparisonValue}>Emisión limitada + recompensas</Text>
            </View>
            
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>📊 Emisión:</Text>
              <Text style={styles.comparisonValue}>45B ADA</Text>
            </View>
            
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>✅ Ventajas:</Text>
              <Text style={styles.comparisonValue}>Balance entre operatividad y valor</Text>
            </View>
            
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>⚠️ Limitaciones:</Text>
              <Text style={styles.comparisonValue}>Lenta adopción</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Solana */}
        <View style={[commonStyles.card, styles.comparisonProjectCard]}>
          <LinearGradient
            colors={['#14F195' + '15', '#9945FF' + '15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.comparisonProjectGradient}
          >
            <Text style={styles.comparisonProjectName}>◎ Solana</Text>
            
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>💰 Economía:</Text>
              <Text style={styles.comparisonValue}>Emisión decreciente</Text>
            </View>
            
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>📊 Emisión:</Text>
              <Text style={styles.comparisonValue}>Inflación inicial 8% → 1.5%</Text>
            </View>
            
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>✅ Ventajas:</Text>
              <Text style={styles.comparisonValue}>Alta velocidad</Text>
            </View>
            
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>⚠️ Limitaciones:</Text>
              <Text style={styles.comparisonValue}>Modelo dependiente del volumen y validadores</Text>
            </View>
          </LinearGradient>
        </View>

        {/* MXI - Highlighted */}
        <View style={[commonStyles.card, styles.comparisonProjectCard, styles.mxiHighlightCard]}>
          <LinearGradient
            colors={[colors.primary + '25', colors.accent + '25']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.comparisonProjectGradient}
          >
            <Text style={styles.comparisonProjectNameMXI}>🪙 MXI (Modelo Híbrido)</Text>
            
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>💰 Economía:</Text>
              <Text style={styles.comparisonValueMXI}>Oferta fija + token operativo</Text>
            </View>
            
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>📊 Emisión:</Text>
              <Text style={styles.comparisonValueMXI}>50M MXI + emisión controlada para tarifas</Text>
            </View>
            
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>✅ Ventajas:</Text>
              <Text style={styles.comparisonValueMXI}>Escasez protegida + red escalable</Text>
            </View>
            
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>⚠️ Limitaciones:</Text>
              <Text style={styles.comparisonValueMXI}>Requiere madurez para activar el token operativo</Text>
            </View>
          </LinearGradient>
        </View>
      </View>

      {/* Conclusion Card */}
      <View style={[commonStyles.card, styles.conclusionCard]}>
        <LinearGradient
          colors={[colors.primary + '20', colors.accent + '20']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.conclusionGradient}
        >
          <Text style={styles.conclusionEmoji}>🎯</Text>
          <Text style={styles.conclusionTitle}>Diferenciación de MXI</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.conclusionText}>
            🌟 MXI se diferencia por su <Text style={styles.boldText}>visión estructurada, sostenible y matemáticamente coherente</Text>, permitiendo un crecimiento orgánico sin sacrificar estabilidad.
          </Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.conclusionHighlight}>
            ⚡ Este enfoque permite que MXI mantenga su escasez y solidez, al mismo tiempo que la infraestructura del ecosistema crece sin comprometer su equilibrio económico.
          </Text>
        </LinearGradient>
      </View>

      {/* Final CTA */}
      <View style={[commonStyles.card, styles.finalCtaCard]}>
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.finalCtaGradient}
        >
          <Text style={styles.finalCtaEmoji}>🪙</Text>
          <Text style={styles.finalCtaTitle}>Invierte en un Modelo Sólido</Text>
          <Text style={styles.finalCtaText}>
            Únete a un proyecto con tokenómica diseñada para el éxito a largo plazo
          </Text>
          <View style={styles.finalCtaStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>50M</Text>
              <Text style={styles.statLabel}>Oferta Fija</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>Híbrido</Text>
              <Text style={styles.statLabel}>Modelo Único</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
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
  // FIXED TAB STYLES - SCROLL BARS HIDDEN
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
  seguridadCuanticaImage: {
    width: width - 80,
    height: (width - 80) * 0.75,
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
  tokenomicaImage: {
    width: width - 80,
    height: (width - 80) * 0.65,
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
  // Reasons Section (Por qué comprar)
  reasonsSection: {
    marginBottom: 24,
  },
  reasonCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 16,
  },
  reasonGradient: {
    padding: 20,
  },
  reasonEmoji: {
    fontSize: 48,
    marginBottom: 12,
    textAlign: 'center',
  },
  reasonTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  reasonText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
    textAlign: 'center',
  },
  // Comparison Card
  comparisonCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 24,
  },
  comparisonGradient: {
    padding: 24,
    alignItems: 'center',
  },
  comparisonEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  comparisonTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  comparisonText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 8,
  },
  comparisonHighlight: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
    lineHeight: 26,
  },
  // Goals Section (META)
  goalsSection: {
    marginBottom: 24,
  },
  goalCard: {
    padding: 20,
    marginBottom: 16,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  goalEmoji: {
    fontSize: 36,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  goalDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  // Timeline Card
  timelineCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 24,
  },
  timelineGradient: {
    padding: 24,
    alignItems: 'center',
  },
  timelineEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  timelineTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  timelineDate: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  timelineTime: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
  },
  timelineText: {
    fontSize: 15,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
  },
  // Components Section (Ecosistema)
  componentsSection: {
    marginBottom: 24,
  },
  componentCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 16,
  },
  componentGradient: {
    padding: 20,
    alignItems: 'center',
  },
  componentEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  componentTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  componentDescription: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
    textAlign: 'center',
  },
  // Integration Card
  integrationCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 24,
  },
  integrationGradient: {
    padding: 24,
    alignItems: 'center',
  },
  integrationEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  integrationTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  integrationText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 8,
  },
  integrationHighlight: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
    lineHeight: 26,
  },
  // Seguridad Cuántica Styles - NEW
  securityFeaturesSection: {
    marginBottom: 24,
  },
  securityFeatureCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 16,
  },
  securityFeatureGradient: {
    padding: 20,
    alignItems: 'center',
  },
  securityFeatureEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  securityFeatureTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  securityFeatureDescription: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
    textAlign: 'center',
  },
  quantumThreatCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 24,
  },
  quantumThreatGradient: {
    padding: 24,
    alignItems: 'center',
  },
  quantumThreatEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  quantumThreatTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  quantumThreatText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 8,
  },
  quantumThreatHighlight: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
    lineHeight: 26,
  },
  quantumBenefitsSection: {
    marginBottom: 24,
  },
  quantumBenefitCard: {
    padding: 16,
    marginBottom: 12,
  },
  quantumBenefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quantumBenefitIcon: {
    fontSize: 36,
  },
  quantumBenefitContent: {
    flex: 1,
  },
  quantumBenefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  quantumBenefitDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  ecosystemStatementCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 24,
  },
  ecosystemStatementGradient: {
    padding: 24,
    alignItems: 'center',
  },
  ecosystemStatementEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  ecosystemStatementTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  ecosystemStatementText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 8,
  },
  ecosystemStatementHighlight: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
    lineHeight: 26,
  },
  // Pillars Section (Sostenibilidad)
  pillarsSection: {
    marginBottom: 24,
  },
  pillarCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 16,
  },
  pillarGradient: {
    padding: 20,
  },
  pillarEmoji: {
    fontSize: 48,
    marginBottom: 12,
    textAlign: 'center',
  },
  pillarTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  pillarDescription: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
    textAlign: 'center',
  },
  // Long Term Card
  longTermCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 24,
  },
  longTermGradient: {
    padding: 24,
    alignItems: 'center',
  },
  longTermEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  longTermTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  longTermText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 8,
  },
  longTermHighlight: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
    lineHeight: 26,
  },
  // Vesting Diario Styles
  howItWorksSection: {
    marginBottom: 24,
  },
  howItWorksCard: {
    padding: 0,
    overflow: 'hidden',
  },
  howItWorksGradient: {
    padding: 20,
  },
  howItWorksText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 8,
  },
  howItWorksHighlight: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    lineHeight: 24,
    marginBottom: 8,
  },
  formulaSection: {
    marginBottom: 24,
  },
  formulaCard: {
    padding: 0,
    overflow: 'hidden',
  },
  formulaGradient: {
    padding: 20,
  },
  formulaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  formulaText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  exampleSection: {
    marginBottom: 24,
  },
  exampleCard: {
    padding: 0,
    overflow: 'hidden',
  },
  exampleGradient: {
    padding: 20,
  },
  exampleTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  exampleText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 8,
  },
  exampleSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
    marginBottom: 8,
  },
  exampleHighlight: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
    lineHeight: 24,
  },
  calculationBox: {
    backgroundColor: colors.primary + '15',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  calculationText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  calculationResult: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
  },
  benefitSection: {
    marginBottom: 24,
  },
  benefitCard: {
    padding: 0,
    overflow: 'hidden',
  },
  benefitGradient: {
    padding: 20,
  },
  benefitText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 8,
  },
  benefitSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
    marginBottom: 8,
  },
  benefitInfo: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  scenarioBox: {
    backgroundColor: colors.primary + '10',
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  scenarioLabel: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  scenarioValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  // En la práctica Styles
  waysList: {
    gap: 8,
  },
  waysItem: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
  },
  waySection: {
    marginBottom: 24,
  },
  wayCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 16,
  },
  wayGradient: {
    padding: 20,
  },
  waySubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  wayText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 8,
  },
  wayHighlight: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    lineHeight: 24,
  },
  wayCalc: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 4,
  },
  priceList: {
    gap: 8,
    marginVertical: 8,
  },
  priceItem: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
  },
  scenarioList: {
    gap: 8,
    marginVertical: 8,
  },
  scenarioItem: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
  },
  commissionList: {
    gap: 8,
    marginVertical: 8,
  },
  commissionItem: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  levelCalc: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 4,
  },
  levelResult: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  totalBox: {
    backgroundColor: colors.primary + '20',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
  },
  vestingScenarioBox: {
    gap: 8,
    marginVertical: 8,
  },
  vestingScenario: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
  },
  completeExampleSection: {
    marginBottom: 24,
  },
  completeExampleCard: {
    padding: 0,
    overflow: 'hidden',
  },
  completeExampleGradient: {
    padding: 20,
  },
  completeExampleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  assumptionsList: {
    gap: 8,
    marginVertical: 8,
  },
  assumptionItem: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
  },
  finalCalculation: {
    gap: 8,
  },
  finalCalcLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
  },
  finalCalcValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  scenarioResultBox: {
    backgroundColor: colors.primary + '10',
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  scenarioResultLabel: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  scenarioResultValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  totalResultBox: {
    backgroundColor: colors.primary + '20',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    gap: 8,
  },
  totalResultItem: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 28,
  },
  // Tokenómica Styles
  hybridModelSection: {
    marginBottom: 24,
  },
  hybridCard: {
    padding: 0,
    overflow: 'hidden',
  },
  hybridGradient: {
    padding: 20,
  },
  hybridText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 8,
  },
  benefitsTokenSection: {
    marginBottom: 24,
  },
  benefitTokenCard: {
    padding: 16,
    marginBottom: 12,
  },
  benefitTokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  benefitTokenIcon: {
    fontSize: 36,
  },
  benefitTokenContent: {
    flex: 1,
  },
  benefitTokenTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  benefitTokenDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  comparisonTableSection: {
    marginBottom: 24,
  },
  comparisonProjectCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 16,
  },
  mxiHighlightCard: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  comparisonProjectGradient: {
    padding: 20,
  },
  comparisonProjectName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  comparisonProjectNameMXI: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  comparisonRow: {
    marginBottom: 12,
  },
  comparisonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  comparisonValue: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  comparisonValueMXI: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    fontWeight: '500',
  },
  conclusionCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 24,
  },
  conclusionGradient: {
    padding: 24,
    alignItems: 'center',
  },
  conclusionEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  conclusionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  conclusionText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 8,
  },
  conclusionHighlight: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
    lineHeight: 26,
  },
});
