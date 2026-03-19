'use client';

import { Button, Text, HStack, Menu, MenuButton, MenuList, MenuItem, IconButton } from '@chakra-ui/react';
import { ChevronDownIcon } from './icons';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import Identicon from './Identicon';

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const connector = connectors[0];

  if (isConnected && address) {
    return (
      <Menu>
        <MenuButton as={Button} rightIcon={<ChevronDownIcon />} variant="ghost" size="md">
          <HStack spacing={3}>
            <Identicon value={address} size={8} />
            <Text fontSize="sm" color="gray.700" noOfLines={1} maxW={{ base: '88px', md: '120px' }}>
              {address.slice(0, 6)}...{address.slice(-4)}
            </Text>
          </HStack>
        </MenuButton>
        <MenuList>
          <MenuItem as="a" href="/profile">Profile</MenuItem>
          <MenuItem as="a" href="/manage">Manage Projects</MenuItem>
          <MenuItem onClick={() => disconnect()}>Disconnect</MenuItem>
        </MenuList>
      </Menu>
    );
  }

  return (
    <Button
      colorScheme="brand"
      size="md"
      px={6}
      onClick={() => connector && connect({ connector })}
      isLoading={isPending}
      loadingText="Connecting"
      isDisabled={!connector}
    >
      Connect Wallet
    </Button>
  );
}
