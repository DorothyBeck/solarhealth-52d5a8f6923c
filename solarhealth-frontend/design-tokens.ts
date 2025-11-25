/**
 * Design Tokens for SolarHealth
 * Seed: 997416d634fa4f5005833cb4bc895c55ef161c8cc217a2b9db9b24b2d6fcd867
 * Calculated from: sha256("SolarHealth" + "sepolia" + "202501" + "SolarHealth.sol")
 */

export const colors = {
  light: {
    primary: "#4A90E2",      // Blue (derived from seed)
    secondary: "#52C9A6",     // Green (health theme)
    accent: "#FF6B6B",         // Red (alerts)
    background: "#F8FAFC",     // Light gray
    surface: "#FFFFFF",        // White
    text: "#1E293B",           // Dark gray
    textSecondary: "#64748B", // Medium gray
    error: "#EF4444",          // Red
    success: "#10B981",        // Green
    warning: "#F59E0B",         // Orange
    border: "#E2E8F0",         // Light border
  },
  dark: {
    primary: "#60A5FA",        // Lighter blue
    secondary: "#34D399",      // Lighter green
    accent: "#FB7185",         // Lighter red
    background: "#0F172A",      // Dark blue-gray
    surface: "#1E293B",         // Dark gray
    text: "#F1F5F9",           // Light gray
    textSecondary: "#94A3B8",  // Medium gray
    error: "#F87171",          // Light red
    success: "#4ADE80",        // Light green
    warning: "#FBBF24",        // Light orange
    border: "#334155",         // Dark border
  },
};

export const spacing = {
  compact: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  comfortable: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
  },
};

export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['Monaco', 'Consolas', 'monospace'],
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};

export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 2px 8px rgba(0, 0, 0, 0.1)',
  lg: '0 4px 16px rgba(0, 0, 0, 0.15)',
};

export const transitions = {
  fast: '0.15s ease',
  normal: '0.2s ease',
  slow: '0.3s ease',
};

export const breakpoints = {
  mobile: '640px',
  tablet: '1024px',
  desktop: '1280px',
};

export const density = 'comfortable' as 'compact' | 'comfortable';

export const tokens = {
  colors,
  spacing: spacing[density],
  typography,
  borderRadius,
  shadows,
  transitions,
  breakpoints,
  density,
};


