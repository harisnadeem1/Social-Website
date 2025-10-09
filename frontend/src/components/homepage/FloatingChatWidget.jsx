import React, { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";

const FloatingChatWidget = ({ 
  onSignUp, 
  assistantName = "Emma", 
  assistantImage = "/hero/sarah.png" 
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
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="relative bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 hover:scale-105 hover:shadow-pink-300 transition-all duration-300 group"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-base">Chat Now</span>
          
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
        <div className="fixed bottom-24 right-6 z-50 w-96 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-fadeIn">
          {/* Header with close button */}
          <div className="relative bg-white border-b border-gray-100 px-5 py-4">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1.5 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 pr-10">
              <div className="relative">
                <img 
                  src={assistantImage} 
                  alt={assistantName}
                  className="w-12 h-12 rounded-full object-cover shadow-sm border-2 border-pink-100"
                />
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <div className="text-gray-900 font-semibold text-base">{assistantName}</div>
                <div className="text-gray-500 text-xs flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Online now
                </div>
              </div>
            </div>
          </div>

          {/* Message area */}
          <div className="p-5 bg-gray-50 min-h-[240px] max-h-[400px] overflow-y-auto">
            {/* Assistant message */}
            <div className="flex gap-3 mb-4">
              <img 
                src={assistantImage} 
                alt={assistantName}
                className="w-9 h-9 rounded-full object-cover flex-shrink-0 shadow-sm border border-pink-100"
              />
              <div className="flex-1">
                <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-gray-100">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Hi! 👋 I'm here to help boost your profile visibility.
                  </p>
                </div>
                <div className="text-xs text-gray-400 mt-1.5 ml-1">2:34 PM</div>
              </div>
            </div>

            {/* Second message */}
            <div className="flex gap-3 mb-4">
              <img 
                src={assistantImage} 
                alt={assistantName}
                className="w-9 h-9 rounded-full object-cover flex-shrink-0 shadow-sm border border-pink-100"
              />
              <div className="flex-1">
                <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-gray-100">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Sign up now to get <span className="font-semibold text-pink-600">premium visibility</span> and connect with more people instantly.
                  </p>
                </div>
                <div className="text-xs text-gray-400 mt-1.5 ml-1">2:34 PM</div>
              </div>
            </div>

            {/* Urgency indicator */}
            {timeLeft > 0 && (
              <div className="bg-white border border-pink-100 rounded-xl p-4 flex items-center gap-3 shadow-sm">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                  {minutes}:{seconds.toString().padStart(2, "0")}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">Special Offer Active</div>
                  <div className="text-xs text-gray-500 mt-0.5">Limited time profile boost expires soon</div>
                </div>
              </div>
            )}
          </div>

          {/* CTA section */}
          <div className="px-5 py-4 bg-white border-t border-gray-100">
            <button
              onClick={onSignUp}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-pink-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Get Started Now
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">
              Join 10,000+ active members
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

export default FloatingChatWidget