
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { supabase } from '@/lib/supabase';

interface PaymentStatusPollerProps {
  orderId: string;
  onPaymentConfirmed: () => void;
  onPaymentFailed?: () => void;
}

export default function PaymentStatusPoller({ 
  orderId, 
  onPaymentConfirmed,
  onPaymentFailed 
}: PaymentStatusPollerProps) {
  const [status, setStatus] = useState<string>('waiting');
  const [attempts, setAttempts] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const maxAttempts = 60; // 30 minutes (60 attempts * 30 seconds)
  const failureCount = useRef(0);
  const maxFailures = 5; // After 5 consecutive failures, suggest manual verification

  useEffect(() => {
    console.log('🔄 [POLLER] Starting payment status poller for order:', orderId);
    
    // Start polling immediately
    checkPaymentStatus();
    
    // Then poll every 30 seconds
    intervalRef.current = setInterval(() => {
      checkPaymentStatus();
    }, 30000); // 30 seconds

    return () => {
      if (intervalRef.current) {
        console.log('🛑 [POLLER] Stopping payment status poller');
        clearInterval(intervalRef.current);
      }
    };
  }, [orderId]);

  const checkPaymentStatus = async () => {
    try {
      console.log(`🔍 [POLLER] Checking payment status (attempt ${attempts + 1}/${maxAttempts})`);
      
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        console.error('❌ [POLLER] No active session');
        return;
      }

      const response = await fetch(
        `https://aeyfnjuatbtcauiumbhn.supabase.co/functions/v1/check-nowpayments-status?order_id=${orderId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${sessionData.session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        console.error(`❌ [POLLER] HTTP error: ${response.status}`);
        failureCount.current += 1;
        
        // If we've had too many failures, suggest manual verification
        if (failureCount.current >= maxFailures && onPaymentFailed) {
          console.error(`❌ [POLLER] Too many failures (${failureCount.current}), suggesting manual verification`);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          onPaymentFailed();
        }
        return;
      }

      const result = await response.json();
      console.log('📥 [POLLER] Payment status response:', result);

      // Reset failure count on successful response
      failureCount.current = 0;

      if (result.success) {
        const paymentStatus = result.status;
        setStatus(paymentStatus);

        console.log(`📊 [POLLER] Payment status: ${paymentStatus}`);

        // Check if payment is confirmed
        if (paymentStatus === 'finished' || paymentStatus === 'confirmed') {
          console.log('✅ [POLLER] Payment confirmed!');
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          onPaymentConfirmed();
          return;
        }

        // Check if payment failed
        if (paymentStatus === 'failed' || paymentStatus === 'expired' || paymentStatus === 'refunded') {
          console.log(`❌ [POLLER] Payment ${paymentStatus}`);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          if (onPaymentFailed) {
            onPaymentFailed();
          }
          return;
        }
      } else {
        console.error('❌ [POLLER] Error in response:', result.error);
        failureCount.current += 1;
        
        // If we've had too many failures, suggest manual verification
        if (failureCount.current >= maxFailures && onPaymentFailed) {
          console.error(`❌ [POLLER] Too many failures (${failureCount.current}), suggesting manual verification`);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          onPaymentFailed();
        }
      }

      // Increment attempts
      setAttempts(prev => prev + 1);

      // Stop polling after max attempts
      if (attempts >= maxAttempts) {
        console.log('⏰ [POLLER] Max attempts reached, stopping poller');
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        if (onPaymentFailed) {
          onPaymentFailed();
        }
      }
    } catch (error: any) {
      console.error('❌ [POLLER] Error checking payment status:', error);
      failureCount.current += 1;
      
      // If we've had too many failures, suggest manual verification
      if (failureCount.current >= maxFailures && onPaymentFailed) {
        console.error(`❌ [POLLER] Too many failures (${failureCount.current}), suggesting manual verification`);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        onPaymentFailed();
      }
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'waiting':
        return 'Esperando pago...';
      case 'confirming':
        return 'Confirmando pago...';
      case 'sending':
        return 'Procesando...';
      case 'finished':
      case 'confirmed':
        return '¡Pago confirmado!';
      case 'failed':
        return 'Pago fallido';
      case 'expired':
        return 'Pago expirado';
      case 'refunded':
        return 'Pago reembolsado';
      default:
        return 'Verificando estado...';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'finished':
      case 'confirmed':
        return colors.success;
      case 'failed':
      case 'expired':
        return colors.error;
      case 'refunded':
        return colors.warning;
      default:
        return colors.primary;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: getStatusColor() + '20', borderColor: getStatusColor() }]}>
      <View style={styles.content}>
        <ActivityIndicator size="small" color={getStatusColor()} />
        <View style={styles.textContainer}>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
          <Text style={styles.attemptsText}>
            Verificación automática cada 30 segundos
          </Text>
          {failureCount.current > 0 && (
            <Text style={styles.failureText}>
              {failureCount.current} error{failureCount.current > 1 ? 'es' : ''} de verificación
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  attemptsText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  failureText: {
    fontSize: 11,
    color: colors.warning,
    marginTop: 2,
  },
});
