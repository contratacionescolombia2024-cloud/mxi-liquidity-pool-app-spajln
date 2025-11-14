
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
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    idNumber: '',
    address: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleRegister = async () => {
    const { name, idNumber, address, email, password, confirmPassword, referralCode } = formData;

    if (!name || !idNumber || !address || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!acceptedTerms) {
      Alert.alert(
        'Terms and Conditions Required',
        'You must accept the Terms and Conditions to create an account'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    const result = await register({
      name,
      idNumber,
      address,
      email,
      password,
      referralCode: referralCode || undefined,
    });
    setLoading(false);

    if (result.success) {
      Alert.alert(
        'Success',
        'Account created successfully! Please check your email to verify your account before logging in.',
        [
          { text: 'OK', onPress: () => router.replace('/(auth)/login') },
        ]
      );
    } else {
      Alert.alert('Error', result.error || 'Failed to create account. Please try again.');
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonEmoji}>⬅️</Text>
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/04a4d9ac-4539-41d2-bafd-67dd75925bde.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Join MXI Strategic PreSale</Text>
          <Text style={styles.subtitle}>Secure Your Position in the Future</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={commonStyles.label}>Full Name *</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="John Doe"
              placeholderTextColor={colors.textSecondary}
              value={formData.name}
              onChangeText={(value) => updateField('name', value)}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={commonStyles.label}>ID Number *</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="123456789"
              placeholderTextColor={colors.textSecondary}
              value={formData.idNumber}
              onChangeText={(value) => updateField('idNumber', value)}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={commonStyles.label}>Address *</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="123 Main St, City, Country"
              placeholderTextColor={colors.textSecondary}
              value={formData.address}
              onChangeText={(value) => updateField('address', value)}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={commonStyles.label}>Email *</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="your@email.com"
              placeholderTextColor={colors.textSecondary}
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={commonStyles.label}>Password *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[commonStyles.input, styles.passwordInput]}
                placeholder="Minimum 6 characters"
                placeholderTextColor={colors.textSecondary}
                value={formData.password}
                onChangeText={(value) => updateField('password', value)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
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

          <View style={styles.inputContainer}>
            <Text style={commonStyles.label}>Confirm Password *</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="Re-enter password"
              placeholderTextColor={colors.textSecondary}
              value={formData.confirmPassword}
              onChangeText={(value) => updateField('confirmPassword', value)}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={commonStyles.label}>Referral Code (Optional)</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="Enter referral code"
              placeholderTextColor={colors.textSecondary}
              value={formData.referralCode}
              onChangeText={(value) => updateField('referralCode', value)}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.infoBox}>
            <IconSymbol 
              ios_icon_name="info.circle.fill" 
              android_material_icon_name="info" 
              size={20} 
              color={colors.primary} 
            />
            <Text style={styles.infoText}>
              Only one account per person is allowed. Your ID number will be verified.
            </Text>
          </View>

          {/* Terms and Conditions Acceptance */}
          <View style={styles.termsContainer}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setAcceptedTerms(!acceptedTerms)}
            >
              <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
                {acceptedTerms && (
                  <Text style={styles.checkboxEmoji}>✓</Text>
                )}
              </View>
              <View style={styles.termsTextContainer}>
                <Text style={styles.termsText}>
                  I have read and accept the{' '}
                  <Text
                    style={styles.termsLink}
                    onPress={() => setShowTermsModal(true)}
                  >
                    Terms and Conditions
                  </Text>
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[buttonStyles.primary, styles.registerButton]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => router.back()}
          >
            <Text style={styles.loginLinkText}>
              Already have an account? <Text style={styles.loginLinkBold}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Terms and Conditions Modal */}
      <Modal
        visible={showTermsModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowTermsModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>📜 Terms and Conditions</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowTermsModal(false)}
            >
              <Text style={styles.modalCloseEmoji}>✖️</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalScrollContent}>
            <Text style={styles.termsContent}>
              {`TÉRMINOS Y CONDICIONES DE USO

MXI STRATEGIC PRESALE – APP VERSION

MAXCOIN (MXI) is a registered trademark of MXI Strategic Holdings Ltd., Cayman Islands.
App operated by MXI Technologies Inc. (Panamá).
Last update: 15/01/2025 – Version 1.0

1. Aceptación

Al crear una cuenta o utilizar la aplicación MXI Strategic Presale (la "App"), usted acepta estos Términos y Condiciones.
Si no está de acuerdo con ellos, no debe usar la App.

2. Sobre MXI

MXI Strategic Holdings Ltd. (Cayman) es la entidad propietaria del token MXI, la marca y la propiedad intelectual.

MXI Technologies Inc. (Panamá) es la empresa operadora de la App y responsable de su funcionamiento.

3. Función de la App

La App permite:

- Registrar usuarios
- Comprar tokens MXI con USDT (vía Binance)
- Acceder a un sistema de referidos
- Ver saldos, rendimientos y movimientos
- Solicitar retiros de comisiones y/o MXI según las reglas vigentes

4. Elegibilidad

Para usar la App, usted debe:

- Ser mayor de 18 años
- Tener capacidad legal para contratar
- Suministrar datos verídicos
- No vivir en países donde las criptomonedas estén prohibidas

5. Registro y Cuenta

- Solo se permite una cuenta por persona
- Es obligatorio completar KYC para habilitar retiros
- La información registrada debe coincidir con documentos oficiales
- Los números de identificación no pueden repetirse

6. Compra de Tokens MXI

- Mínimo de compra: 50 USDT
- Máximo por usuario: 100.000 USDT
- Pago exclusivamente en USDT a través de Binance
- El número de tokens recibidos depende de la fase de la preventa

7. Sistema de Referidos

Estructura de comisiones:

- Nivel 1: 5%
- Nivel 2: 2%
- Nivel 3: 1%

Requisitos para retirar comisiones:

- 5 referidos activos
- 10 días desde registro
- KYC aprobado
- Cada referido debe haber hecho al menos una compra

8. Rendimientos y Vesting

- Rendimiento: 0,005% por hora
- Comisiones unificadas también generan rendimiento
- Rendimientos no aumentan el vesting
- Se requieren 10 referidos activos para unificar el vesting al saldo principal

9. Retiros

9.1 Retiros de comisiones (USDT)

Requisitos:

- 5 referidos activos
- 10 días de membresía
- KYC aprobado
- Wallet USDT válida

9.2 Retiros de MXI

Requisitos:

- 5 referidos activos
- KYC aprobado

Liberación por fases si el monto excede 50000 usdt:

- 10% inicial
- +10% cada 7 días

10. KYC Obligatorio

Se solicitará:

- Documento oficial válido
- Fotografías
- Selfie (prueba de vida)
- Información verificable

11. Riesgos

Invertir en criptomonedas implica riesgos:

- Volatilidad extrema
- Pérdida total o parcial del capital
- Cambios regulatorios
- Riesgos tecnológicos y de ciberseguridad

MXI Strategic no garantiza ganancias ni retornos fijos.

12. Conductas Prohibidas

No se permite:

- Crear múltiples cuentas
- Proveer datos falsos
- Manipular referidos
- Usar la App para actividades ilícitas
- Procesar lavado de dinero

13. Limitación de Responsabilidad

La App se ofrece "tal cual".
Ni MXI Strategic Holdings Ltd. ni MXI Technologies Inc. son responsables por:

- Pérdidas económicas
- Errores de terceros o blockchain
- Daños indirectos o incidentales
- Uso indebido de la App

14. Aceptación Final

Al registrarse, usted declara que:

- Leyó y entiende estos Términos
- Acepta los riesgos
- Proporciona información veraz
- Cumple con las leyes de su país`}
            </Text>
          </ScrollView>
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[buttonStyles.primary, styles.acceptButton]}
              onPress={() => {
                setAcceptedTerms(true);
                setShowTermsModal(false);
              }}
            >
              <Text style={buttonStyles.primaryText}>✓ Accept Terms</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[buttonStyles.secondary, styles.closeButton]}
              onPress={() => setShowTermsModal(false)}
            >
              <Text style={buttonStyles.secondaryText}>Close</Text>
            </TouchableOpacity>
          </View>
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
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  backButton: {
    marginBottom: 16,
    alignSelf: 'flex-start',
    padding: 8,
  },
  backButtonEmoji: {
    fontSize: 24,
  },
  logoContainer: {
    marginBottom: 16,
    width: 100,
    height: 100,
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
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  termsContainer: {
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxEmoji: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '700',
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  registerButton: {
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  loginLinkBold: {
    color: colors.primary,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
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
  modalCloseButton: {
    padding: 8,
  },
  modalCloseEmoji: {
    fontSize: 24,
  },
  modalContent: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  termsContent: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 22,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  acceptButton: {
    marginBottom: 0,
  },
  closeButton: {
    marginBottom: 0,
  },
});
