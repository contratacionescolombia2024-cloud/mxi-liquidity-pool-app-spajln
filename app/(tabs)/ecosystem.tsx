
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
import { useLanguage } from '@/contexts/LanguageContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

type TabType = 'que-es' | 'como-funciona' | 'por-que-comprar' | 'meta' | 'ecosistema' | 'seguridad-cuantica' | 'sostenibilidad' | 'vesting-diario' | 'en-la-practica' | 'tokenomica' | 'riesgos';

export default function EcosystemScreen() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('que-es');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('ecosystem')}</Text>
        <Text style={styles.headerSubtitle}>{t('liquidityPool')}</Text>
      </View>

      {/* Tab Navigation */}
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
              {t('whatIsMXI')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'como-funciona' && styles.activeTab]}
            onPress={() => setActiveTab('como-funciona')}
          >
            <Text style={[styles.tabText, activeTab === 'como-funciona' && styles.activeTabText]}>
              {t('howItWorksTab')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'por-que-comprar' && styles.activeTab]}
            onPress={() => setActiveTab('por-que-comprar')}
          >
            <Text style={[styles.tabText, activeTab === 'por-que-comprar' && styles.activeTabText]}>
              {t('whyBuy')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'meta' && styles.activeTab]}
            onPress={() => setActiveTab('meta')}
          >
            <Text style={[styles.tabText, activeTab === 'meta' && styles.activeTabText]}>
              {t('meta')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'ecosistema' && styles.activeTab]}
            onPress={() => setActiveTab('ecosistema')}
          >
            <Text style={[styles.tabText, activeTab === 'ecosistema' && styles.activeTabText]}>
              {t('ecosystemTab')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'seguridad-cuantica' && styles.activeTab]}
            onPress={() => setActiveTab('seguridad-cuantica')}
          >
            <Text style={[styles.tabText, activeTab === 'seguridad-cuantica' && styles.activeTabText]}>
              {t('quantumSecurity')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'sostenibilidad' && styles.activeTab]}
            onPress={() => setActiveTab('sostenibilidad')}
          >
            <Text style={[styles.tabText, activeTab === 'sostenibilidad' && styles.activeTabText]}>
              {t('sustainability')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'vesting-diario' && styles.activeTab]}
            onPress={() => setActiveTab('vesting-diario')}
          >
            <Text style={[styles.tabText, activeTab === 'vesting-diario' && styles.activeTabText]}>
              {t('dailyVesting')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'en-la-practica' && styles.activeTab]}
            onPress={() => setActiveTab('en-la-practica')}
          >
            <Text style={[styles.tabText, activeTab === 'en-la-practica' && styles.activeTabText]}>
              {t('inPractice')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'tokenomica' && styles.activeTab]}
            onPress={() => setActiveTab('tokenomica')}
          >
            <Text style={[styles.tabText, activeTab === 'tokenomica' && styles.activeTabText]}>
              {t('tokenomics')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'riesgos' && styles.activeTab]}
            onPress={() => setActiveTab('riesgos')}
          >
            <Text style={[styles.tabText, activeTab === 'riesgos' && styles.activeTabText]}>
              {t('risks')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Tab Content */}
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
        {activeTab === 'riesgos' && <RiesgosTab />}
      </ScrollView>
    </SafeAreaView>
  );
}

// ¿Qué es MXI? Tab Content - UPDATED TO USE CORRECT TRANSLATION KEYS
function QueEsMXITab() {
  const { t } = useLanguage();
  
  return (
    <View>
      {/* Main Title */}
      <View style={styles.titleSection}>
        <Text style={styles.mainTitle}>{t('whatIsMXITitle')}</Text>
      </View>

      {/* Logo Image */}
      <View style={styles.imageContainer}>
        <Image
          source={require('@/assets/images/bebe6626-b6ac-47d4-ad64-acdc0b562775.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      {/* Main Content Card - NEW CONTENT */}
      <View style={[commonStyles.card, styles.contentCard]}>
        <LinearGradient
          colors={[colors.primary + '10', colors.accent + '10']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.contentGradient}
        >
          <Text style={styles.bodyText}>
            {t('whatIsMXIIntro')}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.bodyText}>
            {t('whatIsMXIEarlyStage')}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.bodyText}>
            {t('whatIsMXIPresale')}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.emphasisText}>
            {t('whatIsMXINotJustToken')}
          </Text>
        </LinearGradient>
      </View>

      {/* How MXI Works Section - NEW CONTENT */}
      <View style={[commonStyles.card, styles.contentCard]}>
        <LinearGradient
          colors={[colors.accent + '10', colors.primary + '10']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.contentGradient}
        >
          <Text style={styles.sectionTitle}>{t('howMXIWorksTitle')}</Text>
          
          <Text style={styles.bodyText}>
            {t('howMXIWorksIntro')}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.sectionSubtitle}>{t('howMXIWorksStep1Title')}</Text>
          <Text style={styles.bodyText}>
            {t('howMXIWorksStep1Desc')}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.sectionSubtitle}>{t('howMXIWorksStep2Title')}</Text>
          <Text style={styles.bodyText}>
            {t('howMXIWorksStep2Desc')}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.sectionSubtitle}>{t('howMXIWorksStep3Title')}</Text>
          <Text style={styles.bodyText}>
            {t('howMXIWorksStep3Desc')}
          </Text>
          <Text style={styles.bodyText}>
            {t('howMXIWorksStep3Point1')}
          </Text>
          <Text style={styles.bodyText}>
            {t('howMXIWorksStep3Point2')}
          </Text>
          <Text style={styles.bodyText}>
            {t('howMXIWorksStep3Point3')}
          </Text>
          <Text style={styles.bodyText}>
            {t('howMXIWorksStep3Point4')}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.sectionSubtitle}>{t('howMXIWorksStep4Title')}</Text>
          <Text style={styles.bodyText}>
            {t('howMXIWorksStep4Desc')}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.sectionSubtitle}>{t('howMXIWorksStep5Title')}</Text>
          <Text style={styles.bodyText}>
            {t('howMXIWorksStep5Desc')}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.sectionSubtitle}>{t('howMXIWorksStep6Title')}</Text>
          <Text style={styles.bodyText}>
            {t('howMXIWorksStep6Desc')}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.emphasisText}>
            {t('howMXIWorksConclusion')}
          </Text>
        </LinearGradient>
      </View>
    </View>
  );
}

