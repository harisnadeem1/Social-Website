import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HeroSection from '@/components/homepage/HeroSection';
import HowItWorksSection from '@/components/homepage/HowItWorksSection';
import WomenGallery from '@/components/homepage/WomenGallery';
import WhyFlirtDuoSection from '@/components/homepage/WhyFlirtDuoSection';
import LoginModal from '@/components/homepage/LoginModal';
import SignupModal from '@/components/homepage/SignupModal';
import CTASection from '@/components/homepage/CTASection';
import { Link } from 'react-router-dom';

const PublicHomepage = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

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
        <title>Liebenly - Find Real Connections Today</title>
        <meta name="description" content="Meet singles near you who are serious about finding love. Join Liebenly, the trusted dating platform where real connections happen in a safe and private environment." />
      </Helmet>

      {/* Transparent Header */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-transparent pt-4">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo - Centered on mobile, left on desktop */}
            <Link
              to="/"
              className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2 sm:relative sm:left-0 sm:translate-x-0"
            >
              {/* ✅ Slightly bigger but balanced logo box */}
              <div className="w-11 h-11 sm:w-10 sm:h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl sm:text-lg">L</span>
              </div>

              {/* ✅ Slightly enlarged text */}
              <span className="text-2xl sm:text-2xl font-bold text-white">Liebenly</span>
            </Link>


            {/* Desktop Buttons Only */}
            <div className="hidden sm:flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={handleLogin}
                className="text-white hover:text-pink-200 hover:bg-white/10 transition-colors px-5 py-2 font-medium"
              >
                Login
              </Button>
              <Button
                onClick={handleSignUp}
                className="bg-white text-pink-600 hover:bg-pink-50 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all px-6 py-2"
              >
                Sign Up Free
              </Button>
            </div>
          </div>
        </div>
      </header>

      <HeroSection onLogin={handleLogin} onSignUp={handleSignUp} />

      <WomenGallery onSignUp={handleSignUp} />




      <HowItWorksSection onSignUp={handleSignUp} />
      <WhyFlirtDuoSection />


      <CTASection handleSignUp={handleSignUp} />





     

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div className="lg:col-span-2">
              <Link
          to="/"
          className="flex items-center gap-2 sm:relative sm:left-0 sm:translate-x-0 mb-4"
        >
          <div className="w-11 h-11 sm:w-10 sm:h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl sm:text-lg">L</span>
          </div>
          <span className="text-2xl sm:text-2xl font-bold text-white">Liebenly</span>
        </Link>
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
          </div>
        </div>
      </footer>

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