'use client';

import { Component, ReactNode } from 'react';
import { Box, Heading, Text, Button } from '@chakra-ui/react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; message: string; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
          <Box textAlign="center" p={8} maxW="md" bg="white" borderRadius="lg" borderWidth="1px" shadow="md">
            <Heading size="lg" mb={4} color="red.500">Something went wrong</Heading>
            <Text color="gray.600" mb={6} fontSize="sm">{this.state.message}</Text>
            <Button colorScheme="teal" onClick={() => this.setState({ hasError: false, message: '' })}>
              Try again
            </Button>
          </Box>
        </Box>
      );
    }
    return this.props.children;
  }
}
