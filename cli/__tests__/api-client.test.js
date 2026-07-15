import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createApiClient } from '../lib/api-client.js';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('api-client', () => {
  let client;

  beforeEach(() => {
    vi.clearAllMocks();
    client = createApiClient({
      getToken: async () => 'mock_ghl_jwt',
      locationId: 'LOC_TEST',
    });
  });

  it('sends GET with auth header and required GHL headers', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ workflows: [] }),
    });

    await client.get('/workflows/copyWorkflow/statusList');

    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('backend.leadconnectorhq.com');
    expect(url).toContain('/workflows/copyWorkflow/statusList');
    expect(opts.headers['Authorization']).toBe('Bearer mock_ghl_jwt');
    expect(opts.headers['channel']).toBe('APP');
    expect(opts.headers['source']).toBe('WEB_USER');
    expect(opts.headers['version']).toBe('2021-07-28');
  });

  it('appends locationId as query param', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    });

    await client.get('/workflows/');

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('locationId=LOC_TEST');
  });

  it('sends POST with JSON body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'new_action' }),
    });

    await client.post('/workflows/wf1/actions', { type: 'add_contact_tag' });

    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.method).toBe('POST');
    expect(opts.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(opts.body)).toEqual({ type: 'add_contact_tag' });
  });

  it('throws on non-ok response with status', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      text: async () => 'Forbidden',
    });

    await expect(client.get('/workflows/')).rejects.toThrow('403');
  });
});
