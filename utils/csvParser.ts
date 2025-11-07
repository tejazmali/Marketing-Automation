import { Product, ProductVariant } from '../types';

export const parseCSV = (csvString: string): Product[] => {
  const lines = csvString.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(header => header.trim());
  const productsMap = new Map<string, Product>();

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0) continue;

    const row: { [key: string]: string } = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    const handle = row['Handle'];

    if (!handle) continue;

    let product = productsMap.get(handle);

    const variant: ProductVariant = {
      option1Value: row['Option1 Value'],
      variantSku: row['Variant SKU'],
      variantGrams: parseFloat(row['Variant Grams'] || '0'),
      variantInventoryQty: parseInt(row['Variant Inventory Qty'] || '0'),
      variantPrice: parseFloat(row['Variant Price'] || '0'),
      variantCompareAtPrice: parseFloat(row['Variant Compare At Price'] || '0') || undefined,
      variantImage: row['Variant Image'] || undefined,
    };

    if (!product) {
      // Tags can be comma-separated
      const tagsString = row['Tags'] || '';
      const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

      // Extract color and material from product metafields if available
      const color = row['Color (product.metafields.shopify.color-pattern)'] || row['Color'];
      const fabric = row['Fabric (product.metafields.shopify.fabric)'] || row['Fabric'];
      const targetGender = row['Target gender (product.metafields.shopify.target-gender)'] || row['Google Shopping / Gender'];

      product = {
        handle: handle,
        title: row['Title'],
        bodyHtml: row['Body (HTML)'],
        vendor: row['Vendor'],
        productCategory: row['Product Category'],
        type: row['Type'],
        tags: tags,
        published: row['Published'].toLowerCase() === 'true',
        imageSrc: row['Image Src'],
        seoTitle: row['SEO Title'],
        seoDescription: row['SEO Description'],
        variants: [],
        color: color || undefined,
        material: fabric || undefined,
        gender: targetGender || undefined,
      };
      productsMap.set(handle, product);
    }

    // Add variant to the product
    product.variants.push(variant);
    // If the main product image is missing, use the first variant image as fallback
    if (!product.imageSrc && variant.variantImage) {
        product.imageSrc = variant.variantImage;
    }
  }

  return Array.from(productsMap.values()).filter(p => p.published && p.imageSrc);
};

// Helper function to parse a CSV line, handling quoted commas
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let inQuote = false;
  let currentField = '';

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuote = !inQuote;
    } else if (char === ',' && !inQuote) {
      result.push(currentField.trim());
      currentField = '';
    } else {
      currentField += char;
    }
  }
  result.push(currentField.trim()); // Add the last field
  return result;
};