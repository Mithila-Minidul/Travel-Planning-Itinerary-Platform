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

describe('TC13 - Register Password Minimum Length', () => {
    it('should display an error when password has fewer than 6 characters', async () => {
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

        await user.type(passwordInput, '12345');

        await user.click(
            screen.getByRole('button', { name: /next/i })
        );

        expect(
            screen.getByRole('alert').textContent
        ).toContain(
            'Password must be at least 6 characters long.'
        );

        expect(
            screen.getByText('Step 1 of 4')
        ).toBeTruthy();
    });
});
