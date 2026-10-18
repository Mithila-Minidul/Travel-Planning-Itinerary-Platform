import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
const auth = vi.hoisted(() => ({
  state: { user: { fullName: 'Test User', email: 'test@example.com', role: 'Admin' }, isAuthenticated: true, loading: false, isAdmin: true, isAgent: false, isLocalGuide: false, logout: vi.fn() }
}));
vi.mock('../../src/context/AuthContext', () => ({ useAuth: () => auth.state }));
import Layout from '../../src/components/common/Layout';
describe('Layout component',()=>{ beforeEach(()=>{auth.state={ user:{fullName:'Test User',email:'test@example.com',role:'Admin'},isAuthenticated:true,loading:false,isAdmin:true,isAgent:false,isLocalGuide:false,logout:vi.fn() };});
function view(){return render(<MemoryRouter initialEntries={['/']}><Routes><Route element={<Layout />}><Route path="/" element={<div>Child content</div>} /></Route></Routes></MemoryRouter>);}
it('renders outlet without navigation for guests',()=>{auth.state.isAuthenticated=false;view();expect(screen.getByText('Child content')).toBeTruthy();expect(screen.queryByText('TripCraft')).toBeNull();});
it('renders navbar, sidebar and outlet for signed-in users',()=>{view();expect(screen.getByText('Child content')).toBeTruthy();expect(screen.getByText('TripCraft')).toBeTruthy();expect(screen.getByText('Test User')).toBeTruthy();});
});
