// ChatFlow Theme - Exact Design Specifications
export const theme = {
  // Brand Colors
  colors: {
    primary: {
      50: '#F8F7FC',
      100: '#F3F0FF',
      200: '#E5E7EB',
      500: '#7C3AED',
      600: '#6a2cd9',
      700: '#5B21B6',
    },
    secondary: {
      50: '#9F67FF',
      100: '#9F67FF',
      500: '#9F67FF',
      600: '#6D28D9',
      700: '#5B21B6',
    },
    background: '#F8F7FC',
    surface: '#FFFFFF',
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      tertiary: '#9CA3AF',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #9F67FF, #7C3AED)',
      background: 'linear-gradient(135deg, #F8F7FC 0%, #F3F0FF 100%)',
    },
    border: '#E5E7EB',
    error: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      200: '#FECACA',
      500: '#EF4444',
      600: '#DC2626',
      700: '#B91C1C',
    },
    success: {
      50: '#F0FDF4',
      100: '#DCFCE7',
      200: '#BBF7D0',
      500: '#22C55E',
      600: '#16A34A',
      700: '#15803D',
    },
    warning: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
    },
    shadow: 'rgba(0, 0, 0, 0.08)',
  },

  // Border Radius
  borderRadius: {
    sm: '0.375rem',  // rounded-md
    md: '0.5rem',    // rounded-lg
    lg: '0.75rem',   // rounded-xl
    xl: '1rem',      // rounded-2xl
    full: '9999px',
  },

  // Spacing
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem',
  },

  // Typography
  typography: {
    fontFamily: '"Inter", "Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
      400: '400',  // Paragraphs
      500: '500',  // Subtitles
      600: '600',
      700: '700',  // Titles
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    soft: '0 4px 20px rgba(0, 0, 0, 0.08)', // Exact specification
  },

  // Transitions
  transitions: {
    fast: '150ms ease-in-out',
    normal: '250ms ease-in-out',
    slow: '350ms ease-in-out',
  },

  // Z-index
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

export default theme;
