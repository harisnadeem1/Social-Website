import React, { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";

const FloatingSignupButton = ({ onClick }) => {
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [active, setActive] = useState(false);

  useEffect(() => {
    let timer;
    if (active && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [active, timeLeft]);

  const handleClick = () => {
    setActive(true);
    onClick(); // open signup modal
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={handleClick}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold px-6 py-3 rounded-full shadow-xl flex items-center gap-2 hover:scale-105 transition-all duration-300 hover:shadow-pink-500/50"
      >
        <MessageCircle className="w-5 h-5" />
        Chat Now
      </button>

      {/* Popup Incentive */}
      {active && (
        <div className="fixed bottom-24 right-6 bg-white text-gray-800 rounded-2xl shadow-2xl p-4 w-72 border border-pink-100 animate-fadeIn z-50">
          <p className="font-semibold text-center text-pink-600 mb-1">
            🚀 Limited Boost Offer!
          </p>
          <p className="text-sm text-center mb-2">
            Sign up within{" "}
            <span className="font-bold text-purple-600">
              {minutes}:{seconds.toString().padStart(2, "0")}
            </span>{" "}
            to get your profile <b>boosted</b> — girls will notice you first 💬✨
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease forwards;
        }
      `}</style>
    </>
  );
};

export default FloatingSignupButton;
