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
    // Wait for Chart.js animations to complete (default animation duration is 1000ms)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Check if there's a canvas element (for Chart.js)
    const chartCanvas = element.querySelector('canvas');
    if (chartCanvas) {
      // Force Chart.js to finish rendering
      const ctx = chartCanvas.getContext('2d');
      if (ctx) {
        // Trigger a render by saving and restoring context
        ctx.save();
        ctx.restore();
      }
      
      // Additional wait for Chart.js
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Use html2canvas directly on the element with optimized settings
    const capturedCanvas = await html2canvas(element, {
      backgroundColor: '#ffffff', // Ensure white background
      scale: 2, // Good balance between quality and performance
      logging: true, // Enable logging for debugging
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: false,
      imageTimeout: 15000, // Increase timeout
      onclone: (clonedDoc, clonedElement) => {
        // Ensure the cloned element is visible and properly styled
        clonedElement.style.display = 'block';
        clonedElement.style.visibility = 'visible';
        clonedElement.style.opacity = '1';
        clonedElement.style.background = '#ffffff';
        
        // Find and ensure canvas elements are rendered
        const canvases = clonedElement.querySelectorAll('canvas');
        canvases.forEach((canvas: any) => {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Force canvas to render
            ctx.save();
            ctx.restore();
          }
        });
        
        // Ensure all text is black
        const textElements = clonedElement.querySelectorAll('span, div, p');
        textElements.forEach((el: any) => {
          if (el.style) {
            el.style.color = '#000000';
          }
        });
      }
    });
    
    // Get data URL
    const dataUrl = capturedCanvas.toDataURL('image/png', 1.0);
    console.log('Generated chart data URL length:', dataUrl.length);
    
    // Validate the data URL
    if (!dataUrl || dataUrl === 'data:,' || dataUrl.length < 100) {
      throw new Error('Invalid data URL generated');
    }
    
    return dataUrl;
  } catch (error) {
    console.error('Error in chartToImage:', error);
    
    // Fallback: Try to capture with a simpler method
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 1,
        logging: false
      });
      return canvas.toDataURL('image/png');
    } catch (fallbackError) {
      console.error('Fallback capture also failed:', fallbackError);
      return '';
    }
  }
}
