// Reusable card surface component with Tactile Entry Physics

import React, { ReactNode, useEffect } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { colors, radius, spacing, shadows } from '../../utils/theme';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle | any;
  elevated?: boolean;
  index?: number; // Used for staggered entry animation
}

export function Card({ children, style, elevated, index = 0 }: CardProps) {
  const translateY = useSharedValue(50);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      index * 100, 
      withSpring(0, { damping: 15, stiffness: 100 })
    );
    opacity.value = withDelay(
      index * 100, 
      withSpring(1, { damping: 20 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <Animated.View style={[styles.card, elevated && styles.elevated, style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card, // Added base soft shadow
  },
  elevated: {
    ...shadows.elevated,
    borderWidth: 0,
  },
});
