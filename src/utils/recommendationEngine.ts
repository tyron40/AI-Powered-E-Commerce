import * as tf from '@tensorflow/tfjs';
import { Product } from '../types';
import { products as fallbackProducts } from '../data/products';

// Enhanced feature extraction with more sophisticated techniques
export const extractFeatures = (product: Product, categories: string[]): number[] => {
  try {
    // One-hot encoding for category
    const categoryOneHot = categories.map(cat => {
      // Handle potential subcategories (e.g., "men's clothing" should match "clothing")
      if (product.category.includes(cat) || cat.includes(product.category)) {
        return 1;
      }
      return 0;
    });
    
    // Normalize price (0-1 range) with logarithmic scaling for better distribution
    const normalizedPrice = Math.min(Math.log(product.price + 1) / Math.log(1001), 1);
    
    // Normalize rating (0-1 range)
    const normalizedRating = Math.min(product.rating / 5, 1);
    
    // Text-based features (enhanced)
    // Extract word count as a feature
    const descriptionLength = Math.min(product.description.split(' ').length / 100, 1);
    
    // Feature for product name length (might indicate complexity/specificity)
    const nameLength = Math.min(product.name.length / 50, 1);
    
    // Feature for number of product features (indicates product richness)
    const featureCount = Math.min(product.features.length / 10, 1);
    
    // Combine all features
    return [
      normalizedPrice, 
      normalizedRating, 
      descriptionLength,
      nameLength,
      featureCount,
      ...categoryOneHot
    ];
  } catch (error) {
    console.error('Error extracting features:', error);
    // Return a safe fallback with zeros for category one-hot encoding
    return [0, 0, 0, 0, 0, ...Array(categories.length).fill(0)];
  }
};

