import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const mockLogin = vi.fn();

vi.mock('../../src/context/AuthContext', () => ({
    useAuth: () => ({
        login: mockLogin,
    }),
}));

import Login from '../../src/components/auth/Login';

describe('TC08 - Login Invalid Credentials', () => {
    it('should display an error message when login fails', async () => {
        mockLogin.mockResolvedValue({
            success: false,
            error: 'Invalid credentials',
        });

        const user = userEvent.setup();

        const { container } = render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        const emailInput = screen.getByRole('textbox');
        const passwordInput = container.querySelector('input[type="password"]');
        const loginButton = screen.getByRole('button', { name: 'Login' });

        await user.type(emailInput, 'user@example.com');
        await user.type(passwordInput, 'wrongpassword');

        await user.click(loginButton);

        expect(
            await screen.findByText('Invalid credentials')
        ).toBeTruthy();

        expect(mockLogin).toHaveBeenCalledWith(
            'user@example.com',
            'wrongpassword'
        );
    });
});
