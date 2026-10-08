import { describe, it, expect, vi } from 'vitest';

const { mockPatch } = vi.hoisted(() => ({
    mockPatch: vi.fn(),
}));

vi.mock('../../src/api/client', () => ({
    default: {
        patch: mockPatch,
    },
}));

import { experienceAPI } from '../../src/api/experiences';

describe('TC28 - Experience Update Status API Integration', () => {
    it('should send PATCH request with experience ID and status parameter', async () => {
        const experienceId = 'exp-456';
        const status = 'APPROVED';

        const mockResponse = {
            data: {
                id: experienceId,
                status: 'APPROVED',
            },
        };

        mockPatch.mockResolvedValue(mockResponse);

        const result = await experienceAPI.updateStatus(
            experienceId,
            status
        );

        expect(mockPatch).toHaveBeenCalledTimes(1);

        expect(mockPatch).toHaveBeenCalledWith(
            `/Experiences/${experienceId}/status`,
            null,
            {
                params: {
                    status,
                },
            }
        );

        expect(result).toEqual(mockResponse);
    });
});
