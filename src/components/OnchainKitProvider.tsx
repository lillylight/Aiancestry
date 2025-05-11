import { ReactNode } from 'react';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { WagmiProvider, createConfig } from 'wagmi';
import { http } from 'viem';
import { base } from 'wagmi/chains';
import { coinbaseWallet } from 'wagmi/connectors';

const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    coinbaseWallet({
      appName: 'AI Ancestry',
    }),
  ],
  ssr: true,
  transports: {
    [base.id]: http(),
  },
});

export default function CustomOnchainKitProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <OnchainKitProvider apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY} chain={base}>
        {children}
      </OnchainKitProvider>
    </WagmiProvider>
  );
}
