import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  AccessTime,
  AttachMoney,
  Cancel,
  CheckCircle,
  Edit,
  Pending,
  PlayArrow,
  SmartToy,
  Visibility,
  WarningAmber,
} from '@mui/icons-material';

const AgentDashboard = () => {
  const { user } = useAuth();
  const [agentData, setAgentData] = useState({
    pendingReviews: 0,
    approvedToday: 0,
    rejectedToday: 0,
    itineraries: [],
    executionLogs: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // TODO: Replace with actual API call when Member 2 & 4 finish the backend
        // Example: const res = await aiAPI.getAgentDashboard();
        // setAgentData(res.data);
        
        // For now, we set it to empty/zero values to match your requirement
        setAgentData({
          pendingReviews: 0,
          approvedToday: 0,
          rejectedToday: 0,
          itineraries: [],
          executionLogs: [],
        });
      } catch (error) {
        console.error('Error fetching agent stats:', error);
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

  const agentStatCards = [
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {agentStatCards.map((card) => (
            <div key={card.label} className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`rounded-lg p-3 text-white ${card.color}`}>
                  {card.icon}
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">{card.value}</p>
                  <p className="text-sm text-slate-500">{card.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <AccessTime className="text-amber-600" />
            <h2 className="text-lg font-semibold text-slate-900">AI Itineraries Pending Review ({agentData.pendingReviews})</h2>
          </div>
          
          {agentData.itineraries.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
              <SmartToy className="mx-auto mb-2 h-10 w-10 text-slate-300" />
              <p>No pending AI itineraries to review.</p>
              <p className="text-xs mt-1">Travelers will appear here once they generate AI trips.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {agentData.itineraries.map((trip) => (
                <div key={trip.id} className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <div className="flex justify-between items-start mb-3 border-b border-amber-200 pb-3">
                    <div>
                      <h3 className="font-semibold text-slate-800">Trip #{trip.id} - "{trip.title}"</h3>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                        <span>Traveler: {trip.travelerName}</span> | <span>Duration: {trip.duration} days</span>
                      </p>
                    </div>
                    <span className="text-xs text-slate-500">{trip.timeAgo}</span>
                  </div>
                  
                  <div className="flex gap-4 mb-3 text-sm">
                    <span className="flex items-center gap-1 font-medium text-slate-700"><SmartToy fontSize="small" /> AI Score: {trip.aiScore}%</span>
                    <span className="flex items-center gap-1 font-medium text-slate-700"><AttachMoney fontSize="small" /> Cost: ${trip.cost} (Budget: ${trip.budget})</span>
                    {trip.isOverBudget ? (
                       <span className="flex items-center gap-1 text-rose-600 font-medium"><WarningAmber fontSize="small" /> Over Budget</span>
                    ) : (
                       <span className="flex items-center gap-1 text-emerald-600 font-medium"><CheckCircle fontSize="small" /> Under Budget</span>
                    )}
                  </div>

                  {trip.suggestion && (
                    <div className="bg-white rounded p-2 text-xs text-amber-800 border border-amber-200 mb-3">
                      💡 <strong>AI Suggestion:</strong> {trip.suggestion}
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <button className="px-3 py-1.5 text-xs font-medium rounded border bg-white text-slate-700 hover:bg-slate-50 flex items-center gap-1"><Visibility fontSize="small" /> View Details</button>
                    <button className="px-3 py-1.5 text-xs font-medium rounded bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1"><CheckCircle fontSize="small" /> Approve</button>
                    <button className="px-3 py-1.5 text-xs font-medium rounded bg-amber-500 text-white hover:bg-amber-600 flex items-center gap-1"><Edit fontSize="small" /> Edit</button>
                    <button className="px-3 py-1.5 text-xs font-medium rounded bg-rose-600 text-white hover:bg-rose-700 flex items-center gap-1"><Cancel fontSize="small" /> Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <PlayArrow className="text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-900">AI Execution Log (What agents did)</h2>
          </div>
          
          {agentData.executionLogs.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
              No recent AI agent activity.
            </div>
          ) : (
            <div className="relative border-l border-slate-200 ml-3 space-y-6 pb-2">
              {agentData.executionLogs.map((log, index) => (
                <div key={index} className="ml-6 relative">
                  <span className="absolute -left-[31px] top-0 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 ring-4 ring-white">
                    <span className="h-2 w-2 rounded-full bg-indigo-600"></span>
                  </span>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{log.agent} Agent</p>
                      <p className="text-xs text-slate-500 mt-0.5">{log.action}</p>
                    </div>
                    <span className="text-xs text-slate-400">{log.time}</span>
                  </div>
                  {log.status && (
                     <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${log.status === 'Success' ? 'bg-emerald-50 text-emerald-700' : log.status === 'Warning' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                       {log.status}
                     </span>
                  )}
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