import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import RecommendationsPage from './pages/RecommendationsPage';
import SearchPage from './pages/SearchPage';
import { recommendationEngine } from './utils/recommendationEngine';

function App() {
  // Initialize recommendation engine when app loads
  useEffect(() => {
    const initializeAI = async () => {
      try {
        await recommendationEngine.initialize();
        console.log('AI recommendation engine initialized');
      } catch (error) {
        console.error('Failed to initialize AI recommendation engine:', error);
      }
    };
    
    initializeAI();
  }, []);

  return (
    <ProductProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/recommendations" element={<RecommendationsPage />} />
                <Route path="/search" element={<SearchPage />} />
              </Routes>
            </main>
            <footer className="bg-gray-800 text-white py-8">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">AI Shop</h3>
                    <p className="text-gray-400">
                      Personalized shopping experience powered by artificial intelligence.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                    <ul className="space-y-2">
                      <li><a href="/" className="text-gray-400 hover:text-white">Home</a></li>
                      <li><a href="/products" className="text-gray-400 hover:text-white">Products</a></li>
                      <li><a href="/recommendations" className="text-gray-400 hover:text-white">Recommendations</a></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Contact</h3>
                    <p className="text-gray-400">
                      Email: support@aishop.example.com<br />
                      Phone: (123) 456-7890
                    </p>
                  </div>
                </div>
                <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                  <p>© 2025 AI Shop. All rights reserved.</p>
                </div>
              </div>
            </footer>
          </div>
        </Router>
      </CartProvider>
    </ProductProvider>
  );
}

export default App;