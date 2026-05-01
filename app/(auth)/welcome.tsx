import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, SafeAreaView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { colors, typography, spacing, radius } from '../../utils/theme';
import { Button } from '../../components/ui/Button';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Mindful Finance',
    description: 'Track your spending with a clean, royal-blue interface designed for focus and clarity.',
    icon: 'wallet-outline',
  },
  {
    id: '2',
    title: 'Local Privacy',
    description: 'Centria is account-free. Your financial data lives on your device, not in the cloud.',
    icon: 'shield-checkmark-outline',
  },
  {
    id: '3',
    title: 'Private Vault',
    description: 'Store your sensitive documents securely in an offline folder protected by your device.',
    icon: 'lock-closed-outline',
  },
  {
    id: '4',
    title: 'Terms & Policy',
    description: 'By tapping "Start My Journey", you agree to our Terms of Service and Offline-First Privacy Policy.',
    icon: 'document-text-outline',
    isFinal: true,
  },
];

export default function Welcome() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const { dispatch } = useApp();
  const router = useRouter();

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setActiveIndex(index);
  };

  const handleComplete = () => {
    dispatch({ type: 'COMPLETE_ONBOARDING' });
    router.replace('/(tabs)');
  };

  const nextSlide = () => {
    if (activeIndex < slides.length - 1) {
      scrollRef.current?.scrollTo({ x: (activeIndex + 1) * width, animated: true });
    } else {
      handleComplete();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerSpacer} />
      
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {slides.map((slide) => (
          <View key={slide.id} style={styles.slide}>
            <View style={styles.iconContainer}>
              <Ionicons name={slide.icon as any} size={60} color={colors.white} />
            </View>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.description}>{slide.description}</Text>
            
            {slide.isFinal && (
              <View style={styles.legalLinks}>
                <TouchableOpacity onPress={() => Alert.alert('Privacy Policy', 'Centria collects zero personal data. All information stays local.')}>
                  <Text style={styles.legalLinkText}>Privacy Policy</Text>
                </TouchableOpacity>
                <Text style={styles.legalDot}>•</Text>
                <TouchableOpacity onPress={() => Alert.alert('Terms', 'Usage of this app is at your own risk. Data backups are your responsibility.')}>
                  <Text style={styles.legalLinkText}>Terms of Service</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                activeIndex === i ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        <View style={styles.buttonRow}>
          {activeIndex < slides.length - 1 ? (
            <>
              <TouchableOpacity onPress={handleComplete}>
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
              <Button 
                title="Next" 
                onPress={nextSlide} 
                style={styles.nextButton} 
                textStyle={{ color: colors.bg.header }} 
              />
            </>
          ) : (
            <Button 
              title="Start My Journey" 
              onPress={handleComplete} 
              style={styles.getStartedButton} 
              textStyle={{ color: colors.bg.header }}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.header,
  },
  headerSpacer: {
    height: Platform.OS === 'ios' ? 100 : 60,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width: width,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  title: {
    ...typography.display,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 28,
  },
  description: {
    ...typography.body,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 16,
  },
  legalLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    gap: 10,
  },
  legalLinkText: {
    ...typography.caption,
    color: colors.white,
    textDecorationLine: 'underline',
    opacity: 0.8,
  },
  legalDot: {
    color: colors.white,
    opacity: 0.5,
  },
  footer: {
    paddingBottom: 60,
    paddingHorizontal: 40,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.white,
  },
  dotInactive: {
    width: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skipText: {
    ...typography.body,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'Inter_600SemiBold',
  },
  nextButton: {
    width: 120,
    backgroundColor: colors.white,
  },
  getStartedButton: {
    flex: 1,
    backgroundColor: colors.white,
  },
});
