import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '../../utils/theme';
import { formatCurrency, formatDate, getDaysUntil } from '../../utils/formatters';
import { getUrgencyColor } from '../../utils/helpers';
import { useApp } from '../../context/AppContext';

interface UpcomingRowProps {
  icon: string;
  title: string;
  date: string;
  amount?: number;
}

export function UpcomingRow({ icon, title, date, amount }: UpcomingRowProps) {
  const { state } = useApp();
  const daysUntil = getDaysUntil(date);
  const urgencyColor = getUrgencyColor(daysUntil);

  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: urgencyColor }]} />
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      <Text style={styles.date}>{formatDate(date)}</Text>
      {amount != null && (
        <Text style={styles.amount}>{formatCurrency(amount, state.profile.currency)}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  icon: {
    fontSize: 16,
  },
  title: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
  },
  date: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  amount: {
    ...typography.body,
    color: colors.text.secondary,
    fontFamily: 'Inter_600SemiBold',
    minWidth: 70,
    textAlign: 'right',
  },
});
