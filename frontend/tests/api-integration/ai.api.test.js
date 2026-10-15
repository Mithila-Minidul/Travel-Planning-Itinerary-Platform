import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockClient } = vi.hoisted(() => ({
  mockClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() }
}));
vi.mock('../../src/api/client', () => ({ default: mockClient }));
import { aiAPI } from '../../src/api/ai';

const sampleData = { title: 'Kandy cultural experience', description: 'Guided tour', price: 100 };
const queryParams = { page: 2, pageSize: 10, destinationId: 'dest-1' };
const response = { status: 200, data: { id: 'result-1', success: true } };
const failure = { response: { status: 500, data: { message: 'Server failure' } } };

beforeEach(() => {
  for (const method of Object.values(mockClient)) method.mockReset();
});

describe('ai API HTTP contract', () => {
  it('triggerItinerary: POST /ai/generate-itinerary forwards arguments and returns response', async () => {
    mockClient.post.mockResolvedValueOnce(response);
    const result = await aiAPI.triggerItinerary(sampleData);
    expect(mockClient.post).toHaveBeenCalledTimes(1);
    expect(mockClient.post).toHaveBeenCalledWith("/ai/generate-itinerary", sampleData);
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('triggerItinerary: propagates rejected HTTP responses', async () => {
    mockClient.post.mockRejectedValueOnce(failure);
    await expect(aiAPI.triggerItinerary(sampleData)).rejects.toBe(failure);
    expect(mockClient.post).toHaveBeenCalledTimes(1);
    expect(mockClient.post).toHaveBeenCalledWith("/ai/generate-itinerary", sampleData);
  });

  it('getWorkflow: GET /ai/workflows/wf-1 forwards arguments and returns response', async () => {
    mockClient.get.mockResolvedValueOnce(response);
    const result = await aiAPI.getWorkflow("wf-1");
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(mockClient.get).toHaveBeenCalledWith("/ai/workflows/wf-1");
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('getWorkflow: propagates rejected HTTP responses', async () => {
    mockClient.get.mockRejectedValueOnce(failure);
    await expect(aiAPI.getWorkflow("wf-1")).rejects.toBe(failure);
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(mockClient.get).toHaveBeenCalledWith("/ai/workflows/wf-1");
  });

  it('approve: PUT /ai/workflows/wf-1/approve forwards arguments and returns response', async () => {
    mockClient.put.mockResolvedValueOnce(response);
    const result = await aiAPI.approve("wf-1");
    expect(mockClient.put).toHaveBeenCalledTimes(1);
    expect(mockClient.put).toHaveBeenCalledWith("/ai/workflows/wf-1/approve");
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('approve: propagates rejected HTTP responses', async () => {
    mockClient.put.mockRejectedValueOnce(failure);
    await expect(aiAPI.approve("wf-1")).rejects.toBe(failure);
    expect(mockClient.put).toHaveBeenCalledTimes(1);
    expect(mockClient.put).toHaveBeenCalledWith("/ai/workflows/wf-1/approve");
  });

  it('reject: PUT /ai/workflows/wf-1/reject forwards arguments and returns response', async () => {
    mockClient.put.mockResolvedValueOnce(response);
    const result = await aiAPI.reject("wf-1", "Not suitable");
    expect(mockClient.put).toHaveBeenCalledTimes(1);
    expect(mockClient.put).toHaveBeenCalledWith("/ai/workflows/wf-1/reject", { "reason": "Not suitable" });
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('reject: propagates rejected HTTP responses', async () => {
    mockClient.put.mockRejectedValueOnce(failure);
    await expect(aiAPI.reject("wf-1", "Not suitable")).rejects.toBe(failure);
    expect(mockClient.put).toHaveBeenCalledTimes(1);
    expect(mockClient.put).toHaveBeenCalledWith("/ai/workflows/wf-1/reject", { "reason": "Not suitable" });
  });

  it('getLogs: GET /ai/execution-logs/wf-1 forwards arguments and returns response', async () => {
    mockClient.get.mockResolvedValueOnce(response);
    const result = await aiAPI.getLogs("wf-1");
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(mockClient.get).toHaveBeenCalledWith("/ai/execution-logs/wf-1");
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('getLogs: propagates rejected HTTP responses', async () => {
    mockClient.get.mockRejectedValueOnce(failure);
    await expect(aiAPI.getLogs("wf-1")).rejects.toBe(failure);
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(mockClient.get).toHaveBeenCalledWith("/ai/execution-logs/wf-1");
  });

});