// Cómo Funciona Tab Content
function ComoFuncionaTab() {
  const { t } = useLanguage();
  
  return (
    <View>
      <View style={styles.titleSection}>
        <Text style={styles.mainTitle}>{t('howItWorksTitle')}</Text>
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={require('@/assets/images/76715c1f-8b5b-4e0a-8692-d6d7963a0d99.png')}
          style={styles.heroImage}
          resizeMode="contain"
        />
      </View>

      <View style={[commonStyles.card, styles.contentCard]}>
        <LinearGradient
          colors={[colors.primary + '10', colors.accent + '10']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.contentGradient}
        >
          <Text style={styles.bodyText}>
            {t('howItWorksIntro')}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.sectionSubtitle}>{t('step1Title')}</Text>
          <Text style={styles.bodyText}>
            {t('step1Description')}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.sectionSubtitle}>{t('step2Title')}</Text>
          <Text style={styles.bodyText}>
            {t('step2Description')}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.sectionSubtitle}>{t('step3Title')}</Text>
          <Text style={styles.bodyText}>
            {t('step3Description')}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.sectionSubtitle}>{t('step4Title')}</Text>
          <Text style={styles.bodyText}>
            {t('step4Description')}
          </Text>
        </LinearGradient>
      </View>

      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>{t('keyBenefits')}</Text>
        
        <View style={[commonStyles.card, styles.valueCard]}>
          <Text style={styles.valueEmoji}>⚡</Text>
          <View style={styles.valueContent}>
            <Text style={styles.valueTitle}>{t('instantTransactions')}</Text>
            <Text style={styles.valueDescription}>
              {t('instantTransactionsDesc')}
            </Text>
          </View>
        </View>

        <View style={[commonStyles.card, styles.valueCard]}>
          <Text style={styles.valueEmoji}>🔒</Text>
          <View style={styles.valueContent}>
            <Text style={styles.valueTitle}>{t('maximumSecurity')}</Text>
            <Text style={styles.valueDescription}>
              {t('maximumSecurityDesc')}
            </Text>
          </View>
        </View>

        <View style={[commonStyles.card, styles.valueCard]}>
          <Text style={styles.valueEmoji}>🌐</Text>
          <View style={styles.valueContent}>
            <Text style={styles.valueTitle}>{t('globalAccess')}</Text>
            <Text style={styles.valueDescription}>
              {t('globalAccessDesc')}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// Por Qué Comprar Tab Content - Image 0 (cd6409f5) - UPDATED CONTENT
