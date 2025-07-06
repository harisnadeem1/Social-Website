import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Shield, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const FeaturesSection = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-pink-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            Why Choose Liebenly?
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Experience dating like never before with our innovative features designed to help you find genuine connections.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <Card className="text-center p-6 sm:p-8 h-full border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Real Connections</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Our advanced matching algorithm connects you with people who share your values, interests, and relationship goals.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="text-center p-6 sm:p-8 h-full border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Safe & Private</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Your privacy and safety are our top priorities. Enjoy secure messaging and verified profiles in a trusted environment.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="sm:col-span-2 lg:col-span-1"
          >
            <Card className="text-center p-6 sm:p-8 h-full border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Boost Your Love Life</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Stand out with profile boosts, premium features, and personalized recommendations to maximize your dating success.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;