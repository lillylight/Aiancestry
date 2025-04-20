"use client";
import React from "react";
import { useDropzone } from "react-dropzone";
import { FaCloudUploadAlt } from "react-icons/fa";

interface UploadAreaProps {
  onDrop: (files: File[]) => void;
  isUploading: boolean;
  hasFile?: boolean;
}

const UploadArea: React.FC<UploadAreaProps> = ({ onDrop, isUploading, hasFile }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    onDrop,
    disabled: isUploading,
  });

  return (
    <div className={`upload-area ${hasFile ? 'upload-area-hasfile' : ''} bg-gradient-to-br from-[#f8f9fa] to-[#e5e7eb] border-2 border-dashed border-blue-500 rounded-2xl p-8 flex flex-col items-center justify-center shadow-lg w-full max-w-lg min-h-[280px] transition-all duration-300 hover:scale-105`}>
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center w-full h-48 cursor-pointer focus:outline-none ${isDragActive ? "bg-blue-100/60 border-blue-400" : "bg-white/50"}`}
        style={{ borderRadius: 24, border: '2px dashed #3b82f6', transition: 'background 0.3s' }}
      >
        <input {...getInputProps()} />
        <FaCloudUploadAlt size={48} className="mb-4 text-blue-400" />
        <p className="text-lg font-bold text-gray-800 mb-1">Upload Photo</p>
        <p className="text-sm text-gray-600 mb-2">PNG, JPG, JPEG, WEBP, GIF up to 20MB</p>
        {isUploading && <span className="text-blue-400 mt-2 animate-pulse">Uploading & Analyzing...</span>}
      </div>
    </div>
  );
};

export default UploadArea;
