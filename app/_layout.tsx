
import "react-native-reanimated";
import React, { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { Stack, router, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme, View, Text, ActivityIndicator } from "react-native";
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
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/lib/supabase";
import ConfirmDialog from "@/components/ConfirmDialog";
import { registerWebConfirmHandler, ConfirmConfig, showAlert } from "@/utils/confirmDialog";

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {
  console.log('Splash screen already hidden or error preventing auto-hide');
});

export const unstable_settings = {
  initialRouteName: "(auth)",
};

function RootLayoutNav() {
  const { isAuthenticated, loading } = useAuth();
  const { t } = useLanguage();
  const segments = useSegments();
  const colorScheme = useColorScheme();
  const [isMounted, setIsMounted] = useState(false);
  
  // State for web confirmation dialog
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);

  // Register web confirm handler
  useEffect(() => {
    registerWebConfirmHandler((config) => {
      setConfirmConfig(config);
    });
  }, []);

  // Mark component as mounted after first render
  useEffect(() => {
    console.log('RootLayoutNav mounted');
    setIsMounted(true);
  }, []);

  // Handle navigation only after component is mounted and not loading
  useEffect(() => {
    if (!isMounted || loading) {
      console.log('Navigation blocked - mounted:', isMounted, 'loading:', loading);
      return;
    }

    console.log('Navigation check - authenticated:', isAuthenticated, 'segments:', segments);

    const inAuthGroup = segments[0] === "(auth)";
    const inEmailConfirmed = segments[0] === "email-confirmed";

    // Don't redirect if on email confirmation screen
    if (inEmailConfirmed) {
      return;
    }

    if (!isAuthenticated && !inAuthGroup) {
      console.log('Redirecting to login');
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      console.log('Redirecting to home');
      router.replace("/(tabs)/(home)/");
    }
  }, [isAuthenticated, segments, isMounted, loading]);

  // Handle deep linking for email confirmation
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      console.log('Deep link received:', event.url);
      
      if (event.url.includes('email-confirmed') || event.url.includes('access_token')) {
        console.log('Email confirmation link detected');
        router.push('/email-confirmed');
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
          router.push('/email-confirmed');
        }
      }
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
      background: "#000000",
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
      background: "#000000",
      card: "rgb(28, 28, 30)",
      text: "rgb(255, 255, 255)",
      border: "rgb(44, 44, 46)",
      notification: "rgb(244, 67, 54)",
    },
  };

  // Show loading indicator while auth is initializing
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2962FF" />
        <Text style={{ color: '#FFFFFF', marginTop: 20, fontSize: 16 }}>
          Inicializando MXI Strategic Presale...
        </Text>
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
        <Stack.Screen
          name="modal"
          options={{
            presentation: "modal",
            title: t("standardModalTitle"),
          }}
        />
        <Stack.Screen
          name="formsheet"
          options={{
            presentation: "formSheet",
            title: t("formSheetModalTitle"),
            sheetGrabberVisible: true,
            sheetAllowedDetents: [0.5, 0.8, 1.0],
            sheetCornerRadius: 20,
          }}
        />
      </Stack>
      
      {/* Global Confirmation Dialog for Web */}
      {confirmConfig && (
        <ConfirmDialog
          visible={true}
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmText={confirmConfig.confirmText}
          cancelText={confirmConfig.cancelText}
          onConfirm={() => {
            confirmConfig.onConfirm();
            setConfirmConfig(null);
          }}
          onCancel={() => {
            if (confirmConfig.onCancel) {
              confirmConfig.onCancel();
            }
            setConfirmConfig(null);
          }}
          type={confirmConfig.type}
          icon={confirmConfig.icon}
        />
      )}
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

  // DRASTIC FIX: Force app to be ready after maximum 2 seconds
  useEffect(() => {
    console.log('=== ROOT LAYOUT INITIALIZATION ===');
    console.log('Fonts loaded:', loaded);
    console.log('Font error:', error);
    
    // Emergency timeout - force app to load after 2 seconds no matter what
    const emergencyTimeout = setTimeout(() => {
      console.log('⚠️ EMERGENCY TIMEOUT - Forcing app to load');
      setAppReady(true);
      SplashScreen.hideAsync().catch((e) => {
        console.log('Error hiding splash screen:', e);
      });
    }, 2000);

    // Normal flow - hide splash when fonts load
    if (loaded || error) {
      console.log('Fonts ready or error occurred, hiding splash screen');
      clearTimeout(emergencyTimeout);
      setAppReady(true);
      SplashScreen.hideAsync().catch((e) => {
        console.log('Error hiding splash screen:', e);
      });
    }

    return () => {
      clearTimeout(emergencyTimeout);
    };
  }, [loaded, error]);

  // Don't render anything until app is ready
  if (!appReady) {
    return null;
  }

  console.log('=== RENDERING ROOT LAYOUT ===');

  return (
    <>
      <StatusBar style="light" animated />
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000000' }}>
        <LanguageProvider>
          <OfflineHandler />
          <WidgetProvider>
            <AuthProvider>
              <RootLayoutNav />
            </AuthProvider>
          </WidgetProvider>
        </LanguageProvider>
        <SystemBars style={"light"} />
      </GestureHandlerRootView>
    </>
  );
}

// Separate component to handle offline state with translations
function OfflineHandler() {
  const networkState = useNetworkState();
  const { t } = useLanguage();
  const [hasShownOfflineAlert, setHasShownOfflineAlert] = useState(false);

  React.useEffect(() => {
    if (
      !networkState.isConnected &&
      networkState.isInternetReachable === false &&
      !hasShownOfflineAlert
    ) {
      showAlert(
        t("offlineTitle"),
        t("offlineMessage"),
        undefined,
        'warning'
      );
      setHasShownOfflineAlert(true);
    } else if (networkState.isConnected && hasShownOfflineAlert) {
      setHasShownOfflineAlert(false);
    }
  }, [networkState.isConnected, networkState.isInternetReachable, t]);

  return null;
}
