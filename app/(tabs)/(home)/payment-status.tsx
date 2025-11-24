
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

export default function PaymentStatusScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string>('waiting');
  const [checkingStatus, setCheckingStatus] = useState(false);

  const orderId = params.orderId as string;
  const mxiAmount = params.mxiAmount as string;
  const usdtAmount = params.usdtAmount as string;
  const currency = params.currency as string;
  const paymentUrl = params.paymentUrl as string;

  useEffect(() => {
    if (orderId) {
      subscribeToPaymentUpdates();
    }

    return () => {
      // Cleanup subscription
      supabase.removeAllChannels();
    };
  }, [orderId]);

  const subscribeToPaymentUpdates = () => {
    console.log('Subscribing to payment updates for order:', orderId);

    const channel = supabase
      .channel(`payment-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transaction_history',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          console.log('Payment update received:', payload);

          if (payload.new) {
            const newStatus = (payload.new as any).status;
            setPaymentStatus(newStatus);

            if (newStatus === 'confirmed' || newStatus === 'finished') {
              Alert.alert(
                '✅ Pago Confirmado',
                `Tu pago ha sido confirmado exitosamente.\n\n${mxiAmount} MXI han sido acreditados a tu cuenta.`,
                [
                  {
                    text: 'Ver Balance',
                    onPress: () => router.replace('/(tabs)/(home)'),
                  },
                ]
              );
              channel.unsubscribe();
            } else if (newStatus === 'failed' || newStatus === 'expired') {
              Alert.alert(
                '❌ Pago Fallido',
                `Tu pago no pudo ser procesado.\n\nEstado: ${getStatusText(newStatus)}`,
                [
                  {
                    text: 'Reintentar',
                    onPress: () => router.replace('/(tabs)/(home)/purchase-mxi'),
                  },
                  {
                    text: 'Volver',
                    onPress: () => router.replace('/(tabs)/(home)'),
                  },
                ]
              );
              channel.unsubscribe();
            }
          }
        }
      )
      .subscribe();
  };

  const handleCheckStatus = async () => {
    if (!user) return;

    setCheckingStatus(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        Alert.alert('Error', 'Sesión expirada. Por favor inicia sesión nuevamente');
        return;
      }

      const response = await fetch(
        `${supabase.supabaseUrl}/functions/v1/check-nowpayments-status?order_id=${orderId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      const result = await response.json();
      console.log('Status check result:', result);

      if (result.success) {
        setPaymentStatus(result.status);

        if (result.status === 'confirmed' || result.status === 'finished') {
          Alert.alert(
            '✅ Pago Confirmado',
            `Tu pago de ${mxiAmount} MXI ha sido confirmado.\n\nTu saldo ha sido actualizado.`,
            [
              {
                text: 'Ver Balance',
                onPress: () => router.replace('/(tabs)/(home)'),
              },
            ]
          );
        } else {
          Alert.alert(
            'Estado del Pago',
            `Estado actual: ${getStatusText(result.status)}\n\nEl pago aún está siendo procesado.`
          );
        }
      } else {
        Alert.alert('Error', result.message || 'No se pudo verificar el estado del pago');
      }
    } catch (error) {
      console.error('Error checking status:', error);
      Alert.alert('Error', 'No se pudo verificar el estado del pago');
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleOpenPayment = async () => {
    console.log('Opening payment URL:', paymentUrl);

    try {
      const result = await WebBrowser.openBrowserAsync(paymentUrl, {
        dismissButtonStyle: 'close',
        readerMode: false,
        enableBarCollapsing: false,
      });

      console.log('WebBrowser result:', result);
    } catch (webBrowserError) {
      console.error('WebBrowser failed:', webBrowserError);

      try {
        const canOpen = await Linking.canOpenURL(paymentUrl);
        console.log('Can open URL with Linking:', canOpen);

        if (canOpen) {
          await Linking.openURL(paymentUrl);
        } else {
          Alert.alert(
            'Error',
            'No se pudo abrir la página de pago. Por favor copia la URL manualmente.',
            [
              {
                text: 'Copiar URL',
                onPress: () => {
                  Alert.alert('URL de Pago', paymentUrl);
                },
              },
              { text: 'OK' },
            ]
          );
        }
      } catch (linkingError) {
        console.error('Linking failed:', linkingError);
        Alert.alert('Error', 'No se pudo abrir la página de pago');
      }
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'Pendiente',
      'waiting': 'Esperando Pago',
      'confirming': 'Confirmando',
      'confirmed': 'Confirmado',
      'finished': 'Completado',
      'failed': 'Fallido',
      'expired': 'Expirado',
      'cancelled': 'Cancelado',
    };
    return statusMap[status] || status;
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'finished':
        return { ios: 'checkmark.circle.fill', android: 'check_circle' };
      case 'waiting':
      case 'confirming':
        return { ios: 'clock.fill', android: 'schedule' };
      case 'pending':
        return { ios: 'hourglass', android: 'hourglass_empty' };
      case 'failed':
      case 'expired':
      case 'cancelled':
        return { ios: 'xmark.circle.fill', android: 'cancel' };
      default:
        return { ios: 'questionmark.circle', android: 'help' };
    }
  };

  const statusIcon = getStatusIcon(paymentStatus);
  const statusColor = getStatusColor(paymentStatus);
  const isCompleted = paymentStatus === 'confirmed' || paymentStatus === 'finished';
  const isFailed = paymentStatus === 'failed' || paymentStatus === 'expired' || paymentStatus === 'cancelled';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/(tabs)/(home)')}
        >
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="chevron_left"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Estado del Pago</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status Card */}
        <View style={[commonStyles.card, styles.statusCard]}>
          <View style={[styles.statusIconContainer, { backgroundColor: `${statusColor}20` }]}>
            {!isCompleted && !isFailed && (
              <ActivityIndicator size="large" color={statusColor} />
            )}
            {(isCompleted || isFailed) && (
              <IconSymbol
                ios_icon_name={statusIcon.ios}
                android_material_icon_name={statusIcon.android}
                size={64}
                color={statusColor}
              />
            )}
          </View>

          <Text style={[styles.statusText, { color: statusColor }]}>
            {getStatusText(paymentStatus)}
          </Text>

          <Text style={styles.statusDescription}>
            {isCompleted && 'Tu pago ha sido confirmado exitosamente'}
            {isFailed && 'Tu pago no pudo ser procesado'}
            {!isCompleted && !isFailed && 'Esperando confirmación del pago'}
          </Text>
        </View>

        {/* Payment Details */}
        <View style={[commonStyles.card, styles.detailsCard]}>
          <Text style={styles.detailsTitle}>Detalles del Pago</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Orden ID:</Text>
            <Text style={styles.detailValue}>{orderId}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Cantidad MXI:</Text>
            <Text style={styles.detailValue}>{mxiAmount} MXI</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Pagado:</Text>
            <Text style={styles.detailValue}>${usdtAmount} USD</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Criptomoneda:</Text>
            <Text style={styles.detailValue}>{currency.toUpperCase()}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Estado:</Text>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
              <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                {getStatusText(paymentStatus)}
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        {!isCompleted && !isFailed && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleOpenPayment}
            >
              <IconSymbol
                ios_icon_name="arrow.up.right.square"
                android_material_icon_name="open_in_new"
                size={20}
                color={colors.primary}
              />
              <Text style={styles.actionButtonText}>Abrir Página de Pago</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonSecondary]}
              onPress={handleCheckStatus}
              disabled={checkingStatus}
            >
              {checkingStatus ? (
                <ActivityIndicator size="small" color={colors.accent} />
              ) : (
                <React.Fragment>
                  <IconSymbol
                    ios_icon_name="arrow.clockwise"
                    android_material_icon_name="refresh"
                    size={20}
                    color={colors.accent}
                  />
                  <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>
                    Verificar Estado
                  </Text>
                </React.Fragment>
              )}
            </TouchableOpacity>
          </View>
        )}

        {isCompleted && (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => router.replace('/(tabs)/(home)')}
          >
            <Text style={styles.completeButtonText}>Ver Mi Balance</Text>
            <IconSymbol
              ios_icon_name="arrow.right"
              android_material_icon_name="arrow_forward"
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        )}

        {isFailed && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => router.replace('/(tabs)/(home)/purchase-mxi')}
            >
              <Text style={styles.completeButtonText}>Intentar Nuevamente</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonSecondary]}
              onPress={() => router.replace('/(tabs)/(home)')}
            >
              <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>
                Volver al Inicio
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Info Card */}
        <View style={[commonStyles.card, styles.infoCard]}>
          <View style={styles.infoHeader}>
            <IconSymbol
              ios_icon_name="info.circle.fill"
              android_material_icon_name="info"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.infoTitle}>Información</Text>
          </View>

          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>•</Text>
              <Text style={styles.infoText}>
                Esta pantalla se actualizará automáticamente cuando se confirme el pago
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>•</Text>
              <Text style={styles.infoText}>
                Puedes cerrar esta pantalla y volver más tarde. El estado se actualizará en tu historial
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>•</Text>
              <Text style={styles.infoText}>
                Los pagos pueden tardar unos minutos en confirmarse dependiendo de la red blockchain
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>•</Text>
              <Text style={styles.infoText}>
                Si tienes problemas, puedes usar el botón "Verificar Estado" para actualizar manualmente
              </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  statusCard: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 16,
  },
  statusIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  statusText: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  statusDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  detailsCard: {
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBackground,
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonSecondary: {
    borderColor: colors.accent,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  actionButtonTextSecondary: {
    color: colors.accent,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  infoCard: {
    backgroundColor: `${colors.primary}10`,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
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
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoBullet: {
    fontSize: 14,
    color: colors.primary,
    marginRight: 8,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
