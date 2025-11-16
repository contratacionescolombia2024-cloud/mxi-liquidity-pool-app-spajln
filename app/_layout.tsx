
import "react-native-reanimated";
import React, { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { Stack, router, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme, Alert, View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useNetworkState } from "expo-network";
import * as Linking from "expo-linking";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { WidgetProvider } from "@/contexts/WidgetContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Prevent auto-hide to control splash screen manually
SplashScreen.preventAutoHideAsync().catch((error) => {
  console.error('Error preventing splash screen auto-hide:', error);
});

export const unstable_settings = {
  initialRouteName: "(auth)",
};

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>⚠️ Error al cargar la aplicación</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.message || 'Ha ocurrido un error inesperado'}
          </Text>
          <Text style={styles.errorHint}>
            Por favor, cierra y vuelve a abrir la aplicación.
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

function RootLayoutNav() {
  const { isAuthenticated, loading } = useAuth();
  const segments = useSegments();
  const colorScheme = useColorScheme();
  const [navigationReady, setNavigationReady] = useState(false);

  useEffect(() => {
    // Mark navigation as ready after a short delay
    const timer = setTimeout(() => {
      setNavigationReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Don't do anything while loading or navigation not ready
    if (loading || !navigationReady) {
      console.log('Waiting for auth or navigation...', { loading, navigationReady });
      return;
    }

    const inAuthGroup = segments[0] === "(auth)";
    const inEmailConfirmed = segments[0] === "email-confirmed";

    console.log('Navigation check:', {
      isAuthenticated,
      loading,
      segments,
      inAuthGroup,
      inEmailConfirmed
    });

    // Don't redirect if on email confirmation screen
    if (inEmailConfirmed) {
      console.log('On email confirmation screen, skipping redirect');
      return;
    }

    // Redirect logic with error handling
    try {
      if (!isAuthenticated && !inAuthGroup) {
        console.log('Not authenticated and not in auth group, redirecting to login');
        router.replace("/(auth)/login");
      } else if (isAuthenticated && inAuthGroup) {
        console.log('Authenticated and in auth group, redirecting to home');
        router.replace("/(tabs)/(home)/");
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback: try to navigate to a safe screen
      try {
        if (!isAuthenticated) {
          router.replace("/(auth)/login");
        }
      } catch (fallbackError) {
        console.error('Fallback navigation also failed:', fallbackError);
      }
    }
  }, [isAuthenticated, segments, loading, navigationReady]);

  // Handle deep linking for email confirmation
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      console.log('Deep link received:', event.url);
      
      if (event.url.includes('email-confirmed') || event.url.includes('access_token')) {
        console.log('Email confirmation link detected');
        try {
          router.push('/email-confirmed');
        } catch (error) {
          console.error('Navigation error to email-confirmed:', error);
        }
      }
    };

    // Listen for deep links
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened with a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('Initial URL:', url);
        if (url.includes('email-confirmed') || url.includes('access_token')) {
          console.log('Email confirmation link detected on launch');
          try {
            router.push('/email-confirmed');
          } catch (error) {
            console.error('Navigation error to email-confirmed on launch:', error);
          }
        }
      }
    }).catch((error) => {
      console.error('Error getting initial URL:', error);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const CustomDefaultTheme: Theme = {
    ...DefaultTheme,
    dark: false,
    colors: {
      primary: "rgb(41, 98, 255)",
      background: "rgb(249, 249, 249)",
      card: "rgb(255, 255, 255)",
      text: "rgb(33, 33, 33)",
      border: "rgb(224, 224, 224)",
      notification: "rgb(244, 67, 54)",
    },
  };

  const CustomDarkTheme: Theme = {
    ...DarkTheme,
    colors: {
      primary: "rgb(41, 98, 255)",
      background: "rgb(18, 18, 18)",
      card: "rgb(28, 28, 30)",
      text: "rgb(255, 255, 255)",
      border: "rgb(44, 44, 46)",
      notification: "rgb(244, 67, 54)",
    },
  };

  // Show loading indicator while auth is initializing
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2962FF" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <ThemeProvider
      value={colorScheme === "dark" ? CustomDarkTheme : CustomDefaultTheme}
    >
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="email-confirmed" />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const networkState = useNetworkState();
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [appReady, setAppReady] = useState(false);
  const [fontLoadTimeout, setFontLoadTimeout] = useState(false);

  // Handle font loading errors
  useEffect(() => {
    if (error) {
      console.error('Font loading error:', error);
      // Continue anyway - use system fonts as fallback
      setFontLoadTimeout(true);
      setAppReady(true);
    }
  }, [error]);

  // Handle successful font loading
  useEffect(() => {
    if (loaded) {
      console.log('Fonts loaded successfully');
      setAppReady(true);
    }
  }, [loaded]);

  // Timeout fallback - if fonts don't load within 3 seconds, continue anyway
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!loaded && !error) {
        console.log('Font loading timeout - continuing with system fonts');
        setFontLoadTimeout(true);
        setAppReady(true);
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [loaded, error]);

  // Hide splash screen when app is ready
  useEffect(() => {
    if (appReady) {
      console.log('App ready, hiding splash screen');
      const timer = setTimeout(() => {
        SplashScreen.hideAsync().catch((error) => {
          console.error('Error hiding splash screen:', error);
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [appReady]);

  // Network status alert
  useEffect(() => {
    if (
      !networkState.isConnected &&
      networkState.isInternetReachable === false
    ) {
      Alert.alert(
        "🔌 Sin conexión",
        "Puedes seguir usando la aplicación. Los cambios se sincronizarán cuando vuelvas a estar en línea."
      );
    }
  }, [networkState.isConnected, networkState.isInternetReachable]);

  // Show loading screen while fonts are loading
  if (!appReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2962FF" />
        <Text style={styles.loadingText}>Iniciando aplicación...</Text>
      </View>
    );
  }

  // Show warning if fonts failed to load
  if (fontLoadTimeout && error) {
    console.warn('Using system fonts as fallback due to font loading error');
  }

  return (
    <ErrorBoundary>
      <StatusBar style="auto" animated />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <WidgetProvider>
          <AuthProvider>
            <RootLayoutNav />
          </AuthProvider>
        </WidgetProvider>
        <SystemBars style={"auto"} />
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorHint: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
