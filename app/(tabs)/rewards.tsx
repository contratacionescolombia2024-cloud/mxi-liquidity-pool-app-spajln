
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

export default function RewardsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recompensas</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Programas de Recompensas</Text>
          
          <TouchableOpacity
            style={styles.rewardCard}
            onPress={() => router.push('/(tabs)/(home)/lottery')}
          >
            <View style={[styles.rewardIcon, { backgroundColor: colors.primary + '20' }]}>
              <IconSymbol 
                ios_icon_name="ticket.fill" 
                android_material_icon_name="confirmation_number" 
                size={32} 
                color={colors.primary} 
              />
            </View>
            <View style={styles.rewardInfo}>
              <Text style={styles.rewardTitle}>Lotería MXI</Text>
              <Text style={styles.rewardDescription}>Participa en sorteos semanales</Text>
            </View>
            <IconSymbol 
              ios_icon_name="chevron.right" 
              android_material_icon_name="chevron_right" 
              size={24} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>

          <View style={styles.rewardDivider} />

          <TouchableOpacity
            style={styles.rewardCard}
            onPress={() => router.push('/(tabs)/(home)/vesting')}
          >
            <View style={[styles.rewardIcon, { backgroundColor: colors.success + '20' }]}>
              <IconSymbol 
                ios_icon_name="chart.line.uptrend.xyaxis" 
                android_material_icon_name="trending_up" 
                size={32} 
                color={colors.success} 
              />
            </View>
            <View style={styles.rewardInfo}>
              <Text style={styles.rewardTitle}>Vesting & Rendimiento</Text>
              <Text style={styles.rewardDescription}>Genera rendimiento pasivo</Text>
            </View>
            <IconSymbol 
              ios_icon_name="chevron.right" 
              android_material_icon_name="chevron_right" 
              size={24} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>

        <View style={[commonStyles.card, styles.comingSoonCard]}>
          <IconSymbol 
            ios_icon_name="gift.fill" 
            android_material_icon_name="card_giftcard" 
            size={48} 
            color={colors.accent} 
          />
          <Text style={styles.comingSoonTitle}>Más Recompensas Próximamente</Text>
          <Text style={styles.comingSoonText}>
            Estamos trabajando en nuevos programas de recompensas para ti. ¡Mantente atento!
          </Text>
        </View>

        <View style={[commonStyles.card, styles.infoCard]}>
          <View style={styles.infoHeader}>
            <IconSymbol 
              ios_icon_name="star.fill" 
              android_material_icon_name="star" 
              size={24} 
              color={colors.primary} 
            />
            <Text style={styles.infoTitle}>Beneficios de las Recompensas</Text>
          </View>
          <View style={styles.infoList}>
            <Text style={styles.infoItem}>- Gana tokens MXI adicionales</Text>
            <Text style={styles.infoItem}>- Participa en sorteos exclusivos</Text>
            <Text style={styles.infoItem}>- Genera rendimiento pasivo</Text>
            <Text style={styles.infoItem}>- Bonos por referidos activos</Text>
            <Text style={styles.infoItem}>- Recompensas por participación</Text>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12,
  },
  rewardDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  rewardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  comingSoonCard: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: colors.accent + '10',
    borderWidth: 1,
    borderColor: colors.accent + '30',
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
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
