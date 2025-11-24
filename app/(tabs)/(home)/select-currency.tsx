
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

interface Currency {
  code: string;
  name: string;
  network?: string;
  logo?: string;
  popular?: boolean;
}

const POPULAR_CURRENCIES: Currency[] = [
  { code: 'btc', name: 'Bitcoin', popular: true },
  { code: 'eth', name: 'Ethereum', popular: true },
  { code: 'usdteth', name: 'USDT (ERC20)', network: 'Ethereum', popular: true },
  { code: 'usdttrc20', name: 'USDT (TRC20)', network: 'Tron', popular: true },
  { code: 'ltc', name: 'Litecoin', popular: true },
  { code: 'bnb', name: 'BNB', popular: true },
  { code: 'usdc', name: 'USD Coin', popular: true },
  { code: 'doge', name: 'Dogecoin', popular: true },
];

const CURRENCY_NAMES: Record<string, string> = {
  btc: 'Bitcoin',
  eth: 'Ethereum',
  usdteth: 'USDT (ERC20)',
  usdttrc20: 'USDT (TRC20)',
  ltc: 'Litecoin',
  bnb: 'BNB',
  usdc: 'USD Coin',
  doge: 'Dogecoin',
  xrp: 'Ripple',
  ada: 'Cardano',
  dot: 'Polkadot',
  matic: 'Polygon',
  sol: 'Solana',
  trx: 'Tron',
  avax: 'Avalanche',
  link: 'Chainlink',
  xlm: 'Stellar',
  bch: 'Bitcoin Cash',
  etc: 'Ethereum Classic',
  xmr: 'Monero',
};

