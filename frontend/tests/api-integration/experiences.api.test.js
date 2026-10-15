import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockClient } = vi.hoisted(() => ({
  mockClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() }
}));
vi.mock('../../src/api/client', () => ({ default: mockClient }));
import { experienceAPI } from '../../src/api/experiences';

const sampleData = { title: 'Kandy cultural experience', description: 'Guided tour', price: 100 };
const queryParams = { page: 2, pageSize: 10, destinationId: 'dest-1' };
const response = { status: 200, data: { id: 'result-1', success: true } };
const failure = { response: { status: 500, data: { message: 'Server failure' } } };

beforeEach(() => {
  for (const method of Object.values(mockClient)) method.mockReset();
});

describe('experiences API HTTP contract', () => {
  it('getAll: GET /Experiences forwards arguments and returns response', async () => {
    mockClient.get.mockResolvedValueOnce(response);
    const result = await experienceAPI.getAll(queryParams);
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(mockClient.get).toHaveBeenCalledWith("/Experiences", { "params": queryParams });
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('getAll: propagates rejected HTTP responses', async () => {
    mockClient.get.mockRejectedValueOnce(failure);
    await expect(experienceAPI.getAll(queryParams)).rejects.toBe(failure);
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(mockClient.get).toHaveBeenCalledWith("/Experiences", { "params": queryParams });
  });

  it('getById: GET /Experiences/exp-1 forwards arguments and returns response', async () => {
    mockClient.get.mockResolvedValueOnce(response);
    const result = await experienceAPI.getById("exp-1", "2026-11-20");
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(mockClient.get).toHaveBeenCalledWith("/Experiences/exp-1", { "params": { "date": "2026-11-20" } });
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('getById: propagates rejected HTTP responses', async () => {
    mockClient.get.mockRejectedValueOnce(failure);
    await expect(experienceAPI.getById("exp-1", "2026-11-20")).rejects.toBe(failure);
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(mockClient.get).toHaveBeenCalledWith("/Experiences/exp-1", { "params": { "date": "2026-11-20" } });
  });

  it('calculatePrice: GET /Experiences/exp-1/price-calculation forwards arguments and returns response', async () => {
    mockClient.get.mockResolvedValueOnce(response);
    const result = await experienceAPI.calculatePrice("exp-1", "2026-11-20");
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(mockClient.get).toHaveBeenCalledWith("/Experiences/exp-1/price-calculation", { "params": { "date": "2026-11-20" } });
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('calculatePrice: propagates rejected HTTP responses', async () => {
    mockClient.get.mockRejectedValueOnce(failure);
    await expect(experienceAPI.calculatePrice("exp-1", "2026-11-20")).rejects.toBe(failure);
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(mockClient.get).toHaveBeenCalledWith("/Experiences/exp-1/price-calculation", { "params": { "date": "2026-11-20" } });
  });

  it('create: POST /Experiences forwards arguments and returns response', async () => {
    mockClient.post.mockResolvedValueOnce(response);
    const result = await experienceAPI.create(sampleData);
    expect(mockClient.post).toHaveBeenCalledTimes(1);
    expect(mockClient.post).toHaveBeenCalledWith("/Experiences", sampleData);
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('create: propagates rejected HTTP responses', async () => {
    mockClient.post.mockRejectedValueOnce(failure);
    await expect(experienceAPI.create(sampleData)).rejects.toBe(failure);
    expect(mockClient.post).toHaveBeenCalledTimes(1);
    expect(mockClient.post).toHaveBeenCalledWith("/Experiences", sampleData);
  });

  it('update: PUT /Experiences/exp-1 forwards arguments and returns response', async () => {
    mockClient.put.mockResolvedValueOnce(response);
    const result = await experienceAPI.update("exp-1", sampleData);
    expect(mockClient.put).toHaveBeenCalledTimes(1);
    expect(mockClient.put).toHaveBeenCalledWith("/Experiences/exp-1", sampleData);
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('update: propagates rejected HTTP responses', async () => {
    mockClient.put.mockRejectedValueOnce(failure);
    await expect(experienceAPI.update("exp-1", sampleData)).rejects.toBe(failure);
    expect(mockClient.put).toHaveBeenCalledTimes(1);
    expect(mockClient.put).toHaveBeenCalledWith("/Experiences/exp-1", sampleData);
  });

  it('updateStatus: PATCH /Experiences/exp-1/status forwards arguments and returns response', async () => {
    mockClient.patch.mockResolvedValueOnce(response);
    const result = await experienceAPI.updateStatus("exp-1", "APPROVED");
    expect(mockClient.patch).toHaveBeenCalledTimes(1);
    expect(mockClient.patch).toHaveBeenCalledWith("/Experiences/exp-1/status", null, { "params": { "status": "APPROVED" } });
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('updateStatus: propagates rejected HTTP responses', async () => {
    mockClient.patch.mockRejectedValueOnce(failure);
    await expect(experienceAPI.updateStatus("exp-1", "APPROVED")).rejects.toBe(failure);
    expect(mockClient.patch).toHaveBeenCalledTimes(1);
    expect(mockClient.patch).toHaveBeenCalledWith("/Experiences/exp-1/status", null, { "params": { "status": "APPROVED" } });
  });

  it('searchForAgent: POST /Experiences/search-agent-tool forwards arguments and returns response', async () => {
    mockClient.post.mockResolvedValueOnce(response);
    const result = await experienceAPI.searchForAgent(sampleData);
    expect(mockClient.post).toHaveBeenCalledTimes(1);
    expect(mockClient.post).toHaveBeenCalledWith("/Experiences/search-agent-tool", sampleData);
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('searchForAgent: propagates rejected HTTP responses', async () => {
    mockClient.post.mockRejectedValueOnce(failure);
    await expect(experienceAPI.searchForAgent(sampleData)).rejects.toBe(failure);
    expect(mockClient.post).toHaveBeenCalledTimes(1);
    expect(mockClient.post).toHaveBeenCalledWith("/Experiences/search-agent-tool", sampleData);
  });

  it('getPending: GET /Experiences/pending-approvals forwards arguments and returns response', async () => {
    mockClient.get.mockResolvedValueOnce(response);
    const result = await experienceAPI.getPending();
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(mockClient.get).toHaveBeenCalledWith("/Experiences/pending-approvals");
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('getPending: propagates rejected HTTP responses', async () => {
    mockClient.get.mockRejectedValueOnce(failure);
    await expect(experienceAPI.getPending()).rejects.toBe(failure);
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(mockClient.get).toHaveBeenCalledWith("/Experiences/pending-approvals");
  });

  it('getForAdmin: GET /Experiences/admin forwards arguments and returns response', async () => {
    mockClient.get.mockResolvedValueOnce(response);
    const result = await experienceAPI.getForAdmin();
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(mockClient.get).toHaveBeenCalledWith("/Experiences/admin");
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('getForAdmin: propagates rejected HTTP responses', async () => {
    mockClient.get.mockRejectedValueOnce(failure);
    await expect(experienceAPI.getForAdmin()).rejects.toBe(failure);
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(mockClient.get).toHaveBeenCalledWith("/Experiences/admin");
  });

  it('remove: DELETE /Experiences/exp-1 forwards arguments and returns response', async () => {
    mockClient.delete.mockResolvedValueOnce(response);
    const result = await experienceAPI.remove("exp-1");
    expect(mockClient.delete).toHaveBeenCalledTimes(1);
    expect(mockClient.delete).toHaveBeenCalledWith("/Experiences/exp-1");
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('remove: propagates rejected HTTP responses', async () => {
    mockClient.delete.mockRejectedValueOnce(failure);
    await expect(experienceAPI.remove("exp-1")).rejects.toBe(failure);
    expect(mockClient.delete).toHaveBeenCalledTimes(1);
    expect(mockClient.delete).toHaveBeenCalledWith("/Experiences/exp-1");
  });

  it('getMine: GET /Experiences/mine forwards arguments and returns response', async () => {
    mockClient.get.mockResolvedValueOnce(response);
    const result = await experienceAPI.getMine();
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(mockClient.get).toHaveBeenCalledWith("/Experiences/mine");
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('getMine: propagates rejected HTTP responses', async () => {
    mockClient.get.mockRejectedValueOnce(failure);
    await expect(experienceAPI.getMine()).rejects.toBe(failure);
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(mockClient.get).toHaveBeenCalledWith("/Experiences/mine");
  });

});
