
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

type TabType = 'que-es' | 'como-funciona' | 'por-que-comprar';

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
      </ScrollView>

      {/* Tab Content */}
      {activeTab === 'que-es' && <QueEsMXITab />}
      {activeTab === 'como-funciona' && <ComoFuncionaTab />}
      {activeTab === 'por-que-comprar' && <PorQueComprarTab />}
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
});
