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

describe('TC26 - Experience Create API Integration', () => {
    it('should send POST request with experience data', async () => {
        const experienceData = {
            title: 'Kandy Cultural Tour',
            description: 'Explore the cultural attractions of Kandy',
            basePrice: 75,
            durationHours: 5,
            maxCapacity: 10,
            destinationId: 'dest-1',
            categoryId: 'cat-1',
        };

        const mockResponse = {
            data: {
                id: 'exp-456',
                ...experienceData,
            },
        };

        mockPost.mockResolvedValue(mockResponse);

        const result = await experienceAPI.create(
            experienceData
        );

        expect(mockPost).toHaveBeenCalledTimes(1);

        expect(mockPost).toHaveBeenCalledWith(
            '/Experiences',
            experienceData
        );

        expect(result).toEqual(mockResponse);
    });
});
