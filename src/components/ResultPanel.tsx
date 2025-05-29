"use client";
import React, { useRef, useEffect, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { FaTwitter, FaFacebook, FaFilePdf } from "react-icons/fa";
import AncestryPieChart, { AncestryDatum } from "./AncestryPieChart";
import { downloadAnalysisAsPDF } from "../utils/pdfUtils";
import DNALogo from "./DNALogo";
import ChartCapture from "./ChartCapture";

interface ResultPanelProps {
  loading: boolean;
  progress: number;
  result: string;
  ancestryData: AncestryDatum[];
  onDownloadPDFAction: () => void;
  onShareAction: (platform: "twitter" | "facebook") => void;
  onNewReadingAction: () => void;
}

export default function ResultPanel({
  loading,
  progress,
  result,
  ancestryData,
  onDownloadPDFAction,
  onShareAction,
  onNewReadingAction,
}: ResultPanelProps) {
  const resultRef = useRef<HTMLDivElement>(null);
  const [ancestryPieData, setAncestryPieData] = useState<AncestryDatum[]>([]);
  const [pieChartDataUrl, setPieChartDataUrl] = useState<string | null>(null);

  useEffect(() => {
    setAncestryPieData(ancestryData && ancestryData.length ? ancestryData : []);
  }, [ancestryData]);

  // Handle chart capture
  const handleChartCapture = (dataUrl: string) => {
    console.log('Chart captured via ChartCapture component, data URL length:', dataUrl.length);
    setPieChartDataUrl(dataUrl);
    
    // Store globally for immediate access
    if (window) {
      (window as any).latestChartDataUrl = dataUrl;
      (window as any).currentChartDataUrl = dataUrl;
    }
  };

  const filledBtn = "custom-filled-btn px-1 py-0.5 text-[0.45rem] md:text-[0.55rem]";
  const outlineBtn = "custom-outline-btn px-1 py-0.5 text-[0.45rem] md:text-[0.55rem]";

  const handleDownloadPDF = async () => {
    if (!result) return;
    
    if (ancestryPieData.length > 0 && pieChartDataUrl) {
      console.log('Using captured chart for PDF');
      downloadAnalysisAsPDF(result, ancestryPieData, pieChartDataUrl);
    } else if (ancestryPieData.length > 0) {
      // Try to get it from global variable as fallback
      const globalChartUrl = (window as any).latestChartDataUrl || (window as any).currentChartDataUrl;
      if (globalChartUrl) {
        console.log('Using chart from global variable for PDF');
        downloadAnalysisAsPDF(result, ancestryPieData, globalChartUrl);
      } else {
        console.warn('No chart URL available, generating PDF without chart');
        downloadAnalysisAsPDF(result, ancestryPieData);
      }
    } else {
      // No chart data at all
      downloadAnalysisAsPDF(result, []);
    }
    
    // Call the parent's action handler
    onDownloadPDFAction();
  };

  return (
    <div className="bg-gradient-to-br from-[#23252b] to-[#18191a] rounded-2xl p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center shadow-2xl w-full max-w-[420px] md:max-w-[480px] min-h-[340px] md:min-h-[420px] mx-auto animate-fade-in">
      {/* Hidden chart capture component */}
      {ancestryPieData.length > 0 && (
        <ChartCapture data={ancestryPieData} onCapture={handleChartCapture} />
      )}
      
      {/* DNA Logo on top for premium branding */}
      <div className="flex justify-center mb-4">
        <DNALogo className="w-14 h-14 md:w-16 md:h-16 text-blue-400 drop-shadow-xl animate-premium-pop" />
      </div>
      {loading && (
        <div className="flex flex-1 min-h-[180px] w-full items-center justify-center">
          <div className="flex flex-col items-center justify-center w-full text-center">
            <h2 className="text-lg md:text-xl font-bold text-blue-500 mb-4 text-center">Analyzing Image...</h2>
            <div className="mb-4 flex flex-col items-center justify-center">
              <div className="w-[60px] h-[60px] md:w-[72px] md:h-[72px] relative mx-auto">
                <CircularProgressbar
                  value={progress}
                  text={''}
                  styles={buildStyles({
                    textColor: '#2f80ed',
                    pathColor: '#2f80ed',
                    trailColor: '#e5e7eb',
                    textSize: '1.2rem',
                  })}
                />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg md:text-xl font-extrabold text-[#2f80ed] select-none animate-fade-in" style={{letterSpacing:'-1px'}}>{progress}%</span>
              </div>
            </div>
            <p className="text-gray-400 text-xs md:text-sm text-center mt-2 mx-auto">Please wait while we analyze your image for ancestry features.</p>
          </div>
        </div>
      )}
      {!loading && (
        <>
          <div ref={resultRef} className="w-full">
            {result && (
              <div className="bg-[#23252b] rounded-lg p-5 mt-4 text-left text-gray-100 border border-blue-900/40 shadow-lg">
                <h2 className="result-card-heading">AI Ancestry Analysis</h2>
                <h2 className="result-card-heading mt-4 mb-1">Full Analysis</h2>
                <pre className="whitespace-pre-wrap text-xs bg-[#18191a] p-2 rounded border border-gray-700 overflow-x-auto max-h-52 floating-result-text !text-[#23252b] !opacity-100 !text-shadow-none text-center">
                  {(() => {
                    if (!result) return '';
                    
                    // Remove numbers at the start of lines (e.g. "1.", "2) ")
                    let cleaned = result.replace(/^\s*\d+[.)]\s*/gm, '');
                    
                    // Remove any remaining numbers followed by a dot and space at the start of a line
                    cleaned = cleaned.replace(/^\d+\.\s*/gm, '');
                    
                    // Remove any standalone numbers between paragraphs
                    cleaned = cleaned.replace(/\n\s*\d+\s*\n/g, '\n\n');
                    
                    // Clean up any double newlines that might have been created
                    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
                    
                    // Handle the comprehensive breakdown section
                    const compStartIdx = cleaned.toLowerCase().indexOf('comprehensive ancestry percentage breakdown');
                    if (compStartIdx === -1) return cleaned;
                    
                    const afterComp = cleaned.slice(compStartIdx);
                    const dashIdx = afterComp.indexOf('---');
                    
                    return dashIdx !== -1 
                      ? cleaned.slice(0, compStartIdx) + afterComp.slice(0, dashIdx) 
                      : cleaned;
                  })()}
                </pre>
              </div>
            )}
            {(!result && !loading) && (
              <div className="text-gray-400 text-center py-10">Upload an image to see your ancestry analysis here.</div>
            )}
          </div>
          {result && (
            <div className="flex w-full justify-between items-center mt-5 gap-4">
              <div className="flex gap-2">
                <button
                  className={filledBtn}
                  onClick={handleDownloadPDF}
                  disabled={loading}
                  aria-label="Download as PDF"
                >
                  <FaFilePdf className="mr-1" />PDF
                </button>
                <button className={filledBtn} onClick={() => onShareAction("twitter")}><FaTwitter className="mr-1" />Share</button>
                <button className={filledBtn} onClick={() => onShareAction("facebook")}><FaFacebook className="mr-1" />Share</button>
              </div>
              <button className={outlineBtn} onClick={onNewReadingAction}>New Reading</button>
            </div>
          )}
          {result && (
            <div>
              {!pieChartDataUrl && (
                <div className="text-xs text-gray-400 mt-2">Preparing chart for PDF...</div>
              )}
            </div>
          )}
          {ancestryPieData.length > 0 && (
            <div style={{ width: '100%', maxWidth: 340, margin: '0 auto' }}>
              <AncestryPieChart data={ancestryPieData} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
