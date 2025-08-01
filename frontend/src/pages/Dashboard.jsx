import React, { useState, useEffect,useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header';
import MobileHeader from '@/components/MobileHeader';
import ProfileCard from '@/components/ProfileCard';
import FilterPanel from '@/components/FilterPanel';
import Sidebar from '@/components/Sidebar';
import BoostModal from '@/components/BoostModal';
import AuthContext from '@/contexts/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [showBoostModal, setShowBoostModal] = useState(false);
    const { user, logout } = useContext(AuthContext);
  
  const [filters, setFilters] = useState({
    ageMin: 18,
    ageMax: 100,
    gender: '',
    location: '',
    intent: ''
  });
  const [searchTerm, setSearchTerm] = useState('');


//match city
//   useEffect(() => {
//   const fetchProfiles = async () => {
//     try {
//       const res1 = await fetch(`${import.meta.env.VITE_API_BASE_URL}/profile/user/${user.id}`);
//       const userprofile = await res1.json();
//       const userLocation = userprofile.profileLocation?.trim() || ""; // Handle null/undefined

//       const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/girls/public`);
//       const data = await res.json();

//       // Split profiles based on city match
//       const sameLocation = data.filter(profile => profile.city?.trim() === userLocation);
//       const differentLocation = data.filter(profile => profile.city?.trim() !== userLocation);

//       // Shuffle both arrays independently
//       const randomizedSameLocation = sameLocation.length ? shuffleArray(sameLocation) : [];
//       const randomizedDifferentLocation = differentLocation.length ? shuffleArray(differentLocation) : [];

//       // Merge: same location first, then other locations
//       const finalProfiles = [...randomizedSameLocation, ...randomizedDifferentLocation];

//       console.log(finalProfiles);

//       setProfiles(finalProfiles);
//       setFilteredProfiles(finalProfiles);
//     } catch (error) {
//       console.error("Failed to fetch profiles", error);
//     }
//   };

//   fetchProfiles();
// }, []);

// const shuffleArray = (array) => {
//   const shuffled = [...array];
//   for (let i = shuffled.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
//   }
//   return shuffled;
// };



useEffect(() => {
  const fetchProfiles = async () => {
    try {
      // Get the user's profile to fetch their location
      const res1 = await fetch(`${import.meta.env.VITE_API_BASE_URL}/profile/user/${user.id}`);
      const userProfile = await res1.json();

      // Extract only the city (before the comma)
      const userLocation = userProfile.profileLocation?.split(",")[0]?.trim() || "";

      // Get all public girl profiles
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/girls/public`);
      const data = await res.json();

      // Update every profile's city to the user's city (only city, not country)
      const updatedProfiles = data.map(profile => ({
        ...profile,
        city: userLocation,
      }));

      // Shuffle the updated profiles
      const randomizedProfiles = shuffleArray(updatedProfiles);

      console.log(randomizedProfiles);

      // Set profiles in state
      setProfiles(randomizedProfiles);
      setFilteredProfiles(randomizedProfiles);
    } catch (error) {
      console.error("Failed to fetch profiles", error);
    }
  };

  fetchProfiles();
}, []);

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};



  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters); // store filters
    applyAllFilters(newFilters, searchTerm);
  };

  const applyAllFilters = (filterValues, searchText) => {
    const filtered = profiles.filter(profile => {
      const ageMatch = profile.age >= filterValues.ageMin && profile.age <= filterValues.ageMax;
      const genderMatch = !filterValues.gender || profile.gender === filterValues.gender;
      const locationMatch = !filterValues.location || profile.city.toLowerCase().includes(filterValues.location.toLowerCase());
      const intentMatch = !filterValues.intent || profile.intent === filterValues.intent;
      const nameMatch = profile.name.toLowerCase().includes(searchText.toLowerCase());

      return ageMatch && genderMatch && locationMatch && intentMatch && nameMatch;
    });

    setFilteredProfiles(filtered);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    applyAllFilters(filters, value); // use current filters + updated search
  };

  const handleProfileClick = (profile) => {
    navigate(`/profile/${profile.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <Helmet>
        <title>Dashboard - Liebenly</title>
        <meta name="description" content="Discover amazing people and find your perfect match on Liebenly. Browse profiles, connect with singles, and start meaningful conversations." />
      </Helmet>

      <Header />
      <MobileHeader />

      <main className="container mx-auto px-4 py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="hidden lg:block">
            <Sidebar onBoostClick={() => setShowBoostModal(true)} />
          </div>

          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* <div className="mb-6 lg:mb-8">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  Discover People Near You
                </h1>
                <p className="text-base lg:text-lg text-gray-600">
                  Find your perfect match among {filteredProfiles.length} incredible singles
                </p>
              </div> */}
              {/* <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search by name..."
                  className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div> */}

              <FilterPanel 
  onFiltersChange={handleFiltersChange} 
  onSearchChange={handleSearchChange}
  searchTerm={searchTerm}
/>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                {filteredProfiles.map((profile, index) => (
                  <motion.div
                    key={profile.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.05 }}
                  >
                    <ProfileCard
                      profile={profile}
                      onClick={handleProfileClick}
                    />
                  </motion.div>
                ))}
              </div>

              {filteredProfiles.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="text-gray-500 text-lg mb-2">No profiles match your filters</div>
                  <div className="text-gray-400">Try adjusting your search criteria</div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      <BoostModal open={showBoostModal} onOpenChange={setShowBoostModal} />
    </div>
  );
};

export default Dashboard;