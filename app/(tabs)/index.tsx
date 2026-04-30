import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../../components/features/StatCard';
import { UpcomingRow } from '../../components/features/UpcomingRow';
import { ExpenseRow } from '../../components/features/ExpenseRow';
import { Card } from '../../components/ui/Card';
import { colors, typography, spacing, radius } from '../../utils/theme';
import { formatCurrency, getGreeting, getCurrentMonth, isCurrentMonth } from '../../utils/formatters';
import { getMonthlyEquivalent } from '../../utils/helpers';
import { StatusBar } from 'expo-status-bar';

export default function Dashboard() {
  const { state, dispatch } = useApp();
  const router = useRouter();

  const monthlyExpenses = useMemo(() => {
    return state.expenses
      .filter(e => isCurrentMonth(e.date))
      .reduce((sum, e) => sum + e.amount, 0);
  }, [state.expenses]);

  const monthlySubCost = useMemo(() => {
    return state.subscriptions
      .filter(s => s.active)
      .reduce((sum, s) => sum + getMonthlyEquivalent(s.price, s.cycle), 0);
  }, [state.subscriptions]);

  const recentExpenses = useMemo(() => {
    return [...state.expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 4);
  }, [state.expenses]);

  const upcoming = useMemo(() => {
    const subItems = state.subscriptions
      .filter(s => s.active)
      .map(s => ({
        icon: s.icon,
        title: s.name,
        date: s.nextBillingDate,
        amount: s.price,
      }));
    const reminderItems = state.reminders
      .filter(r => !r.completed && !r.linkedSubscriptionId)
      .map(r => ({
        icon: r.type === 'bill' ? '💰' : r.type === 'custom' ? '🔔' : '💳',
        title: r.title,
        date: r.date,
        amount: undefined,
      }));
    return [...subItems, ...reminderItems]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 4);
  }, [state.subscriptions, state.reminders]);

  const totalSpent = monthlyExpenses + monthlySubCost;
  const remaining = state.profile.monthlyIncome - totalSpent;
  const isOverBudget = remaining < 0;

  const handleDeleteExpense = async (id: string) => {
    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;
      dispatch({ type: 'DELETE_EXPENSE', payload: id });
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Blue Header Section */}
      <View style={styles.headerBackground}>
        <SafeAreaView>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.month}>{getCurrentMonth()}</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/settings' as any)} style={styles.settingsButton}>
              <Ionicons name="settings-outline" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceAmount}>{formatCurrency(remaining)}</Text>
            
            {isOverBudget && (
              <View style={styles.warningPill}>
                <Ionicons name="warning" size={14} color={colors.white} />
                <Text style={styles.warningText}>Over budget</Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </View>

      {/* Overlapping Content Section */}
      <View style={styles.contentWrapper}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Income Row - moved inside card */}
          <Card style={styles.incomeCard} elevated>
            <TouchableOpacity style={styles.incomeRow} onPress={() => router.push('/edit-income' as any)} activeOpacity={0.6}>
              <View>
                <Text style={styles.incomeLabel}>Monthly Income</Text>
                <Text style={styles.incomeAmount}>{formatCurrency(state.profile.monthlyIncome)}</Text>
              </View>
              <View style={styles.editIconWrapper}>
                <Ionicons name="pencil" size={16} color={colors.accent} />
              </View>
            </TouchableOpacity>
          </Card>

          {/* Stat Cards */}
          <View style={styles.statsRow}>
            <StatCard
              label="Expenses"
              value={formatCurrency(monthlyExpenses)}
              subtitle="this month"
              valueColor={colors.negative}
            />
            <StatCard
              label="Subscriptions"
              value={formatCurrency(monthlySubCost)}
              subtitle={`${state.subscriptions.filter(s => s.active).length} active`}
            />
          </View>

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Upcoming</Text>
              <Card style={styles.listCard}>
                {upcoming.map((item, i) => (
                  <UpcomingRow key={i} {...item} />
                ))}
              </Card>
            </View>
          )}

          {/* Recent Expenses */}
          {recentExpenses.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Expenses</Text>
              <Card style={styles.listCard}>
                {recentExpenses.map(expense => (
                  <ExpenseRow
                    key={expense.id}
                    expense={expense}
                    onDelete={handleDeleteExpense}
                  />
                ))}
              </Card>
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
    paddingBottom: 60, // Extra padding for overlap
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    ...typography.h2,
    color: colors.white,
  },
  month: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  balanceContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  balanceLabel: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  balanceAmount: {
    ...typography.display,
    color: colors.white,
  },
  warningPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    backgroundColor: colors.negative,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.full,
    marginTop: spacing.sm,
  },
  warningText: {
    ...typography.caption,
    color: colors.white,
    fontFamily: 'Inter_600SemiBold',
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
  incomeCard: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
  },
  incomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  incomeLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  incomeAmount: {
    ...typography.h2,
    color: colors.positive,
  },
  editIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  section: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginLeft: spacing.xs,
  },
  listCard: {
    padding: 0,
    overflow: 'hidden',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
  },
});
