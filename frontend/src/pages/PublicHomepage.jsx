import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Heart, Menu, Facebook, Twitter, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HeroSection from '@/components/homepage/HeroSection';
import HowItWorksSection from '@/components/homepage/HowItWorksSection';
import WomenGallery from '@/components/homepage/WomenGallery';
import WhyFlirtDuoSection from '@/components/homepage/WhyFlirtDuoSection';
import LoginModal from '@/components/homepage/LoginModal';
import SignupModal from '@/components/homepage/SignupModal';
import MobileMenu from '@/components/homepage/MobileMenu';

const PublicHomepage = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogin = () => {
    setShowLoginModal(true);
  };

  const handleSignUp = () => {
    setShowSignupModal(true);
  };

  const switchToSignup = () => {
    setShowLoginModal(false);
    setShowSignupModal(true);
  };

  const switchToLogin = () => {
    setShowSignupModal(false);
    setShowLoginModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-25 via-white to-purple-25">
      <Helmet>
        <title>FlirtDuo - Find Real Connections Today</title>
        <meta name="description" content="Meet singles near you who are serious about finding love. Join FlirtDuo, the trusted dating platform where real connections happen in a safe and private environment." />
      </Helmet>

      <header className="sticky top-0 z-40 w-full border-b border-pink-100 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              FlirtDuo
            </span>
          </div>
          
          <div className="hidden lg:flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={handleLogin}
              className="text-gray-700 hover:text-pink-600 hover:bg-pink-50 transition-colors px-6 py-2"
            >
              Login
            </Button>
            <Button 
              onClick={handleSignUp}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-2"
            >
              Sign Up
            </Button>
            <Button 
              onClick={handleSignUp}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-2"
            >
              Start Your Journey
            </Button>
          </div>

          <button
            onClick={() => setShowMobileMenu(true)}
            className="lg:hidden p-2 hover:bg-pink-50 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </header>

      <HeroSection onLogin={handleLogin} onSignUp={handleSignUp} />
      
      <HowItWorksSection />
      
      <WomenGallery onSignUp={handleSignUp} />
      
      <WhyFlirtDuoSection />

      <section className="py-16 sm:py-20 bg-gradient-to-r from-pink-500 via-purple-600 to-pink-500">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 text-center text-white">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-3"
            >
              <div className="text-4xl sm:text-5xl font-bold">2M+</div>
              <div className="text-xl text-pink-100">Happy Couples</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              className="space-y-3"
            >
              <div className="text-4xl sm:text-5xl font-bold">10M+</div>
              <div className="text-xl text-pink-100">Active Members</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-3 sm:col-span-2 lg:col-span-1"
            >
              <div className="text-4xl sm:text-5xl font-bold">95%</div>
              <div className="text-xl text-pink-100">Success Rate</div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Ready to Find Love?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
              Join thousands of singles who have found their perfect match on FlirtDuo. Your love story starts here.
            </p>
            
            <Button 
              size="lg"
              onClick={handleSignUp}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-xl px-12 py-4 h-auto shadow-2xl hover:shadow-pink-500/30 transition-all duration-300 transform hover:scale-105"
            >
              <Heart className="w-6 h-6 mr-2" />
              Join FlirtDuo Now
            </Button>
          </motion.div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">FlirtDuo</span>
              </div>
              <p className="text-gray-400 max-w-md leading-relaxed">
                Where real connections happen. Join millions of singles finding love, friendship, and meaningful relationships.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <div className="space-y-2 text-gray-400">
                <p className="cursor-pointer hover:text-pink-400 transition-colors">About Us</p>
                <p className="cursor-pointer hover:text-pink-400 transition-colors">Contact</p>
                <p className="cursor-pointer hover:text-pink-400 transition-colors">Careers</p>
                <p className="cursor-pointer hover:text-pink-400 transition-colors">Blog</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <div className="space-y-2 text-gray-400">
                <p className="cursor-pointer hover:text-pink-400 transition-colors">Privacy Policy</p>
                <p className="cursor-pointer hover:text-pink-400 transition-colors">Terms & Conditions</p>
                <p className="cursor-pointer hover:text-pink-400 transition-colors">Cookie Policy</p>
                <p className="cursor-pointer hover:text-pink-400 transition-colors">Safety Tips</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2024 FlirtDuo. All rights reserved.
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

      <MobileMenu 
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        onLogin={handleLogin}
        onSignUp={handleSignUp}
      />

      <LoginModal 
        open={showLoginModal} 
        onOpenChange={setShowLoginModal}
        onSwitchToSignup={switchToSignup}
      />

      <SignupModal 
        open={showSignupModal} 
        onOpenChange={setShowSignupModal}
        onSwitchToLogin={switchToLogin}
      />
    </div>
  );
};

export default PublicHomepage;