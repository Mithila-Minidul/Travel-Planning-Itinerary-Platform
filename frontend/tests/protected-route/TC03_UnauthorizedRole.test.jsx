import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

vi.mock('../../src/context/AuthContext', () => ({
    useAuth: vi.fn(),
}));

import ProtectedRoute from '../../src/components/common/ProtectedRoute';
import { useAuth } from '../../src/context/AuthContext';

describe('TC03 - ProtectedRoute Unauthorized Role', () => {
    it('should redirect user to dashboard when role is not allowed', () => {
        vi.mocked(useAuth).mockReturnValue({
            isAuthenticated: true,
            user: {
                role: 'Traveler',
            },
            loading: false,
        });

        render(
            <MemoryRouter initialEntries={['/admin']}>
                <Routes>
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute allowedRoles={['Admin']}>
                                <div>Admin Content</div>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/dashboard"
                        element={<div>Dashboard Page</div>}
                    />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Dashboard Page')).toBeTruthy();
    });
});
