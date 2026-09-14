import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { destinationAPI } from '../api/destinations';
import { experienceAPI } from '../api/experiences';
import { guideAPI } from '../api/guides';
import { adminUserAPI } from '../api/adminUsers';
import {
  Add,
  AddLocationAlt,
  AttachMoney,
  BarChart,
  BookOnline,
  CalendarToday,
  CheckCircle,
  Group,
  Dashboard,
  LocationOn,
  ManageAccounts,
  Notifications,
  People,
  PendingActions,
  PieChart,
  Star,
  Tour,
  TrendingUp,
  WarningAmber,
} from '@mui/icons-material';

const DashboardPage = () => {
  const { user, isAdmin, isAgent, isLocalGuide } = useAuth();
  const [stats, setStats] = useState({ destinations: 0, experiences: 0, guides: 0 });
  const [adminData, setAdminData] = useState({
    destinations: [],
    experiences: [],
    guides: [],
    agents: [],
    pendingGuides: 0,
    pendingAgents: 0,
    pendingExperiences: 0,
  });
  const [guideExperiences, setGuideExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
                if (isAdmin) {
          // ✅ Added agentRes to the destructuring
          const [destRes, expRes, guideRes, pendingExpRes, agentRes] = await Promise.all([
            destinationAPI.getAll(),
            experienceAPI.getForAdmin(),
            guideAPI.getAll(),
            experienceAPI.getPending(),
            adminUserAPI.getTravelAgents(), 
          ]);
          
          const guides = guideRes.data || [];
          const agents = agentRes.data || []; // ✅ Define agents
          
          setAdminData({
            destinations: destRes.data || [],
            experiences: expRes.data || [],
            guides,
            agents, // ✅ Store agents
            pendingGuides: guides.filter((guide) => guide.status === 'Pending').length,
            pendingAgents: agents.filter((agent) => !agent.isActive).length, // ✅ Count pending agents
            pendingExperiences: pendingExpRes.data?.length || 0,
          });
        } else if (isLocalGuide) {
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
  }, [isAdmin, isLocalGuide]);

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

  const topDestinations = [...adminData.destinations]
    .sort((first, second) => (second.activeExperiencesCount || 0) - (first.activeExperiencesCount || 0))
    .slice(0, 3);
  const adminApprovedExperiences = adminData.experiences.filter((experience) => experience.status === 'Approved').length;
  const adminStatCards = [
    { label: 'Registered Users', value: 0, detail: 'User directory pending', icon: <Group />, color: 'bg-indigo-600' },
    { label: 'Bookings', value: 0, detail: 'Pending: 0', icon: <BookOnline />, color: 'bg-amber-500' },
    { label: 'Revenue', value: '$0', detail: 'This month', icon: <AttachMoney />, color: 'bg-emerald-600' },
    { label: 'Experiences', value: adminApprovedExperiences, detail: `${adminData.destinations.length} destinations`, icon: <Tour />, color: 'bg-sky-600' },
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

      {!isLocalGuide && !isAdmin && (
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
          <div className="col-span-2 space-y-6">
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
                <div className="mx-auto mb-4 h-28 w-28 rounded-full" style={{ background: 'conic-gradient(#4f46e5 0 33%, #10b981 33% 66%, #f59e0b 66% 100%)' }} />
                <div className="flex justify-center gap-3 text-xs text-slate-500"><span>Guides {adminData.guides.length}</span><span>Agents {adminData.agents?.length || 0}</span><span>Travelers 0</span></div>
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