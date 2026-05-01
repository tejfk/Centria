import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, Alert, Platform } from 'react-native';
import { useApp } from '../../context/AppContext';
import { SubscriptionRow } from '../../components/features/SubscriptionRow';
import { Card } from '../../components/ui/Card';
import { colors, typography, spacing, radius } from '../../utils/theme';
import { formatCurrency } from '../../utils/formatters';
import { getMonthlyEquivalent } from '../../utils/helpers';
import { StatusBar } from 'expo-status-bar';

export default function Subscriptions() {
  const { state, dispatch } = useApp();

  const activeSubscriptions = useMemo(() => {
    return state.subscriptions
      .filter(s => s.active)
      .sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime());
  }, [state.subscriptions]);

  const totalMonthly = useMemo(() => {
    return activeSubscriptions.reduce((sum, s) => sum + getMonthlyEquivalent(s.price, s.cycle), 0);
  }, [activeSubscriptions]);

  const subsPercentage = state.profile.monthlyIncome > 0
    ? Math.round((totalMonthly / state.profile.monthlyIncome) * 100)
    : 0;

  const isHighLoad = subsPercentage > 30;

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Subscription',
      'Are you sure you want to remove this subscription?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => dispatch({ type: 'DELETE_SUBSCRIPTION', payload: id }) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.headerBackground}>
        <SafeAreaView>
          <View style={styles.headerTop}>
            <Text style={styles.title}>Subscriptions</Text>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.contentWrapper}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Summary */}
          <Card style={styles.summaryCard} elevated>
            <Text style={styles.summaryLabel}>Total Monthly Cost</Text>
            <Text style={styles.summaryAmount}>{formatCurrency(totalMonthly, state.profile.currency)}</Text>
            <Text style={styles.summaryMeta}>
              {activeSubscriptions.length} active subscription{activeSubscriptions.length !== 1 ? 's' : ''}
            </Text>
            {isHighLoad && (
              <View style={styles.warningRow}>
                <Text style={styles.warningText}>
                  ⚠️ {subsPercentage}% of income — consider reviewing
                </Text>
              </View>
            )}
          </Card>

          {/* List */}
          {activeSubscriptions.length > 0 ? (
            <Card style={styles.listCard}>
              {activeSubscriptions.map(sub => (
                <SubscriptionRow
                  key={sub.id}
                  subscription={sub}
                  onDelete={handleDelete}
                />
              ))}
            </Card>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No subscriptions yet</Text>
              <Text style={styles.emptySubtitle}>Tap + to add your first subscription</Text>
            </View>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  headerBackground: {
    backgroundColor: colors.bg.header,
    paddingBottom: 60,
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  headerTop: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.white,
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    marginTop: -32,
    overflow: 'hidden',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  summaryCard: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  summaryAmount: {
    ...typography.display,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  summaryMeta: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  warningRow: {
    marginTop: spacing.md,
    backgroundColor: 'rgba(245,158,11,0.1)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
  },
  warningText: {
    ...typography.caption,
    color: colors.warning,
    fontFamily: 'Inter_600SemiBold',
  },
  listCard: {
    padding: 0,
    overflow: 'hidden',
    backgroundColor: colors.white,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.text.secondary,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.text.tertiary,
  },
});
