"use client";
import React, { useState, useRef } from "react";
import axios from "axios";
import UploadArea from "../components/UploadArea";
import ResultPanel from "../components/ResultPanel";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import AncestryPieChart, { AncestryDatum } from "../components/AncestryPieChart";
import { FaArrowRight, FaArrowLeft, FaFilePdf, FaTwitter, FaFacebook, FaShare, FaTree } from "react-icons/fa";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';

function extractAncestryData(resultText: string): AncestryDatum[] {
  // Parse ancestry percentages section
  const ancestrySection = resultText.split('ANCESTRY PERCENTAGES:')[1]?.split('FEATURE ANALYSIS:')[0] || '';
  const matches = ancestrySection
    .split('\n')
    .filter(line => line.includes('%'))
    .map(line => {
      const match = line.match(/([^:]+):\s*(\d+)%/);
      if (match) {
        const region = match[1].trim();
        const percent = parseInt(match[2], 10);
        if (region && !isNaN(percent) && percent > 0) {
          return { region, percent };
        }
      }
      return null;
    })
    .filter(item => item !== null);

  return matches;
}

function extractFeatureHighlights(resultText: string): string[] {
  const lines = resultText.split('\n').filter(line =>
    /nose|skin|eye|lip|ear|jaw|cheek|brow|forehead|chin|line|feature/i.test(line)
  );
  return lines;
}

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

// Utility: Remove disclaimer-like lines from a string
function removeDisclaimers(text: string): string {
  return text
    .split(/\n|<br\s*\/?\s*>/)
    .filter(line => !/disclaimer|experimental|fun|not a replacement|entertainment|cannot replace|no data is stored|should not be used/i.test(line))
    .join('\n');
}

