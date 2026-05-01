import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, Platform } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
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
  const [isUnlocked, setIsUnlocked] = useState(!state.biometricsEnabled);

  React.useEffect(() => {
    const runAudit = async () => {
      try {
        const { db } = require('../../utils/powersync');
        if (db) {
          const rows = await db.getAll('SELECT * FROM documents');
          console.log('CENTRIA VAULT AUDIT:', {
            totalRows: rows.length,
            sample: rows[0],
            stateCount: state.documents.length
          });
        }
      } catch (e) {
        console.warn('Audit Failed:', e);
      }
    };
    runAudit();
  }, [state.documents]);

  const handleUnlock = async () => {
    if (!state.biometricsEnabled) {
      setIsUnlocked(true);
      return;
    }

    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      setIsUnlocked(true); // Fallback if no biometrics setup
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock Vault',
      fallbackLabel: 'Use PIN',
      disableDeviceFallback: false,
    });

    if (result.success) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsUnlocked(true);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (state.biometricsEnabled) {
        handleUnlock();
      } else {
        setIsUnlocked(true);
      }
      return () => {
        if (state.biometricsEnabled) setIsUnlocked(false);
      };
    }, [state.biometricsEnabled])
  );

  const filtered = useMemo(() => {
    let docs = [...state.documents];
    
    // 1. Category Filter
    if (selectedCategory !== 'all') {
      docs = docs.filter(d => d.category === selectedCategory);
    }
    
    // 2. Search Filter
    if (search.trim()) {
      const q = search.toLowerCase();
      docs = docs.filter(d => d.name.toLowerCase().includes(q) || d.category.toLowerCase().includes(q));
    }

    // 3. Smart Sort (Most recent first)
    return docs.sort((a, b) => {
      // Prioritize expiring documents
      const aExpiring = a.expiryDate && new Date(a.expiryDate).getTime() < Date.now() + 30 * 24 * 60 * 60 * 1000;
      const bExpiring = b.expiryDate && new Date(b.expiryDate).getTime() < Date.now() + 30 * 24 * 60 * 60 * 1000;
      if (aExpiring && !bExpiring) return -1;
      if (!aExpiring && bExpiring) return 1;
      
      return new Date(b.id).getTime() - new Date(a.id).getTime(); // Fallback to creation date
    });
  }, [state.documents, selectedCategory, search]);

  const stats = useMemo(() => {
    const now = Date.now();
    const monthFromNow = now + 30 * 24 * 60 * 60 * 1000;
    
    return {
      total: state.documents.length,
      expiring: state.documents.filter(d => d.expiryDate && new Date(d.expiryDate).getTime() < monthFromNow).length,
      counts: state.documents.reduce((acc: Record<string, number>, d) => {
        acc[d.category] = (acc[d.category] || 0) + 1;
        return acc;
      }, { all: state.documents.length })
    };
  }, [state.documents]);

  const handleOpenDocument = async (uri: string) => {
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(uri);
    } else {
      Alert.alert('Error', 'Sharing is not available on this device');
    }
  };

  if (!isUnlocked) {
    return (
      <View style={styles.lockedContainer}>
        <StatusBar style="light" />
        <View style={styles.lockedIconWrapper}>
          <Ionicons name="lock-closed" size={60} color={colors.accent} />
        </View>
        <Text style={styles.lockedTitle}>Vault is Locked</Text>
        <Text style={styles.lockedSubtitle}>Authenticate to view your secure documents</Text>
        <TouchableOpacity style={styles.unlockBtn} onPress={handleUnlock} activeOpacity={0.7}>
          <Text style={styles.unlockBtnText}>Unlock Now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.headerBackground}>
        <SafeAreaView>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.title}>Vault</Text>
              {stats.expiring > 0 && (
                <View style={styles.warningPill}>
                  <Ionicons name="alert-circle" size={14} color={colors.white} />
                  <Text style={styles.warningText}>{stats.expiring} Expiring Soon</Text>
                </View>
              )}
            </View>
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
          <TouchableOpacity 
            onPress={async () => {
              try {
                const { db } = require('../../utils/powersync');
                await db.execute('INSERT INTO documents (id, user_id, name, category, file_path, file_type) VALUES (?, ?, ?, ?, ?, ?)', 
                  [Date.now().toString(), 'test-user', 'Test Doc', 'id', 'test/path', 'image/png']);
                Alert.alert('Success', 'Test row inserted!');
              } catch (e: any) {
                Alert.alert('Error', e.message);
              }
            }}
            style={{ padding: 10, backgroundColor: colors.accent, borderRadius: 8, marginBottom: 10 }}
          >
            <Text style={{ color: 'white', textAlign: 'center' }}>Force Test Row</Text>
          </TouchableOpacity>

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
                  {stats.counts[cat] || 0}
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
  warningPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.full,
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  warningText: {
    ...typography.micro,
    color: colors.white,
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
  },
  lockedContainer: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  lockedIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  lockedTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  lockedSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  unlockBtn: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: radius.md,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  unlockBtnText: {
    ...typography.body,
    color: colors.white,
    fontFamily: 'Inter_700Bold',
  },
});
