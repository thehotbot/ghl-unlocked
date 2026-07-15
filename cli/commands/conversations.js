export async function searchConversations(client, params = {}) {
  const data = await client.get('/conversations/search', {
    params: { locationId: client.locationId, ...params },
    version: client.CONVERSATIONS_VERSION,
  });
  return data.conversations || [];
}

export async function getConversation(client, id, params = {}) {
  return client.get(`/conversations/${id}`, {
    params,
    version: client.CONVERSATIONS_VERSION,
  });
}

export async function sendMessage(client, data) {
  return client.post('/conversations/messages', {
    locationId: client.locationId,
    type: 'SMS',
    ...data,
  }, { version: client.CONVERSATIONS_VERSION });
}

export async function sendEmail(client, data) {
  return client.post('/conversations/emails', {
    locationId: client.locationId,
    ...data,
  }, { version: client.CONVERSATIONS_VERSION });
}
