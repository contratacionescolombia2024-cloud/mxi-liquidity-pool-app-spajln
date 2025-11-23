
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';

interface AdminUserManagementProps {
  userId: string;
  userName: string;
  userEmail: string;
  onUpdate: () => void;
}

export function AdminUserManagement({ userId, userName, userEmail, onUpdate }: AdminUserManagementProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [actionType, setActionType] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  // Input states
  const [mxiAmount, setMxiAmount] = useState('');
  const [referralEmail, setReferralEmail] = useState('');
  const [referralCode, setReferralCode] = useState('');

  const openModal = (action: string) => {
    setActionType(action);
    setModalVisible(true);
    // Reset inputs
    setMxiAmount('');
    setReferralEmail('');
    setReferralCode('');
  };

  const closeModal = () => {
    setModalVisible(false);
    setActionType('');
  };

  // ========== BALANCE GENERAL ==========
  const handleAddBalanceGeneralNoCommission = async () => {
    const amount = parseFloat(mxiAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated');

      const { data, error } = await supabase.rpc('admin_add_balance_general_no_commission', {
        p_user_id: userId,
        p_admin_id: user.id,
        p_amount: amount,
      });

      if (error) throw error;

      if (data?.success) {
        Alert.alert('✅ Éxito', data.message);
        closeModal();
        onUpdate();
      } else {
        Alert.alert('❌ Error', data?.error || 'Error al añadir balance');
      }
    } catch (error: any) {
      console.error('Error adding balance:', error);
      Alert.alert('❌ Error', error.message || 'Error al añadir balance');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBalanceGeneralWithCommission = async () => {
    const amount = parseFloat(mxiAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated');

      const { data, error } = await supabase.rpc('admin_add_balance_general_with_commission', {
        p_user_id: userId,
        p_admin_id: user.id,
        p_amount: amount,
      });

      if (error) throw error;

      if (data?.success) {
        Alert.alert('✅ Éxito', data.message);
        closeModal();
        onUpdate();
      } else {
        Alert.alert('❌ Error', data?.error || 'Error al añadir balance');
      }
    } catch (error: any) {
      console.error('Error adding balance with commission:', error);
      Alert.alert('❌ Error', error.message || 'Error al añadir balance');
    } finally {
      setLoading(false);
    }
  };

  const handleSubtractBalanceGeneral = async () => {
    const amount = parseFloat(mxiAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido');
      return;
    }

    Alert.alert(
      '⚠️ Confirmar Resta',
      `¿Estás seguro de restar ${amount} MXI del balance general?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restar',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) throw new Error('No authenticated');

              const { data, error } = await supabase.rpc('admin_subtract_balance_general', {
                p_user_id: userId,
                p_admin_id: user.id,
                p_amount: amount,
              });

              if (error) throw error;

              if (data?.success) {
                Alert.alert('✅ Éxito', data.message);
                closeModal();
                onUpdate();
              } else {
                Alert.alert('❌ Error', data?.error || 'Error al restar balance');
              }
            } catch (error: any) {
              console.error('Error subtracting balance:', error);
              Alert.alert('❌ Error', error.message || 'Error al restar balance');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // ========== VESTING ==========
  const handleAddBalanceVesting = async () => {
    const amount = parseFloat(mxiAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated');

      const { data, error } = await supabase.rpc('admin_add_balance_vesting', {
        p_user_id: userId,
        p_admin_id: user.id,
        p_amount: amount,
      });

      if (error) throw error;

      if (data?.success) {
        Alert.alert('✅ Éxito', data.message);
        closeModal();
        onUpdate();
      } else {
        Alert.alert('❌ Error', data?.error || 'Error al añadir balance vesting');
      }
    } catch (error: any) {
      console.error('Error adding vesting balance:', error);
      Alert.alert('❌ Error', error.message || 'Error al añadir balance vesting');
    } finally {
      setLoading(false);
    }
  };

  const handleSubtractBalanceVesting = async () => {
    const amount = parseFloat(mxiAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido');
      return;
    }

    Alert.alert(
      '⚠️ Confirmar Resta',
      `¿Estás seguro de restar ${amount} MXI del balance vesting?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restar',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) throw new Error('No authenticated');

              const { data, error } = await supabase.rpc('admin_subtract_balance_vesting', {
                p_user_id: userId,
                p_admin_id: user.id,
                p_amount: amount,
              });

              if (error) throw error;

              if (data?.success) {
                Alert.alert('✅ Éxito', data.message);
                closeModal();
                onUpdate();
              } else {
                Alert.alert('❌ Error', data?.error || 'Error al restar balance vesting');
              }
            } catch (error: any) {
              console.error('Error subtracting vesting balance:', error);
              Alert.alert('❌ Error', error.message || 'Error al restar balance vesting');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // ========== TORNEOS ==========
  const handleAddBalanceTournament = async () => {
    const amount = parseFloat(mxiAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated');

      const { data, error } = await supabase.rpc('admin_add_balance_tournament', {
        p_user_id: userId,
        p_admin_id: user.id,
        p_amount: amount,
      });

      if (error) throw error;

      if (data?.success) {
        Alert.alert('✅ Éxito', data.message);
        closeModal();
        onUpdate();
      } else {
        Alert.alert('❌ Error', data?.error || 'Error al añadir balance de torneos');
      }
    } catch (error: any) {
      console.error('Error adding tournament balance:', error);
      Alert.alert('❌ Error', error.message || 'Error al añadir balance de torneos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubtractBalanceTournament = async () => {
    const amount = parseFloat(mxiAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido');
      return;
    }

    Alert.alert(
      '⚠️ Confirmar Resta',
      `¿Estás seguro de restar ${amount} MXI del balance de torneos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restar',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) throw new Error('No authenticated');

              const { data, error } = await supabase.rpc('admin_subtract_balance_tournament', {
                p_user_id: userId,
                p_admin_id: user.id,
                p_amount: amount,
              });

              if (error) throw error;

              if (data?.success) {
                Alert.alert('✅ Éxito', data.message);
                closeModal();
                onUpdate();
              } else {
                Alert.alert('❌ Error', data?.error || 'Error al restar balance de torneos');
              }
            } catch (error: any) {
              console.error('Error subtracting tournament balance:', error);
              Alert.alert('❌ Error', error.message || 'Error al restar balance de torneos');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // ========== REFERRAL LINKING ==========
  const handleLinkReferralByCode = async () => {
    if (!referralEmail || !referralCode) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated');

      const { data, error } = await supabase.rpc('admin_link_referral_by_code', {
        p_admin_id: user.id,
        p_user_email: referralEmail,
        p_referrer_code: referralCode,
      });

      if (error) throw error;

      if (data?.success) {
        Alert.alert('✅ Éxito', data.message);
        closeModal();
        onUpdate();
      } else {
        Alert.alert('❌ Error', data?.error || 'Error al vincular referido');
      }
    } catch (error: any) {
      console.error('Error linking referral:', error);
      Alert.alert('❌ Error', error.message || 'Error al vincular referido');
    } finally {
      setLoading(false);
    }
  };

  const renderModalContent = () => {
    switch (actionType) {
      // ========== BALANCE GENERAL ==========
      case 'add_balance_general_no_commission':
        return (
          <View>
            <Text style={styles.modalTitle}>➕ Sumar Saldo Balance General</Text>
            <Text style={styles.modalSubtitle}>Sin generar comisión de referido</Text>
            <Text style={styles.modalUser}>Usuario: {userName}</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Cantidad de MXI</Text>
              <TextInput
                style={styles.input}
                value={mxiAmount}
                onChangeText={setMxiAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            <TouchableOpacity
              style={[buttonStyles.primary, loading && buttonStyles.disabled]}
              onPress={handleAddBalanceGeneralNoCommission}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={buttonStyles.primaryText}>Añadir MXI</Text>
              )}
            </TouchableOpacity>
          </View>
        );

      case 'add_balance_general_with_commission':
        return (
          <View>
            <Text style={styles.modalTitle}>➕ Aumentar Saldo Generando Comisión</Text>
            <Text style={styles.modalSubtitle}>Se generarán comisiones para referidores</Text>
            <Text style={styles.modalUser}>Usuario: {userName}</Text>
            <Text style={styles.modalNote}>
              💡 Comisiones: Nivel 1 (5%), Nivel 2 (2%), Nivel 3 (1%)
            </Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Cantidad de MXI</Text>
              <TextInput
                style={styles.input}
                value={mxiAmount}
                onChangeText={setMxiAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            <TouchableOpacity
              style={[buttonStyles.primary, loading && buttonStyles.disabled]}
              onPress={handleAddBalanceGeneralWithCommission}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={buttonStyles.primaryText}>Añadir MXI con Comisión</Text>
              )}
            </TouchableOpacity>
          </View>
        );

      case 'subtract_balance_general':
        return (
          <View>
            <Text style={styles.modalTitle}>➖ Restar Saldo Balance General</Text>
            <Text style={styles.modalSubtitle}>Restar del balance principal del usuario</Text>
            <Text style={styles.modalUser}>Usuario: {userName}</Text>
            <Text style={[styles.modalNote, { backgroundColor: colors.error + '20', borderLeftColor: colors.error }]}>
              ⚠️ Esta acción restará MXI del balance general del usuario
            </Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Cantidad de MXI a Restar</Text>
              <TextInput
                style={styles.input}
                value={mxiAmount}
                onChangeText={setMxiAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            <TouchableOpacity
              style={[buttonStyles.primary, { backgroundColor: colors.error }, loading && buttonStyles.disabled]}
              onPress={handleSubtractBalanceGeneral}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[buttonStyles.primaryText, { color: '#fff' }]}>Restar MXI</Text>
              )}
            </TouchableOpacity>
          </View>
        );

      // ========== VESTING ==========
      case 'add_balance_vesting':
        return (
          <View>
            <Text style={styles.modalTitle}>➕ Aumentar Saldo Vesting</Text>
            <Text style={styles.modalSubtitle}>Añadir al balance de vesting bloqueado</Text>
            <Text style={styles.modalUser}>Usuario: {userName}</Text>
            <Text style={styles.modalNote}>
              🔒 Este saldo estará bloqueado hasta la fecha de lanzamiento
            </Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Cantidad de MXI</Text>
              <TextInput
                style={styles.input}
                value={mxiAmount}
                onChangeText={setMxiAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            <TouchableOpacity
              style={[buttonStyles.primary, loading && buttonStyles.disabled]}
              onPress={handleAddBalanceVesting}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={buttonStyles.primaryText}>Añadir a Vesting</Text>
              )}
            </TouchableOpacity>
          </View>
        );

      case 'subtract_balance_vesting':
        return (
          <View>
            <Text style={styles.modalTitle}>➖ Restar Saldo Vesting</Text>
            <Text style={styles.modalSubtitle}>Restar del balance de vesting bloqueado</Text>
            <Text style={styles.modalUser}>Usuario: {userName}</Text>
            <Text style={[styles.modalNote, { backgroundColor: colors.error + '20', borderLeftColor: colors.error }]}>
              ⚠️ Esta acción restará MXI del balance vesting del usuario
            </Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Cantidad de MXI a Restar</Text>
              <TextInput
                style={styles.input}
                value={mxiAmount}
                onChangeText={setMxiAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            <TouchableOpacity
              style={[buttonStyles.primary, { backgroundColor: colors.error }, loading && buttonStyles.disabled]}
              onPress={handleSubtractBalanceVesting}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[buttonStyles.primaryText, { color: '#fff' }]}>Restar de Vesting</Text>
              )}
            </TouchableOpacity>
          </View>
        );

      // ========== TORNEOS ==========
      case 'add_balance_tournament':
        return (
          <View>
            <Text style={styles.modalTitle}>➕ Aumentar Saldo Torneo</Text>
            <Text style={styles.modalSubtitle}>Añadir al balance de torneos/retos</Text>
            <Text style={styles.modalUser}>Usuario: {userName}</Text>
            <Text style={styles.modalNote}>
              🏆 Este saldo puede usarse para participar en torneos
            </Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Cantidad de MXI</Text>
              <TextInput
                style={styles.input}
                value={mxiAmount}
                onChangeText={setMxiAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            <TouchableOpacity
              style={[buttonStyles.primary, loading && buttonStyles.disabled]}
              onPress={handleAddBalanceTournament}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={buttonStyles.primaryText}>Añadir a Torneos</Text>
              )}
            </TouchableOpacity>
          </View>
        );

      case 'subtract_balance_tournament':
        return (
          <View>
            <Text style={styles.modalTitle}>➖ Restar Saldo Torneo</Text>
            <Text style={styles.modalSubtitle}>Restar del balance de torneos/retos</Text>
            <Text style={styles.modalUser}>Usuario: {userName}</Text>
            <Text style={[styles.modalNote, { backgroundColor: colors.error + '20', borderLeftColor: colors.error }]}>
              ⚠️ Esta acción restará MXI del balance de torneos del usuario
            </Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Cantidad de MXI a Restar</Text>
              <TextInput
                style={styles.input}
                value={mxiAmount}
                onChangeText={setMxiAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            <TouchableOpacity
              style={[buttonStyles.primary, { backgroundColor: colors.error }, loading && buttonStyles.disabled]}
              onPress={handleSubtractBalanceTournament}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[buttonStyles.primaryText, { color: '#fff' }]}>Restar de Torneos</Text>
              )}
            </TouchableOpacity>
          </View>
        );

      // ========== VINCULAR REFERIDO ==========
      case 'link_referral_by_code':
        return (
          <View>
            <Text style={styles.modalTitle}>🔗 Vincular Correo con Código de Referidor</Text>
            <Text style={styles.modalSubtitle}>Asignar un referidor a un usuario existente</Text>
            <Text style={styles.modalNote}>
              💡 El usuario debe existir en el sistema y no tener referidor asignado
            </Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Correo del Usuario</Text>
              <TextInput
                style={styles.input}
                value={referralEmail}
                onChangeText={setReferralEmail}
                keyboardType="email-address"
                placeholder="usuario@ejemplo.com"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Código del Referidor</Text>
              <TextInput
                style={styles.input}
                value={referralCode}
                onChangeText={setReferralCode}
                placeholder="MXI123456"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="characters"
              />
            </View>
            <TouchableOpacity
              style={[buttonStyles.primary, loading && buttonStyles.disabled]}
              onPress={handleLinkReferralByCode}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={buttonStyles.primaryText}>Vincular Referido</Text>
              )}
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>⚙️ Gestión Completa de Saldos</Text>
      
      <View style={styles.categoryContainer}>
        <Text style={styles.categoryTitle}>💰 Balance General</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.success + '20' }]}
            onPress={() => openModal('add_balance_general_no_commission')}
          >
            <IconSymbol 
              ios_icon_name="plus.circle.fill" 
              android_material_icon_name="add_circle" 
              size={20} 
              color={colors.success} 
            />
            <Text style={styles.actionButtonText}>Sumar{'\n'}Sin Comisión</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
            onPress={() => openModal('add_balance_general_with_commission')}
          >
            <IconSymbol 
              ios_icon_name="plus.circle.fill" 
              android_material_icon_name="add_circle" 
              size={20} 
              color={colors.primary} 
            />
            <Text style={styles.actionButtonText}>Aumentar{'\n'}Con Comisión</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.error + '20' }]}
            onPress={() => openModal('subtract_balance_general')}
          >
            <IconSymbol 
              ios_icon_name="minus.circle.fill" 
              android_material_icon_name="remove_circle" 
              size={20} 
              color={colors.error} 
            />
            <Text style={styles.actionButtonText}>Restar{'\n'}Balance</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.categoryContainer}>
        <Text style={styles.categoryTitle}>🔒 Vesting</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.accent + '20' }]}
            onPress={() => openModal('add_balance_vesting')}
          >
            <IconSymbol 
              ios_icon_name="plus.circle.fill" 
              android_material_icon_name="add_circle" 
              size={20} 
              color={colors.accent} 
            />
            <Text style={styles.actionButtonText}>Aumentar{'\n'}Vesting</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.error + '20' }]}
            onPress={() => openModal('subtract_balance_vesting')}
          >
            <IconSymbol 
              ios_icon_name="minus.circle.fill" 
              android_material_icon_name="remove_circle" 
              size={20} 
              color={colors.error} 
            />
            <Text style={styles.actionButtonText}>Restar{'\n'}Vesting</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.categoryContainer}>
        <Text style={styles.categoryTitle}>🏆 Torneos</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.warning + '20' }]}
            onPress={() => openModal('add_balance_tournament')}
          >
            <IconSymbol 
              ios_icon_name="plus.circle.fill" 
              android_material_icon_name="add_circle" 
              size={20} 
              color={colors.warning} 
            />
            <Text style={styles.actionButtonText}>Aumentar{'\n'}Torneo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.error + '20' }]}
            onPress={() => openModal('subtract_balance_tournament')}
          >
            <IconSymbol 
              ios_icon_name="minus.circle.fill" 
              android_material_icon_name="remove_circle" 
              size={20} 
              color={colors.error} 
            />
            <Text style={styles.actionButtonText}>Restar{'\n'}Torneo</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.categoryContainer}>
        <Text style={styles.categoryTitle}>🔗 Referidos</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary + '20', flex: 1 }]}
            onPress={() => openModal('link_referral_by_code')}
          >
            <IconSymbol 
              ios_icon_name="link.circle.fill" 
              android_material_icon_name="link" 
              size={20} 
              color={colors.primary} 
            />
            <Text style={styles.actionButtonText}>Vincular Correo{'\n'}con Código</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <IconSymbol 
                ios_icon_name="xmark.circle.fill" 
                android_material_icon_name="cancel" 
                size={28} 
                color={colors.textSecondary} 
              />
            </TouchableOpacity>
            <ScrollView showsVerticalScrollIndicator={false}>
              {renderModalContent()}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
  },
  categoryContainer: {
    marginBottom: 20,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 6,
    minHeight: 80,
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 14,
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
    maxHeight: '80%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  modalUser: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 16,
  },
  modalNote: {
    fontSize: 13,
    color: colors.textSecondary,
    backgroundColor: colors.primary + '20',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    lineHeight: 18,
  },
  inputContainer: {
    marginBottom: 16,
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
});
