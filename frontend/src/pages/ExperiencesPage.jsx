import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { experienceAPI } from '../api/experiences';
import { categoryAPI } from '../api/categories';
import { useAuth } from '../context/AuthContext';
import {
  Edit,
  Delete,
  LocationOn,
  Schedule,
  AccessTime,
  People,
  Place,
  ArrowBackIos,
  ArrowForwardIos,
  CalendarToday,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

const ExperiencesPage = () => {
  const [experiences, setExperiences] = useState([]);
  const [imageIndexes, setImageIndexes] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      const requests = [isAdmin ? experienceAPI.getForAdmin() : experienceAPI.getAll(), categoryAPI.getAll()];

      const [expRes, catRes] = await Promise.all(requests);
      setExperiences(expRes.data || []);
      setCategories(catRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateExperienceStatus = async (id, status) => {
    try {
      await experienceAPI.updateStatus(id, status);
      setExperiences((current) => current.map((experience) => (
        experience.id === id ? { ...experience, status } : experience
      )));
    } catch (error) {
      console.error('Error updating experience status:', error);
    }
  };

  const deleteExperience = async (experience) => {
    if (experience.status === 'PendingApproval') return;
    if (!window.confirm(`Delete "${experience.title}"? This cannot be undone.`)) return;

    try {
      await experienceAPI.remove(experience.id);
      setExperiences((current) => current.filter((item) => item.id !== experience.id));
      toast.success('Experience deleted.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete experience.');
    }
  };

  const getImages = (experience) => (experience.imageUrls?.length
    ? experience.imageUrls
    : [experience.coverImageUrl]
  ).filter(Boolean);

  const moveCardImage = (experienceId, imageCount, direction) => {
    setImageIndexes((current) => {
      const currentIndex = current[experienceId] || 0;
      return {
        ...current,
        [experienceId]: (currentIndex + direction + imageCount) % imageCount,
      };
    });
  };
    const EXPERIENCE_TABS = ['All', 'Pending', 'Approved', 'Rejected'];

  const tabCounts = EXPERIENCE_TABS.reduce((acc, tab) => {
    if (tab === 'All') {
      acc[tab] = experiences.length;
    } else if (tab === 'Pending') {
      acc[tab] = experiences.filter((e) => e.status === 'PendingApproval').length;
    } else {
      acc[tab] = experiences.filter((e) => e.status === tab).length;
    }
    return acc;
  }, {});

  const filteredExperiences = activeTab === 'All'
    ? experiences
    : activeTab === 'Pending'
    ? experiences.filter((e) => e.status === 'PendingApproval')
    : experiences.filter((e) => e.status === activeTab);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading experiences...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Experiences</h1>
      </div>

      {/* 👇 Filter tabs (same style as All Trips page) */}
      <div className="mb-6 flex flex-wrap gap-2">
        {EXPERIENCE_TABS.map((tab) => (
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

      {filteredExperiences.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border">
          <p className="text-gray-500">
            No {activeTab === 'All' ? '' : activeTab.toLowerCase() + ' '}experiences found.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredExperiences.map((exp) => (
            <article key={exp.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
              <div className="relative h-40 bg-slate-100">
                {getImages(exp).length > 0 ? (
                  <img
                    src={getImages(exp)[imageIndexes[exp.id] || 0]}
                    alt={exp.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">No images</div>
                )}
                {getImages(exp).length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => moveCardImage(exp.id, getImages(exp).length, -1)}
                      aria-label={`Previous image for ${exp.title}`}
                      className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white shadow transition hover:bg-black/75"
                    >
                      <ArrowBackIos sx={{ fontSize: 14, ml: '3px' }} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveCardImage(exp.id, getImages(exp).length, 1)}
                      aria-label={`Next image for ${exp.title}`}
                      className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white shadow transition hover:bg-black/75"
                    >
                      <ArrowForwardIos sx={{ fontSize: 14 }} />
                    </button>
                    <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1 rounded-full bg-black/45 px-2 py-1">
                      {getImages(exp).map((image, index) => (
                        <span key={image} className={`h-1.5 w-1.5 rounded-full ${index === (imageIndexes[exp.id] || 0) ? 'bg-white' : 'bg-white/45'}`} />
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="mb-1 truncate text-[11px] font-semibold uppercase tracking-wide text-indigo-600">{exp.categoryName}</p>
                    <h3 className="truncate font-bold text-slate-900">{exp.title}</h3>
                    <p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-500"><LocationOn fontSize="inherit" />{exp.destinationName}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    exp.status === 'Approved' ? 'bg-green-100 text-green-700' :
                    exp.status === 'PendingApproval' ? 'bg-yellow-100 text-yellow-700' :
                    exp.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {exp.status === 'PendingApproval' ? 'Pending review' : exp.status}
                  </span>
                </div>
                <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-slate-600">{exp.description}</p>
                <p className="mt-2 truncate text-xs text-slate-500">Guide: {exp.guideName || 'Unknown guide'}</p>
                <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-y border-slate-100 py-3 text-xs text-slate-600">
                  <span className="flex items-center gap-1.5"><Schedule className="text-indigo-600" fontSize="small" />{exp.durationHours} hours</span>
                  <span className="flex items-center gap-1.5"><People className="text-indigo-600" fontSize="small" />{exp.maxCapacity} guests</span>
                  <span className="flex min-w-0 items-center gap-1.5"><Place className="shrink-0 text-indigo-600" fontSize="small" /><span className="truncate">{exp.meetingPoint || 'Flexible'}</span></span>
                  <span className="font-bold text-indigo-700">${exp.currentCalculatedPrice}</span>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <CalendarToday className="text-indigo-600" fontSize="small" />
                    <strong>Available:</strong> {(exp.availableWeekdays || []).map((day) => day.slice(0, 3)).join(', ') || 'Not set'}
                  </span>
                  <span className="flex items-center gap-1.5"><AccessTime className="text-indigo-600" fontSize="small" /><strong>Time:</strong> {exp.startTime || '--:--'} - {exp.endTime || '--:--'}</span>
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  {isAdmin && (
                    <>
                      {exp.status === 'PendingApproval' && (
                        <>
                          <button
                            onClick={() => updateExperienceStatus(exp.id, 'Approved')}
                            className="text-sm text-green-600 hover:text-green-800"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateExperienceStatus(exp.id, 'Rejected')}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {exp.status !== 'PendingApproval' && (
                        <>
                          <button
                            type="button"
                            aria-label={`Edit ${exp.title}`}
                            onClick={() => navigate(`/experiences/${exp.id}/edit`)}
                            className="rounded-lg p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Edit fontSize="small" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Delete ${exp.title}`}
                            onClick={() => deleteExperience(exp)}
                            className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <Delete fontSize="small" />
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExperiencesPage;