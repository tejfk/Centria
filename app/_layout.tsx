import 'web-streams-polyfill';
import 'text-encoding';
import { Buffer } from '@craftzdog/react-native-buffer';

if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

import { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { 
  useFonts, 
  Inter_400Regular, 
  Inter_500Medium, 
  Inter_600SemiBold, 
  Inter_700Bold 
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { AppProvider, useApp } from '../context/AppContext';
import { colors } from '../utils/theme';
import { LockScreen } from '../components/features/LockScreen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { state } = useApp();
  const segments = useSegments();
  const router = useRouter();
  const [isLocked, setIsLocked] = useState(true);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded && state.isLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, state.isLoaded]);

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

  if (!fontsLoaded || !state.isLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  // Biometric Lock logic
  if (state.biometricsEnabled && isLocked && state.hasCompletedOnboarding) {
    return <LockScreen onUnlock={() => setIsLocked(false)} />;
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
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <RootLayoutNav />
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
