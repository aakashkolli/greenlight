'use client';

import { Box, Flex, Heading, HStack, Button } from '@chakra-ui/react';
import Link from 'next/link';
import { WalletButton } from './WalletButton';

interface NavbarProps {
  maxW?: string;
}

export function Navbar({ maxW = '6xl' }: NavbarProps) {
  return (
    <Box bg="white" borderBottomWidth="1px" py={3} px={6}>
      <Flex maxW={maxW} mx="auto" justify="space-between" align="center">
        <Link href="/">
          <Heading size="md" color="teal.600" cursor="pointer">
            Greenlight
          </Heading>
        </Link>
        <HStack spacing={4}>
          <Link href="/activity">
            <Button variant="ghost" size="sm">My Activity</Button>
          </Link>
          <Link href="/create">
            <Button colorScheme="teal" size="sm">Start a Project</Button>
          </Link>
          <WalletButton />
        </HStack>
      </Flex>
    </Box>
  );
}
