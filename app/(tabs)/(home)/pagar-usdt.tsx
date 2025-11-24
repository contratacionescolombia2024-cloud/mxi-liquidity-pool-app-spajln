
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

const RECIPIENT_ADDRESS = '0x68F0d7c607617DA0b1a0dC7b72885E11ddFec623';
const MIN_USDT = 20;
const MXI_RATE = 2.5;

const NETWORKS = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    label: 'ERC20',
    color: '#627EEA',
    icon: 'Ξ'
  },
  {
    id: 'bnb',
    name: 'BNB Chain',
    label: 'BEP20',
    color: '#F3BA2F',
    icon: 'B'
  },
  {
    id: 'polygon',
    name: 'Polygon',
    label: 'Matic',
    color: '#8247E5',
    icon: 'P'
  }
];

export default function PagarUSDTScreen() {
  const router = useRouter();
  const { user, session } = useAuth();
  const [selectedNetwork, setSelectedNetwork] = useState('ethereum');
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);

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

    setLoading(true);

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
                router.back();
              },
            },
          ]
        );
      } else {
        let errorMessage = '';
        
        switch (data.error) {
          case 'tx_not_found':
            errorMessage = 'Transacción no encontrada en la blockchain. Verifica el hash y la red seleccionada.';
            break;
          case 'pocas_confirmaciones':
            errorMessage = data.message || 'La transacción necesita más confirmaciones. Por favor intenta más tarde.';
            break;
          case 'monto_insuficiente':
            errorMessage = `El monto mínimo es ${MIN_USDT} USDT. ${data.message || ''}`;
            break;
          case 'ya_procesado':
            errorMessage = 'Esta transacción ya ha sido procesada anteriormente.';
            break;
          case 'no_transfer_found':
            errorMessage = 'No se encontró una transferencia USDT válida a la dirección receptora.';
            break;
          case 'tx_failed':
            errorMessage = 'La transacción falló en la blockchain.';
            break;
          case 'invalid_network':
            errorMessage = data.message || 'Red no válida seleccionada.';
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
      setLoading(false);
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
        <View style={styles.networkCard}>
          <Text style={styles.networkTitle}>Selecciona la Red</Text>
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
              Solo envía USDT en la red {selectedNetworkData?.name} ({selectedNetworkData?.label})
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
            onChangeText={setTxHash}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
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
            loading && styles.verifyButtonDisabled
          ]}
          onPress={handleVerifyPayment}
          disabled={loading || !txHash.trim()}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <React.Fragment>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check_circle"
                size={24}
                color="#FFFFFF"
              />
              <Text style={styles.verifyButtonText}>Verificar Pago</Text>
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
            <Text style={styles.warningTitle}>Importante</Text>
            <Text style={styles.warningText}>
              - Asegúrate de seleccionar la red correcta antes de verificar
            </Text>
            <Text style={styles.warningText}>
              - No envíes claves privadas ni firmes transacciones aquí
            </Text>
            <Text style={styles.warningText}>
              - Solo verificamos transacciones on-chain mediante el txHash
            </Text>
            <Text style={styles.warningText}>
              - La transacción debe tener al menos 3 confirmaciones
            </Text>
            <Text style={styles.warningText}>
              - Los MXI se acreditan automáticamente tras la verificación
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
    borderWidth: 1,
    borderColor: colors.border,
  },
  networkTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
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
