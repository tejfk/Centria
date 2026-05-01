import React, { useMemo, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform, Animated as RNAnimated } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedScrollHandler, 
  useAnimatedStyle, 
  interpolate, 
  Extrapolation 
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../../components/features/StatCard';
import { UpcomingRow } from '../../components/features/UpcomingRow';
import { ExpenseRow } from '../../components/features/ExpenseRow';
import { SpendingOverview } from '../../components/features/SpendingOverview';
import { Card } from '../../components/ui/Card';
import { colors, typography, spacing, radius } from '../../utils/theme';
import { formatCurrency, getGreeting, getCurrentMonth, isCurrentMonth } from '../../utils/formatters';
import { getMonthlyEquivalent } from '../../utils/helpers';
import { StatusBar } from 'expo-status-bar';

export default function Dashboard() {
  const { state, dispatch } = useApp();
  const router = useRouter();
  const [isBalanceVisible, setIsBalanceVisible] = useState(false);

  const toggleBalance = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsBalanceVisible(!isBalanceVisible);
  };

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

  // Reanimated Physics Scroll
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: interpolate(scrollY.value, [0, 100], [0, -20], Extrapolation.CLAMP) },
      ],
      opacity: interpolate(scrollY.value, [0, 100], [1, 0.8], Extrapolation.CLAMP),
    };
  });

  const handleActionPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Future action routing here
  };

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
      
      {/* Luxury Animated Header Section */}
      <Animated.View style={[styles.headerBackground, headerAnimatedStyle]}>
        <SafeAreaView>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.month}>{getCurrentMonth()}</Text>
            </View>
            <TouchableOpacity 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/settings' as any);
              }} 
              style={styles.settingsButton}
            >
              <Ionicons name="settings-outline" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.balanceContainer} 
            onLongPress={toggleBalance}
            delayLongPress={300}
            activeOpacity={0.8}
          >
            <Text style={styles.balanceLabel}>
              {isBalanceVisible ? 'Total Balance' : 'Hold to reveal balance'}
            </Text>
            <View style={styles.amountWrapper}>
              <Text style={[styles.balanceAmount, !isBalanceVisible && styles.blurredAmount]}>
                {isBalanceVisible ? formatCurrency(remaining, state.profile.currency) : '••••••'}
              </Text>
              {!isBalanceVisible && (
                <View style={styles.eyeIcon}>
                  <Ionicons name="eye-off-outline" size={16} color={colors.white + '80'} />
                </View>
              )}
            </View>
            
            {isOverBudget && isBalanceVisible && (
              <View style={styles.warningPill}>
                <Ionicons name="warning" size={14} color={colors.white} />
                <Text style={styles.warningText}>Over budget</Text>
              </View>
            )}
          </TouchableOpacity>
        </SafeAreaView>
      </Animated.View>

      {/* Overlapping Content Section */}
      <View style={styles.contentWrapper}>
        <Animated.ScrollView 
          style={styles.scroll} 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
        >
          
          {/* Income Row - moved inside card */}
          <Card style={styles.incomeCard} elevated index={0}>
            <TouchableOpacity style={styles.incomeRow} onPress={() => router.push('/edit-income' as any)} activeOpacity={0.6}>
              <View>
                <Text style={styles.incomeLabel}>Monthly Income</Text>
                <Text style={styles.incomeAmount}>{formatCurrency(state.profile.monthlyIncome, state.profile.currency)}</Text>
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
              value={formatCurrency(monthlyExpenses, state.profile.currency)}
              subtitle="this month"
              valueColor={colors.negative}
            />
            <StatCard
              label="Subscriptions"
              value={formatCurrency(monthlySubCost, state.profile.currency)}
              subtitle={`${state.subscriptions.filter(s => s.active).length} active`}
            />
          </View>

          {/* Spending Overview (Charts) */}
          <SpendingOverview expenses={state.expenses} />

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
        </Animated.ScrollView>
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
    paddingBottom: 70, // Increased for more overlap breathing room
    paddingTop: Platform.OS === 'android' ? 32 : 12, // More top space
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl, // Wider margins
    paddingTop: spacing.lg,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accentSoft, // Soft sapphire tint instead of white tint
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    ...typography.light, // Using the new thin, elegant variant
    color: colors.text.primary,
  },
  month: {
    ...typography.caption,
    color: colors.text.secondary, // Muted slate instead of transparent white
    marginTop: 2,
  },
  balanceContainer: {
    paddingHorizontal: spacing.xl, // Wider margins to align with headerTop
    marginTop: spacing.xxl, // More vertical rhythm
    paddingBottom: spacing.xl,
  },
  balanceLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  amountWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  balanceAmount: {
    ...typography.display,
    color: colors.text.primary,
  },
  blurredAmount: {
    opacity: 0.3,
    letterSpacing: 4,
  },
  eyeIcon: {
    marginTop: 4,
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
