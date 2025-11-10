
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';

interface BinancePayment {
  id: string;
  payment_id: string;
  usdt_amount: number;
  mxi_amount: number;
  status: 'pending' | 'confirming' | 'confirmed' | 'failed' | 'expired';
  created_at: string;
  confirmed_at: string | null;
  expires_at: string;
}

export default function BinancePaymentsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [payments, setPayments] = useState<BinancePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('binance_payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading payments:', error);
        return;
      }

      setPayments(data || []);
    } catch (error) {
      console.error('Exception loading payments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPayments();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return colors.success;
      case 'pending':
      case 'confirming':
        return colors.warning;
      case 'failed':
      case 'expired':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'checkmark.circle.fill';
      case 'pending':
        return 'clock.fill';
      case 'confirming':
        return 'arrow.clockwise.circle.fill';
      case 'failed':
        return 'xmark.circle.fill';
      case 'expired':
        return 'exclamationmark.triangle.fill';
      default:
        return 'circle.fill';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading payments...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Binance Payments</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {payments.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="creditcard" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No Payments Yet</Text>
            <Text style={styles.emptyText}>
              Your Binance payment history will appear here
            </Text>
            <TouchableOpacity
              style={styles.contributeButton}
              onPress={() => router.push('/(tabs)/(home)/contribute')}
            >
              <IconSymbol name="plus.circle.fill" size={20} color="#fff" />
              <Text style={styles.contributeButtonText}>Make a Contribution</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.paymentsList}>
            {payments.map((payment) => (
              <View key={payment.id} style={styles.paymentCard}>
                <View style={styles.paymentHeader}>
                  <View style={styles.paymentStatus}>
                    <IconSymbol
                      name={getStatusIcon(payment.status)}
                      size={20}
                      color={getStatusColor(payment.status)}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(payment.status) },
                      ]}
                    >
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </Text>
                  </View>
                  <Text style={styles.paymentDate}>
                    {formatDate(payment.created_at)}
                  </Text>
                </View>

                <View style={styles.paymentDetails}>
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Payment ID:</Text>
                    <Text style={styles.paymentValue} numberOfLines={1}>
                      {payment.payment_id}
                    </Text>
                  </View>
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Amount:</Text>
                    <Text style={styles.paymentValue}>
                      {payment.usdt_amount} USDT
                    </Text>
                  </View>
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>MXI Received:</Text>
                    <Text style={styles.paymentValue}>
                      {payment.mxi_amount} MXI
                    </Text>
                  </View>
                  {payment.confirmed_at && (
                    <View style={styles.paymentRow}>
                      <Text style={styles.paymentLabel}>Confirmed:</Text>
                      <Text style={styles.paymentValue}>
                        {formatDate(payment.confirmed_at)}
                      </Text>
                    </View>
                  )}
                  {payment.status === 'pending' && (
                    <View style={styles.paymentRow}>
                      <Text style={styles.paymentLabel}>Expires:</Text>
                      <Text style={[styles.paymentValue, styles.expiresText]}>
                        {formatDate(payment.expires_at)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
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
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  contributeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  contributeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  paymentsList: {
    gap: 16,
  },
  paymentCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  paymentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  paymentDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  paymentDetails: {
    gap: 12,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    textAlign: 'right',
  },
  expiresText: {
    color: colors.warning,
  },
});
