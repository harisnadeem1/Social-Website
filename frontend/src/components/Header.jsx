import React, { useContext, useState,useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Search, Zap, Coins, User, Settings, Moon, LogOut, MessageCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AuthContext from '@/contexts/AuthContext';
import BoostModal from '@/components/BoostModal';
import { useToast } from '@/components/ui/use-toast';
import axios from "axios";





const BASE_URL = import.meta.env.VITE_API_BASE_URL;


const Header = () => {
  const { user, logout} = useContext(AuthContext);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [notifications] = useState([
    { id: 1, text: 'Emma liked your profile!', time: '2 min ago' },
    { id: 2, text: 'You have a new message from Sofia', time: '1 hour ago' },
    { id: 3, text: 'Your profile boost is active!', time: '3 hours ago' }
  ]);

const { coins, updateCoins } = useContext(AuthContext);

  useEffect(() => {
  if (user) {
    fetchCoins(user.id);

    const interval = setInterval(() => fetchCoins(user.id), 60000); // refresh every 60s
    return () => clearInterval(interval);
  }
}, [user]);


  const handleLogout = () => {
    logout();
    navigate('/');
    toast({
      title: "Logged out successfully",
      description: "See you soon! 👋",
    });
  };

const authToken = localStorage.getItem('token');


const fetchCoins = async (userId) => {
  try {
    const res = await axios.get(`${BASE_URL}/coins/${userId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    updateCoins(res.data.balance);  // ✅ Correctly update coins in context
  } catch (err) {
    console.error("Failed to fetch coins:", err);
  }
};

  const handleNotificationClick = () => {
    toast({
      title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
    });
  };

  const handleBoostClick = () => {
    setShowBoostModal(true);
  };

  const handleThemeClick = () => {
    toast({
      title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
    });
  };

  if (!user) return null;

  return (
    <>
      <header className="hidden lg:block bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="text-xl font-bold text-gray-900">FlirtDuo</span>
            </Link>

            <div className="flex items-center space-x-4">
              {user.role === 'user' && (
                <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative">
                      <Bell className="w-5 h-5" />
                      {notifications.length > 0 && (
                        <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 bg-red-500 text-white text-xs flex items-center justify-center">
                          {notifications.length}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <div className="p-2 font-semibold text-sm">Notifications</div>
                    <DropdownMenuSeparator />
                    {notifications.map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        onClick={handleNotificationClick}
                        className="p-3 cursor-pointer"
                      >
                        <div>
                          <div className="text-sm">{notification.text}</div>
                          <div className="text-xs text-gray-500 mt-1">{notification.time}</div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* <Link to="/search">
                  <Button variant="ghost" size="sm">
                    <Search className="w-5 h-5" />
                  </Button>
                </Link> */}

                <Link to="/chat">
                  <Button variant="ghost" size="sm" className="relative">
                    <MessageCircle className="w-5 h-5" />
                    <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 bg-green-500 text-white text-xs flex items-center justify-center">
                      3
                    </Badge>
                  </Button>
                </Link>

                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleBoostClick}
                  title="Costs 50 coins to Boost"
                >
                  <Zap className="w-5 h-5 text-yellow-500" />
                </Button>

                <Link to="/coins">
                  <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                    <Coins className="w-5 h-5 text-yellow-500" />
                    <span className="font-medium">{coins}</span>
                  </Button>
                </Link>
                </>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {user.role === 'admin' && (
                     <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center">
                        <Shield className="w-4 h-4 mr-2" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                   {user.role === 'chatter' && (
                     <DropdownMenuItem asChild>
                      <Link to="/chatter-dashboard" className="flex items-center">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Chatter Hub
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {user.role === 'user' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/my-profile" className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          My Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/settings" className="flex items-center">
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem onClick={handleThemeClick}>
                    <Moon className="w-4 h-4 mr-2" />
                    Theme Mode
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <BoostModal open={showBoostModal} onOpenChange={setShowBoostModal} />
    </>
  );
};

export default Header;