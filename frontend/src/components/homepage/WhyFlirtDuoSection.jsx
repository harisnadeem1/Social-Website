import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Sparkles, Send, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ChatPreviewSection = ({ onSignUp }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showTyping, setShowTyping] = useState(false);

  const messages = [
    {
      id: 1,
      sender: 'You',
      text: "That smile in your photo is absolutely stunning 😍",
      time: '8:15 PM',
      isUser: true
    },
    {
      id: 2,
      sender: 'Emma',
      text: "Aww thank you! You're pretty easy on the eyes yourself 😏",
      time: '8:16 PM',
      isUser: false
    },
    {
      id: 3,
      sender: 'You',
      text: "I'd love to see that smile in person... drinks tonight?",
      time: '8:17 PM',
      isUser: true
    },
    {
      id: 4,
      sender: 'Emma',
      text: "You don't waste time, do you? I like that 😉",
      time: '8:18 PM',
      isUser: false
    },
    {
      id: 5,
      sender: 'Emma',
      text: "9 PM at The Rose Bar? Don't keep me waiting 💋",
      time: '8:19 PM',
      isUser: false
    },
    {
      id: 6,
      sender: 'You',
      text: "Perfect! See you there gorgeous 😘",
      time: '8:20 PM',
      isUser: true
    }
  ];

  useEffect(() => {
    if (currentMessageIndex < messages.length) {
      const timer = setTimeout(() => {
        setShowTyping(true);
        setTimeout(() => {
          setShowTyping(false);
          setCurrentMessageIndex(prev => prev + 1);
        }, 1200);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [currentMessageIndex, messages.length]);

  const resetAnimation = () => {
    setCurrentMessageIndex(0);
    setShowTyping(false);
  };

  return (
    <section className="relative py-16 sm:py-24 lg:py-28 overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Subtle animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-200/40 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-200/40 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-blue-200/40 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
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
            <Heart className="text-pink-400/40" size={15 + Math.random() * 20} />
          </motion.div>
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-pink-200 shadow-lg mb-6"
          >
            <MessageCircle className="w-4 h-4 text-pink-600" />
            <span className="text-sm font-semibold text-gray-900">Real Conversations Happening Now</span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight px-4">
            From First Message
            <span className="block bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              To First Date in Minutes
            </span>
          </h2>
          
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
            Watch how quickly sparks fly when you match with someone special
          </p>
        </motion.div>

        {/* Main Chat Container */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-6xl mx-auto">
          {/* Chat Interface */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Phone mockup */}
            <div className="relative mx-auto max-w-[320px] sm:max-w-sm">
              {/* Phone frame */}
              <div className="relative bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl border-[6px] border-gray-800">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-3xl z-10"></div>
                
                {/* Screen */}
                <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl">
                  {/* Chat Header */}
                  <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-3 sm:p-4 flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white flex items-center justify-center overflow-hidden">
                        <img 
                          src="https://res.cloudinary.com/dt6smpghz/image/upload/v1757636432/blob_ukie3z.png"
                          alt="Emma"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-sm sm:text-base">Emma, 26</h3>
                      <p className="text-white/80 text-xs">Online now</p>
                    </div>
                    <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>

                  {/* Chat Messages */}
                  <div className="h-[500px] overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white">
                    <div className="space-y-3 sm:space-y-4">
                      <AnimatePresence>
                        {messages.slice(0, currentMessageIndex).map((message) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.3 }}
                            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[80%] ${message.isUser ? 'order-2' : 'order-1'}`}>
                              <div className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-3 ${
                                message.isUser 
                                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-br-sm' 
                                  : 'bg-gray-200 text-gray-900 rounded-bl-sm'
                              } shadow-md`}>
                                <p className="text-xs sm:text-sm leading-relaxed">{message.text}</p>
                              </div>
                              <p className={`text-xs text-gray-500 mt-1 ${message.isUser ? 'text-right' : 'text-left'}`}>
                                {message.time}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {/* Typing indicator */}
                      {showTyping && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex justify-start"
                        >
                          <div className="bg-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-md">
                            <div className="flex gap-1">
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.6, repeat: Infinity }}
                                className="w-2 h-2 bg-gray-500 rounded-full"
                              />
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                className="w-2 h-2 bg-gray-500 rounded-full"
                              />
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                                className="w-2 h-2 bg-gray-500 rounded-full"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Chat Input */}
                  <div className="p-3 sm:p-4 bg-white border-t border-gray-200">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 sm:px-4 py-2 sm:py-3">
                      <Smile className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent text-xs sm:text-sm outline-none text-gray-500"
                        disabled
                      />
                      <Send className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating reaction bubbles */}
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -right-2 sm:-right-4 top-16 sm:top-20 bg-white rounded-2xl p-2 sm:p-3 shadow-xl"
              >
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 fill-red-500" />
              </motion.div>

              <motion.div
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [0, -5, 5, 0]
                }}
                transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
                className="absolute -left-2 sm:-left-4 bottom-24 sm:bottom-32 bg-white rounded-2xl p-2 sm:p-3 shadow-xl"
              >
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
              </motion.div>
            </div>
          </motion.div>

          {/* Right Side Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-6 sm:space-y-8"
          >
            {/* Feature highlights */}
            <div className="space-y-5 sm:space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="flex gap-3 sm:gap-4 items-start"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Flirty Conversations</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Break the ice with confidence and charm. Our members love playful banter that leads somewhere special.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="flex gap-3 sm:gap-4 items-start"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Instant Chemistry</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    When there's a spark, you'll know it. Watch connections turn into real dates in real time.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                viewport={{ once: true }}
                className="flex gap-3 sm:gap-4 items-start"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Real Dates, Fast</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    No endless texting. Meet people who are ready to take things offline and meet in person.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
              className="pt-4 sm:pt-6"
            >
             
            </motion.div>
          </motion.div>
        </div>
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

export default ChatPreviewSection;