// Only show summary data (regions/countries/tribes/percentages) on summary card
function extractSummarySection(resultText: string): string {
  const summaryStart = resultText.indexOf('SUMMARY:');
  if (summaryStart === -1) return '';
  // Get everything after 'SUMMARY:'
  let summary = resultText.slice(summaryStart + 'SUMMARY:'.length).trim();
  // Remove any extra explanations, keep only lines with region/country/tribe and %
  summary = summary.split('\n').filter(line => /%/.test(line)).join('\n');
  return summary;
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
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | undefined>(undefined);
  const [fileSize, setFileSize] = useState<string | undefined>(undefined);
  const [step, setStep] = useState<'upload' | 'processing' | 'result'>('upload');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [ancestryData, setAncestryData] = useState<AncestryDatum[]>([]);

  const handleDrop = (files: File[]) => {
    const file = files[0];
    setImage(file);
    setFileName(file.name);
    setFileSize((file.size / 1024 / 1024).toFixed(2) + " MB");
    setPreview(URL.createObjectURL(file));
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

  const featureHighlights = result ? extractFeatureHighlights(result) : [];

  const handleDownloadText = () => {
    const text = result ? result : 'No analysis result available.';
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ancestry-analysis.txt';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
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
    setPreview(null);
    setFileName(undefined);
    setFileSize(undefined);
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
      <h2 className="text-xl font-bold text-blue-400 mb-3 w-full text-center">Your Ancestry Reading</h2>
      <div className="floating-result-text w-full max-w-2xl mx-auto text-base text-gray-800 font-mono bg-white/10 border-none shadow-none p-6 overflow-y-auto hide-scrollbar relative" style={{maxHeight:'420px', minHeight:'220px', boxShadow:'none'}} onScroll={e => handleCardScroll(e, 0)}>
        {/* Format the report with blank lines between bullets and paragraphs, and remove any summary table if present */}
        <div dangerouslySetInnerHTML={{__html: cleanAndFormatResult((formattedCards[0] || '').replace(/\| *Region\/Group *\| *Estimated Percentage *\| *Key Traits.*\|[\s\S]*?(\|.*\|.*\|.*\|\n?)+/, ''))}} />
      </div>
    </div>,
    <div key="reading2" className={`openai-card carousel-slide${fadeOut && carouselIndex === 1 ? ' fade-out' : ''} flex flex-col items-center justify-start min-h-[500px] py-12 bg-transparent shadow-none`}>
      <h2 className="text-xl font-bold text-blue-400 mb-3 w-full text-center">More Details</h2>
      <div className="floating-result-text w-full max-w-2xl mx-auto text-base text-gray-800 font-mono bg-white/10 border-none shadow-none p-6 overflow-y-auto hide-scrollbar relative" style={{maxHeight:'420px', minHeight:'220px', boxShadow:'none'}} onScroll={e => handleCardScroll(e, 1)}>
        {/* Format the report with blank lines between bullets and paragraphs, and remove any summary table if present */}
        <div dangerouslySetInnerHTML={{__html: cleanAndFormatResult((formattedCards[1] || '').replace(/\| *Region\/Group *\| *Estimated Percentage *\| *Key Traits.*\|[\s\S]*?(\|.*\|.*\|.*\|\n?)+/, ''))}} />
      </div>
    </div>,
    <div key="summary" className={`openai-card carousel-slide${fadeOut && carouselIndex === 2 ? ' fade-out' : ''} flex flex-col items-center justify-start min-h-[420px] py-12 bg-transparent shadow-none`}>
      <h2 className="text-xl font-bold text-blue-400 mb-3 w-full text-center">Summary Table</h2>
      <div className="floating-result-text w-full max-w-4xl mx-auto text-base text-gray-800 font-mono bg-white/10 border-none shadow-none p-8 overflow-y-auto hide-scrollbar relative" style={{maxWidth:'950px',maxHeight:'520px', minHeight:'220px', boxShadow:'none'}}>
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
    <div key="piechart" className={`openai-card carousel-slide${fadeOut && carouselIndex === 3 ? ' fade-out' : ''} flex flex-col items-center justify-center min-h-[420px]`}>
      <h2 className="text-xl font-bold text-blue-400 mb-3 w-full text-center">Ancestry Pie Chart</h2>
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
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
              }).filter(Boolean);
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#f8f9fa] to-[#e5e7eb] py-12">
      <div className="w-full max-w-2xl mx-auto">
        {step === 'upload' && (
          <div className="openai-card flex flex-col items-center animate-fade-in text-center max-w-md mx-auto p-4 md:p-6">
            <div className="flex flex-col items-center w-full">
              <h1 className="text-3xl font-extrabold text-gray-800 mb-2 w-full text-center font-['Inter',sans-serif] tracking-tight" style={{fontFamily:'Inter,Segoe UI,sans-serif', letterSpacing:'-0.03em'}}>AI Ancestry</h1>
              <p className="text-gray-500 mb-5 text-base w-full max-w-xs mx-auto text-center">Upload a clear photo of your face to get a creative, experimental ancestry breakdown.</p>
            </div>
            <div className="flex flex-col items-center w-full">
              <div className="flex justify-center w-full mb-8">
                <div className="relative w-full max-w-md">
                  <UploadArea onDrop={handleDrop} isUploading={loading} hasFile={!!image} />
                  {image && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#23252b]/80 border-2 border-blue-400 rounded-2xl z-10 animate-fade-in">
                      <span className="text-blue-400 font-bold text-base mb-1">File Ready!</span>
                      <span className="text-white text-xs break-all max-w-[80%] text-center">{image.name}</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                className="openai-btn openai-btn-green px-8 py-3 text-lg mx-auto"
                style={{ minWidth: 180 }}
                onClick={() => image && handleReveal()}
                disabled={!image || loading}
              >
                {loading ? 'Uploading...' : 'REVEAL MY ROOTS!'}
              </button>
              {error && <div className="text-red-500 mt-4 w-full text-center">{error}</div>}
            </div>
          </div>
        )}
        {step === 'processing' && (
          <div className="openai-card flex flex-col items-center justify-center min-h-[420px] animate-fade-in text-center">
            <h2 className="text-2xl font-bold text-blue-500 mb-8">Analyzing Image...</h2>
            <div className="w-full max-w-md px-4 mb-6">
              <div className="h-6 w-6 md:h-16 md:w-16 bg-blue-500 rounded-full transition-all duration-300 ease-out flex items-center justify-center mx-auto" style={{ width: 96, height: 96, minWidth: 48, minHeight: 48 }}>
                <span className="text-white text-sm font-semibold">{progress}%</span>
              </div>
            </div>
            <p className="text-gray-400 text-base">Please wait while we analyze your image for ancestry features.</p>
          </div>
        )}
        {step === 'result' && (
          <div className="relative">
            {carouselSlides[carouselIndex]}
            {/* Carousel dots */}
            <div className="flex justify-center gap-2 mt-4">
              {carouselSlides.map((_, idx) => (
                <button key={idx} className={`w-4 h-4 rounded-full border-2 ${carouselIndex===idx ? 'bg-blue-600 border-blue-600' : 'bg-gray-300 border-gray-400'}`} onClick={()=>setCarouselIndex(idx)} aria-label={`Show Card ${idx+1}`}></button>
              ))}
            </div>
            {/* Download/Share/New Reading buttons at the bottom, OpenAI.fm style */}
            <div className="flex flex-wrap gap-6 justify-center items-center mt-10">
              <button className="openai-btn openai-btn-light flex items-center gap-1 px-2 py-1 text-sm" onClick={handleDownloadText}>
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
      </div>
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
    </div>
  );
}
