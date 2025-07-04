import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import {
  Users, Heart, MessageSquare, UserCheck, DollarSign, Coins, Zap, Shield, Eye, Edit, Trash2, MoreVertical, Plus, Search, Filter, BarChart2, UserPlus, Image as ImageIcon, Lock, User, Info, FileText, Camera, Upload, X, MapPin
} from 'lucide-react';
import Header from '@/components/Header';
import MobileHeader from '@/components/MobileHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import debounce from 'lodash.debounce';
import imageCompression from "browser-image-compression";
import { uploadToCloudinary } from "../lib/cloudinaryUpload";
import EnhancedDashboardSection from "../components/admin/EnhancedDashboardSection";

const StatCard = ({ title, value, icon: Icon, color }) => (
  <Card className="border-0 shadow-lg bg-white transition-transform hover:scale-105">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
      <Icon className={`h-5 w-5 ${color}`} />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{value}</div>
    </CardContent>
  </Card>
);
const BASE_URL = import.meta.env.VITE_API_BASE_URL;


const AdminPanel = () => {
  const { toast } = useToast();
  const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '' });
  const [chatterForm, setChatterForm] = useState({ name: '', email: '', password: '' });
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [roleFilter, setRoleFilter] = useState("All");
  const [boostFilter, setBoostFilter] = useState("All");
  const [profileImage, setProfileImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [locationInput, setLocationInput] = useState(""); // For input value
  const [locationSuggestions, setLocationSuggestions] = useState([]); // Suggestions from API
  const [selectedLocation, setSelectedLocation] = useState(""); // Final selected city
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchStatsAndUsers = async () => {
      try {
        const token = localStorage.getItem("token");

        const [statsRes, usersRes] = await Promise.all([
          axios.get(`${BASE_URL}/admin/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BASE_URL}/admin/users`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setStats(statsRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        console.error("Error loading admin data:", err);
      }
    };

    fetchStatsAndUsers();
  }, []);


  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${BASE_URL}/admin/stats`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load stats:", err);
      }
    };

    fetchStats();
  }, []);


  const handleLocationSearch = async () => {
    if (!locationInput.trim()) return;

    try {
      const res = await fetch(
        `https://api.locationiq.com/v1/autocomplete?key=${import.meta.env.VITE_LOCATIONIQ_API_KEY}&q=${encodeURIComponent(locationInput)}&limit=5&normalizecity=1&tag=place:city`
      );
      const data = await res.json();

      if (res.ok) {
        const results = data.map(loc => {
          const city = loc.address.name || loc.address.city || loc.address.town || loc.address.village;
          const country = loc.address.country;
          return `${city}, ${country}`;
        });
        setLocationSuggestions(results);
      } else {
        console.error("Location search failed:", data);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };



  const fetchLocationSuggestions = debounce(async (input) => {
    if (!input) return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?city=${input}&format=json&addressdetails=1&limit=5`
      );
      const data = await res.json();
      const suggestions = data.map((item) => {
        const { city, town, village, country } = item.address;
        return `${city || town || village}, ${country}`;
      });
      setLocationSuggestions(suggestions);
    } catch (error) {
      console.error('Location fetch error:', error);
    }
  }, 400);

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setLocationInput(value);
    fetchLocationSuggestions(value);
  };

  // Pagination
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "All" || user.role === roleFilter;
    const matchesBoost = boostFilter === "All" || user.boost === boostFilter;
    return matchesSearch && matchesRole && matchesBoost;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 on search or filter
  }, [searchTerm, roleFilter, boostFilter]);


  const [girlForm, setGirlForm] = useState({
    name: "",
    age: "",
    city: "",
    height: "",
    bio: "",
    profileImage: "",
    gallery: [],
    imagePreview: null,
    galleryPreviews: [],
  });


  const uploadToImgBB = async (file) => {
    // const formData = new FormData();
    // formData.append("image", file);


    const compressedFile = await imageCompression(file, { maxSizeMB: 0.5 }); // you can adjust maxSizeMB

    const formData = new FormData();
    formData.append("image", compressedFile);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`, {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    return data.data.url;
  };


  const createGirlProfile = async () => {
    const requiredFields = [
      "name", "email", "age", "city", "height", "interests", "bio", "profileImage"
    ];

    for (let field of requiredFields) {
      if (!girlForm[field] || girlForm[field].toString().trim() === "") {
        return toast({
          title: `Please fill in all required fields.`,
          description: `${field.charAt(0).toUpperCase() + field.slice(1)} is missing.`,
          variant: "destructive"
        });
      }
    }
    try {
      if (!girlForm.profileImage) {
        return toast({ title: "Please select a profile image", variant: "destructive" });
      }

      const token = localStorage.getItem("token");

      // // Upload profile image
      // const profileImageUrl = await uploadToImgBB(girlForm.profileImage);
      // // Upload gallery images in parallel
      // const galleryUploadPromises = girlForm.gallery.map(file => uploadToImgBB(file));
      // const galleryUrls = await Promise.all(galleryUploadPromises); // 🚀 Parallel upload


      //       const [profileImageUrl, galleryUrls] = await Promise.all([
      //   uploadToImgBB(girlForm.profileImage),
      //   Promise.all(girlForm.gallery.map(file => uploadToImgBB(file)))
      // ]);


      const profileImageUrl = girlForm.profileImage;  // Already a URL
      const galleryUrls = girlForm.gallery;

      // Create profile + gallery
      await axios.post(`${BASE_URL}/admin/create-girl-profile`, {
        name: girlForm.name,
        email: girlForm.email,
        password: "default123",
        age: girlForm.age,
        city: girlForm.city,
        height: girlForm.height,
        interests: girlForm.interests,
        bio: girlForm.bio,
        profile_image_url: profileImageUrl,
        gallery_image_urls: galleryUrls
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({ title: "Girl profile created successfully" });

      setGirlForm({
        name: '',
        email: '',
        age: '',
        city: '',
        height: '',
        interests: '',
        bio: '',
        imageFile: null,
        imagePreview: null,
        galleryFiles: [],
        galleryPreviews: []
      });

    } catch (err) {
      console.error(err);
      toast({ title: "Failed to create profile", variant: "destructive" });
    }
  };


  const handleAction = async (action, userId) => {
    if (action === 'Delete') {
      try {
        await axios.delete(`${BASE_URL}/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUsers(prev => prev.filter(u => u.id !== userId));
        toast({ title: 'User deleted successfully' });
      } catch (err) {
        toast({ title: 'Error deleting user', variant: 'destructive' });
      }
    } else {
      toast({
        title: `${action} clicked`,
        description: `Feature coming soon.`,
      });
    }
  };


  const createUser = async (formData, role) => {
    try {
      await axios.post(`${BASE_URL}/admin/create`, { ...formData, role }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      toast({ title: `${role} created successfully` });
    }
    // ✅ clear the form
    catch (err) {
      toast({
        title: `Failed to create ${role}`,
        description: err.response?.data?.error || "Unknown error",
        variant: "destructive"
      });
    }
  };


  const liveChats = [
    { id: 1, user: 'Alex Johnson', girl: 'Emma Wilson', status: 'Locked', lockedBy: 'chatter@flirtduo.com', lastActivity: '2 min ago' },
    { id: 2, user: 'Ben Miller', girl: 'Sofia Rodriguez', status: 'Idle', lockedBy: '-', lastActivity: '1 hour ago' },
    { id: 3, user: 'Chris Davis', girl: 'Emma Wilson', status: 'Active', lockedBy: '-', lastActivity: '5 min ago' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Helmet>
        <title>Admin Panel - Liebenly</title>
        <meta name="description" content="Administrator control panel for FlirtDuo." />
      </Helmet>

      <Header />
      <MobileHeader />

      <main className="container mx-auto px-4 py-6 lg:py-8 lg:pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          
          {stats && <EnhancedDashboardSection stats={stats} />}

          

          <section id="management-controls">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">⚙️ Management Controls</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserCheck className="mr-2 text-purple-500" />
                    Admin Management
                  </CardTitle>
                  <CardDescription>Create and manage administrator accounts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="admin-name">Full Name</Label>
                    <Input
                      id="admin-name"
                      placeholder="e.g., John Doe"
                      value={adminForm.name}
                      onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="admin-email">Email</Label>

                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@example.com"
                      value={adminForm.email}
                      onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="admin-password">Password</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="Strong password"
                      value={adminForm.password}
                      onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                    />
                  </div>
                  <Button onClick={() => createUser(adminForm, 'admin')} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Admin
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="mr-2 text-green-500" />
                    Chatter Management
                  </CardTitle>
                  <CardDescription>Create and manage chatter accounts for user engagement</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="chatter-name">Name</Label>
                    <Input
                      id="chatter-name"
                      placeholder="e.g., Sarah Chatter"
                      value={chatterForm.name}
                      onChange={(e) => setChatterForm({ ...chatterForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="chatter-email">Email</Label>
                    <Input
                      id="chatter-email"
                      type="email"
                      placeholder="chatter@example.com"
                      value={chatterForm.email}
                      onChange={(e) => setChatterForm({ ...chatterForm, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="chatter-password">Password</Label>
                    <Input
                      id="chatter-password"
                      type="password"
                      placeholder="Secure password"
                      value={chatterForm.password}
                      onChange={(e) => setChatterForm({ ...chatterForm, password: e.target.value })}
                    />
                  </div>
                  <Button onClick={() => createUser(chatterForm, 'chatter')} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Chatter
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          <section id="create-girl-profile" className="py-8">
            <div className=" mx-auto px-1">
              {/* Header Section */}
              {/* <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full mb-4">
        <UserPlus className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-4xl font-bold text-gray-900 mb-2">👩 Create New Girl Profile</h2>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Create attractive female profiles that will appear in the user homepage grid and be fully functional.
      </p>
    </div> */}

              <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <UserPlus className="mr-3 text-pink-500" />
                    Create Girl Profile for Public Users
                  </CardTitle>
                  <CardDescription className="text-base">
                    Create attractive female profiles that will appear in the user homepage grid and be fully functional.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Left Column - Personal Info & Additional Info */}
                    <div className="space-y-8">
                      {/* Personal Information */}
                      <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-xl border border-pink-100">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <User className="w-4 h-4 mr-2 text-pink-500" />
                          Personal Details
                        </h3>

                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="girl-name">Name</Label>
                            <Input
                              id="girl-name"
                              placeholder="e.g., Isabella Martinez"
                              value={girlForm.name}
                              onChange={(e) => setGirlForm({ ...girlForm, name: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                            />
                          </div>

                          <div>
                            <Label htmlFor="girl-email">Email</Label>
                            <Input
                              id="girl-email"
                              type="email"
                              placeholder="e.g., bella@flirtduo.com"
                              value={girlForm.email}
                              onChange={(e) => setGirlForm({ ...girlForm, email: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="girl-age">Age</Label>
                              <Input
                                id="girl-age"
                                type="number"
                                placeholder="24"
                                min="18"
                                max="50"
                                value={girlForm.age}
                                onChange={(e) => setGirlForm({ ...girlForm, age: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                              />
                            </div>

                            <div>
                              <Label htmlFor="girl-height">Height</Label>
                              <select
                                id="girl-height"
                                value={girlForm.height}
                                onChange={(e) => setGirlForm({ ...girlForm, height: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-700"
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
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <Info className="w-4 h-4 mr-2 text-blue-500" />
                          Additional Information
                        </h3>

                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="girl-interests">Interests</Label>
                            <Input
                              id="girl-interests"
                              placeholder="e.g., Yoga, Travel, Photography"
                              value={girlForm.interests}
                              onChange={(e) => setGirlForm({ ...girlForm, interests: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                            />
                          </div>

                          <div className="relative">
                            <Label className="mb-2 block flex items-center">
                              <MapPin className="w-4 h-4 mr-1 text-pink-500" />
                              Location
                            </Label>
                            <div className="relative">
                              <Input
                                placeholder="Enter city name..."
                                value={locationInput}
                                onChange={(e) => setLocationInput(e.target.value)}
                                className="pr-20 w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                              />
                              <button
                                type="button"
                                onClick={handleLocationSearch}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-sm px-4 py-2 rounded-md transition-all"
                              >
                                Search
                              </button>
                            </div>

                            {locationSuggestions.length > 0 && (
                              <ul className="absolute z-20 w-full border border-gray-200 rounded-lg mt-1 bg-white max-h-48 overflow-y-auto shadow-lg">
                                {locationSuggestions.map((loc, index) => (
                                  <li
                                    key={index}
                                    className="cursor-pointer hover:bg-pink-50 p-3 text-sm border-b border-gray-100 last:border-b-0 transition-colors"
                                    onClick={() => {
                                      setSelectedLocation(loc);
                                      setLocationInput(loc);
                                      setLocationSuggestions([]);
                                      setGirlForm({ ...girlForm, city: loc });
                                    }}
                                  >
                                    <div className="flex items-center">
                                      <MapPin className="w-3 h-3 mr-2 text-gray-400" />
                                      {loc}
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Bio & Photos */}
                    <div className="space-y-8">
                      {/* Bio Section */}
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <FileText className="w-4 h-4 mr-2 text-purple-500" />
                          About Me
                        </h3>

                        <div>
                          <Label htmlFor="girl-bio">Bio/Description</Label>
                          <textarea
                            id="girl-bio"
                            placeholder="A short, engaging bio..."
                            value={girlForm.bio}
                            onChange={(e) => setGirlForm({ ...girlForm, bio: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900 placeholder-gray-500 resize-none"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {girlForm.bio.length}/500 characters
                          </p>
                        </div>
                      </div>

                      {/* Media Upload Section */}
                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-100">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <Camera className="w-4 h-4 mr-2 text-emerald-500" />
                          Photos
                        </h3>

                        {/* Profile Image Upload */}
                        <div className="space-y-4">
                          <div>
                            <Label>Profile Image</Label>
                            <div className="flex flex-col items-center space-y-4">
                              {girlForm.imagePreview ? (
                                <div className="relative">
                                  <img
                                    src={girlForm.imagePreview}
                                    alt="Preview"
                                    className="w-24 h-24 object-cover rounded-full border-4 border-white shadow-lg"
                                  />
                                  <button
                                    onClick={() => setGirlForm({ ...girlForm, profileImage: '', imagePreview: '' })}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center bg-gray-50">
                                  <Camera className="w-6 h-6 text-gray-400" />
                                </div>
                              )}

                              <Button variant="outline" className="w-full border-2 border-gray-200 hover:border-pink-300 bg-white hover:bg-pink-50 text-gray-700 hover:text-pink-600 py-3" disabled={uploadingProfile}>
                                <label className="cursor-pointer w-full flex items-center justify-center">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e) => {
                                      const file = e.target.files[0];
                                      if (!file) return;

                                      setUploadingProfile(true);
                                      try {
                                        const compressedFile = await imageCompression(file, { maxSizeMB: 0.5 });
                                        const imageUrl = await uploadToCloudinary(compressedFile);

                                        setGirlForm({
                                          ...girlForm,
                                          profileImage: imageUrl,
                                          imagePreview: imageUrl,
                                        });
                                      } catch (error) {
                                        toast({ title: "Profile image upload failed", variant: "destructive" });
                                      } finally {
                                        setUploadingProfile(false);
                                      }
                                    }}
                                    className="hidden"
                                  />
                                  <Upload className="mr-2 h-4 w-4" />
                                  {uploadingProfile ? "Uploading..." : "Upload Profile Image"}
                                </label>
                              </Button>
                            </div>
                          </div>

                          {/* Gallery Upload */}
                          <div>
                            <Label>Additional Photos</Label>
                            <div className="space-y-4">
                              <Button variant="outline" className="w-full border-2 border-gray-200 hover:border-pink-300 bg-white hover:bg-pink-50 text-gray-700 hover:text-pink-600 py-3" disabled={uploadingGallery}>
                                <label className="cursor-pointer w-full flex items-center justify-center">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={async (e) => {
                                      const files = Array.from(e.target.files);
                                      if (files.length === 0) return;

                                      setUploadingGallery(true);
                                      try {
                                        const uploadPromises = files.map(async (file) => {
                                          const compressedFile = await imageCompression(file, { maxSizeMB: 0.5 });
                                          const imageUrl = await uploadToCloudinary(compressedFile);
                                          return imageUrl;
                                        });

                                        const uploadedUrls = await Promise.all(uploadPromises);

                                        setGirlForm((prev) => ({
                                          ...prev,
                                          gallery: [...(prev.gallery || []), ...uploadedUrls],
                                          galleryPreviews: [...(prev.galleryPreviews || []), ...uploadedUrls],
                                        }));
                                      } catch (err) {
                                        toast({ title: "Gallery upload failed", variant: "destructive" });
                                      } finally {
                                        setUploadingGallery(false);
                                      }
                                    }}
                                    className="hidden"
                                  />
                                  <ImageIcon className="mr-2 h-4 w-4" />
                                  {uploadingGallery ? "Uploading..." : "Upload Gallery Images"}
                                </label>
                              </Button>

                              {girlForm.galleryPreviews?.length > 0 && (
                                <div className="grid grid-cols-2 gap-3">
                                  {girlForm.galleryPreviews.map((url, idx) => (
                                    <div key={idx} className="relative">
                                      <img
                                        src={url}
                                        alt={`Gallery ${idx}`}
                                        className="w-full h-20 object-cover rounded-lg border shadow-sm"
                                      />
                                      <button
                                        onClick={() => {
                                          setGirlForm(prev => ({
                                            ...prev,
                                            gallery: prev.gallery.filter((_, index) => index !== idx),
                                            galleryPreviews: prev.galleryPreviews.filter((_, index) => index !== idx)
                                          }));
                                        }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 pt-8 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button
                        onClick={createGirlProfile}
                        className="w-full sm:w-auto px-12 py-4 text-lg font-semibold bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Create Girl Profile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <section id="user-listings">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">👥 User & Profile Listings</h2>
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle>All Users & Profiles</CardTitle>
                <CardDescription>Search, filter, and manage all accounts on the platform.</CardDescription>
                <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0 pt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search users..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="border rounded px-3 py-1 text-sm text-gray-700"
                    >
                      <option value="All">All Roles</option>
                      <option value="admin">Admin</option>
                      <option value="chatter">Chatter</option>
                      <option value="user">User</option>
                      <option value="girl">Girl</option>
                    </select>

                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="hidden md:table-cell">Coins</TableHead>
                      <TableHead className="hidden lg:table-cell">Boosted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentUsers.map(user => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={user.profile_image_url || `https://i.pravatar.cc/40?u=${user.id}`} />
                              <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'chatter' ? 'secondary' : 'outline'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{user.coins}</TableCell>
                        <TableCell className="hidden lg:table-cell">{user.boost}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete the account.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleAction('Delete', user.id)}>
                                      Continue
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination controls */}
                <div className="flex justify-center mt-4 space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      className={`px-3 py-1 rounded ${currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="chat-monitoring">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">💬 Chat Monitoring</h2>
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle>Live Conversations</CardTitle>
                <CardDescription>Monitor ongoing chats and their lock status.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Conversation</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Locked By</TableHead>
                      <TableHead className="hidden lg:table-cell">Last Activity</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {liveChats.map(chat => (
                      <TableRow key={chat.id}>
                        <TableCell>
                          <div className="font-medium">{chat.user} ↔ {chat.girl}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={chat.status === 'Locked' ? 'destructive' : 'default'}>
                            {chat.status === 'Locked' && <Lock className="w-3 h-3 mr-1" />}
                            {chat.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{chat.lockedBy}</TableCell>
                        <TableCell className="hidden lg:table-cell">{chat.lastActivity}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </section>

          {/* <section id="revenue-tracking">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">💰 Revenue & Coin Tracking</h2>
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart2 className="w-5 h-5 mr-2 text-green-500" />
                  Revenue Analytics & Transaction Logs
                </CardTitle>
                <CardDescription>
                  Monitor platform revenue, coin purchases, and boost usage analytics.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-900">Coin Purchases</h4>
                    <p className="text-sm text-green-700">Track all coin package purchases and revenue</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-900">Boost Usage</h4>
                    <p className="text-sm text-purple-700">Monitor profile boost purchases and activity</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900">Transaction History</h4>
                    <p className="text-sm text-blue-700">Detailed logs of all platform transactions</p>
                  </div>
                </div>
                <div className="mt-6 p-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 text-center">
                    Revenue charts and detailed transaction analytics would be displayed here using a charting library.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section> */}
        </motion.div>
      </main>
    </div>
  );
};

export default AdminPanel;