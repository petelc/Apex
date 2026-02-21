import { createTheme, ThemeOptions } from '@mui/material/styles';

/**
 * APEX Brand Theme
 * Based on APEX Brand Guidelines
 */

declare module '@mui/material/styles' {
  interface Palette {
    apex: {
      primaryBlue: string;
      primaryDark: string;
      accentBlue: string;
    };
  }
  interface PaletteOptions {
    apex?: {
      primaryBlue?: string;
      primaryDark?: string;
      accentBlue?: string;
    };
  }
}

const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#2E5090', // Primary Blue
      dark: '#1E3A6F', // Primary Dark
      light: '#4A90E2', // Accent Blue
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#4A90E2', // Accent Blue
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#4CAF50', // Success Green
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#FF9800', // Warning Orange
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#D32F2F', // Error Red
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F5F5F5', // Background Light
      paper: '#FFFFFF', // Surface White
    },
    text: {
      primary: '#212121', // Text Primary
      secondary: '#757575', // Text Secondary
    },
    divider: '#E0E0E0', // Border Gray
    apex: {
      primaryBlue: '#2E5090',
      primaryDark: '#1E3A6F',
      accentBlue: '#4A90E2',
    },
  },
  typography: {
    fontFamily: [
      'Arial',
      'Helvetica',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2rem', // 32px
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '0.02em',
    },
    h2: {
      fontSize: '1.5rem', // 24px
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '0.02em',
    },
    h3: {
      fontSize: '1.125rem', // 18px
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h4: {
      fontSize: '1rem', // 16px
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h5: {
      fontSize: '0.875rem', // 14px
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h6: {
      fontSize: '0.75rem', // 12px
      fontWeight: 600,
      lineHeight: 1.3,
    },
    body1: {
      fontSize: '0.875rem', // 14px
      lineHeight: 1.5,
      letterSpacing: 0,
    },
    body2: {
      fontSize: '0.75rem', // 12px
      lineHeight: 1.4,
      letterSpacing: 0,
    },
    button: {
      textTransform: 'none', // Don't uppercase buttons
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          fontSize: '0.875rem',
          fontWeight: 600,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(46, 80, 144, 0.2)',
          },
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.04)',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.75rem',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        },
      },
    },
  },
};

export const apexTheme = createTheme(themeOptions);
