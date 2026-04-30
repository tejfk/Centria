import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../../context/AppContext';
import { colors, typography, spacing, radius } from '../../utils/theme';
import { Button } from '../../components/ui/Button';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Financial Intelligence',
    description: 'Track every peso with our clean, automated daily snapshot system.',
    icon: '💰',
  },
  {
    id: '2',
    title: 'Subscription Control',
    description: 'Never pay for a forgotten trial again. Manage everything in one place.',
    icon: '📋',
  },
  {
    id: '3',
    title: 'Secure Vault',
    description: 'Store your IDs, receipts, and contracts in a highly secure, offline vault.',
    icon: '🔒',
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
    router.push('/login');
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
              <Text style={styles.icon}>{slide.icon}</Text>
            </View>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.description}>{slide.description}</Text>
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
              <Button title="Next" onPress={nextSlide} style={styles.nextButton} />
            </>
          ) : (
            <Button title="Get Started" onPress={handleComplete} style={styles.getStartedButton} />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.header, // Royal Blue theme for onboarding
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
  icon: {
    fontSize: 60,
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
