import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';


import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import {
  Users, Heart, MessageSquare, UserCheck, DollarSign, Coins, Zap, Shield, Eye, Edit, Trash2, MoreVertical, Plus, Search, Filter, BarChart2, UserPlus, Image as ImageIcon, Lock
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


const searchLocation = async () => {
  if (!locationQuery.trim()) return;
  setSearchingLocation(true);

  try {
    const res = await fetch(`https://api.locationiq.com/v1/autocomplete?key=${import.meta.env.VITE_LOCATIONIQ_API_KEY}&q=${encodeURIComponent(locationQuery)}&limit=5&normalizecity=1&tag=place:city`);
    const data = await res.json();

    if (res.ok) {
      setLocationResults(data);
    } else {
      console.error("Location search error:", data);
    }
  } catch (error) {
    console.error("Fetch error:", error);
  } finally {
    setSearchingLocation(false);
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "All" || user.role === roleFilter;
    const matchesBoost = boostFilter === "All" || user.boost === boostFilter;
    return matchesSearch && matchesRole && matchesBoost;
  });


  //   const filteredUsers = users.filter((user) => {
  //   const roleMatch = roleFilter === "All" || user.role.toLowerCase() === roleFilter.toLowerCase();
  //   const boostMatch = boostFilter === "All" || user.boost.toLowerCase() === boostFilter.toLowerCase();
  //   return roleMatch && boostMatch;
  // });

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
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`, {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    return data.data.url;
  };


  const handleCreateGirl = async () => {
    setUploading(true);
    try {
      // Upload profile image
      let profileImageUrl = "";
      if (profileImage) {
        const formData = new FormData();
        formData.append("image", profileImage);
        const res = await axios.post(
          `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`,
          formData
        );
        profileImageUrl = res.data.data.url;
      }

      // Upload gallery images
      const galleryImageUrls = [];
      for (const img of galleryImages) {
        const formData = new FormData();
        formData.append("image", img);
        const res = await axios.post(
          `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`,
          formData
        );
        galleryImageUrls.push(res.data.data.url);
      }

      // Now send data to backend (update your API route accordingly)
      await axios.post(`${BASE_URL}/admin/girl-profile/create`, {
        ...girlForm,
        profile_image_url: profileImageUrl,
        gallery_images: galleryImageUrls,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast({ title: "Profile created successfully!" });
      // Reset state
      setProfileImage(null);
      setGalleryImages([]);
      setGirlForm({});
    } catch (error) {
      console.error("Error creating girl profile:", error);
      toast({ title: "Error creating profile", variant: "destructive" });
    } finally {
      setUploading(false);
    }
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

      // Upload profile image
      const profileImageUrl = await uploadToImgBB(girlForm.profileImage);

      // Upload gallery images in parallel
      const galleryUploadPromises = girlForm.gallery.map(file => uploadToImgBB(file));
      const galleryUrls = await Promise.all(galleryUploadPromises); // 🚀 Parallel upload

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
        console.log(err);
        console.error("Failed to load stats:", err);
      }
    };

    fetchStats();
  }, []);

  const createUser = async (formData, role) => {



    try {
      await axios.post(`${BASE_URL}/admin/create`, { ...formData, role }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      toast({ title: `${role} created successfully` });
    }
    // ✅ clear the form
    catch (err) {
      console.log(err);
      toast({
        title: `Failed to create ${role}`,
        description: err.response?.data?.error || "Unknown error",
        variant: "destructive"
      });
    }
  };

  // const handleAction = (action, name) => {
  //   toast({
  //     title: `${action} clicked for ${name}`,
  //     description: "This feature is for demonstration purposes.",
  //   });
  // };

  const handleCreate = (type) => {
    toast({
      title: `Create New ${type}`,
      description: "In a real app, this would create a new entry.",
    });
  };

  // const users = [
  //   { id: 1, name: 'Emma Wilson', role: 'User', location: 'New York', coins: 150, boost: 'No' },
  //   { id: 2, name: 'Sofia Rodriguez', role: 'User', location: 'Los Angeles', coins: 75, boost: 'Yes' },
  //   { id: 3, name: 'Emma Chatter', role: 'Chatter', location: 'Virtual', coins: 0, boost: 'N/A' },
  //   { id: 4, name: 'The Godfather', role: 'Admin', location: 'Sicily', coins: 0, boost: 'N/A' },
  //   { id: 5, name: 'Isabella (AI)', role: 'User', location: 'Miami', coins: 0, boost: 'N/A' },
  // ];

  const liveChats = [
    { id: 1, user: 'Alex Johnson', girl: 'Emma Wilson', status: 'Locked', lockedBy: 'chatter@flirtduo.com', lastActivity: '2 min ago' },
    { id: 2, user: 'Ben Miller', girl: 'Sofia Rodriguez', status: 'Idle', lockedBy: '-', lastActivity: '1 hour ago' },
    { id: 3, user: 'Chris Davis', girl: 'Emma Wilson', status: 'Active', lockedBy: '-', lastActivity: '5 min ago' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Helmet>
        <title>Admin Panel - FlirtDuo</title>
        <meta name="description" content="Administrator control panel for FlirtDuo." />
      </Helmet>

      <Header />
      <MobileHeader />

      <main className="container mx-auto px-4 py-6 lg:py-8 pt-20 lg:pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center space-x-3">
              <Shield className="w-8 h-8 text-purple-600" />
              <span>Admin Control Center</span>
            </h1>
            <p className="text-lg text-gray-600">The Godfather's dashboard for FlirtDuo.</p>
            {/* <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">🔑 Test Chatter Login Credentials:</h3>
              <p className="text-blue-800"><strong>Email:</strong> chatter@flirtduo.com</p>
              <p className="text-blue-800"><strong>Password:</strong> chatter123</p>
              <p className="text-sm text-blue-600 mt-1">Use these credentials to test the Chatter Dashboard functionality.</p>
            </div> */}
          </div>

          {stats && (
            <section id="dashboard-summary">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 Dashboard Summary</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <StatCard title="Total Users" value={stats.total_users} icon={Users} color="text-blue-500" />
                <StatCard title="Total Chatters" value={stats.total_chatters} icon={MessageSquare} color="text-green-500" />
                <StatCard title="Total Girls" value={stats.girls} icon={Heart} color="text-pink-500" />

                <StatCard title="Total Admins" value={stats.total_admins} icon={UserCheck} color="text-purple-500" />
                <StatCard title="Total Revenue" value={`$${Number(stats.total_revenue).toLocaleString()}`} icon={DollarSign} color="text-yellow-500" />
                <StatCard title="Coins Purchased" value={Number(stats.coins_purchased).toLocaleString()} icon={Coins} color="text-orange-500" />
              </div>
            </section>
          )}

          <section id="create-girl-profile">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">👩 Create New Girl Profile</h2>
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserPlus className="mr-2 text-pink-500" />
                  Create Girl Profile for Public Users
                </CardTitle>
                <CardDescription>
                  Create attractive female profiles that will appear in the user homepage grid and be fully functional.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="girl-name">Name</Label>
                      <Input
                        id="girl-name"
                        placeholder="e.g., Isabella Martinez"
                        value={girlForm.name}
                        onChange={(e) => setGirlForm({ ...girlForm, name: e.target.value })}
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
                      />
                    </div>
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
                      />
                    </div>
                  </div>

                  <div className="space-y-4">

                    <div>
                      <Label htmlFor="girl-height">Height</Label>
                      <select
                        id="girl-height"
                        value={girlForm.height}
                        onChange={(e) => setGirlForm({ ...girlForm, height: e.target.value })}
                        className="w-full mt-1 p-2 border rounded-md text-gray-700 focus:outline-none focus:ring focus:border-blue-300"
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

                    <div>
                      <Label htmlFor="girl-interests">Interests</Label>
                      <Input
                        id="girl-interests"
                        placeholder="e.g., Yoga, Travel, Photography"
                        value={girlForm.interests}
                        onChange={(e) => setGirlForm({ ...girlForm, interests: e.target.value })}
                      />
                    </div>
                   <div className="relative">
  <Label className="mb-1 block">Location</Label>
  <div className="relative">
    <Input
      placeholder="Enter city name..."
      value={locationInput}
      onChange={(e) => setLocationInput(e.target.value)}
      className="pr-16"
    />
    <button
      type="button"
      onClick={handleLocationSearch}
      className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-200 hover:bg-gray-300 text-sm px-3 py-1 rounded"
    >
      Search
    </button>
  </div>

  {locationSuggestions.length > 0 && (
    <ul className="absolute z-10 w-full border rounded p-2 mt-1 bg-white max-h-48 overflow-y-auto shadow">
      {locationSuggestions.map((loc, index) => (
        <li
          key={index}
          className="cursor-pointer hover:bg-gray-100 p-1 text-sm"
          onClick={() => {
            setSelectedLocation(loc);
            setLocationInput(loc);
            setLocationSuggestions([]);
            setGirlForm({ ...girlForm, city: loc }); // ✅ only city + country
          }}
        >
          {loc}
        </li>
      ))}
    </ul>
  )}
</div>


                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="girl-bio">Bio/Description</Label>
                      <Input
                        id="girl-bio"
                        placeholder="A short, engaging bio..."
                        value={girlForm.bio}
                        onChange={(e) => setGirlForm({ ...girlForm, bio: e.target.value })}
                      />
                    </div>

                    {/* Profile Image Upload */}
                    <div>
                      <Label>Profile Image</Label>
                      <div className="flex items-center space-x-4">
                        <Button variant="outline" className="w-full" disabled={uploadingProfile}>
                          <label className="cursor-pointer w-full">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files[0];
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
                            <ImageIcon className="mr-2 h-4 w-4" />
                            {uploadingProfile ? "Uploading..." : "Upload Profile Image"}
                          </label>
                        </Button>

                        {girlForm.imagePreview && (
                          <img
                            src={girlForm.imagePreview}
                            alt="Preview"
                            className="h-16 w-16 object-cover rounded-md border"
                          />
                        )}
                      </div>
                    </div>

                    {/* Gallery Upload */}
                    <div>
                      <Label>Additional Photos</Label>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full" disabled={uploadingGallery}>
                          <label className="cursor-pointer w-full">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={async (e) => {
                                const files = Array.from(e.target.files);
                                if (files.length === 0) return;

                                setUploadingGallery(true);
                                const uploadedUrls = [];

                                for (const file of files) {
                                  try {
                                    const formData = new FormData();
                                    formData.append("image", file);
                                    const res = await axios.post(
                                      `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`,
                                      formData
                                    );
                                    uploadedUrls.push(res.data.data.url);
                                  } catch (err) {
                                    toast({ title: "Gallery upload failed", variant: "destructive" });
                                  }
                                }

                                setGirlForm((prev) => ({
                                  ...prev,
                                  gallery: [...(prev.gallery || []), ...uploadedUrls],
                                  galleryPreviews: [...(prev.galleryPreviews || []), ...uploadedUrls],
                                }));

                                setUploadingGallery(false);
                              }}
                              className="hidden"
                            />
                            <ImageIcon className="mr-2 h-4 w-4" />
                            {uploadingGallery ? "Uploading..." : "Upload Gallery Images"}
                          </label>
                        </Button>

                        {girlForm.galleryPreviews?.length > 0 && (
                          <div className="grid grid-cols-3 gap-2 pt-2">
                            {girlForm.galleryPreviews.map((url, idx) => (
                              <img
                                key={idx}
                                src={url}
                                alt={`Gallery ${idx}`}
                                className="h-16 w-full object-cover rounded-md border"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>


                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Button
                    onClick={createGirlProfile}
                    className="w-full md:w-auto bg-pink-500 hover:bg-pink-600 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Girl Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>



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