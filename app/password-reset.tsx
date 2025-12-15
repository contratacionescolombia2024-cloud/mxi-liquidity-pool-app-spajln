
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { showAlert } from '@/utils/confirmDialog';
import { supabase } from '@/lib/supabase';
import * as Linking from 'expo-linking';

export default function PasswordResetScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);

  useEffect(() => {
    verifyResetToken();
  }, []);

  const verifyResetToken = async () => {
    try {
      console.log('Verifying password reset token...');
      console.log('URL params:', params);
      
      // Get the URL that opened the app
      let url = await Linking.getInitialURL();
      console.log('Initial URL:', url);
      
      // If no URL from Linking, try to construct from params
      if (!url && (params.access_token || params.token_hash)) {
        const accessToken = params.access_token as string;
        const tokenHash = params.token_hash as string;
        const type = params.type as string || 'recovery';
        
        url = `mxiliquiditypool://password-reset?access_token=${accessToken || ''}&token_hash=${tokenHash || ''}&type=${type}`;
        console.log('Constructed URL from params:', url);
      }
      
      if (url) {
        // Parse the URL to extract tokens
        const urlObj = new URL(url);
        const accessToken = urlObj.searchParams.get('access_token');
        const tokenHash = urlObj.searchParams.get('token_hash');
        const type = urlObj.searchParams.get('type');
        
        console.log('Extracted tokens:', { 
          hasAccessToken: !!accessToken, 
          hasTokenHash: !!tokenHash,
          type 
        });
        
        if ((accessToken || tokenHash) && type === 'recovery') {
          // Verify the token with Supabase
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash || accessToken || '',
            type: 'recovery',
          });
          
          if (error) {
            console.error('Error verifying token:', error);
            showAlert(
              'Error',
              'El enlace de recuperación no es válido o ha expirado. Por favor solicita uno nuevo.',
              undefined,
              'error'
            );
            setVerifying(false);
            setTimeout(() => router.replace('/(auth)/login'), 3000);
            return;
          }
          
          if (data.session) {
            console.log('Valid reset token, user can now reset password');
            setIsValidToken(true);
            setVerifying(false);
          } else {
            console.error('No session created from token');
            showAlert(
              'Error',
              'No se pudo verificar el enlace de recuperación. Por favor intenta de nuevo.',
              undefined,
              'error'
            );
            setVerifying(false);
            setTimeout(() => router.replace('/(auth)/login'), 3000);
          }
        } else {
          console.error('Missing required tokens or invalid type');
          showAlert(
            'Error',
            'El enlace de recuperación no es válido. Por favor solicita uno nuevo.',
            undefined,
            'error'
          );
          setVerifying(false);
          setTimeout(() => router.replace('/(auth)/login'), 3000);
        }
      } else {
        console.error('No URL found for password reset');
        showAlert(
          'Error',
          'Acceso inválido. Por favor usa el enlace enviado a tu correo electrónico.',
          undefined,
          'error'
        );
        setVerifying(false);
        setTimeout(() => router.replace('/(auth)/login'), 3000);
      }
    } catch (error: any) {
      console.error('Exception verifying reset token:', error);
      showAlert(
        'Error',
        'Ocurrió un error al verificar el enlace. Por favor intenta de nuevo.',
        undefined,
        'error'
      );
      setVerifying(false);
      setTimeout(() => router.replace('/(auth)/login'), 3000);
    }
  };

  const handleResetPassword = async () => {
    // Validate inputs
    if (!newPassword || !confirmPassword) {
      showAlert('Error', 'Por favor completa todos los campos', undefined, 'error');
      return;
    }

    if (newPassword.length < 6) {
      showAlert(
        'Error',
        'La contraseña debe tener al menos 6 caracteres',
        undefined,
        'error'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert('Error', 'Las contraseñas no coinciden', undefined, 'error');
      return;
    }

    setLoading(true);

    try {
      console.log('Updating password...');
      
      // Update the user's password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error('Error updating password:', error);
        showAlert(
          'Error',
          error.message || 'No se pudo actualizar la contraseña. Por favor intenta de nuevo.',
          undefined,
          'error'
        );
        setLoading(false);
        return;
      }

      console.log('Password updated successfully');
      
      // Sign out the user so they can log in with the new password
      await supabase.auth.signOut();

      showAlert(
        'Éxito',
        '¡Tu contraseña ha sido actualizada exitosamente! Ahora puedes iniciar sesión con tu nueva contraseña.',
        () => {
          router.replace('/(auth)/login');
        },
        'success'
      );
    } catch (error: any) {
      console.error('Exception updating password:', error);
      showAlert(
        'Error',
        error.message || 'Ocurrió un error al actualizar la contraseña.',
        undefined,
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Verificando enlace de recuperación...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isValidToken) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <IconSymbol
            ios_icon_name="xmark.circle.fill"
            android_material_icon_name="error"
            size={80}
            color={colors.error}
          />
          <Text style={styles.errorTitle}>Enlace Inválido</Text>
          <Text style={styles.errorMessage}>
            El enlace de recuperación no es válido o ha expirado.
            Serás redirigido al inicio de sesión.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <IconSymbol
              ios_icon_name="lock.shield.fill"
              android_material_icon_name="lock"
              size={60}
              color={colors.primary}
            />
          </View>
          <Text style={styles.title}>Restablecer Contraseña</Text>
          <Text style={styles.subtitle}>
            Ingresa tu nueva contraseña para tu cuenta
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={commonStyles.label}>Nueva Contraseña</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[commonStyles.input, styles.passwordInput]}
                placeholder="Ingresa tu nueva contraseña"
                placeholderTextColor={colors.textSecondary}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                <IconSymbol
                  ios_icon_name={showPassword ? 'eye.slash.fill' : 'eye.fill'}
                  android_material_icon_name={showPassword ? 'visibility-off' : 'visibility'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={commonStyles.label}>Confirmar Nueva Contraseña</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[commonStyles.input, styles.passwordInput]}
                placeholder="Confirma tu nueva contraseña"
                placeholderTextColor={colors.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                <IconSymbol
                  ios_icon_name={showConfirmPassword ? 'eye.slash.fill' : 'eye.fill'}
                  android_material_icon_name={showConfirmPassword ? 'visibility-off' : 'visibility'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.infoBox}>
            <IconSymbol
              ios_icon_name="info.circle.fill"
              android_material_icon_name="info"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.infoText}>
              La contraseña debe tener al menos 6 caracteres.
            </Text>
          </View>

          <TouchableOpacity
            style={[buttonStyles.primary, styles.resetButton, loading && styles.buttonDisabled]}
            onPress={handleResetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={buttonStyles.primaryText}>Actualizar Contraseña</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[buttonStyles.secondary, styles.cancelButton]}
            onPress={() => router.replace('/(auth)/login')}
            disabled={loading}
          >
            <Text style={buttonStyles.secondaryText}>Cancelar</Text>
          </TouchableOpacity>
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
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    marginBottom: 20,
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 12,
    padding: 4,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.cardBackground,
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  resetButton: {
    marginBottom: 12,
  },
  cancelButton: {
    marginBottom: 0,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
