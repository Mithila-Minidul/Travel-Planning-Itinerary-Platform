import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockClient } = vi.hoisted(() => ({
  mockClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() }
}));
vi.mock('../../src/api/client', () => ({ default: mockClient }));
import { guideAPI } from '../../src/api/guides';

const sampleData = { title: 'Kandy cultural experience', description: 'Guided tour', price: 100 };
const queryParams = { page: 2, pageSize: 10, destinationId: 'dest-1' };
const response = { status: 200, data: { id: 'result-1', success: true } };
const failure = { response: { status: 500, data: { message: 'Server failure' } } };

beforeEach(() => {
  for (const method of Object.values(mockClient)) method.mockReset();
});

describe('guides API HTTP contract', () => {
  it('getAll: GET /LocalGuides forwards arguments and returns response', async () => {
    mockClient.get.mockResolvedValueOnce(response);
    const result = await guideAPI.getAll("Active");
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(mockClient.get).toHaveBeenCalledWith("/LocalGuides", { "params": { "status": "Active" } });
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('getAll: propagates rejected HTTP responses', async () => {
    mockClient.get.mockRejectedValueOnce(failure);
    await expect(guideAPI.getAll("Active")).rejects.toBe(failure);
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(mockClient.get).toHaveBeenCalledWith("/LocalGuides", { "params": { "status": "Active" } });
  });

  it('getById: GET /LocalGuides/guide-1 forwards arguments and returns response', async () => {
    mockClient.get.mockResolvedValueOnce(response);
    const result = await guideAPI.getById("guide-1");
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(mockClient.get).toHaveBeenCalledWith("/LocalGuides/guide-1");
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('getById: propagates rejected HTTP responses', async () => {
    mockClient.get.mockRejectedValueOnce(failure);
    await expect(guideAPI.getById("guide-1")).rejects.toBe(failure);
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(mockClient.get).toHaveBeenCalledWith("/LocalGuides/guide-1");
  });

  it('updateStatus: PATCH /LocalGuides/guide-1/status forwards arguments and returns response', async () => {
    mockClient.patch.mockResolvedValueOnce(response);
    const result = await guideAPI.updateStatus("guide-1", "Active");
    expect(mockClient.patch).toHaveBeenCalledTimes(1);
    expect(mockClient.patch).toHaveBeenCalledWith("/LocalGuides/guide-1/status", null, { "params": { "status": "Active" } });
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('updateStatus: propagates rejected HTTP responses', async () => {
    mockClient.patch.mockRejectedValueOnce(failure);
    await expect(guideAPI.updateStatus("guide-1", "Active")).rejects.toBe(failure);
    expect(mockClient.patch).toHaveBeenCalledTimes(1);
    expect(mockClient.patch).toHaveBeenCalledWith("/LocalGuides/guide-1/status", null, { "params": { "status": "Active" } });
  });

  it('getMyStats: GET /LocalGuides/me/stats forwards arguments and returns response', async () => {
    mockClient.get.mockResolvedValueOnce(response);
    const result = await guideAPI.getMyStats();
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(mockClient.get).toHaveBeenCalledWith("/LocalGuides/me/stats");
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('getMyStats: propagates rejected HTTP responses', async () => {
    mockClient.get.mockRejectedValueOnce(failure);
    await expect(guideAPI.getMyStats()).rejects.toBe(failure);
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(mockClient.get).toHaveBeenCalledWith("/LocalGuides/me/stats");
  });

  it('delete: DELETE /LocalGuides/guide-1 forwards arguments and returns response', async () => {
    mockClient.delete.mockResolvedValueOnce(response);
    const result = await guideAPI.delete("guide-1");
    expect(mockClient.delete).toHaveBeenCalledTimes(1);
    expect(mockClient.delete).toHaveBeenCalledWith("/LocalGuides/guide-1");
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('delete: propagates rejected HTTP responses', async () => {
    mockClient.delete.mockRejectedValueOnce(failure);
    await expect(guideAPI.delete("guide-1")).rejects.toBe(failure);
    expect(mockClient.delete).toHaveBeenCalledTimes(1);
    expect(mockClient.delete).toHaveBeenCalledWith("/LocalGuides/guide-1");
  });

});
