import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
const auth = vi.hoisted(() => ({
  state: { user: { fullName: 'Test User', email: 'test@example.com', role: 'Admin' }, isAuthenticated: true, loading: false, isAdmin: true, isAgent: false, isLocalGuide: false, logout: vi.fn() }
}));
vi.mock('../../src/context/AuthContext', () => ({ useAuth: () => auth.state }));
import Sidebar from '../../src/components/common/Sidebar';
describe('Sidebar component',()=>{ beforeEach(()=>{auth.state={ user:{fullName:'Test User',email:'test@example.com',role:'Admin'},isAuthenticated:true,loading:false,isAdmin:true,isAgent:false,isLocalGuide:false,logout:vi.fn() };});
it('renders admin navigation and hides guide-only links', () => { render(<MemoryRouter><Sidebar /></MemoryRouter>); expect(screen.getByRole('link',{name:/destinations/i}).getAttribute('href')).toBe('/destinations'); expect(screen.queryByRole('link',{name:'My Experiences'})).toBeNull(); });
it('renders agent navigation', () => { auth.state.isAdmin=false;auth.state.isAgent=true; render(<MemoryRouter><Sidebar /></MemoryRouter>); expect(screen.getByRole('link',{name:/AI Review Queue/i})).toBeTruthy(); expect(screen.queryByRole('link',{name:/Refunds/i})).toBeNull(); });
it('renders guide navigation', () => { auth.state.isAdmin=false;auth.state.isLocalGuide=true; render(<MemoryRouter><Sidebar /></MemoryRouter>); expect(screen.getByRole('link',{name:/My Experiences/i})).toBeTruthy(); });
});
