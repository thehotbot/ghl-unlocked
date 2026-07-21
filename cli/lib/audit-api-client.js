const BASE_URL = 'https://services.leadconnectorhq.com';

// The audit endpoint lives on the public host but does NOT accept a PIT or the
// exchanged GHL session JWT. It requires the raw Firebase ID token in a
// `token-id` header (confirmed via network inspection + live testing).
const GHL_HEADERS = {
  'channel': 'APP',
  'source': 'WEB_USER',
  'version': '2021-07-28',
};

export function createAuditApiClient({ getIdToken, locationId }) {
  async function request(method, path) {
    const idToken = await getIdToken();

    const url = new URL(path, BASE_URL);
    if (locationId && !url.searchParams.has('locationId')) {
      url.searchParams.set('locationId', locationId);
    }

    const headers = {
      'token-id': idToken,
      'Accept': 'application/json',
      ...GHL_HEADERS,
    };

    const response = await fetch(url.toString(), { method, headers });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API error ${response.status}: ${text}`);
    }

    return response.json();
  }

  return {
    get: (path) => request('GET', path),
  };
}
