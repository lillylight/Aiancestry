"use client";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
} from "chart.js";
import React from "react";

ChartJS.register(ArcElement, Tooltip, Legend);

export interface AncestryDatum {
  region: string;
  percent: number;
}

export default function AncestryPieChart({ data }: { data: AncestryDatum[] }) {
  const sanitizedData = (Array.isArray(data)
    ? data
        .map((item) => {
          let region = '';
          let percent = 0;
          if (typeof item === 'object' && item !== null) {
            if ('region' in item && typeof (item as {region?: unknown}).region === 'string') {
              region = ((item as {region?: unknown}).region as string).trim();
            } else if ('label' in item && typeof (item as {label?: unknown}).label === 'string') {
              region = ((item as {label?: unknown}).label as string).trim();
            }
            if ('percent' in item) {
              if (typeof (item as {percent?: unknown}).percent === 'number') {
                percent = (item as {percent?: unknown}).percent as number;
              } else if (typeof (item as {percent?: unknown}).percent === 'string') {
                percent = parseInt((item as {percent?: unknown}).percent as string, 10);
              }
            }
            if ((!region || isNaN(percent) || percent <= 0)) {
              const text = String((item as {region?: unknown, label?: unknown}).region || (item as {label?: unknown}).label || item.toString() || '');
              const match = text.match(/([A-Za-z\-\s]+)(?:\s*\([^)]*\))?[:\s]+(\d{1,3})%/);
              if (match) {
                region = match[1].trim();
                percent = parseInt(match[2], 10);
              }
            }
          }
          if (region && !isNaN(percent) && percent > 0) {
            return { region, percent };
          }
          return null;
        })
        .filter((item) => item !== null)
    : []) as AncestryDatum[];

  if (!sanitizedData || sanitizedData.length === 0) return null;
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
    labels: sanitizedData.map((item) => item.region),
    datasets: [
      {
        label: "Ancestry %",
        data: sanitizedData.map((item) => item.percent),
        backgroundColor: sanitizedData.map((_, i) => colors[i % colors.length]),
        borderWidth: 1,
      },
    ],
  };
  return (
    <div style={{ maxWidth: 400, minHeight: 420, margin: "0 auto", position: "relative" }}>
      <Pie data={chartData} options={{ plugins: { legend: { display: false } } }} />
      <div
        style={{
          position: "absolute",
          bottom: 16,
          left: 16,
          background: "rgba(255,255,255,0.95)",
          borderRadius: 10,
          padding: "8px 12px",
          boxShadow: "0 2px 8px #0001",
          fontSize: 12,
          minWidth: 140,
        }}
      >
        {sanitizedData.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
            <span style={{
              display: "inline-block",
              width: 14,
              height: 14,
              borderRadius: 4,
              marginRight: 8,
              background: colors[i % colors.length],
            }} />
            <span>{item.region}: {item.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
