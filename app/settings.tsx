import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert, Switch, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { colors, typography, spacing } from '../utils/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CURRENCIES = [
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

export default function Settings() {
  const { state, dispatch, db } = useApp();
  const router = useRouter();
  const [isCurrencyOpen, setIsCurrencyOpen] = React.useState(false);

  const toggleCurrency = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsCurrencyOpen(!isCurrencyOpen);
  };

  const selectedCurrency = CURRENCIES.find(c => c.symbol === state.profile.currency) || CURRENCIES[0];

  const securityOptions = ['Off', 'PIN', 'Biometrics'];
  const currentSecurityIndex = state.biometricsEnabled ? 2 : (state.appPin ? 1 : 0);

  const handleSecurityChange = (index: number) => {
    if (index === 0) {
      // Off
      dispatch({ type: 'SET_BIOMETRICS', payload: false });
      dispatch({ type: 'SET_PIN', payload: null });
    } else if (index === 1) {
      // PIN
      dispatch({ type: 'SET_BIOMETRICS', payload: false });
      if (!state.appPin) {
        router.push('/set-pin');
      }
    } else if (index === 2) {
      // Biometrics
      dispatch({ type: 'SET_BIOMETRICS', payload: true });
      // Usually biometrics requires a PIN fallback, but for simplicity here we just toggle it.
      // If a PIN is needed, we could also check state.appPin.
    }
  };

  const handleCurrencyChange = async (symbol: string) => {
    try {
      const userId = 'local-user';
      
      // Ensure we only ever have ONE profile row by deleting all and inserting fresh
      await db.execute('DELETE FROM profiles');
      await db.execute(
        'INSERT INTO profiles (id, name, monthly_income, currency, created_at) VALUES (?, ?, ?, ?, ?)',
        [userId, state.profile.name, state.profile.monthlyIncome, symbol, state.profile.createdAt]
      );
      
      dispatch({ type: 'SET_PROFILE', payload: { currency: symbol } });
    } catch (e) {
      console.error('Currency update failed', e);
    }
  };

  const handleClearData = () => {
    Alert.alert('Clear All Data', 'This will permanently delete everything. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Clear Everything', 
        style: 'destructive', 
        onPress: async () => { 
          // 1. Wipe the local database
          try {
            await db.execute('DELETE FROM expenses');
            await db.execute('DELETE FROM subscriptions');
            await db.execute('DELETE FROM reminders');
            await db.execute('DELETE FROM documents');
            await db.execute('DELETE FROM profiles');
          } catch (e) {
            console.error('Database wipe failed', e);
          }

          // 2. Reset the app state and storage
          dispatch({ type: 'CLEAR_ALL_DATA' }); 
          router.back(); 
        } 
      },
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
          <Text style={styles.sectionTitle}>Preferences</Text>
          <Card style={styles.listCard}>
            <TouchableOpacity 
              style={styles.row} 
              onPress={toggleCurrency}
              activeOpacity={0.7}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Currency</Text>
                <Text style={styles.subLabel}>{selectedCurrency.name} ({selectedCurrency.symbol})</Text>
              </View>
              <Ionicons 
                name={isCurrencyOpen ? "chevron-up" : "chevron-down"} 
                size={20} 
                color={colors.text.tertiary} 
              />
            </TouchableOpacity>

            {isCurrencyOpen && (
              <View style={styles.dropdownContent}>
                <View style={styles.divider} />
                {CURRENCIES.map((item, index) => (
                  <React.Fragment key={item.code}>
                    <TouchableOpacity 
                      style={[
                        styles.dropdownRow,
                        state.profile.currency === item.symbol && styles.activeDropdownRow
                      ]} 
                      onPress={() => {
                        handleCurrencyChange(item.symbol);
                        toggleCurrency();
                      }}
                      activeOpacity={0.6}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[
                          styles.dropdownLabel,
                          state.profile.currency === item.symbol && styles.activeDropdownLabel
                        ]}>{item.name}</Text>
                        <Text style={styles.dropdownSubLabel}>{item.code} • {item.symbol}</Text>
                      </View>
                      {state.profile.currency === item.symbol && (
                        <Ionicons name="checkmark" size={18} color={colors.accent} />
                      )}
                    </TouchableOpacity>
                    {index < CURRENCIES.length - 1 && <View style={styles.dropdownDivider} />}
                  </React.Fragment>
                ))}
              </View>
            )}
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Method</Text>
          <Card style={styles.listCard}>
            <View style={{ padding: spacing.md, gap: spacing.md }}>
              <SegmentedControl 
                options={securityOptions}
                selected={currentSecurityIndex}
                onChange={handleSecurityChange}
              />
              <Text style={styles.subLabel}>
                {currentSecurityIndex === 0 && 'Security is disabled. Anyone can access your vault.'}
                {currentSecurityIndex === 1 && (state.appPin ? 'Vault protected by your unique PIN.' : 'Please set a PIN to protect your vault.')}
                {currentSecurityIndex === 2 && 'Fast access using your device biometrics.'}
              </Text>
              
              {currentSecurityIndex === 1 && state.appPin && (
                <TouchableOpacity 
                  onPress={() => router.push('/set-pin')} 
                  style={{ alignSelf: 'flex-start', marginTop: spacing.xs }}
                >
                  <Text style={[styles.actionBtnText, { color: colors.accent }]}>Change PIN</Text>
                </TouchableOpacity>
              )}
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <Card style={styles.listCard}>
            <TouchableOpacity style={styles.row} activeOpacity={0.6}>
              <Text style={styles.label}>Export Data (CSV)</Text>
              <Ionicons name="download-outline" size={18} color={colors.text.tertiary} />
            </TouchableOpacity>
            <View style={styles.divider} />
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
  sectionTitle: { ...typography.h3, color: colors.text.primary, marginLeft: spacing.xs, marginBottom: spacing.sm },
  listCard: { padding: 0, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md, paddingHorizontal: spacing.md },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.md },
  dropdownContent: { backgroundColor: colors.bg.primary + '40' },
  dropdownRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm + 4, paddingHorizontal: spacing.lg, gap: spacing.md },
  activeDropdownRow: { backgroundColor: colors.accentSoft + '20' },
  dropdownLabel: { ...typography.body, color: colors.text.secondary, fontSize: 15 },
  activeDropdownLabel: { color: colors.text.primary, fontFamily: 'Inter_600SemiBold' },
  dropdownSubLabel: { ...typography.micro, color: colors.text.tertiary, marginTop: 1 },
  dropdownDivider: { height: 1, backgroundColor: colors.border + '40', marginHorizontal: spacing.lg },
  label: { ...typography.body, color: colors.text.primary },
  subLabel: { ...typography.caption, color: colors.text.tertiary },
  value: { ...typography.body, color: colors.text.tertiary },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.bg.elevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionBtnText: {
    ...typography.caption,
    color: colors.accent,
    fontFamily: 'Inter_600SemiBold',
  },
});
