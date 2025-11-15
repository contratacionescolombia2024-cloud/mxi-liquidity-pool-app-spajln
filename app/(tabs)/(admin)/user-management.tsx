
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
  referred_by: string | null;
  can_withdraw: boolean;
  last_withdrawal_date: string | null;
  yield_rate_per_minute: number;
  accumulated_yield: number;
  last_yield_update: string;
  mxi_purchased_directly: number;
  mxi_from_unified_commissions: number;
  is_blocked: boolean;
  blocked_at: string | null;
  blocked_reason: string | null;
}

interface Commission {
  id: string;
  amount: number;
  level: number;
  status: string;
  from_user_id: string;
  created_at: string;
}

interface Referral {
  id: string;
  referred_id: string;
  level: number;
  created_at: string;
  referred_user_name: string;
}

interface DefaultSettings {
  mxiPrice: number;
  miningRatePerMinute: number;
  minActiveReferrals: number;
  withdrawalReleasePercentage: number;
  withdrawalReleaseDays: number;
  minPurchase: number;
  maxPurchase: number;
  currentPhase: number;
  currentPriceUsdt: number;
}

type ActionType = 
  | 'add_mxi' 
  | 'remove_mxi' 
  | 'add_usdt' 
  | 'remove_usdt' 
  | 'set_mxi_balance' 
  | 'set_usdt_balance'
  | 'set_active_referrals'
  | 'set_yield_rate'
  | 'set_accumulated_yield'
  | 'add_commission'
  | 'edit_commission'
  | 'delete_referral'
  | 'set_mxi_purchased'
  | 'set_mxi_from_commissions'
  | 'edit_user_data'
  | null;

