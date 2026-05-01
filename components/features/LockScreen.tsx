import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../utils/theme';

interface LockScreenProps {
  onUnlock: () => void;
}

import { useApp } from '../../context/AppContext';
import { PinPad } from '../../components/ui/PinPad';

export function LockScreen({ onUnlock }: LockScreenProps) {
  const { state } = useApp();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPinPad, setShowPinPad] = useState(!state.biometricsEnabled);

  const authenticate = async () => {
    if (showPinPad) return;
    
    try {
      setIsAuthenticating(true);
      setError(null);
      
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        setShowPinPad(true);
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
      setShowPinPad(true);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handlePinComplete = (pin: string) => {
    if (pin === state.appPin) {
      onUnlock();
    } else {
      setError('Incorrect PIN');
      // PinPad will clear itself on error prop change
    }
  };

  useEffect(() => {
    if (state.biometricsEnabled) {
      authenticate();
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="lock-closed" size={40} color={colors.accent} />
          </View>
          <Text style={styles.title}>Centria is Locked</Text>
          <Text style={styles.subtitle}>
            {showPinPad ? 'Enter your 4-digit PIN' : 'Use biometrics to access your vault'}
          </Text>
        </View>

        {showPinPad ? (
          <View style={styles.pinWrapper}>
            <PinPad onComplete={handlePinComplete} error={error} />
            {state.biometricsEnabled && (
              <TouchableOpacity onPress={() => setShowPinPad(false)} style={styles.switchBtn}>
                <Text style={styles.switchBtnText}>Use Biometrics</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.bioWrapper}>
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
            {state.appPin && (
              <TouchableOpacity onPress={() => setShowPinPad(true)} style={styles.switchBtn}>
                <Text style={styles.switchBtnText}>Use PIN</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
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
  pinWrapper: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.xl,
  },
  bioWrapper: {
    alignItems: 'center',
    gap: spacing.md,
  },
  switchBtn: {
    marginTop: spacing.lg,
    padding: spacing.sm,
  },
  switchBtnText: {
    ...typography.caption,
    color: colors.accent,
    fontFamily: 'Inter_600SemiBold',
  },
});
