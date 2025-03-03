import React, { useEffect, useState } from 'react';
import { Sparkles, Brain, History, Tag, AlertCircle } from 'lucide-react';
import ProductGrid from '../components/ProductGrid';
import { Product } from '../types';
import { recommendationEngine } from '../utils/recommendationEngine';
import { currentUser } from '../data/user';
import { useProducts } from '../context/ProductContext';

const RecommendationsPage: React.FC = () => {
  const { products } = useProducts();
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState<Product[]>([]);
  const [categoryRecommendations, setCategoryRecommendations] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
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
        // We don't need to wait for updateProducts since it might be in progress
        const recommendedProducts = recommendationEngine.getRecommendations(
          currentUser.preferences,
          currentUser.purchaseHistory.map(item => item.productId),
          8
        );
        
        if (isMounted) {
          setPersonalizedRecommendations(recommendedProducts);
        }
        
        // Get category-based recommendations
        const preferredCategories = currentUser.preferences;
        const categoryProducts = products
          .filter(p => preferredCategories.some(cat => 
            p.category.includes(cat) || cat.includes(p.category)
          ))
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 4);
        
        if (isMounted) {
          setCategoryRecommendations(categoryProducts);
        }
        
        // Get trending products
        const trending = recommendationEngine.getTrendingProducts(4);
        
        if (isMounted) {
          setTrendingProducts(trending);
        }
      } catch (err) {
        console.error('Error initializing recommendations:', err);
        
        if (isMounted) {
          setError('Unable to generate personalized recommendations. Please try again later.');
          
          // Fallback to showing some products anyway
          if (products.length > 0) {
            // Sort by rating for fallback recommendations
            const sortedProducts = [...products].sort((a, b) => b.rating - a.rating);
            setPersonalizedRecommendations(sortedProducts.slice(0, 8));
            setTrendingProducts(sortedProducts.slice(0, 4));
            
            // Try to get category recommendations
            const preferredCategories = currentUser.preferences;
            const categoryProducts = products
              .filter(p => preferredCategories.some(cat => 
                p.category.includes(cat) || cat.includes(p.category)
              ))
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 4);
            
            setCategoryRecommendations(categoryProducts);
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
  }, [products]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="inline-flex items-center">
          <Sparkles className="h-6 w-6 text-orange-600 mr-2 animate-pulse" />
          <h1 className="text-3xl font-bold text-gray-900">
            Generating your personalized recommendations...
          </h1>
        </div>
        <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
          Our AI is analyzing your preferences and purchase history to find the perfect products for you.
          This may take a moment.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center mb-8">
        <Sparkles className="h-8 w-8 text-orange-600 mr-3" />
        <h1 className="text-3xl font-bold text-gray-900">Your Personalized Recommendations</h1>
      </div>
      
      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
            <p className="text-yellow-700">{error}</p>
          </div>
        </div>
      )}
      
      <div className="bg-orange-50 p-6 rounded-lg mb-12">
        <h2 className="text-xl font-semibold text-orange-900 mb-3">How Our AI Recommends Products</h2>
        <p className="text-orange-800 mb-4">
          Our recommendation engine uses machine learning to analyze your preferences, browsing history, and purchase patterns
          to suggest products you're likely to enjoy. The more you interact with our store, the better our recommendations become.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white p-4 rounded-lg flex items-start">
            <Brain className="h-6 w-6 text-orange-600 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-gray-900 mb-1">AI Learning</h3>
              <p className="text-sm text-gray-600">Our AI continuously learns from your interactions to improve recommendations.</p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg flex items-start">
            <History className="h-6 w-6 text-orange-600 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Purchase History</h3>
              <p className="text-sm text-gray-600">We analyze your past purchases to suggest complementary products.</p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg flex items-start">
            <Tag className="h-6 w-6 text-orange-600 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Category Preferences</h3>
              <p className="text-sm text-gray-600">Your preferred categories help us find products you'll love.</p>
            </div>
          </div>
        </div>
      </div>
      
      {personalizedRecommendations.length > 0 && (
        <div className="mb-16">
          <div className="flex items-center mb-6">
            <Sparkles className="h-6 w-6 text-orange-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-800">Personalized For You</h2>
          </div>
          <ProductGrid products={personalizedRecommendations} />
        </div>
      )}
      
      {categoryRecommendations.length > 0 && (
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Based on Your Preferred Categories
          </h2>
          <ProductGrid products={categoryRecommendations} />
        </div>
      )}
      
      {trendingProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Trending Products
          </h2>
          <ProductGrid products={trendingProducts} />
        </div>
      )}
    </div>
  );
};

export default RecommendationsPage;