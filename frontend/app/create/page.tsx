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
import { DEMO_MODE } from '@/lib/data';

const IMAGE_URL_RE = /^https?:\/\/.+/;

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

  const handleSaveToBackend = useCallback(async () => {
    if (!receipt || !address) return;

    // Decode GrantCreated log with ABI — safe against topic ordering changes
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
      toast({ title: 'Project created!', status: 'success', duration: 3000 });
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

  const handleSubmit = () => {
    if (DEMO_MODE) {
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

  const descLen = form.description.trim().length;

  return (
    <Box minH="100vh" bg="#f4f8fb">
      <Navbar maxW="3xl" />

      <Container maxW="3xl" py={10}>
        <Heading mb={2}>Create a Project</Heading>
        <Text color="gray.500" mb={8} fontSize="sm">
          Deploy an escrow contract and publish your campaign.
        </Text>

        {!isConnected && (
          <Alert status="warning" mb={6} borderRadius="md">
            <AlertIcon />
            Connect your wallet to create a project.
          </Alert>
        )}

        <Box bg="white" p={8} borderRadius="xl" borderWidth="1px" shadow="sm">
          <VStack spacing={5}>
            <FormControl isRequired isInvalid={!!touched.title && !!fieldErrors.title}>
              <FormLabel>Title</FormLabel>
              <Input
                placeholder="Give your project a compelling title"
                value={form.title}
                onChange={change('title')}
                onBlur={blur('title')}
              />
              <FormErrorMessage>{fieldErrors.title}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!touched.description && !!fieldErrors.description}>
              <FormLabel>Description</FormLabel>
              <Textarea
                placeholder="Describe your project, its goals, and how funds will be used..."
                rows={6}
                value={form.description}
                onChange={change('description')}
                onBlur={blur('description')}
                resize="vertical"
              />
              <FormHelperText
                color={descLen > 2000 ? 'red.500' : descLen >= 20 ? 'green.500' : 'gray.400'}
              >
                {descLen}/2000 characters
              </FormHelperText>
              <FormErrorMessage>{fieldErrors.description}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!touched.imageUrl && !!fieldErrors.imageUrl}>
              <FormLabel>Cover Image URL <Text as="span" color="gray.400" fontWeight="normal">(optional)</Text></FormLabel>
              <Input
                placeholder="https://example.com/image.jpg"
                value={form.imageUrl}
                onChange={change('imageUrl')}
                onBlur={blur('imageUrl')}
              />
              <FormHelperText>Leave blank to use an auto-generated gradient.</FormHelperText>
              <FormErrorMessage>{fieldErrors.imageUrl}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!touched.goalEth && !!fieldErrors.goalEth}>
              <FormLabel>Funding Goal (ETH)</FormLabel>
              <Input
                type="number"
                placeholder="e.g. 1.0"
                min="0.001"
                step="0.001"
                value={form.goalEth}
                onChange={change('goalEth')}
                onBlur={blur('goalEth')}
              />
              <FormErrorMessage>{fieldErrors.goalEth}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!touched.deadlineDays && !!fieldErrors.deadlineDays}>
              <FormLabel>Funding Duration (days)</FormLabel>
              <Input
                type="number"
                placeholder="e.g. 30"
                min="1"
                max="365"
                value={form.deadlineDays}
                onChange={change('deadlineDays')}
                onBlur={blur('deadlineDays')}
              />
              <FormHelperText>Backers can claim refunds if the goal is not met by this deadline.</FormHelperText>
              <FormErrorMessage>{fieldErrors.deadlineDays}</FormErrorMessage>
            </FormControl>

            <Button
              bg="brand.600"
              color="white"
              _hover={{ bg: 'brand.700' }}
              w="full"
              size="lg"
              borderRadius="lg"
              onClick={handleSubmit}
              isLoading={isPending || step === 'deploying' || step === 'saving'}
              loadingText={
                step === 'saving' ? 'Saving to database...' :
                step === 'deploying' ? 'Deploying contract...' : 'Confirm in wallet...'
              }
              isDisabled={!isConnected || !isValid || DEMO_MODE}
              mt={2}
            >
              Deploy & Create Project
            </Button>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}
