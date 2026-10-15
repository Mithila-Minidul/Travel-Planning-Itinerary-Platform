import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
const { handlers, axiosCreate, toastError } = vi.hoisted(() => ({
  handlers: { request: [], response: [] },
  axiosCreate: vi.fn(), toastError: vi.fn(),
}));
vi.mock('axios', () => ({ default: { create: axiosCreate } }));
vi.mock('react-hot-toast', () => ({ default: { error: toastError } }));
axiosCreate.mockImplementation((options) => ({
  defaults: options,
  interceptors: {
    request: { use: (ok, fail) => handlers.request.push({ ok, fail }) },
    response: { use: (ok, fail) => handlers.response.push({ ok, fail }) },
  },
}));
let client;
beforeAll(async () => {
  ({ default: client } = await import('../../src/api/client'));
});
beforeEach(() => { localStorage.clear(); toastError.mockReset(); });
describe('Shared Axios client configuration and interceptors', () => {
  it('sets JSON content type and API base URL', () => {
    expect(client.defaults.headers['Content-Type']).toBe('application/json');
    expect(client.defaults.baseURL).toBe(import.meta.env.VITE_API_URL || 'http://localhost:7000/api');
    expect(handlers.request).toHaveLength(1);
    expect(handlers.response).toHaveLength(1);
  });
  it('adds bearer token from localStorage when present', () => {
    localStorage.setItem('token', 'test-jwt');
    const config = { headers: {} };
    expect(handlers.request[0].ok(config)).toBe(config);
    expect(config.headers.Authorization).toBe('Bearer test-jwt');
  });
  it('does not add Authorization when no token is stored', () => {
    const config = { headers: {} };
    handlers.request[0].ok(config);
    expect(config.headers).not.toHaveProperty('Authorization');
  });
  it('passes successful HTTP responses through unchanged', () => {
    const response = { status: 204, data: null };
    expect(handlers.response[0].ok(response)).toBe(response);
  });
  it('preserves login 401 error without clearing session or toast', async () => {
    localStorage.setItem('token', 'existing');
    const error = { config: { url: '/Auth/login' }, response: { status: 401 } };
    await expect(handlers.response[0].fail(error)).rejects.toBe(error);
    expect(localStorage.getItem('token')).toBe('existing');
    expect(toastError).not.toHaveBeenCalled();
  });
  it('propagates non-401 errors without clearing the token', async () => {
    localStorage.setItem('token', 'existing');
    const error = { config: { url: '/Trips' }, response: { status: 403 } };
    await expect(handlers.response[0].fail(error)).rejects.toBe(error);
    expect(localStorage.getItem('token')).toBe('existing');
    expect(toastError).not.toHaveBeenCalled();
  });
  it('handles network errors without an HTTP response', async () => {
    const error = new Error('Network disconnected');
    await expect(handlers.response[0].fail(error)).rejects.toBe(error);
    expect(toastError).not.toHaveBeenCalled();
  });
});
