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
    <Box minH="100vh" bg="#f4f8fb">
      <Navbar />

      <Container maxW="5xl" py={10}>
        <Heading mb={8}>My Activity</Heading>

        {!isConnected && (
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            Connect your wallet to view your activity.
          </Alert>
        )}

        {isConnected && loading && (
          <Flex justify="center" py={12}>
            <Spinner size="xl" color="teal.500" />
          </Flex>
        )}

        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {isConnected && !loading && !error && (
          <VStack spacing={10} align="stretch">
            <Box bg="white" borderRadius="xl" borderWidth="1px" overflow="hidden">
              <Box p={4} borderBottomWidth="1px">
                <Heading size="md">My Projects ({userData?.projects.length ?? 0})</Heading>
              </Box>
              {!userData?.projects.length ? (
                <Text p={4} color="gray.500">You haven&apos;t created any projects yet.</Text>
              ) : (
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>Title</Th>
                      <Th isNumeric>Goal</Th>
                      <Th isNumeric>Raised</Th>
                      <Th>Deadline</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {userData.projects.map((p) => (
                      <Tr key={p.id}>
                        <Td>
                          <ChakraLink as={Link} href={`/project/${p.id}`} color="brand.600">
                            {p.title}
                          </ChakraLink>
                        </Td>
                        <Td isNumeric>{parseFloat(formatEther(BigInt(p.goalAmount))).toFixed(3)} ETH</Td>
                        <Td isNumeric>{parseFloat(formatEther(BigInt(p.amountRaised))).toFixed(3)} ETH</Td>
                        <Td>{new Date(p.deadline).toLocaleDateString()}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </Box>

            <Box bg="white" borderRadius="xl" borderWidth="1px" overflow="hidden">
              <Box p={4} borderBottomWidth="1px">
                <Heading size="md">My Contributions ({userData?.contributions.length ?? 0})</Heading>
              </Box>
              {!userData?.contributions.length ? (
                <Text p={4} color="gray.500">You haven&apos;t backed any projects yet.</Text>
              ) : (
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>Project</Th>
                      <Th isNumeric>Amount</Th>
                      <Th>Status</Th>
                      <Th>Date</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {userData.contributions.map((c) => (
                      <Tr key={c.id} opacity={c.refunded ? 0.6 : 1}>
                        <Td>
                          <ChakraLink as={Link} href={`/project/${c.project.id}`} color="brand.600">
                            {c.project.title}
                          </ChakraLink>
                        </Td>
                        <Td isNumeric>{parseFloat(formatEther(BigInt(c.amount))).toFixed(4)} ETH</Td>
                        <Td>
                          <Text fontSize="sm" fontWeight="bold" color="black">
                            {c.refunded ? 'Refunded' : 'Active'}
                          </Text>
                        </Td>
                        <Td>{new Date(c.createdAt).toLocaleDateString()}</Td>
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
