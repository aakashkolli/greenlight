'use client';

import React from 'react';
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
  VStack,
} from '@chakra-ui/react';
import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ProjectCard } from './ProjectCard';
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

export const ProjectsSection = React.memo(function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [shortcutHint, setShortcutHint] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const debouncedSearch = useDebounce(search, 300);

  const fetchProjects = useCallback((cursor?: string) => {
    return listProjects(cursor).then((res) => {
      const incoming: Project[] = Array.isArray(res.data) ? res.data : [];
      setProjects((prev) => (cursor ? [...prev, ...incoming] : incoming));
      setNextCursor(res.nextCursor ?? null);
    });
  }, []);

  useEffect(() => {
    fetchProjects()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [fetchProjects]);

  // OS-aware shortcut hint and global key handler to focus the search input.
  useEffect(() => {
    // run only in client
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
    if (isMobile) {
      setShortcutHint('');
    } else {
      const isMac = /Macintosh|Mac OS X/i.test(ua);
      setShortcutHint(isMac ? '⌘+K' : 'Ctrl+K');

      const onKey = (e: KeyboardEvent) => {
        const key = (e.key || '').toLowerCase();
        if (key !== 'k') return;
        if (isMac ? e.metaKey : e.ctrlKey) {
          e.preventDefault();
          inputRef.current?.focus();
        }
      };

      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }
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

  const stats = useMemo(() => {
    const totalRaised = projects.reduce((s, p) => s + BigInt(p.amountRaised || '0'), 0n);
    const active = projects.filter((p) => getProjectStatus(p) === 'active').length;
    return { totalRaised, active, total: projects.length };
  }, [projects]);

  return (
    <>
      {/* Stats bar — only after load */}
      {!loading && projects.length > 0 && (
        <Box borderY="1px solid #1F1F23" bg="#0D0D0F" py={6}>
          <Container maxW="4xl">
            <SimpleGrid columns={3}>
              {[
                { value: stats.total.toString(), label: 'Active vaults' },
                { value: `${parseFloat(formatEther(stats.totalRaised)).toFixed(2)} ETH`, label: 'Total locked' },
                { value: stats.active.toString(), label: 'Open now' },
              ].map(({ value, label }, i) => (
                <VStack
                  key={label}
                  spacing={1}
                  borderRight={i < 2 ? '1px solid #1F1F23' : undefined}
                >
                  <Text
                    fontFamily="var(--font-space-grotesk), sans-serif"
                    fontSize="2xl"
                    fontWeight="700"
                    color="#00FF66"
                  >
                    {value}
                  </Text>
                  <Text fontSize="xs" color="#52525B" fontWeight="500" letterSpacing="wide">
                    {label}
                  </Text>
                </VStack>
              ))}
            </SimpleGrid>
          </Container>
        </Box>
      )}

      {/* Projects grid */}
      <Container maxW="6xl" py={{ base: 12, md: 20 }} id="projects">
        <Box mb={8}>
          <Heading
            fontFamily="var(--font-space-grotesk), sans-serif"
            fontWeight="700"
            fontSize={{ base: '2xl', md: '3xl' }}
            color="#F4F4F5"
            mb={2}
          >
            Explore Vaults
          </Heading>
          <Text color="#71717A" fontSize="sm">
            Every listed project has funds locked on-chain. Progress is verifiable at any time.
          </Text>
        </Box>

        {/* Filters */}
        <Flex mb={8} gap={4} flexWrap="wrap" align="center">
          <InputGroup maxW="280px">
            <InputLeftElement pointerEvents="none" color="#52525B">
              <SearchIcon />
            </InputLeftElement>
            <Input
              placeholder={`Search vaults...${shortcutHint ? ` (${shortcutHint})` : ''}`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              ref={inputRef}
              bg="#111113"
              border="1px solid #27272A"
              color="#F4F4F5"
              _placeholder={{ color: '#52525B' }}
              _focus={{ borderColor: '#00FF66', boxShadow: '0 0 0 1px #00FF66' }}
              borderRadius="0"
              variant="unstyled"
              pl={10}
              h="40px"
            />
          </InputGroup>

          {/* OS-aware shortcut: Cmd+K on macOS, Ctrl+K on Windows/Linux; omitted on mobile */}

          <ButtonGroup size="sm" isAttached>
            {(['all', 'active', 'funded', 'expired'] as Filter[]).map((f, i) => (
              <Button
                key={f}
                onClick={() => setFilter(f)}
                bg={filter === f ? '#00FF66' : '#111113'}
                color={filter === f ? '#09090B' : '#71717A'}
                border="1px solid #27272A"
                borderRadius="0"
                _hover={{
                  bg: filter === f ? '#00FF66' : '#1A1A1D',
                  color: filter === f ? '#09090B' : '#F4F4F5',
                }}
                fontSize="xs"
                fontWeight="600"
                letterSpacing="0.03em"
                ml={i > 0 ? '-1px' : 0}
              >
                {f === 'all' ? 'All' : f === 'active' ? 'Open' : f === 'funded' ? 'Funded' : 'Closed'}
              </Button>
            ))}
          </ButtonGroup>
        </Flex>

        {loading && (
          <Flex justify="center" py={20}>
            <Spinner size="xl" color="#00FF66" thickness="2px" />
          </Flex>
        )}

        {error && (
          <Alert status="error" borderRadius="0" mb={6} bg="#18181B" border="1px solid #3F1515">
            <AlertIcon />
            Failed to load vaults: {error}.
          </Alert>
        )}

        {!loading && !error && filteredProjects.length === 0 && (
          <Box
            textAlign="center"
            py={20}
            border="1px solid #1F1F23"
            bg="#0D0D0F"
          >
            <Text color="#52525B" fontSize="sm" mb={4}>
              {projects.length === 0 ? 'No vaults deployed yet.' : 'No vaults match your search.'}
            </Text>
            {projects.length === 0 && (
              <Link href="/create">
                <Button
                  mt={2}
                  bg="#00FF66"
                  color="#09090B"
                  fontWeight="700"
                  borderRadius="0"
                  _hover={{ boxShadow: '0 0 20px rgba(0,255,102,0.25)' }}
                >
                  Deploy the first vault
                </Button>
              </Link>
            )}
          </Box>
        )}

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
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
              bg="transparent"
              color="#71717A"
              border="1px solid #27272A"
              borderRadius="0"
              _hover={{ borderColor: '#3F3F46', color: '#F4F4F5' }}
              fontSize="sm"
            >
              Load more vaults
            </Button>
          </Flex>
        )}
      </Container>
    </>
  );
});
