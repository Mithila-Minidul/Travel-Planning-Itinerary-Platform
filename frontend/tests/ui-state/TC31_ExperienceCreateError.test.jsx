import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import {
    render,
    screen,
    waitFor,
    fireEvent,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const {
    mockCreate,
    mockToastError,
} = vi.hoisted(() => ({
    mockCreate: vi.fn(),
    mockToastError: vi.fn(),
}));

vi.mock('../../src/context/AuthContext', () => ({
    useAuth: () => ({
        user: { id: 'user-1' },
        isAdmin: false,
    }),
}));

vi.mock('../../src/api/experiences', () => ({
    experienceAPI: {
        getById: vi.fn(),
        create: mockCreate,
        update: vi.fn(),
    },
}));

vi.mock('../../src/api/destinations', () => ({
    destinationAPI: {
        getAll: vi.fn().mockResolvedValue({
            data: [
                {
                    id: 'dest-1',
                    name: 'Kandy',
                },
            ],
        }),
    },
}));

vi.mock('../../src/api/categories', () => ({
    categoryAPI: {
        getAll: vi.fn().mockResolvedValue({
            data: [
                {
                    id: 'cat-1',
                    name: 'Adventure',
                },
            ],
        }),
    },
}));

vi.mock('../../src/api/images', () => ({
    imageAPI: {
        upload: vi.fn(),
    },
}));

vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn(),
        error: mockToastError,
    },
}));

import ExperienceForm from '../../src/components/experiences/ExperienceForm';

describe('TC31 - Experience Create Error State', () => {
    it('should display an error toast when experience creation fails', async () => {
        const user = userEvent.setup();

        mockCreate.mockRejectedValue(
            new Error('Server unavailable')
        );

        const { container } = render(
            <MemoryRouter>
                <ExperienceForm />
            </MemoryRouter>
        );

        await screen.findByRole('option', {
            name: 'Kandy',
        });

        const titleInput =
            container.querySelector('input[name="title"]');

        const descriptionInput =
            container.querySelector('textarea[name="description"]');

        const basePriceInput =
            container.querySelector('input[name="basePrice"]');

        const durationInput =
            container.querySelector('input[name="durationHours"]');

        const capacityInput =
            container.querySelector('input[name="maxCapacity"]');

        const destinationSelect =
            container.querySelector('select[name="destinationId"]');

        const categorySelect =
            container.querySelector('select[name="categoryId"]');

        await user.type(
            titleInput,
            'Kandy Adventure'
        );

        await user.type(
            descriptionInput,
            'A complete adventure experience in Kandy.'
        );

        await user.type(
            basePriceInput,
            '100'
        );

        await user.type(
            durationInput,
            '5'
        );

        await user.type(
            capacityInput,
            '10'
        );

        await user.selectOptions(
            destinationSelect,
            'dest-1'
        );

        await user.selectOptions(
            categorySelect,
            'cat-1'
        );

        const form = container.querySelector('form');

        fireEvent.submit(form);

        await waitFor(() => {
            expect(mockCreate).toHaveBeenCalledTimes(1);
        });

        await waitFor(() => {
            expect(mockToastError).toHaveBeenCalled();
        });
    });
});