// Text similarity function for content-based filtering
const calculateTextSimilarity = (text1: string, text2: string): number => {
  if (!text1 || !text2) return 0;
  
  try {
    // Convert to lowercase and split into words
    const words1 = text1.toLowerCase().split(/\W+/).filter(word => word.length > 2);
    const words2 = text2.toLowerCase().split(/\W+/).filter(word => word.length > 2);
    
    // Create sets for faster lookup
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    
    // Calculate Jaccard similarity: intersection size / union size
    const intersection = new Set([...set1].filter(word => set2.has(word)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / (union.size || 1); // Avoid division by zero
  } catch (error) {
    console.error('Error calculating text similarity:', error);
    return 0;
  }
};

// Enhanced recommendation engine with multiple recommendation strategies
export class RecommendationEngine {
  private model: tf.Sequential | null = null;
  private products: Product[] = [];
  private categories: string[] = [];
  private isInitialized: boolean = false;
  private isTraining: boolean = false;
  private productEmbeddings: Map<number, number[]> = new Map();
  private similarityMatrix: Map<number, Map<number, number>> = new Map();
  
  async initialize(products?: Product[]): Promise<void> {
    try {
      // Prevent multiple initializations running at once
      if (this.isInitialized || this.isTraining) {
        console.log('Recommendation engine already initialized or training in progress');
        return;
      }
      
      this.isTraining = true;
      
      // Use provided products or fallback to static data
      this.products = products || fallbackProducts;
      
      if (this.products.length === 0) {
        throw new Error('No products available for recommendation engine');
      }
      
      // Extract unique categories
      this.categories = [...new Set(this.products.map(p => p.category))];
      
      // Create a more sophisticated model for collaborative filtering
      this.model = tf.sequential();
      
      // Input shape is the number of features we extract from products
      const sampleFeatures = extractFeatures(this.products[0], this.categories);
      const featureSize = sampleFeatures.length;
      
      // Add layers with proper error handling
      try {
        // Deeper network with dropout for regularization
        this.model.add(tf.layers.dense({
          units: 32,
          activation: 'relu',
          inputShape: [featureSize],
          kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
        }));
        
        this.model.add(tf.layers.dropout({ rate: 0.2 }));
        
        this.model.add(tf.layers.dense({
          units: 16,
          activation: 'relu',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
        }));
        
        this.model.add(tf.layers.dropout({ rate: 0.2 }));
        
        this.model.add(tf.layers.dense({
          units: 8,
          activation: 'relu'
        }));
        
        this.model.add(tf.layers.dense({
          units: 1,
          activation: 'sigmoid'
        }));
        
        // Use Adam optimizer with custom learning rate
        const optimizer = tf.train.adam(0.001);
        
        this.model.compile({
          optimizer,
          loss: 'binaryCrossentropy',
          metrics: ['accuracy']
        });
      } catch (error) {
        console.error('Error creating TensorFlow model:', error);
        // Create a simpler model as fallback
        this.createFallbackModel(featureSize);
      }
      
      // Precompute product embeddings and similarity matrix
      this.computeProductEmbeddings();
      this.computeSimilarityMatrix();
      
      // Train with product data
      await this.trainModel();
      
      this.isInitialized = true;
      this.isTraining = false;
      console.log('Enhanced AI recommendation engine initialized with', this.products.length, 'products');
    } catch (error) {
      console.error('Error initializing recommendation engine:', error);
      // Set initialized to true anyway to prevent repeated initialization attempts
      this.isInitialized = true;
      this.isTraining = false;
    }
  }
  
  private createFallbackModel(featureSize: number): void {
    try {
      // Create a simpler model with fewer layers as fallback
      this.model = tf.sequential();
      this.model.add(tf.layers.dense({
        units: 8,
        activation: 'relu',
        inputShape: [featureSize]
      }));
      this.model.add(tf.layers.dense({
        units: 4,
        activation: 'relu'
      }));
      this.model.add(tf.layers.dense({
        units: 1,
        activation: 'sigmoid'
      }));
      this.model.compile({
        optimizer: 'sgd',
        loss: 'binaryCrossentropy'
      });
    } catch (error) {
      console.error('Error creating fallback model:', error);
      this.model = null;
    }
  }
  
  // Precompute product embeddings for faster similarity calculations
  private computeProductEmbeddings(): void {
    try {
      this.products.forEach(product => {
        const features = extractFeatures(product, this.categories);
        this.productEmbeddings.set(product.id, features);
      });
    } catch (error) {
      console.error('Error computing product embeddings:', error);
    }
  }
  
  // Precompute similarity matrix for content-based filtering
  private computeSimilarityMatrix(): void {
    try {
      // For each product, compute similarity to all other products
      this.products.forEach(product1 => {
        const similarities = new Map<number, number>();
        
        this.products.forEach(product2 => {
          if (product1.id === product2.id) {
            similarities.set(product2.id, 1); // Self-similarity is 1
            return;
          }
          
          // Calculate similarity based on multiple factors
          
          // 1. Category similarity (same category = higher similarity)
          const categorySimilarity = product1.category === product2.category ? 1 : 0;
          
          // 2. Price similarity (closer prices = higher similarity)
          const priceDiff = Math.abs(product1.price - product2.price);
          const maxPrice = Math.max(product1.price, product2.price);
          const priceSimilarity = 1 - (priceDiff / (maxPrice || 1));
          
          // 3. Rating similarity
          const ratingSimilarity = 1 - (Math.abs(product1.rating - product2.rating) / 5);
          
          // 4. Text similarity (description)
          const descriptionSimilarity = calculateTextSimilarity(
            product1.description,
            product2.description
          );
          
          // 5. Feature similarity
          const featureSimilarity = calculateTextSimilarity(
            product1.features.join(' '),
            product2.features.join(' ')
          );
          
          // Weighted combination of similarities
          const combinedSimilarity = (
            categorySimilarity * 0.4 +
            priceSimilarity * 0.1 +
            ratingSimilarity * 0.1 +
            descriptionSimilarity * 0.2 +
            featureSimilarity * 0.2
          );
          
          similarities.set(product2.id, combinedSimilarity);
        });
        
        this.similarityMatrix.set(product1.id, similarities);
      });
    } catch (error) {
      console.error('Error computing similarity matrix:', error);
    }
  }
  
  private async trainModel(): Promise<void> {
    if (!this.model || this.products.length === 0) return;
    
    try {
      // Extract features from all products
      const allFeatures = this.products.map(p => {
        const features = this.productEmbeddings.get(p.id);
        return features || extractFeatures(p, this.categories);
      });
      
      // Create training labels based on product ratings
      // Higher rated products are more likely to be recommended
      const labels = this.products.map(p => {
        // Convert rating to a probability (0-1)
        return Math.min(p.rating / 5, 1);
      });
      
      // Verify data integrity before creating tensors
      if (allFeatures.some(f => f.some(isNaN)) || labels.some(isNaN)) {
        throw new Error('Invalid feature or label data contains NaN values');
      }
      
      // Create tensors outside of tidy
      const xs = tf.tensor2d(allFeatures);
      const ys = tf.tensor1d(labels);
      
      try {
        // Train the model with early stopping to prevent overfitting
        await this.model.fit(xs, ys, {
          epochs: 50,
          batchSize: Math.min(8, this.products.length),
          shuffle: true,
          validationSplit: 0.2,
          callbacks: {
            onEpochEnd: (epoch, logs) => {
              if (epoch % 10 === 0) {
                console.log(`Epoch ${epoch}: loss = ${logs?.loss?.toFixed(4)}, accuracy = ${logs?.acc?.toFixed(4)}`);
              }
            }
          },
          verbose: 0
        });
        
        console.log('Model training completed successfully');
      } catch (error) {
        console.error('Error during model training:', error);
      } finally {
        // Clean up tensors
        xs.dispose();
        ys.dispose();
      }
    } catch (error) {
      console.error('Error training model:', error);
    }
  }
  
  // Update the model with new products
  async updateProducts(newProducts: Product[]): Promise<void> {
    try {
      // Prevent updates during training
      if (this.isTraining) {
        console.log('Training in progress, update skipped');
        return;
      }
      
      if (!newProducts || newProducts.length === 0) {
        console.warn('No products provided to update recommendation engine');
        return;
      }
      
      this.isTraining = true;
      this.products = newProducts;
      this.categories = [...new Set(this.products.map(p => p.category))];
      
      // Recompute embeddings and similarity matrix
      this.computeProductEmbeddings();
      this.computeSimilarityMatrix();
      
      // Retrain the model with new data
      if (this.model) {
        await this.trainModel();
      } else {
        await this.initialize(newProducts);
      }
      this.isTraining = false;
    } catch (error) {
      console.error('Error updating products in recommendation engine:', error);
      this.isTraining = false;
    }
  }
  
  // Enhanced recommendation method using ensemble approach
  getRecommendations(
    userPreferences: string[],
    purchasedProductIds: number[],
    limit: number = 4
  ): Product[] {
    try {
      // If model isn't ready or we're training, use fallback
      if (!this.model || this.isTraining || this.products.length === 0) {
        return this.getFallbackRecommendations(limit);
      }
      
      // Filter out products the user has already purchased
      const candidateProducts = this.products.filter(p => !purchasedProductIds.includes(p.id));
      
      if (candidateProducts.length === 0) {
        return this.getFallbackRecommendations(limit);
      }
      
      // 1. Get model-based recommendations
      const modelRecommendations = this.getModelBasedRecommendations(candidateProducts, userPreferences);
      
      // 2. Get content-based recommendations
      const contentRecommendations = this.getContentBasedRecommendations(
        purchasedProductIds,
        candidateProducts
      );
      
      // 3. Get popularity-based recommendations
      const popularityRecommendations = this.getPopularityBasedRecommendations(candidateProducts);
      
      // Combine recommendations using a weighted ensemble approach
      const allRecommendations = new Map<number, { product: Product, score: number }>();
      
      // Add model-based recommendations with highest weight
      modelRecommendations.forEach((rec, index) => {
        const position = index + 1;
        const score = (modelRecommendations.length - position + 1) / modelRecommendations.length * 0.6;
        allRecommendations.set(rec.id, { product: rec, score });
      });
      
      // Add content-based recommendations
      contentRecommendations.forEach((rec, index) => {
        const position = index + 1;
        const score = (contentRecommendations.length - position + 1) / contentRecommendations.length * 0.3;
        
        if (allRecommendations.has(rec.id)) {
          const existing = allRecommendations.get(rec.id)!;
          existing.score += score;
        } else {
          allRecommendations.set(rec.id, { product: rec, score });
        }
      });
      
      // Add popularity-based recommendations
      popularityRecommendations.forEach((rec, index) => {
        const position = index + 1;
        const score = (popularityRecommendations.length - position + 1) / popularityRecommendations.length * 0.1;
        
        if (allRecommendations.has(rec.id)) {
          const existing = allRecommendations.get(rec.id)!;
          existing.score += score;
        } else {
          allRecommendations.set(rec.id, { product: rec, score });
        }
      });
      
      // Sort by combined score
      const sortedRecommendations = Array.from(allRecommendations.values())
        .sort((a, b) => b.score - a.score)
        .map(item => item.product);
      
      // Return top N recommendations
      return sortedRecommendations.slice(0, limit);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return this.getFallbackRecommendations(limit);
    }
  }
  
  // Get recommendations using the trained model
  private getModelBasedRecommendations(
    candidateProducts: Product[],
    userPreferences: string[]
  ): Product[] {
    try {
      // Extract features for all candidate products
      const features = candidateProducts.map(p => {
        const cachedFeatures = this.productEmbeddings.get(p.id);
        return cachedFeatures || extractFeatures(p, this.categories);
      });
      
      // Create tensor
      const featureTensor = tf.tensor2d(features);
      
      // Make predictions
      let predictionValues: Float32Array;
      
      try {
        const predictions = this.model!.predict(featureTensor) as tf.Tensor;
        predictionValues = predictions.dataSync() as Float32Array;
        
        // Clean up tensors
        predictions.dispose();
      } catch (error) {
        console.error('Error making predictions:', error);
        featureTensor.dispose();
        return [];
      } finally {
        featureTensor.dispose();
      }
      
      // Create array of [product, score] pairs
      const scoredProducts = candidateProducts.map((product, i) => {
        // Calculate preference boost based on category match
        const preferenceBoost = userPreferences.some(pref => 
          product.category.includes(pref) || pref.includes(product.category)
        ) ? 0.2 : 0;
        
        // Calculate recency boost (newer products get a small boost)
        const recencyBoost = 0.1; // In a real system, this would be based on product age
        
        return {
          product,
          score: (predictionValues[i] || 0) + preferenceBoost + recencyBoost
        };
      });
      
      // Sort by score
      scoredProducts.sort((a, b) => b.score - a.score);
      
      // Return products
      return scoredProducts.map(sp => sp.product);
    } catch (error) {
      console.error('Error getting model-based recommendations:', error);
      return [];
    }
  }
  
  // Get recommendations based on content similarity to purchased products
  private getContentBasedRecommendations(
    purchasedProductIds: number[],
    candidateProducts: Product[]
  ): Product[] {
    try {
      if (purchasedProductIds.length === 0) {
        return [];
      }
      
      // For each candidate product, calculate similarity to purchased products
      const productScores = candidateProducts.map(candidate => {
        let totalSimilarity = 0;
        let count = 0;
        
        // Sum similarities to all purchased products
        purchasedProductIds.forEach(purchasedId => {
          const similarityMap = this.similarityMatrix.get(purchasedId);
          if (similarityMap) {
            const similarity = similarityMap.get(candidate.id) || 0;
            totalSimilarity += similarity;
            count++;
          }
        });
        
        // Calculate average similarity
        const avgSimilarity = count > 0 ? totalSimilarity / count : 0;
        
        return {
          product: candidate,
          score: avgSimilarity
        };
      });
      
      // Sort by similarity score
      productScores.sort((a, b) => b.score - a.score);
      
      // Return products
      return productScores.map(ps => ps.product);
    } catch (error) {
      console.error('Error getting content-based recommendations:', error);
      return [];
    }
  }
  
  // Get recommendations based on popularity (rating and views)
  private getPopularityBasedRecommendations(candidateProducts: Product[]): Product[] {
    try {
      // Sort by rating
      return [...candidateProducts].sort((a, b) => b.rating - a.rating);
    } catch (error) {
      console.error('Error getting popularity-based recommendations:', error);
      return [];
    }
  }
  
  // Get similar products based on precomputed similarity matrix
  getSimilarProducts(product: Product, limit: number = 4): Product[] {
    try {
      const productId = product.id;
      const similarityMap = this.similarityMatrix.get(productId);
      
      if (!similarityMap) {
        // If product not in similarity matrix, compute similarities on the fly
        return this.computeSimilarProductsOnTheFly(product, limit);
      }
      
      // Get all products with their similarity scores
      const similarProducts = this.products
        .filter(p => p.id !== productId) // Exclude the reference product
        .map(p => ({
          product: p,
          similarity: similarityMap.get(p.id) || 0
        }));
      
      // Sort by similarity
      similarProducts.sort((a, b) => b.similarity - a.similarity);
      
      // Return top N similar products
      return similarProducts.slice(0, limit).map(sp => sp.product);
    } catch (error) {
      console.error('Error getting similar products:', error);
      return this.getRandomProducts(limit);
    }
  }
  
  // Compute similar products on the fly if not in precomputed matrix
  private computeSimilarProductsOnTheFly(product: Product, limit: number): Product[] {
    try {
      // Filter out the reference product itself
      const otherProducts = this.products.filter(p => p.id !== product.id);
      
      if (otherProducts.length === 0) {
        return [];
      }
      
      // Calculate similarities
      const similarities = otherProducts.map(p => {
        // 1. Category similarity
        const categorySimilarity = product.category === p.category ? 1 : 0;
        
        // 2. Price similarity
        const priceDiff = Math.abs(product.price - p.price);
        const maxPrice = Math.max(product.price, p.price);
        const priceSimilarity = 1 - (priceDiff / (maxPrice || 1));
        
        // 3. Rating similarity
        const ratingSimilarity = 1 - (Math.abs(product.rating - p.rating) / 5);
        
        // 4. Text similarity
        const descriptionSimilarity = calculateTextSimilarity(
          product.description,
          p.description
        );
        
        // 5. Feature similarity
        const featureSimilarity = calculateTextSimilarity(
          product.features.join(' '),
          p.features.join(' ')
        );
        
        // Weighted combination
        const combinedSimilarity = (
          categorySimilarity * 0.4 +
          priceSimilarity * 0.1 +
          ratingSimilarity * 0.1 +
          descriptionSimilarity * 0.2 +
          featureSimilarity * 0.2
        );
        
        return {
          product: p,
          similarity: combinedSimilarity
        };
      });
      
      // Sort by similarity
      similarities.sort((a, b) => b.similarity - a.similarity);
      
      // Return top N similar products
      return similarities.slice(0, limit).map(s => s.product);
    } catch (error) {
      console.error('Error computing similar products on the fly:', error);
      return this.getRandomProducts(limit);
    }
  }
  
  // Get trending products with enhanced algorithm
  getTrendingProducts(limit: number = 4): Product[] {
    try {
      if (this.products.length === 0) {
        return [];
      }
      
      // Create a copy of products to avoid modifying the original
      const productsCopy = [...this.products];
      
      // Calculate trending score based on multiple factors
      const trendingScores = productsCopy.map(p => {
        // Base score from rating
        let score = p.rating / 5;
        
        // Add a small random factor for variety (simulates view count/recency)
        const randomFactor = Math.random() * 0.2;
        
        // Boost for certain categories that might be trending
        const categoryBoost = ['electronics', 'clothing'].includes(p.category) ? 0.1 : 0;
        
        // Price factor - mid-range products get a small boost
        const priceNormalized = p.price / 1000; // Normalize to 0-1 range
        const priceFactor = priceNormalized > 0.2 && priceNormalized < 0.6 ? 0.1 : 0;
        
        return {
          product: p,
          score: score + randomFactor + categoryBoost + priceFactor
        };
      });
      
      // Sort by score
      trendingScores.sort((a, b) => b.score - a.score);
      
      // Return top N products
      return trendingScores.slice(0, limit).map(ts => ts.product);
    } catch (error) {
      console.error('Error getting trending products:', error);
      return this.getRandomProducts(limit);
    }
  }
  
  // Fallback method to get recommendations
  private getFallbackRecommendations(limit: number): Product[] {
    // First try to get highest rated products
    try {
      if (this.products.length === 0) {
        return [];
      }
      
      // Sort by rating
      const sortedProducts = [...this.products].sort((a, b) => b.rating - a.rating);
      return sortedProducts.slice(0, limit);
    } catch (error) {
      console.error('Error getting fallback recommendations:', error);
      return this.getRandomProducts(limit);
    }
  }
  
  // Get random products
  private getRandomProducts(limit: number): Product[] {
    try {
      if (this.products.length === 0) {
        return [];
      }
      
      const shuffled = [...this.products].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, Math.min(limit, shuffled.length));
    } catch (error) {
      console.error('Error getting random products:', error);
      return [];
    }
  }
  
  // Get recommendations for a specific category
  getRecommendationsByCategory(category: string, limit: number = 4): Product[] {
    try {
      // Filter products by category
      const categoryProducts = this.products.filter(p => 
        p.category === category || p.category.includes(category) || category.includes(p.category)
      );
      
      if (categoryProducts.length === 0) {
        return [];
      }
      
      // Sort by rating
      const sortedProducts = [...categoryProducts].sort((a, b) => b.rating - a.rating);
      return sortedProducts.slice(0, limit);
    } catch (error) {
      console.error('Error getting category recommendations:', error);
      return [];
    }
  }
  
  // Get personalized category recommendations
  getPersonalizedCategoryRecommendations(
    userPreferences: string[],
    limit: number = 4
  ): { category: string, products: Product[] }[] {
    try {
      const results: { category: string, products: Product[] }[] = [];
      
      // For each user preference, get top products
      for (const preference of userPreferences) {
        const products = this.getRecommendationsByCategory(preference, limit);
        
        if (products.length > 0) {
          results.push({
            category: preference,
            products
          });
        }
        
        // Limit to top 3 categories
        if (results.length >= 3) {
          break;
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error getting personalized category recommendations:', error);
      return [];
    }
  }
}

// Create a singleton instance
export const recommendationEngine = new RecommendationEngine();