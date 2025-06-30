import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Smile, MessageCircle, MessageSquare, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AuthContext from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const ProfileCard = ({ profile, onClick }) => {
  const { coins, updateCoins } = useContext(AuthContext);
  const { toast } = useToast();
  const [liked, setLiked] = useState(false);
  const navigate = useNavigate();



  useEffect(() => {
    const fetchLikeStatus = async () => {
      const authToken = localStorage.getItem('token');

      try {
        const userIdRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/profile/user-id/${profile.id}`);
        const userData = await userIdRes.json();
        const receiverId = userData.user_id;

        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/likes/status/${receiverId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        const data = await res.json();
        setLiked(data.liked);
      } catch (err) {
        console.error('Failed to fetch like status:', err);
      }
    };

    fetchLikeStatus();
  }, [profile.id]);

  const handleLike = async (e) => {
    e.stopPropagation();
    const authToken = localStorage.getItem('token');

    try {
      // Get user ID from profile ID
      const userIdRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/profile/user-id/${profile.id}`);
      const userData = await userIdRes.json();
      const receiverId = userData.user_id;

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/likes/${receiverId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        }
      });

      const data = await res.json();

      if (data.status === 'like_sent') {
        setLiked(true);
        toast({
          title: "❤️ Like sent!",
          description: `You liked ${profile.name}'s profile!`,
        });
      } else if (data.status === 'already_liked') {
        setLiked(true);
        toast({
          title: "Already Liked",
          description: `You already liked ${profile.name}.`,
        });
      } else {
        throw new Error(data.error || 'Failed to send like');
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
    }
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
            <div className="mt-6 flex justify-center gap-6">
  {/* Like Button */}
  <button
    onClick={handleLike}
    className="w-14 h-14 rounded-full border-2 border-red-500 flex items-center justify-center bg-transparent group transition-all duration-200"
    title="Like"
  >
    <Heart
      className={`w-7 h-7 transition-all duration-200 ${
        liked ? 'fill-red-500 text-red-500' : 'fill-none text-red-500 '
      }`}
    />
  </button>

  {/* Wink Button */}
  <button
    onClick={handleWink}
    className="w-14 h-14 rounded-full border-2 border-yellow-500 text-yellow-500 flex items-center justify-center bg-transparent group transition-all duration-200"
    title="Wink"
  >
    <Smile className="w-7 h-7 transition-all duration-200 " />
  </button>

  {/* Message Button */}
  <button
    onClick={handleMessage}
    className="w-14 h-14 rounded-full border-2 border-blue-500 text-blue-500 flex items-center justify-center bg-transparent group transition-all duration-200"
    title="Message"
  >
    <MessageSquare className="w-7 h-7 transition-all duration-200 " />
  </button>
</div>


          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </Card>
    </motion.div>
  );
};

export default ProfileCard;