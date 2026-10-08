import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

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

describe('TC19 - Experience Weekday Toggle', () => {
    it('should toggle Saturday from unselected to selected', async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter>
                <ExperienceForm />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(
                screen.getByRole('heading', {
                    name: 'Add New Experience',
                })
            ).toBeTruthy();
        });

        const saturdayButton = screen.getByRole('button', {
            name: /sat/i,
        });

        expect(
            saturdayButton.getAttribute('aria-pressed')
        ).toBe('false');

        expect(
            saturdayButton.textContent
        ).toContain('×');

        await user.click(saturdayButton);

        expect(
            saturdayButton.getAttribute('aria-pressed')
        ).toBe('true');

        expect(
            saturdayButton.textContent
        ).toContain('✓');
    });
});
