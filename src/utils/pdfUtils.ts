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
    margin: { left: 40, right: 40 },
    head: [headerTitles],
    body,
    styles: { 
      font: 'helvetica', 
      fontSize: 12, 
      cellPadding: 10, 
      halign: 'center', 
      valign: 'middle', 
      textColor: '#111', 
      fillColor: [255, 255, 255]
    },
    headStyles: { 
      fillColor: [235, 238, 245], 
      textColor: '#111', 
      fontStyle: 'bold', 
      fontSize: 13 
    },
    tableLineColor: [200, 200, 200],
    tableLineWidth: 0.5,
    theme: 'grid',
  });
  return (doc as any).lastAutoTable?.finalY || (startY + 40);
}

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
  const fontSize = opts?.fontSize || 13; // Regular text at 13pt
  const lineHeight = fontSize * 1.6; // Good line height for readability
  const paragraphSpacing = lineHeight * 1.0; // Reasonable space between paragraphs
  const marginLeft = 40;
  const marginRight = 40;
  const marginBottom = 40;
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageBottom = pageHeight - marginBottom;
  const textWidth = pageWidth - marginLeft - marginRight;
  
  let y = startY;
  
  for (let idx = 0; idx < paragraphs.length; idx++) {
    let para = cleanText(paragraphs[idx]);
    if (!para.trim()) { 
      y += paragraphSpacing / 2; 
      continue; 
    }
    
    // Check if this is a heading (contains colon at the end or starts with capital letters)
    const isHeading = /^[A-Z][^:]*:$/.test(para.trim()) || 
                     /^[A-Z\s]+$/.test(para.trim()) ||
                     para.toLowerCase().includes('ancestry') ||
                     para.toLowerCase().includes('traits') ||
                     para.toLowerCase().includes('features');
    
    // Check for bold sections (text before colon)
    const colonIndex = para.indexOf(':');
    const hasBoldSection = colonIndex > 0 && colonIndex < para.length - 1;
    
    if (isHeading) {
      // Make headings bold at 15pt
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor('#1a1a1a');
    }
    
    // Check if we need a new page before starting paragraph
    if (y + lineHeight * 2 > pageBottom) {
      doc.addPage();
      y = marginBottom;
    }
    
    if (hasBoldSection && !isHeading) {
      // Split at colon and render bold part + normal part
      const boldPart = para.substring(0, colonIndex + 1);
      const normalPart = para.substring(colonIndex + 1).trim();
      
      // Render bold part at 15pt inline with normal text
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor('#1a1a1a');
      
      // Measure the width of the bold part
      const boldWidth = doc.getTextWidth(boldPart + ' ');
      
      // Check if we need to wrap
      if (boldWidth + doc.getTextWidth(normalPart) > textWidth) {
        // Render bold part on its own line
        if (y > pageBottom) {
          doc.addPage();
          y = marginBottom;
        }
        doc.text(boldPart, marginLeft, y);
        y += lineHeight;
        
        // Render normal part
        if (normalPart) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(fontSize);
          doc.setTextColor(opts?.color || '#000');
          
          const normalLines = doc.splitTextToSize(normalPart, textWidth);
          for (const line of normalLines) {
            if (y > pageBottom) {
              doc.addPage();
              y = marginBottom;
            }
            doc.text(line, marginLeft, y);
            y += lineHeight;
          }
        }
      } else {
        // Render both parts on the same line
        if (y > pageBottom) {
          doc.addPage();
          y = marginBottom;
        }
        
        // Bold part
        doc.text(boldPart + ' ', marginLeft, y);
        
        // Normal part at same y position
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(fontSize);
        doc.setTextColor(opts?.color || '#000');
        doc.text(normalPart, marginLeft + boldWidth, y);
        
        y += lineHeight;
      }
    } else {
      // Regular rendering
      if (!isHeading) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(fontSize);
        doc.setTextColor(opts?.color || '#000');
      }
      
      // Split text into lines that fit within the width
      const lines = doc.splitTextToSize(para, textWidth);
      
      // Render each line
      for (const line of lines) {
        if (y > pageBottom) {
          doc.addPage();
          y = marginBottom;
        }
        
        doc.text(line, marginLeft, y);
        y += lineHeight;
      }
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
}

