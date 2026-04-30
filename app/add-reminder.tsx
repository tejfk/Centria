import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { colors, typography, spacing } from '../utils/theme';
import { generateId } from '../utils/helpers';

const types = ['Bill', 'Payment', 'Custom'];

export default function AddReminder() {
  const { dispatch } = useApp();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [typeIndex, setTypeIndex] = useState(0);

  const handleSave = () => {
    if (!title.trim()) return;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    dispatch({
      type: 'ADD_REMINDER',
      payload: {
        id: generateId(),
        title: title.trim(),
        date: futureDate.toISOString(),
        type: types[typeIndex].toLowerCase() as any,
        completed: false,
        linkedSubscriptionId: null,
      },
    });
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
          <Text style={styles.title}>Add Reminder</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <Input label="Title" value={title} onChangeText={setTitle} placeholder="Rent, Dentist, Insurance..." autoFocus />
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Type</Text>
            <SegmentedControl options={types} selected={typeIndex} onChange={setTypeIndex} />
          </View>
          <Button title="Save Reminder" onPress={handleSave} disabled={!title.trim()} />
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
});
