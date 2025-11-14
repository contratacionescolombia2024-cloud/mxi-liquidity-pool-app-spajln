
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
              {`TÉRMINOS Y CONDICIONES DE USO - POOL DE LIQUIDEZ MAXCOIN (MXI)

Última actualización: 15 de Enero de 2025

1. ACEPTACIÓN DE LOS TÉRMINOS

Al registrarse y utilizar la aplicación Pool de Liquidez Maxcoin (en adelante, "la Aplicación"), usted acepta estar legalmente vinculado por estos Términos y Condiciones. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar la Aplicación.

2. DESCRIPCIÓN DEL SERVICIO

La Aplicación permite a los usuarios participar en un pool de liquidez para la criptomoneda Maxcoin (MXI) mediante:

- Registro de usuario con información personal verificable
- Compra de tokens MXI mediante pagos en USDT a través de Binance
- Participación en un sistema de referidos multinivel
- Generación de rendimientos (yield) sobre tokens MXI adquiridos
- Retiro de comisiones y tokens MXI según las condiciones establecidas

3. ELEGIBILIDAD Y REGISTRO

3.1 Requisitos de Elegibilidad
- Ser mayor de 18 años
- Tener capacidad legal para celebrar contratos vinculantes
- No estar ubicado en jurisdicciones donde las criptomonedas estén prohibidas
- Proporcionar información veraz y verificable

3.2 Proceso de Registro
- Solo se permite una cuenta por persona
- Se requiere verificación de identidad (KYC) para retiros
- La información proporcionada debe coincidir con documentos oficiales
- El número de identificación será verificado y no puede duplicarse

4. INVERSIÓN Y COMPRA DE TOKENS

4.1 Montos de Inversión
- Inversión mínima: 50 USDT
- Inversión máxima por cliente: 100,000 USDT
- Los pagos se realizan exclusivamente en USDT a través de Binance
- La cantidad de tokens MXI recibidos depende del precio de la fase actual

5. SISTEMA DE REFERIDOS

5.1 Estructura de Comisiones
- Nivel 1: 3% de las compras de referidos directos
- Nivel 2: 2% de las compras de referidos de segundo nivel
- Nivel 3: 1% de las compras de referidos de tercer nivel

5.2 Requisitos para Retiro de Comisiones
- Mínimo 5 referidos activos de primer nivel
- 10 días desde la fecha de registro
- Verificación KYC aprobada
- Los referidos deben haber realizado al menos una compra de MXI

6. SISTEMA DE VESTING Y GENERACIÓN DE RENDIMIENTOS

6.1 Vesting (Minería)
- Los tokens MXI comprados directamente generan rendimientos del 0.005% por hora
- Los tokens MXI obtenidos de comisiones unificadas también generan rendimientos
- Los rendimientos generados NO aumentan el porcentaje de vesting
- Se requieren 10 referidos activos para unificar el saldo de vesting al balance principal

7. RETIROS

7.1 Retiro de Comisiones (USDT)
Requisitos:
- 5 referidos activos de primer nivel
- 10 días de membresía
- KYC verificado y aprobado
- Dirección de billetera USDT válida

7.2 Retiro de Tokens MXI
Requisitos:
- 5 referidos activos de primer nivel
- KYC verificado y aprobado
- Pool de liquidez lanzado oficialmente
- Sistema de liberación por fases (10% inicial, 10% cada 7 días)

8. VERIFICACIÓN KYC (KNOW YOUR CUSTOMER)

8.1 Requisitos KYC
- Documento de identidad válido (pasaporte, cédula o licencia de conducir)
- Fotografía del frente y reverso del documento
- Información personal verificable

9. CIERRE DEL POOL Y LANZAMIENTO

9.1 Fecha de Cierre
- Fecha límite: 15 de enero de 2025 a las 12:00 UTC
- No se aceptarán nuevos participantes después de esta fecha
- Objetivo: 250,000 participantes

10. RIESGOS Y ADVERTENCIAS

ADVERTENCIA: La inversión en criptomonedas conlleva riesgos significativos:
- Volatilidad extrema de precios
- Posibilidad de pérdida total de la inversión
- Riesgos regulatorios y legales
- Riesgos tecnológicos y de seguridad

11. PROHIBICIONES Y CONDUCTA DEL USUARIO

Está estrictamente prohibido:
- Crear múltiples cuentas
- Proporcionar información falsa o fraudulenta
- Manipular el sistema de referidos
- Realizar actividades de lavado de dinero
- Utilizar la Aplicación para fines ilegales

12. LIMITACIÓN DE RESPONSABILIDAD

LA APLICACIÓN SE PROPORCIONA "TAL CUAL" SIN GARANTÍAS DE NINGÚN TIPO. En ningún caso seremos responsables por pérdidas de ganancias, pérdida de datos o daños indirectos.

13. ACEPTACIÓN

AL REGISTRARSE EN LA APLICACIÓN, USTED CONFIRMA QUE:
- Ha leído y comprendido estos Términos y Condiciones
- Acepta estar legalmente vinculado por ellos
- Comprende los riesgos asociados con la inversión en criptomonedas
- Proporciona información veraz y verificable
- Cumple con todos los requisitos de elegibilidad

IMPORTANTE: Estos términos y condiciones son legalmente vinculantes. Si no está de acuerdo con alguna parte, no debe utilizar la Aplicación. Se recomienda consultar con un asesor legal o financiero antes de realizar inversiones en criptomonedas.

Fecha de vigencia: 15 de Enero de 2025
Versión: 1.0`}
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
