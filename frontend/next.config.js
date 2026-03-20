/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === 'true';
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] || '';
const basePath = isGithubPages && repoName ? `/${repoName}` : '';

const nextConfig = {
  output: isGithubPages ? 'export' : undefined,
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: isGithubPages,
  images: {
    unoptimized: isGithubPages,
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  // Tree-shake large barrel-file packages.
  // framer-motion (Chakra UI v2 peer dep) and the wallet stack each expose
  // hundreds of re-exports; without this, Next.js bundles the entire library
  // even when only a handful of symbols are used, inflating the module graph
  // to 21k+ entries and pushing cold-start compile times past 35 s.
  experimental: {
    optimizePackageImports: [
      '@chakra-ui/react',
      'framer-motion',
      '@privy-io/react-auth',
      '@privy-io/wagmi',
      'wagmi',
      'viem',
      '@tanstack/react-query',
    ],
  },
  // Keep config Turbopack-compatible for faster local dev compiles.
};

module.exports = nextConfig;
