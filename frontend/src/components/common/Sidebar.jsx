import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Dashboard,
  LocationOn,
  Tour,
  Group,
  People,
  SupportAgent,
  Luggage,
  BookOnline,
  Payments,
  Reviews,
  Verified,
  RateReview,
  SmartToy,
} from '@mui/icons-material';

const Sidebar = () => {
  const location = useLocation();
  const { isAdmin, isAgent, isLocalGuide, isTraveler } = useAuth();

  const isActive = (path) => location.pathname === path;

  const menuItems = [];

  // Admin items
  if (isAdmin) {
    menuItems.push(
      { label: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
      { label: 'Destinations', icon: <LocationOn />, path: '/destinations' },
      { label: 'Experiences', icon: <Tour />, path: '/experiences' },
      { label: 'Local Guides', icon: <People />, path: '/guides' },
      { label: 'Travel Agents', icon: <SupportAgent />, path: '/travel-agents' },
      { label: 'Travelers', icon: <People />, path: '/travelers' },
      { label: 'All Trips', icon: <Luggage />, path: '/trips' },
      { label: 'All Bookings', icon: <BookOnline />, path: '/bookings' },
      { label: 'Payments', icon: <Payments />, path: '/payments' },
      { label: 'Reviews', icon: <Reviews />, path: '/reviews' },
    );
  }

  // Agent items
  if (isAgent) {
    menuItems.push(
      { label: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
      { label: 'AI Review Queue', icon: <SmartToy />, path: '/ai-review' },
      { label: 'All Trips', icon: <Tour />, path: '/trips' },
    );
  }

  // Local Guide items
  if (isLocalGuide) {
    menuItems.push(
      { label: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
      { label: 'My Experiences', icon: <Tour />, path: '/my-experiences' },
      { label: 'Add Experience', icon: <Group />, path: '/experiences/new' },
      { label: 'My Bookings', icon: <Verified />, path: '/bookings' },
      { label: 'Reviews & Ratings', icon: <RateReview />, path: '/reviews-ratings' },
    );
  }

  // Traveler items
  if (isTraveler) {
    menuItems.push(
        { label: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
        { label: 'My Trips', icon: <Luggage />, path: '/trips' },
    );
  }

  return (
    <aside className="w-64 bg-white shadow-md border-r h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold text-indigo-600">TripCraft</h2>
        <p className="text-xs text-gray-500">Travel Planning Platform</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition text-sm ${
              isActive(item.path)
                ? 'bg-indigo-50 text-indigo-700 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="text-gray-500">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t text-xs text-gray-400">
        Travel Planning App v1.0
      </div>
    </aside>
  );
};

export default Sidebar;