export function downloadAnalysisAsPDF(
  result: string,
  ancestryData: AncestryDatum[],
  pieChartDataUrl?: string
) {
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
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(42); // Increased from 32
  doc.setTextColor('#23252b');
  doc.text('Ancestry Analysis Report', pageWidth / 2, 120, { align: 'center' });
  
  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(20); // Increased from 16
  doc.setTextColor('#555');
  doc.text('Generated with AI Ancestry', pageWidth / 2, 160, { align: 'center' });
  
  // Date
    doc.setFontSize(13); // Legend text at 13pt
  doc.setTextColor('#888');
  doc.text('Date: ' + new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }), pageWidth / 2, 200, { align: 'center' });
  
  // User info
  const userInfo = getUserInfo();
  let yOffset = 240;
  
  if (userInfo.name) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18); // Increased from 14
    doc.setTextColor('#2f80ed');
    doc.text(`Generated for: ${userInfo.name}`, pageWidth / 2, yOffset, { align: 'center' });
    yOffset += 30;
  }
  
  if (userInfo.wallet) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14); // Increased from 11
    doc.setTextColor('#666');
    const shortWallet = userInfo.wallet.slice(0, 6) + '...' + userInfo.wallet.slice(-4);
    doc.text(`Wallet: ${shortWallet}`, pageWidth / 2, yOffset, { align: 'center' });
  }
  
  // Add some decorative elements to fill space
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(1);
  doc.line(100, 350, pageWidth - 100, 350);
  
  // Add a note at the bottom of cover page
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(14);
  doc.setTextColor('#999');
  doc.text('This report contains AI-generated ancestry analysis based on facial features.', pageWidth / 2, pageHeight - 100, { align: 'center' });
  doc.text('Results are for entertainment purposes only.', pageWidth / 2, pageHeight - 80, { align: 'center' });
  
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
  
  // Analysis section (Page 2)
  if (analysisParas.length > 0) {
    doc.addPage();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15); // Title at 15pt
    doc.setTextColor('#23252b');
    doc.text('Analysis', 40, 60);
    
    // Add a decorative line under the title
    doc.setDrawColor(47, 128, 237);
    doc.setLineWidth(2);
    doc.line(40, 70, 200, 70);
    
    renderParagraphsImproved(doc, analysisParas, pageWidth, 100, { 
      fontSize: 13, 
      color: '#333' 
    });
  }
  
  // Comprehensive Ancestry section (Page 3)
  if (comprehensiveParas.length > 0) {
    doc.addPage();
    doc.setFillColor(252, 252, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15); // Title at 15pt
    doc.setTextColor('#23252b');
    doc.text('Comprehensive Ancestry Breakdown', 40, 60);
    
    // Add a decorative line under the title
    doc.setDrawColor(47, 128, 237);
    doc.setLineWidth(2);
    doc.line(40, 70, 400, 70);
    
    renderParagraphsImproved(doc, comprehensiveParas, pageWidth, 100, { 
      fontSize: 13, 
      color: '#333' 
    });
  }
  
  // Summary Table (Page 4)
  if (summaryTableLines.length > 0) {
    doc.addPage();
    doc.setFillColor(252, 252, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15); // Title at 15pt
    doc.setTextColor('#23252b');
    doc.text('Summary Table', 40, 60);
    
    // Add a decorative line under the title
    doc.setDrawColor(47, 128, 237);
    doc.setLineWidth(2);
    doc.line(40, 70, 200, 70);
    
    renderMarkdownTable(doc, summaryTableLines, pageWidth, 100);
  }
  
  // Conclusion (Page 5)
  if (conclusionParas.length > 0) {
    doc.addPage();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15); // Title at 15pt
    doc.setTextColor('#23252b');
    doc.text('Conclusion', 40, 60);
    
    // Add a decorative line under the title
    doc.setDrawColor(47, 128, 237);
    doc.setLineWidth(2);
    doc.line(40, 70, 180, 70);
    
    renderParagraphsImproved(doc, conclusionParas, pageWidth, 100, { 
      fontSize: 13, 
      color: '#333' 
    });
  }
  
  // Ancestry Chart Page (Page 6)
  if (ancestryData && ancestryData.length > 0) {
    doc.addPage();
    doc.setFillColor(252, 252, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15); // Title at 15pt
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
          const imgWidth = 350; // Increased from 300
          const imgHeight = 350; // Increased from 300
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
      const chartCenterY = 280;
      const chartRadius = 120; // Increased from 100
      
      drawSimplePieChart(doc, ancestryData, chartCenterX, chartCenterY, chartRadius);
    }
    
    // Add legend
    let legendY = 480;
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
    
    doc.setFontSize(16); // Increased from 12
    ancestryData.forEach((item, i) => {
      const color = colors[i % colors.length];
      const legendX = pageWidth / 2 - 120;
      
      // Color box
      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(legendX, legendY - 12, 16, 16, 'F'); // Increased box size
      
      // Text
      doc.setFont('helvetica', 'normal');
      doc.setTextColor('#23252b');
      doc.text(`${item.region}: ${item.percent}%`, legendX + 25, legendY);
      
      legendY += 28; // Increased spacing
    });
    
    // Add percentages page (Page 7)
    doc.addPage();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15); // Title at 15pt
    doc.setTextColor('#23252b');
    doc.text('Ancestry Percentages', 40, 60);
    
    // Add a decorative line under the title
    doc.setDrawColor(47, 128, 237);
    doc.setLineWidth(2);
    doc.line(40, 70, 250, 70);
    
    let y = 110;
    ancestryData.forEach(item => {
      // Region name
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14); // Region names slightly larger
      doc.text(item.region, 40, y);
      
      // Percentage
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(14); // Percentage same size
      doc.text(`${item.percent}%`, pageWidth - 40, y, { align: 'right' });
      
      // Add a light separator line
      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.5);
      doc.line(40, y + 10, pageWidth - 40, y + 10);
      
      y += 30; // Reasonable spacing
    });
    
    // Add final note at bottom
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(14);
    doc.setTextColor('#666');
    doc.text('Note: Percentages are AI-generated estimates based on facial analysis.', pageWidth / 2, pageHeight - 60, { align: 'center' });
  }
  
  // Save the PDF
  console.log('Saving PDF...');
  doc.save('ancestry-analysis-report.pdf');
}
