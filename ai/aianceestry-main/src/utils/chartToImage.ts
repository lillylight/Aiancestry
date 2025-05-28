import html2canvas from "html2canvas";

/**
 * Renders a DOM element (e.g., a chart) to a PNG data URL for PDF embedding.
 * @param element HTMLElement (e.g., chart container)
 * @returns Promise<string> PNG data URL
 */
export async function chartToImage(element: HTMLElement): Promise<string> {
  if (!element) {
    console.error('Element is null or undefined');
    return '';
  }
  
  try {
    // Wait longer to ensure chart is fully rendered
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Clone the element to avoid rendering issues with styles
    const clone = element.cloneNode(true) as HTMLElement;
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '-9999px';
    container.style.left = '-9999px';
    container.style.width = `${element.offsetWidth}px`;
    container.style.height = `${element.offsetHeight}px`;
    container.style.background = 'transparent';
    container.appendChild(clone);
    document.body.appendChild(container);
    
    const canvas = await html2canvas(clone, {
      backgroundColor: null,
      scale: 3, // Higher scale for better quality
      logging: false,
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: false,
      imageTimeout: 0, // No timeout for image loading
      onclone: (document) => {
        // Make sure SVG elements are visible
        const svgs = document.querySelectorAll('svg');
        svgs.forEach(svg => {
          svg.setAttribute('width', svg.getBoundingClientRect().width.toString());
          svg.setAttribute('height', svg.getBoundingClientRect().height.toString());
        });
        // Wait a bit more after clone
        return new Promise(resolve => setTimeout(resolve, 300));
      }
    });
    
    // Clean up
    document.body.removeChild(container);
    
    // Get data URL but make sure it's properly formatted for jsPDF
    const dataUrl = canvas.toDataURL('image/png');
    console.log('Generated chart data URL length:', dataUrl.length);
    return dataUrl;
  } catch (error) {
    console.error('Error in chartToImage:', error);
    return '';
  }
}
