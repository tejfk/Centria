import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '../../utils/theme';

interface SegmentedControlProps {
  options: string[];
  selected: number;
  onChange: (index: number) => void;
}

export function SegmentedControl({ options, selected, onChange }: SegmentedControlProps) {
  return (
    <View style={styles.container}>
      {options.map((option, index) => (
        <TouchableOpacity
          key={option}
          style={[styles.option, index === selected && styles.optionActive]}
          onPress={() => onChange(index)}
          activeOpacity={0.7}
        >
          <Text style={[styles.label, index === selected && styles.labelActive]}>
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.bg.elevated,
    borderRadius: radius.md,
    padding: 3,
    gap: 2,
  },
  option: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    borderRadius: radius.sm + 2,
  },
  optionActive: {
    backgroundColor: colors.accent,
  },
  label: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  labelActive: {
    color: colors.white,
    fontFamily: 'Inter_600SemiBold',
  },
});
