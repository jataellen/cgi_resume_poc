import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#E31937', // CGI Red
      light: '#F28A9D',
      dark: '#990f25',
    },
    secondary: {
      main: '#5236AB', // CGI Purple
    },
    success: { main: '#1AB977' },
    warning: { main: '#FFAC25' },
    error: { main: '#B00020' },
  },
  typography: {
    fontFamily: 'Source Sans Pro, sans-serif',
    h1: { fontSize: '38px', fontWeight: 600 },
    h2: { fontSize: '28px', fontWeight: 500 },
    h3: { fontSize: '24px', fontWeight: 600 },
    h4: { fontSize: '20px', fontWeight: 400 },
    h5: { fontSize: '18px', fontWeight: 400 },
    h6: { fontSize: '16px', fontWeight: 500 },
    body1: { fontSize: '16px' },
    body2: { fontSize: '14px', fontWeight: 500 },
    button: { fontSize: '18px', fontWeight: 600 },
  },
});

export default theme;