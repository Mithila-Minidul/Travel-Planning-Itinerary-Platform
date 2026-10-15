import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockClient } = vi.hoisted(() => ({
  mockClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() }
}));
vi.mock('../../src/api/client', () => ({ default: mockClient }));
import { bookingAPI } from '../../src/api/bookings';

const sampleData = { title: 'Kandy cultural experience', description: 'Guided tour', price: 100 };
const queryParams = { page: 2, pageSize: 10, destinationId: 'dest-1' };
const response = { status: 200, data: { id: 'result-1', success: true } };
const failure = { response: { status: 500, data: { message: 'Server failure' } } };

beforeEach(() => {
  for (const method of Object.values(mockClient)) method.mockReset();
});

describe('bookings API HTTP contract', () => {
  it('create: POST /Bookings forwards arguments and returns response', async () => {
    mockClient.post.mockResolvedValueOnce(response);
    const result = await bookingAPI.create(sampleData);
    expect(mockClient.post).toHaveBeenCalledTimes(1);
    expect(mockClient.post).toHaveBeenCalledWith("/Bookings", sampleData);
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('create: propagates rejected HTTP responses', async () => {
    mockClient.post.mockRejectedValueOnce(failure);
    await expect(bookingAPI.create(sampleData)).rejects.toBe(failure);
    expect(mockClient.post).toHaveBeenCalledTimes(1);
    expect(mockClient.post).toHaveBeenCalledWith("/Bookings", sampleData);
  });

  it('getAll: GET /Bookings forwards arguments and returns response', async () => {
    mockClient.get.mockResolvedValueOnce(response);
    const result = await bookingAPI.getAll();
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(mockClient.get).toHaveBeenCalledWith("/Bookings");
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('getAll: propagates rejected HTTP responses', async () => {
    mockClient.get.mockRejectedValueOnce(failure);
    await expect(bookingAPI.getAll()).rejects.toBe(failure);
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(mockClient.get).toHaveBeenCalledWith("/Bookings");
  });

  it('getById: GET /Bookings/booking-1 forwards arguments and returns response', async () => {
    mockClient.get.mockResolvedValueOnce(response);
    const result = await bookingAPI.getById("booking-1");
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(mockClient.get).toHaveBeenCalledWith("/Bookings/booking-1");
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('getById: propagates rejected HTTP responses', async () => {
    mockClient.get.mockRejectedValueOnce(failure);
    await expect(bookingAPI.getById("booking-1")).rejects.toBe(failure);
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(mockClient.get).toHaveBeenCalledWith("/Bookings/booking-1");
  });

  it('confirm: PATCH /Bookings/booking-1/confirm forwards arguments and returns response', async () => {
    mockClient.patch.mockResolvedValueOnce(response);
    const result = await bookingAPI.confirm("booking-1");
    expect(mockClient.patch).toHaveBeenCalledTimes(1);
    expect(mockClient.patch).toHaveBeenCalledWith("/Bookings/booking-1/confirm");
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('confirm: propagates rejected HTTP responses', async () => {
    mockClient.patch.mockRejectedValueOnce(failure);
    await expect(bookingAPI.confirm("booking-1")).rejects.toBe(failure);
    expect(mockClient.patch).toHaveBeenCalledTimes(1);
    expect(mockClient.patch).toHaveBeenCalledWith("/Bookings/booking-1/confirm");
  });

  it('reject: PATCH /Bookings/booking-1/reject forwards arguments and returns response', async () => {
    mockClient.patch.mockResolvedValueOnce(response);
    const result = await bookingAPI.reject("booking-1", "Unavailable");
    expect(mockClient.patch).toHaveBeenCalledTimes(1);
    expect(mockClient.patch).toHaveBeenCalledWith("/Bookings/booking-1/reject", { "reason": "Unavailable" });
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('reject: propagates rejected HTTP responses', async () => {
    mockClient.patch.mockRejectedValueOnce(failure);
    await expect(bookingAPI.reject("booking-1", "Unavailable")).rejects.toBe(failure);
    expect(mockClient.patch).toHaveBeenCalledTimes(1);
    expect(mockClient.patch).toHaveBeenCalledWith("/Bookings/booking-1/reject", { "reason": "Unavailable" });
  });

  it('cancel: PATCH /Bookings/booking-1/cancel forwards arguments and returns response', async () => {
    mockClient.patch.mockResolvedValueOnce(response);
    const result = await bookingAPI.cancel("booking-1", "Changed plans");
    expect(mockClient.patch).toHaveBeenCalledTimes(1);
    expect(mockClient.patch).toHaveBeenCalledWith("/Bookings/booking-1/cancel", { "reason": "Changed plans" });
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('cancel: propagates rejected HTTP responses', async () => {
    mockClient.patch.mockRejectedValueOnce(failure);
    await expect(bookingAPI.cancel("booking-1", "Changed plans")).rejects.toBe(failure);
    expect(mockClient.patch).toHaveBeenCalledTimes(1);
    expect(mockClient.patch).toHaveBeenCalledWith("/Bookings/booking-1/cancel", { "reason": "Changed plans" });
  });

  it('checkIn: PATCH /Bookings/booking-1/check-in forwards arguments and returns response', async () => {
    mockClient.patch.mockResolvedValueOnce(response);
    const result = await bookingAPI.checkIn("booking-1", "ABC123");
    expect(mockClient.patch).toHaveBeenCalledTimes(1);
    expect(mockClient.patch).toHaveBeenCalledWith("/Bookings/booking-1/check-in", null, { "params": { "code": "ABC123" } });
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('checkIn: propagates rejected HTTP responses', async () => {
    mockClient.patch.mockRejectedValueOnce(failure);
    await expect(bookingAPI.checkIn("booking-1", "ABC123")).rejects.toBe(failure);
    expect(mockClient.patch).toHaveBeenCalledTimes(1);
    expect(mockClient.patch).toHaveBeenCalledWith("/Bookings/booking-1/check-in", null, { "params": { "code": "ABC123" } });
  });

  it('checkInByCode: POST /Bookings/check-in-by-code forwards arguments and returns response', async () => {
    mockClient.post.mockResolvedValueOnce(response);
    const result = await bookingAPI.checkInByCode("ABC123");
    expect(mockClient.post).toHaveBeenCalledTimes(1);
    expect(mockClient.post).toHaveBeenCalledWith("/Bookings/check-in-by-code", { "confirmationCode": "ABC123" });
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('checkInByCode: propagates rejected HTTP responses', async () => {
    mockClient.post.mockRejectedValueOnce(failure);
    await expect(bookingAPI.checkInByCode("ABC123")).rejects.toBe(failure);
    expect(mockClient.post).toHaveBeenCalledTimes(1);
    expect(mockClient.post).toHaveBeenCalledWith("/Bookings/check-in-by-code", { "confirmationCode": "ABC123" });
  });

  it('getEarnings: GET /Bookings/earnings forwards arguments and returns response', async () => {
    mockClient.get.mockResolvedValueOnce(response);
    const result = await bookingAPI.getEarnings();
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(mockClient.get).toHaveBeenCalledWith("/Bookings/earnings");
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('getEarnings: propagates rejected HTTP responses', async () => {
    mockClient.get.mockRejectedValueOnce(failure);
    await expect(bookingAPI.getEarnings()).rejects.toBe(failure);
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(mockClient.get).toHaveBeenCalledWith("/Bookings/earnings");
  });

  it('delete: DELETE /Bookings/booking-1 forwards arguments and returns response', async () => {
    mockClient.delete.mockResolvedValueOnce(response);
    const result = await bookingAPI.delete("booking-1");
    expect(mockClient.delete).toHaveBeenCalledTimes(1);
    expect(mockClient.delete).toHaveBeenCalledWith("/Bookings/booking-1");
    expect(result).toBe(response);
    expect(Object.values(mockClient).reduce((n, fn) => n + fn.mock.calls.length, 0)).toBe(1);
  });

  it('delete: propagates rejected HTTP responses', async () => {
    mockClient.delete.mockRejectedValueOnce(failure);
    await expect(bookingAPI.delete("booking-1")).rejects.toBe(failure);
    expect(mockClient.delete).toHaveBeenCalledTimes(1);
    expect(mockClient.delete).toHaveBeenCalledWith("/Bookings/booking-1");
  });

});
