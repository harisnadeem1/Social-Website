import { React, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { MessageSquare, Heart, Plus, Users } from 'lucide-react';
import ChatterConversationList from './ChatterConversationList.jsx';
import WinksList from './WinksList.jsx';
import LikeList from './LikeList.jsx';

import StartNewChatModal from './StartNewChatModal.jsx';

const ChatterSidebar = ({
  activeView,
  setActiveView,
  conversations,
  onSelectChat,
  formatTime,
  allUsers,
  girlProfiles,
  currentChatterId,
  onWinkResponse,
  onStartNewChat,
  activeGirl,
}) => {

  const [winks, setWinks] = useState([]);
  const [likes, setLikes] = useState([]);

  useEffect(() => {
    const fetchLikes = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/chatter/likes/get`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      setLikes(data);
    };

    fetchLikes();
  }, []);

  useEffect(() => {
    const fetchWinks = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/chatter/winks`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      setWinks(data);
    };

    fetchWinks();
  }, []);

  const handleLikeResponse = async (like, message) => {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/chatter/likes/respond/${like.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      });
      setLikes(prev => prev.filter(l => l.id !== like.id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleWinkResponse = async (wink, message) => {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/winks/respond/${wink.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      });

      setWinks(prev => prev.filter(w => w.id !== wink.id));
    } catch (error) {
      console.error(error);
    }
  };

  // Filter conversations based on view type
  const getFilteredConversations = () => {
    if (activeView === 'chats') {
      // Only show conversations where user has sent at least one message
      return conversations.filter(conversation => {
        if (!conversation.messages || conversation.messages.length === 0) return false;
        
        // Check if any message was sent by the user (not by girl/chatter)
        return conversation.messages.some(message => 
          message.senderId === conversation.user_id
        );
      });
    }
    // For 'all-chats' or other views, return all conversations
    return conversations;
  };

  const renderContent = () => {
    switch (activeView) {
      case 'chats':
      case 'all-chats':
        return (
          <ChatterConversationList
            conversations={getFilteredConversations()}
            onSelectChat={onSelectChat}
            formatTime={formatTime}
            allUsers={allUsers}
            girlProfiles={girlProfiles}
            currentChatterId={currentChatterId}
            activeGirl={activeGirl}
          />
        );
      case 'likes':
        return (
          <LikeList
            likes={likes}
            onLikeResponse={handleLikeResponse}
          />
        );
      case 'winks':
        return (
          <WinksList
            winks={winks}
            onWinkResponse={handleWinkResponse}
            allUsers={allUsers}
          />
        );
      default:
        return null;
    }
  };

  const getHeaderTitle = () => {
    switch (activeView) {
      case 'chats':
        return 'Chats';
      case 'all-chats':
        return 'All Conversations';
      case 'likes':
        return 'Likes';
      case 'winks':
        return 'Winks';
      default:
        return 'Conversations';
    }
  };

  return (
    <div className="h-full flex flex-col w-full lg:w-96 border-r border-gray-200 bg-white">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {getHeaderTitle()}
          </h2>
          <StartNewChatModal
            onStartNewChat={onStartNewChat}
            allUsers={allUsers}
            activeGirl={activeGirl}
          >
            {/* <Button size="sm" className="bg-pink-500 hover:bg-pink-600 text-white">
              <Plus className="w-4 h-4" />
            </Button> */}
          </StartNewChatModal>
        </div>
        <div className="flex space-x-1 flex-wrap gap-y-2">
          <Button
            variant={activeView === 'chats' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('chats')}
            className={activeView === 'chats' ? 'bg-pink-500 hover:bg-pink-600 text-white' : ''}
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            Chats
          </Button>
          <Button
            variant={activeView === 'all-chats' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('all-chats')}
            className={activeView === 'all-chats' ? 'bg-pink-500 hover:bg-pink-600 text-white' : ''}
          >
            <Users className="w-4 h-4 mr-1" />
            All Chats
          </Button>
          <Button
            variant={activeView === 'winks' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('winks')}
            className={activeView === 'winks' ? 'bg-pink-500 hover:bg-pink-600 text-white' : ''}
          >
            <Heart className="w-4 h-4 mr-1" />
            Winks
          </Button>
          <Button
            variant={activeView === 'likes' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('likes')}
            className={activeView === 'likes' ? 'bg-pink-500 hover:bg-pink-600 text-white' : ''}
          >
            <Heart className="w-4 h-4 mr-1" />
            Likes
          </Button>
        </div>
      </div>
      {renderContent()}
    </div>
  );
};

export default ChatterSidebar;