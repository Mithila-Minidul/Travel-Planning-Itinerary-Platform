import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

vi.mock('../../src/context/AuthContext', () => ({
    useAuth: vi.fn(),
}));

import ProtectedRoute from '../../src/components/common/ProtectedRoute';
import { useAuth } from '../../src/context/AuthContext';

describe('TC02 - ProtectedRoute Unauthenticated Access', () => {
    it('should redirect unauthenticated user to login page', () => {
        vi.mocked(useAuth).mockReturnValue({
            isAuthenticated: false,
            user: null,
            loading: false,
        });

        render(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route
                        path="/protected"
                        element={
                            <ProtectedRoute>
                                <div>Protected Content</div>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/login"
                        element={<div>Login Page</div>}
                    />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Login Page')).toBeTruthy();
    });
});
