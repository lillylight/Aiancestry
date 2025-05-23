// Book SVG as a React component
export default function DNALogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <span className={className} style={{ display: 'inline-block' }}>
      {/* Book SVG */}
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="12" width="20" height="40" rx="3" fill="#f5f5f5" stroke="#333" strokeWidth="2"/>
        <rect x="36" y="12" width="20" height="40" rx="3" fill="#e0e0e0" stroke="#333" strokeWidth="2"/>
        <line x1="32" y1="12" x2="32" y2="52" stroke="#333" strokeWidth="2"/>
        <path d="M8 16 Q18 24 28 16" stroke="#bdbdbd" strokeWidth="1.5" fill="none"/>
        <path d="M36 16 Q46 24 56 16" stroke="#bdbdbd" strokeWidth="1.5" fill="none"/>
      </svg>
    </span>
  );
}
