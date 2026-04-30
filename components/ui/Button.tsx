import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { colors, typography, spacing, radius } from '../../utils/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  style,
  textStyle,
  icon,
}: ButtonProps) {
  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    disabled && styles.disabled,
    style,
  ];

  const labelStyles = [
    styles.label,
    styles[`label_${variant}`],
    styles[`labelSize_${size}`],
    disabled && styles.labelDisabled,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.white : colors.accent} size="small" />
      ) : (
        <>
          {icon}
          <Text style={labelStyles}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  primary: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
  },
  secondary: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
  },
  ghost: {
    backgroundColor: colors.transparent,
    borderRadius: radius.md,
  },
  danger: {
    backgroundColor: 'rgba(248,113,113,0.12)',
    borderRadius: radius.md,
  },
  size_sm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  size_md: {
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
  },
  size_lg: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    ...typography.h3,
    textAlign: 'center',
  },
  label_primary: {
    color: colors.white,
  },
  label_secondary: {
    color: colors.accent,
  },
  label_ghost: {
    color: colors.text.secondary,
  },
  label_danger: {
    color: colors.negative,
  },
  labelSize_sm: {
    ...typography.caption,
  },
  labelSize_md: {
    ...typography.body,
    fontFamily: 'Inter_600SemiBold',
  },
  labelSize_lg: {
    ...typography.h3,
  },
  labelDisabled: {
    opacity: 0.5,
  },
});
