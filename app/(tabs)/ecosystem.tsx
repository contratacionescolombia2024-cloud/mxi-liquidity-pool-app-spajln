
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles } from '@/styles/commonStyles';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function EcosystemScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌐 Ecosistema MXI</Text>
        <Text style={styles.headerSubtitle}>Pool de Liquidez Maxcoin</Text>
      </View>

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
    </SafeAreaView>
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
});
