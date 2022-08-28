import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { createTheme, ThemeProvider } from '@mui/material';
import styleVariables from '../styles/variables.module.css';

function MyApp({ Component, pageProps }: AppProps) {
  const theme = createTheme({
    palette: {
      primary: {
        main: styleVariables.primary,
        light: styleVariables.primaryLight,
        dark: styleVariables.primaryDark,
      },
      secondary: {
        main: styleVariables.secondary,
        light: styleVariables.secondaryLight,
        dark: styleVariables.secondaryDark,
      },
    },
  });
  return (
    <ThemeProvider theme={theme}>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
