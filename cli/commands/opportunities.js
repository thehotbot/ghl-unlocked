// Opportunities & Pipelines via GHL Public API v2
// Base endpoint: /opportunities/

export async function searchOpportunities(client, params = {}) {
  const data = await client.get('/opportunities/', { params: { locationId: client.locationId, ...params } });
  return data.opportunities || [];
}

export async function getOpportunity(client, id) {
  return client.get(`/opportunities/${id}`);
}

export async function createOpportunity(client, data) {
  return client.post('/opportunities/', { locationId: client.locationId, ...data });
}

export async function updateOpportunity(client, id, data) {
  return client.put(`/opportunities/${id}`, data);
}

export async function deleteOpportunity(client, id) {
  return client.delete(`/opportunities/${id}`);
}

export async function updateOpportunityStatus(client, id, status) {
  return client.patch(`/opportunities/${id}/status`, { status });
}

export async function getPipelines(client) {
  const data = await client.get('/opportunities/pipelines', { params: { locationId: client.locationId } });
  return data.pipelines || [];
}
