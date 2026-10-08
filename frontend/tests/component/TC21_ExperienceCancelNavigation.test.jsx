import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
    MemoryRouter,
    Routes,
    Route,
} from 'react-router-dom';

vi.mock('../../src/context/AuthContext', () => ({
    useAuth: () => ({
        user: { id: 'user-1' },
        isAdmin: false,
    }),
}));

vi.mock('../../src/api/experiences', () => ({
    experienceAPI: {
        getById: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
    },
}));

vi.mock('../../src/api/destinations', () => ({
    destinationAPI: {
        getAll: vi.fn().mockResolvedValue({
            data: [],
        }),
    },
}));

vi.mock('../../src/api/categories', () => ({
    categoryAPI: {
        getAll: vi.fn().mockResolvedValue({
            data: [],
        }),
    },
}));

vi.mock('../../src/api/images', () => ({
    imageAPI: {
        upload: vi.fn(),
    },
}));

import ExperienceForm from '../../src/components/experiences/ExperienceForm';

describe('TC21 - Experience Cancel Navigation', () => {
    it('should navigate to my experiences when Cancel is clicked', async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter initialEntries={['/experiences/create']}>
                <Routes>
                    <Route
                        path="/experiences/create"
                        element={<ExperienceForm />}
                    />

                    <Route
                        path="/my-experiences"
                        element={<div>My Experiences Page</div>}
                    />
                </Routes>
            </MemoryRouter>
        );

        expect(
            screen.getByRole('heading', {
                name: 'Add New Experience',
            })
        ).toBeTruthy();

        await user.click(
            screen.getByRole('button', {
                name: 'Cancel',
            })
        );

        expect(
            screen.getByText('My Experiences Page')
        ).toBeTruthy();
    });
});
