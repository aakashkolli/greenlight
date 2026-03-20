'use client';

import { Box, Text, Button, VStack, HStack, Flex, Spinner } from '@chakra-ui/react';
import { memo, useState } from 'react';
import { ProgressBar } from './ProgressBar';
import Link from 'next/link';
import { Project, getProjectStatus } from '@/lib/types';
import { projectGradient, projectInitials } from '@/lib/projectImage';
import { useDemoMode } from '@/lib/DemoModeContext';

interface ProjectCardProps {
  project: Project;
}

const STATUS_CONFIG: Record<string, { label: string; dotColor: string; textColor: string }> = {
  active:  { label: 'Accepting deposits', dotColor: '#00FF66', textColor: '#A1A1AA' },
  funded:  { label: 'Fully funded',       dotColor: '#00FF66', textColor: '#00FF66' },
  expired: { label: 'Closed',             dotColor: '#52525B', textColor: '#52525B' },
};

function ExpandableDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const LIMIT = 180;
  const isLong = text.length > LIMIT;

  return (
    <Box>
      <Text fontSize="sm" color="#71717A" lineHeight="1.6">
        {expanded || !isLong ? text : `${text.slice(0, LIMIT).trimEnd()}…`}
      </Text>
      {isLong && (
        <Button
          variant="unstyled"
          size="xs"
          color="#52525B"
          fontWeight="500"
          fontSize="xs"
          mt={1}
          h="auto"
          minW="auto"
          p={0}
          _hover={{ color: '#A1A1AA' }}
          onClick={() => setExpanded((x) => !x)}
          display="inline"
          transition="color 0.15s ease"
        >
          {expanded ? 'Show less' : 'Read more'}
        </Button>
      )}
    </Box>
  );
}

export const ProjectCard = memo(function ProjectCard({ project }: ProjectCardProps) {
  const { isDemoMode, demoActive, demoOverrides, pendingProjectId, simulateDeposit } =
    useDemoMode();

  // In demo mode, merge any simulated deposits into the displayed balance
  const demoExtra = demoOverrides[project.id] ?? 0n;
  const effectiveAmountRaised = (BigInt(project.amountRaised) + demoExtra).toString();

  const status = getProjectStatus({ ...project, amountRaised: effectiveAmountRaised });
  const { label: statusLabel, dotColor, textColor } =
    STATUS_CONFIG[status] ?? STATUS_CONFIG.expired;

  const backerCount = project._count?.contributions ?? project.contributions?.length ?? 0;
  const endDate = new Date(project.deadline).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const isPending = pendingProjectId === project.id;
  const showDemoDeposit = isDemoMode && demoActive && status === 'active';

  return (
    <Box
      bg="#111113"
      border="1px solid"
      borderColor={isPending ? '#00FF6640' : '#27272A'}
      borderRadius="12px"
      overflow="hidden"
      _hover={{ borderColor: isPending ? '#00FF6640' : '#3F3F46', transform: 'translateY(-2px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
      transition="all 0.2s ease"
      display="flex"
      flexDirection="column"
    >
      {/* Image / Gradient */}
      {project.imageUrl && typeof project.imageUrl === 'string' && project.imageUrl.trim().length > 0 && project.imageUrl.startsWith('http') ? (
        // eslint-disable-next-line @next/next/no-img-element
        <Box
          as="img"
          src={project.imageUrl}
          alt={project.title}
          style={{ width: '100%', height: '160px', objectFit: 'cover', filter: 'brightness(0.75)' }}
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            const el = e.currentTarget;
            el.style.display = 'none';
            if (el.nextSibling) (el.nextSibling as HTMLElement).style.display = 'flex';
          }}
        />
      ) : null}
      <Flex
        display={
          project.imageUrl && typeof project.imageUrl === 'string' && project.imageUrl.trim().length > 0 && project.imageUrl.startsWith('http')
            ? 'none'
            : 'flex'
        }
        style={{ background: projectGradient(project.id), height: '160px', filter: 'brightness(0.65)' }}
        align="center"
        justify="center"
      >
        <Text color="white" fontSize="3xl" fontWeight="700" opacity={0.5} fontFamily="var(--font-space-grotesk), sans-serif">
          {projectInitials(project.title)}
        </Text>
      </Flex>

      <VStack p={5} align="stretch" spacing={3} flex={1}>
        <Text
          fontSize="md"
          fontWeight="700"
          noOfLines={2}
          lineHeight="1.4"
          color="#F4F4F5"
          fontFamily="var(--font-space-grotesk), sans-serif"
        >
          {project.title}
        </Text>

        <ExpandableDescription text={project.description} />

        {/* Status */}
        <Text fontSize="xs" color={textColor} fontWeight="500">
          {statusLabel}
        </Text>

        {/* Progress bar reads effectiveAmountRaised so demo deposits animate it */}
        <ProgressBar amountRaised={effectiveAmountRaised} goalAmount={project.goalAmount} />

        <HStack justify="space-between" fontSize="xs" color="#52525B" fontWeight="500">
          <Text>Ends {endDate}</Text>
          <Text>{backerCount} {backerCount === 1 ? 'backer' : 'backers'}</Text>
        </HStack>

        {/* Demo deposit button - only visible when demo session is active */}
        {showDemoDeposit && (
          <Button
            w="full"
            size="sm"
            bg={isPending ? 'transparent' : '#00FF6614'}
            color={isPending ? '#52525B' : '#00FF66'}
            border="1px solid"
            borderColor={isPending ? '#27272A' : '#00FF6640'}
            borderRadius="0"
            _hover={isPending ? {} : { bg: '#00FF6624', borderColor: '#00FF6680' }}
            transition="all 0.15s ease"
            fontSize="xs"
            letterSpacing="0.03em"
            onClick={() => simulateDeposit(project.id)}
            isDisabled={isPending || !!pendingProjectId}
            leftIcon={isPending ? <Spinner size="xs" color="#52525B" /> : undefined}
          >
            {isPending ? 'Confirming tx…' : 'Simulate deposit'}
          </Button>
        )}

        <Link href={`/project/${project.id}`}>
          <Button
            w="full"
            size="sm"
            bg="transparent"
            color="#71717A"
            border="1px solid #27272A"
            borderRadius="0"
            _hover={{ borderColor: '#00FF66', color: '#00FF66', bg: 'rgba(0,255,102,0.04)' }}
            transition="all 0.15s ease"
            fontSize="sm"
            fontWeight="500"
          >
            View vault →
          </Button>
        </Link>
      </VStack>
    </Box>
  );
});
