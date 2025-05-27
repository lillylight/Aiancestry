/**
 * Converts a canvas element to a data URL with retry logic
 */
export async function canvasToDataURL(canvas: HTMLCanvasElement): Promise<string> {
  return new Promise((resolve) => {
    try {
      // Try to get data URL directly
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      console.log('Canvas converted to data URL, length:', dataUrl.length);
      resolve(dataUrl);
    } catch (error) {
      console.error('Error converting canvas to data URL:', error);
      
      // Fallback: try with blob
      canvas.toBlob((blob) => {
        if (blob) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            console.log('Canvas converted via blob, length:', result.length);
            resolve(result);
          };
          reader.readAsDataURL(blob);
        } else {
          console.error('Failed to create blob from canvas');
          resolve('');
        }
      }, 'image/png', 1.0);
    }
  });
}

/**
 * Waits for Chart.js to be ready and captures it
 */
export async function captureChartWhenReady(
  chartInstance: any,
  maxAttempts: number = 5
): Promise<string> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`Chart capture attempt ${attempt}/${maxAttempts}`);
    
    // Wait for animations
    await new Promise(resolve => setTimeout(resolve, 500 * attempt));
    
    if (chartInstance && chartInstance.canvas) {
      const canvas = chartInstance.canvas as HTMLCanvasElement;
      
      // Check if canvas has content
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('No canvas context available');
        continue;
      }
      
      // Check if canvas is not empty
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const hasContent = imageData.data.some((channel, index) => {
        // Check alpha channel (every 4th value)
        return index % 4 === 3 && channel > 0;
      });
      
      if (!hasContent) {
        console.log('Canvas appears to be empty, waiting...');
        continue;
      }
      
      // Canvas has content, capture it
      const dataUrl = await canvasToDataURL(canvas);
      if (dataUrl && dataUrl.length > 100) {
        console.log('Chart captured successfully!');
        return dataUrl;
      }
    }
  }
  
  console.error('Failed to capture chart after all attempts');
  return '';
}
