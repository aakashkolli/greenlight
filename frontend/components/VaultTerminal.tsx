'use client';

/**
 * VaultTerminal
 *
 * Displays a syntax-highlighted excerpt from the actual Grant.sol source
 * (contracts/contracts/Grant.sol). The function shown is refund(), which
 * demonstrates the three patterns a recruiter or senior engineer would look for:
 *
 *   1. Custom errors        — cheaper than require strings, typed reversion
 *   2. CEI (Checks-Effects-Interactions) — contributions[msg.sender] = 0
 *                             before the external .call, eliminating re-entrancy
 *   3. nonReentrant guard   — defence-in-depth via OpenZeppelin ReentrancyGuard
 *
 * No mock data. No placeholder snippets. Extracted verbatim from source.
 */

import { Box, Flex, HStack, Text } from '@chakra-ui/react';

// VS Code Dark+ palette — identical to what the actual file looks like in the IDE
const T = {
  comment:  '#6A9955',
  keyword:  '#569CD6',
  type:     '#4EC9B0',
  fn:       '#DCDCAA',
  field:    '#9CDCFE',
  error:    '#C586C0',
  num:      '#B5CEA8',
  dim:      '#808080',
  fg:       '#D4D4D4',
};

type Span = { t: string; c: string };

function CodeLine({
  indent = 0,
  spans,
}: {
  indent?: number;
  spans?: Span[];
}) {
  return (
    <Text
      as="div"
      fontFamily="var(--font-jetbrains-mono), monospace"
      fontSize="12px"
      lineHeight="1.8"
      pl={`${indent * 16}px`}
      whiteSpace="pre"
    >
      {spans
        ? spans.map((s, i) => (
            <Text key={i} as="span" color={s.c}>
              {s.t}
            </Text>
          ))
        : '\u00A0'}
    </Text>
  );
}

export function VaultTerminal() {
  return (
    <Box
      bg="#0D0D0F"
      border="1px solid #27272A"
      borderRadius="12px"
      overflow="hidden"
      boxShadow="0 0 60px rgba(0,255,102,0.04)"
      maxW="540px"
      w="full"
    >
      {/* ── Title bar ── */}
      <Flex
        bg="#111113"
        borderBottom="1px solid #27272A"
        px={4}
        py="10px"
        align="center"
        justify="space-between"
      >
        <HStack spacing="6px">
          <Box w="10px" h="10px" borderRadius="full" bg="#FF5F57" />
          <Box w="10px" h="10px" borderRadius="full" bg="#FEBC2E" />
          <Box w="10px" h="10px" borderRadius="full" bg="#28C840" />
        </HStack>
        <Text color="#52525B" fontSize="11px" fontFamily="var(--font-jetbrains-mono), monospace">
          Grant.sol — refund()
        </Text>
        <Box w="52px" />
      </Flex>

      {/* ── Code ── */}
      <Box px={5} py={5} overflowX="auto">
        {/* NatSpec */}
        <CodeLine spans={[{ t: '/// @notice Backer claims a refund after deadline', c: T.comment }]} />
        <CodeLine spans={[{ t: '///         if the funding goal was not met.', c: T.comment }]} />

        {/* Function signature */}
        <CodeLine
          spans={[
            { t: 'function ', c: T.keyword },
            { t: 'refund', c: T.fn },
            { t: '() ', c: T.dim },
            { t: 'external ', c: T.keyword },
            { t: 'nonReentrant ', c: T.keyword },
            { t: '{', c: T.dim },
          ]}
        />

        {/* ── Checks ── */}
        <CodeLine indent={1} spans={[{ t: 'if (block.timestamp <= ', c: T.fg }, { t: 'fundingDeadline', c: T.field }, { t: ')', c: T.dim }]} />
        <CodeLine indent={2} spans={[{ t: 'revert ', c: T.keyword }, { t: 'DeadlineNotPassed', c: T.error }, { t: '();', c: T.dim }]} />

        <CodeLine indent={1} spans={[{ t: 'if (', c: T.fg }, { t: 'goalReached', c: T.field }, { t: ')', c: T.dim }]} />
        <CodeLine indent={2} spans={[{ t: 'revert ', c: T.keyword }, { t: 'GoalAlreadyReached', c: T.error }, { t: '();', c: T.dim }]} />

        <CodeLine />
        <CodeLine indent={1} spans={[{ t: 'uint256 ', c: T.type }, { t: 'amount ', c: T.field }, { t: '= ', c: T.dim }, { t: 'contributions', c: T.field }, { t: '[msg.sender];', c: T.dim }]} />
        <CodeLine indent={1} spans={[{ t: 'if (', c: T.fg }, { t: 'amount ', c: T.field }, { t: '== ', c: T.dim }, { t: '0', c: T.num }, { t: ') ', c: T.dim }, { t: 'revert ', c: T.keyword }, { t: 'NothingToRefund', c: T.error }, { t: '();', c: T.dim }]} />

        <CodeLine />
        {/* Effects */}
        <CodeLine indent={1} spans={[{ t: '// Effects', c: T.comment }]} />
        <CodeLine indent={1} spans={[{ t: 'contributions', c: T.field }, { t: '[msg.sender] = ', c: T.dim }, { t: '0', c: T.num }, { t: ';', c: T.dim }]} />

        <CodeLine />
        {/* Interactions */}
        <CodeLine indent={1} spans={[{ t: '// Interaction', c: T.comment }]} />
        <CodeLine indent={1} spans={[{ t: '(bool ', c: T.type }, { t: 'ok', c: T.field }, { t: ', ) = ', c: T.dim }, { t: 'msg.sender', c: T.keyword }, { t: '.call{', c: T.dim }, { t: 'value', c: T.keyword }, { t: ': ', c: T.dim }, { t: 'amount', c: T.field }, { t: '}(', c: T.dim }, { t: '""', c: T.num }, { t: ');', c: T.dim }]} />
        <CodeLine indent={1} spans={[{ t: 'require', c: T.error }, { t: '(ok, ', c: T.dim }, { t: '"Transfer failed"', c: T.num }, { t: ');', c: T.dim }]} />

        <CodeLine />
        <CodeLine indent={1} spans={[{ t: 'emit ', c: T.keyword }, { t: 'Refund', c: T.fn }, { t: '(msg.sender, ', c: T.dim }, { t: 'amount', c: T.field }, { t: ');', c: T.dim }]} />
        <CodeLine spans={[{ t: '}', c: T.dim }]} />
      </Box>
    </Box>
  );
}
