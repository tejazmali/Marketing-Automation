

// Fix: Remove redundant import of ProductVariant, as it's defined in this file.
// import { ProductVariant } from './utils/csvParser';

export interface ProductVariant {
  option1Value: string; // Shoe size
  variantSku: string;
  variantGrams: number;
  variantInventoryQty: number;
  variantPrice: number;
  variantCompareAtPrice?: number;
  variantImage?: string; // Specific image for this variant
}

export interface Product {
  handle: string;
  title: string;
  bodyHtml: string;
  vendor: string;
  productCategory: string;
  type: string;
  tags: string[];
  published: boolean;
  imageSrc: string; // Main product image
  seoTitle: string;
  seoDescription: string;
  variants: ProductVariant[];
  color?: string;
  material?: string;
  gender?: string;
}

export interface Ad {
  productHandle: string;
  productTitle: string;
  marketingImage: string; // Base64 or URL
  caption: string;
  hashtags: string[];
}

export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';

// Extends window for aistudio global object.
// Fix: Ensure a consistent type declaration for 'aistudio' on the Window interface
// by defining the AIStudio interface and then using it.
declare global {
  // Define the AIStudio interface directly within declare global to ensure consistent type declaration for 'aistudio' on the Window interface.
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio: AIStudio;
  }
}

// Interface for API response grounding chunks
export interface GroundingChunk {
  web?: {
    // Fix: Make uri and title optional to match @google/genai's GroundingChunkWeb type
    uri?: string;
    title?: string;
  };
  maps?: {
    // Fix: Make uri and title optional to match @google/genai's GroundingChunkMaps type
    uri?: string;
    title?: string;
    placeAnswerSources?: {
      reviewSnippets?: {
        uri?: string;
      }[];
    };
  };
}