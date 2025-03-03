import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Share2, ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import ProductGrid from '../components/ProductGrid';
import { recommendationEngine } from '../utils/recommendationEngine';
import { productApi } from '../services/api';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { products } = useProducts();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    if (id) {
      const productId = parseInt(id);
      setIsLoading(true);
      setError(null);
      
      const fetchProduct = async () => {
        try {
          // Try to fetch from API first
          const apiProduct = await productApi.getProductById(productId);
          
          if (apiProduct && isMounted) {
            setProduct(apiProduct);
            
            // Get similar products
            try {
              const similar = recommendationEngine.getSimilarProducts(apiProduct, 4);
              if (isMounted) {
                setSimilarProducts(similar);
              }
            } catch (err) {
              console.error('Error getting similar products:', err);
              // Fallback to showing random products
              if (isMounted && products.length > 0) {
                const randomProducts = [...products]
                  .filter(p => p.id !== productId)
                  .sort(() => 0.5 - Math.random())
                  .slice(0, 4);
                setSimilarProducts(randomProducts);
              }
            }
          } else {
            // Fallback to local products
            const localProduct = products.find(p => p.id === productId);
            
            if (localProduct && isMounted) {
              setProduct(localProduct);
              
              // Get similar products
              try {
                const similar = recommendationEngine.getSimilarProducts(localProduct, 4);
                if (isMounted) {
                  setSimilarProducts(similar);
                }
              } catch (err) {
                console.error('Error getting similar products:', err);
                // Fallback to showing random products
                if (isMounted && products.length > 0) {
                  const randomProducts = [...products]
                    .filter(p => p.id !== productId)
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 4);
                  setSimilarProducts(randomProducts);
                }
              }
            } else if (isMounted) {
              setError('Product not found');
            }
          }
        } catch (err) {
          console.error('Error fetching product:', err);
          if (isMounted) {
            setError('Failed to load product details');
            
            // Try fallback
            const localProduct = products.find(p => p.id === productId);
            if (localProduct) {
              setProduct(localProduct);
              try {
                const similar = recommendationEngine.getSimilarProducts(localProduct, 4);
                setSimilarProducts(similar);
              } catch (error) {
                console.error('Error getting similar products:', error);
                // Fallback to showing random products
                if (products.length > 0) {
                  const randomProducts = [...products]
                    .filter(p => p.id !== productId)
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 4);
                  setSimilarProducts(randomProducts);
                }
              }
            }
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };
      
      fetchProduct();
    }
    
    return () => {
      isMounted = false;
    };
  }, [id, products]);

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/6 mb-6"></div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2">
                <div className="h-96 bg-gray-300"></div>
              </div>
              <div className="md:w-1/2 p-8 space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 inline-block text-left">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-700">{error || 'Product not found'}</p>
          </div>
        </div>
        <Link to="/products" className="text-orange-600 hover:text-orange-800 mt-4 inline-block">
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/products" className="flex items-center text-orange-600 hover:text-orange-800 mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to products
      </Link>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          {/* Product Image */}
          <div className="md:w-1/2">
            <div className="h-96 md:h-full overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-contain p-4"
              />
            </div>
          </div>
          
          {/* Product Details */}
          <div className="md:w-1/2 p-8">
            <div className="mb-2">
              <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full uppercase tracking-wide font-semibold">
                {product.category}
              </span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            
            <div className="flex items-center mb-4">
              <div className="flex items-center text-yellow-500">
                <Star className="h-5 w-5 fill-current" />
                <span className="ml-1 text-sm font-medium">{product.rating.toFixed(1)}</span>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">{product.description}</p>
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Features</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {product.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
            
            <div className="mb-6">
              <span className="text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
            </div>
            
            <div className="flex items-center mb-6">
              <label htmlFor="quantity" className="mr-4 text-gray-700 font-medium">
                Quantity
              </label>
              <div className="flex items-center border border-gray-300 rounded-md">
                <button
                  type="button"
                  className="px-3 py-1 text-gray-600 hover:text-gray-900"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-12 text-center border-0 focus:ring-0"
                />
                <button
                  type="button"
                  className="px-3 py-1 text-gray-600 hover:text-gray-900"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-orange-600 text-white py-3 px-6 rounded-md font-medium hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 flex items-center justify-center"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </button>
              
              <button className="flex-1 sm:flex-none border border-gray-300 text-gray-700 py-3 px-6 rounded-md font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center">
                <Heart className="h-5 w-5 mr-2" />
                Wishlist
              </button>
              
              <button className="flex-1 sm:flex-none border border-gray-300 text-gray-700 py-3 px-6 rounded-md font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center">
                <Share2 className="h-5 w-5 mr-2" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Similar Products Section */}
      {similarProducts.length > 0 && (
        <div className="my-12">
          <div className="flex items-center mb-6">
            <Sparkles className="h-6 w-6 text-orange-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-800">You May Also Like</h2>
          </div>
          <ProductGrid products={similarProducts} />
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;