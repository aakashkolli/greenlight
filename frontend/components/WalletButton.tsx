"use client";

import dynamic from 'next/dynamic';
import { Button, Text, HStack, Menu, MenuButton, MenuList, MenuItem, Box, Badge } from '@chakra-ui/react';
import { ChevronDownIcon } from './icons';
import Identicon from './Identicon';
import { useMounted } from '@/lib/useMounted';
import { useDemoMode } from '@/lib/DemoModeContext';

const WalletButtonProd = dynamic(() => import('./WalletButtonProd'), { ssr: false });

export function WalletButton() {
  const mounted = useMounted();
  const { isDemoMode, demoActive, demoAddress, launchDemo, exitDemo } = useDemoMode();

  // ── SSR skeleton ────────────────────────────────────────────────────────
  // Identical on server and client-before-mount so hydration never mismatches.
  if (!mounted) {
    return (
      <Box
        as="button"
        h="40px"
        px={5}
        border="1px solid #27272A"
        color="#71717A"
        fontSize="xs"
        bg="transparent"
        cursor="default"
        aria-hidden="true"
        letterSpacing="0.05em"
      >
        {isDemoMode ? 'Launch Demo' : 'Connect Wallet'}
      </Box>
    );
  }

  // ── Demo mode path ─────────────────────────────────────────────────────
  if (isDemoMode) {
    if (!demoActive) {
      return (
        <Button
          bg="#00FF66"
          color="#09090B"
          borderRadius="0"
          size="md"
          px={5}
          fontWeight="700"
          fontSize="xs"
          letterSpacing="0.05em"
          onClick={launchDemo}
          _hover={{ boxShadow: '0 0 20px rgba(0,255,102,0.35)', bg: '#00FF66' }}
          transition="all 0.15s ease"
        >
          Run Demo
        </Button>
      );
    }

    // Demo session active - show fake connected address
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
            <Badge
              bg="#00FF6618"
              color="#00FF66"
              border="1px solid #00FF6640"
              borderRadius="2px"
              px={1}
              py={0}
              fontSize="9px"
              letterSpacing="0.1em"
            >
              DEMO
            </Badge>
            <Text fontSize="xs" noOfLines={1} maxW={{ base: '80px', md: '110px' }}>
              {demoAddress.slice(0, 6)}…{demoAddress.slice(-4)}
            </Text>
          </HStack>
        </MenuButton>
        <MenuList>
          <MenuItem as="a" href="/profile">Profile (demo)</MenuItem>
          <MenuItem as="a" href="/create">Launch Project</MenuItem>
          <MenuItem
            color="#F87171"
            onClick={exitDemo}
          >
            Exit demo
          </MenuItem>
        </MenuList>
      </Menu>
    );
  }

  // ── Production path (client-only, dynamically imported) ────────────────
  return <WalletButtonProd />;
}
