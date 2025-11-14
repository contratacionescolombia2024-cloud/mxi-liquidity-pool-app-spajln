
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface UserData {
  id: string;
  name: string;
  email: string;
  id_number: string;
  mxi_balance: number;
  usdt_contributed: number;
  is_active_contributor: boolean;
  kyc_status: string;
  active_referrals: number;
  joined_date: string;
  referral_code: string;
}

type ActionType = 'add_mxi' | 'add_usdt' | 'set_balance' | null;

export default function UserManagementScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'kyc_approved'>('all');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  
  // Input modal states
  const [inputModalVisible, setInputModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [currentAction, setCurrentAction] = useState<ActionType>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, filterStatus, users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, id_number, mxi_balance, usdt_contributed, is_active_contributor, kyc_status, active_referrals, joined_date, referral_code')
        .order('joined_date', { ascending: false });

      if (error) throw error;

      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Apply status filter
    if (filterStatus === 'active') {
      filtered = filtered.filter(u => u.is_active_contributor);
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter(u => !u.is_active_contributor);
    } else if (filterStatus === 'kyc_approved') {
      filtered = filtered.filter(u => u.kyc_status === 'approved');
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.id_number.toLowerCase().includes(query) ||
        u.referral_code.toLowerCase().includes(query)
      );
    }

    setFilteredUsers(filtered);
  };

  const handleUserPress = (userData: UserData) => {
    setSelectedUser(userData);
    setDetailsModalVisible(true);
  };

  const openInputModal = (action: ActionType) => {
    setCurrentAction(action);
    setInputValue('');
    setInputModalVisible(true);
  };

  const closeInputModal = () => {
    setInputModalVisible(false);
    setInputValue('');
    setCurrentAction(null);
  };

  const handleInputSubmit = async () => {
    if (!selectedUser || !currentAction) return;

    const amount = parseFloat(inputValue);
    if (isNaN(amount) || amount < 0) {
      Alert.alert('Error', 'Please enter a valid positive number');
      return;
    }

    setProcessing(true);

    try {
      if (currentAction === 'add_mxi') {
        await handleAddFunds(selectedUser.id, amount, 'mxi');
      } else if (currentAction === 'add_usdt') {
        await handleAddFunds(selectedUser.id, amount, 'usdt');
      } else if (currentAction === 'set_balance') {
        await handleUpdateBalance(selectedUser.id, amount);
      }
      closeInputModal();
    } catch (error) {
      console.error('Error processing action:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateBalance = async (userId: string, newBalance: number) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ mxi_balance: newBalance })
        .eq('id', userId);

      if (error) throw error;

      Alert.alert('✅ Success', 'User balance updated successfully');
      loadUsers();
      setDetailsModalVisible(false);
    } catch (error) {
      console.error('Error updating balance:', error);
      Alert.alert('❌ Error', 'Failed to update user balance');
    }
  };

  const handleAddFunds = async (userId: string, amount: number, type: 'mxi' | 'usdt') => {
    try {
      const userToUpdate = users.find(u => u.id === userId);
      if (!userToUpdate) return;

      const updates: any = {};
      
      if (type === 'mxi') {
        updates.mxi_balance = parseFloat(userToUpdate.mxi_balance.toString()) + amount;
      } else {
        updates.usdt_contributed = parseFloat(userToUpdate.usdt_contributed.toString()) + amount;
      }

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;

      Alert.alert('✅ Success', `${amount} ${type.toUpperCase()} added successfully`);
      loadUsers();
      setDetailsModalVisible(false);
    } catch (error) {
      console.error('Error adding funds:', error);
      Alert.alert('❌ Error', 'Failed to add funds');
    }
  };

  const handleToggleActiveStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active_contributor: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      Alert.alert('✅ Success', 'User status updated successfully');
      loadUsers();
      setDetailsModalVisible(false);
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('❌ Error', 'Failed to update user status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return colors.success;
      case 'pending': return colors.warning;
      case 'rejected': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getInputModalTitle = () => {
    switch (currentAction) {
      case 'add_mxi': return '💎 Add MXI Funds';
      case 'add_usdt': return '💵 Add USDT Contribution';
      case 'set_balance': return '⚖️ Set MXI Balance';
      default: return 'Enter Amount';
    }
  };

  const getInputModalPlaceholder = () => {
    switch (currentAction) {
      case 'add_mxi': return 'Enter MXI amount to add';
      case 'add_usdt': return 'Enter USDT amount to add';
      case 'set_balance': return 'Enter new MXI balance';
      default: return 'Enter amount';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading users...</Text>
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
          <IconSymbol 
            ios_icon_name="chevron.left" 
            android_material_icon_name="arrow_back" 
            size={24} 
            color={colors.text} 
          />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>👥 User Management</Text>
          <Text style={styles.subtitle}>{filteredUsers.length} users</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <IconSymbol 
            ios_icon_name="magnifyingglass" 
            android_material_icon_name="search" 
            size={20} 
            color={colors.textSecondary} 
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, email, ID, or referral code..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <IconSymbol 
                ios_icon_name="xmark.circle.fill" 
                android_material_icon_name="cancel" 
                size={20} 
                color={colors.textSecondary} 
              />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filterStatus === 'all' && styles.filterButtonActive]}
            onPress={() => setFilterStatus('all')}
          >
            <Text style={[styles.filterButtonText, filterStatus === 'all' && styles.filterButtonTextActive]}>
              All Users
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, filterStatus === 'active' && styles.filterButtonActive]}
            onPress={() => setFilterStatus('active')}
          >
            <Text style={[styles.filterButtonText, filterStatus === 'active' && styles.filterButtonTextActive]}>
              Active Contributors
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, filterStatus === 'inactive' && styles.filterButtonActive]}
            onPress={() => setFilterStatus('inactive')}
          >
            <Text style={[styles.filterButtonText, filterStatus === 'inactive' && styles.filterButtonTextActive]}>
              Inactive
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, filterStatus === 'kyc_approved' && styles.filterButtonActive]}
            onPress={() => setFilterStatus('kyc_approved')}
          >
            <Text style={[styles.filterButtonText, filterStatus === 'kyc_approved' && styles.filterButtonTextActive]}>
              KYC Approved
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol 
              ios_icon_name="person.slash" 
              android_material_icon_name="person_off" 
              size={64} 
              color={colors.textSecondary} 
            />
            <Text style={styles.emptyText}>No users found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
          </View>
        ) : (
          filteredUsers.map((userData) => (
            <TouchableOpacity
              key={userData.id}
              style={[commonStyles.card, styles.userCard]}
              onPress={() => handleUserPress(userData)}
            >
              <View style={styles.userCardHeader}>
                <View style={styles.userInfo}>
                  <View style={styles.userAvatar}>
                    <IconSymbol 
                      ios_icon_name={userData.is_active_contributor ? "person.fill" : "person"} 
                      android_material_icon_name={userData.is_active_contributor ? "person" : "person_outline"}
                      size={24} 
                      color={userData.is_active_contributor ? colors.primary : colors.textSecondary} 
                    />
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{userData.name}</Text>
                    <Text style={styles.userEmail}>{userData.email}</Text>
                    <Text style={styles.userCode}>Code: {userData.referral_code}</Text>
                  </View>
                </View>
                <View style={styles.userBadges}>
                  {userData.is_active_contributor && (
                    <View style={[styles.statusBadge, { backgroundColor: colors.success + '20' }]}>
                      <Text style={[styles.statusBadgeText, { color: colors.success }]}>Active</Text>
                    </View>
                  )}
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(userData.kyc_status) + '20' }]}>
                    <Text style={[styles.statusBadgeText, { color: getStatusColor(userData.kyc_status) }]}>
                      {userData.kyc_status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.userStats}>
                <View style={styles.userStat}>
                  <IconSymbol 
                    ios_icon_name="bitcoinsign.circle" 
                    android_material_icon_name="currency_bitcoin" 
                    size={16} 
                    color={colors.primary} 
                  />
                  <Text style={styles.userStatValue}>{parseFloat(userData.mxi_balance.toString()).toFixed(2)} MXI</Text>
                </View>
                <View style={styles.userStat}>
                  <IconSymbol 
                    ios_icon_name="dollarsign.circle" 
                    android_material_icon_name="attach_money" 
                    size={16} 
                    color={colors.success} 
                  />
                  <Text style={styles.userStatValue}>${parseFloat(userData.usdt_contributed.toString()).toFixed(2)}</Text>
                </View>
                <View style={styles.userStat}>
                  <IconSymbol 
                    ios_icon_name="person.2" 
                    android_material_icon_name="group" 
                    size={16} 
                    color={colors.warning} 
                  />
                  <Text style={styles.userStatValue}>{userData.active_referrals} refs</Text>
                </View>
              </View>

              <View style={styles.userFooter}>
                <Text style={styles.userJoinDate}>Joined {formatDate(userData.joined_date)}</Text>
                <IconSymbol 
                  ios_icon_name="chevron.right" 
                  android_material_icon_name="chevron_right" 
                  size={16} 
                  color={colors.textSecondary} 
                />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* User Details Modal */}
      <Modal
        visible={detailsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>👤 User Details</Text>
              <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
                <IconSymbol 
                  ios_icon_name="xmark.circle.fill" 
                  android_material_icon_name="cancel" 
                  size={28} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>

            {selectedUser && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>📋 Personal Information</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Name:</Text>
                    <Text style={styles.detailValue}>{selectedUser.name}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Email:</Text>
                    <Text style={styles.detailValue}>{selectedUser.email}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>ID Number:</Text>
                    <Text style={styles.detailValue}>{selectedUser.id_number}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Referral Code:</Text>
                    <Text style={styles.detailValue}>{selectedUser.referral_code}</Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>📊 Account Status</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>KYC Status:</Text>
                    <Text style={[styles.detailValue, { color: getStatusColor(selectedUser.kyc_status) }]}>
                      {selectedUser.kyc_status.toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Active Contributor:</Text>
                    <Text style={[styles.detailValue, { color: selectedUser.is_active_contributor ? colors.success : colors.error }]}>
                      {selectedUser.is_active_contributor ? 'Yes' : 'No'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Joined Date:</Text>
                    <Text style={styles.detailValue}>{formatDate(selectedUser.joined_date)}</Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>💰 Financial Information</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>MXI Balance:</Text>
                    <Text style={styles.detailValue}>{parseFloat(selectedUser.mxi_balance.toString()).toFixed(2)} MXI</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>USDT Contributed:</Text>
                    <Text style={styles.detailValue}>${parseFloat(selectedUser.usdt_contributed.toString()).toFixed(2)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Active Referrals:</Text>
                    <Text style={styles.detailValue}>{selectedUser.active_referrals}</Text>
                  </View>
                </View>

                <View style={styles.actionSection}>
                  <Text style={styles.detailSectionTitle}>⚙️ Admin Actions</Text>
                  
                  <TouchableOpacity
                    style={[buttonStyles.primary, styles.actionButton]}
                    onPress={() => openInputModal('add_mxi')}
                  >
                    <Text style={styles.actionButtonEmoji}>💎</Text>
                    <Text style={buttonStyles.primaryText}>Add MXI Funds</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[buttonStyles.primary, styles.actionButton]}
                    onPress={() => openInputModal('add_usdt')}
                  >
                    <Text style={styles.actionButtonEmoji}>💵</Text>
                    <Text style={buttonStyles.primaryText}>Add USDT Contribution</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[buttonStyles.secondary, styles.actionButton]}
                    onPress={() => openInputModal('set_balance')}
                  >
                    <Text style={styles.actionButtonEmoji}>⚖️</Text>
                    <Text style={buttonStyles.secondaryText}>Set MXI Balance</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[buttonStyles.secondary, styles.actionButton]}
                    onPress={() => {
                      Alert.alert(
                        selectedUser.is_active_contributor ? '⏸️ Deactivate User' : '▶️ Activate User',
                        `Are you sure you want to ${selectedUser.is_active_contributor ? 'deactivate' : 'activate'} this user?`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Confirm',
                            onPress: () => handleToggleActiveStatus(selectedUser.id, selectedUser.is_active_contributor),
                          },
                        ]
                      );
                    }}
                  >
                    <Text style={styles.actionButtonEmoji}>
                      {selectedUser.is_active_contributor ? '⏸️' : '▶️'}
                    </Text>
                    <Text style={buttonStyles.secondaryText}>
                      {selectedUser.is_active_contributor ? 'Deactivate User' : 'Activate User'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Input Modal */}
      <Modal
        visible={inputModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeInputModal}
      >
        <View style={styles.inputModalOverlay}>
          <View style={styles.inputModalContent}>
            <Text style={styles.inputModalTitle}>{getInputModalTitle()}</Text>
            
            <TextInput
              style={styles.inputModalInput}
              placeholder={getInputModalPlaceholder()}
              placeholderTextColor={colors.textSecondary}
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType="decimal-pad"
              autoFocus
            />

            <View style={styles.inputModalButtons}>
              <TouchableOpacity
                style={[styles.inputModalButton, styles.inputModalButtonCancel]}
                onPress={closeInputModal}
                disabled={processing}
              >
                <Text style={styles.inputModalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.inputModalButton, styles.inputModalButtonConfirm]}
                onPress={handleInputSubmit}
                disabled={processing || !inputValue}
              >
                {processing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.inputModalButtonTextConfirm}>Confirm</Text>
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
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  filterContainer: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  userCard: {
    marginBottom: 12,
    padding: 16,
  },
  userCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  userCode: {
    fontSize: 11,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  userBadges: {
    gap: 4,
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  userStats: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userStatValue: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
  },
  userFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  userJoinDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  modalBody: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  actionSection: {
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  actionButtonEmoji: {
    fontSize: 20,
  },
  inputModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  inputModalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  inputModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputModalInput: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: 20,
  },
  inputModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  inputModalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputModalButtonCancel: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
  },
  inputModalButtonConfirm: {
    backgroundColor: colors.primary,
  },
  inputModalButtonTextCancel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  inputModalButtonTextConfirm: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
