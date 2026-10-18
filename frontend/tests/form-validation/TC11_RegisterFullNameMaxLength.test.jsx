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

describe('TC11 - Register Full Name Maximum Length', () => {
    it('should display an error when full name exceeds 100 characters', async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        const fullNameInput =
            screen.getByPlaceholderText('John Doe');

        const longName = 'A'.repeat(101);

        await user.type(fullNameInput, longName);

        await user.click(
            screen.getByRole('button', { name: /next/i })
        );

        expect(
            screen.getByRole('alert').textContent
        ).toContain(
            'Full name must be 100 characters or fewer.'
        );

        expect(
            screen.getByText('Step 1 of 4')
        ).toBeTruthy();
    });
});
