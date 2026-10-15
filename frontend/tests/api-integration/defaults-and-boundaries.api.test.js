import { describe, it, expect, vi, beforeEach } from 'vitest';
const { client } = vi.hoisted(() => ({ client: { get: vi.fn(), post: vi.fn(), patch: vi.fn() } }));
vi.mock('../../src/api/client', () => ({ default: client }));
import { adminUserAPI } from '../../src/api/adminUsers';
import { paymentAPI } from '../../src/api/payments';
import { agentWorkflowAPI } from '../../src/api/agentWorkflows';
import { experienceAPI } from '../../src/api/experiences';
import { guideAPI } from '../../src/api/guides';
const response = { data: [] };
beforeEach(() => { for (const fn of Object.values(client)) { fn.mockReset(); fn.mockResolvedValue(response); } });
describe('Optional parameter and default contracts', () => {
  it('recent activity defaults to 5 items', async () => {
    await adminUserAPI.getRecentActivity();
    expect(client.get).toHaveBeenCalledWith('/AdminUsers/recent-activity?limit=5');
  });
  it('payment processing defaults to Mock', async () => {
    await paymentAPI.process('booking-1');
    expect(client.post).toHaveBeenCalledWith('/Payments/process/booking-1', { method: 'Mock' });
  });
  it('workflow list filters by trip when provided', async () => {
    await agentWorkflowAPI.getAll('trip-1');
    expect(client.get).toHaveBeenCalledWith('/AgentWorkflows', { params: { tripId: 'trip-1' } });
  });
  it('experience listing forwards undefined params as configured', async () => {
    await experienceAPI.getAll();
    expect(client.get).toHaveBeenCalledWith('/Experiences', { params: undefined });
  });
  it('experience detail forwards undefined date as configured', async () => {
    await experienceAPI.getById('exp-1');
    expect(client.get).toHaveBeenCalledWith('/Experiences/exp-1', { params: { date: undefined } });
  });
  it('guide list forwards undefined status as configured', async () => {
    await guideAPI.getAll();
    expect(client.get).toHaveBeenCalledWith('/LocalGuides', { params: { status: undefined } });
  });
  it('search payload preserves arrays and nested data', async () => {
    const payload = { location: 'Kandy', guests: 3, filters: { categories: ['Culture'] } };
    await experienceAPI.searchForAgent(payload);
    expect(client.post).toHaveBeenCalledWith('/Experiences/search-agent-tool', payload);
  });
});
