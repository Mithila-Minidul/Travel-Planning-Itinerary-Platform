import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockClient } = vi.hoisted(() => ({
  mockClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() }
}));
vi.mock('../../src/api/client', () => ({ default: mockClient }));
import { tripAPI } from '../../src/api/trips';

const sampleData = { title: 'Kandy cultural experience', description: 'Guided tour', price: 100 };
const queryParams = { page: 2, pageSize: 10, destinationId: 'dest-1' };
const response = { status: 200, data: { id: 'result-1', success: true } };
const failure = { response: { status: 500, data: { message: 'Server failure' } } };

beforeEach(() => {
  for (const method of Object.values(mockClient)) method.mockReset();
});

describe('trips API HTTP contract', () => {
  it('getAllTrips: GET /Trips forwards arguments and returns response', async () => {
    mockClient.get.mockResolvedValueOnce(response);
    const result = await tripAPI.getAllTrips();
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(mockClient.get).toHaveBeenCalledWith("/Trips");
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('getAllTrips: propagates rejected HTTP responses', async () => {
    mockClient.get.mockRejectedValueOnce(failure);
    await expect(tripAPI.getAllTrips()).rejects.toBe(failure);
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(mockClient.get).toHaveBeenCalledWith("/Trips");
  });

  it('getTripById: GET /Trips/trip-1 forwards arguments and returns response', async () => {
    mockClient.get.mockResolvedValueOnce(response);
    const result = await tripAPI.getTripById("trip-1");
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(mockClient.get).toHaveBeenCalledWith("/Trips/trip-1");
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('getTripById: propagates rejected HTTP responses', async () => {
    mockClient.get.mockRejectedValueOnce(failure);
    await expect(tripAPI.getTripById("trip-1")).rejects.toBe(failure);
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(mockClient.get).toHaveBeenCalledWith("/Trips/trip-1");
  });

  it('createTrip: POST /Trips forwards arguments and returns response', async () => {
    mockClient.post.mockResolvedValueOnce(response);
    const result = await tripAPI.createTrip(sampleData);
    expect(mockClient.post).toHaveBeenCalledTimes(1);
    expect(mockClient.post).toHaveBeenCalledWith("/Trips", sampleData);
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('createTrip: propagates rejected HTTP responses', async () => {
    mockClient.post.mockRejectedValueOnce(failure);
    await expect(tripAPI.createTrip(sampleData)).rejects.toBe(failure);
    expect(mockClient.post).toHaveBeenCalledTimes(1);
    expect(mockClient.post).toHaveBeenCalledWith("/Trips", sampleData);
  });

  it('reviewTrip: PATCH /Trips/trip-1/review forwards arguments and returns response', async () => {
    mockClient.patch.mockResolvedValueOnce(response);
    const result = await tripAPI.reviewTrip("trip-1", sampleData);
    expect(mockClient.patch).toHaveBeenCalledTimes(1);
    expect(mockClient.patch).toHaveBeenCalledWith("/Trips/trip-1/review", sampleData);
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('reviewTrip: propagates rejected HTTP responses', async () => {
    mockClient.patch.mockRejectedValueOnce(failure);
    await expect(tripAPI.reviewTrip("trip-1", sampleData)).rejects.toBe(failure);
    expect(mockClient.patch).toHaveBeenCalledTimes(1);
    expect(mockClient.patch).toHaveBeenCalledWith("/Trips/trip-1/review", sampleData);
  });

  it('deleteTrip: DELETE /Trips/trip-1 forwards arguments and returns response', async () => {
    mockClient.delete.mockResolvedValueOnce(response);
    const result = await tripAPI.deleteTrip("trip-1");
    expect(mockClient.delete).toHaveBeenCalledTimes(1);
    expect(mockClient.delete).toHaveBeenCalledWith("/Trips/trip-1");
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('deleteTrip: propagates rejected HTTP responses', async () => {
    mockClient.delete.mockRejectedValueOnce(failure);
    await expect(tripAPI.deleteTrip("trip-1")).rejects.toBe(failure);
    expect(mockClient.delete).toHaveBeenCalledTimes(1);
    expect(mockClient.delete).toHaveBeenCalledWith("/Trips/trip-1");
  });

});
