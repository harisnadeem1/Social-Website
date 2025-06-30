import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Bell, Search, Zap, Coins, User, Settings, Moon, LogOut, MessageCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AuthContext from '@/contexts/AuthContext';
import BoostModal from '@/components/BoostModal';
import { useToast } from '@/components/ui/use-toast';

const MobileHeader = () => {
  const { user, logout, coins } = useContext(AuthContext);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBoostModal, setShowBoostModal] = useState(false);

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
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="text-xl font-bold text-gray-900">FlirtDuo</span>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative z-50"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white border-b border-gray-200 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-3">
                {user.role === 'user' && (
                  <>
                  <Button
                    variant="ghost"
                    className="w-full justify-start relative"
                    onClick={() => handleMenuItemClick('notifications')}
                  >
                    <Bell className="w-5 h-5 mr-3" />
                    Notifications
                    <Badge className="ml-auto bg-red-500 text-white text-xs">3</Badge>
                  </Button>

                  {/* <Link to="/search" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Search className="w-5 h-5 mr-3" />
                      Search
                    </Button>
                  </Link> */}

                  <Link to="/chat" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start relative">
                      <MessageCircle className="w-5 h-5 mr-3" />
                      Messages
                      <Badge className="ml-auto bg-green-500 text-white text-xs">3</Badge>
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => handleMenuItemClick('boost')}
                  >
                    <Zap className="w-5 h-5 mr-3 text-yellow-500" />
                    Boost Profile
                  </Button>

                  <Link to="/coins" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Coins className="w-5 h-5 mr-3 text-yellow-500" />
                      Coins ({coins})
                    </Button>
                  </Link>
                  </>
                )}


                <div className="border-t border-gray-200 pt-3 mt-3">
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
                    className="w-full justify-start"
                    onClick={() => handleMenuItemClick('theme')}
                  >
                    <Moon className="w-5 h-5 mr-3" />
                    Theme Mode
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Logout
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <BoostModal open={showBoostModal} onOpenChange={setShowBoostModal} />
    </>
  );
};

export default MobileHeader;