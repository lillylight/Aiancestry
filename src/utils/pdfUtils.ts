import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface AncestryDatum {
  region: string;
  percent: number;
}

function renderMarkdownTable(doc: jsPDF, lines: string[], pageWidth: number, startY: number): number {
  const headerLineIdx = lines.findIndex(l => l.trim().startsWith('|') && l.includes('---'));
  if (headerLineIdx < 1) return startY;
  const headerTitles = lines[headerLineIdx-1].split('|').map(s => s.trim()).filter(Boolean);
  const bodyLines = lines.slice(headerLineIdx+1).filter(l => l.trim().startsWith('|'));
  const body = bodyLines.map(row => row.split('|').map(s => s.trim()).filter(Boolean));
  autoTable(doc, {
    startY,
<<<<<<< HEAD
    margin: { left: 40, right: 40 },
    head: [headerTitles],
    body,
    styles: { 
      font: 'helvetica', 
      fontSize: 11, 
      cellPadding: 8, 
      halign: 'center', 
      valign: 'middle', 
      textColor: '#111', 
      fillColor: [255, 255, 255]
    },
    headStyles: { 
      fillColor: [235, 238, 245], 
      textColor: '#111', 
      fontStyle: 'bold', 
      fontSize: 12 
    },
    tableLineColor: [200, 200, 200],
    tableLineWidth: 0.5,
=======
    margin: { left: 60, right: 60 },
    head: [headerTitles],
    body,
    styles: { font: 'helvetica', fontSize: 14, cellPadding: 12, halign: 'center', valign: 'middle', textColor: '#111', fillColor: [255, 255, 255] },
    headStyles: { fillColor: [235, 238, 245], textColor: '#111', fontStyle: 'bold', fontSize: 15 },
    tableLineColor: [200, 200, 200],
    tableLineWidth: 0.8,
>>>>>>> 217b26eb713b6dd3cf175cda7e50c9068744a8cf
    theme: 'grid',
  });
  return (doc as any).lastAutoTable?.finalY || (startY + 40);
}

