import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { CategoryChip } from '../components/ui/CategoryChip';
import { colors, typography, spacing } from '../utils/theme';
import { generateId, getCategoryIcon } from '../utils/helpers';

const docCategories = [
  { key: 'id', label: 'ID' },
  { key: 'receipt', label: 'Receipt' },
  { key: 'contract', label: 'Contract' },
  { key: 'other', label: 'Other' },
] as const;

export default function AddDocument() {
  const { dispatch } = useApp();
  const router = useRouter();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('other');

  const handleSave = () => {
    if (!name.trim()) return;
    dispatch({
      type: 'ADD_DOCUMENT',
      payload: {
        id: generateId(),
        name: name.trim(),
        category: category as any,
        fileUri: '',
        fileType: 'application/pdf',
        expiryDate: null,
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
          <Text style={styles.title}>Add Document</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <Input label="Document Name" value={name} onChangeText={setName} placeholder="Driver's License, Lease..." autoFocus />
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {docCategories.map(cat => (
                <CategoryChip key={cat.key} label={cat.label} icon={getCategoryIcon(cat.key)} selected={category === cat.key} onPress={() => setCategory(cat.key)} />
              ))}
            </ScrollView>
          </View>
          {/* File upload placeholder — will use expo-image-picker on native */}
          <TouchableOpacity style={styles.uploadArea} activeOpacity={0.6}>
            <Ionicons name="cloud-upload-outline" size={32} color={colors.text.tertiary} />
            <Text style={styles.uploadText}>Tap to upload file</Text>
            <Text style={styles.uploadHint}>Image or PDF</Text>
          </TouchableOpacity>
          <Button title="Save Document" onPress={handleSave} disabled={!name.trim()} />
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
  uploadArea: {
    alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    paddingVertical: spacing.xl, borderRadius: 12,
    borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed',
    backgroundColor: colors.bg.elevated,
  },
  uploadText: { ...typography.body, color: colors.text.secondary, fontFamily: 'Inter_500Medium' },
  uploadHint: { ...typography.caption, color: colors.text.tertiary },
});
