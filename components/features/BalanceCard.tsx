import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { colors, typography, spacing } from '../../utils/theme';
import { formatCurrency } from '../../utils/formatters';

interface BalanceCardProps {
  income: number;
  totalExpenses: number;
  totalSubscriptions: number;
}

export function BalanceCard({ income, totalExpenses, totalSubscriptions }: BalanceCardProps) {
  const totalSpent = totalExpenses + totalSubscriptions;
  const remaining = income - totalSpent;
  const progress = income > 0 ? Math.max(remaining / income, 0) : 0;

  return (
    <Card style={styles.card} elevated>
      <Text style={styles.label}>Remaining Balance</Text>
      <Text style={[styles.amount, remaining < 0 && styles.amountNegative]}>
        {formatCurrency(remaining)}
      </Text>
      <View style={styles.progressContainer}>
        <ProgressBar progress={progress} showLabel height={8} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  label: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  amount: {
    ...typography.display,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  amountNegative: {
    color: colors.negative,
  },
  progressContainer: {
    width: '100%',
    paddingHorizontal: spacing.sm,
  },
});
