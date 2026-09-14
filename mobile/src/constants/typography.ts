import { TextStyle } from 'react-native';

export interface TypographyVariant {
  fontSize: number;
  lineHeight: number;
  fontWeight: TextStyle['fontWeight'];
}

export const typography: Record<string, TypographyVariant> = {
  display: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
  },
  heading: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
  },
  title: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
  },
  titleSmall: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  bodyMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  bodySmallMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
  button: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  buttonSmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
};

export default typography;
