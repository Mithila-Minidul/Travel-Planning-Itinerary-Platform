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
import MyExperiencesPage from './pages/MyExperiencesPage';
import ExperienceForm from './components/experiences/ExperienceForm';
import TravelAgentsPage from './pages/TravelAgentsPage';
import TravelersPage from './pages/TravelersPage';
import TripsPage from './pages/TripsPage';
import TripBuilderPage from './pages/TripBuilderPage';
import TripDetailsPage from './pages/TripDetailsPage';
import TripReviewQueuePage from './pages/TripReviewQueuePage';

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
                                                      <ProtectedRoute allowedRoles={['TravelAgent', 'Admin', 'Traveler']}>
                                                         <TripReviewQueuePage />
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

                        {/* Member 2 - Trips */}
                        <Route path="/trips" element={
                                                  <ProtectedRoute allowedRoles={['Traveler', 'Admin', 'TravelAgent']}>
                                                     <TripsPage />
                                                 </ProtectedRoute>
                                             } />
                        <Route path="/trips/new" element={
                                                      <ProtectedRoute allowedRoles={['Traveler', 'TravelAgent', 'Admin']}>
                                                         <TripBuilderPage />
                                                     </ProtectedRoute>
                                                 } />
                        <Route path="/trips/:id/edit" element={
                                                           <ProtectedRoute allowedRoles={['Traveler']}>
                                                              <TripBuilderPage />
                                                          </ProtectedRoute>
                                                      } />
                        <Route path="/trips/:id" element={
                                                      <ProtectedRoute allowedRoles={['Traveler', 'Admin']}>
                                                         <TripDetailsPage />
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