function PorQueComprarTab() {
  const { t } = useLanguage();
  
  return (
    <View>
      <View style={styles.titleSection}>
        <Text style={styles.mainTitle}>{t('whyBuyTitle')}</Text>
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={require('@/assets/images/cd6409f5-2e6e-426b-9399-35c34f154df7.png')}
          style={styles.whyBuyImage}
          resizeMode="contain"
        />
      </View>

      <View style={[commonStyles.card, styles.contentCard]}>
        <LinearGradient
          colors={[colors.primary + '10', colors.accent + '10']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.contentGradient}
        >
          <Text style={styles.bodyText}>
            {t('whyBuyIntro')}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.emphasisText}>
            {t('whyBuyReason1')}
          </Text>
          <Text style={styles.bodyText}>
            {t('whyBuyReason1Desc')}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.emphasisText}>
            {t('whyBuyReason2')}
          </Text>
          <Text style={styles.bodyText}>
            {t('whyBuyReason2Desc')}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.emphasisText}>
            {t('whyBuyReason3')}
          </Text>
          <Text style={styles.bodyText}>
            {t('whyBuyReason3Desc')}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.emphasisText}>
            {t('whyBuyReason4')}
          </Text>
          <Text style={styles.bodyText}>
            {t('whyBuyReason4Desc')}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.emphasisText}>
            {t('whyBuyReason5')}
          </Text>
          <Text style={styles.bodyText}>
            {t('whyBuyReason5Desc')}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.emphasisText}>
            {t('whyBuyReason6')}
          </Text>
          <Text style={styles.bodyText}>
            {t('whyBuyReason6Desc')}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.emphasisText}>
            {t('whyBuyReason7')}
          </Text>
          <Text style={styles.bodyText}>
            {t('whyBuyReason7Desc')}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.emphasisText}>
            {t('whyBuyConclusion')}
          </Text>
        </LinearGradient>
      </View>

      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>{t('investmentAdvantages')}</Text>
        
        <View style={styles.featuresGrid}>
          <View style={[commonStyles.card, styles.featureCard]}>
            <Text style={styles.featureEmoji}>📈</Text>
            <Text style={styles.featureTitle}>{t('growthPotential')}</Text>
            <Text style={styles.featureDescription}>{t('growthPotentialDesc')}</Text>
          </View>

          <View style={[commonStyles.card, styles.featureCard]}>
            <Text style={styles.featureEmoji}>💎</Text>
            <Text style={styles.featureTitle}>{t('limitedSupply')}</Text>
            <Text style={styles.featureDescription}>{t('limitedSupplyDesc')}</Text>
          </View>

          <View style={[commonStyles.card, styles.featureCard]}>
            <Text style={styles.featureEmoji}>🎯</Text>
            <Text style={styles.featureTitle}>{t('realUtility')}</Text>
            <Text style={styles.featureDescription}>{t('realUtilityDesc')}</Text>
          </View>

          <View style={[commonStyles.card, styles.featureCard]}>
            <Text style={styles.featureEmoji}>🌍</Text>
            <Text style={styles.featureTitle}>{t('globalCommunity')}</Text>
            <Text style={styles.featureDescription}>{t('globalCommunityDesc')}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// Meta Tab Content - UPDATED WITH NEW CONTENT
function MetaTab() {
  const { t } = useLanguage();
  
  return (
    <View>
      <View style={styles.titleSection}>
        <Text style={styles.mainTitle}>{t('metaTitle')}</Text>
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={require('@/assets/images/b359a5d1-671d-4f57-a54c-219337b62602.png')}
          style={styles.metaImage}
          resizeMode="contain"
        />
      </View>

      {/* Introduction */}
      <View style={[commonStyles.card, styles.contentCard]}>
        <LinearGradient
          colors={[colors.primary + '15', colors.accent + '15']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.contentGradient}
        >
          <Text style={styles.bodyText}>
            {t('metaIntro')}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.bodyText}>
            {t('metaPurpose')}
          </Text>
        </LinearGradient>
      </View>

      {/* Vision and Solutions */}
      <View style={[commonStyles.card, styles.contentCard]}>
        <LinearGradient
          colors={[colors.accent + '15', colors.primary + '15']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.contentGradient}
        >
          <Text style={styles.emphasisText}>
            {t('metaVision')}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.bodyText}>
            {t('metaSolutions')}
          </Text>
          <Text style={styles.bodyText}>
            {t('metaSolution1')}
          </Text>
          <Text style={styles.bodyText}>
            {t('metaSolution2')}
          </Text>
          <Text style={styles.bodyText}>
            {t('metaSolution3')}
          </Text>
          <Text style={styles.bodyText}>
            {t('metaSolution4')}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.emphasisText}>
            {t('metaGrowth')}
          </Text>
        </LinearGradient>
      </View>

      {/* Economic Model and Technology */}
      <View style={[commonStyles.card, styles.contentCard]}>
        <LinearGradient
          colors={[colors.primary + '15', colors.accent + '15']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.contentGradient}
        >
          <Text style={styles.bodyText}>
            {t('metaEconomicModel')}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.bodyText}>
            {t('metaTechnology')}
          </Text>
        </LinearGradient>
      </View>

      {/* Final Goals */}
      <View style={[commonStyles.card, styles.contentCard]}>
        <LinearGradient
          colors={[colors.accent + '15', colors.primary + '15']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.contentGradient}
        >
          <Text style={styles.emphasisText}>
            {t('metaFinalGoal')}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.bodyText}>
            {t('metaGoal1')}
          </Text>
          <Text style={styles.bodyText}>
            {t('metaGoal2')}
          </Text>
          <Text style={styles.bodyText}>
            {t('metaGoal3')}
          </Text>
        </LinearGradient>
      </View>

      {/* Conclusion */}
      <View style={[commonStyles.card, styles.visionCard]}>
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.visionGradient}
        >
          <Text style={styles.visionEmoji}>✨</Text>
          <Text style={styles.ctaTitle}>{t('metaConclusion')}</Text>
          <Text style={styles.ctaText}>
            {t('metaTransformation')}
          </Text>
        </LinearGradient>
      </View>
    </View>
  );
}

