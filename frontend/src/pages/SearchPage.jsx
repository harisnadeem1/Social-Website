import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import ProfileCard from '@/components/ProfileCard';
import { useNavigate } from 'react-router-dom';

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchFilters, setSearchFilters] = useState({
    username: '',
    ageMin: '',
    ageMax: '',
    gender: '',
    city: ''
  });
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [allProfiles] = useState([
    {
      id: 1,
      name: 'Emma Wilson',
      age: 28,
      city: 'New York',
      gender: 'Female',
      imageDescription: 'Beautiful young woman with blonde hair smiling outdoors in natural lighting',
      isOnline: true
    },
    {
      id: 2,
      name: 'Michael Chen',
      age: 32,
      city: 'San Francisco',
      gender: 'Male',
      imageDescription: 'Handsome Asian man with friendly smile wearing casual shirt',
      isOnline: false
    },
    {
      id: 3,
      name: 'Sofia Rodriguez',
      age: 26,
      city: 'Los Angeles',
      gender: 'Female',
      imageDescription: 'Latina woman with dark hair and warm smile in urban setting',
      isOnline: true
    },
    {
      id: 4,
      name: 'James Thompson',
      age: 30,
      city: 'Chicago',
      gender: 'Male',
      imageDescription: 'Athletic man with brown hair outdoors, confident expression',
      isOnline: true
    },
    {
      id: 5,
      name: 'Aria Patel',
      age: 27,
      city: 'Seattle',
      gender: 'Female',
      imageDescription: 'Indian woman with long black hair, elegant and professional look',
      isOnline: false
    },
    {
      id: 6,
      name: 'David Kim',
      age: 29,
      city: 'Austin',
      gender: 'Male',
      imageDescription: 'Korean man with stylish haircut and modern casual outfit',
      isOnline: true
    },
    {
      id: 7,
      name: 'Isabella Martinez',
      age: 25,
      city: 'Miami',
      gender: 'Female',
      imageDescription: 'Hispanic woman with curly hair and bright smile at the beach',
      isOnline: false
    },
    {
      id: 8,
      name: 'Ryan O\'Connor',
      age: 31,
      city: 'Boston',
      gender: 'Male',
      imageDescription: 'Irish man with red hair and freckles, friendly demeanor',
      isOnline: true
    }
  ]);

  useEffect(() => {
    // Filter profiles based on search criteria
    let filtered = allProfiles;

    if (searchFilters.username) {
      filtered = filtered.filter(profile =>
        profile.name.toLowerCase().includes(searchFilters.username.toLowerCase())
      );
    }

    if (searchFilters.ageMin) {
      filtered = filtered.filter(profile => profile.age >= parseInt(searchFilters.ageMin));
    }

    if (searchFilters.ageMax) {
      filtered = filtered.filter(profile => profile.age <= parseInt(searchFilters.ageMax));
    }

    if (searchFilters.gender) {
      filtered = filtered.filter(profile => profile.gender === searchFilters.gender);
    }

    if (searchFilters.city) {
      filtered = filtered.filter(profile =>
        profile.city.toLowerCase().includes(searchFilters.city.toLowerCase())
      );
    }

    setFilteredProfiles(filtered);
  }, [searchFilters, allProfiles]);

  const handleFilterChange = (field, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setSearchFilters({
      username: '',
      ageMin: '',
      ageMax: '',
      gender: '',
      city: ''
    });
  };

  const handleProfileClick = (profile) => {
    navigate(`/profile/${profile.id}`);
  };

  const hasActiveFilters = Object.values(searchFilters).some(value => value !== '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <Helmet>
        <title>Search - Liebenly</title>
        <meta name="description" content="Search and filter profiles on Liebenly. Find your perfect match by age, location, interests, and more advanced search criteria." />
      </Helmet>

      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Search Profiles
            </h1>
            <p className="text-lg text-gray-600">
              Find your perfect match with advanced search filters
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Search filters sidebar */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-lg sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Filter className="w-5 h-5" />
                      <span>Filters</span>
                    </div>
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Clear
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Username search */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Username
                    </label>
                    <Input
                      placeholder="Search by name..."
                      value={searchFilters.username}
                      onChange={(e) => handleFilterChange('username', e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {/* Age range */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Age Range
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={searchFilters.ageMin}
                        onChange={(e) => handleFilterChange('ageMin', e.target.value)}
                        min="18"
                        max="100"
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={searchFilters.ageMax}
                        onChange={(e) => handleFilterChange('ageMax', e.target.value)}
                        min="18"
                        max="100"
                      />
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Gender
                    </label>
                    <select
                      value={searchFilters.gender}
                      onChange={(e) => handleFilterChange('gender', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="">All Genders</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  {/* City */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      City
                    </label>
                    <Input
                      placeholder="Search by city..."
                      value={searchFilters.city}
                      onChange={(e) => handleFilterChange('city', e.target.value)}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search results */}
            <div className="lg:col-span-3">
              {/* Results header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Search className="w-5 h-5 text-gray-500" />
                  <span className="text-lg font-medium text-gray-900">
                    {filteredProfiles.length} {filteredProfiles.length === 1 ? 'Profile' : 'Profiles'} Found
                  </span>
                </div>
              </div>

              {/* Results grid */}
              {filteredProfiles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProfiles.map((profile, index) => (
                    <motion.div
                      key={profile.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <ProfileCard 
                        profile={profile} 
                        onClick={handleProfileClick}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-center py-12"
                >
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No profiles found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search filters to find more matches
                  </p>
                  <Button onClick={clearFilters} variant="outline">
                    Clear All Filters
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default SearchPage;