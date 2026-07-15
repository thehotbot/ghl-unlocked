// Blog CRUD via GHL Public API v2
// Base endpoint: /blogs/

export async function getBlogSites(client, params = {}) {
  return client.get('/blogs/site/all', { params: { locationId: client.locationId, ...params } });
}

export async function getBlogPosts(client, blogId, params = {}) {
  return client.get('/blogs/posts/all', { params: { locationId: client.locationId, blogId, ...params } });
}

export async function getBlogPost(client, postId) {
  return client.get(`/blogs/posts/${postId}`, { params: { locationId: client.locationId } });
}

export async function createBlogPost(client, data) {
  return client.post('/blogs/posts', { locationId: client.locationId, ...data });
}

export async function updateBlogPost(client, postId, data) {
  return client.put(`/blogs/posts/${postId}`, { locationId: client.locationId, ...data });
}

export async function deleteBlogPost(client, postId) {
  return client.delete(`/blogs/posts/${postId}`, { params: { locationId: client.locationId } });
}

export async function getBlogAuthors(client, params = {}) {
  return client.get('/blogs/authors', { params: { locationId: client.locationId, ...params } });
}

export async function getBlogCategories(client, params = {}) {
  return client.get('/blogs/categories', { params: { locationId: client.locationId, ...params } });
}
