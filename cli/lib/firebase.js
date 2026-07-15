const FIREBASE_TOKEN_URL = 'https://securetoken.googleapis.com/v1/token';

export async function exchangeRefreshToken(refreshToken, apiKey) {
  const url = `${FIREBASE_TOKEN_URL}?key=${apiKey}`;
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || `Firebase token exchange failed (${response.status})`);
  }

  const data = await response.json();
  return {
    id_token: data.id_token,
    refresh_token: data.refresh_token, // may be rotated — always save
  };
}
