
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { showAlert, showConfirm } from '@/utils/confirmDialog';

interface UserData {
  id: string;
  name: string;
  email: string;
  id_number: string;
  address: string;
  mxi_balance: number;
  usdt_contributed: number;
  is_active_contributor: boolean;
  active_referrals: number;
  joined_date: string;
  referral_code: string;
  is_blocked: boolean;
}

export default function UserDeletionScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, users]);

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
      showAlert(t('error'), 'Error al cargar usuarios', undefined, 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

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
    console.log('User selected:', userData.name, userData.id);
    setSelectedUser(userData);
    setDetailsModalVisible(true);
  };

  const handleDeleteUser = async (userId: string, userName: string, userEmail: string) => {
    if (!user) return;

    showConfirm({
      title: '⚠️ Eliminar Cuenta',
      message: `¿Estás seguro de que deseas eliminar permanentemente la cuenta de ${userName} (${userEmail})?\n\nEsta acción:\n• Eliminará todos los datos del usuario\n• Eliminará todas las transacciones\n• Eliminará todos los referidos\n• NO SE PUEDE DESHACER\n\n¿Deseas continuar?`,
      confirmText: 'Eliminar Permanentemente',
      cancelText: t('cancel'),
      type: 'error',
      icon: {
        ios: 'trash.fill',
        android: 'delete_forever',
      },
      onConfirm: async () => {
        try {
          setDeleting(true);
          
          console.log('Deleting user:', userId);
          
          const { data, error } = await supabase.rpc('delete_user_account', {
            p_user_id: userId,
            p_admin_id: user.id,
          });

          if (error) {
            console.error('Error deleting user:', error);
            showAlert(
              t('error'),
              `Error al eliminar usuario: ${error.message}`,
              undefined,
              'error'
            );
            return;
          }

          if (data && !data.success) {
            showAlert(
              t('error'),
              data.error || 'Error al eliminar usuario',
              undefined,
              'error'
            );
            return;
          }

          console.log('User deleted successfully:', data);
          
          showAlert(
            t('success'),
            `La cuenta de ${userName} ha sido eliminada permanentemente junto con todos sus datos.`,
            () => {
              setDetailsModalVisible(false);
              loadUsers();
            },
            'success'
          );
        } catch (error: any) {
          console.error('Exception deleting user:', error);
          showAlert(
            t('error'),
            `Error al eliminar usuario: ${error.message}`,
            undefined,
            'error'
          );
        } finally {
          setDeleting(false);
        }
      },
      onCancel: () => {
        console.log('User deletion cancelled');
      },
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando usuarios...</Text>
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
          <Text style={styles.title}>Eliminar Cuentas</Text>
          <Text style={styles.subtitle}>{filteredUsers.length} usuarios encontrados</Text>
        </View>
        <View style={styles.warningIcon}>
          <IconSymbol 
            ios_icon_name="exclamationmark.triangle.fill" 
            android_material_icon_name="warning" 
            size={24} 
            color={colors.error} 
          />
        </View>
      </View>

      <View style={styles.warningBanner}>
        <IconSymbol 
          ios_icon_name="exclamationmark.shield.fill" 
          android_material_icon_name="warning" 
          size={20} 
          color={colors.error} 
        />
        <Text style={styles.warningText}>
          La eliminación de cuentas es permanente e irreversible. Todos los datos del usuario serán eliminados.
        </Text>
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
            placeholder="Buscar por nombre, email, ID o código de referido..."
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
            <Text style={styles.emptyText}>No se encontraron usuarios</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Intenta con otro término de búsqueda' : 'No hay usuarios en el sistema'}
            </Text>
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
              activeOpacity={0.7}
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
                    <Text style={styles.userCode}>ID: {userData.id_number}</Text>
                  </View>
                </View>
                <View style={styles.userBadges}>
                  {userData.is_blocked && (
                    <View style={[styles.statusBadge, { backgroundColor: colors.error + '20' }]}>
                      <Text style={[styles.statusBadgeText, { color: colors.error }]}>BLOQUEADO</Text>
                    </View>
                  )}
                  {!userData.is_blocked && userData.is_active_contributor && (
                    <View style={[styles.statusBadge, { backgroundColor: colors.success + '20' }]}>
                      <Text style={[styles.statusBadgeText, { color: colors.success }]}>ACTIVO</Text>
                    </View>
                  )}
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
                <Text style={styles.userJoinDate}>Registrado: {formatDate(userData.joined_date)}</Text>
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
        animationType="slide"
        transparent={false}
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
              <IconSymbol 
                ios_icon_name="xmark.circle.fill" 
                android_material_icon_name="cancel" 
                size={32} 
                color={colors.textSecondary} 
              />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Detalles del Usuario</Text>
            <View style={{ width: 32 }} />
          </View>

          {selectedUser && (
            <ScrollView contentContainerStyle={styles.modalContent}>
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Información Personal</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Nombre:</Text>
                  <Text style={styles.detailValue}>{selectedUser.name}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Email:</Text>
                  <Text style={styles.detailValue}>{selectedUser.email}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>ID:</Text>
                  <Text style={styles.detailValue}>{selectedUser.id_number}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Dirección:</Text>
                  <Text style={styles.detailValue}>{selectedUser.address}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Código de Referido:</Text>
                  <Text style={styles.detailValue}>{selectedUser.referral_code}</Text>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Información Financiera</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Balance MXI:</Text>
                  <Text style={styles.detailValue}>{parseFloat(selectedUser.mxi_balance.toString()).toFixed(2)} MXI</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>USDT Contribuido:</Text>
                  <Text style={styles.detailValue}>${parseFloat(selectedUser.usdt_contributed.toString()).toFixed(2)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Referidos Activos:</Text>
                  <Text style={styles.detailValue}>{selectedUser.active_referrals}</Text>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Estado de la Cuenta</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Estado:</Text>
                  <Text style={[
                    styles.detailValue,
                    { color: selectedUser.is_blocked ? colors.error : selectedUser.is_active_contributor ? colors.success : colors.textSecondary }
                  ]}>
                    {selectedUser.is_blocked ? 'Bloqueado' : selectedUser.is_active_contributor ? 'Activo' : 'Inactivo'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Fecha de Registro:</Text>
                  <Text style={styles.detailValue}>{formatDate(selectedUser.joined_date)}</Text>
                </View>
              </View>

              {/* Danger Zone */}
              <View style={styles.dangerZone}>
                <View style={styles.dangerZoneHeader}>
                  <IconSymbol 
                    ios_icon_name="exclamationmark.triangle.fill" 
                    android_material_icon_name="warning" 
                    size={24} 
                    color={colors.error} 
                  />
                  <Text style={styles.dangerZoneTitle}>Zona de Peligro</Text>
                </View>
                <Text style={styles.dangerZoneDescription}>
                  La eliminación de esta cuenta es permanente e irreversible. Todos los datos del usuario, incluyendo transacciones, referidos, y balances serán eliminados permanentemente.
                </Text>
                <TouchableOpacity
                  style={[buttonStyles.primary, styles.deleteButton]}
                  onPress={() => handleDeleteUser(selectedUser.id, selectedUser.name, selectedUser.email)}
                  disabled={deleting}
                >
                  {deleting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <IconSymbol 
                        ios_icon_name="trash.fill" 
                        android_material_icon_name="delete_forever" 
                        size={20} 
                        color="#fff" 
                      />
                      <Text style={[buttonStyles.primaryText, { marginLeft: 8 }]}>
                        Eliminar Cuenta Permanentemente
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
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
  warningIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error + '10',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error + '30',
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: colors.error,
    lineHeight: 18,
  },
  searchContainer: {
    padding: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
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
    textAlign: 'center',
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
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  modalContent: {
    padding: 16,
    paddingBottom: 100,
  },
  detailSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  dangerZone: {
    marginTop: 24,
    padding: 16,
    backgroundColor: colors.error + '10',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.error,
  },
  dangerZoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  dangerZoneTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.error,
  },
  dangerZoneDescription: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 16,
  },
  deleteButton: {
    backgroundColor: colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
