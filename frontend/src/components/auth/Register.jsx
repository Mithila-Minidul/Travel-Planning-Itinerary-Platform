import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'LocalGuide',
    phoneNumber: '',
    profileImageUrl: '',
    // Local Guide fields
    guideBio: '',
    guideCity: '',
    licenseNumber: '',
    yearsOfExperience: 0,
    // Travel Agent fields
    agencyName: '',
    agentLicenseNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fullName = formData.fullName.trim();
    const email = formData.email.trim();
    const phoneNumber = formData.phoneNumber.trim();
    const yearsOfExperience = Number(formData.yearsOfExperience);

    if (!fullName) {
      setError('Full name is required.');
      return;
    }
    if (fullName.length > 100) {
      setError('Full name must be 100 characters or fewer.');
      return;
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Enter a valid email address.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (formData.password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (phoneNumber.length > 20) {
      setError('Phone number must be 20 characters or fewer.');
      return;
    }
    if (!phoneNumber) {
      setError('Phone number is required.');
      return;
    }
    if (!/^(07\d{8}|\+94[\s-]?7\d{8}|0094[\s-]?7\d{8})$/.test(phoneNumber)) {
      setError('Enter a valid Sri Lankan mobile number, such as 0771234567 or +94771234567.');
      return;
    }
    if (!['LocalGuide', 'TravelAgent'].includes(formData.role)) {
      setError('Select a valid account role.');
      return;
    }
    if (isNaN(yearsOfExperience) || yearsOfExperience < 0 || !Number.isInteger(yearsOfExperience)) {
      setError('Years of experience must be a whole number greater than or equal to 0.');
      return;
    }
    if (!formData.profileImageUrl) {
      setError('Profile photo is required.');
      return;
    }
    if (isLocalGuide && (!formData.guideBio.trim() || !formData.guideCity.trim() || !formData.licenseNumber.trim())) {
      setError('Bio, city, and license number are required for Local Guides.');
      return;
    }
    if (isTravelAgent && (!formData.agencyName.trim() || !formData.agentLicenseNumber.trim())) {
      setError('Agency name and license number are required for Travel Agents.');
      return;
    }

    setError('');
    setLoading(true);

    // Build payload based on role
    const payload = {
      email,
      password: formData.password,
      fullName,
      role: formData.role,
      phoneNumber,
      profileImageUrl: formData.profileImageUrl,
    };

    // Add role-specific fields
    if (formData.role === 'LocalGuide') {
      payload.guideBio = formData.guideBio.trim();
      payload.guideCity = formData.guideCity.trim();
      payload.licenseNumber = formData.licenseNumber.trim();
      payload.yearsOfExperience = yearsOfExperience;
    }

    if (formData.role === 'TravelAgent') {
      payload.agencyName = formData.agencyName.trim();
      payload.agentLicenseNumber = formData.agentLicenseNumber.trim();
    }

    const result = await register(payload);
    setLoading(false);
    if (result.success) {
      navigate('/login');
    } else {
      setError(result.error || 'Registration failed. Please check your details and try again.');
    }
  };

  // Show/hide fields based on role
  const isLocalGuide = formData.role === 'LocalGuide';
  const isTravelAgent = formData.role === 'TravelAgent';

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Profile photo must be an image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Profile photo must be smaller than 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((current) => ({ ...current, profileImageUrl: reader.result }));
      setError('');
    };
    reader.onerror = () => setError('Unable to read the profile photo.');
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg">
        <h1 className="text-2xl font-bold text-center text-indigo-600 mb-2">Register</h1>
        <p className="text-center text-gray-500 mb-6">Create your account</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="tel"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              minLength={6}
            />
            <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
          </div>

          {/* Confirm Password */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              minLength={6}
            />
          </div>

          {/* Phone Number */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="0771234567 or +94771234567"
              pattern="^(07\d{8}|\+94[\s-]?7\d{8}|0094[\s-]?7\d{8})$"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo *</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePhotoChange}
              className="w-full rounded-lg border px-4 py-2 text-sm"
              required
            />
            {formData.profileImageUrl && (
              <img src={formData.profileImageUrl} alt="Profile preview" className="mt-3 h-20 w-20 rounded-full object-cover" />
            )}
            <p className="mt-1 text-xs text-gray-400">Image files only, maximum 2MB.</p>
          </div>

          {/* Role */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="LocalGuide">Local Guide</option>
              <option value="TravelAgent">Travel Agent</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Admin accounts are created by system administrators only.
            </p>
          </div>

          {/* Local Guide Specific Fields */}
          {isLocalGuide && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Local Guide Details</p>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio *</label>
                <textarea
                  name="guideBio"
                  value={formData.guideBio}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows="2"
                  placeholder="Tell travelers about yourself..."
                  required
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input
                  type="text"
                  name="guideCity"
                  value={formData.guideCity}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Kandy, Ella, etc."
                  required
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">License Number *</label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="LG-12345"
                  required
                />
              </div>

              <div className="mb-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience *</label>
                <input
                  type="number"
                  name="yearsOfExperience"
                  value={formData.yearsOfExperience}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="0"
                  placeholder="0"
                  required
                />
              </div>
            </div>
          )}

          {/* Travel Agent Specific Fields */}
          {isTravelAgent && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Travel Agent Details</p>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Agency Name *</label>
                <input
                  type="text"
                  name="agencyName"
                  value={formData.agencyName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Travel Agency Name"
                  required
                />
              </div>

              <div className="mb-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">License Number *</label>
                <input
                  type="text"
                  name="agentLicenseNumber"
                  value={formData.agentLicenseNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="TA-12345"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;