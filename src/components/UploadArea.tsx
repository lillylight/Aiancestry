"use client";
import React from "react";
import { useDropzone } from "react-dropzone";
import { FaCloudUploadAlt } from "react-icons/fa";
<<<<<<< HEAD
=======
import styles from './UploadArea.module.css';
>>>>>>> 4a0568c (Initial commit with clean history)

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
<<<<<<< HEAD
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
=======
    <div
      {...getRootProps()}
      className={"relative flex flex-col items-center justify-center w-full max-w-lg min-h-[320px] p-0 bg-transparent rounded-[2.5rem] upload-area-lux animate-premium-pop " + styles.uploadAreaAnimated}
      style={{overflow:'hidden', border:'none', boxShadow:'none', background: 'transparent'}}
    >
      {/* Elegant blurred orb background */}
      {/* Removed blurred orb background as per user request */}
      <input {...getInputProps()} />
      {hasFile && !isUploading ? (
        <>
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 animate-fade-in">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          <p className="text-2xl font-extrabold text-green-600 mb-1 animate-fade-in" style={{letterSpacing:'-0.5px'}}>Photo Ready</p>
        </>
      ) : (
        <>
          <FaCloudUploadAlt size={60} className="mb-4 text-blue-400" style={{filter:'drop-shadow(0 2px 8px #b8d0f7)'}} />
          <p className="text-2xl font-extrabold text-gray-800 mb-1" style={{letterSpacing:'-0.5px'}}>Upload Photo</p>
          <p className="text-base text-gray-500 mb-2">PNG, JPG, JPEG, WEBP, GIF up to 20MB</p>
        </>
      )}
      {isUploading && <span className="text-blue-400 mt-2 animate-pulse">Uploading & Analyzing...</span>}
      {hasFile && !isUploading && <span className="text-green-500 animate-fade-in">Image ready!</span>}
>>>>>>> 4a0568c (Initial commit with clean history)
    </div>
  );
};

export default UploadArea;
