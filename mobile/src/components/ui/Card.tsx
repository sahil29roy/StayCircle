import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, Pressable, Platform } from 'react-native';
import { useTheme } from '../../context/theme.context';
import { spacing, radius } from '../../constants/spacing';

export interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  padding?: keyof typeof spacing;
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  padding = 'lg',
  elevated = false,
}) => {
  const { colors, isDark } = useTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing[padding],
    ...(elevated
      ? Platform.select({
          ios: {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0.3 : 0.06,
            shadowRadius: 6,
          },
          android: {
            elevation: isDark ? 2 : 2,
          },
        })
      : {}),
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          cardStyle,
          { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] },
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
};

export default Card;
