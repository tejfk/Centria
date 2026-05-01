import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../utils/theme';

interface LockScreenProps {
  onUnlock: () => void;
}

export function LockScreen({ onUnlock }: LockScreenProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authenticate = async () => {
    try {
      setIsAuthenticating(true);
      setError(null);
      
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        // If no biometrics, just unlock (or we could fallback to PIN if implemented)
        onUnlock();
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Centria',
        fallbackLabel: 'Enter PIN',
        disableDeviceFallback: false,
      });

      if (result.success) {
        onUnlock();
      } else {
        setError('Authentication failed');
      }
    } catch (e) {
      setError('An error occurred');
    } finally {
      setIsAuthenticating(false);
    }
  };

  useEffect(() => {
    authenticate();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="lock-closed" size={40} color={colors.accent} />
          </View>
          <Text style={styles.title}>Centria is Locked</Text>
          <Text style={styles.subtitle}>Use biometrics to access your vault</Text>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity 
          style={styles.unlockBtn} 
          onPress={authenticate}
          disabled={isAuthenticating}
        >
          <Ionicons name="finger-print" size={24} color={colors.white} />
          <Text style={styles.unlockBtnText}>
            {isAuthenticating ? 'Authenticating...' : 'Try Again'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.xxl,
  },
  logoContainer: {
    alignItems: 'center',
    gap: spacing.md,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  unlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    marginTop: spacing.xl,
  },
  unlockBtnText: {
    ...typography.body,
    color: colors.white,
    fontFamily: 'Inter_600SemiBold',
  },
  errorText: {
    ...typography.caption,
    color: colors.negative,
    marginTop: spacing.md,
  },
});
