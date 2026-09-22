import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripAPI } from '../api/trips';
import { SmartToy, AccessTime, CalendarToday, LocationOn } from '@mui/icons-material';

const AIReviewPage = () => {
  const [pendingTrips, setPendingTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPendingTrips();
  }, []);

  const fetchPendingTrips = async () => {
    try {
      const res = await tripAPI.getAllTrips();
      const pending = (res.data || []).filter((t) => t.status === 'Pending');
      setPendingTrips(pending);
    } catch (error) {
      console.error('Error fetching pending trips:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading AI Review Queue...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">AI Review Queue</h1>
        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium">
          {pendingTrips.length} Pending
        </span>
      </div>

      {pendingTrips.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <SmartToy className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700">No Pending Reviews</h3>
          <p className="text-gray-500 text-sm">
            All AI-generated itineraries have been reviewed.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingTrips.map((trip) => (
            <div
              key={trip.id}
              onClick={() => navigate(`/trips/${trip.id}`)}
              className="border border-amber-200 bg-amber-50 rounded-xl p-5 shadow-sm hover:shadow-md cursor-pointer transition"
            >
              <div className="flex justify-between items-start">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-800 text-lg truncate">
                    "{trip.title}"
                  </h3>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <LocationOn fontSize="small" /> {trip.destinationName}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarToday fontSize="small" />
                      {Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24))} days
                    </span>
                    <span>
                      Traveler: <strong>{trip.travelerName}</strong>
                    </span>
                    <span>
                      Budget: <strong>${trip.budget}</strong>
                    </span>
                    <span>
                      Stops: <strong>{trip.tripStops?.length || 0}</strong>
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0 ml-3">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <AccessTime fontSize="small" /> Recent
                  </span>
                  <span className="text-xs text-indigo-600 font-medium whitespace-nowrap">
                    Click to review →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIReviewPage;