import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { colors, typography, spacing } from '../utils/theme';
import { supabase } from '../utils/supabase';
import { db } from '../utils/powersync';
import 'react-native-get-random-values';

const cycles = ['Weekly', 'Monthly', 'Yearly'];
const iconOptions = ['🎬', '🎵', '🏋️', '☁️', '🎮', '📰', '💻', '📱', '🎧', '📦', '🍔', '🚗'];

export default function AddSubscription() {
  const { dispatch } = useApp();
  const router = useRouter();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [cycleIndex, setCycleIndex] = useState(1);
  const [icon, setIcon] = useState('📦');

  const handleSave = async () => {
    const parsedPrice = parseFloat(price);
    if (!name.trim() || !parsedPrice || parsedPrice <= 0) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const id = Math.random().toString(36).substring(2, 15);

      await db.execute(
        'INSERT INTO subscriptions (id, user_id, name, price, cycle, next_billing_date, icon, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [id, user.id, name.trim(), parsedPrice, cycles[cycleIndex].toLowerCase(), new Date().toISOString(), icon, 1]
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
          <Text style={styles.title}>Add Subscription</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <Input label="Name" value={name} onChangeText={setName} placeholder="Netflix, Spotify..." autoFocus />
          <Input label="Price (₱)" value={price} onChangeText={setPrice} placeholder="0.00" keyboardType="decimal-pad" />
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Billing Cycle</Text>
            <SegmentedControl options={cycles} selected={cycleIndex} onChange={setCycleIndex} />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Icon</Text>
            <View style={styles.iconGrid}>
              {iconOptions.map(ic => (
                <TouchableOpacity key={ic} style={[styles.iconBtn, icon === ic && styles.iconBtnActive]} onPress={() => setIcon(ic)} activeOpacity={0.7}>
                  <Text style={styles.iconText}>{ic}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <Button title="Save Subscription" onPress={handleSave} disabled={!name.trim() || !price || parseFloat(price) <= 0} />
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
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  iconBtn: { width: 48, height: 48, borderRadius: 12, backgroundColor: colors.bg.elevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  iconBtnActive: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  iconText: { fontSize: 22 },
});
