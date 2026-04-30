import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { colors, typography, spacing, radius } from '../../utils/theme';
import { StatusBar } from 'expo-status-bar';

export default function Profile() {
  const { state, dispatch } = useApp();

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear Everything', style: 'destructive', onPress: () => dispatch({ type: 'CLEAR_ALL_DATA' }) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.headerBackground}>
        <SafeAreaView>
          <View style={styles.headerTop}>
            <Text style={styles.title}>Profile</Text>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.contentWrapper}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* User Card */}
          <Card style={styles.userCard} elevated>
            <View style={styles.avatar}>
              <Ionicons name="person" size={28} color={colors.accent} />
            </View>
            <Text style={styles.userName}>{state.profile.name}</Text>
            <Text style={styles.userMeta}>Member since {new Date(state.profile.createdAt).toLocaleDateString('en-PH', { month: 'short', year: 'numeric' })}</Text>
          </Card>

          {/* General */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>General</Text>
            <Card style={styles.listCard}>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Name</Text>
                <Text style={styles.settingValue}>{state.profile.name}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Currency</Text>
                <Text style={styles.settingValue}>PHP (₱)</Text>
              </View>
            </Card>
          </View>

          {/* Data */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data</Text>
            <Card style={styles.listCard}>
              <TouchableOpacity style={styles.settingRow} activeOpacity={0.6}>
                <Text style={styles.settingLabel}>Export Data</Text>
                <Ionicons name="download-outline" size={18} color={colors.text.tertiary} />
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity style={styles.settingRow} onPress={handleClearData} activeOpacity={0.6}>
                <Text style={[styles.settingLabel, { color: colors.negative }]}>Clear All Data</Text>
                <Ionicons name="trash-outline" size={18} color={colors.negative} />
              </TouchableOpacity>
            </Card>
          </View>

          {/* About */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Card style={styles.listCard}>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Version</Text>
                <Text style={styles.settingValue}>1.0.0</Text>
              </View>
            </Card>
          </View>

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
  userCard: { alignItems: 'center', paddingVertical: spacing.lg, backgroundColor: colors.white },
  avatar: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: colors.accentSoft,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md,
  },
  userName: { ...typography.h2, color: colors.text.primary },
  userMeta: { ...typography.caption, color: colors.text.tertiary, marginTop: spacing.xs },
  section: { gap: spacing.sm },
  sectionTitle: { ...typography.h3, color: colors.text.primary, marginLeft: spacing.xs },
  listCard: { padding: 0, overflow: 'hidden', backgroundColor: colors.white },
  settingRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: spacing.md,
  },
  settingLabel: { ...typography.body, color: colors.text.primary },
  settingValue: { ...typography.body, color: colors.text.tertiary },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.md },
});
