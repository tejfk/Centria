import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '../../utils/theme';
import { formatCurrency, getRelativeDate } from '../../utils/formatters';
import { getCategoryIcon } from '../../utils/helpers';
import { Expense } from '../../context/AppContext';

interface ExpenseRowProps {
  expense: Expense;
  onDelete?: (id: string) => void;
}

export function ExpenseRow({ expense, onDelete }: ExpenseRowProps) {
  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.6}
      onLongPress={() => onDelete?.(expense.id)}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{getCategoryIcon(expense.category)}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.note} numberOfLines={1}>
          {expense.note || expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
        </Text>
        <Text style={styles.date}>{getRelativeDate(expense.date)}</Text>
      </View>
      <Text style={styles.amount}>-{formatCurrency(expense.amount)}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  note: {
    ...typography.body,
    color: colors.text.primary,
    fontFamily: 'Inter_600SemiBold',
  },
  date: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  amount: {
    ...typography.body,
    color: colors.negative,
    fontFamily: 'Inter_600SemiBold',
  },
});
