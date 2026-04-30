import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '../../utils/theme';
import { formatDate } from '../../utils/formatters';
import { getCategoryIcon, getCategoryLabel } from '../../utils/helpers';
import { VaultDocument } from '../../context/AppContext';

interface DocumentRowProps {
  document: VaultDocument;
  onPress?: () => void;
  onDelete?: (id: string) => void;
}

export function DocumentRow({ document, onPress, onDelete }: DocumentRowProps) {
  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.6}
      onPress={onPress}
      onLongPress={() => onDelete?.(document.id)}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{getCategoryIcon(document.category)}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{document.name}</Text>
        <Text style={styles.meta}>
          {getCategoryLabel(document.category)}
          {document.expiryDate ? ` · Exp. ${formatDate(document.expiryDate)}` : ''}
        </Text>
      </View>
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
  meta: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
});
