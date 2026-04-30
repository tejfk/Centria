import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, Alert, Platform } from 'react-native';
import { useApp } from '../../context/AppContext';
import { ReminderRow } from '../../components/features/ReminderRow';
import { Card } from '../../components/ui/Card';
import { colors, typography, spacing, radius } from '../../utils/theme';
import { StatusBar } from 'expo-status-bar';

export default function Reminders() {
  const { state, dispatch } = useApp();

  const upcoming = useMemo(() => {
    return state.reminders
      .filter(r => !r.completed)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [state.reminders]);

  const completed = useMemo(() => {
    return state.reminders
      .filter(r => r.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [state.reminders]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.headerBackground}>
        <SafeAreaView>
          <View style={styles.headerTop}>
            <Text style={styles.title}>Reminders</Text>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.contentWrapper}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {upcoming.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Upcoming</Text>
              <Card style={styles.listCard}>
                {upcoming.map(r => (
                  <ReminderRow key={r.id} reminder={r}
                    onToggle={(id) => dispatch({ type: 'TOGGLE_REMINDER', payload: id })}
                    onDelete={(id) => Alert.alert('Delete?', 'Remove this reminder?', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => dispatch({ type: 'DELETE_REMINDER', payload: id }) },
                    ])}
                  />
                ))}
              </Card>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 40 }}>🔔</Text>
              <Text style={styles.emptyTitle}>All caught up!</Text>
              <Text style={styles.emptySub}>No upcoming reminders</Text>
            </View>
          )}
          {completed.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Completed</Text>
              <Card style={styles.listCard}>
                {completed.map(r => (
                  <ReminderRow key={r.id} reminder={r}
                    onToggle={(id) => dispatch({ type: 'TOGGLE_REMINDER', payload: id })}
                    onDelete={(id) => dispatch({ type: 'DELETE_REMINDER', payload: id })}
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
  container: { flex: 1, backgroundColor: colors.bg.primary },
  headerBackground: { backgroundColor: colors.bg.header, paddingBottom: 60, paddingTop: Platform.OS === 'android' ? 24 : 0 },
  headerTop: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.lg },
  title: { ...typography.h1, color: colors.white },
  contentWrapper: {
    flex: 1, backgroundColor: colors.bg.primary,
    borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
    marginTop: -32, overflow: 'hidden',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.lg },
  section: { gap: spacing.sm },
  sectionTitle: { ...typography.h3, color: colors.text.primary, marginLeft: spacing.xs },
  listCard: { padding: 0, overflow: 'hidden', backgroundColor: colors.white },
  emptyState: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.sm },
  emptyTitle: { ...typography.h2, color: colors.text.secondary },
  emptySub: { ...typography.body, color: colors.text.tertiary },
});
