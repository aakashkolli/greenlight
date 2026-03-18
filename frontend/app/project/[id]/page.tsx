'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Image,
  Badge,
  VStack,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useDisclosure,
  Spinner,
  Alert,
  AlertIcon,
  Flex,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  IconButton,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatEther } from 'viem';
import { useAccount } from 'wagmi';
import { ProgressBar } from '@/components/ProgressBar';
import { DepositModal } from '@/components/DepositModal';
import { Navbar } from '@/components/Navbar';
import { API_BASE } from '@/lib/contracts';
import { Project, getProjectStatus } from '@/lib/types';
import { useDeadlineCountdown } from '@/lib/useDeadlineCountdown';
import { useGrantContract } from '@/lib/useGrantContract';
import { projectGradient } from '@/lib/projectImage';

function CopyButton({ text }: { text: string }) {
  const toast = useToast();
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: 'Copied!', status: 'success', duration: 2000, isClosable: true });
    });
  };
  return (
    <Tooltip label="Copy address">
      <IconButton aria-label="Copy contract address" icon={<>📋</>} size="xs" variant="ghost" onClick={handleCopy} />
    </Tooltip>
  );
}

const STATUS_BADGE: Record<string, { label: string; colorScheme: string }> = {
  funded:  { label: 'Funded',  colorScheme: 'green' },
  expired: { label: 'Expired', colorScheme: 'red' },
  active:  { label: 'Active',  colorScheme: 'teal' },
};

