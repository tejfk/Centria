// Centria Design System — Refactored to Light Mode + Royal Blue

export const colors = {
  bg: {
    primary: '#F0F4F8',  // Soft cool off-white background
    card: '#FFFFFF',     // Pure white cards
    elevated: '#F8FAFC', // Slightly off-white for nested elements
    input: '#F1F5F9',    // Input fields
    header: '#2563EB',   // Vibrant Royal Blue for top headers
  },
  accent: '#3B82F6',     // Lighter bright blue for actionable items & icons
  accentSoft: 'rgba(59,130,246,0.12)',
  text: {
    primary: '#0F172A',  // Near black for high contrast
    secondary: '#64748B',// Gray for subtitles
    tertiary: '#94A3B8', // Lighter gray for dates/metadata
    inverse: '#FFFFFF',  // White text on colored backgrounds
  },
  positive: '#2563EB',   // Blue for income/positive
  negative: '#EF4444',   // Soft red for expenses
  warning: '#F59E0B',    // Orange/Yellow for alerts
  border: 'rgba(0,0,0,0.06)',
  borderActive: 'rgba(37,99,235,0.2)',
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.4)', // Softer overlay for light mode
};

export const typography = {
  display: {
    fontSize: 34,
    lineHeight: 40,
    fontFamily: 'Inter_700Bold',
  },
  h1: {
    fontSize: 24,
    lineHeight: 30,
    fontFamily: 'Inter_700Bold',
  },
  h2: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: 'Inter_600SemiBold',
  },
  h3: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'Inter_600SemiBold',
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Inter_400Regular',
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'Inter_500Medium',
  },
  micro: {
    fontSize: 10,
    lineHeight: 14,
    fontFamily: 'Inter_600SemiBold',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
} as const;

export const shadows = {
  card: {
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  elevated: {
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
  header: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
} as const;
