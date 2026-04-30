import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../ui/Card';
import { colors, typography, spacing } from '../../utils/theme';

interface StatCardProps {
  label: string;
  value: string;
  subtitle?: string;
  valueColor?: string;
}

export function StatCard({ label, value, subtitle, valueColor }: StatCardProps) {
  return (
    <Card style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, valueColor ? { color: valueColor } : null]}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    paddingVertical: spacing.md,
  },
  label: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  value: {
    ...typography.h1,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.micro,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
});
