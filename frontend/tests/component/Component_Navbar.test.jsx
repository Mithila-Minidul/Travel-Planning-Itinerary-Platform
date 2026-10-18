import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
const auth = vi.hoisted(() => ({
  state: { user: { fullName: 'Test User', email: 'test@example.com', role: 'Admin' }, isAuthenticated: true, loading: false, isAdmin: true, isAgent: false, isLocalGuide: false, logout: vi.fn() }
}));
vi.mock('../../src/context/AuthContext', () => ({ useAuth: () => auth.state }));
import Navbar from '../../src/components/common/Navbar';
describe('Navbar component',()=>{ beforeEach(()=>{auth.state={ user:{fullName:'Test User',email:'test@example.com',role:'Admin'},isAuthenticated:true,loading:false,isAdmin:true,isAgent:false,isLocalGuide:false,logout:vi.fn() };});
it('shows the signed-in user and role', () => { render(<MemoryRouter><Navbar /></MemoryRouter>); expect(screen.getByText('Test User')).toBeTruthy(); expect(screen.getByText('Admin Dashboard')).toBeTruthy(); });
it('calls logout when logout button is clicked', () => { const {container}=render(<MemoryRouter><Navbar /></MemoryRouter>); fireEvent.click(container.querySelector('button')); expect(auth.state.logout).toHaveBeenCalledTimes(1); });
it.each(['Admin','TravelAgent','LocalGuide','Traveler'])('renders heading for %s', role => { auth.state.user = {...auth.state.user,role}; render(<MemoryRouter><Navbar /></MemoryRouter>); expect(screen.getByRole('heading', {name: role==='Admin'?'Admin Dashboard':role==='TravelAgent'?'Agent Dashboard':role==='LocalGuide'?'Guide Dashboard':'Traveler Dashboard'})).toBeTruthy(); });
});
