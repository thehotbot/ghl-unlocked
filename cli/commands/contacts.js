// Contact CRUD via GHL Public API v2
// Base endpoint: /contacts/

export async function searchContacts(client, params = {}) {
  const data = await client.get('/contacts/', { params: { locationId: client.locationId, ...params } });
  return data.contacts || [];
}

export async function getContact(client, id) {
  return client.get(`/contacts/${id}`);
}

export async function createContact(client, data) {
  return client.post('/contacts/', { locationId: client.locationId, ...data });
}

export async function updateContact(client, id, data) {
  return client.put(`/contacts/${id}`, data);
}

export async function deleteContact(client, id) {
  return client.delete(`/contacts/${id}`);
}

export async function upsertContact(client, data) {
  return client.post('/contacts/upsert', { locationId: client.locationId, ...data });
}

export async function addContactTags(client, id, tags) {
  return client.post(`/contacts/${id}/tags`, { tags });
}

export async function removeContactTags(client, id, tags) {
  return client.delete(`/contacts/${id}/tags`, { body: { tags } });
}

export async function getContactNotes(client, id) {
  return client.get(`/contacts/${id}/notes`);
}

export async function createContactNote(client, id, body) {
  return client.post(`/contacts/${id}/notes`, { body });
}

export async function getContactTasks(client, id) {
  return client.get(`/contacts/${id}/tasks`);
}

export async function createContactTask(client, id, data) {
  return client.post(`/contacts/${id}/tasks`, data);
}
