
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

  const handleAddMxiNoCommission = async () => {
    const amount = parseFloat(mxiAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated');

      const { data, error } = await supabase.rpc('admin_add_mxi_no_commission', {
        p_user_id: userId,
        p_admin_id: user.id,
        p_amount: amount,
      });

      if (error) throw error;

      if (data?.success) {
        Alert.alert('✅ Éxito', `${amount} MXI añadido sin generar comisión`);
        closeModal();
        onUpdate();
      } else {
        Alert.alert('❌ Error', data?.error || 'Error al añadir MXI');
      }
    } catch (error: any) {
      console.error('Error adding MXI:', error);
      Alert.alert('❌ Error', error.message || 'Error al añadir MXI');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMxiWithCommission = async () => {
    const mxi = parseFloat(mxiAmount);
    
    if (isNaN(mxi) || mxi <= 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido de MXI');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated');

      // Calculate USDT equivalent based on current phase price
      // For now, we'll use Phase 1 price (0.40 USDT per MXI)
      const usdtEquivalent = mxi * 0.40;

      const { data, error } = await supabase.rpc('admin_add_mxi_with_commission', {
        p_user_id: userId,
        p_admin_id: user.id,
        p_amount: mxi,
        p_usdt_equivalent: usdtEquivalent,
      });

      if (error) throw error;

      if (data?.success) {
        Alert.alert('✅ Éxito', `${mxi} MXI añadido con generación de comisión`);
        closeModal();
        onUpdate();
      } else {
        Alert.alert('❌ Error', data?.error || 'Error al añadir MXI');
      }
    } catch (error: any) {
      console.error('Error adding MXI with commission:', error);
      Alert.alert('❌ Error', error.message || 'Error al añadir MXI');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkReferral = async () => {
    if (!referralEmail || !referralCode) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated');

      const { data, error } = await supabase.rpc('admin_link_referral_to_email', {
        p_admin_id: user.id,
        p_referred_email: referralEmail,
        p_referrer_code: referralCode,
      });

      if (error) throw error;

      if (data?.success) {
        Alert.alert('✅ Éxito', 'Referido vinculado exitosamente');
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

  const handleAddBalanceToReferral = async () => {
    const mxi = parseFloat(mxiAmount) || 0;
    
    if (!referralEmail) {
      Alert.alert('Error', 'Por favor ingresa el correo del referido');
      return;
    }

    if (mxi === 0) {
      Alert.alert('Error', 'Por favor ingresa un monto de MXI');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated');

      const { data, error } = await supabase.rpc('admin_add_balance_to_referral', {
        p_admin_id: user.id,
        p_referral_email: referralEmail,
        p_mxi_amount: mxi,
        p_usdt_amount: 0, // USDT removed, keeping for backward compatibility
      });

      if (error) throw error;

      if (data?.success) {
        Alert.alert('✅ Éxito', 'Saldo MXI añadido al referido exitosamente');
        closeModal();
        onUpdate();
      } else {
        Alert.alert('❌ Error', data?.error || 'Error al añadir saldo');
      }
    } catch (error: any) {
      console.error('Error adding balance to referral:', error);
      Alert.alert('❌ Error', error.message || 'Error al añadir saldo');
    } finally {
      setLoading(false);
    }
  };

  const renderModalContent = () => {
    switch (actionType) {
      case 'add_mxi_no_commission':
        return (
          <View>
            <Text style={styles.modalTitle}>Añadir MXI sin Comisión</Text>
            <Text style={styles.modalSubtitle}>Usuario: {userName}</Text>
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
              onPress={handleAddMxiNoCommission}
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

      case 'add_mxi_with_commission':
        return (
          <View>
            <Text style={styles.modalTitle}>Añadir MXI con Comisión</Text>
            <Text style={styles.modalSubtitle}>Usuario: {userName}</Text>
            <Text style={styles.modalNote}>
              💡 Las comisiones se calcularán automáticamente basadas en la cantidad de MXI comprados
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
              onPress={handleAddMxiWithCommission}
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

      case 'link_referral':
        return (
          <View>
            <Text style={styles.modalTitle}>Vincular Referido</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Correo del Referido</Text>
              <TextInput
                style={styles.input}
                value={referralEmail}
                onChangeText={setReferralEmail}
                keyboardType="email-address"
                placeholder="correo@ejemplo.com"
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
              onPress={handleLinkReferral}
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

      case 'add_balance_to_referral':
        return (
          <View>
            <Text style={styles.modalTitle}>Añadir Saldo MXI a Referido</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Correo del Referido</Text>
              <TextInput
                style={styles.input}
                value={referralEmail}
                onChangeText={setReferralEmail}
                keyboardType="email-address"
                placeholder="correo@ejemplo.com"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
              />
            </View>
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
              onPress={handleAddBalanceToReferral}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={buttonStyles.primaryText}>Añadir Saldo</Text>
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
      <Text style={styles.sectionTitle}>Gestión Avanzada</Text>
      
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openModal('add_mxi_no_commission')}
        >
          <IconSymbol 
            ios_icon_name="plus.circle.fill" 
            android_material_icon_name="add_circle" 
            size={24} 
            color={colors.primary} 
          />
          <Text style={styles.actionButtonText}>Añadir MXI{'\n'}Sin Comisión</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openModal('add_mxi_with_commission')}
        >
          <IconSymbol 
            ios_icon_name="plus.circle.fill" 
            android_material_icon_name="add_circle" 
            size={24} 
            color={colors.success} 
          />
          <Text style={styles.actionButtonText}>Añadir MXI{'\n'}Con Comisión</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openModal('link_referral')}
        >
          <IconSymbol 
            ios_icon_name="link.circle.fill" 
            android_material_icon_name="link" 
            size={24} 
            color={colors.accent} 
          />
          <Text style={styles.actionButtonText}>Vincular{'\n'}Referido</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openModal('add_balance_to_referral')}
        >
          <IconSymbol 
            ios_icon_name="dollarsign.circle.fill" 
            android_material_icon_name="account_balance_wallet" 
            size={24} 
            color={colors.warning} 
          />
          <Text style={styles.actionButtonText}>Añadir Saldo{'\n'}a Referido</Text>
        </TouchableOpacity>
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
            <ScrollView>
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
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
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
    marginBottom: 20,
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
