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

describe('Actual App.jsx role-based route access matrix', () => {
  it('TC005: Admin can access /dashboard', async () => {
    mockAuth('Admin'); visit('/dashboard');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.getByTestId('page-DashboardPage')).toBeTruthy();
    expect(screen.queryByTestId('layout')).not.toBeNull();
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC006: TravelAgent can access /dashboard', async () => {
    mockAuth('TravelAgent'); visit('/dashboard');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.getByTestId('page-DashboardPage')).toBeTruthy();
    expect(screen.queryByTestId('layout')).not.toBeNull();
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC007: Traveler can access /dashboard', async () => {
    mockAuth('Traveler'); visit('/dashboard');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.getByTestId('page-DashboardPage')).toBeTruthy();
    expect(screen.queryByTestId('layout')).not.toBeNull();
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC008: LocalGuide can access /dashboard', async () => {
    mockAuth('LocalGuide'); visit('/dashboard');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.getByTestId('page-DashboardPage')).toBeTruthy();
    expect(screen.queryByTestId('layout')).not.toBeNull();
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC009: Agent can access /dashboard', async () => {
    mockAuth('Agent'); visit('/dashboard');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.getByTestId('page-DashboardPage')).toBeTruthy();
    expect(screen.queryByTestId('layout')).not.toBeNull();
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC010: Admin can access /destinations', async () => {
    mockAuth('Admin'); visit('/destinations');
    await waitFor(() => expect(currentPath()).toBe('/destinations'));
    expect(screen.getByTestId('page-DestinationsPage')).toBeTruthy();
    expect(screen.queryByTestId('layout')).not.toBeNull();
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC011: TravelAgent cannot access /destinations', async () => {
    mockAuth('TravelAgent'); visit('/destinations');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC012: Traveler cannot access /destinations', async () => {
    mockAuth('Traveler'); visit('/destinations');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC013: LocalGuide cannot access /destinations', async () => {
    mockAuth('LocalGuide'); visit('/destinations');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC014: Agent cannot access /destinations', async () => {
    mockAuth('Agent'); visit('/destinations');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC015: Admin can access /destinations/new', async () => {
    mockAuth('Admin'); visit('/destinations/new');
    await waitFor(() => expect(currentPath()).toBe('/destinations/new'));
    expect(screen.getByTestId('page-DestinationsPage')).toBeTruthy();
    expect(screen.queryByTestId('layout')).not.toBeNull();
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC016: TravelAgent cannot access /destinations/new', async () => {
    mockAuth('TravelAgent'); visit('/destinations/new');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC017: Traveler cannot access /destinations/new', async () => {
    mockAuth('Traveler'); visit('/destinations/new');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC018: LocalGuide cannot access /destinations/new', async () => {
    mockAuth('LocalGuide'); visit('/destinations/new');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC019: Agent cannot access /destinations/new', async () => {
    mockAuth('Agent'); visit('/destinations/new');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC020: Admin can access /experiences', async () => {
    mockAuth('Admin'); visit('/experiences');
    await waitFor(() => expect(currentPath()).toBe('/experiences'));
    expect(screen.getByTestId('page-ExperiencesPage')).toBeTruthy();
    expect(screen.queryByTestId('layout')).not.toBeNull();
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC021: TravelAgent cannot access /experiences', async () => {
    mockAuth('TravelAgent'); visit('/experiences');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC022: Traveler cannot access /experiences', async () => {
    mockAuth('Traveler'); visit('/experiences');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC023: LocalGuide cannot access /experiences', async () => {
    mockAuth('LocalGuide'); visit('/experiences');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC024: Agent cannot access /experiences', async () => {
    mockAuth('Agent'); visit('/experiences');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC025: Admin cannot access /experiences/new', async () => {
    mockAuth('Admin'); visit('/experiences/new');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC026: TravelAgent cannot access /experiences/new', async () => {
    mockAuth('TravelAgent'); visit('/experiences/new');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC027: Traveler cannot access /experiences/new', async () => {
    mockAuth('Traveler'); visit('/experiences/new');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC028: LocalGuide can access /experiences/new', async () => {
    mockAuth('LocalGuide'); visit('/experiences/new');
    await waitFor(() => expect(currentPath()).toBe('/experiences/new'));
    expect(screen.getByTestId('page-ExperienceForm')).toBeTruthy();
    expect(screen.queryByTestId('layout')).not.toBeNull();
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC029: Agent cannot access /experiences/new', async () => {
    mockAuth('Agent'); visit('/experiences/new');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC030: Admin can access /experiences/test-123/edit', async () => {
    mockAuth('Admin'); visit('/experiences/test-123/edit');
    await waitFor(() => expect(currentPath()).toBe('/experiences/test-123/edit'));
    expect(screen.getByTestId('page-ExperienceForm')).toBeTruthy();
    expect(screen.queryByTestId('layout')).not.toBeNull();
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC031: TravelAgent cannot access /experiences/test-123/edit', async () => {
    mockAuth('TravelAgent'); visit('/experiences/test-123/edit');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC032: Traveler cannot access /experiences/test-123/edit', async () => {
    mockAuth('Traveler'); visit('/experiences/test-123/edit');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC033: LocalGuide can access /experiences/test-123/edit', async () => {
    mockAuth('LocalGuide'); visit('/experiences/test-123/edit');
    await waitFor(() => expect(currentPath()).toBe('/experiences/test-123/edit'));
    expect(screen.getByTestId('page-ExperienceForm')).toBeTruthy();
    expect(screen.queryByTestId('layout')).not.toBeNull();
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC034: Agent cannot access /experiences/test-123/edit', async () => {
    mockAuth('Agent'); visit('/experiences/test-123/edit');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC035: Admin can access /guides', async () => {
    mockAuth('Admin'); visit('/guides');
    await waitFor(() => expect(currentPath()).toBe('/guides'));
    expect(screen.getByTestId('page-GuidesPage')).toBeTruthy();
    expect(screen.queryByTestId('layout')).not.toBeNull();
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC036: TravelAgent cannot access /guides', async () => {
    mockAuth('TravelAgent'); visit('/guides');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC037: Traveler cannot access /guides', async () => {
    mockAuth('Traveler'); visit('/guides');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC038: LocalGuide cannot access /guides', async () => {
    mockAuth('LocalGuide'); visit('/guides');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC039: Agent cannot access /guides', async () => {
    mockAuth('Agent'); visit('/guides');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC040: Admin can access /ai-review', async () => {
    mockAuth('Admin'); visit('/ai-review');
    await waitFor(() => expect(currentPath()).toBe('/ai-review'));
    expect(screen.getByTestId('page-AIReviewPage')).toBeTruthy();
    expect(screen.queryByTestId('layout')).not.toBeNull();
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC041: TravelAgent can access /ai-review', async () => {
    mockAuth('TravelAgent'); visit('/ai-review');
    await waitFor(() => expect(currentPath()).toBe('/ai-review'));
    expect(screen.getByTestId('page-AIReviewPage')).toBeTruthy();
    expect(screen.queryByTestId('layout')).not.toBeNull();
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC042: Traveler cannot access /ai-review', async () => {
    mockAuth('Traveler'); visit('/ai-review');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC043: LocalGuide cannot access /ai-review', async () => {
    mockAuth('LocalGuide'); visit('/ai-review');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC044: Agent cannot access /ai-review', async () => {
    mockAuth('Agent'); visit('/ai-review');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC045: Admin cannot access /my-experiences', async () => {
    mockAuth('Admin'); visit('/my-experiences');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC046: TravelAgent cannot access /my-experiences', async () => {
    mockAuth('TravelAgent'); visit('/my-experiences');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC047: Traveler cannot access /my-experiences', async () => {
    mockAuth('Traveler'); visit('/my-experiences');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC048: LocalGuide can access /my-experiences', async () => {
    mockAuth('LocalGuide'); visit('/my-experiences');
    await waitFor(() => expect(currentPath()).toBe('/my-experiences'));
    expect(screen.getByTestId('page-MyExperiencesPage')).toBeTruthy();
    expect(screen.queryByTestId('layout')).not.toBeNull();
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC049: Agent cannot access /my-experiences', async () => {
    mockAuth('Agent'); visit('/my-experiences');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC050: Admin can access /travel-agents', async () => {
    mockAuth('Admin'); visit('/travel-agents');
    await waitFor(() => expect(currentPath()).toBe('/travel-agents'));
    expect(screen.getByTestId('page-TravelAgentsPage')).toBeTruthy();
    expect(screen.queryByTestId('layout')).not.toBeNull();
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC051: TravelAgent cannot access /travel-agents', async () => {
    mockAuth('TravelAgent'); visit('/travel-agents');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC052: Traveler cannot access /travel-agents', async () => {
    mockAuth('Traveler'); visit('/travel-agents');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC053: LocalGuide cannot access /travel-agents', async () => {
    mockAuth('LocalGuide'); visit('/travel-agents');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC054: Agent cannot access /travel-agents', async () => {
    mockAuth('Agent'); visit('/travel-agents');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC055: Admin can access /travelers', async () => {
    mockAuth('Admin'); visit('/travelers');
    await waitFor(() => expect(currentPath()).toBe('/travelers'));
    expect(screen.getByTestId('page-TravelersPage')).toBeTruthy();
    expect(screen.queryByTestId('layout')).not.toBeNull();
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC056: TravelAgent cannot access /travelers', async () => {
    mockAuth('TravelAgent'); visit('/travelers');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC057: Traveler cannot access /travelers', async () => {
    mockAuth('Traveler'); visit('/travelers');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC058: LocalGuide cannot access /travelers', async () => {
    mockAuth('LocalGuide'); visit('/travelers');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC059: Agent cannot access /travelers', async () => {
    mockAuth('Agent'); visit('/travelers');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC060: Admin can access /trips', async () => {
    mockAuth('Admin'); visit('/trips');
    await waitFor(() => expect(currentPath()).toBe('/trips'));
    expect(screen.getByTestId('page-TripsPage')).toBeTruthy();
    expect(screen.queryByTestId('layout')).not.toBeNull();
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC061: TravelAgent can access /trips', async () => {
    mockAuth('TravelAgent'); visit('/trips');
    await waitFor(() => expect(currentPath()).toBe('/trips'));
    expect(screen.getByTestId('page-TripsPage')).toBeTruthy();
    expect(screen.queryByTestId('layout')).not.toBeNull();
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC062: Traveler can access /trips', async () => {
    mockAuth('Traveler'); visit('/trips');
    await waitFor(() => expect(currentPath()).toBe('/trips'));
    expect(screen.getByTestId('page-TripsPage')).toBeTruthy();
    expect(screen.queryByTestId('layout')).not.toBeNull();
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC063: LocalGuide cannot access /trips', async () => {
    mockAuth('LocalGuide'); visit('/trips');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC064: Agent cannot access /trips', async () => {
    mockAuth('Agent'); visit('/trips');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC065: Admin can access /trips/test-123', async () => {
    mockAuth('Admin'); visit('/trips/test-123');
    await waitFor(() => expect(currentPath()).toBe('/trips/test-123'));
    expect(screen.getByTestId('page-TripDetailPage')).toBeTruthy();
    expect(screen.queryByTestId('layout')).not.toBeNull();
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC066: TravelAgent can access /trips/test-123', async () => {
    mockAuth('TravelAgent'); visit('/trips/test-123');
    await waitFor(() => expect(currentPath()).toBe('/trips/test-123'));
    expect(screen.getByTestId('page-TripDetailPage')).toBeTruthy();
    expect(screen.queryByTestId('layout')).not.toBeNull();
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC067: Traveler can access /trips/test-123', async () => {
    mockAuth('Traveler'); visit('/trips/test-123');
    await waitFor(() => expect(currentPath()).toBe('/trips/test-123'));
    expect(screen.getByTestId('page-TripDetailPage')).toBeTruthy();
    expect(screen.queryByTestId('layout')).not.toBeNull();
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC068: LocalGuide cannot access /trips/test-123', async () => {
    mockAuth('LocalGuide'); visit('/trips/test-123');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC069: Agent cannot access /trips/test-123', async () => {
    mockAuth('Agent'); visit('/trips/test-123');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC070: Admin can access /ai-performance', async () => {
    mockAuth('Admin'); visit('/ai-performance');
    await waitFor(() => expect(currentPath()).toBe('/ai-performance'));
    expect(screen.getByTestId('page-AIPerformancePage')).toBeTruthy();
    expect(screen.queryByTestId('layout')).not.toBeNull();
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC071: TravelAgent can access /ai-performance', async () => {
    mockAuth('TravelAgent'); visit('/ai-performance');
    await waitFor(() => expect(currentPath()).toBe('/ai-performance'));
    expect(screen.getByTestId('page-AIPerformancePage')).toBeTruthy();
    expect(screen.queryByTestId('layout')).not.toBeNull();
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC072: Traveler cannot access /ai-performance', async () => {
    mockAuth('Traveler'); visit('/ai-performance');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC073: LocalGuide cannot access /ai-performance', async () => {
    mockAuth('LocalGuide'); visit('/ai-performance');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC074: Agent cannot access /ai-performance', async () => {
    mockAuth('Agent'); visit('/ai-performance');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC075: Admin can access /bookings', async () => {
    mockAuth('Admin'); visit('/bookings');
    await waitFor(() => expect(currentPath()).toBe('/bookings'));
    expect(screen.getByTestId('page-BookingsPage')).toBeTruthy();
    expect(screen.queryByTestId('layout')).not.toBeNull();
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC076: TravelAgent cannot access /bookings', async () => {
    mockAuth('TravelAgent'); visit('/bookings');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC077: Traveler can access /bookings', async () => {
    mockAuth('Traveler'); visit('/bookings');
    await waitFor(() => expect(currentPath()).toBe('/bookings'));
    expect(screen.getByTestId('page-BookingsPage')).toBeTruthy();
    expect(screen.queryByTestId('layout')).not.toBeNull();
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC078: LocalGuide can access /bookings', async () => {
    mockAuth('LocalGuide'); visit('/bookings');
    await waitFor(() => expect(currentPath()).toBe('/bookings'));
    expect(screen.getByTestId('page-BookingsPage')).toBeTruthy();
    expect(screen.queryByTestId('layout')).not.toBeNull();
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC079: Agent cannot access /bookings', async () => {
    mockAuth('Agent'); visit('/bookings');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC080: Admin can access /payments', async () => {
    mockAuth('Admin'); visit('/payments');
    await waitFor(() => expect(currentPath()).toBe('/payments'));
    expect(screen.getByTestId('page-PaymentDashboardPage')).toBeTruthy();
    expect(screen.queryByTestId('layout')).not.toBeNull();
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC081: TravelAgent cannot access /payments', async () => {
    mockAuth('TravelAgent'); visit('/payments');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC082: Traveler cannot access /payments', async () => {
    mockAuth('Traveler'); visit('/payments');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC083: LocalGuide cannot access /payments', async () => {
    mockAuth('LocalGuide'); visit('/payments');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC084: Agent cannot access /payments', async () => {
    mockAuth('Agent'); visit('/payments');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC085: Admin can access /refunds', async () => {
    mockAuth('Admin'); visit('/refunds');
    await waitFor(() => expect(currentPath()).toBe('/refunds'));
    expect(screen.getByTestId('page-RefundManagementPage')).toBeTruthy();
    expect(screen.queryByTestId('layout')).not.toBeNull();
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC086: TravelAgent cannot access /refunds', async () => {
    mockAuth('TravelAgent'); visit('/refunds');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC087: Traveler cannot access /refunds', async () => {
    mockAuth('Traveler'); visit('/refunds');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC088: LocalGuide cannot access /refunds', async () => {
    mockAuth('LocalGuide'); visit('/refunds');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC089: Agent cannot access /refunds', async () => {
    mockAuth('Agent'); visit('/refunds');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC090: Admin can access /bookings/test-123', async () => {
    mockAuth('Admin'); visit('/bookings/test-123');
    await waitFor(() => expect(currentPath()).toBe('/bookings/test-123'));
    expect(screen.getByTestId('page-BookingDetailPage')).toBeTruthy();
    expect(screen.queryByTestId('layout')).not.toBeNull();
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC091: TravelAgent cannot access /bookings/test-123', async () => {
    mockAuth('TravelAgent'); visit('/bookings/test-123');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC092: Traveler can access /bookings/test-123', async () => {
    mockAuth('Traveler'); visit('/bookings/test-123');
    await waitFor(() => expect(currentPath()).toBe('/bookings/test-123'));
    expect(screen.getByTestId('page-BookingDetailPage')).toBeTruthy();
    expect(screen.queryByTestId('layout')).not.toBeNull();
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC093: LocalGuide can access /bookings/test-123', async () => {
    mockAuth('LocalGuide'); visit('/bookings/test-123');
    await waitFor(() => expect(currentPath()).toBe('/bookings/test-123'));
    expect(screen.getByTestId('page-BookingDetailPage')).toBeTruthy();
    expect(screen.queryByTestId('layout')).not.toBeNull();
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC094: Agent cannot access /bookings/test-123', async () => {
    mockAuth('Agent'); visit('/bookings/test-123');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC095: Admin can access /reviews', async () => {
    mockAuth('Admin'); visit('/reviews');
    await waitFor(() => expect(currentPath()).toBe('/reviews'));
    expect(screen.getByTestId('page-ReviewManagementPage')).toBeTruthy();
    expect(screen.queryByTestId('layout')).not.toBeNull();
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC096: TravelAgent cannot access /reviews', async () => {
    mockAuth('TravelAgent'); visit('/reviews');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC097: Traveler cannot access /reviews', async () => {
    mockAuth('Traveler'); visit('/reviews');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC098: LocalGuide cannot access /reviews', async () => {
    mockAuth('LocalGuide'); visit('/reviews');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC099: Agent cannot access /reviews', async () => {
    mockAuth('Agent'); visit('/reviews');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC100: Admin cannot access /reviews-ratings', async () => {
    mockAuth('Admin'); visit('/reviews-ratings');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC101: TravelAgent cannot access /reviews-ratings', async () => {
    mockAuth('TravelAgent'); visit('/reviews-ratings');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC102: Traveler cannot access /reviews-ratings', async () => {
    mockAuth('Traveler'); visit('/reviews-ratings');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC103: LocalGuide can access /reviews-ratings', async () => {
    mockAuth('LocalGuide'); visit('/reviews-ratings');
    await waitFor(() => expect(currentPath()).toBe('/reviews-ratings'));
    expect(screen.getByTestId('page-ReviewManagementPage')).toBeTruthy();
    expect(screen.queryByTestId('layout')).not.toBeNull();
    expect(screen.queryByText('Login Page')).toBeNull();
  });
  it('TC104: Agent cannot access /reviews-ratings', async () => {
    mockAuth('Agent'); visit('/reviews-ratings');
    await waitFor(() => expect(currentPath()).toBe('/dashboard'));
    expect(screen.queryByText('Login Page')).toBeNull();
  });
});
