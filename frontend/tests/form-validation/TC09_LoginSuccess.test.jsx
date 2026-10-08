import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
    MemoryRouter,
    Routes,
    Route,
} from 'react-router-dom';

const mockLogin = vi.fn();

vi.mock('../../src/context/AuthContext', () => ({
    useAuth: () => ({
        login: mockLogin,
    }),
}));

import Login from '../../src/components/auth/Login';

describe('TC09 - Successful Login', () => {
    it('should redirect user to dashboard after successful login', async () => {
        mockLogin.mockResolvedValue({
            success: true,
        });

        const user = userEvent.setup();

        const { container } = render(
            <MemoryRouter initialEntries={['/login']}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/dashboard"
                        element={<div>Dashboard Page</div>}
                    />
                </Routes>
            </MemoryRouter>
        );

        const emailInput = screen.getByRole('textbox');
        const passwordInput =
            container.querySelector('input[type="password"]');

        const loginButton = screen.getByRole('button', {
            name: 'Login',
        });

        await user.type(emailInput, 'user@example.com');
        await user.type(passwordInput, 'correctpassword');

        await user.click(loginButton);

        expect(mockLogin).toHaveBeenCalledWith(
            'user@example.com',
            'correctpassword'
        );

        expect(
            await screen.findByText('Dashboard Page')
        ).toBeTruthy();
    });
});
