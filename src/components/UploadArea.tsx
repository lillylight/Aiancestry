"use client";
import React from "react";
import { useDropzone } from "react-dropzone";
import { FaCloudUploadAlt } from "react-icons/fa";
import styles from './UploadArea.module.css';

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
    </div>
  );
};

export default UploadArea;
