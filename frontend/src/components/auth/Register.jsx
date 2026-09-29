import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { imageAPI } from '../../api/images';
import {
  FlightTakeoff,
  ArrowBack,
  ArrowForward,
  PersonAdd,
  ContactPhone,
  Badge,
  CheckCircle,
  PersonOutline,
  Email as EmailIcon,
  LockOutlined,
  Phone,
  PhotoCamera,
  TravelExplore,
  VerifiedUser,
  Edit,
} from '@mui/icons-material';

const STEPS = [
  { id: 1, title: 'Account', icon: PersonAdd },
  { id: 2, title: 'Contact', icon: ContactPhone },
  { id: 3, title: 'Role', icon: Badge },
  { id: 4, title: 'Review', icon: CheckCircle },
];

const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);
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

  const isLocalGuide = formData.role === 'LocalGuide';
  const isTravelAgent = formData.role === 'TravelAgent';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  /* ============================================================
     PER-STEP VALIDATION
     ============================================================ */
  const validateStep = (step) => {
    const fullName = formData.fullName.trim();
    const email = formData.email.trim();
    const phoneNumber = formData.phoneNumber.trim();
    const yearsOfExperience = Number(formData.yearsOfExperience);

    if (step === 1) {
      if (!fullName) return 'Full name is required.';
      if (fullName.length > 100) return 'Full name must be 100 characters or fewer.';
      if (!email || !/^\S+@\S+\.\S+$/.test(email)) return 'Enter a valid email address.';
      if (formData.password.length < 6) return 'Password must be at least 6 characters long.';
      if (formData.password !== confirmPassword) return 'Passwords do not match.';
    }

    if (step === 2) {
      if (!phoneNumber) return 'Phone number is required.';
      if (phoneNumber.length > 20) return 'Phone number must be 20 characters or fewer.';
      if (!/^(07\d{8}|\+94[\s-]?7\d{8}|0094[\s-]?7\d{8})$/.test(phoneNumber))
        return 'Enter a valid Sri Lankan mobile number, such as 0771234567 or +94771234567.';
      if (!formData.profileImageUrl) return 'Profile photo is required.';
    }

    if (step === 3) {
      if (!['LocalGuide', 'TravelAgent'].includes(formData.role))
        return 'Select a valid account role.';
      if (isNaN(yearsOfExperience) || yearsOfExperience < 0 || !Number.isInteger(yearsOfExperience))
        return 'Years of experience must be a whole number greater than or equal to 0.';
      if (isLocalGuide && (!formData.guideBio.trim() || !formData.guideCity.trim() || !formData.licenseNumber.trim()))
        return 'Bio, city, and license number are required for Local Guides.';
      if (isTravelAgent && (!formData.agencyName.trim() || !formData.agentLicenseNumber.trim()))
        return 'Agency name and license number are required for Travel Agents.';
    }

    return null;
  };

  const goNext = () => {
    const err = validateStep(currentStep);
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  };

  const goBack = () => {
    setError('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  /* ============================================================
     FINAL SUBMIT
     ============================================================ */
  const handleSubmit = async () => {
    // Full validation sweep
    for (let s = 1; s <= 3; s++) {
      const err = validateStep(s);
      if (err) {
        setError(err);
        setCurrentStep(s);
        return;
      }
    }

    setError('');
    setLoading(true);

    const fullName = formData.fullName.trim();
    const email = formData.email.trim();
    const phoneNumber = formData.phoneNumber.trim();
    const yearsOfExperience = Number(formData.yearsOfExperience);

    let profileImageUrl;
    try {
      profileImageUrl = (await imageAPI.upload(formData.profileImageUrl, 'profile-photos')).data.url;
    } catch (uploadError) {
      setLoading(false);
      setError(uploadError.response?.data?.message || 'Unable to upload profile photo.');
      return;
    }

    const payload = {
      email,
      password: formData.password,
      fullName,
      role: formData.role,
      phoneNumber,
      profileImageUrl,
    };

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
    setFormData((current) => ({ ...current, profileImageUrl: file }));
    setError('');
  };

  /* ============================================================
     STEP RENDERERS
     ============================================================ */

  const renderStep1 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
        <div className="relative">
          <PersonOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fontSize="small" />
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
            placeholder="John Doe"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email *</label>
        <div className="relative">
          <EmailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fontSize="small" />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
            placeholder="you@example.com"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Password *</label>
        <div className="relative">
          <LockOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fontSize="small" />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
            placeholder="••••••••"
            required
            minLength={6}
          />
        </div>
        <p className="text-xs text-slate-400 mt-1">Minimum 6 characters</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password *</label>
        <div className="relative">
          <LockOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fontSize="small" />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError('');
            }}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
            placeholder="••••••••"
            required
            minLength={6}
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number *</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fontSize="small" />
          <input
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
            placeholder="0771234567 or +94771234567"
            pattern="^(07\d{8}|\+94[\s-]?7\d{8}|0094[\s-]?7\d{8})$"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Profile Photo *</label>
        <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl p-6 cursor-pointer transition bg-white">
          <input
            type="file"
            accept="image/*"
            onChange={handleProfilePhotoChange}
            className="hidden"
          />
          {formData.profileImageUrl ? (
            <img
              src={
                formData.profileImageUrl instanceof File
                  ? URL.createObjectURL(formData.profileImageUrl)
                  : formData.profileImageUrl
              }
              alt="Profile preview"
              className="h-24 w-24 rounded-full object-cover border-4 border-indigo-200 shadow-lg"
            />
          ) : (
            <>
              <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center">
                <PhotoCamera className="text-indigo-600" />
              </div>
              <p className="text-sm text-slate-600 font-medium">Click to upload photo</p>
              <p className="text-xs text-slate-400">PNG or JPG · max 2MB</p>
            </>
          )}
        </label>
        {formData.profileImageUrl && (
          <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
            <CheckCircle fontSize="small" />
            Photo selected. Click to change.
          </p>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Your Role *</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
          required
        >
          <option value="LocalGuide">Local Guide</option>
          <option value="TravelAgent">Travel Agent</option>
        </select>
        <p className="text-xs text-slate-400 mt-1">
          Admin accounts are created by system administrators only.
        </p>
      </div>

      {isLocalGuide && (
        <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <TravelExplore className="text-indigo-600" fontSize="small" />
            <p className="text-sm font-semibold text-indigo-900">Local Guide Details</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Bio *</label>
            <textarea
              name="guideBio"
              value={formData.guideBio}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
              rows="2"
              placeholder="Tell travelers about yourself..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">City *</label>
            <input
              type="text"
              name="guideCity"
              value={formData.guideCity}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
              placeholder="Kandy, Ella, etc."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">License Number *</label>
            <input
              type="text"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
              placeholder="LG-12345"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Years of Experience *</label>
            <input
              type="number"
              name="yearsOfExperience"
              value={formData.yearsOfExperience}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
              min="0"
              placeholder="0"
              required
            />
          </div>
        </div>
      )}

      {isTravelAgent && (
        <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-100 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <VerifiedUser className="text-amber-600" fontSize="small" />
            <p className="text-sm font-semibold text-amber-900">Travel Agent Details</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Agency Name *</label>
            <input
              type="text"
              name="agencyName"
              value={formData.agencyName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
              placeholder="Travel Agency Name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">License Number *</label>
            <input
              type="text"
              name="agentLicenseNumber"
              value={formData.agentLicenseNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
              placeholder="TA-12345"
              required
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderStep4 = () => {
    const photoUrl =
      formData.profileImageUrl instanceof File
        ? URL.createObjectURL(formData.profileImageUrl)
        : formData.profileImageUrl;

    const rows = [
      { label: 'Full Name', value: formData.fullName },
      { label: 'Email', value: formData.email },
      { label: 'Phone', value: formData.phoneNumber },
      { label: 'Role', value: formData.role },
      ...(isLocalGuide
        ? [
            { label: 'Bio', value: formData.guideBio },
            { label: 'City', value: formData.guideCity },
            { label: 'License', value: formData.licenseNumber },
            { label: 'Years of Experience', value: String(formData.yearsOfExperience) },
          ]
        : []),
      ...(isTravelAgent
        ? [
            { label: 'Agency Name', value: formData.agencyName },
            { label: 'License', value: formData.agentLicenseNumber },
          ]
        : []),
    ];

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50 border border-indigo-100">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt="Profile"
              className="h-14 w-14 rounded-full object-cover border-2 border-white shadow"
            />
          ) : (
            <div className="h-14 w-14 rounded-full bg-indigo-200 flex items-center justify-center">
              <PersonOutline className="text-indigo-700" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 truncate">{formData.fullName || '—'}</p>
            <p className="text-xs text-slate-500 truncate">{formData.email || '—'}</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
          {rows.map((r) => (
            <div key={r.label} className="flex items-start justify-between gap-4 px-4 py-2.5 text-sm">
              <span className="text-slate-500 shrink-0">{r.label}</span>
              <span className="text-slate-800 font-medium text-right break-words">{r.value || '—'}</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-400 text-center">
          By registering, you agree to TripCraft's Terms & Privacy Policy.
        </p>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 overflow-hidden px-4 py-12">
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-400/15 rounded-full blur-3xl animate-pulse-glow" />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/15 rounded-full blur-3xl animate-pulse-glow"
        style={{ animationDelay: '1s' }}
      />

      {/* Back to Home */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-20 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 transition"
      >
        <ArrowBack fontSize="small" />
        Back to Home
      </Link>

      <div className="relative z-10 w-full max-w-lg">
        <div className="bg-white/90 backdrop-blur-md border border-slate-200 p-8 rounded-2xl shadow-xl">
          {/* Brand header */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg mb-3">
              <FlightTakeoff className="text-white text-xl" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Create Account
            </h1>
            <p className="text-center text-slate-500 text-sm mt-1">
              Step {currentStep} of {STEPS.length}
            </p>
          </div>

          {/* ============ STEPPER INDICATOR ============ */}
          <div className="flex items-center justify-between mb-8 px-2">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCompleted
                          ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/40'
                          : isActive
                          ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/40 ring-4 ring-indigo-100'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle fontSize="small" />
                      ) : (
                        <Icon fontSize="small" />
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wide ${
                        isActive || isCompleted ? 'text-indigo-600' : 'text-slate-400'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-1 -mt-5 rounded transition-all duration-300 ${
                        currentStep > step.id
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600'
                          : 'bg-slate-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* ============ ERROR ============ */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm" role="alert">
              {error}
            </div>
          )}

          {/* ============ STEP CONTENT ============ */}
          <div className="min-h-[280px]">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </div>

          {/* ============ NAVIGATION ============ */}
          <div className="flex items-center justify-between gap-3 mt-8">
            <button
              type="button"
              onClick={goBack}
              disabled={currentStep === 1 || loading}
              className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-medium transition ${
                currentStep === 1
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <ArrowBack fontSize="small" />
              Back
            </button>

            {currentStep < STEPS.length ? (
              <button
                type="button"
                onClick={goNext}
                className="group inline-flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm shadow-lg hover:shadow-xl hover:shadow-indigo-500/40 transition-all"
              >
                Next
                <ArrowForward className="group-hover:translate-x-0.5 transition-transform" fontSize="small" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="group inline-flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm shadow-lg hover:shadow-xl hover:shadow-indigo-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Registering...' : 'Create Account'}
                {!loading && <CheckCircle fontSize="small" />}
              </button>
            )}
          </div>

          {/* Login link */}
          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-medium hover:underline">
              Login
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          © 2026 TripCraft · All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Register;