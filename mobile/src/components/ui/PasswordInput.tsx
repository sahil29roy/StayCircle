import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input, InputProps } from './Input';
import { useTheme } from '../../context/theme.context';

export interface PasswordInputProps extends Omit<InputProps, 'secureTextEntry' | 'rightElement'> {}

export const PasswordInput: React.FC<PasswordInputProps> = (props) => {
  const [showPassword, setShowPassword] = useState(false);
  const { colors } = useTheme();

  return (
    <Input
      {...props}
      secureTextEntry={!showPassword}
      rightElement={
        <TouchableOpacity
          onPress={() => setShowPassword((prev) => !prev)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.eyeButton}
          accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
        >
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={colors.muted}
          />
        </TouchableOpacity>
      }
    />
  );
};

const styles = StyleSheet.create({
  eyeButton: {
    padding: 4,
  },
});

export default PasswordInput;
