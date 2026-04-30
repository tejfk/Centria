import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '../../utils/theme';
import { formatCurrency, getDaysUntil, formatDate } from '../../utils/formatters';
import { getUrgencyColor } from '../../utils/helpers';
import { Subscription } from '../../context/AppContext';

interface SubscriptionRowProps {
  subscription: Subscription;
  onDelete?: (id: string) => void;
  onPress?: () => void;
}

export function SubscriptionRow({ subscription, onDelete, onPress }: SubscriptionRowProps) {
  const daysUntil = getDaysUntil(subscription.nextBillingDate);
  const urgencyColor = getUrgencyColor(daysUntil);
  const cycleLabel = subscription.cycle.charAt(0).toUpperCase() + subscription.cycle.slice(1);

  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.6}
      onPress={onPress}
      onLongPress={() => onDelete?.(subscription.id)}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{subscription.icon}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{subscription.name}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{cycleLabel}</Text>
          <Text style={styles.metaDot}>·</Text>
          <View style={[styles.dot, { backgroundColor: urgencyColor }]} />
          <Text style={[styles.meta, { color: urgencyColor }]}>
            {daysUntil <= 0 ? 'Due today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
          </Text>
        </View>
      </View>
      <Text style={styles.price}>{formatCurrency(subscription.price)}</Text>
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
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    ...typography.body,
    color: colors.text.primary,
    fontFamily: 'Inter_600SemiBold',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  meta: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  metaDot: {
    color: colors.text.tertiary,
    fontSize: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  price: {
    ...typography.body,
    color: colors.text.primary,
    fontFamily: 'Inter_700Bold',
  },
});
