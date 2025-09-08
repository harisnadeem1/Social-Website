
import { Helmet } from 'react-helmet';
import { Heart, Menu, Facebook, Twitter, Instagram } from 'lucide-react';

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PublicHeader from './PublicHeader';
import MobileHeader from '../MobileHeader';
import { useEffect } from 'react';



const InfoPageLayout = ({ children, title, subtitle }) => {
  useEffect(() => {
  window.scrollTo(0, 0);
}, []);
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-grow">
      <PublicHeader />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-b from-pink-100 to-purple-100 py-16 sm:py-24"
        >
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-4 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        </motion.div>
        <div className="py-12 sm:py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-lg"
            >
              {children}
            </motion.div>
          </div>
        </div>
      </main>
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">Liebenly</span>
              </div>
              <p className="text-gray-400 max-w-md leading-relaxed">
                Where real connections happen. Join millions of singles finding love, friendship, and meaningful relationships.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>

              <div className="space-y-2 text-gray-400">
                <Link to="/about" className="block cursor-pointer hover:text-pink-400 transition-colors">
                  About Us
                </Link>
                <Link to="/contact" className="block cursor-pointer hover:text-pink-400 transition-colors">
                  Contact
                </Link>

              </div>

            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>

              <div className="space-y-2 text-gray-400">
                <Link to="/privacy-policy" className="block cursor-pointer hover:text-pink-400 transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/terms-and-conditions" className="block cursor-pointer hover:text-pink-400 transition-colors">
                  Terms & Conditions
                </Link>
                <Link to="/cookie-policy" className="block cursor-pointer hover:text-pink-400 transition-colors">
                  Cookie Policy
                </Link>
                <Link to="/safety-tips" className="block cursor-pointer hover:text-pink-400 transition-colors">
                  Safety Tips
                </Link>
                <Link to="/data-deletion" className="block cursor-pointer hover:text-pink-400 transition-colors">
                  Data Deletion Policy
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2024 Liebenly. All rights reserved.
            </p>

            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-gray-800 hover:bg-pink-600 rounded-full flex items-center justify-center cursor-pointer transition-colors">
                <Facebook className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 bg-gray-800 hover:bg-pink-600 rounded-full flex items-center justify-center cursor-pointer transition-colors">
                <Twitter className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 bg-gray-800 hover:bg-pink-600 rounded-full flex items-center justify-center cursor-pointer transition-colors">
                <Instagram className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
    
  );
};

export default InfoPageLayout;
  