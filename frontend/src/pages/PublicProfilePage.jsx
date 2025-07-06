import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Heart, Menu, MessageCircle, Star, ArrowLeft, X, Instagram, MapPin, Info, Camera, ChevronDown } from 'lucide-react';

import SignupModal from '../components/homepage/SignupModal';
import LoginModal from '../components/homepage/LoginModal';
import MobileMenu from '@/components/homepage/MobileMenu';
import { useNavigate } from 'react-router-dom';

import AuthContext from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function PublicProfilePage() {
  const { username } = useParams();
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [showFullBio, setShowFullBio] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/public/profile/${username}`);
        if (!res.ok) throw new Error('Profile not found');
        const data = await res.json();
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  const handleChatClick = async () => {
    if (!user) {
      setShowSignupModal(true);
    } else if(user.role=="user") {
      console.log(user);
     
    const token = localStorage.getItem('token');


      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/conversations/start/${profile.user_id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();

      if (res.ok && data.conversationId) {
        // Step 3: Redirect to chat page
              navigate(`/chat?user=${profile.user_id}&name=${encodeURIComponent(profile.name)}`);

      } else {
        toast({
          title: "Chat Error",
          description: data.message || "Could not start conversation.",
          variant: "destructive"
        });
      }




      // navigate(`/chat?user=${profile.user_id}&name=${encodeURIComponent(profile.name)}`);
      // console.log('Navigate to chat with', profile.name);
    }
  };

  const handleSuperLike = () => {
    if (!user) {
      setShowSignupModal(true);
    } else {
      // Future: API call to send super like
      console.log('Super like sent to', profile.name);
    }
  };

  const handleLike = () => {
    if (!user) {
      setShowSignupModal(true);
    } else {
      // Future: API call to send like
      console.log('Like sent to', profile.name);
    }
  };

  const handleLogin = () => setShowLoginModal(true);
  const handleSignUp = () => setShowSignupModal(true);

  const switchToSignup = () => {
    setShowLoginModal(false);
    setShowSignupModal(true);
  };

  const switchToLogin = () => {
    setShowSignupModal(false);
    setShowLoginModal(true);
  };

  // Create array of all images (profile image + gallery images)
  const allImages = profile ? [
    profile.profile_image_url,
    ...(profile.images || []).map(img => img.image_url)
  ].filter(Boolean) : [];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <>
        <Helmet>
          <title>Profile Not Found - Liebenly</title>
        </Helmet>
        <div className="flex flex-col justify-center items-center min-h-screen bg-black text-white">
          <div className="text-6xl mb-4">💔</div>
          <h1 className="text-2xl font-bold mb-2">Profile not found</h1>
          <p className="text-gray-400">This profile doesn't exist or has been removed.</p>
          <Link to="/" className="mt-4 text-pink-500 hover:text-pink-400 underline">
            Back to Home
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{profile.name} - Liebenly</title>
        <meta name="description" content={`Meet ${profile.name}, ${profile.age} from ${profile.city}.`} />
      </Helmet>

      <div className="min-h-screen bg-black text-white">
        {/* Mobile View - Tinder Style */}
        <div className="md:hidden">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-50 p-4 bg-gradient-to-b from-black/50 to-transparent">
            <div className="flex justify-between items-center">
              <Link to="/" className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center">
                <ArrowLeft className="w-5 h-5 text-white" />
              </Link>
              <button
                onClick={() => setShowMobileMenu(true)}
                className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center"
              >
                <Menu className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Image Navigation Dots */}
          {allImages.length > 1 && (
            <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-40 flex space-x-1">
              {allImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`h-1 rounded-full transition-all ${index === currentImageIndex ? 'bg-white w-8' : 'bg-white/30 w-1'
                    }`}
                />
              ))}
            </div>
          )}

          {/* Main Image */}
          <div className="relative h-screen overflow-hidden">
            <img
              src={allImages[currentImageIndex] || profile.profile_image_url}
              alt={profile.name}
              className="w-full h-full object-cover"
            />

            {/* Touch Areas for Navigation */}
            {allImages.length > 1 && (
              <div className="absolute inset-0 flex">
                <button
                  onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
                  className="flex-1 opacity-0"
                  disabled={currentImageIndex === 0}
                />
                <button
                  onClick={() => setCurrentImageIndex(Math.min(allImages.length - 1, currentImageIndex + 1))}
                  className="flex-1 opacity-0"
                  disabled={currentImageIndex === allImages.length - 1}
                />
              </div>
            )}

            {/* Bottom Gradient Overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

            {/* Profile Info */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="mb-4">
                <h1 className="text-4xl font-bold mb-2">
                  {profile.name} <span className="font-light">{profile.age}</span>
                </h1>
                <div className="flex items-center mb-2">
                  <MapPin className="w-4 h-4 mr-1 text-gray-300" />
                  <span className="text-gray-300">{profile.city}</span>
                </div>
                {profile.instagram && (
                  <div className="flex items-center">
                    <Instagram className="w-4 h-4 mr-1 text-gray-300" />
                    <span className="text-gray-300">{profile.instagram}</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={handleChatClick}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Heart className="w-5 h-5" />
                <span>{user ? 'Send Message' : 'Log in to like me'}</span>
              </button>

              {/* Info Button */}
              <button
                onClick={() => setShowDetails(true)}
                className="w-full mt-3 border border-white/30 text-white font-medium py-3 rounded-full backdrop-blur-md bg-white/10"
              >
                See More Info
              </button>
            </div>
          </div>
        </div>

        {/* Desktop View - Card Style */}
        <div className="hidden md:flex min-h-screen items-center justify-center p-8">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-40 border-b border-gray-800 bg-black/95 backdrop-blur-md">
            <div className="container mx-auto px-6 h-16 flex items-center justify-between">
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Liebenly</span>
              </Link>
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={handleLogin}
                  className="text-gray-300 hover:text-white hover:bg-gray-800 transition-colors px-4 py-2"
                >
                  Login
                </Button>
                <Button
                  onClick={handleSignUp}
                  className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-6 py-2 rounded-full transition-all duration-300"
                >
                  Sign Up
                </Button>
              </div>
            </div>
          </div>

          {/* Tinder Card */}
          <div className="relative w-full max-w-sm mx-auto">
            <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
              {/* Image Navigation Dots */}
              {allImages.length > 1 && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 flex space-x-1">
                  {allImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`h-1 rounded-full transition-all ${index === currentImageIndex ? 'bg-white w-8' : 'bg-white/30 w-1'
                        }`}
                    />
                  ))}
                </div>
              )}

              {/* Main Image */}
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={allImages[currentImageIndex] || profile.profile_image_url}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />

                {/* Navigation Areas */}
                {allImages.length > 1 && (
                  <div className="absolute inset-0 flex">
                    <button
                      onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
                      className="flex-1 opacity-0 hover:opacity-100 transition-opacity bg-gradient-to-r from-black/20 to-transparent"
                      disabled={currentImageIndex === 0}
                    />
                    <button
                      onClick={() => setCurrentImageIndex(Math.min(allImages.length - 1, currentImageIndex + 1))}
                      className="flex-1 opacity-0 hover:opacity-100 transition-opacity bg-gradient-to-l from-black/20 to-transparent"
                      disabled={currentImageIndex === allImages.length - 1}
                    />
                  </div>
                )}

                {/* Bottom Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-6">
                  <h1 className="text-3xl font-bold mb-1">
                    {profile.name} <span className="font-light">{profile.age}</span>
                  </h1>
                  {profile.instagram && (
                    <div className="flex items-center text-gray-300">
                      <Instagram className="w-4 h-4 mr-1" />
                      <span>{profile.instagram}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-6">
              <button
                onClick={handleChatClick}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Heart className="w-5 h-5" />
                <span>{user ? 'Send Message' : 'Log in to like me'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Details Modal */}
        {showDetails && (
          <div className="fixed inset-0 bg-black z-50 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{profile.name}'s Profile</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Bio */}
                {profile.bio && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center">
                      <Info className="w-5 h-5 mr-2 text-pink-500" />
                      About {profile.name}
                    </h3>
                    <div className="relative">
                      <p className={`text-gray-300 leading-relaxed ${!showFullBio && profile.bio.length > 150 ? 'line-clamp-3' : ''}`}>
                        {profile.bio}
                      </p>
                      {profile.bio.length > 150 && (
                        <button
                          onClick={() => setShowFullBio(!showFullBio)}
                          className="text-pink-500 font-medium mt-2 flex items-center text-sm hover:text-pink-400 transition-colors"
                        >
                          {showFullBio ? 'Show Less' : 'Show More'}
                          <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showFullBio ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Basic Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {profile.height && (
                      <div className="bg-gray-800 rounded-xl p-4">
                        <div className="text-sm text-gray-400 mb-1">Height</div>
                        <div className="font-semibold text-white">{profile.height}</div>
                      </div>
                    )}
                    <div className="bg-gray-800 rounded-xl p-4">
                      <div className="text-sm text-gray-400 mb-1">Location</div>
                      <div className="font-semibold text-white">{profile.city}</div>
                    </div>
                  </div>
                </div>

                {/* Interests */}
                {profile.interests && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.split(',').map((interest, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm"
                        >
                          {interest.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Photo Gallery */}
                {profile.images && profile.images.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <Camera className="w-5 h-5 mr-2 text-pink-500" />
                      More Photos
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {profile.images.map((img, index) => (
                        <button
                          key={img.id}
                          onClick={() => {
                            setCurrentImageIndex(index + 1);
                            setShowDetails(false);
                          }}
                          className="aspect-square rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                        >
                          <img
                            src={img.image_url}
                            alt="Gallery"
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  <button
                    onClick={handleChatClick}
                    className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-semibold py-4 rounded-full transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>{user ? 'Send Message' : 'Login to Message'}</span>
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleSuperLike}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-full transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <Star className="w-4 h-4 fill-current" />
                      <span>Super Like</span>
                    </button>
                    <button
                      onClick={handleLike}
                      className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-full transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <Heart className="w-4 h-4" />
                      <span>Like</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        <SignupModal
          open={showSignupModal}
          onOpenChange={setShowSignupModal}
          onSwitchToLogin={switchToLogin}
        />

        <LoginModal
          open={showLoginModal}
          onOpenChange={setShowLoginModal}
          onSwitchToSignup={switchToSignup}
        />

        <MobileMenu
          isOpen={showMobileMenu}
          onClose={() => setShowMobileMenu(false)}
          onLogin={handleLogin}
          onSignUp={handleSignUp}
        />
      </div>
    </>
  );
}