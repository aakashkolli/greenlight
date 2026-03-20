'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Badge,
  Flex,
  Divider,
} from '@chakra-ui/react';
import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';
import { useAccount } from 'wagmi';
import { Navbar } from '@/components/Navbar';
import Identicon from '@/components/Identicon';
import { useDemoMode } from '@/lib/DemoModeContext';
import { useMounted } from '@/lib/useMounted';

function AddressCard({ address, isDemo }: { address: string; isDemo?: boolean }) {
  return (
    <Box
      bg="#111113"
      border="1px solid #27272A"
      borderRadius="12px"
      p={6}
      w="full"
    >
      <HStack spacing={4} mb={4}>
        {isDemo ? (
          <Box
            w="32px"
            h="32px"
            borderRadius="full"
            bg="#00FF6618"
            border="1px solid #00FF6640"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize="xs" color="#00FF66">
              D
            </Text>
          </Box>
        ) : (
          <Identicon value={address} size={32} />
        )}
        <Box>
          {isDemo && (
            <Badge
              bg="#00FF6618"
              color="#00FF66"
              border="1px solid #00FF6640"
              borderRadius="2px"
              px={2}
              py={0}
              fontSize="9px"
              letterSpacing="0.1em"
              mb={1}
              display="block"
            >
              DEMO
            </Badge>
          )}
          <Text
            fontSize="sm"
            color="#F4F4F5"
            letterSpacing="0.03em"
          >
            {address.slice(0, 10)}…{address.slice(-8)}
          </Text>
        </Box>
      </HStack>

      <Divider borderColor="#27272A" mb={4} />

      <Text fontSize="xs" color="#52525B" letterSpacing="wide">
        WALLET ADDRESS
      </Text>
      <Text
        fontSize="xs"
        color="#71717A"
        mt={1}
        wordBreak="break-all"
      >
        {address}
      </Text>

      {isDemo && (
        <Box
          mt={4}
          p={3}
          bg="#0D0D0F"
          border="1px solid #1F1F23"
          borderRadius="6px"
        >
          <Text fontSize="xs" color="#52525B" lineHeight="1.6">
            This is a simulated wallet address for the sandbox demo. No real funds are involved.
          </Text>
        </Box>
      )}
    </Box>
  );
}

export default function ProfilePage() {
  const mounted = useMounted();
  const { authenticated } = usePrivy();
  const { address } = useAccount();
  const { isDemoMode, demoActive, demoAddress } = useDemoMode();

  const showDemoProfile = isDemoMode && demoActive;
  const showRealProfile = !isDemoMode && authenticated && address;

  if (!mounted) {
    return (
      <Box minH="100vh" bg="#09090B">
        <Navbar />
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="#09090B">
      <Navbar />

      <Container maxW="2xl" py={12}>
        <Box mb={8}>
          <Text fontSize="xs" color="#52525B" fontWeight="600" letterSpacing="wide" mb={3}>
            Account
          </Text>
          <Heading
            fontFamily="var(--font-space-grotesk), sans-serif"
            fontWeight="700"
            fontSize={{ base: '2xl', md: '3xl' }}
            color="#F4F4F5"
          >
            Profile
          </Heading>
        </Box>

        {showDemoProfile ? (
          <VStack spacing={5} align="stretch">
            <AddressCard address={demoAddress} isDemo />
            <HStack spacing={3}>
              <Link href="/activity" style={{ flex: 1 }}>
                <Button
                  w="full"
                  bg="transparent"
                  color="#71717A"
                  border="1px solid #27272A"
                  borderRadius="0"
                  _hover={{ borderColor: '#00FF66', color: '#00FF66', bg: 'rgba(0,255,102,0.04)' }}
                  transition="all 0.15s ease"
                  fontSize="sm"
                  fontWeight="500"
                >
                  View Activity
                </Button>
              </Link>
              <Link href="/create" style={{ flex: 1 }}>
                <Button
                  w="full"
                  bg="#00FF66"
                  color="#09090B"
                  borderRadius="0"
                  fontWeight="700"
                  _hover={{ boxShadow: '0 0 20px rgba(0,255,102,0.35)', bg: '#00FF66' }}
                  transition="all 0.15s ease"
                  fontSize="sm"
                >
                  Launch Project
                </Button>
              </Link>
            </HStack>
          </VStack>
        ) : showRealProfile ? (
          <VStack spacing={5} align="stretch">
            <AddressCard address={address!} />
            <HStack spacing={3}>
              <Link href="/activity" style={{ flex: 1 }}>
                <Button
                  w="full"
                  bg="transparent"
                  color="#71717A"
                  border="1px solid #27272A"
                  borderRadius="0"
                  _hover={{ borderColor: '#00FF66', color: '#00FF66', bg: 'rgba(0,255,102,0.04)' }}
                  transition="all 0.15s ease"
                  fontSize="sm"
                  fontWeight="500"
                >
                  View Activity
                </Button>
              </Link>
              <Link href="/create" style={{ flex: 1 }}>
                <Button
                  w="full"
                  bg="#00FF66"
                  color="#09090B"
                  borderRadius="0"
                  fontWeight="700"
                  _hover={{ boxShadow: '0 0 20px rgba(0,255,102,0.35)', bg: '#00FF66' }}
                  transition="all 0.15s ease"
                  fontSize="sm"
                >
                  Launch Project
                </Button>
              </Link>
            </HStack>
          </VStack>
        ) : (
          <Box
            bg="#111113"
            border="1px solid #27272A"
            borderRadius="12px"
            p={10}
            textAlign="center"
          >
            <Text color="#71717A" fontSize="sm" mb={6}>
              Connect your wallet to view your profile.
            </Text>
            <Flex justify="center">
              <Link href="/">
                <Button
                  bg="#00FF66"
                  color="#09090B"
                  borderRadius="0"
                  fontWeight="700"
                  _hover={{ boxShadow: '0 0 20px rgba(0,255,102,0.35)', bg: '#00FF66' }}
                  transition="all 0.15s ease"
                >
                  Back to Home
                </Button>
              </Link>
            </Flex>
          </Box>
        )}
      </Container>
    </Box>
  );
}
