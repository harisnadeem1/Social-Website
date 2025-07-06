import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MobileMenu = ({ isOpen, onClose, onLogin, onSignUp }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 lg:hidden"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Liebenly
              </span>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <Button
                variant="ghost"
                onClick={() => {
                  onLogin();
                  onClose();
                }}
                className="w-full justify-start text-lg py-3 h-auto text-gray-700 hover:text-pink-600 hover:bg-pink-50"
              >
                Login
              </Button>
              
              <Button
                onClick={() => {
                  onSignUp();
                  onClose();
                }}
                className="w-full justify-start text-lg py-3 h-auto bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
              >
                Sign Up
              </Button>
              
              <Button
                onClick={() => {
                  onSignUp();
                  onClose();
                }}
                className="w-full justify-start text-lg py-3 h-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                Start Your Journey
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;