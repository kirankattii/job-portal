/**
 * Modern Design Tokens System
 * Centralized design system tokens for consistent UI development
 */

// Color System
export const colors = {
  // Primary Colors
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },
  
  // Secondary Colors
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },
  
  // Accent Colors
  accent: {
    50: '#fef7ff',
    100: '#fceeff',
    200: '#f8ddff',
    300: '#f2bbff',
    400: '#e879f9',
    500: '#d946ef',
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
    950: '#4a044e',
  },
  
  // Neutral Colors
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },
  
  // Semantic Colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },
  
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },
  
  info: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },
}

// Typography Scale
export const typography = {
  fontFamily: {
    sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
    serif: ['Georgia', 'ui-serif', 'serif'],
    mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
    display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  },
  
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],
    sm: ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.025em' }],
    base: ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],
    lg: ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.025em' }],
    xl: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.025em' }],
    '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.025em' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.025em' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.025em' }],
    '5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
    '6xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
    '7xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
    '8xl': ['6rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
    '9xl': ['8rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
  },
  
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
}

// Spacing System (4px base unit)
export const spacing = {
  0: '0px',
  0.5: '0.125rem', // 2px
  1: '0.25rem',    // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem',     // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem',    // 12px
  3.5: '0.875rem', // 14px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  7: '1.75rem',    // 28px
  8: '2rem',       // 32px
  9: '2.25rem',    // 36px
  10: '2.5rem',    // 40px
  11: '2.75rem',   // 44px
  12: '3rem',      // 48px
  14: '3.5rem',    // 56px
  16: '4rem',      // 64px
  18: '4.5rem',    // 72px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  28: '7rem',      // 112px
  32: '8rem',      // 128px
  36: '9rem',      // 144px
  40: '10rem',     // 160px
  44: '11rem',     // 176px
  48: '12rem',     // 192px
  52: '13rem',     // 208px
  56: '14rem',     // 224px
  60: '15rem',     // 240px
  64: '16rem',     // 256px
  72: '18rem',     // 288px
  80: '20rem',     // 320px
  88: '22rem',     // 352px
  96: '24rem',     // 384px
  128: '32rem',    // 512px
  144: '36rem',    // 576px
  160: '40rem',    // 640px
  176: '44rem',    // 704px
  192: '48rem',    // 768px
  208: '52rem',    // 832px
  224: '56rem',    // 896px
  240: '60rem',    // 960px
  256: '64rem',    // 1024px
  288: '72rem',    // 1152px
  320: '80rem',    // 1280px
  384: '96rem',    // 1536px
}

// Border Radius Scale
export const borderRadius = {
  none: '0px',
  sm: '0.125rem',   // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  '4xl': '2rem',    // 32px
  '5xl': '2.5rem',  // 40px
  '6xl': '3rem',    // 48px
  full: '9999px',
}

// Shadow Scale
export const shadows = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  DEFAULT: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none',
  // Custom shadows
  soft: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
  medium: '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  hard: '0 10px 40px -10px rgba(0, 0, 0, 0.2), 0 2px 10px -2px rgba(0, 0, 0, 0.1)',
  glow: '0 0 20px rgba(14, 165, 233, 0.5)',
  'glow-lg': '0 0 40px rgba(14, 165, 233, 0.3)',
  'glow-success': '0 0 20px rgba(34, 197, 94, 0.5)',
  'glow-error': '0 0 20px rgba(239, 68, 68, 0.5)',
  'glow-warning': '0 0 20px rgba(245, 158, 11, 0.5)',
}

// Animation Timing Functions
export const timingFunctions = {
  linear: 'linear',
  ease: 'ease',
  'ease-in': 'ease-in',
  'ease-out': 'ease-out',
  'ease-in-out': 'ease-in-out',
  'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  'bounce-out': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  'ease-in-expo': 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
  'ease-out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
  'ease-in-out-expo': 'cubic-bezier(1, 0, 0, 1)',
  'ease-in-circ': 'cubic-bezier(0.6, 0.04, 0.98, 0.34)',
  'ease-out-circ': 'cubic-bezier(0.08, 0.82, 0.17, 1)',
  'ease-in-out-circ': 'cubic-bezier(0.85, 0, 0.15, 1)',
  'ease-in-back': 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
  'ease-out-back': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  'ease-in-out-back': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
}

// Animation Durations
export const durations = {
  75: '75ms',
  100: '100ms',
  150: '150ms',
  200: '200ms',
  300: '300ms',
  500: '500ms',
  700: '700ms',
  1000: '1000ms',
  1500: '1500ms',
  2000: '2000ms',
  3000: '3000ms',
}

// Z-Index Scale
export const zIndex = {
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  60: '60',
  70: '70',
  80: '80',
  90: '90',
  100: '100',
  auto: 'auto',
  modal: '1000',
  popover: '1010',
  tooltip: '1020',
  toast: '1030',
  overlay: '1040',
  max: '2147483647',
}

// Breakpoints
export const breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  '3xl': '1600px',
  '4xl': '1920px',
}

// Aspect Ratios
export const aspectRatios = {
  auto: 'auto',
  square: '1 / 1',
  video: '16 / 9',
  photo: '4 / 3',
  golden: '1.618 / 1',
  portrait: '3 / 4',
  landscape: '4 / 3',
  wide: '21 / 9',
  ultrawide: '32 / 9',
}

// Component-specific tokens
export const components = {
  button: {
    height: {
      sm: '2rem',    // 32px
      md: '2.5rem',  // 40px
      lg: '3rem',    // 48px
      xl: '3.5rem',  // 56px
    },
    padding: {
      sm: '0.5rem 1rem',
      md: '0.75rem 1.5rem',
      lg: '1rem 2rem',
      xl: '1.25rem 2.5rem',
    },
    borderRadius: {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
    },
  },
  
  input: {
    height: {
      sm: '2rem',
      md: '2.5rem',
      lg: '3rem',
    },
    padding: {
      sm: '0.5rem 0.75rem',
      md: '0.75rem 1rem',
      lg: '1rem 1.25rem',
    },
  },
  
  card: {
    padding: {
      sm: '1rem',
      md: '1.5rem',
      lg: '2rem',
      xl: '2.5rem',
    },
    borderRadius: {
      sm: '0.5rem',
      md: '0.75rem',
      lg: '1rem',
      xl: '1.5rem',
    },
  },
  
  modal: {
    maxWidth: {
      sm: '24rem',   // 384px
      md: '32rem',   // 512px
      lg: '48rem',   // 768px
      xl: '64rem',   // 1024px
      '2xl': '80rem', // 1280px
    },
  },
}

// Dark mode color overrides
export const darkModeColors = {
  surface: {
    primary: 'hsl(222, 84%, 5%)',
    secondary: 'hsl(222, 84%, 8%)',
    tertiary: 'hsl(222, 84%, 12%)',
    elevated: 'hsl(222, 84%, 15%)',
  },
  text: {
    primary: 'hsl(210, 40%, 98%)',
    secondary: 'hsl(210, 40%, 80%)',
    tertiary: 'hsl(210, 40%, 60%)',
    inverse: 'hsl(222, 84%, 5%)',
  },
  border: {
    primary: 'hsl(222, 84%, 20%)',
    secondary: 'hsl(222, 84%, 15%)',
    focus: 'hsl(217, 91%, 60%)',
  },
}

// Export all tokens as a single object
export const designTokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  timingFunctions,
  durations,
  zIndex,
  breakpoints,
  aspectRatios,
  components,
  darkModeColors,
}

export default designTokens
