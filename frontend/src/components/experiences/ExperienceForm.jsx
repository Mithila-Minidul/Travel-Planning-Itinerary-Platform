import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { experienceAPI } from '../../api/experiences';
import { destinationAPI } from '../../api/destinations';
import { categoryAPI } from '../../api/categories';
import { useAuth } from '../../context/AuthContext';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import toast from 'react-hot-toast';

const ExperienceForm = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [destinations, setDestinations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    basePrice: '',
    durationHours: '',
    maxCapacity: '',
    meetingPoint: '',
    destinationId: '',
    categoryId: '',
    imageUrls: [],
  });

  useEffect(() => {
    fetchData();
    if (id) fetchExperience();
  }, [id]);

  const fetchExperience = async () => {
    try {
      const response = await experienceAPI.getById(id);
      const experience = response.data;
      const imageUrls = (experience.imageUrls?.length
        ? experience.imageUrls
        : [experience.coverImageUrl]
      ).filter(Boolean);
      setFormData({
        title: experience.title || '',
        description: experience.description || '',
        basePrice: experience.basePrice || '',
        durationHours: experience.durationHours || '',
        maxCapacity: experience.maxCapacity || '',
        meetingPoint: experience.meetingPoint || '',
        destinationId: experience.destinationId || '',
        categoryId: experience.categoryId || '',
        imageUrls,
      });
      setImagePreviews(imageUrls);
    } catch (error) {
      toast.error('Unable to load this experience.');
      navigate('/my-experiences');
    }
  };

  const fetchData = async () => {
    try {
      const [destRes, catRes] = await Promise.all([
        destinationAPI.getAll(),
        categoryAPI.getAll()
      ]);
      setDestinations(destRes.data || []);
      setCategories(catRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (files.some((file) => !file.type.startsWith('image/'))) {
      toast.error('Please select image files only.');
      return;
    }
    if (files.some((file) => file.size > 5 * 1024 * 1024)) {
      toast.error('Each image must be less than 5MB.');
      return;
    }

    const availableSlots = 4 - formData.imageUrls.length;
    const selectedFiles = files.slice(0, availableSlots);
    if (files.length > availableSlots) {
      toast.error(`You can add up to 4 images. ${availableSlots} slot(s) remaining.`);
    }

    Promise.all(selectedFiles.map((file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }))).then((newImages) => {
      setFormData((current) => ({ ...current, imageUrls: [...current.imageUrls, ...newImages] }));
      setImagePreviews((current) => [...current, ...newImages]);
    }).catch(() => toast.error('Unable to read the selected image.'));
    e.target.value = '';
  };

  const handleRemoveImage = (index) => {
    setFormData((current) => ({
      ...current,
      imageUrls: current.imageUrls.filter((_, imageIndex) => imageIndex !== index),
    }));
    setImagePreviews((current) => current.filter((_, imageIndex) => imageIndex !== index));
  };

  const moveImage = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= formData.imageUrls.length) return;

    setFormData((current) => {
      const imageUrls = [...current.imageUrls];
      [imageUrls[index], imageUrls[targetIndex]] = [imageUrls[targetIndex], imageUrls[index]];
      return { ...current, imageUrls };
    });
    setImagePreviews((current) => {
      const previews = [...current];
      [previews[index], previews[targetIndex]] = [previews[targetIndex], previews[index]];
      return previews;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        basePrice: parseFloat(formData.basePrice),
        durationHours: parseInt(formData.durationHours),
        maxCapacity: parseInt(formData.maxCapacity),
      };
      if (isEditing) {
        await experienceAPI.update(id, payload);
      } else {
        await experienceAPI.create(payload);
      }
      toast.success(isEditing && isAdmin
        ? 'Experience updated successfully.'
        : isEditing
          ? 'Experience updated and submitted for admin approval.'
          : 'Experience submitted. It is pending admin approval.');
      navigate('/my-experiences');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create experience');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{isEditing ? 'Edit Experience' : 'Add New Experience'}</h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6">
        {/* Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        {/* Price & Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Base Price *</label>
            <input
              type="number"
              name="basePrice"
              value={formData.basePrice}
              onChange={handleChange}
              step="0.01"
              min="1"
              max="1000"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Hours) *</label>
            <input
              type="number"
              name="durationHours"
              value={formData.durationHours}
              onChange={handleChange}
              min="1"
              max="168"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <p className="mt-1 text-xs text-gray-500">Maximum 168 hours (7 days)</p>
          </div>
        </div>

        {/* Capacity & Meeting Point */}
        <div className="grid grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Capacity *</label>
            <input
              type="number"
              name="maxCapacity"
              value={formData.maxCapacity}
              onChange={handleChange}
              min="1"
              max="50"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Point</label>
            <input
              type="text"
              name="meetingPoint"
              value={formData.meetingPoint}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Destination & Category */}
        <div className="grid grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Destination *</label>
            <select
              name="destinationId"
              value={formData.destinationId}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Select Destination</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-end justify-between mb-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Experience images</label>
              <p className="text-xs text-gray-500 mt-1">Add up to 4 images. The first image is the cover.</p>
            </div>
            <span className="text-xs font-medium text-indigo-600">{imagePreviews.length}/4</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {imagePreviews.map((image, index) => (
              <div key={image} className="relative aspect-square overflow-hidden rounded-lg border bg-gray-50">
                <img src={image} alt={`Experience preview ${index + 1}`} className="h-full w-full object-cover" />
                <div className="absolute bottom-1.5 left-1.5 right-1.5 flex justify-between">
                  <button
                    type="button"
                    onClick={() => moveImage(index, -1)}
                    disabled={index === 0}
                    aria-label={`Move image ${index + 1} left`}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-black/65 text-white hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ArrowBackIos sx={{ fontSize: 13, ml: '3px' }} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(index, 1)}
                    disabled={index === imagePreviews.length - 1}
                    aria-label={`Move image ${index + 1} right`}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-black/65 text-white hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ArrowForwardIos sx={{ fontSize: 13 }} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  aria-label={`Remove image ${index + 1}`}
                  className="absolute right-1.5 top-1.5 h-7 w-7 rounded-full bg-black/65 text-sm text-white hover:bg-red-600"
                >
                  x
                </button>
              </div>
            ))}
            {imagePreviews.length < 4 && (
              <label htmlFor="imageInput" className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-center hover:border-indigo-400 hover:bg-indigo-50/40">
                <span className="text-2xl text-gray-400">+</span>
                <span className="text-xs text-gray-500">Add image</span>
              </label>
            )}
          </div>
          <input id="imageInput" type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
        </div>

        {/* Submit & Cancel Buttons */}
        <div className="flex gap-4 mt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Experience'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/my-experiences')}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExperienceForm;