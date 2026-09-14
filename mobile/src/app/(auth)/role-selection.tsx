import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/theme.context';
import { Screen } from '../../components/ui/Screen';
import { Header } from '../../components/ui/Header';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { spacing, radius } from '../../constants/spacing';
import { UserRole } from '../../types/user';

export default function RoleSelectionScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [selectedRole, setSelectedRole] = useState<UserRole>('STUDENT');

  const handleContinue = () => {
    router.push({
      pathname: '/(auth)/register',
      params: { role: selectedRole },
    });
  };

  return (
    <Screen padding="none" style={styles.screen}>
      <Header />

      <View style={styles.content}>
        <View style={styles.headerTextContainer}>
          <Text variant="heading" style={styles.title}>
            Join StayCircle
          </Text>
          <Text variant="body" color="muted">
            Select how you would like to use the platform.
          </Text>
        </View>

        {/* Role Cards */}
        <View style={styles.cardsContainer}>
          {/* Student Card */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSelectedRole('STUDENT')}
          >
            <Card
              padding="lg"
              style={[
                styles.roleCard,
                selectedRole === 'STUDENT' && {
                  borderColor: colors.primary,
                  borderWidth: 2,
                  backgroundColor: colors.surface,
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.roleIconBadge,
                    {
                      backgroundColor:
                        selectedRole === 'STUDENT' ? colors.primary : colors.surfaceSubtle,
                    },
                  ]}
                >
                  <Ionicons
                    name="school-outline"
                    size={24}
                    color={
                      selectedRole === 'STUDENT'
                        ? colors.primaryForeground
                        : colors.foreground
                    }
                  />
                </View>

                <View
                  style={[
                    styles.radioIndicator,
                    { borderColor: colors.border },
                    selectedRole === 'STUDENT' && {
                      borderColor: colors.primary,
                      backgroundColor: colors.primary,
                    },
                  ]}
                >
                  {selectedRole === 'STUDENT' && (
                    <Ionicons name="checkmark" size={14} color="#FFF" />
                  )}
                </View>
              </View>

              <Text variant="titleSmall" style={styles.cardTitle}>
                I am a Student
              </Text>

              <Text variant="bodySmall" color="muted" style={styles.cardDescription}>
                Find a PG, explore real-time room vacancies, and connect with compatible roommates.
              </Text>
            </Card>
          </TouchableOpacity>

          {/* Owner Card */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSelectedRole('OWNER')}
          >
            <Card
              padding="lg"
              style={[
                styles.roleCard,
                selectedRole === 'OWNER' && {
                  borderColor: colors.primary,
                  borderWidth: 2,
                  backgroundColor: colors.surface,
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.roleIconBadge,
                    {
                      backgroundColor:
                        selectedRole === 'OWNER' ? colors.primary : colors.surfaceSubtle,
                    },
                  ]}
                >
                  <Ionicons
                    name="business-outline"
                    size={24}
                    color={
                      selectedRole === 'OWNER'
                        ? colors.primaryForeground
                        : colors.foreground
                    }
                  />
                </View>

                <View
                  style={[
                    styles.radioIndicator,
                    { borderColor: colors.border },
                    selectedRole === 'OWNER' && {
                      borderColor: colors.primary,
                      backgroundColor: colors.primary,
                    },
                  ]}
                >
                  {selectedRole === 'OWNER' && (
                    <Ionicons name="checkmark" size={14} color="#FFF" />
                  )}
                </View>
              </View>

              <Text variant="titleSmall" style={styles.cardTitle}>
                I am a PG Owner
              </Text>

              <Text variant="bodySmall" color="muted" style={styles.cardDescription}>
                List your PGs, manage rooms and vacancies, and review student join requests.
              </Text>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Footer CTA */}
        <View style={styles.footer}>
          <Button
            title="Continue"
            variant="primary"
            size="lg"
            onPress={handleContinue}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  headerTextContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    marginBottom: spacing.xs,
  },
  cardsContainer: {
    gap: spacing.lg,
    flex: 1,
  },
  roleCard: {
    borderRadius: radius.xl,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  roleIconBadge: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioIndicator: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    marginBottom: spacing.xs,
  },
  cardDescription: {
    lineHeight: 20,
  },
  footer: {
    marginTop: spacing.xl,
  },
});
