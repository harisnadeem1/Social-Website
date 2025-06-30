import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Camera, Edit3, Save, X, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Header from '@/components/Header';
import MobileHeader from '@/components/MobileHeader';
import AuthContext from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useEffect } from 'react';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const MyProfile = () => {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    id: null,
    user_id: null,
    bio: '',
    age: '',
    gender: '',
    city: '',
    height: '',
    interests: '',
    profile_image_url: '',
    is_featured: false,
    visibility: 'public',
    created_at: ''
  });


  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);


  const [galleryImages, setGalleryImages] = useState([
    { id: 1, description: 'Professional headshot of a confident person smiling' },
    { id: 2, description: 'Person hiking in mountains with scenic background' },
    { id: 3, description: 'Casual photo at a coffee shop with warm lighting' },
    { id: 4, description: 'Person cooking in a modern kitchen, candid moment' },
    { id: 5, description: 'Travel photo at a famous landmark, happy expression' }
  ]);

  useEffect(() => {
    const fetchGallery = async () => {
      const res = await axios.get(`${BASE_URL}/profile/gallery`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setGalleryImages(res.data);
    };
    fetchGallery();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${BASE_URL}/profile/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });






        setProfileData(res.data); // assuming it matches your state shape
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "❌ Failed to load profile",
          description: error.response?.data?.error || "Please try again later.",
          variant: "destructive",
        });
      }
    };

    if (user?.id) fetchProfile();
  }, [user?.id]);



  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };


  const handleUpdatePhoto = async (file, type) => {
    if (!file) return;
    setUploadingProfile(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await axios.post(
        `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`,
        formData
      );
      const imageUrl = res.data.data.url;

      if (type === "profile") {
        // Update profile photo
        await axios.put(`${BASE_URL}/profile/photo`, {
          imageUrl,
          type,
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        // Refresh profile data
        const updated = await axios.get(`${BASE_URL}/profile/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setProfileData(updated.data);

      } else if (type === "gallery") {
        // Upload to gallery
        await axios.post(`${BASE_URL}/profile/gallery`, {
          imageUrl,
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        // Refresh gallery images
        const updatedGallery = await axios.get(`${BASE_URL}/profile/gallery`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setGalleryImages(updatedGallery.data);
      }

    } catch (err) {
      console.error("Upload failed:", err);
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploadingProfile(false);
    }
  };



  const handleDeleteImage = async (imageId) => {
    try {
      await axios.delete(`${BASE_URL}/profile/gallery/${imageId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setGalleryImages(prev => prev.filter(img => img.id !== imageId));
    } catch (error) {
      console.error("Delete failed", error);
    }
  };


  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(`${BASE_URL}/profile/update`, profileData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setIsEditing(false);
      toast({
        title: "✅ Profile updated",
        description: "Your profile has been saved.",
      });
    } catch (err) {
      console.error("Failed to update profile", err);
      toast({
        title: "❌ Update failed",
        description: err.response?.data?.error || "Please try again.",
        variant: "destructive"
      });
    }
  };


 const handleUploadPhoto = async () => {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.click();

  fileInput.onchange = async () => {
    const file = fileInput.files[0];
    if (!file) return;

    setUploadingGallery(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await axios.post(
        `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`,
        formData
      );
      const imageUrl = res.data.data.url;

      await axios.post(`${BASE_URL}/profile/gallery`, { imageUrl }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      const updatedGallery = await axios.get(`${BASE_URL}/profile/gallery`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setGalleryImages(updatedGallery.data);
    } catch (err) {
      console.error("Upload failed:", err);
      toast({ title: "Image upload failed", variant: "destructive" });
    } finally {
      setUploadingGallery(false);
    }
  };
};

  const handleChangeProfilePhoto = () => {
    toast({
      title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <Helmet>
        <title>My Profile - FlirtDuo</title>
        <meta name="description" content="Manage your FlirtDuo profile. Edit your information, upload photos, and customize how other users see you." />
      </Helmet>

      <Header />
      <MobileHeader />

      <main className="container mx-auto px-4 py-6 lg:py-8 pt-20 lg:pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
              <p className="text-lg text-gray-600">Manage your profile information and photos</p>
            </div>

            <div className="space-y-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-pink-50">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                    <CardTitle className="text-2xl font-bold text-gray-900">Profile Information</CardTitle>
                    {!isEditing ? (
                      <Button
                        onClick={() => setIsEditing(true)}
                        className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex space-x-2">
                        <Button
                          onClick={handleSaveChanges}
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">


                  <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                    <div className="relative">
                      <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Profile Photo</h3>
                        <div className="relative w-32 h-32">
                          <img
                            src={profileData?.profile_image_url || "/fallback.jpg"}
                            alt="Profile"
                            className={`w-full h-full rounded-full object-cover border-4 border-white shadow ${uploadingProfile ? 'opacity-50' : ''}`}
                          />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleUpdatePhoto(e.target.files[0], "profile")}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            title="Click to change profile photo"
                            disabled={uploadingProfile}
                          />
                          {uploadingProfile && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-full">
                              <span className="text-sm font-medium text-gray-700 animate-pulse">Uploading...</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        disabled={uploadingProfile}
                        onClick={() => document.querySelector('#profile-upload').click()}
                        className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white p-0"
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                      <input
                        type="file"
                        id="profile-upload"
                        accept="image/*"
                        onChange={(e) => handleUpdatePhoto(e.target.files[0], "profile")}
                        className="hidden"
                        disabled={uploadingProfile}
                      />
                    </div>

                    <div className="text-center sm:text-left">
                      <h3 className="text-xl font-bold text-gray-900">{profileData.name}</h3>
                      <p className="text-gray-600">{profileData.age} years old • {profileData.city}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.querySelector('#profile-upload').click()}
                        disabled={uploadingProfile}
                        className="mt-2"
                      >
                        {uploadingProfile ? 'Uploading...' : 'Change Photo'}
                      </Button>
                    </div>
                  </div>


                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-md">{profileData.name}</div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      {isEditing ? (
                        <Input
                          id="age"
                          type="number"
                          value={profileData.age}
                          onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-md">{profileData.age}</div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      {isEditing ? (
                        <select
                          id="gender"
                          value={profileData.gender}
                          onChange={(e) => handleInputChange('gender', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Non-binary">Non-binary</option>
                          <option value="Other">Other</option>
                        </select>
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-md">{profileData.gender}</div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">City/Country</Label>
                      {isEditing ? (
                        <Input
                          id="city"
                          value={profileData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-md">{profileData.city}</div>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="height">Height</Label>
                      {isEditing ? (
                        <Input
                          id="height"
                          value={profileData.height}
                          onChange={(e) => handleInputChange('height', e.target.value)}
                          placeholder="e.g., 5'10&quot; or 178cm"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-md">{profileData.height}</div>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="bio">Bio/Description</Label>
                      {isEditing ? (
                        <textarea
                          id="bio"
                          value={profileData.bio}
                          onChange={(e) => handleInputChange('bio', e.target.value)}
                          rows={4}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-md">{profileData.bio}</div>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="interests">Interests</Label>
                      {isEditing ? (
                        <Input
                          id="interests"
                          value={profileData.interests}
                          onChange={(e) => handleInputChange('interests', e.target.value)}
                          placeholder="Separate interests with commas"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-md">{profileData.interests}</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50">
  <CardHeader>
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
      <CardTitle className="text-2xl font-bold text-gray-900">Photo Gallery</CardTitle>
      <Button
        onClick={handleUploadPhoto}
        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
        disabled={uploadingGallery}
      >
        {uploadingGallery ? (
          <span className="flex items-center space-x-2">
            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Uploading...</span>
          </span>
        ) : (
          <>
            <Plus className="w-4 h-4 mr-2" />
            Upload New Photo
          </>
        )}
      </Button>
    </div>
  </CardHeader>

  <CardContent>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {galleryImages.map((image, index) => (
        <motion.div
          key={image.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="relative group"
        >
          <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg overflow-hidden">
            <img
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              alt={`Gallery photo ${index + 1}`}
              src={image.image_url || "/fallback.jpg"}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDeleteImage(image.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>

    {galleryImages.length === 0 && !uploadingGallery && (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">No photos uploaded yet</div>
        <div className="text-gray-400 mb-4">Add some photos to make your profile more attractive</div>
        <Button
          onClick={handleUploadPhoto}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Upload Your First Photo
        </Button>
      </div>
    )}
  </CardContent>
</Card>


            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default MyProfile;