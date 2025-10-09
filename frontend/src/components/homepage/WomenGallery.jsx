import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, MapPin, Sparkles, Star } from 'lucide-react';

const WomenGallery = ({ onSignUp }) => {
  const womenProfiles = [
    {
      id: 1,
      name: 'Kaye',
      age: 28,
      location: 'New York',
      interests: ['Travel', 'Yoga'],
      Image: 'https://res.cloudinary.com/dt6smpghz/image/upload/v1757636432/blob_ukie3z.png',
      description: 'Beautiful young woman with blonde hair smiling outdoors in natural lighting',
      online: true
    },
    {
      id: 2,
      name: 'Ramona',
      age: 26,
      location: 'Los Angeles',
      interests: ['Music', 'Art'],
      Image: 'https://res.cloudinary.com/dt6smpghz/image/upload/v1757636714/blob_vnceyh.png',
      description: 'Latina woman with dark hair and warm smile in urban setting',
      online: true
    },
    {
      id: 3,
      name: 'Patty',
      age: 27,
      location: 'Chicago',
      interests: ['Books', 'Coffee'],
      Image: 'https://res.cloudinary.com/dt6smpghz/image/upload/v1754174738/blob_u9jj4k.jpg',
      description: 'Indian woman with long black hair, elegant and professional look',
      online: false
    },
    {
      id: 4,
      name: 'Martina',
      age: 25,
      location: 'Miami',
      interests: ['Beach', 'Dancing'],
      Image: 'https://res.cloudinary.com/dt6smpghz/image/upload/v1757362465/blob_frlibl.jpg',
      description: 'Hispanic woman with curly hair and bright smile at the beach',
      online: true
    },
    {
      id: 5,
      name: 'Lila',
      age: 29,
      location: 'Seattle',
      interests: ['Hiking', 'Photography'],
      Image: 'https://res.cloudinary.com/dt6smpghz/image/upload/v1757610840/blob_auf647.png',
      description: 'Blonde woman with blue eyes in casual summer outfit',
      online: true
    },
    {
      id: 6,
      name: 'Cameron',
      age: 24,
      location: 'San Francisco',
      interests: ['Tech', 'Fitness'],
      Image: 'https://res.cloudinary.com/dt6smpghz/image/upload/v1757636076/blob_i23wve.png',
      description: 'Asian woman with stylish haircut and modern fashion sense',
      online: false
    }
  ];

  return (
    <section className="relative py-20 sm:py-28 lg:py-32 overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-pink-50">
      {/* Animated background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-rose-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-pink-200 shadow-lg mb-6"
          >
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 border-2 border-white"></div>
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400 border-2 border-white"></div>
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 border-2 border-white"></div>
            </div>
            <span className="text-sm font-semibold text-gray-900">1,000+ Active Members</span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Meet Amazing Women
            <span className="block bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Ready to Connect
            </span>
          </h2>

          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Real profiles, genuine connections. Start chatting with verified singles in your area today.
          </p>
        </motion.div>

        {/* Profile Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto mb-16">
          {womenProfiles.map((profile, index) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className="relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                {/* Image Container */}
                <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  <img
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt={`${profile.name}, ${profile.age} years old - beautiful woman smiling`}
                    src={profile.Image}
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>

                  {/* Online Status Badge */}
                  {profile.online && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-green-500 rounded-full shadow-lg">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span className="text-xs font-semibold text-white">Online</span>
                    </div>
                  )}

                  {/* Verified Badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-1 px-3 py-1.5 bg-blue-500 rounded-full shadow-lg">
                    <Star className="w-3 h-3 text-white fill-white" />
                    <span className="text-xs font-semibold text-white">Verified</span>
                  </div>

                  {/* Profile Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-2xl font-bold">{profile.name}</h3>
                      <span className="text-xl font-light">{profile.age}</span>
                    </div>

                    <div className="flex items-center gap-1 text-sm text-white/90 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location}</span>
                    </div>

                    {/* Interests Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {profile.interests.map((interest, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium border border-white/30"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 transform translate-y-0 sm:translate-y-4 sm:group-hover:translate-y-0">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onSignUp}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl font-semibold text-sm shadow-lg transition-all duration-300"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Chat Now
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-all duration-300 border border-white/30"
                      >
                        <Heart className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating sparkle effect */}
              <motion.div
                className="absolute -top-2 -right-2 text-yellow-400"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Sparkles className="w-6 h-6" />
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-150 {
          animation-delay: 150ms;
        }
        .animation-delay-300 {
          animation-delay: 300ms;
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

export default WomenGallery;