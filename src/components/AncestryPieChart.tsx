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
  // Defensive: extract region and percent from any object that looks like it has them
  const sanitizedData = Array.isArray(data)
    ? data
        .map((item) => {
          // Accept both string and number for percent, trim region
          let region = '';
          let percent = 0;
          if (typeof item === 'object' && item !== null) {
            // Only try .label if item is not strictly AncestryDatum, but allow for generic objects
            region = String((item as any).region || (item as any).label || '').trim();
            percent = typeof (item as any).percent === 'number' ? (item as any).percent : parseInt((item as any).percent, 10);
            // Try to parse from string like 'RegionName (Tribe): 23%' or 'RegionName: 23%'
            if ((!region || isNaN(percent) || percent <= 0)) {
              const text = String((item as any).region || (item as any).label || item.toString() || '');
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
    : [];

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
      {/* Color Key */}
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
          <div
            key={item.region}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 2,
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 12,
                height: 12,
                borderRadius: 3,
                background: colors[i % colors.length],
              }}
            ></span>
            <span style={{ color: "#23252b" }}>
              {item.region} ({item.percent}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
