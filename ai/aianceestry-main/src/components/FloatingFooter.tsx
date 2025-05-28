'use client';

import React, { useState, useEffect } from 'react';
import { FaUserShield, FaTwitter, FaEnvelope } from 'react-icons/fa';
import { useRouter } from "next/navigation";

const termsPages = [
  `Page 1\n\nWelcome to AI Ancestry. By using this app, you agree to these terms. This app is experimental and for entertainment only. Results are not factual, legal, or medical.`,
  `Page 2\n\nNo images or data are stored. Use at your own risk. Do not use for government, legal, or health purposes.`,
  `Page 3\n\nThis app does not replace DNA testing. Mistakes may occur; results may be inaccurate.`,
  `Page 4\n\nBy using, you consent to these terms. Do not use results for any real-world decisions.`,
  `Page 5\n\nContact: basezambia@gmail.com. For support, feedback, or questions, email us.`,
];

const contactText = `Contact\n\nFor feedback, questions, or issues, email: basezambia@gmail.com`;

const glassBtn = {
  background: 'rgba(60,62,70,0.80)',
  boxShadow: '0 2px 8px 0 rgba(30,32,36,0.13)',
  border: '1.5px solid rgba(160,160,170,0.13)',
  borderRadius: '50%',
  width: 28,
  height: 28,
  minWidth: 28,
  minHeight: 28,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#f3f4f6',
  fontSize: 16.7,
  cursor: 'pointer',
  marginLeft: 10,
  transition: 'box-shadow 0.22s',
  zIndex: 1001,
  pointerEvents: 'auto' as React.CSSProperties['pointerEvents'],
};

const popupGlass = {
  position: 'fixed',
  right: 30,
  bottom: 90,
  background: 'rgba(60,62,70,0.92)',
  boxShadow: '0 8px 48px 0 rgba(30,32,36,0.23)',
  borderRadius: '2.2rem',
  backdropFilter: 'blur(10px)',
  color: '#f3f4f6',
  border: '1.5px solid rgba(160,160,170,0.18)',
  padding: '2.1rem 2rem 1.5rem 2rem',
  maxWidth: 420,
  width: '92vw',
  textAlign: 'center',
  fontSize: 17,
  fontWeight: 500,
  letterSpacing: '-0.01em',
  zIndex: 1002,
} as React.CSSProperties;

export default function FloatingFooter() {
  const [open, setOpen] = useState<'terms'|'contact'|null>(null);
  const [termsPage, setTermsPage] = useState(0);
  const [show, setShow] = useState(false);
  const router = useRouter();

  const close = () => setOpen(null);

  useEffect(() => {
    const onScroll = () => {
      const scrolledToBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 10;
      setShow(scrolledToBottom);
    };
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {open && (
        <div style={popupGlass}>
          <button style={{position:'absolute',top:8,right:14,fontSize:12,background:'none',border:'none',color:'#f3f4f6',cursor:'pointer'}} aria-label="Close" onClick={close}>&times;</button>
          {open === 'terms' && (
            <>
              <div style={{fontSize:12,fontWeight:800,marginBottom:8,letterSpacing:'-0.02em'}}>Terms & Privacy</div>
              <div style={{whiteSpace:'pre-line',fontSize:10,minHeight:60}}>{termsPages[termsPage]}</div>
              <div style={{display:'flex',justifyContent:'center',gap:12,marginTop:10}}>
                <button disabled={termsPage===0} onClick={()=>setTermsPage(p=>p-1)} style={{fontSize:10,padding:'2px 10px',borderRadius:8,border:'none',background:'#444',color:'#fff',opacity:termsPage===0?0.4:1,cursor:termsPage===0?'not-allowed':'pointer'}}>Prev</button>
                <span style={{fontSize:10,opacity:0.8}}>Page {termsPage+1} of 5</span>
                <button disabled={termsPage===4} onClick={()=>setTermsPage(p=>p+1)} style={{fontSize:10,padding:'2px 10px',borderRadius:8,border:'none',background:'#444',color:'#fff',opacity:termsPage===4?0.4:1,cursor:termsPage===4?'not-allowed':'pointer'}}>Next</button>
              </div>
            </>
          )}
          {open === 'contact' && (
            <div style={{whiteSpace:'pre-line',fontSize:16}}>
              {contactText}
            </div>
          )}
        </div>
      )}
      <div style={{position:'fixed',right:36,bottom:32,display:show?'flex':'none',flexDirection:'row',gap:0,zIndex:1001,pointerEvents:'auto' as React.CSSProperties['pointerEvents']}}>
        <button style={glassBtn} aria-label="Terms & Privacy" onClick={() => router.push('/terms')}> 
          <FaUserShield style={{fontSize:20}} />
        </button>
        <button style={glassBtn} aria-label="Twitter" onClick={() => window.open('https://twitter.com/aiancestry','_blank')}>
          <FaTwitter style={{fontSize:20}} />
        </button>
        <button style={glassBtn} aria-label="Contact" onClick={() => window.open('mailto:basezambia@gmail.com')}>
          <FaEnvelope style={{fontSize:20}} />
        </button>
      </div>
    </>
  );
}
