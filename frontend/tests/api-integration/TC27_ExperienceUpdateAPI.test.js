import { describe, it, expect, vi } from 'vitest';

const { mockPut } = vi.hoisted(() => ({
    mockPut: vi.fn(),
}));

vi.mock('../../src/api/client', () => ({
    default: {
        put: mockPut,
    },
}));

import { experienceAPI } from '../../src/api/experiences';

describe('TC27 - Experience Update API Integration', () => {
    it('should send PUT request with experience ID and updated data', async () => {
        const experienceId = 'exp-456';

        const updatedData = {
            title: 'Updated Kandy Cultural Tour',
            description: 'Updated tour description',
            basePrice: 85,
            durationHours: 6,
            maxCapacity: 12,
        };

        const mockResponse = {
            data: {
                id: experienceId,
                ...updatedData,
            },
        };

        mockPut.mockResolvedValue(mockResponse);

        const result = await experienceAPI.update(
            experienceId,
            updatedData
        );

        expect(mockPut).toHaveBeenCalledTimes(1);

        expect(mockPut).toHaveBeenCalledWith(
            `/Experiences/${experienceId}`,
            updatedData
        );

        expect(result).toEqual(mockResponse);
    });
});
