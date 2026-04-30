import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
import { colors, typography } from '../../utils/theme';
import { FAB } from '../../components/ui/FAB';

export default function TabLayout() {
  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.text.tertiary,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarItemStyle: styles.tabBarItem,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="subscriptions"
          options={{
            title: 'Subs',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="card" size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="reminders"
          options={{
            title: 'Remind',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="notifications" size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="vault"
          options={{
            title: 'Vault',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="folder" size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={22} color={color} />
            ),
          }}
        />
      </Tabs>
      <FAB />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  tabBar: {
    backgroundColor: colors.bg.card,
    borderTopWidth: 0,
    height: Platform.OS === 'web' ? 70 : 85,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'web' ? 10 : 25,
    elevation: 20,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  tabBarLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    marginTop: 2,
  },
  tabBarItem: {
    gap: 2,
  },
});
