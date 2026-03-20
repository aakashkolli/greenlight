'use client';

import {
  Box,
  Container,
  Heading,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  Textarea,
  Button,
  VStack,
  Alert,
  AlertIcon,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { parseEther, decodeEventLog } from 'viem';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Navbar } from '@/components/Navbar';
import { GRANT_FACTORY_ABI, FACTORY_ADDRESS, API_BASE } from '@/lib/contracts';
import { useDemoMode } from '@/lib/DemoModeContext';

const IMAGE_URL_RE = /^https?:\/\/.+/;
// Valid hex address used as creator wallet for demo-launched projects
const DEMO_CREATOR_ADDR = '0xde4d0000000000000000000000000000deadbeef';

interface FormState {
  title: string;
  description: string;
  imageUrl: string;
  goalEth: string;
  deadlineDays: string;
}

function validateForm(form: FormState): Partial<Record<keyof FormState, string>> {
  const errors: Partial<Record<keyof FormState, string>> = {};
  if (form.title.trim().length < 5 || form.title.trim().length > 100)
    errors.title = 'Title must be 5–100 characters';
  if (form.description.trim().length < 20 || form.description.trim().length > 2000)
    errors.description = 'Description must be 20–2000 characters';
  if (form.imageUrl && !IMAGE_URL_RE.test(form.imageUrl))
    errors.imageUrl = 'Must start with http:// or https://';
  const goal = parseFloat(form.goalEth);
  if (!form.goalEth || isNaN(goal) || goal <= 0 || goal > 1000)
    errors.goalEth = 'Goal must be between 0 and 1000 ETH';
  const days = parseInt(form.deadlineDays);
  if (!form.deadlineDays || isNaN(days) || days < 1 || days > 365)
    errors.deadlineDays = 'Duration must be 1–365 days';
  return errors;
}

