import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { destinationAPI } from '../api/destinations';
import { experienceAPI } from '../api/experiences';
import { guideAPI } from '../api/guides';
import { adminUserAPI } from '../api/adminUsers';
import { bookingAPI } from '../api/bookings';
import {
  AddLocationAlt,
  AttachMoney,
  BarChart,
  BookOnline,
  CalendarToday,
  Group,
  LocationOn,
  ManageAccounts,
  Notifications,
  People,
  PieChart,
  Tour,
  TrendingUp,
  WarningAmber,
  PersonAdd,
  Star,
  SmartToy,
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

const BookingsCustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 min-w-[200px] max-w-[260px]">
      <p className="text-sm font-semibold text-slate-900 mb-2">{data.destination}</p>
      <div className="flex items-center justify-between text-xs text-slate-500 mb-2 pb-2 border-b border-slate-100">
        <span>Total bookings</span>
        <span className="font-bold text-emerald-600">{data.total}</span>
      </div>
      <div className="space-y-1.5">
        {data.experiences.map((exp, idx) => (
          <div key={idx} className="flex items-start justify-between gap-3 text-xs">
            <span className="text-slate-600 leading-snug">{exp.name}</span>
            <span className="font-semibold text-slate-800 whitespace-nowrap">{exp.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ACTIVITY_ICONS = {
  user: PersonAdd,
  experience: Tour,
  booking: BookOnline,
  payment: AttachMoney,
  review: Star,
};

const ACTIVITY_STYLES = {
  user:       'bg-indigo-50 text-indigo-600',
  experience: 'bg-amber-50 text-amber-600',
  booking:    'bg-sky-50 text-sky-600',
  payment:    'bg-emerald-50 text-emerald-600',
  review:     'bg-fuchsia-50 text-fuchsia-600',
};

const timeAgo = (timestamp) => {
  if (!timestamp) return '';
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return then.toLocaleDateString();
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [adminData, setAdminData] = useState({
    destinations: [],
    experiences: [],
    guides: [],
    agents: [],
    travelers: [],
    approvedGuidesCount: 0,
    approvedAgentsCount: 0,
    pendingGuides: 0,
    pendingAgents: 0,
    pendingExperiences: 0,
  });
  const [loading, setLoading] = useState(true);
    const [bookingsCount, setBookingsCount] = useState(0);
  const [pendingBookingsCount, setPendingBookingsCount] = useState(0);
      const [recentActivity, setRecentActivity] = useState([]);
    const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [destRes, expRes, guideRes, pendingExpRes, agentRes, travelerRes] = await Promise.all([
          destinationAPI.getAll(),
          experienceAPI.getForAdmin(),
          guideAPI.getAll(),
          experienceAPI.getPending(),
          adminUserAPI.getTravelAgents(),
          adminUserAPI.getTravelers(),
        ]);

        const guides = guideRes.data || [];
        const agents = agentRes.data || [];
        const travelers = travelerRes.data || [];

        const approvedGuidesCount = guides.filter((guide) => guide.status === 'Approved').length;
        const approvedAgentsCount = agents.filter((agent) => agent.isActive === true).length;

        setAdminData({
          destinations: destRes.data || [],
          experiences: expRes.data || [],
          guides,
          agents,
          travelers,
          approvedGuidesCount,
          approvedAgentsCount,
          pendingGuides: guides.filter((guide) => guide.status === 'Pending').length,
          pendingAgents: agents.filter((agent) => !agent.isActive).length,
          pendingExperiences: pendingExpRes.data?.length || 0,
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // ✅ SEPARATE effect for bookings — isolated so it can't break the dashboard
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await bookingAPI.getAll();
        const list = res.data || [];
        setBookings(list);
        setBookingsCount(list.length);
        setPendingBookingsCount(
          list.filter((b) => b.status === 'Pending').length
        );
      } catch (err) {
        console.error('Failed to load bookings count:', err);
        // leave counts at 0 — dashboard keeps working
      }
    };
    fetchBookings();
  }, []);

  // ✅ SEPARATE effect for recent activity — isolated so it can't break the dashboard
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await adminUserAPI.getRecentActivity(5);
        setRecentActivity(res.data || []);
      } catch (err) {
        console.error('Failed to load recent activity:', err);
        // leave empty — dashboard keeps working
      }
    };
    fetchActivity();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const topDestinations = [...adminData.destinations]
    .sort((first, second) => (second.activeExperiencesCount || 0) - (first.activeExperiencesCount || 0))
    .slice(0, 3);
  const adminApprovedExperiences = adminData.experiences.filter((experience) => experience.status === 'Approved').length;

  const adminStatCards = [
    { 
      label: 'Registered Users', 
      value: adminData.travelers.length + adminData.approvedGuidesCount + adminData.approvedAgentsCount, // ✅ UPDATED
      detail: `${adminData.travelers.length} travelers`, 
      icon: <Group />, 
      color: 'bg-indigo-600' 
    },
    { label: 'Bookings', value: bookingsCount, detail: `Pending: ${pendingBookingsCount}`, icon: <BookOnline />, color: 'bg-amber-500' },
    { label: 'Revenue', value: '$0', detail: 'This month', icon: <AttachMoney />, color: 'bg-emerald-600' },
    { label: 'Experiences', value: adminApprovedExperiences, detail: `${adminData.destinations.length} destinations`, icon: <Tour />, color: 'bg-sky-600' },
  ];

    // ✅ ADD THIS: Calculate dynamic pie chart data
  const totalUsers = adminData.approvedGuidesCount + adminData.approvedAgentsCount + adminData.travelers.length;

  let guidePercent = 0;
  let agentPercent = 0;
  let travelerPercent = 0;

  if (totalUsers > 0) {
    guidePercent = (adminData.approvedGuidesCount / totalUsers) * 100;
    agentPercent = (adminData.approvedAgentsCount / totalUsers) * 100;
    travelerPercent = (adminData.travelers.length / totalUsers) * 100;
  }

  // Build the dynamic gradient string
  const pieChartStyle = totalUsers > 0 
    ? { background: `conic-gradient(#4f46e5 0% ${guidePercent}%, #10b981 ${guidePercent}% ${guidePercent + agentPercent}%, #f59e0b ${guidePercent + agentPercent}% 100%)` }
    : { background: '#e2e8f0' }; // Fallback grey circle if there are 0 users

      // ✅ Build destination · experience booking counts for the trend chart
  const bookingsTrendData = (() => {
    const map = {};
    bookings.forEach((b) => {
      const dest = (b.destinationName || 'Unknown').trim();
      const exp = (b.experienceTitle || 'Unknown').trim();
      if (!map[dest]) map[dest] = { destination: dest, total: 0, experiences: {} };
      map[dest].total += 1;
      map[dest].experiences[exp] = (map[dest].experiences[exp] || 0) + 1;
    });
    return Object.values(map)
      .map((d) => ({
        destination: d.destination,
        total: d.total,
        experiences: Object.entries(d.experiences)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count),
      }))
      .sort((a, b) => b.total - a.total);
  })();

  if (loading) return <div className="flex justify-center items-center h-64">Loading dashboard...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          {getGreeting()}, {user?.fullName || user?.email}!
        </h1>
        <p className="text-gray-500">Admin Dashboard - Manage the Travel Platform</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {adminStatCards.map((card) => (
            <div key={card.label} className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">{card.label}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{card.value}</p>
                  <p className="mt-1 text-xs text-slate-400">{card.detail}</p>
                </div>
                <div className={`rounded-lg p-3 text-white ${card.color}`}>{card.icon}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <div className="mb-4 flex items-center gap-2">
            <WarningAmber className="text-amber-600" />
            <h2 className="font-semibold text-amber-900">Pending Approvals</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { label: 'Guides', value: adminData.pendingGuides },
              { label: 'Agents', value: adminData.pendingAgents || 0 },
              { label: 'Experiences', value: adminData.pendingExperiences },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-amber-200 bg-white px-4 py-3">
                <p className="text-2xl font-bold text-slate-900">{item.value}</p>
                <p className="text-sm text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <BarChart className="text-indigo-600" />
              <div><h2 className="font-semibold text-slate-900">Revenue Trend</h2><p className="text-xs text-slate-400">No payment data yet</p></div>
            </div>
            <div className="flex h-36 items-end gap-3 border-b border-l border-slate-200 px-3 pb-0 pt-4">
              {[28, 42, 34, 58, 45, 68].map((height, index) => <div key={index} className="flex-1 rounded-t bg-indigo-200" style={{ height: `${height}%` }} />)}
            </div>
          </div>
                    <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <TrendingUp className="text-emerald-600" />
              <div>
                <h2 className="font-semibold text-slate-900">Bookings Trend</h2>
                <p className="text-xs text-slate-400">
                  {bookingsCount > 0
                    ? `${bookingsCount} booking(s) across ${bookingsTrendData.length} destination(s)`
                    : 'No booking data yet'}
                </p>
              </div>
            </div>
            <div className="h-56">
              {bookingsTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={bookingsTrendData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="destination"
                      tick={{ fontSize: 11, fill: '#334155' }}
                      interval={0}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(16, 185, 129, 0.06)' }}
                      content={<BookingsCustomTooltip />}
                    />
                    <Bar dataKey="total" radius={[8, 8, 0, 0]} maxBarSize={60}>
                      {bookingsTrendData.map((_, index) => (
                        <Cell
                          key={index}
                          fill={['#10b981', '#4f46e5', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'][index % 6]}
                        />
                      ))}
                    </Bar>
                  </RechartsBarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-slate-400">
                  No booking data yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-xl border bg-white p-6 shadow-sm flex flex-col">
            <div className="mb-5 flex items-center gap-2">
              <LocationOn className="text-indigo-600" />
              <h2 className="font-semibold text-slate-900">Top Destinations</h2>
            </div>

            {topDestinations.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-slate-400">No destination data yet.</p>
              </div>
            ) : (
              <div className="flex-1 space-y-4">
                {(() => {
                  const maxExp = Math.max(
                    ...topDestinations.map((d) => d.activeExperiencesCount || 0),
                    1
                  );
                  const rankStyles = [
                    { badge: 'bg-gradient-to-br from-amber-400 to-yellow-500', emoji: '🥇' },
                    { badge: 'bg-gradient-to-br from-slate-300 to-slate-400', emoji: '🥈' },
                    { badge: 'bg-gradient-to-br from-amber-600 to-amber-700', emoji: '🥉' },
                  ];

                  return topDestinations.map((destination, index) => {
                    const expCount = destination.activeExperiencesCount || 0;
                    const pct = Math.round((expCount / maxExp) * 100);
                    const rank = rankStyles[index] || rankStyles[2];
                    return (
                      <div key={destination.id} className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md ${rank.badge}`}
                          >
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">
                              {destination.name}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">
                              {destination.provinceState || destination.country || 'Sri Lanka'}
                            </p>
                          </div>
                          <span className="text-xs font-bold text-indigo-600 whitespace-nowrap">
                            {expCount} exp
                          </span>
                        </div>
                        {/* Progress bar */}
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </div>
          <div className="rounded-xl border bg-white p-6 shadow-sm flex flex-col">
            <div className="mb-4 flex items-center gap-2">
              <PieChart className="text-fuchsia-600" />
              <h2 className="font-semibold text-slate-900">User Overview</h2>
            </div>

            {/* Donut chart with total in center */}
            <div className="flex-1 flex items-center justify-center py-2">
              <div className="relative">
                <div
                  className="h-44 w-44 rounded-full shadow-inner"
                  style={pieChartStyle}
                />
                {/* White donut hole */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-28 w-28 rounded-full bg-white shadow-md flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-slate-900">{totalUsers}</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wide">Total Users</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4f46e5]" />
                  <span className="text-xs text-slate-500">Guides</span>
                </div>
                <span className="text-sm font-bold text-slate-800">{adminData.approvedGuidesCount}</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                  <span className="text-xs text-slate-500">Agents</span>
                </div>
                <span className="text-sm font-bold text-slate-800">{adminData.approvedAgentsCount}</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                  <span className="text-xs text-slate-500">Travelers</span>
                </div>
                <span className="text-sm font-bold text-slate-800">{adminData.travelers?.length || 0}</span>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Notifications className="text-amber-600" />
              <h2 className="font-semibold text-slate-900">Recent Activity</h2>
            </div>

            {recentActivity.length === 0 ? (
              <p className="text-sm text-slate-400 py-4">No recent activity yet.</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((item) => {
                  const style = ACTIVITY_STYLES[item.type] || ACTIVITY_STYLES.user;
                  const Icon = ACTIVITY_ICONS[item.type] || ACTIVITY_ICONS.user;
                  return (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${style}`}>
                        <Icon fontSize="small" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-800 truncate">{item.title}</p>
                        <p className="text-xs text-slate-500 truncate">{item.subtitle}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{timeAgo(item.timestamp)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <ManageAccounts className="text-indigo-600" />
            <h2 className="font-semibold text-slate-900">Quick Actions</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/destinations/new"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
            >
              <AddLocationAlt fontSize="small" /> Add Destination
            </Link>
            <Link
              to="/guides"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              <People fontSize="small" /> Review Guides
            </Link>
            <Link
              to="/bookings"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              <BookOnline fontSize="small" /> View All Bookings
            </Link>
            <Link
              to="/ai-performance"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              <SmartToy fontSize="small" /> AI Performance
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;