// ─── Dal Bhaffle × SwiggyUI Design Tokens ───────────────────────────────────
// Ported from vinothvino42/SwiggyUI app_colors.dart
// swiggyOrange → Colors.orange[900]     → #E65100
// darkOrange   → Colors.deepOrange[800] → #BF360C
// Mapped to Dal Bhaffle brand palette

export const SWIGGY_COLORS = {
  // Primary brand — Dal Bhaffle orange (darkOrange equivalent)
  primary:       '#C8420F',
  primaryDark:   '#A0330A',    // pressed / active state
  primaryLight:  '#E8651A',    // swiggyOrange equivalent
  primaryGlow:   '#FFF0E8',    // highlight / badge bg

  // Greens — qty steppers, veg badge, success
  vegGreen:      '#2ECC71',
  stepperBorder: '#2ECC71',
  success:       '#1A7D4A',

  // Surfaces
  bg:            '#FFF8F0',    // warm off-white
  surface:       '#FFFFFF',
  surfaceOffset: '#F5F0EB',
  divider:       '#EEE8E0',

  // Text
  text:          '#1A1A1A',
  textMuted:     '#666666',
  textFaint:     '#AAAAAA',
  white:         '#FFFFFF',

  // Extras
  error:         '#E53935',
  errorLight:    '#FFEBEE',
  black:         '#000000',
} as const;

// ─── SwiggyUI Spacing (mirrors UIHelper values) ───────────────────────────────
export const SWIGGY_SPACING = {
  xs:   4,
  sm:   8,
  md:   12,
  base: 16,
  lg:   20,
  xl:   24,
  xxl:  32,
} as const;

// ─── Swiggy-style radius ──────────────────────────────────────────────────────
export const SWIGGY_RADIUS = {
  sm:   4,
  md:   8,
  lg:   12,
  xl:   16,
  xxl:  24,
  full: 9999,
} as const;
