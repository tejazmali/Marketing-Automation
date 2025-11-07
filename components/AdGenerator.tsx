import React, { useState, useCallback } from 'react';
import { Product, Ad } from '../types';
import { generateMarketingImage, generateCaptionAndHashtags } from '../services/geminiService';
import Button from './common/Button';
import LoadingSpinner from './common/LoadingSpinner';

interface AdGeneratorProps {
  selectedProduct: Product | null; // Now expects a single selected product
  onAdGenerated: (ad: Ad) => void; // New prop to pass the generated ad
}

const AdGenerator: React.FC<AdGeneratorProps> = ({ selectedProduct, onAdGenerated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [background, setBackground] = useState<string>('');
  const [environment, setEnvironment] = useState<string>('');
  const [mood, setMood] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [composition, setComposition] = useState<string>(''); // New state for composition
  const [wearer, setWearer] = useState<'none' | 'wearing' | 'held'>('none'); // New state for wearer
  const [angle, setAngle] = useState<string>(''); // New state for angle
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);

  const handleGenerateAds = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    if (!selectedProduct) {
      setError("No product selected to generate an ad. Please select a product from the catalog.");
      setIsLoading(false);
      return;
    }

    try {
      // Generate marketing image
      const marketingImage = await generateMarketingImage(
        selectedProduct,
        '1:1', // Defaulting to 1:1 aspect ratio for ads
        background,
        environment,
        mood,
        customPrompt,
        composition, // Pass new parameters
        wearer,      // Pass new parameters
        angle        // Pass new parameters
      );

      // Generate caption and hashtags
      const { caption, hashtags } = await generateCaptionAndHashtags(selectedProduct);

      const generatedAd: Ad = {
        productHandle: selectedProduct.handle,
        productTitle: selectedProduct.title,
        marketingImage,
        caption,
        hashtags: hashtags.map(tag => (tag.startsWith('#') ? tag : `#${tag}`)), // Ensure hashtags start with #
      };
      onAdGenerated(generatedAd); // Pass the generated ad to the parent component

    } catch (err: any) {
      console.error(`Failed to generate ad for ${selectedProduct.title}:`, err);
      setError(`Failed to generate ad for "${selectedProduct.title}": ${err.message || 'Unknown error'}`);
    }
    setIsLoading(false);
  }, [selectedProduct, background, environment, mood, customPrompt, composition, wearer, angle, onAdGenerated]);

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">Generate Marketing Ads</h2>

      <div className="flex flex-col gap-4 mb-6">
        <Button
          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          variant="secondary"
          className="text-sm py-2 px-4 w-fit mx-auto"
        >
          {showAdvancedOptions ? 'Hide Advanced Options' : 'Show Advanced Options'}
        </Button>

        {showAdvancedOptions && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-700 p-4 rounded-md">
            <div>
              <label htmlFor="background-input" className="block text-gray-300 text-sm font-bold mb-2">
                Background (Optional):
              </label>
              <input
                id="background-input"
                type="text"
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                placeholder="e.g., seamless white studio, urban street, natural landscape"
                className="w-full p-3 bg-gray-600 border border-gray-500 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="environment-input" className="block text-gray-300 text-sm font-bold mb-2">
                Environment (Optional):
              </label>
              <input
                id="environment-input"
                type="text"
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                placeholder="e.g., studio photoshoot, outdoor sunny day, night city"
                className="w-full p-3 bg-gray-600 border border-gray-500 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="mood-input" className="block text-gray-300 text-sm font-bold mb-2">
                Mood (Optional):
              </label>
              <input
                id="mood-input"
                type="text"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                placeholder="e.g., energetic, calm, futuristic, vintage"
                className="w-full p-3 bg-gray-600 border border-gray-500 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="composition-input" className="block text-gray-300 text-sm font-bold mb-2">
                Composition (Optional):
              </label>
              <input
                id="composition-input"
                type="text"
                value={composition}
                onChange={(e) => setComposition(e.target.value)}
                placeholder="e.g., centered and minimalistic, dynamic and off-center"
                className="w-full p-3 bg-gray-600 border border-gray-500 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="wearer-input" className="block text-gray-300 text-sm font-bold mb-2">
                Wearer/Interaction (Optional):
              </label>
              <select
                id="wearer-input"
                value={wearer}
                onChange={(e) => setWearer(e.target.value as 'none' | 'wearing' | 'held')}
                className="w-full p-3 bg-gray-600 border border-gray-500 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="none">Product Only (AI decides positioning)</option>
                <option value="wearing">Someone Wearing the Product</option>
                <option value="held">Product Being Held</option>
              </select>
            </div>
            <div>
              <label htmlFor="angle-input" className="block text-gray-300 text-sm font-bold mb-2">
                Camera Angle (Optional):
              </label>
              <input
                id="angle-input"
                type="text"
                value={angle}
                onChange={(e) => setAngle(e.target.value)}
                placeholder="e.g., low-angle shot, eye-level, overhead view"
                className="w-full p-3 bg-gray-600 border border-gray-500 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="custom-prompt-input" className="block text-gray-300 text-sm font-bold mb-2">
                Additional Prompt / Custom Instructions (Optional):
              </label>
              <textarea
                id="custom-prompt-input"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={3}
                placeholder="e.g., add a lens flare effect, place the shoe on a pedestal, make it look minimalist"
                className="w-full p-3 bg-gray-600 border border-gray-500 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
              ></textarea>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center mb-8">
        <Button
          onClick={handleGenerateAds}
          disabled={isLoading || !selectedProduct}
          className={`text-lg px-8 py-3 ${!selectedProduct ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Generating Ad...' : 'Generate Ad for Selected Product'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-900/30 text-red-300 p-3 rounded mb-4 text-center" role="alert">
          {error}
        </div>
      )}

      {isLoading && <LoadingSpinner />}
    </div>
  );
};

export default AdGenerator;