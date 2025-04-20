"use client";
import React, { useRef, useEffect, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { FaFilePdf, FaShareAlt, FaTwitter, FaFacebook } from "react-icons/fa";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import AncestryPieChart, { AncestryDatum } from "./AncestryPieChart";

interface ResultPanelProps {
  loading: boolean;
  progress: number;
  fileName?: string;
  fileSize?: string;
  result: string;
  ancestryData: AncestryDatum[];
  featureHighlights: string[];
  onDownloadPDF: () => void;
  onShare: (platform: "twitter" | "facebook") => void;
  onNewReading: () => void;
}

export default function ResultPanel({
  loading,
  progress,
  fileName,
  fileSize,
  result,
  ancestryData,
  featureHighlights,
  onDownloadPDF,
  onShare,
  onNewReading,
}: ResultPanelProps) {
  const resultRef = useRef<HTMLDivElement>(null);
  const [ancestryPieData, setAncestryPieData] = useState<AncestryDatum[]>([]);

  useEffect(() => {
    setAncestryPieData(ancestryData && ancestryData.length ? ancestryData : []);
  }, [ancestryData]);

  const filledBtn = "custom-filled-btn px-1 py-0.5 text-[0.45rem] md:text-[0.55rem]";
  const outlineBtn = "custom-outline-btn px-1 py-0.5 text-[0.45rem] md:text-[0.55rem]";

  return (
    <div className="bg-gradient-to-br from-[#23252b] to-[#18191a] rounded-2xl p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center shadow-2xl w-full max-w-[420px] md:max-w-[480px] min-h-[340px] md:min-h-[420px] mx-auto animate-fade-in">
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
                <ul className="list-disc text-center mb-3 text-sm text-blue-200 flex flex-col items-center">
                  {featureHighlights.length === 0 && <li>No specific features highlighted.</li>}
                  {featureHighlights.map((line, idx) => (
                    <li key={idx} className="list-item">{line}</li>
                  ))}
                </ul>
                <h2 className="result-card-heading mt-4 mb-1">Full Analysis</h2>
                <pre className="whitespace-pre-wrap text-xs bg-[#18191a] p-2 rounded border border-gray-700 overflow-x-auto max-h-52 floating-result-text !text-[#23252b] !opacity-100 !text-shadow-none text-center">{result}</pre>
              </div>
            )}
            {(!result && !loading) && (
              <div className="text-gray-400 text-center py-10">Upload an image to see your ancestry analysis here.</div>
            )}
          </div>
          {result && (
            <div className="flex w-full justify-between items-center mt-5 gap-4">
              <div className="flex gap-2">
                <button className={filledBtn} onClick={onDownloadPDF}><FaFilePdf className="mr-1" />Download</button>
                <button className={filledBtn} onClick={() => onShare("twitter")}><FaTwitter className="mr-1" />Share</button>
                <button className={filledBtn} onClick={() => onShare("facebook")}><FaFacebook className="mr-1" />Share</button>
              </div>
              <button className={outlineBtn} onClick={onNewReading}>New Reading</button>
            </div>
          )}
          {ancestryPieData.length > 0 && (
            <AncestryPieChart data={ancestryPieData} />
          )}
        </>
      )}
    </div>
  );
}

<style>
  /* Center card headings */
  .result-card-heading {
    text-align: center;
    width: 100%;
    font-size: 1.37rem;
    font-weight: 800;
    color: #2f80ed;
    margin-bottom: 0.7em;
    letter-spacing: -0.01em;
  }
</style>
