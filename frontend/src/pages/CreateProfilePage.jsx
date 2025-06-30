import React, { useState, useContext, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { useNavigate, useLocation } from 'react-router-dom';
import { Camera, Plus, ArrowRight, ArrowLeft } from 'lucide-react';
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







  const [cityQuery, setCityQuery] = useState("");
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const controllerRef = useRef(null);


  const fetchCitySuggestions = debounce(async (query) => {
    if (query.length < 3) {
      setCitySuggestions([]);
      return;
    }

    try {
      // Cancel previous request
      if (controllerRef.current) {
        controllerRef.current.abort();
      }

      controllerRef.current = new AbortController();

      const response = await fetch(
        `https://api.locationiq.com/v1/autocomplete?key=${import.meta.env.VITE_LOCATIONIQ_API_KEY}&q=${encodeURIComponent(query)}&limit=5&normalizecity=1&tag=place:city`,
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
  }, 800); // debounce increased to reduce API calls

const searchCity = async (query) => {
  if (!query || query.length < 2) return;

  try {
    const response = await fetch(
      `https://api.locationiq.com/v1/autocomplete?key=${import.meta.env.VITE_LOCATIONIQ_API_KEY}&q=${encodeURIComponent(query)}&limit=5&normalizecity=1&tag=place:city`
    );
    if (!response.ok) throw new Error("API error");

    const data = await response.json();
    setCitySuggestions(data || []);
    setShowSuggestions(true);
  } catch (err) {
    console.error("LocationIQ search error:", err.message);
  }
};



  // Get user data from navigation state
  const { userId, userData } = location.state || {};

  const [currentStep, setCurrentStep] = useState(1);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    age: '',
    gender: '',
    city: '',
    height: '',
    bio: '',
    interests: '',
    lookingFor: '',
    profilePhoto: null,
    galleryPhotos: []
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



  const handlePhotoUpload = async (type, event) => {
    const files = type === "gallery" ? Array.from(event.target.files) : [event.target.files[0]];
    setIsUploadingPhoto(true);
    try {
      const uploadedUrls = [];

      for (const file of files) {
        const imageUrl = await uploadToImgBB(file);
        uploadedUrls.push(imageUrl);
      }

      setProfileData((prev) => ({
        ...prev,
        profilePhoto: type === "profile" ? uploadedUrls[0] : prev.profilePhoto,
        galleryPhotos: type === "gallery" ? [...prev.galleryPhotos, ...uploadedUrls] : prev.galleryPhotos,
      }));
    } catch (err) {
      console.error("Image upload error:", err);
      toast({ title: "❌ Upload Failed", description: "Please try a different image." });
    } finally {
      setIsUploadingPhoto(false);
    }
  };



  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!profileData.name || !profileData.age || !profileData.gender) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields to continue.",
          variant: "destructive"
        });
        return;
      }
    }

    if (currentStep === 2) {
      if (!profileData.city || !profileData.lookingFor) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields to continue.",
          variant: "destructive"
        });
        return;
      }
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCompleteProfile = async () => {
    const token = localStorage.getItem('token');
    if (!profileData.bio) {
      toast({
        title: "Missing Information",
        description: "Please add a bio to complete your profile.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Step 1: Create Profile
      const profileResponse = await axios.post(
        `${BASE_URL}/profile/create`,
        {
          user_id: userId,
          name: profileData.name,
          bio: profileData.bio,
          age: parseInt(profileData.age),
          gender: profileData.gender.toLowerCase(),
          city: profileData.city,
          height: profileData.height,
          interests: profileData.interests,
          profile_image_url: profileData.profilePhoto || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const profileId = profileResponse.data.profile.id;

      // ✅ Step 2: Save gallery images
      for (const url of profileData.galleryPhotos) {
        await axios.post(`${BASE_URL}/profile/gallery`, {
          imageUrl: url
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      // Step 3: Update user context
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
        description: "Welcome to FlirtDuo! You've received 50 free coins to start chatting.",
      });

      navigate('/dashboard');

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

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>
        <p className="text-gray-600">Let's start with the essentials</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            placeholder="Enter your full name"
            value={profileData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="gender">Gender *</Label>
            <select
              id="gender"
              value={profileData.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
          <Label htmlFor="height">Height (Optional)</Label>
          <select
            id="height"
            value={profileData.height}
            onChange={(e) => handleInputChange('height', e.target.value)}
            className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="">Select height</option>
            <option value="under 5ft">Under 5'0"</option>
            <option value="5'0 - 5'3">5'0" - 5'3"</option>
            <option value="5'4 - 5'7">5'4" - 5'7"</option>
            <option value="5'8 - 5'11">5'8" - 5'11"</option>
            <option value="6'0 - 6'3">6'0" - 6'3"</option>
            <option value="Over 6'3">Over 6'3"</option>
          </select>
        </div>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Location & Preferences</h2>
        <p className="text-gray-600">Help us find your perfect matches</p>
      </div>

      <div className="space-y-4">
       <div className="space-y-4">
  <div>
    <Label htmlFor="city">City/Location *</Label>
    <div className="flex gap-2 mt-1">
      <Input
        id="city"
        placeholder="e.g., New York"
        value={profileData.city}
        onChange={(e) => handleInputChange("city", e.target.value)}
      />
      <Button type="button" onClick={() => searchCity(profileData.city)}>
        Search
      </Button>
    </div>
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



        <div>
          <Label htmlFor="lookingFor">What are you looking for? *</Label>
          <select
            id="lookingFor"
            value={profileData.lookingFor}
            onChange={(e) => handleInputChange('lookingFor', e.target.value)}
            className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="">Select your intention</option>
            <option value="long-term">Long-term relationship</option>
            <option value="dating">Dating & getting to know someone</option>
            <option value="friendship">Friendship</option>
            <option value="casual">Casual dating</option>
          </select>
        </div>

        <div>
          <Label htmlFor="interests">Interests & Hobbies (Optional)</Label>
          <Input
            id="interests"
            placeholder="e.g., Photography, Hiking, Cooking, Travel"
            value={profileData.interests}
            onChange={(e) => handleInputChange('interests', e.target.value)}
            className="mt-1"
          />
          <p className="text-sm text-gray-500 mt-1">Separate multiple interests with commas</p>
        </div>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Your Photos</h2>
        <p className="text-gray-600">Show your personality with great photos</p>
      </div>

      <div className="space-y-6">
        {/* Profile Photo Upload */}
        <div>
          <Label>Profile Photo</Label>
          <div className="mt-2 flex justify-center">
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
                  onChange={(e) => handlePhotoUpload("profile", e)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  title="Upload Profile Photo"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Upload */}
        <div>
          <Label>Gallery Photos (Optional)</Label>
          <div className="mt-2 grid grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="relative">
                <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-pink-400 transition-colors overflow-hidden">
                  {isUploadingPhoto && profileData.galleryPhotos.length === index ? (
                    <div className="text-gray-500 text-xs">Uploading...</div>
                  ) : profileData.galleryPhotos[index] ? (
                    <img
                      src={profileData.galleryPhotos[index]}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Plus className="w-6 h-6 text-gray-400" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload("gallery", e)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    title="Upload Gallery Photo"
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">Add up to 6 additional photos to showcase your personality</p>
        </div>
      </div>
    </motion.div>
  );


  const renderStep4 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell Your Story</h2>
        <p className="text-gray-600">Write a bio that represents the real you</p>
      </div>

      <div>
        <Label htmlFor="bio">About Me *</Label>
        <textarea
          id="bio"
          placeholder="Tell potential matches about yourself, your interests, what you're looking for, and what makes you unique..."
          value={profileData.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          rows={6}
          className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
          maxLength={500}
        />
        <p className="text-sm text-gray-500 mt-1">
          {profileData.bio.length}/500 characters
        </p>
      </div>

      <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">💡 Bio Tips:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Be authentic and genuine</li>
          <li>• Mention your hobbies and interests</li>
          <li>• Share what you're looking for</li>
          <li>• Add a touch of humor if that's your style</li>
          <li>• Keep it positive and engaging</li>
        </ul>
      </div>
    </motion.div>
  );

  const steps = [
    { number: 1, title: "Basic Info", component: renderStep1 },
    { number: 2, title: "Preferences", component: renderStep2 },
    { number: 3, title: "Photos", component: renderStep3 },
    { number: 4, title: "Bio", component: renderStep4 }
  ];

  // Don't render if no user data
  if (!userId || !userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <Helmet>
        <title>Create Your Profile - FlirtDuo</title>
        <meta name="description" content="Complete your FlirtDuo profile to start meeting amazing people. Add your photos, write your bio, and set your preferences." />
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
                Step {currentStep} of {steps.length}
              </p>
              <p className="text-sm text-pink-600 mt-2">
                Welcome, {userData.full_name}! Let's set up your profile.
              </p>
            </div>

            <div className="flex justify-center mb-8">
              <div className="flex space-x-2">
                {steps.map((step) => (
                  <div key={step.number} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step.number <= currentStep
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                        }`}
                    >
                      {step.number}
                    </div>
                    {step.number < steps.length && (
                      <div
                        className={`w-8 h-1 mx-2 transition-colors ${step.number < currentStep
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600'
                          : 'bg-gray-200'
                          }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Card className="border-0 shadow-xl bg-white">
              <CardContent className="p-8">
                {steps[currentStep - 1].component()}

                <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={handlePrevStep}
                    disabled={currentStep === 1}
                    className="flex items-center"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  {currentStep < 4 ? (
                    <Button
                      onClick={handleNextStep}
                      className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white flex items-center"
                    >
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleCompleteProfile}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white flex items-center"
                    >
                      {isLoading ? "Creating Profile..." : "Complete Profile"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
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