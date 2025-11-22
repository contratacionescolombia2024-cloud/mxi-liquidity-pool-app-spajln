
import React from 'react';
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

export default function WithdrawScreen() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Retirar</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[commonStyles.card, styles.balanceCard]}>
          <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
              <IconSymbol 
                ios_icon_name="bitcoinsign.circle.fill" 
                android_material_icon_name="currency_bitcoin" 
                size={32} 
                color={colors.primary} 
              />
              <Text style={styles.balanceLabel}>MXI Disponible</Text>
              <Text style={styles.balanceValue}>{user?.availableMXI?.toFixed(2) || '0.00'}</Text>
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceItem}>
              <IconSymbol 
                ios_icon_name="dollarsign.circle.fill" 
                android_material_icon_name="attach_money" 
                size={32} 
                color={colors.success} 
              />
              <Text style={styles.balanceLabel}>Comisiones</Text>
              <Text style={styles.balanceValue}>${user?.commissions.available.toFixed(2) || '0.00'}</Text>
            </View>
          </View>
        </View>

        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Opciones de Retiro</Text>
          
          <TouchableOpacity
            style={styles.methodCard}
            onPress={() => router.push('/(tabs)/(home)/withdraw-mxi')}
          >
            <View style={[styles.methodIcon, { backgroundColor: colors.primary + '20' }]}>
              <IconSymbol 
                ios_icon_name="bitcoinsign.circle.fill" 
                android_material_icon_name="currency_bitcoin" 
                size={32} 
                color={colors.primary} 
              />
            </View>
            <View style={styles.methodInfo}>
              <Text style={styles.methodTitle}>Retirar MXI</Text>
              <Text style={styles.methodDescription}>Retira tus tokens MXI</Text>
            </View>
            <IconSymbol 
              ios_icon_name="chevron.right" 
              android_material_icon_name="chevron_right" 
              size={24} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>

          <View style={styles.methodDivider} />

          <TouchableOpacity
            style={styles.methodCard}
            onPress={() => router.push('/(tabs)/(home)/withdrawal')}
          >
            <View style={[styles.methodIcon, { backgroundColor: colors.success + '20' }]}>
              <IconSymbol 
                ios_icon_name="dollarsign.circle.fill" 
                android_material_icon_name="attach_money" 
                size={32} 
                color={colors.success} 
              />
            </View>
            <View style={styles.methodInfo}>
              <Text style={styles.methodTitle}>Retirar Comisiones</Text>
              <Text style={styles.methodDescription}>Retira tus comisiones en USDT</Text>
            </View>
            <IconSymbol 
              ios_icon_name="chevron.right" 
              android_material_icon_name="chevron_right" 
              size={24} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>

          <View style={styles.methodDivider} />

          <TouchableOpacity
            style={styles.methodCard}
            onPress={() => router.push('/(tabs)/(home)/withdrawals')}
          >
            <View style={[styles.methodIcon, { backgroundColor: colors.accent + '20' }]}>
              <IconSymbol 
                ios_icon_name="clock.fill" 
                android_material_icon_name="history" 
                size={32} 
                color={colors.accent} 
              />
            </View>
            <View style={styles.methodInfo}>
              <Text style={styles.methodTitle}>Historial de Retiros</Text>
              <Text style={styles.methodDescription}>Ver retiros anteriores</Text>
            </View>
            <IconSymbol 
              ios_icon_name="chevron.right" 
              android_material_icon_name="chevron_right" 
              size={24} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>

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
          <View style={styles.infoList}>
            <View style={styles.requirementItem}>
              <IconSymbol 
                ios_icon_name={user?.kycStatus === 'approved' ? 'checkmark.circle.fill' : 'xmark.circle.fill'} 
                android_material_icon_name={user?.kycStatus === 'approved' ? 'check_circle' : 'cancel'} 
                size={20} 
                color={user?.kycStatus === 'approved' ? colors.success : colors.error} 
              />
              <Text style={styles.requirementText}>KYC Verificado</Text>
            </View>
            <View style={styles.requirementItem}>
              <IconSymbol 
                ios_icon_name={(user?.activeReferrals || 0) >= 5 ? 'checkmark.circle.fill' : 'xmark.circle.fill'} 
                android_material_icon_name={(user?.activeReferrals || 0) >= 5 ? 'check_circle' : 'cancel'} 
                size={20} 
                color={(user?.activeReferrals || 0) >= 5 ? colors.success : colors.error} 
              />
              <Text style={styles.requirementText}>5 Referidos Activos ({user?.activeReferrals || 0}/5)</Text>
            </View>
            <View style={styles.requirementItem}>
              <IconSymbol 
                ios_icon_name="clock.fill" 
                android_material_icon_name="schedule" 
                size={20} 
                color={colors.warning} 
              />
              <Text style={styles.requirementText}>10 días entre retiros</Text>
            </View>
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
  balanceCard: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  balanceItem: {
    alignItems: 'center',
    flex: 1,
  },
  balanceDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  balanceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12,
  },
  methodDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  methodIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  requirementsCard: {
    backgroundColor: colors.success + '10',
    borderWidth: 1,
    borderColor: colors.success + '30',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  infoList: {
    gap: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  requirementText: {
    fontSize: 14,
    color: colors.text,
  },
});
