import React, { useState } from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../context/theme.context';
import { Text } from './Text';
import { spacing, radius } from '../../constants/spacing';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftElement,
  rightElement,
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...rest
}) => {
  const { colors, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const borderColor = error
    ? colors.error
    : isFocused
    ? colors.primary
    : colors.border;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text variant="label" style={styles.label}>
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: isDark ? colors.surface : colors.surface,
            borderColor,
          },
        ]}
      >
        {leftElement && <View style={styles.leftElement}>{leftElement}</View>}

        <TextInput
          style={[
            styles.input,
            {
              color: colors.foreground,
            },
            style,
          ]}
          placeholderTextColor={colors.muted}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />

        {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
      </View>

      {error ? (
        <Text variant="caption" color="error" style={styles.helperText}>
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" color="muted" style={styles.helperText}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: spacing.sm,
  },
  leftElement: {
    marginRight: spacing.sm,
  },
  rightElement: {
    marginLeft: spacing.sm,
  },
  helperText: {
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});

export default Input;