export default function ProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const toast = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { address } = useAccount();

  // Confirm dialog state
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
  const [pendingAction, setPendingAction] = useState<'withdraw' | 'refund' | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const fetchProject = useCallback(() => {
    fetch(`${API_BASE}/projects/${params.id}`)
      .then((r) => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then((data) => {
        setProject(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [params.id]);

  useEffect(() => {
    fetchProject();
    const poll = setInterval(fetchProject, 15_000);
    return () => clearInterval(poll);
  }, [fetchProject]);

  // Auto-redirect on 404
  useEffect(() => {
    if (!loading && !project) {
      const t = setTimeout(() => router.push('/'), 3000);
      return () => clearTimeout(t);
    }
  }, [loading, project, router]);

  const grantAddr = project?.grantContractAddress as `0x${string}` | undefined;
  const { withdraw, refund, withdrawPending, refundPending, withdrawDone, refundDone, withdrawError, refundError } =
    useGrantContract(grantAddr ?? '0x0');

  // Refresh on tx completion
  useEffect(() => {
    if (withdrawDone || refundDone) fetchProject();
  }, [withdrawDone, refundDone, fetchProject]);

  // Toast on errors
  useEffect(() => {
    if (withdrawError) toast({ title: 'Withdraw failed', description: withdrawError.message.slice(0, 120), status: 'error', duration: 5000 });
  }, [withdrawError, toast]);
  useEffect(() => {
    if (refundError) toast({ title: 'Refund failed', description: refundError.message.slice(0, 120), status: 'error', duration: 5000 });
  }, [refundError, toast]);

  // All hooks must be called unconditionally — before any early returns
  const countdown = useDeadlineCountdown(project?.deadline ?? '');
  const status = project ? getProjectStatus(project) : 'active';
  const badge = STATUS_BADGE[status];
  const isCreator = address?.toLowerCase() === project?.creatorWallet.toLowerCase();

  const handleConfirm = () => {
    onConfirmClose();
    if (pendingAction === 'withdraw') withdraw();
    if (pendingAction === 'refund') refund();
    setPendingAction(null);
  };

  if (loading) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Spinner size="xl" color="teal.500" />
      </Flex>
    );
  }

  if (error || !project) {
    return (
      <Container maxW="2xl" py={12}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error || 'Project not found'}. Redirecting in 3 seconds...
        </Alert>
        <Link href="/">
          <Button mt={4}>Back to Projects</Button>
        </Link>
      </Container>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar maxW="5xl" />

      <Container maxW="5xl" py={10}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <HStack justify="space-between" align="start" flexWrap="wrap" gap={2}>
            <VStack align="start" spacing={1}>
              <HStack>
                <Heading size="xl">{project.title}</Heading>
                <Badge colorScheme={badge.colorScheme} fontSize="sm">
                  {badge.label}
                </Badge>
              </HStack>
              <Text color="gray.500" fontSize="sm">
                by {project.creatorWallet.slice(0, 6)}...{project.creatorWallet.slice(-4)}
              </Text>
            </VStack>

            {/* Action buttons */}
            <HStack>
              {status === 'active' && (
                <Button colorScheme="teal" onClick={onOpen} isDisabled={!address}>
                  Deposit ETH
                </Button>
              )}
              {isCreator && status === 'funded' && (
                <Button
                  colorScheme="green"
                  isLoading={withdrawPending}
                  onClick={() => { setPendingAction('withdraw'); onConfirmOpen(); }}
                >
                  Withdraw Funds
                </Button>
              )}
              {status === 'expired' && address && (
                <Button
                  colorScheme="orange"
                  isLoading={refundPending}
                  onClick={() => { setPendingAction('refund'); onConfirmOpen(); }}
                >
                  Claim Refund
                </Button>
              )}
            </HStack>
          </HStack>

          {/* Hero image / gradient */}
          {project.imageUrl ? (
            <Image
              src={project.imageUrl}
              alt={project.title}
              borderRadius="xl"
              w="full"
              h="72"
              objectFit="cover"
              fallback={
                <Flex
                  borderRadius="xl"
                  w="full"
                  h="72"
                  style={{ background: projectGradient(project.id) }}
                  align="center"
                  justify="center"
                >
                  <Text color="white" fontSize="6xl" fontWeight="bold" opacity={0.5}>
                    {project.title[0]}
                  </Text>
                </Flex>
              }
            />
          ) : (
            <Flex
              borderRadius="xl"
              w="full"
              h="72"
              style={{ background: projectGradient(project.id) }}
              align="center"
              justify="center"
            >
              <Text color="white" fontSize="6xl" fontWeight="bold" opacity={0.5}>
                {project.title[0]}
              </Text>
            </Flex>
          )}

          {/* Progress */}
          <Box bg="white" p={6} borderRadius="lg" borderWidth="1px">
            <ProgressBar amountRaised={project.amountRaised} goalAmount={project.goalAmount} />
            <HStack justify="space-between" mt={4} color="gray.600" fontSize="sm">
              <Text>{countdown}</Text>
              <Text>{project.contributions?.length ?? 0} backers</Text>
            </HStack>
          </Box>

          {/* Description */}
          <Box bg="white" p={6} borderRadius="lg" borderWidth="1px">
            <Heading size="md" mb={4}>About this project</Heading>
            <Text color="gray.700" whiteSpace="pre-wrap">{project.description}</Text>
          </Box>

          {/* Contract info */}
          <Box bg="white" p={6} borderRadius="lg" borderWidth="1px">
            <Heading size="sm" mb={2}>Smart Contract</Heading>
            <HStack>
              <Text fontSize="xs" fontFamily="mono" color="gray.500">
                {project.grantContractAddress}
              </Text>
              <CopyButton text={project.grantContractAddress} />
            </HStack>
          </Box>

          {/* Contributions */}
          {project.contributions && project.contributions.length > 0 && (
            <Box bg="white" borderRadius="lg" borderWidth="1px" overflow="hidden">
              <Box p={4} borderBottomWidth="1px">
                <Heading size="md">Contributions</Heading>
              </Box>
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Backer</Th>
                    <Th isNumeric>Amount</Th>
                    <Th>Status</Th>
                    <Th>Date</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {project.contributions.map((c) => (
                    <Tr key={c.id} opacity={c.refunded ? 0.5 : 1}>
                      <Td fontFamily="mono" fontSize="xs">
                        {c.walletAddress.slice(0, 6)}...{c.walletAddress.slice(-4)}
                      </Td>
                      <Td isNumeric>{parseFloat(formatEther(BigInt(c.amount))).toFixed(4)} ETH</Td>
                      <Td>
                        {c.refunded && <Badge colorScheme="orange" fontSize="xs">Refunded</Badge>}
                      </Td>
                      <Td>{new Date(c.createdAt).toLocaleDateString()}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </VStack>
      </Container>

      <DepositModal
        isOpen={isOpen}
        onClose={onClose}
        grantAddress={project.grantContractAddress as `0x${string}`}
        projectId={project.id}
        onSuccess={fetchProject}
      />

      {/* Confirmation dialog */}
      <AlertDialog isOpen={isConfirmOpen} leastDestructiveRef={cancelRef} onClose={onConfirmClose} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>
              {pendingAction === 'withdraw' ? 'Withdraw Funds' : 'Claim Refund'}
            </AlertDialogHeader>
            <AlertDialogBody>
              {pendingAction === 'withdraw'
                ? 'This will transfer all escrowed funds to your wallet. This action cannot be undone.'
                : 'This will return your contribution to your wallet. This action cannot be undone.'}
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onConfirmClose}>Cancel</Button>
              <Button
                colorScheme={pendingAction === 'withdraw' ? 'green' : 'orange'}
                onClick={handleConfirm}
                ml={3}
              >
                Confirm
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
