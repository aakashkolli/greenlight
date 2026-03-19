'use client';

import React from 'react';
import { Box, Text } from '@chakra-ui/react';

function hashToColor(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = input.charCodeAt(i) + ((h << 5) - h);
  }
  const hue = Math.abs(h) % 360;
  return `hsl(${hue} 65% 55%)`;
}

export default function Identicon({ value, size = 8 }: { value: string; size?: number | string }) {
  const bg = hashToColor(value || 'anon');
  const label = value ? value.slice(2, 4).toUpperCase() : 'U';

  return (
    <Box
      w={size}
      h={size}
      borderRadius="full"
      bg={bg}
      display="flex"
      alignItems="center"
      justifyContent="center"
      color="white"
      fontWeight="600"
      fontSize={size === 8 ? 'xs' : 'sm'}
      flexShrink={0}
    >
      <Text>{label}</Text>
    </Box>
  );
}
