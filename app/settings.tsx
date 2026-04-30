import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { colors, typography, spacing } from '../utils/theme';

export default function Settings() {
  const { state, dispatch } = useApp();
  const router = useRouter();

  const handleClearData = () => {
    Alert.alert('Clear All Data', 'This will permanently delete all your data.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear Everything', style: 'destructive', onPress: () => { dispatch({ type: 'CLEAR_ALL_DATA' }); router.back(); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          <Card style={styles.listCard}>
            <View style={styles.row}>
              <Text style={styles.label}>Currency</Text>
              <Text style={styles.value}>PHP (₱)</Text>
            </View>
          </Card>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <Card style={styles.listCard}>
            <TouchableOpacity style={styles.row} onPress={handleClearData} activeOpacity={0.6}>
              <Text style={[styles.label, { color: colors.negative }]}>Clear All Data</Text>
              <Ionicons name="trash-outline" size={18} color={colors.negative} />
            </TouchableOpacity>
          </Card>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Card style={styles.listCard}>
            <View style={styles.row}>
              <Text style={styles.label}>Version</Text>
              <Text style={styles.value}>1.0.0</Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg.primary },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.md },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.bg.card, alignItems: 'center', justifyContent: 'center' },
  title: { ...typography.h2, color: colors.text.primary, flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg, gap: spacing.lg },
  section: { gap: spacing.sm },
  sectionTitle: { ...typography.caption, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginLeft: spacing.xs },
  listCard: { padding: 0, overflow: 'hidden' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: spacing.md },
  label: { ...typography.body, color: colors.text.primary },
  value: { ...typography.body, color: colors.text.tertiary },
});
