import React from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../context/theme.context';
import { Text } from './Text';
import { spacing } from '../../constants/spacing';

export interface LoadingProps {
  message?: string;
  size?: 'small' | 'large';
  style?: ViewStyle;
}

export const Loading: React.FC<LoadingProps> = ({
  message,
  size = 'large',
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={colors.primary} />
      {message && (
        <Text variant="bodySmall" color="muted" style={styles.message}>
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  message: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
});

export default Loading;
