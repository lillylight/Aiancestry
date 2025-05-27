import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import { 
  coinbaseWallet,
  injected,
  walletConnect
} from 'wagmi/connectors';

// Get the WalletConnect project ID from environment variables
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'dfca8f4268345b4528105ccc6ab2b70c';

// Create the wagmi config
export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  connectors: [
    // Coinbase Wallet - recommended
    coinbaseWallet({
      appName: 'AI Ancestry',
      // In wagmi v2, we can't set preference directly on the coinbaseWallet object
      // Instead, we would pass it in the options if supported by the connector
    }),
    // Browser extension wallets (MetaMask, etc.)
    injected(),
    // WalletConnect for mobile wallets
    walletConnect({
      projectId,
    }),
  ],
});

// Export the configured coinbaseWallet for use in components
export { coinbaseWallet };