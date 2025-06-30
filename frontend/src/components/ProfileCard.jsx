import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Smile, MessageCircle, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AuthContext from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const ProfileCard = ({ profile, onClick }) => {
  const { coins, updateCoins } = useContext(AuthContext);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLike = (e) => {
    e.stopPropagation();
    toast({
      title: "❤️ Like sent!",
      description: `You liked ${profile.name}'s profile!`,
    });
  };
  const authToken = localStorage.getItem('token');


 const handleWink = async (e) => {
  e.stopPropagation();
  const winkCost = 2;

  if (coins < winkCost) {
    toast({
      title: "Insufficient Coins",
      description: `You need at least ${winkCost} coins to wink. Buy coins now!`,
      variant: "destructive",
      action: (
        <Button 
          size="sm" 
          onClick={() => navigate('/coins')}
          className="bg-yellow-500 hover:bg-yellow-600 text-white"
        >
          Buy Coins
        </Button>
      )
    });
    return;
  }

  try {
    // Step 1: Fetch user_id from profile.id
    const userIdRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/profile/user-id/${profile.id}`);
    const userData = await userIdRes.json();

    if (!userIdRes.ok || !userData.user_id) {
      throw new Error("Failed to fetch user ID");
    }

    const receiverId = userData.user_id;

    // Step 2: Send wink to the user_id
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/winks/${receiverId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      }
    });

    const data = await res.json();

    if (data.status === 'already_winked') {
      toast({
        title: "👀 Already Winked",
        description: `You've already winked at ${profile.name}.`,
      });
    } else if (data.status === 'wink_sent') {
      updateCoins(coins - winkCost); // frontend sync
      updateCoins(data.remainingCoins);
      toast({
        title: "👀 Wink Sent",
        description: `You winked at ${profile.name} and used ${winkCost} coins.`,
      });
    } else {
      toast({
        title: "Wink Failed",
        description: data.error || "Something went wrong.",
        variant: "destructive"
      });
    }

  } catch (err) {
    console.error("Wink error:", err);
    toast({
      title: "Error",
      description: err.message || "Could not send wink. Try again later.",
      variant: "destructive"
    });
  }
};


const handleMessage = async (e) => {
  e.stopPropagation();
  const token = localStorage.getItem('token');

  try {
    // Step 1: Get user_id from profile.id
    const userIdRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/profile/user-id/${profile.id}`);
    const userData = await userIdRes.json();

    if (!userIdRes.ok || !userData.user_id) {
      throw new Error("Failed to fetch girl’s user ID");
    }

    const girlUserId = userData.user_id;

    // Step 2: Start conversation (or get existing one)
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/conversations/start/${girlUserId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await res.json();

    if (res.ok && data.conversationId) {
      // Step 3: Redirect to chat page
      navigate(`/chat?user=${girlUserId}&name=${encodeURIComponent(profile.name)}`);
    } else {
      toast({
        title: "Chat Error",
        description: data.message || "Could not start conversation.",
        variant: "destructive"
      });
    }

  } catch (err) {
    console.error("Start chat error:", err);
    toast({
      title: "Error",
      description: err.message || "Could not start chat. Try again later.",
      variant: "destructive"
    });
  }
};



  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Card 
        className="relative overflow-hidden cursor-pointer bg-white shadow-lg hover:shadow-2xl border-0 transition-all duration-300 rounded-2xl h-80 sm:h-96"
        onClick={() => onClick(profile)}
      >
        <div className="absolute inset-0">
          <img  
  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
  alt={`${profile.name}, ${profile.age} years old from ${profile.city}`}
  src={profile.profile_image_url || "/fallback.jpg"}
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = "/fallback.jpg";
  }}
/>
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-all duration-300"></div>
        </div>
        
        {profile.isOnline && (
          <div className="absolute top-4 right-4 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg z-10"></div>
        )}
        
        <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm z-10">
          {profile.age}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white z-10">
          <div className="mb-4">
            <h3 className="text-xl sm:text-2xl font-bold mb-2 drop-shadow-lg">
              {profile.name}
            </h3>
            <div className="flex items-center text-white/90 text-sm sm:text-base drop-shadow-md">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
              <span>{profile.city}</span>
            </div>
          </div>
          
          <div className="flex justify-center space-x-2 sm:space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className="flex-1 bg-red-500/20 hover:bg-red-500/40 text-white hover:text-white transition-all duration-200 group/btn rounded-full border border-red-400/30 backdrop-blur-sm"
              title="Free to Like"
            >
              <Heart className="w-4 h-4 mr-1 group-hover/btn:scale-110 transition-transform" />
              <span className="hidden sm:inline">Like</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleWink}
              className="flex-1 bg-yellow-500/20 hover:bg-yellow-500/40 text-white hover:text-white transition-all duration-200 group/btn rounded-full border border-yellow-400/30 backdrop-blur-sm"
              title="Costs 2 coins to Wink"
            >
              <Smile className="w-4 h-4 mr-1 group-hover/btn:scale-110 transition-transform" />
              <span className="hidden sm:inline">Wink</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMessage}
              className="flex-1 bg-purple-500/20 hover:bg-purple-500/40 text-white hover:text-white transition-all duration-200 group/btn rounded-full border border-purple-400/30 backdrop-blur-sm"
              title="Costs 5 coins to Chat"
            >
              <MessageCircle className="w-4 h-4 mr-1 group-hover/btn:scale-110 transition-transform" />
              <span className="hidden sm:inline">Chat</span>
            </Button>
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </Card>
    </motion.div>
  );
};

export default ProfileCard;