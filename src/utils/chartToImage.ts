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
    // Wait a bit to ensure chart is fully rendered
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const canvas = await html2canvas(element, {
      backgroundColor: null,
      scale: 2, // Higher scale for better quality
      logging: true,
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: false // This can cause issues in some browsers
    });
    
    return canvas.toDataURL("image/png");
  } catch (error) {
    console.error('Error in chartToImage:', error);
    return '';
  }
}
