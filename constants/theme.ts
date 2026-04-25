import { Platform } from 'react-native';

export const COLORS = {
  // Brand
  primary: '#FF6B00',
  primaryDark: '#E55A00',
  primaryLight: '#FF8C33',
  primaryGlow: 'rgba(255,107,0,0.15)',

  // Accent
  accent: '#FFB800',
  accentLight: 'rgba(255,184,0,0.15)',

  // Semantic
  success: '#22C55E',
  successLight: 'rgba(34,197,94,0.12)',
  error: '#EF4444',
  errorLight: 'rgba(239,68,68,0.12)',
  warning: '#F59E0B',

  // Neutrals
  white: '#FFFFFF',
  black: '#0A0A0A',

  // Backgrounds — warm cream palette
  bg: '#FFF8F2',
  bgDark: '#1A0F00',
  surface: '#FFFFFF',
  surfaceWarm: '#FFF3E8',
  surfaceOffset: '#F7F0E8',
  surfaceDark: 'rgba(255,255,255,0.06)',

  // Text
  text: '#1C1008',
  textMuted: '#7A6A58',
  textFaint: '#C4B5A0',
  textInverse: '#FFFFFF',

  // Borders
  border: 'rgba(0,0,0,0.07)',
  borderWarm: '#EDE0D0',

  // Gradients (used as arrays in LinearGradient)
  gradientPrimary: ['#FF8C33', '#FF6B00', '#E55A00'],
  gradientWarm: ['#FFF8F2', '#FFF0DC'],
  gradientCard: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.95)'],
  gradientHero: ['rgba(255,107,0,0.85)', 'rgba(229,90,0,0.95)'],
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
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 36,
  full: 9999,
};

export const SHADOW = {
  xs: Platform.select({
    web: { boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
    default: { shadowColor: '#FF6B00', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  }),
  sm: Platform.select({
    web: { boxShadow: '0 2px 8px rgba(255,107,0,0.08), 0 1px 2px rgba(0,0,0,0.04)' },
    default: { shadowColor: '#FF6B00', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 8, elevation: 3 },
  }),
  md: Platform.select({
    web: { boxShadow: '0 4px 16px rgba(255,107,0,0.12), 0 2px 4px rgba(0,0,0,0.06)' },
    default: { shadowColor: '#FF6B00', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.14, shadowRadius: 16, elevation: 6 },
  }),
  lg: Platform.select({
    web: { boxShadow: '0 8px 32px rgba(255,107,0,0.18), 0 2px 8px rgba(0,0,0,0.08)' },
    default: { shadowColor: '#FF6B00', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.20, shadowRadius: 32, elevation: 12 },
  }),
  glow: Platform.select({
    web: { boxShadow: '0 0 24px rgba(255,107,0,0.35)' },
    default: { shadowColor: '#FF6B00', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.35, shadowRadius: 24, elevation: 10 },
  }),
};

export const TYPOGRAPHY = {
  hero: { fontSize: 32, fontWeight: '900' as const, letterSpacing: -0.8, lineHeight: 38 },
  h1: { fontSize: 26, fontWeight: '800' as const, letterSpacing: -0.5, lineHeight: 32 },
  h2: { fontSize: 20, fontWeight: '800' as const, letterSpacing: -0.3, lineHeight: 26 },
  h3: { fontSize: 17, fontWeight: '700' as const, letterSpacing: -0.2, lineHeight: 22 },
  h4: { fontSize: 15, fontWeight: '700' as const, letterSpacing: -0.1, lineHeight: 20 },
  body: { fontSize: 14, fontWeight: '400' as const, lineHeight: 22 },
  bodyMd: { fontSize: 15, fontWeight: '500' as const, lineHeight: 22 },
  caption: { fontSize: 12, fontWeight: '500' as const, letterSpacing: 0.1, lineHeight: 16 },
  label: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 0.8 },
  price: { fontSize: 18, fontWeight: '800' as const, letterSpacing: -0.3 },
};

export const isWeb = Platform.OS === 'web';
