
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { supabase } from '@/lib/supabase';

interface LotteryRound {
  id: string;
  round_number: number;
  ticket_price: number;
  max_tickets: number;
  tickets_sold: number;
  total_pool: number;
  prize_amount: number;
  status: 'open' | 'locked' | 'drawn' | 'completed';
  winner_user_id: string | null;
  drawn_at: string | null;
  created_at: string;
}

interface UserTicket {
  id: string;
  ticket_number: number;
  quantity: number;
  total_cost: number;
  purchased_at: string;
}

export default function BonusMXIScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [currentRound, setCurrentRound] = useState<LotteryRound | null>(null);
  const [userTickets, setUserTickets] = useState<UserTicket[]>([]);
  const [ticketQuantity, setTicketQuantity] = useState('1');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    loadLotteryData();
    setupRealtimeSubscription();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  const setupRealtimeSubscription = async () => {
    if (channelRef.current?.state === 'subscribed') return;

    const channel = supabase.channel('lottery:updates', {
      config: { private: false }
    });
    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'INSERT' }, () => {
        console.log('Bonus MXI round created');
        loadLotteryData();
      })
      .on('broadcast', { event: 'UPDATE' }, () => {
        console.log('Bonus MXI round updated');
        loadLotteryData();
      })
      .subscribe();
  };

  const loadLotteryData = async () => {
    try {
      setLoading(true);

      // Get current round
      const { data: roundData, error: roundError } = await supabase
        .from('lottery_rounds')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (roundError && roundError.code !== 'PGRST116') {
        console.error('Error loading bonus round:', roundError);
      }

      if (roundData) {
        setCurrentRound(roundData);

        // Get user's tickets for this round
        if (user) {
          const { data: ticketsData, error: ticketsError } = await supabase
            .from('lottery_tickets')
            .select('*')
            .eq('round_id', roundData.id)
            .eq('user_id', user.id)
            .order('ticket_number', { ascending: true });

          if (ticketsError) {
            console.error('Error loading user tickets:', ticketsError);
          } else {
            setUserTickets(ticketsData || []);
          }
        }
      } else {
        // No open round, try to create one
        const { data: newRoundId, error: createError } = await supabase
          .rpc('get_current_lottery_round');

        if (createError) {
          console.error('Error creating bonus round:', createError);
        } else if (newRoundId) {
          // Reload data
          loadLotteryData();
          return;
        }
      }
    } catch (error) {
      console.error('Exception loading bonus data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseTickets = async () => {
    if (!user || !currentRound) return;

    const quantity = parseInt(ticketQuantity);
    if (isNaN(quantity) || quantity < 1 || quantity > 20) {
      Alert.alert('Error', 'Please enter a valid quantity between 1 and 20');
      return;
    }

    const totalCost = currentRound.ticket_price * quantity;
    if (user.mxiBalance < totalCost) {
      Alert.alert(
        'Insufficient Balance',
        `You need ${totalCost.toFixed(2)} MXI to purchase ${quantity} ticket(s). Your current balance is ${user.mxiBalance.toFixed(2)} MXI.`
      );
      return;
    }

    Alert.alert(
      'Confirm Purchase',
      `Purchase ${quantity} ticket(s) for ${totalCost.toFixed(2)} MXI?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Purchase',
          onPress: async () => {
            try {
              setPurchasing(true);
              setShowPurchaseModal(false);

              const { data, error } = await supabase.rpc('purchase_lottery_tickets', {
                p_user_id: user.id,
                p_quantity: quantity,
              });

              if (error) {
                console.error('Purchase error:', error);
                Alert.alert('Error', error.message || 'Failed to purchase tickets');
                return;
              }

              if (!data.success) {
                Alert.alert('Error', data.error || 'Failed to purchase tickets');
                return;
              }

              Alert.alert(
                'Success!',
                `Successfully purchased ${data.tickets_purchased} ticket(s) for ${data.total_cost.toFixed(2)} MXI!`
              );

              // Reload data
              await loadLotteryData();
              
              // Reload user data to update balance
              if (user) {
                const { data: userData } = await supabase
                  .from('users')
                  .select('mxi_balance')
                  .eq('id', user.id)
                  .single();

                if (userData) {
                  // Update user context would be ideal here
                  console.log('New balance:', userData.mxi_balance);
                }
              }
            } catch (error: any) {
              console.error('Purchase exception:', error);
              Alert.alert('Error', error.message || 'Failed to purchase tickets');
            } finally {
              setPurchasing(false);
            }
          },
        },
      ]
    );
  };

  const getProgressPercentage = () => {
    if (!currentRound) return 0;
    return (currentRound.tickets_sold / currentRound.max_tickets) * 100;
  };

  const getUserTicketCount = () => {
    return userTickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol ios_icon_name="chevron.left" android_material_icon_name="arrow_back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bonus MXI</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading bonus...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentRound) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol ios_icon_name="chevron.left" android_material_icon_name="arrow_back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bonus MXI</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No active bonus round</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol ios_icon_name="chevron.left" android_material_icon_name="arrow_back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bonus MXI</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Current Round Card */}
        <View style={[commonStyles.card, styles.roundCard]}>
          <View style={styles.roundHeader}>
            <View style={styles.roundIconContainer}>
              <Text style={styles.roundIconEmoji}>🎰</Text>
            </View>
            <View style={styles.roundHeaderText}>
              <Text style={styles.roundTitle}>Round #{currentRound.round_number}</Text>
              <Text style={styles.roundStatus}>
                {currentRound.status === 'open' ? '🟢 Open' : '🔒 Locked'}
              </Text>
            </View>
          </View>

          <View style={styles.prizeContainer}>
            <Text style={styles.prizeLabel}>Prize Pool (90%)</Text>
            <Text style={styles.prizeAmount}>{currentRound.prize_amount.toFixed(2)} MXI</Text>
            <Text style={styles.totalPool}>Total Pool: {currentRound.total_pool.toFixed(2)} MXI</Text>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Tickets Sold</Text>
              <Text style={styles.progressValue}>
                {currentRound.tickets_sold} / {currentRound.max_tickets}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${getProgressPercentage()}%` }]} />
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Ticket Price</Text>
              <Text style={styles.statValue}>{currentRound.ticket_price} MXI</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Your Tickets</Text>
              <Text style={styles.statValue}>{getUserTicketCount()}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Your Balance</Text>
              <Text style={styles.statValue}>{user?.mxiBalance.toFixed(2)} MXI</Text>
            </View>
          </View>
        </View>

        {/* Purchase Section */}
        {currentRound.status === 'open' && (
          <View style={commonStyles.card}>
            <Text style={styles.sectionTitle}>Purchase Tickets</Text>
            <Text style={styles.sectionSubtitle}>
              Buy between 1 and 20 tickets. Maximum 20 tickets per user per round.
            </Text>

            <TouchableOpacity
              style={[buttonStyles.primary, styles.purchaseButton]}
              onPress={() => setShowPurchaseModal(true)}
              disabled={purchasing}
            >
              {purchasing ? (
                <ActivityIndicator color="#000" />
              ) : (
                <React.Fragment>
                  <IconSymbol ios_icon_name="ticket.fill" android_material_icon_name="confirmation_number" size={20} color="#000" />
                  <Text style={buttonStyles.primaryText}>Buy Tickets</Text>
                </React.Fragment>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Your Tickets */}
        {userTickets.length > 0 && (
          <View style={commonStyles.card}>
            <Text style={styles.sectionTitle}>Your Tickets</Text>
            <View style={styles.ticketsList}>
              {userTickets.map((ticket, index) => (
                <View key={ticket.id} style={styles.ticketItem}>
                  <View style={styles.ticketNumber}>
                    <Text style={styles.ticketNumberText}>#{ticket.ticket_number}</Text>
                  </View>
                  <View style={styles.ticketDetails}>
                    <Text style={styles.ticketCost}>{ticket.total_cost.toFixed(2)} MXI</Text>
                    <Text style={styles.ticketDate}>
                      {new Date(ticket.purchased_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* How It Works */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>1.</Text>
              <Text style={styles.infoText}>Each ticket costs 2 MXI</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>2.</Text>
              <Text style={styles.infoText}>Buy between 1 and 20 tickets per round</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>3.</Text>
              <Text style={styles.infoText}>Round locks when 1000 tickets are sold</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>4.</Text>
              <Text style={styles.infoText}>Winner receives 90% of the total pool</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>5.</Text>
              <Text style={styles.infoText}>Winner announced on social media</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Purchase Modal */}
      <Modal
        visible={showPurchaseModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPurchaseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Purchase Tickets</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Number of Tickets (1-20)</Text>
              <TextInput
                style={styles.input}
                value={ticketQuantity}
                onChangeText={setTicketQuantity}
                keyboardType="number-pad"
                placeholder="Enter quantity"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.costSummary}>
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Tickets:</Text>
                <Text style={styles.costValue}>{ticketQuantity || 0}</Text>
              </View>
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Price per ticket:</Text>
                <Text style={styles.costValue}>{currentRound.ticket_price} MXI</Text>
              </View>
              <View style={[styles.costRow, styles.costTotal]}>
                <Text style={styles.costTotalLabel}>Total Cost:</Text>
                <Text style={styles.costTotalValue}>
                  {(currentRound.ticket_price * (parseInt(ticketQuantity) || 0)).toFixed(2)} MXI
                </Text>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[buttonStyles.outline, styles.modalButton]}
                onPress={() => setShowPurchaseModal(false)}
              >
                <Text style={buttonStyles.outlineText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[buttonStyles.primary, styles.modalButton]}
                onPress={handlePurchaseTickets}
                disabled={purchasing}
              >
                {purchasing ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={buttonStyles.primaryText}>Purchase</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
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
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  roundCard: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  roundHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  roundIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  roundIconEmoji: {
    fontSize: 32,
  },
  roundHeaderText: {
    flex: 1,
  },
  roundTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  roundStatus: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  prizeContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  prizeLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  prizeAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  totalPool: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  progressSection: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  purchaseButton: {
    marginTop: 8,
  },
  ticketsList: {
    gap: 12,
  },
  ticketItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ticketNumber: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  ticketNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  ticketDetails: {
    flex: 1,
  },
  ticketCost: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  ticketDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  infoList: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoBullet: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginRight: 12,
    width: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  costSummary: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  costLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  costValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  costTotal: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: 0,
  },
  costTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  costTotalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});
