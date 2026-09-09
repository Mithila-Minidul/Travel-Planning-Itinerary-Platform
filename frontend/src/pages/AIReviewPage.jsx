import React from 'react';
import { useAuth } from '../context/AuthContext';
import { SmartToy } from '@mui/icons-material';

const AIReviewPage = () => {
  const { isAgent, isAdmin } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">AI Itinerary Review Queue</h1>

      <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
        <SmartToy className="text-6xl text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-700">No Pending Reviews</h3>
        <p className="text-gray-500 text-sm">
          All AI-generated itineraries have been reviewed.
        </p>
        <p className="text-xs text-gray-400 mt-4">
          {isAgent ? 'Agent' : isAdmin ? 'Admin' : ''} Dashboard
        </p>
      </div>

      {/* Placeholder for when Member 2 completes the AI workflow */}
      <div className="mt-6 bg-gray-50 rounded-xl border border-dashed border-gray-300 p-4">
        <p className="text-xs text-gray-400">
          ⚡ This page will display AI-generated itineraries for review when the AI workflow is fully integrated.
        </p>
      </div>
    </div>
  );
};

export default AIReviewPage;