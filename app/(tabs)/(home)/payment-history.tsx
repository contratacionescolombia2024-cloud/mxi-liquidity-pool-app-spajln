
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

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
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
  paymentCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  paymentAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: '#333333',
    marginVertical: 12,
  },
  orderIdContainer: {
    backgroundColor: '#0A0A0A',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  orderIdLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  orderIdText: {
    fontSize: 12,
    color: colors.text,
    fontFamily: 'monospace',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default function PaymentHistoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPayments();

    // Subscribe to payment updates
    const channel = supabase
      .channel('payment-history-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          console.log('Payment update received:', payload);
          loadPayments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPayments();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'finished':
      case 'confirmed':
        return '#4CAF50';
      case 'waiting':
      case 'pending':
        return colors.primary;
      case 'confirming':
        return '#2196F3';
      case 'failed':
      case 'expired':
      case 'cancelled':
        return '#F44336';
      default:
        return '#666666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'finished':
        return 'Completado';
      case 'confirmed':
        return 'Confirmado';
      case 'waiting':
        return 'Esperando Pago';
      case 'pending':
        return 'Pendiente';
      case 'confirming':
        return 'Confirmando';
      case 'failed':
        return 'Fallido';
      case 'expired':
        return 'Expirado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  if (loading) {
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
          <Text style={styles.headerTitle}>Historial de Pagos</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Historial de Pagos</Text>
      </View>

      {payments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol
            ios_icon_name="doc.text"
            android_material_icon_name="description"
            size={64}
            color={colors.textSecondary}
          />
          <Text style={styles.emptyText}>
            No tienes pagos registrados aún.{'\n'}
            Realiza tu primera compra de MXI para comenzar.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {payments.map((payment, index) => (
            <View key={index} style={styles.paymentCard}>
              <View style={styles.paymentHeader}>
                <Text style={styles.paymentAmount}>
                  {parseFloat(payment.price_amount).toFixed(2)} USDT
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(payment.status) },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {getStatusText(payment.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>MXI Recibidos:</Text>
                <Text style={styles.paymentValue}>
                  {parseFloat(payment.mxi_amount).toFixed(2)} MXI
                </Text>
              </View>

              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Precio por MXI:</Text>
                <Text style={styles.paymentValue}>
                  {parseFloat(payment.price_per_mxi).toFixed(2)} USDT
                </Text>
              </View>

              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Fase:</Text>
                <Text style={styles.paymentValue}>Fase {payment.phase}</Text>
              </View>

              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Moneda:</Text>
                <Text style={styles.paymentValue}>
                  {payment.pay_currency.toUpperCase()}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Fecha:</Text>
                <Text style={styles.paymentValue}>
                  {new Date(payment.created_at).toLocaleString()}
                </Text>
              </View>

              {payment.confirmed_at && (
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Confirmado:</Text>
                  <Text style={styles.paymentValue}>
                    {new Date(payment.confirmed_at).toLocaleString()}
                  </Text>
                </View>
              )}

              {payment.expires_at && payment.status === 'waiting' && (
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Expira:</Text>
                  <Text style={styles.paymentValue}>
                    {new Date(payment.expires_at).toLocaleString()}
                  </Text>
                </View>
              )}

              <View style={styles.orderIdContainer}>
                <Text style={styles.orderIdLabel}>ID de Orden:</Text>
                <Text style={styles.orderIdText}>{payment.order_id}</Text>
              </View>
            </View>
          ))}

          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
