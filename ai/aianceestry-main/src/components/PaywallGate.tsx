import React, { useState, useEffect } from 'react';
import { Checkout, CheckoutButton, CheckoutStatus } from '@coinbase/onchainkit/checkout';
import { useAccount } from 'wagmi';
import WalletGate from './WalletGate';

const PRODUCT_ID = process.env.NEXT_PUBLIC_PRODUCT_ID || '6a666890-4b0d-45c6-b61b-ef1b86a4c19c';

interface PaywallGateProps {
  children: React.ReactNode;
  onPaymentSuccess?: () => void;
}

export default function PaywallGate({ children, onPaymentSuccess }: PaywallGateProps) {
  const { isConnected } = useAccount();
  const [paid, setPaid] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  useEffect(() => {
    // This effect should only run on the client side
    if (typeof window === 'undefined') return;
    
    // Flag to track if payment success has been detected
    let paymentSuccessDetected = false;
    
    const handleMessage = (event: MessageEvent) => {
      if (event.data) {
        // Check for any payment success indicators
        if (
          (event.data.type === 'checkout-status-change' && event.data.status === 'success') ||
          event.data.event_type === 'charge:confirmed' ||
          event.data.event_type === 'charge:resolved' ||
          event.data.event_type === 'charge:completed'
        ) {
          if (paymentSuccessDetected) return;
          
          paymentSuccessDetected = true;
          setPaymentVerified(true);
          setPaid(true);
          
          // Call onPaymentSuccess callback if provided
          setTimeout(() => {
            if (onPaymentSuccess) onPaymentSuccess();
          }, 2000);
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    // Function to check for payment success indicators in the DOM
    const checkForPaymentSuccess = () => {
      if (paymentSuccessDetected) return;
      
      // Check for success message in the DOM
      const successElements = document.querySelectorAll('.ock-text-success, .ock-success-message');
      if (successElements.length > 0) {
        paymentSuccessDetected = true;
        setPaymentVerified(true);
        setPaid(true);
        
        setTimeout(() => {
          if (onPaymentSuccess) onPaymentSuccess();
        }, 2000);
      }
    };
    
    // Set up a timer to periodically check for payment success indicators
    const checkInterval = setInterval(checkForPaymentSuccess, 1000);
    
    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(checkInterval);
    };
  }, [onPaymentSuccess]);

  const handlePredictClick = () => {
    setShowDisclaimer(true);
  };

  const handleAcceptDisclaimer = () => {
    setDisclaimerAccepted(true);
    setShowDisclaimer(false);
  };

  const handleCancelDisclaimer = () => {
    setShowDisclaimer(false);
  };

  if (paid) {
    return (
      <>{children}</>
    );
  }

  return (
    <WalletGate>
      <div className="flex flex-col items-center justify-center gap-6 p-6 bg-white/70 rounded-[1.5rem] shadow-lg border border-gray-200/50">
        <h2 className="text-xl font-bold text-blue-600 mb-2">Unlock Your Ancestry Analysis</h2>
      
      {showDisclaimer ? (
        <div className="bg-gray-100 p-6 rounded-xl mb-6 border border-gray-300 shadow-lg w-full max-w-md">
          <h3 className="text-lg font-bold mb-4">Disclaimer</h3>
          <p className="mb-4 text-gray-700">
            By proceeding with this payment, you acknowledge that:
          </p>
          <ul className="text-left text-gray-700 mb-6 space-y-2">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>This is an experimental service and results are for entertainment purposes only.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>The creator will not be held liable for any funds lost during the transaction.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>The accuracy of ancestry predictions cannot be guaranteed.</span>
            </li>
          </ul>
          <div className="flex space-x-4">
            <button
              onClick={handleCancelDisclaimer}
              className="flex-1 py-2 bg-gray-300 hover:bg-gray-400 rounded-full shadow-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleAcceptDisclaimer}
              className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:opacity-90 rounded-full shadow-lg font-medium"
            >
              I Understand
            </button>
          </div>
        </div>
      ) : disclaimerAccepted ? (
        <div className="w-full">
          {!isConnected ? (
            <div className="bg-yellow-50 p-4 rounded-xl mb-4 border border-yellow-200 shadow-lg">
              <div className="flex items-center justify-center mb-2">
                <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-yellow-700 font-medium">
                  Wallet Connection Required
                </p>
              </div>
              <p className="text-sm text-yellow-600 mt-2">
                Please connect your wallet using the button in the top right corner.
              </p>
            </div>
          ) : (
            <div className="relative mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200 shadow-lg">
              {paymentVerified ? (
                <div className="bg-green-50 p-4 rounded-xl text-green-700 flex flex-col items-center justify-center">
                  <svg className="w-10 h-10 text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-bold mb-1">Payment Verified!</h3>
                  <p className="mb-2 text-sm">Your payment has been successfully processed.</p>
                  <p className="text-xs">Preparing your personalized ancestry analysis...</p>
                  <div className="mt-3 w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-green-400 to-blue-500 h-full rounded-full animate-pulse" style={{ width: '100%' }}></div>
                  </div>
                </div>
              ) : (
                <Checkout productId={PRODUCT_ID}>
                  <CheckoutButton 
                    coinbaseBranded 
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 rounded-full shadow-lg font-medium text-white"
                  />
                  <CheckoutStatus />
                </Checkout>
              )}
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={handlePredictClick}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:opacity-90 rounded-full shadow-lg font-medium"
        >
          Proceed to Payment
        </button>
      )}
      
      <div className="text-gray-500 text-sm mt-2 text-center">
        A small fee is required to run the analysis. Pay securely with your wallet.
      </div>
      </div>
    </WalletGate>
  );
}
