"use client";
import React, { useRef } from "react";
import { useDropzone } from "react-dropzone";

interface PremiumUploadAreaProps {
  onDrop: (files: File[]) => void;
  isUploading: boolean;
  hasFile?: boolean;
}

const PremiumUploadArea: React.FC<PremiumUploadAreaProps> = ({ onDrop, isUploading, hasFile }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    onDrop,
    disabled: isUploading,
  });
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={`relative premium-upload-area ${hasFile ? "has-file" : ""} ${isUploading ? "uploading" : ""}`}
      {...getRootProps()}
      style={{ borderRadius: 32, border: "2.5px dashed #2f80ed", background: "linear-gradient(135deg, #f8fafc 60%, #e0e7ef 100%)", transition: "box-shadow 0.3s, transform 0.2s" }}
    >
      <input {...getInputProps()} ref={inputRef} />
      <div className="flex flex-col items-center justify-center py-10 animate-premium-pop">
        {/* Premium, elegant SVG icon replaces FaCloudUploadAlt */}
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mb-4 animate-fade-in"
          style={{ filter: 'drop-shadow(0 4px 18px #b8d0f7)', background: 'linear-gradient(135deg, #f7fafc 60%, #e0e7ef 100%)', borderRadius: 18 }}
        >
          <defs>
            <linearGradient id="premiumGradient" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2f80ed" />
              <stop offset="1" stopColor="#6d47d6" />
            </linearGradient>
            <linearGradient id="shine" x1="0" y1="16" x2="64" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fff" stopOpacity="0.85" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Crown shape for premium feel */}
          <path d="M8 44L16 20L32 44L48 20L56 44Z" fill="url(#premiumGradient)" stroke="#fff" strokeWidth="2.5" />
          {/* Shine effect */}
          <ellipse cx="32" cy="27" rx="14" ry="6" fill="url(#shine)" />
          {/* Diamond in the center */}
          <rect x="28" y="30" width="8" height="8" rx="2" fill="#fff" stroke="#6d47d6" strokeWidth="1.5" transform="rotate(45 32 34)" />
          {/* Subtle sparkles */}
          <circle cx="16" cy="16" r="1.5" fill="#fff" />
          <circle cx="48" cy="12" r="1" fill="#fff" />
          <circle cx="54" cy="28" r="1.2" fill="#fff" />
        </svg>
        <p className="text-2xl font-extrabold text-blue-600 mb-1 animate-gradient-text">Upload Photo</p>
        <p className="text-base text-gray-500 mb-2 animate-fade-in">PNG, JPG, JPEG, WEBP, GIF up to 20MB</p>
        {isUploading && <span className="text-blue-500 mt-2 animate-pulse">Uploading & Analyzing...</span>}
        {hasFile && !isUploading && <span className="text-green-500 animate-fade-in">Image ready!</span>}
      </div>
      {isDragActive && <div className="absolute inset-0 bg-blue-100 bg-opacity-30 rounded-3xl animate-premium-drag" />}
      <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 opacity-30 blur-2xl animate-premium-orb" />
      <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-gradient-to-br from-blue-300 to-green-300 opacity-30 blur-2xl animate-premium-orb" />
    </div>
  );
};

export default PremiumUploadArea;
