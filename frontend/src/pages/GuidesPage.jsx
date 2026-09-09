import React, { useEffect, useState } from 'react';
import { guideAPI } from '../api/guides';
import { useAuth } from '../context/AuthContext';
import { Verified, Person, Check, Close, Visibility } from '@mui/icons-material';

const GuidesPage = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      const res = await guideAPI.getAll();
      setGuides(res.data || []);
    } catch (error) {
      console.error('Error fetching guides:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await guideAPI.updateStatus(id, status);
      fetchGuides();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading guides...</div>;
  }

  const pendingGuides = guides.filter(g => g.status === 'Pending');
  const approvedGuides = guides.filter(g => g.status === 'Approved');

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Local Guides</h1>
        {isAdmin && (
          <span className="text-sm text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
            {pendingGuides.length} pending approvals
          </span>
        )}
      </div>

      {/* Pending Approvals (Admin only) */}
      {isAdmin && pendingGuides.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-yellow-700 mb-3">Pending Approvals</h2>
          <div className="space-y-3">
            {pendingGuides.map((guide) => (
              <div key={guide.id} className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="bg-yellow-100 p-2 rounded-full">
                    <Person className="text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{guide.fullName}</p>
                    <p className="text-sm text-gray-500">{guide.email}</p>
                    <p className="text-sm text-gray-500">{guide.city} • {guide.yearsOfExperience} years exp</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(guide.id, 'Approved')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-1 hover:bg-green-700 transition"
                  >
                    <Check fontSize="small" /> Approve
                  </button>
                  <button
                    onClick={() => updateStatus(guide.id, 'Rejected')}
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

      {/* All Guides */}
      <h2 className="text-lg font-semibold text-gray-700 mb-3">
        All Guides ({guides.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {approvedGuides.map((guide) => (
          <div key={guide.id} className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="bg-gray-100 p-2 rounded-full">
                <Person className="text-gray-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-800">{guide.fullName}</p>
                  {guide.status === 'Approved' && (
                    <Verified fontSize="small" className="text-green-600" />
                  )}
                </div>
                <p className="text-sm text-gray-500">{guide.email}</p>
                <p className="text-sm text-gray-500">{guide.city} • {guide.yearsOfExperience} years</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-yellow-500">⭐</span>
                  <span className="text-sm font-medium">{guide.rating || 0}</span>
                  <span className="text-xs text-gray-400">({guide.reviewCount || 0} reviews)</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GuidesPage;