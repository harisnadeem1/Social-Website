import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { ArrowLeft, Heart, Eye, MessageCircle, MapPin, Ruler, Briefcase, GraduationCap, Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogOverlay } from '@/components/ui/dialog';
import Header from '@/components/Header';
import AuthContext from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const ProfileDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { coins, updateCoins } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
const [liked, setLiked] = useState(false);




  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/girls/profile/get/${id}`);
        if (!res.ok) throw new Error("Profile not found");
        const data = await res.json();


        setProfile(data);
        if (data.isLikedByCurrentUser) {
  setLiked(true);
}


        console.log(data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        navigate('/'); // optionally redirect back
      }
    };

    fetchProfile();
  }, [id]);

  // const handleLike = () => {
  //   toast({
  //     title: "❤️ Like sent!",
  //     description: `You liked ${profile.name}'s profile!`,
  //   });
  // };

  // const handleWink = () => {
  //   const winkCost = 2;

  //   if (coins >= winkCost) {
  //     updateCoins(coins - winkCost);
  //     toast({
  //       title: "👀 Wink sent successfully!",
  //       description: `You winked at ${profile.name}! (${winkCost} coins used)`,
  //     });
  //   } else {
  //     toast({
  //       title: "Insufficient Coins",
  //       description: `You need at least ${winkCost} coins to wink. Buy coins now!`,
  //       variant: "destructive",
  //       action: (
  //         <Button
  //           size="sm"
  //           onClick={() => navigate('/coins')}
  //           className="bg-yellow-500 hover:bg-yellow-600 text-white"
  //         >
  //           Buy Coins
  //         </Button>
  //       )
  //     });
  //   }
  // };



  const handleWink = async () => {
  const winkCost = 2;

  if (coins < winkCost) {
    toast({
      title: 'Not enough coins',
      description: 'You need at least 2 coins to wink. Please buy coins.',
      variant: 'destructive',
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
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/winks/${profile.user_id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      }
    });

    const data = await res.json();

    if (data.status === 'already_winked') {
      toast({
        title: '👀 Already Winked',
        description: `You've already winked at ${profile.name}.`,
      });
    } else if (data.status === 'wink_sent') {
      toast({
        title: '👀 Wink sent successfully!',
        description: `You winked at ${profile.name} and 2 coins were used.`,
      });

      updateCoins(coins - winkCost); // Optimistically update UI
    } else {
      toast({
        title: 'Wink failed',
        description: data.error || 'Something went wrong.',
        variant: 'destructive'
      });
    }
  } catch (err) {
    console.error(err);
    toast({
      title: 'Wink Failed',
      description: 'Could not send wink due to a network or server error.',
      variant: 'destructive',
    });
  }
};