export default function SelectCurrencyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingCurrencies, setLoadingCurrencies] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableCurrencies, setAvailableCurrencies] = useState<Currency[]>([]);
  const [filteredCurrencies, setFilteredCurrencies] = useState<Currency[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');
  const [intentId, setIntentId] = useState<string>('');

  const mxiAmount = params.mxiAmount as string;
  const usdtAmount = params.usdtAmount as string;

  useEffect(() => {
    initializePayment();
  }, []);

  useEffect(() => {
    filterCurrencies();
  }, [searchQuery, availableCurrencies]);

  const initializePayment = async () => {
    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesión para continuar');
      router.back();
      return;
    }

    try {
      setLoadingCurrencies(true);

      // Generate unique order ID
      const newOrderId = `MXI-${Date.now()}-${user.id.substring(0, 8)}`;
      setOrderId(newOrderId);

      console.log('Creating payment intent for order:', newOrderId);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        Alert.alert('Error', 'Sesión expirada. Por favor inicia sesión nuevamente');
        router.back();
        return;
      }

      // Step 1: Create payment intent and get available currencies
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
            price_amount: parseFloat(usdtAmount),
            price_currency: 'USD',
          }),
        }
      );

      const result = await response.json();
      console.log('Payment intent created:', result);

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al crear intento de pago');
      }

      setIntentId(result.intent.id);

      // Process available currencies
      const currencies = result.intent.pay_currencies || [];
      const processedCurrencies: Currency[] = currencies.map((code: string) => {
        const upperCode = code.toUpperCase();
        const lowerCode = code.toLowerCase();
        
        return {
          code: lowerCode,
          name: CURRENCY_NAMES[lowerCode] || upperCode,
          popular: POPULAR_CURRENCIES.some(c => c.code === lowerCode),
        };
      });

      // Sort: popular first, then alphabetically
      processedCurrencies.sort((a, b) => {
        if (a.popular && !b.popular) return -1;
        if (!a.popular && b.popular) return 1;
        return a.name.localeCompare(b.name);
      });

      setAvailableCurrencies(processedCurrencies);
      console.log('Available currencies:', processedCurrencies.length);
    } catch (error: any) {
      console.error('Error initializing payment:', error);
      Alert.alert(
        'Error',
        error.message || 'No se pudo inicializar el pago. Por favor intenta nuevamente.',
        [
          {
            text: 'Volver',
            onPress: () => router.back(),
          },
        ]
      );
    } finally {
      setLoadingCurrencies(false);
    }
  };

  const filterCurrencies = () => {
    if (!searchQuery.trim()) {
      setFilteredCurrencies(availableCurrencies);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = availableCurrencies.filter(
      (currency) =>
        currency.code.toLowerCase().includes(query) ||
        currency.name.toLowerCase().includes(query)
    );

    setFilteredCurrencies(filtered);
  };

  const handleSelectCurrency = async (currencyCode: string) => {
    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesión para continuar');
      return;
    }

    setSelectedCurrency(currencyCode);
    setLoading(true);

    try {
      console.log('Creating payment with currency:', currencyCode);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        Alert.alert('Error', 'Sesión expirada. Por favor inicia sesión nuevamente');
        setLoading(false);
        return;
      }

      // Step 2: Generate invoice with selected currency
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
            pay_currency: currencyCode,
          }),
        }
      );

      const result = await response.json();
      console.log('Payment invoice created:', result);

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al generar factura de pago');
      }

      const invoiceUrl = result.intent.nowpayment_invoice_url;
      console.log('Invoice URL:', invoiceUrl);

      if (!invoiceUrl) {
        throw new Error('No se recibió la URL de pago');
      }

      // Open payment URL
      console.log('Opening payment URL...');
      const opened = await openPaymentUrl(invoiceUrl);

      if (!opened) {
        Alert.alert(
          'Error al Abrir Pago',
          'No se pudo abrir la página de pago automáticamente.',
          [
            {
              text: 'Copiar URL',
              onPress: () => {
                Alert.alert('URL de Pago', invoiceUrl);
              },
            },
            {
              text: 'Reintentar',
              onPress: () => openPaymentUrl(invoiceUrl),
            },
            {
              text: 'Continuar',
              onPress: () => {
                router.replace({
                  pathname: '/(tabs)/(home)/payment-status',
                  params: {
                    orderId: orderId,
                    mxiAmount: mxiAmount,
                    usdtAmount: usdtAmount,
                    currency: currencyCode,
                    paymentUrl: invoiceUrl,
                  },
                });
              },
            },
          ]
        );
      } else {
        // Navigate to payment status screen
        router.replace({
          pathname: '/(tabs)/(home)/payment-status',
          params: {
            orderId: orderId,
            mxiAmount: mxiAmount,
            usdtAmount: usdtAmount,
            currency: currencyCode,
            paymentUrl: invoiceUrl,
          },
        });
      }
    } catch (error: any) {
      console.error('Error creating payment:', error);
      Alert.alert('Error', error.message || 'No se pudo crear el pago. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
      setSelectedCurrency('');
    }
  };

  const openPaymentUrl = async (url: string): Promise<boolean> => {
    console.log('Attempting to open payment URL:', url);

    if (!url) {
      console.error('No URL provided');
      return false;
    }

    try {
      console.log('Opening with WebBrowser...');
      const result = await WebBrowser.openBrowserAsync(url, {
        dismissButtonStyle: 'close',
        readerMode: false,
        enableBarCollapsing: false,
      });

      console.log('WebBrowser result:', result);
      return true;
    } catch (webBrowserError) {
      console.error('WebBrowser failed:', webBrowserError);

      try {
        console.log('Falling back to Linking...');
        const canOpen = await Linking.canOpenURL(url);
        console.log('Can open URL with Linking:', canOpen);

        if (canOpen) {
          await Linking.openURL(url);
          return true;
        } else {
          console.error('Cannot open URL with Linking');
          return false;
        }
      } catch (linkingError) {
        console.error('Linking failed:', linkingError);
        return false;
      }
    }
  };

  const renderCurrencyItem = (currency: Currency, index: number) => {
    const isSelected = selectedCurrency === currency.code;
    const isLoading = loading && isSelected;

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.currencyItem,
          currency.popular && styles.currencyItemPopular,
          isSelected && styles.currencyItemSelected,
        ]}
        onPress={() => handleSelectCurrency(currency.code)}
        disabled={loading}
      >
        <View style={styles.currencyInfo}>
          <View style={styles.currencyIcon}>
            <Text style={styles.currencyIconText}>
              {currency.code.substring(0, 2).toUpperCase()}
            </Text>
          </View>
          <View style={styles.currencyDetails}>
            <Text style={styles.currencyName}>{currency.name}</Text>
            <Text style={styles.currencyCode}>{currency.code.toUpperCase()}</Text>
            {currency.network && (
              <Text style={styles.currencyNetwork}>{currency.network}</Text>
            )}
          </View>
        </View>

        {currency.popular && !isSelected && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularBadgeText}>Popular</Text>
          </View>
        )}

        {isLoading ? (
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
    );
  };

  if (loadingCurrencies) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando criptomonedas disponibles...</Text>
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
          disabled={loading}
        >
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="chevron_left"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seleccionar Criptomoneda</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* Purchase Summary */}
        <View style={[commonStyles.card, styles.summaryCard]}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Cantidad MXI:</Text>
            <Text style={styles.summaryValue}>{mxiAmount} MXI</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total a Pagar:</Text>
            <Text style={styles.summaryValueHighlight}>${usdtAmount} USD</Text>
          </View>
        </View>

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
            placeholder="Buscar criptomoneda..."
            placeholderTextColor={colors.textSecondary}
            editable={!loading}
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

        {/* Currency List */}
        <ScrollView
          style={styles.currencyList}
          contentContainerStyle={styles.currencyListContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredCurrencies.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol
                ios_icon_name="magnifyingglass"
                android_material_icon_name="search"
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
            <React.Fragment>
              {/* Popular Currencies Section */}
              {!searchQuery && (
                <React.Fragment>
                  <Text style={styles.sectionTitle}>🔥 Más Populares</Text>
                  {filteredCurrencies
                    .filter((c) => c.popular)
                    .map((currency, index) => renderCurrencyItem(currency, index))}

                  <Text style={styles.sectionTitle}>Todas las Criptomonedas</Text>
                </React.Fragment>
              )}

              {/* All Currencies */}
              {(searchQuery
                ? filteredCurrencies
                : filteredCurrencies.filter((c) => !c.popular)
              ).map((currency, index) => renderCurrencyItem(currency, index))}
            </React.Fragment>
          )}
        </ScrollView>

        {/* Info Card */}
        <View style={[commonStyles.card, styles.infoCard]}>
          <View style={styles.infoHeader}>
            <IconSymbol
              ios_icon_name="info.circle.fill"
              android_material_icon_name="info"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.infoText}>
              Selecciona la criptomoneda con la que deseas pagar. El pago se procesará de forma segura con NOWPayments.
            </Text>
          </View>
        </View>
      </View>
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
    fontSize: 20,
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
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  summaryCard: {
    marginBottom: 16,
    backgroundColor: `${colors.primary}10`,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  summaryValueHighlight: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accent,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  currencyList: {
    flex: 1,
  },
  currencyListContent: {
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 12,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  currencyItemPopular: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  currencyItemSelected: {
    backgroundColor: `${colors.primary}15`,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  currencyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  currencyIconText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  currencyDetails: {
    flex: 1,
  },
  currencyName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  currencyCode: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  currencyNetwork: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  popularBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  popularBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: `${colors.primary}10`,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
    marginTop: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
