// Location-scoped queries: tags, custom fields, custom values
// Endpoints confirmed via GHL internal API network inspection.

export async function listTags(client, locationId) {
  const data = await client.get(`/locations/${locationId}/tags`);
  return data.tags || [];
}

export async function listCustomFields(client, locationId) {
  const data = await client.get(`/locations/${locationId}/customFields`);
  return data.customFields || [];
}

export async function listCustomValues(client, locationId) {
  const data = await client.get(`/locations/${locationId}/customValues`);
  return data.customValues || [];
}
