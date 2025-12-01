
import "react-native-reanimated";
import React, { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { Stack, router, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme, Platform } from "react-native";
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
import { APP_VERSION, BUILD_ID, BUILD_DATE, BUILD_TIMESTAMP, checkForUpdates, forceReload, startUpdateChecker } from "@/constants/AppVersion";
import VersionDisplay from "@/components/VersionDisplay";

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "(auth)",
};

function RootLayoutNav() {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const segments = useSegments();
  const colorScheme = useColorScheme();
  const [isMounted, setIsMounted] = useState(false);
  const [updatePromptShown, setUpdatePromptShown] = useState(false);
  
  // State for web confirmation dialog
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);

  // Register web confirm handler
  useEffect(() => {
    registerWebConfirmHandler((config) => {
      setConfirmConfig(config);
    });
  }, []);

  // Check for updates on web platform - initial check
  useEffect(() => {
    if (Platform.OS === 'web' && !updatePromptShown) {
      console.log('🔍 Verificando actualizaciones al iniciar...');
      const needsUpdate = checkForUpdates();
      
      if (needsUpdate) {
        console.log('✅ Nueva versión detectada, mostrando alerta...');
        setUpdatePromptShown(true);
        
        setTimeout(() => {
          showAlert(
            '🔄 Nueva Versión Disponible',
            'Se ha detectado una nueva versión de la aplicación. Se recomienda actualizar para obtener las últimas mejoras y correcciones.',
            [
              {
                text: 'Actualizar Ahora',
                onPress: () => {
                  console.log('Usuario eligió actualizar');
                  forceReload();
                }
              },
              {
                text: 'Más Tarde',
                onPress: () => {
                  console.log('Usuario pospuso la actualización');
                }
              }
            ],
            'info'
          );
        }, 2000);
      } else {
        console.log('✅ Aplicación actualizada');
      }
    }
  }, [updatePromptShown]);

  // Start periodic update checker
  useEffect(() => {
    if (Platform.OS === 'web') {
      const cleanup = startUpdateChecker(() => {
        if (!updatePromptShown) {
          console.log('🔄 Actualización detectada por el verificador periódico');
          setUpdatePromptShown(true);
          
          showAlert(
            '🔄 Nueva Versión Disponible',
            'Se ha publicado una nueva versión de la aplicación. Se recomienda actualizar para obtener las últimas mejoras.',
            [
              {
                text: 'Actualizar Ahora',
                onPress: () => {
                  forceReload();
                }
              },
              {
                text: 'Más Tarde',
                onPress: () => {
                  // Reset flag after 10 minutes to allow showing again
                  setTimeout(() => {
                    setUpdatePromptShown(false);
                  }, 10 * 60 * 1000);
                }
              }
            ],
            'info'
          );
        }
      });
      
      return cleanup;
    }
  }, [updatePromptShown]);

  // Mark component as mounted after first render
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle navigation only after component is mounted
  useEffect(() => {
    if (!isMounted) {
      return;
    }

    const inAuthGroup = segments[0] === "(auth)";
    const inEmailConfirmed = segments[0] === "email-confirmed";

    // Don't redirect if on email confirmation screen
    if (inEmailConfirmed) {
      return;
    }

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)/(home)/");
    }
  }, [isAuthenticated, segments, isMounted]);

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
      
      {/* Version Display - Always visible on web */}
      {Platform.OS === 'web' && <VersionDisplay position="bottom" />}
      
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
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

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
