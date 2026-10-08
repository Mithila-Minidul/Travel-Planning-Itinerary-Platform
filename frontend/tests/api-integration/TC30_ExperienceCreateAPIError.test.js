import { describe, it, expect, vi } from 'vitest';

const { mockPost } = vi.hoisted(() => ({
    mockPost: vi.fn(),
}));

vi.mock('../../src/api/client', () => ({
    default: {
        post: mockPost,
    },
}));

import { experienceAPI } from '../../src/api/experiences';

describe('TC30 - Experience Create API Error Handling', () => {
    it('should propagate the error when create request fails', async () => {
        const experienceData = {
            title: 'Kandy Cultural Tour',
            description: 'Explore Kandy',
            basePrice: 75,
        };

        const apiError = {
            response: {
                status: 500,
                data: {
                    message: 'Internal Server Error',
                },
            },
        };

        mockPost.mockRejectedValue(apiError);

        await expect(
            experienceAPI.create(experienceData)
        ).rejects.toEqual(apiError);

        expect(mockPost).toHaveBeenCalledTimes(1);

        expect(mockPost).toHaveBeenCalledWith(
            '/Experiences',
            experienceData
        );
    });
});
