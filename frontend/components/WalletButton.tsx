'use client';

import { Button, Text, HStack } from '@chakra-ui/react';
import { usePrivy } from '@privy-io/react-auth';
import { useAccount, useDisconnect } from 'wagmi';

export function WalletButton() {
  const { login, ready, authenticated } = usePrivy();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();

  if (!ready) {
    return <Button colorScheme="teal" isLoading loadingText="Loading..." />;
  }

  if (authenticated && address) {
    return (
      <HStack>
        <Text fontSize="sm" color="gray.600">
          {address.slice(0, 6)}...{address.slice(-4)}
        </Text>
        <Button size="sm" variant="outline" onClick={() => disconnect()}>
          Disconnect
        </Button>
      </HStack>
    );
  }

  return (
    <Button colorScheme="teal" onClick={login}>
      Connect Wallet
    </Button>
  );
}
