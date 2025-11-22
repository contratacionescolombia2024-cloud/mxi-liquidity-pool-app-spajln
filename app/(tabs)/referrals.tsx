
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Share,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import * as Clipboard from 'expo-clipboard';

export default function ReferralsScreen() {
  const { user, withdrawCommission, unifyCommissionToMXI, getCurrentYield } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [canWithdraw, setCanWithdraw] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [currentYield, setCurrentYield] = useState(0);

  useEffect(() => {
    if (user && getCurrentYield) {
      const yield_value = getCurrentYield();
      setCurrentYield(yield_value);
    }
  }, [user, getCurrentYield]);

  useEffect(() => {
    if (user) {
      checkEligibility();
      loadCurrentPrice();
    }
  }, [user]);

  const loadCurrentPrice = async () => {
    setCurrentPrice(0.012);
  };

  const checkEligibility = async () => {
    if (!user) return;

    const hasMinReferrals = user.activeReferrals >= 5;
    const daysSinceLastWithdrawal = user.lastWithdrawalDate
      ? (Date.now() - new Date(user.lastWithdrawalDate).getTime()) / (1000 * 60 * 60 * 24)
      : 999;
    const hasWaitedEnough = daysSinceLastWithdrawal >= 10;

    setCanWithdraw(hasMinReferrals && hasWaitedEnough);
  };

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

  const handleWithdraw = async () => {
    if (!user) return;

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Monto Inválido', 'Por favor ingresa un monto válido');
      return;
    }

    if (amount > user.commissions.available) {
      Alert.alert('Saldo Insuficiente', 'No tienes suficientes comisiones disponibles');
      return;
    }

    if (!canWithdraw) {
      Alert.alert(
        'No Elegible',
        'Necesitas al menos 5 referidos activos y esperar 10 días entre retiros'
      );
      return;
    }

    if (!walletAddress) {
      Alert.alert('Información Faltante', 'Por favor ingresa tu dirección de billetera');
      return;
    }

    setLoading(true);
    const result = await withdrawCommission(amount, walletAddress);
    setLoading(false);

    if (result.success) {
      Alert.alert('¡Éxito!', 'Solicitud de retiro enviada exitosamente');
      setWithdrawAmount('');
      setWalletAddress('');
    } else {
      Alert.alert('Error', result.error || 'Error al enviar solicitud de retiro');
    }
  };

  const handleUnifyToMXI = async () => {
    if (!user) return;

    const available = user.commissions.available;
    if (available <= 0) {
      Alert.alert('Sin Comisiones', 'No tienes comisiones disponibles para convertir');
      return;
    }

    Alert.alert(
      'Convertir a MXI',
      `¿Convertir $${available.toFixed(2)} USDT en comisiones a MXI al precio actual ($${currentPrice}/MXI)?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setLoading(true);
            const result = await unifyCommissionToMXI(available);
            setLoading(false);

            if (result.success) {
              Alert.alert(
                '¡Éxito!',
                `¡Convertido $${available.toFixed(2)} a ${result.mxiAmount?.toFixed(2)} MXI!`
              );
            } else {
              Alert.alert('Error', result.error || 'Error al convertir comisiones');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Referidos</Text>
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

        {/* Commission Stats */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Balance de Comisiones</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Ganado</Text>
              <Text style={styles.statValue}>${user?.commissions.total.toFixed(2) || '0.00'}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Disponible</Text>
              <Text style={[styles.statValue, { color: colors.success }]}>
                ${user?.commissions.available.toFixed(2) || '0.00'}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Retirado</Text>
              <Text style={styles.statValue}>${user?.commissions.withdrawn.toFixed(2) || '0.00'}</Text>
            </View>
          </View>
        </View>

        {/* Referral Stats */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Tus Referidos</Text>
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

        {/* Unify Options */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Convertir Comisiones</Text>
          <Text style={styles.unifyDescription}>
            Convierte tus comisiones disponibles a tokens MXI al precio actual del mercado.
          </Text>
          <TouchableOpacity
            style={[buttonStyles.primary, styles.unifyButton]}
            onPress={handleUnifyToMXI}
            disabled={loading || !user || user.commissions.available <= 0}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <React.Fragment>
                <IconSymbol 
                  ios_icon_name="arrow.triangle.merge" 
                  android_material_icon_name="merge_type" 
                  size={20} 
                  color="#000" 
                />
                <Text style={buttonStyles.primaryText}>Convertir a MXI</Text>
              </React.Fragment>
            )}
          </TouchableOpacity>
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
            <Text style={styles.infoTitle}>Cómo Funcionan los Referidos</Text>
          </View>
          <View style={styles.infoList}>
            <Text style={styles.infoItem}>- Comparte tu código de referido con amigos</Text>
            <Text style={styles.infoItem}>- Gana 3% de referidos de Nivel 1</Text>
            <Text style={styles.infoItem}>- Gana 2% de referidos de Nivel 2</Text>
            <Text style={styles.infoItem}>- Gana 1% de referidos de Nivel 3</Text>
            <Text style={styles.infoItem}>- Comisiones disponibles después de 10 días</Text>
            <Text style={styles.infoItem}>- Necesitas 5 referidos activos de Nivel 1 para retirar</Text>
          </View>
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
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
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
  unifyDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  unifyButton: {
    marginTop: 8,
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
});
