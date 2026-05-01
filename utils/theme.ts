// Centria Design System — Light Blue Luxury (High-End Fintech)

export const colors = {
  bg: {
    primary: '#F4F7FB',  // Soft Ice Blue background
    card: '#FFFFFF',     // Pure White
    elevated: '#F9FAFC', // Very subtle off-white for nested
    input: '#F1F5F9',    // Light slate input
    header: '#E8F0FE',   // Slightly deeper icy blue for header distinction
  },
  accent: '#0284C7',     // Sapphire / Ocean Blue
  accentSoft: 'rgba(2, 132, 199, 0.12)', // Sapphire tint
  text: {
    primary: '#0F172A',  // Deep Navy / Slate (Luxury Contrast)
    secondary: '#475569',// Muted Slate
    tertiary: '#94A3B8', // Light Slate
    inverse: '#FFFFFF',  // White
  },
  positive: '#10B981',   // Mint/Emerald Green
  negative: '#F43F5E',   // Soft Coral/Rose
  warning: '#F59E0B',    // Amber
  border: 'rgba(15, 23, 42, 0.06)', // Very subtle navy border
  borderActive: 'rgba(2, 132, 199, 0.3)', // Sapphire glow
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(244, 247, 251, 0.8)', // Frosted ice overlay
};

export const typography = {
  display: {
    fontSize: 42, // Increased for more impact
    lineHeight: 48,
    fontFamily: 'Inter_900Black', // Ultra heavy for numbers
    letterSpacing: -1.5, // Tighter tracking for large numbers
  },
  h1: {
    fontSize: 28,
    lineHeight: 34,
    fontFamily: 'Inter_900Black',
    letterSpacing: -0.8,
  },
  h2: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.5,
  },
  h3: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 15,
    lineHeight: 24, // increased line height for readability
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.1,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Inter_600SemiBold', // Punchier captions
    letterSpacing: 0.4,
  },
  micro: {
    fontSize: 11,
    lineHeight: 16,
    fontFamily: 'Inter_700Bold', // Very bold for tiny text to maintain legibility
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
  light: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: 'Inter_300Light', // Elegant, thin text
    letterSpacing: 0.2,
  }
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

// Luxury "Tactile" Shadows (Soft, colored glows instead of harsh drops)
export const shadows = {
  card: {
    shadowColor: '#2C2825',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  elevated: {
    shadowColor: '#B59A7A', // Champagne glow for interaction
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  header: {
    shadowColor: '#2C2825',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
} as const;
