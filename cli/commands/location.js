// Location-scoped queries and management: tags, custom fields, custom values

export async function getLocation(client) {
  return client.get(`/locations/${client.locationId}`);
}

export async function listTags(client) {
  const data = await client.get(`/locations/${client.locationId}/tags`);
  return data.tags || [];
}

export async function createTag(client, name) {
  return client.post(`/locations/${client.locationId}/tags`, { name });
}

export async function deleteTag(client, tagId) {
  return client.delete(`/locations/${client.locationId}/tags/${tagId}`);
}

export async function listCustomFields(client, params = {}) {
  const data = await client.get(`/locations/${client.locationId}/customFields`, { params });
  return data.customFields || [];
}

export async function createCustomField(client, data) {
  return client.post(`/locations/${client.locationId}/customFields`, data);
}

export async function deleteCustomField(client, id) {
  return client.delete(`/locations/${client.locationId}/customFields/${id}`);
}

export async function listCustomValues(client) {
  const data = await client.get(`/locations/${client.locationId}/customValues`);
  return data.customValues || [];
}

export async function createCustomValue(client, data) {
  return client.post(`/locations/${client.locationId}/customValues`, data);
}

export async function listTemplates(client, params = {}) {
  return client.get(`/locations/${client.locationId}/templates`, { params });
}
