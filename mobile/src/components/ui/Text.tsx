import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle } from 'react-native';
import { useTheme } from '../../context/theme.context';
import { typography } from '../../constants/typography';

export interface TextProps extends RNTextProps {
  variant?:
    | 'display'
    | 'heading'
    | 'title'
    | 'titleSmall'
    | 'body'
    | 'bodyMedium'
    | 'bodySmall'
    | 'bodySmallMedium'
    | 'caption'
    | 'button'
    | 'buttonSmall'
    | 'label';
  color?: 'primary' | 'secondary' | 'foreground' | 'muted' | 'error' | 'success' | 'warning' | string;
  align?: TextStyle['textAlign'];
}

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  color = 'foreground',
  align,
  style,
  children,
  ...rest
}) => {
  const { colors } = useTheme();

  const getResolvedColor = () => {
    switch (color) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.secondary;
      case 'foreground':
        return colors.foreground;
      case 'muted':
        return colors.muted;
      case 'error':
        return colors.error;
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      default:
        return color;
    }
  };

  const variantStyle = typography[variant] || typography.body;

  return (
    <RNText
      style={[
        variantStyle,
        { color: getResolvedColor() },
        align ? { textAlign: align } : undefined,
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
};

export default Text;
