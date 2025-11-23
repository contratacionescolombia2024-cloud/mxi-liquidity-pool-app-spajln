
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface PhaseData {
  currentPhase: number;
  currentPriceUsdt: number;
  phase1TokensSold: number;
  phase2TokensSold: number;
  phase3TokensSold: number;
  phase1Allocation: number;
  phase2Allocation: number;
  phase3Allocation: number;
}

interface CryptoInfo {
  code: string;
  name: string;
  base: string;
  network?: string;
  priority: number;
}

export default function PaymentFlowScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const [step, setStep] = useState<'amount' | 'crypto' | 'waiting'>('amount');
  const [mxiAmount, setMxiAmount] = useState('');
  const [usdtAmount, setUsdtAmount] = useState('0.00');
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(true);
  const [phaseData, setPhaseData] = useState<PhaseData | null>(null);
  const [orderId, setOrderId] = useState<string>('');
  const [paymentIntent, setPaymentIntent] = useState<any>(null);
  const [selectedCrypto, setSelectedCrypto] = useState<string>('');
  const [supportedCurrencies, setSupportedCurrencies] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBase, setFilterBase] = useState<string>('all');

  useEffect(() => {
    loadPhaseData();
    
    // Check if we have params from the previous screen
    if (params.mxiAmount && params.usdtAmount) {
      setMxiAmount(params.mxiAmount as string);
      setUsdtAmount(params.usdtAmount as string);
      // Auto-proceed to create intent
      setTimeout(() => {
        handleCreateIntent();
      }, 500);
    }
  }, []);

  useEffect(() => {
    if (mxiAmount && phaseData && !params.mxiAmount) {
      const amount = parseFloat(mxiAmount);
      if (!isNaN(amount) && amount > 0) {
        const total = amount * phaseData.currentPriceUsdt;
        setUsdtAmount(total.toFixed(2));
      } else {
        setUsdtAmount('0.00');
      }
    } else if (!params.mxiAmount) {
      setUsdtAmount('0.00');
    }
  }, [mxiAmount, phaseData]);

  const loadPhaseData = async () => {
    try {
      const { data: metrics, error } = await supabase
        .from('metrics')
        .select('*')
        .single();

      if (error) throw error;

      const { data: allocation } = await supabase
        .from('presale_allocation')
        .select('*')
        .single();

      setPhaseData({
        currentPhase: metrics.current_phase,
        currentPriceUsdt: parseFloat(metrics.current_price_usdt.toString()),
        phase1TokensSold: parseFloat(metrics.phase_1_tokens_sold?.toString() || '0'),
        phase2TokensSold: parseFloat(metrics.phase_2_tokens_sold?.toString() || '0'),
        phase3TokensSold: parseFloat(metrics.phase_3_tokens_sold?.toString() || '0'),
        phase1Allocation: parseFloat(allocation?.phase_1_allocation?.toString() || '8333333'),
        phase2Allocation: parseFloat(allocation?.phase_2_allocation?.toString() || '8333333'),
        phase3Allocation: parseFloat(allocation?.phase_3_allocation?.toString() || '8333334'),
      });
    } catch (error) {
      console.error('Error loading phase data:', error);
      Alert.alert('Error', 'No se pudo cargar la información de la fase');
    } finally {
      setLoadingPhase(false);
    }
  };

  const handleCreateIntent = async () => {
    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesión para comprar MXI');
      return;
    }

    const amount = parseFloat(mxiAmount);
    const total = parseFloat(usdtAmount);

    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Debes ingresar un monto válido.');
      return;
    }

    if (total < 3) {
      Alert.alert('Monto Mínimo', 'El monto mínimo de compra es $3 USDT');
      return;
    }

    setLoading(true);

    try {
      console.log('Creating payment intent...');
      
      const newOrderId = `MXI-${Date.now()}-${user.id.substring(0, 8)}`;
      setOrderId(newOrderId);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        Alert.alert('Error', 'Sesión expirada. Por favor inicia sesión nuevamente');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${supabase.supabaseUrl}/functions/v1/create-paid-intent`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            order_id: newOrderId,
            price_amount: total,
            price_currency: 'USD',
          }),
        }
      );

      const result = await response.json();
      console.log('Intent created:', result);

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al crear intento de pago');
      }

      setPaymentIntent(result.intent);
      setSupportedCurrencies(result.intent.pay_currencies || []);
      setStep('crypto');
    } catch (error: any) {
      console.error('Error creating intent:', error);
      Alert.alert('Error', error.message || 'No se pudo crear el intento de pago');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCrypto = async (crypto: string) => {
    setSelectedCrypto(crypto);
    setLoading(true);

    try {
      console.log('Generating invoice with crypto:', crypto);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        Alert.alert('Error', 'Sesión expirada');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${supabase.supabaseUrl}/functions/v1/create-payment-intent`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            order_id: orderId,
            price_amount: parseFloat(usdtAmount),
            price_currency: 'USD',
            pay_currency: crypto,
          }),
        }
      );

      const result = await response.json();
      console.log('Invoice generated:', result);

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al generar factura');
      }

      setPaymentIntent(result.intent);
      setStep('waiting');

      // Open payment URL
      if (result.intent.nowpayment_invoice_url) {
        const { default: WebBrowser } = await import('expo-web-browser');
        await WebBrowser.openBrowserAsync(result.intent.nowpayment_invoice_url);
      }

      // Start real-time subscription
      subscribeToPaymentUpdates();
    } catch (error: any) {
      console.error('Error selecting crypto:', error);
      Alert.alert('Error', error.message || 'No se pudo generar la factura');
      setLoading(false);
    }
  };

  const subscribeToPaymentUpdates = () => {
    console.log('Subscribing to payment updates for order:', orderId);

    const channel = supabase
      .channel(`payment-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payment_intents',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          console.log('Payment update received:', payload);
          
          if (payload.new) {
            const newStatus = (payload.new as any).status;
            setPaymentIntent(payload.new);

            if (newStatus === 'confirmed' || newStatus === 'finished') {
              Alert.alert(
                '✅ Pago Confirmado',
                `Tu pago ha sido confirmado exitosamente.\n\nTu saldo de MXI ha sido actualizado.`,
                [
                  {
                    text: 'Ver Balance',
                    onPress: () => router.push('/(tabs)/(home)'),
                  },
                ]
              );
              channel.unsubscribe();
            } else if (newStatus === 'failed' || newStatus === 'expired') {
              Alert.alert(
                '❌ Pago Fallido',
                `Tu pago no pudo ser procesado.\n\nEstado: ${newStatus}`,
                [
                  {
                    text: 'Reintentar',
                    onPress: () => {
                      setStep('amount');
                      setMxiAmount('');
                      setUsdtAmount('0.00');
                      setOrderId('');
                      setPaymentIntent(null);
                      setSelectedCrypto('');
                    },
                  },
                ]
              );
              channel.unsubscribe();
            }
          }
        }
      )
      .subscribe();
  };

  const getCryptoInfo = (crypto: string): CryptoInfo => {
    const cryptoLower = crypto.toLowerCase();
    
    // Priority currencies (lower number = higher priority)
    const priorityMap: Record<string, number> = {
      'usdteth': 1,
      'usdterc20': 1,
      'usdt': 1,
      'usdttrc20': 2,
      'btc': 3,
      'eth': 4,
      'usdc': 5,
      'bnb': 6,
      'sol': 7,
      'matic': 8,
      'trx': 9,
      'xrp': 10,
      'ada': 11,
      'doge': 12,
      'ltc': 13,
    };

    const infoMap: Record<string, { name: string; base: string; network?: string }> = {
      'usdteth': { name: 'Tether USD', base: 'USDT', network: 'Ethereum (ERC20)' },
      'usdterc20': { name: 'Tether USD', base: 'USDT', network: 'Ethereum (ERC20)' },
      'usdt': { name: 'Tether USD', base: 'USDT', network: 'Ethereum (ERC20)' },
      'usdttrc20': { name: 'Tether USD', base: 'USDT', network: 'Tron (TRC20)' },
      'usdtbep20': { name: 'Tether USD', base: 'USDT', network: 'BSC (BEP20)' },
      'btc': { name: 'Bitcoin', base: 'BTC' },
      'eth': { name: 'Ethereum', base: 'ETH' },
      'ltc': { name: 'Litecoin', base: 'LTC' },
      'usdc': { name: 'USD Coin', base: 'USDC' },
      'usdcerc20': { name: 'USD Coin', base: 'USDC', network: 'Ethereum (ERC20)' },
      'bnb': { name: 'Binance Coin', base: 'BNB' },
      'bnbbsc': { name: 'Binance Coin', base: 'BNB', network: 'BSC' },
      'ada': { name: 'Cardano', base: 'ADA' },
      'xrp': { name: 'Ripple', base: 'XRP' },
      'doge': { name: 'Dogecoin', base: 'DOGE' },
      'matic': { name: 'Polygon', base: 'MATIC' },
      'maticmainnet': { name: 'Polygon', base: 'MATIC', network: 'Mainnet' },
      'sol': { name: 'Solana', base: 'SOL' },
      'trx': { name: 'Tron', base: 'TRX' },
      'dot': { name: 'Polkadot', base: 'DOT' },
      'avax': { name: 'Avalanche', base: 'AVAX' },
      'link': { name: 'Chainlink', base: 'LINK' },
      'uni': { name: 'Uniswap', base: 'UNI' },
      'atom': { name: 'Cosmos', base: 'ATOM' },
      'xlm': { name: 'Stellar', base: 'XLM' },
      'bch': { name: 'Bitcoin Cash', base: 'BCH' },
      'etc': { name: 'Ethereum Classic', base: 'ETC' },
      'algo': { name: 'Algorand', base: 'ALGO' },
      'vet': { name: 'VeChain', base: 'VET' },
      'fil': { name: 'Filecoin', base: 'FIL' },
      'icp': { name: 'Internet Computer', base: 'ICP' },
      'near': { name: 'NEAR Protocol', base: 'NEAR' },
      'apt': { name: 'Aptos', base: 'APT' },
      'arb': { name: 'Arbitrum', base: 'ARB' },
      'op': { name: 'Optimism', base: 'OP' },
      'dai': { name: 'Dai', base: 'DAI' },
      'busd': { name: 'Binance USD', base: 'BUSD' },
      'shib': { name: 'Shiba Inu', base: 'SHIB' },
      'wbtc': { name: 'Wrapped Bitcoin', base: 'WBTC' },
    };

    const info = infoMap[cryptoLower] || {
      name: crypto.toUpperCase(),
      base: crypto.toUpperCase(),
    };

    return {
      code: crypto,
      name: info.name,
      base: info.base,
      network: info.network,
      priority: priorityMap[cryptoLower] || 999,
    };
  };

  const getCryptoDisplayName = (crypto: string) => {
    const info = getCryptoInfo(crypto);
    if (info.network) {
      return `${info.name} (${info.network})`;
    }
    return info.name;
  };

  const getAvailableBases = useMemo(() => {
    const bases = new Set<string>();
    supportedCurrencies.forEach(crypto => {
      const info = getCryptoInfo(crypto);
      bases.add(info.base);
    });
    return Array.from(bases).sort();
  }, [supportedCurrencies]);

  const filteredAndSortedCurrencies = useMemo(() => {
    let filtered = supportedCurrencies.map(crypto => getCryptoInfo(crypto));

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(info => {
        return (
          info.name.toLowerCase().includes(query) ||
          info.base.toLowerCase().includes(query) ||
          info.code.toLowerCase().includes(query) ||
          (info.network && info.network.toLowerCase().includes(query))
        );
      });
    }

    // Apply base filter
    if (filterBase !== 'all') {
      filtered = filtered.filter(info => info.base === filterBase);
    }

    // Sort by priority, then by name
    filtered.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return a.name.localeCompare(b.name);
    });

    return filtered;
  }, [supportedCurrencies, searchQuery, filterBase]);

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'Pendiente',
      'waiting': 'Esperando Pago',
      'confirming': 'Confirmando',
      'confirmed': 'Confirmado',
      'finished': 'Completado',
      'failed': 'Fallido',
      'expired': 'Expirado',
    };
    return statusMap[status] || status;
  };

  if (loadingPhase) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!phaseData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <IconSymbol
            ios_icon_name="exclamationmark.triangle"
            android_material_icon_name="error"
            size={64}
            color={colors.error}
          />
          <Text style={styles.errorText}>Error al cargar datos</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadPhaseData}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="chevron_left"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Comprar MXI</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressStep}>
          <View style={[styles.progressDot, step === 'amount' && styles.progressDotActive]}>
            <Text style={styles.progressDotText}>1</Text>
          </View>
          <Text style={styles.progressLabel}>Monto</Text>
        </View>
        <View style={styles.progressLine} />
        <View style={styles.progressStep}>
          <View style={[styles.progressDot, step === 'crypto' && styles.progressDotActive]}>
            <Text style={styles.progressDotText}>2</Text>
          </View>
          <Text style={styles.progressLabel}>Cripto</Text>
        </View>
        <View style={styles.progressLine} />
        <View style={styles.progressStep}>
          <View style={[styles.progressDot, step === 'waiting' && styles.progressDotActive]}>
            <Text style={styles.progressDotText}>3</Text>
          </View>
          <Text style={styles.progressLabel}>Pago</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Step 1: Amount Selection */}
        {step === 'amount' && (
          <React.Fragment>
            <View style={[commonStyles.card, styles.phaseCard]}>
              <View style={styles.phaseHeader}>
                <View style={styles.phaseBadge}>
                  <Text style={styles.phaseBadgeText}>Fase {phaseData.currentPhase}</Text>
                </View>
                <Text style={styles.phasePrice}>${phaseData.currentPriceUsdt} USDT</Text>
              </View>
              <Text style={styles.phasePriceLabel}>Precio por MXI</Text>
            </View>

            <View style={[commonStyles.card, styles.formCard]}>
              <Text style={styles.formTitle}>💎 Cantidad de MXI</Text>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={mxiAmount}
                  onChangeText={setMxiAmount}
                  placeholder="Ingresa cantidad de MXI"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
                <Text style={styles.inputUnit}>MXI</Text>
              </View>

              <View style={styles.quickAmounts}>
                {[50, 100, 250, 500, 1000].map((amount, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.quickAmountButton}
                    onPress={() => setMxiAmount(amount.toString())}
                  >
                    <Text style={styles.quickAmountText}>{amount}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.divider} />

              <View style={styles.totalSection}>
                <Text style={styles.totalLabel}>Total a Pagar</Text>
                <View style={styles.totalAmount}>
                  <Text style={styles.totalValue}>${usdtAmount}</Text>
                  <Text style={styles.totalCurrency}>USDT</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.continueButton, loading && styles.continueButtonDisabled]}
                onPress={handleCreateIntent}
                disabled={loading || !mxiAmount || parseFloat(usdtAmount) < 3}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <React.Fragment>
                    <Text style={styles.continueButtonText}>Continuar</Text>
                    <IconSymbol
                      ios_icon_name="arrow.right"
                      android_material_icon_name="arrow_forward"
                      size={20}
                      color="#fff"
                    />
                  </React.Fragment>
                )}
              </TouchableOpacity>

              <Text style={styles.minPurchaseNote}>
                * Monto mínimo: $3 USDT
              </Text>
            </View>
          </React.Fragment>
        )}

        {/* Step 2: Crypto Selection */}
        {step === 'crypto' && (
          <React.Fragment>
            <View style={[commonStyles.card, styles.cryptoCard]}>
              <Text style={styles.cryptoTitle}>🪙 Selecciona Criptomoneda</Text>
              <Text style={styles.cryptoSubtitle}>
                Elige la criptomoneda con la que deseas pagar
              </Text>

              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <IconSymbol
                  ios_icon_name="magnifyingglass"
                  android_material_icon_name="search"
                  size={20}
                  color={colors.textSecondary}
                />
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Buscar por nombre, código o red..."
                  placeholderTextColor={colors.textSecondary}
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

              {/* Base Filter */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.filterContainer}
                contentContainerStyle={styles.filterContent}
              >
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    filterBase === 'all' && styles.filterChipActive,
                  ]}
                  onPress={() => setFilterBase('all')}
                >
                  <Text style={[
                    styles.filterChipText,
                    filterBase === 'all' && styles.filterChipTextActive,
                  ]}>
                    Todas
                  </Text>
                </TouchableOpacity>
                {getAvailableBases.map((base, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.filterChip,
                      filterBase === base && styles.filterChipActive,
                    ]}
                    onPress={() => setFilterBase(base)}
                  >
                    <Text style={[
                      styles.filterChipText,
                      filterBase === base && styles.filterChipTextActive,
                    ]}>
                      {base}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Results Count */}
              <Text style={styles.resultsCount}>
                {filteredAndSortedCurrencies.length} {filteredAndSortedCurrencies.length === 1 ? 'moneda disponible' : 'monedas disponibles'}
              </Text>

              {/* Crypto List */}
              <View style={styles.cryptoList}>
                {filteredAndSortedCurrencies.length === 0 ? (
                  <View style={styles.emptyState}>
                    <IconSymbol
                      ios_icon_name="magnifyingglass"
                      android_material_icon_name="search_off"
                      size={48}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.emptyStateText}>
                      No se encontraron criptomonedas
                    </Text>
                    <Text style={styles.emptyStateSubtext}>
                      Intenta con otro término de búsqueda
                    </Text>
                  </View>
                ) : (
                  filteredAndSortedCurrencies.map((info, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.cryptoItem,
                        selectedCrypto === info.code && styles.cryptoItemSelected,
                        info.priority <= 2 && styles.cryptoItemPopular,
                      ]}
                      onPress={() => handleSelectCrypto(info.code)}
                      disabled={loading}
                    >
                      <View style={styles.cryptoInfo}>
                        <View style={styles.cryptoHeader}>
                          <Text style={styles.cryptoName}>{info.name}</Text>
                          {info.priority <= 2 && (
                            <View style={styles.popularBadge}>
                              <Text style={styles.popularBadgeText}>⭐ Popular</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.cryptoCode}>{info.base}</Text>
                        {info.network && (
                          <Text style={styles.cryptoNetwork}>{info.network}</Text>
                        )}
                      </View>
                      {loading && selectedCrypto === info.code ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                      ) : (
                        <IconSymbol
                          ios_icon_name="chevron.right"
                          android_material_icon_name="chevron_right"
                          size={20}
                          color={colors.textSecondary}
                        />
                      )}
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </View>

            <View style={[commonStyles.card, styles.infoCard]}>
              <Text style={styles.infoText}>
                💡 Después de seleccionar la criptomoneda, se abrirá la página de pago de NOWPayments donde podrás completar tu transacción.
              </Text>
            </View>
          </React.Fragment>
        )}

        {/* Step 3: Payment Waiting */}
        {step === 'waiting' && paymentIntent && (
          <React.Fragment>
            <View style={[commonStyles.card, styles.waitingCard]}>
              <View style={styles.waitingHeader}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.waitingTitle}>Esperando Pago</Text>
                <Text style={styles.waitingSubtitle}>
                  Estado: {getStatusText(paymentIntent.status)}
                </Text>
              </View>

              <View style={styles.paymentDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Orden ID:</Text>
                  <Text style={styles.detailValue}>{paymentIntent.order_id}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Monto MXI:</Text>
                  <Text style={styles.detailValue}>{paymentIntent.mxi_amount} MXI</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Total:</Text>
                  <Text style={styles.detailValue}>${paymentIntent.price_amount} USD</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Criptomoneda:</Text>
                  <Text style={styles.detailValue}>
                    {getCryptoDisplayName(paymentIntent.pay_currency)}
                  </Text>
                </View>
              </View>

              {paymentIntent.nowpayment_invoice_url && (
                <TouchableOpacity
                  style={styles.reopenButton}
                  onPress={async () => {
                    const { default: WebBrowser } = await import('expo-web-browser');
                    await WebBrowser.openBrowserAsync(paymentIntent.nowpayment_invoice_url);
                  }}
                >
                  <IconSymbol
                    ios_icon_name="arrow.up.right.square"
                    android_material_icon_name="open_in_new"
                    size={20}
                    color="#fff"
                  />
                  <Text style={styles.reopenButtonText}>Abrir Página de Pago</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={[commonStyles.card, styles.infoCard]}>
              <Text style={styles.infoText}>
                ⏳ Tu pago está siendo procesado. Esta pantalla se actualizará automáticamente cuando se confirme el pago.
              </Text>
              <Text style={[styles.infoText, { marginTop: 12 }]}>
                💡 Puedes cerrar esta pantalla y volver más tarde. El estado se actualizará en tu historial de transacciones.
              </Text>
            </View>
          </React.Fragment>
        )}
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  progressStep: {
    alignItems: 'center',
  },
  progressDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
  },
  progressDotText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  progressLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: 8,
    marginBottom: 28,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  phaseCard: {
    marginBottom: 16,
    backgroundColor: `${colors.primary}15`,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  phaseBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  phaseBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  phasePrice: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
  },
  phasePriceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  formCard: {
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    paddingVertical: 16,
  },
  inputUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 8,
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  quickAmountButton: {
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  totalSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  totalAmount: {
    alignItems: 'center',
  },
  totalValue: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 4,
  },
  totalCurrency: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  minPurchaseNote: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  cryptoCard: {
    marginBottom: 16,
  },
  cryptoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  cryptoSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterContent: {
    gap: 8,
    paddingRight: 20,
  },
  filterChip: {
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  resultsCount: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  cryptoList: {
    gap: 12,
  },
  cryptoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  cryptoItemSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  cryptoItemPopular: {
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}05`,
  },
  cryptoInfo: {
    flex: 1,
  },
  cryptoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cryptoName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  popularBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  cryptoCode: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 2,
  },
  cryptoNetwork: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  waitingCard: {
    marginBottom: 16,
    alignItems: 'center',
  },
  waitingHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  waitingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  waitingSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  paymentDetails: {
    width: '100%',
    gap: 12,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  reopenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    width: '100%',
  },
  reopenButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  infoCard: {
    backgroundColor: `${colors.primary}10`,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
