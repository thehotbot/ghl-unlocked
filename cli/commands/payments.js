export async function listOrders(client, params = {}) {
  return client.get('/payments/orders', { params: { altId: client.locationId, altType: 'location', ...params } });
}

export async function getOrder(client, id) {
  return client.get(`/payments/orders/${id}`);
}

export async function listTransactions(client, params = {}) {
  return client.get('/payments/transactions', { params: { locationId: client.locationId, ...params } });
}

export async function getTransaction(client, id) {
  return client.get(`/payments/transactions/${id}`);
}

export async function listSubscriptions(client, params = {}) {
  return client.get('/payments/subscriptions', { params: { locationId: client.locationId, ...params } });
}

export async function getSubscription(client, id) {
  return client.get(`/payments/subscriptions/${id}`);
}

export async function listCoupons(client, params = {}) {
  return client.get('/payments/coupon/list', { params: { locationId: client.locationId, ...params } });
}

export async function createCoupon(client, data) {
  return client.post('/payments/coupon', { locationId: client.locationId, ...data });
}
