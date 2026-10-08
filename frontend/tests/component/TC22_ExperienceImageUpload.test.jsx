import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import {
    render,
    screen,
    fireEvent,
    waitFor,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const { mockUpload } = vi.hoisted(() => ({
    mockUpload: vi.fn(),
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
        upload: mockUpload,
    },
}));

import ExperienceForm from '../../src/components/experiences/ExperienceForm';

describe('TC22 - Experience Image Upload', () => {
    it('should upload an image and display its preview', async () => {
        mockUpload.mockResolvedValue({
            data: {
                url: 'https://example.com/experience.jpg',
            },
        });

        const { container } = render(
            <MemoryRouter>
                <ExperienceForm />
            </MemoryRouter>
        );

        const fileInput =
            container.querySelector('#imageInput');

        const imageFile = new File(
            ['image-content'],
            'experience.jpg',
            {
                type: 'image/jpeg',
            }
        );

        fireEvent.change(fileInput, {
            target: {
                files: [imageFile],
            },
        });

        await waitFor(() => {
            expect(mockUpload).toHaveBeenCalledWith(
                imageFile,
                'experiences'
            );
        });

        const preview = await screen.findByAltText(
            'Experience preview 1'
        );

        expect(
            preview.getAttribute('src')
        ).toBe(
            'https://example.com/experience.jpg'
        );

        expect(
            screen.getByText('1/4')
        ).toBeTruthy();
    });
});
