
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

type TabType = 'que-es' | 'como-funciona' | 'por-que-comprar' | 'meta' | 'ecosistema' | 'sostenibilidad' | 'vesting-diario';

export default function EcosystemScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('que-es');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌐 Ecosistema MXI</Text>
        <Text style={styles.headerSubtitle}>Pool de Liquidez Maxcoin</Text>
      </View>

      {/* Tab Navigation */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabContainer}
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
            Vesting Diario MXI 💎
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Tab Content */}
      {activeTab === 'que-es' && <QueEsMXITab />}
      {activeTab === 'como-funciona' && <ComoFuncionaTab />}
      {activeTab === 'por-que-comprar' && <PorQueComprarTab />}
      {activeTab === 'meta' && <MetaTab />}
      {activeTab === 'ecosistema' && <EcosistemaTab />}
      {activeTab === 'sostenibilidad' && <SostenibilidadTab />}
      {activeTab === 'vesting-diario' && <VestingDiarioTab />}
    </SafeAreaView>
  );
}

// ¿Qué es MXI? Tab Content
function QueEsMXITab() {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
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
    </ScrollView>
  );
}

// ¿Cómo funciona? Tab Content
function ComoFuncionaTab() {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
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
            "Quien entendió Bitcoin en 2011, hoy entiende MAXCOIN"
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
    </ScrollView>
  );
}

// ¿Por qué debería comprar MAXCOIN? Tab Content
function PorQueComprarTab() {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {/* Main Title */}
      <View style={styles.titleSection}>
        <Text style={styles.mainTitle}>¿Por qué debería comprar MAXCOIN? 💰</Text>
      </View>

      {/* Hero Image */}
      <View style={styles.imageContainer}>
        <Image
          source={require('@/assets/images/324a9ee7-af32-46ee-a3c6-a18ca22d0af8.png')}
          style={styles.whyBuyImage}
          resizeMode="cover"
        />
      </View>

      {/* Introduction Card */}
      <View style={[commonStyles.card, styles.contentCard]}>
        <LinearGradient
          colors={[colors.primary + '15', colors.accent + '15']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.contentGradient}
        >
          <Text style={styles.whyBuyIntro}>
            💎 Porque estás frente a una <Text style={styles.boldText}>oportunidad limitada</Text> con una <Text style={styles.boldText}>base sólida</Text> y un <Text style={styles.boldText}>respaldo real</Text>.
          </Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.bodyText}>
            🌟 MAXCOIN combina tres factores que muy pocas criptomonedas logran:
          </Text>
        </LinearGradient>
      </View>

      {/* Factor 1: Crecimiento medible */}
      <View style={[commonStyles.card, styles.factorCard]}>
        <LinearGradient
          colors={['#4CAF50' + '15', '#8BC34A' + '15']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.factorGradient}
        >
          <View style={styles.factorHeader}>
            <Text style={styles.factorEmoji}>📈</Text>
            <Text style={styles.factorTitle}>Crecimiento medible</Text>
          </View>
          
          <View style={styles.factorContent}>
            <Text style={styles.factorDescription}>
              Proyección hasta <Text style={styles.factorHighlight}>12 USDT</Text> con fases equitativas.
            </Text>
            <View style={styles.factorDetails}>
              <View style={styles.factorDetailRow}>
                <Text style={styles.factorDetailIcon}>✓</Text>
                <Text style={styles.factorDetailText}>Crecimiento planificado y transparente</Text>
              </View>
              <View style={styles.factorDetailRow}>
                <Text style={styles.factorDetailIcon}>✓</Text>
                <Text style={styles.factorDetailText}>Fases equitativas para todos los inversores</Text>
              </View>
              <View style={styles.factorDetailRow}>
                <Text style={styles.factorDetailIcon}>✓</Text>
                <Text style={styles.factorDetailText}>Potencial de valorización hasta 30x</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Factor 2: Seguridad institucional */}
      <View style={[commonStyles.card, styles.factorCard]}>
        <LinearGradient
          colors={['#2196F3' + '15', '#03A9F4' + '15']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.factorGradient}
        >
          <View style={styles.factorHeader}>
            <Text style={styles.factorEmoji}>🛡️</Text>
            <Text style={styles.factorTitle}>Seguridad institucional</Text>
          </View>
          
          <View style={styles.factorContent}>
            <Text style={styles.factorDescription}>
              Contratos <Text style={styles.factorHighlight}>auditados</Text> y cumplimiento <Text style={styles.factorHighlight}>regulatorio</Text>.
            </Text>
            <View style={styles.factorDetails}>
              <View style={styles.factorDetailRow}>
                <Text style={styles.factorDetailIcon}>✓</Text>
                <Text style={styles.factorDetailText}>Smart contracts auditados por expertos</Text>
              </View>
              <View style={styles.factorDetailRow}>
                <Text style={styles.factorDetailIcon}>✓</Text>
                <Text style={styles.factorDetailText}>Cumplimiento normativo internacional</Text>
              </View>
              <View style={styles.factorDetailRow}>
                <Text style={styles.factorDetailIcon}>✓</Text>
                <Text style={styles.factorDetailText}>Transparencia total en operaciones</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Factor 3: Expansión global */}
      <View style={[commonStyles.card, styles.factorCard]}>
        <LinearGradient
          colors={['#FF9800' + '15', '#FF5722' + '15']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.factorGradient}
        >
          <View style={styles.factorHeader}>
            <Text style={styles.factorEmoji}>🌍</Text>
            <Text style={styles.factorTitle}>Expansión global</Text>
          </View>
          
          <View style={styles.factorContent}>
            <Text style={styles.factorDescription}>
              Un ecosistema diseñado para <Text style={styles.factorHighlight}>adopción masiva</Text>.
            </Text>
            <View style={styles.factorDetails}>
              <View style={styles.factorDetailRow}>
                <Text style={styles.factorDetailIcon}>✓</Text>
                <Text style={styles.factorDetailText}>Presencia en múltiples países</Text>
              </View>
              <View style={styles.factorDetailRow}>
                <Text style={styles.factorDetailIcon}>✓</Text>
                <Text style={styles.factorDetailText}>Comunidad global en crecimiento</Text>
              </View>
              <View style={styles.factorDetailRow}>
                <Text style={styles.factorDetailIcon}>✓</Text>
                <Text style={styles.factorDetailText}>Productos y servicios para el mundo real</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Movement Card */}
      <View style={[commonStyles.card, styles.movementCard]}>
        <LinearGradient
          colors={[colors.primary + '20', colors.accent + '20']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.movementGradient}
        >
          <Text style={styles.movementEmoji}>🚀</Text>
          <Text style={styles.movementTitle}>Más que un token</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.movementText}>
            💼 No se trata de comprar un token, sino de ser parte de un <Text style={styles.movementHighlight}>movimiento económico global</Text>.
          </Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.movementSubtext}>
            🌐 Únete a miles de inversores que ya están construyendo el futuro de las finanzas descentralizadas.
          </Text>
        </LinearGradient>
      </View>

      {/* Comparison Section */}
      <View style={styles.comparisonSection}>
        <Text style={styles.sectionTitle}>💡 ¿Por qué MAXCOIN es diferente?</Text>
        
        <View style={[commonStyles.card, styles.comparisonCard]}>
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonIcon}>❌</Text>
            <View style={styles.comparisonContent}>
              <Text style={styles.comparisonLabel}>Otras criptomonedas</Text>
              <Text style={styles.comparisonText}>Especulación sin fundamento</Text>
            </View>
          </View>
        </View>

        <View style={[commonStyles.card, styles.comparisonCard, styles.comparisonCardPositive]}>
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonIcon}>✅</Text>
            <View style={styles.comparisonContent}>
              <Text style={styles.comparisonLabel}>MAXCOIN</Text>
              <Text style={styles.comparisonText}>Valor real con productos reales</Text>
            </View>
          </View>
        </View>

        <View style={[commonStyles.card, styles.comparisonCard]}>
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonIcon}>❌</Text>
            <View style={styles.comparisonContent}>
              <Text style={styles.comparisonLabel}>Otras criptomonedas</Text>
              <Text style={styles.comparisonText}>Sin auditorías ni regulación</Text>
            </View>
          </View>
        </View>

        <View style={[commonStyles.card, styles.comparisonCard, styles.comparisonCardPositive]}>
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonIcon}>✅</Text>
            <View style={styles.comparisonContent}>
              <Text style={styles.comparisonLabel}>MAXCOIN</Text>
              <Text style={styles.comparisonText}>Contratos auditados y cumplimiento regulatorio</Text>
            </View>
          </View>
        </View>

        <View style={[commonStyles.card, styles.comparisonCard]}>
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonIcon}>❌</Text>
            <View style={styles.comparisonContent}>
              <Text style={styles.comparisonLabel}>Otras criptomonedas</Text>
              <Text style={styles.comparisonText}>Comunidad limitada</Text>
            </View>
          </View>
        </View>

        <View style={[commonStyles.card, styles.comparisonCard, styles.comparisonCardPositive]}>
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonIcon}>✅</Text>
            <View style={styles.comparisonContent}>
              <Text style={styles.comparisonLabel}>MAXCOIN</Text>
              <Text style={styles.comparisonText}>Ecosistema global en expansión</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Urgency Card */}
      <View style={[commonStyles.card, styles.urgencyCard]}>
        <LinearGradient
          colors={['#FF6B6B', '#FF8E53']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.urgencyGradient}
        >
          <Text style={styles.urgencyEmoji}>⏰</Text>
          <Text style={styles.urgencyTitle}>El momento de actuar es ahora</Text>
          
          <View style={styles.urgencyDivider} />
          
          <Text style={styles.urgencyText}>
            🔥 La preventa es por tiempo limitado
          </Text>
          <Text style={styles.urgencyText}>
            💎 Solo 250,000 plazas disponibles
          </Text>
          <Text style={styles.urgencyText}>
            📈 El precio aumenta con cada fase
          </Text>
          
          <View style={styles.urgencyDivider} />
          
          <Text style={styles.urgencyHighlight}>
            ⚡ No pierdas la oportunidad de entrar en la fase inicial
          </Text>
        </LinearGradient>
      </View>

      {/* Benefits Grid */}
      <View style={styles.benefitsSection}>
        <Text style={styles.sectionTitle}>🎁 Beneficios exclusivos</Text>
        
        <View style={styles.benefitsGrid}>
          <View style={[commonStyles.card, styles.benefitCard]}>
            <Text style={styles.benefitCardEmoji}>💰</Text>
            <Text style={styles.benefitCardTitle}>Precio preferencial</Text>
            <Text style={styles.benefitCardText}>Desde 0.40 USDT</Text>
          </View>

          <View style={[commonStyles.card, styles.benefitCard]}>
            <Text style={styles.benefitCardEmoji}>🎯</Text>
            <Text style={styles.benefitCardTitle}>Acceso prioritario</Text>
            <Text style={styles.benefitCardText}>Beneficios exclusivos</Text>
          </View>

          <View style={[commonStyles.card, styles.benefitCard]}>
            <Text style={styles.benefitCardEmoji}>🤝</Text>
            <Text style={styles.benefitCardTitle}>Sistema de referidos</Text>
            <Text style={styles.benefitCardText}>Gana comisiones</Text>
          </View>

          <View style={[commonStyles.card, styles.benefitCard]}>
            <Text style={styles.benefitCardEmoji}>⛏️</Text>
            <Text style={styles.benefitCardTitle}>Minería temprana</Text>
            <Text style={styles.benefitCardText}>Recompensas desde el día 1</Text>
          </View>

          <View style={[commonStyles.card, styles.benefitCard]}>
            <Text style={styles.benefitCardEmoji}>🔒</Text>
            <Text style={styles.benefitCardTitle}>Vesting anticipado</Text>
            <Text style={styles.benefitCardText}>Genera rendimientos</Text>
          </View>

          <View style={[commonStyles.card, styles.benefitCard]}>
            <Text style={styles.benefitCardEmoji}>🌍</Text>
            <Text style={styles.benefitCardTitle}>Comunidad global</Text>
            <Text style={styles.benefitCardText}>Red en crecimiento</Text>
          </View>
        </View>
      </View>

      {/* Final CTA */}
      <View style={[commonStyles.card, styles.finalWhyBuyCard]}>
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.finalWhyBuyGradient}
        >
          <Text style={styles.finalWhyBuyEmoji}>💎</Text>
          <Text style={styles.finalWhyBuyTitle}>¡Únete ahora a MAXCOIN!</Text>
          <Text style={styles.finalWhyBuyText}>
            Sé parte del movimiento económico global que está transformando las finanzas digitales
          </Text>
          
          <View style={styles.finalWhyBuyStats}>
            <View style={styles.whyBuyStatItem}>
              <Text style={styles.whyBuyStatIcon}>📈</Text>
              <Text style={styles.whyBuyStatValue}>12 USDT</Text>
              <Text style={styles.whyBuyStatLabel}>Proyección</Text>
            </View>
            <View style={styles.whyBuyStatDivider} />
            <View style={styles.whyBuyStatItem}>
              <Text style={styles.whyBuyStatIcon}>🛡️</Text>
              <Text style={styles.whyBuyStatValue}>100%</Text>
              <Text style={styles.whyBuyStatLabel}>Auditado</Text>
            </View>
            <View style={styles.whyBuyStatDivider} />
            <View style={styles.whyBuyStatItem}>
              <Text style={styles.whyBuyStatIcon}>🌍</Text>
              <Text style={styles.whyBuyStatValue}>Global</Text>
              <Text style={styles.whyBuyStatLabel}>Expansión</Text>
            </View>
          </View>
          
          <View style={styles.urgencyDivider} />
          
          <Text style={styles.finalWhyBuyUrgency}>
            ⏰ El momento de actuar es ahora
          </Text>
        </LinearGradient>
      </View>
    </ScrollView>
  );
}