const authToken = localStorage.getItem('token');

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


  const handleMessage = () => {
    navigate(`/chat?user=${profile.user_id}&name=${encodeURIComponent(profile.name)}`);
  };

  const handleBack = () => {
    navigate('/');
  };

  const openImageModal = (imageUrl, imageIndex) => {
    setSelectedImage({ url: imageUrl, index: imageIndex });
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImage(null);
  };


  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <Helmet>
        <title>{profile.name} - Profile | FlirtDuo</title>
        <meta name="description" content={`View ${profile.name}'s profile on FlirtDuo. ${profile.bio}`} />
      </Helmet>

      <Header />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-6 hover:bg-pink-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profiles
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="overflow-hidden border-0 shadow-lg">
                <div className="relative">
                  <img
                    className="w-full h-96 object-cover cursor-pointer"
                    alt={`${profile.name}'s main profile photo`}
                    onClick={() => openImageModal(profile.profile_image_url || defaultImage, 0)}
                    src={profile.profile_image_url || defaultImage}
                  />

                  {/* Online status (optional field — check first) */}
                  {profile.isOnline && (
                    <div className="absolute top-4 right-4 flex items-center space-x-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                      <div className="w-2 h-2 bg-white rounded-full" />
                      <span>Online</span>
                    </div>
                  )}

                  {/* Age */}
                  {profile.age && (
                    <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-lg font-medium">
                      {profile.age}
                    </div>
                  )}
                </div>


                <div className="lg:hidden p-6">
                  <div className="space-y-4">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={handleLike}
                        className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-600 hover:text-red-700 transition-all duration-200 rounded-full border-0"
                        size="lg"
                      >
                        <Heart className="w-5 h-5 mr-2" />
                        Like Profile
                      </Button>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={handleWink}
                        className="w-full bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 hover:text-orange-700 transition-all duration-200 rounded-full border-0"
                        size="lg"
                        title="Costs 2 coins to Wink"
                      >
                        <Eye className="w-5 h-5 mr-2" />
                        Send Wink (2 coins)
                      </Button>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={handleMessage}
                        className="w-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 hover:text-purple-700 transition-all duration-200 rounded-full border-0"
                        size="lg"
                        title="Costs 5 coins to Chat"
                      >
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Send Message (5 coins)
                      </Button>
                    </motion.div>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                      <div className="flex items-center text-gray-600 mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{profile.city}</span>
                      </div>
                    </div>

                    <p className="text-gray-700 leading-relaxed">{profile.bio}</p>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Interests</h3>
                      <div className="flex flex-wrap gap-2">
                        {(profile.interests?.split(',') || []).map((interest, index) => (
                          <Badge key={index} variant="secondary" className="bg-pink-100 text-pink-700">
                            {interest.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>


                    <div className="lg:hidden space-y-4 pt-4 border-t">
                      <h3 className="text-xl font-bold text-gray-900">Profile Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Ruler className="w-4 h-4 text-gray-500" />
                          <div>
                            <span className="text-xs text-gray-500">Height</span>
                            <div className="font-medium text-sm">{profile.height}</div>
                          </div>
                        </div>



                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <div>
                            <span className="text-xs text-gray-500">Joined</span>
                            <div className="font-medium text-sm">{profile.created_at}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Photos</h2>

                  {profile.photos?.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {profile.photos.map((photo, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          className="aspect-square overflow-hidden rounded-lg"
                        >
                          <img
                            className="w-full h-full object-cover cursor-pointer"
                            alt={`${profile.name} photo ${index + 1}`}
                            onClick={() => openImageModal(photo, index)}
                            src={photo}
                          />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 italic">No gallery images available.</div>
                  )}
                </CardContent>
              </Card>


            </div>

            <div className="hidden lg:block space-y-6">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={handleLike}
                        className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
                        size="lg"
                      >
                        <Heart className="w-5 h-5 mr-2" />
                        Like Profile
                      </Button>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={handleWink}
                        variant="outline"
                        className="w-full border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                        size="lg"
                        title="Costs 2 coins to Wink"
                      >
                        <Eye className="w-5 h-5 mr-2" />
                        Send Wink (2 coins)
                      </Button>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={handleMessage}
                        variant="outline"
                        className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
                        size="lg"
                        title="Costs 5 coins to Chat"
                      >
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Send Message (5 coins)
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
  <CardContent className="p-6">
    <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Details</h2>
    <div className="space-y-4">
      
      {/* Age */}
      <div className="flex items-center space-x-3">
        <Calendar className="w-5 h-5 text-gray-500" />
        <div>
          <span className="text-sm text-gray-500">Age</span>
          <div className="font-medium">{profile.age}</div>
        </div>
      </div>

      {/* Height */}
      <div className="flex items-center space-x-3">
        <Ruler className="w-5 h-5 text-gray-500" />
        <div>
          <span className="text-sm text-gray-500">Height</span>
          <div className="font-medium">{profile.height}</div>
        </div>
      </div>

      {/* Joined Date */}
      <div className="flex items-center space-x-3">
        <Calendar className="w-5 h-5 text-gray-500" />
        <div>
          <span className="text-sm text-gray-500">Joined</span>
          <div className="font-medium">
            {new Date(profile.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </div>

    </div>
  </CardContent>
</Card>

            </div>
          </div>
        </motion.div>
      </main>

      <AnimatePresence>
        {isImageModalOpen && selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={closeImageModal}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-4xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeImageModal}
                className="absolute -top-12 right-0 z-10 p-2 text-white hover:text-gray-300 transition-colors"
              >
                <X className="w-8 h-8" />
              </button>

              <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
                <img
                  className="w-full h-auto max-h-[80vh] object-contain"
                  alt={`${profile.name} photo ${selectedImage.index + 1}`}
                  src={selectedImage?.url || defaultImage}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ProfileDetail;