"use client";
import React, { useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export interface AncestryDatum {
  region: string;
  percent: number;
}

interface ChartCaptureProps {
  data: AncestryDatum[];
  onCapture: (dataUrl: string) => void;
}

export default function ChartCapture({ data, c }: ChartCaptureProps) {
  const captureRef = useRef<HTMLDivElement>(null);
  const hasCapture = useRef(false);

  const colors = [
    "#2f80ed",
    "#f2994a", 
    "#27ae60",
    "#eb5757",
    "#9b51e0",
    "#56ccf2",
    "#f2c94c",
    "#6fcf97",
    "#bb6bd9",
  ];

  const chartData: ChartData<"pie"> = {
    labels: data.map((item) => item.region),
    datasets: [
      {
        label: "Ancestry %",
        data: data.map((item) => item.percent),
        backgroundColor: data.map((_, i) => colors[i % colors.length]),
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: false // Disable tooltips for capture
      }
    },
    animation: {
      duration: 0 // No animation for immediate capture
    }
  };

  useEffect(() => {
    if (!captureRef.current || hasCapture.current || !data.length) return;

    // Wait a bit for DOM to settle
    const timer = setTimeout(() => {
      if (!captureRef.current || hasCapture.current) return;

      html2canvas(captureRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      }).then(canvas => {
        const dataUrl = canvas.toDataURL('image/png');
        if (dataUrl && dataUrl.length > 100) {
          hasCapture.current = true;
          onCapture(dataUrl);
          console.log('Chart captured successfully with html2canvas');
        }
      }).catch(err => {
        console.error('html2canvas error:', err);
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [data, onCapture]);

  return (
    <div 
      ref={captureRef}
      style={{
        position: 'absolute',
        left: '-9999px',
        top: '-9999px',
        width: '400px',
        height: '500px',
        background: 'white',
        padding: '20px',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      <div style={{ width: '360px', height: '360px', margin: '0 auto' }}>
        <Pie data={chartData} options={options} />
      </div>
      <div style={{ marginTop: '20px' }}>
        {data.map((item, i) => (
          <div key={i} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '8px',
            fontSize: '14px',
            color: '#000'
          }}>
            <span style={{
              display: 'inline-block',
              width: '16px',
              height: '16px',
              borderRadius: '4px',
              marginRight: '10px',
              background: colors[i % colors.length],
            }} />
            <span>{item.region}: {item.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
