import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tripAPI } from '../api/trips';
import {
  AccessTime,
  AttachMoney,
  Cancel,
  CheckCircle,
  Pending,
  PlayArrow,
  SmartToy,
  WarningAmber,
  LocationOn,
} from '@mui/icons-material';

const AgentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [agentData, setAgentData] = useState({
    pendingReviews: 0,
    approvedToday: 0,
    rejectedToday: 0,
    pendingTrips: [],
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await tripAPI.getAllTrips();
      const trips = res.data || [];

      // ---- Today's date boundaries ----
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // ---- Calculate stats ----
      const pendingTrips = trips.filter((t) => t.status === 'Pending');

      const approvedToday = trips.filter((t) => {
        if (t.status !== 'Approved') return false;
        const updated = new Date(t.updatedAt);
        return updated >= today;
      }).length;

      const rejectedToday = trips.filter((t) => {
        if (t.status !== 'Rejected') return false;
        const updated = new Date(t.updatedAt);
        return updated >= today;
      }).length;

      // ---- Build "Recent Activity" from recently updated trips ----
      const recentActivity = [...trips]
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 5)
        .map((t) => ({
          id: t.id,
          agent: t.status === 'Pending' ? 'Planner' : 'Approval',
          action: t.status === 'Pending'
            ? `Generated itinerary for "${t.title}"`
            : `${t.status} "${t.title}"`,
          time: new Date(t.updatedAt).toLocaleString(),
          status: t.status === 'Approved' ? 'Success'
                  : t.status === 'Rejected' ? 'Warning'
                  : 'Info',
        }));

      setAgentData({
        pendingReviews: pendingTrips.length,
        approvedToday,
        rejectedToday,
        pendingTrips: pendingTrips.slice(0, 5),
        recentActivity,
      });
    } catch (error) {
      console.error('Error fetching agent dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const statCards = [
    { label: 'Pending Reviews', value: agentData.pendingReviews, icon: <Pending />, color: 'bg-amber-500' },
    { label: 'Approved Today', value: agentData.approvedToday, icon: <CheckCircle />, color: 'bg-emerald-600' },
    { label: 'Rejected Today', value: agentData.rejectedToday, icon: <Cancel />, color: 'bg-rose-600' },
  ];

  if (loading) return <div className="flex justify-center items-center h-64">Loading dashboard...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          {getGreeting()}, {user?.fullName || user?.email}!
        </h1>
        <p className="text-gray-500">Agent Dashboard - Review AI Itineraries</p>
      </div>

      <div className="space-y-6">
        {/* ============== STAT CARDS ============== */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {statCards.map((card) => (
            <div key={card.label} className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`rounded-lg p-3 text-white ${card.color}`}>{card.icon}</div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">{card.value}</p>
                  <p className="text-sm text-slate-500">{card.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ============== PENDING ITINERARIES ============== */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AccessTime className="text-amber-600" />
              <h2 className="text-lg font-semibold text-slate-900">
                AI Itineraries Pending Review ({agentData.pendingReviews})
              </h2>
            </div>
            {agentData.pendingReviews > 0 && (
              <button
                onClick={() => navigate('/ai-review')}
                className="text-sm text-indigo-600 hover:underline"
              >
                View all →
              </button>
            )}
          </div>

          {agentData.pendingTrips.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
              <SmartToy className="mx-auto mb-2 h-10 w-10 text-slate-300" />
              <p>No pending AI itineraries to review.</p>
              <p className="text-xs mt-1">Travelers will appear here once they generate AI trips.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {agentData.pendingTrips.map((trip) => {
                const days = Math.ceil(
                  (new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)
                );
                const isOverBudget = trip.totalEstimatedCost > trip.budget;
                return (
                  <div
                    key={trip.id}
                    onClick={() => navigate(`/trips/${trip.id}`)}
                    className="rounded-lg border border-amber-200 bg-amber-50 p-4 hover:shadow-md cursor-pointer transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-slate-800 truncate">
                          "{trip.title}"
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="flex items-center gap-1">
                            <LocationOn fontSize="inherit" /> {trip.destinationName}
                          </span>
                          <span>{days} days</span>
                          <span>Traveler: <strong>{trip.travelerName}</strong></span>
                        </p>
                        <p className="text-xs mt-1.5 flex items-center gap-3">
                          <span className="flex items-center gap-1 font-medium text-slate-700">
                            <AttachMoney fontSize="inherit" /> Budget: ${trip.budget}
                          </span>
                          <span className={`flex items-center gap-1 font-medium ${isOverBudget ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {isOverBudget ? <WarningAmber fontSize="inherit" /> : <CheckCircle fontSize="inherit" />}
                            Cost: ${trip.totalEstimatedCost} {isOverBudget ? '(Over)' : '(Under)'}
                          </span>
                        </p>
                      </div>
                      <span className="text-xs text-indigo-600 font-medium whitespace-nowrap ml-3">
                        Review →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ============== AI EXECUTION LOG ============== */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <PlayArrow className="text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-900">
              AI Execution Log (What agents did)
            </h2>
          </div>

          {agentData.recentActivity.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
              No recent AI agent activity.
            </div>
          ) : (
            <div className="relative border-l border-slate-200 ml-3 space-y-5 pb-2">
              {agentData.recentActivity.map((log) => (
                <div key={log.id} className="ml-6 relative">
                  <span className="absolute -left-[31px] top-0 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 ring-4 ring-white">
                    <span className="h-2 w-2 rounded-full bg-indigo-600"></span>
                  </span>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{log.agent} Agent</p>
                      <p className="text-xs text-slate-500 mt-0.5">{log.action}</p>
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap ml-3">{log.time}</span>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${
                      log.status === 'Success'
                        ? 'bg-emerald-50 text-emerald-700'
                        : log.status === 'Warning'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;