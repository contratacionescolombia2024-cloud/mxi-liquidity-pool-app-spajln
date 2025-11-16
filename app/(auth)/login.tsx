
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import Footer from '@/components/Footer';

export default function LoginScreen() {
  const router = useRouter();
  const { login, resendVerificationEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    // Clear previous error
    setErrorMessage('');
    setNeedsVerification(false);

    if (!email || !password) {
      setErrorMessage('Por favor completa todos los campos');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Por favor ingresa un correo electrónico válido');
      return;
    }

    setLoading(true);
    
    try {
      const result = await login(email.trim().toLowerCase(), password);
      
      if (result.success) {
        // Clear form
        setEmail('');
        setPassword('');
        setErrorMessage('');
        
        // Navigate to home
        router.replace('/(tabs)/(home)/');
      } else {
        // Handle different error types
        if (result.error?.includes('verifica tu correo') || result.error?.includes('verify your email')) {
          setNeedsVerification(true);
          setErrorMessage(result.error);
        } else if (result.error?.includes('incorrectos') || result.error?.includes('Invalid login credentials')) {
          setErrorMessage('Correo electrónico o contraseña incorrectos. Por favor verifica tus credenciales.');
        } else {
          setErrorMessage(result.error || 'Error al iniciar sesión. Por favor intenta de nuevo.');
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setErrorMessage('Error de conexión. Por favor verifica tu internet e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    
    try {
      const result = await resendVerificationEmail();
      
      if (result.success) {
        Alert.alert(
          'Correo Enviado',
          'Se ha enviado un nuevo correo de verificación. Por favor revisa tu bandeja de entrada.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Error',
          result.error || 'No se pudo enviar el correo de verificación. Por favor intenta más tarde.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Error al enviar el correo. Por favor intenta más tarde.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/04a4d9ac-4539-41d2-bafd-67dd75925bde.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>MXI Strategic PreSale</Text>
          <Text style={styles.subtitle}>Asegura tu Posición en el Futuro</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={commonStyles.label}>Correo Electrónico</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="tu@correo.com"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrorMessage('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={commonStyles.label}>Contraseña</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[commonStyles.input, styles.passwordInput]}
                placeholder="Ingresa tu contraseña"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrorMessage('');
                }}
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
                  android_material_icon_name={showPassword ? 'visibility_off' : 'visibility'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {errorMessage ? (
            <View style={styles.errorBox}>
              <IconSymbol 
                ios_icon_name="exclamationmark.triangle.fill" 
                android_material_icon_name="warning"
                size={20} 
                color={colors.error} 
              />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {needsVerification && (
            <TouchableOpacity 
              style={styles.resendButton}
              onPress={handleResendVerification}
              disabled={loading}
            >
              <Text style={styles.resendButtonText}>Reenviar Correo de Verificación</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[buttonStyles.primary, styles.loginButton, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={[buttonStyles.outline, styles.registerButton]}
            onPress={() => router.push('/(auth)/register')}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>Crear Cuenta Nueva</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            La Pre-Venta cierra el 15 de Enero de 2025 a las 12:00 UTC
          </Text>
        </View>

        {/* Footer */}
        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  logoContainer: {
    marginBottom: 20,
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
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
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: colors.error,
    fontWeight: '500',
  },
  resendButton: {
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
  },
  resendButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  loginButton: {
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    color: colors.textSecondary,
    fontSize: 14,
  },
  registerButton: {
    marginBottom: 16,
  },
  registerButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 32,
    marginBottom: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
