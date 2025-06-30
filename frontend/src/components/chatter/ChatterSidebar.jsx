import {React,useState,useEffect} from 'react';
import { Button } from '@/components/ui/button.jsx';
import { MessageSquare, Heart, Plus } from 'lucide-react';
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

const handleLikeResponse = async (like) => {
  try {
    await fetch(`${import.meta.env.VITE_API_BASE_URL}/chatter/likes/respond/${like.id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    setLikes(prev => prev.filter(l => l.id !== like.id));
  } catch (error) {
    console.error(error);
  }
};


const handleWinkResponse = async (wink) => {

    console.log(wink);
  try {
    await fetch(`${import.meta.env.VITE_API_BASE_URL}/winks/respond/${wink.id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    // toast({
    //   title: "Wink Responded",
    //   description: `You responded to ${wink.user_name}`,
    // });

    // Optional: update state to remove wink from UI
    setWinks(prev => prev.filter(w => w.id !== wink.id));
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to respond to wink.",
      variant: "destructive"
    });
    console.error(error);
  }
};


  const renderContent = () => {
    switch (activeView) {
      case 'conversations':
        return (
          <ChatterConversationList
            conversations={conversations}
            onSelectChat={onSelectChat}
            formatTime={formatTime}
            allUsers={allUsers}
            girlProfiles={girlProfiles}
            currentChatterId={currentChatterId}
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





  return (
    <div className="h-full flex flex-col w-full lg:w-96 border-r border-gray-200 bg-white">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {activeView === 'conversations' ? 'Conversations' : 'Recent Winks'}
          </h2>
          <StartNewChatModal
            onStartNewChat={onStartNewChat}
            allUsers={allUsers}
            activeGirl={activeGirl}
          >
            <Button size="sm" className="bg-pink-500 hover:bg-pink-600 text-white">
              <Plus className="w-4 h-4" />
            </Button>
          </StartNewChatModal>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={activeView === 'conversations' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('conversations')}
            className={activeView === 'conversations' ? 'bg-pink-500 hover:bg-pink-600 text-white' : ''}
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            Chats
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