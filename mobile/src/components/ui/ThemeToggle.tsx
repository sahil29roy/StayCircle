import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeMode } from '../../context/theme.context';
import { Text } from './Text';
import { spacing, radius } from '../../constants/spacing';

export interface ThemeToggleProps {
  style?: ViewStyle;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ style }) => {
  const { mode, setMode, colors } = useTheme();

  const options: { key: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'light', label: 'Light', icon: 'sunny-outline' },
    { key: 'system', label: 'System', icon: 'phone-portrait-outline' },
    { key: 'dark', label: 'Dark', icon: 'moon-outline' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }, style]}>
      {options.map((opt) => {
        const isSelected = mode === opt.key;
        return (
          <TouchableOpacity
            key={opt.key}
            onPress={() => setMode(opt.key)}
            style={[
              styles.option,
              isSelected && [
                styles.selectedOption,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ],
            ]}
          >
            <Ionicons
              name={opt.icon}
              size={16}
              color={isSelected ? colors.primary : colors.muted}
            />
            <Text
              variant="caption"
              style={[
                styles.label,
                { color: isSelected ? colors.primary : colors.muted, fontWeight: isSelected ? '600' : '400' },
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: radius.full,
    borderWidth: 1,
    padding: 3,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm + 4,
    borderRadius: radius.full,
  },
  selectedOption: {
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  label: {
    marginLeft: 4,
  },
});

export default ThemeToggle;
