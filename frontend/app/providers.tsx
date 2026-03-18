'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from '@/lib/wagmi';
import { hardhat } from 'viem/chains';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        defaultChain: hardhat,
        supportedChains: [hardhat],
        appearance: {
          theme: 'light',
          accentColor: '#319795',
          logo: '',
        },
        loginMethods: ['email', 'google', 'wallet'],
        embeddedWallets: {
          ethereum: { createOnLogin: 'users-without-wallets' },
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <ChakraProvider>
            {children}
          </ChakraProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
