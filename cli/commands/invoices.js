export async function listInvoices(client, params = {}) {
  return client.get('/invoices/', { params: { altId: client.locationId, altType: 'location', ...params } });
}

export async function getInvoice(client, id) {
  return client.get(`/invoices/${id}`, { params: { altId: client.locationId, altType: 'location' } });
}

export async function createInvoice(client, data) {
  return client.post('/invoices/', { altId: client.locationId, altType: 'location', ...data });
}

export async function sendInvoice(client, id, data = {}) {
  return client.post(`/invoices/${id}/send`, { altId: client.locationId, altType: 'location', ...data });
}

export async function voidInvoice(client, id) {
  return client.post(`/invoices/${id}/void`, { altId: client.locationId, altType: 'location' });
}

export async function deleteInvoice(client, id) {
  return client.delete(`/invoices/${id}`, { params: { altId: client.locationId, altType: 'location' } });
}

export async function recordPayment(client, invoiceId, data) {
  return client.post(`/invoices/${invoiceId}/record-payment`, { altId: client.locationId, altType: 'location', ...data });
}

export async function generateInvoiceNumber(client) {
  return client.get('/invoices/generate-number', { params: { altId: client.locationId, altType: 'location' } });
}

export async function listInvoiceTemplates(client, params = {}) {
  return client.get('/invoices/template', { params: { altId: client.locationId, altType: 'location', ...params } });
}