// Ecosistema Tab Content - UPDATED WITH NEW CONTENT
function EcosistemaTab() {
  const { t } = useLanguage();
  
  return (
    <View>
      <View style={styles.titleSection}>
        <Text style={styles.mainTitle}>{t('ecosystemTitle')}</Text>
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={require('@/assets/images/76b95e25-0844-42d7-915d-4be1ebdeb915.png')}
          style={styles.ecosistemaImage}
          resizeMode="contain"
        />
      </View>

      {/* Introduction */}
      <View style={[commonStyles.card, styles.contentCard]}>
        <LinearGradient
          colors={[colors.primary + '10', colors.accent + '10']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.contentGradient}
        >
          <Text style={styles.bodyText}>
            {t('ecosystemIntro')}
          </Text>
        </LinearGradient>
      </View>

      {/* Phase 1: Presale */}
      <View style={[commonStyles.card, styles.contentCard]}>
        <LinearGradient
          colors={[colors.primary + '15', colors.accent + '15']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.contentGradient}
        >
          <Text style={styles.sectionSubtitle}>{t('ecosystemPhase1Title')}</Text>
          <Text style={styles.bodyText}>{t('ecosystemPhase1Intro')}</Text>
          
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>{t('ecosystemPhase1Point1')}</Text>
            <Text style={styles.bulletPoint}>{t('ecosystemPhase1Point2')}</Text>
            <Text style={styles.bulletPoint}>{t('ecosystemPhase1Point3')}</Text>
            <Text style={styles.bulletPoint}>{t('ecosystemPhase1Point4')}</Text>
          </View>

          <Text style={styles.emphasisText}>{t('ecosystemPhase1Conclusion')}</Text>
        </LinearGradient>
      </View>

      {/* Phase 2: Token Launch */}
      <View style={[commonStyles.card, styles.contentCard]}>
        <LinearGradient
          colors={[colors.accent + '15', colors.primary + '15']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.contentGradient}
        >
          <Text style={styles.sectionSubtitle}>{t('ecosystemPhase2Title')}</Text>
          <Text style={styles.bodyText}>{t('ecosystemPhase2Intro')}</Text>
          
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>{t('ecosystemPhase2Point1')}</Text>
            <Text style={styles.bulletPoint}>{t('ecosystemPhase2Point2')}</Text>
            <Text style={styles.bulletPoint}>{t('ecosystemPhase2Point3')}</Text>
            <Text style={styles.bulletPoint}>{t('ecosystemPhase2Point4')}</Text>
          </View>

          <Text style={styles.emphasisText}>{t('ecosystemPhase2Conclusion')}</Text>
        </LinearGradient>
      </View>

      {/* Phase 3: Global Expansion */}
      <View style={[commonStyles.card, styles.contentCard]}>
        <LinearGradient
          colors={[colors.primary + '15', colors.accent + '15']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.contentGradient}
        >
          <Text style={styles.sectionSubtitle}>{t('ecosystemPhase3Title')}</Text>
          <Text style={styles.bodyText}>{t('ecosystemPhase3Intro')}</Text>
          
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>{t('ecosystemPhase3Point1')}</Text>
            <Text style={styles.bulletPoint}>{t('ecosystemPhase3Point2')}</Text>
            <Text style={styles.bulletPoint}>{t('ecosystemPhase3Point3')}</Text>
            <Text style={styles.bulletPoint}>{t('ecosystemPhase3Point4')}</Text>
          </View>

          <Text style={styles.emphasisText}>{t('ecosystemPhase3Conclusion')}</Text>
        </LinearGradient>
      </View>

      {/* MXI Stores */}
      <View style={[commonStyles.card, styles.contentCard]}>
        <LinearGradient
          colors={[colors.accent + '15', colors.primary + '15']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.contentGradient}
        >
          <Text style={styles.sectionSubtitle}>{t('ecosystemStoresTitle')}</Text>
          <Text style={styles.bodyText}>{t('ecosystemStoresIntro')}</Text>
          
          <Text style={styles.bodyText}>{t('ecosystemStoresIncludes')}</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>{t('ecosystemStoresType1')}</Text>
            <Text style={styles.bulletPoint}>{t('ecosystemStoresType2')}</Text>
            <Text style={styles.bulletPoint}>{t('ecosystemStoresType3')}</Text>
            <Text style={styles.bulletPoint}>{t('ecosystemStoresType4')}</Text>
            <Text style={styles.bulletPoint}>{t('ecosystemStoresType5')}</Text>
          </View>

          <Text style={styles.bodyText}>{t('ecosystemStoresBenefitsTitle')}</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>{t('ecosystemStoresBenefit1')}</Text>
            <Text style={styles.bulletPoint}>{t('ecosystemStoresBenefit2')}</Text>
            <Text style={styles.bulletPoint}>{t('ecosystemStoresBenefit3')}</Text>
            <Text style={styles.bulletPoint}>{t('ecosystemStoresBenefit4')}</Text>
          </View>

          <Text style={styles.emphasisText}>{t('ecosystemStoresConclusion')}</Text>
        </LinearGradient>
      </View>

      {/* MXI Loan */}
      <View style={[commonStyles.card, styles.contentCard]}>
        <LinearGradient
          colors={[colors.primary + '15', colors.accent + '15']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.contentGradient}
        >
          <Text style={styles.sectionSubtitle}>{t('ecosystemLoanTitle')}</Text>
          <Text style={styles.bodyText}>{t('ecosystemLoanIntro')}</Text>
          
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>{t('ecosystemLoanFeature1')}</Text>
            <Text style={styles.bulletPoint}>{t('ecosystemLoanFeature2')}</Text>
            <Text style={styles.bulletPoint}>{t('ecosystemLoanFeature3')}</Text>
            <Text style={styles.bulletPoint}>{t('ecosystemLoanFeature4')}</Text>
          </View>

          <Text style={styles.bodyText}>{t('ecosystemLoanBenefit')}</Text>
          <Text style={styles.emphasisText}>{t('ecosystemLoanConclusion')}</Text>
        </LinearGradient>
      </View>

      {/* Importance for Latin America */}
      <View style={[commonStyles.card, styles.contentCard]}>
        <LinearGradient
          colors={[colors.accent + '15', colors.primary + '15']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.contentGradient}
        >
          <Text style={styles.sectionSubtitle}>{t('ecosystemLatamTitle')}</Text>
          <Text style={styles.bodyText}>{t('ecosystemLatamIntro')}</Text>
          
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>{t('ecosystemLatamNeed1')}</Text>
            <Text style={styles.bulletPoint}>{t('ecosystemLatamNeed2')}</Text>
            <Text style={styles.bulletPoint}>{t('ecosystemLatamNeed3')}</Text>
            <Text style={styles.bulletPoint}>{t('ecosystemLatamNeed4')}</Text>
            <Text style={styles.bulletPoint}>{t('ecosystemLatamNeed5')}</Text>
          </View>

          <Text style={styles.emphasisText}>{t('ecosystemLatamConclusion')}</Text>
        </LinearGradient>
      </View>

      {/* Competition */}
      <View style={[commonStyles.card, styles.visionCard]}>
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.visionGradient}
        >
          <Text style={styles.visionEmoji}>🥇</Text>
          <Text style={styles.ctaTitle}>{t('ecosystemCompetitionTitle')}</Text>
          <Text style={styles.ctaText}>{t('ecosystemCompetitionIntro')}</Text>
          
          <View style={styles.bulletListLight}>
            <Text style={styles.bulletPointLight}>{t('ecosystemCompetitionFeature1')}</Text>
            <Text style={styles.bulletPointLight}>{t('ecosystemCompetitionFeature2')}</Text>
            <Text style={styles.bulletPointLight}>{t('ecosystemCompetitionFeature3')}</Text>
            <Text style={styles.bulletPointLight}>{t('ecosystemCompetitionFeature4')}</Text>
            <Text style={styles.bulletPointLight}>{t('ecosystemCompetitionFeature5')}</Text>
            <Text style={styles.bulletPointLight}>{t('ecosystemCompetitionFeature6')}</Text>
            <Text style={styles.bulletPointLight}>{t('ecosystemCompetitionFeature7')}</Text>
            <Text style={styles.bulletPointLight}>{t('ecosystemCompetitionFeature8')}</Text>
          </View>

          <Text style={styles.ctaSubtext}>{t('ecosystemCompetitionConclusion')}</Text>
        </LinearGradient>
      </View>
    </View>
  );
}

