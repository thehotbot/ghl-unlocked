import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listFunnels, getFunnel, listFunnelPages } from '../commands/funnels.js';

describe('funnels', () => {
  let mockClient;

  beforeEach(() => {
    mockClient = { get: vi.fn() };
  });

  it('listFunnels calls GET /funnels/funnel/list', async () => {
    mockClient.get.mockResolvedValueOnce({ funnels: [{ _id: 'f1', name: 'Sales Funnel' }], count: 1 });
    const result = await listFunnels(mockClient);
    expect(mockClient.get).toHaveBeenCalledWith('/funnels/funnel/list');
    expect(result).toHaveLength(1);
  });

  it('getFunnel calls GET /funnels/funnel/{id}', async () => {
    mockClient.get.mockResolvedValueOnce({ _id: 'f1', _data: { name: 'Sales' } });
    const result = await getFunnel(mockClient, 'f1');
    expect(mockClient.get).toHaveBeenCalledWith('/funnels/funnel/f1');
    expect(result._id).toBe('f1');
  });
});
