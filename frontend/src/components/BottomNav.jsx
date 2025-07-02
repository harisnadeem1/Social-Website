import { NavLink } from 'react-router-dom';
import { Globe, MessageCircle, Users, Bell } from 'lucide-react';
import AuthContext from '@/contexts/AuthContext';
import React, { useContext ,useEffect,useState} from 'react';

const BottomNav = () => {
  const { user, logout, coins } = useContext(AuthContext);
  const [unreadCount, setUnreadCount] = useState(0);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const authToken = localStorage.getItem('token');
   if (!user || user.role !== 'user') return null;


useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`${BASE_URL}/notifications/unread-count/${user.id}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        const data = await res.json();
        setUnreadCount(data.count);
      } catch (err) {
        console.error('Error fetching unread count:', err);
      }
    };

    fetchUnreadCount();

    // Optional: re-check every 30s
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);






  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50 lg:hidden">
      <div className="flex justify-around items-center h-14">
         
        <NavLink
          to="/"
          className="flex flex-col items-center text-xs text-gray-600 hover:text-pink-500"
        >
          <Globe className="w-5 h-5 mb-1" />
          Feed
        </NavLink>

        <NavLink
          to="/chat"
          className="flex flex-col items-center text-xs text-gray-600 hover:text-pink-500"
        >
          <MessageCircle className="w-5 h-5 mb-1" />
          Chat
        </NavLink>

        {/* <NavLink
          to="/interactions"
          className="flex flex-col items-center text-xs text-gray-600 hover:text-pink-500"
        >
          <Users className="w-5 h-5 mb-1" />
          Interact
        </NavLink> */}

        <NavLink
  to="/notifications"
  className="flex flex-col items-center text-xs text-gray-600 hover:text-pink-500 relative"
>
  <div className="relative">
    <Bell className="w-5 h-5 mb-1" />
    
    {unreadCount > 0 && (
      <span className="absolute -top-1 -right-3 w-5 h-5 bg-red-500 text-white text-[11px] font-bold flex items-center justify-center rounded-full shadow">
        {unreadCount > 9 ? '9+' : unreadCount}
      </span>
    )}
  </div>
  Notifs
</NavLink>

         
      </div>
    </nav>
  );
};

export default BottomNav;
