import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts/dist/LineChart';
import { PieChart } from 'react-native-gifted-charts/dist/PieChart';
import { colors, typography, spacing, radius, shadows } from '../../utils/theme';
import { formatCurrency } from '../../utils/formatters';
import { Expense, useApp } from '../../context/AppContext';
import { Card } from '../ui/Card';

const { width } = Dimensions.get('window');

interface SpendingOverviewProps {
  expenses: Expense[];
}

export function SpendingOverview({ expenses }: SpendingOverviewProps) {
  const { state } = useApp();
  // 1. Process data for Line Chart (Last 7 Days)
  const lineData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayTotal = expenses
        .filter(e => e.date.startsWith(date))
        .reduce((sum, e) => sum + e.amount, 0);
      
      const dayLabel = new Date(date).toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
      
      return {
        value: dayTotal,
        label: dayLabel,
        dataPointText: dayTotal > 0 ? formatCurrency(dayTotal, state.profile.currency) : '',
      };
    });
  }, [expenses]);

  // 2. Process data for Pie Chart (Category Breakdown)
  const pieData = useMemo(() => {
    const categories: Record<string, number> = {};
    expenses.forEach(e => {
      categories[e.category] = (categories[e.category] || 0) + e.amount;
    });

    const categoryColors: Record<string, string> = {
      food: '#3B82F6',
      transport: '#2563EB',
      shopping: '#60A5FA',
      bills: '#EF4444',
      health: '#10B981',
      entertainment: '#8B5CF6',
      other: '#94A3B8',
    };

    return Object.entries(categories)
      .map(([cat, total]) => ({
        value: total,
        color: categoryColors[cat] || categoryColors.other,
        text: cat.charAt(0).toUpperCase() + cat.slice(1),
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const hasData = expenses.length > 0;

  if (!hasData) {
    return (
      <Card style={styles.emptyCard}>
        <Text style={styles.emptyText}>Add some expenses to see your trends</Text>
      </Card>
    );
  }

  return (
    <View style={styles.container}>
      {/* Spending Trend */}
      <Card style={styles.chartCard}>
        <Text style={styles.chartTitle}>Spending Trend (Last 7 Days)</Text>
        <View style={styles.lineChartWrapper}>
          <LineChart
            data={lineData}
            height={160}
            width={width - 80}
            initialSpacing={10}
            color={colors.accent}
            thickness={3}
            hideRules
            hideYAxisText
            yAxisColor="transparent"
            xAxisColor={colors.border}
            dataPointsColor={colors.accent}
            focusedDataPointColor={colors.accent}
            areaChart
            startFillColor={colors.accentSoft}
            endFillColor="transparent"
            startOpacity={0.4}
            endOpacity={0.1}
            pointerConfig={{
              pointerStripColor: colors.accent,
              pointerStripWidth: 2,
              pointerColor: colors.accent,
              radius: 6,
              pointerLabelComponent: (items: any) => (
                <View style={styles.pointerLabel}>
                  <Text style={styles.pointerValue}>{formatCurrency(items[0].value, state.profile.currency)}</Text>
                </View>
              ),
            }}
          />
        </View>
      </Card>

      {/* Category Breakdown */}
      <Card style={styles.chartCard}>
        <Text style={styles.chartTitle}>Category Breakdown</Text>
        <View style={styles.pieWrapper}>
          <PieChart
            data={pieData}
            donut
            radius={80}
            innerRadius={60}
            innerCircleColor={colors.white}
            centerLabelComponent={() => (
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.pieLabel}>Total</Text>
                <Text style={styles.pieTotal}>
                  {formatCurrency(expenses.reduce((s, e) => s + e.amount, 0), state.profile.currency)}
                </Text>
              </View>
            )}
          />
          <View style={styles.legend}>
            {pieData.slice(0, 4).map((item, i) => (
              <View key={i} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text style={styles.legendText} numberOfLines={1}>{item.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg.card,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    ...typography.body,
    color: colors.text.tertiary,
  },
  chartCard: {
    padding: spacing.lg,
  },
  chartTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  lineChartWrapper: {
    marginLeft: -20,
  },
  pointerLabel: {
    backgroundColor: colors.text.primary,
    padding: 8,
    borderRadius: 8,
  },
  pointerValue: {
    ...typography.caption,
    color: colors.white,
    fontFamily: 'Inter_600SemiBold',
  },
  pieWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  pieLabel: {
    ...typography.micro,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
  },
  pieTotal: {
    ...typography.caption,
    color: colors.text.primary,
    fontFamily: 'Inter_700Bold',
  },
  legend: {
    gap: spacing.sm,
    width: '40%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
});
