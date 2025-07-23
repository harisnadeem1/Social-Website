import { NavLink } from 'react-router-dom';
import { Globe, MessageCircle, Users, Bell } from 'lucide-react';
import AuthContext from '@/contexts/AuthContext';
import React, { useContext, useEffect, useState } from 'react';

const BottomNav = () => {
  const { user, logout, coins } = useContext(AuthContext);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadChats, setUnreadChats] = useState(0);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const authToken = localStorage.getItem('token');
  
  if (!user || user.role !== 'user') return null;

  useEffect(() => {
    if (!user?.id) return;

    const fetchCounts = async () => {
      try {
        // Unread notifications
        const resNotifs = await fetch(`${BASE_URL}/notifications/unread-count/${user.id}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        const notifData = await resNotifs.json();
        if (notifData.count !== unreadCount) {
          setUnreadCount(notifData.count);
        }

        // Unread chats
        const resChats = await fetch(`${BASE_URL}/mobilenav/unread-chats`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        const chatData = await resChats.json();
        if (chatData.count !== unreadChats) {
          setUnreadChats(chatData.count);
        }

      } catch (err) {
        console.error('Error fetching counts:', err);
      }
    };

    fetchCounts(); // Initial fetch
    const interval = setInterval(fetchCounts, 30000); // Every 30s

    return () => clearInterval(interval); // Cleanup on unmount
  }, [user?.id, unreadCount, unreadChats]);

  const NavItem = ({ to, icon: Icon, label, badgeCount = 0 }) => (
    <NavLink
      to={to}
      className={({ isActive }) => `
        relative flex flex-col items-center justify-center px-3 py-2
        transition-all duration-200 ease-out
        ${isActive 
          ? 'text-pink-500' 
          : 'text-gray-500 hover:text-pink-400'
        }
      `}
    >
      {({ isActive }) => (
        <>
          {/* Icon with badge */}
          <div className="relative mb-1">
            <Icon className="w-5 h-5 transition-colors duration-200" />
            
            {/* Badge */}
            {badgeCount > 0 && (
              <div className="absolute -top-1 -right-2 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-medium flex items-center justify-center rounded-full">
                {badgeCount > 9 ? '9+' : badgeCount}
              </div>
            )}
          </div>
          
          {/* Label */}
          <span className={`
            text-[11px] font-medium transition-colors duration-200
            ${isActive ? 'text-pink-500 font-semibold' : 'text-gray-600'}
          `}>
            {label}
          </span>
          
         
        </>
      )}
    </NavLink>
  );

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 lg:hidden">
      {/* Clean background */}
      <div className="bg-white/95 backdrop-blur-sm border-t border-gray-100 shadow-lg">
        {/* Navigation items */}
        <div className="flex justify-around items-center h-16 px-2">
          <NavItem
            to="/"
            icon={Globe}
            label="Discover"
          />

          <NavItem
            to="/chat"
            icon={MessageCircle}
            label="Chats"
            badgeCount={unreadChats}
          />

          <NavItem
            to="/notifications"
            icon={Bell}
            label="Activity"
            badgeCount={unreadCount}
          />
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;