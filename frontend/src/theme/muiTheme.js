import { createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#6366f1' },
    background: { default: '#111827', paper: '#1f2937' },
  },
});

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#4f46e5' },
  },
});

export function getTheme(isDark) {
  return isDark ? darkTheme : lightTheme;
}
