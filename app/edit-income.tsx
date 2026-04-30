import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { colors, typography, spacing, radius } from '../utils/theme';
import { supabase } from '../utils/supabase';

export default function EditIncome() {
  const { state, dispatch } = useApp();
  const router = useRouter();
  const [income, setIncome] = useState(state.profile.monthlyIncome.toString());
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const parsedIncome = parseFloat(income);
    if (isNaN(parsedIncome)) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      await db.execute(
        'INSERT INTO profiles (id, name, monthly_income, currency, created_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET monthly_income = EXCLUDED.monthly_income',
        [user.id, state.profile.name, parsedIncome, state.profile.currency, state.profile.createdAt]
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
          <Text style={styles.title}>Monthly Income</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.content}>
          <Input
            label="Monthly Income (₱)"
            value={income}
            onChangeText={setIncome}
            placeholder="0.00"
            keyboardType="decimal-pad"
            autoFocus
          />
          <Text style={styles.hint}>Set your total monthly income to track your budget progress.</Text>
          <Button title="Update Income" onPress={handleSave} disabled={isNaN(parseFloat(income))} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.bg.card, alignItems: 'center', justifyContent: 'center' },
  title: { ...typography.h2, color: colors.text.primary },
  content: { paddingHorizontal: spacing.lg, gap: spacing.lg },
  hint: { ...typography.caption, color: colors.text.tertiary, lineHeight: 18 },
});
