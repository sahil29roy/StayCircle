import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/theme.context';
import { Text } from './Text';
import { IconButton } from './IconButton';
import { spacing } from '../../constants/spacing';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightElement?: React.ReactNode;
  style?: ViewStyle;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = true,
  onBack,
  rightElement,
  style,
}) => {
  const router = useRouter();
  const { colors } = useTheme();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.container, { borderBottomColor: colors.border }, style]}>
      <View style={styles.leftSection}>
        {showBack && (
          <IconButton
            name="arrow-back"
            size={22}
            color={colors.foreground}
            onPress={handleBack}
            style={styles.backButton}
            accessibilityLabel="Go back"
          />
        )}
        <View style={styles.titleWrapper}>
          {title && (
            <Text variant="title" numberOfLines={1}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text variant="caption" color="muted" numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {rightElement && <View style={styles.rightSection}>{rightElement}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    minHeight: 52,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: spacing.sm,
  },
  titleWrapper: {
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default Header;
