import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { experienceAPI } from '../api/experiences';
import { bookingAPI } from '../api/bookings';
import {
  Add,
  AttachMoney,
  CalendarToday,
  CheckCircle,
  LocationOn,
  PendingActions,
  Star,
} from '@mui/icons-material';

const GuideDashboard = () => {
  const { user } = useAuth();
  const [guideExperiences, setGuideExperiences] = useState([]);
  const [guideBookings, setGuideBookings] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0); // 👈 ADD THIS
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [expRes, bkRes, earnRes] = await Promise.all([
          experienceAPI.getMine(),
          bookingAPI.getAll(),
          bookingAPI.getEarnings(), // 👈 ADD THIS
        ]);
        setGuideExperiences(expRes.data || []);
        setGuideBookings(bkRes.data || []);
        setTotalEarnings(Number(earnRes.data.totalEarnings) || 0); // 👈 ADD THIS
      } catch (error) {
        console.error('Error fetching guide stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

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
    const pendingBookings = guideBookings.filter(
    (b) => b.status === 'Pending'
  ).length;

  const guideStatCards = [
    { label: 'Approved Experiences', value: approvedExperiences, icon: <CheckCircle />, color: 'bg-indigo-600' },
    { label: 'Pending Experiences', value: pendingExperiences, icon: <PendingActions />, color: 'bg-amber-500' },
    { label: 'Pending Bookings', value: pendingBookings, icon: <CalendarToday />, color: 'bg-amber-500' },
    { label: 'Total Earnings', value: `$${totalEarnings.toFixed(2)}`, icon: <AttachMoney />, color: 'bg-emerald-600' }, // 👈 ADD THIS
    { label: 'Avg Rating', value: averageRating.toFixed(1), icon: <Star />, color: 'bg-yellow-500' },
  ];

  if (loading) return <div className="flex justify-center items-center h-64">Loading dashboard...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          {getGreeting()}, {user?.fullName || user?.email}!
        </h1>
        <p className="text-gray-500">Guide Dashboard - Manage Your Experiences</p>
      </div>

      <div className="space-y-6">
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
    </div>
  );
};

export default GuideDashboard;