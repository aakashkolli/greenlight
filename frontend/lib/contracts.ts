import { parseAbi } from 'viem';

export const GRANT_FACTORY_ABI = parseAbi([
  'function createGrant(uint256 goalAmount, uint256 deadline) returns (uint256 id, address grantAddr)',
  'event GrantCreated(uint256 indexed grantId, address indexed grantAddress, address indexed creator, uint256 goalAmount, uint256 fundingDeadline)',
]);

export const GRANT_ABI = parseAbi([
  'function deposit() payable',
  'function withdraw()',
  'function refund()',
  'function creator() view returns (address)',
  'function goalAmount() view returns (uint256)',
  'function fundingDeadline() view returns (uint256)',
  'function totalDeposited() view returns (uint256)',
  'function goalReached() view returns (bool)',
  'function withdrawn() view returns (bool)',
  'function contributions(address) view returns (uint256)',
  'function isActive() view returns (bool)',
  'event Deposit(address indexed backer, uint256 amount)',
  'event Refund(address indexed backer, uint256 amount)',
  'event CreatorWithdrawal(uint256 amount)',
]);

export const FACTORY_ADDRESS = (process.env.NEXT_PUBLIC_FACTORY_ADDRESS || '0x0') as `0x${string}`;
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
