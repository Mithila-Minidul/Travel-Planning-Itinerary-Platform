import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripAPI } from '../api/trips';
import {
  SmartToy,
  AccessTime,
  CalendarToday,
  LocationOn,
  CheckCircle,
  Cancel,
  Visibility,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

const AIReviewPage = () => {
  const [pendingTrips, setPendingTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null); // which trip is being processed
  const navigate = useNavigate();

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

  useEffect(() => {
    fetchPendingTrips();
  }, []);

  const handleReview = async (tripId, status) => {
    setActionId(tripId);
    try {
      await tripAPI.reviewTrip(tripId, { status });
      toast.success(`Trip ${status.toLowerCase()} successfully.`);
      // Remove from list optimistically
      setPendingTrips((current) => current.filter((t) => t.id !== tripId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to review trip.');
    } finally {
      setActionId(null);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading AI Review Queue...</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">AI Review Queue</h1>
          <p className="text-sm text-slate-500 mt-1">
            Approve or reject AI-generated itineraries — inline actions
          </p>
        </div>
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
          {pendingTrips.map((trip) => {
            const days = Math.ceil(
              (new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)
            );
            const isOverBudget = trip.totalEstimatedCost > trip.budget;
            const busy = actionId === trip.id;

            return (
              <div
                key={trip.id}
                className="rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  {/* ---------- LEFT: info ---------- */}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-800 text-lg truncate">
                      "{trip.title}"
                    </h3>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <LocationOn fontSize="small" /> {trip.destinationName}
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarToday fontSize="small" /> {days} days
                      </span>
                      <span className="flex items-center gap-1">
                        <AccessTime fontSize="small" /> Recent
                      </span>
                      <span>Traveler: <strong>{trip.travelerName}</strong></span>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm">
                      <span className="text-slate-700">
                        Budget: <strong>${trip.budget}</strong>
                      </span>
                      <span className={`font-medium ${isOverBudget ? 'text-rose-600' : 'text-emerald-600'}`}>
                        Est. Cost: <strong>${trip.totalEstimatedCost}</strong>
                        {isOverBudget ? ' (Over)' : ' (Under)'}
                      </span>
                      <span className="text-slate-700">
                        Stops: <strong>{trip.tripStops?.length || 0}</strong>
                      </span>
                    </div>
                  </div>

                  {/* ---------- RIGHT: actions ---------- */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      onClick={() => navigate(`/trips/${trip.id}`)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Visibility fontSize="small" /> Details
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => handleReview(trip.id, 'Approved')}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      <CheckCircle fontSize="small" /> Approve
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => handleReview(trip.id, 'Rejected')}
                      className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                    >
                      <Cancel fontSize="small" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AIReviewPage;