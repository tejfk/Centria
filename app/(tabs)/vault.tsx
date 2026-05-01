import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, Platform } from 'react-native';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { DocumentRow } from '../../components/features/DocumentRow';
import { Card } from '../../components/ui/Card';
import { colors, typography, spacing, radius } from '../../utils/theme';
import { getCategoryIcon, getCategoryLabel } from '../../utils/helpers';
import { StatusBar } from 'expo-status-bar';

const docCategories = ['all', 'id', 'receipt', 'contract', 'other'] as const;

export default function Vault() {
  const { state, dispatch } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filtered = useMemo(() => {
    let docs = state.documents;
    if (selectedCategory !== 'all') {
      docs = docs.filter(d => d.category === selectedCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      docs = docs.filter(d => d.name.toLowerCase().includes(q));
    }
    return docs;
  }, [state.documents, selectedCategory, search]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: state.documents.length };
    state.documents.forEach(d => { c[d.category] = (c[d.category] || 0) + 1; });
    return c;
  }, [state.documents]);

  const handleOpenDocument = async (uri: string) => {
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(uri);
    } else {
      Alert.alert('Error', 'Sharing is not available on this device');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.headerBackground}>
        <SafeAreaView>
          <View style={styles.headerTop}>
            <Text style={styles.title}>Vault</Text>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.contentWrapper}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Search */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color={colors.text.tertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search documents..."
              placeholderTextColor={colors.text.tertiary}
              value={search}
              onChangeText={setSearch}
              selectionColor={colors.accent}
            />
          </View>

          {/* Category chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {docCategories.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, selectedCategory === cat && styles.chipActive]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.7}
              >
                <Text style={styles.chipIcon}>{cat === 'all' ? '📁' : getCategoryIcon(cat)}</Text>
                <Text style={[styles.chipLabel, selectedCategory === cat && styles.chipLabelActive]}>
                  {cat === 'all' ? 'All' : getCategoryLabel(cat)}
                </Text>
                <Text style={[styles.chipCount, selectedCategory === cat && styles.chipCountActive]}>
                  {counts[cat] || 0}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Documents list */}
          {filtered.length > 0 ? (
            <Card style={styles.listCard}>
              {filtered.map(doc => (
                <DocumentRow 
                  key={doc.id} 
                  document={doc}
                  onPress={() => handleOpenDocument(doc.fileUri)}
                  onDelete={(id) => Alert.alert('Delete?', 'Remove this document?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => dispatch({ type: 'DELETE_DOCUMENT', payload: id }) },
                  ])}
                />
              ))}
            </Card>
          ) : (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 40 }}>📁</Text>
              <Text style={styles.emptyTitle}>No documents</Text>
              <Text style={styles.emptySub}>Tap + to upload your first document</Text>
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
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.md },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.white, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: 12,
    borderWidth: 1, borderColor: colors.border,
  },
  searchInput: { flex: 1, ...typography.body, color: colors.text.primary },
  chipRow: { gap: spacing.sm, paddingVertical: spacing.xs },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 2,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
    backgroundColor: colors.white, borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  chipIcon: { fontSize: 14 },
  chipLabel: { ...typography.caption, color: colors.text.secondary },
  chipLabelActive: { color: colors.accent, fontFamily: 'Inter_600SemiBold' },
  chipCount: { ...typography.micro, color: colors.text.tertiary },
  chipCountActive: { color: colors.accent },
  listCard: { padding: 0, overflow: 'hidden', backgroundColor: colors.white },
  emptyState: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.sm },
  emptyTitle: { ...typography.h2, color: colors.text.secondary },
  emptySub: { ...typography.body, color: colors.text.tertiary },
});
