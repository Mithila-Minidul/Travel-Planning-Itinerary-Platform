import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import ProtectedRoute from '../../src/components/common/ProtectedRoute';
import { useAuth } from '../../src/context/AuthContext';

vi.mock('../../src/context/AuthContext', () => ({ useAuth: vi.fn() }));
const setAuth = (state) => vi.mocked(useAuth).mockReturnValue(state);
const Location = () => <output data-testid="location">{useLocation().pathname}</output>;
const Navigation = () => {
  const navigate = useNavigate();
  return <button onClick={() => navigate('/secure')}>Visit secure route</button>;
};
const mount = (state, allowedRoles, initialEntries = ['/secure']) => {
  setAuth(state);
  return render(<MemoryRouter initialEntries={initialEntries}>
    <Location />
    <Routes>
      <Route path="/secure" element={<ProtectedRoute allowedRoles={allowedRoles}><div data-testid="secret">Sensitive content</div></ProtectedRoute>} />
      <Route path="/login" element={<div>Login destination</div>} />
      <Route path="/dashboard" element={<><div>Dashboard destination</div><Navigation /></>} />
    </Routes>
  </MemoryRouter>);
};
const auth = (role, authenticated = true, loading = false) => ({
  user: role === null ? null : { role }, isAuthenticated: authenticated, loading,
});
beforeEach(() => vi.resetAllMocks());
afterEach(() => cleanup());

describe('ProtectedRoute state transitions, boundaries and navigation semantics', () => {
  it('TC125: loading takes precedence over an authenticated admin identity', () => {
    mount(auth('Admin', true, true), ['Admin']);
    expect(screen.getByText('Loading...')).toBeTruthy();
    expect(screen.queryByTestId('secret')).toBeNull();
    expect(screen.getByTestId('location').textContent).toBe('/secure');
  });
  it('TC126: loading takes precedence over unauthenticated redirect', () => {
    mount(auth(null, false, true), ['Admin']);
    expect(screen.getByText('Loading...')).toBeTruthy();
    expect(screen.getByTestId('location').textContent).toBe('/secure');
  });
  it('TC127: authentication false denies access even when user object contains Admin role', () => {
    mount(auth('Admin', false), ['Admin']);
    expect(screen.getByText('Login destination')).toBeTruthy();
    expect(screen.queryByTestId('secret')).toBeNull();
  });
  it('TC128: authenticated user with missing user object cannot pass role restriction', () => {
    mount({ isAuthenticated: true, user: null, loading: false }, ['Admin']);
    expect(screen.getByText('Dashboard destination')).toBeTruthy();
    expect(screen.queryByTestId('secret')).toBeNull();
  });
  it('TC129: authenticated user with undefined role cannot pass role restriction', () => {
    mount({ isAuthenticated: true, user: {}, loading: false }, ['Admin']);
    expect(screen.getByText('Dashboard destination')).toBeTruthy();
  });
  it('TC130: exact role casing is required by current allowlist implementation', () => {
    mount(auth('admin'), ['Admin']);
    expect(screen.getByText('Dashboard destination')).toBeTruthy();
  });
  it('TC131: Agent alias is not accepted for TravelAgent-only route in current App policy', () => {
    mount(auth('Agent'), ['TravelAgent']);
    expect(screen.getByText('Dashboard destination')).toBeTruthy();
  });
  it('TC132: TravelAgent passes the TravelAgent allowlist', () => {
    mount(auth('TravelAgent'), ['TravelAgent']);
    expect(screen.getByTestId('secret')).toBeTruthy();
  });
  it('TC133: an authenticated user may access route without allowedRoles', () => {
    mount(auth('UnrecognizedRole'), undefined);
    expect(screen.getByTestId('secret')).toBeTruthy();
  });
  it('TC134: empty allowedRoles denies all authenticated roles', () => {
    mount(auth('Admin'), []);
    expect(screen.getByText('Dashboard destination')).toBeTruthy();
  });
  it('TC135: multi-role allowlist accepts the second role', () => {
    mount(auth('LocalGuide'), ['Admin', 'LocalGuide']);
    expect(screen.getByTestId('secret')).toBeTruthy();
  });
  it('TC136: multi-role allowlist rejects role not in list', () => {
    mount(auth('Traveler'), ['Admin', 'LocalGuide']);
    expect(screen.getByText('Dashboard destination')).toBeTruthy();
  });
  it('TC137: unauthenticated redirect navigates to login destination', () => {
    mount(auth(null, false), ['Admin'], ['/previous', '/secure']);
    expect(screen.getByText('Login destination')).toBeTruthy();
    expect(screen.getByTestId('location').textContent).toBe('/login');
  });
  it('TC138: unauthorized redirect replaces route with dashboard and hides secret', () => {
    mount(auth('Traveler'), ['Admin']);
    expect(screen.getByTestId('location').textContent).toBe('/dashboard');
    expect(screen.queryByTestId('secret')).toBeNull();
  });
  it('TC139: authorization updates immediately when role changes on rerender', () => {
    const state = auth('Admin');
    const { rerender } = mount(state, ['Admin']);
    expect(screen.getByTestId('secret')).toBeTruthy();
    setAuth(auth('Traveler'));
    rerender(<MemoryRouter initialEntries={['/secure']}><Location /><Routes><Route path="/secure" element={<ProtectedRoute allowedRoles={['Admin']}><div data-testid="secret">Sensitive content</div></ProtectedRoute>} /><Route path="/dashboard" element={<div>Dashboard destination</div>} /></Routes></MemoryRouter>);
    expect(screen.queryByTestId('secret')).toBeNull();
    expect(screen.getByText('Dashboard destination')).toBeTruthy();
  });
  it('TC140: navigation from dashboard to forbidden route redirects back', () => {
    setAuth(auth('Traveler'));
    render(<MemoryRouter initialEntries={['/dashboard']}><Location /><Routes><Route path="/dashboard" element={<><div>Dashboard destination</div><Navigation /></>} /><Route path="/secure" element={<ProtectedRoute allowedRoles={['Admin']}><div data-testid="secret">Sensitive content</div></ProtectedRoute>} /></Routes></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Visit secure route' }));
    expect(screen.getByText('Dashboard destination')).toBeTruthy();
    expect(screen.queryByTestId('secret')).toBeNull();
  });
});
