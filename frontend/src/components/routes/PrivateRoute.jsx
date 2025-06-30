import React from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '@/contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;