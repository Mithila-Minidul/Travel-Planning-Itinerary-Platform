import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockClient } = vi.hoisted(() => ({
  mockClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() }
}));
vi.mock('../../src/api/client', () => ({ default: mockClient }));
import { paymentAPI } from '../../src/api/payments';

const sampleData = { title: 'Kandy cultural experience', description: 'Guided tour', price: 100 };
const queryParams = { page: 2, pageSize: 10, destinationId: 'dest-1' };
const response = { status: 200, data: { id: 'result-1', success: true } };
const failure = { response: { status: 500, data: { message: 'Server failure' } } };

beforeEach(() => {
  for (const method of Object.values(mockClient)) method.mockReset();
});

describe('payments API HTTP contract', () => {
  it('process: POST /Payments/process/booking-1 forwards arguments and returns response', async () => {
    mockClient.post.mockResolvedValueOnce(response);
    const result = await paymentAPI.process("booking-1", "Card");
    expect(mockClient.post).toHaveBeenCalledTimes(1);
    expect(mockClient.post).toHaveBeenCalledWith("/Payments/process/booking-1", { "method": "Card" });
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('process: propagates rejected HTTP responses', async () => {
    mockClient.post.mockRejectedValueOnce(failure);
    await expect(paymentAPI.process("booking-1", "Card")).rejects.toBe(failure);
    expect(mockClient.post).toHaveBeenCalledTimes(1);
    expect(mockClient.post).toHaveBeenCalledWith("/Payments/process/booking-1", { "method": "Card" });
  });

  it('previewRefund: GET /Payments/booking-1/refund-preview forwards arguments and returns response', async () => {
    mockClient.get.mockResolvedValueOnce(response);
    const result = await paymentAPI.previewRefund("booking-1");
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(mockClient.get).toHaveBeenCalledWith("/Payments/booking-1/refund-preview");
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('previewRefund: propagates rejected HTTP responses', async () => {
    mockClient.get.mockRejectedValueOnce(failure);
    await expect(paymentAPI.previewRefund("booking-1")).rejects.toBe(failure);
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(mockClient.get).toHaveBeenCalledWith("/Payments/booking-1/refund-preview");
  });

  it('refund: POST /Payments/booking-1/refund forwards arguments and returns response', async () => {
    mockClient.post.mockResolvedValueOnce(response);
    const result = await paymentAPI.refund("booking-1", "Duplicate charge");
    expect(mockClient.post).toHaveBeenCalledTimes(1);
    expect(mockClient.post).toHaveBeenCalledWith("/Payments/booking-1/refund", { "reason": "Duplicate charge" });
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('refund: propagates rejected HTTP responses', async () => {
    mockClient.post.mockRejectedValueOnce(failure);
    await expect(paymentAPI.refund("booking-1", "Duplicate charge")).rejects.toBe(failure);
    expect(mockClient.post).toHaveBeenCalledTimes(1);
    expect(mockClient.post).toHaveBeenCalledWith("/Payments/booking-1/refund", { "reason": "Duplicate charge" });
  });

});
