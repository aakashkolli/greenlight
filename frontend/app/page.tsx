// Server Component - no 'use client'.
// All interactive state (search, filter, wallet) lives in leaf Client Components.
// Chakra UI v2 components render as static HTML on the server and are hydrated
// with styles by ChakraProvider (a Client Component in providers.tsx).

import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  SimpleGrid,
  HStack,
  Flex,
  Grid,
  GridItem,
  Divider,
} from '@chakra-ui/react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { VaultTerminal } from '@/components/VaultTerminal';
import { ProjectsSection } from '@/components/ProjectsSection';

function ProtocolStep({
  step,
  title,
  description,
  code,
}: {
  step: string;
  title: string;
  description: string;
  code: string;
}) {
  return (
    <Box
      bg="#111113"
      border="1px solid #27272A"
      borderRadius="12px"
      p={6}
      _hover={{ borderColor: '#3F3F46' }}
      transition="border-color 0.2s ease"
    >
      <Text fontSize="xs" color="#52525B" fontWeight="600" letterSpacing="wide" mb={3}>
        {step}
      </Text>
      <Heading as="h3" size="sm" color="#F4F4F5" mb={2} fontFamily="var(--font-space-grotesk), sans-serif">
        {title}
      </Heading>
      <Text color="#71717A" fontSize="sm" mb={4} lineHeight="1.7">
        {description}
      </Text>
      <Box
        as="pre"
        fontFamily="var(--font-jetbrains-mono), monospace"
        fontSize="11px"
        color="#D4D4D4"
        bg="#0D0D0F"
        border="1px solid #1F1F23"
        borderRadius="6px"
        px={3}
        py={2}
        whiteSpace="pre-wrap"
        wordBreak="break-word"
        overflowX="auto"
      >
        <code>{code}</code>
      </Box>
    </Box>
  );
}

export default function HomePage() {
  return (
    <Box minH="100vh" bg="#09090B">
      <Navbar />

      {/* ── Hero ── */}
      <Box
        position="relative"
        overflow="hidden"
        pt={{ base: 16, md: 24 }}
        pb={{ base: 16, md: 20 }}
        px={6}
        _before={{
          content: '""',
          position: 'absolute',
          top: '-200px',
          left: '-200px',
          width: '700px',
          height: '700px',
          background: 'radial-gradient(circle, rgba(0,255,102,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      >
        <Container maxW="6xl">
          <Grid
            templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
            gap={{ base: 12, lg: 16 }}
            alignItems="center"
          >
            {/* Left: copy */}
            <GridItem>
              <Heading
                as="h1"
                fontFamily="var(--font-space-grotesk), sans-serif"
                fontWeight="700"
                fontSize={{ base: '3xl', md: '5xl' }}
                lineHeight="1.1"
                mb={5}
                sx={{
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #A1A1AA 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Fund Milestones.
                <br />
                Not Promises.
              </Heading>

              <Text
                color="#A1A1AA"
                fontSize={{ base: 'md', md: 'lg' }}
                lineHeight="1.7"
                maxW="xl"
                mb={8}
              >
                An open-source, smart-contract powered crowdfunding protocol. Capital is locked in a
                trustless vault and released per milestone upon verification. Built with
                Next.js, Solidity, and PostgreSQL.
              </Text>

              <HStack spacing={4} mb={8} flexWrap="wrap">
                <Link href="#mechanics">
                  <Button
                    bg="#00FF66"
                    color="#09090B"
                    fontWeight="700"
                    size="lg"
                    px={7}
                    borderRadius="0"
                    _hover={{
                      transform: 'scale(1.03)',
                      boxShadow: '0 0 24px rgba(0,255,102,0.35)',
                      bg: '#00FF66',
                    }}
                    transition="all 0.15s ease"
                  >
                    View Protocol
                  </Button>
                </Link>
                <Link href="#projects">
                  <Button
                    bg="transparent"
                    color="#F4F4F5"
                    size="lg"
                    px={7}
                    borderRadius="0"
                    border="1px solid #27272A"
                    _hover={{ borderColor: '#3F3F46', bg: 'rgba(255,255,255,0.04)' }}
                    transition="all 0.15s ease"
                  >
                    Browse Vaults
                  </Button>
                </Link>
              </HStack>

              {/* Trust signals - plain text, no mono font */}
              <HStack spacing={6} flexWrap="wrap">
                {[{}, {}, {}].map((_, i) => (
                  <HStack key={i} spacing={2} align="center">
                    {i > 0 && (
                      <Divider
                        orientation="vertical"
                        borderColor="#27272A"
                        height="18px"
                        alignSelf="center"
                      />
                    )}
                    <Text fontSize="xs" color="#52525B" fontWeight="500">
                      {/* intentionally left blank per design request */}
                    </Text>
                  </HStack>
                ))}
              </HStack>
            </GridItem>

            {/* Right: terminal visual */}
            <GridItem display="flex" justifyContent={{ base: 'center', lg: 'flex-end' }}>
              <VaultTerminal />
            </GridItem>
          </Grid>
        </Container>
      </Box>

      {/* ── Protocol ── */}
      <Box id="mechanics" py={{ base: 16, md: 24 }} px={6} borderBottom="1px solid #1F1F23">
        <Container maxW="6xl">
          <Box mb={12}>
            {/* Heading label removed per request (was: "How it works") */}
            <Heading
              fontFamily="var(--font-space-grotesk), sans-serif"
              fontWeight="700"
              fontSize={{ base: '2xl', md: '3xl' }}
              color="#F4F4F5"
              mb={3}
            >
              Protocol & Dataflow
            </Heading>
            <Text color="#71717A" fontSize="md" maxW="lg">
              A trustless, three-phase lifecycle governs every capital commitment on GreenLight.
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
            <ProtocolStep
              step=""
              title="1. Backers Deposit into the Vault"
              description="Backers transfer ETH or ERC-20 tokens directly into the Grant.sol escrow contract. Funds are held autonomously - no intermediaries, no multisig."
              code="Grant.deposit(milestoneId) -> vault[msg.sender] += msg.value"
            />
            <ProtocolStep
              step=""
              title="2. Event-Driven Off-Chain Sync"
              description="A Node.js service subscribes to contract events via WebSocket. Each Deposit and Refund event is indexed to PostgreSQL, tracking progress against predefined milestones."
              code="WS -> blockchainListener.ts -> Prisma -> PostgreSQL"
            />
            <ProtocolStep
              step=""
              title="3. Release Milestone Funds or Auto-Revert"
              description="Upon milestone approval, the verified milestone funds are unlocked. Upon failure, refundBackers() auto-routes remaining funds back to original backer wallets."
              code="Grant.releaseTranche(idx) | Grant.refundBackers() -> vault[backer] = 0"
            />
          </SimpleGrid>
        </Container>
      </Box>

      {/* ── Projects (Client Component) ── */}
      <ProjectsSection />

      {/* ── Footer ── */}
      <Box borderTop="1px solid #1F1F23" py={8} bg="#0D0D0F">
        <Container maxW="6xl">
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
            <Text
              fontFamily="var(--font-space-grotesk), sans-serif"
              fontSize="sm"
              fontWeight="700"
              color="#F4F4F5"
            >
              GreenLight
            </Text>
            <Text fontSize="xs" color="#52525B" fontWeight="500">
              Funds held in smart contract escrow · Built on Ethereum · Open Source
            </Text>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}
