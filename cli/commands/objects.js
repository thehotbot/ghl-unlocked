// Custom Objects via GHL Public API v2
// Base endpoint: /objects/

export async function listObjectSchemas(client) {
  return client.get('/objects/', { params: { locationId: client.locationId } });
}

export async function getObjectSchema(client, key) {
  return client.get(`/objects/${key}`, { params: { locationId: client.locationId } });
}

export async function listObjectRecords(client, schemaKey, params = {}) {
  return client.post(`/objects/${schemaKey}/records/search`, { locationId: client.locationId, ...params });
}

export async function getObjectRecord(client, schemaKey, id) {
  return client.get(`/objects/${schemaKey}/records/${id}`);
}

export async function createObjectRecord(client, schemaKey, data) {
  return client.post(`/objects/${schemaKey}/records`, { locationId: client.locationId, ...data });
}

export async function updateObjectRecord(client, schemaKey, id, data) {
  return client.put(`/objects/${schemaKey}/records/${id}`, data);
}

export async function deleteObjectRecord(client, schemaKey, id) {
  return client.delete(`/objects/${schemaKey}/records/${id}`);
}
