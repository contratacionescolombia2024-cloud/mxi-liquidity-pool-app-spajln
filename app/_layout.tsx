
import "react-native-reanimated";
import React, { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { Stack, router, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme, Alert } from "react-native";
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
import { LanguageProvider } from "@/contexts/LanguageContext";
import { supabase } from "@/lib/supabase";

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "(auth)",
};

function RootLayoutNav() {
  const { isAuthenticated } = useAuth();
  const segments = useSegments();
  const colorScheme = useColorScheme();
  const [isMounted, setIsMounted] = useState(false);

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
      </Stack>
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

  React.useEffect(() => {
    if (
      !networkState.isConnected &&
      networkState.isInternetReachable === false
    ) {
      Alert.alert(
        "🔌 You are offline",
        "You can keep using the app! Your changes will be saved locally and synced when you are back online."
      );
    }
  }, [networkState.isConnected, networkState.isInternetReachable]);

  if (!loaded) {
    return null;
  }

  return (
    <>
      <StatusBar style="light" animated />
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000000' }}>
        <LanguageProvider>
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
