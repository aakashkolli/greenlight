'use client';

import { Box, Flex, Heading, HStack, Button, Show, Hide } from '@chakra-ui/react';
import Link from 'next/link';
import { WalletButton } from './WalletButton';
import MobileMenu from './MobileMenu';

interface NavbarProps {
  maxW?: string;
}

export function Navbar({ maxW = '6xl' }: NavbarProps) {
  return (
    <Box
      bg="rgba(244, 248, 251, 0.92)"
      borderBottomWidth="1px"
      borderColor="blackAlpha.200"
      py={4}
      px={6}
      position="sticky"
      top={0}
      zIndex={50}
      backdropFilter="blur(8px)"
    >
      <Flex maxW={maxW} mx="auto" justify="space-between" align="center">
        <Link href="/">
          <Heading size="md" color="brand.700" cursor="pointer" letterSpacing="tight">
            Greenlight
          </Heading>
        </Link>
        <HStack spacing={{ base: 2, md: 4 }} align="center">
          <Show above="md">
            <Link href="/activity">
              <Button variant="ghost" size="md" fontWeight="medium" aria-label="Open activity page">
                View Activity
              </Button>
            </Link>
            <Link href="/create">
              <Button variant="outline" size="md" px={6} fontWeight="semibold">
                Start a Project
              </Button>
            </Link>
          </Show>
          <Hide above="md">
            <MobileMenu />
          </Hide>
          <WalletButton />
        </HStack>
      </Flex>
    </Box>
  );
}
