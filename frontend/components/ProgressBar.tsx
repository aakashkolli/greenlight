'use client';

import { Box, Text, HStack } from '@chakra-ui/react';
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
      <HStack justify="space-between" mb={2} align="baseline">
        <Text
          fontSize="sm"
          fontWeight="700"
          color={isFunded ? '#00FF66' : '#F4F4F5'}
        >
          {fmtEth(raised)} ETH
        </Text>
        <Text
          fontSize="xs"
          color="#52525B"
        >
          {cappedPct}%
        </Text>
      </HStack>

      {/* Custom progress bar - avoids Chakra Progress dark-mode quirks */}
      <Box bg="#1F1F23" borderRadius="full" h="4px" overflow="hidden">
        <Box
          h="full"
          w={`${cappedPct}%`}
          bg={isFunded ? '#00FF66' : '#00CC52'}
          borderRadius="full"
          transition="width 0.3s ease"
          boxShadow={isFunded ? '0 0 8px rgba(0,255,102,0.4)' : undefined}
        />
      </Box>

      {showDetails && (
        <Text
          fontSize="xs"
          color="#52525B"
          mt={1.5}
        >
          Goal: {fmtEth(goal)} ETH
        </Text>
      )}
    </Box>
  );
}
