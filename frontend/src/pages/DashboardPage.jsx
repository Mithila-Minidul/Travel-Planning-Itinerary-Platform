import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { destinationAPI } from '../api/destinations';
import { experienceAPI } from '../api/experiences';
import { guideAPI } from '../api/guides';
import {
  Add,
  AttachMoney,
  CalendarToday,
  CheckCircle,
  Dashboard,
  LocationOn,
  People,
  PendingActions,
  Star,
  Tour,
} from '@mui/icons-material';

const DashboardPage = () => {
  const { user, isAdmin, isAgent, isLocalGuide } = useAuth();
  const [stats, setStats] = useState({ destinations: 0, experiences: 0, guides: 0 });
  const [guideExperiences, setGuideExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (isLocalGuide) {
          const expRes = await experienceAPI.getMine();
          setGuideExperiences(expRes.data || []);
        } else {
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
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [isLocalGuide]);

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

  const pendingExperiences = guideExperiences.filter((experience) => experience.status === 'PendingApproval').length;
  const approvedExperiences = guideExperiences.filter((experience) => experience.status === 'Approved').length;
  const averageRating = guideExperiences.length
    ? guideExperiences.reduce((total, experience) => total + (Number(experience.rating) || 0), 0) / guideExperiences.length
    : 0;
  const recentExperiences = guideExperiences.slice(0, 5);

  const guideStatCards = [
    { label: 'Approved Experiences', value: approvedExperiences, icon: <CheckCircle />, color: 'bg-indigo-600' },
    { label: 'Pending Experiences', value: pendingExperiences, icon: <PendingActions />, color: 'bg-amber-500' },
    { label: 'Pending Bookings', value: 0, icon: <CalendarToday />, color: 'bg-amber-500' },
    { label: 'Total Earnings', value: '$0', icon: <AttachMoney />, color: 'bg-emerald-600' },
    { label: 'Avg Rating', value: averageRating.toFixed(1), icon: <Star />, color: 'bg-yellow-500' },
  ];

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

      {!isLocalGuide && (
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
          {statCards.map((card, index) => (
            <div key={index} className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`rounded-lg p-3 text-white ${card.color}`}>
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
      )}

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
          <div className="col-span-2 space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {guideStatCards.map((card) => (
                <div key={card.label} className="rounded-xl border bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-3 text-white ${card.color}`}>{card.icon}</div>
                    <div className="min-w-0">
                      <p className="truncate text-2xl font-bold text-gray-800">{card.value}</p>
                      <p className="truncate text-sm text-gray-500">{card.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h3 className="mb-3 font-semibold text-gray-800">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                <a href="/experiences/new" className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700">
                  <Add fontSize="small" /> Add Experience
                </a>
                <a href="/bookings" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                  <CalendarToday fontSize="small" /> View Bookings
                </a>
              </div>
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-800">My Recent Experiences</h3>
                  <p className="mt-1 text-sm text-gray-500">{pendingExperiences} pending review</p>
                </div>
                <a href="/my-experiences" className="text-sm font-medium text-indigo-600 hover:underline">View all</a>
              </div>
              {recentExperiences.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">No experiences yet.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentExperiences.map((experience) => (
                    <div key={experience.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-800">{experience.title}</p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><LocationOn fontSize="inherit" />{experience.destinationName || 'Destination not set'}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3 text-sm">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${experience.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : experience.status === 'PendingApproval' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                          {experience.status === 'PendingApproval' ? 'Pending Review' : experience.status}
                        </span>
                        <span className="font-semibold text-indigo-700">${experience.currentCalculatedPrice ?? experience.basePrice ?? 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;