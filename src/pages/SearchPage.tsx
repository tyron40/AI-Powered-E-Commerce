import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import ProductGrid from '../components/ProductGrid';
import { Product } from '../types';
import { useProducts } from '../context/ProductContext';

const SearchPage: React.FC = () => {
  const location = useLocation();
  const { products, isLoading } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  
  useEffect(() => {
    const query = new URLSearchParams(location.search).get('q') || '';
    setSearchQuery(query);
    
    if (query && products.length > 0) {
      // Simple search implementation
      const results = products.filter(product => {
        const searchLower = query.toLowerCase();
        return (
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.category.toLowerCase().includes(searchLower) ||
          product.features.some(feature => feature.toLowerCase().includes(searchLower))
        );
      });
      
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [location.search, products]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Search Results</h1>
        
        <form onSubmit={handleSearch} className="max-w-2xl">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute left-4 top-3.5">
              <Search className="h-5 w-5 text-gray-500" />
            </div>
            <button
              type="submit"
              className="absolute right-3 top-2 px-4 py-1.5 bg-orange-600 text-white rounded-md hover:bg-orange-700"
            >
              Search
            </button>
          </div>
        </form>
      </div>
      
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-8 bg-gray-200 rounded-full w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {searchQuery && (
            <div className="mb-6">
              <p className="text-gray-600">
                {searchResults.length === 0
                  ? `No results found for "${searchQuery}"`
                  : `Found ${searchResults.length} ${searchResults.length === 1 ? 'result' : 'results'} for "${searchQuery}"`}
              </p>
            </div>
          )}
          
          {searchResults.length > 0 ? (
            <ProductGrid products={searchResults} />
          ) : searchQuery && (
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-medium text-gray-900 mb-2">No products found</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                We couldn't find any products matching your search. Try using different keywords or browse our categories.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchPage;