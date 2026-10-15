import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockClient } = vi.hoisted(() => ({
  mockClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() }
}));
vi.mock('../../src/api/client', () => ({ default: mockClient }));
import { agentWorkflowAPI } from '../../src/api/agentWorkflows';

const sampleData = { title: 'Kandy cultural experience', description: 'Guided tour', price: 100 };
const queryParams = { page: 2, pageSize: 10, destinationId: 'dest-1' };
const response = { status: 200, data: { id: 'result-1', success: true } };
const failure = { response: { status: 500, data: { message: 'Server failure' } } };

beforeEach(() => {
  for (const method of Object.values(mockClient)) method.mockReset();
});

describe('agentWorkflows API HTTP contract', () => {
  it('getAll: GET /AgentWorkflows forwards arguments and returns response', async () => {
    mockClient.get.mockResolvedValueOnce(response);
    const result = await agentWorkflowAPI.getAll();
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(mockClient.get).toHaveBeenCalledWith("/AgentWorkflows", { "params": {  } });
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('getAll: propagates rejected HTTP responses', async () => {
    mockClient.get.mockRejectedValueOnce(failure);
    await expect(agentWorkflowAPI.getAll()).rejects.toBe(failure);
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(mockClient.get).toHaveBeenCalledWith("/AgentWorkflows", { "params": {  } });
  });

  it('getById: GET /AgentWorkflows/wf-1 forwards arguments and returns response', async () => {
    mockClient.get.mockResolvedValueOnce(response);
    const result = await agentWorkflowAPI.getById("wf-1");
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(mockClient.get).toHaveBeenCalledWith("/AgentWorkflows/wf-1");
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('getById: propagates rejected HTTP responses', async () => {
    mockClient.get.mockRejectedValueOnce(failure);
    await expect(agentWorkflowAPI.getById("wf-1")).rejects.toBe(failure);
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(mockClient.get).toHaveBeenCalledWith("/AgentWorkflows/wf-1");
  });

  it('getByTrip: GET /AgentWorkflows/by-trip/trip-1 forwards arguments and returns response', async () => {
    mockClient.get.mockResolvedValueOnce(response);
    const result = await agentWorkflowAPI.getByTrip("trip-1");
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(mockClient.get).toHaveBeenCalledWith("/AgentWorkflows/by-trip/trip-1");
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('getByTrip: propagates rejected HTTP responses', async () => {
    mockClient.get.mockRejectedValueOnce(failure);
    await expect(agentWorkflowAPI.getByTrip("trip-1")).rejects.toBe(failure);
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(mockClient.get).toHaveBeenCalledWith("/AgentWorkflows/by-trip/trip-1");
  });

});
