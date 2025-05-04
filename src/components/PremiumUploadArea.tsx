"use client";
import React, { useRef } from "react";
import { useDropzone } from "react-dropzone";
import { FaCloudUploadAlt } from "react-icons/fa";

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
        <FaCloudUploadAlt size={60} className="mb-4 text-blue-500 animate-bounce" />
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
