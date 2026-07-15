import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exchangeRefreshToken } from '../lib/firebase.js';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('firebase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exchanges refresh token for Firebase ID token', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id_token: 'firebase_id_tok',
        refresh_token: 'new_refresh_tok',
        expires_in: '3600',
      }),
    });

    const result = await exchangeRefreshToken('old_refresh_tok', 'AIzaTestKey');

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('securetoken.googleapis.com');
    expect(url).toContain('key=AIzaTestKey');
    expect(opts.method).toBe('POST');
    expect(result.id_token).toBe('firebase_id_tok');
    expect(result.refresh_token).toBe('new_refresh_tok');
  });

  it('throws on invalid refresh token', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: { message: 'INVALID_REFRESH_TOKEN' } }),
    });

    await expect(exchangeRefreshToken('bad_rt', 'AIzaTestKey'))
      .rejects.toThrow('INVALID_REFRESH_TOKEN');
  });
});
