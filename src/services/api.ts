import axios from 'axios';
import { Product } from '../types';
import { products as fallbackProducts } from '../data/products';

// Create an axios instance for the Fake Store API
const fakeStoreApi = axios.create({
  baseURL: 'https://fakestoreapi.com',
  timeout: 10000, // 10 second timeout
});

// Transform the API response to match our Product type
const transformProduct = (apiProduct: any): Product => {
  return {
    id: apiProduct.id,
    name: apiProduct.title || 'Product',
    description: apiProduct.description || 'No description available',
    price: apiProduct.price || 0,
    category: apiProduct.category || 'uncategorized',
    image: apiProduct.image || 'https://via.placeholder.com/400',
    rating: apiProduct.rating?.rate || 4.0,
    features: generateFeatures(apiProduct.category || 'uncategorized', apiProduct.description || '')
  };
};

// Generate features based on category and description
const generateFeatures = (category: string, description: string): string[] => {
  const features: string[] = [];
  
  // Add category-specific features
  switch (category) {
    case 'electronics':
      features.push('High quality components', 'Energy efficient', '1-year warranty');
      break;
    case 'jewelery':
      features.push('Premium materials', 'Handcrafted', 'Elegant design');
      break;
    case "men's clothing":
    case "women's clothing":
      features.push('Comfortable fit', 'Durable fabric', 'Machine washable');
      break;
    default:
      features.push('High quality', 'Great value');
  }
  
  // Add a feature based on the description
  const descWords = description.split(' ');
  if (descWords.length > 10) {
    const randomIndex = Math.floor(Math.random() * (descWords.length - 5));
    const featurePhrase = descWords.slice(randomIndex, randomIndex + 5).join(' ');
    features.push(featurePhrase);
  }
  
  return features;
};

// API functions
export const productApi = {
  // Get all products
  getAllProducts: async (): Promise<Product[]> => {
    try {
      const response = await fakeStoreApi.get('/products');
      return response.data.map(transformProduct);
    } catch (error) {
      console.error('Error fetching products:', error);
      return fallbackProducts;
    }
  },
  
  // Get a single product by ID
  getProductById: async (id: number): Promise<Product | null> => {
    try {
      const response = await fakeStoreApi.get(`/products/${id}`);
      return transformProduct(response.data);
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      // Try to find the product in fallback data
      const fallbackProduct = fallbackProducts.find(p => p.id === id);
      return fallbackProduct || null;
    }
  },
  
  // Get products by category
  getProductsByCategory: async (category: string): Promise<Product[]> => {
    try {
      const response = await fakeStoreApi.get(`/products/category/${category}`);
      return response.data.map(transformProduct);
    } catch (error) {
      console.error(`Error fetching products in category ${category}:`, error);
      // Filter fallback products by category
      return fallbackProducts.filter(p => p.category === category);
    }
  },
  
  // Get all categories
  getCategories: async (): Promise<string[]> => {
    try {
      const response = await fakeStoreApi.get('/products/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Extract unique categories from fallback products
      return [...new Set(fallbackProducts.map(p => p.category))];
    }
  }
};