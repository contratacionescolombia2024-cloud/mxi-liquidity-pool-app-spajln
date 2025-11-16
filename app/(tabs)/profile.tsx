
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { 
          text: 'Cancelar', 
          style: 'cancel' 
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('User confirmed logout');
              setLoggingOut(true);
              
              // Call logout function
              await logout();
              
              console.log('Logout completed successfully');
              
              // The navigation is now handled in AuthContext
              // But we can add a small delay to ensure state is cleared
              setTimeout(() => {
                setLoggingOut(false);
              }, 500);
            } catch (error) {
              console.error('Error during logout:', error);
              setLoggingOut(false);
              Alert.alert(
                'Error',
                'Hubo un problema al cerrar sesión. Por favor intenta de nuevo.'
              );
            }
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const menuItems = [
    {
      id: 'edit-profile',
      title: 'Editar Perfil',
      subtitle: 'Actualiza tu información',
      icon: 'person.fill',
      androidIcon: 'person',
      route: '/(tabs)/(home)/edit-profile',
    },
    {
      id: 'vesting',
      title: 'Vesting & Rendimiento',
      subtitle: 'Ver generación de rendimiento',
      icon: 'chart.line.uptrend.xyaxis',
      androidIcon: 'trending_up',
      route: '/(tabs)/(home)/vesting',
    },
    {
      id: 'referrals',
      title: 'Referidos',
      subtitle: `${user.activeReferrals} referidos activos`,
      icon: 'person.3.fill',
      androidIcon: 'group',
      route: '/(tabs)/(home)/referrals',
    },
    {
      id: 'challenge-history',
      title: 'Historial de Desafíos',
      subtitle: 'Ver registros de juegos',
      icon: 'clock.fill',
      androidIcon: 'history',
      route: '/(tabs)/(home)/challenge-history',
    },
    {
      id: 'support',
      title: 'Soporte',
      subtitle: 'Obtener ayuda',
      icon: 'questionmark.circle.fill',
      androidIcon: 'help',
      route: '/(tabs)/(home)/support',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
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
        <Text style={styles.headerTitle}>Perfil</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <IconSymbol 
              ios_icon_name="person.circle.fill" 
              android_material_icon_name="account_circle" 
              size={80} 
              color={colors.primary} 
            />
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.referralCodeContainer}>
            <Text style={styles.referralCodeLabel}>Código de Referido:</Text>
            <Text style={styles.referralCode}>{user.referralCode}</Text>
          </View>
        </View>

        <View style={[commonStyles.card, styles.statsCard]}>
          <Text style={styles.statsTitle}>Estadísticas de Cuenta</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <IconSymbol 
                ios_icon_name="dollarsign.circle.fill" 
                android_material_icon_name="account_balance_wallet" 
                size={32} 
                color={colors.primary} 
              />
              <Text style={styles.statValue}>{user.mxiBalance.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Balance MXI</Text>
            </View>
            <View style={styles.statItem}>
              <IconSymbol 
                ios_icon_name="banknote.fill" 
                android_material_icon_name="payments" 
                size={32} 
                color={colors.success} 
              />
              <Text style={styles.statValue}>${user.usdtContributed.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Contribuido</Text>
            </View>
            <View style={styles.statItem}>
              <IconSymbol 
                ios_icon_name="person.3.fill" 
                android_material_icon_name="group" 
                size={32} 
                color={colors.accent} 
              />
              <Text style={styles.statValue}>{user.activeReferrals}</Text>
              <Text style={styles.statLabel}>Referidos</Text>
            </View>
            <View style={styles.statItem}>
              <IconSymbol 
                ios_icon_name="chart.line.uptrend.xyaxis" 
                android_material_icon_name="trending_up" 
                size={32} 
                color={colors.warning} 
              />
              <Text style={styles.statValue}>${user.commissions.total.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Comisiones</Text>
            </View>
          </View>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <React.Fragment key={item.id}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.push(item.route as any)}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIconContainer}>
                    <IconSymbol 
                      ios_icon_name={item.icon} 
                      android_material_icon_name={item.androidIcon} 
                      size={24} 
                      color={colors.primary} 
                    />
                  </View>
                  <View style={styles.menuItemText}>
                    <Text style={styles.menuItemTitle}>{item.title}</Text>
                    <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
                <IconSymbol 
                  ios_icon_name="chevron.right" 
                  android_material_icon_name="chevron_right" 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
              {index < menuItems.length - 1 && <View style={styles.menuDivider} />}
            </React.Fragment>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, loggingOut && styles.logoutButtonDisabled]}
          onPress={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <React.Fragment>
              <ActivityIndicator color={colors.error} size="small" />
              <Text style={styles.logoutButtonText}>Cerrando sesión...</Text>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <IconSymbol 
                ios_icon_name="rectangle.portrait.and.arrow.right" 
                android_material_icon_name="logout" 
                size={20} 
                color={colors.error} 
              />
              <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
            </React.Fragment>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Miembro desde {new Date(user.joinedDate).toLocaleDateString('es-ES')}
          </Text>
          <Text style={styles.footerText}>
            ID: {user.idNumber}
          </Text>
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
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.card,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  referralCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  referralCodeLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  referralCode: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  statsCard: {
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  menuSection: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 72,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: colors.card,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.error,
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
  footer: {
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
