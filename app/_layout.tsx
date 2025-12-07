
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from 'react-native';
import { AuthProvider } from '../contexts/AuthContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { RealtimeProvider } from '../contexts/RealtimeContext';
import { WidgetProvider } from '../contexts/WidgetContext';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Platform } from 'react-native';

// Import Material Icons font for web
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    'SpaceMono-Bold': require('../assets/fonts/SpaceMono-Bold.ttf'),
    'SpaceMono-Italic': require('../assets/fonts/SpaceMono-Italic.ttf'),
    'SpaceMono-BoldItalic': require('../assets/fonts/SpaceMono-BoldItalic.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Preload Material Icons font on web
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Force load Material Icons font
      const loadFonts = async () => {
        try {
          // This ensures the Material Icons font is loaded
          await MaterialIcons.loadFont();
          console.log('Material Icons font loaded successfully');
        } catch (error) {
          console.error('Error loading Material Icons font:', error);
        }
      };
      loadFonts();
    }
  }, []);

  if (!loaded) {
    return null;
  }

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
              </ThemeProvider>
            </WidgetProvider>
          </RealtimeProvider>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
