import { Platform } from 'react-native';

export const COLORS = {
  primary: '#FF6B00',
  primaryDark: '#E55A00',
  secondary: '#FFF0E6',
  success: '#2E7D32',
  error: '#C62828',
  warning: '#F57F17',
  white: '#FFFFFF',
  bg: '#FFF8F3',
  surface: '#FFFFFF',
  surfaceOffset: '#F5F5F5',
  border: '#E8E0D8',
  text: '#1A1A1A',
  textMuted: '#757575',
  textFaint: '#BDBDBD',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const RADIUS = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

export const SHADOW = {
  sm: Platform.select({
    web: { boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
  }),
  md: Platform.select({
    web: { boxShadow: '0 4px 12px rgba(0,0,0,0.10)' },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.10,
      shadowRadius: 12,
      elevation: 4,
    },
  }),
  lg: Platform.select({
    web: { boxShadow: '0 8px 24px rgba(0,0,0,0.12)' },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
      elevation: 8,
    },
  }),
};

export const isWeb = Platform.OS === 'web';
