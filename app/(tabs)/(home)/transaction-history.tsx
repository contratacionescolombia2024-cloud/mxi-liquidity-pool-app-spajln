
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import * as WebBrowser from 'expo-web-browser';

interface Transaction {
  id: string;
  transaction_type: string;
  order_id: string;
  payment_id: string;
  mxi_amount: number;
  usdt_amount: number;
  status: string;
  error_message: string;
  error_details: any;
  payment_url: string;
  metadata: any;
  created_at: string;
  updated_at: string;
  completed_at: string;
}

export default function TransactionHistoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'success' | 'failed'>('all');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('transaction_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
      Alert.alert('Error', 'No se pudo cargar el historial de transacciones');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
  };

  const openPaymentUrl = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url, {
        dismissButtonStyle: 'close',
        readerMode: false,
      });
    } catch (error) {
      console.error('Error opening URL:', error);
      Alert.alert('Error', 'No se pudo abrir el enlace de pago');
    }
  };

  const cancelTransaction = async (transaction: Transaction) => {
    Alert.alert(
      'Cancelar Transacción',
      '¿Estás seguro de que deseas cancelar esta transacción pendiente?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, Cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('transaction_history')
                .update({
                  status: 'cancelled',
                  error_message: 'Cancelado por el usuario',
                  updated_at: new Date().toISOString(),
                })
                .eq('id', transaction.id);

              if (error) throw error;

              Alert.alert('✅ Cancelado', 'La transacción ha sido cancelada');
              await loadTransactions();
            } catch (error) {
              console.error('Error cancelling transaction:', error);
              Alert.alert('Error', 'No se pudo cancelar la transacción');
            }
          },
        },
      ]
    );
  };

  const checkTransactionStatus = async (transaction: Transaction) => {
    if (!transaction.payment_id) {
      Alert.alert(
        'Sin ID de Pago',
        'Esta transacción no tiene un ID de pago válido. Es probable que la creación del pago haya fallado.',
        [
          {
            text: 'Cancelar Transacción',
            onPress: () => cancelTransaction(transaction),
          },
          { text: 'OK' },
        ]
      );
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${supabase.supabaseUrl}/functions/v1/check-nowpayments-status?order_id=${transaction.order_id}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        if (result.status === 'confirmed' || result.status === 'finished') {
          Alert.alert(
            '✅ Pago Confirmado',
            'Tu pago ha sido confirmado. Tu saldo ha sido actualizado.',
            [{ text: 'OK', onPress: () => loadTransactions() }]
          );
        } else if (result.status === 'failed' || result.status === 'expired') {
          Alert.alert(
            '❌ Pago Fallido',
            `El pago ha ${result.status === 'failed' ? 'fallado' : 'expirado'}. Puedes intentar crear una nueva orden.`,
            [{ text: 'OK', onPress: () => loadTransactions() }]
          );
        } else {
          Alert.alert(
            'Estado del Pago',
            `Estado actual: ${getStatusText(result.status)}\n\nEl pago aún está siendo procesado.`
          );
        }
      }
    } catch (error) {
      console.error('Error checking status:', error);
      Alert.alert('Error', 'No se pudo verificar el estado del pago');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'finished':
        return colors.success;
      case 'waiting':
      case 'confirming':
        return colors.warning;
      case 'pending':
        return colors.primary;
      case 'failed':
      case 'expired':
      case 'cancelled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'waiting':
        return 'Esperando Pago';
      case 'confirming':
        return 'Confirmando';
      case 'confirmed':
        return 'Confirmado';
      case 'finished':
        return 'Completado';
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

  const getTransactionTypeText = (type: string) => {
    switch (type) {
      case 'nowpayments_order':
        return 'Compra MXI (NOWPayments)';
      case 'okx_payment':
        return 'Compra MXI (OKX)';
      case 'manual_payment':
        return 'Pago Manual';
      case 'withdrawal':
        return 'Retiro';
      case 'commission':
        return 'Comisión';
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFilteredTransactions = () => {
    switch (filter) {
      case 'pending':
        return transactions.filter(t => ['pending', 'waiting', 'confirming'].includes(t.status));
      case 'success':
        return transactions.filter(t => ['confirmed', 'finished'].includes(t.status));
      case 'failed':
        return transactions.filter(t => ['failed', 'expired', 'cancelled'].includes(t.status));
      default:
        return transactions;
    }
  };

  const filteredTransactions = getFilteredTransactions();

  const stats = {
    total: transactions.length,
    pending: transactions.filter(t => ['pending', 'waiting', 'confirming'].includes(t.status)).length,
    success: transactions.filter(t => ['confirmed', 'finished'].includes(t.status)).length,
    failed: transactions.filter(t => ['failed', 'expired', 'cancelled'].includes(t.status)).length,
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando historial...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="chevron_left"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historial de Transacciones</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.warning }]}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.success }]}>{stats.success}</Text>
          <Text style={styles.statLabel}>Exitosas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.error }]}>{stats.failed}</Text>
          <Text style={styles.statLabel}>Fallidas</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
            Todas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'pending' && styles.filterButtonActive]}
          onPress={() => setFilter('pending')}
        >
          <Text style={[styles.filterButtonText, filter === 'pending' && styles.filterButtonTextActive]}>
            Pendientes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'success' && styles.filterButtonActive]}
          onPress={() => setFilter('success')}
        >
          <Text style={[styles.filterButtonText, filter === 'success' && styles.filterButtonTextActive]}>
            Exitosas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'failed' && styles.filterButtonActive]}
          onPress={() => setFilter('failed')}
        >
          <Text style={[styles.filterButtonText, filter === 'failed' && styles.filterButtonTextActive]}>
            Fallidas
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol
              ios_icon_name="doc.text"
              android_material_icon_name="description"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyText}>No hay transacciones</Text>
            <Text style={styles.emptySubtext}>
              {filter === 'all'
                ? 'Aún no has realizado ninguna transacción'
                : `No hay transacciones ${filter === 'pending' ? 'pendientes' : filter === 'success' ? 'exitosas' : 'fallidas'}`}
            </Text>
          </View>
        ) : (
          <React.Fragment>
            {filteredTransactions.map((transaction) => (
              <View key={transaction.id} style={[commonStyles.card, styles.transactionCard]}>
                <View style={styles.transactionHeader}>
                  <View style={styles.transactionType}>
                    <IconSymbol
                      ios_icon_name={
                        transaction.transaction_type === 'nowpayments_order' || transaction.transaction_type === 'okx_payment'
                          ? 'cart.fill'
                          : transaction.transaction_type === 'withdrawal'
                          ? 'arrow.up.circle.fill'
                          : 'dollarsign.circle.fill'
                      }
                      android_material_icon_name={
                        transaction.transaction_type === 'nowpayments_order' || transaction.transaction_type === 'okx_payment'
                          ? 'shopping_cart'
                          : transaction.transaction_type === 'withdrawal'
                          ? 'arrow_upward'
                          : 'attach_money'
                      }
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={styles.transactionTypeText}>
                      {getTransactionTypeText(transaction.transaction_type)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(transaction.status) + '20' },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: getStatusColor(transaction.status) }]}>
                      {getStatusText(transaction.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.transactionDetails}>
                  <View style={styles.transactionRow}>
                    <Text style={styles.transactionLabel}>MXI:</Text>
                    <Text style={styles.transactionValue}>{transaction.mxi_amount.toLocaleString()}</Text>
                  </View>
                  <View style={styles.transactionRow}>
                    <Text style={styles.transactionLabel}>USDT:</Text>
                    <Text style={styles.transactionValue}>${transaction.usdt_amount.toLocaleString()}</Text>
                  </View>
                  {transaction.order_id && (
                    <View style={styles.transactionRow}>
                      <Text style={styles.transactionLabel}>Orden:</Text>
                      <Text style={styles.transactionValueSmall}>{transaction.order_id}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.transactionFooter}>
                  <Text style={styles.transactionDate}>{formatDate(transaction.created_at)}</Text>
                  
                  {['pending', 'waiting', 'confirming'].includes(transaction.status) && (
                    <View style={styles.actionButtons}>
                      {transaction.payment_url && (
                        <TouchableOpacity
                          style={styles.payButton}
                          onPress={() => openPaymentUrl(transaction.payment_url)}
                        >
                          <IconSymbol
                            ios_icon_name="arrow.up.right.square"
                            android_material_icon_name="open_in_new"
                            size={16}
                            color={colors.primary}
                          />
                          <Text style={styles.payButtonText}>Pagar</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={styles.checkButton}
                        onPress={() => checkTransactionStatus(transaction)}
                      >
                        <IconSymbol
                          ios_icon_name="arrow.clockwise"
                          android_material_icon_name="refresh"
                          size={16}
                          color={colors.accent}
                        />
                        <Text style={styles.checkButtonText}>Verificar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => cancelTransaction(transaction)}
                      >
                        <IconSymbol
                          ios_icon_name="xmark.circle"
                          android_material_icon_name="cancel"
                          size={16}
                          color={colors.error}
                        />
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {transaction.error_message && (
                  <View style={styles.errorContainer}>
                    <IconSymbol
                      ios_icon_name="exclamationmark.triangle.fill"
                      android_material_icon_name="error"
                      size={16}
                      color={colors.error}
                    />
                    <Text style={styles.errorText}>{transaction.error_message}</Text>
                  </View>
                )}

                {transaction.error_details && (
                  <TouchableOpacity
                    style={styles.detailsButton}
                    onPress={() => {
                      Alert.alert(
                        'Detalles del Error',
                        JSON.stringify(transaction.error_details, null, 2),
                        [{ text: 'OK' }]
                      );
                    }}
                  >
                    <Text style={styles.detailsButtonText}>Ver detalles técnicos</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </React.Fragment>
        )}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  transactionCard: {
    marginBottom: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transactionType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  transactionTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  transactionDetails: {
    gap: 8,
    marginBottom: 12,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  transactionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  transactionValueSmall: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
    maxWidth: '60%',
  },
  transactionFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  transactionDate: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  payButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: colors.highlight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  payButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  checkButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: colors.accent + '20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  checkButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: colors.error + '20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.error,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.error + '10',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error + '30',
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: colors.error,
    lineHeight: 18,
  },
  detailsButton: {
    marginTop: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  detailsButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});
