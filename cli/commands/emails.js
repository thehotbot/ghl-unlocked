// Emails via GHL Public API v2
// Base endpoints: /emails/schedule, /emails/builder

export async function listEmailCampaigns(client, params = {}) {
  return client.get('/emails/schedule', { params: { locationId: client.locationId, ...params } });
}

export async function listEmailTemplates(client, params = {}) {
  return client.get('/emails/builder', { params: { locationId: client.locationId, ...params } });
}
