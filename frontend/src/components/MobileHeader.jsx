import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Bell, Search, Zap, Coins, User, Settings, Moon, LogOut, MessageCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AuthContext from '@/contexts/AuthContext';
import BoostModal from '@/components/BoostModal';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';
import { Dialog, DialogContent } from '@/components/ui/dialog'; // if you have a modal component


const MobileHeader = () => {
  const { user, logout, coins } = useContext(AuthContext);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);



  const authToken = localStorage.getItem('token');
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000); // update every 60s
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/notifications/get/${user.id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };



  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
    toast({
      title: "Logged out successfully",
      description: "See you soon! 👋",
    });
  };

  const handleMenuItemClick = (action) => {
    setIsMenuOpen(false);
    if (action === 'notifications' || action === 'theme') {
      toast({
        title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
      });
    } else if (action === 'boost') {
      setShowBoostModal(true);
    }
  };

  if (!user) return null;

  return (
    <>
      <header className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Liebenly</span>
            </Link>

            <div className="flex items-center space-x-3">
              {user.role === 'user' && (
                <>
                  <div className="flex items-center space-x-1 ">
                    {/* Boost Button */}
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-2"
                      onClick={() => handleMenuItemClick('boost')}
                    >
                      <Zap className="w-6 h-6 text-purple-600" />
                    </Button>

                    {/* Coin Icon + Count */}
                    <Link to="/coins" onClick={() => setIsMenuOpen(false)} className="relative">
                      <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-inner">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="gold"
                          viewBox="0 0 24 24"
                          stroke="orange"
                          className="w-8 h-8"
                        >
                          <circle cx="12" cy="12" r="10" strokeWidth="2" />
                          <text
                            x="12"
                            y="16"
                            textAnchor="middle"
                            fontSize="10"
                            fill="orange"
                            fontWeight="bold"
                          >
                            $
                          </text>
                        </svg>
                      </div>

                      {/* Coin Count Badge */}
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-400 text-white text-[10px] font-semibold px-2 py-[1px] rounded-full shadow-md">
                        {coins}
                      </div>
                    </Link>
                  </div>

                </>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="relative z-50"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>

        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <>
              {/* Background Overlay */}
              <motion.div
                className="fixed inset-0 bg-black bg-opacity-40 z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMenuOpen(false)}
              />

              {/* Slide-Up Menu Box */}
              <motion.div
                className="fixed bottom-14 left-0 w-full bg-white rounded-t-2xl shadow-xl z-50 px-6 py-6"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >

                <div className="space-y-4">
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <Shield className="w-5 h-5 mr-3" />
                        Admin Panel
                      </Button>
                    </Link>
                  )}
                  {user.role === 'chatter' && (
                    <Link to="/chatter-dashboard" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <MessageCircle className="w-5 h-5 mr-3" />
                        Chatter Hub
                      </Button>
                    </Link>
                  )}
                  {user.role === 'user' && (
                    <>
                      <Link to="/my-profile" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">
                          <User className="w-5 h-5 mr-3" />
                          My Profile
                        </Button>
                      </Link>

                      <Link to="/settings" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">
                          <Settings className="w-5 h-5 mr-3" />
                          Settings
                        </Button>
                      </Link>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Logout
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </header>

      <BoostModal open={showBoostModal} onOpenChange={setShowBoostModal} />
    </>
  );
};

export default MobileHeader;