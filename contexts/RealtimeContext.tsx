
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { notificationService } from '@/utils/notificationService';
import { RealtimeChannel } from '@supabase/supabase-js';
import { notificationDedup } from '@/utils/notificationDeduplication';

interface RealtimeContextType {
  isConnected: boolean;
  lastUpdate: Date | null;
}

const RealtimeContext = createContext<RealtimeContextType>({
  isConnected: false,
  lastUpdate: null,
});

export const useRealtime = () => useContext(RealtimeContext);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { user, refreshUser } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const processingEventRef = useRef<boolean>(false);

  useEffect(() => {
    if (!user) {
      // Clean up if user logs out
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    // Initialize notification service
    notificationService.initialize();

    // Set up real-time subscription for user-specific updates
    const setupRealtimeSubscription = async () => {
      // Check if already subscribed
      if (channelRef.current?.state === 'subscribed') {
        console.log('Already subscribed to realtime updates');
        return;
      }

      const channel = supabase.channel(`user:${user.id}:updates`, {
        config: {
          broadcast: { self: false, ack: true },
          private: true,
        },
      });

      channelRef.current = channel;

      // Helper function to handle events with deduplication
      const handleEvent = async (eventType: string, payload: any, notificationFn: () => Promise<void>) => {
        // Prevent concurrent processing of the same event
        if (processingEventRef.current) {
          console.log(`[RealtimeContext] Already processing an event, skipping ${eventType}`);
          return;
        }

        // Check for duplicates
        const shouldProcess = notificationDedup.shouldSendNotification({
          type: `realtime_${eventType}`,
          userId: user.id,
          metadata: JSON.stringify(payload),
        });

        if (!shouldProcess) {
          console.log(`[RealtimeContext] Duplicate ${eventType} event blocked`);
          return;
        }

        try {
          processingEventRef.current = true;
          console.log(`[RealtimeContext] Processing ${eventType} event:`, payload);
          setLastUpdate(new Date());
          
          // Refresh user data
          await refreshUser();

          // Send notification
          await notificationFn();
        } catch (error) {
          console.error(`[RealtimeContext] Error processing ${eventType}:`, error);
        } finally {
          processingEventRef.current = false;
        }
      };

      // Listen for user data updates
      channel
        .on('broadcast', { event: 'user_updated' }, async (payload: any) => {
          await handleEvent('user_updated', payload, async () => {
            await notificationService.sendLocalNotification({
              title: '🔄 Actualización de Cuenta',
              body: payload.message || 'Tu información de cuenta ha sido actualizada',
              data: {
                type: 'user_update',
                timestamp: new Date().toISOString(),
                userId: user.id,
              },
            });
          });
        })
        .on('broadcast', { event: 'balance_updated' }, async (payload: any) => {
          await handleEvent('balance_updated', payload, async () => {
            await notificationService.sendLocalNotification({
              title: '💰 Balance Actualizado',
              body: `Tu balance ha sido actualizado: ${payload.message || 'Revisa tu cuenta'}`,
              data: {
                type: 'balance_update',
                timestamp: new Date().toISOString(),
                userId: user.id,
              },
            });
          });
        })
        .on('broadcast', { event: 'kyc_status_changed' }, async (payload: any) => {
          await handleEvent('kyc_status_changed', payload, async () => {
            const statusEmoji = payload.status === 'approved' ? '✅' : payload.status === 'rejected' ? '❌' : '⏳';
            await notificationService.sendLocalNotification({
              title: `${statusEmoji} Estado KYC Actualizado`,
              body: payload.message || `Tu verificación KYC ha sido ${payload.status}`,
              data: {
                type: 'kyc_update',
                status: payload.status,
                timestamp: new Date().toISOString(),
                userId: user.id,
              },
            });
          });
        })
        .on('broadcast', { event: 'withdrawal_status_changed' }, async (payload: any) => {
          await handleEvent('withdrawal_status_changed', payload, async () => {
            const statusEmoji = payload.status === 'completed' ? '✅' : payload.status === 'rejected' ? '❌' : '⏳';
            await notificationService.sendLocalNotification({
              title: `${statusEmoji} Estado de Retiro Actualizado`,
              body: payload.message || `Tu solicitud de retiro ha sido ${payload.status}`,
              data: {
                type: 'withdrawal_update',
                status: payload.status,
                timestamp: new Date().toISOString(),
                userId: user.id,
              },
            });
          });
        })
        .on('broadcast', { event: 'payment_confirmed' }, async (payload: any) => {
          await handleEvent('payment_confirmed', payload, async () => {
            await notificationService.sendLocalNotification({
              title: '✅ Pago Confirmado',
              body: payload.message || 'Tu pago ha sido confirmado exitosamente',
              data: {
                type: 'payment_confirmed',
                timestamp: new Date().toISOString(),
                userId: user.id,
              },
            });
          });
        })
        .on('broadcast', { event: 'commission_earned' }, async (payload: any) => {
          await handleEvent('commission_earned', payload, async () => {
            await notificationService.sendLocalNotification({
              title: '💵 Nueva Comisión',
              body: payload.message || 'Has ganado una nueva comisión',
              data: {
                type: 'commission_earned',
                timestamp: new Date().toISOString(),
                userId: user.id,
              },
            });
          });
        })
        .on('broadcast', { event: 'ambassador_level_updated' }, async (payload: any) => {
          await handleEvent('ambassador_level_updated', payload, async () => {
            await notificationService.sendLocalNotification({
              title: '🏆 Nivel de Embajador Actualizado',
              body: payload.message || 'Tu nivel de embajador ha sido actualizado',
              data: {
                type: 'ambassador_update',
                timestamp: new Date().toISOString(),
                userId: user.id,
              },
            });
          });
        })
        .on('broadcast', { event: 'admin_message' }, async (payload: any) => {
          await handleEvent('admin_message', payload, async () => {
            await notificationService.sendLocalNotification({
              title: '📢 Mensaje del Administrador',
              body: payload.message || 'Tienes un nuevo mensaje del administrador',
              data: {
                type: 'admin_message',
                timestamp: new Date().toISOString(),
                userId: user.id,
              },
            });
          });
        })
        .subscribe(async (status, err) => {
          console.log('Realtime subscription status:', status);
          
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
            console.log('✅ Connected to realtime updates');
          } else if (status === 'CHANNEL_ERROR') {
            setIsConnected(false);
            console.error('❌ Realtime channel error:', err);
          } else if (status === 'CLOSED') {
            setIsConnected(false);
            console.log('🔌 Realtime channel closed');
          }
        });
    };

    setupRealtimeSubscription();

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        console.log('Cleaning up realtime subscription');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setIsConnected(false);
    };
  }, [user, refreshUser]);

  return (
    <RealtimeContext.Provider value={{ isConnected, lastUpdate }}>
      {children}
    </RealtimeContext.Provider>
  );
}
