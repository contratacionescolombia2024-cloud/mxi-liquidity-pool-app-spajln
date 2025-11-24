
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  highlightText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 12,
  },
  noticeCard: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  noticeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  noticeText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    lineHeight: 20,
    textAlign: 'center',
  },
});

export default function ContratacionesScreen() {
  const router = useRouter();
  const { getPhaseInfo } = useAuth();
  const [currentPrice, setCurrentPrice] = useState(0.30);

  useEffect(() => {
    loadPhaseInfo();
  }, []);

  const loadPhaseInfo = async () => {
    try {
      const phaseInfo = await getPhaseInfo();
      if (phaseInfo) {
        setCurrentPrice(phaseInfo.currentPriceUsdt);
      }
    } catch (error) {
      console.error('Error loading phase info:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow_back"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Comprar MXI</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Sistema de Pagos Deshabilitado</Text>
          <Text style={styles.noticeText}>
            El sistema de pagos automáticos ha sido deshabilitado temporalmente.
          </Text>
          <Text style={styles.noticeText}>
            Para realizar compras de MXI, por favor contacta al soporte.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Información del Pool</Text>
          <Text style={styles.infoText}>
            Precio actual: {currentPrice.toFixed(2)} USDT por MXI
          </Text>
          <Text style={styles.infoText}>
            El pool de liquidez Maxcoin (MXI) está diseñado para aportar valor a la moneda mediante la participación de inversores.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Beneficios del Pool</Text>
          <Text style={styles.infoText}>
            • Recibe MXI tokens por tu participación
          </Text>
          <Text style={styles.infoText}>
            • Genera rendimientos del 0.005% por hora
          </Text>
          <Text style={styles.infoText}>
            • Gana comisiones por referidos (5%, 2%, 1%)
          </Text>
          <Text style={styles.infoText}>
            • Participa en el pool de liquidez
          </Text>
          <Text style={styles.infoText}>
            • Acceso anticipado al lanzamiento oficial
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Sistema de Referidos</Text>
          <Text style={styles.infoText}>
            El sistema de referidos funciona con los aportes de los participantes:
          </Text>
          <Text style={styles.infoText}>
            • Nivel 1: 5% de comisión
          </Text>
          <Text style={styles.infoText}>
            • Nivel 2: 2% de comisión
          </Text>
          <Text style={styles.infoText}>
            • Nivel 3: 1% de comisión
          </Text>
          <Text style={styles.infoText}>
            Las comisiones están disponibles para retirarse una vez se cumpla el ciclo de 10 días y tengas al menos 5 referidos de primer nivel con cuentas activas.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Lanzamiento Oficial</Text>
          <Text style={styles.infoText}>
            El pool se cerrará el 15 de enero a las 12:00 UTC Central.
          </Text>
          <Text style={styles.infoText}>
            En ese momento, los fondos se derivarán al pool y se entregará valor a la moneda.
          </Text>
          <Text style={styles.infoText}>
            No se recibirán más inscritos después de esta fecha y se realizará el lanzamiento oficial de la criptomoneda.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
