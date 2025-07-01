import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
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

const HomeRedirect = () => {
  const { user, loading } = React.useContext(AuthContext);

  if (loading) {
    return null; 
  }

  if (!user) return <PublicHomepage />;
  if (user.role === 'admin') return <Navigate to="/admin" />;
  if (user.role === 'chatter') return <Navigate to="/chatter-dashboard" />;
  return <Dashboard />;
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
    if(userData.role === 'user') {
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
    <AuthContext.Provider value={{ user, login, logout, coins, updateCoins, loading }}>
      <Router>
        <div className="min-h-screen bg-gray-50 pb-14 lg:pb-0">
          <Helmet>
            <title>FlirtDuo - Find Your Perfect Match Today</title>
            <meta name="description" content="Join FlirtDuo, the modern dating platform where real connections happen. Find love, make meaningful relationships, and discover your perfect match in a safe and private environment." />
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
            <Route path="/admin" element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            } />
            <Route path="/chatter-dashboard" element={
              <ChatterRoute>
                <ChatterDashboard />
              </ChatterRoute>
            } />
          </Routes>
          <BottomNav /> {/* <== place it here just above Toaster */}
          <Toaster />
        </div>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;