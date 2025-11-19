import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from './Spinner';

// FIX: Changed component to correctly function as a layout route guard for react-router-dom v6.
// It now renders an <Outlet /> for nested routes instead of requiring a `children` prop,
// which fixes the TypeScript error in App.tsx.
const AdminProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-secondary">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    // Redirect non-admins to the client homepage
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;