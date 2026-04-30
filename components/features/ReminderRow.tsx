import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../../utils/theme';
import { formatDate, getDaysUntil } from '../../utils/formatters';
import { getUrgencyColor, getCategoryIcon } from '../../utils/helpers';
import { Reminder } from '../../context/AppContext';

interface ReminderRowProps {
  reminder: Reminder;
  onToggle?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function ReminderRow({ reminder, onToggle, onDelete }: ReminderRowProps) {
  const daysUntil = getDaysUntil(reminder.date);
  const urgencyColor = reminder.completed ? colors.text.tertiary : getUrgencyColor(daysUntil);
  const isPast = daysUntil < 0 && !reminder.completed;

  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.6}
      onPress={() => onToggle?.(reminder.id)}
      onLongPress={() => onDelete?.(reminder.id)}
    >
      <View style={[styles.checkbox, reminder.completed && styles.checkboxDone]}>
        {reminder.completed && (
          <Ionicons name="checkmark" size={14} color={colors.white} />
        )}
      </View>
      <View style={[styles.urgencyDot, { backgroundColor: urgencyColor }]} />
      <View style={styles.info}>
        <Text style={[styles.title, reminder.completed && styles.titleDone]} numberOfLines={1}>
          {reminder.title}
        </Text>
        <Text style={[styles.date, isPast && styles.datePast]}>
          {formatDate(reminder.date)}
          {isPast ? ' · Overdue' : ''}
        </Text>
      </View>
      <Text style={styles.typeIcon}>{getCategoryIcon(reminder.type)}</Text>
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
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.text.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: colors.positive,
    borderColor: colors.positive,
  },
  urgencyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.body,
    color: colors.text.primary,
    fontFamily: 'Inter_500Medium',
  },
  titleDone: {
    color: colors.text.tertiary,
    textDecorationLine: 'line-through',
  },
  date: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  datePast: {
    color: colors.negative,
  },
  typeIcon: {
    fontSize: 16,
  },
});
