import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('../../src/context/AuthContext', () => ({
    useAuth: vi.fn(),
}));

import ProtectedRoute from '../../src/components/common/ProtectedRoute';
import { useAuth } from '../../src/context/AuthContext';

describe('TC01 - ProtectedRoute Loading State', () => {
    it('should display loading screen when authentication is loading', () => {
        vi.mocked(useAuth).mockReturnValue({
            isAuthenticated: false,
            user: null,
            loading: true,
        });

        render(
            <ProtectedRoute>
                <div>Protected Content</div>
            </ProtectedRoute>
        );

        expect(screen.getByText('Loading...')).toBeTruthy();
    });
});
