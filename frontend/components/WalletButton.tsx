'use client';

import { Button, Text, HStack, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { ChevronDownIcon } from './icons';
import { usePrivy } from '@privy-io/react-auth';
import { useAccount } from 'wagmi';
import Identicon from './Identicon';

export function WalletButton() {
  const { login, logout, ready, authenticated } = usePrivy();
  const { address } = useAccount();

  const displayAddress = address;

  if (!ready) {
    return (
      <Button colorScheme="brand" size="md" px={6} isLoading loadingText="Loading" />
    );
  }

  if (authenticated && displayAddress) {
    return (
      <Menu>
        <MenuButton as={Button} rightIcon={<ChevronDownIcon />} variant="ghost" size="md">
          <HStack spacing={3}>
            <Identicon value={displayAddress} size={8} />
            <Text fontSize="sm" color="gray.700" noOfLines={1} maxW={{ base: '88px', md: '120px' }}>
              {displayAddress.slice(0, 6)}...{displayAddress.slice(-4)}
            </Text>
          </HStack>
        </MenuButton>
        <MenuList>
          <MenuItem as="a" href="/profile">Profile</MenuItem>
          <MenuItem as="a" href="/manage">Manage Projects</MenuItem>
          <MenuItem onClick={() => logout()}>Disconnect</MenuItem>
        </MenuList>
      </Menu>
    );
  }

  return (
    <Button
      colorScheme="brand"
      size="md"
      px={6}
      onClick={login}
    >
      Connect Wallet
    </Button>
  );
}
