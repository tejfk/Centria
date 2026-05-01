import React, { useEffect, useState } from 'react';
import { View, StyleSheet, AppState, AppStateStatus, Image } from 'react-native';
import { colors } from '../../utils/theme';
import { Ionicons } from '@expo/vector-icons';

export function SecurityShield({ children }: { children: React.ReactNode }) {
  const [shouldShield, setShouldShield] = useState(false);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      // Shield the app when it's not active (background or inactive)
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        setShouldShield(true);
      } else if (nextAppState === 'active') {
        setShouldShield(false);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  if (shouldShield) {
    return (
      <View style={styles.shieldContainer}>
        <View style={styles.logoContainer}>
          <Ionicons name="shield-checkmark" size={80} color={colors.white} />
        </View>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  shieldContainer: {
    flex: 1,
    backgroundColor: colors.bg.header, // Royal Blue shield
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    opacity: 0.5,
  },
});
