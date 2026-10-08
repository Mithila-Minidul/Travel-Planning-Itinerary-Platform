import { describe, it, expect, vi } from 'vitest';

const { mockDelete } = vi.hoisted(() => ({
    mockDelete: vi.fn(),
}));

vi.mock('../../src/api/client', () => ({
    default: {
        delete: mockDelete,
    },
}));

import { experienceAPI } from '../../src/api/experiences';

describe('TC29 - Experience Delete API Integration', () => {
    it('should send DELETE request with experience ID', async () => {
        const experienceId = 'exp-456';

        const mockResponse = {
            data: {
                message: 'Experience deleted successfully',
            },
        };

        mockDelete.mockResolvedValue(mockResponse);

        const result = await experienceAPI.remove(
            experienceId
        );

        expect(mockDelete).toHaveBeenCalledTimes(1);

        expect(mockDelete).toHaveBeenCalledWith(
            `/Experiences/${experienceId}`
        );

        expect(result).toEqual(mockResponse);
    });
});
