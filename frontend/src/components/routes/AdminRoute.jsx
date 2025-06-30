import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '@/contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import Header from '@/components/Header';
import MobileHeader from '@/components/MobileHeader';

const AdminRoute = ({ children }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <Header />
        <MobileHeader />
        <div className="flex items-center justify-center h-[calc(100vh-8rem)] px-4">
          <Alert variant="destructive" className="max-w-md bg-white border-red-500 border-2 shadow-xl">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="text-xl font-bold">Access Denied</AlertTitle>
            <AlertDescription className="text-base">
              You do not have permission to view this page. This area is for administrators only.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminRoute;