import { createTheme } from '@mui/material/styles';

// CGI Color Palette
export const cgiColors = {
  // Primary Colors
  primary: '#5236AB',
  secondary: '#E31937',
  gray: '#333333',
  white: '#FFFFFF',

  // Secondary Colors
  success: '#1AB977',
  warning: '#F1A425',
  error: '#B00020',
  magenta: '#A82465',

  // Primary Palette Variations
  purple: {
    900: '#200A58',
    800: '#2D1E5E',
    700: '#3A2679',
    600: '#5236AB',
    500: '#755EBC',
    400: '#9E83F5',
    300: '#AFA3D8',
    200: '#CBC3E6',
    100: '#E6E3F3',
    50: '#F2F1F9'
  },

  red: {
    900: '#600A17',
    800: '#7D0D1E',
    700: '#A21127',
    600: '#CF1632',
    500: '#E31937',
    400: '#E9465F',
    300: '#ED6479',
    200: '#F395A3',
    100: '#F7B7C1',
    50: '#FCE8EB'
  },

  grayScale: {
    900: '#151515',
    800: '#1C1C1C',
    700: '#242424',
    600: '#2E2E2E',
    500: '#333333',
    400: '#5C5C5C',
    300: '#767676',
    200: '#A8A8A8',
    100: '#C0C0C0',
    50: '#EFEFEF'
  },

  // Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #5236AB 0%, #A82465 60%, #E31937 100%)',
    primaryVertical: 'linear-gradient(180deg, #5236AB 0%, #A82465 60%, #E31937 100%)',
    primaryHorizontal: 'linear-gradient(90deg, #5236AB 0%, #A82465 60%, #E31937 100%)',
    secondary: 'linear-gradient(180deg, #991F3D 0%, #E31937 33%, #FF6A00 66%, #FFCDD2 100%)'
  }
};

// Create CGI Theme
const cgiTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: cgiColors.primary,
      light: cgiColors.purple[300],
      dark: cgiColors.purple[700],
      contrastText: cgiColors.white,
    },
    secondary: {
      main: cgiColors.secondary,
      light: cgiColors.red[300],
      dark: cgiColors.red[700],
      contrastText: cgiColors.white,
    },
    success: {
      main: cgiColors.success,
      contrastText: cgiColors.white,
    },
    warning: {
      main: cgiColors.warning,
      contrastText: cgiColors.white,
    },
    error: {
      main: cgiColors.error,
      contrastText: cgiColors.white,
    },
    grey: {
      50: cgiColors.grayScale[50],
      100: cgiColors.grayScale[100],
      200: cgiColors.grayScale[200],
      300: cgiColors.grayScale[300],
      400: cgiColors.grayScale[400],
      500: cgiColors.grayScale[500],
      600: cgiColors.grayScale[600],
      700: cgiColors.grayScale[700],
      800: cgiColors.grayScale[800],
      900: cgiColors.grayScale[900],
    },
    background: {
      default: '#fafafa',
      paper: cgiColors.white,
    },
    text: {
      primary: cgiColors.gray,
      secondary: cgiColors.grayScale[600],
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      color: cgiColors.primary,
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.3,
      color: cgiColors.primary,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.4,
      color: cgiColors.primary,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
      color: cgiColors.primary,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.5,
      color: cgiColors.primary,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
      color: cgiColors.primary,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: cgiColors.gray,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: cgiColors.grayScale[600],
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0 2px 4px rgba(82, 54, 171, 0.08)',
    '0 4px 8px rgba(82, 54, 171, 0.12)',
    '0 8px 16px rgba(82, 54, 171, 0.16)',
    '0 12px 24px rgba(82, 54, 171, 0.20)',
    '0 16px 32px rgba(82, 54, 171, 0.24)',
    // ... extend as needed
    ...Array(19).fill('0 16px 32px rgba(82, 54, 171, 0.24)'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '10px 20px',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 'none',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 15px rgba(82, 54, 171, 0.3)',
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 6px 20px rgba(82, 54, 171, 0.4)',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
            backgroundColor: cgiColors.purple[50],
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(82, 54, 171, 0.1)',
          border: `1px solid ${cgiColors.purple[100]}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(82, 54, 171, 0.15)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            '&.Mui-focused fieldset': {
              borderColor: cgiColors.primary,
              borderWidth: '2px',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: cgiColors.primary,
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: cgiColors.primary,
          '&.Mui-checked': {
            color: cgiColors.primary,
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          backgroundColor: cgiColors.purple[100],
        },
        bar: {
          borderRadius: '4px',
          background: cgiColors.gradients.primary,
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: cgiColors.primary,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          fontWeight: 500,
        },
        filled: {
          backgroundColor: cgiColors.purple[100],
          color: cgiColors.primary,
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderColor: cgiColors.primary,
          color: cgiColors.primary,
          '&.Mui-selected': {
            backgroundColor: cgiColors.primary,
            color: cgiColors.white,
            '&:hover': {
              backgroundColor: cgiColors.purple[700],
            },
          },
          '&:hover': {
            backgroundColor: cgiColors.purple[50],
          },
        },
      },
    },
    MuiStepper: {
      styleOverrides: {
        root: {
          '& .MuiStepLabel-root .Mui-completed': {
            color: cgiColors.success,
          },
          '& .MuiStepLabel-root .Mui-active': {
            color: cgiColors.primary,
          },
          '& .MuiStepConnector-line': {
            borderColor: cgiColors.purple[200],
          },
        },
      },
    },
  },
});

export default cgiTheme;