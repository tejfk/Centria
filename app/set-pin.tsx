import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { PinPad } from '../components/ui/PinPad';
import { colors, typography, spacing } from '../utils/theme';

export default function SetPin() {
  const { state, dispatch } = useApp();
  const router = useRouter();
  const [step, setStep] = useState<'enter' | 'confirm'>(state.appPin ? 'enter' : 'enter'); // Simplified for now
  const [tempPin, setTempPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  // If changing PIN, we should verify old one first, but for now let's keep it simple
  
  const handlePinComplete = (pin: string) => {
    if (!tempPin) {
      setTempPin(pin);
      setStep('confirm');
      setError(null);
    } else {
      if (pin === tempPin) {
        dispatch({ type: 'SET_PIN', payload: pin });
        Alert.alert('Success', 'Security PIN has been set.', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        setError('PINs do not match. Try again.');
        setTempPin('');
        setStep('enter');
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>{state.appPin ? 'Change PIN' : 'Set Security PIN'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <PinPad 
          key={step}
          title={step === 'enter' ? 'Enter 4-digit PIN' : 'Confirm your PIN'} 
          onComplete={handlePinComplete} 
          error={error}
        />
        
        <Text style={styles.hint}>
          This PIN will be used as a fallback for biometrics.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg.primary },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.md },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.bg.card, alignItems: 'center', justifyContent: 'center' },
  title: { ...typography.h2, color: colors.text.primary, flex: 1, textAlign: 'center' },
  content: { flex: 1, paddingTop: spacing.xxl, alignItems: 'center', gap: spacing.xxl },
  hint: { ...typography.body, color: colors.text.tertiary, textAlign: 'center', paddingHorizontal: spacing.xxl },
});
