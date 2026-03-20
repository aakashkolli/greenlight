"use client";

import { Button, Text, HStack, Menu, MenuButton, MenuList, MenuItem, Box, Badge } from '@chakra-ui/react';
import { ChevronDownIcon } from './icons';
import { usePrivy } from '@privy-io/react-auth';
import { useAccount } from 'wagmi';
import Identicon from './Identicon';

export default function WalletButtonProd({ demoModeProps }: { demoModeProps?: any }) {
  const { login, logout, ready, authenticated } = usePrivy();
  const { address } = useAccount();

  if (!ready) {
    return (
      <Button
        bg="transparent"
        color="#71717A"
        border="1px solid #27272A"
        borderRadius="0"
        size="md"
        px={5}
        isLoading
        loadingText="Loading"
        fontSize="xs"
      />
    );
  }

  if (authenticated && address) {
    return (
      <Menu>
        <MenuButton
          as={Button}
          rightIcon={<ChevronDownIcon />}
          bg="transparent"
          color="#F4F4F5"
          border="1px solid #27272A"
          borderRadius="0"
          size="md"
          px={4}
          _hover={{ borderColor: '#00FF66', bg: 'rgba(0,255,102,0.04)' }}
          _active={{ bg: 'rgba(0,255,102,0.04)' }}
          transition="all 0.15s ease"
          fontSize="xs"
        >
          <HStack spacing={2}>
            <Identicon value={address} size={8} />
            <Text fontSize="xs" noOfLines={1} maxW={{ base: '80px', md: '110px' }}>
              {address.slice(0, 6)}…{address.slice(-4)}
            </Text>
          </HStack>
        </MenuButton>
        <MenuList>
          <MenuItem as="a" href="/profile">Profile</MenuItem>
          <MenuItem as="a" href="/activity">Activity</MenuItem>
          <MenuItem onClick={() => logout()} color="#F87171">Disconnect</MenuItem>
        </MenuList>
      </Menu>
    );
  }

  return (
    <Button
      bg="transparent"
      color="#F4F4F5"
      border="1px solid #27272A"
      borderRadius="0"
      size="md"
      px={5}
      onClick={login}
      _hover={{ borderColor: '#00FF66', bg: 'rgba(0,255,102,0.04)', color: '#00FF66' }}
      transition="all 0.15s ease"
      fontSize="xs"
      letterSpacing="0.05em"
    >
      Connect Wallet
    </Button>
  );
}
