import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/theme.context';
import { radius } from '../../constants/spacing';

export interface IconButtonProps {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
  onPress?: () => void;
  style?: ViewStyle;
  backgroundColor?: string;
  accessibilityLabel?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  name,
  size = 22,
  color,
  onPress,
  style,
  backgroundColor,
  accessibilityLabel,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.button,
        {
          backgroundColor: backgroundColor || 'transparent',
        },
        style,
      ]}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name={name} size={size} color={color || colors.foreground} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default IconButton;