// Seguridad Cuántica Tab Content - Image 3 (67cb31d5)
function SeguridadCuanticaTab() {
  const { t } = useLanguage();
  
  return (
    <View>
      <View style={styles.titleSection}>
        <Text style={styles.mainTitle}>{t('quantumSecurityTitle')}</Text>
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={require('@/assets/images/67cb31d5-9f16-4fe6-a660-8507d6b8e4bb.png')}
          style={styles.seguridadCuanticaImage}
          resizeMode="contain"
        />
      </View>

      <View style={[commonStyles.card, styles.contentCard]}>
        <LinearGradient
          colors={[colors.primary + '10', colors.accent + '10']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.contentGradient}
        >
          <Text style={styles.bodyText}>
            {t('quantumSecurityIntro')}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.sectionSubtitle}>{t('quantumThreat')}</Text>
          <Text style={styles.bodyText}>
            {t('quantumThreatDesc')}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.sectionSubtitle}>{t('ourSolution')}</Text>
          <Text style={styles.bodyText}>
            {t('ourSolutionDesc')}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.sectionSubtitle}>{t('futureProof')}</Text>
          <Text style={styles.bodyText}>
            {t('futureProofDesc')}
          </Text>
        </LinearGradient>
      </View>

      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>{t('securityFeatures')}</Text>
        
        <View style={styles.featuresGrid}>
          <View style={[commonStyles.card, styles.featureCard]}>
            <Text style={styles.featureEmoji}>🔐</Text>
            <Text style={styles.featureTitle}>{t('advancedEncryption')}</Text>
            <Text style={styles.featureDescription}>{t('advancedEncryptionDesc')}</Text>
          </View>

          <View style={[commonStyles.card, styles.featureCard]}>
            <Text style={styles.featureEmoji}>🛡️</Text>
            <Text style={styles.featureTitle}>{t('multiLayerProtection')}</Text>
            <Text style={styles.featureDescription}>{t('multiLayerProtectionDesc')}</Text>
          </View>

          <View style={[commonStyles.card, styles.featureCard]}>
            <Text style={styles.featureEmoji}>🔬</Text>
            <Text style={styles.featureTitle}>{t('constantResearch')}</Text>
            <Text style={styles.featureDescription}>{t('constantResearchDesc')}</Text>
          </View>

          <View style={[commonStyles.card, styles.featureCard]}>
            <Text style={styles.featureEmoji}>✅</Text>
            <Text style={styles.featureTitle}>{t('regularAudits')}</Text>
            <Text style={styles.featureDescription}>{t('regularAuditsDesc')}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// Sostenibilidad Tab Content - NEW IMAGE ADDED (73b7a6c0)
