import { describe, it, expect, vi } from 'vitest';

const { mockGet } = vi.hoisted(() => ({
    mockGet: vi.fn(),
}));

vi.mock('../../src/api/client', () => ({
    default: {
        get: mockGet,
    },
}));

import { experienceAPI } from '../../src/api/experiences';

describe('TC24 - Experience Get All API Integration', () => {
    it('should send GET request to /Experiences with query parameters', async () => {
        const params = {
            destinationId: 'dest-1',
            categoryId: 'cat-1',
        };

        const mockResponse = {
            data: [
                {
                    id: 'exp-1',
                    title: 'Colombo City Tour',
                },
            ],
        };

        mockGet.mockResolvedValue(mockResponse);

        const result = await experienceAPI.getAll(params);

        expect(mockGet).toHaveBeenCalledTimes(1);

        expect(mockGet).toHaveBeenCalledWith(
            '/Experiences',
            {
                params,
            }
        );

        expect(result).toEqual(mockResponse);
    });
});
