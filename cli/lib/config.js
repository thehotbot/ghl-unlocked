import fs from 'fs';
import path from 'path';
import os from 'os';

const DEFAULT_CONFIG_DIR = path.join(os.homedir(), '.ghl-unlocked');
const DEFAULT_CONFIG_PATH = path.join(DEFAULT_CONFIG_DIR, 'config.json');

// Firebase API key is public (same for all GHL users) — hardcoded per spec
const FIREBASE_API_KEY = 'AIzaSyB_w3vXmsI7WeQtrIOkjR6xTRVN5uOieiE';

const DEFAULT_CONFIG = {
  firebase_api_key: FIREBASE_API_KEY,
  profiles: {},
};

export function readConfig(configPath = DEFAULT_CONFIG_PATH) {
  try {
    const raw = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function writeConfig(config, configPath = DEFAULT_CONFIG_PATH) {
  const dir = path.dirname(configPath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', { mode: 0o600 });
}

export function getProfile(name, configPath = DEFAULT_CONFIG_PATH) {
  const config = readConfig(configPath);
  return config.profiles[name] || null;
}

export function addProfile(name, profile, configPath = DEFAULT_CONFIG_PATH) {
  const config = readConfig(configPath);
  config.profiles[name] = profile;
  writeConfig(config, configPath);
}

export function removeProfile(name, configPath = DEFAULT_CONFIG_PATH) {
  const config = readConfig(configPath);
  delete config.profiles[name];
  writeConfig(config, configPath);
}

export function updateProfileField(name, field, value, configPath = DEFAULT_CONFIG_PATH) {
  const config = readConfig(configPath);
  if (config.profiles[name]) {
    config.profiles[name][field] = value;
    writeConfig(config, configPath);
  }
}

export { DEFAULT_CONFIG_PATH, DEFAULT_CONFIG_DIR, FIREBASE_API_KEY };
