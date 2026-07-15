// Social media posting via GHL Public API v2
// Base endpoint: /social-media-posting/

export async function listSocialPosts(client, data = {}) {
  return client.post(`/social-media-posting/${client.locationId}/posts/list`, data);
}

export async function getSocialPost(client, postId) {
  return client.get(`/social-media-posting/${client.locationId}/posts/${postId}`);
}

export async function createSocialPost(client, data) {
  return client.post(`/social-media-posting/${client.locationId}/posts`, data);
}

export async function deleteSocialPost(client, postId) {
  return client.delete(`/social-media-posting/${client.locationId}/posts/${postId}`);
}

export async function getSocialAccounts(client) {
  return client.get(`/social-media-posting/${client.locationId}/accounts`);
}
