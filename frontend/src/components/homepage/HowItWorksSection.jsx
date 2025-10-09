import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Search, MessageCircle, Sparkles, ArrowRight } from 'lucide-react';

const HowItWorksSection = ({ onSignUp }) => {
  const steps = [
    {
      icon: UserPlus,
      title: 'Create Your Profile',
      description: 'Build an authentic profile that showcases your personality, passions, and what makes you unique.',
      color: 'from-pink-500 to-rose-500',
      bgGradient: 'from-pink-50 to-rose-50',
      shadowColor: 'shadow-pink-500/20'
    },
    {
      icon: Search,
      title: 'Discover Matches',
      description: 'Our intelligent algorithm finds compatible singles who share your interests and relationship goals.',
      color: 'from-purple-500 to-indigo-500',
      bgGradient: 'from-purple-50 to-indigo-50',
      shadowColor: 'shadow-purple-500/20'
    },
    {
      icon: MessageCircle,
      title: 'Start Connecting',
      description: 'Break the ice with personalized conversation starters and build meaningful relationships.',
      color: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
      shadowColor: 'shadow-blue-500/20'
    }
  ];

  return (
    <section className="relative py-20 sm:py-28 lg:py-32 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-20 left-1/2 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 border border-pink-200 mb-6"
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-900">Simple Process</span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Your Journey to Love in{' '}
            <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              3 Easy Steps
            </span>
          </h2>
          
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Join thousands of singles who found their perfect match through our proven process
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-10 max-w-7xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.7, 
                delay: index * 0.2,
                ease: "easeOut"
              }}
              viewport={{ once: true }}
              className="relative group"
            >
              {/* Connecting line - hidden on mobile */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-gray-300 to-transparent z-0">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: index * 0.2 + 0.5 }}
                    viewport={{ once: true }}
                    className="h-full bg-gradient-to-r from-pink-400 to-purple-400 origin-left"
                  />
                </div>
              )}

              {/* Card */}
              <div className={`relative bg-white rounded-3xl p-8 shadow-xl ${step.shadowColor} hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 overflow-hidden group-hover:border-gray-200`}>
                {/* Background decoration */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${step.bgGradient} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-y-1/2 translate-x-1/2`}></div>

                {/* Icon container */}
                <div className="relative mb-6">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className={`relative w-20 h-20 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                  >
                    <step.icon className="w-9 h-9 text-white" strokeWidth={2} />
                    
                    {/* Pulse effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${step.color} rounded-2xl animate-ping opacity-20`}></div>
                  </motion.div>

                  {/* Step number */}
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                    <span className="text-sm font-bold text-white">{index + 1}</span>
                  </div>
                </div>
                
                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-pink-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                  {step.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed mb-6">
                  {step.description}
                </p>

                {/* Arrow indicator */}
                <div className="flex items-center text-sm font-semibold text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span>Learn more</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>

                {/* Decorative corner */}
                <div className={`absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl ${step.bgGradient} rounded-tl-full opacity-50`}></div>
              </div>
            </motion.div>
          ))}
        </div>

       {/* Bottom CTA */}
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, delay: 0.6 }}
  viewport={{ once: true }}
  className="text-center mt-16"
>
  <p className="text-gray-600 text-lg mb-6">
    Ready to find your perfect match?
  </p>
  <motion.button
    onClick={onSignUp}  // ⭐ Add this line
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
  >
    Get Started Today
    <ArrowRight className="w-5 h-5" />
  </motion.button>
</motion.div>
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

export default HowItWorksSection;