import React, { useEffect, useState } from 'react';
import { destinationAPI } from '../api/destinations';
import { useAuth } from '../context/AuthContext';
import { Add, LocationOn, Visibility } from '@mui/icons-material';

const DestinationsPage = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      const res = await destinationAPI.getAll();
      setDestinations(res.data || []);
    } catch (error) {
      console.error('Error fetching destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading destinations...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Destinations</h1>
        {isAdmin && (
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition">
            <Add fontSize="small" /> Add Destination
          </button>
        )}
      </div>

      {destinations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border">
          <p className="text-gray-500">No destinations found. Add your first destination!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest) => (
            <div key={dest.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition">
              {dest.imageUrl && (
                <img src={dest.imageUrl} alt={dest.name} className="w-full h-48 object-cover" />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">{dest.name}</h3>
                    <p className="text-sm text-gray-500">{dest.country}</p>
                  </div>
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                    {dest.currentSeason}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{dest.description}</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-xs text-gray-500">📍 {dest.provinceState}</span>
                  <span className="text-xs text-gray-500">{dest.activeExperiencesCount} experiences</span>
                </div>
                <div className="flex justify-end mt-3">
                  <button className="text-indigo-600 hover:text-indigo-800">
                    <Visibility fontSize="small" /> View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DestinationsPage;