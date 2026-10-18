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

describe('TC12 - Register Invalid Email Format', () => {
    it('should display an error when email format is invalid', async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        const fullNameInput =
            screen.getByPlaceholderText('John Doe');

        const emailInput =
            screen.getByPlaceholderText('you@example.com');

        await user.type(fullNameInput, 'John Doe');
        await user.type(emailInput, 'invalid-email');

        await user.click(
            screen.getByRole('button', { name: /next/i })
        );

        expect(
            screen.getByRole('alert').textContent
        ).toContain('Enter a valid email address.');

        expect(
            screen.getByText('Step 1 of 4')
        ).toBeTruthy();
    });
});
