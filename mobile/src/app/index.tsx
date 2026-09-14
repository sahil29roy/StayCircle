import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/auth.store';
import { useTheme } from '../context/theme.context';
import { Text } from '../components/ui/Text';
import { spacing } from '../constants/spacing';

export default function IndexGatekeeper() {
  const { isInitialized, isAuthenticated, user } = useAuthStore();
  const { colors } = useTheme();

  if (!isInitialized) {
    return (
      <View style={[styles.splashContainer, { backgroundColor: colors.background }]}>
        <View style={styles.brandWrapper}>
          <Text
            variant="display"
            style={[styles.brandTitle, { color: colors.primary }]}
          >
            STAYCIRCLE
          </Text>
          <Text variant="bodySmall" color="muted" align="center" style={styles.tagline}>
            Find your stay. Find your circle.
          </Text>
        </View>
        <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (user.role === 'STUDENT') {
    return <Redirect href="/(student)/home" />;
  }

  if (user.role === 'OWNER') {
    return <Redirect href="/(owner)/dashboard" />;
  }

  return <Redirect href="/(auth)/welcome" />;
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  brandWrapper: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  brandTitle: {
    letterSpacing: 2,
    fontWeight: '800',
  },
  tagline: {
    marginTop: spacing.xs,
    letterSpacing: 0.5,
  },
  loader: {
    marginTop: spacing.md,
  },
});
