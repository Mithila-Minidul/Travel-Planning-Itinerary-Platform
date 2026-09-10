import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { experienceAPI } from '../api/experiences';
import { Add, Edit, Delete, LocationOn, Schedule, People, Place, ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import toast from 'react-hot-toast';

const MyExperiencesPage = () => {
  const [experiences, setExperiences] = useState([]);
  const [imageIndexes, setImageIndexes] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyExperiences();
  }, []);

  const fetchMyExperiences = async () => {
    try {
      const res = await experienceAPI.getMine();
      setExperiences(res.data || []);
    } catch (error) {
      console.error('Error fetching experiences:', error);
    } finally {
      setLoading(false);
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

  const deleteExperience = async (experience) => {
    if (!window.confirm(`Delete "${experience.title}"? This cannot be undone.`)) return;

    try {
      await experienceAPI.remove(experience.id);
      setExperiences((current) => current.filter((item) => item.id !== experience.id));
      toast.success('Experience deleted.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete experience.');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading your experiences...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Experiences</h1>
        <button
          onClick={() => navigate('/experiences/new')}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition"
        >
          <Add fontSize="small" /> Add Experience
        </button>
      </div>

      {experiences.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border">
          <p className="text-gray-500">You haven't submitted any experiences yet.</p>
          <button
            onClick={() => navigate('/experiences/new')}
            className="mt-4 text-indigo-600 hover:underline"
          >
            Create your first experience →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {experiences.map((exp) => (
            <article key={exp.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className="relative h-52 bg-slate-100 sm:h-60">
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
                      className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white shadow-lg transition hover:bg-black/75"
                    >
                      <ArrowBackIos sx={{ fontSize: 16, ml: '4px' }} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveCardImage(exp.id, getImages(exp).length, 1)}
                      aria-label={`Next image for ${exp.title}`}
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white shadow-lg transition hover:bg-black/75"
                    >
                      <ArrowForwardIos sx={{ fontSize: 16 }} />
                    </button>
                    <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/45 px-2 py-1">
                      {getImages(exp).map((image, index) => (
                        <span key={image} className={`h-1.5 w-1.5 rounded-full ${index === (imageIndexes[exp.id] || 0) ? 'bg-white' : 'bg-white/45'}`} />
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-indigo-600">{exp.categoryName}</p>
                    <h3 className="truncate text-lg font-bold text-slate-900">{exp.title}</h3>
                    <p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><LocationOn fontSize="inherit" />{exp.destinationName}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                    exp.status === 'Approved' ? 'bg-green-100 text-green-700' :
                    exp.status === 'PendingApproval' ? 'bg-yellow-100 text-yellow-700' :
                    exp.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {exp.status === 'PendingApproval' ? 'Pending review' : exp.status}
                  </span>
                </div>
                <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">{exp.description}</p>
                <div className="mt-5 grid grid-cols-2 gap-3 border-y border-slate-100 py-4 text-sm text-slate-600 sm:grid-cols-4">
                  <span className="flex items-center gap-2"><span className="text-indigo-600"><Schedule fontSize="small" /></span>{exp.durationHours} hours</span>
                  <span className="flex items-center gap-2"><span className="text-indigo-600"><People fontSize="small" /></span>{exp.maxCapacity} guests</span>
                  <span className="flex items-center gap-2"><span className="text-indigo-600"><Place fontSize="small" /></span>{exp.meetingPoint || 'Flexible'}</span>
                  <span className="flex items-center gap-2 font-bold text-indigo-700">${exp.currentCalculatedPrice}</span>
                </div>
                <div className="mt-4 flex justify-end gap-2">
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
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyExperiencesPage;