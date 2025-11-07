import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Ad } from '../types';
import Button from './common/Button';
import { drawInitialImage, resizeImage, drawLogo, loadImage, getCanvasBase64 } from '../utils/imageProcessor';

interface AdEditorProps {
  ad: Ad;
}

// Base64 for a transparent PepoMart logo (derived from the SVG in Header.tsx)
const PEPOMART_LOGO_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACq24o3AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0AdFW/FsAAACJSURBVHhe7dixCYAwDAXRwA39N/C23uS0xYvX+p2d3R0cHBwcHD8eXn3AwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHByc/B/gDymzB5b+157WAAAAAElFTkSuQmCC';

const AdEditor: React.FC<AdEditorProps> = ({ ad }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalImageRef = useRef<HTMLImageElement | null>(null);
  const logoImageRef = useRef<HTMLImageElement | null>(null);

  const [currentWidth, setCurrentWidth] = useState<number>(0);
  const [currentHeight, setCurrentHeight] = useState<number>(0);
  const [showLogo, setShowLogo] = useState<boolean>(false);
  const [logoPosition, setLogoPosition] = useState<'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'>('bottomRight');
  const [logoSize, setLogoSize] = useState<number>(0.1); // as a fraction of image width

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const originalImage = originalImageRef.current;
    const logoImage = logoImageRef.current;

    if (!canvas || !originalImage) return;

    // Reset canvas to current dimensions and draw the original image (or the last resized state)
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

    // Draw logo if enabled
    if (showLogo && logoImage) {
      drawLogo(canvas, logoImage, logoPosition, logoSize);
    }
  }, [showLogo, logoPosition, logoSize]);

  // Effect to load images and draw initial canvas
  useEffect(() => {
    const loadAndDraw = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      try {
        const initialImage = await drawInitialImage(canvas, ad.marketingImage);
        originalImageRef.current = initialImage; // Store original loaded image
        setCurrentWidth(initialImage.naturalWidth);
        setCurrentHeight(initialImage.naturalHeight);

        const loadedLogo = await loadImage(PEPOMART_LOGO_BASE64);
        logoImageRef.current = loadedLogo;
        redrawCanvas(); // Redraw with potentially loaded logo
      } catch (err) {
        console.error('Failed to load ad image or logo:', err);
      }
    };
    loadAndDraw();
  }, [ad.marketingImage, redrawCanvas]);

  // Effect to redraw canvas when logo options change
  useEffect(() => {
    redrawCanvas();
  }, [showLogo, logoPosition, logoSize, currentWidth, currentHeight, redrawCanvas]);


  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    const originalImage = originalImageRef.current;
    if (!canvas || !originalImage) return;

    resizeImage(canvas, originalImage, currentWidth, currentHeight, true); // Maintain aspect ratio
    redrawCanvas(); // Redraw content including logo
  }, [currentWidth, currentHeight, redrawCanvas]);

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataURL = getCanvasBase64(canvas, 'image/png'); // Can choose 'image/jpeg' and specify quality
      const link = document.createElement('a');
      link.download = `pepomart-ad-${ad.productHandle}.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [ad.productHandle]);

  const handleReset = useCallback(() => {
    const canvas = canvasRef.current;
    const originalImage = originalImageRef.current;
    if (!canvas || !originalImage) return;

    canvas.width = originalImage.naturalWidth;
    canvas.height = originalImage.naturalHeight;
    setCurrentWidth(originalImage.naturalWidth);
    setCurrentHeight(originalImage.naturalHeight);
    setShowLogo(false);
    setLogoPosition('bottomRight');
    setLogoSize(0.1);
    redrawCanvas(); // Reset and redraw
  }, [redrawCanvas]);

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">Edit Ad: {ad.productTitle}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Canvas for image preview and editing */}
        <div className="flex flex-col items-center bg-gray-700 p-4 rounded-md">
          <h3 className="text-xl font-semibold text-white mb-4">Ad Preview</h3>
          <canvas
            ref={canvasRef}
            className="max-w-full h-auto border border-gray-600 rounded-md bg-black"
            style={{ maxWidth: '100%', height: 'auto' }} // Ensure responsiveness
          ></canvas>
        </div>

        {/* Editing Controls */}
        <div className="flex flex-col gap-6">
          {/* Resize Options */}
          <div className="bg-gray-700 p-4 rounded-md shadow-inner">
            <h3 className="text-xl font-semibold text-white mb-4">Image Resizer</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="width-input" className="block text-gray-300 text-sm font-bold mb-2">Width (px):</label>
                <input
                  id="width-input"
                  type="number"
                  value={currentWidth}
                  onChange={(e) => setCurrentWidth(parseInt(e.target.value) || 0)}
                  onBlur={handleResize}
                  className="w-full p-2 bg-gray-600 border border-gray-500 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="height-input" className="block text-gray-300 text-sm font-bold mb-2">Height (px):</label>
                <input
                  id="height-input"
                  type="number"
                  value={currentHeight}
                  onChange={(e) => setCurrentHeight(parseInt(e.target.value) || 0)}
                  onBlur={handleResize}
                  className="w-full p-2 bg-gray-600 border border-gray-500 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <Button onClick={handleResize} className="w-full">Apply Resize</Button>
          </div>

          {/* Logo Options */}
          <div className="bg-gray-700 p-4 rounded-md shadow-inner">
            <h3 className="text-xl font-semibold text-white mb-4">PepoMart Logo</h3>
            <div className="flex items-center mb-4">
              <input
                id="toggle-logo"
                type="checkbox"
                checked={showLogo}
                onChange={(e) => setShowLogo(e.target.checked)}
                className="mr-2 h-5 w-5 text-indigo-600 rounded border-gray-500 focus:ring-indigo-500"
              />
              <label htmlFor="toggle-logo" className="text-gray-300 font-bold">Include PepoMart Logo</label>
            </div>

            {showLogo && (
              <>
                <div className="mb-4">
                  <label htmlFor="logo-position" className="block text-gray-300 text-sm font-bold mb-2">Logo Position:</label>
                  <select
                    id="logo-position"
                    value={logoPosition}
                    onChange={(e) => setLogoPosition(e.target.value as typeof logoPosition)}
                    className="w-full p-2 bg-gray-600 border border-gray-500 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="topLeft">Top-Left</option>
                    <option value="topRight">Top-Right</option>
                    <option value="bottomLeft">Bottom-Left</option>
                    <option value="bottomRight">Bottom-Right</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label htmlFor="logo-size" className="block text-gray-300 text-sm font-bold mb-2">Logo Size ({Math.round(logoSize * 100)}% of image width):</label>
                  <input
                    id="logo-size"
                    type="range"
                    min="0.05"
                    max="0.5"
                    step="0.01"
                    value={logoSize}
                    onChange={(e) => setLogoSize(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer range-lg"
                  />
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4">
            <Button onClick={handleReset} variant="secondary">Reset Image</Button>
            <Button onClick={handleDownload}>Download Edited Ad</Button>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-700 rounded-md">
        <h3 className="text-xl font-semibold text-white mb-2">Ad Details:</h3>
        <p className="text-gray-300 italic mb-2">"{ad.caption}"</p>
        <div className="flex flex-wrap gap-2">
          {ad.hashtags.map((tag, index) => (
            <span key={index} className="bg-indigo-700/50 text-indigo-200 text-xs px-2 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdEditor;