import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import {
    render,
    screen,
    fireEvent,
} from '@testing-library/react';
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

describe('TC17 - Register Invalid Profile Photo Type', () => {
    it('should display an error when selected profile photo is not an image', async () => {
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

        const fileInput =
            container.querySelector('input[type="file"]');

        const invalidFile = new File(
            ['test content'],
            'document.txt',
            {
                type: 'text/plain',
            }
        );

        fireEvent.change(fileInput, {
            target: {
                files: [invalidFile],
            },
        });

        expect(
            screen.getByRole('alert').textContent
        ).toContain(
            'Profile photo must be an image file.'
        );

        expect(
            screen.getByText('Step 2 of 4')
        ).toBeTruthy();
    });
});
