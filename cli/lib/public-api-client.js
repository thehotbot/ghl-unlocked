const BASE_URL = 'https://services.leadconnectorhq.com';
const DEFAULT_VERSION = '2021-07-28';
const CONVERSATIONS_VERSION = '2021-04-15';

export function createPublicApiClient({ token, locationId }) {
  async function request(method, path, { body = null, params = {}, version = DEFAULT_VERSION } = {}) {
    const url = new URL(path, BASE_URL);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Version': version,
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

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    return response.text();
  }

  return {
    get: (path, opts) => request('GET', path, opts),
    post: (path, body, opts) => request('POST', path, { body, ...opts }),
    put: (path, body, opts) => request('PUT', path, { body, ...opts }),
    patch: (path, body, opts) => request('PATCH', path, { body, ...opts }),
    delete: (path, opts) => request('DELETE', path, opts),
    locationId,
    CONVERSATIONS_VERSION,
  };
}
