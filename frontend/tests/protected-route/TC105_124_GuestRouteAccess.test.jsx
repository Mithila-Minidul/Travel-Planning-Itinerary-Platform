/**
 * Integration-level route configuration tests: uses the real App.jsx and real ProtectedRoute.
 * Only page bodies and AuthProvider are mocked to isolate navigation/access behavior from APIs.
 * The source-of-truth role matrix was transcribed from frontend/src/App.jsx.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { useAuth } from '../../src/context/AuthContext';
import App from '../../src/App';
import { Outlet } from 'react-router-dom';

vi.mock('../../src/context/AuthContext', () => ({
  AuthProvider: ({ children }) => <>{children}</>,
  useAuth: vi.fn(),
}));
vi.mock('../../src/components/common/Layout', () => ({
  default: () => <React.Fragment><div data-testid="layout"><div>App Layout</div></div><Outlet /></React.Fragment>,
}));
vi.mock('../../src/components/auth/Login', () => ({ default: () => <div data-testid="page-Login">Login Page</div> }));
vi.mock('../../src/components/auth/Register', () => ({ default: () => <div data-testid="page-Register">Register Page</div> }));
vi.mock('../../src/pages/LandingPage', () => ({ default: () => <div data-testid="page-LandingPage">LandingPage Page</div> }));
vi.mock('../../src/pages/DashboardPage', () => ({ default: () => <div data-testid="page-DashboardPage">DashboardPage Page</div> }));
vi.mock('../../src/pages/DestinationsPage', () => ({ default: () => <div data-testid="page-DestinationsPage">DestinationsPage Page</div> }));
vi.mock('../../src/pages/ExperiencesPage', () => ({ default: () => <div data-testid="page-ExperiencesPage">ExperiencesPage Page</div> }));
vi.mock('../../src/pages/GuidesPage', () => ({ default: () => <div data-testid="page-GuidesPage">GuidesPage Page</div> }));
vi.mock('../../src/pages/AIReviewPage', () => ({ default: () => <div data-testid="page-AIReviewPage">AIReviewPage Page</div> }));
vi.mock('../../src/pages/MyExperiencesPage', () => ({ default: () => <div data-testid="page-MyExperiencesPage">MyExperiencesPage Page</div> }));
vi.mock('../../src/components/experiences/ExperienceForm', () => ({ default: () => <div data-testid="page-ExperienceForm">ExperienceForm Page</div> }));
vi.mock('../../src/pages/TravelAgentsPage', () => ({ default: () => <div data-testid="page-TravelAgentsPage">TravelAgentsPage Page</div> }));
vi.mock('../../src/pages/TravelersPage', () => ({ default: () => <div data-testid="page-TravelersPage">TravelersPage Page</div> }));
vi.mock('../../src/pages/TripsPage', () => ({ default: () => <div data-testid="page-TripsPage">TripsPage Page</div> }));
vi.mock('../../src/pages/TripDetailPage', () => ({ default: () => <div data-testid="page-TripDetailPage">TripDetailPage Page</div> }));
vi.mock('../../src/pages/AIPerformancePage', () => ({ default: () => <div data-testid="page-AIPerformancePage">AIPerformancePage Page</div> }));
vi.mock('../../src/pages/BookingsPage', () => ({ default: () => <div data-testid="page-BookingsPage">BookingsPage Page</div> }));
vi.mock('../../src/pages/PaymentDashboardPage', () => ({ default: () => <div data-testid="page-PaymentDashboardPage">PaymentDashboardPage Page</div> }));
vi.mock('../../src/pages/RefundManagementPage', () => ({ default: () => <div data-testid="page-RefundManagementPage">RefundManagementPage Page</div> }));
vi.mock('../../src/pages/BookingDetailPage', () => ({ default: () => <div data-testid="page-BookingDetailPage">BookingDetailPage Page</div> }));
vi.mock('../../src/pages/ReviewManagementPage', () => ({ default: () => <div data-testid="page-ReviewManagementPage">ReviewManagementPage Page</div> }));

const mockAuth = (role, { loading = false, authenticated = role !== null } = {}) => {
  vi.mocked(useAuth).mockReturnValue({
    loading,
    isAuthenticated: authenticated,
    user: authenticated ? { id: 'user-123', role } : null,
  });
};
const visit = (path) => {
  window.history.replaceState({}, '', path);
  return render(<App />);
};
const currentPath = () => window.location.pathname;

beforeEach(() => {
  vi.resetAllMocks();
  window.history.replaceState({}, '', '/');
});
afterEach(() => {
  cleanup();
});

describe('Guest access denial on every protected App route', () => {
  it('TC105: unauthenticated visitor to /dashboard goes to login', async () => {
    mockAuth(null); visit('/dashboard');
    await waitFor(() => expect(currentPath()).toBe('/login'));
    expect(screen.queryByTestId('layout')).toBeNull();
  });
  it('TC106: unauthenticated visitor to /destinations goes to login', async () => {
    mockAuth(null); visit('/destinations');
    await waitFor(() => expect(currentPath()).toBe('/login'));
    expect(screen.queryByTestId('layout')).toBeNull();
  });
  it('TC107: unauthenticated visitor to /destinations/new goes to login', async () => {
    mockAuth(null); visit('/destinations/new');
    await waitFor(() => expect(currentPath()).toBe('/login'));
    expect(screen.queryByTestId('layout')).toBeNull();
  });
  it('TC108: unauthenticated visitor to /experiences goes to login', async () => {
    mockAuth(null); visit('/experiences');
    await waitFor(() => expect(currentPath()).toBe('/login'));
    expect(screen.queryByTestId('layout')).toBeNull();
  });
  it('TC109: unauthenticated visitor to /experiences/new goes to login', async () => {
    mockAuth(null); visit('/experiences/new');
    await waitFor(() => expect(currentPath()).toBe('/login'));
    expect(screen.queryByTestId('layout')).toBeNull();
  });
  it('TC110: unauthenticated visitor to /experiences/test-123/edit goes to login', async () => {
    mockAuth(null); visit('/experiences/test-123/edit');
    await waitFor(() => expect(currentPath()).toBe('/login'));
    expect(screen.queryByTestId('layout')).toBeNull();
  });
  it('TC111: unauthenticated visitor to /guides goes to login', async () => {
    mockAuth(null); visit('/guides');
    await waitFor(() => expect(currentPath()).toBe('/login'));
    expect(screen.queryByTestId('layout')).toBeNull();
  });
  it('TC112: unauthenticated visitor to /ai-review goes to login', async () => {
    mockAuth(null); visit('/ai-review');
    await waitFor(() => expect(currentPath()).toBe('/login'));
    expect(screen.queryByTestId('layout')).toBeNull();
  });
  it('TC113: unauthenticated visitor to /my-experiences goes to login', async () => {
    mockAuth(null); visit('/my-experiences');
    await waitFor(() => expect(currentPath()).toBe('/login'));
    expect(screen.queryByTestId('layout')).toBeNull();
  });
  it('TC114: unauthenticated visitor to /travel-agents goes to login', async () => {
    mockAuth(null); visit('/travel-agents');
    await waitFor(() => expect(currentPath()).toBe('/login'));
    expect(screen.queryByTestId('layout')).toBeNull();
  });
  it('TC115: unauthenticated visitor to /travelers goes to login', async () => {
    mockAuth(null); visit('/travelers');
    await waitFor(() => expect(currentPath()).toBe('/login'));
    expect(screen.queryByTestId('layout')).toBeNull();
  });
  it('TC116: unauthenticated visitor to /trips goes to login', async () => {
    mockAuth(null); visit('/trips');
    await waitFor(() => expect(currentPath()).toBe('/login'));
    expect(screen.queryByTestId('layout')).toBeNull();
  });
  it('TC117: unauthenticated visitor to /trips/test-123 goes to login', async () => {
    mockAuth(null); visit('/trips/test-123');
    await waitFor(() => expect(currentPath()).toBe('/login'));
    expect(screen.queryByTestId('layout')).toBeNull();
  });
  it('TC118: unauthenticated visitor to /ai-performance goes to login', async () => {
    mockAuth(null); visit('/ai-performance');
    await waitFor(() => expect(currentPath()).toBe('/login'));
    expect(screen.queryByTestId('layout')).toBeNull();
  });
  it('TC119: unauthenticated visitor to /bookings goes to login', async () => {
    mockAuth(null); visit('/bookings');
    await waitFor(() => expect(currentPath()).toBe('/login'));
    expect(screen.queryByTestId('layout')).toBeNull();
  });
  it('TC120: unauthenticated visitor to /payments goes to login', async () => {
    mockAuth(null); visit('/payments');
    await waitFor(() => expect(currentPath()).toBe('/login'));
    expect(screen.queryByTestId('layout')).toBeNull();
  });
  it('TC121: unauthenticated visitor to /refunds goes to login', async () => {
    mockAuth(null); visit('/refunds');
    await waitFor(() => expect(currentPath()).toBe('/login'));
    expect(screen.queryByTestId('layout')).toBeNull();
  });
  it('TC122: unauthenticated visitor to /bookings/test-123 goes to login', async () => {
    mockAuth(null); visit('/bookings/test-123');
    await waitFor(() => expect(currentPath()).toBe('/login'));
    expect(screen.queryByTestId('layout')).toBeNull();
  });
  it('TC123: unauthenticated visitor to /reviews goes to login', async () => {
    mockAuth(null); visit('/reviews');
    await waitFor(() => expect(currentPath()).toBe('/login'));
    expect(screen.queryByTestId('layout')).toBeNull();
  });
  it('TC124: unauthenticated visitor to /reviews-ratings goes to login', async () => {
    mockAuth(null); visit('/reviews-ratings');
    await waitFor(() => expect(currentPath()).toBe('/login'));
    expect(screen.queryByTestId('layout')).toBeNull();
  });
});
