import React, { useState, useContext,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useChatterState } from '@/hooks/useChatterState.js';
import ChatterHeader from '@/components/chatter/ChatterHeader.jsx';
import ChatterSidebar from '@/components/chatter/ChatterSidebar.jsx';
import ChatterChatWindow from '@/components/chatter/ChatterChatWindow.jsx';
import AuthContext from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast.js';
import useSocket from '@/hooks/useSocket';
import { unlockChat } from '../api/chatLock';
import axios from 'axios';
// import { useEffect } from 'react';


const ChatterDashboard = () => {
  const {
    user,
    girlProfiles,
    allUsers,
    activeGirl,
    setActiveGirl,
    conversations,
    selectedChat,
    message,
    setMessage,
    activeView,
    setActiveView,
    handleSelectChat,
    handleSendMessage,
    handleStartNewChat,
    handleWinkResponse,
    formatTime,
    isLockedByOther,
    isLockedByYou,
    lockHolderName,
    setSelectedChatId,
  } = useChatterState();
const socketRef = useSocket();

  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    navigate('/');
    toast({
      title: "Logged out successfully",
      description: "See you soon from the Chatter Hub! 👋",
    });
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);



const [winks, setWinks] = useState([]);


useEffect(() => {
  const fetchWinks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/chatter/winks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setWinks(res.data); // assuming the backend returns the winks array
    } catch (err) {
      console.error("Failed to fetch winks:", err);
    }
  };

  fetchWinks();
}, []);













useEffect(() => {
  const handleUnload = async () => {
    const token = localStorage.getItem('token');
    if (selectedChat) {
      await unlockChat(selectedChat.conversation_id, token);
    }
  };

  window.addEventListener('beforeunload', handleUnload);
  return () => window.removeEventListener('beforeunload', handleUnload);
}, [selectedChat]);







  

useEffect(() => {
  if (!socketRef.current) return;

  socketRef.current.on('receiveMessage', (data) => {
    // You can call handleSelectChat again or directly append the message to selectedChat
  });

  return () => {
    socketRef.current.off('receiveMessage');
  };
}, [socketRef.current]);







  const handleSelectChatAndCloseSidebar = (chat) => {
    handleSelectChat(chat);
    socketRef.current.emit('joinRoom', chat.conversation_id);
    setSidebarOpen(false);
  };

  const handleBackToInbox = async () => {
  const token = localStorage.getItem('token');
  if (selectedChat) {
    await unlockChat(selectedChat.conversation_id, token);
  }
  setSelectedChatId(null);
};

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Helmet>
        <title>Chatter Dashboard - Liebenly</title>
        <meta name="description" content="Engage with users and manage conversations as different girl profiles." />
      </Helmet>

      <ChatterHeader
        user={user}
        activeGirl={activeGirl}
        girlProfiles={girlProfiles}
        onSwitchGirl={setActiveGirl}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      <div className="h-[calc(100vh-4rem)] flex">
        <div className={`${sidebarOpen ? 'block absolute top-16 left-0 w-full h-[calc(100%-4rem)] z-30' : 'hidden'} lg:block lg:relative lg:top-0 lg:h-full`}>
          <ChatterSidebar
            activeView={activeView}
            setActiveView={setActiveView}
            conversations={conversations}
            winks={winks}
            onSelectChat={handleSelectChatAndCloseSidebar}
            formatTime={formatTime}
            allUsers={allUsers}
            girlProfiles={girlProfiles}
            currentChatterId={user.email}
            onWinkResponse={handleWinkResponse}
            onStartNewChat={handleStartNewChat}
            activeGirl={activeGirl}
          />
        </div>
        
        <div className={`flex-1 ${selectedChat ? 'block' : 'hidden'} lg:block`}>
          <ChatterChatWindow
            selectedChat={selectedChat}
            message={message}
            setMessage={setMessage}
            isTyping={false}
            onSendMessage={handleSendMessage}
            isLockedByOther={isLockedByOther}
            isLockedByYou={isLockedByYou}
            lockHolderName={lockHolderName}
            allUsers={allUsers}
            onBackToInbox={handleBackToInbox}

          />
        </div>
      </div>
    </div>
  );
};

export default ChatterDashboard;