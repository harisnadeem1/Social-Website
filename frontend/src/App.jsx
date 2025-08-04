import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import { GoogleOAuthProvider } from "@react-oauth/google"; // ✅ Added
import PublicHomepage from '@/pages/PublicHomepage';
import Dashboard from '@/pages/Dashboard';
import ProfileDetail from '@/pages/ProfileDetail';
import CoinsPage from '@/pages/CoinsPage';
import SearchPage from '@/pages/SearchPage';
import ChatPage from '@/pages/ChatPage';
import MyProfile from '@/pages/MyProfile';
import Settings from '@/pages/Settings';
import AdminPanel from '@/pages/AdminPanel';
import ChatterDashboard from '@/pages/ChatterDashboard';
import AdminRoute from '@/components/routes/AdminRoute';
import ChatterRoute from '@/components/routes/ChatterRoute';
import PrivateRoute from '@/components/routes/PrivateRoute';
import AuthContext from '@/contexts/AuthContext';
import ProfileCreation from '@/pages/CreateProfilePage';
import BottomNav from './components/BottomNav';
import NotificationsPage from '@/pages/NotificationsPage';
import PublicProfilePage from '@/pages/PublicProfilePage';

import AboutUsPage from '@/pages/info/AboutUsPage';
import ContactPage from '@/pages/info/ContactPage';
import CareersPage from '@/pages/info/CareersPage';
import BlogPage from '@/pages/info/BlogPage';
import PrivacyPolicyPage from '@/pages/info/PrivacyPolicyPage';
import TermsAndConditionsPage from '@/pages/info/TermsAndConditionsPage';
import CookiePolicyPage from '@/pages/info/CookiePolicyPage';
import SafetyTipsPage from '@/pages/info/SafetyTipsPage';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const HomeRedirect = () => {
  const { user, loading } = React.useContext(AuthContext);

  if (loading) return null;

  if (!user) return <PublicHomepage />;
  if (user.role === 'admin') return <Navigate to="/admin" />;
  if (user.role === 'chatter') return <Navigate to="/chatter-dashboard" />;
  return <Dashboard />;
};

const AppContent = ({ user, login, logout, coins, updateCoins, loading }) => {
  const location = useLocation();

  const hideBottomNavPaths = [
    '/create-profile',
    '/admin',
    '/chatter-dashboard'
  ];

  const showBottomNav =
    user &&
    user.role === 'user' &&
    !hideBottomNavPaths.includes(location.pathname);

  return (
    <div className={`min-h-screen bg-gray-50 ${showBottomNav ? 'pb-14' : ''} lg:pb-0`}>
      <Helmet>
        <title>Liebenly - Find Your Perfect Match Today</title>
        <meta
          name="description"
          content="Join Liebenly, the modern dating platform where real connections happen. Find love, make meaningful relationships, and discover your perfect match in a safe and private environment."
        />
      </Helmet>

      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/create-profile" element={<PrivateRoute><ProfileCreation /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/profile/:id" element={<PrivateRoute><ProfileDetail /></PrivateRoute>} />
        <Route path="/coins" element={<PrivateRoute><CoinsPage /></PrivateRoute>} />
        <Route path="/search" element={<PrivateRoute><SearchPage /></PrivateRoute>} />
        <Route path="/chat" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
        <Route path="/my-profile" element={<PrivateRoute><MyProfile /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
        <Route path="/chatter-dashboard" element={<ChatterRoute><ChatterDashboard /></ChatterRoute>} />

        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />
        <Route path="/cookie-policy" element={<CookiePolicyPage />} />
        <Route path="/safety-tips" element={<SafetyTipsPage />} />
        <Route path="/:username" element={<PublicProfilePage />} />
      </Routes>

      {showBottomNav && <BottomNav />}
      <Toaster />
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [coins, setCoins] = useState(100);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('flirtduo_user');
    const savedCoins = localStorage.getItem('flirtduo_coins');

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem('flirtduo_user');
      }
    }

    if (savedCoins) {
      setCoins(parseInt(savedCoins, 10));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('flirtduo_user', JSON.stringify(userData));
    if (userData.role === 'user') {
      const initialCoins = 100;
      setCoins(initialCoins);
      localStorage.setItem('flirtduo_coins', initialCoins.toString());
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('flirtduo_user');
    localStorage.removeItem('flirtduo_coins');
  };

  const updateCoins = (newCoins) => {
    setCoins(newCoins);
    localStorage.setItem('flirtduo_coins', newCoins.toString());
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}> {/* ✅ FIX */}
      <AuthContext.Provider value={{ user, login, logout, coins, updateCoins, loading }}>
        <Router>
          <AppContent
            user={user}
            login={login}
            logout={logout}
            coins={coins}
            updateCoins={updateCoins}
            loading={loading}
          />
        </Router>
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  );
}

export default App;
