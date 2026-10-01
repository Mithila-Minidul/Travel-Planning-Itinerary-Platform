import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/common/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth Pages
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Pages
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import DestinationsPage from './pages/DestinationsPage';
import ExperiencesPage from './pages/ExperiencesPage';
import GuidesPage from './pages/GuidesPage';
import AIReviewPage from './pages/AIReviewPage';
import MyExperiencesPage from './pages/MyExperiencesPage';
import ExperienceForm from './components/experiences/ExperienceForm';
import TravelAgentsPage from './pages/TravelAgentsPage';
import TravelersPage from './pages/TravelersPage';
import TripsPage from './pages/TripsPage';
import TripDetailPage from './pages/TripDetailPage';
import AIPerformancePage from './pages/AIPerformancePage';
import BookingsPage from './pages/BookingsPage';
import PaymentDashboardPage from './pages/PaymentDashboardPage';
import RefundManagementPage from './pages/RefundManagementPage';
import BookingDetailPage from './pages/BookingDetailPage';
import ReviewManagementPage from './pages/ReviewManagementPage';

// 👇 Landing gate: show landing if not logged in, otherwise redirect to dashboard
const LandingOrDashboard = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <LandingPage />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          {/* ============ PUBLIC ROUTES (No Layout) ============ */}
          <Route path="/" element={<LandingOrDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ============ PROTECTED ROUTES (Wrapped in Layout) ============ */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/destinations" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <DestinationsPage />
              </ProtectedRoute>
            } />
            <Route path="/destinations/new" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <DestinationsPage />
              </ProtectedRoute>
            } />
            <Route path="/experiences" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <ExperiencesPage />
              </ProtectedRoute>
            } />
            <Route path="/experiences/new" element={
              <ProtectedRoute allowedRoles={['LocalGuide']}>
                <ExperienceForm />
              </ProtectedRoute>
            } />
            <Route path="/experiences/:id/edit" element={
              <ProtectedRoute allowedRoles={['Admin', 'LocalGuide']}>
                <ExperienceForm />
              </ProtectedRoute>
            } />
            <Route path="/guides" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <GuidesPage />
              </ProtectedRoute>
            } />

            {/* Agent Routes */}
            <Route path="/ai-review" element={
              <ProtectedRoute allowedRoles={['TravelAgent', 'Admin']}>
                <AIReviewPage />
              </ProtectedRoute>
            } />

            {/* Local Guide Routes */}
            <Route path="/my-experiences" element={
              <ProtectedRoute allowedRoles={['LocalGuide']}>
                <MyExperiencesPage />
              </ProtectedRoute>
            } />
            <Route path="/travel-agents" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <TravelAgentsPage />
              </ProtectedRoute>
            } />
            <Route path="/travelers" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <TravelersPage />
              </ProtectedRoute>
            } />
            <Route path="/trips" element={
              <ProtectedRoute allowedRoles={['Admin', 'TravelAgent', 'Traveler']}>
                <TripsPage />
              </ProtectedRoute>
            } />
            <Route path="/trips/:id" element={
              <ProtectedRoute allowedRoles={['Admin', 'TravelAgent', 'Traveler']}>
                <TripDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/ai-performance" element={
              <ProtectedRoute allowedRoles={['Admin', 'TravelAgent']}>
                <AIPerformancePage />
              </ProtectedRoute>
            } />
            <Route path="/bookings" element={
              <ProtectedRoute allowedRoles={['Admin', 'LocalGuide', 'Traveler']}>
                <BookingsPage />
              </ProtectedRoute>
            } />
            <Route path="/payments" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <PaymentDashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/refunds" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <RefundManagementPage />
              </ProtectedRoute>
            } />
            <Route path="/bookings/:id" element={
              <ProtectedRoute allowedRoles={['Admin', 'LocalGuide', 'Traveler']}>
                <BookingDetailPage />
              </ProtectedRoute>
            } />

            {/* Reviews */}
            <Route path="/reviews" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <ReviewManagementPage />
              </ProtectedRoute>
            } />
            <Route path="/reviews-ratings" element={
              <ProtectedRoute allowedRoles={['LocalGuide']}>
                <ReviewManagementPage />
              </ProtectedRoute>
            } />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;