function SostenibilidadTab() {
  const { t } = useLanguage();
  
  return (
    <View>
      <View style={styles.titleSection}>
        <Text style={styles.mainTitle}>{t('sustainabilityTitle')}</Text>
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={require('@/assets/images/73b7a6c0-a56f-4c91-8ab9-2ec0cd607287.png')}
          style={styles.sostenibilidadImage}
          resizeMode="contain"
        />
      </View>

      <View style={[commonStyles.card, styles.contentCard]}>
        <LinearGradient
          colors={[colors.primary + '10', colors.accent + '10']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.contentGradient}
        >
          <Text style={styles.bodyText}>
            {t('sustainabilityIntro')}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.sectionSubtitle}>{t('ecoFriendly')}</Text>
          <Text style={styles.bodyText}>
            {t('ecoFriendlyDesc')}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.sectionSubtitle}>{t('energyEfficiency')}</Text>
          <Text style={styles.bodyText}>
            {t('energyEfficiencyDesc')}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.sectionSubtitle}>{t('carbonNeutral')}</Text>
          <Text style={styles.bodyText}>
            {t('carbonNeutralDesc')}
          </Text>
        </LinearGradient>
      </View>

      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>{t('sustainabilityCommitments')}</Text>
        
        <View style={[commonStyles.card, styles.valueCard]}>
          <Text style={styles.valueEmoji}>🌱</Text>
          <View style={styles.valueContent}>
            <Text style={styles.valueTitle}>{t('greenMining')}</Text>
            <Text style={styles.valueDescription}>
              {t('greenMiningDesc')}
            </Text>
          </View>
        </View>

        <View style={[commonStyles.card, styles.valueCard]}>
          <Text style={styles.valueEmoji}>♻️</Text>
          <View style={styles.valueContent}>
            <Text style={styles.valueTitle}>{t('renewableEnergy')}</Text>
            <Text style={styles.valueDescription}>
              {t('renewableEnergyDesc')}
            </Text>
          </View>
        </View>

        <View style={[commonStyles.card, styles.valueCard]}>
          <Text style={styles.valueEmoji}>🌍</Text>
          <View style={styles.valueContent}>
            <Text style={styles.valueTitle}>{t('environmentalImpact')}</Text>
            <Text style={styles.valueDescription}>
              {t('environmentalImpactDesc')}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// Vesting Diario Tab Content - Image 4 (0bb04517)
function VestingDiarioTab() {
  const { t } = useLanguage();
  
  return (
    <View>
      <View style={styles.titleSection}>
        <Text style={styles.mainTitle}>{t('dailyVestingTitle')}</Text>
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={require('@/assets/images/0bb04517-a07a-45a8-bb08-aaeb2292d065.png')}
          style={styles.vestingImage}
          resizeMode="contain"
        />
      </View>

      <View style={[commonStyles.card, styles.contentCard]}>
        <LinearGradient
          colors={[colors.primary + '10', colors.accent + '10']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.contentGradient}
        >
          <Text style={styles.bodyText}>
            {t('dailyVestingIntro')}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.sectionSubtitle}>{t('howVestingWorks')}</Text>
          <Text style={styles.bodyText}>
            {t('howVestingWorksDesc')}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.sectionSubtitle}>{t('vestingBenefits')}</Text>
          <Text style={styles.bodyText}>
            {t('vestingBenefitsDesc')}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.sectionSubtitle}>{t('vestingCalculation')}</Text>
          <Text style={styles.bodyText}>
            {t('vestingCalculationDesc')}
          </Text>
        </LinearGradient>
      </View>

      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>{t('vestingAdvantages')}</Text>
        
        <View style={styles.featuresGrid}>
          <View style={[commonStyles.card, styles.featureCard]}>
            <Text style={styles.featureEmoji}>💰</Text>
            <Text style={styles.featureTitle}>{t('passiveIncome')}</Text>
            <Text style={styles.featureDescription}>{t('passiveIncomeDesc')}</Text>
          </View>

          <View style={[commonStyles.card, styles.featureCard]}>
            <Text style={styles.featureEmoji}>📊</Text>
            <Text style={styles.featureTitle}>{t('compoundGrowth')}</Text>
            <Text style={styles.featureDescription}>{t('compoundGrowthDesc')}</Text>
          </View>

          <View style={[commonStyles.card, styles.featureCard]}>
            <Text style={styles.featureEmoji}>🔄</Text>
            <Text style={styles.featureTitle}>{t('automaticReinvestment')}</Text>
            <Text style={styles.featureDescription}>{t('automaticReinvestmentDesc')}</Text>
          </View>

          <View style={[commonStyles.card, styles.featureCard]}>
            <Text style={styles.featureEmoji}>📈</Text>
            <Text style={styles.featureTitle}>{t('longTermValue')}</Text>
            <Text style={styles.featureDescription}>{t('longTermValueDesc')}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// En la Práctica Tab Content - Image (9c088d87)
