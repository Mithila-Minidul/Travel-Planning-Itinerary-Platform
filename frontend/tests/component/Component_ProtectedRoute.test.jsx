import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
const auth = vi.hoisted(() => ({
  state: { user: { fullName: 'Test User', email: 'test@example.com', role: 'Admin' }, isAuthenticated: true, loading: false, isAdmin: true, isAgent: false, isLocalGuide: false, logout: vi.fn() }
}));
vi.mock('../../src/context/AuthContext', () => ({ useAuth: () => auth.state }));
import ProtectedRoute from '../../src/components/common/ProtectedRoute';
describe('ProtectedRoute component',()=>{ beforeEach(()=>{auth.state={ user:{fullName:'Test User',email:'test@example.com',role:'Admin'},isAuthenticated:true,loading:false,isAdmin:true,isAgent:false,isLocalGuide:false,logout:vi.fn() };});
function view(roles) { return render(<MemoryRouter initialEntries={['/secure']}><Routes><Route path="/secure" element={<ProtectedRoute allowedRoles={roles}><div>Protected content</div></ProtectedRoute>} /><Route path="/login" element={<div>Login destination</div>} /><Route path="/dashboard" element={<div>Dashboard destination</div>} /></Routes></MemoryRouter>); }
it('shows loading without exposing content',()=>{auth.state.loading=true;view(['Admin']);expect(screen.getByText('Loading...')).toBeTruthy();expect(screen.queryByText('Protected content')).toBeNull();});
it('redirects unauthenticated visitors',()=>{auth.state.isAuthenticated=false;view(['Admin']);expect(screen.getByText('Login destination')).toBeTruthy();});
it('redirects authenticated users with the wrong role',()=>{auth.state.user={...auth.state.user,role:'Traveler'};view(['Admin']);expect(screen.getByText('Dashboard destination')).toBeTruthy();});
it('renders children for permitted role',()=>{view(['Admin']);expect(screen.getByText('Protected content')).toBeTruthy();});
it('renders children when roles are unrestricted',()=>{view();expect(screen.getByText('Protected content')).toBeTruthy();});
});
