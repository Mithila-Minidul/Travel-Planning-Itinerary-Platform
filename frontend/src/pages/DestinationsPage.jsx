import React, { useEffect, useState } from 'react';
import { destinationAPI } from '../api/destinations';
import { imageAPI } from '../api/images';
import { experienceAPI } from '../api/experiences';
import { useAuth } from '../context/AuthContext';
import { Add, Visibility, Close, Delete } from '@mui/icons-material';
import toast from 'react-hot-toast';

const DestinationsPage = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [destinationExperiences, setDestinationExperiences] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    provinceState: '',
    country: 'Sri Lanka',
    description: '',
    imageUrl: '',
    latitude: '',
    longitude: '',
    currentSeason: 'Regular',
    // ✅ NEW
    bestTimeToVisit: '',
    idealDuration: '',
    highlights: '',
  });
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchDestinations();
  }, [isAdmin]);

  const fetchDestinations = async () => {
    try {
      const [destinationResponse, experienceResponse] = await Promise.all([
        destinationAPI.getAll(),
        isAdmin ? experienceAPI.getForAdmin() : Promise.resolve({ data: [] }),
      ]);
      const allExperiences = experienceResponse.data || [];
      const destinationList = (destinationResponse.data || []).map((destination) => ({
        ...destination,
        activeExperiencesCount: isAdmin
          ? allExperiences.filter((experience) => experience.destinationId === destination.id).length
          : destination.activeExperiencesCount,
      }));
      setDestinations(destinationList);
    } catch (error) {
      console.error('Error fetching destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateForm = () => {
    setFormData({
      name: '', provinceState: '', country: 'Sri Lanka', description: '', imageUrl: '',
      latitude: '', longitude: '', currentSeason: 'Regular',
      bestTimeToVisit: '', idealDuration: '', highlights: '',
    });
    setShowForm(true);
  };

  const handleFormChange = (event) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB.');
      return;
    }

    try {
      const response = await imageAPI.upload(file, 'destinations');
      setFormData((current) => ({ ...current, imageUrl: response.data.url }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to upload the destination image.');
    }
  };

  const createDestination = async (event) => {
    event.preventDefault();
    setFormLoading(true);
    try {
      const seasonValues = { Regular: 0, Peak: 1, OffPeak: 2 };
      const response = await destinationAPI.create({
        ...formData,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        currentSeason: seasonValues[formData.currentSeason] ?? 0,
      });
      setDestinations((current) => [response.data, ...current]);
      setShowForm(false);
      toast.success('Destination created successfully.');
    } catch (error) {
      const validationErrors = error.response?.data?.errors;
      const validationMessage = validationErrors
        ? Object.values(validationErrors).flat().join(' ')
        : null;
      toast.error(validationMessage || error.response?.data?.message || 'Unable to create destination.');
    } finally {
      setFormLoading(false);
    }
  };

  const viewDestination = async (destination) => {
    try {
      const response = await experienceAPI.getForAdmin();
      setSelectedDestination(destination);
      setDestinationExperiences((response.data || []).filter((experience) => experience.destinationId === destination.id));
    } catch (error) {
      toast.error('Unable to load destination experiences.');
    }
  };

  const deleteDestination = async (destination) => {
    if (!window.confirm(`Delete "${destination.name}"? Existing experiences will be kept, but this destination will be hidden.`)) return;
    try {
      await destinationAPI.remove(destination.id);
      setDestinations((current) => current.filter((item) => item.id !== destination.id));
      if (selectedDestination?.id === destination.id) setSelectedDestination(null);
      toast.success('Destination deleted.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete destination.');
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
          <button onClick={openCreateForm} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition">
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

                {/* ✅ NEW: Show enrichment fields on card if present */}
                {dest.idealDuration && (
                  <p className="text-xs text-gray-500 mt-2">⏱ Ideal: {dest.idealDuration}</p>
                )}
                {dest.bestTimeToVisit && (
                  <p className="text-xs text-gray-500 mt-1">📅 Best: {dest.bestTimeToVisit}</p>
                )}

                <div className="flex items-center gap-4 mt-3">
                  <span className="text-xs text-gray-500">📍 {dest.provinceState}</span>
                  <span className="text-xs text-gray-500">{dest.activeExperiencesCount} experiences</span>
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  <button onClick={() => viewDestination(dest)} className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                    <Visibility fontSize="small" /> View
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteDestination(dest)}
                    aria-label={`Delete ${dest.name}`}
                    className="rounded-lg p-1 text-red-500 hover:bg-red-50 hover:text-red-700"
                  >
                    <Delete fontSize="small" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============ CREATE FORM MODAL ============ */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <form onSubmit={createDestination} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between border-b pb-4">
              <h2 className="text-xl font-bold text-slate-900">Add New Destination</h2>
              <button type="button" onClick={() => setShowForm(false)} aria-label="Close form" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><Close /></button>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">Name *<input required name="name" value={formData.name} onChange={handleFormChange} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
              <label className="text-sm font-medium text-slate-700">Province/State *<input required name="provinceState" value={formData.provinceState} onChange={handleFormChange} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
              <label className="text-sm font-medium text-slate-700">Country *<input required name="country" value={formData.country} onChange={handleFormChange} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
              <label className="text-sm font-medium text-slate-700">Season<select name="currentSeason" value={formData.currentSeason} onChange={handleFormChange} className="mt-1 w-full rounded-lg border px-3 py-2"><option value="Regular">Regular</option><option value="Peak">Peak</option><option value="OffPeak">Off Peak</option></select></label>
              <label className="text-sm font-medium text-slate-700">Latitude<input required type="number" step="any" name="latitude" value={formData.latitude} onChange={handleFormChange} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
              <label className="text-sm font-medium text-slate-700">Longitude<input required type="number" step="any" name="longitude" value={formData.longitude} onChange={handleFormChange} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
            </div>

            <label className="mt-4 block text-sm font-medium text-slate-700">Description<textarea name="description" value={formData.description} onChange={handleFormChange} rows="4" className="mt-1 w-full rounded-lg border px-3 py-2" /></label>

            {/* ✅ NEW: Enrichment fields */}
            <div className="mt-4 border-t border-slate-200 pt-4">
              <p className="text-sm font-semibold text-slate-800 mb-3">Optional Details</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">Best Time to Visit<input name="bestTimeToVisit" value={formData.bestTimeToVisit} onChange={handleFormChange} placeholder="e.g. December to March" className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
                <label className="text-sm font-medium text-slate-700">Ideal Duration<input name="idealDuration" value={formData.idealDuration} onChange={handleFormChange} placeholder="e.g. 2-3 days" className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
              </div>
              <label className="mt-4 block text-sm font-medium text-slate-700">Highlights<textarea name="highlights" value={formData.highlights} onChange={handleFormChange} rows="2" placeholder="e.g. Nine Arches Bridge, Tea Estates, Little Adam's Peak" className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700">Destination image</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="mt-2 block w-full text-sm" />
              {formData.imageUrl && <img src={formData.imageUrl} alt="Destination preview" className="mt-3 h-32 w-full rounded-lg object-cover" />}
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t pt-4">
              <button type="button" onClick={() => setShowForm(false)} className="rounded-lg bg-slate-100 px-4 py-2 text-slate-700">Cancel</button>
              <button disabled={formLoading} className="rounded-lg bg-indigo-600 px-4 py-2 text-white disabled:opacity-50">{formLoading ? 'Creating...' : 'Create Destination'}</button>
            </div>
          </form>
        </div>
      )}

      {/* ============ VIEW EXPERIENCES MODAL ============ */}
      {selectedDestination && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{selectedDestination.name}</h2>
                <p className="text-sm text-slate-500">{selectedDestination.provinceState}, {selectedDestination.country}</p>
              </div>
              <button onClick={() => setSelectedDestination(null)} aria-label="Close experiences" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><Close /></button>
            </div>

            {/* ✅ NEW: Display enrichment fields */}
            {(selectedDestination.bestTimeToVisit || selectedDestination.idealDuration || selectedDestination.highlights) && (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {selectedDestination.bestTimeToVisit && (
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Best Time to Visit</p>
                    <p className="text-sm font-medium text-slate-800">{selectedDestination.bestTimeToVisit}</p>
                  </div>
                )}
                {selectedDestination.idealDuration && (
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Ideal Duration</p>
                    <p className="text-sm font-medium text-slate-800">{selectedDestination.idealDuration}</p>
                  </div>
                )}
                {selectedDestination.highlights && (
                  <div className="rounded-lg bg-slate-50 p-3 sm:col-span-2">
                    <p className="text-xs text-slate-500">Highlights</p>
                    <p className="text-sm font-medium text-slate-800">{selectedDestination.highlights}</p>
                  </div>
                )}
              </div>
            )}

            <h3 className="mb-4 mt-5 font-semibold text-slate-800">All experiences ({destinationExperiences.length})</h3>
            {destinationExperiences.length === 0 ? (
              <p className="rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-500">No experiences for this destination yet.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {destinationExperiences.map((experience) => (
                  <div key={experience.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-slate-900">{experience.title}</h4>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
                        {experience.status === 'PendingApproval' ? 'Pending' : experience.status}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">{experience.description}</p>
                    <div className="mt-3 flex justify-between text-xs text-slate-500">
                      <span>{experience.durationHours} hours</span>
                      <span>${experience.currentCalculatedPrice}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DestinationsPage;