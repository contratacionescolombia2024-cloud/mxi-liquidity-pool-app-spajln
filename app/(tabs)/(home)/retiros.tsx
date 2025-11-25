
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';

type WithdrawalType = 'purchased' | 'commissions' | 'vesting' | 'tournaments';

interface BalanceBreakdown {
  mxiPurchased: number;
  mxiCommissions: number;
  mxiTournaments: number;
  mxiVesting: number;
  commissionsUSDT: number;
}

export default function RetirosScreen() {
  const router = useRouter();
  const { user, checkWithdrawalEligibility, checkMXIWithdrawalEligibility } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [withdrawalType, setWithdrawalType] = useState<WithdrawalType>('commissions');
  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [canWithdrawCommission, setCanWithdrawCommission] = useState(false);
  const [canWithdrawMXI, setCanWithdrawMXI] = useState(false);
  const [balanceBreakdown, setBalanceBreakdown] = useState<BalanceBreakdown>({
    mxiPurchased: 0,
    mxiCommissions: 0,
    mxiTournaments: 0,
    mxiVesting: 0,
    commissionsUSDT: 0,
  });
  const [poolStatus, setPoolStatus] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const loadData = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const commissionEligible = await checkWithdrawalEligibility();
      setCanWithdrawCommission(commissionEligible);

      const mxiEligible = await checkMXIWithdrawalEligibility();
      setCanWithdrawMXI(mxiEligible);

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('mxi_purchased_directly, mxi_from_unified_commissions, mxi_from_challenges, mxi_vesting_locked, commissions_available')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('Error loading user data:', userError);
      }

      const { data: poolData, error: poolError } = await supabase
        .from('metrics')
        .select('mxi_launch_date')
        .single();

      if (poolError) {
        console.error('Error loading pool data:', poolError);
      }

      const mxiLaunchDate = poolData?.mxi_launch_date ? new Date(poolData.mxi_launch_date) : null;
      const isLaunched = mxiLaunchDate ? new Date() > mxiLaunchDate : false;

      setPoolStatus({ isLaunched, mxiLaunchDate });

      setBalanceBreakdown({
        mxiPurchased: parseFloat(userData?.mxi_purchased_directly || '0'),
        mxiCommissions: parseFloat(userData?.mxi_from_unified_commissions || '0'),
        mxiTournaments: parseFloat(userData?.mxi_from_challenges || '0'),
        mxiVesting: parseFloat(userData?.mxi_vesting_locked || '0'),
        commissionsUSDT: parseFloat(userData?.commissions_available || '0'),
      });

      console.log('Balance breakdown loaded:', {
        mxiPurchased: userData?.mxi_purchased_directly,
        mxiCommissions: userData?.mxi_from_unified_commissions,
        mxiTournaments: userData?.mxi_from_challenges,
        mxiVesting: userData?.mxi_vesting_locked,
        commissionsUSDT: userData?.commissions_available,
      });
    } catch (error) {
      console.error('Error in loadData:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!user) return;

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Cantidad Inválida', 'Por favor ingresa una cantidad válida');
      return;
    }

    if (!walletAddress.trim()) {
      Alert.alert('Información Faltante', 'Por favor ingresa tu dirección de billetera');
      return;
    }

    // Check eligibility based on withdrawal type
    if (withdrawalType === 'commissions') {
      if (amountNum > balanceBreakdown.commissionsUSDT) {
        Alert.alert('Saldo Insuficiente', 'No tienes suficientes comisiones disponibles');
        return;
      }

      if (!canWithdrawCommission) {
        Alert.alert(
          'No Elegible',
          'Necesitas al menos 5 referidos activos y KYC aprobado para retirar comisiones'
        );
        return;
      }

      await processWithdrawal('USDT', amountNum, 'Comisiones');
    } else {
      // MXI withdrawals
      let availableAmount = 0;
      let withdrawalLabel = '';

      switch (withdrawalType) {
        case 'purchased':
          availableAmount = balanceBreakdown.mxiPurchased;
          withdrawalLabel = 'MXI Comprados';
          break;
        case 'vesting':
          availableAmount = balanceBreakdown.mxiVesting;
          withdrawalLabel = 'MXI Vesting';
          break;
        case 'tournaments':
          availableAmount = balanceBreakdown.mxiTournaments;
          withdrawalLabel = 'MXI Torneos';
          break;
      }

      if (amountNum > availableAmount) {
        Alert.alert('Saldo Insuficiente', `No tienes suficiente ${withdrawalLabel} disponible`);
        return;
      }

      // Check if launch is required for this type
      if ((withdrawalType === 'purchased' || withdrawalType === 'vesting') && !poolStatus?.isLaunched) {
        const daysUntil = poolStatus?.mxiLaunchDate 
          ? Math.ceil((new Date(poolStatus.mxiLaunchDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : 0;
        
        Alert.alert(
          'Retiro No Disponible',
          `Los retiros de ${withdrawalLabel} estarán disponibles después del lanzamiento oficial de MXI.\n\nTiempo restante: ${daysUntil} días`,
          [{ text: 'Entendido' }]
        );
        return;
      }

      if (!canWithdrawMXI) {
        Alert.alert(
          'No Elegible',
          'Necesitas al menos 5 referidos activos y KYC aprobado para retirar MXI'
        );
        return;
      }

      await processWithdrawal('MXI', amountNum, withdrawalLabel);
    }
  };

  const processWithdrawal = async (currency: 'USDT' | 'MXI', amount: number, label: string) => {
    setLoading(true);

    try {
      const { error } = await supabase
        .from('withdrawals')
        .insert({
          user_id: user!.id,
          amount,
          currency,
          wallet_address: walletAddress,
          status: 'pending',
          admin_notes: `Retiro de ${label}`,
        });

      if (error) {
        console.error('Withdrawal error:', error);
        Alert.alert('Error', 'No se pudo procesar el retiro. Por favor intenta de nuevo.');
        return;
      }

      Alert.alert(
        'Solicitud Enviada',
        `Tu solicitud de retiro de ${amount.toFixed(2)} ${currency} (${label}) ha sido enviada exitosamente. Será procesada en 24-48 horas.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setAmount('');
              setWalletAddress('');
              loadData();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Process withdrawal exception:', error);
      Alert.alert('Error', 'Ocurrió un error al procesar el retiro');
    } finally {
      setLoading(false);
    }
  };

  const getWithdrawalTypeInfo = () => {
    switch (withdrawalType) {
      case 'purchased':
        return {
          title: 'Retirar MXI Comprados',
          icon: '🛒',
          color: '#00ff88',
          available: balanceBreakdown.mxiPurchased,
          currency: 'MXI',
          description: 'MXI adquiridos mediante compras con USDT',
          locked: !poolStatus?.isLaunched,
        };
      case 'commissions':
        return {
          title: 'Retirar Comisiones',
          icon: '💵',
          color: '#A855F7',
          available: balanceBreakdown.commissionsUSDT,
          currency: 'USDT',
          description: 'Comisiones en USDT de referidos',
          locked: false,
        };
      case 'vesting':
        return {
          title: 'Retirar MXI Vesting',
          icon: '🔒',
          color: '#6366F1',
          available: balanceBreakdown.mxiVesting,
          currency: 'MXI',
          description: 'MXI generado por rendimiento (3% mensual)',
          locked: !poolStatus?.isLaunched,
        };
      case 'tournaments':
        return {
          title: 'Retirar MXI Torneos',
          icon: '🏆',
          color: '#ffdd00',
          available: balanceBreakdown.mxiTournaments,
          currency: 'MXI',
          description: 'MXI ganado en torneos y desafíos',
          locked: false,
        };
    }
  };

  const typeInfo = getWithdrawalTypeInfo();

  if (loading && !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol ios_icon_name="chevron.left" android_material_icon_name="arrow_back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Retiros</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <IconSymbol ios_icon_name="arrow.clockwise" android_material_icon_name="refresh" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Balance Overview */}
        <View style={[commonStyles.card, styles.balanceCard]}>
          <Text style={styles.sectionTitle}>💰 Resumen de Saldos</Text>
          
          <View style={styles.balanceGrid}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceIcon}>🛒</Text>
              <Text style={styles.balanceLabel}>MXI Comprados</Text>
              <Text style={styles.balanceValue}>{balanceBreakdown.mxiPurchased.toFixed(2)}</Text>
              {!poolStatus?.isLaunched && (
                <Text style={styles.balanceLocked}>🔒 Bloqueado hasta lanzamiento</Text>
              )}
            </View>

            <View style={styles.balanceItem}>
              <Text style={styles.balanceIcon}>💵</Text>
              <Text style={styles.balanceLabel}>Comisiones USDT</Text>
              <Text style={styles.balanceValue}>${balanceBreakdown.commissionsUSDT.toFixed(2)}</Text>
              <Text style={styles.balanceAvailable}>✅ Disponible</Text>
            </View>

            <View style={styles.balanceItem}>
              <Text style={styles.balanceIcon}>🔒</Text>
              <Text style={styles.balanceLabel}>MXI Vesting</Text>
              <Text style={styles.balanceValue}>{balanceBreakdown.mxiVesting.toFixed(6)}</Text>
              {!poolStatus?.isLaunched && (
                <Text style={styles.balanceLocked}>🔒 Bloqueado hasta lanzamiento</Text>
              )}
            </View>

            <View style={styles.balanceItem}>
              <Text style={styles.balanceIcon}>🏆</Text>
              <Text style={styles.balanceLabel}>MXI Torneos</Text>
              <Text style={styles.balanceValue}>{balanceBreakdown.mxiTournaments.toFixed(2)}</Text>
              <Text style={styles.balanceAvailable}>✅ Disponible</Text>
            </View>
          </View>
        </View>

        {/* Withdrawal Type Selector */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Tipo de Retiro</Text>
          
          <View style={styles.typeGrid}>
            <TouchableOpacity
              style={[
                styles.typeCard,
                withdrawalType === 'purchased' && styles.typeCardActive,
                !poolStatus?.isLaunched && styles.typeCardDisabled,
              ]}
              onPress={() => setWithdrawalType('purchased')}
              disabled={!poolStatus?.isLaunched}
            >
              <Text style={styles.typeIcon}>🛒</Text>
              <Text style={styles.typeLabel}>MXI Comprados</Text>
              {!poolStatus?.isLaunched && <Text style={styles.typeLocked}>🔒</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeCard,
                withdrawalType === 'commissions' && styles.typeCardActive,
              ]}
              onPress={() => setWithdrawalType('commissions')}
            >
              <Text style={styles.typeIcon}>💵</Text>
              <Text style={styles.typeLabel}>Comisiones</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeCard,
                withdrawalType === 'vesting' && styles.typeCardActive,
                !poolStatus?.isLaunched && styles.typeCardDisabled,
              ]}
              onPress={() => setWithdrawalType('vesting')}
              disabled={!poolStatus?.isLaunched}
            >
              <Text style={styles.typeIcon}>🔒</Text>
              <Text style={styles.typeLabel}>MXI Vesting</Text>
              {!poolStatus?.isLaunched && <Text style={styles.typeLocked}>🔒</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeCard,
                withdrawalType === 'tournaments' && styles.typeCardActive,
              ]}
              onPress={() => setWithdrawalType('tournaments')}
            >
              <Text style={styles.typeIcon}>🏆</Text>
              <Text style={styles.typeLabel}>MXI Torneos</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Selected Type Info */}
        <View style={[commonStyles.card, { borderLeftWidth: 4, borderLeftColor: typeInfo.color }]}>
          <View style={styles.typeInfoHeader}>
            <Text style={styles.typeInfoIcon}>{typeInfo.icon}</Text>
            <View style={styles.typeInfoText}>
              <Text style={styles.typeInfoTitle}>{typeInfo.title}</Text>
              <Text style={styles.typeInfoDescription}>{typeInfo.description}</Text>
            </View>
          </View>
          
          <View style={styles.typeInfoStats}>
            <View style={styles.typeInfoStat}>
              <Text style={styles.typeInfoStatLabel}>Disponible</Text>
              <Text style={[styles.typeInfoStatValue, { color: typeInfo.color }]}>
                {typeInfo.available.toFixed(typeInfo.currency === 'USDT' ? 2 : 6)} {typeInfo.currency}
              </Text>
            </View>
            
            {typeInfo.locked && (
              <View style={styles.lockedBadge}>
                <IconSymbol ios_icon_name="lock.fill" android_material_icon_name="lock" size={16} color={colors.warning} />
                <Text style={styles.lockedText}>Bloqueado hasta lanzamiento</Text>
              </View>
            )}
          </View>
        </View>

        {/* Withdrawal Form */}
        {!typeInfo.locked && (
          <View style={commonStyles.card}>
            <Text style={styles.sectionTitle}>Detalles del Retiro</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Cantidad ({typeInfo.currency})</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder={`Máximo: ${typeInfo.available.toFixed(typeInfo.currency === 'USDT' ? 2 : 6)}`}
                placeholderTextColor={colors.textSecondary}
              />
              <TouchableOpacity
                style={styles.maxButton}
                onPress={() => setAmount(typeInfo.available.toString())}
              >
                <Text style={styles.maxButtonText}>MÁXIMO</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Dirección de Billetera (TRC20)</Text>
              <TextInput
                style={styles.input}
                value={walletAddress}
                onChangeText={setWalletAddress}
                placeholder="Ingresa tu dirección de billetera TRC20"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[buttonStyles.primary, styles.withdrawButton]}
              onPress={handleWithdraw}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <React.Fragment>
                  <IconSymbol ios_icon_name="arrow.down.circle.fill" android_material_icon_name="arrow_circle_down" size={20} color="#fff" />
                  <Text style={buttonStyles.primaryText}>Solicitar Retiro</Text>
                </React.Fragment>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Requirements */}
        <View style={[commonStyles.card, styles.requirementsCard]}>
          <Text style={styles.sectionTitle}>📋 Requisitos de Retiro</Text>
          
          <View style={styles.requirementItem}>
            <IconSymbol 
              ios_icon_name={user?.kycStatus === 'approved' ? 'checkmark.circle.fill' : 'xmark.circle.fill'} 
              android_material_icon_name={user?.kycStatus === 'approved' ? 'check_circle' : 'cancel'} 
              size={20} 
              color={user?.kycStatus === 'approved' ? colors.success : colors.error} 
            />
            <Text style={styles.requirementText}>KYC Aprobado</Text>
          </View>

          <View style={styles.requirementItem}>
            <IconSymbol 
              ios_icon_name={user && user.activeReferrals >= 5 ? 'checkmark.circle.fill' : 'xmark.circle.fill'} 
              android_material_icon_name={user && user.activeReferrals >= 5 ? 'check_circle' : 'cancel'} 
              size={20} 
              color={user && user.activeReferrals >= 5 ? colors.success : colors.error} 
            />
            <Text style={styles.requirementText}>5 Referidos Activos ({user?.activeReferrals || 0}/5)</Text>
          </View>

          {!poolStatus?.isLaunched && (
            <View style={styles.requirementItem}>
              <IconSymbol ios_icon_name="clock.fill" android_material_icon_name="schedule" size={20} color={colors.warning} />
              <Text style={styles.requirementText}>
                Lanzamiento de MXI requerido para retiros de MXI comprados y vesting
              </Text>
            </View>
          )}
        </View>

        {/* Info Card */}
        <View style={[commonStyles.card, styles.infoCard]}>
          <View style={styles.infoHeader}>
            <IconSymbol ios_icon_name="info.circle.fill" android_material_icon_name="info" size={24} color={colors.primary} />
            <Text style={styles.infoTitle}>Información Importante</Text>
          </View>
          <View style={styles.infoList}>
            <Text style={styles.infoItem}>- <Text style={styles.bold}>Comisiones USDT:</Text> Disponibles para retiro inmediato con requisitos cumplidos</Text>
            <Text style={styles.infoItem}>- <Text style={styles.bold}>MXI Comprados:</Text> Bloqueados hasta el lanzamiento oficial de MXI</Text>
            <Text style={styles.infoItem}>- <Text style={styles.bold}>MXI Vesting:</Text> Bloqueado hasta el lanzamiento oficial de MXI</Text>
            <Text style={styles.infoItem}>- <Text style={styles.bold}>MXI Torneos:</Text> Disponible para retiro después del lanzamiento</Text>
            <Text style={styles.infoItem}>- Todos los retiros requieren 5 referidos activos y KYC aprobado</Text>
            <Text style={styles.infoItem}>- Tiempo de procesamiento: 24-48 horas</Text>
            <Text style={styles.infoItem}>- Verifica cuidadosamente la dirección de billetera</Text>
          </View>
        </View>

        {/* History Button */}
        <TouchableOpacity
          style={[commonStyles.card, styles.historyButton]}
          onPress={() => router.push('/(tabs)/(home)/withdrawals')}
        >
          <IconSymbol ios_icon_name="clock.arrow.circlepath" android_material_icon_name="history" size={24} color={colors.primary} />
          <Text style={styles.historyButtonText}>Ver Historial de Retiros</Text>
          <IconSymbol ios_icon_name="chevron.right" android_material_icon_name="chevron_right" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  balanceCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  balanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  balanceItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  balanceIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  balanceLocked: {
    fontSize: 10,
    color: colors.warning,
    textAlign: 'center',
  },
  balanceAvailable: {
    fontSize: 10,
    color: colors.success,
    textAlign: 'center',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    position: 'relative',
  },
  typeCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  typeCardDisabled: {
    opacity: 0.5,
  },
  typeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  typeLocked: {
    position: 'absolute',
    top: 8,
    right: 8,
    fontSize: 16,
  },
  typeInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  typeInfoIcon: {
    fontSize: 40,
  },
  typeInfoText: {
    flex: 1,
  },
  typeInfoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  typeInfoDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  typeInfoStats: {
    gap: 12,
  },
  typeInfoStat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeInfoStatLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  typeInfoStatValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.warning + '20',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.warning + '40',
  },
  lockedText: {
    fontSize: 14,
    color: colors.warning,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  maxButton: {
    position: 'absolute',
    right: 12,
    top: 38,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  maxButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  requirementsCard: {
    marginBottom: 16,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  requirementText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  infoCard: {
    backgroundColor: colors.primary + '10',
    borderWidth: 1,
    borderColor: colors.primary + '30',
    marginBottom: 16,
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
  bold: {
    fontWeight: '700',
    color: colors.text,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  historyButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
