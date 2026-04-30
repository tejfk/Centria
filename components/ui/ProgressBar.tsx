import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../../utils/theme';

interface ProgressBarProps {
  progress: number; // 0 to 1
  color?: string;
  height?: number;
  showLabel?: boolean;
}

export function ProgressBar({ progress, color = colors.accent, height = 6, showLabel }: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const percentage = Math.round(clampedProgress * 100);

  // Color shifts based on remaining budget
  let barColor = color;
  if (progress <= 0.2) barColor = colors.negative;
  else if (progress <= 0.4) barColor = colors.warning;

  return (
    <View style={styles.container}>
      <View style={[styles.track, { height }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${percentage}%`,
              backgroundColor: barColor,
              height,
            },
          ]}
        />
      </View>
      {showLabel && (
        <Text style={[styles.label, { color: barColor }]}>{percentage}% left</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  track: {
    flex: 1,
    backgroundColor: colors.bg.elevated,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: radius.sm,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    minWidth: 55,
    textAlign: 'right',
  },
});
