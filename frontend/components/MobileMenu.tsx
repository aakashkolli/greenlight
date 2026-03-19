'use client';

import { Menu, MenuButton, MenuList, MenuItem, IconButton } from '@chakra-ui/react';
import { HamburgerIcon } from './icons';
import Link from 'next/link';
import { useAccount, useDisconnect } from 'wagmi';

export default function MobileMenu() {
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <Menu>
      <MenuButton as={IconButton} aria-label="Open menu" icon={<HamburgerIcon />} variant="ghost" size="md" />
      <MenuList>
        <MenuItem as={Link} href="/activity">View Activity</MenuItem>
        <MenuItem as={Link} href="/create">Start a Project</MenuItem>
        {isConnected ? (
          <>
            <MenuItem as={Link} href="/profile">Profile</MenuItem>
            <MenuItem onClick={() => disconnect()}>Disconnect</MenuItem>
          </>
        ) : (
          <MenuItem as={Link} href="/">Connect Wallet</MenuItem>
        )}
      </MenuList>
    </Menu>
  );
}
