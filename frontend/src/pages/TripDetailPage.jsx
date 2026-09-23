import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripAPI } from '../api/trips';
import { useAuth } from '../context/AuthContext';
import {
  CheckCircle, Cancel, ArrowBack, CalendarToday, AttachMoney,
  Person, LocationOn, SmartToy, Tour
} from '@mui/icons-material';

const TripDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isAgent } = useAuth();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    fetchTrip();
  }, [id]);

  const fetchTrip = async () => {
    try {
      const res = await tripAPI.getTripById(id);
      setTrip(res.data);
    } catch (error) {
      console.error('Error fetching trip:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (status) => {
    setReviewLoading(true);
    try {
      await tripAPI.reviewTrip(id, { status });
      await fetchTrip();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to review trip.');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading trip...</div>;
  if (!trip) return <div className="p-8 text-center text-gray-500">Trip not found.</div>;

  const stopsByDay = (trip.tripStops || []).reduce((acc, stop) => {
    if (!acc[stop.dayNumber]) acc[stop.dayNumber] = [];
    acc[stop.dayNumber].push(stop);
    return acc;
  }, {});

  const isOverBudget = trip.totalEstimatedCost > trip.budget;

  const statusColor = trip.status === 'Approved'
    ? 'bg-emerald-100 text-emerald-700'
    : trip.status === 'Rejected'
    ? 'bg-rose-100 text-rose-700'
    : 'bg-amber-100 text-amber-700';

  // Check if any trip preferences exist
  const hasPreferences =
    (trip.travelGroup && trip.travelGroup.length > 0) ||
    (trip.budgetTier && trip.budgetTier.length > 0) ||
    (trip.travelPace && trip.travelPace.length > 0) ||
    (trip.preferredTimes && trip.preferredTimes.length > 0) ||
    (trip.specialRequests && trip.specialRequests.length > 0);

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline"
      >
        <ArrowBack fontSize="small" /> Back
      </button>

      {/* ================= TRIP HEADER ================= */}
      <div className="rounded-xl border bg-white p-6 shadow-sm mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{trip.title}</h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              <LocationOn fontSize="small" /> {trip.destinationName}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
            {trip.status}
          </span>
        </div>

        <p className="text-gray-600 mb-4">{trip.objective || 'No objective provided.'}</p>

        {trip.interests && (
          <div className="mb-4 flex flex-wrap gap-2">
            {trip.interests.split(',').map((interest, idx) => (
              <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                {interest.trim()}
              </span>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Person className="text-indigo-600" />
            <div>
              <p className="text-xs text-gray-400">Traveler</p>
              <p className="font-medium text-gray-800">{trip.travelerName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CalendarToday className="text-indigo-600" />
            <div>
              <p className="text-xs text-gray-400">Dates</p>
              <p className="font-medium text-gray-800">
                {new Date(trip.startDate).toLocaleDateString()} → {new Date(trip.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AttachMoney className="text-indigo-600" />
            <div>
              <p className="text-xs text-gray-400">Budget</p>
              <p className="font-medium text-gray-800">${trip.budget}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AttachMoney className={isOverBudget ? 'text-rose-600' : 'text-emerald-600'} />
            <div>
              <p className="text-xs text-gray-400">Est. Cost</p>
              <p className={`font-medium ${isOverBudget ? 'text-rose-600' : 'text-emerald-600'}`}>
                ${trip.totalEstimatedCost} {isOverBudget && '⚠️'}
              </p>
            </div>
          </div>
        </div>

        {/* ================= ASSIGNED LOCAL GUIDE ================= */}
        {trip.guideName && (
          <div className="mt-4 rounded-lg bg-indigo-50 border border-indigo-100 p-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
              {trip.guideName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs text-gray-500">Assigned Local Guide</p>
              <p className="font-semibold text-gray-800">{trip.guideName}</p>
              {trip.guideCity && (
                <p className="text-xs text-gray-500">📍 {trip.guideCity}</p>
              )}
            </div>
          </div>
        )}

        {/* ================= ✅ NEW: TRIP PREFERENCES ================= */}
        {hasPreferences && (
          <div className="mt-4 rounded-lg bg-slate-50 border border-slate-200 p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Trip Preferences
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              {trip.travelGroup && (
                <div>
                  <p className="text-xs text-gray-500">Group</p>
                  <p className="font-medium text-gray-800">
                    {trip.travelGroup} ({trip.numberOfTravelers || 1})
                  </p>
                </div>
              )}
              {trip.budgetTier && (
                <div>
                  <p className="text-xs text-gray-500">Budget Style</p>
                  <p className="font-medium text-gray-800">{trip.budgetTier}</p>
                </div>
              )}
              {trip.travelPace && (
                <div>
                  <p className="text-xs text-gray-500">Pace</p>
                  <p className="font-medium text-gray-800">{trip.travelPace}</p>
                </div>
              )}
              {trip.preferredTimes && (
                <div>
                  <p className="text-xs text-gray-500">Preferred Times</p>
                  <p className="font-medium text-gray-800">
                    {trip.preferredTimes.split(',').join(', ')}
                  </p>
                </div>
              )}
            </div>
            {trip.specialRequests && (
              <div className="mt-3 pt-3 border-t border-slate-200">
                <p className="text-xs text-gray-500">Special Requests</p>
                <p className="text-sm text-gray-700 mt-1">{trip.specialRequests}</p>
              </div>
            )}
          </div>
        )}

        {trip.travelAgentName && (
          <p className="mt-3 text-xs text-gray-500">
            Reviewed by: <strong>{trip.travelAgentName}</strong>
          </p>
        )}
      </div>

      {/* ================= ITINERARY ================= */}
      <div className="rounded-xl border bg-white p-6 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Tour className="text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-800">AI-Generated Itinerary</h2>
        </div>

        {Object.keys(stopsByDay).length === 0 ? (
          <div className="text-center py-8 border border-dashed rounded-lg">
            <SmartToy className="text-4xl text-gray-300 mb-2 mx-auto" />
            <p className="text-gray-500 text-sm">No itinerary stops generated yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.keys(stopsByDay)
              .sort((a, b) => Number(a) - Number(b))
              .map((day) => (
                <div key={day}>
                  <h3 className="font-semibold text-indigo-700 mb-2">Day {day}</h3>
                  <div className="space-y-2">
                    {stopsByDay[day]
                      .sort((a, b) => a.orderIndex - b.orderIndex)
                      .map((stop, idx) => (
                        <div key={idx} className="border-l-4 border-indigo-200 bg-indigo-50/50 p-3 rounded-r-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-800">{stop.title}</p>
                              <p className="text-sm text-gray-600">{stop.description}</p>
                              {stop.location && stop.location !== 'TBD' && (
                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                  <LocationOn fontSize="inherit" /> {stop.location}
                                </p>
                              )}
                            </div>
                            <span className="text-sm font-semibold text-indigo-700">
                              ${stop.estimatedCost}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* ================= REVIEW ACTIONS ================= */}
      {trip.status === 'Pending' && isAgent && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-amber-900">Awaiting Review</h3>
            <p className="text-sm text-amber-700">Approve or reject this AI-generated itinerary.</p>
          </div>
          <div className="flex gap-2">
            <button
              disabled={reviewLoading}
              onClick={() => handleReview('Approved')}
              className="px-5 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle fontSize="small" /> Approve
            </button>
            <button
              disabled={reviewLoading}
              onClick={() => handleReview('Rejected')}
              className="px-5 py-2 rounded-lg bg-rose-600 text-white font-medium hover:bg-rose-700 flex items-center gap-2 disabled:opacity-50"
            >
              <Cancel fontSize="small" /> Reject
            </button>
          </div>
        </div>
      )}

      {/* ================= ADMIN INFO (View-only) ================= */}
      {trip.status === 'Pending' && isAdmin && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
          <h3 className="font-semibold text-gray-800">Pending Review</h3>
          <p className="text-sm text-gray-600 mt-1">
            This trip is waiting for a Travel Agent to review it. You can view the details above.
          </p>
        </div>
      )}
    </div>
  );
};

export default TripDetailPage;