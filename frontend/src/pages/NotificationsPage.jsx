import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const NotificationsPage = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const authToken = localStorage.getItem("token");

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${BASE_URL}/notifications/get/${user.id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
      console.log("======notifications");
      console.log(data);
      setNotifications(data);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to load notifications', variant: 'destructive' });
    }
  };

  const handleDelete = async (notifId) => {
    try {
      await fetch(`${BASE_URL}/notifications/delete/${notifId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setNotifications((prev) => prev.filter(n => n.id !== notifId));
    } catch {
      toast({ title: "Error", description: "Failed to delete notification", variant: "destructive" });
    }
  };

  const handleClearAll = async () => {
    try {
      await fetch(`${BASE_URL}/notifications/clear/${user.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setNotifications([]);
      toast({ title: "All notifications cleared." });
    } catch {
      toast({ title: "Error", description: "Failed to clear notifications" });
    }
  };

  const handleNotificationClick = (notif) => {
    if (['wink', 'message', 'like'].includes(notif.type) && notif.sender_id) {
      navigate(`/chat?user=${notif.sender_id}`);
    }
  };

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  return (
    <div className="min-h-screen bg-white pb-16 px-4 pt-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Your Notifications</h2>
        {notifications.length > 0 && (
          <Button variant="destructive" size="sm" onClick={handleClearAll}>
            Clear All
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="text-sm text-gray-500 text-center mt-10">No notifications yet</p>
      ) : (
        <div className="space-y-3">
          {/* {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className="flex justify-between items-start bg-gray-100 p-4 rounded-lg shadow-sm cursor-pointer"
            >
              <div className="text-sm text-gray-800">
                <div className="font-medium">
                  {notif.type === 'wink' ? 'New Wink' :
                   notif.type === 'like' ? 'New Like' :
                   notif.type === 'message' ? 'New Message' :
                   'Notification'}
                </div>
                <div className="text-gray-600">{notif.content}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(notif.created_at).toLocaleString()}
                </div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(notif.id); }}>
                <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
              </button>
            </div>
          ))} */}
          {notifications.map((notif) => (
  <div
    key={notif.id}
    onClick={() => handleNotificationClick(notif)}
    className="flex items-start bg-gray-100 p-3 rounded-lg shadow-sm cursor-pointer"
  >
    {/* Profile Image + Icon Overlay */}
    <div className="relative mr-3">
      <img
        src={notif.profile_image_url || "/default-avatar.jpg"}
        alt="Profile"
        className="w-12 h-12 rounded-full object-cover"
      />

      {/* Notification Icon Overlay */}
      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-md">
        {notif.type === 'like' && (
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 18.343l-6.828-6.829a4 4 0 010-5.656z" />
          </svg>
        )}
        {notif.type === 'wink' && (
          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM7 9H5v2h2V9zm8 0h-2v2h2V9zM6.293 13.707a1 1 0 011.414 0A4.978 4.978 0 0010 15c.89 0 1.735-.234 2.293-.707a1 1 0 011.414 1.414A6.978 6.978 0 0110 17a6.978 6.978 0 01-4.707-1.793 1 1 0 010-1.414z" />
          </svg>
        )}
        {notif.type === 'message' && (
          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v7a2 2 0 01-2 2H8l-4 4v-4H4a2 2 0 01-2-2V5z" />
          </svg>
        )}
      </div>
    </div>

    {/* Notification Content */}
    <div className="flex-1 text-sm text-gray-800">
      <div className="font-medium mb-0.5">
        {notif.type === 'wink' ? 'New Wink' :
         notif.type === 'like' ? 'New Like' :
         notif.type === 'message' ? 'New Message' :
         'Notification'}
      </div>
      <div className="text-gray-600">{notif.content}</div>
      <div className="text-xs text-gray-400 mt-1">
        {new Date(notif.created_at).toLocaleString()}
      </div>
    </div>

    {/* Delete Button */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleDelete(notif.id);
      }}
      className="ml-2"
    >
      <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
    </button>
  </div>
))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
