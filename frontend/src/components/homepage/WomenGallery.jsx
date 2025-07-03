import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const WomenGallery = ({ onSignUp }) => {
  const womenProfiles = [
    {
      id: 1,
      name: 'Emma',
      age: 28,
      Image:'https://i.ibb.co/zVDSG611/profile.jpg',
      description: 'Beautiful young woman with blonde hair smiling outdoors in natural lighting'
    },
    {
      id: 2,
      name: 'Sofia',
      age: 26,
      Image:'https://i.ibb.co/RTzz4r0C/profile.jpg',

      description: 'Latina woman with dark hair and warm smile in urban setting'
    },
    {
      id: 3,
      name: 'Aria',
      age: 27,
            Image:'https://i.ibb.co/dwc5r4nn/profile.jpg',

      description: 'Indian woman with long black hair, elegant and professional look'
    },
    {
      id: 4,
      name: 'Isabella',
      age: 25,
            Image:'https://i.ibb.co/7tLmZDhV/profile.jpg',

      description: 'Hispanic woman with curly hair and bright smile at the beach'
    },
    {
      id: 5,
      name: 'Chloe',
      age: 29,
            Image:'https://i.ibb.co/2Y1QTCvC/profile.jpg',

      description: 'Blonde woman with blue eyes in casual summer outfit'
    },
    {
      id: 6,
      name: 'Maya',
      age: 24,
            Image:'https://i.ibb.co/jvmDKCG5/singlefoto.jpg',

      description: 'Asian woman with stylish haircut and modern fashion sense'
    }
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-white to-pink-25">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Meet Real Women on FlirtDuo
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with amazing women who are looking for genuine relationships and meaningful connections
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {womenProfiles.map((profile, index) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="group cursor-pointer"
            >
              <div className="relative">
                <div className="w-full aspect-square rounded-full overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-300 border-4 border-white group-hover:border-pink-200">
                  <img  
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    alt={`${profile.name}, ${profile.age} years old - beautiful woman smiling`}
                   src={`${profile.Image}`}/>
                </div>
                
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="font-semibold text-sm">{profile.name}</p>
                  <p className="text-xs">{profile.age} years</p>
                </div>
                
                <div className="absolute top-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button 
            onClick={onSignUp}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Meet Them Now
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default WomenGallery;