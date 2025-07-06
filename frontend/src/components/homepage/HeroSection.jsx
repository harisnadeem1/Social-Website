import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection = ({ onLogin, onSignUp }) => {
  return (
    <section className="relative overflow-hidden min-h-[85vh] flex items-center">
      <div className="absolute inset-0">
  {/* Desktop Image */}
  <img
    className="hidden md:block w-full h-full object-cover"
    alt="Happy couple laughing together in a romantic setting with soft lighting"
    src="https://i.ibb.co/gLXf83ky/Copy-of-Untitled-9.jpg"
  />

  {/* Mobile Image */}
  <img
    className="block md:hidden w-full h-full object-cover"
    alt="Happy couple on mobile background"
    src="https://i.ibb.co/FLjvCNf7/photo-1605381942640-0a262ce59788.jpg"
  />

  <div className="absolute inset-0 bg-gradient-to-r from-pink-900/60 via-purple-900/40 to-pink-900/60"></div>
</div>

      
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Find Real Connections
            <span className="block bg-gradient-to-r from-pink-200 to-purple-200 bg-clip-text text-transparent">
              on Liebenly
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl md:text-3xl text-white/95 mb-8 max-w-3xl mx-auto leading-relaxed">
            Meet singles near you who are serious about finding love.
          </p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button 
              size="lg"
              onClick={onSignUp}
              className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-xl px-8 py-4 h-auto shadow-2xl hover:shadow-pink-500/30 transition-all duration-300 transform hover:scale-105"
            >
              <Heart className="w-6 h-6 mr-2" />
              Start Your Journey
            </Button>
            
            <Button 
              size="lg"
              variant="outline"
              onClick={onLogin}
              className="w-full sm:w-auto border-2 border-white/90 text-white hover:bg-white hover:text-purple-600 text-xl px-8 py-4 h-auto backdrop-blur-sm bg-white/15 transition-all duration-300 transform hover:scale-105"
            >
              Already a Member?
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;