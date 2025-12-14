
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { useColorScheme, Platform, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthProvider } from '../contexts/AuthContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { RealtimeProvider } from '../contexts/RealtimeContext';
import { WidgetProvider } from '../contexts/WidgetContext';
import { ErrorBoundary } from '../components/ErrorBoundary';
import ConfirmDialog from '../components/ConfirmDialog';
import { registerWebConfirmHandler, ConfirmConfig } from '../utils/confirmDialog';
import { colors } from '../styles/commonStyles';

// Import Material Icons font for web
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch((err) => {
  console.error('❌ Error preventing splash screen auto-hide:', err);
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    'SpaceMono-Bold': require('../assets/fonts/SpaceMono-Bold.ttf'),
    'SpaceMono-Italic': require('../assets/fonts/SpaceMono-Italic.ttf'),
    'SpaceMono-BoldItalic': require('../assets/fonts/SpaceMono-BoldItalic.ttf'),
  });

  // State for web confirm dialog
  const [confirmDialogConfig, setConfirmDialogConfig] = useState<ConfirmConfig | null>(null);
  const [initError, setInitError] = useState<Error | null>(null);
  const [initComplete, setInitComplete] = useState(false);

  useEffect(() => {
    console.log('=== ROOT LAYOUT INITIALIZATION ===');
    console.log('Platform:', Platform.OS);
    console.log('Fonts loaded:', loaded);
    console.log('Font error:', error);
    
    if (error) {
      console.error('❌ Font loading error:', error);
      setInitError(error);
      setInitComplete(true);
      // Still hide splash screen even on error
      SplashScreen.hideAsync().catch((err) => {
        console.error('❌ Error hiding splash screen after font error:', err);
      });
    }
    
    if (loaded) {
      console.log('✅ Fonts loaded successfully');
      SplashScreen.hideAsync().then(() => {
        console.log('✅ Splash screen hidden');
        setInitComplete(true);
      }).catch((err) => {
        console.error('❌ Error hiding splash screen:', err);
        // Still mark as complete even if hiding fails
        setInitComplete(true);
      });
    }
  }, [loaded, error]);

  // Preload Material Icons font on web
  useEffect(() => {
    if (Platform.OS === 'web') {
      console.log('🌐 Loading Material Icons font for web...');
      // Force load Material Icons font
      const loadFonts = async () => {
        try {
          // This ensures the Material Icons font is loaded
          await MaterialIcons.loadFont();
          console.log('✅ Material Icons font loaded successfully');
        } catch (error) {
          console.error('❌ Error loading Material Icons font:', error);
        }
      };
      loadFonts();
    }
  }, []);

  // Register web confirm handler
  useEffect(() => {
    if (Platform.OS === 'web') {
      console.log('🌐 Registering web confirm handler...');
      registerWebConfirmHandler((config: ConfirmConfig) => {
        console.log('Web confirm dialog requested:', config.title, config);
        setConfirmDialogConfig(config);
      });
      console.log('✅ Web confirm handler registered successfully');
    }
  }, []);

  // Show error screen if initialization failed
  if (initError) {
    console.error('=== INITIALIZATION ERROR ===');
    console.error('Error:', initError);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Error de Inicialización</Text>
        <Text style={styles.errorMessage}>
          La aplicación no pudo inicializarse correctamente. Por favor recarga la página.
        </Text>
        <Text style={styles.errorDetails}>{initError.message}</Text>
      </View>
    );
  }

  // Show loading screen while fonts are loading
  if (!loaded || !initComplete) {
    console.log('⏳ Waiting for initialization... loaded:', loaded, 'initComplete:', initComplete);
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  console.log('✅ Root layout initialized successfully');

  const handleConfirmDialogConfirm = () => {
    if (confirmDialogConfig?.onConfirm) {
      confirmDialogConfig.onConfirm();
    }
    setConfirmDialogConfig(null);
  };

  const handleConfirmDialogCancel = () => {
    if (confirmDialogConfig?.onCancel) {
      confirmDialogConfig.onCancel();
    }
    setConfirmDialogConfig(null);
  };

  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <RealtimeProvider>
            <WidgetProvider>
              <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <Stack>
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="email-confirmed" options={{ headerShown: false }} />
                  <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: false }} />
                  <Stack.Screen name="transparent-modal" options={{ presentation: 'transparentModal', headerShown: false }} />
                  <Stack.Screen name="formsheet" options={{ presentation: 'formSheet', headerShown: false }} />
                  <Stack.Screen name="game-lobby" options={{ headerShown: false }} />
                  <Stack.Screen name="games/bomb-runner" options={{ headerShown: false }} />
                  <Stack.Screen name="games/dodge-arena" options={{ headerShown: false }} />
                  <Stack.Screen name="games/mini-cars" options={{ headerShown: false }} />
                  <Stack.Screen name="games/shooter-retro" options={{ headerShown: false }} />
                  <Stack.Screen name="games/tank-arena" options={{ headerShown: false }} />
                </Stack>
                <StatusBar style="auto" />
                
                {/* Web Confirm Dialog */}
                {Platform.OS === 'web' && confirmDialogConfig && (
                  <ConfirmDialog
                    visible={true}
                    title={confirmDialogConfig.title}
                    message={confirmDialogConfig.message}
                    confirmText={confirmDialogConfig.confirmText}
                    cancelText={confirmDialogConfig.cancelText}
                    onConfirm={handleConfirmDialogConfirm}
                    onCancel={handleConfirmDialogCancel}
                    type={confirmDialogConfig.type}
                    icon={confirmDialogConfig.icon}
                  />
                )}
              </ThemeProvider>
            </WidgetProvider>
          </RealtimeProvider>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
  },
  errorDetails: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontFamily: 'monospace',
    marginTop: 8,
  },
});
