'use client';

import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from '@/lib/wagmi';
import { useState } from 'react';

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: '#f4f8fb',
        color: '#1f2937',
      },
    },
  },
  fonts: {
    heading: 'var(--font-inter), Inter, system-ui, sans-serif',
    body: 'var(--font-inter), Inter, system-ui, sans-serif',
  },
  colors: {
    brand: {
      50: '#eef9ff',
      100: '#d7f1ff',
      500: '#0e7490',
      600: '#0b5f76',
      700: '#094c5e',
    },
  },
  radii: {
    xl: '1rem',
    lg: '0.75rem',
  },
  components: {
    Button: {
      defaultProps: {
        borderRadius: 'lg',
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'xl',
        },
      },
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <ChakraProvider theme={theme}>{children}</ChakraProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
