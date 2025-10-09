import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection = ({ onLogin, onSignUp }) => {
  return (
    <section className="relative overflow-hidden min-h-screen flex items-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <img
          className="hidden md:block w-full h-full object-cover opacity-60"
          alt="Happy couple laughing together in a romantic setting with soft lighting"
          src="/hero/Hero-background-desktop.jpeg"
        />
        <img
          className="block md:hidden w-full h-full object-cover opacity-60"
          alt="Happy couple on mobile background"
          src="/hero/Hero-background-mobile-3.jpeg"
        />



      </div>

      {/* Floating hearts animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 100,
              opacity: 0
            }}
            animate={{
              y: -100,
              opacity: [0, 0.6, 0],
              x: Math.random() * window.innerWidth
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: i * 2,
              ease: "linear"
            }}
          >
            <Heart className="text-pink-400/30" size={20 + Math.random() * 20} />
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center z-10 flex flex-col justify-end sm:justify-center min-h-screen pb-10 sm:pb-0">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-5xl mx-auto"
        >


          {/* Main headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="block"
            >
              Your Love Story
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="block bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]"
            >
              Starts Here
            </motion.span>
          </h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-xl sm:text-2xl md:text-3xl text-white mb-12 max-w-3xl mx-auto leading-relaxed font-bold"
          >
            Connect with verified singles who share your values and are ready for something real.
          </motion.p>


          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
           <Button
  size="lg"
  onClick={onSignUp}
  className="group w-full sm:w-auto bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 hover:from-pink-600 hover:via-purple-600 hover:to-pink-600 text-white text-base sm:text-lg px-6 sm:px-10 py-4 sm:py-6 h-auto rounded-full shadow-lg sm:shadow-2xl shadow-pink-500/40 hover:shadow-pink-500/60 transition-all duration-500 transform hover:scale-105 border border-white/20 font-semibold bg-[length:200%_auto] hover:bg-right uppercase"
>
  Start Your Journey
  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
</Button>

<Button
  size="lg"
  variant="outline"
  onClick={onLogin}
  className="w-full sm:w-auto border border-white/30 text-white hover:bg-white hover:text-purple-600 text-base sm:text-lg px-6 sm:px-10 py-4 sm:py-6 h-auto rounded-full backdrop-blur-xl bg-white/10 hover:bg-white transition-all duration-300 transform hover:scale-105 font-semibold shadow-md sm:shadow-lg uppercase"
>
  Sign In
</Button>


          </motion.div>


        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent"></div>

      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;