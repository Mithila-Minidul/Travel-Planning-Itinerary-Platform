import React, { useEffect, useState } from 'react';
import { adminUserAPI } from '../api/adminUsers';
import { useAuth } from '../context/AuthContext';
import { Person, Check, Close, Email, Phone, Business, Badge, Delete } from '@mui/icons-material';
import toast from 'react-hot-toast';

const TravelAgentsPage = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await adminUserAPI.getTravelAgents();
      setAgents(res.data || []);
    } catch (error) {
      console.error('Error fetching travel agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await adminUserAPI.updateAgentStatus(id, status);
      toast.success(status === 'Active' ? 'Agent approved!' : 'Agent rejected.');
      fetchAgents();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to permanently delete the travel agent "${name}"? This action cannot be undone.`)) {
      try {
        await adminUserAPI.deleteTravelAgent(id);
        toast.success('Travel Agent deleted successfully.');
        fetchAgents();
      } catch (error) {
        console.error('Error deleting travel agent:', error);
        toast.error(error.response?.data?.message || 'Failed to delete travel agent.');
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading travel agents...</div>;
  }

  // Normalize status: fall back to IsActive for legacy rows
  const normalized = agents.map((a) => ({
    ...a,
    status: a.status || (a.isActive ? 'Active' : 'Pending'),
  }));

  const pendingAgents = normalized.filter((a) => a.status === 'Pending');
  const activeAgents = normalized.filter((a) => a.status === 'Active');
  const rejectedAgents = normalized.filter((a) => a.status === 'Rejected');

  const AGENT_TABS = ['All', 'Pending', 'Active', 'Rejected'];
  const tabCounts = {
    All: normalized.length,
    Pending: pendingAgents.length,
    Active: activeAgents.length,
    Rejected: rejectedAgents.length,
  };

  const AgentAvatar = ({ agent }) => (
    agent.profileImageUrl ? (
      <img src={agent.profileImageUrl} alt={`${agent.fullName} profile`} className="h-16 w-16 rounded-full object-cover ring-2 ring-white shadow" />
    ) : (
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 ring-2 ring-white shadow">
        <Person className="text-gray-500" />
      </div>
    )
  );

  const AgentDetails = ({ agent }) => (
    <div className="grid grid-cols-1 gap-x-5 gap-y-2 text-xs text-gray-600 sm:grid-cols-2">
      <p className="flex items-center gap-1.5"><Email fontSize="inherit" />{agent.email}</p>
      <p className="flex items-center gap-1.5"><Phone fontSize="inherit" />{agent.phoneNumber}</p>
      <p className="flex items-center gap-1.5 sm:col-span-2"><Business fontSize="inherit" />{agent.agencyName || 'N/A'}</p>
      <p className="flex items-center gap-1.5 sm:col-span-2"><Badge fontSize="inherit" />License: {agent.agentLicenseNumber || 'N/A'}</p>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Travel Agents</h1>
        {isAdmin && (
          <span className="text-sm text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
            {pendingAgents.length} pending approvals
          </span>
        )}
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {AGENT_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              activeTab === tab
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab} ({tabCounts[tab]})
          </button>
        ))}
      </div>

      {/* Pending Approvals */}
      {isAdmin && (activeTab === 'All' || activeTab === 'Pending') && pendingAgents.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-yellow-700 mb-3">Pending Approvals</h2>
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            {pendingAgents.map((agent) => (
              <div key={agent.id} className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                <div className="flex gap-3">
                  <AgentAvatar agent={agent} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-800">{agent.fullName}</p>
                    <div className="mt-3 border-t border-yellow-200 pt-3">
                      <AgentDetails agent={agent} />
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-2 border-t border-yellow-200 pt-3">
                  <button
                    onClick={() => updateStatus(agent.id, 'Active')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-1 hover:bg-green-700 transition"
                  >
                    <Check fontSize="small" /> Approve
                  </button>
                  <button
                    onClick={() => updateStatus(agent.id, 'Rejected')}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-1 hover:bg-red-700 transition"
                  >
                    <Close fontSize="small" /> Reject
                  </button>
                  <button
                    onClick={() => handleDelete(agent.id, agent.fullName)}
                    className="bg-gray-700 text-white px-3 py-2 rounded-lg flex items-center gap-1 hover:bg-gray-800 transition"
                    title="Delete Travel Agent"
                  >
                    <Delete fontSize="small" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state for Pending tab */}
      {isAdmin && activeTab === 'Pending' && pendingAgents.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500 mb-6">
          No pending agents to approve.
        </div>
      )}

      {/* Active Agents */}
      {(activeTab === 'All' || activeTab === 'Active') && (
        <>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">
            Active Agents ({activeAgents.length})
          </h2>
          {activeAgents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500 mb-6">
              No active agents yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {activeAgents.map((agent) => (
                <div key={agent.id} className="rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md">
                  <div className="flex gap-3">
                    <AgentAvatar agent={agent} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-gray-800">{agent.fullName}</p>
                      <div className="mt-1">
                        <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 border-t border-gray-100 pt-3">
                    <AgentDetails agent={agent} />
                  </div>
                  {isAdmin && (
                    <div className="mt-3 border-t border-gray-100 pt-2 flex justify-end">
                      <button
                        onClick={() => handleDelete(agent.id, agent.fullName)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 px-2.5 py-1 rounded-md flex items-center gap-1 transition text-xs font-medium"
                      >
                        <Delete fontSize="small" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Rejected Agents */}
      {activeTab === 'Rejected' && (
        <>
          <h2 className="text-lg font-semibold text-rose-700 mb-3">
            Rejected Agents ({rejectedAgents.length})
          </h2>
          {rejectedAgents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              No rejected agents.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {rejectedAgents.map((agent) => (
                <div key={agent.id} className="rounded-xl border border-rose-200 bg-white p-4 shadow-sm">
                  <div className="flex gap-3">
                    <AgentAvatar agent={agent} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-gray-800">{agent.fullName}</p>
                      <span className="inline-block mt-1 rounded-full bg-rose-100 text-rose-700 px-2 py-0.5 text-[11px] font-semibold">
                        Rejected
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 border-t border-gray-100 pt-3">
                    <AgentDetails agent={agent} />
                  </div>
                  {isAdmin && (
                    <div className="mt-3 border-t border-rose-100 pt-2 flex justify-end">
                      <button
                        onClick={() => handleDelete(agent.id, agent.fullName)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 px-2.5 py-1 rounded-md flex items-center gap-1 transition text-xs font-medium"
                      >
                        <Delete fontSize="small" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TravelAgentsPage;