'use client';

import { Icon, IconProps } from '@chakra-ui/react';
import React from 'react';

export const HamburgerIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" fill="currentColor" {...props}>
    <rect x="3" y="6" width="18" height="2" rx="1" />
    <rect x="3" y="11" width="18" height="2" rx="1" />
    <rect x="3" y="16" width="18" height="2" rx="1" />
  </Icon>
);

export const ChevronDownIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M6 9l6 6 6-6" />
  </Icon>
);

export default HamburgerIcon;
