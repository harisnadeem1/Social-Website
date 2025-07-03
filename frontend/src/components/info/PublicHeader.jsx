
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PublicHeader = () => {
  return (
    <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-50 border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-2">
            <Heart className="w-8 h-8 text-pink-500" />
            <span className="text-2xl font-bold text-gray-800">Liebenly</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/about" className="text-gray-600 hover:text-pink-500 transition-colors">About</Link>
            <Link to="/contact" className="text-gray-600 hover:text-pink-500 transition-colors">Contact</Link>
          </nav>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link to="/">Login</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white">
              <Link to="/">Sign Up</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;
  