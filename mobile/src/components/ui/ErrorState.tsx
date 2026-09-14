import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/theme.context';
import { Text } from './Text';
import { Button } from './Button';
import { spacing } from '../../constants/spacing';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.surfaceSubtle }]}>
        <Ionicons name="alert-circle-outline" size={44} color={colors.error} />
      </View>

      <Text variant="titleSmall" style={styles.title}>
        {title}
      </Text>

      <Text variant="bodySmall" color="muted" align="center" style={styles.message}>
        {message}
      </Text>

      {onRetry && (
        <Button
          title="Try Again"
          onPress={onRetry}
          variant="outline"
          size="sm"
          fullWidth={false}
          style={styles.retryButton}
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
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  message: {
    marginBottom: spacing.lg,
    maxWidth: 280,
  },
  retryButton: {
    minWidth: 120,
  },
});

export default ErrorState;
