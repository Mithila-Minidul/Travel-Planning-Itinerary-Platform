import React, { useEffect, useState } from 'react';
import { adminUserAPI } from '../api/adminUsers';
import { useAuth } from '../context/AuthContext';
import { Person, Check, Close, Email, Phone, Business, Badge } from '@mui/icons-material';

const TravelAgentsPage = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const updateStatus = async (id, isActive) => {
    try {
      await adminUserAPI.updateAgentStatus(id, isActive);
      fetchAgents();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading travel agents...</div>;
  }

  // Filter based on IsActive boolean
  const pendingAgents = agents.filter(a => !a.isActive);
  const approvedAgents = agents.filter(a => a.isActive);

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

      {/* Pending Approvals */}
      {isAdmin && pendingAgents.length > 0 && (
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
                    onClick={() => updateStatus(agent.id, true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-1 hover:bg-green-700 transition"
                  >
                    <Check fontSize="small" /> Approve
                  </button>
                  <button
                    onClick={() => updateStatus(agent.id, false)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-1 hover:bg-red-700 transition"
                  >
                    <Close fontSize="small" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approved Agents */}
      <h2 className="text-lg font-semibold text-gray-700 mb-3">
        Active Agents ({approvedAgents.length})
      </h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {approvedAgents.map((agent) => (
          <div key={agent.id} className="rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md">
            <div className="flex gap-3">
              <AgentAvatar agent={agent} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-gray-800">{agent.fullName}</p>
                <div className="mt-1">
                  <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">Active</span>
                </div>
              </div>
            </div>
            <div className="mt-3 border-t border-gray-100 pt-3">
              <AgentDetails agent={agent} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TravelAgentsPage;