import React, { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";

const FloatingChatWidget = ({ 
  onSignUp, 
  assistantName = "Emma", 
  assistantImage = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes countdown

  // ⏱️ Always run timer regardless of widget open/close
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => Math.max(t - 1, 0)), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <>
      {/* ✅ Floating Button with Timer Badge */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="relative bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold px-4 py-3 sm:px-6 sm:py-4 rounded-full shadow-2xl flex items-center gap-2 sm:gap-3 hover:scale-105 hover:shadow-pink-300 transition-all duration-300 group"
        >
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-sm sm:text-base">Chat Now</span>
          
          {/* Pulse effect */}
          <span className="absolute inset-0 rounded-full bg-pink-400 opacity-0 group-hover:opacity-20 group-hover:animate-ping"></span>
        </button>
        
        {/* Timer Badge - Centered at Bottom */}
        {timeLeft > 0 && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-md whitespace-nowrap">
            {minutes}:{seconds.toString().padStart(2, "0")}
          </div>
        )}
      </div>

      {/* ✅ Chat Popup */}
      {isOpen && (
        <div className="fixed bottom-20 sm:bottom-24 right-4 left-4 sm:left-auto sm:right-6 z-50 sm:w-96 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-fadeIn">
          {/* Header with close button */}
          <div className="relative bg-white border-b border-gray-100 px-4 sm:px-5 py-3 sm:py-4">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-3 sm:top-4 right-3 sm:right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1.5 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 pr-10">
              <div className="relative">
                <img 
                  src={assistantImage} 
                  alt={assistantName}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-sm border-2 border-pink-100"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <div className="text-gray-900 font-semibold text-sm sm:text-base">{assistantName}</div>
                <div className="text-gray-500 text-xs flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Online now
                </div>
              </div>
            </div>
          </div>

          {/* Message area */}
          <div className="p-4 sm:p-5 bg-gray-50 min-h-[200px] sm:min-h-[240px] max-h-[300px] sm:max-h-[400px] overflow-y-auto">
            {/* Assistant message */}
            <div className="flex gap-2 sm:gap-3 mb-3 sm:mb-4">
              <img 
                src={assistantImage} 
                alt={assistantName}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover flex-shrink-0 shadow-sm border border-pink-100"
              />
              <div className="flex-1">
                <div className="bg-white rounded-2xl rounded-tl-none px-3 py-2 sm:px-4 sm:py-3 shadow-sm border border-gray-100">
                  <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                    Hi! 👋 I'm here to help boost your profile visibility.
                  </p>
                </div>
                <div className="text-xs text-gray-400 mt-1 sm:mt-1.5 ml-1">2:34 PM</div>
              </div>
            </div>

            {/* Second message */}
            <div className="flex gap-2 sm:gap-3 mb-3 sm:mb-4">
              <img 
                src={assistantImage} 
                alt={assistantName}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover flex-shrink-0 shadow-sm border border-pink-100"
              />
              <div className="flex-1">
                <div className="bg-white rounded-2xl rounded-tl-none px-3 py-2 sm:px-4 sm:py-3 shadow-sm border border-gray-100">
                  <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                    Sign up now to get <span className="font-semibold text-pink-600">premium visibility</span> and connect with more people instantly.
                  </p>
                </div>
                <div className="text-xs text-gray-400 mt-1 sm:mt-1.5 ml-1">2:34 PM</div>
              </div>
            </div>

            {/* Urgency indicator */}
            {timeLeft > 0 ? (
              <div className="bg-white border border-pink-100 rounded-xl p-3 sm:p-4 flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-md flex-shrink-0">
                  {minutes}:{seconds.toString().padStart(2, "0")}
                </div>
                <div className="flex-1">
                  <div className="text-xs sm:text-sm font-semibold text-gray-900">Special Offer Active</div>
                  <div className="text-xs text-gray-500 mt-0.5">Limited time profile boost expires soon</div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-3 sm:p-4 flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-md flex-shrink-0">
                  ⏰
                </div>
                <div className="flex-1">
                  <div className="text-xs sm:text-sm font-semibold text-red-600">Offer Expired</div>
                  <div className="text-xs text-gray-600 mt-0.5">Sign up now for regular pricing</div>
                </div>
              </div>
            )}
          </div>

          {/* CTA section */}
          <div className="px-4 sm:px-5 py-3 sm:py-4 bg-white border-t border-gray-100">
            <button
              onClick={onSignUp}
              className={`w-full ${timeLeft > 0 ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700' : 'bg-gray-500 hover:bg-gray-600'} text-white py-3 sm:py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base`}
            >
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              {timeLeft > 0 ? 'Get Started Now' : 'Sign Up (Regular Price)'}
            </button>
            <p className="text-center text-xs text-gray-400 mt-2 sm:mt-3">
              {timeLeft > 0 ? 'Join 10,000+ active members' : 'Special offer has ended'}
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease forwards;
        }
      `}</style>
    </>
  );
};

export default FloatingChatWidget;