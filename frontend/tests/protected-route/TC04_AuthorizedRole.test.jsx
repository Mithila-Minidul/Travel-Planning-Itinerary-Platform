import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../src/context/AuthContext', () => ({
    useAuth: vi.fn(),
}));

import ProtectedRoute from '../../src/components/common/ProtectedRoute';
import { useAuth } from '../../src/context/AuthContext';

describe('TC04 - ProtectedRoute Authorized Role', () => {
    it('should render protected content when user role is allowed', () => {
        vi.mocked(useAuth).mockReturnValue({
            isAuthenticated: true,
            user: {
                role: 'Admin',
            },
            loading: false,
        });

        render(
            <MemoryRouter>
                <ProtectedRoute allowedRoles={['Admin']}>
                    <div>Admin Protected Content</div>
                </ProtectedRoute>
            </MemoryRouter>
        );

        expect(
            screen.getByText('Admin Protected Content')
        ).toBeTruthy();
    });
});
