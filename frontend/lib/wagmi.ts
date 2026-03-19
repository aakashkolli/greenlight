import { createConfig } from '@privy-io/wagmi';
import { http } from 'wagmi';
import { hardhat, sepolia } from 'wagmi/chains';

const hardhatRpc = process.env.NEXT_PUBLIC_CHAIN_RPC || 'http://127.0.0.1:8545';
const sepoliaRpc = process.env.NEXT_PUBLIC_SEPOLIA_RPC;

export const wagmiConfig = createConfig({
  chains: [hardhat, sepolia],
  transports: {
    [hardhat.id]: http(hardhatRpc),
    [sepolia.id]: http(sepoliaRpc),
  },
});
