'use client';

import { Box, Flex, Text, HStack, Show, Hide } from '@chakra-ui/react';
import Link from 'next/link';
import { WalletButton } from './WalletButton';
import MobileMenu from './MobileMenu';

interface NavbarProps {
  maxW?: string;
}

export function Navbar({ maxW = '6xl' }: NavbarProps) {
  return (
    <Box
      bg="rgba(9, 9, 11, 0.85)"
      borderBottomWidth="1px"
      borderColor="#1F1F23"
      py={4}
      px={6}
      position="sticky"
      top={0}
      zIndex={50}
      backdropFilter="blur(12px)"
    >
      <Flex maxW={maxW} mx="auto" justify="space-between" align="center">
        <Link href="/">
          <Text
            as="span"
            fontFamily="var(--font-space-grotesk), sans-serif"
            fontWeight="700"
            fontSize="lg"
            letterSpacing="-0.02em"
            cursor="pointer"
            transition="all 0.2s ease"
            sx={{
              background: 'linear-gradient(90deg, #00ff66 0%, #00d86a 40%, #00b26a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundSize: '200% 100%',
              backgroundPosition: '0% 0%',
            }}
            _hover={{ transform: 'translateY(-1px)', filter: 'brightness(1.05)' }}
          >
            GreenLight
          </Text>
        </Link>

        <HStack spacing={{ base: 2, md: 6 }} align="center">
          <Show above="md">
            <Link href="/activity">
              <Text
                color="#71717A"
                fontSize="sm"
                fontWeight="500"
                _hover={{ color: '#F4F4F5' }}
                transition="color 0.15s ease"
                cursor="pointer"
              >
                Activity
              </Text>
            </Link>
            <Link href="/create">
              <Text
                color="#71717A"
                fontSize="sm"
                fontWeight="500"
                _hover={{ color: '#F4F4F5' }}
                transition="color 0.15s ease"
                cursor="pointer"
              >
                Launch Project
              </Text>
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
