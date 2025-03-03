import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import ProductGrid from './ProductGrid';
import { Product } from '../types';
import { recommendationEngine } from '../utils/recommendationEngine';
import { currentUser } from '../data/user';
import { useProducts } from '../context/ProductContext';

interface RecommendationSectionProps {
  title?: string;
  limit?: number;
}

const RecommendationSection: React.FC<RecommendationSectionProps> = ({ 
  title = "Recommended for You", 
  limit = 4 
}) => {
  const { products } = useProducts();
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const initializeRecommendations = async () => {
      if (!isMounted) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        if (products.length === 0) {
          throw new Error('No products available for recommendations');
        }
        
        // Get personalized recommendations
        // We don't need to wait for updateProducts here since it might be in progress
        // and the recommendation engine will use what it has available
        const recommendedProducts = recommendationEngine.getRecommendations(
          currentUser.preferences,
          currentUser.purchaseHistory.map(item => item.productId),
          limit
        );
        
        if (isMounted) {
          setRecommendations(recommendedProducts);
        }
      } catch (error) {
        console.error('Error initializing recommendations:', error);
        if (isMounted) {
          setError('Unable to generate personalized recommendations');
          
          // Fallback to showing highest rated products
          if (products.length > 0) {
            const fallbackRecommendations = [...products]
              .sort((a, b) => b.rating - a.rating)
              .slice(0, limit);
            setRecommendations(fallbackRecommendations);
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    if (products.length > 0) {
      initializeRecommendations();
    }
    
    return () => {
      isMounted = false;
    };
  }, [products, limit]);

  if (isLoading) {
    return (
      <div className="my-8">
        <div className="inline-flex items-center mb-6">
          <Sparkles className="h-6 w-6 text-orange-600 mr-2 animate-pulse" />
          <h2 className="text-2xl font-bold text-gray-800">
            Personalizing recommendations...
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(limit)].map((_, i) => (
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
    );
  }

  if (error && recommendations.length === 0) {
    return (
      <div className="my-8">
        <div className="flex items-center mb-6">
          <Sparkles className="h-6 w-6 text-orange-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        </div>
        <div className="bg-yellow-50 p-6 rounded-lg">
          <p className="text-yellow-800">
            {error}. Please try again later or browse our featured products below.
          </p>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="my-8">
      <div className="flex items-center mb-6">
        <Sparkles className="h-6 w-6 text-orange-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      </div>
      
      <div className="bg-orange-50 p-6 rounded-lg mb-6">
        <p className="text-orange-800">
          These recommendations are personalized based on your preferences and browsing history.
          Our AI-powered system continuously learns to provide better suggestions.
        </p>
      </div>
      
      <ProductGrid products={recommendations} />
    </div>
  );
};

export default RecommendationSection;