// META Tab Content
function MetaTab() {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {/* Main Title */}
      <View style={styles.titleSection}>
        <Text style={styles.mainTitle}>META 🎯</Text>
      </View>

      {/* Hero Image */}
      <View style={styles.imageContainer}>
        <Image
          source={require('@/assets/images/76b95e25-0844-42d7-915d-4be1ebdeb915.png')}
          style={styles.metaImage}
          resizeMode="cover"
        />
      </View>

      {/* Main Goal Card */}
      <View style={[commonStyles.card, styles.metaGoalCard]}>
        <LinearGradient
          colors={[colors.primary + '15', colors.accent + '15']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.metaGoalGradient}
        >
          <Text style={styles.metaGoalEmoji}>🎯</Text>
          <Text style={styles.metaGoalTitle}>Nuestra Meta es Clara</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.metaGoalText}>
            Posicionar a <Text style={styles.boldText}>MAXCOIN (MXI)</Text> como una de las criptomonedas de crecimiento más sólidas y confiables del mercado internacional, impulsando su valor desde <Text style={styles.highlightText}>0.40 USDT</Text> hasta una proyección de <Text style={styles.highlightText}>12 USDT</Text> en un modelo sostenible, transparente y medible.
          </Text>
        </LinearGradient>
      </View>

      {/* Vision Card */}
      <View style={[commonStyles.card, styles.metaVisionCard]}>
        <LinearGradient
          colors={['#4CAF50' + '15', '#8BC34A' + '15']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.metaVisionGradient}
        >
          <Text style={styles.metaVisionEmoji}>🌉</Text>
          <Text style={styles.metaVisionTitle}>Rompiendo Barreras</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.metaVisionText}>
            Queremos romper la brecha entre el <Text style={styles.boldText}>mundo tradicional</Text> y el <Text style={styles.boldText}>mundo cripto</Text>, brindando herramientas reales de generación de ingresos a través de:
          </Text>
          
          <View style={styles.metaToolsList}>
            <View style={styles.metaToolRow}>
              <Text style={styles.metaToolIcon}>💎</Text>
              <Text style={styles.metaToolText}>Vesting</Text>
            </View>
            <View style={styles.metaToolRow}>
              <Text style={styles.metaToolIcon}>⛏️</Text>
              <Text style={styles.metaToolText}>Minería</Text>
            </View>
            <View style={styles.metaToolRow}>
              <Text style={styles.metaToolIcon}>💰</Text>
              <Text style={styles.metaToolText}>Préstamos</Text>
            </View>
            <View style={styles.metaToolRow}>
              <Text style={styles.metaToolIcon}>💳</Text>
              <Text style={styles.metaToolText}>Pagos descentralizados</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Growth Projection Card */}
      <View style={[commonStyles.card, styles.metaProjectionCard]}>
        <LinearGradient
          colors={['#2196F3' + '15', '#03A9F4' + '15']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.metaProjectionGradient}
        >
          <Text style={styles.metaProjectionEmoji}>📈</Text>
          <Text style={styles.metaProjectionTitle}>Proyección de Crecimiento</Text>
          
          <View style={styles.metaProjectionStats}>
            <View style={styles.metaProjectionStatItem}>
              <Text style={styles.metaProjectionStatValue}>0.40 USDT</Text>
              <Text style={styles.metaProjectionStatLabel}>Precio Inicial</Text>
              <Text style={styles.metaProjectionStatEmoji}>🚀</Text>
            </View>
            
            <View style={styles.metaProjectionArrow}>
              <Text style={styles.metaProjectionArrowText}>→</Text>
            </View>
            
            <View style={styles.metaProjectionStatItem}>
              <Text style={styles.metaProjectionStatValue}>12 USDT</Text>
              <Text style={styles.metaProjectionStatLabel}>Proyección</Text>
              <Text style={styles.metaProjectionStatEmoji}>🎯</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.metaProjectionFeatures}>
            <View style={styles.metaProjectionFeatureRow}>
              <Text style={styles.metaProjectionFeatureIcon}>✓</Text>
              <Text style={styles.metaProjectionFeatureText}>Modelo sostenible</Text>
            </View>
            <View style={styles.metaProjectionFeatureRow}>
              <Text style={styles.metaProjectionFeatureIcon}>✓</Text>
              <Text style={styles.metaProjectionFeatureText}>Transparente</Text>
            </View>
            <View style={styles.metaProjectionFeatureRow}>
              <Text style={styles.metaProjectionFeatureIcon}>✓</Text>
              <Text style={styles.metaProjectionFeatureText}>Medible</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Shared Goal Card */}
      <View style={[commonStyles.card, styles.metaSharedGoalCard]}>
        <LinearGradient
          colors={['#FF9800' + '15', '#FF5722' + '15']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.metaSharedGoalGradient}
        >
          <Text style={styles.metaSharedGoalEmoji}>🤝</Text>
          <Text style={styles.metaSharedGoalTitle}>Una Meta Compartida</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.metaSharedGoalText}>
            Cada fase, cada aplicación y cada usuario forma parte de una meta compartida:
          </Text>
          
          <View style={styles.metaSharedGoalHighlight}>
            <Text style={styles.metaSharedGoalQuoteIcon}>💬</Text>
            <Text style={styles.metaSharedGoalQuote}>
              "Construir un sistema financiero global que funcione para todos, no solo para unos pocos."
            </Text>
          </View>
        </LinearGradient>
      </View>

      {/* Key Pillars Section */}
      <View style={styles.metaPillarsSection}>
        <Text style={styles.sectionTitle}>🏛️ Pilares Fundamentales</Text>
        
        <View style={[commonStyles.card, styles.metaPillarCard]}>
          <View style={styles.metaPillarRow}>
            <Text style={styles.metaPillarEmoji}>🌍</Text>
            <View style={styles.metaPillarContent}>
              <Text style={styles.metaPillarTitle}>Alcance Global</Text>
              <Text style={styles.metaPillarDescription}>
                Un sistema financiero que trasciende fronteras y llega a todos los rincones del mundo
              </Text>
            </View>
          </View>
        </View>

        <View style={[commonStyles.card, styles.metaPillarCard]}>
          <View style={styles.metaPillarRow}>
            <Text style={styles.metaPillarEmoji}>⚖️</Text>
            <View style={styles.metaPillarContent}>
              <Text style={styles.metaPillarTitle}>Equidad</Text>
              <Text style={styles.metaPillarDescription}>
                Oportunidades justas para todos, sin importar su ubicación o capital inicial
              </Text>
            </View>
          </View>
        </View>

        <View style={[commonStyles.card, styles.metaPillarCard]}>
          <View style={styles.metaPillarRow}>
            <Text style={styles.metaPillarEmoji}>🔬</Text>
            <View style={styles.metaPillarContent}>
              <Text style={styles.metaPillarTitle}>Innovación</Text>
              <Text style={styles.metaPillarDescription}>
                Tecnología blockchain de vanguardia al servicio de la comunidad
              </Text>
            </View>
          </View>
        </View>

        <View style={[commonStyles.card, styles.metaPillarCard]}>
          <View style={styles.metaPillarRow}>
            <Text style={styles.metaPillarEmoji}>🛡️</Text>
            <View style={styles.metaPillarContent}>
              <Text style={styles.metaPillarTitle}>Confiabilidad</Text>
              <Text style={styles.metaPillarDescription}>
                Seguridad, auditorías y transparencia en cada operación
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Impact Section */}
      <View style={styles.metaImpactSection}>
        <Text style={styles.sectionTitle}>💫 Nuestro Impacto</Text>
        
        <View style={styles.metaImpactGrid}>
          <View style={[commonStyles.card, styles.metaImpactCard]}>
            <Text style={styles.metaImpactEmoji}>👥</Text>
            <Text style={styles.metaImpactValue}>250,000</Text>
            <Text style={styles.metaImpactLabel}>Usuarios Objetivo</Text>
          </View>

          <View style={[commonStyles.card, styles.metaImpactCard]}>
            <Text style={styles.metaImpactEmoji}>🌐</Text>
            <Text style={styles.metaImpactValue}>Global</Text>
            <Text style={styles.metaImpactLabel}>Alcance</Text>
          </View>

          <View style={[commonStyles.card, styles.metaImpactCard]}>
            <Text style={styles.metaImpactEmoji}>💰</Text>
            <Text style={styles.metaImpactValue}>30x</Text>
            <Text style={styles.metaImpactLabel}>Potencial ROI</Text>
          </View>

          <View style={[commonStyles.card, styles.metaImpactCard]}>
            <Text style={styles.metaImpactEmoji}>🔒</Text>
            <Text style={styles.metaImpactValue}>100%</Text>
            <Text style={styles.metaImpactLabel}>Seguro</Text>
          </View>
        </View>
      </View>

      {/* Final CTA */}
      <View style={[commonStyles.card, styles.metaFinalCard]}>
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.metaFinalGradient}
        >
          <Text style={styles.metaFinalEmoji}>🚀</Text>
          <Text style={styles.metaFinalTitle}>Sé Parte de la Meta</Text>
          <Text style={styles.metaFinalText}>
            Únete a MAXCOIN y construye junto a nosotros un sistema financiero global que funcione para todos
          </Text>
          
          <View style={styles.urgencyDivider} />
          
          <Text style={styles.metaFinalHighlight}>
            🎯 Tu participación hace la diferencia
          </Text>
        </LinearGradient>
      </View>
    </ScrollView>
  );
}

