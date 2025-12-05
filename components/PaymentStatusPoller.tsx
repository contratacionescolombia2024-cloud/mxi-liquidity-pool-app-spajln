
import React, { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface PaymentStatusPollerProps {
  orderId: string;
  onPaymentConfirmed: () => void;
  onVerificationError?: () => void;
}

export default function PaymentStatusPoller({ 
  orderId, 
  onPaymentConfirmed,
  onVerificationError 
}: PaymentStatusPollerProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const errorCountRef = useRef(0);
  const MAX_ERRORS = 3; // After 3 consecutive errors, suggest manual verification

  useEffect(() => {
    console.log('🔄 [POLLER] Starting payment status poller for order:', orderId);
    
    // Check immediately
    checkPaymentStatus();
    
    // Then check every 30 seconds
    intervalRef.current = setInterval(() => {
      checkPaymentStatus();
    }, 30000);

    return () => {
      if (intervalRef.current) {
        console.log('🛑 [POLLER] Stopping payment status poller');
        clearInterval(intervalRef.current);
      }
    };
  }, [orderId]);

  const checkPaymentStatus = async () => {
    try {
      console.log('🔍 [POLLER] Checking payment status for order:', orderId);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('❌ [POLLER] No active session');
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
      console.log('📊 [POLLER] Status check result:', result);

      if (!response.ok) {
        console.error('❌ [POLLER] Status check failed:', result);
        errorCountRef.current += 1;
        
        // After MAX_ERRORS consecutive errors, suggest manual verification
        if (errorCountRef.current >= MAX_ERRORS && onVerificationError) {
          console.log('⚠️ [POLLER] Max errors reached, suggesting manual verification');
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          onVerificationError();
        }
        return;
      }

      // Reset error count on successful response
      errorCountRef.current = 0;

      if (result.success) {
        if (result.status === 'confirmed' || result.status === 'finished') {
          console.log('✅ [POLLER] Payment confirmed!');
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          onPaymentConfirmed();
        } else if (result.status === 'failed' || result.status === 'expired') {
          console.log('❌ [POLLER] Payment failed or expired');
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          // Optionally call error handler for failed/expired payments
          if (onVerificationError) {
            onVerificationError();
          }
        } else {
          console.log('⏳ [POLLER] Payment still pending, status:', result.status);
        }
      }
    } catch (error: any) {
      console.error('❌ [POLLER] Error checking payment status:', error);
      errorCountRef.current += 1;
      
      // After MAX_ERRORS consecutive errors, suggest manual verification
      if (errorCountRef.current >= MAX_ERRORS && onVerificationError) {
        console.log('⚠️ [POLLER] Max errors reached, suggesting manual verification');
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        onVerificationError();
      }
    }
  };

  return null; // This is a headless component
}
