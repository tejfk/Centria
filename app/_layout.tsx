import 'react-native-get-random-values';
import 'react-native-url-polyfill';
import 'web-streams-polyfill';
import 'text-encoding';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from '@craftzdog/react-native-buffer';

if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

import { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, AppState, AppStateStatus } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { 
  useFonts, 
  Inter_300Light,
  Inter_400Regular, 
  Inter_500Medium, 
  Inter_600SemiBold, 
  Inter_700Bold,
  Inter_900Black
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { AppProvider, useApp } from '../context/AppContext';
import { colors } from '../utils/theme';
import { LockScreen } from '../components/features/LockScreen';
import { SecurityShield } from '../components/features/SecurityShield';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { state } = useApp();
  const segments = useSegments();
  const router = useRouter();
  const [isLocked, setIsLocked] = useState(true);
  const [isSessionChecked, setIsSessionChecked] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_900Black,
  });

  useEffect(() => {
    if (fontsLoaded && state.isLoaded) {
      SplashScreen.hideAsync();
      
      // Check for an active session to prevent re-locking on restarts (e.g. after ImagePicker)
      const checkSession = async () => {
        const isSecurityEnabled = state.biometricsEnabled || !!state.appPin;
        if (!isSecurityEnabled) {
          setIsLocked(false);
          setIsSessionChecked(true);
          return;
        }

        const lastUnlock = await AsyncStorage.getItem('centria_last_unlock');
        if (lastUnlock) {
          const elapsed = Date.now() - parseInt(lastUnlock);
          if (elapsed < 300000) { // 5 minutes session
            setIsLocked(false);
          }
        }
        setIsSessionChecked(true);
      };

      checkSession();
    }
  }, [fontsLoaded, state.isLoaded, state.biometricsEnabled, state.appPin]);

  const handleUnlock = async () => {
    await AsyncStorage.setItem('centria_last_unlock', Date.now().toString());
    setIsLocked(false);
  };

  // Auto-Lock Logic (Phase 4)
  const lastBackgroundTime = useRef<number | null>(null);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        lastBackgroundTime.current = Date.now();
      } else if (nextAppState === 'active') {
          const elapsed = Date.now() - lastBackgroundTime.current;
          const isPicking = (global as any).isPickingFile;

          // Lock if backgrounded for more than 5 minutes (300000 ms)
          // AND we aren't currently picking a file
          if (elapsed > 300000 && !isPicking) {
            setIsLocked(true);
            AsyncStorage.removeItem('centria_last_unlock');
          } else if (!isPicking) {
            // Refresh session if returning quickly and NOT picking
            AsyncStorage.setItem('centria_last_unlock', Date.now().toString());
          }
        lastBackgroundTime.current = null;
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!state.isLoaded) return;

    // Tarsi-style: No mandatory account. 
    // We only redirect to Welcome if onboarding isn't done.
    if (!state.hasCompletedOnboarding && !segments.includes('welcome')) {
      router.replace('/(auth)/welcome');
    } else if (state.hasCompletedOnboarding && segments[0] === '(auth)' && segments[1] !== 'welcome') {
      // If they are on Login/Signup but already onboarded, send to Dashboard
      router.replace('/(tabs)');
    }
  }, [state.hasCompletedOnboarding, state.isLoaded, segments]);

  if (!fontsLoaded || !state.isLoaded || !isSessionChecked) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const isSecurityEnabled = state.biometricsEnabled || !!state.appPin;

  // Security Lock logic (Biometrics or PIN)
  if (isSecurityEnabled && isLocked && state.hasCompletedOnboarding) {
    return <LockScreen onUnlock={handleUnlock} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg.primary },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="add-expense" options={{ presentation: 'modal' }} />
        <Stack.Screen name="add-subscription" options={{ presentation: 'modal' }} />
        <Stack.Screen name="add-document" options={{ presentation: 'modal' }} />
        <Stack.Screen name="add-reminder" options={{ presentation: 'modal' }} />
        <Stack.Screen name="edit-income" options={{ presentation: 'modal' }} />
        <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
        <Stack.Screen name="set-pin" options={{ presentation: 'modal' }} />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <SecurityShield>
        <RootLayoutNav />
      </SecurityShield>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg.primary,
  },
});
