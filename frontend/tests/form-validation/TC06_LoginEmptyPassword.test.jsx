import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../src/context/AuthContext', () => ({
    useAuth: () => ({
        login: vi.fn(),
    }),
}));

import Login from '../../src/components/auth/Login';

describe('TC06 - Login Empty Password Validation', () => {
    it('should require the password field', () => {
        const { container } = render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        const passwordInput = container.querySelector('input[type="password"]');

        expect(passwordInput).not.toBeNull();
        expect(passwordInput.required).toBe(true);
        expect(passwordInput.value).toBe('');
    });
});
