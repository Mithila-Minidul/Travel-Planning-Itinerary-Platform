import { describe, it, expect, vi, beforeEach } from 'vitest';
const { client } = vi.hoisted(() => ({ client: { post: vi.fn(), delete: vi.fn() } }));
vi.mock('../../src/api/client', () => ({ default: client }));
import { imageAPI } from '../../src/api/images';
const response = { data: { url: 'https://example.com/photo.jpg' } };
beforeEach(() => { client.post.mockReset(); client.delete.mockReset(); });
describe('Image upload and removal HTTP contracts', () => {
  it('sends multipart FormData with file, folder URL, and header', async () => {
    const file = new File(['image-content'], 'photo.png', { type: 'image/png' });
    client.post.mockResolvedValueOnce(response);
    const result = await imageAPI.upload(file, 'experiences');
    expect(client.post).toHaveBeenCalledTimes(1);
    const [url, body, options] = client.post.mock.calls[0];
    expect(url).toBe('/Image/upload/experiences');
    expect(body).toBeInstanceOf(FormData);
    expect(body.get('file')).toBe(file);
    expect(options).toEqual({ headers: { 'Content-Type': 'multipart/form-data' } });
    expect(result).toBe(response);
  });
  it('propagates upload failure', async () => {
    const error = new Error('Network failure');
    client.post.mockRejectedValueOnce(error);
    await expect(imageAPI.upload(new File(['x'], 'x.png'), 'trips')).rejects.toBe(error);
  });
  it('deletes image with URL query parameter', async () => {
    client.delete.mockResolvedValueOnce(response);
    expect(await imageAPI.remove('https://example.com/photo.jpg')).toBe(response);
    expect(client.delete).toHaveBeenCalledWith('/Image/delete', { params: { url: 'https://example.com/photo.jpg' } });
  });
  it('propagates delete failure', async () => {
    const error = { response: { status: 403 } };
    client.delete.mockRejectedValueOnce(error);
    await expect(imageAPI.remove('https://example.com/photo.jpg')).rejects.toBe(error);
  });
});
