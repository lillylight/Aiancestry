"use client";
import React, { useState, useEffect } from "react";
import UploadArea from "../components/UploadArea";
// import PremiumUploadArea from "../components/PremiumUploadArea";
import AncestryPieChart, { AncestryDatum } from "../components/AncestryPieChart";
import { FaFilePdf, FaTwitter, FaFacebook, FaShare } from "react-icons/fa";
import { chartToImage } from "../utils/chartToImage";
import {
  useWalletContext,
  Wallet,
  ConnectWallet,
  WalletDropdown,
  WalletDropdownLink,
  WalletDropdownDisconnect,
  ConnectWalletText,
} from '@coinbase/onchainkit/wallet';
import { Address, Avatar, Name, Identity, EthBalance } from '@coinbase/onchainkit/identity';
import { Checkout, CheckoutButton, CheckoutStatus } from '@coinbase/onchainkit/checkout';
import { motion } from 'framer-motion';
// Import useAccount from wagmi to properly detect wallet connection
import { useAccount } from 'wagmi';
import { FundButton } from '@coinbase/onchainkit/fund';

const PRODUCT_ID = process.env.NEXT_PUBLIC_PRODUCT_ID || '';

// Utility: Clean and format the result for better readability
function cleanAndFormatResult(raw: string): string {
  // Remove any previous disclaimers or boilerplate before 'YOUR PREDICTED ROOTS ARE:'
  const idx = raw.indexOf('YOUR PREDICTED ROOTS ARE:');
  let cleaned = idx !== -1 ? raw.slice(idx) : raw;

  // Remove any explicit 'SUMMARY TABLE' heading or similar on card 1/2
  cleaned = cleaned.replace(/\n?-?\s*SUMMARY TABLE\s*-?\n?/gi, '\n');

  // Replace markdown headings with styled equivalents
  cleaned = cleaned.replace(/###?\s*/g, '\n\n');
  // Bold important terms
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold">$1</span>');
  // Numbered headings for sections
  cleaned = cleaned.replace(/(\d+\.\s)/g, '<br/><span class="text-blue-500 font-bold">$1</span>');
  // Replace - bullets with •
  cleaned = cleaned.replace(/\n- /g, '\n• ');
  // Remove standalone dash symbols that aren't part of words
  cleaned = cleaned.replace(/([^\w-])-(\s|$)/g, '$1$2');
  cleaned = cleaned.replace(/(^|\s)-([^\w-])/g, '$1$2');
  // Remove excessive line breaks
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  // Add blank lines before bullets
  cleaned = cleaned.replace(/([^.])\n• /g, '$1\n\n• ');
  cleaned = cleaned.replace(/^• /gm, '\n• ');
  cleaned = cleaned.replace(/\n\n\n+/g, '\n\n');
  cleaned = cleaned.replace(/^\n+/, '');

  // Ensure there is always a blank line before any bolded section heading (even at start of line)
  cleaned = cleaned.replace(/([^\n])\n(<span class=\"font-bold\">[^<]+<\/span>)/g, '$1\n\n$2'); // after any char except \n
  // Also, if a bolded heading is immediately after a bullet (• ...\n<span...), ensure a blank line
  cleaned = cleaned.replace(/(• [^\n]+)\n(<span class=\"font-bold\">)/g, '$1\n\n$2');

  return cleaned;
}

function splitResultCards(text: string): string[] {
  const paras = text.split(/\n\s*\n|\n/).filter(Boolean);
  const chunkSize = Math.ceil(paras.length / 3);
  return [
    paras.slice(0, chunkSize).join('\n'),
    paras.slice(chunkSize, chunkSize * 2).join('\n'),
    paras.slice(chunkSize * 2).join('\n'),
  ];
}

export default function Home() {
  // Use wagmi's useAccount hook for reliable wallet connection detection
  const { isConnected, address } = useAccount();
  const [mounted, setMounted] = useState(false);
  // Set global user name for PDF generation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).aiAncestryUserName = address || '';
    }
  }, [address]);
  
  // Keep the OnchainKit wallet context for other wallet features
  const walletCtx = useWalletContext();
  
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<'upload' | 'processing' | 'result'>('upload');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [ancestryData, setAncestryData] = useState<AncestryDatum[]>([]);

  // Add mounted state to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync step on wallet connect/disconnect
  useEffect(() => {
    if (!isConnected) {
      setStep('upload');
      setImage(null);
      setResult("");
      setError("");
      setFadeOut(false);
      setAncestryData([]);
      setCarouselIndex(0);
      setShowShareModal(false);
    }
  }, [isConnected]);

  useEffect(() => {
    if (image) {
      const url = URL.createObjectURL(image);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setImageUrl(null);
    }
  }, [image]);

  const handleDrop = (files: File[]) => {
    const file = files[0];
    setImage(file);
    setResult("");
    setError("");
  };

  const handleReveal = () => {
    if (!image) return;
    setStep('processing');
    triggerAnalysis(image);
  };

  const triggerAnalysis = (file: File) => {
    setLoading(true);
    setProgress(10);
    const formData = new FormData();
    formData.append("file", file);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/analyze-face", true);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        // Upload progress from 0-40%
        setProgress(Math.round((event.loaded / event.total) * 40));
      }
    };

    // Simulate analysis progress from 40-95%
    let analysisProgress = 40;
    const progressInterval = setInterval(() => {
      if (analysisProgress < 95) {
        analysisProgress += 1;
        setProgress(analysisProgress);
      } else {
        clearInterval(progressInterval);
      }
    }, 100);
    xhr.onload = () => {
      clearInterval(progressInterval);
      setProgress(100);
      setLoading(false);
      if (xhr.status === 200) {
        const res = JSON.parse(xhr.responseText);
        setResult(res.analysis);
        setAncestryData(res.ancestryData || []); 
        setStep('result');
        setCarouselIndex(0);
      } else {
        setError("Failed to analyze image. Please try again.");
        setStep('upload');
      }
    };
    xhr.onerror = () => {
      setLoading(false);
      setError("Failed to analyze image. Please try again.");
      setStep('upload');
    };
    xhr.send(formData);
  };

  // PDF download handler using premium PDF utility and pie chart image
  const handleDownloadPDF = async () => {
    // Try to get the pie chart image as PNG
    let pieChartDataUrl: string | undefined = undefined;
    const chartEl = document.querySelector(".ancestry-pie-chart-capture") as HTMLElement;
    if (chartEl) {
      try {
        pieChartDataUrl = await chartToImage(chartEl);
      } catch (e) {
        // fallback: no chart image
      }
    }
    import('../utils/pdfUtils').then(({ downloadAnalysisAsPDF }) => {
      downloadAnalysisAsPDF(result, ancestryData, pieChartDataUrl);
    });
  };

  const handleShare = (platform: 'twitter' | 'facebook' | 'copy') => {
    const url = encodeURIComponent(window.location.href);
    const message = encodeURIComponent("I just discovered my ancestry using this new AI app!");
    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?url=${url}&text=${message}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${message}`, '_blank');
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(window.location.href);
      setShowShareModal(false);
      alert('Link copied!');
    }
  };

  const handleNewReading = () => {
    setStep('upload');
    setImage(null);
    setResult("");
    setFadeOut(false);
  };

  const formattedCards = splitResultCards(cleanAndFormatResult(result));

  const handleCardScroll = (e: React.UIEvent<HTMLDivElement>, idx: number) => {
    if (idx === 1) return; // Don't auto-advance on the 2nd card
    const el = e.target as HTMLDivElement;
    // Scroll down for next
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) {
      setTimeout(() => {
        if (carouselIndex === idx && idx < carouselSlides.length - 1) {
          setFadeOut(true);
          setTimeout(() => {
            setFadeOut(false);
            setCarouselIndex(idx + 1);
          }, 380);
        }
      }, 120);
    }
    // Scroll up for previous
    if (el.scrollTop === 0 && idx > 0) {
      setTimeout(() => {
        if (carouselIndex === idx) {
          setFadeOut(true);
          setTimeout(() => {
            setFadeOut(false);
            setCarouselIndex(idx - 1);
          }, 380);
        }
      }, 120);
    }
  };

  const carouselSlides = [
    <div key="reading1" className={`openai-card carousel-slide${fadeOut && carouselIndex === 0 ? ' fade-out' : ''} flex flex-col items-center justify-start min-h-[500px] py-12 bg-transparent shadow-none`}>
      <h2 className="text-xl font-bold text-blue-400 mb-3 w-full text-center" style={{position:'relative', top: '-0.75rem'}}>Your Ancestry Reading</h2>
      <div className="floating-result-text w-full max-w-2xl mx-auto text-base text-gray-800 font-mono bg-white/10 border-none shadow-none p-6 overflow-y-auto hide-scrollbar relative" style={{maxHeight:'420px', minHeight:'220px', boxShadow:'none'}} onScroll={e => handleCardScroll(e, 0)}>
        {/* Format the report with blank lines between bullets and paragraphs, and remove any summary table if present */}
        <div dangerouslySetInnerHTML={{__html: cleanAndFormatResult((formattedCards[0] || '').replace(/\| *Region\/Group *\| *Estimated Percentage *\| *Key Traits.*\|[\s\S]*?(\|.*\|.*\|.*\|\n?)+/, ''))}} />
      </div>
    </div>,
    <div key="reading2" className={`openai-card carousel-slide${fadeOut && carouselIndex === 1 ? ' fade-out' : ''} flex flex-col items-center justify-start min-h-[500px] py-12 bg-transparent shadow-none`}>
      <h2 className="text-xl font-bold text-blue-400 mb-3 w-full text-center" style={{position:'relative', top: '-0.75rem'}}>More Details</h2>
      <div className="floating-result-text w-full max-w-2xl mx-auto text-base text-gray-800 font-mono bg-white/10 border-none shadow-none p-6 overflow-y-auto hide-scrollbar relative" style={{maxHeight:'420px', minHeight:'220px', boxShadow:'none'}} onScroll={e => handleCardScroll(e, 1)}>
        {/* Format the report with blank lines between bullets and paragraphs, and remove any summary table if present */}
        <div dangerouslySetInnerHTML={{__html: cleanAndFormatResult((formattedCards[1] || '').replace(/\| *Region\/Group *\| *Estimated Percentage *\| *Key Traits.*\|[\s\S]*?(\|.*\|.*\|.*\|\n?)+/, ''))}} />
      </div>
    </div>,
    <div key="summary" className={`openai-card carousel-slide${fadeOut && carouselIndex === 2 ? ' fade-out' : ''} flex flex-col items-center justify-start min-h-[500px] py-12 bg-transparent shadow-none`}>
      <h2 className="text-xl font-bold text-blue-400 mb-3 w-full text-center" style={{position:'relative', top: '-0.75rem'}}>Summary Table</h2>
      <div className="floating-result-text w-full max-w-4xl mx-auto text-base text-gray-800 font-mono bg-white/10 border-none shadow-none p-8 overflow-y-auto hide-scrollbar relative" style={{maxWidth:'950px',maxHeight:'420px', minHeight:'220px', boxShadow:'none'}}>
        {(() => {
          const summaryTableMatch = result.match(/\| *Region\/Group *\| *Estimated Percentage *\| *Key Traits.*\|[\s\S]*?(\|.*\|.*\|.*\|\n?)+/);
          if (summaryTableMatch) {
            const tableMarkdown = summaryTableMatch[0];
            const rows = tableMarkdown.trim().split(/\n/).filter(Boolean);
            if (rows.length >= 2) {
              const headerCells = rows[0].split('|').slice(1,-1).map(cell => cell.trim());
              const bodyRows = rows.slice(2).map(row => row.split('|').slice(1,-1).map(cell => cell.trim()));
              return (
                <table style={{width:'100%',fontFamily:'var(--font-mono)',fontSize:'1.08rem',marginTop:8,marginBottom:8, borderCollapse:'separate', borderSpacing:'0 0.75rem'}}>
                  <thead>
                    <tr>
                      {headerCells.map((cell, idx) => <th key={idx} style={{padding:'12px 18px',textAlign: idx===1?'right':'left', fontWeight:700, fontSize:'1.12rem', background:'#f5f6fa', borderBottom:'2px solid #e4e4e7', color:'#222'}}> {cell} </th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {bodyRows.map((cells, ridx) => (
                      <tr key={ridx} style={{background: ridx%2===0?'#f8fafc':'#fff', boxShadow:'0 1px 6px #e5e7eb33'}}>
                        {cells.map((cell, cidx) => (
                          <td key={cidx} style={{
                            padding:'16px 18px',
                            textAlign: cidx===1?'right':'left',
                            fontWeight: cidx===1?600:400,
                            fontSize: cidx===1?'1.12rem':'1.08rem',
                            whiteSpace: 'pre-line',
                            borderRadius: cidx===0 ? '12px 0 0 12px' : cidx===2 ? '0 12px 12px 0' : undefined,
                            borderBottom: '1.5px solid #e4e4e7',
                            background: 'inherit'
                          }}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            }
          }
          return null;
        })()}
      </div>
    </div>,
    <div key="piechart" className={`openai-card carousel-slide${fadeOut && carouselIndex === 3 ? ' fade-out' : ''} flex flex-col items-center justify-center min-h-[500px]`}>
      <h2 className="text-xl font-bold text-blue-400 mb-3 w-full text-center" style={{position:'relative', top: '-0.75rem'}}>Ancestry Pie Chart</h2>
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
        {/* Parse ancestry data from summary table in result, fallback to ancestryData */}
        {(() => {
          // Extract summary table from result (markdown table)
          const tableMatch = result.match(/\| *Region\/Group *\| *Estimated Percentage *\| *Key Traits.*\|[\s\S]*?(\|.*\|.*\|.*\|\n?)+/);
          if (tableMatch) {
            const rows = tableMatch[0].trim().split(/\n/).filter(Boolean);
            if (rows.length >= 3) {
              // Parse rows to get regions and percentages
              const data = rows.slice(2).map(row => {
                const cells = row.split('|').slice(1,-1).map(cell => cell.trim());
                const region = cells[0];
                const percent = parseInt(cells[1].replace(/[^\d]/g, ''), 10);
                return region && !isNaN(percent) ? { region, percent } : null;
              }).filter((item): item is { region: string; percent: number } => item !== null);
              if (data.length) {
                return <AncestryPieChart data={data} />;
              }
            }
          }
          // Fallback to ancestryData if no table found
          if (ancestryData && ancestryData.length) {
            return <AncestryPieChart data={ancestryData} />;
          }
          return <div className="text-gray-500 text-center mt-6">No ancestry data available for visualization.</div>;
        })()}
      </div>
    </div>,
  ];

  useEffect(() => {
    // This effect should only run on the client side
    if (typeof window === 'undefined') return;
    let paymentSuccessDetected = false;

    const logState = (msg) => {
      console.log(`[PAYMENT DEBUG] ${msg}`, { image, step });
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.data) {
        if (
          (event.data.type === 'checkout-status-change' && event.data.status === 'success') ||
          event.data.event_type === 'charge:confirmed' ||
          event.data.event_type === 'charge:resolved' ||
          event.data.event_type === 'charge:completed'
        ) {
          if (paymentSuccessDetected) return;
          paymentSuccessDetected = true;
          logState('Payment detected via postMessage');
          setTimeout(() => {
            logState('Calling triggerAnalysis after payment (postMessage)');
            if (image && step === 'upload') {
              setStep('processing');
              triggerAnalysis(image);
            }
          }, 3000);
        }
      }
    };
    window.addEventListener('message', handleMessage);

    const checkForPaymentSuccess = () => {
      if (paymentSuccessDetected) return;
      const successElements = document.querySelectorAll('.ock-text-success, .ock-success-message');
      if (successElements.length > 0) {
        paymentSuccessDetected = true;
        logState('Payment detected via DOM class');
        setTimeout(() => {
          logState('Calling triggerAnalysis after payment (DOM class)');
          if (image && step === 'upload') {
            setStep('processing');
            triggerAnalysis(image);
          }
        }, 3000);
        return;
      }
      const allElements = document.querySelectorAll('*');
      Array.from(allElements).forEach(element => {
        if (
          element.textContent?.includes('Payment successful') ||
          element.textContent?.includes('Payment completed') ||
          element.textContent?.includes('Transaction complete') ||
          element.textContent?.includes('Payment confirmed') ||
          element.textContent?.includes('View payment details')
        ) {
          paymentSuccessDetected = true;
          logState('Payment detected via DOM text');
          setTimeout(() => {
            logState('Calling triggerAnalysis after payment (DOM text)');
            if (image && step === 'upload') {
              setStep('processing');
              triggerAnalysis(image);
            }
          }, 3000);
          return;
        }
      });
    };

    const observer = new MutationObserver((mutations) => {
      if (paymentSuccessDetected) return;
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              const successElements = document.querySelectorAll('.ock-text-success, .ock-success-message');
              if (successElements.length > 0) {
                if (paymentSuccessDetected) return;
                paymentSuccessDetected = true;
                logState('Payment detected via MutationObserver class');
                setTimeout(() => {
                  logState('Calling triggerAnalysis after payment (MutationObserver class)');
                  if (image && step === 'upload') {
                    setStep('processing');
                    triggerAnalysis(image);
                  }
                }, 3000);
              }
              if (
                element.textContent?.includes('Payment successful') ||
                element.textContent?.includes('Payment completed') ||
                element.textContent?.includes('Transaction complete') ||
                element.textContent?.includes('Payment confirmed') ||
                element.textContent?.includes('View payment details')
              ) {
                if (paymentSuccessDetected) return;
                paymentSuccessDetected = true;
                logState('Payment detected via MutationObserver text');
                setTimeout(() => {
                  logState('Calling triggerAnalysis after payment (MutationObserver text)');
                  if (image && step === 'upload') {
                    setStep('processing');
                    triggerAnalysis(image);
                  }
                }, 3000);
              }
            }
          });
        }
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const interval = setInterval(checkForPaymentSuccess, 1500);

    return () => {
      window.removeEventListener('message', handleMessage);
      observer.disconnect();
      clearInterval(interval);
    };
  }, [image, step]);

  return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#f8f9fa] to-[#e5e7eb] py-12 relative">
        {/* Wallet connect button top right, round border, full dropdown */}
        <div className="absolute top-6 right-8 z-50">
          <Wallet>
            <ConnectWallet
              className={`ock-connect-glass px-4 py-2 rounded-full font-bold text-white text-base shadow-lg border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-700/80 backdrop-blur-lg bg-opacity-70 hover:bg-gray-900/80 transition-all duration-200 focus:outline-none ${isConnected ? 'from-green-600 to-indigo-600 border-green-400/30' : 'from-indigo-600 to-green-600 border-indigo-500/30'}`}
              disconnectedLabel="Connect Wallet"
            >
              {isConnected && (
                <div className="mr-2 relative">
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute w-2 h-2 bg-green-400 rounded-full right-0 top-0 opacity-70"
                  ></motion.div>
                  <div className="absolute w-2 h-2 bg-green-500 rounded-full right-0 top-0"></div>
                </div>
              )}
              <Avatar className="h-6 w-6" />
              <ConnectWalletText>
                {isConnected ? '' : 'Connect Wallet'}
              </ConnectWalletText>
              <Name className="font-medium" />
            </ConnectWallet>
            <WalletDropdown>
              <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                <Avatar className="h-8 w-8" />
                <Name className="font-bold ml-2" />
                <Address className="text-gray-400 ml-2" />
              </Identity>
              <WalletDropdownLink
                className="py-3 rounded-xl flex items-center bg-white/10 hover:bg-white/20 text-black font-medium pl-4 pr-2 my-1 transition-all duration-200 border border-gray-300 hover:translate-y-[-2px]"
                icon="wallet"
                href="https://keys.coinbase.com"
              >
                Wallet
              </WalletDropdownLink>
              <FundButton
                className="w-full py-3 rounded-xl flex items-center justify-start bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all duration-200 my-1 pl-4 pr-2"
                text="Add Funds"
                hideIcon={false}
                openIn="tab"
              />
              <div className="pt-2 pb-2">
                <WalletDropdownDisconnect className="w-full bg-white/10 hover:bg-red-900 transition-all duration-200 py-3 rounded-xl text-black font-medium border border-gray-300 hover:border-red-500 hover:translate-y-[-2px]" />
              </div>
            </WalletDropdown>
          </Wallet>
        </div>

        {/* Wallet connection overlay - only shown when wallet is not connected AND component is mounted */}
        {mounted && !isConnected && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center">
            <div className="max-w-md mx-auto bg-[#23252b]/90 p-8 rounded-3xl shadow-2xl border border-indigo-500/30 text-center">
              <div className="flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-indigo-400 mr-3 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2m0-10v-4a2 2 0 00-2-2H6a2 2 0 00-2 2v4m0-5h7v2a3 3 0 01.105 2.967l-1.178 9a2 2 0 01-2 1.846V11a2 2 0 012-2h6a2 2 0 012 2v3" />
                </svg>
                <h2 className="text-2xl font-bold text-white">Connect Your Wallet</h2>
              </div>
              <p className="text-gray-300 mb-8">
                Please connect your wallet using the button in the top right corner to access AI Ancestry and reveal your roots.
              </p>
              {/* <div className="animate-bounce bg-indigo-600 p-2 w-10 h-10 ring-1 ring-indigo-400/50 shadow-lg rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </div> */}
              {/* <div className="flex justify-center">
                <div className="animate-bounce bg-indigo-600 p-2 w-10 h-10 ring-1 ring-indigo-400/50 shadow-lg rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </div>
              </div> */}
            </div>
          </div>
        )}

        {/* Only show content when mounted and wallet is connected */}
        {mounted && (
          <>
            {/* Only show upload/pay card if step is 'upload' and wallet is connected */}
            {isConnected && step === 'upload' && (
              <div className="w-full max-w-2xl mx-auto flex justify-center">
                <div className="openai-card flex flex-col items-center animate-fade-in text-center w-full max-w-lg mx-auto p-4 md:p-6 bg-[#23252b]/80 rounded-[2.5rem]">
                  <div className="flex flex-col items-center w-full justify-center">
                    <div
                      className="relative w-full flex justify-center items-center"
                      style={{ minHeight: '320px' }}
                    >
                      {/* Frosted glass dark blur overlay when image is uploaded */}
                      <div
                        style={{
                          width: '100%',
                          height: '320px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          filter: image ? 'blur(3px) grayscale(0.7) opacity(0.7)' : 'none',
                          pointerEvents: image ? 'auto' : 'auto',
                          transition: 'filter 0.4s, opacity 0.4s',
                          position: 'relative',
                        }}
                        onClick={e => {
                          // Only reset if user clicks the overlay, NOT the pay button
                          if (image && !loading) {
                            // If the click is inside the pay button, do nothing
                            const payBtn = document.getElementById('pay-btn');
                            if (payBtn && payBtn.contains(e.target as Node)) return;
                            setImage(null);
                            setResult("");
                            setError("");
                          }
                        }}
                        title={image && !loading ? 'Click anywhere except the Pay button to upload a new image' : undefined}
                      >
                        {image && !loading && (
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              zIndex: 2,
                              background: 'rgba(34, 36, 40, 0.42)',
                              backdropFilter: 'blur(7px) saturate(1.2)',
                              WebkitBackdropFilter: 'blur(7px) saturate(1.2)',
                              borderRadius: '2.5rem',
                              pointerEvents: 'auto',
                            }}
                          />
                        )}
                        <UploadArea
                          onDrop={(files) => {
                            const file = files[0];
                            setImage(file);
                          }}
                          isUploading={loading}
                          hasFile={!!image}
                          imageUrl={imageUrl || undefined}
                        />
                      </div>
                      {/* Payment button overlays UploadArea as before */}
                      {image && !loading && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            pointerEvents: 'none', // let overlay handle pointer events except for button
                            zIndex: 3,
                          }}
                        >
                          <div style={{ pointerEvents: 'auto', zIndex: 4 }}>
                            <Checkout productId={PRODUCT_ID}>
                              <div className="flex flex-col items-center w-full">
                                <div style={{ display: step === 'upload' ? 'block' : 'none' }}>
                                  <CheckoutButton
                                    id="pay-btn"
                                    coinbaseBranded
                                    className="openai-btn openai-btn-green px-4 py-2 text-base mx-auto mt-7 w-40"
                                    onSuccess={() => {
                                      setStep('processing');
                                      triggerAnalysis(image);
                                    }}
                                  >
                                    Reveal My Roots
                                  </CheckoutButton>
                                </div>
                                <div className="flex justify-center w-full mt-2">
                                  <CheckoutStatus />
                                </div>
                              </div>
                            </Checkout>
                          </div>
                        </div>
                      )}
                    </div>
                    {loading && (
                      <div className="flex flex-col items-center justify-center w-full mt-8 mb-8">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-400 mb-6"></div>
                        <span className="text-3xl font-bold text-blue-500 mb-2" style={{ letterSpacing: '-0.5px' }}>Uploading & Analyzing...</span>
                        <span className="text-lg text-gray-300">Please wait while we process your photo and generate your ancestry reading.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {step === 'processing' && (
              <div className="openai-card flex flex-col items-center justify-center min-h-[420px] animate-fade-in text-center">
                {/* Move h2 slightly higher */}
                <h2 className="text-2xl font-bold text-blue-500 mb-6 mt-2" style={{position:'relative', top: '-0.75rem'}}>Analyzing Image...</h2>
                <div className="w-full max-w-md px-4 mb-4 mt-2">
                  <div className="h-6 w-6 md:h-16 md:w-16 bg-blue-500 rounded-full transition-all duration-300 ease-out flex items-center justify-center mx-auto" style={{ width: 96, height: 96, minWidth: 48, minHeight: 48 }}>
                    <span className="text-white text-sm font-semibold">{progress}%</span>
                  </div>
                </div>
                <p className="text-gray-400 text-base mt-2">Please wait while we analyze your image for ancestry features.</p>
              </div>
            )}
            {/* Always render result panel, only show content if step is 'result' */}
            {step === 'result' && (
              <div className="relative">
                {/* Remove the 'Your Ancestry Reading' heading above the carousel */}
                {carouselSlides[carouselIndex]}
                {/* Carousel dots */}
                <div className="flex justify-center gap-2 mt-3">
                  {carouselSlides.map((_, idx) => (
                    <button
                      key={idx}
                      className={`carousel-dot-btn${carouselIndex === idx ? ' active' : ''}`}
                      onClick={() => setCarouselIndex(idx)}
                      aria-label={`Show Card ${idx+1}`}
                      type="button"
                    ></button>
                  ))}
                </div>
                {/* Download/Share/New Reading buttons at the bottom, OpenAI.fm style */}
                <div className="flex flex-wrap gap-6 justify-center items-center mt-8">
                  <button className="openai-btn openai-btn-light flex items-center gap-1 px-2 py-1 text-sm" onClick={handleDownloadPDF}>
                    <FaFilePdf className="text-sm" /> DOWNLOAD
                  </button>
                  <button className="openai-btn openai-btn-dark flex items-center gap-1 px-2 py-1 text-sm" onClick={()=>setShowShareModal(true)}>
                    <FaShare className="text-sm" /> SHARE
                  </button>
                  <button className="openai-btn openai-btn-light flex items-center gap-1 px-2 py-1 text-sm" onClick={handleNewReading}>
                    NEW READING
                  </button>
                </div>
              </div>
            )}
            {showShareModal && (
              <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center gap-6">
                  <h3 className="font-bold text-lg mb-2">Share your result</h3>
                  <div className="flex gap-4">
                    <button className="openai-btn openai-btn-dark flex items-center gap-2" onClick={()=>handleShare('twitter')}><FaTwitter /> Twitter</button>
                    <button className="openai-btn openai-btn-dark flex items-center gap-2" onClick={()=>handleShare('facebook')}><FaFacebook /> Facebook</button>
                    <button className="openai-btn openai-btn-light flex items-center gap-2" onClick={()=>handleShare('copy')}>Copy Link</button>
                  </div>
                  <button className="text-blue-400 mt-3 underline" onClick={()=>setShowShareModal(false)}>Cancel</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
  );
}
