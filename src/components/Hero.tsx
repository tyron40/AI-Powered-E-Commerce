import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <div className="relative bg-orange-900 text-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-900 to-amber-800 opacity-90"></div>
        <img 
          src="https://images.unsplash.com/photo-1607082349566-187342175e2f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80" 
          alt="Shopping background" 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-orange-700 bg-opacity-50 backdrop-blur-sm mb-6">
          <Sparkles className="h-5 w-5 text-orange-300 mr-2" />
          <span className="text-sm font-medium text-orange-100">AI-Powered Shopping Experience</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
          Discover Products <span className="text-orange-300">Tailored for You</span>
        </h1>
        
        <p className="text-lg md:text-xl text-orange-100 max-w-3xl mb-8">
          Our AI-powered recommendation engine learns your preferences to suggest products you'll love. Experience shopping reimagined with personalized recommendations.
        </p>
        
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <Link 
            to="/products" 
            className="px-8 py-3 rounded-lg bg-white text-orange-900 font-semibold text-lg hover:bg-orange-50 transition-colors"
          >
            Browse Products
          </Link>
          <Link 
            to="/recommendations" 
            className="px-8 py-3 rounded-lg bg-orange-600 text-white font-semibold text-lg hover:bg-orange-700 transition-colors"
          >
            View Recommendations
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;