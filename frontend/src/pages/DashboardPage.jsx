import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import GuideDashboard from './GuideDashboard';
import AgentDashboard from './AgentDashboard';

const DashboardPage = () => {
  const { isAdmin, isLocalGuide, isAgent } = useAuth();

  if (isAdmin) return <AdminDashboard />;
  if (isLocalGuide) return <GuideDashboard />;
  if (isAgent) return <AgentDashboard />;

  return (
    <div className="flex justify-center items-center h-64 text-gray-500">
      Traveler Dashboard (Coming soon...)
    </div>
  );
};

export default DashboardPage;