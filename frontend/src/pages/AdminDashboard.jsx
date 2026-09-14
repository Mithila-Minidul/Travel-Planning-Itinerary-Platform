import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { destinationAPI } from '../api/destinations';
import { experienceAPI } from '../api/experiences';
import { guideAPI } from '../api/guides';
import { adminUserAPI } from '../api/adminUsers';
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
} from '@mui/icons-material';

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
    { label: 'Bookings', value: 0, detail: 'Pending: 0', icon: <BookOnline />, color: 'bg-amber-500' },
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
              <div><h2 className="font-semibold text-slate-900">Bookings Trend</h2><p className="text-xs text-slate-400">No booking data yet</p></div>
            </div>
            <div className="relative h-36 overflow-hidden border-b border-l border-slate-200">
              <svg viewBox="0 0 400 140" preserveAspectRatio="none" className="h-full w-full" aria-label="Bookings trend placeholder">
                <polyline points="0,120 70,92 140,105 210,65 280,82 350,38 400,52" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2"><LocationOn className="text-indigo-600" /><h2 className="font-semibold text-slate-900">Top Destinations</h2></div>
            {topDestinations.length ? topDestinations.map((destination, index) => <div key={destination.id} className="flex items-center justify-between border-b border-slate-100 py-2.5 last:border-0"><span className="text-sm text-slate-700">{index + 1}. {destination.name}</span><span className="text-xs text-slate-400">{destination.activeExperiencesCount || 0} exp.</span></div>) : <p className="text-sm text-slate-400">No destination data yet.</p>}
          </div>
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2"><PieChart className="text-fuchsia-600" /><h2 className="font-semibold text-slate-900">User Overview</h2></div>
            <div className="mx-auto mb-4 h-28 w-28 rounded-full" style={pieChartStyle} />
            <div className="flex justify-center gap-3 text-xs text-slate-500"><span>Guides {adminData.approvedGuidesCount}</span><span>Agents {adminData.approvedAgentsCount}</span><span>Travelers {adminData.travelers?.length || 0}</span></div>
          </div>
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2"><Notifications className="text-amber-600" /><h2 className="font-semibold text-slate-900">Recent Activity</h2></div>
            <div className="space-y-3 text-sm text-slate-600"><p>• {adminData.pendingGuides} guide approval(s) pending</p><p>• {adminData.pendingExperiences} experience approval(s) pending</p><p>• Payments and bookings will appear here when enabled</p></div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2"><ManageAccounts className="text-indigo-600" /><h2 className="font-semibold text-slate-900">Quick Actions</h2></div>
          <div className="flex flex-wrap gap-3">
            <a href="/destinations/new" className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"><AddLocationAlt fontSize="small" /> Add Destination</a>
            <a href="/guides" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"><People fontSize="small" /> Review Guides</a>
            <button type="button" disabled className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-400"><CalendarToday fontSize="small" /> Bookings unavailable</button>
            <button type="button" disabled className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-400"><BarChart fontSize="small" /> Analytics unavailable</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;