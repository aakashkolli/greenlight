'use client';

import { Box, Text, HStack, Button } from '@chakra-ui/react';
import { useDemoMode } from '@/lib/DemoModeContext';

export function DemoBanner() {
  const { demoActive, exitDemo } = useDemoMode();

  if (!demoActive) return null;

  return (
    <Box
      position="sticky"
      top={0}
      left={0}
      right={0}
      zIndex={100}
      bg="#0A0A0C"
      borderBottom="1px solid #27272A"
      py={2}
      px={6}
    >
      <HStack justify="center" spacing={4} flexWrap="wrap">
        <Text
          fontSize="xs"
          color="#71717A"
        >
          Sandbox mode: simulated transactions only. No real ETH is moved.
        </Text>
        <Button
          size="xs"
          variant="unstyled"
          color="#3F3F46"
          fontSize="xs"
          h="auto"
          minW="auto"
          p={0}
          _hover={{ color: '#F87171' }}
          transition="color 0.15s ease"
          onClick={exitDemo}
        >
          Exit demo
        </Button>
      </HStack>
    </Box>
  );
}
