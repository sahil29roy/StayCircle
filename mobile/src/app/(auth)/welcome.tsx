import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/theme.context';
import { Screen } from '../../components/ui/Screen';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { spacing, radius } from '../../constants/spacing';

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <Screen padding="xl" style={styles.container}>
      {/* Top Header with Theme Switcher */}
      <View style={styles.topBar}>
        <View style={styles.logoBadge}>
          <Ionicons name="home-outline" size={20} color={colors.primary} />
        </View>
        <ThemeToggle />
      </View>

      {/* Hero Visual Brand Section */}
      <View style={styles.heroSection}>
        <View
          style={[
            styles.brandIconOuter,
            { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.brandIconInner,
              { backgroundColor: colors.primary },
            ]}
          >
            <Ionicons name="people" size={36} color={colors.primaryForeground} />
          </View>
        </View>

        <Text
          variant="display"
          style={[styles.brandTitle, { color: colors.primary }]}
        >
          STAYCIRCLE
        </Text>

        <Text variant="heading" align="center" style={styles.tagline}>
          Find your stay.{'\n'}Find your circle.
        </Text>

        <Text
          variant="body"
          color="muted"
          align="center"
          style={styles.description}
        >
          Discover PGs, check real vacancies, and find a room that fits you.
        </Text>

        {/* Feature Highlights */}
        <View style={styles.featuresContainer}>
          <View
            style={[
              styles.featurePill,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Ionicons name="checkmark-circle" size={16} color={colors.secondary} />
            <Text variant="caption" style={styles.featureText}>
              Real Vacancies
            </Text>
          </View>

          <View
            style={[
              styles.featurePill,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Ionicons name="checkmark-circle" size={16} color={colors.secondary} />
            <Text variant="caption" style={styles.featureText}>
              Verified PGs
            </Text>
          </View>

          <View
            style={[
              styles.featurePill,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Ionicons name="checkmark-circle" size={16} color={colors.secondary} />
            <Text variant="caption" style={styles.featureText}>
              Roommate Matching
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsSection}>
        <Button
          title="Get Started"
          variant="primary"
          size="lg"
          onPress={() => router.push('/(auth)/role-selection')}
          style={styles.primaryButton}
        />

        <Button
          title="Log In"
          variant="outline"
          size="lg"
          onPress={() => router.push('/(auth)/login')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  logoBadge: {
    padding: 6,
  },
  heroSection: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  brandIconOuter: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  brandIconInner: {
    width: 68,
    height: 68,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    letterSpacing: 3,
    marginBottom: spacing.xs,
    fontWeight: '800',
  },
  tagline: {
    marginBottom: spacing.md,
    lineHeight: 30,
  },
  description: {
    maxWidth: 290,
    marginBottom: spacing.xl,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  featureText: {
    marginLeft: 6,
    fontWeight: '500',
  },
  actionsSection: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  primaryButton: {
    shadowColor: '#D95D39',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
});
