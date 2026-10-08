import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../src/context/AuthContext', () => ({
    useAuth: () => ({
        login: vi.fn(),
    }),
}));

import Login from '../../src/components/auth/Login';

describe('TC05 - Login Empty Email Validation', () => {
    it('should require the email field', () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        const emailInput = screen.getByRole('textbox');

        expect(emailInput.required).toBe(true);
        expect(emailInput.value).toBe('');
    });
});
