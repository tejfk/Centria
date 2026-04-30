import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, radius, shadows } from '../../utils/theme';

const actions = [
  { key: 'expense', label: 'Expense', icon: '💸', route: '/add-expense' },
  { key: 'subscription', label: 'Subscription', icon: '📋', route: '/add-subscription' },
  { key: 'document', label: 'Document', icon: '📄', route: '/add-document' },
  { key: 'reminder', label: 'Reminder', icon: '🔔', route: '/add-reminder' },
] as const;

export function FAB() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleAction = (route: string) => {
    setOpen(false);
    setTimeout(() => {
      router.push(route as any);
    }, 150);
  };

  return (
    <>
      {/* Overlay */}
      <Modal visible={open} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={styles.menuContainer}>
            {actions.map((action, index) => (
              <TouchableOpacity
                key={action.key}
                style={[styles.menuItem, { opacity: 1 }]}
                onPress={() => handleAction(action.route)}
                activeOpacity={0.7}
              >
                <Text style={styles.menuIcon}>{action.icon}</Text>
                <Text style={styles.menuLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.fab, styles.fabClose]}
            onPress={() => setOpen(false)}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={28} color={colors.white} />
          </TouchableOpacity>
        </Pressable>
      </Modal>

      {/* FAB Button */}
      {!open && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setOpen(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={30} color={colors.white} />
        </TouchableOpacity>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.elevated,
    zIndex: 100,
  },
  fabClose: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  menuContainer: {
    marginBottom: 160,
    gap: spacing.sm,
    alignItems: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.card,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    gap: spacing.md,
    minWidth: 200,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  menuIcon: {
    fontSize: 20,
  },
  menuLabel: {
    ...typography.body,
    color: colors.text.primary,
    fontFamily: 'Inter_600SemiBold',
  },
});
