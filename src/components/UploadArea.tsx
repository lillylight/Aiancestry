"use client";
import React from "react";
import { useDropzone } from "react-dropzone";
import { FaCloudUploadAlt } from "react-icons/fa";
import styles from './UploadArea.module.css';

interface UploadAreaProps {
  onDrop: (files: File[]) => void;
  isUploading: boolean;
  hasFile?: boolean;
  imageUrl?: string;
}

const UploadArea: React.FC<UploadAreaProps> = ({ onDrop, isUploading, hasFile, imageUrl }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    onDrop,
    disabled: isUploading,
  });

  return (
    <div
      {...getRootProps()}
      className={
        `relative flex flex-col items-center justify-center w-full max-w-[780px] min-h-[390px] p-0 bg-transparent rounded-[2.5rem] upload-area-lux ${!hasFile ? 'animate-premium-pop' : ''} ${styles.uploadAreaAnimated}
        md:max-w-[600px] md:min-h-[320px]
        sm:max-w-[95vw] sm:min-h-[180px] sm:rounded-2xl sm:p-2
        xs:max-w-[99vw] xs:min-h-[120px] xs:rounded-xl xs:p-1`
      }
      style={{overflow:'hidden', border:'none', boxShadow:'none', background: 'transparent'}}
    >
      {/* Top Spacer - adjust height as needed */}
      <div style={{ height: '32px', flexShrink: 0 }} />
      <input {...getInputProps()} />
      {hasFile && !isUploading ? (
        imageUrl ? (
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%'}}>
            <div style={{ position: 'relative', width: '100%', height: '325px', borderRadius: '2.5rem', overflow: 'hidden', border: '2.5px solid #e5e7eb', transition: 'all 0.25s cubic-bezier(.4,2,.6,1)' }}>
              <img
                src={imageUrl}
                alt="Uploaded preview"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }}
              />
              {/* Overlay content goes here (e.g. Pay button) */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                {/* Place overlay/modal content here if needed */}
                {/** Example: <PayButton /> or children */}
              </div>
            </div>
          </div>
        ) : null
      ) : (
        <>
          <FaCloudUploadAlt size={60} className="mb-4 text-blue-400" style={{filter:'drop-shadow(0 2px 8px #b8d0f7)'}} />
          <p className="text-2xl font-extrabold text-gray-800 mb-1" style={{letterSpacing:'-0.5px'}}>Upload Photo</p>
          <p className="text-base text-gray-500 mb-2">PNG, JPG, JPEG, WEBP, GIF up to 20MB</p>
        </>
      )}
      {/* Bottom Spacer - adjust height as needed */}
      <div style={{ height: '32px', flexShrink: 0 }} />
      {isUploading && <span className="text-blue-400 mt-2 animate-pulse">Uploading & Analyzing...</span>}
    </div>
  );
};

export default UploadArea;
