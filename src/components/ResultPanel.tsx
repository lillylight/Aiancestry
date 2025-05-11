"use client";
import React, { useRef, useEffect, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { FaTwitter, FaFacebook, FaFilePdf } from "react-icons/fa";
import AncestryPieChart, { AncestryDatum } from "./AncestryPieChart";
import { downloadAnalysisAsPDF } from "../utils/pdfUtils";
import DNALogo from "./DNALogo";
import { chartToImage } from "../utils/chartToImage";

interface ResultPanelProps {
  loading: boolean;
  progress: number;
  result: string;
  ancestryData: AncestryDatum[];
  onDownloadPDF: () => void;
  onShare: (platform: "twitter" | "facebook") => void;
  onNewReading: () => void;
}

export default function ResultPanel({
  loading,
  progress,
  result,
  ancestryData,
  onDownloadPDF,
  onShare,
  onNewReading,
}: ResultPanelProps) {
  const resultRef = useRef<HTMLDivElement>(null);
  const pieChartRef = useRef<HTMLDivElement>(null);
  const [ancestryPieData, setAncestryPieData] = useState<AncestryDatum[]>([]);
  const [pieChartDataUrl, setPieChartDataUrl] = useState<string | null>(null);

  useEffect(() => {
    setAncestryPieData(ancestryData && ancestryData.length ? ancestryData : []);
  }, [ancestryData]);

  // Generate PNG of pie chart after render
  useEffect(() => {
    if (!pieChartRef.current || ancestryPieData.length === 0) return;
    
    // Clear any previous URL
    setPieChartDataUrl(null);
    
    // Longer delay to ensure chart is fully rendered
    const timer = setTimeout(() => {
      try {
        const chartElement = pieChartRef.current.querySelector('.ancestry-pie-chart-capture');
        if (chartElement) {
          console.log('Capturing chart element:', chartElement);
          chartToImage(chartElement as HTMLElement).then(url => {
            console.log('Pie chart captured successfully, length:', url?.length || 0);
            if (url && url.startsWith('data:image/png;base64,')) {
              setPieChartDataUrl(url);
            } else {
              console.error('Invalid chart data URL format');
            }
          }).catch(err => {
            console.error('Error capturing chart:', err);
          });
        } else {
          console.error('Chart element not found in ref');
        }
      } catch (err) {
        console.error('Error during chart capture setup:', err);
      }
    }, 1500); // Increased delay to 1.5 seconds
    
    return () => clearTimeout(timer);
  }, [ancestryPieData]);

  const filledBtn = "custom-filled-btn px-1 py-0.5 text-[0.45rem] md:text-[0.55rem]";
  const outlineBtn = "custom-outline-btn px-1 py-0.5 text-[0.45rem] md:text-[0.55rem]";

  const handleDownloadPDF = () => {
    if (!result) return;
    
    if (ancestryPieData.length > 0) {
      // Try one more capture if we don't have a chart URL yet
      if (!pieChartDataUrl && pieChartRef.current !== null) {
        try {
          const chartElement = pieChartRef.current.querySelector('.ancestry-pie-chart-capture');
          if (chartElement) {
            chartToImage(chartElement as HTMLElement).then(url => {
              if (url && url.startsWith('data:image/png;base64,')) {
                // Use the newly captured URL directly
                downloadAnalysisAsPDF(result, ancestryPieData, url);
              } else {
                // Fallback if capture fails
                downloadAnalysisAsPDF(result, ancestryPieData);
              }
            }).catch(() => {
              downloadAnalysisAsPDF(result, ancestryPieData);
            });
          } else {
            downloadAnalysisAsPDF(result, ancestryPieData);
          }
        } catch (err) {
          console.error('Last-minute chart capture failed:', err);
          downloadAnalysisAsPDF(result, ancestryPieData);
        }
      } else {
        // Use previously captured URL
        downloadAnalysisAsPDF(result, ancestryPieData, pieChartDataUrl || undefined);
      }
    } else {
      // No chart data at all
      downloadAnalysisAsPDF(result, []);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#23252b] to-[#18191a] rounded-2xl p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center shadow-2xl w-full max-w-[420px] md:max-w-[480px] min-h-[340px] md:min-h-[420px] mx-auto animate-fade-in">
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
                    const compStartIdx = result.toLowerCase().indexOf('comprehensive ancestry percentage breakdown');
                    if (compStartIdx === -1) return result;
                    const afterComp = result.slice(compStartIdx);
                    const dashIdx = afterComp.indexOf('---');
                    let shown = dashIdx !== -1 ? result.slice(0, compStartIdx) + afterComp.slice(0, dashIdx) : result;
                    // Remove any numbers at the start of a line (e.g. "1.", "2.", etc) before headings/titles, but keep the line content
                    shown = shown.replace(/^[0-9]+\.(?=\s)/gm, '');
                    return shown;
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
                  disabled={loading || !pieChartDataUrl}
                  aria-label="Download as PDF"
                >
                  <FaFilePdf className="mr-1" />PDF
                </button>
                <button className={filledBtn} onClick={() => onShare("twitter")}><FaTwitter className="mr-1" />Share</button>
                <button className={filledBtn} onClick={() => onShare("facebook")}><FaFacebook className="mr-1" />Share</button>
              </div>
              <button className={outlineBtn} onClick={onNewReading}>New Reading</button>
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
            <div ref={pieChartRef} style={{ width: '100%', maxWidth: 340, margin: '0 auto' }}>
              <AncestryPieChart data={ancestryPieData} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
