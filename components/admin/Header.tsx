import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-gray-800 shadow-md p-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold text-gray-100">Welcome, {user?.name || 'Admin'}</h1>
      <div className="flex items-center">
        <div className="flex items-center mr-6">
          <User className="w-5 h-5 text-gray-400 mr-2" />
          <span className="text-gray-300">{user?.email}</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;