import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Script from 'next/script';
import React from 'react';
const Providers = dynamic(() => import('./providers').then((m) => m.Providers), { ssr: false });
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ColorModeScript } from '@chakra-ui/react';
import { Inter, Sora, JetBrains_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const displayFont = Sora({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] || '';
const ghBasePath = process.env.GITHUB_PAGES === 'true' && repoName ? `/${repoName}` : '';

export const metadata: Metadata = {
  title: 'GreenLight',
  description: 'An open-source, smart-contract powered crowdfunding protocol. Capital is locked in a trustless vault and released in tranches upon milestone verification.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${displayFont.variable} ${jetbrainsMono.variable}`}>
      <body suppressHydrationWarning>
        <Script
          id="gh-pages-route-recovery"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var u=new URL(window.location.href);var p=u.searchParams.get('p');if(!p)return;u.searchParams.delete('p');var base='${ghBasePath}';var normalizedPath=p.charAt(0)==='/'?p:('/'+p);var target=(base||'')+normalizedPath+(u.searchParams.toString()?('?'+u.searchParams.toString()):'')+u.hash;window.history.replaceState(null,'',target);}catch(e){}})();`,
          }}
        />
        
        <ColorModeScript initialColorMode="dark" />
        <React.Suspense>
          <Providers>
            <ErrorBoundary>{children}</ErrorBoundary>
          </Providers>
        </React.Suspense>
        
      </body>
    </html>
  );
}
