import React, { useEffect, useState } from 'react';
import { adminUserAPI } from '../api/adminUsers';
import { Person, Email, Phone, CheckCircle, Delete } from '@mui/icons-material';
import toast from 'react-hot-toast';

const TravelersPage = () => {
  const [travelers, setTravelers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTravelers();
  }, []);

  const fetchTravelers = async () => {
    try {
      const res = await adminUserAPI.getTravelers();
      setTravelers(res.data || []);
    } catch (error) {
      console.error('Error fetching travelers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to permanently delete traveler "${name}" and all associated bookings, trips, and data? This action cannot be undone.`)) {
      try {
        await adminUserAPI.deleteTraveler(id);
        toast?.success ? toast.success('Traveler deleted successfully.') : alert('Traveler deleted successfully.');
        fetchTravelers();
      } catch (error) {
        console.error('Error deleting traveler:', error);
        toast?.error ? toast.error(error.response?.data?.message || 'Failed to delete traveler.') : alert('Failed to delete traveler.');
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading travelers...</div>;
  }

  const TravelerAvatar = ({ traveler }) => (
    traveler.profileImageUrl ? (
      <img src={traveler.profileImageUrl} alt={`${traveler.fullName} profile`} className="h-16 w-16 rounded-full object-cover ring-2 ring-white shadow" />
    ) : (
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 ring-2 ring-white shadow">
        <Person className="text-gray-500" />
      </div>
    )
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Travelers</h1>
        <span className="text-sm text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
          {travelers.length} registered
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {travelers.map((traveler) => (
          <div key={traveler.id} className="rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md">
            <div className="flex gap-3">
              <TravelerAvatar traveler={traveler} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-semibold text-gray-800">{traveler.fullName}</p>
                  {traveler.isActive && (
                    <CheckCircle fontSize="small" className="text-green-600" />
                  )}
                </div>
                <div className="mt-1">
                  <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">Active</span>
                </div>
              </div>
            </div>
            <div className="mt-3 border-t border-gray-100 pt-3">
              <div className="grid grid-cols-1 gap-x-5 gap-y-2 text-xs text-gray-600 sm:grid-cols-2">
                <p className="flex items-center gap-1.5"><Email fontSize="inherit" />{traveler.email}</p>
                <p className="flex items-center gap-1.5"><Phone fontSize="inherit" />{traveler.phoneNumber}</p>
              </div>
            </div>
            <div className="mt-3 border-t border-gray-100 pt-2 flex justify-end">
              <button
                onClick={() => handleDelete(traveler.id, traveler.fullName)}
                className="text-red-600 hover:text-red-800 hover:bg-red-50 px-2.5 py-1 rounded-md flex items-center gap-1 transition text-xs font-medium"
              >
                <Delete fontSize="small" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {travelers.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
          No travelers have registered yet.
        </div>
      )}
    </div>
  );
};

export default TravelersPage;