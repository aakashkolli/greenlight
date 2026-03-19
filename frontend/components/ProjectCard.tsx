'use client';

import { Box, Text, Button, VStack, HStack, Flex } from '@chakra-ui/react';
import { memo } from 'react';
import { ProgressBar } from './ProgressBar';
import Link from 'next/link';
import { Project, getProjectStatus } from '@/lib/types';
import { projectGradient, projectInitials } from '@/lib/projectImage';

interface ProjectCardProps {
  project: Project;
}

const STATUS_LABEL: Record<string, string> = {
  funded: 'Successful',
  expired: 'Closed',
  active: 'Open',
};

export const ProjectCard = memo(function ProjectCard({ project }: ProjectCardProps) {
  const status = getProjectStatus(project);
  const statusLabel = STATUS_LABEL[status];
  const backerCount = project._count?.contributions ?? project.contributions?.length ?? 0;
  const endDate = new Date(project.deadline).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Box
      borderWidth="1px"
      borderColor="gray.200"
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
      {project.imageUrl && typeof project.imageUrl === 'string' && project.imageUrl.trim().length > 0 && project.imageUrl.startsWith('http') ? (
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
        display={project.imageUrl && typeof project.imageUrl === 'string' && project.imageUrl.trim().length > 0 && project.imageUrl.startsWith('http') ? 'none' : 'flex'}
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
          <Text fontSize="xs" fontWeight="bold" color="black" flexShrink={0}>
            {statusLabel}
          </Text>
        </HStack>

        <Text fontSize="sm" color="gray.600" noOfLines={2} lineHeight="1.5">
          {project.description}
        </Text>

        <ProgressBar amountRaised={project.amountRaised} goalAmount={project.goalAmount} />

        <HStack justify="space-between" fontSize="sm" color="black" fontWeight="semibold">
          <Text>Ends {endDate}</Text>
          <Text>{backerCount} {backerCount === 1 ? 'backer' : 'backers'}</Text>
        </HStack>

        <Link href={`/project/${project.id}`}>
          <Button variant="outline" borderColor="brand.600" color="brand.600" _hover={{ bg: 'brand.50', borderColor: 'brand.700', color: 'brand.700' }} w="full" size="sm" borderRadius="lg">
            View Project
          </Button>
        </Link>
      </VStack>
    </Box>
  );
});
