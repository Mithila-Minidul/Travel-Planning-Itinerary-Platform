import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Logout, Person } from '@mui/icons-material';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm px-6 py-3 flex justify-between items-center border-b">
      <h1 className="text-xl font-semibold text-gray-800">
        {user?.role === 'Admin' && 'Admin Dashboard'}
        {user?.role === 'TravelAgent' && 'Agent Dashboard'}
        {user?.role === 'LocalGuide' && 'Guide Dashboard'}
        {user?.role === 'Traveler' && 'Traveler Dashboard'}
      </h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600 flex items-center gap-1">
          <Person fontSize="small" />
          {user?.fullName || user?.email}
          <span className="ml-2 px-2 py-0.5 bg-gray-200 text-xs rounded-full">
            {user?.role}
          </span>
        </span>
        <button
          onClick={logout}
          className="text-gray-600 hover:text-red-600 transition"
        >
          <Logout fontSize="small" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;