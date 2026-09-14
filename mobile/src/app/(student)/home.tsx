import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/theme.context';
import { useAuth } from '../../hooks/useAuth';
import { Screen } from '../../components/ui/Screen';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { Divider } from '../../components/ui/Divider';
import { spacing, radius } from '../../constants/spacing';
import { StudentProfile } from '../../types/user';

export default function StudentHomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, logout } = useAuth();

  const studentProfile = user?.profile as StudentProfile | undefined;
  const firstName = user?.name ? user.name.split(' ')[0] : 'Student';

  const handleLogout = async () => {
    Alert.alert('Log Out', 'Are you sure you want to log out from StayCircle?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  };

  return (
    <Screen scrollable padding="lg" style={styles.screen}>
      {/* Top Profile & Theme Header */}
      <View style={styles.topHeader}>
        <View style={styles.userInfoWrapper}>
          <Avatar name={user?.name || 'Student'} size={48} />
          <View style={styles.userTextWrapper}>
            <Text variant="titleSmall" numberOfLines={1}>
              Hello, {firstName} 👋
            </Text>
            <Text variant="caption" color="muted">
              Find a place that feels right.
            </Text>
          </View>
        </View>

        <ThemeToggle />
      </View>

      {/* Student Profile Overview Card */}
      <Card padding="md" style={styles.profileCard}>
        <View style={styles.profileHeaderRow}>
          <View style={[styles.roleBadge, { backgroundColor: colors.surfaceSubtle }]}>
            <Ionicons name="school" size={14} color={colors.primary} />
            <Text variant="caption" style={[styles.roleBadgeText, { color: colors.primary }]}>
              Verified Student
            </Text>
          </View>
          <Text variant="caption" color="muted">
            {user?.email}
          </Text>
        </View>

        {studentProfile && (
          <View style={styles.studentMetaRow}>
            <View style={styles.metaItem}>
              <Text variant="caption" color="muted">
                College
              </Text>
              <Text variant="bodySmall" numberOfLines={1} style={styles.metaValue}>
                {studentProfile.college || 'Not set'}
              </Text>
            </View>

            <View style={styles.metaItem}>
              <Text variant="caption" color="muted">
                Course
              </Text>
              <Text variant="bodySmall" numberOfLines={1} style={styles.metaValue}>
                {studentProfile.course || 'Not set'}
              </Text>
            </View>

            <View style={styles.metaItem}>
              <Text variant="caption" color="muted">
                Year
              </Text>
              <Text variant="bodySmall" style={styles.metaValue}>
                Year {studentProfile.year || '1'}
              </Text>
            </View>
          </View>
        )}
      </Card>

      {/* Main CTA Banner */}
      <Card
        padding="lg"
        style={[styles.ctaBanner, { backgroundColor: colors.primary }]}
      >
        <View style={styles.ctaContent}>
          <View style={styles.ctaTextSection}>
            <Text
              variant="title"
              style={{ color: colors.primaryForeground, marginBottom: 4 }}
            >
              Explore Verified PGs
            </Text>
            <Text
              variant="bodySmall"
              style={{ color: colors.primaryForeground, opacity: 0.9, lineHeight: 18 }}
            >
              Search by college, view live vacancies, and compare roommate compatibility.
            </Text>
          </View>

          <Button
            title="Explore PGs"
            variant="secondary"
            size="sm"
            fullWidth={false}
            onPress={() => {
              Alert.alert(
                'Frontend Part 2 Preview',
                'Live PG search, room vacancy cards, and roommate matching will be connected in Frontend Part 2.'
              );
            }}
            style={styles.ctaButton}
          />
        </View>
      </Card>

      {/* Placeholder Section 1: Nearby PGs */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Text variant="titleSmall">Nearby PGs</Text>
          <Text variant="caption" color="muted">
            Part 2 Preview
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {[1, 2, 3].map((item) => (
            <Card key={item} padding="md" style={styles.placeholderCard}>
              <View
                style={[
                  styles.imagePlaceholder,
                  { backgroundColor: colors.surfaceSubtle },
                ]}
              >
                <Ionicons name="business-outline" size={28} color={colors.muted} />
              </View>
              <Text variant="bodySmall" style={styles.cardTitleText}>
                {item === 1 ? 'Sunrise Boys PG' : item === 2 ? 'Greenview Residency' : 'Campus Corner PG'}
              </Text>
              <Text variant="caption" color="muted">
                {item === 1 ? '2 Vacancies • ₹7,500/mo' : item === 2 ? '1 Vacancy • ₹8,000/mo' : '4 Vacancies • ₹6,500/mo'}
              </Text>
            </Card>
          ))}
        </ScrollView>
      </View>

      {/* Placeholder Section 2: Roommate Matching */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Text variant="titleSmall">Roommate Compatibility</Text>
          <Text variant="caption" color="muted">
            Matching Algorithm
          </Text>
        </View>

        <Card padding="md">
          <View style={styles.matchingPreviewRow}>
            <View
              style={[
                styles.matchScoreBadge,
                { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
              ]}
            >
              <Text variant="title" style={{ color: colors.primary, fontWeight: '700' }}>
                95%
              </Text>
              <Text variant="caption" color="muted">
                Match
              </Text>
            </View>

            <View style={styles.matchingInfo}>
              <Text variant="bodySmall" style={{ fontWeight: '600' }}>
                Compatible Roommate Preview
              </Text>
              <Text variant="caption" color="muted" style={{ marginTop: 2 }}>
                Budget, food, lifestyle, and study habits matched deterministically.
              </Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Placeholder Section 3: Join Requests */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Text variant="titleSmall">Your Join Requests</Text>
          <Text variant="caption" color="muted">
            Live Status
          </Text>
        </View>

        <Card padding="md" style={styles.emptyRequestsCard}>
          <Ionicons name="paper-plane-outline" size={32} color={colors.muted} />
          <Text variant="bodySmall" color="muted" style={{ marginTop: spacing.xs }}>
            No pending join requests currently.
          </Text>
        </Card>
      </View>

      <Divider style={{ marginVertical: spacing.xl }} />

      {/* Logout Button */}
      <Button
        title="Log Out"
        variant="outline"
        size="md"
        onPress={handleLogout}
        style={styles.logoutButton}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  userInfoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userTextWrapper: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  profileCard: {
    marginBottom: spacing.lg,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
  },
  roleBadgeText: {
    marginLeft: 4,
    fontWeight: '600',
  },
  studentMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  metaItem: {
    flex: 1,
  },
  metaValue: {
    fontWeight: '500',
    marginTop: 1,
  },
  ctaBanner: {
    borderRadius: radius.xl,
    marginBottom: spacing.xl,
  },
  ctaContent: {
    gap: spacing.md,
  },
  ctaTextSection: {},
  ctaButton: {
    alignSelf: 'flex-start',
    minWidth: 120,
  },
  sectionContainer: {
    marginBottom: spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  horizontalScroll: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  placeholderCard: {
    width: 200,
    marginRight: spacing.md,
  },
  imagePlaceholder: {
    height: 90,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  cardTitleText: {
    fontWeight: '600',
    marginBottom: 2,
  },
  matchingPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchScoreBadge: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  matchingInfo: {
    flex: 1,
  },
  emptyRequestsCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  logoutButton: {
    marginBottom: spacing['2xl'],
  },
});