<<<<<<< HEAD
function cleanText(text: string): string {
  // Remove markdown formatting
  text = text.replace(/\*\*/g, '');
  text = text.replace(/\*/g, '');
  text = text.replace(/^[-•]\s*/gm, '');
  text = text.replace(/^#+\s*/gm, '');
  
  // Fix common formatting issues
  text = text.replace(/\s+/g, ' '); // Multiple spaces to single space
  text = text.replace(/([.!?])\s*([A-Z])/g, '$1 $2'); // Ensure space after punctuation
  text = text.replace(/\s+([.,!?;:])/g, '$1'); // Remove space before punctuation
  
  return text.trim();
}

function renderParagraphsImproved(
  doc: jsPDF, 
  paragraphs: string[], 
  pageWidth: number, 
  startY: number, 
  opts?: { fontSize?: number, color?: string }
): number {
  const fontSize = opts?.fontSize || 12;
  const lineHeight = fontSize * 1.4;
  const paragraphSpacing = lineHeight * 0.8;
  const marginLeft = 40;
  const marginRight = 40;
  const marginBottom = 40;
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageBottom = pageHeight - marginBottom;
  const textWidth = pageWidth - marginLeft - marginRight;
  
  let y = startY;
  
  // Set default font
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(fontSize);
  doc.setTextColor(opts?.color || '#000');
  
  for (let idx = 0; idx < paragraphs.length; idx++) {
    let para = cleanText(paragraphs[idx]);
    if (!para.trim()) { 
      y += paragraphSpacing / 2; 
      continue; 
    }
    
    // Check if we need a new page before starting paragraph
    if (y + lineHeight * 2 > pageBottom) {
      doc.addPage();
      y = marginBottom;
    }
    
    // Split text into lines that fit within the width
    const words = para.split(' ');
    let currentLine = '';
    const lines: string[] = [];
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = doc.getTextWidth(testLine);
      
      if (testWidth > textWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    // Render each line
    for (const line of lines) {
      if (y > pageBottom) {
        doc.addPage();
        y = marginBottom;
      }
      
      doc.text(line, marginLeft, y);
      y += lineHeight;
    }
    
    y += paragraphSpacing;
  }
  
  return y;
}

// Simple chart drawing function that actually works
function drawSimplePieChart(
  doc: jsPDF, 
  data: AncestryDatum[], 
  centerX: number,
  centerY: number,
  radius: number
) {
  if (!data || data.length === 0) return;
  
  const colors = [
    [47, 128, 237],   // #2f80ed
    [242, 153, 74],   // #f2994a
    [39, 174, 96],    // #27ae60
    [235, 87, 87],    // #eb5757
    [155, 81, 224],   // #9b51e0
    [86, 204, 242],   // #56ccf2
    [242, 201, 76],   // #f2c94c
    [111, 207, 151],  // #6fcf97
    [187, 107, 217]   // #bb6bd9
  ];
  
  // Calculate total
  const total = data.reduce((sum, item) => sum + item.percent, 0);
  
  // Draw slices
  let currentAngle = -Math.PI / 2; // Start from top
  
  data.forEach((item, index) => {
    const sliceAngle = (item.percent / total) * Math.PI * 2;
    const endAngle = currentAngle + sliceAngle;
    
    // Get color
    const color = colors[index % colors.length];
    doc.setFillColor(color[0], color[1], color[2]);
    
    // Draw slice using triangle fan from center
    const segments = Math.max(20, Math.floor(sliceAngle * 10));
    
    for (let i = 0; i < segments; i++) {
      const angle1 = currentAngle + (sliceAngle * i) / segments;
      const angle2 = currentAngle + (sliceAngle * (i + 1)) / segments;
      
      const x1 = centerX + Math.cos(angle1) * radius;
      const y1 = centerY + Math.sin(angle1) * radius;
      const x2 = centerX + Math.cos(angle2) * radius;
      const y2 = centerY + Math.sin(angle2) * radius;
      
      doc.triangle(centerX, centerY, x1, y1, x2, y2, 'F');
    }
    
    currentAngle = endAngle;
  });
  
  // Add white border between slices
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(2);
  currentAngle = -Math.PI / 2;
  
  data.forEach((item) => {
    const sliceAngle = (item.percent / total) * Math.PI * 2;
    const x = centerX + Math.cos(currentAngle) * radius;
    const y = centerY + Math.sin(currentAngle) * radius;
    
    doc.line(centerX, centerY, x, y);
    currentAngle += sliceAngle;
  });
}

// Get user info from window
function getUserInfo(): { name?: string, wallet?: string } {
  if (typeof window === 'undefined') return {};
  
  const win = window as any;
  return {
    name: win.aiAncestryUserName || win.userBasename || win.userName,
    wallet: win.userWalletAddress || win.walletAddress
  };
=======
function renderParagraphsWithBoldSpans(doc: jsPDF, paragraphs: string[], pageWidth: number, y: number, opts?: { fontSize?: number, color?: string, justify?: boolean }): number {
  const normalFontSize = opts?.fontSize || 15;
  const boldFontSize = normalFontSize - 2;
  const headingFontSize = normalFontSize - 1 + 1;
  const indent = 32;
  const marginBottom = 60;
  const pageBottom = 812 - marginBottom;
  for (let idx = 0; idx < paragraphs.length; idx++) {
    let para = paragraphs[idx].replace(/^[-•]\s*/, '');
    if (!para.trim()) { y += 18; continue; }
    const isHeadingLine = isHeading(para);
    const genericBoldMatch = para.match(/^(\s*)([A-Za-z0-9&'()\/-\s]+:)(.*)$/);
    if (genericBoldMatch) {
      const boldPart = genericBoldMatch[2];
      let rest = genericBoldMatch[3] || '';
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(boldFontSize);
      doc.setTextColor(opts?.color || '#111');
      if (y > pageBottom) { doc.addPage(); y = marginBottom; }
      doc.text(boldPart, 60, y, { align: 'left' });
      y += 20;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(normalFontSize);
      doc.setTextColor(opts?.color || '#111');
      const restLines = doc.splitTextToSize(rest.trim(), pageWidth - 120 - indent);
      for (let i = 0; i < restLines.length; i++) {
        if (y > pageBottom) { doc.addPage(); y = marginBottom; }
        doc.text(restLines[i], 60 + indent, y, { align: 'justify', maxWidth: pageWidth - 120 - indent });
        y += 22;
      }
      y += 6;
      continue;
    }
    const structureMatch = para.match(/^(\s*)([A-Za-z0-9&'()\/-]+ Structure:)(.*)$/i);
    if (structureMatch) {
      const boldPart = structureMatch[2];
      let rest = structureMatch[3] || '';
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(boldFontSize);
      doc.setTextColor(opts?.color || '#111');
      if (y > pageBottom) { doc.addPage(); y = marginBottom; }
      doc.text(boldPart, 60, y, { align: 'left' });
      y += 20;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(normalFontSize);
      doc.setTextColor(opts?.color || '#111');
      const restLines = doc.splitTextToSize(rest.trim(), pageWidth - 120 - indent);
      for (let i = 0; i < restLines.length; i++) {
        if (y > pageBottom) { doc.addPage(); y = marginBottom; }
        doc.text(restLines[i], 60 + indent, y, { align: 'justify', maxWidth: pageWidth - 120 - indent });
        y += 22;
      }
      y += 6;
      continue;
    }
    const match = para.match(/^(\s*)([A-Za-z0-9\s'()\/-]+:)(.*)$/);
    if (match) {
      const boldPart = match[2];
      let rest = match[3] || '';
      if (isHeadingLine) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(headingFontSize);
        doc.setTextColor('#23252b');
        if (y > pageBottom) { doc.addPage(); y = marginBottom; }
        doc.text(boldPart, 60, y, { align: 'left' });
        y += 22;
        if (rest.trim()) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(normalFontSize);
          doc.setTextColor(opts?.color || '#111');
          const restLines = doc.splitTextToSize(rest.trim(), pageWidth - 120 - indent);
          for (let i = 0; i < restLines.length; i++) {
            if (y > pageBottom) { doc.addPage(); y = marginBottom; }
            doc.text(restLines[i], 60 + indent, y, { align: 'justify', maxWidth: pageWidth - 120 - indent });
            y += 22;
          }
        }
        y += 6;
        continue;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(boldFontSize);
      doc.setTextColor(opts?.color || '#111');
      if (y > pageBottom) { doc.addPage(); y = marginBottom; }
      doc.text(boldPart, 60, y, { align: 'left' });
      y += 20;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(normalFontSize);
      doc.setTextColor(opts?.color || '#111');
      const restLines = doc.splitTextToSize(rest.trim(), pageWidth - 120 - indent);
      for (let i = 0; i < restLines.length; i++) {
        if (y > pageBottom) { doc.addPage(); y = marginBottom; }
        doc.text(restLines[i], 60 + indent, y, { align: 'justify', maxWidth: pageWidth - 120 - indent });
        y += 22;
      }
      y += 6;
      continue;
    }
    const lines = doc.splitTextToSize(para, pageWidth - 120);
    for (let i = 0; i < lines.length; i++) {
      if (y > pageBottom) { doc.addPage(); y = marginBottom; }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(normalFontSize);
      doc.setTextColor(opts?.color || '#111');
      doc.text(lines[i], 60, y, { align: 'justify', maxWidth: pageWidth - 120 });
      y += 22;
    }
    y += 8;
  }
  return y;
}

function isHeading(line: string): boolean {
  return /:$/g.test(line) && !/^[-•]/.test(line.trim());
}

function renderComprehensiveSection(doc: jsPDF, compBlock: string[], pageWidth: number, boldLines: number[]): void {
  let y = 70;
  const marginBottom = 60;
  const pageBottom = 812 - marginBottom;
  for (let idx = 0; idx < compBlock.length; idx++) {
    let para = compBlock[idx].replace(/^[-•]\s*/, '');
    if (!para.trim()) { y += 18; continue; }
    para = para.replace(/([A-Za-z0-9\s\-()]+):\s*(\d{1,3}%)/g, '$1: $2');
    para = para.replace(/([A-Za-z0-9\s\-()]+)(\d{1,3}%)/g, '$1 $2');
    const percentMatch = para.match(/^(.+?)(\d{1,3}%)$/);
    if (percentMatch && percentMatch[1]) {
      let label = percentMatch[1].trim();
      let percent = percentMatch[2];
      if (!label.endsWith(' ')) label += ' ';
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(idx === 0 ? 19 : 14);
      doc.setTextColor(idx === 0 ? '#23252b' : '#111');
      if (y > pageBottom) { doc.addPage(); y = marginBottom; }
      doc.text(label, 60, y, { align: 'left' });
      doc.text(percent, pageWidth - 60, y, { align: 'right' });
      y += 22;
      continue;
    }
    const match = para.match(/^(\s*)([A-Za-z0-9\s'()\/-]+:)(.*)$/);
    if (match) {
      const boldPart = match[2];
      let rest = match[3] || '';
      const boldWidth = doc.getTextWidth(boldPart);
      const spaceWidth = doc.getTextWidth(' ');
      let restLines = doc.splitTextToSize(rest.trim(), pageWidth - 120 - boldWidth - spaceWidth);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(idx === 0 ? 19 : 14);
      doc.setTextColor(idx === 0 ? '#23252b' : '#111');
      if (y > pageBottom) { doc.addPage(); y = marginBottom; }
      doc.text(boldPart, 60, y, { align: 'left' });
      doc.setFont('helvetica', 'normal');
      let x = 60 + boldWidth + spaceWidth;
      if (restLines.length > 0) {
        doc.text(restLines[0], x, y, { align: 'left', maxWidth: pageWidth - x - 60 });
      }
      y += 22;
      for (let i = 1; i < restLines.length; i++) {
        if (y > pageBottom) { doc.addPage(); y = marginBottom; }
        doc.text(restLines[i], 60, y, { align: 'left', maxWidth: pageWidth - 120 });
        y += 22;
      }
      y += 8;
      continue;
    }
    const lines = doc.splitTextToSize(para, pageWidth - 120);
    for (let i = 0; i < lines.length; i++) {
      if (y > pageBottom) { doc.addPage(); y = marginBottom; }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(15);
      doc.setTextColor('#111');
      doc.text(lines[i], 60, y, { align: 'justify', maxWidth: pageWidth - 120 });
      y += 22;
    }
    y += 8;
  }
  doc.addPage();
}

function renderAncestryBreakdownBlocks(doc: jsPDF, ancestryBlocks: { region: string, percent: number, description: string }[], pageWidth: number, y: number): number {
  const normalFontSize = 15;
  const boldFontSize = 13;
  const indent = 32;
  const marginBottom = 60;
  const pageBottom = 812 - marginBottom;
  ancestryBlocks.forEach(block => {
    // Region (left, bold) + percent (right, bold)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(boldFontSize);
    doc.setTextColor('#23252b');
    if (y > pageBottom) { doc.addPage(); y = marginBottom; }
    doc.text(block.region + ':', 60, y, { align: 'left' });
    doc.text(block.percent + '%', pageWidth - 60, y, { align: 'right' });
    y += 20;
    // Description (indented, justified)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(normalFontSize);
    doc.setTextColor('#111');
    const descLines = doc.splitTextToSize(block.description, pageWidth - 120 - indent);
    for (let i = 0; i < descLines.length; i++) {
      if (y > pageBottom) { doc.addPage(); y = marginBottom; }
      doc.text(descLines[i], 60 + indent, y, { align: 'justify', maxWidth: pageWidth - 120 - indent });
      y += 22;
    }
    y += 12; // extra space between blocks
  });
  return y;
}

// Import additional modules if needed

// Helper function to create a basic pie chart directly in the PDF
function createBasicPieChart(
  doc: jsPDF, 
  data: AncestryDatum[], 
  pageWidth: number, 
  y: number, 
  width: number, 
  height: number
) {
  try {
    if (!data || data.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(18);
      doc.setTextColor('#888');
      doc.text('Pie chart unavailable', pageWidth / 2, y + height/2, { align: 'center' });
      return;
    }
    
    // Set basic parameters
    const centerX = pageWidth / 2;
    const centerY = y + height / 2;
    const radius = Math.min(width, height) / 2.5;
    
    // Draw title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor('#23252b');
    doc.text('Ancestry Breakdown', centerX, y + 20, { align: 'center' });
    
    // Calculate total for percentages
    const total = data.reduce((sum, item) => sum + item.percent, 0);
    
    // Draw pie chart
    let startAngle = 0;
    const colors = ['#2f80ed','#f2994a','#27ae60','#eb5757','#9b51e0','#56ccf2','#f2c94c','#6fcf97','#bb6bd9'];
    
    data.forEach((item, i) => {
      const sliceAngle = (Math.PI * 2 * item.percent) / total;
      const endAngle = startAngle + sliceAngle;
      const color = colors[i % colors.length];
      
      // Draw pie slice
      doc.setFillColor(color);
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(1);
      
      // Draw the slice using a different approach since jsPDF doesn't have direct arc support
      // We'll use multiple line segments to approximate an arc
      const segments = 16; // Number of line segments to use for the arc
      
      // Start from the center
      doc.setDrawColor(color); // Set same fill and draw color
      doc.setFillColor(color);
      
      // Create a path
      const pathData = [];
      
      // Start at center
      pathData.push({op: 'm', c: [centerX, centerY]});
      
      // Draw line to start of arc
      const startX = centerX + Math.cos(startAngle) * radius;
      const startY = centerY + Math.sin(startAngle) * radius;
      pathData.push({op: 'l', c: [startX, startY]});
      
      // Add the arc segments
      for (let j = 0; j <= segments; j++) {
        const segAngle = startAngle + (j / segments) * (endAngle - startAngle);
        const segX = centerX + Math.cos(segAngle) * radius;
        const segY = centerY + Math.sin(segAngle) * radius;
        pathData.push({op: 'l', c: [segX, segY]});
      }
      
      // Close path back to center
      pathData.push({op: 'l', c: [centerX, centerY]});
      
      // Draw the path
      doc.path(pathData, 'F');
      
      startAngle = endAngle;
    });
  } catch (error) {
    console.error('Error creating basic pie chart:', error);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(18);
    doc.setTextColor('#888');
    doc.text('Pie chart unavailable', pageWidth / 2, y + height/2, { align: 'center' });
  }
>>>>>>> 217b26eb713b6dd3cf175cda7e50c9068744a8cf
}

export function downloadAnalysisAsPDF(
  result: string,
  ancestryData: AncestryDatum[],
  pieChartDataUrl?: string
) {
<<<<<<< HEAD
  console.log('Starting PDF generation...');
  console.log('Full result text:', result);
  console.log('Ancestry data:', ancestryData);
  console.log('Pie chart data URL available:', !!pieChartDataUrl);
  
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Cover page
  doc.setFillColor(245, 246, 250);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Title
=======
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(245, 246, 250);
  doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');
>>>>>>> 217b26eb713b6dd3cf175cda7e50c9068744a8cf
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(32);
  doc.setTextColor('#23252b');
  doc.text('Ancestry Analysis Report', pageWidth / 2, 120, { align: 'center' });
<<<<<<< HEAD
  
  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(16);
  doc.setTextColor('#555');
  doc.text('Generated with AI Ancestry', pageWidth / 2, 150, { align: 'center' });
  
  // Date
  doc.setFontSize(12);
  doc.setTextColor('#888');
  doc.text('Date: ' + new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }), pageWidth / 2, 180, { align: 'center' });
  
  // User info
  const userInfo = getUserInfo();
  let yOffset = 210;
  
  if (userInfo.name) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor('#2f80ed');
    doc.text(`Generated for: ${userInfo.name}`, pageWidth / 2, yOffset, { align: 'center' });
    yOffset += 25;
  }
  
  if (userInfo.wallet) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor('#666');
    const shortWallet = userInfo.wallet.slice(0, 6) + '...' + userInfo.wallet.slice(-4);
    doc.text(`Wallet: ${shortWallet}`, pageWidth / 2, yOffset, { align: 'center' });
  }
  
  // Parse ALL content sections
  const lines = result.split(/\n/);
  let analysisParas: string[] = [];
  let comprehensiveParas: string[] = [];
  let summaryTableLines: string[] = [];
  let conclusionParas: string[] = [];
  
  let currentSection = 'analysis';
  let currentPara = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Check for section markers
    if (trimmedLine.toLowerCase().includes('comprehensive ancestry percentage')) {
      if (currentPara) {
        if (currentSection === 'analysis') analysisParas.push(currentPara);
        currentPara = '';
      }
      currentSection = 'comprehensive';
      comprehensiveParas.push(trimmedLine);
      continue;
    }
    
    if (trimmedLine.toLowerCase().includes('summary table') || trimmedLine === '## SUMMARY TABLE') {
      if (currentPara) {
        if (currentSection === 'comprehensive') comprehensiveParas.push(currentPara);
        currentPara = '';
      }
      currentSection = 'table';
      continue;
    }
    
    if (trimmedLine.toLowerCase().startsWith('conclusion')) {
      if (currentPara) {
        currentPara = '';
      }
      currentSection = 'conclusion';
      continue;
    }
    
    // Handle content based on current section
    if (currentSection === 'table' && (trimmedLine.startsWith('|') || trimmedLine.includes('---'))) {
      summaryTableLines.push(line);
    } else if (currentSection === 'conclusion') {
      if (trimmedLine) conclusionParas.push(trimmedLine);
    } else if (currentSection === 'comprehensive') {
      if (trimmedLine) comprehensiveParas.push(trimmedLine);
    } else if (currentSection === 'analysis') {
      if (trimmedLine) {
        currentPara = currentPara ? `${currentPara} ${trimmedLine}` : trimmedLine;
      } else if (currentPara) {
        analysisParas.push(currentPara);
        currentPara = '';
      }
    }
  }
  
  // Add any remaining paragraph
  if (currentPara) {
    if (currentSection === 'analysis') analysisParas.push(currentPara);
    else if (currentSection === 'comprehensive') comprehensiveParas.push(currentPara);
  }
  
  // Analysis section
  if (analysisParas.length > 0) {
    doc.addPage();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor('#23252b');
    doc.text('Analysis', 40, 60);
    
    renderParagraphsImproved(doc, analysisParas, pageWidth, 90, { 
      fontSize: 12, 
      color: '#333' 
    });
  }
  
  // Comprehensive Ancestry section
  if (comprehensiveParas.length > 0) {
    doc.addPage();
    doc.setFillColor(252, 252, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor('#23252b');
    doc.text('Comprehensive Ancestry Breakdown', 40, 60);
    
    renderParagraphsImproved(doc, comprehensiveParas, pageWidth, 90, { 
      fontSize: 12, 
      color: '#333' 
    });
  }
  
  // Summary Table
  if (summaryTableLines.length > 0) {
    doc.addPage();
    doc.setFillColor(252, 252, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor('#23252b');
    doc.text('Summary Table', 40, 60);
    
    renderMarkdownTable(doc, summaryTableLines, pageWidth, 90);
  }
  
  // Conclusion
  if (conclusionParas.length > 0) {
    doc.addPage();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor('#23252b');
    doc.text('Conclusion', 40, 60);
    
    renderParagraphsImproved(doc, conclusionParas, pageWidth, 90, { 
      fontSize: 12, 
      color: '#333' 
    });
  }
  
  // Ancestry Chart Page
  if (ancestryData && ancestryData.length > 0) {
    doc.addPage();
    doc.setFillColor(252, 252, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor('#23252b');
    doc.text('Ancestry Visualization', pageWidth / 2, 60, { align: 'center' });
    
    // Try to add the image first
    let chartAdded = false;
    
    if (pieChartDataUrl && pieChartDataUrl.startsWith('data:image/')) {
      try {
        console.log('Attempting to add chart image...');
        
        // Extract base64 data
        const base64Data = pieChartDataUrl.split(',')[1];
        if (base64Data) {
          const imgWidth = 300;
          const imgHeight = 300;
          const imgX = (pageWidth - imgWidth) / 2;
          const imgY = 100;
          
          // Try adding the image
          doc.addImage(base64Data, 'PNG', imgX, imgY, imgWidth, imgHeight);
          chartAdded = true;
          console.log('Chart image added successfully!');
        }
      } catch (error) {
        console.error('Failed to add chart image:', error);
      }
    }
    
    // If image failed, draw a simple chart
    if (!chartAdded) {
      console.log('Drawing fallback chart...');
      const chartCenterX = pageWidth / 2;
      const chartCenterY = 250;
      const chartRadius = 100;
      
      drawSimplePieChart(doc, ancestryData, chartCenterX, chartCenterY, chartRadius);
    }
    
    // Add legend
    let legendY = 420;
    const colors = [
      [47, 128, 237],   // #2f80ed
      [242, 153, 74],   // #f2994a
      [39, 174, 96],    // #27ae60
      [235, 87, 87],    // #eb5757
      [155, 81, 224],   // #9b51e0
      [86, 204, 242],   // #56ccf2
      [242, 201, 76],   // #f2c94c
      [111, 207, 151],  // #6fcf97
      [187, 107, 217]   // #bb6bd9
    ];
    
    doc.setFontSize(12);
    ancestryData.forEach((item, i) => {
      const color = colors[i % colors.length];
      const legendX = pageWidth / 2 - 100;
      
      // Color box
      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(legendX, legendY - 10, 12, 12, 'F');
      
      // Text
      doc.setFont('helvetica', 'normal');
      doc.setTextColor('#23252b');
      doc.text(`${item.region}: ${item.percent}%`, legendX + 20, legendY);
      
      legendY += 20;
    });
    
    // Add percentages page
    doc.addPage();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor('#23252b');
    doc.text('Ancestry Percentages', 40, 60);
    
    let y = 90;
    ancestryData.forEach(item => {
      // Region name
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(item.region, 40, y);
      
      // Percentage
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(14);
      doc.text(`${item.percent}%`, pageWidth - 40, y, { align: 'right' });
      
      y += 25;
    });
  }
  
  // Save the PDF
  console.log('Saving PDF...');
  doc.save('ancestry-analysis-report.pdf');
}
=======
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(16);
  doc.setTextColor('#555');
  doc.text('Generated with AI Ancestry', pageWidth / 2, 155, { align: 'center' });
  doc.setFontSize(12);
  doc.setTextColor('#888');
  doc.text('Date: ' + new Date().toLocaleDateString(), pageWidth / 2, 185, { align: 'center' });
  // --- Add user name below the date if provided ---
  if (typeof window !== 'undefined' && (window as any).aiAncestryUserName) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor('#2f80ed');
    doc.text('Generated by: ' + (window as any).aiAncestryUserName, pageWidth / 2, 205, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor('#888');
  }
  
  const lines = result.split(/\n/);
  let i = 0;
  let summaryTableBlock: string[] = [];
  let summaryTableFound = false;
  let analysisParas: string[] = [];
  let analysisBoldLines: number[] = [];
  let conclusionParas: string[] = [];
  let afterConclusion: string[] = [];
  let compAncestryBlock: string[] = [];
  let compAncestryBoldLines: number[] = [];
  let inConclusion = false;
  let inAfterConclusion = false;
  let inCompAncestry = false;

  while (i < lines.length) {
    const line = lines[i].trim();
    if (/^Comprehensive Ancestry Percentage/i.test(line)) {
      inCompAncestry = true;
      compAncestryBlock.push(line);
      compAncestryBoldLines.push(compAncestryBlock.length - 1);
      i++;
      continue;
    }
    
    if (inCompAncestry && line) {
      let fixedLine = line.replace(/([A-Za-z\s-]+):(\d{1,3}%)/g, '$1: $2');
      fixedLine = fixedLine.replace(/([A-Za-z\s-]+)(\d{1,3}%)/g, '$1 $2');
      
      if (/^[-*]/.test(fixedLine) || fixedLine.startsWith(' ') || isHeading(fixedLine)) {
        compAncestryBlock.push(fixedLine);
        if (isHeading(fixedLine)) compAncestryBoldLines.push(compAncestryBlock.length - 1);
        i++;
        continue;
      } else {
        inCompAncestry = false;
      }
    }
    
    if (/^#+\s?SUMMARY TABLE/i.test(line)) {
      summaryTableFound = true;
      i++;
      continue;
    }
    if (summaryTableFound && (line.startsWith('|') || line.includes('---'))) {
      summaryTableBlock.push(lines[i]);
      i++;
      continue;
    }
    if (/^Conclusion:?$/i.test(line) || /^\*\*?Conclusion:?\*\*?/i.test(line)) {
      inConclusion = true;
      inAfterConclusion = false;
      i++;
      continue;
    }
    if (inConclusion && !line) {
      inConclusion = false;
      inAfterConclusion = true;
      i++;
      continue;
    }
    if (inConclusion) {
      conclusionParas.push(line.replace(/\*\*/g, ''));
      i++;
      continue;
    }
    if (inAfterConclusion) {
      afterConclusion.push(line.replace(/\*\*/g, ''));
      i++;
      continue;
    }
    if (!summaryTableFound && !inCompAncestry) {
      analysisParas.push(line.replace(/\*\*/g, ''));
      if (isHeading(line)) analysisBoldLines.push(analysisParas.length - 1);
    } else if (!inConclusion && !inAfterConclusion && !inCompAncestry) {
      // skip summary table and comp ancestry lines
    }
    i++;
  }

  let y = 70;
  const marginBottom = 60;
  const pageBottom = 812 - marginBottom;
  
  doc.addPage();
  y = renderParagraphsWithBoldSpans(doc, analysisParas, pageWidth, y, { fontSize: 15, color: '#111', justify: true });
  
  if (compAncestryBlock.length > 0) {
    doc.addPage();
    doc.setFillColor(252, 252, 255);
    doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');
    let yComp = 70;
    yComp = renderParagraphsWithBoldSpans(doc, compAncestryBlock, pageWidth, yComp, { fontSize: 15, color: '#111', justify: true });
  }

  if (summaryTableBlock.length > 0) {
    doc.addPage();
    doc.setFillColor(252, 252, 255);
    doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(21);
    doc.setTextColor('#888');
    doc.text('SUMMARY TABLE', 60, 70, { align: 'left' });
    renderMarkdownTable(doc, summaryTableBlock, pageWidth, 110);
  }

  if (conclusionParas.length > 0) {
    doc.addPage();
    let cy = 70;
    cy = renderParagraphsWithBoldSpans(doc, conclusionParas, pageWidth, cy, { fontSize: 15, color: '#111', justify: true });
  }

  if (ancestryData && ancestryData.length > 0) {
    doc.addPage();
    doc.setFillColor(252, 252, 255);
    doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor('#23252b');
    doc.text('Ancestry Breakdown', pageWidth / 2, 90, { align: 'center' });
    
    // Use the image-based pie chart approach which was working correctly
    if (pieChartDataUrl) {
      try {
        console.log('PDF: Rendering pie chart with data URL of length:', pieChartDataUrl.length);
        
        // Validate the data URL format
        if (!pieChartDataUrl.startsWith('data:image/png;base64,')) {
          throw new Error('Invalid pie chart data URL format');
        }
        
        // Make sure to wait before adding image to ensure PDF is ready
        const chartWidth = 320;
        const chartHeight = 220;
        const chartX = (pageWidth - chartWidth) / 2;
        
        // Wait to ensure PDF is ready for image
        setTimeout(() => {}, 0);
        
        // Use a more reliable approach to add image
        try {
          // First try with regular method
          doc.addImage(
            pieChartDataUrl, 
            'PNG', 
            chartX, 120, 
            chartWidth, chartHeight, 
            undefined, 
            'FAST'
          );
        } catch (imageError) {
          console.error('First image add attempt failed, trying alternate approach:', imageError);
          
          // Second backup approach - split base64 to avoid length issues
          const base64Data = pieChartDataUrl.split('base64,')[1];
          doc.addImage(
            base64Data, 
            'PNG', 
            chartX, 120, 
            chartWidth, chartHeight, 
            undefined, 
            'FAST'
          );
        }
        
        // Add legend
        let legendY = 360;
        const legendBlockWidth = 340;
        const legendX = (pageWidth - legendBlockWidth) / 2 + 24;
        ancestryData.forEach((item, i) => {
          const color = ['#2f80ed','#f2994a','#27ae60','#eb5757','#9b51e0','#56ccf2','#f2c94c','#6fcf97','#bb6bd9'][i%9];
          doc.setFillColor(color);
          doc.circle(legendX, legendY, 6, 'F');
          doc.setFontSize(15);
          doc.setTextColor('#23252b');
          let label = `${item.region}`;
          if (!/\s$/.test(label)) label += ' ';
          doc.text(`${label}(${item.percent}%)`, legendX + 15, legendY + 5);
          legendY += 28;
        });
        
        console.log('PDF: Pie chart rendered successfully');
      } catch (e) {
        console.error('Error rendering pie chart in PDF:', e);
        // Fallback if chart rendering fails - create a basic pie chart directly in the PDF
        createBasicPieChart(doc, ancestryData, pageWidth, 120, 320, 220);
      }
    } else {
      console.warn('PDF: No pie chart data URL provided, generating basic chart');
      // Create a basic pie chart directly in the PDF if we don't have an image
      createBasicPieChart(doc, ancestryData, pageWidth, 120, 320, 220);
    }
    
    // Add text breakdown
    const ancestryBlocks = ancestryData.map(item => ({ 
      region: item.region, 
      percent: item.percent, 
      description: '' 
    }));
    
    let y = 400; // Start after the chart
    y = renderAncestryBreakdownBlocks(doc, ancestryBlocks, pageWidth, y);
  }

  doc.save('ancestry-analysis-report.pdf');
}
>>>>>>> 217b26eb713b6dd3cf175cda7e50c9068744a8cf
