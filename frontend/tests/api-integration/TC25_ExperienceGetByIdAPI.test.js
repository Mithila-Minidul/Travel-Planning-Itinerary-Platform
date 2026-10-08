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

describe('TC25 - Experience Get By ID API Integration', () => {
    it('should send GET request with experience ID and date parameter', async () => {
        const experienceId = 'exp-123';
        const date = '2026-10-20';

        const mockResponse = {
            data: {
                id: experienceId,
                title: 'Sigiriya Adventure',
                basePrice: 100,
            },
        };

        mockGet.mockResolvedValue(mockResponse);

        const result = await experienceAPI.getById(
            experienceId,
            date
        );

        expect(mockGet).toHaveBeenCalledTimes(1);

        expect(mockGet).toHaveBeenCalledWith(
            `/Experiences/${experienceId}`,
            {
                params: {
                    date,
                },
            }
        );

        expect(result).toEqual(mockResponse);
    });
});
