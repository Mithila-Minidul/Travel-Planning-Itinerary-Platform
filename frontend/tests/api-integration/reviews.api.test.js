import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockClient } = vi.hoisted(() => ({
  mockClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() }
}));
vi.mock('../../src/api/client', () => ({ default: mockClient }));
import { reviewAPI } from '../../src/api/reviews';

const sampleData = { title: 'Kandy cultural experience', description: 'Guided tour', price: 100 };
const queryParams = { page: 2, pageSize: 10, destinationId: 'dest-1' };
const response = { status: 200, data: { id: 'result-1', success: true } };
const failure = { response: { status: 500, data: { message: 'Server failure' } } };

beforeEach(() => {
  for (const method of Object.values(mockClient)) method.mockReset();
});

describe('reviews API HTTP contract', () => {
  it('getAll: GET /Reviews forwards arguments and returns response', async () => {
    mockClient.get.mockResolvedValueOnce(response);
    const result = await reviewAPI.getAll();
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(mockClient.get).toHaveBeenCalledWith("/Reviews");
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('getAll: propagates rejected HTTP responses', async () => {
    mockClient.get.mockRejectedValueOnce(failure);
    await expect(reviewAPI.getAll()).rejects.toBe(failure);
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(mockClient.get).toHaveBeenCalledWith("/Reviews");
  });

  it('getForGuide: GET /Reviews/guide forwards arguments and returns response', async () => {
    mockClient.get.mockResolvedValueOnce(response);
    const result = await reviewAPI.getForGuide();
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(mockClient.get).toHaveBeenCalledWith("/Reviews/guide");
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('getForGuide: propagates rejected HTTP responses', async () => {
    mockClient.get.mockRejectedValueOnce(failure);
    await expect(reviewAPI.getForGuide()).rejects.toBe(failure);
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(mockClient.get).toHaveBeenCalledWith("/Reviews/guide");
  });

  it('reply: PATCH /Reviews/review-1/reply forwards arguments and returns response', async () => {
    mockClient.patch.mockResolvedValueOnce(response);
    const result = await reviewAPI.reply("review-1", "Thank you");
    expect(mockClient.patch).toHaveBeenCalledTimes(1);
    expect(mockClient.patch).toHaveBeenCalledWith("/Reviews/review-1/reply", { "reply": "Thank you" });
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('reply: propagates rejected HTTP responses', async () => {
    mockClient.patch.mockRejectedValueOnce(failure);
    await expect(reviewAPI.reply("review-1", "Thank you")).rejects.toBe(failure);
    expect(mockClient.patch).toHaveBeenCalledTimes(1);
    expect(mockClient.patch).toHaveBeenCalledWith("/Reviews/review-1/reply", { "reply": "Thank you" });
  });

  it('deleteReply: DELETE /Reviews/review-1/reply forwards arguments and returns response', async () => {
    mockClient.delete.mockResolvedValueOnce(response);
    const result = await reviewAPI.deleteReply("review-1");
    expect(mockClient.delete).toHaveBeenCalledTimes(1);
    expect(mockClient.delete).toHaveBeenCalledWith("/Reviews/review-1/reply");
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('deleteReply: propagates rejected HTTP responses', async () => {
    mockClient.delete.mockRejectedValueOnce(failure);
    await expect(reviewAPI.deleteReply("review-1")).rejects.toBe(failure);
    expect(mockClient.delete).toHaveBeenCalledTimes(1);
    expect(mockClient.delete).toHaveBeenCalledWith("/Reviews/review-1/reply");
  });

  it('update: PUT /Reviews/review-1 forwards arguments and returns response', async () => {
    mockClient.put.mockResolvedValueOnce(response);
    const result = await reviewAPI.update("review-1", 4, "Good");
    expect(mockClient.put).toHaveBeenCalledTimes(1);
    expect(mockClient.put).toHaveBeenCalledWith("/Reviews/review-1", { "rating": 4, "comment": "Good" });
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('update: propagates rejected HTTP responses', async () => {
    mockClient.put.mockRejectedValueOnce(failure);
    await expect(reviewAPI.update("review-1", 4, "Good")).rejects.toBe(failure);
    expect(mockClient.put).toHaveBeenCalledTimes(1);
    expect(mockClient.put).toHaveBeenCalledWith("/Reviews/review-1", { "rating": 4, "comment": "Good" });
  });

  it('delete: DELETE /Reviews/review-1 forwards arguments and returns response', async () => {
    mockClient.delete.mockResolvedValueOnce(response);
    const result = await reviewAPI.delete("review-1");
    expect(mockClient.delete).toHaveBeenCalledTimes(1);
    expect(mockClient.delete).toHaveBeenCalledWith("/Reviews/review-1");
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('delete: propagates rejected HTTP responses', async () => {
    mockClient.delete.mockRejectedValueOnce(failure);
    await expect(reviewAPI.delete("review-1")).rejects.toBe(failure);
    expect(mockClient.delete).toHaveBeenCalledTimes(1);
    expect(mockClient.delete).toHaveBeenCalledWith("/Reviews/review-1");
  });

});
