'use client';

import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { CacheProvider } from '@chakra-ui/next-js';
import { WagmiProvider } from 'wagmi';
import { PrivyProvider } from '@privy-io/react-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from '@/lib/wagmi';
import { useState } from 'react';
import { DemoModeProvider } from '@/lib/DemoModeContext';
import { DemoBanner } from '@/components/DemoBanner';

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'cmmvbtxlm00gk0ck1oj515c37';

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: '#09090B',
        color: '#F4F4F5',
      },
      '::selection': {
        bg: '#00FF66',
        color: '#09090B',
      },
    },
  },
  fonts: {
    heading: 'var(--font-space-grotesk), Space Grotesk, system-ui, sans-serif',
    body: 'var(--font-inter), Inter, system-ui, sans-serif',
    mono: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
  },
  colors: {
    brand: {
      50:  '#e6fff0',
      100: '#b3ffd1',
      200: '#80ffb3',
      300: '#4dff94',
      400: '#1aff76',
      500: '#00FF66',
      600: '#00cc52',
      700: '#00993d',
      800: '#006629',
      900: '#003314',
    },
    gray: {
      50:  '#F4F4F5',
      100: '#E4E4E7',
      200: '#D4D4D8',
      300: '#A1A1AA',
      400: '#71717A',
      500: '#52525B',
      600: '#3F3F46',
      700: '#27272A',
      800: '#18181B',
      900: '#111113',
      950: '#09090B',
    },
  },
  radii: {
    xl: '12px',
    lg: '8px',
    md: '6px',
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        letterSpacing: '0.01em',
      },
      defaultProps: {
        borderRadius: '0',
      },
    },
    Input: {
      defaultProps: {
        variant: 'filled',
      },
      variants: {
        filled: {
          field: {
            bg: '#18181B',
            borderColor: '#27272A',
            color: '#F4F4F5',
            _hover: { bg: '#1F1F23', borderColor: '#3F3F46' },
            _focus: { bg: '#18181B', borderColor: '#00FF66', boxShadow: '0 0 0 1px #00FF66' },
            _placeholder: { color: '#52525B' },
          },
        },
      },
    },
    Progress: {
      baseStyle: {
        track: { bg: '#27272A' },
        filledTrack: { bg: '#00FF66' },
      },
    },
    Menu: {
      baseStyle: {
        list: {
          bg: '#18181B',
          borderColor: '#27272A',
          py: 1,
        },
        item: {
          bg: '#18181B',
          color: '#F4F4F5',
          _hover: { bg: '#27272A' },
          _focus: { bg: '#27272A' },
        },
      },
    },
    Alert: {
      variants: {
        subtle: {
          container: {
            bg: '#18181B',
            borderWidth: '1px',
            borderColor: '#27272A',
          },
        },
      },
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  // Avoid initializing Privy in local development to prevent "Origin not allowed"
  // errors when the Privy dashboard hasn't been configured for localhost origins.
  const enablePrivy = process.env.NODE_ENV === 'production' && PRIVY_APP_ID;

  return (
    <CacheProvider>
      <ChakraProvider theme={theme}>
        {enablePrivy ? (
          <PrivyProvider
            appId={PRIVY_APP_ID}
            config={{
              appearance: {
                walletChainType: 'ethereum-only',
                theme: 'dark',
                accentColor: '#00FF66',
              },
              loginMethods: ['wallet', 'email'],
            }}
          >
            <QueryClientProvider client={queryClient}>
              <WagmiProvider config={wagmiConfig}>
                <DemoModeProvider>
                  <DemoBanner />
                  {children}
                </DemoModeProvider>
              </WagmiProvider>
            </QueryClientProvider>
          </PrivyProvider>
        ) : (
          <QueryClientProvider client={queryClient}>
            <WagmiProvider config={wagmiConfig}>
              <DemoModeProvider>
                <DemoBanner />
                {children}
              </DemoModeProvider>
            </WagmiProvider>
          </QueryClientProvider>
        )}
      </ChakraProvider>
    </CacheProvider>
  );
}
