import React from 'react';
import { Product } from '../types';

interface ProductListProps {
  products: Product[];
  selectedProductHandle: string | null;
  onProductSelect: (productHandle: string | null) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, selectedProductHandle, onProductSelect }) => {
  if (products.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        No products found matching the current filters.
      </div>
    );
  }

  const handleProductClick = (productHandle: string) => {
    if (selectedProductHandle === productHandle) {
      onProductSelect(null); // Deselect if already selected
    } else {
      onProductSelect(productHandle); // Select new product
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div
          key={product.handle}
          className={`bg-gray-800 p-4 rounded-lg shadow-md flex flex-col justify-between border-2 transition-all duration-200 cursor-pointer 
            ${selectedProductHandle === product.handle ? 'border-indigo-500 ring-4 ring-indigo-500/50' : 'border-gray-700 hover:border-indigo-600'}`}
          onClick={() => handleProductClick(product.handle)}
          role="button"
          aria-pressed={selectedProductHandle === product.handle}
          tabIndex={0}
        >
          <img
            src={product.imageSrc || 'https://picsum.photos/300/200'}
            alt={product.title}
            className="w-full h-48 object-cover rounded-md mb-4"
          />
          <h3 className="text-xl font-semibold text-white mb-2">{product.title}</h3>
          <p className="text-gray-400 text-sm mb-2">{product.vendor} - {product.productCategory}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {product.variants.map((variant, idx) => (
              <span key={idx} className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">
                Size: {variant.option1Value} | Price: ${variant.variantPrice}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList;