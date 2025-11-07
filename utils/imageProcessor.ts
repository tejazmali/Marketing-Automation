// utils/imageProcessor.ts

/**
 * Loads an image from a given source (URL or base64 data URL).
 * @param src The source of the image.
 * @returns A promise that resolves with the HTMLImageElement.
 */
export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Draws an image onto a canvas, fitting it while maintaining aspect ratio.
 * @param canvas The canvas element.
 * @param imageSrc The source (data URL) of the image to draw.
 * @returns A promise that resolves when the image is drawn, returning the loaded Image element.
 */
export const drawInitialImage = async (canvas: HTMLCanvasElement, imageSrc: string): Promise<HTMLImageElement> => {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error("Could not get 2D context for canvas.");

  const img = await loadImage(imageSrc);

  // Clear canvas before drawing
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const imgAspectRatio = img.width / img.height;
  const canvasAspectRatio = canvas.width / canvas.height;

  let drawWidth = canvas.width;
  let drawHeight = canvas.height;
  let offsetX = 0;
  let offsetY = 0;

  if (imgAspectRatio > canvasAspectRatio) {
    // Image is wider than canvas
    drawHeight = canvas.height;
    drawWidth = imgAspectRatio * drawHeight;
    offsetX = (canvas.width - drawWidth) / 2;
  } else {
    // Image is taller than canvas
    drawWidth = canvas.width;
    drawHeight = canvas.width / imgAspectRatio;
    offsetY = (canvas.height - drawHeight) / 2;
  }

  // Set canvas dimensions to match the image's natural dimensions initially
  // This allows for accurate pixel manipulation later
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
  return img;
};

/**
 * Resizes and redraws the image on the canvas.
 * @param canvas The canvas element.
 * @param image The HTMLImageElement to resize.
 * @param targetWidth The desired new width for the canvas.
 * @param targetHeight The desired new height for the canvas.
 * @param maintainAspectRatio If true, adjusts target height/width to maintain aspect ratio.
 */
export const resizeImage = (
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  targetWidth: number,
  targetHeight: number,
  maintainAspectRatio: boolean = true
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let finalWidth = targetWidth;
  let finalHeight = targetHeight;

  if (maintainAspectRatio) {
    const originalAspectRatio = image.width / image.height;
    if (targetWidth && !targetHeight) {
      finalHeight = targetWidth / originalAspectRatio;
    } else if (!targetWidth && targetHeight) {
      finalWidth = targetHeight * originalAspectRatio;
    } else if (targetWidth && targetHeight) {
      const newAspectRatio = targetWidth / targetHeight;
      if (originalAspectRatio > newAspectRatio) {
        finalHeight = targetWidth / originalAspectRatio;
      } else {
        finalWidth = targetHeight * originalAspectRatio;
      }
    }
  }

  canvas.width = finalWidth;
  canvas.height = finalHeight;
  ctx.clearRect(0, 0, finalWidth, finalHeight);
  ctx.drawImage(image, 0, 0, finalWidth, finalHeight);
};

/**
 * Draws a logo onto the canvas.
 * @param canvas The canvas element.
 * @param logoImage The loaded logo HTMLImageElement.
 * @param position The position to draw the logo ('topLeft', 'topRight', 'bottomLeft', 'bottomRight').
 * @param logoSize The size multiplier for the logo (e.g., 0.1 for 10% of image width).
 */
export const drawLogo = (
  canvas: HTMLCanvasElement,
  logoImage: HTMLImageElement,
  position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight',
  logoSize: number
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const logoWidth = logoImage.width * logoSize;
  const logoHeight = logoImage.height * logoSize;
  const padding = 20; // Padding from the edges

  let x = 0;
  let y = 0;

  switch (position) {
    case 'topLeft':
      x = padding;
      y = padding;
      break;
    case 'topRight':
      x = canvas.width - logoWidth - padding;
      y = padding;
      break;
    case 'bottomLeft':
      x = padding;
      y = canvas.height - logoHeight - padding;
      break;
    case 'bottomRight':
      x = canvas.width - logoWidth - padding;
      y = canvas.height - logoHeight - padding;
      break;
  }

  ctx.drawImage(logoImage, x, y, logoWidth, logoHeight);
};

/**
 * Gets the current content of the canvas as a base64 data URL.
 * @param canvas The canvas element.
 * @param mimeType The desired MIME type for the output image (e.g., 'image/png', 'image/jpeg').
 * @param quality For 'image/jpeg' and 'image/webp', a number between 0 and 1 indicating image quality.
 * @returns The base64 data URL of the canvas content.
 */
export const getCanvasBase64 = (canvas: HTMLCanvasElement, mimeType: string = 'image/png', quality?: number): string => {
  return canvas.toDataURL(mimeType, quality);
};