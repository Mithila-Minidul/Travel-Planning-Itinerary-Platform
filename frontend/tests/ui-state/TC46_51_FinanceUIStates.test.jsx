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
  getTrip: vi.fn(), getReviewForGuide: vi.fn(),
  toastError: vi.fn(), toastSuccess: vi.fn(),
}));
vi.mock('../../src/context/AuthContext', () => ({ useAuth: () => ({ user: { id:'user-1' }, isAdmin: true, isAgent: false, isLocalGuide:false, isTraveler:false }) }));
vi.mock('../../src/api/trips', () => ({ tripAPI: { getAllTrips: mocks.getTrips, reviewTrip: mocks.reviewTrip, deleteTrip: mocks.deleteTrip, getTripById:mocks.getTrip } }));
vi.mock('../../src/api/adminUsers', () => ({ adminUserAPI: { getTravelers:mocks.getTravelers, deleteTraveler:mocks.deleteTraveler, getTravelAgents:mocks.getAgents, updateAgentStatus:mocks.updateAgentStatus, deleteTravelAgent:mocks.deleteAgent } }));
vi.mock('../../src/api/guides', () => ({ guideAPI: { getAll:mocks.getGuides, updateStatus:mocks.updateGuide, delete:mocks.deleteGuide } }));
vi.mock('../../src/api/reviews', () => ({ reviewAPI: { getAll:mocks.getReviews, getForGuide:mocks.getReviewForGuide, reply:vi.fn(), deleteReply:vi.fn(), delete:vi.fn(), update:vi.fn() } }));
vi.mock('../../src/api/bookings', () => ({ bookingAPI: { getAll:mocks.getBookings, confirm:mocks.confirmBooking, reject:vi.fn(), cancel:vi.fn(), delete:vi.fn(), checkIn:vi.fn(), processPayment:vi.fn() } }));
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
import PaymentDashboardPage from '../../src/pages/PaymentDashboardPage';
import RefundManagementPage from '../../src/pages/RefundManagementPage';
import ReviewManagementPage from '../../src/pages/ReviewManagementPage';
describe('Payments, refunds and reviews UI states', () => {
 it('TC46: payment dashboard shows loading state', () => { mocks.getBookings.mockImplementation(pending); mount(PaymentDashboardPage); expect(screen.getByText('Loading payments...')).toBeTruthy(); });
 it('TC47: payment dashboard shows zero revenue with no transactions', async () => { mount(PaymentDashboardPage); await screen.findByText('Payment Dashboard'); expect(screen.getAllByText('$0.00').length).toBeGreaterThan(0); });
 it('TC48: payment dashboard displays no payments message', async () => { mount(PaymentDashboardPage); expect(await screen.findByText('No payments recorded yet.')).toBeTruthy(); });
 it('TC49: refund management shows loading state', () => { mocks.getBookings.mockImplementation(pending); mount(RefundManagementPage); expect(screen.getByText('Loading refunds...')).toBeTruthy(); });
 it('TC50: refund management shows both empty states', async () => { mount(RefundManagementPage); expect(await screen.findByText('No refundable payments right now.')).toBeTruthy(); expect(screen.getByText('No refunds recorded yet.')).toBeTruthy(); });
 it('TC51: review management reports API error using toast', async () => { mocks.getReviews.mockRejectedValue(new Error('500')); mount(ReviewManagementPage); await waitFor(()=>expect(mocks.toastError).toHaveBeenCalledWith('Failed to load reviews.')); });
});
