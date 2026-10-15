import React from 'react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
const mocks = vi.hoisted(() => ({
  getTrips: vi.fn(), getTravelers: vi.fn(), getAgents: vi.fn(), getGuides: vi.fn(),
  getReviews: vi.fn(), getBookings: vi.fn(), getExperiences: vi.fn(),
  getDestinations: vi.fn(), getCategories: vi.fn(), getMine: vi.fn(),
  reviewTrip: vi.fn(), deleteTraveler: vi.fn(), updateAgentStatus: vi.fn(),
  deleteAgent: vi.fn(), updateGuide: vi.fn(), deleteGuide: vi.fn(),
  deleteTrip: vi.fn(), confirmBooking: vi.fn(), getWorkflow: vi.fn(),
  getTrip: vi.fn(), getBookingById: vi.fn(), getReviewForGuide: vi.fn(),
  toastError: vi.fn(), toastSuccess: vi.fn(),
}));
vi.mock('../../src/context/AuthContext', () => ({ useAuth: () => ({ user: { id:'user-1' }, isAdmin: true, isAgent: false, isLocalGuide:false, isTraveler:false }) }));
vi.mock('../../src/api/trips', () => ({ tripAPI: { getAllTrips: mocks.getTrips, reviewTrip: mocks.reviewTrip, deleteTrip: mocks.deleteTrip, getTripById:mocks.getTrip } }));
vi.mock('../../src/api/adminUsers', () => ({ adminUserAPI: { getTravelers:mocks.getTravelers, deleteTraveler:mocks.deleteTraveler, getTravelAgents:mocks.getAgents, updateAgentStatus:mocks.updateAgentStatus, deleteTravelAgent:mocks.deleteAgent } }));
vi.mock('../../src/api/guides', () => ({ guideAPI: { getAll:mocks.getGuides, updateStatus:mocks.updateGuide, delete:mocks.deleteGuide } }));
vi.mock('../../src/api/reviews', () => ({ reviewAPI: { getAll:mocks.getReviews, getForGuide:mocks.getReviewForGuide, reply:vi.fn(), deleteReply:vi.fn(), delete:vi.fn(), update:vi.fn() } }));
vi.mock('../../src/api/bookings', () => ({ bookingAPI: { getAll:mocks.getBookings, getById:mocks.getBookingById, confirm:mocks.confirmBooking, reject:vi.fn(), cancel:vi.fn(), delete:vi.fn(), checkIn:vi.fn(), processPayment:vi.fn() } }));
vi.mock('../../src/api/payments', () => ({ paymentAPI: { previewRefund:vi.fn(), refund:vi.fn(), processPayment:vi.fn() } }));
vi.mock('../../src/api/experiences', () => ({ experienceAPI: { getAll:mocks.getExperiences, getForAdmin:mocks.getExperiences, getMine:mocks.getMine, updateStatus:vi.fn(), remove:vi.fn() } }));
vi.mock('../../src/api/categories', () => ({ categoryAPI: { getAll:mocks.getCategories } }));
vi.mock('../../src/api/destinations', () => ({ destinationAPI: { getAll:mocks.getDestinations, create:vi.fn(), remove:vi.fn() } }));
vi.mock('../../src/api/images', () => ({ imageAPI: { upload:vi.fn() } }));
vi.mock('../../src/api/agentWorkflows', () => ({ agentWorkflowAPI: { getAll:mocks.getWorkflow, getByTrip:mocks.getWorkflow } }));
vi.mock('react-hot-toast', () => ({ default: { error:mocks.toastError, success:mocks.toastSuccess } }));
afterEach(() => cleanup());
const pending = () => new Promise(() => {});
const response = (data=[]) => ({data});
const mount = (Component, route='/') => render(<MemoryRouter initialEntries={[route]}><Routes><Route path={route} element={<Component/>}/></Routes></MemoryRouter>);
beforeEach(() => {
 vi.clearAllMocks();
 for(const fn of [mocks.getTrips,mocks.getTravelers,mocks.getAgents,mocks.getGuides,mocks.getReviews,mocks.getBookings,mocks.getExperiences,mocks.getDestinations,mocks.getCategories,mocks.getMine]) fn.mockResolvedValue(response());
 mocks.getWorkflow.mockResolvedValue(response([]));
});
import BookingsPage from '../../src/pages/BookingsPage';
import BookingDetailPage from '../../src/pages/BookingDetailPage';
describe('Booking UI states', () => {
 it('TC58: bookings loading placeholder', () => { mocks.getBookings.mockImplementation(pending); mount(BookingsPage); expect(screen.getByText('Loading bookings...')).toBeTruthy(); });
 it('TC59: bookings empty state', async () => { mount(BookingsPage); expect(await screen.findByText('No bookings found.')).toBeTruthy(); });
 it('TC60: bookings load failure triggers error notification', async () => { mocks.getBookings.mockRejectedValue(new Error('network')); mount(BookingsPage); await waitFor(()=>expect(mocks.toastError).toHaveBeenCalledWith('Failed to load bookings.')); });
 it('TC61: booking detail loading placeholder', () => { mocks.getBookingById.mockImplementation(pending); mount(BookingDetailPage,'/bookings/:id'); expect(screen.getByText('Loading booking details...')).toBeTruthy(); });
 it('TC62: booking detail API error displays message', async () => { mocks.getBookingById.mockRejectedValue({response:{data:{message:'Booking unavailable'}}}); mount(BookingDetailPage,'/bookings/:id'); expect(await screen.findByText('Booking unavailable')).toBeTruthy(); });
});
