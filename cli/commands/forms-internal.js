export async function listForms(client) {
  const data = await client.get('/forms/');
  return data.forms || [];
}

export async function getForm(client, formId) {
  const data = await client.get(`/forms/${formId}`);
  return data.form || data;
}
