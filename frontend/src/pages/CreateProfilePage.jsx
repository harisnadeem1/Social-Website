import React, { useState, useContext, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { useNavigate, useLocation } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import AuthContext from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';
import debounce from "lodash/debounce";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const locationIQKey = import.meta.env.VITE_LOCATIONIQ_API_KEY;

const ProfileCreation = () => {
  const { login } = useContext(AuthContext);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const controllerRef = useRef(null);

  // Get user data from navigation state
  const { userId, userData } = location.state || {};

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    age: '',
    gender: '',
    city: '',
    height: '',
    interests: '',
    profilePhoto: null
  });

  // Redirect if no user data is provided
  useEffect(() => {
    if (!userId || !userData) {
      toast({
        title: "❌ Access Denied",
        description: "Please sign up first to create your profile.",
        variant: "destructive"
      });
      navigate('/');
    }
  }, [userId, userData, navigate, toast]);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const fetchCitySuggestions = debounce(async (query) => {
    if (query.length < 3) {
      setCitySuggestions([]);
      return;
    }

    try {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }

      controllerRef.current = new AbortController();

      const response = await fetch(
        `https://api.locationiq.com/v1/autocomplete?key=${locationIQKey}&q=${encodeURIComponent(query)}&limit=5&normalizecity=1&tag=place:city`,
        { signal: controllerRef.current.signal }
      );

      if (!response.ok) throw new Error("Rate limit or API error");

      const data = await response.json();
      setCitySuggestions(data || []);
      setShowSuggestions(true);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("LocationIQ autocomplete error:", err.message);
      }
    }
  }, 800);

  const searchCity = async (query) => {
    if (!query || query.length < 2) return;

    try {
      const response = await fetch(
        `https://api.locationiq.com/v1/autocomplete?key=${locationIQKey}&q=${encodeURIComponent(query)}&limit=5&normalizecity=1&tag=place:city`
      );
      if (!response.ok) throw new Error("API error");

      const data = await response.json();
      setCitySuggestions(data || []);
      setShowSuggestions(true);
    } catch (err) {
      console.error("LocationIQ search error:", err.message);
    }
  };

  const uploadToImgBB = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!data.success) throw new Error("Image upload failed");

    return data.data.url;
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const imageUrl = await uploadToImgBB(file);
      setProfileData(prev => ({
        ...prev,
        profilePhoto: imageUrl
      }));
    } catch (err) {
      console.error("Image upload error:", err);
      toast({ 
        title: "❌ Upload Failed", 
        description: "Please try a different image.",
        variant: "destructive"
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleCompleteProfile = async () => {
    // Validation
    if (!profileData.name || !profileData.age || !profileData.gender || !profileData.city) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (Name, Age, Gender, City).",
        variant: "destructive"
      });
      return;
    }

    const token = localStorage.getItem('token');
    setIsLoading(true);

    try {
      // Create Profile
      const profileResponse = await axios.post(
        `${BASE_URL}/profile/create`,
        {
          user_id: userId,
          name: profileData.name,
          bio: `Hi! I'm ${profileData.name} from ${profileData.city}. Looking forward to meeting new people!`, // Auto-generated bio
          age: parseInt(profileData.age),
          gender: profileData.gender.toLowerCase(),
          city: profileData.city,
          height: null, // Optional
          interests: null, // Optional
          profile_image_url: profileData.profilePhoto || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const profileId = profileResponse.data.profile.id;

      // Update user context
      const completedUser = {
        ...userData,
        id: userId,
        profileComplete: true,
        profile: {
          ...profileData,
          id: profileId
        }
      };

      login(completedUser);

      toast({
        title: "🎉 Profile Complete!",
        description: "Welcome to Liebenly! You've received 50 free coins to start chatting.",
      });

      // Auto-engagement setup
      try {
        await axios.post(`${BASE_URL}/auto-engagement/rotation`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });

        await axios.post(`${BASE_URL}/auto-engagement/day1`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (engagementError) {
        console.error('Auto-engagement setup error:', engagementError);
        // Don't block profile creation if auto-engagement fails
      }

      // Handle redirect
      const redirectPath = localStorage.getItem("redirectAfterAuth");
      if (redirectPath) {
        localStorage.removeItem("redirectAfterAuth");
        navigate(redirectPath);
      } else {
        navigate('/dashboard');
      }

    } catch (error) {
      console.error('Profile creation error:', error);
      toast({
        title: "❌ Profile Creation Failed",
        description: error.response?.data?.error || "Something went wrong while creating your profile.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if no user data
  if (!userId || !userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <Helmet>
        <title>Create Your Profile - Liebenly</title>
        <meta name="description" content="Complete your Liebenly profile to start meeting amazing people." />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Create Your Profile
              </h1>
              <p className="text-lg text-gray-600">
                Just a few details to get started
              </p>
              <p className="text-sm text-pink-600 mt-2">
                Welcome, {userData.full_name}! Let's set up your profile.
              </p>
            </div>

            <Card className="border-0 shadow-xl bg-white">
              <CardContent className="p-8">
                <div className="space-y-6">
                  {/* Profile Photo Upload */}
                  <div className="text-center">
                    <Label className="text-base font-medium">Profile Photo (Optional)</Label>
                    <div className="mt-4 flex justify-center">
                      <div className="relative">
                        <div className="w-32 h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
                          {isUploadingPhoto ? (
                            <div className="text-gray-500 text-sm">Uploading...</div>
                          ) : profileData.profilePhoto ? (
                            <img
                              src={profileData.profilePhoto}
                              alt="Profile"
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <Camera className="w-8 h-8 text-gray-500" />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            title="Upload Profile Photo"
                          />
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Click to upload a profile photo</p>
                  </div>

                  {/* Required Fields */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="Enter your full name"
                        value={profileData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="mt-1"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="age">Age *</Label>
                        <Input
                          id="age"
                          type="number"
                          placeholder="25"
                          min="18"
                          max="100"
                          value={profileData.age}
                          onChange={(e) => handleInputChange('age', e.target.value)}
                          className="mt-1 h-12"
                          required
                        />
                      </div>

                      <div className="col-span-2">
                        <Label htmlFor="gender">Gender *</Label>
                        <select
                          id="gender"
                          value={profileData.gender}
                          onChange={(e) => handleInputChange('gender', e.target.value)}
                          className="w-full mt-1 h-12 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          required
                        >
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Non-binary">Non-binary</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="city">City/Location *</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="city"
                          placeholder="e.g., New York"
                          value={profileData.city}
                          onChange={(e) => {
                            handleInputChange("city", e.target.value);
                            fetchCitySuggestions(e.target.value);
                          }}
                          required
                        />
                        <Button 
                          type="button" 
                          onClick={() => searchCity(profileData.city)}
                          variant="outline"
                        >
                          Search
                        </Button>
                      </div>

                      {showSuggestions && citySuggestions.length > 0 && (
                        <ul className="bg-white border rounded mt-2 shadow-md max-h-40 overflow-auto">
                          {citySuggestions.map((place, index) => (
                            <li
                              key={index}
                              onClick={() => {
                                const city = place.address?.city || place.address?.name || "";
                                const country = place.address?.country || "";
                                handleInputChange("city", `${city}, ${country}`);
                                setShowSuggestions(false);
                              }}
                              className="p-2 cursor-pointer hover:bg-gray-100"
                            >
                              {place.address?.city || place.address?.name},{" "}
                              {place.address?.country}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">🎉 What's Next?</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• You'll get 50 free coins to start chatting</li>
                      <li>• Browse profiles and find your matches</li>
                      <li>• You can always edit your profile later</li>
                      <li>• Add more photos and details anytime</li>
                    </ul>
                  </div> */}

                  <Button
                    onClick={handleCompleteProfile}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-3 text-lg"
                  >
                    {isLoading ? "Creating Profile..." : "Create My Profile"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCreation;