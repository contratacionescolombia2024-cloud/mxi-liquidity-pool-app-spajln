
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import * as Clipboard from 'expo-clipboard';

export default function ReferralsScreen() {
  const { user, getCurrentYield } = useAuth();
  const router = useRouter();
  const [currentYield, setCurrentYield] = useState(0);

  useEffect(() => {
    if (user && getCurrentYield) {
      const yield_value = getCurrentYield();
      setCurrentYield(yield_value);
    }
  }, [user, getCurrentYield]);

  const handleCopyCode = async () => {
    if (!user?.referralCode) return;
    await Clipboard.setStringAsync(user.referralCode);
    Alert.alert('¡Copiado!', 'Código de referido copiado al portapapeles');
  };

  const handleShare = async () => {
    if (!user?.referralCode) return;

    try {
      await Share.share({
        message: `Únete al Pool MXI con mi código de referido: ${user.referralCode}\n\n¡Gana tokens MXI y obtén recompensas!`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Get commission balance from user context - this is the unified source of truth
  const mxiFromCommissions = user?.mxiFromUnifiedCommissions || 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Comisiones por Referidos</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Referral Code Card */}
        <View style={[commonStyles.card, styles.codeCard]}>
          <View style={styles.codeHeader}>
            <IconSymbol 
              ios_icon_name="person.2.fill" 
              android_material_icon_name="people" 
              size={32} 
              color={colors.primary} 
            />
            <Text style={styles.codeTitle}>Tu Código de Referido</Text>
          </View>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{user?.referralCode || 'N/A'}</Text>
            <TouchableOpacity onPress={handleCopyCode} style={styles.copyButton}>
              <IconSymbol 
                ios_icon_name="doc.on.doc" 
                android_material_icon_name="content_copy" 
                size={20} 
                color={colors.primary} 
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={[buttonStyles.primary, styles.shareButton]} onPress={handleShare}>
            <IconSymbol 
              ios_icon_name="square.and.arrow.up" 
              android_material_icon_name="share" 
              size={20} 
              color="#000" 
            />
            <Text style={buttonStyles.primaryText}>Compartir Código</Text>
          </TouchableOpacity>
        </View>

        {/* Commission Balance - Unified Source */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>💰 Balance de Comisiones (MXI)</Text>
          <View style={styles.balanceCard}>
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceLabel}>Total Ganado por Referidos</Text>
              <Text style={styles.balanceValue}>{mxiFromCommissions.toFixed(4)} MXI</Text>
            </View>
            <View style={styles.balanceProgressBar}>
              <View 
                style={[
                  styles.balanceProgressFill, 
                  { 
                    width: mxiFromCommissions > 0 ? '100%' : '0%',
                    backgroundColor: colors.primary
                  }
                ]} 
              />
            </View>
          </View>
          <Text style={styles.infoNote}>
            💡 Todas las comisiones por referidos se acreditan directamente en MXI
          </Text>
          <Text style={styles.infoNote}>
            📊 Este saldo representa tus ganancias totales por comisiones de referidos
          </Text>
        </View>

        {/* Referral Stats */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>👥 Tus Referidos</Text>
          <View style={styles.referralsList}>
            <View style={styles.referralItem}>
              <View style={styles.referralLevel}>
                <Text style={styles.referralLevelText}>Nivel 1</Text>
                <Text style={styles.referralRate}>3%</Text>
              </View>
              <Text style={styles.referralCount}>{user?.referrals.level1 || 0} referidos</Text>
            </View>
            <View style={styles.referralItem}>
              <View style={styles.referralLevel}>
                <Text style={styles.referralLevelText}>Nivel 2</Text>
                <Text style={styles.referralRate}>2%</Text>
              </View>
              <Text style={styles.referralCount}>{user?.referrals.level2 || 0} referidos</Text>
            </View>
            <View style={styles.referralItem}>
              <View style={styles.referralLevel}>
                <Text style={styles.referralLevelText}>Nivel 3</Text>
                <Text style={styles.referralRate}>1%</Text>
              </View>
              <Text style={styles.referralCount}>{user?.referrals.level3 || 0} referidos</Text>
            </View>
          </View>
          <View style={styles.activeReferrals}>
            <Text style={styles.activeLabel}>Referidos Activos (Nivel 1):</Text>
            <Text style={styles.activeValue}>{user?.activeReferrals || 0}</Text>
          </View>
        </View>

        {/* How It Works */}
        <View style={[commonStyles.card, styles.infoCard]}>
          <View style={styles.infoHeader}>
            <IconSymbol 
              ios_icon_name="info.circle.fill" 
              android_material_icon_name="info" 
              size={24} 
              color={colors.primary} 
            />
            <Text style={styles.infoTitle}>Cómo Funcionan las Comisiones</Text>
          </View>
          <View style={styles.infoList}>
            <Text style={styles.infoItem}>- Comparte tu código de referido con amigos</Text>
            <Text style={styles.infoItem}>- Gana 3% en MXI de las compras de referidos de Nivel 1</Text>
            <Text style={styles.infoItem}>- Gana 2% en MXI de las compras de referidos de Nivel 2</Text>
            <Text style={styles.infoItem}>- Gana 1% en MXI de las compras de referidos de Nivel 3</Text>
            <Text style={styles.infoItem}>- Todas las comisiones se acreditan automáticamente en MXI</Text>
            <Text style={styles.infoItem}>- Las comisiones se calculan sobre el monto en MXI comprado</Text>
            <Text style={styles.infoItem}>- Necesitas 5 referidos activos de Nivel 1 para retirar</Text>
          </View>
        </View>

        {/* Withdrawal Requirements */}
        <View style={[commonStyles.card, styles.requirementsCard]}>
          <View style={styles.infoHeader}>
            <IconSymbol 
              ios_icon_name="checkmark.shield.fill" 
              android_material_icon_name="verified_user" 
              size={24} 
              color={colors.success} 
            />
            <Text style={styles.infoTitle}>Requisitos para Retirar</Text>
          </View>
          <View style={styles.requirementsList}>
            <View style={styles.requirementItem}>
              <IconSymbol 
                ios_icon_name={user && user.activeReferrals >= 5 ? 'checkmark.circle.fill' : 'xmark.circle.fill'} 
                android_material_icon_name={user && user.activeReferrals >= 5 ? 'check_circle' : 'cancel'} 
                size={20} 
                color={user && user.activeReferrals >= 5 ? colors.success : colors.error} 
              />
              <Text style={styles.requirementText}>
                5 referidos activos de Nivel 1 ({user?.activeReferrals || 0}/5)
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <IconSymbol 
                ios_icon_name={mxiFromCommissions >= 50 ? 'checkmark.circle.fill' : 'xmark.circle.fill'} 
                android_material_icon_name={mxiFromCommissions >= 50 ? 'check_circle' : 'cancel'} 
                size={20} 
                color={mxiFromCommissions >= 50 ? colors.success : colors.error} 
              />
              <Text style={styles.requirementText}>
                Mínimo 50 MXI en comisiones ({mxiFromCommissions.toFixed(2)} MXI)
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <IconSymbol 
                ios_icon_name={user?.kycStatus === 'approved' ? 'checkmark.circle.fill' : 'xmark.circle.fill'} 
                android_material_icon_name={user?.kycStatus === 'approved' ? 'check_circle' : 'cancel'} 
                size={20} 
                color={user?.kycStatus === 'approved' ? colors.success : colors.error} 
              />
              <Text style={styles.requirementText}>
                Verificación KYC aprobada
              </Text>
            </View>
          </View>
          {user && user.activeReferrals >= 5 && mxiFromCommissions >= 50 && user.kycStatus === 'approved' && (
            <TouchableOpacity
              style={[buttonStyles.primary, styles.withdrawButton]}
              onPress={() => router.push('/(tabs)/(home)/retiros')}
            >
              <IconSymbol 
                ios_icon_name="arrow.up.circle.fill" 
                android_material_icon_name="arrow_circle_up" 
                size={20} 
                color="#000" 
              />
              <Text style={buttonStyles.primaryText}>Ir a Retiros</Text>
            </TouchableOpacity>
          )}
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
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  codeCard: {
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  codeHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  codeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  codeText: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  copyButton: {
    padding: 8,
  },
  shareButton: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  balanceCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  balanceHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.primary,
  },
  balanceProgressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  balanceProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  infoNote: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
  referralsList: {
    gap: 12,
    marginBottom: 16,
  },
  referralItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  referralLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  referralLevelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  referralRate: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  referralCount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  activeReferrals: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.success + '20',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.success + '40',
  },
  activeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  activeValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.success,
  },
  infoCard: {
    backgroundColor: colors.primary + '10',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  infoList: {
    gap: 8,
  },
  infoItem: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  requirementsCard: {
    backgroundColor: colors.success + '10',
    borderWidth: 1,
    borderColor: colors.success + '30',
  },
  requirementsList: {
    gap: 12,
    marginBottom: 16,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  requirementText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
