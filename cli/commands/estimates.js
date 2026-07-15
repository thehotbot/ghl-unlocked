export async function listEstimates(client, params = {}) {
  return client.get('/estimates/', { params: { altId: client.locationId, altType: 'location', ...params } });
}

export async function createEstimate(client, data) {
  return client.post('/estimates/', { altId: client.locationId, altType: 'location', ...data });
}

export async function sendEstimate(client, id, data = {}) {
  return client.post(`/estimates/${id}/send`, { altId: client.locationId, ...data });
}
