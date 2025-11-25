
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import NowPaymentsModal from '@/components/NowPaymentsModal';

export default function DepositScreen() {
  const router = useRouter();
  const { user, getPhaseInfo } = useAuth();
  
  const [currentPrice, setCurrentPrice] = useState(0.40);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [phaseInfo, setPhaseInfo] = useState<any>(null);
  const [showNowPaymentsModal, setShowNowPaymentsModal] = useState(false);

  useEffect(() => {
    loadPhaseInfo();
  }, []);

  const loadPhaseInfo = async () => {
    try {
      const info = await getPhaseInfo();
      if (info) {
        setCurrentPrice(info.currentPriceUsdt);
        setCurrentPhase(info.currentPhase);
        setPhaseInfo(info);
      }
    } catch (error: any) {
      console.error('Error loading phase info:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Depositar</Text>
        <Text style={styles.headerSubtitle}>Compra MXI con múltiples criptomonedas</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Balance Card */}
        <View style={[commonStyles.card, styles.balanceCard]}>
          <View style={styles.balanceHeader}>
            <IconSymbol 
              ios_icon_name="dollarsign.circle.fill" 
              android_material_icon_name="account_balance_wallet" 
              size={48} 
              color={colors.primary} 
            />
            <Text style={styles.balanceLabel}>Balance Actual</Text>
          </View>
          <Text style={styles.balanceValue}>{user?.mxiBalance.toFixed(2) || '0.00'} MXI</Text>
          <Text style={styles.balanceSubtext}>${user?.usdtContributed.toFixed(2) || '0.00'} USDT Contribuido</Text>
        </View>

        {/* Phase Information Card */}
        <View style={styles.phaseCard}>
          <Text style={styles.phaseTitle}>🚀 Fase Actual de Preventa</Text>
          <View style={styles.phaseRow}>
            <Text style={styles.phaseLabel}>Fase Activa:</Text>
            <Text style={styles.phaseValue}>Fase {currentPhase} de 3</Text>
          </View>
          <View style={styles.phaseRow}>
            <Text style={styles.phaseLabel}>Precio Actual:</Text>
            <Text style={styles.phaseValue}>{currentPrice.toFixed(2)} USDT por MXI</Text>
          </View>
          <View style={styles.phaseDivider} />
          <View style={styles.phaseRow}>
            <Text style={styles.phaseLabel}>Fase 1:</Text>
            <Text style={styles.phaseValue}>0.40 USDT</Text>
          </View>
          <View style={styles.phaseRow}>
            <Text style={styles.phaseLabel}>Fase 2:</Text>
            <Text style={styles.phaseValue}>0.70 USDT</Text>
          </View>
          <View style={styles.phaseRow}>
            <Text style={styles.phaseLabel}>Fase 3:</Text>
            <Text style={styles.phaseValue}>1.00 USDT</Text>
          </View>
          {phaseInfo && (
            <React.Fragment>
              <View style={styles.phaseDivider} />
              <View style={styles.phaseRow}>
                <Text style={styles.phaseLabel}>Tokens Vendidos:</Text>
                <Text style={styles.phaseValue}>
                  {phaseInfo.totalTokensSold.toLocaleString()} MXI
                </Text>
              </View>
              {currentPhase < 3 && (
                <View style={styles.phaseRow}>
                  <Text style={styles.phaseLabel}>Hasta Siguiente Fase:</Text>
                  <Text style={styles.phaseValue}>
                    {phaseInfo.tokensUntilNextPhase.toLocaleString()} MXI
                  </Text>
                </View>
              )}
            </React.Fragment>
          )}
        </View>

        {/* Main Payment Button */}
        <TouchableOpacity
          style={styles.mainPaymentButton}
          onPress={() => setShowNowPaymentsModal(true)}
          activeOpacity={0.8}
        >
          <View style={styles.paymentButtonGradient}>
            <View style={styles.paymentIconContainer}>
              <IconSymbol
                ios_icon_name="creditcard.fill"
                android_material_icon_name="payment"
                size={40}
                color="#FFFFFF"
              />
            </View>
            <View style={styles.paymentContent}>
              <Text style={styles.paymentTitle}>💳 Comprar MXI</Text>
              <Text style={styles.paymentSubtitle}>
                Paga con múltiples criptomonedas
              </Text>
              <View style={styles.paymentFeatures}>
                <View style={styles.featureItem}>
                  <IconSymbol
                    ios_icon_name="checkmark.circle.fill"
                    android_material_icon_name="check_circle"
                    size={16}
                    color="#FFFFFF"
                  />
                  <Text style={styles.featureText}>+50 Criptomonedas</Text>
                </View>
                <View style={styles.featureItem}>
                  <IconSymbol
                    ios_icon_name="checkmark.circle.fill"
                    android_material_icon_name="check_circle"
                    size={16}
                    color="#FFFFFF"
                  />
                  <Text style={styles.featureText}>Múltiples Redes</Text>
                </View>
                <View style={styles.featureItem}>
                  <IconSymbol
                    ios_icon_name="checkmark.circle.fill"
                    android_material_icon_name="check_circle"
                    size={16}
                    color="#FFFFFF"
                  />
                  <Text style={styles.featureText}>Confirmación Automática</Text>
                </View>
              </View>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron_right"
              size={32}
              color="#FFFFFF"
            />
          </View>
        </TouchableOpacity>

        {/* Supported Currencies Preview */}
        <View style={styles.currenciesPreviewCard}>
          <Text style={styles.previewTitle}>🪙 Criptomonedas Soportadas</Text>
          <Text style={styles.previewSubtitle}>
            Paga con cualquiera de estas monedas y más
          </Text>
          <View style={styles.currencyGrid}>
            <View style={styles.currencyChip}>
              <Text style={styles.currencyChipIcon}>₿</Text>
              <Text style={styles.currencyChipText}>Bitcoin</Text>
            </View>
            <View style={styles.currencyChip}>
              <Text style={styles.currencyChipIcon}>Ξ</Text>
              <Text style={styles.currencyChipText}>Ethereum</Text>
            </View>
            <View style={styles.currencyChip}>
              <Text style={styles.currencyChipIcon}>₮</Text>
              <Text style={styles.currencyChipText}>USDT</Text>
            </View>
            <View style={styles.currencyChip}>
              <Text style={styles.currencyChipIcon}>$</Text>
              <Text style={styles.currencyChipText}>USDC</Text>
            </View>
            <View style={styles.currencyChip}>
              <Text style={styles.currencyChipIcon}>B</Text>
              <Text style={styles.currencyChipText}>BNB</Text>
            </View>
            <View style={styles.currencyChip}>
              <Text style={styles.currencyChipIcon}>◎</Text>
              <Text style={styles.currencyChipText}>Solana</Text>
            </View>
            <View style={styles.currencyChip}>
              <Text style={styles.currencyChipIcon}>Ł</Text>
              <Text style={styles.currencyChipText}>Litecoin</Text>
            </View>
            <View style={styles.currencyChip}>
              <Text style={styles.currencyChipIcon}>+</Text>
              <Text style={styles.currencyChipText}>50+ más</Text>
            </View>
          </View>
        </View>

        {/* How It Works */}
        <View style={styles.howItWorksCard}>
          <Text style={styles.howItWorksTitle}>📋 Cómo Funciona</Text>
          <View style={styles.stepsList}>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Ingresa el Monto</Text>
                <Text style={styles.stepDescription}>
                  Especifica cuánto USDT deseas invertir (mínimo 20 USDT)
                </Text>
              </View>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Selecciona tu Criptomoneda</Text>
                <Text style={styles.stepDescription}>
                  Elige entre más de 50 criptomonedas y redes disponibles
                </Text>
              </View>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Realiza el Pago</Text>
                <Text style={styles.stepDescription}>
                  Envía la cantidad exacta a la dirección proporcionada
                </Text>
              </View>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Recibe tus MXI</Text>
                <Text style={styles.stepDescription}>
                  Los tokens se acreditarán automáticamente tras la confirmación
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Benefits Card */}
        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>✨ Ventajas del Pago Multi-Crypto</Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <IconSymbol
                ios_icon_name="bolt.fill"
                android_material_icon_name="flash_on"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.benefitText}>
                Confirmación automática en minutos
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <IconSymbol
                ios_icon_name="shield.checkmark.fill"
                android_material_icon_name="verified_user"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.benefitText}>
                Seguro y verificado en blockchain
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <IconSymbol
                ios_icon_name="globe"
                android_material_icon_name="public"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.benefitText}>
                Múltiples redes y monedas soportadas
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <IconSymbol
                ios_icon_name="clock.fill"
                android_material_icon_name="schedule"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.benefitText}>
                Disponible 24/7 sin intermediarios
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>50+</Text>
            <Text style={styles.statLabel}>Criptomonedas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>10+</Text>
            <Text style={styles.statLabel}>Redes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>24/7</Text>
            <Text style={styles.statLabel}>Disponible</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* NowPayments Modal */}
      <NowPaymentsModal
        visible={showNowPaymentsModal}
        onClose={() => setShowNowPaymentsModal(false)}
        userId={user?.id || ''}
      />
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
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
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
  balanceCard: {
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: 20,
  },
  balanceHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  balanceSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  phaseCard: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  phaseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  phaseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  phaseLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  phaseValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  phaseDivider: {
    height: 1,
    backgroundColor: colors.primary + '30',
    marginVertical: 12,
  },
  mainPaymentButton: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  paymentButtonGradient: {
    backgroundColor: '#667eea',
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  paymentContent: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  paymentSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
  },
  paymentFeatures: {
    gap: 6,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  currenciesPreviewCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  previewSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  currencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  currencyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currencyChipIcon: {
    fontSize: 16,
    fontWeight: '700',
  },
  currencyChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  howItWorksCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  howItWorksTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
  },
  stepsList: {
    gap: 20,
  },
  stepItem: {
    flexDirection: 'row',
    gap: 16,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000000',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  benefitsCard: {
    backgroundColor: colors.primary + '15',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  benefitsList: {
    gap: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  statsCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
});
