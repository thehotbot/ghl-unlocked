// Media library via GHL Public API v2
// Base endpoint: /medias/

export async function listMedia(client, params = {}) {
  return client.get('/medias/files', { params: { locationId: client.locationId, ...params } });
}

export async function deleteMedia(client, id) {
  return client.delete(`/medias/${id}`, { params: { locationId: client.locationId } });
}
