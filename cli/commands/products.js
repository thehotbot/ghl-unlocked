export async function listProducts(client, params = {}) {
  return client.get('/products/', { params: { locationId: client.locationId, ...params } });
}

export async function getProduct(client, id) {
  return client.get(`/products/${id}`, { params: { locationId: client.locationId } });
}

export async function createProduct(client, data) {
  return client.post('/products/', { locationId: client.locationId, ...data });
}

export async function updateProduct(client, id, data) {
  return client.put(`/products/${id}`, data);
}

export async function deleteProduct(client, id) {
  return client.delete(`/products/${id}`, { params: { locationId: client.locationId } });
}

export async function listPrices(client, productId, params = {}) {
  return client.get(`/products/${productId}/price`, { params: { locationId: client.locationId, ...params } });
}

export async function createPrice(client, productId, data) {
  return client.post(`/products/${productId}/price`, { locationId: client.locationId, ...data });
}

export async function listCollections(client, params = {}) {
  return client.get('/products/collections', { params: { altId: client.locationId, altType: 'location', ...params } });
}

export async function createCollection(client, data) {
  return client.post('/products/collections', { altId: client.locationId, altType: 'location', ...data });
}

export async function listInventory(client, params = {}) {
  return client.get('/products/inventory', { params: { altId: client.locationId, altType: 'location', ...params } });
}