function EnLaPracticaTab() {
  const { t } = useLanguage();
  
  return (
    <View>
      <View style={styles.titleSection}>
        <Text style={styles.mainTitle}>{t('inPracticeTitle')}</Text>
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={require('@/assets/images/9c088d87-87e8-4a3f-9920-2242244ecea7.png')}
          style={styles.practicaImage}
          resizeMode="contain"
        />
      </View>

      {/* Introduction */}
      <View style={[commonStyles.card, styles.contentCard]}>
        <LinearGradient
          colors={[colors.primary + '10', colors.accent + '10']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.contentGradient}
        >
          <Text style={styles.bodyText}>
            {t('inPracticeIntro')}
          </Text>
        </LinearGradient>
      </View>

      {/* Projected Growth */}
      <View style={[commonStyles.card, styles.contentCard]}>
        <LinearGradient
          colors={[colors.primary + '15', colors.accent + '15']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.contentGradient}
        >
          <Text style={styles.sectionSubtitle}>{t('projectedGrowthTitle')}</Text>
          <Text style={styles.bodyText}>{t('projectedGrowthIntro')}</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.emphasisText}>{t('conservativeScenarioTitle')}</Text>
          <Text style={styles.bodyText}>{t('conservativeScenarioPrice')}</Text>
          <Text style={styles.bodyText}>{t('conservativeScenarioGrowth')}</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.emphasisText}>{t('intermediateScenarioTitle')}</Text>
          <Text style={styles.bodyText}>{t('intermediateScenarioDesc')}</Text>
          <Text style={styles.bodyText}>{t('intermediateScenarioPrice')}</Text>
          <Text style={styles.bodyText}>{t('intermediateScenarioGrowth')}</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.emphasisText}>{t('expansiveScenarioTitle')}</Text>
          <Text style={styles.bodyText}>{t('expansiveScenarioDesc')}</Text>
          <Text style={styles.bodyText}>{t('expansiveScenarioPrice')}</Text>
          <Text style={styles.bodyText}>{t('expansiveScenarioGrowth')}</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.bodyText}>{t('scenariosDisclaimer')}</Text>
        </LinearGradient>
      </View>

      {/* Practical Examples */}
      <View style={[commonStyles.card, styles.contentCard]}>
        <LinearGradient
          colors={[colors.accent + '15', colors.primary + '15']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.contentGradient}
        >
          <Text style={styles.sectionSubtitle}>{t('practicalExamplesTitle')}</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.emphasisText}>{t('smallInvestorTitle')}</Text>
          <Text style={styles.bodyText}>{t('smallInvestorReceives')}</Text>
          <Text style={styles.bodyText}>{t('smallInvestorVesting')}</Text>
          <Text style={styles.bodyText}>{t('smallInvestorProjection')}</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.emphasisText}>{t('mediumInvestorTitle')}</Text>
          <Text style={styles.bodyText}>{t('mediumInvestorReceives')}</Text>
          <Text style={styles.bodyText}>{t('mediumInvestorParticipation')}</Text>
          <Text style={styles.bodyText}>{t('mediumInvestorProjection')}</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.emphasisText}>{t('longTermInvestorTitle')}</Text>
          <Text style={styles.bodyText}>{t('longTermInvestorReceives')}</Text>
          <Text style={styles.bodyText}>{t('longTermInvestorAccumulation')}</Text>
          <Text style={styles.bodyText}>{t('longTermInvestorProjection')}</Text>
        </LinearGradient>
      </View>

      {/* Real Token Use */}
      <View style={[commonStyles.card, styles.visionCard]}>
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.visionGradient}
        >
          <Text style={styles.visionEmoji}>💳</Text>
          <Text style={styles.ctaTitle}>{t('realTokenUseTitle')}</Text>
          <Text style={styles.ctaText}>{t('realTokenUseIntro')}</Text>
          
          <View style={styles.bulletListLight}>
            <Text style={styles.bulletPointLight}>{t('realTokenUsePoint1')}</Text>
            <Text style={styles.bulletPointLight}>{t('realTokenUsePoint2')}</Text>
            <Text style={styles.bulletPointLight}>{t('realTokenUsePoint3')}</Text>
          </View>

          <Text style={styles.ctaSubtext}>{t('realTokenUseConclusion')}</Text>
        </LinearGradient>
      </View>
    </View>
  );
}

