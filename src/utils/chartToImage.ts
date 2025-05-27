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
<<<<<<< HEAD
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
=======
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
>>>>>>> 217b26eb713b6dd3cf175cda7e50c9068744a8cf
  }
}
