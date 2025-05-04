import React from 'react';

const BetaTag: React.FC = () => (
  <div
    style={{
      position: 'fixed',
      top: '32px',
      left: '24px',
      zIndex: 1000,
      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
      borderRadius: '8px',
      background: '#e0e0e0',
      padding: '4px 12px',
      fontWeight: 700,
      color: '#444',
      letterSpacing: '2px',
      fontSize: '0.8rem',
      textShadow: '0 2px 8px rgba(0,0,0,0.06)',
      transition: 'transform 0.18s cubic-bezier(.4,2,.6,1)',
      boxSizing: 'border-box',
      cursor: 'default',
      filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.10))',
      transform: 'translateY(0) scale(1.03)',
    }}
  >
    BETA
  </div>
);

export default BetaTag;
