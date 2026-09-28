/**
 * High-performance browser image optimizer.
 * Automatically downscales oversized camera photos/scans to an optimal resolution (max 1600px)
 * and JPEG compression (0.85), keeping the total payload well under Vercel's 4.5MB limit
 * while preserving high fidelity for Gemini OCR handwriting recognition.
 */
export async function optimizeImageDataUrl(
  dataUrl: string,
  maxDimension = 1600,
  quality = 0.85
): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:image')) {
    return dataUrl;
  }

  // If already under 400KB base64, bypass compression
  if (dataUrl.length < 400000) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      // If dimensions are reasonable and size is moderate, keep original
      if (width <= maxDimension && height <= maxDimension && dataUrl.length < 1200000) {
        resolve(dataUrl);
        return;
      }

      if (width > height && width > maxDimension) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else if (height > maxDimension) {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      const optimized = canvas.toDataURL('image/jpeg', quality);
      resolve(optimized);
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
