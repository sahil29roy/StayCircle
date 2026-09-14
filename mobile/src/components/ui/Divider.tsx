import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../context/theme.context';
import { spacing } from '../../constants/spacing';

export interface DividerProps {
  style?: ViewStyle;
  vertical?: boolean;
}

export const Divider: React.FC<DividerProps> = ({ style, vertical = false }) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        vertical
          ? { width: 1, height: '100%', marginHorizontal: spacing.sm }
          : { height: 1, width: '100%', marginVertical: spacing.md },
        { backgroundColor: colors.border },
        style,
      ]}
    />
  );
};

export default Divider;
