import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { colors, typography, spacing, radius } from '../../utils/theme';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

import { supabase } from '../../utils/supabase';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { dispatch } = useApp();
  const router = useRouter();

  const handleSignup = async () => {
    if (!email || !password || !name) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { data: { full_name: name } }
      });
      if (error) throw error;
      
      // Initialize profile in DB
      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          name: name,
        });
      }

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
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Centria and take control of your life</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="John Doe"
            />
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
            
            <View style={styles.terms}>
              <Text style={styles.termsText}>
                By signing up, you agree to our{' '}
                <Text style={styles.linkTextInline}>Terms of Service</Text> and{' '}
                <Text style={styles.linkTextInline}>Privacy Policy</Text>
              </Text>
            </View>

            <Button 
              title="Create Account" 
              onPress={handleSignup} 
              loading={loading}
              style={styles.signupButton} 
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.linkText}>Log In</Text>
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
    paddingTop: 20,
    paddingBottom: 40,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    marginBottom: 40,
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
  },
  form: {
    gap: 20,
  },
  terms: {
    marginTop: 8,
  },
  termsText: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  linkTextInline: {
    color: colors.accent,
    fontFamily: 'Inter_600SemiBold',
  },
  signupButton: {
    marginTop: 10,
    backgroundColor: colors.bg.header,
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
