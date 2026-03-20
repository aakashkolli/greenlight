'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Alert,
  AlertIcon,
  Flex,
  VStack,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatEther } from 'viem';
import { useAccount } from 'wagmi';
import { Navbar } from '@/components/Navbar';
import { UserActivity, getUserActivity } from '@/lib/data';

export default function ActivityPage() {
  const { address, isConnected } = useAccount();
  const [userData, setUserData] = useState<UserActivity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    getUserActivity(address)
      .then((data) => {
        setUserData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [address]);

  return (
    <Box minH="100vh" bg="#09090B">
      <Navbar />

      <Container maxW="5xl" py={12}>
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
            Activity
          </Heading>
        </Box>

        {!isConnected && (
          <Alert status="warning" borderRadius="0" bg="#18181B" border="1px solid #3F2A00">
            <AlertIcon />
            <Text fontSize="sm" color="#A1A1AA">Connect your wallet to view your activity.</Text>
          </Alert>
        )}

        {isConnected && loading && (
          <Flex justify="center" py={20}>
            <Spinner size="xl" color="#00FF66" thickness="2px" />
          </Flex>
        )}

        {error && (
          <Alert status="error" borderRadius="0" bg="#18181B" border="1px solid #3F1515">
            <AlertIcon />
            <Text fontSize="sm" color="#A1A1AA">{error}</Text>
          </Alert>
        )}

        {isConnected && !loading && !error && (
          <VStack spacing={6} align="stretch">
            {/* My Projects */}
            <Box bg="#111113" border="1px solid #27272A" borderRadius="12px" overflow="hidden">
              <Box p={5} borderBottomWidth="1px" borderColor="#27272A">
                <Heading
                  size="sm"
                  fontFamily="var(--font-space-grotesk), sans-serif"
                  color="#F4F4F5"
                >
                  Projects ({userData?.projects.length ?? 0})
                </Heading>
              </Box>
              {!userData?.projects.length ? (
                <Text p={5} color="#52525B" fontSize="sm">
                  You haven&apos;t created any projects yet.
                </Text>
              ) : (
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th color="#52525B" borderColor="#27272A" fontSize="xs" fontWeight="600" letterSpacing="wide">Title</Th>
                      <Th isNumeric color="#52525B" borderColor="#27272A" fontSize="xs" fontWeight="600" letterSpacing="wide">Goal</Th>
                      <Th isNumeric color="#52525B" borderColor="#27272A" fontSize="xs" fontWeight="600" letterSpacing="wide">Raised</Th>
                      <Th color="#52525B" borderColor="#27272A" fontSize="xs" fontWeight="600" letterSpacing="wide">Deadline</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {userData.projects.map((p) => (
                      <Tr key={p.id} _hover={{ bg: '#18181B' }} transition="background 0.1s ease">
                        <Td borderColor="#27272A">
                          <ChakraLink as={Link} href={`/project/${p.id}`} color="#00FF66" _hover={{ color: '#4dff94' }}>
                            {p.title}
                          </ChakraLink>
                        </Td>
                        <Td isNumeric borderColor="#27272A" color="#A1A1AA" fontSize="sm">
                          {parseFloat(formatEther(BigInt(p.goalAmount))).toFixed(3)} ETH
                        </Td>
                        <Td isNumeric borderColor="#27272A" color="#A1A1AA" fontSize="sm">
                          {parseFloat(formatEther(BigInt(p.amountRaised))).toFixed(3)} ETH
                        </Td>
                        <Td borderColor="#27272A" color="#71717A" fontSize="sm">
                          {new Date(p.deadline).toLocaleDateString()}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </Box>

            {/* My Contributions */}
            <Box bg="#111113" border="1px solid #27272A" borderRadius="12px" overflow="hidden">
              <Box p={5} borderBottomWidth="1px" borderColor="#27272A">
                <Heading
                  size="sm"
                  fontFamily="var(--font-space-grotesk), sans-serif"
                  color="#F4F4F5"
                >
                  Contributions ({userData?.contributions.length ?? 0})
                </Heading>
              </Box>
              {!userData?.contributions.length ? (
                <Text p={5} color="#52525B" fontSize="sm">
                  You haven&apos;t backed any projects yet.
                </Text>
              ) : (
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th color="#52525B" borderColor="#27272A" fontSize="xs" fontWeight="600" letterSpacing="wide">Project</Th>
                      <Th isNumeric color="#52525B" borderColor="#27272A" fontSize="xs" fontWeight="600" letterSpacing="wide">Amount</Th>
                      <Th color="#52525B" borderColor="#27272A" fontSize="xs" fontWeight="600" letterSpacing="wide">Status</Th>
                      <Th color="#52525B" borderColor="#27272A" fontSize="xs" fontWeight="600" letterSpacing="wide">Date</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {userData.contributions.map((c) => (
                      <Tr key={c.id} opacity={c.refunded ? 0.5 : 1} _hover={{ bg: '#18181B' }} transition="background 0.1s ease">
                        <Td borderColor="#27272A">
                          <ChakraLink as={Link} href={`/project/${c.project.id}`} color="#00FF66" _hover={{ color: '#4dff94' }}>
                            {c.project.title}
                          </ChakraLink>
                        </Td>
                        <Td isNumeric borderColor="#27272A" color="#A1A1AA" fontSize="sm">
                          {parseFloat(formatEther(BigInt(c.amount))).toFixed(4)} ETH
                        </Td>
                        <Td borderColor="#27272A">
                          <Text
                            fontSize="xs"
                            fontWeight="600"
                            color={c.refunded ? '#52525B' : '#00FF66'}
                            letterSpacing="wide"
                          >
                            {c.refunded ? 'Refunded' : 'Active'}
                          </Text>
                        </Td>
                        <Td borderColor="#27272A" color="#71717A" fontSize="sm">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </Box>
          </VStack>
        )}
      </Container>
    </Box>
  );
}
