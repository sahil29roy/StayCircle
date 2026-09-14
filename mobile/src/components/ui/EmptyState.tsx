import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/theme.context';
import { Text } from './Text';
import { Button } from './Button';
import { spacing } from '../../constants/spacing';

export interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionTitle?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'file-tray-outline',
  title,
  description,
  actionTitle,
  onAction,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.surfaceSubtle }]}>
        <Ionicons name={icon} size={40} color={colors.muted} />
      </View>

      <Text variant="titleSmall" style={styles.title}>
        {title}
      </Text>

      {description && (
        <Text variant="bodySmall" color="muted" align="center" style={styles.description}>
          {description}
        </Text>
      )}

      {actionTitle && onAction && (
        <Button
          title={actionTitle}
          onPress={onAction}
          variant="secondary"
          size="sm"
          fullWidth={false}
          style={styles.actionButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  iconContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  description: {
    marginBottom: spacing.lg,
    maxWidth: 260,
  },
  actionButton: {
    minWidth: 130,
  },
});

export default EmptyState;