// Tokenómica Tab Content - NEW IMAGE ADDED (c8e5b4e8)
function TokenomicaTab() {
  const { t } = useLanguage();
  
  return (
    <View>
      <View style={styles.titleSection}>
        <Text style={styles.mainTitle}>{t('tokenomicsTitle')}</Text>
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={require('@/assets/images/c8e5b4e8-eeb5-4ea6-a207-c930085bb758.png')}
          style={styles.tokenomicaImage}
          resizeMode="contain"
        />
      </View>

      <View style={[commonStyles.card, styles.contentCard]}>
        <LinearGradient
          colors={[colors.primary + '10', colors.accent + '10']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.contentGradient}
        >
          <Text style={styles.bodyText}>
            {t('tokenomicsIntro')}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.sectionSubtitle}>{t('totalSupply')}</Text>
          <Text style={styles.bodyText}>
            {t('totalSupplyDesc')}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.sectionSubtitle}>{t('distribution')}</Text>
          <Text style={styles.bodyText}>
            {t('distributionDesc')}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.sectionSubtitle}>{t('burnMechanism')}</Text>
          <Text style={styles.bodyText}>
            {t('burnMechanismDesc')}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.sectionSubtitle}>{t('stakingRewards')}</Text>
          <Text style={styles.bodyText}>
            {t('stakingRewardsDesc')}
          </Text>
        </LinearGradient>
      </View>

      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>{t('tokenomicsHighlights')}</Text>
        
        <View style={styles.featuresGrid}>
          <View style={[commonStyles.card, styles.featureCard]}>
            <Text style={styles.featureEmoji}>🔥</Text>
            <Text style={styles.featureTitle}>{t('deflationaryModel')}</Text>
            <Text style={styles.featureDescription}>{t('deflationaryModelDesc')}</Text>
          </View>

          <View style={[commonStyles.card, styles.featureCard]}>
            <Text style={styles.featureEmoji}>💎</Text>
            <Text style={styles.featureTitle}>{t('fairDistribution')}</Text>
            <Text style={styles.featureDescription}>{t('fairDistributionDesc')}</Text>
          </View>

          <View style={[commonStyles.card, styles.featureCard]}>
            <Text style={styles.featureEmoji}>🎁</Text>
            <Text style={styles.featureTitle}>{t('incentiveProgram')}</Text>
            <Text style={styles.featureDescription}>{t('incentiveProgramDesc')}</Text>
          </View>

          <View style={[commonStyles.card, styles.featureCard]}>
            <Text style={styles.featureEmoji}>🔒</Text>
            <Text style={styles.featureTitle}>{t('liquidityLock')}</Text>
            <Text style={styles.featureDescription}>{t('liquidityLockDesc')}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// NEW: Riesgos Tab Content
function RiesgosTab() {
  const { t } = useLanguage();
  
  return (
    <View>
      <View style={styles.titleSection}>
        <Text style={styles.mainTitle}>{t('risksTitle')}</Text>
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={require('@/assets/images/70145fd4-2c83-40c4-a306-9cb2f11f2f45.png')}
          style={styles.riesgosImage}
          resizeMode="contain"
        />
      </View>

      {/* Introduction */}
      <View style={[commonStyles.card, styles.contentCard]}>
        <LinearGradient
          colors={[colors.primary + '10', colors.accent + '10']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.contentGradient}
        >
          <Text style={styles.bodyText}>
            {t('risksIntro')}
          </Text>
        </LinearGradient>
      </View>

      {/* Potential Advantages */}
      <View style={[commonStyles.card, styles.contentCard]}>
        <LinearGradient
          colors={[colors.primary + '15', colors.accent + '15']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.contentGradient}
        >
          <Text style={styles.sectionSubtitle}>{t('risksAdvantagesTitle')}</Text>
          <Text style={styles.bodyText}>{t('risksAdvantagesIntro')}</Text>
          
          <Text style={styles.bodyText}>{t('risksAdvantagesPoint1')}</Text>
          
          <Text style={styles.bodyText}>{t('risksAdvantagesPoint2')}</Text>
        </LinearGradient>
      </View>

      {/* Risks to Consider */}
      <View style={[commonStyles.card, styles.contentCard]}>
        <LinearGradient
          colors={[colors.accent + '15', colors.primary + '15']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.contentGradient}
        >
          <Text style={styles.sectionSubtitle}>{t('risksConsiderTitle')}</Text>
          <Text style={styles.bodyText}>{t('risksConsiderIntro')}</Text>
          
          <Text style={styles.bodyText}>{t('risksConsiderPoint1')}</Text>
          
          <Text style={styles.bodyText}>{t('risksConsiderPoint2')}</Text>
        </LinearGradient>
      </View>

      {/* Responsibility Declaration */}
      <View style={[commonStyles.card, styles.visionCard]}>
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.visionGradient}
        >
          <Text style={styles.visionEmoji}>⚠️</Text>
          <Text style={styles.ctaTitle}>{t('risksResponsibilityTitle')}</Text>
          <Text style={styles.ctaText}>
            {t('risksResponsibilityText')}
          </Text>
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
  riesgosImage: {
    width: width - 80,
    height: (width - 80) * 0.6,
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
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
    opacity: 0.3,
  },
  bulletList: {
    marginVertical: 12,
    paddingLeft: 8,
  },
  bulletPoint: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 8,
  },
  bulletListLight: {
    marginVertical: 12,
    paddingLeft: 8,
  },
  bulletPointLight: {
    fontSize: 15,
    color: '#000',
    lineHeight: 24,
    marginBottom: 8,
    fontWeight: '500',
  },
  featuresSection: {
    marginBottom: 24,
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
