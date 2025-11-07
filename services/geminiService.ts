import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { Product, Ad, AspectRatio } from '../types';

const getGeminiClient = () => {
  // Always create a new instance to ensure the latest API key is used
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateMarketingImage = async (
  product: Product,
  aspectRatio: AspectRatio = '1:1', // Default for Imagen, can be overridden
  background?: string,
  environment?: string,
  mood?: string,
  customPrompt?: string,
  composition?: string, // New optional parameter
  wearer?: 'none' | 'wearing' | 'held', // New optional parameter
  angle?: string, // New optional parameter
): Promise<string> => {
  const ai = getGeminiClient();

  const productDescription = `Product Name: ${product.title}. Category: ${product.productCategory}. Type: ${product.type}. Vendor: ${product.vendor}. ${product.color ? `Color: ${product.color}.` : ''} ${product.material ? `Material: ${product.material}.` : ''} ${product.bodyHtml ? `Description: ${product.bodyHtml.replace(/<[^>]*>?/gm, '').substring(0, 100)}...` : ''}`;

  let prompt = `Create a professional, high-resolution marketing ad image for a pair of the following sneaker product. The image should feature a modern ad layout with realistic shadows, professional lighting, and natural reflections.
  DO NOT alter the core visual identity (color, shape, material) of the sneaker.
  Drawing inspiration from current sneaker advertisement trends seen on platforms like Nike Instagram, Adidas Instagram, SneakerNews.com, and Highsnobiety.com/tag/sneakers, design the image.

  Product Details: ${productDescription}`;

  // Add details about wearer, composition, and angle
  if (wearer === 'wearing') {
    prompt += ` Show someone wearing the sneakers in an authentic street style shot.`;
  } else if (wearer === 'held') {
    prompt += ` Show the sneakers being held casually.`;
  } else { // 'none' or unspecified, default to product-only but allow creative positioning
    prompt += ` Focus on the sneakers themselves.`;
  }

  if (composition) {
    prompt += ` Use a composition style: ${composition}.`;
  } else {
    prompt += ` Employ dynamic positioning and creative framing to highlight the product.`;
  }

  if (angle) {
    prompt += ` Use a camera angle: ${angle}.`;
  } else {
    prompt += ` Utilize varied camera angles to capture the sneaker's design details.`;
  }

  // Add existing background, environment, mood options
  if (background) {
    prompt += ` The background should be: ${background}.`;
  } else {
    prompt += ` Use a trending background color, lighting, reflections, or props.`;
  }
  if (environment) {
    prompt += ` The environment should be: ${environment}.`;
  }
  if (mood) {
    prompt += ` The mood of the image should be: ${mood}.`;
  }
  if (customPrompt) {
    prompt += ` Additional instructions: ${customPrompt}.`;
  }

  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: aspectRatio,
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    throw new Error('No image generated.');
  } catch (error) {
    console.error('Error generating marketing image:', error);
    throw new Error('Failed to generate marketing image.');
  }
};

export const generateCaptionAndHashtags = async (product: Product): Promise<{ caption: string; hashtags: string[] }> => {
  const ai = getGeminiClient();

  const productDescription = `Product Name: ${product.title}. Category: ${product.productCategory}. Type: ${product.type}. Vendor: ${product.vendor}. ${product.color ? `Color: ${product.color}.` : ''} ${product.material ? `Material: ${product.material}.` : ''} ${product.bodyHtml ? `Description: ${product.bodyHtml.replace(/<[^>]*>?/gm, '').substring(0, 100)}...` : ''}`;

  const prompt = `As PepoMart's Autonomous Marketing AI, generate a short, catchy caption (under 12 words) and 3-5 trending hashtags for the following sneaker product. The tone should be minimal, bold, and youthful, fitting current sneaker community language.
  Product Details: ${productDescription}
  Output must be a JSON object with 'caption' (string) and 'hashtags' (array of strings).`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            caption: { type: Type.STRING },
            hashtags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          propertyOrdering: ["caption", "hashtags"],
        },
      },
    });

    const jsonStr = response.text.trim();
    const result = JSON.parse(jsonStr);
    return { caption: result.caption, hashtags: result.hashtags };
  } catch (error) {
    console.error('Error generating caption and hashtags:', error);
    throw new Error('Failed to generate caption and hashtags.');
  }
};