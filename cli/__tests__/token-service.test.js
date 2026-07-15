import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTokenService } from '../lib/token-service.js';

describe('token-service', () => {
  let mockConfig;
  let mockFirebase;
  let mockGhlExchange;
  let service;

  beforeEach(() => {
    mockConfig = {
      readProfile: vi.fn(),
      updateField: vi.fn(),
    };
    mockFirebase = {
      exchangeRefreshToken: vi.fn(),
    };
    mockGhlExchange = vi.fn();

    service = createTokenService({
      config: mockConfig,
      firebase: mockFirebase,
      exchangeForGhlJwt: mockGhlExchange,
      apiKey: 'AIzaTest',
    });
  });

  it('returns cached GHL JWT when still valid', async () => {
    mockConfig.readProfile.mockReturnValue({
      ghl_jwt: 'valid_jwt',
      ghl_jwt_expires_at: Date.now() + 600_000,
      firebase_refresh_token: 'rt_123',
      location_id: 'LOC_A',
    });

    const token = await service.getToken('icab');

    expect(token).toBe('valid_jwt');
    expect(mockFirebase.exchangeRefreshToken).not.toHaveBeenCalled();
    expect(mockGhlExchange).not.toHaveBeenCalled();
  });

  it('refreshes via Firebase when GHL JWT is expired', async () => {
    mockConfig.readProfile.mockReturnValue({
      ghl_jwt: 'expired_jwt',
      ghl_jwt_expires_at: Date.now() - 1000,
      firebase_refresh_token: 'rt_123',
      location_id: 'LOC_A',
    });

    mockFirebase.exchangeRefreshToken.mockResolvedValue({
      id_token: 'firebase_id_tok',
      refresh_token: 'rt_456',
    });

    mockGhlExchange.mockResolvedValue({
      ghl_jwt: 'fresh_ghl_jwt',
      expires_at: Date.now() + 3600_000,
    });

    const token = await service.getToken('icab');

    expect(token).toBe('fresh_ghl_jwt');
    expect(mockFirebase.exchangeRefreshToken).toHaveBeenCalledWith('rt_123', 'AIzaTest');
    expect(mockGhlExchange).toHaveBeenCalledWith('firebase_id_tok', 'LOC_A');
    expect(mockConfig.updateField).toHaveBeenCalledWith('icab', 'ghl_jwt', 'fresh_ghl_jwt');
    expect(mockConfig.updateField).toHaveBeenCalledWith('icab', 'firebase_refresh_token', 'rt_456');
  });

  it('refreshes when JWT expires within 5-minute buffer', async () => {
    mockConfig.readProfile.mockReturnValue({
      ghl_jwt: 'almost_expired_jwt',
      ghl_jwt_expires_at: Date.now() + 200_000, // 3.3min — within 5min buffer
      firebase_refresh_token: 'rt_123',
      location_id: 'LOC_A',
    });

    mockFirebase.exchangeRefreshToken.mockResolvedValue({
      id_token: 'firebase_id_tok',
      refresh_token: 'rt_123',
    });

    mockGhlExchange.mockResolvedValue({
      ghl_jwt: 'refreshed_jwt',
      expires_at: Date.now() + 3600_000,
    });

    const token = await service.getToken('icab');
    expect(token).toBe('refreshed_jwt');
    expect(mockFirebase.exchangeRefreshToken).toHaveBeenCalled();
  });

  it('throws when no refresh token available', async () => {
    mockConfig.readProfile.mockReturnValue({
      ghl_jwt: 'expired_jwt',
      ghl_jwt_expires_at: Date.now() - 1000,
      firebase_refresh_token: null,
      location_id: 'LOC_A',
    });

    await expect(service.getToken('icab')).rejects.toThrow('auth refresh');
  });

  it('throws when profile not found', async () => {
    mockConfig.readProfile.mockReturnValue(null);

    await expect(service.getToken('missing')).rejects.toThrow('not found');
  });
});
