import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import { App } from './App';

const queryClient = new QueryClient();

const theme = createTheme({
  primaryColor: 'green',
  colors: {
    green: [
      '#e6f4e6',
      '#cce9cc',
      '#99d399',
      '#66bd66',
      '#33a733',
      '#00703c',
      '#005a30',
      '#004425',
      '#002e19',
      '#00170d',
    ],
  },
  fontFamily: '"GDS Transport", arial, sans-serif',
  headings: {
    fontFamily: '"GDS Transport", arial, sans-serif',
    fontWeight: '700',
  },
  defaultRadius: 0,
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </MantineProvider>
  </React.StrictMode>,
);
