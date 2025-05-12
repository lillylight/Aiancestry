'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const BetaTag: React.FC = () => {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push('/')}
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
        cursor: 'pointer',
        filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.10))',
        transform: 'translateY(0) scale(1.03)',
      }}
      onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.08)')}
      onMouseOut={e => (e.currentTarget.style.transform = 'scale(1.03)')}
      tabIndex={0}
      aria-label="Go to home page"
      role="button"
    >
      BETA
    </div>
  );
};

export default BetaTag;
