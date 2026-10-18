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

describe('TC15 - Register Invalid Phone Number', () => {
    it('should display an error for an invalid Sri Lankan mobile number', async () => {
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

        await user.type(passwordInputs[0], 'password123');
        await user.type(passwordInputs[1], 'password123');

        await user.click(
            screen.getByRole('button', { name: /next/i })
        );

        expect(
            screen.getByText('Step 2 of 4')
        ).toBeTruthy();

        await user.type(
            screen.getByPlaceholderText(
                '0771234567 or +94771234567'
            ),
            '12345'
        );

        await user.click(
            screen.getByRole('button', { name: /next/i })
        );

        expect(
            screen.getByRole('alert').textContent
        ).toContain(
            'Enter a valid Sri Lankan mobile number'
        );

        expect(
            screen.getByText('Step 2 of 4')
        ).toBeTruthy();
    });
});
