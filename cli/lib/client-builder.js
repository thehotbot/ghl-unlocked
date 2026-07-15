import { readConfig, getProfile, updateProfileField, FIREBASE_API_KEY } from './config.js';
import { createApiClient } from './api-client.js';
import { createTokenService } from './token-service.js';
import * as firebase from './firebase.js';

function getConfigPath() {
  return process.env.GHL_UNLOCKED_CONFIG || undefined;
}

async function exchangeForGhlJwt(firebaseIdToken) {
  const response = await fetch('https://backend.leadconnectorhq.com/oauth/2/login/signin/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'channel': 'APP',
      'source': 'WEB_USER',
      'version': '2021-07-28',
    },
    body: JSON.stringify({ token: firebaseIdToken }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GHL JWT exchange failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  const payload = JSON.parse(atob(data.token.split('.')[1]));
  return {
    ghl_jwt: data.token,
    expires_at: payload.exp ? payload.exp * 1000 : Date.now() + 3600_000,
  };
}

export function buildClient(cmd) {
  const configPath = getConfigPath();
  const config = readConfig(configPath);
  const rootOpts = cmd.parent.parent.opts();
  const profileName = rootOpts.profile || 'default';
  const profile = config.profiles[profileName];

  if (!profile) {
    console.error(`Profile "${profileName}" not found. Run: ghl-unlocked auth add`);
    process.exit(1);
  }

  const locationId = rootOpts.location || profile.location_id;

  const tokenService = createTokenService({
    config: {
      readProfile: (name) => getProfile(name, configPath),
      updateField: (name, field, value) => updateProfileField(name, field, value, configPath),
    },
    firebase,
    exchangeForGhlJwt,
    apiKey: FIREBASE_API_KEY,
  });

  const client = createApiClient({
    getToken: () => tokenService.getToken(profileName),
    locationId,
  });

  return { client, locationId };
}
