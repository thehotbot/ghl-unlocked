const BASE_URL = 'https://backend.leadconnectorhq.com';

// Required headers for all GHL internal API calls (confirmed via network inspection)
const GHL_HEADERS = {
  'channel': 'APP',
  'source': 'WEB_USER',
  'version': '2021-07-28',
};

export function createApiClient({ getToken, locationId }) {
  async function request(method, path, body = null) {
    const token = await getToken();

    const url = new URL(path, BASE_URL);
    if (locationId && !url.searchParams.has('locationId') && !url.searchParams.has('location_id')) {
      url.searchParams.set('locationId', locationId);
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      ...GHL_HEADERS,
    };

    const opts = { method, headers };

    if (body) {
      headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }

    const response = await fetch(url.toString(), opts);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API error ${response.status}: ${text}`);
    }

    return response.json();
  }

  return {
    get: (path) => request('GET', path),
    post: (path, body) => request('POST', path, body),
    put: (path, body) => request('PUT', path, body),
    patch: (path, body) => request('PATCH', path, body),
    delete: (path) => request('DELETE', path),
  };
}
