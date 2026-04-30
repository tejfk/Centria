import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { CategoryChip } from '../components/ui/CategoryChip';
import { colors, typography, spacing, radius } from '../utils/theme';
import { getCategoryIcon } from '../utils/helpers';
import { supabase } from '../utils/supabase';
import { db } from '../utils/powersync';
import 'react-native-get-random-values';

const categories = [
  { key: 'food', label: 'Food' },
  { key: 'transport', label: 'Transport' },
  { key: 'health', label: 'Health' },
  { key: 'shopping', label: 'Shopping' },
  { key: 'entertainment', label: 'Entertainment' },
  { key: 'bills', label: 'Bills' },
  { key: 'other', label: 'Other' },
] as const;

export default function AddExpense() {
  const { dispatch } = useApp();
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>('food');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const id = Math.random().toString(36).substring(2, 15); // Simple local ID

      await db.execute(
        'INSERT INTO expenses (id, user_id, amount, category, note, date) VALUES (?, ?, ?, ?, ?, ?)',
        [id, user.id, parsedAmount, category, note.trim(), new Date().toISOString()]
      );

      router.back();
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
          <Text style={styles.title}>Add Expense</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <Input
            label="Amount (₱)"
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="decimal-pad"
            autoFocus
          />
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {categories.map(cat => (
                <CategoryChip
                  key={cat.key}
                  label={cat.label}
                  icon={getCategoryIcon(cat.key)}
                  selected={category === cat.key}
                  onPress={() => setCategory(cat.key)}
                />
              ))}
            </ScrollView>
          </View>
          <Input label="Note (optional)" value={note} onChangeText={setNote} placeholder="What was this for?" />
          <Button title="Save Expense" onPress={handleSave} disabled={!amount || parseFloat(amount) <= 0} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.bg.card, alignItems: 'center', justifyContent: 'center' },
  title: { ...typography.h2, color: colors.text.primary },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  fieldGroup: { gap: spacing.sm },
  fieldLabel: { ...typography.caption, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  chipRow: { gap: spacing.sm },
});
