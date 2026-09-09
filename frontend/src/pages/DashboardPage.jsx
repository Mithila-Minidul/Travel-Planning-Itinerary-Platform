import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { destinationAPI } from '../api/destinations';
import { experienceAPI } from '../api/experiences';
import { guideAPI } from '../api/guides';
import { Dashboard, LocationOn, Tour, People, Verified } from '@mui/icons-material';

const DashboardPage = () => {
  const { user, isAdmin, isAgent, isLocalGuide } = useAuth();
  const [stats, setStats] = useState({ destinations: 0, experiences: 0, guides: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [destRes, expRes, guideRes] = await Promise.all([
          destinationAPI.getAll(),
          experienceAPI.getAll(),
          guideAPI.getAll(),
        ]);
        setStats({
          destinations: destRes.data?.length || 0,
          experiences: expRes.data?.length || 0,
          guides: guideRes.data?.length || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Destinations', value: stats.destinations, icon: <LocationOn />, color: 'bg-blue-500' },
    { label: 'Experiences', value: stats.experiences, icon: <Tour />, color: 'bg-green-500' },
    { label: 'Local Guides', value: stats.guides, icon: <People />, color: 'bg-purple-500' },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading dashboard...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          {getGreeting()}, {user?.fullName || user?.email}!
        </h1>
        <p className="text-gray-500">
          {isAdmin && 'Admin Dashboard - Manage the Travel Platform'}
          {isAgent && 'Agent Dashboard - Review AI Itineraries'}
          {isLocalGuide && 'Guide Dashboard - Manage Your Experiences'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg text-white ${card.color}`}>
                {card.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                <p className="text-sm text-gray-500">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Role-specific quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isAdmin && (
          <>
            <div className="bg-white rounded-xl shadow-sm p-6 border">
              <h3 className="font-semibold text-gray-800 mb-2">Quick Actions</h3>
              <div className="space-y-2">
                <a href="/destinations/new" className="block text-indigo-600 hover:underline">Add New Destination</a>
                <a href="/experiences/new" className="block text-indigo-600 hover:underline">Add New Experience</a>
                <a href="/guides" className="block text-indigo-600 hover:underline">Approve Local Guides</a>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border">
              <h3 className="font-semibold text-gray-800 mb-2">Platform Overview</h3>
              <p className="text-sm text-gray-500">Total Revenue: <span className="font-medium text-gray-800">$0</span></p>
              <p className="text-sm text-gray-500">Total Bookings: <span className="font-medium text-gray-800">0</span></p>
              <p className="text-sm text-gray-500">Active Guides: <span className="font-medium text-gray-800">0</span></p>
            </div>
          </>
        )}
        {isAgent && (
          <div className="bg-white rounded-xl shadow-sm p-6 border col-span-2">
            <h3 className="font-semibold text-gray-800 mb-2">Pending AI Reviews</h3>
            <p className="text-gray-500">You have <span className="font-bold text-indigo-600">0</span> itineraries waiting for review.</p>
            <a href="/ai-review" className="mt-3 inline-block text-indigo-600 hover:underline">Go to AI Review Queue →</a>
          </div>
        )}
        {isLocalGuide && (
          <div className="bg-white rounded-xl shadow-sm p-6 border col-span-2">
            <h3 className="font-semibold text-gray-800 mb-2">Your Experiences</h3>
            <p className="text-gray-500">You have <span className="font-bold text-green-600">{stats.experiences || 0}</span> experiences published.</p>
            <a href="/my-experiences" className="mt-3 inline-block text-indigo-600 hover:underline">Manage Your Experiences →</a>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;