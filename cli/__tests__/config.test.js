import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readConfig, writeConfig, getProfile, addProfile, removeProfile, updateProfileField } from '../lib/config.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

const TEST_DIR = path.join(os.tmpdir(), 'ghl-unlocked-test-' + Date.now());
const TEST_CONFIG = path.join(TEST_DIR, 'config.json');

describe('config', () => {
  beforeEach(() => {
    fs.mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  });

  it('returns default config when file does not exist', () => {
    const config = readConfig(TEST_CONFIG);
    expect(config).toEqual({
      firebase_api_key: 'AIzaSyB_w3vXmsI7WeQtrIOkjR6xTRVN5uOieiE',
      profiles: {},
    });
  });

  it('writes and reads config roundtrip', () => {
    const config = {
      firebase_api_key: 'AIzaSyB_w3vXmsI7WeQtrIOkjR6xTRVN5uOieiE',
      profiles: {},
    };
    writeConfig(config, TEST_CONFIG);
    const result = readConfig(TEST_CONFIG);
    expect(result).toEqual(config);
  });

  it('writes config with restricted permissions (0600)', () => {
    const config = { firebase_api_key: 'AIzaTest', profiles: {} };
    writeConfig(config, TEST_CONFIG);
    const stats = fs.statSync(TEST_CONFIG);
    const mode = stats.mode & 0o777;
    expect(mode).toBe(0o600);
  });

  it('adds a profile with both token types', () => {
    const config = {
      firebase_api_key: 'AIzaSyB_w3vXmsI7WeQtrIOkjR6xTRVN5uOieiE',
      profiles: {},
    };
    writeConfig(config, TEST_CONFIG);

    addProfile('icab', {
      label: 'iCabinetry',
      firebase_refresh_token: 'AMf-vBw...',
      ghl_jwt: 'eyJhbGci...',
      ghl_jwt_expires_at: 1784132600000,
      location_id: 'CHGd7qwUa8ht5t8Gu5tM',
    }, TEST_CONFIG);

    const result = readConfig(TEST_CONFIG);
    expect(result.profiles.icab.ghl_jwt).toBe('eyJhbGci...');
    expect(result.profiles.icab.firebase_refresh_token).toBe('AMf-vBw...');
    expect(result.profiles.icab.location_id).toBe('CHGd7qwUa8ht5t8Gu5tM');
  });

  it('gets a profile by name', () => {
    const config = {
      firebase_api_key: 'AIzaTest',
      profiles: {
        icab: {
          label: 'iCabinetry',
          firebase_refresh_token: 'rt_x',
          ghl_jwt: 'jwt_x',
          ghl_jwt_expires_at: 9999999999999,
          location_id: 'LOC_A',
        },
      },
    };
    writeConfig(config, TEST_CONFIG);
    const profile = getProfile('icab', TEST_CONFIG);
    expect(profile.ghl_jwt).toBe('jwt_x');
  });

  it('returns null for missing profile', () => {
    const config = { firebase_api_key: 'AIzaTest', profiles: {} };
    writeConfig(config, TEST_CONFIG);
    const profile = getProfile('nonexistent', TEST_CONFIG);
    expect(profile).toBeNull();
  });

  it('removes a profile', () => {
    const config = {
      firebase_api_key: 'AIzaTest',
      profiles: {
        todelete: {
          label: 'Delete Me',
          firebase_refresh_token: 'rt_y',
          ghl_jwt: 'jwt_y',
          ghl_jwt_expires_at: 0,
          location_id: 'LOC_B',
        },
      },
    };
    writeConfig(config, TEST_CONFIG);
    removeProfile('todelete', TEST_CONFIG);
    const result = readConfig(TEST_CONFIG);
    expect(result.profiles.todelete).toBeUndefined();
  });

  it('updates a single profile field', () => {
    const config = {
      firebase_api_key: 'AIzaTest',
      profiles: {
        icab: {
          label: 'iCabinetry',
          ghl_jwt: 'old_jwt',
          ghl_jwt_expires_at: 0,
          firebase_refresh_token: 'rt_old',
          location_id: 'LOC_A',
        },
      },
    };
    writeConfig(config, TEST_CONFIG);
    updateProfileField('icab', 'ghl_jwt', 'new_jwt', TEST_CONFIG);
    const result = readConfig(TEST_CONFIG);
    expect(result.profiles.icab.ghl_jwt).toBe('new_jwt');
    expect(result.profiles.icab.label).toBe('iCabinetry'); // other fields unchanged
  });
});
