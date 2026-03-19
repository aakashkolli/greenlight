'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  ButtonGroup,
  SimpleGrid,
  HStack,
  Spinner,
  Alert,
  AlertIcon,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Stat,
  StatLabel,
  StatNumber,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { ProjectCard } from '@/components/ProjectCard';
import { Navbar } from '@/components/Navbar';
import { Project, ProjectStatus, getProjectStatus } from '@/lib/types';
import { useDebounce } from '@/lib/useDebounce';
import { formatEther } from 'viem';
import { listProjects } from '@/lib/data';

type Filter = 'all' | ProjectStatus;

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const debouncedSearch = useDebounce(search, 300);

  const fetchProjects = useCallback((cursor?: string) => {
    return listProjects(cursor)
      .then((res) => {
        const incoming: Project[] = Array.isArray(res.data) ? res.data : [];
        setProjects((prev) => (cursor ? [...prev, ...incoming] : incoming));
        setNextCursor(res.nextCursor ?? null);
      });
  }, []);

  useEffect(() => {
    fetchProjects()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleLoadMore = () => {
    if (!nextCursor) return;
    setLoadingMore(true);
    fetchProjects(nextCursor)
      .catch((err) => setError(err.message))
      .finally(() => setLoadingMore(false));
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (filter !== 'all' && getProjectStatus(p) !== filter) return false;
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase();
        return p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [projects, debouncedSearch, filter]);

  // Aggregate stats
  const stats = useMemo(() => {
    const totalRaised = projects.reduce((s, p) => s + BigInt(p.amountRaised || '0'), 0n);
    const active = projects.filter((p) => getProjectStatus(p) === 'active').length;
    const funded = projects.filter((p) => getProjectStatus(p) === 'funded').length;
    return { totalRaised, active, funded, total: projects.length };
  }, [projects]);

  return (
    <Box minH="100vh" bg="#f4f8fb">
      <Navbar />

      <Box
        position="relative"
        bgGradient="linear(135deg, #0f172a 0%, #0b5f76 45%, #06b6d4 100%)"
        py={{ base: 14, md: 20 }}
        px={6}
        overflow="hidden"
      >
        <Container maxW="4xl" textAlign="center" position="relative">
          <Text
            color="#bae6fd"
            fontSize="sm"
            fontWeight="semibold"
            letterSpacing="widest"
            textTransform="uppercase"
            mb={3}
          >
            Escrow-first crowdfunding
          </Text>
          <Heading color="white" size="2xl" mb={4} lineHeight="1.2" fontWeight="normal">
            Fund What Matters. Refunds If It Fails.
          </Heading>
          <Text color="#e0f2fe" fontSize={{ base: 'md', md: 'lg' }} mb={8} maxW="2xl" mx="auto" lineHeight="1.7">
            Every contribution stays in escrow until the goal is hit. If a campaign closes below goal, funds auto-return to your wallet. No forms. No fees. No waiting.
          </Text>
          <HStack justify="center" spacing={4} flexWrap="wrap" mb={4}>
            <Link href="/create">
              <Button size="lg" bg="white" color="brand.700" _hover={{ bg: '#e8f7ff' }} shadow="md">
                Launch Your Project
              </Button>
            </Link>
            <Link href="#projects">
              <Button size="lg" variant="outline" color="white" borderColor="whiteAlpha.700" _hover={{ bg: 'whiteAlpha.250' }}>
                Browse Projects
              </Button>
            </Link>
          </HStack>
        </Container>
      </Box>

      {!loading && projects.length > 0 && (
        <Box bg="#f8fcff" borderBottomWidth="1px" borderColor="blackAlpha.200">
          <Container maxW="4xl">
            <SimpleGrid columns={3} py={6}>
              <Stat textAlign="center">
                <StatNumber color="brand.700" fontSize="2xl">{stats.total}</StatNumber>
                <StatLabel color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wide">Projects</StatLabel>
              </Stat>
              <Stat textAlign="center" borderX="1px" borderColor="gray.100">
                <StatNumber color="brand.700" fontSize="2xl">
                  {parseFloat(formatEther(stats.totalRaised)).toFixed(1)} ETH
                </StatNumber>
                <StatLabel color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wide">Total Raised</StatLabel>
              </Stat>
              <Stat textAlign="center">
                <StatNumber color="brand.700" fontSize="2xl">{stats.active}</StatNumber>
                <StatLabel color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wide">Active Now</StatLabel>
              </Stat>
            </SimpleGrid>
          </Container>
        </Box>
      )}

      <Container maxW="6xl" py={12} id="projects">
        <Heading size="lg" mb={2}>
          Explore Projects
        </Heading>
        <Text color="gray.500" mb={6} fontSize="sm">
          Back ambitious ideas with transparent funding rails.
        </Text>

        <Wrap mb={8} spacing={4}>
          <WrapItem>
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none" color="gray.400">
              <SearchIcon />
            </InputLeftElement>
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              bg="#fffdfa"
              borderRadius="lg"
            />
          </InputGroup>
          </WrapItem>
          <WrapItem>
          <ButtonGroup size="sm" isAttached>
            {(['all', 'active', 'funded', 'expired'] as Filter[]).map((f) => (
              <Button
                key={f}
                onClick={() => setFilter(f)}
                colorScheme={filter === f ? 'cyan' : 'gray'}
                variant={filter === f ? 'solid' : 'outline'}
                borderRadius={f === 'all' ? 'lg 0 0 lg' : f === 'expired' ? '0 lg lg 0' : '0'}
              >
                {f === 'all' ? 'All' : f === 'active' ? 'Open' : f === 'funded' ? 'Successful' : 'Closed'}
              </Button>
            ))}
          </ButtonGroup>
          </WrapItem>
        </Wrap>

        {loading && (
          <Flex justify="center" py={16}>
            <Spinner size="xl" color="teal.500" thickness="3px" />
          </Flex>
        )}

        {error && (
          <Alert status="error" borderRadius="lg" mb={6}>
            <AlertIcon />
            Failed to load projects: {error}.
          </Alert>
        )}

        {!loading && !error && filteredProjects.length === 0 && (
          <Box textAlign="center" py={16}>
            <Text fontSize="4xl" mb={4}>🌱</Text>
            <Text color="gray.500" fontSize="lg">
              {projects.length === 0 ? 'No projects yet.' : 'No projects match your search.'}
            </Text>
            {projects.length === 0 && (
              <Link href="/create">
                <Button mt={4} bg="brand.600" color="white" _hover={{ bg: 'brand.700' }}>Start the first project</Button>
              </Link>
            )}
          </Box>
        )}

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </SimpleGrid>

        {nextCursor && (
          <Flex justify="center" mt={10}>
            <Button
              onClick={handleLoadMore}
              isLoading={loadingMore}
              loadingText="Loading..."
              variant="outline"
              colorScheme="cyan"
              borderRadius="lg"
            >
              Load more projects
            </Button>
          </Flex>
        )}
      </Container>

      <Box bg="#f8fcff" borderTopWidth="1px" borderColor="blackAlpha.200" py={8} mt={8}>
        <Container maxW="6xl">
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
            <Text fontSize="sm" fontWeight="bold" color="brand.700">Greenlight</Text>
            <Text fontSize="xs" color="gray.400">
              Funds held in smart contract escrow. Built on Ethereum.
            </Text>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}
