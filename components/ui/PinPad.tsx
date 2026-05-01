import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadows } from '../../utils/theme';

interface PinPadProps {
  onComplete: (pin: string) => void;
  title?: string;
  error?: string | null;
}

export function PinPad({ onComplete, title = 'Enter PIN', error }: PinPadProps) {
  const [pin, setPin] = useState('');
  const [shake] = useState(new Animated.Value(0));

  useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(shake, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
      setPin(''); // Reset pin on error
    }
  }, [error]);

  const handlePress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        onComplete(newPin);
        // We don't clear it here to allow parent to handle success/error
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  const renderDot = (index: number) => {
    const isActive = pin.length > index;
    return (
      <View 
        key={index} 
        style={[
          styles.dot, 
          isActive && styles.dotActive,
          error && styles.dotError
        ]} 
      />
    );
  };

  const renderKey = (val: string) => (
    <TouchableOpacity 
      key={val} 
      style={styles.key} 
      onPress={() => handlePress(val)}
      activeOpacity={0.6}
    >
      <Text style={styles.keyText}>{val}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      <Animated.View style={[styles.dotsRow, { transform: [{ translateX: shake }] }]}>
        {[0, 1, 2, 3].map(renderDot)}
      </Animated.View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.pad}>
        <View style={styles.row}>
          {['1', '2', '3'].map(renderKey)}
        </View>
        <View style={styles.row}>
          {['4', '5', '6'].map(renderKey)}
        </View>
        <View style={styles.row}>
          {['7', '8', '9'].map(renderKey)}
        </View>
        <View style={styles.row}>
          <View style={[styles.key, { opacity: 0 }]} />
          {renderKey('0')}
          <TouchableOpacity style={styles.key} onPress={handleBackspace} activeOpacity={0.6}>
            <Ionicons name="backspace-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.xl,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginVertical: spacing.md,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  dotError: {
    backgroundColor: colors.negative,
    borderColor: colors.negative,
  },
  errorText: {
    ...typography.caption,
    color: colors.negative,
  },
  pad: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  key: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.bg.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  keyText: {
    ...typography.h2,
    color: colors.text.primary,
  },
});

// Assuming shadows is exported from theme, let's check