// Ecosistema Tab Content
function EcosistemaTab() {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {/* Main Title */}
      <View style={styles.titleSection}>
        <Text style={styles.mainTitle}>Ecosistema MXI 🌱</Text>
      </View>

      {/* Hero Image */}
      <View style={styles.imageContainer}>
        <Image
          source={require('@/assets/images/1766a525-4d5d-41da-aa7e-293c48436e0f.png')}
          style={styles.ecosistemaImage}
          resizeMode="cover"
        />
      </View>

      {/* Introduction Card */}
      <View style={[commonStyles.card, styles.contentCard]}>
        <LinearGradient
          colors={[colors.primary + '15', colors.accent + '15']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.contentGradient}
        >
          <Text style={styles.ecosistemaIntro}>
            🌱 MXI es un ecosistema diseñado para <Text style={styles.boldText}>crecer por etapas</Text>, iniciando hoy con la preventa y expandiéndose progresivamente a medida que la comunidad crece.
          </Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.bodyText}>
            💎 Su valor no nace de promesas, sino de <Text style={styles.highlightText}>utilidad real</Text> y <Text style={styles.highlightText}>desarrollo tecnológico planificado</Text>.
          </Text>
        </LinearGradient>
      </View>

      {/* Phase 1: Preventa y crecimiento inicial */}
      <View style={[commonStyles.card, styles.ecosistemaPhaseCard]}>
        <LinearGradient
          colors={['#00ff88' + '15', '#00cc6a' + '15']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ecosistemaPhaseGradient}
        >
          <View style={styles.ecosistemaPhaseHeader}>
            <Text style={styles.ecosistemaPhaseNumber}>1️⃣</Text>
            <Text style={styles.ecosistemaPhaseTitle}>Fase actual: Preventa y crecimiento inicial</Text>
          </View>
          
          <View style={styles.divider} />
          
          <Text style={styles.ecosistemaPhaseText}>
            🚀 La preventa define el precio base, la liquidez inicial y permite que los primeros participantes entren antes que el mercado general.
          </Text>
          
          <Text style={styles.ecosistemaPhaseHighlight}>
            💧 Sin preventa no hay liquidez, sin liquidez no hay ecosistema.
          </Text>
          
          <Text style={styles.ecosistemaPhaseText}>
            ⭐ Por eso, el éxito de MXI comienza con esta etapa.
          </Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.ecosistemaBenefitsTitle}>
            🎁 Aquí nacen tres beneficios inmediatos:
          </Text>
          
          <View style={styles.ecosistemaBenefitsList}>
            <View style={styles.ecosistemaBenefitRow}>
              <Text style={styles.ecosistemaBenefitIcon}>✓</Text>
              <Text style={styles.ecosistemaBenefitText}>Compra anticipada a precios preferenciales</Text>
            </View>
            <View style={styles.ecosistemaBenefitRow}>
              <Text style={styles.ecosistemaBenefitIcon}>✓</Text>
              <Text style={styles.ecosistemaBenefitText}>Acceso al vesting diario (≈3% mensual en MXI)</Text>
            </View>
            <View style={styles.ecosistemaBenefitRow}>
              <Text style={styles.ecosistemaBenefitIcon}>✓</Text>
              <Text style={styles.ecosistemaBenefitText}>Comisiones por referidos para quienes promueven el proyecto</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <Text style={styles.ecosistemaPhaseFooter}>
            🌟 Esta es la etapa donde los primeros usuarios construyen las bases del valor futuro.
          </Text>
        </LinearGradient>
      </View>

      {/* Phase 2: Fase de Activación */}
      <View style={[commonStyles.card, styles.ecosistemaPhaseCard]}>
        <LinearGradient
          colors={['#6366F1' + '15', '#4F46E5' + '15']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ecosistemaPhaseGradient}
        >
          <View style={styles.ecosistemaPhaseHeader}>
            <Text style={styles.ecosistemaPhaseNumber}>2️⃣</Text>
            <Text style={styles.ecosistemaPhaseTitle}>Fase de Activación: Después del lanzamiento</Text>
          </View>
          
          <View style={styles.divider} />
          
          <Text style={styles.ecosistemaPhaseText}>
            🎯 Cuando MXI entre oficialmente al mercado, comenzarán a desplegarse los módulos del ecosistema:
          </Text>
          
          <View style={styles.ecosistemaModulesList}>
            <View style={styles.ecosistemaModuleRow}>
              <Text style={styles.ecosistemaModuleIcon}>💳</Text>
              <View style={styles.ecosistemaModuleContent}>
                <Text style={styles.ecosistemaModuleTitle}>MXI Pay</Text>
                <Text style={styles.ecosistemaModuleDescription}>Pagos rápidos con MXI, conversión y billetera</Text>
              </View>
            </View>
            
            <View style={styles.ecosistemaModuleRow}>
              <Text style={styles.ecosistemaModuleIcon}>🎮</Text>
              <View style={styles.ecosistemaModuleContent}>
                <Text style={styles.ecosistemaModuleTitle}>MXI Games y Torneos</Text>
                <Text style={styles.ecosistemaModuleDescription}>Competencia con premios reales</Text>
              </View>
            </View>
            
            <View style={styles.ecosistemaModuleRow}>
              <Text style={styles.ecosistemaModuleIcon}>💰</Text>
              <View style={styles.ecosistemaModuleContent}>
                <Text style={styles.ecosistemaModuleTitle}>MXI Loan</Text>
                <Text style={styles.ecosistemaModuleDescription}>Acceso a liquidez usando MXI como garantía</Text>
              </View>
            </View>
            
            <View style={styles.ecosistemaModuleRow}>
              <Text style={styles.ecosistemaModuleIcon}>🔥</Text>
              <View style={styles.ecosistemaModuleContent}>
                <Text style={styles.ecosistemaModuleTitle}>Staking y sistemas de quema</Text>
                <Text style={styles.ecosistemaModuleDescription}>Soporte al precio y estabilidad</Text>
              </View>
            </View>
            
            <View style={styles.ecosistemaModuleRow}>
              <Text style={styles.ecosistemaModuleIcon}>📱</Text>
              <View style={styles.ecosistemaModuleContent}>
                <Text style={styles.ecosistemaModuleTitle}>MXI ONE</Text>
                <Text style={styles.ecosistemaModuleDescription}>Una app unificada donde todo se integra</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <Text style={styles.ecosistemaPhaseFooter}>
            📈 Cada módulo aumenta la utilidad del token y la demanda real dentro de la comunidad.
          </Text>
        </LinearGradient>
      </View>

      {/* Phase 3: Fase de Expansión */}
      <View style={[commonStyles.card, styles.ecosistemaPhaseCard]}>
        <LinearGradient
          colors={['#FF9800' + '15', '#F57C00' + '15']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ecosistemaPhaseGradient}
        >
          <View style={styles.ecosistemaPhaseHeader}>
            <Text style={styles.ecosistemaPhaseNumber}>3️⃣</Text>
            <Text style={styles.ecosistemaPhaseTitle}>Fase de Expansión: Crecimiento global</Text>
          </View>
          
          <View style={styles.divider} />
          
          <Text style={styles.ecosistemaPhaseText}>
            🌍 Con la comunidad ya activa, los procesos técnicos avanzan:
          </Text>
          
          <View style={styles.ecosistemaExpansionList}>
            <View style={styles.ecosistemaExpansionRow}>
              <Text style={styles.ecosistemaExpansionIcon}>🏪</Text>
              <Text style={styles.ecosistemaExpansionText}>Integración de comercios</Text>
            </View>
            <View style={styles.ecosistemaExpansionRow}>
              <Text style={styles.ecosistemaExpansionIcon}>🤝</Text>
              <Text style={styles.ecosistemaExpansionText}>Alianzas internacionales</Text>
            </View>
            <View style={styles.ecosistemaExpansionRow}>
              <Text style={styles.ecosistemaExpansionIcon}>🏆</Text>
              <Text style={styles.ecosistemaExpansionText}>Ampliación de torneos y servicios</Text>
            </View>
            <View style={styles.ecosistemaExpansionRow}>
              <Text style={styles.ecosistemaExpansionIcon}>⛓️</Text>
              <Text style={styles.ecosistemaExpansionText}>Transición hacia una blockchain propia (MXI Chain)</Text>
            </View>
            <View style={styles.ecosistemaExpansionRow}>
              <Text style={styles.ecosistemaExpansionIcon}>🗳️</Text>
              <Text style={styles.ecosistemaExpansionText}>Futura gobernanza descentralizada (DAO MXI)</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <Text style={styles.ecosistemaPhaseFooter}>
            🎯 Cada paso está diseñado para fortalecer el valor del token y construir un ecosistema que evoluciona con sus usuarios.
          </Text>
        </LinearGradient>
      </View>

      {/* Sustainability Card */}
      <View style={[commonStyles.card, styles.ecosistemaSustainabilityCard]}>
        <LinearGradient
          colors={['#4CAF50' + '15', '#2E7D32' + '15']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ecosistemaSustainabilityGradient}
        >
          <View style={styles.ecosistemaSustainabilityHeader}>
            <Text style={styles.ecosistemaSustainabilityEmoji}>♻️</Text>
            <Text style={styles.ecosistemaSustainabilityTitle}>¿Por qué MXI es sostenible?</Text>
          </View>
          
          <View style={styles.divider} />
          
          <Text style={styles.ecosistemaSustainabilityText}>
            💪 Porque su crecimiento depende de factores reales:
          </Text>
          
          <View style={styles.ecosistemaSustainabilityList}>
            <View style={styles.ecosistemaSustainabilityRow}>
              <Text style={styles.ecosistemaSustainabilityIcon}>✓</Text>
              <Text style={styles.ecosistemaSustainabilityItem}>Utilidad dentro de las aplicaciones</Text>
            </View>
            <View style={styles.ecosistemaSustainabilityRow}>
              <Text style={styles.ecosistemaSustainabilityIcon}>✓</Text>
              <Text style={styles.ecosistemaSustainabilityItem}>Actividad de transacciones</Text>
            </View>
            <View style={styles.ecosistemaSustainabilityRow}>
              <Text style={styles.ecosistemaSustainabilityIcon}>✓</Text>
              <Text style={styles.ecosistemaSustainabilityItem}>Vesting gestionado en MXI, no en dinero externo</Text>
            </View>
            <View style={styles.ecosistemaSustainabilityRow}>
              <Text style={styles.ecosistemaSustainabilityIcon}>✓</Text>
              <Text style={styles.ecosistemaSustainabilityItem}>Torneos y comisiones financiados por la actividad interna</Text>
            </View>
            <View style={styles.ecosistemaSustainabilityRow}>
              <Text style={styles.ecosistemaSustainabilityIcon}>✓</Text>
              <Text style={styles.ecosistemaSustainabilityItem}>Adopción progresiva en países hispanohablantes</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <Text style={styles.ecosistemaSustainabilityHighlight}>
            🎯 No se sostiene por entradas nuevas, sino por uso real.
          </Text>
        </LinearGradient>
      </View>

      {/* Final Message Card */}
      <View style={[commonStyles.card, styles.ecosistemaFinalCard]}>
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ecosistemaFinalGradient}
        >
          <Text style={styles.ecosistemaFinalEmoji}>🌟</Text>
          <Text style={styles.ecosistemaFinalTitle}>Mensaje Final</Text>
          
          <View style={styles.urgencyDivider} />
          
          <Text style={styles.ecosistemaFinalText}>
            🏗️ MXI es un ecosistema en construcción inteligente.
          </Text>
          
          <Text style={styles.ecosistemaFinalText}>
            📅 Hoy estás en la preventa; mañana serás parte del lanzamiento; después formarás parte de la expansión global.
          </Text>
          
          <View style={styles.urgencyDivider} />
          
          <View style={styles.ecosistemaFinalPoints}>
            <Text style={styles.ecosistemaFinalPoint}>
              💎 Cada etapa construye valor.
            </Text>
            <Text style={styles.ecosistemaFinalPoint}>
              👥 Cada usuario que entra fortalece el sistema.
            </Text>
            <Text style={styles.ecosistemaFinalPoint}>
              📈 Y cada avance del ecosistema hace más valiosos los MXI que ya tienes.
            </Text>
          </View>
          
          <View style={styles.urgencyDivider} />
          
          <Text style={styles.ecosistemaFinalCTA}>
            ⚡ Este es el momento de entrar. El crecimiento comienza ahora.
          </Text>
        </LinearGradient>
      </View>
    </ScrollView>
  );
}

