import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/common/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth Pages
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Pages
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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;