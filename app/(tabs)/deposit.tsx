
import React, { useState, useEffect } from 'react';
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
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import * as Clipboard2 from 'expo-clipboard';

const MIN_USDT_DIRECT = 20;
const MXI_RATE = 2.5;
const RECIPIENT_ADDRESS = '0x68F0d7c607617DA0b1a0dC7b72885E11ddFec623';

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

export default function DepositScreen() {
  const router = useRouter();
  const { user, session, getPhaseInfo } = useAuth();
  
  const [currentPrice, setCurrentPrice] = useState(0.40);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [phaseInfo, setPhaseInfo] = useState<any>(null);

  // Direct USDT payment state
  const [selectedNetwork, setSelectedNetwork] = useState('ethereum');
  const [txHash, setTxHash] = useState('');
  const [loadingTx, setLoadingTx] = useState(false);
  const [directUsdtAmount, setDirectUsdtAmount] = useState('');
  const [directMxiAmount, setDirectMxiAmount] = useState(0);

  useEffect(() => {
    loadPhaseInfo();
  }, []);

  useEffect(() => {
    if (directUsdtAmount && !isNaN(parseFloat(directUsdtAmount))) {
      const usdtAmount = parseFloat(directUsdtAmount);
      const mxi = usdtAmount * MXI_RATE;
      setDirectMxiAmount(mxi);
    } else {
      setDirectMxiAmount(0);
    }
  }, [directUsdtAmount]);

  const loadPhaseInfo = async () => {
    try {
      const info = await getPhaseInfo();
      if (info) {
        setCurrentPrice(info.currentPriceUsdt);
        setCurrentPhase(info.currentPhase);
        setPhaseInfo(info);
      }
    } catch (error: any) {
      console.error('Error loading phase info:', error);
    }
  };

  const copyAddress = async () => {
    try {
      await Clipboard2.setStringAsync(RECIPIENT_ADDRESS);
      Alert.alert('✅ Copiado', 'Dirección copiada al portapapeles');
    } catch (error) {
      console.error('Error copying:', error);
    }
  };

  const handleVerifyPayment = async () => {
    if (!txHash.trim()) {
      Alert.alert('Error', 'Por favor ingresa el hash de la transacción');
      return;
    }

    if (!txHash.startsWith('0x') || txHash.length !== 66) {
      Alert.alert(
        'Hash Inválido',
        'El hash de transacción debe comenzar con 0x y tener 66 caracteres'
      );
      return;
    }

    const selectedNetworkData = NETWORKS.find(n => n.id === selectedNetwork);

    Alert.alert(
      '⚠️ Confirmar Red',
      `¿Estás seguro de que la transacción fue realizada en ${selectedNetworkData?.name} (${selectedNetworkData?.label})?\n\nLa validación se hará SOLO en esta red.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Sí, verificar',
          onPress: () => performVerification()
        }
      ]
    );
  };

  const performVerification = async () => {
    setLoadingTx(true);

    try {
      const response = await fetch(
        'https://aeyfnjuatbtcauiumbhn.supabase.co/functions/v1/verificar-tx',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            txHash: txHash.trim(),
            userId: user?.id,
            network: selectedNetwork,
          }),
        }
      );

      const data = await response.json();

      if (data.ok) {
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
              },
            },
          ]
        );
      } else {
        let errorMessage = '';
        
        switch (data.error) {
          case 'tx_not_found':
            errorMessage = `Transacción no encontrada en ${NETWORKS.find(n => n.id === selectedNetwork)?.name}.\n\nVerifica que:\n• El hash sea correcto\n• La transacción esté en la red ${NETWORKS.find(n => n.id === selectedNetwork)?.name}\n• La transacción tenga al menos 1 confirmación`;
            break;
          case 'pocas_confirmaciones':
            errorMessage = data.message || 'La transacción necesita más confirmaciones. Por favor intenta más tarde.';
            break;
          case 'monto_insuficiente':
            errorMessage = `El monto mínimo es ${MIN_USDT_DIRECT} USDT. ${data.message || ''}`;
            break;
          case 'ya_procesado':
            errorMessage = 'Esta transacción ya ha sido procesada anteriormente.';
            break;
          case 'no_transfer_found':
            errorMessage = `No se encontró una transferencia USDT válida a la dirección receptora en ${NETWORKS.find(n => n.id === selectedNetwork)?.name}.`;
            break;
          case 'tx_failed':
            errorMessage = 'La transacción falló en la blockchain.';
            break;
          case 'invalid_network':
            errorMessage = data.message || 'Red no válida seleccionada.';
            break;
          case 'rpc_not_configured':
            errorMessage = `⚠️ Error de Configuración del Servidor\n\n${data.message}\n\nContacta al administrador para configurar el RPC de esta red.`;
            break;
          case 'wrong_network':
            errorMessage = data.message || 'El RPC está conectado a la red incorrecta.';
            break;
          default:
            errorMessage = data.message || 'Error al verificar el pago. Por favor intenta nuevamente.';
        }

        Alert.alert('Error', errorMessage);
      }
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      Alert.alert(
        'Error de Conexión',
        'No se pudo conectar con el servidor. Por favor verifica tu conexión e intenta nuevamente.'
      );
    } finally {
      setLoadingTx(false);
    }
  };

  const selectedNetworkData = NETWORKS.find(n => n.id === selectedNetwork);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Depositar USDT</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[commonStyles.card, styles.balanceCard]}>
          <View style={styles.balanceHeader}>
            <IconSymbol 
              ios_icon_name="dollarsign.circle.fill" 
              android_material_icon_name="account_balance_wallet" 
              size={48} 
              color={colors.primary} 
            />
            <Text style={styles.balanceLabel}>Balance Actual</Text>
          </View>
          <Text style={styles.balanceValue}>{user?.mxiBalance.toFixed(2) || '0.00'} MXI</Text>
          <Text style={styles.balanceSubtext}>${user?.usdtContributed.toFixed(2) || '0.00'} USDT Contribuido</Text>
        </View>

        <View style={styles.phaseCard}>
          <Text style={styles.phaseTitle}>🚀 Fase Actual de Preventa</Text>
          <View style={styles.phaseRow}>
            <Text style={styles.phaseLabel}>Fase Activa:</Text>
            <Text style={styles.phaseValue}>Fase {currentPhase} de 3</Text>
          </View>
          <View style={styles.phaseRow}>
            <Text style={styles.phaseLabel}>Precio Actual:</Text>
            <Text style={styles.phaseValue}>{currentPrice.toFixed(2)} USDT por MXI</Text>
          </View>
          <View style={styles.phaseDivider} />
          <View style={styles.phaseRow}>
            <Text style={styles.phaseLabel}>Fase 1:</Text>
            <Text style={styles.phaseValue}>0.40 USDT</Text>
          </View>
          <View style={styles.phaseRow}>
            <Text style={styles.phaseLabel}>Fase 2:</Text>
            <Text style={styles.phaseValue}>0.70 USDT</Text>
          </View>
          <View style={styles.phaseRow}>
            <Text style={styles.phaseLabel}>Fase 3:</Text>
            <Text style={styles.phaseValue}>1.00 USDT</Text>
          </View>
          {phaseInfo && (
            <React.Fragment>
              <View style={styles.phaseDivider} />
              <View style={styles.phaseRow}>
                <Text style={styles.phaseLabel}>Tokens Vendidos:</Text>
                <Text style={styles.phaseValue}>
                  {phaseInfo.totalTokensSold.toLocaleString()} MXI
                </Text>
              </View>
              {currentPhase < 3 && (
                <View style={styles.phaseRow}>
                  <Text style={styles.phaseLabel}>Hasta Siguiente Fase:</Text>
                  <Text style={styles.phaseValue}>
                    {phaseInfo.tokensUntilNextPhase.toLocaleString()} MXI
                  </Text>
                </View>
              )}
            </React.Fragment>
          )}
        </View>

        {/* Network Selection */}
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
                onPress={() => setSelectedNetwork(network.id)}
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
                Monto mínimo: {MIN_USDT_DIRECT} USDT
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

        {/* MXI Calculator */}
        <View style={styles.calculatorCard}>
          <Text style={styles.calculatorTitle}>💰 Calculadora de MXI</Text>
          <Text style={styles.calculatorSubtitle}>
            Calcula cuánto MXI recibirás por tu inversión en USDT
          </Text>
          
          <View style={styles.calculatorInputSection}>
            <Text style={styles.label}>Ingresa monto en USDT</Text>
            <TextInput
              style={styles.calculatorInput}
              placeholder="Ej: 100"
              placeholderTextColor="#666666"
              keyboardType="numeric"
              value={directUsdtAmount}
              onChangeText={setDirectUsdtAmount}
            />
            {directMxiAmount > 0 && (
              <View style={styles.calculatorResult}>
                <Text style={styles.calculatorResultLabel}>Recibirás:</Text>
                <Text style={styles.calculatorResultValue}>
                  {directMxiAmount.toFixed(2)} MXI
                </Text>
                <Text style={styles.calculatorResultSubtext}>
                  (Tasa: 1 USDT = {MXI_RATE} MXI)
                </Text>
              </View>
            )}
          </View>

          <View style={styles.calculatorDivider} />

          <Text style={styles.calculatorExamplesTitle}>Ejemplos rápidos:</Text>
          <View style={styles.calculatorRow}>
            <Text style={styles.calculatorLabel}>{MIN_USDT_DIRECT} USDT</Text>
            <Text style={styles.calculatorArrow}>→</Text>
            <Text style={styles.calculatorValue}>{(MIN_USDT_DIRECT * MXI_RATE).toFixed(2)} MXI</Text>
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
          <View style={styles.calculatorRow}>
            <Text style={styles.calculatorLabel}>1,000 USDT</Text>
            <Text style={styles.calculatorArrow}>→</Text>
            <Text style={styles.calculatorValue}>{(1000 * MXI_RATE).toFixed(2)} MXI</Text>
          </View>
        </View>

        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Hash de Transacción (txHash)</Text>
          <TextInput
            style={styles.input}
            placeholder="0x..."
            placeholderTextColor="#666666"
            value={txHash}
            onChangeText={setTxHash}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loadingTx}
            multiline
            numberOfLines={3}
          />
          <Text style={styles.inputHint}>
            Pega el hash de tu transacción de {selectedNetworkData?.name} aquí
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.verifyButton,
            { backgroundColor: selectedNetworkData?.color || colors.primary },
            loadingTx && styles.verifyButtonDisabled
          ]}
          onPress={handleVerifyPayment}
          disabled={loadingTx || !txHash.trim()}
        >
          {loadingTx ? (
            <ActivityIndicator color="#FFFFFF" />
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
            <Text style={styles.warningTitle}>⚠️ Importante - Validación Multi-Red</Text>
            <Text style={styles.warningText}>
              • Cada red valida sus transacciones de forma independiente
            </Text>
            <Text style={styles.warningText}>
              • Los pagos en Ethereum solo se validan en la red Ethereum
            </Text>
            <Text style={styles.warningText}>
              • Los pagos en BNB Chain solo se validan en la red BNB Chain
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  balanceCard: {
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  balanceHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  balanceSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  phaseCard: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  phaseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  phaseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  phaseLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  phaseValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  phaseDivider: {
    height: 1,
    backgroundColor: colors.primary + '30',
    marginVertical: 8,
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
    borderWidth: 2,
    borderColor: colors.primary,
  },
  calculatorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  calculatorSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  calculatorInputSection: {
    backgroundColor: colors.primary + '15',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  calculatorInput: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  calculatorResult: {
    marginTop: 16,
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.primary + '20',
    borderRadius: 8,
  },
  calculatorResultLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  calculatorResultValue: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.primary,
    marginBottom: 4,
  },
  calculatorResultSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  calculatorDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  calculatorExamplesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  calculatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '30',
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
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
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
  },
  verifyButtonDisabled: {
    opacity: 0.5,
  },
  verifyButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  warningCard: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.warning,
    marginBottom: 16,
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
