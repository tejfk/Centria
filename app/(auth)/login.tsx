import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { colors, typography, spacing, radius } from '../../utils/theme';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

import { supabase } from '../../utils/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { dispatch } = useApp();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      dispatch({ type: 'LOGIN' });
      router.replace('/(tabs)');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Ionicons name="flash" size={32} color={colors.white} />
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue your financial journey</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="name@example.com"
              keyboardType="email-address"
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
            />
            
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <Button 
              title="Login" 
              onPress={handleLogin} 
              loading={loading}
              style={styles.loginButton} 
            />
          </View>

          <View style={styles.socialSection}>
            <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
            <View style={styles.socialButtons}>
              <TouchableOpacity style={styles.socialBtn}>
                <Ionicons name="logo-google" size={24} color={colors.text.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn}>
                <Ionicons name="logo-apple" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <Text style={styles.linkText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  content: {
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.bg.header,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    // Soft shadow for logo
    shadowColor: colors.bg.header,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    fontSize: 28,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  form: {
    gap: 20,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotText: {
    ...typography.caption,
    color: colors.accent,
    fontFamily: 'Inter_600SemiBold',
  },
  loginButton: {
    marginTop: 10,
    backgroundColor: colors.bg.header,
  },
  socialSection: {
    marginTop: 40,
    alignItems: 'center',
  },
  dividerText: {
    ...typography.micro,
    color: colors.text.tertiary,
    letterSpacing: 1.5,
    marginBottom: 24,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  socialBtn: {
    width: 100,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  footerText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  linkText: {
    ...typography.body,
    color: colors.accent,
    fontFamily: 'Inter_700Bold',
  },
});
