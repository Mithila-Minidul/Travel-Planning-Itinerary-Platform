import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { experienceAPI } from '../../api/experiences';
import { destinationAPI } from '../../api/destinations';
import { categoryAPI } from '../../api/categories';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ExperienceForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [destinations, setDestinations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState(null); // ✅ For preview
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    basePrice: '',
    durationHours: '',
    maxCapacity: '',
    meetingPoint: '',
    destinationId: '',
    categoryId: '',
    coverImageUrl: '', // Will store Base64 image data
  });

  useEffect(() => {
    fetchData();
  }, []);

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

  // ✅ NEW: Handle image file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setFormData({ ...formData, coverImageUrl: base64String });
      setImagePreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  // ✅ NEW: Remove image
  const handleRemoveImage = () => {
    setFormData({ ...formData, coverImageUrl: '' });
    setImagePreview(null);
    // Reset file input
    document.getElementById('imageInput').value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await experienceAPI.create({
        ...formData,
        basePrice: parseFloat(formData.basePrice),
        durationHours: parseInt(formData.durationHours),
        maxCapacity: parseInt(formData.maxCapacity),
      });
      toast.success('Experience created successfully!');
      navigate('/my-experiences');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create experience');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Add New Experience</h1>
      
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
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
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

        {/* ✅ NEW: Image Upload with Preview */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
          
          <div className="flex flex-col items-center gap-4">
            {/* Image Preview */}
            {imagePreview ? (
              <div className="relative w-full max-w-xs">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 w-8 h-8 flex items-center justify-center hover:bg-red-600 transition"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition cursor-pointer">
                <input
                  id="imageInput"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="imageInput" className="cursor-pointer block">
                  <div className="text-4xl mb-2">🖼️</div>
                  <p className="text-gray-600">Click to upload an image</p>
                  <p className="text-xs text-gray-400">PNG, JPG, WEBP (Max 5MB)</p>
                </label>
              </div>
            )}
            
            {/* Show filename if selected */}
            {imagePreview && (
              <p className="text-xs text-green-600">✅ Image uploaded successfully</p>
            )}
          </div>
        </div>

        {/* Submit & Cancel Buttons */}
        <div className="flex gap-4 mt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Experience'}
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