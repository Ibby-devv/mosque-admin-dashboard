/**
 * Shared theme tokens for Mosque Admin Dashboard
 * Mirrors the mobile app's design system for visual consistency
 */

// Brand palette - navy and gold
export const Theme = {
  colors: {
    brand: {
      navy: {
        900: '#0b1220',
        800: '#172554',
        700: '#1e3a8a',
        600: '#1d4ed8',
        50: '#eff6ff',
      },
      gold: {
        600: '#d97706',
        400: '#fbbf24',
      },
    },
    surface: {
      base: '#ffffff',
      soft: '#f8fafc',
      muted: '#f1f5f9',
      card: '#ffffff',
    },
    text: {
      base: '#0f172a',
      muted: '#64748b',
      subtle: '#94a3b8',
      inverse: '#ffffff',
      strong: '#1f2937',
    },
    border: {
      base: '#e5e7eb',
      soft: '#e2e8f0',
      medium: '#9ca3af',
    },
    accent: {
      blueSoft: '#eff6ff',
      blue: '#60a5fa',
      blueDark: '#2563eb',
      amberSoft: '#fff7ed',
      green: '#22c55e',
      amber: '#f59e0b',
      red: '#ef4444',
      violet: '#8b5cf6',
      indigo: '#6366f1',
    },
    status: {
      success: '#22c55e',
      successLight: '#d1fae5',
      successDark: '#065f46',
      error: '#ef4444',
      errorLight: '#fee2e2',
      errorDark: '#991b1b',
      warning: '#f59e0b',
      warningLight: '#fff7ed',
      warningDark: '#92400e',
      info: '#60a5fa',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    xxl: '24px',
    '3xl': '32px',
    '4xl': '40px',
  },
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    pill: '999px',
  },
  typography: {
    h1: '24px',
    h2: '20px',
    h3: '18px',
    body: '14px',
    small: '12px',
  },
  shadow: {
    soft: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    card: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    header: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
} as const;

// Responsive breakpoints (mobile-first)
export const breakpoints = {
  xs: '480px',   // Small phones
  sm: '640px',   // Large phones
  md: '768px',   // Tablets
  lg: '1024px',  // Desktops
  xl: '1280px',  // Large desktops
} as const;

// Media query helpers for styled-components
export const media = {
  xs: `@media (min-width: ${breakpoints.xs})`,
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
} as const;

// Common styled-components utilities
export const mixins = {
  flexCenter: `
    display: flex;
    align-items: center;
    justify-content: center;
  `,
  flexBetween: `
    display: flex;
    align-items: center;
    justify-content: space-between;
  `,
  truncate: `
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
  cardStyle: `
    background: ${Theme.colors.surface.card};
    border-radius: ${Theme.radius.lg};
    box-shadow: ${Theme.shadow.card};
    padding: ${Theme.spacing.xl};
  `,
} as const;
