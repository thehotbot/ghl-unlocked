import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchOpportunities, getOpportunity, createOpportunity, getPipelines } from '../commands/opportunities.js';

describe('opportunities', () => {
  let mockClient;

  beforeEach(() => {
    mockClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      patch: vi.fn(),
      locationId: 'LOC_ABC',
    };
  });

  it('searchOpportunities calls GET /opportunities/', async () => {
    mockClient.get.mockResolvedValueOnce({ opportunities: [{ id: 'o1', name: 'Deal' }] });
    const result = await searchOpportunities(mockClient);
    expect(mockClient.get).toHaveBeenCalledWith('/opportunities/', { params: { locationId: 'LOC_ABC' } });
    expect(result).toHaveLength(1);
  });

  it('getOpportunity calls GET /opportunities/{id}', async () => {
    mockClient.get.mockResolvedValueOnce({ id: 'o1' });
    await getOpportunity(mockClient, 'o1');
    expect(mockClient.get).toHaveBeenCalledWith('/opportunities/o1');
  });

  it('createOpportunity posts with locationId', async () => {
    mockClient.post.mockResolvedValueOnce({ opportunity: { id: 'o1' } });
    await createOpportunity(mockClient, { name: 'Deal', pipelineId: 'p1', contactId: 'c1' });
    expect(mockClient.post).toHaveBeenCalledWith('/opportunities/', {
      locationId: 'LOC_ABC', name: 'Deal', pipelineId: 'p1', contactId: 'c1',
    });
  });

  it('getPipelines calls GET /opportunities/pipelines', async () => {
    mockClient.get.mockResolvedValueOnce({ pipelines: [{ id: 'p1', name: 'Sales' }] });
    const result = await getPipelines(mockClient);
    expect(mockClient.get).toHaveBeenCalledWith('/opportunities/pipelines', { params: { locationId: 'LOC_ABC' } });
    expect(result).toHaveLength(1);
  });
});
