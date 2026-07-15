import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const TEST_DIR = path.join(os.tmpdir(), 'ghl-unlocked-auth-test-' + Date.now());
const TEST_CONFIG = path.join(TEST_DIR, 'config.json');
const CLI = path.resolve('cli/index.js');

function run(args) {
  return execSync(
    `node ${CLI} ${args}`,
    {
      env: { ...process.env, GHL_UNLOCKED_CONFIG: TEST_CONFIG },
      encoding: 'utf-8',
      timeout: 10_000,
    }
  ).trim();
}

describe('auth commands', () => {
  beforeEach(() => {
    fs.mkdirSync(TEST_DIR, { recursive: true });
    fs.writeFileSync(TEST_CONFIG, JSON.stringify({
      firebase_api_key: 'AIzaSyB_w3vXmsI7WeQtrIOkjR6xTRVN5uOieiE',
      profiles: {},
    }), { mode: 0o600 });
  });

  afterEach(() => {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  });

  it('auth add creates a profile from JSON input', () => {
    const tokenJson = JSON.stringify({
      ghl_jwt: 'eyJtest',
      firebase_refresh_token: 'AMf-test',
      location_id: 'LOC_123',
    });
    run(`--profile testclient auth add --tokens '${tokenJson}' --label "Test Client"`);
    const config = JSON.parse(fs.readFileSync(TEST_CONFIG, 'utf-8'));
    expect(config.profiles.testclient.ghl_jwt).toBe('eyJtest');
    expect(config.profiles.testclient.firebase_refresh_token).toBe('AMf-test');
    expect(config.profiles.testclient.location_id).toBe('LOC_123');
    expect(config.profiles.testclient.label).toBe('Test Client');
  });

  it('auth list shows profiles', () => {
    const config = JSON.parse(fs.readFileSync(TEST_CONFIG, 'utf-8'));
    config.profiles.icab = {
      label: 'iCabinetry',
      ghl_jwt: 'jwt_x',
      ghl_jwt_expires_at: Date.now() + 3600_000,
      firebase_refresh_token: 'rt_x',
      location_id: 'LOC_A',
    };
    fs.writeFileSync(TEST_CONFIG, JSON.stringify(config), { mode: 0o600 });

    const output = run('auth list');
    expect(output).toContain('icab');
    expect(output).toContain('iCabinetry');
  });

  it('auth remove deletes a profile', () => {
    const config = JSON.parse(fs.readFileSync(TEST_CONFIG, 'utf-8'));
    config.profiles.todelete = {
      label: 'Delete Me',
      ghl_jwt: 'jwt_y',
      ghl_jwt_expires_at: 0,
      firebase_refresh_token: 'rt_y',
      location_id: 'LOC_B',
    };
    fs.writeFileSync(TEST_CONFIG, JSON.stringify(config), { mode: 0o600 });

    run('--profile todelete auth remove');
    const updated = JSON.parse(fs.readFileSync(TEST_CONFIG, 'utf-8'));
    expect(updated.profiles.todelete).toBeUndefined();
  });
});
