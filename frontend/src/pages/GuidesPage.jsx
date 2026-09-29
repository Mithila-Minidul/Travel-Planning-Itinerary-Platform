import React, { useEffect, useState } from 'react';
import { guideAPI } from '../api/guides';
import { useAuth } from '../context/AuthContext';
import { Verified, Person, Check, Close, Email, Phone, LocationOn, Badge } from '@mui/icons-material';

const GuidesPage = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
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
  const rejectedGuides = guides.filter(g => g.status === 'Rejected');

  const GUIDE_TABS = ['All', 'Pending', 'Approved', 'Rejected'];
  const tabCounts = {
    All: guides.length,
    Pending: pendingGuides.length,
    Approved: approvedGuides.length,
    Rejected: rejectedGuides.length,
  };

  const GuideAvatar = ({ guide }) => (
    guide.profileImageUrl ? (
      <img src={guide.profileImageUrl} alt={`${guide.fullName} profile`} className="h-16 w-16 rounded-full object-cover ring-2 ring-white shadow" />
    ) : (
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 ring-2 ring-white shadow">
        <Person className="text-gray-500" />
      </div>
    )
  );

  const GuideDetails = ({ guide }) => (
    <div className="grid grid-cols-1 gap-x-5 gap-y-2 text-xs text-gray-600 sm:grid-cols-2">
      <p className="flex items-center gap-1.5"><Email fontSize="inherit" />{guide.email}</p>
      <p className="flex items-center gap-1.5"><Phone fontSize="inherit" />{guide.phoneNumber}</p>
      <p className="flex items-center gap-1.5"><LocationOn fontSize="inherit" />{guide.city}</p>
      <p className="flex items-center gap-1.5"><Badge fontSize="inherit" />{guide.licenseNumber}</p>
      <p className="sm:col-span-2"><span className="font-semibold text-gray-700">Experience:</span> {guide.yearsOfExperience} years</p>
      <p className="sm:col-span-2 leading-5"><span className="font-semibold text-gray-700">Bio:</span> {guide.bio}</p>
    </div>
  );

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

            {/* 👇 Filter tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {GUIDE_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              activeTab === tab
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab} ({tabCounts[tab]})
          </button>
        ))}
      </div>

      {/* Pending Approvals (Admin only) */}
      {isAdmin && (activeTab === 'All' || activeTab === 'Pending') && pendingGuides.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-yellow-700 mb-3">Pending Approvals</h2>
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            {pendingGuides.map((guide) => (
              <div key={guide.id} className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                <div className="flex gap-3">
                  <GuideAvatar guide={guide} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-800">{guide.fullName}</p>
                    <div className="mt-3 border-t border-yellow-200 pt-3">
                      <GuideDetails guide={guide} />
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-2 border-t border-yellow-200 pt-3">
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

      {/* 👇 Empty state for Pending tab when nothing to approve */}
      {isAdmin && activeTab === 'Pending' && pendingGuides.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500 mb-6">
          No pending guides to approve.
        </div>
      )}

      {/* All / Approved Guides */}
      {(activeTab === 'All' || activeTab === 'Approved') && (
        <>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">
            Approved Guides ({approvedGuides.length})
          </h2>
          {approvedGuides.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              No approved guides yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {approvedGuides.map((guide) => (
                <div key={guide.id} className="rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md">
                  <div className="flex gap-3">
                    <GuideAvatar guide={guide} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold text-gray-800">{guide.fullName}</p>
                        {guide.status === 'Approved' && (
                          <Verified fontSize="small" className="text-green-600" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="text-sm font-medium">{guide.rating || 0}</span>
                        <span className="text-xs text-gray-400">({guide.reviewCount || 0} reviews)</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 border-t border-gray-100 pt-3">
                    <GuideDetails guide={guide} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Rejected Guides */}
      {activeTab === 'Rejected' && (
        <>
          <h2 className="text-lg font-semibold text-rose-700 mb-3">
            Rejected Guides ({rejectedGuides.length})
          </h2>
          {rejectedGuides.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              No rejected guides.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {rejectedGuides.map((guide) => (
                <div key={guide.id} className="rounded-xl border border-rose-200 bg-white p-4 shadow-sm">
                  <div className="flex gap-3">
                    <GuideAvatar guide={guide} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-gray-800">{guide.fullName}</p>
                      <span className="inline-block mt-1 rounded-full bg-rose-100 text-rose-700 px-2 py-0.5 text-[11px] font-semibold">
                        Rejected
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 border-t border-gray-100 pt-3">
                    <GuideDetails guide={guide} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GuidesPage;