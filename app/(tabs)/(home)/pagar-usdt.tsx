
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import * as Clipboard2 from 'expo-clipboard';
import { supabase } from '@/lib/supabase';

const RECIPIENT_ADDRESS = '0x68F0d7c607617DA0b1a0dC7b72885E11ddFec623';
const MIN_USDT = 20;
const MXI_RATE = 2.5;

const NETWORKS = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    label: 'ERC20',
    color: '#627EEA',
    icon: 'Ξ',
    description: 'Red Ethereum - Validación independiente'
  },
  {
    id: 'bnb',
    name: 'BNB Chain',
    label: 'BEP20',
    color: '#F3BA2F',
    icon: 'B',
    description: 'Red BNB Chain - Validación independiente'
  },
  {
    id: 'polygon',
    name: 'Polygon',
    label: 'Matic',
    color: '#8247E5',
    icon: 'P',
    description: 'Red Polygon - Validación independiente'
  }
];

export default function PagarUSDTScreen() {
  const router = useRouter();
  const { user, session } = useAuth();
  const [selectedNetwork, setSelectedNetwork] = useState('ethereum');
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('');

  const copyAddress = async () => {
    try {
      await Clipboard2.setStringAsync(RECIPIENT_ADDRESS);
      Alert.alert('✅ Copiado', 'Dirección copiada al portapapeles');
    } catch (error) {
      console.error('Error copying:', error);
    }
  };

  const handleVerifyPayment = async () => {
    console.log('🔍 [VERIFICAR] Iniciando verificación de pago...');
    console.log('🔍 [VERIFICAR] TxHash:', txHash);
    console.log('🔍 [VERIFICAR] Red seleccionada:', selectedNetwork);
    console.log('🔍 [VERIFICAR] Usuario ID:', user?.id);

    if (!txHash.trim()) {
      console.error('❌ [VERIFICAR] Error: Hash vacío');
      Alert.alert('Error', 'Por favor ingresa el hash de la transacción');
      return;
    }

    if (!txHash.startsWith('0x') || txHash.length !== 66) {
      console.error('❌ [VERIFICAR] Error: Hash inválido - longitud:', txHash.length);
      Alert.alert(
        'Hash Inválido',
        'El hash de transacción debe comenzar con 0x y tener 66 caracteres\n\nHash actual: ' + txHash.length + ' caracteres'
      );
      return;
    }

    const selectedNetworkData = NETWORKS.find(n => n.id === selectedNetwork);
    console.log('🔍 [VERIFICAR] Datos de red:', selectedNetworkData);

    Alert.alert(
      '⚠️ Confirmar Red',
      `¿Estás seguro de que la transacción fue realizada en ${selectedNetworkData?.name} (${selectedNetworkData?.label})?\n\nLa validación se hará SOLO en esta red.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => console.log('🔍 [VERIFICAR] Verificación cancelada por el usuario')
        },
        {
          text: 'Sí, verificar',
          onPress: () => performVerification()
        }
      ]
    );
  };

  const performVerification = async () => {
    const requestId = Date.now().toString().substring(-6);
    console.log(`\n🚀 [${requestId}] ========== INICIANDO VERIFICACIÓN ==========`);
    console.log(`🚀 [${requestId}] Timestamp:`, new Date().toISOString());
    console.log(`🚀 [${requestId}] TxHash:`, txHash);
    console.log(`🚀 [${requestId}] Red:`, selectedNetwork);
    console.log(`🚀 [${requestId}] Usuario:`, user?.id);
    console.log(`🚀 [${requestId}] Token de sesión:`, session?.access_token ? 'Presente' : 'Ausente');

    setLoading(true);
    setVerificationStatus('Verificando hash duplicado...');

    try {
      // 🔒 STEP 1: Check for duplicate hash
      console.log(`🔍 [${requestId}] Verificando hash duplicado...`);
      const { data: existingPayments, error: duplicateError } = await supabase
        .from('payments')
        .select('id, order_id, user_id, estado, mxi')
        .eq('tx_hash', txHash.trim())
        .limit(1);

      if (duplicateError) {
        console.error(`❌ [${requestId}] Error verificando duplicados:`, duplicateError);
        throw new Error('Error al verificar duplicados en la base de datos');
      }

      if (existingPayments && existingPayments.length > 0) {
        const existingPayment = existingPayments[0];
        console.error(`❌ [${requestId}] Hash duplicado encontrado:`, existingPayment);
        
        Alert.alert(
          '⚠️ Hash Duplicado',
          `Este hash de transacción ya ha sido registrado anteriormente.\n\n` +
          `Orden: ${existingPayment.order_id}\n` +
          `Estado: ${existingPayment.estado}\n\n` +
          `No puedes usar el mismo hash de transacción dos veces. Si crees que esto es un error, contacta a soporte.`,
          [{ text: 'OK' }]
        );
        setLoading(false);
        setVerificationStatus('');
        return;
      }

      console.log(`✅ [${requestId}] Hash no duplicado, continuando...`);

      // STEP 2: Verify transaction on blockchain
      setVerificationStatus('Conectando con el servidor...');

      const url = 'https://aeyfnjuatbtcauiumbhn.supabase.co/functions/v1/verificar-tx';
      const payload = {
        txHash: txHash.trim(),
        userId: user?.id,
        network: selectedNetwork,
      };

      console.log(`📤 [${requestId}] URL:`, url);
      console.log(`📤 [${requestId}] Payload:`, JSON.stringify(payload, null, 2));

      setVerificationStatus('Verificando transacción en blockchain...');

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log(`📥 [${requestId}] Status HTTP:`, response.status);
      console.log(`📥 [${requestId}] Status Text:`, response.statusText);

      const responseText = await response.text();
      console.log(`📥 [${requestId}] Response (raw):`, responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log(`📥 [${requestId}] Response (parsed):`, JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.error(`❌ [${requestId}] Error parseando JSON:`, parseError);
        throw new Error('Respuesta inválida del servidor: ' + responseText.substring(0, 100));
      }

      if (data.ok) {
        console.log(`✅ [${requestId}] ========== VERIFICACIÓN EXITOSA ==========`);
        console.log(`✅ [${requestId}] USDT:`, data.usdt);
        console.log(`✅ [${requestId}] MXI:`, data.mxi);
        console.log(`✅ [${requestId}] Red:`, data.network);

        Alert.alert(
          '✅ Pago Confirmado',
          `Se acreditaron ${data.mxi.toFixed(2)} MXI a tu cuenta.\n\nRed: ${data.network}\nUSDT pagados: ${data.usdt.toFixed(2)}`,
          [
            {
              text: 'Ver Saldo',
              onPress: () => router.push('/(tabs)/(home)/saldo-mxi'),
            },
            {
              text: 'OK',
              onPress: () => {
                setTxHash('');
                router.back();
              },
            },
          ]
        );
      } else {
        console.error(`❌ [${requestId}] ========== VERIFICACIÓN FALLIDA ==========`);
        console.error(`❌ [${requestId}] Error code:`, data.error);
        console.error(`❌ [${requestId}] Error message:`, data.message);

        let errorMessage = '';
        let errorTitle = 'Error de Verificación';
        
        switch (data.error) {
          case 'tx_not_found':
            errorTitle = '🔍 Transacción No Encontrada';
            errorMessage = `No se encontró la transacción en ${NETWORKS.find(n => n.id === selectedNetwork)?.name}.\n\n📋 Pasos para solucionar:\n\n1. Verifica que el hash sea correcto\n2. Asegúrate de que la transacción esté en la red ${NETWORKS.find(n => n.id === selectedNetwork)?.name}\n3. Espera a que la transacción tenga al menos 1 confirmación\n4. Verifica en un explorador de bloques:\n   • Ethereum: etherscan.io\n   • BNB Chain: bscscan.com\n   • Polygon: polygonscan.com`;
            break;
          case 'pocas_confirmaciones':
            errorTitle = '⏳ Esperando Confirmaciones';
            errorMessage = `La transacción necesita más confirmaciones.\n\n${data.message || ''}\n\nConfirmaciones actuales: ${data.confirmations || 0}\nConfirmaciones requeridas: ${data.required || 3}\n\n⏰ Por favor espera unos minutos e intenta nuevamente.`;
            break;
          case 'monto_insuficiente':
            errorTitle = '💰 Monto Insuficiente';
            errorMessage = `El monto mínimo es ${MIN_USDT} USDT.\n\n${data.message || ''}\n\nMonto recibido: ${data.usdt || 0} USDT\nMonto mínimo: ${data.minimum || MIN_USDT} USDT`;
            break;
          case 'ya_procesado':
            errorTitle = '✓ Ya Procesado';
            errorMessage = 'Esta transacción ya ha sido procesada anteriormente.\n\nSi crees que esto es un error, contacta a soporte.';
            break;
          case 'no_transfer_found':
            errorTitle = '❌ Transferencia No Válida';
            errorMessage = `No se encontró una transferencia USDT válida a la dirección receptora.\n\n📋 Verifica:\n\n1. Que enviaste USDT (no otro token)\n2. Que la dirección receptora es correcta:\n   ${RECIPIENT_ADDRESS}\n3. Que la transacción está en ${NETWORKS.find(n => n.id === selectedNetwork)?.name}`;
            break;
          case 'tx_failed':
            errorTitle = '❌ Transacción Fallida';
            errorMessage = 'La transacción falló en la blockchain.\n\nVerifica el estado de la transacción en un explorador de bloques.';
            break;
          case 'invalid_network':
            errorTitle = '🌐 Red No Válida';
            errorMessage = data.message || 'Red no válida seleccionada.\n\nSelecciona una de las redes disponibles: Ethereum, BNB Chain o Polygon.';
            break;
          case 'rpc_not_configured':
            errorTitle = '⚙️ Error de Configuración';
            errorMessage = `Error de configuración del servidor.\n\n${data.message}\n\n⚠️ Contacta al administrador del sistema.`;
            break;
          case 'wrong_network':
            errorTitle = '🌐 Red Incorrecta';
            errorMessage = data.message || 'El RPC está conectado a la red incorrecta.\n\nContacta al administrador del sistema.';
            break;
          case 'no_auth':
          case 'invalid_session':
          case 'unauthorized':
            errorTitle = '🔐 Error de Autenticación';
            errorMessage = 'Tu sesión ha expirado.\n\nPor favor cierra sesión y vuelve a iniciar sesión.';
            break;
          case 'missing_fields':
            errorTitle = '📝 Datos Incompletos';
            errorMessage = 'Faltan datos requeridos.\n\nAsegúrate de ingresar el hash de transacción.';
            break;
          case 'database_error':
          case 'update_failed':
          case 'user_not_found':
            errorTitle = '💾 Error de Base de Datos';
            errorMessage = `Error al procesar la transacción.\n\n${data.message || ''}\n\nPor favor intenta nuevamente o contacta a soporte.`;
            break;
          case 'rpc_connection_failed':
            errorTitle = '🔌 Error de Conexión RPC';
            errorMessage = `No se pudo conectar al nodo de blockchain.\n\n${data.message || ''}\n\nPor favor intenta nuevamente en unos minutos.`;
            break;
          case 'internal_error':
            errorTitle = '⚠️ Error Interno';
            errorMessage = `Error interno del servidor.\n\n${data.message || ''}\n\nPor favor intenta nuevamente o contacta a soporte.`;
            break;
          default:
            errorTitle = '❌ Error Desconocido';
            errorMessage = data.message || 'Error al verificar el pago.\n\nPor favor intenta nuevamente o contacta a soporte.';
        }

        console.error(`❌ [${requestId}] Mostrando error al usuario:`, errorTitle);
        Alert.alert(errorTitle, errorMessage);
      }
    } catch (error: any) {
      console.error(`❌ [${requestId}] ========== ERROR DE CONEXIÓN ==========`);
      console.error(`❌ [${requestId}] Error:`, error);
      console.error(`❌ [${requestId}] Error message:`, error.message);
      console.error(`❌ [${requestId}] Error stack:`, error.stack);

      Alert.alert(
        '🔌 Error de Conexión',
        `No se pudo conectar con el servidor.\n\nDetalles técnicos:\n${error.message}\n\n📋 Pasos para solucionar:\n\n1. Verifica tu conexión a internet\n2. Intenta nuevamente en unos segundos\n3. Si el problema persiste, contacta a soporte`
      );
    } finally {
      setLoading(false);
      setVerificationStatus('');
      console.log(`🏁 [${requestId}] ========== VERIFICACIÓN FINALIZADA ==========\n`);
    }
  };

  const selectedNetworkData = NETWORKS.find(n => n.id === selectedNetwork);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
        <Text style={styles.headerTitle}>Pagar en USDT</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.networkCard, { borderColor: selectedNetworkData?.color }]}>
          <Text style={styles.networkTitle}>Selecciona la Red de Pago</Text>
          <Text style={styles.networkSubtitle}>
            Cada red valida sus transacciones de forma independiente
          </Text>
          <View style={styles.networkButtons}>
            {NETWORKS.map((network, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.networkButton,
                  selectedNetwork === network.id && {
                    backgroundColor: network.color + '30',
                    borderColor: network.color,
                    borderWidth: 2,
                  }
                ]}
                onPress={() => {
                  console.log('🌐 [RED] Cambiando red a:', network.id);
                  setSelectedNetwork(network.id);
                }}
              >
                <View style={[styles.networkIcon, { backgroundColor: network.color }]}>
                  <Text style={styles.networkIconText}>{network.icon}</Text>
                </View>
                <View style={styles.networkInfo}>
                  <Text style={styles.networkName}>{network.name}</Text>
                  <Text style={styles.networkLabel}>{network.label}</Text>
                  <Text style={styles.networkDescription}>{network.description}</Text>
                </View>
                {selectedNetwork === network.id && (
                  <IconSymbol
                    ios_icon_name="checkmark.circle.fill"
                    android_material_icon_name="check_circle"
                    size={24}
                    color={network.color}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.validationCard, { backgroundColor: selectedNetworkData?.color + '15', borderColor: selectedNetworkData?.color }]}>
          <View style={styles.validationHeader}>
            <IconSymbol
              ios_icon_name="shield.checkmark.fill"
              android_material_icon_name="verified_user"
              size={32}
              color={selectedNetworkData?.color}
            />
            <View style={styles.validationInfo}>
              <Text style={[styles.validationTitle, { color: selectedNetworkData?.color }]}>
                Validación en {selectedNetworkData?.name}
              </Text>
              <Text style={styles.validationText}>
                Los pagos en {selectedNetworkData?.name} solo se validan en la red {selectedNetworkData?.name}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <IconSymbol
              ios_icon_name="info.circle.fill"
              android_material_icon_name="info"
              size={32}
              color={colors.primary}
            />
            <Text style={styles.infoTitle}>Instrucciones de Pago</Text>
          </View>
          
          <View style={styles.stepsList}>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>
                Selecciona la red que vas a usar ({selectedNetworkData?.label})
              </Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>
                Envía USDT desde cualquier wallet a la dirección receptora
              </Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>
                Monto mínimo: {MIN_USDT} USDT
              </Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>4</Text>
              <Text style={styles.stepText}>
                Copia el hash de la transacción (txHash)
              </Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>5</Text>
              <Text style={styles.stepText}>
                Pega el txHash aquí y verifica el pago
              </Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>6</Text>
              <Text style={styles.stepText}>
                Recibirás MXI = USDT × {MXI_RATE}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.addressCard}>
          <Text style={styles.addressLabel}>
            Dirección Receptora ({selectedNetworkData?.label})
          </Text>
          <View style={styles.addressContainer}>
            <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">
              {RECIPIENT_ADDRESS}
            </Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={copyAddress}
            >
              <IconSymbol
                ios_icon_name="doc.on.doc.fill"
                android_material_icon_name="content_copy"
                size={20}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
          <View style={[styles.addressWarningBox, { backgroundColor: selectedNetworkData?.color + '20' }]}>
            <IconSymbol
              ios_icon_name="exclamationmark.triangle.fill"
              android_material_icon_name="warning"
              size={20}
              color={selectedNetworkData?.color}
            />
            <Text style={[styles.addressWarning, { color: selectedNetworkData?.color }]}>
              ⚠️ Solo envía USDT en la red {selectedNetworkData?.name} ({selectedNetworkData?.label})
            </Text>
          </View>
        </View>

        <View style={styles.calculatorCard}>
          <Text style={styles.calculatorTitle}>Calculadora de MXI</Text>
          <View style={styles.calculatorRow}>
            <Text style={styles.calculatorLabel}>20 USDT</Text>
            <Text style={styles.calculatorArrow}>→</Text>
            <Text style={styles.calculatorValue}>{(20 * MXI_RATE).toFixed(2)} MXI</Text>
          </View>
          <View style={styles.calculatorRow}>
            <Text style={styles.calculatorLabel}>50 USDT</Text>
            <Text style={styles.calculatorArrow}>→</Text>
            <Text style={styles.calculatorValue}>{(50 * MXI_RATE).toFixed(2)} MXI</Text>
          </View>
          <View style={styles.calculatorRow}>
            <Text style={styles.calculatorLabel}>100 USDT</Text>
            <Text style={styles.calculatorArrow}>→</Text>
            <Text style={styles.calculatorValue}>{(100 * MXI_RATE).toFixed(2)} MXI</Text>
          </View>
          <View style={styles.calculatorRow}>
            <Text style={styles.calculatorLabel}>500 USDT</Text>
            <Text style={styles.calculatorArrow}>→</Text>
            <Text style={styles.calculatorValue}>{(500 * MXI_RATE).toFixed(2)} MXI</Text>
          </View>
        </View>

        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Hash de Transacción (txHash)</Text>
          <TextInput
            style={styles.input}
            placeholder="0x..."
            placeholderTextColor="#666666"
            value={txHash}
            onChangeText={(text) => {
              console.log('📝 [INPUT] Hash ingresado:', text);
              setTxHash(text);
            }}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            multiline
            numberOfLines={3}
          />
          <Text style={styles.inputHint}>
            Pega el hash de tu transacción de {selectedNetworkData?.name} aquí
          </Text>
          {txHash.length > 0 && (
            <Text style={[styles.inputHint, { marginTop: 4, color: txHash.length === 66 ? colors.success : colors.warning }]}>
              {txHash.length === 66 ? '✓ Longitud correcta' : `⚠️ ${txHash.length}/66 caracteres`}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.verifyButton,
            { backgroundColor: selectedNetworkData?.color || colors.primary },
            (loading || !txHash.trim()) && styles.verifyButtonDisabled
          ]}
          onPress={handleVerifyPayment}
          disabled={loading || !txHash.trim()}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              {verificationStatus ? (
                <Text style={styles.verifyButtonText}>{verificationStatus}</Text>
              ) : null}
            </View>
          ) : (
            <React.Fragment>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check_circle"
                size={24}
                color="#FFFFFF"
              />
              <Text style={styles.verifyButtonText}>
                Verificar en {selectedNetworkData?.name}
              </Text>
            </React.Fragment>
          )}
        </TouchableOpacity>

        <View style={styles.warningCard}>
          <IconSymbol
            ios_icon_name="exclamationmark.triangle.fill"
            android_material_icon_name="warning"
            size={24}
            color={colors.warning}
          />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>⚠️ Importante - Validación por Red</Text>
            <Text style={styles.warningText}>
              • Cada red valida sus transacciones de forma independiente
            </Text>
            <Text style={styles.warningText}>
              • Los pagos en ETH solo se validan en la red Ethereum
            </Text>
            <Text style={styles.warningText}>
              • Los pagos en BNB solo se validan en la red BNB Chain
            </Text>
            <Text style={styles.warningText}>
              • Los pagos en Polygon solo se validan en la red Polygon
            </Text>
            <Text style={styles.warningText}>
              • Asegúrate de seleccionar la red correcta antes de verificar
            </Text>
            <Text style={styles.warningText}>
              • La transacción debe tener al menos 3 confirmaciones
            </Text>
            <Text style={styles.warningText}>
              • ⚠️ NO PUEDES USAR EL MISMO HASH DOS VECES - Sistema anti-duplicados activo
            </Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  networkCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
  },
  networkTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  networkSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  networkButtons: {
    gap: 12,
  },
  networkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  networkIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  networkIconText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  networkInfo: {
    flex: 1,
    marginLeft: 12,
  },
  networkName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  networkLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  networkDescription: {
    fontSize: 10,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  validationCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
  },
  validationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  validationInfo: {
    flex: 1,
  },
  validationTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  validationText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  infoCard: {
    backgroundColor: colors.primary + '15',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  stepsList: {
    gap: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 28,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  addressCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  addressText: {
    flex: 1,
    fontSize: 12,
    color: colors.text,
    fontFamily: 'monospace',
  },
  copyButton: {
    marginLeft: 8,
    padding: 4,
  },
  addressWarningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
  },
  addressWarning: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  calculatorCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  calculatorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  calculatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  calculatorLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  calculatorArrow: {
    fontSize: 14,
    color: colors.primary,
    marginHorizontal: 12,
  },
  calculatorValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    flex: 1,
    textAlign: 'right',
  },
  inputCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 12,
    color: colors.text,
    fontFamily: 'monospace',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
  },
  verifyButton: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
    minHeight: 56,
  },
  verifyButtonDisabled: {
    opacity: 0.5,
  },
  verifyButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  warningCard: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.warning,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
});
