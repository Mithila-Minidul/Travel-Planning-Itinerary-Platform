import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripAPI } from '../api/trips';
import { LocationOn, CalendarToday, Tour } from '@mui/icons-material';

const TripsPage = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">All Trips</h1>
        <span className="text-sm text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
          {trips.length} total
        </span>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-12 text-gray-500 border rounded-xl border-dashed">
          <Tour className="text-5xl text-gray-300 mx-auto mb-3" />
          <p className="font-medium">No trips yet.</p>
          <p className="text-sm mt-1">Travelers create trips from the mobile app.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trips.map((trip) => (
            <div
              key={trip.id}
              onClick={() => navigate(`/trips/${trip.id}`)}
              className="border rounded-xl p-5 bg-white shadow-sm hover:shadow-md hover:border-indigo-300 transition cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-lg text-gray-800 truncate pr-2">{trip.title}</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${statusColor(trip.status)}`}>
                  {trip.status}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                <LocationOn fontSize="small" /> {trip.destinationName || 'Unknown'}
              </p>
              <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
                <CalendarToday fontSize="small" />
                {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">By {trip.travelerName}</span>
                <span className="font-bold text-indigo-600">${trip.budget}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TripsPage;