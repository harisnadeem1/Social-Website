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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    onClick={() => setShowNotificationModal(true)}
                  >
                    <Bell className="w-5 h-5" />
                    {notifications.length > 0 && (
                      <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 bg-red-500 text-white text-xs flex items-center justify-center">
                        {notifications.length}
                      </Badge>
                    )}
                  </Button>

                  <Link to="/chat">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <MessageCircle className="w-5 h-5" />
                      <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 bg-green-500 text-white text-xs flex items-center justify-center">
                        3
                      </Badge>
                    </Button>
                  </Link>
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
                    {/* <Button
                      variant="ghost"
                      className="w-full justify-start relative"
                      onClick={() => handleMenuItemClick('notifications')}
                    >
                      <Bell className="w-5 h-5 mr-3" />
                      Notifications
                      <Badge className="ml-auto bg-red-500 text-white text-xs">3</Badge>
                    </Button>

                    <Link to="/search" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Search className="w-5 h-5 mr-3" />
                      Search
                    </Button>
                  </Link>

                    <Link to="/chat" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start relative">
                        <MessageCircle className="w-5 h-5 mr-3" />
                        Messages
                        <Badge className="ml-auto bg-green-500 text-white text-xs">3</Badge>
                      </Button>
                    </Link> */}

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

                  {/* <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => handleMenuItemClick('theme')}
                  >
                    <Moon className="w-5 h-5 mr-3" />
                    Theme Mode
                  </Button> */}

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
      <Dialog open={showNotificationModal} onOpenChange={setShowNotificationModal}>
        <DialogContent className="max-w-sm mx-auto">
          <h2 className="text-lg font-semibold mb-2">Notifications</h2>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500">No notifications yet.</p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="bg-gray-100 p-3 rounded-md text-sm text-gray-800"
                >
                  <div>{notif.content}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(notif.created_at).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-4">
            <Button
              variant="destructive"
              onClick={async () => {
                try {
                  await axios.delete(`${BASE_URL}/notifications/clear/${user.id}`, {
                    headers: { Authorization: `Bearer ${authToken}` },
                  });
                  setNotifications([]);
                  toast({ title: "Notifications cleared." });
                } catch {
                  toast({ title: "Failed to clear notifications." });
                }
              }}
            >
              Clear All
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MobileHeader;