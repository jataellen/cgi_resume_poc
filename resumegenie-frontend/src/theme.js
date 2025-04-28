import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#5236AB' },
    secondary: { main: '#E31937' },
    background: { default: '#F6F8F9', paper: '#FFFFFF' },
    text: { primary: '#333333' },
  },
  typography: {
    fontFamily: 'Source Sans Pro, sans-serif',
    h1: { fontSize: '38px', fontWeight: 600 },
    h2: { fontSize: '28px', fontWeight: 400 },
    h3: { fontSize: '24px', fontWeight: 600 },
    body1: { fontSize: '16px', fontWeight: 400 },
    body2: { fontSize: '14px', fontWeight: 400 },
    button: { fontSize: '18px', fontWeight: 600 },
  },
});

export default theme;