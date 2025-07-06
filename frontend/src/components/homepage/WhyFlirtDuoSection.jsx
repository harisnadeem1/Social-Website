import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Heart, Users, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const WhyFlirtDuoSection = () => {
  const features = [
    {
      icon: Shield,
      title: 'Privacy & Safety First',
      description: 'Your personal information is protected with bank-level security. We verify profiles to ensure authentic connections in a safe environment.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Users,
      title: 'Real Users, Real Stories',
      description: 'Join a community of genuine singles looking for meaningful relationships. No fake profiles, no games - just real people seeking love.',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Heart,
      title: 'Meaningful Relationships',
      description: 'Our advanced matching system connects you with compatible partners based on shared values, interests, and relationship goals.',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      icon: Star,
      title: 'Success Stories',
      description: 'Thousands of couples have found lasting love through Liebenly. Join our growing community of success stories and happy endings.',
      gradient: 'from-yellow-500 to-orange-500'
    }
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-pink-25 to-purple-25">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Why Choose Liebenly?
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We're more than just a dating app. We're your partner in finding genuine love and building lasting relationships that matter.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-8 lg:gap-10">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm group hover:scale-105">
                <CardContent className="p-8">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyFlirtDuoSection;