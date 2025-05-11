'use client';

import React, { useState, useEffect } from 'react';

const disclaimerText = `By using this app, you consent to our terms. This is an experimental, creative project and should not replace actual DNA analysis. The ancestry results are for fun and may be inaccurate—do not use them for any real-world, medical, legal, or governmental purposes.`;

const howToUseText = [
  "Upload a clear photo of your face.",
  "Wait for the AI to analyze your features.",
  "View your experimental ancestry breakdown",
  "Download your results as a PDF (Alpha)."
];
const howToUseNote = "Note: No images are stored. This is for experimental uses only!";

export default function DisclaimerPopups({ onCloseAll }: { onCloseAll?: () => void }) {
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [showHowTo, setShowHowTo] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    // Prevent background scroll when popup is open
    if (showDisclaimer || showHowTo) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showDisclaimer, showHowTo]);

  const closeDisclaimer = () => {
    setShowDisclaimer(false);
    setShowHowTo(true);
  };
  const closeHowTo = () => {
    setShowHowTo(false);
    if (onCloseAll) onCloseAll();
  };

  // Premium style
  const glass = {
    background: '#f0f0f0',
    boxShadow: '0 12px 40px 0 rgba(0,0,0,0.15)',
    borderRadius: '1.6rem',
    backdropFilter: 'blur(8px)',
    color: '#1a202c',
    border: '1.5px solid rgba(255,255,255,0.2)',
    padding: '2rem 1.8rem 1.8rem',
    maxWidth: 400,
    width: '90%',
    margin: '0 auto',
    position: 'relative',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 400,
    letterSpacing: '0.01em',
    lineHeight: 1.6,
    zIndex: 1002,
    fontFamily: '"Montserrat", "SF Pro Display", Geist, Inter, sans-serif',
  } as React.CSSProperties;

  const overlay = {
    position: 'fixed' as const,
    zIndex: 1001,
    top: 0, left: 0, right: 0, bottom: 0,
    width: '100vw', height: '100vh',
    background: 'rgba(15,15,20,0.65)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <>
      {showDisclaimer && (
        <div style={overlay}>
          <div
            style={{
              background: '#f0f0f0',
              boxShadow: '0 12px 40px 0 rgba(0,0,0,0.15)',
              borderRadius: '1.6rem',
              backdropFilter: 'blur(8px)',
              color: '#1a202c',
              border: '1.5px solid rgba(255,255,255,0.2)',
              padding: '2rem 1.8rem 1.8rem',
              maxWidth: '400px',
              width: '90%',
              margin: '0 auto',
              position: 'relative',
              textAlign: 'center',
              fontSize: '16px',
              fontWeight: 400,
              letterSpacing: '0.01em',
              lineHeight: 1.6,
              zIndex: 1002,
              fontFamily: '"Montserrat", "SF Pro Display", Geist, Inter, sans-serif',
            }}
            data-component-name="DisclaimerPopups"
          >
            <button
              style={{
                position: 'absolute',
                top: 18,
                right: 20,
                fontSize: '24px',
                background: 'none',
                border: 'none',
                color: '#1a202c',
                cursor: 'pointer',
                boxShadow: '0 2px 10px #23252b12',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
              aria-label="Close"
              disabled={!accepted}
            >
              ×
            </button>
            <div style={{
              fontSize: 24, 
              fontWeight: 700, 
              marginBottom: 20, 
              letterSpacing: '-0.02em',
              color: '#1a202c',
              position: 'relative',
              paddingBottom: '12px',
            }}>
              <span style={{
                position: 'relative',
                display: 'inline-block',
              }}>
                Disclaimer
                <span style={{
                  position: 'absolute',
                  bottom: '-8px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '40px',
                  height: '3px',
                  background: '#3182ce',
                  borderRadius: '2px',
                }}></span>
              </span>
            </div>
            <div style={{
              marginBottom: 20, 
              whiteSpace: 'pre-line',
              padding: '0 10px',
              fontSize: '15px',
              lineHeight: '1.7',
              color: '#2d3748',
            }}>{disclaimerText}</div>
            <div style={{
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 12, 
              margin: '24px 0 20px',
              padding: '8px 12px',
              background: 'transparent', 
              borderRadius: '12px',
            }}>
              <input 
                type="checkbox" 
                id="accept-disclaimer" 
                checked={accepted} 
                onChange={e => setAccepted(e.target.checked)} 
                style={{
                  width: 20, 
                  height: 20, 
                  accentColor: '#3182ce', 
                  boxShadow: '0 1px 4px rgba(49, 130, 206, 0.3)', 
                  borderRadius: 4,
                  cursor: 'pointer',
                }} 
              />
              <label 
                htmlFor="accept-disclaimer" 
                style={{
                  fontSize: 15, 
                  color: '#2d3748', 
                  opacity: 0.95, 
                  cursor: 'pointer', 
                  fontWeight: 600,
                  textAlign: 'left',
                }}
              >
                I have read and accept the disclaimer
              </label>
            </div>
            <button 
              onClick={accepted ? closeDisclaimer : undefined} 
              disabled={!accepted} 
              style={{
                marginTop: 12, 
                padding: '12px 36px', 
                borderRadius: 12, 
                background: accepted ? '#3182ce' : '#a0aec0', 
                color: '#fff', 
                border: 'none', 
                cursor: accepted ? 'pointer' : 'not-allowed', 
                fontWeight: 600, 
                boxShadow: accepted ? '0 4px 14px rgba(49, 130, 206, 0.4)' : 'none', 
                transition: 'all 0.3s ease',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}
      {showHowTo && (
        <div style={overlay} onClick={closeHowTo}>
          <div 
            style={{...glass, 
              padding: '2rem 1.8rem 1.8rem',
            }} 
            onClick={e => { e.stopPropagation(); closeHowTo(); }}
          >
            <button 
              style={{
                position: 'absolute', 
                top: 18, 
                right: 20, 
                fontSize: 24, 
                background: 'none', 
                border: 'none', 
                color: '#1a202c', 
                cursor: 'pointer',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }} 
              aria-label="Close" 
              onClick={closeHowTo}
            >
              &times;
            </button>
            <div style={{
              fontSize: 24, 
              fontWeight: 700, 
              marginBottom: 20, 
              letterSpacing: '-0.02em',
              color: '#1a202c',
              position: 'relative',
              paddingBottom: '12px',
            }}>
              <span style={{
                position: 'relative',
                display: 'inline-block',
              }}>
                How to Use
                <span style={{
                  position: 'absolute',
                  bottom: '-8px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '40px',
                  height: '3px',
                  background: '#3182ce',
                  borderRadius: '2px',
                }}></span>
              </span>
            </div>
            <ul style={{
              margin: '0 0 18px 0',
              padding: 0,
              listStyle: 'disc inside',
              textAlign: 'left',
              fontSize: '15px',
              lineHeight: '1.7',
              color: '#2d3748',
              maxWidth: 340,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}>
              {howToUseText.map((item, idx) => (
                <li key={idx} style={{marginBottom: 6}}>{item}</li>
              ))}
            </ul>
            <div style={{
              marginBottom: 12, 
              fontSize: '15px',
              color: '#2d3748',
              textAlign: 'center',
              whiteSpace: 'pre-line',
            }}>{howToUseNote}</div>
          </div>
        </div>
      )}
    </>
  );
}
