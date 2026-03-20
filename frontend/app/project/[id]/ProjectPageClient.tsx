'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Image,
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
  Badge,
} from '@chakra-ui/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatEther } from 'viem';
import { useAccount } from 'wagmi';
import { ProgressBar } from '@/components/ProgressBar';
import { DepositModal } from '@/components/DepositModal';
import { Navbar } from '@/components/Navbar';
import { Project, getProjectStatus } from '@/lib/types';
import { useGrantContract } from '@/lib/useGrantContract';
import { projectGradient } from '@/lib/projectImage';
import { DEMO_MODE, getProjectById } from '@/lib/data';
import { useDemoMode } from '@/lib/DemoModeContext';

function CopyButton({ text }: { text: string }) {
  const toast = useToast();
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: 'Copied', status: 'success', duration: 2000, isClosable: true });
    });
  };
  return (
    <Tooltip label="Copy address">
      <IconButton aria-label="Copy contract address" icon={<>📋</>} size="xs" variant="ghost" onClick={handleCopy} />
    </Tooltip>
  );
}

const STATUS_LABEL: Record<string, string> = {
  funded: 'Status: Successful',
  expired: 'Status: Closed',
  active: 'Status: Open',
};

export default function ProjectPageClient({ params }: { params: { id: string } }) {
  const router = useRouter();
  const toast = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { address } = useAccount();
  const { demoActive } = useDemoMode();

  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
  const [pendingAction, setPendingAction] = useState<'withdraw' | 'refund' | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const fetchProject = useCallback(() => {
    getProjectById(params.id)
      .then((data) => {
        if (!data) throw new Error('Not found');
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
    if (DEMO_MODE) return;
    const poll = setInterval(fetchProject, 15_000);
    return () => clearInterval(poll);
  }, [fetchProject]);

  useEffect(() => {
    if (!loading && !project) {
      const timeout = setTimeout(() => router.push('/'), 3000);
      return () => clearTimeout(timeout);
    }
  }, [loading, project, router]);

  const grantAddr = project?.grantContractAddress as `0x${string}` | undefined;
  const { withdraw, refund, withdrawPending, refundPending, withdrawDone, refundDone, withdrawError, refundError } =
    useGrantContract(grantAddr ?? '0x0');

  useEffect(() => {
    if (withdrawDone || refundDone) fetchProject();
  }, [withdrawDone, refundDone, fetchProject]);

  useEffect(() => {
    if (withdrawError) {
      toast({ title: 'Withdraw failed', description: withdrawError.message.slice(0, 120), status: 'error', duration: 5000 });
    }
  }, [withdrawError, toast]);

  useEffect(() => {
    if (refundError) {
      toast({ title: 'Refund failed', description: refundError.message.slice(0, 120), status: 'error', duration: 5000 });
    }
  }, [refundError, toast]);

  const status = project ? getProjectStatus(project) : 'active';
  const statusLabel = STATUS_LABEL[status];
  const isCreator = address?.toLowerCase() === project?.creatorWallet.toLowerCase();
  const endDate = project
    ? new Date(project.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : '';
  const canDeposit = status === 'active' && (DEMO_MODE ? demoActive : !!address);

  const handleConfirm = () => {
    onConfirmClose();
    if (pendingAction === 'withdraw') withdraw();
    if (pendingAction === 'refund') refund();
    setPendingAction(null);
  };

  if (loading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="#09090B">
        <Spinner size="xl" color="brand.600" />
      </Flex>
    );
  }

  if (error || !project) {
    return (
      <Container maxW="2xl" py={12}>
        <Alert status="error" borderRadius="md" bg="#18181B" borderColor="#27272A">
          <AlertIcon />
          {error || 'Project not found'}. Redirecting in 3 seconds...
        </Alert>
        <Link href="/">
          <Button mt={4} bg="#00FF66" color="#09090B" borderRadius="0">Back to Projects</Button>
        </Link>
      </Container>
    );
  }

  return (
    <Box minH="100vh" bg="#09090B">
      <Navbar maxW="5xl" />

      <Container maxW="5xl" py={10}>
        <VStack spacing={8} align="stretch">
          <HStack justify="space-between" align="start" flexWrap="wrap" gap={2}>
            <VStack align="start" spacing={1}>
              <Heading size="xl" color="#F4F4F5">{project.title}</Heading>
              <Text fontSize="sm" fontWeight="bold" color="#A1A1AA">{statusLabel}</Text>
              <Text color="#71717A" fontSize="sm">
                by {project.creatorWallet.slice(0, 6)}...{project.creatorWallet.slice(-4)}
              </Text>
            </VStack>

            <HStack>
              {status === 'active' && canDeposit && (
                <Button bg="#00FF66" color="#09090B" _hover={{ bg: '#00FF66' }} onClick={onOpen} borderRadius="0">
                  Deposit ETH
                </Button>
              )}
              {isCreator && status === 'funded' && (
                <Button
                  colorScheme="green"
                  isLoading={withdrawPending}
                  onClick={() => {
                    setPendingAction('withdraw');
                    onConfirmOpen();
                  }}
                  isDisabled={DEMO_MODE}
                >
                  Withdraw Funds
                </Button>
              )}
              {status === 'expired' && address && (
                <Button
                  colorScheme="cyan"
                  isLoading={refundPending}
                  onClick={() => {
                    setPendingAction('refund');
                    onConfirmOpen();
                  }}
                  isDisabled={DEMO_MODE}
                >
                  Claim Refund
                </Button>
              )}
            </HStack>
          </HStack>

          {project.imageUrl && typeof project.imageUrl === 'string' && project.imageUrl.trim().length > 0 && project.imageUrl.startsWith('http') ? (
            <Image
              src={project.imageUrl}
              alt={project.title}
              borderRadius="xl"
              w="full"
              h="72"
              objectFit="cover"
              opacity={0.9}
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

          <Box bg="#111113" p={6} borderRadius="12px" border="1px solid #27272A">
            <ProgressBar amountRaised={project.amountRaised} goalAmount={project.goalAmount} />
            <HStack justify="space-between" mt={4} color="#D4D4D8" fontSize="sm" fontWeight="semibold">
              <Text>Ends {endDate}</Text>
              <Text>{project.contributions?.length ?? 0} backers</Text>
            </HStack>
          </Box>

          <Box bg="#111113" p={6} borderRadius="12px" border="1px solid #27272A">
            <Heading size="md" mb={4} color="#F4F4F5">About this project</Heading>
            <Text color="#A1A1AA" whiteSpace="pre-wrap">{project.description}</Text>
          </Box>

          {project.milestones && project.milestones.length > 0 && (
            <Box bg="#111113" p={6} borderRadius="12px" border="1px solid #27272A">
              <Heading size="md" mb={4} color="#F4F4F5">Milestones</Heading>
              <VStack align="stretch" spacing={4}>
                {project.milestones.map((milestone, index) => (
                  <HStack
                    key={`${milestone.title}-${index}`}
                    align="start"
                    spacing={4}
                    p={4}
                    border="1px solid"
                    borderColor={milestone.completed ? '#00FF6640' : '#27272A'}
                    borderRadius="10px"
                    bg={milestone.completed ? '#00FF660D' : '#18181B'}
                  >
                    <Flex
                      w="28px"
                      h="28px"
                      align="center"
                      justify="center"
                      borderRadius="full"
                      bg={milestone.completed ? '#00FF662A' : '#27272A'}
                      color={milestone.completed ? '#00FF66' : '#A1A1AA'}
                      fontWeight="700"
                      fontSize="xs"
                      flexShrink={0}
                    >
                      {index + 1}
                    </Flex>
                    <VStack align="start" spacing={1} flex={1}>
                      <HStack justify="space-between" w="full" flexWrap="wrap">
                        <Text color="#F4F4F5" fontWeight="600">{milestone.title}</Text>
                        <HStack spacing={2}>
                          <Badge bg="#18181B" color="#A1A1AA" border="1px solid #27272A" borderRadius="4px">
                            {milestone.tranchePercent}% tranche
                          </Badge>
                          {milestone.completed ? (
                            <Badge bg="#00FF661A" color="#00FF66" border="1px solid #00FF6640" borderRadius="4px">
                              Completed
                            </Badge>
                          ) : (
                            <Badge bg="#18181B" color="#A1A1AA" border="1px solid #27272A" borderRadius="4px">
                              Pending
                            </Badge>
                          )}
                        </HStack>
                      </HStack>
                      <Text color="#A1A1AA" fontSize="sm">{milestone.description}</Text>
                      <Text color="#71717A" fontSize="xs">
                        Target: {new Date(milestone.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Text>
                    </VStack>
                  </HStack>
                ))}
              </VStack>
            </Box>
          )}

          <Box bg="#111113" p={6} borderRadius="12px" border="1px solid #27272A">
            <Heading size="sm" mb={2} color="#F4F4F5">Smart Contract</Heading>
            <HStack>
              <Text fontSize="xs" color="#71717A">
                {project.grantContractAddress}
              </Text>
              <CopyButton text={project.grantContractAddress} />
            </HStack>
          </Box>

          {project.contributions && project.contributions.length > 0 && (
            <Box bg="#111113" borderRadius="12px" border="1px solid #27272A" overflow="hidden">
              <Box p={4} borderBottomWidth="1px" borderColor="#27272A">
                <Heading size="md" color="#F4F4F5">Contributions</Heading>
              </Box>
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th color="#71717A">Backer</Th>
                    <Th isNumeric color="#71717A">Amount</Th>
                    <Th color="#71717A">Status</Th>
                    <Th color="#71717A">Date</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {project.contributions.map((c) => (
                    <Tr key={c.id} opacity={c.refunded ? 0.5 : 1}>
                      <Td fontSize="xs" color="#D4D4D8">
                        {c.walletAddress.slice(0, 6)}...{c.walletAddress.slice(-4)}
                      </Td>
                      <Td isNumeric color="#D4D4D8">{parseFloat(formatEther(BigInt(c.amount))).toFixed(4)} ETH</Td>
                      <Td>
                        <Text fontSize="xs" fontWeight="bold" color={c.refunded ? '#F87171' : '#71717A'}>
                          {c.refunded ? 'Refunded' : '-'}
                        </Text>
                      </Td>
                      <Td color="#A1A1AA">{new Date(c.createdAt).toLocaleDateString()}</Td>
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

      <AlertDialog isOpen={isConfirmOpen} leastDestructiveRef={cancelRef} onClose={onConfirmClose} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>{pendingAction === 'withdraw' ? 'Withdraw Funds' : 'Claim Refund'}</AlertDialogHeader>
            <AlertDialogBody>
              {pendingAction === 'withdraw'
                ? 'This transfers all escrowed funds to your wallet. This action cannot be undone.'
                : 'This returns your contribution to your wallet. This action cannot be undone.'}
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onConfirmClose}>Cancel</Button>
              <Button colorScheme="cyan" onClick={handleConfirm} ml={3}>
                Confirm
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
