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

export default function OwnerDashboardScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, logout } = useAuth();

  const firstName = user?.name ? user.name.split(' ')[0] : 'Owner';

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

  const statCards = [
    { label: 'My PGs', value: '1', icon: 'business-outline' as const, color: colors.primary },
    { label: 'Total Rooms', value: '4', icon: 'bed-outline' as const, color: colors.secondary },
    { label: 'Live Vacancies', value: '2', icon: 'checkmark-circle-outline' as const, color: colors.success },
    { label: 'Pending Requests', value: '1', icon: 'mail-unread-outline' as const, color: colors.warning },
  ];

  return (
    <Screen scrollable padding="lg" style={styles.screen}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.userInfoWrapper}>
          <Avatar name={user?.name || 'Owner'} size={48} />
          <View style={styles.userTextWrapper}>
            <Text variant="titleSmall" numberOfLines={1}>
              Welcome back, {firstName} 👋
            </Text>
            <Text variant="caption" color="muted">
              StayCircle Owner Portal
            </Text>
          </View>
        </View>

        <ThemeToggle />
      </View>

      {/* Owner Profile Overview Card */}
      <Card padding="md" style={styles.profileCard}>
        <View style={styles.profileHeaderRow}>
          <View style={[styles.roleBadge, { backgroundColor: colors.surfaceSubtle }]}>
            <Ionicons name="shield-checkmark" size={14} color={colors.primary} />
            <Text variant="caption" style={[styles.roleBadgeText, { color: colors.primary }]}>
              Verified PG Owner
            </Text>
          </View>
          <Text variant="caption" color="muted">
            {user?.phone || user?.email}
          </Text>
        </View>

        <Text variant="bodySmall" color="muted" style={styles.ownerEmailText}>
          Account Email: {user?.email}
        </Text>
      </Card>

      {/* Metric Cards Grid (2x2) */}
      <View style={styles.statsGrid}>
        {statCards.map((stat, idx) => (
          <Card key={idx} padding="md" style={styles.statCard}>
            <View style={styles.statHeaderRow}>
              <Text variant="caption" color="muted">
                {stat.label}
              </Text>
              <Ionicons name={stat.icon} size={20} color={stat.color} />
            </View>
            <Text variant="heading" style={[styles.statValue, { color: stat.color }]}>
              {stat.value}
            </Text>
            <Text variant="caption" color="muted" style={{ fontSize: 10 }}>
              Part 2/3 Live Integration
            </Text>
          </Card>
        ))}
      </View>

      {/* Primary Action Banner */}
      <Card padding="lg" style={[styles.actionBanner, { backgroundColor: colors.surfaceSubtle }]}>
        <View style={styles.actionBannerContent}>
          <View style={styles.actionTextWrapper}>
            <Text variant="titleSmall" style={{ marginBottom: 4 }}>
              Manage PG Properties
            </Text>
            <Text variant="bodySmall" color="muted" style={{ lineHeight: 18 }}>
              Add rooms, view occupant profiles, and accept or reject prospective student requests.
            </Text>
          </View>

          <Button
            title="Manage Listings"
            variant="primary"
            size="sm"
            fullWidth={false}
            onPress={() => {
              Alert.alert(
                'Frontend Part 2 Preview',
                'Full PG creation, room management, and join request approval screens will be connected in Frontend Part 2.'
              );
            }}
            style={styles.actionButton}
          />
        </View>
      </Card>

      {/* Placeholder Section: Recent Join Requests */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Text variant="titleSmall">Recent Join Requests</Text>
          <Text variant="caption" color="muted">
            Part 2 Preview
          </Text>
        </View>

        <Card padding="md" style={styles.requestItemCard}>
          <View style={styles.requestItemRow}>
            <Avatar name="Aman Verma" size={38} />
            <View style={styles.requestItemDetails}>
              <Text variant="bodySmall" style={{ fontWeight: '600' }}>
                Aman Verma (IIT Delhi)
              </Text>
              <Text variant="caption" color="muted">
                Requested Room 101 • 95% Compatibility
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: colors.surfaceSubtle }]}>
              <Text variant="caption" style={{ color: colors.warning, fontWeight: '600' }}>
                Pending
              </Text>
            </View>
          </View>
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
    marginBottom: 4,
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
  ownerEmailText: {
    marginTop: spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    width: '47.5%',
    minHeight: 96,
    justifyContent: 'space-between',
  },
  statHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statValue: {
    fontSize: 26,
    fontWeight: '700',
    marginVertical: 2,
  },
  actionBanner: {
    borderRadius: radius.xl,
    marginBottom: spacing.xl,
  },
  actionBannerContent: {
    gap: spacing.md,
  },
  actionTextWrapper: {},
  actionButton: {
    alignSelf: 'flex-start',
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
  requestItemCard: {
    borderRadius: radius.lg,
  },
  requestItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestItemDetails: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
  },
  logoutButton: {
    marginBottom: spacing['2xl'],
  },
});
