import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';
import { productApi } from '../services/api';
import { products as fallbackProducts } from '../data/products';
import { recommendationEngine } from '../utils/recommendationEngine';

interface ProductContextType {
  products: Product[];
  categories: string[];
  isLoading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [categories, setCategories] = useState<string[]>([...new Set(fallbackProducts.map(p => p.category))]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchProducts = async () => {
    if (isInitialized) {
      setIsLoading(true);
    }
    setError(null);
    
    try {
      // Fetch products from API
      const apiProducts = await productApi.getAllProducts();
      
      if (apiProducts.length > 0) {
        setProducts(apiProducts);
        
        // Update recommendation engine with new products
        // We don't need to await this as it can happen in the background
        recommendationEngine.updateProducts(apiProducts)
          .catch(err => console.error('Error updating recommendation engine:', err));
      } else {
        // If API returns empty, use fallback products
        console.log('Using fallback products');
        setProducts(fallbackProducts);
        
        // Initialize recommendation engine with fallback products
        // Again, no need to await
        recommendationEngine.initialize()
          .catch(err => console.error('Error initializing recommendation engine with fallback products:', err));
      }
      
      // Fetch categories
      const apiCategories = await productApi.getCategories();
      if (apiCategories.length > 0) {
        setCategories(apiCategories);
      } else {
        // Use unique categories from products
        setCategories([...new Set(products.map(p => p.category))]);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Using fallback data.');
      
      // Only set fallback products if we don't already have products
      if (products.length === 0) {
        setProducts(fallbackProducts);
        setCategories([...new Set(fallbackProducts.map(p => p.category))]);
      }
      
      // Initialize recommendation engine with what we have
      recommendationEngine.initialize(products.length > 0 ? products : fallbackProducts)
        .catch(error => console.error('Error initializing recommendation engine with fallback products:', error));
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchProducts();
  }, []);

  const refreshProducts = async () => {
    await fetchProducts();
  };

  return (
    <ProductContext.Provider value={{
      products,
      categories,
      isLoading,
      error,
      refreshProducts
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};