// Sostenibilidad Tab Content
function SostenibilidadTab() {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {/* Main Title */}
      <View style={styles.titleSection}>
        <Text style={styles.mainTitle}>Sostenibilidad ♻️</Text>
      </View>

      {/* Hero Image */}
      <View style={styles.imageContainer}>
        <Image
          source={require('@/assets/images/a5536d4f-9a95-4241-8eaf-24523b60983f.png')}
          style={styles.sostenibilidadImage}
          resizeMode="cover"
        />
      </View>

      {/* Introduction Card */}
      <View style={[commonStyles.card, styles.contentCard]}>
        <LinearGradient
          colors={[colors.primary + '15', colors.accent + '15']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.contentGradient}
        >
          <Text style={styles.sostenibilidadIntro}>
            ♻️ MXI es sostenible porque su modelo se basa en algo simple: <Text style={styles.boldText}>sin preventa no hay valor, y sin valor nadie gana</Text>.
          </Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.bodyText}>
            🌱 El crecimiento depende del esfuerzo inicial de la comunidad y de la adopción temprana.
          </Text>
          
          <Text style={styles.emphasisText}>
            💡 No es magia, es economía.
          </Text>
        </LinearGradient>
      </View>

      {/* El valor nace en la preventa */}
      <View style={[commonStyles.card, styles.sostenibilidadSectionCard]}>
        <LinearGradient
          colors={['#00ff88' + '15', '#00cc6a' + '15']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.sostenibilidadSectionGradient}
        >
          <View style={styles.sostenibilidadSectionHeader}>
            <Text style={styles.sostenibilidadSectionEmoji}>💎</Text>
            <Text style={styles.sostenibilidadSectionTitle}>El valor nace en la preventa</Text>
          </View>
          
          <View style={styles.divider} />
          
          <Text style={styles.sostenibilidadSectionText}>
            🚀 La preventa define la liquidez inicial, el precio base y el respaldo del token.
          </Text>
          
          <Text style={styles.sostenibilidadSectionText}>
            💪 Si la comunidad participa, el proyecto arranca con fuerza.
          </Text>
          
          <Text style={styles.sostenibilidadSectionHighlight}>
            ⚠️ Si no hay preventa, no existe un valor sólido para construir el ecosistema.
          </Text>
        </LinearGradient>
      </View>

      {/* El ecosistema genera utilidad real */}
      <View style={[commonStyles.card, styles.sostenibilidadSectionCard]}>
        <LinearGradient
          colors={['#6366F1' + '15', '#4F46E5' + '15']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.sostenibilidadSectionGradient}
        >
          <View style={styles.sostenibilidadSectionHeader}>
            <Text style={styles.sostenibilidadSectionEmoji}>🎮</Text>
            <Text style={styles.sostenibilidadSectionTitle}>El ecosistema genera utilidad real</Text>
          </View>
          
          <View style={styles.divider} />
          
          <Text style={styles.sostenibilidadSectionText}>
            🎯 MXI crece por el uso: juegos, torneos, comisiones, vesting y transacciones internas.
          </Text>
          
          <View style={styles.sostenibilidadPointsList}>
            <View style={styles.sostenibilidadPointRow}>
              <Text style={styles.sostenibilidadPointIcon}>📊</Text>
              <Text style={styles.sostenibilidadPointText}>A mayor actividad, mayor volumen.</Text>
            </View>
            <View style={styles.sostenibilidadPointRow}>
              <Text style={styles.sostenibilidadPointIcon}>📈</Text>
              <Text style={styles.sostenibilidadPointText}>A mayor volumen, mayor valoración.</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <Text style={styles.sostenibilidadSectionHighlight}>
            🎯 No depende de "entradas nuevas", sino del movimiento dentro del sistema.
          </Text>
        </LinearGradient>
      </View>

      {/* El vesting y los premios no afectan la liquidez */}
      <View style={[commonStyles.card, styles.sostenibilidadSectionCard]}>
        <LinearGradient
          colors={['#FF9800' + '15', '#F57C00' + '15']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.sostenibilidadSectionGradient}
        >
          <View style={styles.sostenibilidadSectionHeader}>
            <Text style={styles.sostenibilidadSectionEmoji}>🔒</Text>
            <Text style={styles.sostenibilidadSectionTitle}>El vesting y los premios no afectan la liquidez</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.sostenibilidadPointsList}>
            <View style={styles.sostenibilidadPointRow}>
              <Text style={styles.sostenibilidadPointIcon}>💰</Text>
              <Text style={styles.sostenibilidadPointText}>El vesting genera MXI, no USDT.</Text>
            </View>
            <View style={styles.sostenibilidadPointRow}>
              <Text style={styles.sostenibilidadPointIcon}>🏆</Text>
              <Text style={styles.sostenibilidadPointText}>Los torneos se pagan con comisiones internas, no con fondos del proyecto.</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <Text style={styles.sostenibilidadSectionHighlight}>
            ✅ Esto hace que las recompensas no destruyan la economía.
          </Text>
        </LinearGradient>
      </View>

      {/* El sistema de referidos impulsa la adopción */}
      <View style={[commonStyles.card, styles.sostenibilidadSectionCard]}>
        <LinearGradient
          colors={['#2196F3' + '15', '#03A9F4' + '15']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.sostenibilidadSectionGradient}
        >
          <View style={styles.sostenibilidadSectionHeader}>
            <Text style={styles.sostenibilidadSectionEmoji}>🤝</Text>
            <Text style={styles.sostenibilidadSectionTitle}>El sistema de referidos impulsa la adopción</Text>
          </View>
          
          <View style={styles.divider} />
          
          <Text style={styles.sostenibilidadSectionText}>
            📊 Son solo 3 niveles y porcentajes bajos.
          </Text>
          
          <Text style={styles.sostenibilidadSectionHighlight}>
            🚀 Estimula la expansión y el volumen sin poner en riesgo el fondo principal.
          </Text>
        </LinearGradient>
      </View>

      {/* Todo depende del trabajo conjunto */}
      <View style={[commonStyles.card, styles.sostenibilidadSectionCard]}>
        <LinearGradient
          colors={['#9C27B0' + '15', '#7B1FA2' + '15']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.sostenibilidadSectionGradient}
        >
          <View style={styles.sostenibilidadSectionHeader}>
            <Text style={styles.sostenibilidadSectionEmoji}>👥</Text>
            <Text style={styles.sostenibilidadSectionTitle}>Todo depende del trabajo conjunto</Text>
          </View>
          
          <View style={styles.divider} />
          
          <Text style={styles.sostenibilidadSectionText}>
            ⚠️ MXI no ofrece ganancias pasivas "mágicas".
          </Text>
          
          <Text style={styles.sostenibilidadSectionText}>
            💪 La valorización sucede cuando la comunidad comparte, participa, juega y promueve.
          </Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.sostenibilidadSectionHighlight}>
            🎯 Cuanto más fuerte sea la preventa y la participación, mayor será el valor final del token.
          </Text>
        </LinearGradient>
      </View>

      {/* Resumen Clave */}
      <View style={[commonStyles.card, styles.sostenibilidadResumenCard]}>
        <LinearGradient
          colors={[colors.primary + '20', colors.accent + '20']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.sostenibilidadResumenGradient}
        >
          <Text style={styles.sostenibilidadResumenEmoji}>🔑</Text>
          <Text style={styles.sostenibilidadResumenTitle}>RESUMEN CLAVE PARA EL USUARIO</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.sostenibilidadResumenSubtitle}>
            MXI es sostenible porque:
          </Text>
          
          <View style={styles.sostenibilidadResumenList}>
            <View style={styles.sostenibilidadResumenRow}>
              <Text style={styles.sostenibilidadResumenIcon}>–</Text>
              <Text style={styles.sostenibilidadResumenText}>El valor nace con la preventa</Text>
            </View>
            <View style={styles.sostenibilidadResumenRow}>
              <Text style={styles.sostenibilidadResumenIcon}>–</Text>
              <Text style={styles.sostenibilidadResumenText}>La comunidad es el motor</Text>
            </View>
            <View style={styles.sostenibilidadResumenRow}>
              <Text style={styles.sostenibilidadResumenIcon}>–</Text>
              <Text style={styles.sostenibilidadResumenText}>Las recompensas no afectan la liquidez</Text>
            </View>
            <View style={styles.sostenibilidadResumenRow}>
              <Text style={styles.sostenibilidadResumenIcon}>–</Text>
              <Text style={styles.sostenibilidadResumenText}>La utilidad real del ecosistema genera crecimiento</Text>
            </View>
            <View style={styles.sostenibilidadResumenRow}>
              <Text style={styles.sostenibilidadResumenIcon}>–</Text>
              <Text style={styles.sostenibilidadResumenText}>El precio sube cuando hay adopción, no promesas</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Final Message Card */}
      <View style={[commonStyles.card, styles.sostenibilidadFinalCard]}>
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.sostenibilidadFinalGradient}
        >
          <Text style={styles.sostenibilidadFinalEmoji}>🌟</Text>
          <Text style={styles.sostenibilidadFinalTitle}>Conclusión</Text>
          
          <View style={styles.urgencyDivider} />
          
          <View style={styles.sostenibilidadFinalPoints}>
            <Text style={styles.sostenibilidadFinalPoint}>
              ✅ Si hay trabajo y preventa, todos ganan.
            </Text>
            <Text style={styles.sostenibilidadFinalPoint}>
              ❌ Si no hay preventa ni participación, no hay crecimiento.
            </Text>
          </View>
          
          <View style={styles.urgencyDivider} />
          
          <Text style={styles.sostenibilidadFinalCTA}>
            🎯 MXI es un ecosistema impulsado por la comunidad, no por la especulación.
          </Text>
        </LinearGradient>
      </View>
    </ScrollView>
  );
}

// VESTING DIARIO MXI Tab Content
function VestingDiarioTab() {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {/* Main Title */}
      <View style={styles.titleSection}>
        <Text style={styles.mainTitle}>Vesting Diario MXI 💎</Text>
      </View>

      {/* Hero Image */}
      <View style={styles.imageContainer}>
        <Image
          source={require('@/assets/images/56f26280-5b6d-4a50-a649-19c147affe58.png')}
          style={styles.vestingImage}
          resizeMode="cover"
        />
      </View>

      {/* Introduction Card */}
      <View style={[commonStyles.card, styles.contentCard]}>
        <LinearGradient
          colors={[colors.primary + '15', colors.accent + '15']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.contentGradient}
        >
          <Text style={styles.vestingIntro}>
            💎 El vesting diario de MXI es un <Text style={styles.boldText}>mecanismo programado</Text> que incrementa automáticamente el saldo total de MXI que posee cada usuario dentro del ecosistema.
          </Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.bodyText}>
            🎯 Su objetivo es incentivar la <Text style={styles.highlightText}>retención del token</Text> y generar un <Text style={styles.highlightText}>crecimiento progresivo</Text> sin afectar la liquidez del proyecto.
          </Text>
        </LinearGradient>
      </View>

      {/* ¿Cómo funciona el vesting? */}
      <View style={[commonStyles.card, styles.vestingSectionCard]}>
        <LinearGradient
          colors={['#4CAF50' + '15', '#8BC34A' + '15']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.vestingSectionGradient}
        >
          <View style={styles.vestingSectionHeader}>
            <Text style={styles.vestingSectionEmoji}>🔄</Text>
            <Text style={styles.vestingSectionTitle}>¿Cómo funciona el vesting?</Text>
          </View>
          
          <View style={styles.divider} />
          
          <Text style={styles.vestingSectionText}>
            📊 MXI aplica un rendimiento diario aproximado de <Text style={styles.vestingHighlight}>0.12%</Text>, equivalente a un <Text style={styles.vestingHighlight}>3% mensual</Text> sobre el saldo que el usuario mantiene en su wallet dentro del ecosistema.
          </Text>
          
          <Text style={styles.vestingSectionText}>
            ⚡ Este rendimiento se calcula de forma automática y se acredita diariamente en MXI adicionales.
          </Text>
          
          <View style={styles.divider} />
          
          <View style={styles.vestingImportantBox}>
            <Text style={styles.vestingImportantIcon}>⚠️</Text>
            <Text style={styles.vestingImportantText}>
              El vesting <Text style={styles.boldText}>no entrega USDT ni divisas externas</Text>; únicamente distribuye MXI programado. Esto garantiza que el mecanismo sea sostenible, no genere presión de liquidez y pueda operar a largo plazo sin afectar la estabilidad económica del proyecto.
            </Text>
          </View>
        </LinearGradient>
      </View>

      {/* Fórmula utilizada */}
      <View style={[commonStyles.card, styles.vestingFormulaCard]}>
        <LinearGradient
          colors={['#2196F3' + '15', '#03A9F4' + '15']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.vestingFormulaGradient}
        >
          <View style={styles.vestingFormulaHeader}>
            <Text style={styles.vestingFormulaEmoji}>📐</Text>
            <Text style={styles.vestingFormulaTitle}>Fórmula utilizada</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.vestingFormulaBox}>
            <Text style={styles.vestingFormulaLabel}>Rendimiento diario estimado:</Text>
            <Text style={styles.vestingFormulaEquation}>Saldo MXI × 0.0012 (0.12% diario)</Text>
          </View>
          
          <View style={styles.vestingFormulaBox}>
            <Text style={styles.vestingFormulaLabel}>Rendimiento mensual estimado:</Text>
            <Text style={styles.vestingFormulaEquation}>Saldo MXI × 0.03 (3% mensual)</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Ejemplo práctico */}
      <View style={[commonStyles.card, styles.vestingExampleCard]}>
        <LinearGradient
          colors={['#FF9800' + '15', '#FF5722' + '15']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.vestingExampleGradient}
        >
          <View style={styles.vestingExampleHeader}>
            <Text style={styles.vestingExampleEmoji}>💡</Text>
            <Text style={styles.vestingExampleTitle}>Ejemplo práctico</Text>
          </View>
          
          <View style={styles.divider} />
          
          <Text style={styles.vestingExampleText}>
            Si un usuario adquiere <Text style={styles.vestingHighlight}>500 MXI</Text> en preventa, el sistema aplicará un crecimiento automático de 3% mensual:
          </Text>
          
          <View style={styles.vestingCalculationBox}>
            <Text style={styles.vestingCalculationText}>500 MXI × 0.03 = <Text style={styles.vestingHighlight}>15 MXI mensuales</Text></Text>
          </View>
          
          <View style={styles.divider} />
          
          <Text style={styles.vestingExampleSubtitle}>En 6 meses:</Text>
          
          <View style={styles.vestingCalculationBox}>
            <Text style={styles.vestingCalculationText}>500 MXI × 0.18 = <Text style={styles.vestingHighlight}>90 MXI adicionales</Text></Text>
          </View>
          
          <View style={styles.vestingResultBox}>
            <Text style={styles.vestingResultLabel}>Saldo total después de 6 meses:</Text>
            <Text style={styles.vestingResultValue}>590 MXI</Text>
          </View>
          
          <View style={styles.divider} />
          
          <Text style={styles.vestingExampleNote}>
            ✨ Este incremento se obtiene únicamente por mantener los MXI dentro del ecosistema, <Text style={styles.boldText}>sin bloquearlos</Text> y <Text style={styles.boldText}>sin necesidad de realizar acciones adicionales</Text>.
          </Text>
        </LinearGradient>
      </View>

      {/* Beneficio adicional con valorización */}
      <View style={[commonStyles.card, styles.vestingBenefitCard]}>
        <LinearGradient
          colors={['#9C27B0' + '15', '#7B1FA2' + '15']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.vestingBenefitGradient}
        >
          <View style={styles.vestingBenefitHeader}>
            <Text style={styles.vestingBenefitEmoji}>🚀</Text>
            <Text style={styles.vestingBenefitTitle}>Beneficio adicional con valorización</Text>
          </View>
          
          <View style={styles.divider} />
          
          <Text style={styles.vestingBenefitText}>
            📈 El vesting genera crecimiento en <Text style={styles.boldText}>cantidad de MXI</Text>. Si el precio aumenta después del lanzamiento, el rendimiento acumulado potencia el valor final.
          </Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.vestingProjectionTitle}>Ejemplo con valorización proyectada:</Text>
          <Text style={styles.vestingProjectionSubtitle}>
            Precio estimado del token post lanzamiento: <Text style={styles.vestingHighlight}>3 a 6 USDT</Text>
          </Text>
          
          <View style={styles.vestingProjectionBox}>
            <Text style={styles.vestingProjectionLabel}>Saldo con vesting (590 MXI):</Text>
            
            <View style={styles.vestingProjectionRow}>
              <View style={styles.vestingProjectionItem}>
                <Text style={styles.vestingProjectionPrice}>A 3 USDT:</Text>
                <Text style={styles.vestingProjectionValue}>1,770 USDT</Text>
              </View>
              
              <View style={styles.vestingProjectionDivider} />
              
              <View style={styles.vestingProjectionItem}>
                <Text style={styles.vestingProjectionPrice}>A 6 USDT:</Text>
                <Text style={styles.vestingProjectionValue}>3,540 USDT</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Key Benefits Section */}
      <View style={styles.vestingBenefitsSection}>
        <Text style={styles.sectionTitle}>✨ Beneficios Clave del Vesting</Text>
        
        <View style={[commonStyles.card, styles.vestingBenefitItemCard]}>
          <View style={styles.vestingBenefitItemRow}>
            <Text style={styles.vestingBenefitItemEmoji}>💰</Text>
            <View style={styles.vestingBenefitItemContent}>
              <Text style={styles.vestingBenefitItemTitle}>Crecimiento Automático</Text>
              <Text style={styles.vestingBenefitItemDescription}>
                Tu saldo crece diariamente sin necesidad de hacer nada
              </Text>
            </View>
          </View>
        </View>

        <View style={[commonStyles.card, styles.vestingBenefitItemCard]}>
          <View style={styles.vestingBenefitItemRow}>
            <Text style={styles.vestingBenefitItemEmoji}>🔓</Text>
            <View style={styles.vestingBenefitItemContent}>
              <Text style={styles.vestingBenefitItemTitle}>Sin Bloqueo</Text>
              <Text style={styles.vestingBenefitItemDescription}>
                Tus MXI no están bloqueados, mantienes el control total
              </Text>
            </View>
          </View>
        </View>

        <View style={[commonStyles.card, styles.vestingBenefitItemCard]}>
          <View style={styles.vestingBenefitItemRow}>
            <Text style={styles.vestingBenefitItemEmoji}>♻️</Text>
            <View style={styles.vestingBenefitItemContent}>
              <Text style={styles.vestingBenefitItemTitle}>Sostenible</Text>
              <Text style={styles.vestingBenefitItemDescription}>
                No afecta la liquidez del proyecto, solo distribuye MXI programado
              </Text>
            </View>
          </View>
        </View>

        <View style={[commonStyles.card, styles.vestingBenefitItemCard]}>
          <View style={styles.vestingBenefitItemRow}>
            <Text style={styles.vestingBenefitItemEmoji}>📈</Text>
            <View style={styles.vestingBenefitItemContent}>
              <Text style={styles.vestingBenefitItemTitle}>Potencial de Valorización</Text>
              <Text style={styles.vestingBenefitItemDescription}>
                El aumento del precio del token multiplica tus ganancias
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Final CTA */}
      <View style={[commonStyles.card, styles.vestingFinalCard]}>
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.vestingFinalGradient}
        >
          <Text style={styles.vestingFinalEmoji}>💎</Text>
          <Text style={styles.vestingFinalTitle}>Comienza a generar rendimientos hoy</Text>
          <Text style={styles.vestingFinalText}>
            Únete a la preventa de MAXCOIN y activa tu vesting diario automático desde el primer día
          </Text>
          
          <View style={styles.urgencyDivider} />
          
          <View style={styles.vestingFinalStats}>
            <View style={styles.vestingFinalStatItem}>
              <Text style={styles.vestingFinalStatValue}>0.12%</Text>
              <Text style={styles.vestingFinalStatLabel}>Diario</Text>
            </View>
            <View style={styles.vestingFinalStatDivider} />
            <View style={styles.vestingFinalStatItem}>
              <Text style={styles.vestingFinalStatValue}>3%</Text>
              <Text style={styles.vestingFinalStatLabel}>Mensual</Text>
            </View>
            <View style={styles.vestingFinalStatDivider} />
            <View style={styles.vestingFinalStatItem}>
              <Text style={styles.vestingFinalStatValue}>36%</Text>
              <Text style={styles.vestingFinalStatLabel}>Anual</Text>
            </View>
          </View>
          
          <View style={styles.urgencyDivider} />
          
          <Text style={styles.vestingFinalHighlight}>
            🚀 Cuanto antes entres, más MXI acumularás
          </Text>
        </LinearGradient>
      </View>
    </ScrollView>
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
  tabContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 150,
  },
  activeTab: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '700',
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
  whyBuyIntro: {
    fontSize: 19,
    color: colors.text,
    lineHeight: 30,
    marginBottom: 8,
    textAlign: 'center',
  },
  ecosistemaIntro: {
    fontSize: 18,
    color: colors.text,
    lineHeight: 28,
    marginBottom: 8,
    textAlign: 'center',
  },
  sostenibilidadIntro: {
    fontSize: 18,
    color: colors.text,
    lineHeight: 28,
    marginBottom: 8,
    textAlign: 'center',
  },
  vestingIntro: {
    fontSize: 18,
    color: colors.text,
    lineHeight: 28,
    marginBottom: 8,
    textAlign: 'center',
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
  // Why Buy Tab Styles
  factorCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 20,
  },
  factorGradient: {
    padding: 24,
  },
  factorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  factorEmoji: {
    fontSize: 48,
  },
  factorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  factorContent: {
    gap: 16,
  },
  factorDescription: {
    fontSize: 17,
    color: colors.text,
    lineHeight: 26,
    fontWeight: '500',
  },
  factorHighlight: {
    fontWeight: '700',
    color: colors.primary,
  },
  factorDetails: {
    gap: 12,
  },
  factorDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  factorDetailIcon: {
    fontSize: 18,
    color: colors.primary,
  },
  factorDetailText: {
    fontSize: 15,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 22,
  },
  movementCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 24,
  },
  movementGradient: {
    padding: 28,
    alignItems: 'center',
  },
  movementEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  movementTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  movementText: {
    fontSize: 17,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 8,
  },
  movementHighlight: {
    fontWeight: '700',
    color: colors.primary,
  },
  movementSubtext: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  comparisonSection: {
    marginBottom: 24,
  },
  comparisonCard: {
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B6B',
  },
  comparisonCardPositive: {
    borderLeftColor: '#4CAF50',
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  comparisonIcon: {
    fontSize: 32,
  },
  comparisonContent: {
    flex: 1,
  },
  comparisonLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  comparisonText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  urgencyCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 24,
  },
  urgencyGradient: {
    padding: 28,
    alignItems: 'center',
  },
  urgencyEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  urgencyTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  urgencyDivider: {
    height: 1,
    backgroundColor: '#FFF',
    marginVertical: 16,
    opacity: 0.3,
    width: '100%',
  },
  urgencyText: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 8,
    fontWeight: '500',
  },
  urgencyHighlight: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 28,
  },
  benefitsSection: {
    marginBottom: 24,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  benefitCard: {
    width: (width - 52) / 2,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
  },
  benefitCardEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  benefitCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  benefitCardText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  finalWhyBuyCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 24,
  },
  finalWhyBuyGradient: {
    padding: 32,
    alignItems: 'center',
  },
  finalWhyBuyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  finalWhyBuyTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  finalWhyBuyText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 26,
    fontWeight: '500',
  },
  finalWhyBuyStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 20,
  },
  whyBuyStatItem: {
    alignItems: 'center',
  },
  whyBuyStatIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  whyBuyStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  whyBuyStatLabel: {
    fontSize: 11,
    color: '#000',
    fontWeight: '600',
  },
  whyBuyStatDivider: {
    width: 1,
    height: 60,
    backgroundColor: '#000',
    opacity: 0.3,
  },
  finalWhyBuyUrgency: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
  },
  // META Tab Styles
  metaGoalCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 24,
  },
  metaGoalGradient: {
    padding: 28,
    alignItems: 'center',
  },
  metaGoalEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  metaGoalTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  metaGoalText: {
    fontSize: 17,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 28,
  },
  metaVisionCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 24,
  },
  metaVisionGradient: {
    padding: 28,
  },
  metaVisionEmoji: {
    fontSize: 56,
    marginBottom: 16,
    textAlign: 'center',
  },
  metaVisionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  metaVisionText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 26,
    marginBottom: 16,
  },
  metaToolsList: {
    gap: 12,
    marginTop: 8,
  },
  metaToolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  metaToolIcon: {
    fontSize: 28,
  },
  metaToolText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  metaProjectionCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 24,
  },
  metaProjectionGradient: {
    padding: 28,
  },
  metaProjectionEmoji: {
    fontSize: 56,
    marginBottom: 16,
    textAlign: 'center',
  },
  metaProjectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  metaProjectionStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  metaProjectionStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  metaProjectionStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 6,
  },
  metaProjectionStatLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  metaProjectionStatEmoji: {
    fontSize: 32,
  },
  metaProjectionArrow: {
    paddingHorizontal: 16,
  },
  metaProjectionArrowText: {
    fontSize: 32,
    color: colors.primary,
    fontWeight: '700',
  },
  metaProjectionFeatures: {
    gap: 12,
  },
  metaProjectionFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaProjectionFeatureIcon: {
    fontSize: 20,
    color: colors.primary,
  },
  metaProjectionFeatureText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  metaSharedGoalCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 24,
  },
  metaSharedGoalGradient: {
    padding: 28,
  },
  metaSharedGoalEmoji: {
    fontSize: 56,
    marginBottom: 16,
    textAlign: 'center',
  },
  metaSharedGoalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  metaSharedGoalText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 26,
    marginBottom: 16,
    textAlign: 'center',
  },
  metaSharedGoalHighlight: {
    backgroundColor: colors.primary + '15',
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
    alignItems: 'center',
  },
  metaSharedGoalQuoteIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  metaSharedGoalQuote: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    lineHeight: 28,
    fontStyle: 'italic',
  },
  metaPillarsSection: {
    marginBottom: 24,
  },
  metaPillarCard: {
    padding: 16,
    marginBottom: 12,
  },
  metaPillarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  metaPillarEmoji: {
    fontSize: 40,
  },
  metaPillarContent: {
    flex: 1,
  },
  metaPillarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  metaPillarDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  metaImpactSection: {
    marginBottom: 24,
  },
  metaImpactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaImpactCard: {
    width: (width - 52) / 2,
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 12,
  },
  metaImpactEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  metaImpactValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 6,
  },
  metaImpactLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  metaFinalCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 24,
  },
  metaFinalGradient: {
    padding: 32,
    alignItems: 'center',
  },
  metaFinalEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  metaFinalTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  metaFinalText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '500',
  },
  metaFinalHighlight: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
  },
  // Ecosistema Tab Styles
  ecosistemaPhaseCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 24,
  },
  ecosistemaPhaseGradient: {
    padding: 24,
  },
  ecosistemaPhaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  ecosistemaPhaseNumber: {
    fontSize: 48,
  },
  ecosistemaPhaseTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    lineHeight: 30,
  },
  ecosistemaPhaseText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 26,
    marginBottom: 12,
  },
  ecosistemaPhaseHighlight: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primary,
    lineHeight: 26,
    marginBottom: 12,
  },
  ecosistemaPhaseFooter: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    lineHeight: 26,
    textAlign: 'center',
  },
  ecosistemaBenefitsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  ecosistemaBenefitsList: {
    gap: 12,
  },
  ecosistemaBenefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  ecosistemaBenefitIcon: {
    fontSize: 20,
    color: colors.primary,
    marginTop: 2,
  },
  ecosistemaBenefitText: {
    fontSize: 15,
    color: colors.text,
    flex: 1,
    lineHeight: 24,
  },
  ecosistemaModulesList: {
    gap: 16,
    marginTop: 8,
  },
  ecosistemaModuleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    backgroundColor: colors.background + '40',
    padding: 16,
    borderRadius: 12,
  },
  ecosistemaModuleIcon: {
    fontSize: 32,
  },
  ecosistemaModuleContent: {
    flex: 1,
  },
  ecosistemaModuleTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  ecosistemaModuleDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  ecosistemaExpansionList: {
    gap: 12,
    marginTop: 8,
  },
  ecosistemaExpansionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  ecosistemaExpansionIcon: {
    fontSize: 24,
    marginTop: 2,
  },
  ecosistemaExpansionText: {
    fontSize: 15,
    color: colors.text,
    flex: 1,
    lineHeight: 24,
  },
  ecosistemaSustainabilityCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 24,
  },
  ecosistemaSustainabilityGradient: {
    padding: 24,
  },
  ecosistemaSustainabilityHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  ecosistemaSustainabilityEmoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  ecosistemaSustainabilityTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  ecosistemaSustainabilityText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  ecosistemaSustainabilityList: {
    gap: 12,
  },
  ecosistemaSustainabilityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  ecosistemaSustainabilityIcon: {
    fontSize: 20,
    color: colors.primary,
    marginTop: 2,
  },
  ecosistemaSustainabilityItem: {
    fontSize: 15,
    color: colors.text,
    flex: 1,
    lineHeight: 24,
  },
  ecosistemaSustainabilityHighlight: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    lineHeight: 28,
  },
  ecosistemaFinalCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 24,
  },
  ecosistemaFinalGradient: {
    padding: 32,
    alignItems: 'center',
  },
  ecosistemaFinalEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  ecosistemaFinalTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  ecosistemaFinalText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 12,
    fontWeight: '500',
  },
  ecosistemaFinalPoints: {
    gap: 12,
    width: '100%',
  },
  ecosistemaFinalPoint: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '600',
  },
  ecosistemaFinalCTA: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    lineHeight: 30,
  },
  // Sostenibilidad Tab Styles
  sostenibilidadSectionCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 20,
  },
  sostenibilidadSectionGradient: {
    padding: 24,
  },
  sostenibilidadSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  sostenibilidadSectionEmoji: {
    fontSize: 40,
  },
  sostenibilidadSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    lineHeight: 28,
  },
  sostenibilidadSectionText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 26,
    marginBottom: 12,
  },
  sostenibilidadSectionHighlight: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primary,
    lineHeight: 26,
  },
  sostenibilidadPointsList: {
    gap: 12,
    marginVertical: 8,
  },
  sostenibilidadPointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  sostenibilidadPointIcon: {
    fontSize: 24,
    marginTop: 2,
  },
  sostenibilidadPointText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
    lineHeight: 26,
  },
  sostenibilidadResumenCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 24,
  },
  sostenibilidadResumenGradient: {
    padding: 28,
    alignItems: 'center',
  },
  sostenibilidadResumenEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  sostenibilidadResumenTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  sostenibilidadResumenSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  sostenibilidadResumenList: {
    gap: 12,
    width: '100%',
  },
  sostenibilidadResumenRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 8,
  },
  sostenibilidadResumenIcon: {
    fontSize: 20,
    color: colors.primary,
    marginTop: 2,
  },
  sostenibilidadResumenText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
    lineHeight: 26,
  },
  sostenibilidadFinalCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 24,
  },
  sostenibilidadFinalGradient: {
    padding: 32,
    alignItems: 'center',
  },
  sostenibilidadFinalEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  sostenibilidadFinalTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  sostenibilidadFinalPoints: {
    gap: 16,
    width: '100%',
  },
  sostenibilidadFinalPoint: {
    fontSize: 17,
    color: '#000',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '600',
  },
  sostenibilidadFinalCTA: {
    fontSize: 19,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    lineHeight: 30,
  },
  // Vesting Diario Tab Styles
  vestingSectionCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 24,
  },
  vestingSectionGradient: {
    padding: 24,
  },
  vestingSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  vestingSectionEmoji: {
    fontSize: 48,
  },
  vestingSectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  vestingSectionText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 26,
    marginBottom: 12,
  },
  vestingHighlight: {
    fontWeight: '700',
    color: colors.primary,
  },
  vestingImportantBox: {
    backgroundColor: colors.primary + '10',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  vestingImportantIcon: {
    fontSize: 24,
    marginTop: 2,
  },
  vestingImportantText: {
    fontSize: 15,
    color: colors.text,
    flex: 1,
    lineHeight: 24,
  },
  vestingFormulaCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 24,
  },
  vestingFormulaGradient: {
    padding: 24,
  },
  vestingFormulaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  vestingFormulaEmoji: {
    fontSize: 48,
  },
  vestingFormulaTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  vestingFormulaBox: {
    backgroundColor: colors.background + '60',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  vestingFormulaLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  vestingFormulaEquation: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    fontFamily: 'monospace',
  },
  vestingExampleCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 24,
  },
  vestingExampleGradient: {
    padding: 24,
  },
  vestingExampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  vestingExampleEmoji: {
    fontSize: 48,
  },
  vestingExampleTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  vestingExampleText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 26,
    marginBottom: 16,
  },
  vestingExampleSubtitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  vestingCalculationBox: {
    backgroundColor: colors.background + '60',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  vestingCalculationText: {
    fontSize: 17,
    color: colors.text,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  vestingResultBox: {
    backgroundColor: colors.primary + '15',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  vestingResultLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  vestingResultValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
  },
  vestingExampleNote: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
    textAlign: 'center',
  },
  vestingBenefitCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 24,
  },
  vestingBenefitGradient: {
    padding: 24,
  },
  vestingBenefitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  vestingBenefitEmoji: {
    fontSize: 48,
  },
  vestingBenefitTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  vestingBenefitText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 26,
    marginBottom: 12,
  },
  vestingProjectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  vestingProjectionSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  vestingProjectionBox: {
    backgroundColor: colors.background + '60',
    borderRadius: 12,
    padding: 20,
  },
  vestingProjectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  vestingProjectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  vestingProjectionItem: {
    alignItems: 'center',
    flex: 1,
  },
  vestingProjectionPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  vestingProjectionValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  vestingProjectionDivider: {
    width: 1,
    height: 50,
    backgroundColor: colors.border,
    opacity: 0.5,
  },
  vestingBenefitsSection: {
    marginBottom: 24,
  },
  vestingBenefitItemCard: {
    padding: 16,
    marginBottom: 12,
  },
  vestingBenefitItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  vestingBenefitItemEmoji: {
    fontSize: 36,
  },
  vestingBenefitItemContent: {
    flex: 1,
  },
  vestingBenefitItemTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  vestingBenefitItemDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  vestingFinalCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 24,
  },
  vestingFinalGradient: {
    padding: 32,
    alignItems: 'center',
  },
  vestingFinalEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  vestingFinalTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  vestingFinalText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '500',
  },
  vestingFinalStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  vestingFinalStatItem: {
    alignItems: 'center',
  },
  vestingFinalStatValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  vestingFinalStatLabel: {
    fontSize: 12,
    color: '#000',
    fontWeight: '600',
  },
  vestingFinalStatDivider: {
    width: 1,
    height: 50,
    backgroundColor: '#000',
    opacity: 0.3,
  },
  vestingFinalHighlight: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
  },
});
