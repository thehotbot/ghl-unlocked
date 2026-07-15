const REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5 minutes

export function createTokenService({ config, firebase, exchangeForGhlJwt, apiKey }) {
  function isJwtValid(profile) {
    if (!profile.ghl_jwt || !profile.ghl_jwt_expires_at) return false;
    return profile.ghl_jwt_expires_at - Date.now() > REFRESH_BUFFER_MS;
  }

  async function getToken(profileName) {
    const profile = config.readProfile(profileName);
    if (!profile) {
      throw new Error(`Profile "${profileName}" not found. Run: ghl-unlocked auth add`);
    }

    // Tier 1: use cached GHL JWT if valid
    if (isJwtValid(profile)) {
      return profile.ghl_jwt;
    }

    // Tier 2: refresh via Firebase
    if (!profile.firebase_refresh_token) {
      throw new Error(
        'GHL JWT expired and no Firebase refresh token available. ' +
        'Run: ghl-unlocked auth refresh — open GHL and re-copy tokens'
      );
    }

    const firebaseResult = await firebase.exchangeRefreshToken(
      profile.firebase_refresh_token,
      apiKey
    );

    // Save potentially rotated refresh token
    config.updateField(profileName, 'firebase_refresh_token', firebaseResult.refresh_token);

    // Exchange Firebase ID token for GHL JWT
    const ghlResult = await exchangeForGhlJwt(firebaseResult.id_token, profile.location_id);

    // Persist new GHL JWT
    config.updateField(profileName, 'ghl_jwt', ghlResult.ghl_jwt);
    config.updateField(profileName, 'ghl_jwt_expires_at', ghlResult.expires_at);

    return ghlResult.ghl_jwt;
  }

  return { getToken };
}
