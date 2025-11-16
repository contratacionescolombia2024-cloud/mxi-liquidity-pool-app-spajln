
import "react-native-reanimated";
import React, { useEffect } from "react";
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

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "(auth)",
};

function RootLayoutNav() {
  const { isAuthenticated, loading } = useAuth();
  const segments = useSegments();
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Don't do anything while loading
    if (loading) {
      console.log('Auth still loading, waiting...');
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

    // Redirect logic
    if (!isAuthenticated && !inAuthGroup) {
      console.log('Not authenticated and not in auth group, redirecting to login');
      try {
        router.replace("/(auth)/login");
      } catch (error) {
        console.error('Navigation error to login:', error);
      }
    } else if (isAuthenticated && inAuthGroup) {
      console.log('Authenticated and in auth group, redirecting to home');
      try {
        router.replace("/(tabs)/(home)/");
      } catch (error) {
        console.error('Navigation error to home:', error);
      }
    }
  }, [isAuthenticated, segments, loading]);

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

  useEffect(() => {
    if (error) {
      console.error('Font loading error:', error);
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      console.log('Fonts loaded, hiding splash screen');
      SplashScreen.hideAsync().catch((error) => {
        console.error('Error hiding splash screen:', error);
      });
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
      <StatusBar style="auto" animated />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <WidgetProvider>
          <AuthProvider>
            <RootLayoutNav />
          </AuthProvider>
        </WidgetProvider>
        <SystemBars style={"auto"} />
      </GestureHandlerRootView>
    </>
  );
}
