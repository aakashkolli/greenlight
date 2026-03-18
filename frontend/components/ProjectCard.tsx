'use client';

import { Box, Text, Button, Badge, VStack, HStack, Flex } from '@chakra-ui/react';
import { memo } from 'react';
import { ProgressBar } from './ProgressBar';
import Link from 'next/link';
import { Project, getProjectStatus } from '@/lib/types';
import { useDeadlineCountdown } from '@/lib/useDeadlineCountdown';
import { projectGradient, projectInitials } from '@/lib/projectImage';

interface ProjectCardProps {
  project: Project;
}

const STATUS_BADGE: Record<string, { label: string; colorScheme: string }> = {
  funded:  { label: 'Funded',  colorScheme: 'green' },
  expired: { label: 'Expired', colorScheme: 'red' },
  active:  { label: 'Active',  colorScheme: 'teal' },
};

export const ProjectCard = memo(function ProjectCard({ project }: ProjectCardProps) {
  const status = getProjectStatus(project);
  const badge = STATUS_BADGE[status];
  const countdown = useDeadlineCountdown(project.deadline);
  const backerCount = project._count?.contributions ?? project.contributions?.length ?? 0;

  return (
    <Box
      borderWidth="1px"
      borderRadius="xl"
      overflow="hidden"
      shadow="sm"
      _hover={{ shadow: 'lg', transform: 'translateY(-3px)' }}
      transition="all 0.2s ease"
      bg="white"
      display="flex"
      flexDirection="column"
    >
      {/* Image / Gradient */}
      {project.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <Box as="img"
          src={project.imageUrl}
          alt={project.title}
          style={{ width: '100%', height: '180px', objectFit: 'cover' }}
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            const el = e.currentTarget;
            el.style.display = 'none';
            if (el.nextSibling) (el.nextSibling as HTMLElement).style.display = 'flex';
          }}
        />
      ) : null}
      <Flex
        display={project.imageUrl ? 'none' : 'flex'}
        style={{ background: projectGradient(project.id), height: '180px' }}
        align="center"
        justify="center"
      >
        <Text color="white" fontSize="4xl" fontWeight="bold" opacity={0.7}>
          {projectInitials(project.title)}
        </Text>
      </Flex>

      <VStack p={5} align="stretch" spacing={3} flex={1}>
        <HStack justify="space-between" align="start">
          <Text fontSize="md" fontWeight="bold" noOfLines={2} lineHeight="1.4">
            {project.title}
          </Text>
          <Badge colorScheme={badge.colorScheme} flexShrink={0} borderRadius="full" px={2}>
            {badge.label}
          </Badge>
        </HStack>

        <Text fontSize="sm" color="gray.500" noOfLines={2} lineHeight="1.5">
          {project.description}
        </Text>

        <ProgressBar amountRaised={project.amountRaised} goalAmount={project.goalAmount} />

        <HStack justify="space-between" fontSize="xs" color="gray.400">
          <Text>{countdown}</Text>
          <Text>{backerCount} {backerCount === 1 ? 'backer' : 'backers'}</Text>
        </HStack>

        <Link href={`/project/${project.id}`}>
          <Button colorScheme="teal" w="full" size="sm" borderRadius="lg">
            View Project
          </Button>
        </Link>
      </VStack>
    </Box>
  );
});
