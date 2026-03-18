import { createConfig } from '@privy-io/wagmi';
import { hardhat } from 'viem/chains';
import { http } from 'wagmi';

export const wagmiConfig = createConfig({
  chains: [hardhat],
  transports: {
    [hardhat.id]: http(process.env.NEXT_PUBLIC_CHAIN_RPC || 'http://127.0.0.1:8545'),
  },
});
