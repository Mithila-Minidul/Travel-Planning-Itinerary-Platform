import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../src/context/AuthContext', () => ({
    useAuth: () => ({
        login: vi.fn(),
    }),
}));

import Login from '../../src/components/auth/Login';

describe('TC07 - Login Invalid Email Format', () => {
    it('should mark invalid email format as invalid', () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        const emailInput = screen.getByRole('textbox');

        fireEvent.change(emailInput, {
            target: {
                value: 'invalid-email',
            },
        });

        expect(emailInput.value).toBe('invalid-email');
        expect(emailInput.checkValidity()).toBe(false);
    });
});
