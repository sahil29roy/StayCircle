import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../context/theme.context';
import { Text } from './Text';
import { radius } from '../../constants/spacing';

export interface AvatarProps {
  name: string;
  size?: number;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({ name, size = 44, style }) => {
  const { colors } = useTheme();

  const getInitials = (text: string) => {
    if (!text) return '?';
    const parts = text.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const fontSize = size * 0.4;

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: radius.full,
          backgroundColor: colors.surfaceSubtle,
          borderColor: colors.border,
          borderWidth: 1,
        },
        style,
      ]}
    >
      <Text
        style={{
          fontSize,
          fontWeight: '600',
          color: colors.primary,
        }}
      >
        {getInitials(name)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Avatar;
