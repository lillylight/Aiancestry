'use client';

import React, { useState, useEffect } from 'react';

const disclaimerText = `Welcome! By using this app, you consent to our terms. This is an experimental, creative project and should not replace actual DNA analysis. The ancestry results are for fun and may be inaccurate—do not use them for any real-world, medical, legal, or governmental purposes.`;

const howToUseText = `Upload a clear photo of your face.\n2. Wait for the AI to analyze your features.\n3. View your creative ancestry breakdown and download a premium PDF.\n\nNote: No images are stored. This is for entertainment only!`;

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

  // Glass style
  const glass = {
    background: 'linear-gradient(135deg, rgba(240,242,250,0.96) 80%, rgba(47,128,237,0.10) 100%)',
    boxShadow: '0 8px 32px 0 rgba(47,128,237,0.10)',
    borderRadius: '1.4rem',
    backdropFilter: 'blur(8px)',
    color: '#2d3748',
    border: '1.5px solid rgba(160,160,170,0.14)',
    padding: '1.6rem 1.2rem 1.2rem 1.2rem',
    maxWidth: 360,
    width: '90%',
    margin: '0 auto',
    position: 'relative',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 500,
    letterSpacing: '-0.01em',
    zIndex: 1002,
    fontFamily: 'Geist, Inter, Segoe UI, sans-serif',
  } as React.CSSProperties;

  const overlay = {
    position: 'fixed' as const,
    zIndex: 1001,
    top: 0, left: 0, right: 0, bottom: 0,
    width: '100vw', height: '100vh',
    background: 'rgba(32,34,38,0.20)',
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
              background: 'linear-gradient(135deg, rgba(240,242,250,0.96) 80%, rgba(47,128,237,0.10) 100%)',
              boxShadow: '0 8px 32px 0 rgba(47,128,237,0.10)',
              borderRadius: '1.4rem',
              backdropFilter: 'blur(8px)',
              color: '#2d3748',
              border: '1.5px solid rgba(160,160,170,0.14)',
              padding: '1.6rem 1.2rem 1.2rem 1.2rem',
              maxWidth: '360px',
              width: '90%',
              margin: '0 auto',
              position: 'relative',
              textAlign: 'center',
              fontSize: '16px',
              fontWeight: 500,
              letterSpacing: '-0.01em',
              zIndex: 1002,
              fontFamily: 'Geist, Inter, Segoe UI, sans-serif',
            }}
            data-component-name="DisclaimerPopups"
          >
            <button
              style={{
                position: 'absolute',
                top: 16,
                right: 18,
                fontSize: '22px',
                background: 'none',
                border: 'none',
                color: '#2d3748',
                cursor: 'pointer',
                boxShadow: '0 2px 10px #23252b12',
                borderRadius: '7px',
                transition: 'background 0.18s',
              }}
              aria-label="Close"
              disabled={!accepted}
            >
              ×
            </button>
            <div style={{fontSize: 20, fontWeight: 800, marginBottom: 12, letterSpacing: '-0.02em'}}>Disclaimer</div>
            <div style={{marginBottom: 12, whiteSpace: 'pre-line'}}>{disclaimerText}</div>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, margin: '16px 0'}}>
              <input type="checkbox" id="accept-disclaimer" checked={accepted} onChange={e => setAccepted(e.target.checked)} style={{width: 20, height: 20, accentColor: '#2f80ed', boxShadow: '0 1px 4px #2f80ed33', borderRadius: 4}} />
              <label htmlFor="accept-disclaimer" style={{fontSize: 16, color: '#2d3748', opacity: 0.95, cursor: 'pointer', fontWeight: 600}}>I have read and accept the disclaimer</label>
            </div>
            <button onClick={accepted ? closeDisclaimer : undefined} disabled={!accepted} style={{marginTop: 12, padding: '10px 30px', fontSize: 16, borderRadius: 12, background: accepted ? 'linear-gradient(90deg, #2f80ed 60%, #47b3e7 100%)' : '#888', color: '#fff', border: 'none', cursor: accepted ? 'pointer' : 'not-allowed', fontWeight: 800, boxShadow: '0 2px 12px #2f80ed22', transition: 'background 0.2s'}}>
              Continue
            </button>
          </div>
        </div>
      )}
      {showHowTo && (
        <div style={overlay} onClick={closeHowTo}>
          <div style={glass} onClick={e => { e.stopPropagation(); closeHowTo(); }}>
            <button style={{position: 'absolute', top: 22, right: 28, fontSize: 22, background: 'none', border: 'none', color: '#f3f4f6', cursor: 'pointer'}} aria-label="Close" onClick={closeHowTo}>&times;</button>
            <div style={{fontSize: 24, fontWeight: 800, marginBottom: 18, letterSpacing: '-0.02em'}}>How to Use</div>
            <div style={{marginBottom: 12, whiteSpace: 'pre-line'}}>{howToUseText}</div>
          </div>
        </div>
      )}
    </>
  );
}
