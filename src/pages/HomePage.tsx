import React from 'react';
import Hero from '../components/Hero';
import ProductGrid from '../components/ProductGrid';
import RecommendationSection from '../components/RecommendationSection';
import { useProducts } from '../context/ProductContext';

const HomePage: React.FC = () => {
  const { products, isLoading } = useProducts();
  
  // Get featured products (those with highest ratings)
  const featuredProducts = [...products]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);
  
  // Get new arrivals (for demo purposes, just using a subset)
  const newArrivals = products.slice(4, 8);
  
  return (
    <div>
      <Hero />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <RecommendationSection />
        
        {!isLoading && (
          <>
            <ProductGrid 
              products={featuredProducts} 
              title="Featured Products" 
            />
            
            <ProductGrid 
              products={newArrivals} 
              title="New Arrivals" 
            />
          </>
        )}
        
        {isLoading && (
          <div className="my-8">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6 animate-pulse"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
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
        )}
      </div>
    </div>
  );
};

export default HomePage;