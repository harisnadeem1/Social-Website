import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CTASection = ({ handleSignUp }) => {
  const womenProfiles = [
    {
      id: 1,
      name: 'Kaye',
      Image: 'https://res.cloudinary.com/dt6smpghz/image/upload/v1757636432/blob_ukie3z.png',
    },
    {
      id: 2,
      name: 'Ramona',
      Image: 'https://res.cloudinary.com/dt6smpghz/image/upload/v1757636714/blob_vnceyh.png',
    },
    {
      id: 3,
      name: 'Patty',
      Image: 'https://res.cloudinary.com/dt6smpghz/image/upload/v1754174738/blob_u9jj4k.jpg',
    },
    {
      id: 4,
      name: 'Martina',
      Image: 'https://res.cloudinary.com/dt6smpghz/image/upload/v1757362465/blob_frlibl.jpg',
    },
    {
      id: 5,
      name: 'Lila',
      Image: 'https://res.cloudinary.com/dt6smpghz/image/upload/v1757610840/blob_auf647.png',
    }
  ];

  return (
    <section className="relative py-20 sm:py-28 lg:py-32 overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-pink-200/40 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating hearts */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{ 
              x: Math.random() * 100 + '%',
              y: '110%',
              opacity: 0 
            }}
            animate={{ 
              y: '-10%',
              opacity: [0, 0.3, 0],
            }}
            transition={{ 
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: i * 1.5,
              ease: "linear"
            }}
          >
            <Heart className="text-pink-400/30" size={15 + Math.random() * 20} />
          </motion.div>
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          {/* Main CTA Card */}
          <div className="relative bg-white rounded-[3rem] shadow-2xl border border-gray-200 overflow-hidden">
            {/* Decorative gradients */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-pink-200/50 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-purple-200/50 to-transparent rounded-full blur-3xl"></div>
            
            {/* Content */}
            <div className="relative px-6 sm:px-12 lg:px-16 py-12 sm:py-16 text-center">
              {/* Headline */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight"
              >
                Ready to Find
                <span className="block bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Your Perfect Match?
                </span>
              </motion.h2>
              
              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-base sm:text-lg md:text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto"
              >
                Join thousands of singles finding love on Liebenly. Your story starts with a single click.
              </motion.p>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
                className="mb-10"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    onClick={handleSignUp}
                    className="group relative overflow-hidden bg-gradient-to-r from-pink-500 via-purple-600 to-pink-500 hover:from-pink-600 hover:via-purple-700 hover:to-pink-600 text-white text-lg sm:text-xl px-10 sm:px-14 py-5 sm:py-7 h-auto rounded-2xl shadow-2xl hover:shadow-pink-500/50 transition-all duration-500 bg-[length:200%_auto] hover:bg-right font-semibold"
                  >
                    <span className="relative z-10 flex items-center gap-2 sm:gap-3">
                      <Heart className="w-5 h-5 sm:w-6 sm:h-6 group-hover:fill-current transition-all" />
                      Join Liebenly Now
                      <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                  </Button>
                </motion.div>
              </motion.div>

              {/* Social proof with real images */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                viewport={{ once: true }}
                className="flex flex-col items-center justify-center gap-4"
              >
                {/* Profile images with real photos */}
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-3">
                    {womenProfiles.map((profile) => (
                      <motion.div
                        key={profile.id}
                        whileHover={{ scale: 1.1, zIndex: 10 }}
                        className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full border-4 border-white shadow-lg overflow-hidden"
                      >
                        <img
                          src={profile.Image}
                          alt={profile.name}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    ))}
                  </div>
                  <div className="text-left">
                    <div className="flex gap-0.5 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-sm text-gray-700 font-medium">
                      10,000+ joined this week
                    </p>
                  </div>
                </div>

                {/* Trust indicators - simplified */}
                <div className="flex flex-wrap justify-center items-center gap-4 text-xs sm:text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="font-medium">Free to Join</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="font-medium">100% Verified</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <span className="font-medium">2M+ Couples</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-pink-200/50 to-transparent rounded-br-full"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-purple-200/50 to-transparent rounded-tl-full"></div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
};

export default CTASection;