import React from 'react';
import {
  Pressable,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  PressableStateCallbackType,
} from 'react-native';
import { useTheme } from '../../context/theme.context';
import { Text } from './Text';
import { spacing, radius } from '../../constants/spacing';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  fullWidth = true,
}) => {
  const { colors } = useTheme();

  const getContainerStyle = (pressed: boolean): ViewStyle => {
    const base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
      opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
      transform: [{ scale: pressed && !disabled && !loading ? 0.98 : 1 }],
      alignSelf: fullWidth ? 'stretch' : 'flex-start',
    };

    // Size padding
    if (size === 'sm') {
      base.paddingVertical = spacing.sm;
      base.paddingHorizontal = spacing.md;
    } else if (size === 'lg') {
      base.paddingVertical = spacing.lg;
      base.paddingHorizontal = spacing.xl;
    } else {
      base.paddingVertical = spacing.md;
      base.paddingHorizontal = spacing.lg;
    }

    // Variant colors
    switch (variant) {
      case 'primary':
        base.backgroundColor = colors.primary;
        break;
      case 'secondary':
        base.backgroundColor = colors.secondary;
        break;
      case 'outline':
        base.backgroundColor = 'transparent';
        base.borderWidth = 1.5;
        base.borderColor = colors.border;
        break;
      case 'ghost':
        base.backgroundColor = 'transparent';
        break;
      case 'danger':
        base.backgroundColor = colors.error;
        break;
    }

    return base;
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'primary':
        return colors.primaryForeground;
      case 'secondary':
        return colors.secondaryForeground;
      case 'outline':
        return colors.foreground;
      case 'ghost':
        return colors.foreground;
      case 'danger':
        return '#FFFFFF';
    }
  };

  const textVariant = size === 'sm' ? 'buttonSmall' : 'button';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }: PressableStateCallbackType) => [
        getContainerStyle(pressed),
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={getTextColor()}
          style={styles.spinner}
        />
      ) : (
        <>
          {leftIcon && <>{leftIcon}</>}
          <Text
            variant={textVariant}
            style={[
              { color: getTextColor() },
              leftIcon ? { marginLeft: spacing.sm } : undefined,
              rightIcon ? { marginRight: spacing.sm } : undefined,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon && <>{rightIcon}</>}
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  spinner: {
    marginVertical: 2,
  },
});

export default Button;
