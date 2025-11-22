
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function VestingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [vestingData, setVestingData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    loadVestingData();
  }, []);

  const loadVestingData = async () => {
    try {
      setLoading(true);

      // Load user data
      const { data: userInfo, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (userError) throw userError;
      setUserData(userInfo);

      // Load vesting schedule
      const { data: schedule, error: scheduleError } = await supabase
        .from('mxi_withdrawal_schedule')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (scheduleError && scheduleError.code !== 'PGRST116') {
        throw scheduleError;
      }

      setVestingData(schedule);
    } catch (error) {
      console.error('Error loading vesting data:', error);
      Alert.alert('Error', 'No se pudo cargar la información de vesting');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalMXI = vestingData?.total_mxi || 0;
  const releasedMXI = vestingData?.released_mxi || 0;
  const pendingMXI = vestingData?.pending_mxi || 0;
  const releasePercentage = vestingData?.release_percentage || 10;
  const nextReleaseDate = vestingData?.next_release_date
    ? new Date(vestingData.next_release_date)
    : null;
  const releaseCount = vestingData?.release_count || 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="chevron_left"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vesting MXI</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.transparentCard, styles.mainCard]}>
          <View style={styles.iconContainer}>
            <IconSymbol
              ios_icon_name="lock.fill"
              android_material_icon_name="lock"
              size={48}
              color={colors.primary}
            />
          </View>
          <Text style={styles.mainTitle}>MXI en Vesting</Text>
          <Text style={styles.mainAmount}>{totalMXI.toFixed(2)} MXI</Text>
          <Text style={styles.mainSubtitle}>
            Bloqueado hasta el lanzamiento oficial
          </Text>
        </View>

        <View style={[styles.transparentCard, styles.statsCard]}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check_circle"
                size={24}
                color={colors.success}
              />
              <Text style={styles.statLabel}>Liberado</Text>
              <Text style={styles.statValue}>{releasedMXI.toFixed(2)} MXI</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <IconSymbol
                ios_icon_name="clock.fill"
                android_material_icon_name="schedule"
                size={24}
                color={colors.warning}
              />
              <Text style={styles.statLabel}>Pendiente</Text>
              <Text style={styles.statValue}>{pendingMXI.toFixed(2)} MXI</Text>
            </View>
          </View>
        </View>

        <View style={[styles.transparentCard, styles.infoCard]}>
          <View style={styles.infoHeader}>
            <IconSymbol
              ios_icon_name="info.circle.fill"
              android_material_icon_name="info"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.infoTitle}>Información de Vesting</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Porcentaje de liberación:</Text>
            <Text style={styles.infoValue}>{releasePercentage}% cada 10 días</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Liberaciones realizadas:</Text>
            <Text style={styles.infoValue}>{releaseCount}</Text>
          </View>

          {nextReleaseDate && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Próxima liberación:</Text>
              <Text style={styles.infoValue}>
                {nextReleaseDate.toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.transparentCard, styles.descriptionCard]}>
          <Text style={styles.descriptionTitle}>¿Qué es el Vesting?</Text>
          <Text style={styles.descriptionText}>
            El vesting es un mecanismo que libera gradualmente tus tokens MXI
            obtenidos por yield/rendimiento. Esto garantiza estabilidad en el
            mercado y protege el valor de la moneda.
          </Text>
          <Text style={styles.descriptionText}>
            Cada 10 días se libera el {releasePercentage}% de tu saldo en
            vesting, que podrás retirar una vez cumplas los requisitos (5
            referidos activos).
          </Text>
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
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  transparentCard: {
    backgroundColor: 'rgba(26, 31, 58, 0.6)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.primary + '40',
  },
  mainCard: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
    borderColor: colors.primary,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  mainAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  mainSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statsCard: {
    padding: 0,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  statDivider: {
    width: 1,
    height: 80,
    backgroundColor: colors.border,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  infoCard: {
    gap: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '30',
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  descriptionCard: {
    gap: 12,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
