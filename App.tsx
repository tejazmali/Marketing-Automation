import React, { useState, useCallback, useMemo } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import ProductList from './components/ProductList';
import AdGenerator from './components/AdGenerator';
import { Product, Ad } from './types';
import { parseCSV } from './utils/csvParser';
import Button from './components/common/Button';
import AdEditor from './components/AdEditor'; // Import the new AdEditor component

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [csvFileName, setCsvFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedVendorFilter, setSelectedVendorFilter] = useState<string>('All');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [selectedProductHandle, setSelectedProductHandle] = useState<string | null>(null);
  const [editedAd, setEditedAd] = useState<Ad | null>(null); // State to hold the generated ad for editing

  const handleCSVUpload = useCallback((content: string, fileName: string) => {
    setError(null);
    try {
      const parsedProducts = parseCSV(content);
      setProducts(parsedProducts);
      setCsvFileName(fileName);
      setSelectedVendorFilter('All'); // Reset filters on new CSV upload
      setSelectedCategoryFilter('All');
      setSelectedProductHandle(null); // Clear selected product on new CSV
      setEditedAd(null); // Clear any edited ad
      console.log('Parsed Products:', parsedProducts);
    } catch (err: any) {
      console.error('Error parsing CSV:', err);
      setError(`Failed to parse CSV: ${err.message || 'Please ensure it is a valid CSV format.'}`);
      setProducts([]);
      setCsvFileName(null);
    }
  }, []);

  const uniqueVendors = useMemo(() => {
    const vendors = new Set<string>();
    products.forEach(p => vendors.add(p.vendor));
    return ['All', ...Array.from(vendors).sort()];
  }, [products]);

  const uniqueCategories = useMemo(() => {
    const categories = new Set<string>();
    products.forEach(p => categories.add(p.productCategory));
    return ['All', ...Array.from(categories).sort()];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesVendor = selectedVendorFilter === 'All' || product.vendor === selectedVendorFilter;
      const matchesCategory = selectedCategoryFilter === 'All' || product.productCategory === selectedCategoryFilter;
      return matchesVendor && matchesCategory;
    });
  }, [products, selectedVendorFilter, selectedCategoryFilter]);

  const selectedProduct = useMemo(() => {
    return products.find(p => p.handle === selectedProductHandle) || null;
  }, [products, selectedProductHandle]);

  const handleClearFilters = useCallback(() => {
    setSelectedVendorFilter('All');
    setSelectedCategoryFilter('All');
    setSelectedProductHandle(null); // Clear selection when filters are cleared
  }, []);

  const handleProductSelect = useCallback((productHandle: string | null) => {
    setSelectedProductHandle(productHandle);
    setEditedAd(null); // Clear any edited ad when a new product is selected
  }, []);

  const handleAdGenerated = useCallback((ad: Ad) => {
    setEditedAd(ad);
  }, []);

  const handleBackToGenerator = useCallback(() => {
    setEditedAd(null);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header appName="PepoMart Ad Creator" />
      <main className="container mx-auto p-6 flex-grow">
        <h2 className="text-4xl font-extrabold text-white mb-10 text-center">
          Autonomous Marketing AI Studio
        </h2>

        {error && (
          <div className="bg-red-900/30 text-red-300 p-4 rounded mb-8 text-center" role="alert">
            {error}
          </div>
        )}

        <section id="csv-upload" className="mb-10">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Upload Product Catalog (CSV)</h2>
          <FileUpload onFileUpload={handleCSVUpload} accept=".csv" buttonText="Browse CSV File" />
          {csvFileName && (
            <p className="text-center text-gray-400 mt-4 text-lg">
              Catalog loaded: <span className="font-semibold text-indigo-400">{csvFileName}</span> with {products.length} unique products.
            </p>
          )}
        </section>

        {products.length > 0 && (
          <>
            {!editedAd ? (
              <>
                <section id="product-selection" className="mb-10 bg-gray-800 p-6 rounded-lg shadow-lg">
                  <h2 className="text-3xl font-bold text-white mb-6 text-center">Select Product from Catalog</h2>
                  <p className="text-gray-400 text-center mb-6">
                    Filter products by vendor or category, then select a single product to generate an ad.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4 mb-8">
                    <div className="flex flex-col">
                      <label htmlFor="vendor-filter" className="block text-gray-300 text-sm font-bold mb-2">
                        Filter by Vendor:
                      </label>
                      <select
                        id="vendor-filter"
                        value={selectedVendorFilter}
                        onChange={(e) => { setSelectedVendorFilter(e.target.value); setSelectedProductHandle(null); }}
                        className="p-3 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[200px]"
                      >
                        {uniqueVendors.map(vendor => (
                          <option key={vendor} value={vendor}>{vendor}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col">
                      <label htmlFor="category-filter" className="block text-gray-300 text-sm font-bold mb-2">
                        Filter by Category:
                      </label>
                      <select
                        id="category-filter"
                        value={selectedCategoryFilter}
                        onChange={(e) => { setSelectedCategoryFilter(e.target.value); setSelectedProductHandle(null); }}
                        className="p-3 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[200px]"
                      >
                        {uniqueCategories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    {(selectedVendorFilter !== 'All' || selectedCategoryFilter !== 'All' || selectedProductHandle) && (
                      <div className="flex items-end">
                        <Button onClick={handleClearFilters} variant="secondary">
                          Clear Filters
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="text-center text-gray-300 mb-6">
                    Showing <span className="font-semibold text-indigo-400">{filteredProducts.length}</span> products matching criteria.
                    {selectedProduct && (
                      <p className="text-sm mt-2">Currently selected: <span className="font-semibold text-indigo-400">{selectedProduct.title}</span></p>
                    )}
                  </div>

                  <ProductList
                    products={filteredProducts}
                    selectedProductHandle={selectedProductHandle}
                    onProductSelect={handleProductSelect}
                  />
                </section>

                <section id="ad-generation" className="mb-10">
                  <AdGenerator selectedProduct={selectedProduct} onAdGenerated={handleAdGenerated} />
                </section>
              </>
            ) : (
              <section id="ad-editing" className="mb-10">
                <div className="flex justify-start mb-4">
                  <Button onClick={handleBackToGenerator} variant="secondary">
                    ← Back to Ad Generator
                  </Button>
                </div>
                <AdEditor ad={editedAd} />
              </section>
            )}
          </>
        )}
      </main>
      <footer className="bg-gray-800 text-gray-400 p-4 text-center mt-auto shadow-inner">
        <p>&copy; {new Date().getFullYear()} PepoMart. Powered by Gemini API.</p>
      </footer>
    </div>
  );
};

export default App;