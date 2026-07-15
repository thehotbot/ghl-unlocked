export async function listFunnels(client) {
  const data = await client.get('/funnels/funnel/list');
  return data.funnels || [];
}

export async function getFunnel(client, funnelId) {
  return client.get(`/funnels/funnel/${funnelId}`);
}

export async function listFunnelPages(client, funnelId) {
  // The response is an object with numeric keys, not an array
  const data = await client.get(`/funnels/page/list?funnelId=${funnelId}`);
  // Convert object to array if needed
  if (Array.isArray(data)) return data;
  return Object.values(data).filter(v => typeof v === 'object' && v !== null && v._id);
}
