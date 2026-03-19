'use client';

import { Box, Progress, Text, HStack } from '@chakra-ui/react';
import { formatEther } from 'viem';

interface ProgressBarProps {
  amountRaised: string;
  goalAmount: string;
  showDetails?: boolean;
}

function fmtEth(wei: bigint): string {
  const eth = parseFloat(formatEther(wei));
  if (eth >= 1000) return `${(eth / 1000).toFixed(1)}k`;
  if (eth >= 1) return eth.toFixed(2);
  return eth.toFixed(4);
}

export function ProgressBar({ amountRaised, goalAmount, showDetails = true }: ProgressBarProps) {
  const raised = BigInt(amountRaised || '0');
  const goal = BigInt(goalAmount || '1');
  const pct = goal > 0n ? Number((raised * 100n) / goal) : 0;
  const cappedPct = Math.min(pct, 100);
  const isFunded = cappedPct >= 100;

  return (
    <Box>
      <HStack justify="space-between" mb={1} align="baseline">
        <Text fontSize="sm" fontWeight="bold" color={isFunded ? 'green.600' : 'brand.700'}>
          {fmtEth(raised)} ETH
        </Text>
        <Text fontSize="xs" color="gray.400" fontWeight="medium">
          {cappedPct}%
        </Text>
      </HStack>
      <Progress
        value={cappedPct}
        colorScheme={isFunded ? 'green' : 'cyan'}
        borderRadius="full"
        size="sm"
        bg="gray.100"
      />
      {showDetails && (
        <Text fontSize="sm" color="black" fontWeight="semibold" mt={1}>
          Goal: {fmtEth(goal)} ETH
        </Text>
      )}
    </Box>
  );
}
