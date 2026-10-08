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

describe('TC10 - Register Empty Full Name Validation', () => {
    it('should display an error when full name is empty', async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        const nextButton = screen.getByRole('button', {
            name: /next/i,
        });

        await user.click(nextButton);

        expect(
            screen.getByRole('alert').textContent
        ).toContain('Full name is required.');

        expect(
            screen.getByText('Step 1 of 4')
        ).toBeTruthy();
    });
});