export default function CreatePage() {
  const router = useRouter();
  const toast = useToast();
  const { address, isConnected } = useAccount();
  const { isDemoMode, demoActive } = useDemoMode();

  const [form, setForm] = useState<FormState>({
    title: '',
    description: '',
    imageUrl: '',
    goalEth: '',
    deadlineDays: '',
  });
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [step, setStep] = useState<'idle' | 'deploying' | 'saving' | 'done'>('idle');

  const { writeContract, data: txHash, isPending, error: writeError } = useWriteContract();
  const { data: receipt, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const fieldErrors = validateForm(form);
  const isValid = Object.keys(fieldErrors).length === 0;

  const blur = (name: keyof FormState) => () => setTouched((t) => ({ ...t, [name]: true }));
  const change = (name: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm((f) => ({ ...f, [name]: e.target.value }));

  // ── Production: save after contract deploy ─────────────────────────────────
  const handleSaveToBackend = useCallback(async () => {
    if (!receipt || !address) return;

    let grantAddress = '';
    for (const log of receipt.logs) {
      if (log.address.toLowerCase() === FACTORY_ADDRESS.toLowerCase()) {
        try {
          const decoded = decodeEventLog({ abi: GRANT_FACTORY_ABI, data: log.data, topics: log.topics });
          if (decoded.eventName === 'GrantCreated') {
            grantAddress = (decoded.args as { grantAddress: string }).grantAddress;
            break;
          }
        } catch {
          // not this event
        }
      }
    }

    if (!grantAddress) {
      toast({ title: 'Could not parse contract address from receipt', status: 'error' });
      setStep('idle');
      return;
    }

    setStep('saving');
    try {
      const deadlineTs = Date.now() + parseInt(form.deadlineDays) * 24 * 60 * 60 * 1000;
      const res = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grantContractAddress: grantAddress,
          title: form.title,
          description: form.description,
          imageUrl: form.imageUrl || null,
          goalAmount: parseEther(form.goalEth).toString(),
          deadline: new Date(deadlineTs).toISOString(),
          creatorWallet: address,
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      const project = await res.json();
      setStep('done');
      toast({ title: 'Project launched!', status: 'success', duration: 3000 });
      router.push(`/project/${project.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({ title: 'Failed to save project', description: message, status: 'error' });
      setStep('idle');
    }
  }, [receipt, address, form, toast, router]);

  const hasSaved = useRef(false);
  useEffect(() => {
    if (isSuccess && step === 'deploying' && !hasSaved.current) {
      hasSaved.current = true;
      handleSaveToBackend();
    }
  }, [isSuccess, step, handleSaveToBackend]);

  useEffect(() => {
    if (writeError) {
      toast({
        title: 'Transaction failed',
        description: writeError.message.slice(0, 120),
        status: 'error',
        duration: 5000,
      });
      setStep('idle');
    }
  }, [writeError, toast]);

  // ── Demo: simulate deploy + save directly ──────────────────────────────────
  const handleDemoSubmit = useCallback(async () => {
    if (!isValid || step !== 'idle') return;
    hasSaved.current = false;
    setStep('deploying');

    // Simulate tx confirmation latency
    await new Promise<void>((r) => setTimeout(r, 1500));

    setStep('saving');
    try {
      // Unique valid hex address derived from timestamp
      const fakeContractAddr = `0x${Date.now().toString(16).padStart(40, '0')}`;
      const deadlineTs = Date.now() + parseInt(form.deadlineDays) * 24 * 60 * 60 * 1000;
      const res = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grantContractAddress: fakeContractAddr,
          title: form.title,
          description: form.description,
          imageUrl: form.imageUrl || null,
          goalAmount: parseEther(form.goalEth).toString(),
          deadline: new Date(deadlineTs).toISOString(),
          creatorWallet: DEMO_CREATOR_ADDR,
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      const project = await res.json();
      setStep('done');
      toast({ title: 'Project launched!', status: 'success', duration: 3000 });
      router.push(`/project/${project.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({ title: 'Failed to create project', description: message, status: 'error' });
      setStep('idle');
    }
  }, [isValid, step, form, toast, router]);

  const handleSubmit = () => {
    if (isDemoMode) {
      handleDemoSubmit();
      return;
    }
    if (!isConnected || !address || !isValid) return;
    hasSaved.current = false;
    setStep('deploying');
    writeContract({
      address: FACTORY_ADDRESS,
      abi: GRANT_FACTORY_ABI,
      functionName: 'createGrant',
      args: [parseEther(form.goalEth), BigInt(Math.floor(Date.now() / 1000) + parseInt(form.deadlineDays) * 86400)],
    });
  };

  const isSubmitDisabled = isDemoMode
    ? !demoActive || !isValid || step !== 'idle'
    : !isConnected || !isValid || step !== 'idle';

  const descLen = form.description.trim().length;

  return (
    <Box minH="100vh" bg="#09090B">
      <Navbar maxW="3xl" />

      <Container maxW="3xl" py={12}>
        <Box mb={8}>
          <Text fontSize="xs" color="#52525B" fontWeight="600" letterSpacing="wide" mb={3}>
            Protocol
          </Text>
          <Heading
            fontFamily="var(--font-space-grotesk), sans-serif"
            fontWeight="700"
            fontSize={{ base: '2xl', md: '3xl' }}
            color="#F4F4F5"
            mb={2}
          >
            Launch a Project
          </Heading>
          <Text color="#71717A" fontSize="sm">
            Deploy an escrow contract and publish your campaign.
          </Text>
        </Box>

        {isDemoMode && !demoActive && (
          <Alert status="info" mb={6} borderRadius="0" bg="#18181B" border="1px solid #1F3050">
            <AlertIcon color="#00FF66" />
            <Text fontSize="sm" color="#A1A1AA">
              Click <strong style={{ color: '#F4F4F5' }}>Run Demo</strong> in the top-right to activate the sandbox and create a simulated project.
            </Text>
          </Alert>
        )}

        {isDemoMode && demoActive && (
          <Alert status="info" mb={6} borderRadius="0" bg="#0D1A0D" border="1px solid #00FF6630">
            <AlertIcon color="#00FF66" />
            <Text fontSize="sm" color="#A1A1AA">
              Sandbox mode — your project will be created with a simulated contract address. No real ETH is used.
            </Text>
          </Alert>
        )}

        {!isDemoMode && !isConnected && (
          <Alert status="warning" mb={6} borderRadius="0" bg="#18181B" border="1px solid #3F2A00">
            <AlertIcon />
            <Text fontSize="sm" color="#A1A1AA">Connect your wallet to launch a project.</Text>
          </Alert>
        )}

        <Box bg="#111113" p={8} borderRadius="12px" border="1px solid #27272A">
          <VStack spacing={5}>
            <FormControl isRequired isInvalid={!!touched.title && !!fieldErrors.title}>
              <FormLabel color="#A1A1AA" fontSize="sm" fontWeight="500">Title</FormLabel>
              <Input
                placeholder="Give your project a compelling title"
                value={form.title}
                onChange={change('title')}
                onBlur={blur('title')}
              />
              <FormErrorMessage fontSize="xs">{fieldErrors.title}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!touched.description && !!fieldErrors.description}>
              <FormLabel color="#A1A1AA" fontSize="sm" fontWeight="500">Description</FormLabel>
              <Textarea
                placeholder="Describe your project, its goals, and how funds will be used..."
                rows={6}
                value={form.description}
                onChange={change('description')}
                onBlur={blur('description')}
                resize="vertical"
                bg="#18181B"
                borderColor="#27272A"
                color="#F4F4F5"
                _hover={{ borderColor: '#3F3F46' }}
                _focus={{ borderColor: '#00FF66', boxShadow: '0 0 0 1px #00FF66' }}
                _placeholder={{ color: '#52525B' }}
              />
              <FormHelperText
                fontSize="xs"
                color={descLen > 2000 ? '#F87171' : descLen >= 20 ? '#00FF66' : '#52525B'}
              >
                {descLen}/2000 characters
              </FormHelperText>
              <FormErrorMessage fontSize="xs">{fieldErrors.description}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!touched.imageUrl && !!fieldErrors.imageUrl}>
              <FormLabel color="#A1A1AA" fontSize="sm" fontWeight="500">
                Cover Image URL{' '}
                <Text as="span" color="#52525B" fontWeight="normal">(optional)</Text>
              </FormLabel>
              <Input
                placeholder="https://example.com/image.jpg"
                value={form.imageUrl}
                onChange={change('imageUrl')}
                onBlur={blur('imageUrl')}
              />
              <FormHelperText fontSize="xs" color="#52525B">Leave blank to use an auto-generated gradient.</FormHelperText>
              <FormErrorMessage fontSize="xs">{fieldErrors.imageUrl}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!touched.goalEth && !!fieldErrors.goalEth}>
              <FormLabel color="#A1A1AA" fontSize="sm" fontWeight="500">Funding Goal (ETH)</FormLabel>
              <Input
                type="number"
                placeholder="e.g. 1.0"
                min="0.001"
                step="0.001"
                value={form.goalEth}
                onChange={change('goalEth')}
                onBlur={blur('goalEth')}
              />
              <FormErrorMessage fontSize="xs">{fieldErrors.goalEth}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!touched.deadlineDays && !!fieldErrors.deadlineDays}>
              <FormLabel color="#A1A1AA" fontSize="sm" fontWeight="500">Funding Duration (days)</FormLabel>
              <Input
                type="number"
                placeholder="e.g. 30"
                min="1"
                max="365"
                value={form.deadlineDays}
                onChange={change('deadlineDays')}
                onBlur={blur('deadlineDays')}
              />
              <FormHelperText fontSize="xs" color="#52525B">
                Backers can claim refunds if the goal is not met by this deadline.
              </FormHelperText>
              <FormErrorMessage fontSize="xs">{fieldErrors.deadlineDays}</FormErrorMessage>
            </FormControl>

            <Button
              bg="#00FF66"
              color="#09090B"
              _hover={{ boxShadow: '0 0 24px rgba(0,255,102,0.35)', bg: '#00FF66' }}
              w="full"
              size="lg"
              borderRadius="0"
              onClick={handleSubmit}
              isLoading={isPending || step === 'deploying' || step === 'saving'}
              loadingText={
                step === 'saving' ? 'Saving...' :
                step === 'deploying' ? (isDemoMode ? 'Simulating deploy...' : 'Deploying contract...') :
                'Confirm in wallet...'
              }
              isDisabled={isSubmitDisabled}
              mt={2}
              fontWeight="700"
              transition="all 0.15s ease"
            >
              Launch Project
            </Button>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}