export default function UserManagementScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'kyc_approved' | 'blocked'>('all');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [defaultSettings, setDefaultSettings] = useState<DefaultSettings | null>(null);
  
  // User details data
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // Input modal states
  const [inputModalVisible, setInputModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inputValue2, setInputValue2] = useState('');
  const [currentAction, setCurrentAction] = useState<ActionType>(null);
  const [processing, setProcessing] = useState(false);
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);

  // Edit user data modal
  const [editDataModalVisible, setEditDataModalVisible] = useState(false);
  const [editingField, setEditingField] = useState<string>('');
  const [editingValue, setEditingValue] = useState<string>('');

  useEffect(() => {
    loadDefaultSettings();
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, filterStatus, users]);

  const loadDefaultSettings = async () => {
    try {
      const { data: settingsData, error: settingsError } = await supabase
        .from('admin_settings')
        .select('*');

      if (settingsError) throw settingsError;

      const { data: metricsData, error: metricsError } = await supabase
        .from('metrics')
        .select('*')
        .single();

      if (metricsError) throw metricsError;

      const settings: any = {};
      settingsData?.forEach((setting) => {
        const value = setting.setting_value?.value ?? setting.setting_value;
        settings[setting.setting_key] = value;
      });

      setDefaultSettings({
        mxiPrice: parseFloat(settings.mxi_price?.toString() || '0.4'),
        miningRatePerMinute: parseFloat(settings.mining_rate_per_minute?.toString() || '0.0001'),
        minActiveReferrals: parseInt(settings.min_active_referrals?.toString() || '5'),
        withdrawalReleasePercentage: parseFloat(settings.withdrawal_release_percentage?.toString() || '10'),
        withdrawalReleaseDays: parseInt(settings.withdrawal_release_days?.toString() || '7'),
        minPurchase: parseFloat(settings.min_purchase?.toString() || '20'),
        maxPurchase: parseFloat(settings.max_purchase?.toString() || '40000'),
        currentPhase: metricsData?.current_phase || 1,
        currentPriceUsdt: parseFloat(metricsData?.current_price_usdt?.toString() || '0.4'),
      });

      console.log('Default settings loaded:', settings);
    } catch (error) {
      console.error('Error loading default settings:', error);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
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

    if (filterStatus === 'active') {
      filtered = filtered.filter(u => u.is_active_contributor && !u.is_blocked);
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter(u => !u.is_active_contributor && !u.is_blocked);
    } else if (filterStatus === 'kyc_approved') {
      filtered = filtered.filter(u => u.kyc_status === 'approved' && !u.is_blocked);
    } else if (filterStatus === 'blocked') {
      filtered = filtered.filter(u => u.is_blocked);
    }

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

  const handleUserPress = async (userData: UserData) => {
    setSelectedUser(userData);
    setDetailsModalVisible(true);
    await loadUserDetails(userData.id);
  };

  const loadUserDetails = async (userId: string) => {
    try {
      setLoadingDetails(true);

      const { data: commissionsData, error: commissionsError } = await supabase
        .from('commissions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (commissionsError) throw commissionsError;
      setCommissions(commissionsData || []);

      const { data: referralsData, error: referralsError } = await supabase
        .from('referrals')
        .select(`
          id,
          referred_id,
          level,
          created_at,
          referred:users!referrals_referred_id_fkey(name)
        `)
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false });

      if (referralsError) throw referralsError;
      
      const mappedReferrals = (referralsData || []).map(r => ({
        id: r.id,
        referred_id: r.referred_id,
        level: r.level,
        created_at: r.created_at,
        referred_user_name: (r.referred as any)?.name || 'Unknown',
      }));
      
      setReferrals(mappedReferrals);
    } catch (error) {
      console.error('Error loading user details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleBlockUser = async (userId: string, reason?: string) => {
    if (!user) return;

    Alert.alert(
      '🚫 Block User Account',
      'Are you sure you want to block this user? They will not be able to access their account or participate in any activities.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessing(true);
              const { data, error } = await supabase.rpc('block_user_account', {
                p_user_id: userId,
                p_admin_id: user.id,
                p_reason: reason || 'Blocked by administrator'
              });

              if (error) throw error;

              if (data?.success) {
                Alert.alert('✅ Success', 'User account blocked successfully');
                await loadUsers();
                if (selectedUser?.id === userId) {
                  const updatedUser = users.find(u => u.id === userId);
                  if (updatedUser) setSelectedUser(updatedUser);
                }
              } else {
                Alert.alert('❌ Error', data?.error || 'Failed to block user');
              }
            } catch (error) {
              console.error('Error blocking user:', error);
              Alert.alert('❌ Error', 'Failed to block user account');
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  const handleUnblockUser = async (userId: string) => {
    if (!user) return;

    Alert.alert(
      '✅ Unblock User Account',
      'Are you sure you want to unblock this user? They will regain access to their account.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          onPress: async () => {
            try {
              setProcessing(true);
              const { data, error } = await supabase.rpc('unblock_user_account', {
                p_user_id: userId,
                p_admin_id: user.id
              });

              if (error) throw error;

              if (data?.success) {
                Alert.alert('✅ Success', 'User account unblocked successfully');
                await loadUsers();
                if (selectedUser?.id === userId) {
                  const updatedUser = users.find(u => u.id === userId);
                  if (updatedUser) setSelectedUser(updatedUser);
                }
              } else {
                Alert.alert('❌ Error', data?.error || 'Failed to unblock user');
              }
            } catch (error) {
              console.error('Error unblocking user:', error);
              Alert.alert('❌ Error', 'Failed to unblock user account');
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteUser = async (userId: string) => {
    if (!user) return;

    Alert.alert(
      '🗑️ Delete User Account',
      'WARNING: This will permanently delete the user account and anonymize their data. This action cannot be undone. Are you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessing(true);
              const { data, error } = await supabase.rpc('soft_delete_user_account', {
                p_user_id: userId,
                p_admin_id: user.id,
                p_reason: 'Account deleted by administrator'
              });

              if (error) throw error;

              if (data?.success) {
                Alert.alert('✅ Success', `User account deleted successfully.\nOriginal email: ${data.original_email}`);
                setDetailsModalVisible(false);
                await loadUsers();
              } else {
                Alert.alert('❌ Error', data?.error || 'Failed to delete user');
              }
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert('❌ Error', 'Failed to delete user account');
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  const openEditDataModal = (field: string, currentValue: any) => {
    setEditingField(field);
    setEditingValue(currentValue?.toString() || '');
    setEditDataModalVisible(true);
  };

  const handleSaveEditedData = async () => {
    if (!selectedUser || !user || !editingField) return;

    try {
      setProcessing(true);
      
      const updates: any = {};
      updates[editingField] = editingValue;

      const { data, error } = await supabase.rpc('admin_update_user_data', {
        p_user_id: selectedUser.id,
        p_admin_id: user.id,
        p_updates: updates
      });

      if (error) throw error;

      if (data?.success) {
        Alert.alert('✅ Success', 'User data updated successfully');
        setEditDataModalVisible(false);
        await loadUsers();
        await loadUserDetails(selectedUser.id);
        const updatedUser = users.find(u => u.id === selectedUser.id);
        if (updatedUser) setSelectedUser(updatedUser);
      } else {
        Alert.alert('❌ Error', data?.error || 'Failed to update user data');
      }
    } catch (error) {
      console.error('Error updating user data:', error);
      Alert.alert('❌ Error', 'Failed to update user data');
    } finally {
      setProcessing(false);
    }
  };

  const openInputModal = (action: ActionType, commission?: Commission) => {
    setCurrentAction(action);
    setInputValue('');
    setInputValue2('');
    setSelectedCommission(commission || null);
    
    if (action === 'edit_commission' && commission) {
      setInputValue(commission.amount.toString());
      setInputValue2(commission.status);
    }
    
    setInputModalVisible(true);
  };

  const closeInputModal = () => {
    setInputModalVisible(false);
    setInputValue('');
    setInputValue2('');
    setCurrentAction(null);
    setSelectedCommission(null);
  };

  const handleInputSubmit = async () => {
    if (!selectedUser || !currentAction) return;

    setProcessing(true);

    try {
      switch (currentAction) {
        case 'add_mxi':
          await handleAddBalance('mxi', parseFloat(inputValue));
          break;
        case 'remove_mxi':
          await handleRemoveBalance('mxi', parseFloat(inputValue));
          break;
        case 'add_usdt':
          await handleAddBalance('usdt', parseFloat(inputValue));
          break;
        case 'remove_usdt':
          await handleRemoveBalance('usdt', parseFloat(inputValue));
          break;
        case 'set_mxi_balance':
          await handleSetBalance('mxi', parseFloat(inputValue));
          break;
        case 'set_usdt_balance':
          await handleSetBalance('usdt', parseFloat(inputValue));
          break;
        case 'set_active_referrals':
          await handleSetActiveReferrals(parseInt(inputValue));
          break;
        case 'set_yield_rate':
          await handleSetYieldRate(parseFloat(inputValue));
          break;
        case 'set_accumulated_yield':
          await handleSetAccumulatedYield(parseFloat(inputValue));
          break;
        case 'add_commission':
          await handleAddCommission(parseFloat(inputValue), parseInt(inputValue2));
          break;
        case 'edit_commission':
          await handleEditCommission();
          break;
        case 'set_mxi_purchased':
          await handleSetMxiPurchased(parseFloat(inputValue));
          break;
        case 'set_mxi_from_commissions':
          await handleSetMxiFromCommissions(parseFloat(inputValue));
          break;
      }
      closeInputModal();
    } catch (error) {
      console.error('Error processing action:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleAddBalance = async (type: 'mxi' | 'usdt', amount: number) => {
    if (!selectedUser || isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid positive number');
      return;
    }

    try {
      const field = type === 'mxi' ? 'mxi_balance' : 'usdt_contributed';
      const currentValue = type === 'mxi' ? selectedUser.mxi_balance : selectedUser.usdt_contributed;
      const newValue = parseFloat(currentValue.toString()) + amount;

      const { error } = await supabase
        .from('users')
        .update({ [field]: newValue })
        .eq('id', selectedUser.id);

      if (error) throw error;

      Alert.alert('✅ Success', `${amount} ${type.toUpperCase()} added successfully`);
      await loadUsers();
      await loadUserDetails(selectedUser.id);
      
      const updatedUser = users.find(u => u.id === selectedUser.id);
      if (updatedUser) setSelectedUser(updatedUser);
    } catch (error) {
      console.error('Error adding balance:', error);
      Alert.alert('❌ Error', 'Failed to add balance');
    }
  };

  const handleRemoveBalance = async (type: 'mxi' | 'usdt', amount: number) => {
    if (!selectedUser || isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid positive number');
      return;
    }

    try {
      const field = type === 'mxi' ? 'mxi_balance' : 'usdt_contributed';
      const currentValue = type === 'mxi' ? selectedUser.mxi_balance : selectedUser.usdt_contributed;
      const newValue = Math.max(0, parseFloat(currentValue.toString()) - amount);

      const { error } = await supabase
        .from('users')
        .update({ [field]: newValue })
        .eq('id', selectedUser.id);

      if (error) throw error;

      Alert.alert('✅ Success', `${amount} ${type.toUpperCase()} removed successfully`);
      await loadUsers();
      await loadUserDetails(selectedUser.id);
      
      const updatedUser = users.find(u => u.id === selectedUser.id);
      if (updatedUser) setSelectedUser(updatedUser);
    } catch (error) {
      console.error('Error removing balance:', error);
      Alert.alert('❌ Error', 'Failed to remove balance');
    }
  };

  const handleSetBalance = async (type: 'mxi' | 'usdt', amount: number) => {
    if (!selectedUser || isNaN(amount) || amount < 0) {
      Alert.alert('Error', 'Please enter a valid number');
      return;
    }

    try {
      const field = type === 'mxi' ? 'mxi_balance' : 'usdt_contributed';

      const { error } = await supabase
        .from('users')
        .update({ [field]: amount })
        .eq('id', selectedUser.id);

      if (error) throw error;

      Alert.alert('✅ Success', `${type.toUpperCase()} balance set to ${amount}`);
      await loadUsers();
      await loadUserDetails(selectedUser.id);
      
      const updatedUser = users.find(u => u.id === selectedUser.id);
      if (updatedUser) setSelectedUser(updatedUser);
    } catch (error) {
      console.error('Error setting balance:', error);
      Alert.alert('❌ Error', 'Failed to set balance');
    }
  };

  const handleSetActiveReferrals = async (count: number) => {
    if (!selectedUser || isNaN(count) || count < 0) {
      Alert.alert('Error', 'Please enter a valid number');
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ active_referrals: count })
        .eq('id', selectedUser.id);

      if (error) throw error;

      Alert.alert('✅ Success', `Active referrals set to ${count}`);
      await loadUsers();
      
      const updatedUser = users.find(u => u.id === selectedUser.id);
      if (updatedUser) setSelectedUser(updatedUser);
    } catch (error) {
      console.error('Error setting active referrals:', error);
      Alert.alert('❌ Error', 'Failed to set active referrals');
    }
  };

  const handleSetYieldRate = async (rate: number) => {
    if (!selectedUser || isNaN(rate) || rate < 0) {
      Alert.alert('Error', 'Please enter a valid number');
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ yield_rate_per_minute: rate })
        .eq('id', selectedUser.id);

      if (error) throw error;

      Alert.alert('✅ Success', `Yield rate set to ${rate} MXI/minute`);
      await loadUsers();
      
      const updatedUser = users.find(u => u.id === selectedUser.id);
      if (updatedUser) setSelectedUser(updatedUser);
    } catch (error) {
      console.error('Error setting yield rate:', error);
      Alert.alert('❌ Error', 'Failed to set yield rate');
    }
  };

  const handleSetAccumulatedYield = async (amount: number) => {
    if (!selectedUser || isNaN(amount) || amount < 0) {
      Alert.alert('Error', 'Please enter a valid number');
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ accumulated_yield: amount })
        .eq('id', selectedUser.id);

      if (error) throw error;

      Alert.alert('✅ Success', `Accumulated yield set to ${amount} MXI`);
      await loadUsers();
      
      const updatedUser = users.find(u => u.id === selectedUser.id);
      if (updatedUser) setSelectedUser(updatedUser);
    } catch (error) {
      console.error('Error setting accumulated yield:', error);
      Alert.alert('❌ Error', 'Failed to set accumulated yield');
    }
  };

  const handleAddCommission = async (amount: number, level: number) => {
    if (!selectedUser || isNaN(amount) || amount <= 0 || isNaN(level) || level < 1 || level > 3) {
      Alert.alert('Error', 'Please enter valid values (amount > 0, level 1-3)');
      return;
    }

    try {
      const { error } = await supabase
        .from('commissions')
        .insert({
          user_id: selectedUser.id,
          from_user_id: selectedUser.id,
          amount: amount,
          level: level,
          percentage: level === 1 ? 3 : level === 2 ? 2 : 1,
          status: 'available',
        });

      if (error) throw error;

      Alert.alert('✅ Success', `Commission of ${amount} USDT added`);
      await loadUserDetails(selectedUser.id);
    } catch (error) {
      console.error('Error adding commission:', error);
      Alert.alert('❌ Error', 'Failed to add commission');
    }
  };

  const handleEditCommission = async () => {
    if (!selectedCommission || !inputValue || !inputValue2) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const amount = parseFloat(inputValue);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      const { error } = await supabase
        .from('commissions')
        .update({
          amount: amount,
          status: inputValue2,
        })
        .eq('id', selectedCommission.id);

      if (error) throw error;

      Alert.alert('✅ Success', 'Commission updated successfully');
      await loadUserDetails(selectedUser!.id);
    } catch (error) {
      console.error('Error editing commission:', error);
      Alert.alert('❌ Error', 'Failed to edit commission');
    }
  };

  const handleDeleteCommission = async (commissionId: string) => {
    Alert.alert(
      '🗑️ Delete Commission',
      'Are you sure you want to delete this commission?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('commissions')
                .delete()
                .eq('id', commissionId);

              if (error) throw error;

              Alert.alert('✅ Success', 'Commission deleted successfully');
              await loadUserDetails(selectedUser!.id);
            } catch (error) {
              console.error('Error deleting commission:', error);
              Alert.alert('❌ Error', 'Failed to delete commission');
            }
          },
        },
      ]
    );
  };

  const handleDeleteReferral = async (referralId: string) => {
    Alert.alert(
      '🗑️ Delete Referral',
      'Are you sure you want to delete this referral?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('referrals')
                .delete()
                .eq('id', referralId);

              if (error) throw error;

              Alert.alert('✅ Success', 'Referral deleted successfully');
              await loadUserDetails(selectedUser!.id);
            } catch (error) {
              console.error('Error deleting referral:', error);
              Alert.alert('❌ Error', 'Failed to delete referral');
            }
          },
        },
      ]
    );
  };

  const handleSetMxiPurchased = async (amount: number) => {
    if (!selectedUser || isNaN(amount) || amount < 0) {
      Alert.alert('Error', 'Please enter a valid number');
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ mxi_purchased_directly: amount })
        .eq('id', selectedUser.id);

      if (error) throw error;

      Alert.alert('✅ Success', `MXI Purchased set to ${amount}`);
      await loadUsers();
      
      const updatedUser = users.find(u => u.id === selectedUser.id);
      if (updatedUser) setSelectedUser(updatedUser);
    } catch (error) {
      console.error('Error setting MXI purchased:', error);
      Alert.alert('❌ Error', 'Failed to set MXI purchased');
    }
  };

  const handleSetMxiFromCommissions = async (amount: number) => {
    if (!selectedUser || isNaN(amount) || amount < 0) {
      Alert.alert('Error', 'Please enter a valid number');
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ mxi_from_unified_commissions: amount })
        .eq('id', selectedUser.id);

      if (error) throw error;

      Alert.alert('✅ Success', `MXI from Commissions set to ${amount}`);
      await loadUsers();
      
      const updatedUser = users.find(u => u.id === selectedUser.id);
      if (updatedUser) setSelectedUser(updatedUser);
    } catch (error) {
      console.error('Error setting MXI from commissions:', error);
      Alert.alert('❌ Error', 'Failed to set MXI from commissions');
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
      await loadUsers();
      
      const updatedUser = users.find(u => u.id === userId);
      if (updatedUser) setSelectedUser(updatedUser);
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
      case 'available': return colors.success;
      case 'withdrawn': return colors.textSecondary;
      default: return colors.textSecondary;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getInputModalTitle = () => {
    switch (currentAction) {
      case 'add_mxi': return '💎 Add MXI';
      case 'remove_mxi': return '💎 Remove MXI';
      case 'add_usdt': return '💵 Add USDT';
      case 'remove_usdt': return '💵 Remove USDT';
      case 'set_mxi_balance': return '⚖️ Set MXI Balance';
      case 'set_usdt_balance': return '⚖️ Set USDT Balance';
      case 'set_active_referrals': return '👥 Set Active Referrals';
      case 'set_yield_rate': return '📈 Set Yield Rate';
      case 'set_accumulated_yield': return '💰 Set Accumulated Yield';
      case 'add_commission': return '💸 Add Commission';
      case 'edit_commission': return '✏️ Edit Commission';
      case 'set_mxi_purchased': return '🛒 Set MXI Purchased';
      case 'set_mxi_from_commissions': return '💰 Set MXI from Commissions';
      default: return 'Enter Value';
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
              Active
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

          <TouchableOpacity
            style={[styles.filterButton, filterStatus === 'blocked' && styles.filterButtonActive]}
            onPress={() => setFilterStatus('blocked')}
          >
            <Text style={[styles.filterButtonText, filterStatus === 'blocked' && styles.filterButtonTextActive]}>
              🚫 Blocked
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
              style={[
                commonStyles.card, 
                styles.userCard,
                userData.is_blocked && styles.blockedUserCard
              ]}
              onPress={() => handleUserPress(userData)}
            >
              <View style={styles.userCardHeader}>
                <View style={styles.userInfo}>
                  <View style={[
                    styles.userAvatar,
                    userData.is_blocked && styles.blockedUserAvatar
                  ]}>
                    <IconSymbol 
                      ios_icon_name={userData.is_blocked ? "person.slash" : userData.is_active_contributor ? "person.fill" : "person"} 
                      android_material_icon_name={userData.is_blocked ? "person_off" : userData.is_active_contributor ? "person" : "person_outline"}
                      size={24} 
                      color={userData.is_blocked ? colors.error : userData.is_active_contributor ? colors.primary : colors.textSecondary} 
                    />
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{userData.name}</Text>
                    <Text style={styles.userEmail}>{userData.email}</Text>
                    <Text style={styles.userCode}>Code: {userData.referral_code}</Text>
                  </View>
                </View>
                <View style={styles.userBadges}>
                  {userData.is_blocked && (
                    <View style={[styles.statusBadge, { backgroundColor: colors.error + '20' }]}>
                      <Text style={[styles.statusBadgeText, { color: colors.error }]}>BLOCKED</Text>
                    </View>
                  )}
                  {!userData.is_blocked && userData.is_active_contributor && (
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
                {/* Account Status Warning */}
                {selectedUser.is_blocked && (
                  <View style={styles.warningBanner}>
                    <IconSymbol 
                      ios_icon_name="exclamationmark.triangle.fill" 
                      android_material_icon_name="warning" 
                      size={24} 
                      color={colors.error} 
                    />
                    <View style={styles.warningContent}>
                      <Text style={styles.warningTitle}>⚠️ Account Blocked</Text>
                      <Text style={styles.warningText}>
                        Blocked on: {formatDate(selectedUser.blocked_at || '')}
                      </Text>
                      {selectedUser.blocked_reason && (
                        <Text style={styles.warningText}>
                          Reason: {selectedUser.blocked_reason}
                        </Text>
                      )}
                    </View>
                  </View>
                )}

                {/* Account Actions */}
                <View style={styles.actionSection}>
                  <Text style={styles.detailSectionTitle}>🔧 Account Actions</Text>
                  
                  <View style={styles.actionRow}>
                    {selectedUser.is_blocked ? (
                      <TouchableOpacity
                        style={[buttonStyles.primary, styles.actionButton]}
                        onPress={() => handleUnblockUser(selectedUser.id)}
                        disabled={processing}
                      >
                        <Text style={styles.actionButtonEmoji}>✅</Text>
                        <Text style={buttonStyles.primaryText}>Unblock Account</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[buttonStyles.secondary, styles.actionButton, { backgroundColor: colors.warning }]}
                        onPress={() => handleBlockUser(selectedUser.id)}
                        disabled={processing}
                      >
                        <Text style={styles.actionButtonEmoji}>🚫</Text>
                        <Text style={[buttonStyles.secondaryText, { color: '#fff' }]}>Block Account</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={[buttonStyles.secondary, styles.actionButton, { backgroundColor: colors.error }]}
                      onPress={() => handleDeleteUser(selectedUser.id)}
                      disabled={processing}
                    >
                      <Text style={styles.actionButtonEmoji}>🗑️</Text>
                      <Text style={[buttonStyles.secondaryText, { color: '#fff' }]}>Delete Account</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Personal Information */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>📋 Personal Information</Text>
                  <TouchableOpacity 
                    style={styles.detailRow}
                    onPress={() => openEditDataModal('name', selectedUser.name)}
                  >
                    <Text style={styles.detailLabel}>Name:</Text>
                    <View style={styles.detailValueContainer}>
                      <Text style={styles.detailValue}>{selectedUser.name}</Text>
                      <IconSymbol 
                        ios_icon_name="pencil" 
                        android_material_icon_name="edit" 
                        size={16} 
                        color={colors.primary} 
                      />
                    </View>
                  </TouchableOpacity>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Email:</Text>
                    <Text style={styles.detailValue}>{selectedUser.email}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.detailRow}
                    onPress={() => openEditDataModal('id_number', selectedUser.id_number)}
                  >
                    <Text style={styles.detailLabel}>ID Number:</Text>
                    <View style={styles.detailValueContainer}>
                      <Text style={styles.detailValue}>{selectedUser.id_number}</Text>
                      <IconSymbol 
                        ios_icon_name="pencil" 
                        android_material_icon_name="edit" 
                        size={16} 
                        color={colors.primary} 
                      />
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.detailRow}
                    onPress={() => openEditDataModal('address', selectedUser.address)}
                  >
                    <Text style={styles.detailLabel}>Address:</Text>
                    <View style={styles.detailValueContainer}>
                      <Text style={styles.detailValue} numberOfLines={1}>{selectedUser.address}</Text>
                      <IconSymbol 
                        ios_icon_name="pencil" 
                        android_material_icon_name="edit" 
                        size={16} 
                        color={colors.primary} 
                      />
                    </View>
                  </TouchableOpacity>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Referral Code:</Text>
                    <Text style={styles.detailValue}>{selectedUser.referral_code}</Text>
                  </View>
                </View>

                {/* Account Status */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>📊 Account Status</Text>
                  <TouchableOpacity 
                    style={styles.detailRow}
                    onPress={() => openEditDataModal('kyc_status', selectedUser.kyc_status)}
                  >
                    <Text style={styles.detailLabel}>KYC Status:</Text>
                    <View style={styles.detailValueContainer}>
                      <Text style={[styles.detailValue, { color: getStatusColor(selectedUser.kyc_status) }]}>
                        {selectedUser.kyc_status.toUpperCase()}
                      </Text>
                      <IconSymbol 
                        ios_icon_name="pencil" 
                        android_material_icon_name="edit" 
                        size={16} 
                        color={colors.primary} 
                      />
                    </View>
                  </TouchableOpacity>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Active Contributor:</Text>
                    <Text style={[styles.detailValue, { color: selectedUser.is_active_contributor ? colors.success : colors.error }]}>
                      {selectedUser.is_active_contributor ? 'Yes' : 'No'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Can Withdraw:</Text>
                    <Text style={[styles.detailValue, { color: selectedUser.can_withdraw ? colors.success : colors.error }]}>
                      {selectedUser.can_withdraw ? 'Yes' : 'No'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Joined Date:</Text>
                    <Text style={styles.detailValue}>{formatDate(selectedUser.joined_date)}</Text>
                  </View>
                </View>

                {/* Financial Information */}
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
                    <Text style={styles.detailLabel}>MXI Purchased:</Text>
                    <Text style={styles.detailValue}>{parseFloat(selectedUser.mxi_purchased_directly?.toString() || '0').toFixed(2)} MXI</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>MXI from Commissions:</Text>
                    <Text style={styles.detailValue}>{parseFloat(selectedUser.mxi_from_unified_commissions?.toString() || '0').toFixed(2)} MXI</Text>
                  </View>
                </View>

                {/* Yield Information */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>📈 Yield Information</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Yield Rate:</Text>
                    <Text style={styles.detailValue}>{parseFloat(selectedUser.yield_rate_per_minute?.toString() || '0').toFixed(6)} MXI/min</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Accumulated Yield:</Text>
                    <Text style={styles.detailValue}>{parseFloat(selectedUser.accumulated_yield?.toString() || '0').toFixed(2)} MXI</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Last Yield Update:</Text>
                    <Text style={styles.detailValue}>{formatDate(selectedUser.last_yield_update)}</Text>
                  </View>
                </View>

                {/* Referral Information */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>👥 Referral Information</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Active Referrals:</Text>
                    <Text style={styles.detailValue}>{selectedUser.active_referrals}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Total Referrals:</Text>
                    <Text style={styles.detailValue}>{referrals.length}</Text>
                  </View>
                  
                  {referrals.length > 0 && (
                    <View style={styles.listContainer}>
                      <Text style={styles.listTitle}>Referrals:</Text>
                      {referrals.map((ref) => (
                        <View key={ref.id} style={styles.listItem}>
                          <View style={styles.listItemContent}>
                            <Text style={styles.listItemText}>
                              {ref.referred_user_name} (Level {ref.level})
                            </Text>
                            <Text style={styles.listItemDate}>{formatDate(ref.created_at)}</Text>
                          </View>
                          <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDeleteReferral(ref.id)}
                          >
                            <IconSymbol 
                              ios_icon_name="trash" 
                              android_material_icon_name="delete" 
                              size={18} 
                              color={colors.error} 
                            />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* Commissions */}
                <View style={styles.detailSection}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.detailSectionTitle}>💸 Commissions</Text>
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => openInputModal('add_commission')}
                    >
                      <IconSymbol 
                        ios_icon_name="plus.circle.fill" 
                        android_material_icon_name="add_circle" 
                        size={24} 
                        color={colors.primary} 
                      />
                    </TouchableOpacity>
                  </View>
                  
                  {commissions.length === 0 ? (
                    <Text style={styles.emptyListText}>No commissions</Text>
                  ) : (
                    <View style={styles.listContainer}>
                      {commissions.map((comm) => (
                        <View key={comm.id} style={styles.listItem}>
                          <View style={styles.listItemContent}>
                            <Text style={styles.listItemText}>
                              ${parseFloat(comm.amount.toString()).toFixed(2)} - Level {comm.level}
                            </Text>
                            <View style={styles.listItemRow}>
                              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(comm.status) + '20' }]}>
                                <Text style={[styles.statusBadgeText, { color: getStatusColor(comm.status) }]}>
                                  {comm.status}
                                </Text>
                              </View>
                              <Text style={styles.listItemDate}>{formatDate(comm.created_at)}</Text>
                            </View>
                          </View>
                          <View style={styles.listItemActions}>
                            <TouchableOpacity
                              style={styles.editButton}
                              onPress={() => openInputModal('edit_commission', comm)}
                            >
                              <IconSymbol 
                                ios_icon_name="pencil" 
                                android_material_icon_name="edit" 
                                size={18} 
                                color={colors.primary} 
                              />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.deleteButton}
                              onPress={() => handleDeleteCommission(comm.id)}
                            >
                              <IconSymbol 
                                ios_icon_name="trash" 
                                android_material_icon_name="delete" 
                                size={18} 
                                color={colors.error} 
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* Balance Actions */}
                <View style={styles.actionSection}>
                  <Text style={styles.detailSectionTitle}>💰 Balance Management</Text>
                  
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[buttonStyles.primary, styles.actionButton]}
                      onPress={() => openInputModal('add_mxi')}
                    >
                      <Text style={styles.actionButtonEmoji}>➕</Text>
                      <Text style={buttonStyles.primaryText}>Add MXI</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[buttonStyles.secondary, styles.actionButton]}
                      onPress={() => openInputModal('remove_mxi')}
                    >
                      <Text style={styles.actionButtonEmoji}>➖</Text>
                      <Text style={buttonStyles.secondaryText}>Remove MXI</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[buttonStyles.primary, styles.actionButton]}
                      onPress={() => openInputModal('add_usdt')}
                    >
                      <Text style={styles.actionButtonEmoji}>➕</Text>
                      <Text style={buttonStyles.primaryText}>Add USDT</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[buttonStyles.secondary, styles.actionButton]}
                      onPress={() => openInputModal('remove_usdt')}
                    >
                      <Text style={styles.actionButtonEmoji}>➖</Text>
                      <Text style={buttonStyles.secondaryText}>Remove USDT</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={[buttonStyles.secondary, styles.actionButtonFull]}
                    onPress={() => openInputModal('set_mxi_balance')}
                  >
                    <Text style={styles.actionButtonEmoji}>⚖️</Text>
                    <Text style={buttonStyles.secondaryText}>Set MXI Balance</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[buttonStyles.secondary, styles.actionButtonFull]}
                    onPress={() => openInputModal('set_usdt_balance')}
                  >
                    <Text style={styles.actionButtonEmoji}>⚖️</Text>
                    <Text style={buttonStyles.secondaryText}>Set USDT Balance</Text>
                  </TouchableOpacity>
                </View>

                {/* Metrics Management */}
                <View style={styles.actionSection}>
                  <Text style={styles.detailSectionTitle}>📊 Metrics Management</Text>
                  
                  <TouchableOpacity
                    style={[buttonStyles.secondary, styles.actionButtonFull]}
                    onPress={() => openInputModal('set_active_referrals')}
                  >
                    <Text style={styles.actionButtonEmoji}>👥</Text>
                    <Text style={buttonStyles.secondaryText}>Set Active Referrals</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[buttonStyles.secondary, styles.actionButtonFull]}
                    onPress={() => openInputModal('set_yield_rate')}
                  >
                    <Text style={styles.actionButtonEmoji}>📈</Text>
                    <Text style={buttonStyles.secondaryText}>Set Yield Rate</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[buttonStyles.secondary, styles.actionButtonFull]}
                    onPress={() => openInputModal('set_accumulated_yield')}
                  >
                    <Text style={styles.actionButtonEmoji}>💰</Text>
                    <Text style={buttonStyles.secondaryText}>Set Accumulated Yield</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[buttonStyles.secondary, styles.actionButtonFull]}
                    onPress={() => openInputModal('set_mxi_purchased')}
                  >
                    <Text style={styles.actionButtonEmoji}>🛒</Text>
                    <Text style={buttonStyles.secondaryText}>Set MXI Purchased</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[buttonStyles.secondary, styles.actionButtonFull]}
                    onPress={() => openInputModal('set_mxi_from_commissions')}
                  >
                    <Text style={styles.actionButtonEmoji}>💰</Text>
                    <Text style={buttonStyles.secondaryText}>Set MXI from Commissions</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[buttonStyles.secondary, styles.actionButtonFull]}
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
            
            {currentAction === 'add_commission' ? (
              <>
                <TextInput
                  style={styles.inputModalInput}
                  placeholder="Enter amount (USDT)"
                  placeholderTextColor={colors.textSecondary}
                  value={inputValue}
                  onChangeText={setInputValue}
                  keyboardType="decimal-pad"
                  autoFocus
                />
                <TextInput
                  style={styles.inputModalInput}
                  placeholder="Enter level (1-3)"
                  placeholderTextColor={colors.textSecondary}
                  value={inputValue2}
                  onChangeText={setInputValue2}
                  keyboardType="number-pad"
                />
              </>
            ) : currentAction === 'edit_commission' ? (
              <>
                <TextInput
                  style={styles.inputModalInput}
                  placeholder="Enter amount (USDT)"
                  placeholderTextColor={colors.textSecondary}
                  value={inputValue}
                  onChangeText={setInputValue}
                  keyboardType="decimal-pad"
                  autoFocus
                />
                <View style={styles.statusSelector}>
                  {['pending', 'available', 'withdrawn'].map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusOption,
                        inputValue2 === status && styles.statusOptionActive,
                      ]}
                      onPress={() => setInputValue2(status)}
                    >
                      <Text
                        style={[
                          styles.statusOptionText,
                          inputValue2 === status && styles.statusOptionTextActive,
                        ]}
                      >
                        {status}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            ) : (
              <>
                <TextInput
                  style={styles.inputModalInput}
                  placeholder={
                    currentAction === 'set_yield_rate'
                      ? 'Enter yield rate (MXI/minute)'
                      : currentAction === 'set_active_referrals'
                      ? 'Enter number of active referrals'
                      : currentAction === 'set_mxi_purchased'
                      ? 'Enter MXI purchased amount'
                      : currentAction === 'set_mxi_from_commissions'
                      ? 'Enter MXI from commissions amount'
                      : 'Enter amount'
                  }
                  placeholderTextColor={colors.textSecondary}
                  value={inputValue}
                  onChangeText={setInputValue}
                  keyboardType="decimal-pad"
                  autoFocus
                />
              </>
            )}

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

      {/* Edit Data Modal */}
      <Modal
        visible={editDataModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditDataModalVisible(false)}
      >
        <View style={styles.inputModalOverlay}>
          <View style={styles.inputModalContent}>
            <Text style={styles.inputModalTitle}>✏️ Edit {editingField.replace('_', ' ').toUpperCase()}</Text>
            
            {editingField === 'kyc_status' ? (
              <View style={styles.statusSelector}>
                {['not_submitted', 'pending', 'approved', 'rejected'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusOption,
                      editingValue === status && styles.statusOptionActive,
                    ]}
                    onPress={() => setEditingValue(status)}
                  >
                    <Text
                      style={[
                        styles.statusOptionText,
                        editingValue === status && styles.statusOptionTextActive,
                      ]}
                    >
                      {status.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <TextInput
                style={styles.inputModalInput}
                placeholder={`Enter new ${editingField.replace('_', ' ')}`}
                placeholderTextColor={colors.textSecondary}
                value={editingValue}
                onChangeText={setEditingValue}
                autoFocus
                multiline={editingField === 'address'}
              />
            )}

            <View style={styles.inputModalButtons}>
              <TouchableOpacity
                style={[styles.inputModalButton, styles.inputModalButtonCancel]}
                onPress={() => setEditDataModalVisible(false)}
                disabled={processing}
              >
                <Text style={styles.inputModalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.inputModalButton, styles.inputModalButtonConfirm]}
                onPress={handleSaveEditedData}
                disabled={processing || !editingValue}
              >
                {processing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.inputModalButtonTextConfirm}>Save</Text>
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
  blockedUserCard: {
    borderWidth: 2,
    borderColor: colors.error,
    opacity: 0.7,
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
  blockedUserAvatar: {
    backgroundColor: colors.error + '20',
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
  warningBanner: {
    flexDirection: 'row',
    backgroundColor: colors.error + '20',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.error,
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    color: colors.error,
    marginBottom: 2,
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
  detailValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    padding: 4,
  },
  listContainer: {
    marginTop: 8,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginBottom: 8,
  },
  listItemContent: {
    flex: 1,
  },
  listItemText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  listItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listItemDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  listItemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  emptyListText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  actionSection: {
    marginTop: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonFull: {
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
    marginBottom: 12,
  },
  statusSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  statusOption: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  statusOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  statusOptionTextActive: {
    color: '#fff',
  },
  inputModalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
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
