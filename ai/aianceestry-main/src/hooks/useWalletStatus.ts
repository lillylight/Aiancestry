import { useEffect, useState } from 'react';
import { useWalletContext } from '@coinbase/onchainkit/wallet';

export function useWalletStatus() {
  const walletCtx = useWalletContext?.();
  // Try to find the correct property for address/connection
  const address = walletCtx?.address || walletCtx?.selectedAddress || walletCtx?.walletAddress || null;
  const [isConnected, setIsConnected] = useState(!!address);

  useEffect(() => {
    setIsConnected(!!address);
  }, [address]);

  return { isConnected, address };
}
