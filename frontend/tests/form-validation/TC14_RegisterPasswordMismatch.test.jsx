import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../src/context/AuthContext', () => ({
    useAuth: () => ({
        register: vi.fn(),
    }),
}));

vi.mock('../../src/api/images', () => ({
    imageAPI: {
        upload: vi.fn(),
    },
}));

import Register from '../../src/components/auth/Register';

describe('TC14 - Register Password Mismatch', () => {
    it('should display an error when password and confirm password do not match', async () => {
        const user = userEvent.setup();

        const { container } = render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        await user.type(
            screen.getByPlaceholderText('John Doe'),
            'John Doe'
        );

        await user.type(
            screen.getByPlaceholderText('you@example.com'),
            'john@example.com'
        );

        const passwordInputs =
            container.querySelectorAll('input[type="password"]');

        const passwordInput = passwordInputs[0];
        const confirmPasswordInput = passwordInputs[1];

        await user.type(passwordInput, 'password123');
        await user.type(confirmPasswordInput, 'password456');

        await user.click(
            screen.getByRole('button', { name: /next/i })
        );

        expect(
            screen.getByRole('alert').textContent
        ).toContain('Passwords do not match.');

        expect(
            screen.getByText('Step 1 of 4')
        ).toBeTruthy();
    });
});
