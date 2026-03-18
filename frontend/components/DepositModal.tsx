'use client';

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Text,
  useToast,
  VStack,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { parseEther } from 'viem';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { GRANT_ABI, API_BASE } from '@/lib/contracts';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  grantAddress: `0x${string}`;
  projectId: string;
  onSuccess?: () => void;
}

const MIN_DEPOSIT = 0.0001;

export function DepositModal({
  isOpen,
  onClose,
  grantAddress,
  projectId,
  onSuccess,
}: DepositModalProps) {
  const [ethAmount, setEthAmount] = useState('');
  const [touched, setTouched] = useState(false);
  const toast = useToast();
  const { address } = useAccount();

  const { writeContract, data: txHash, isPending, error: writeError, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const amountNum = parseFloat(ethAmount);
  const amountError = touched && ethAmount ? (
    isNaN(amountNum) || amountNum <= 0 ? 'Enter a positive amount' :
    amountNum < MIN_DEPOSIT ? `Minimum deposit is ${MIN_DEPOSIT} ETH` : ''
  ) : '';
  const isValidAmount = ethAmount && !isNaN(amountNum) && amountNum >= MIN_DEPOSIT;

  // Notify backend after on-chain confirmation
  const handleConfirmed = useCallback(async () => {
    if (!txHash || !address) return;
    try {
      await fetch(`${API_BASE}/contributions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          walletAddress: address,
          amount: parseEther(ethAmount).toString(),
          txHash,
        }),
      });
    } catch (err) {
      // Non-fatal: blockchain listener will sync it
      console.warn('[DepositModal] Failed to notify backend:', err);
    }
    toast({ title: 'Deposit confirmed!', status: 'success', duration: 4000 });
    onSuccess?.();
    onClose();
    setEthAmount('');
    setTouched(false);
  }, [txHash, address, ethAmount, projectId, toast, onSuccess, onClose]);

  const hasConfirmed = useRef(false);
  useEffect(() => {
    if (isSuccess && !hasConfirmed.current) {
      hasConfirmed.current = true;
      handleConfirmed();
    }
  }, [isSuccess, handleConfirmed]);

  // Toast on transaction error
  useEffect(() => {
    if (writeError) {
      toast({
        title: 'Transaction failed',
        description: writeError.message.slice(0, 120),
        status: 'error',
        duration: 5000,
      });
    }
  }, [writeError, toast]);

  const handleDeposit = () => {
    if (!isValidAmount) return;
    hasConfirmed.current = false;
    reset();
    writeContract({
      address: grantAddress,
      abi: GRANT_ABI,
      functionName: 'deposit',
      value: parseEther(ethAmount),
    });
  };

  const handleClose = () => {
    setEthAmount('');
    setTouched(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered>
      <ModalOverlay backdropFilter="blur(2px)" />
      <ModalContent>
        <ModalHeader>Deposit ETH</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            {!address && (
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                Connect your wallet to deposit.
              </Alert>
            )}
            <FormControl isInvalid={!!amountError}>
              <FormLabel>Amount (ETH)</FormLabel>
              <Input
                type="number"
                placeholder={`Min ${MIN_DEPOSIT} ETH`}
                value={ethAmount}
                onChange={(e) => setEthAmount(e.target.value)}
                onBlur={() => setTouched(true)}
                min={MIN_DEPOSIT}
                step="0.01"
                isDisabled={isPending || isConfirming}
              />
              <FormErrorMessage>{amountError}</FormErrorMessage>
            </FormControl>
            {writeError && !isPending && (
              <Text color="red.500" fontSize="sm">
                {writeError.message.slice(0, 120)}
              </Text>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancel
          </Button>
          <Button
            colorScheme="teal"
            onClick={handleDeposit}
            isLoading={isPending || isConfirming}
            loadingText={isConfirming ? 'Confirming...' : 'Sending...'}
            isDisabled={!address || !isValidAmount}
          >
            Deposit
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
