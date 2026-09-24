import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripAPI } from '../api/trips';
import {
  LocationOn,
  CalendarToday,
  Tour,
  Person,
  Group,
  Speed,
  AttachMoney,
  Verified,
} from '@mui/icons-material';

const TripsPage = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await tripAPI.getAllTrips();
        setTrips(res.data || []);
      } catch (error) {
        console.error('Error fetching trips:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading trips...</div>;

  const statusColor = (status) =>
    status === 'Approved' ? 'bg-emerald-100 text-emerald-700'
    : status === 'Rejected' ? 'bg-rose-100 text-rose-700'
    : 'bg-amber-100 text-amber-700';

  // Filter by status
  const filteredTrips = statusFilter === 'All'
    ? trips
    : trips.filter((t) => t.status === statusFilter);

  const counts = {
    All: trips.length,
    Pending: trips.filter((t) => t.status === 'Pending').length,
    Approved: trips.filter((t) => t.status === 'Approved').length,
    Rejected: trips.filter((t) => t.status === 'Rejected').length,
  };

  const filterTabs = ['All', 'Pending', 'Approved', 'Rejected'];

  return (
    <div>
      {/* ================= HEADER ================= */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">All Trips</h1>
          <p className="text-sm text-gray-500 mt-1">
            {filteredTrips.length} of {trips.length} trips
          </p>
        </div>
      </div>

      {/* ================= STATUS FILTER ================= */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filterTabs.map((tab) => {
          const isActive = statusFilter === tab;
          return (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab} ({counts[tab]})
            </button>
          );
        })}
      </div>

      {/* ================= TRIPS GRID ================= */}
      {filteredTrips.length === 0 ? (
        <div className="text-center py-12 text-gray-500 border rounded-xl border-dashed bg-white">
          <Tour className="text-5xl text-gray-300 mx-auto mb-3" />
          <p className="font-medium">
            {statusFilter === 'All' ? 'No trips yet.' : `No ${statusFilter.toLowerCase()} trips.`}
          </p>
          <p className="text-sm mt-1">Travelers create trips from the mobile app.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTrips.map((trip) => {
            const stopsCount = (trip.tripStops || []).length;
            const isOverBudget = trip.totalEstimatedCost > trip.budget;

            return (
              <div
                key={trip.id}
                onClick={() => navigate(`/trips/${trip.id}`)}
                className="group border rounded-xl bg-white shadow-sm hover:shadow-md hover:border-indigo-300 transition cursor-pointer overflow-hidden flex flex-col"
              >
                {/* ---------- TOP BAR: Title + Status ---------- */}
                <div className="p-5 pb-3">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="font-semibold text-lg text-gray-800 leading-snug truncate">
                      {trip.title}
                    </h3>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusColor(
                        trip.status
                      )}`}
                    >
                      {trip.status}
                    </span>
                  </div>

                  {/* Destination */}
                  <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                    <LocationOn fontSize="small" className="text-indigo-600" />
                    {trip.destinationName || 'Unknown'}
                  </p>

                  {/* Dates */}
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <CalendarToday fontSize="small" />
                    {new Date(trip.startDate).toLocaleDateString()} –{' '}
                    {new Date(trip.endDate).toLocaleDateString()}
                  </p>
                </div>

                {/* ---------- INTERESTS CHIPS ---------- */}
                {trip.interests && (
                  <div className="px-5 pb-3 flex flex-wrap gap-1.5">
                    {trip.interests
                      .split(',')
                      .slice(0, 4)
                      .map((i, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-semibold"
                        >
                          {i.trim()}
                        </span>
                      ))}
                    {trip.interests.split(',').length > 4 && (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-semibold">
                        +{trip.interests.split(',').length - 4}
                      </span>
                    )}
                  </div>
                )}

                {/* ---------- STATS ROW: Budget / Est / Stops ---------- */}
                <div className="px-5 pb-3 grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-lg bg-slate-50 px-2.5 py-2">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">Budget</p>
                    <p className="font-bold text-gray-800">${trip.budget}</p>
                  </div>
                  <div
                    className={`rounded-lg px-2.5 py-2 ${
                      isOverBudget ? 'bg-rose-50' : 'bg-emerald-50'
                    }`}
                  >
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">Est.</p>
                    <p
                      className={`font-bold ${
                        isOverBudget ? 'text-rose-700' : 'text-emerald-700'
                      }`}
                    >
                      ${trip.totalEstimatedCost ?? 0}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 px-2.5 py-2">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">Stops</p>
                    <p className="font-bold text-gray-800">{stopsCount}</p>
                  </div>
                </div>

                {/* ---------- PREFERENCES MINI ROW ---------- */}
                {(trip.travelGroup || trip.travelPace) && (
                  <div className="px-5 pb-3 flex flex-wrap gap-2 text-[11px] text-gray-600">
                    {trip.travelGroup && (
                      <span className="flex items-center gap-1">
                        <Group fontSize="inherit" className="text-indigo-500" />
                        {trip.travelGroup} ({trip.numberOfTravelers || 1})
                      </span>
                    )}
                    {trip.travelPace && (
                      <span className="flex items-center gap-1">
                        <Speed fontSize="inherit" className="text-indigo-500" />
                        {trip.travelPace}
                      </span>
                    )}
                    {trip.budgetTier && (
                      <span className="flex items-center gap-1">
                        <AttachMoney fontSize="inherit" className="text-indigo-500" />
                        {trip.budgetTier}
                      </span>
                    )}
                  </div>
                )}

                {/* ---------- GUIDE + TRAVELER ROW ---------- */}
                <div className="mt-auto px-5 py-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {trip.guideName ? (
                      <>
                        <div className="h-7 w-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {trip.guideName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-gray-400 leading-tight">
                            Guide
                          </p>
                          <p className="text-xs font-medium text-gray-700 truncate">
                            {trip.guideName}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                          <Person fontSize="small" className="text-slate-500" />
                        </div>
                        <p className="text-xs text-gray-400 italic">No guide yet</p>
                      </>
                    )}
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] text-gray-400 leading-tight">Traveler</p>
                    <p className="text-xs font-medium text-gray-700 truncate max-w-[110px]">
                      {trip.travelerName}
                    </p>
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

export default TripsPage;