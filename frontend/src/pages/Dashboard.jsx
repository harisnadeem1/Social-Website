import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
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
  const { user } = useContext(AuthContext);
  
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [userLocation, setUserLocation] = useState('');
  const [seenProfileIds, setSeenProfileIds] = useState(new Set());
  
  const [filters, setFilters] = useState({
    ageMin: 18,
    ageMax: 100,
    gender: '',
    location: '',
    intent: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  
  // Refs for managing state
  const isInitialLoad = useRef(true);
  const debounceTimer = useRef(null);

  // Shuffle function - Fisher-Yates algorithm
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Fetch user location once
  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        if (user?.id) {
          const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/profile/user/${user.id}`);
          const userProfile = await res.json();
          const location = userProfile.profileLocation?.split(",")[0]?.trim() || "";
          setUserLocation(location);
        }
      } catch (error) {
        console.error("Failed to fetch user profile", error);
      }
    };
    
    fetchUserLocation();
  }, [user?.id]);

  // Fetch profiles function
  const fetchProfiles = useCallback(async (pageNum = 1, resetProfiles = false, currentFilters = filters, currentSearch = searchTerm) => {
    if (loading && !resetProfiles) return;
    
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20'
      });

      // Add filters to query params
      if (currentFilters.ageMin && currentFilters.ageMin !== 18) {
        queryParams.append('ageMin', currentFilters.ageMin.toString());
      }
      if (currentFilters.ageMax && currentFilters.ageMax !== 100) {
        queryParams.append('ageMax', currentFilters.ageMax.toString());
      }
      if (currentFilters.gender) queryParams.append('gender', currentFilters.gender);
      if (currentFilters.location) queryParams.append('location', currentFilters.location);
      if (currentFilters.intent) queryParams.append('intent', currentFilters.intent);
      if (currentSearch) queryParams.append('search', currentSearch);

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/girls/public?${queryParams}`);
      
      if (!res.ok) {
        throw new Error('Failed to fetch profiles');
      }
      
      const data = await res.json();

      // Handle response - check if it's paginated response or direct array
      let profilesData, paginationInfo;
      
      if (data.profiles && data.pagination) {
        // New paginated API response
        profilesData = data.profiles;
        paginationInfo = data.pagination;
      } else if (Array.isArray(data)) {
        // Old direct array response
        profilesData = data;
        paginationInfo = {
          hasMore: data.length === 20,
          page: pageNum,
          totalPages: pageNum + (data.length === 20 ? 1 : 0)
        };
      } else {
        throw new Error('Unexpected API response format');
      }

      // Update profiles with user's location
      const updatedProfiles = profilesData.map(profile => ({
        ...profile,
        city: userLocation || profile.city,
      }));

      if (resetProfiles || pageNum === 1) {
        // First page or reset - shuffle all profiles and reset seen IDs
        const shuffledProfiles = shuffleArray(updatedProfiles);
        setProfiles(shuffledProfiles);
        setSeenProfileIds(new Set(shuffledProfiles.map(p => p.id)));
        setPage(1);
      } else {
        // Subsequent pages - filter duplicates, shuffle new batch, then append
        const newProfiles = updatedProfiles.filter(profile => !seenProfileIds.has(profile.id));
        
        if (newProfiles.length > 0) {
          const shuffledNewProfiles = shuffleArray(newProfiles);
          setProfiles(prev => [...prev, ...shuffledNewProfiles]);
          
          // Update seen profile IDs
          setSeenProfileIds(prev => {
            const newSet = new Set(prev);
            shuffledNewProfiles.forEach(profile => newSet.add(profile.id));
            return newSet;
          });
        }
        setPage(pageNum);
      }

      setHasMore(paginationInfo.hasMore !== false);
      
    } catch (error) {
      console.error("Failed to fetch profiles", error);
      // If it's the first load and fails, try to show some fallback
      if (resetProfiles) {
        setProfiles([]);
        setHasMore(false);
      }
    } finally {
      setLoading(false);
    }
  }, [userLocation, seenProfileIds]);

  // Initial load
  useEffect(() => {
    if (isInitialLoad.current && user?.id) {
      fetchProfiles(1, true);
      isInitialLoad.current = false;
    }
  }, [fetchProfiles, user?.id]);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setPage(1);
    fetchProfiles(1, true, newFilters, searchTerm);
  }, [searchTerm, fetchProfiles]);

  // Handle search changes with debouncing
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    
    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Set new timer
    debounceTimer.current = setTimeout(() => {
      setPage(1);
      fetchProfiles(1, true, filters, value);
    }, 300);
  }, [filters, fetchProfiles]);

  // Load more profiles for infinite scroll
  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      fetchProfiles(nextPage, false);
    }
  }, [hasMore, loading, page, fetchProfiles]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >= 
        document.documentElement.offsetHeight - 1000 && // Load more when 1000px from bottom
        hasMore && 
        !loading
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [loadMore, hasMore, loading]);

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
              <FilterPanel 
                onFiltersChange={handleFiltersChange} 
                onSearchChange={handleSearchChange}
                searchTerm={searchTerm}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                {profiles.map((profile, index) => (
                  <motion.div
                    key={profile.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: (index % 20) * 0.05 }}
                  >
                    <ProfileCard
                      profile={profile}
                      onClick={handleProfileClick}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Loading indicator */}
              {loading && profiles.length > 0 && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600 text-sm">Loading more profiles...</p>
                </div>
              )}

              {/* Initial loading state */}
              {loading && profiles.length === 0 && (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading profiles...</p>
                </div>
              )}

              {/* Load more button (fallback) */}
              {!loading && hasMore && profiles.length > 0 && (
                <div className="text-center py-8">
                  <button
                    onClick={loadMore}
                    className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium"
                  >
                    Load More Profiles
                  </button>
                </div>
              )}

              {/* No profiles message */}
              {!loading && profiles.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="text-gray-500 text-lg mb-2">No profiles found</div>
                  <div className="text-gray-400">Try adjusting your search criteria</div>
                </motion.div>
              )}

              {/* End of results message */}
              {!loading && !hasMore && profiles.length > 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-lg mb-1">You've seen all available profiles!</div>
                  <div className="text-sm">Check back later for new matches</div>
                </div>
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